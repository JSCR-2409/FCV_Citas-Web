/**
 * Rol de interfaz. Vive aqui, y no en clinical-data, para que el decodificado del token no
 * dependa del estado de sesion: de lo contrario los dos modulos se importarian en circulo.
 */
export type UserRole = 'paciente' | 'medico' | 'admin' | 'guest';

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

function payloadOf(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/** Lee el rol de presentacion del access token. No valida la firma: solo decide la vista. */
export function roleFromAccessToken(token: string | null): UserRole | null {
  return roleFromClaim(payloadOf(token)?.['role']);
}

/**
 * Todos los roles del access token. El claim `roles` es el vigente; `role` es el respaldo para
 * tokens emitidos antes de que existiera, que siguen siendo validos hasta que expiran.
 */
export function rolesFromAccessToken(token: string | null): UserRole[] {
  const payload = payloadOf(token);
  if (!payload) return [];
  const claim = payload['roles'];
  const codes = Array.isArray(claim) ? claim : [payload['role']];
  const roles = codes.map(roleFromClaim).filter((r): r is UserRole => r !== null);
  return [...new Set(roles)];
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

export function storedRoles(): UserRole[] {
  return rolesFromAccessToken(storedAccessToken());
}

export function portalFor(role: UserRole): string {
  switch (role) {
    case 'medico': return '/portal/medico';
    case 'admin': return '/portal/admin';
    case 'paciente': return '/portal/paciente';
    default: return '/login';
  }
}
