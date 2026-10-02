import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState } from '../services/clinical-data';
import { portalFor, storedRole } from '../services/jwt-role';

/**
 * Las pantallas publicas no deben verse con sesion abierta: redirige al portal del rol. Con
 * varios roles se usa el primero, que es el mismo criterio de presentacion que aplica el token.
 */
export const guestOnly: CanActivateFn = () => {
  const router = inject(Router);
  const role = inject(ClinicalDataState).availableRoles()[0] ?? storedRole();
  return role ? router.createUrlTree([portalFor(role)]) : true;
};
