"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { fetchUserRole } from "@/lib/firebase/users";

type Status = "loading" | "signed-out" | "not-admin" | "admin";

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>(auth ? "loading" : "signed-out");

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setStatus("signed-out");
        return;
      }
      try {
        const role = await fetchUserRole(firebaseUser.uid);
        setStatus(role === "admin" ? "admin" : "not-admin");
      } catch {
        setStatus("not-admin");
      }
    });
    return unsubscribe;
  }, []);

  return { user, status };
}
