import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-please-change");
export const COOKIE = "sid";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export async function signSession(userId: number): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function getUserId(): Promise<number | null> {
  const tok = cookies().get(COOKIE)?.value;
  if (!tok) return null;
  try {
    const { payload } = await jwtVerify(tok, secret);
    const uid = Number(payload.uid);
    return Number.isInteger(uid) ? uid : null;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/app", maxAge: MAX_AGE },
  };
}
export function clearedCookie() {
  return {
    name: COOKIE,
    value: "",
    options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/app", maxAge: 0 },
  };
}
