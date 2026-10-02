import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState } from '../services/clinical-data';
import { portalFor, storedRole } from '../services/jwt-role';

/** Las pantallas publicas no deben verse con sesion abierta: redirige al portal del rol. */
export const guestOnly: CanActivateFn = () => {
  const router = inject(Router);
  const role = inject(ClinicalDataState).currentUser()?.role ?? storedRole();
  return role ? router.createUrlTree([portalFor(role)]) : true;
};
