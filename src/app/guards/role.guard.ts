import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState, UserRole } from '../services/clinical-data';
import { portalFor, storedRole } from '../services/jwt-role';

/**
 * Permite la ruta solo si el usuario tiene el rol indicado. Un usuario puede tener varios, porque
 * user_roles es N:M; quien no tenga el rol se redirige a su propio portal y, sin sesion, al login.
 * La autorizacion real la impone el backend: este guard solo evita mostrar una vista que no
 * corresponde.
 */
export const requireRole = (role: UserRole): CanActivateFn => () => {
  const router = inject(Router);
  const roles = inject(ClinicalDataState).availableRoles();
  if (roles.includes(role)) return true;
  const fallback = roles[0] ?? storedRole();
  return router.createUrlTree([fallback ? portalFor(fallback) : '/login']);
};
