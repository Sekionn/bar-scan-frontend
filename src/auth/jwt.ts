import type { AuthSession, Role } from '../types';

type JwtPayload = {
  sub?: string;
  userId?: string;
  companyId?: string;
  role?: Role;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

export function createSessionFromToken(token: string): AuthSession {
  const [, payload] = token.split('.');

  if (!payload) {
    throw new Error('Login returned an invalid token.');
  }

  const claims = JSON.parse(decodeBase64Url(payload)) as JwtPayload;

  if (!claims.sub || !claims.userId || !claims.companyId || !claims.role) {
    throw new Error('Login token is missing required user claims.');
  }

  return {
    token,
    username: claims.sub,
    userId: claims.userId,
    companyId: claims.companyId,
    role: claims.role,
  };
}
