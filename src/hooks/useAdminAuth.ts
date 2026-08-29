"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { fetchUserRole } from "@/lib/firebase/users";

type Status = "loading" | "signed-out" | "not-admin" | "admin" | "error";

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>(auth ? "loading" : "signed-out");
  const [nonce, setNonce] = useState(0);

  /** Re-run the role check — used by the "try again" button when a network
   *  blip (not a real permission problem) left us in the error state. */
  const retry = useCallback(() => {
    setStatus("loading");
    setNonce((n) => n + 1);
  }, []);

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
        // A successful read that simply isn't an admin role.
        setStatus(role === "admin" ? "admin" : "not-admin");
      } catch {
        // Couldn't verify (offline, transient Firestore error) — don't
        // lock a genuine admin out; let them retry.
        setStatus("error");
      }
    });
    return unsubscribe;
  }, [nonce]);

  return { user, status, retry };
}
