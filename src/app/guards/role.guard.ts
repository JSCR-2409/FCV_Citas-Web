import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState, UserRole } from '../services/clinical-data';
import { portalFor, storedRole } from '../services/jwt-role';

/**
 * Permite la ruta solo al rol indicado. Un usuario autenticado con otro rol se redirige a su
 * propio portal; sin sesion, al login. La autorizacion real la impone el backend: este guard
 * solo evita mostrar una vista que no corresponde.
 */
export const requireRole = (role: UserRole): CanActivateFn => () => {
  const router = inject(Router);
  const actual = inject(ClinicalDataState).currentUser()?.role ?? storedRole();
  if (actual === role) return true;
  return router.createUrlTree([actual ? portalFor(actual) : '/login']);
};
