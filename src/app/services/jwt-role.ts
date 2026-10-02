import { UserRole } from './clinical-data';

export const ACCESS_TOKEN_KEY = 'fcv_access_token';

/** Traduce el claim `role` del backend al rol de UI. */
export function roleFromClaim(claim: unknown): UserRole | null {
  switch (claim) {
    case 'USER': return 'paciente';
    case 'PROFESSIONAL': return 'medico';
    case 'ADMIN': return 'admin';
    default: return null;
  }
}

/** Lee el rol del access token sin validar la firma: solo sirve para decidir la vista. */
export function roleFromAccessToken(token: string | null): UserRole | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return roleFromClaim(JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).role);
  } catch {
    return null;
  }
}

export function storedAccessToken(): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

export function storedRole(): UserRole | null {
  return roleFromAccessToken(storedAccessToken());
}

export function portalFor(role: UserRole): string {
  switch (role) {
    case 'medico': return '/portal/medico';
    case 'admin': return '/portal/admin';
    case 'paciente': return '/portal/paciente';
    default: return '/login';
  }
}
