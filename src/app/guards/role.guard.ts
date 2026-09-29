import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState, UserRole } from '../services/clinical-data';

export const requireRole = (role: UserRole): CanActivateFn => () => {
  const user = inject(ClinicalDataState).currentUser();
  if (user) return true;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('fcv_access_token') : null;
  if (token) { try { const claim = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role; if (claim === 'USER' || claim === 'PROFESSIONAL' || claim === 'ADMIN') return true; } catch { /* invalid token */ } }
  return inject(Router).createUrlTree(['/login']);
};
