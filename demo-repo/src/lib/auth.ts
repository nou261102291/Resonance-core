// src/lib/auth.ts
// DELIBERATE BUG: Missing optional chaining after NextAuth v4.22.1 upgrade
// This simulates a Tier 3 (Autopilot) fix - simple, low-risk, high-confidence

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  // BUG: NextAuth v4.22.1 changed session.user to be potentially undefined
  // This will throw: TypeError: Cannot read properties of undefined (reading 'id')
  const userId = session.user.id;
  
  return userId;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  // BUG: Same issue - session.user can be undefined
  const email = session.user.email;
  
  return email;
}

export async function getCurrentUserName(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  // BUG: Same issue
  const name = session.user.name;
  
  return name;
}