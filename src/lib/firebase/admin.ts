import "server-only";
import { readFileSync } from "node:fs";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — server-side only, for privileged reads/writes that
 * must not go through client security rules (e.g. the order-tracking lookup
 * and stock decrement).
 *
 * Credentials are looked for in this order:
 *  1. FIREBASE_SERVICE_ACCOUNT       — the service-account JSON as a string
 *  2. FIREBASE_SERVICE_ACCOUNT_PATH  — path to that JSON file (same var the
 *                                      seed script uses; handy in local dev)
 *  3. GOOGLE_APPLICATION_CREDENTIALS — default application credentials
 */
function readServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    try {
      return JSON.parse(readFileSync(path, "utf-8"));
    } catch {
      return null;
    }
  }
  return null;
}

let app: App | null = null;
let db: Firestore | null = null;

try {
  const svc = readServiceAccount();
  if (getApps().length) {
    app = getApps()[0]!;
  } else if (svc) {
    app = initializeApp({
      credential: cert(svc as Parameters<typeof cert>[0]),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp();
  }
  if (app) db = getFirestore(app);
} catch {
  app = null;
  db = null;
}

export const adminDb = db;
export const isAdminConfigured = db !== null;
