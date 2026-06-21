import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'x9f783hj2k1l0m9n8b7v6c5x4z3a2s1d0f9g8h7j6k5l4';
const key = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  role: string;
  email: string;
}

export async function encrypt(payload: SessionPayload, durationStr: string = '1h') {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(durationStr)
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}
