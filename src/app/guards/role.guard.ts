import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState, UserRole } from '../services/clinical-data';

export const requireRole = (role: UserRole): CanActivateFn => () => {
  const user = inject(ClinicalDataState).currentUser();
  return user?.role === role ? true : inject(Router).createUrlTree(['/login']);
};
