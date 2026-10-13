import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

export type AuthResult =
  | { ok: true; userId: string; userEmail?: string; walletAddress?: string; }
  | { ok: false; error: string; status: number; };

export async function verifyAuth(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      error: 'Please log in to continue',
      status: 401,
    };
  }

  const token = authHeader.substring(7);

  try {
    const claims = await privy.verifyAuthToken(token);
    
    return {
      ok: true,
      userId: claims.userId,
    };
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return {
      ok: false,
      error: 'Please log in to continue',
      status: 401,
    };
  }
}
