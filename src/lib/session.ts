import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const COOKIE_NAME = "session";

export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
}

export async function deleteSession() {
     (await cookies()).delete("session");
}

type SessionPayload = {
  userId: number;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch  {
    console.log("Failed to verify session");
  }
}

export async function getSession(): Promise<{ userId: number } | null > {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  try {
    const {payload} = await jwtVerify(token, encodedKey, {algorithms: ["HS256"]});
    return { userId: payload.userId as number}

  } catch {
    return null
  }

}