import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicalDataState, UserRole } from '../services/clinical-data';

export const guestOnly: CanActivateFn = () => {
  const state = inject(ClinicalDataState);
  const router = inject(Router);
  const user = state.currentUser();
  let role = user?.role;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('fcv_access_token') : null;
  if (!role && token) {
    try {
      const claim = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role;
      role = claim === 'USER' ? 'paciente' : claim === 'PROFESSIONAL' ? 'medico' : claim === 'ADMIN' ? 'admin' : undefined;
    } catch { /* token inválido: permite la pantalla pública */ }
  }
  if (role === 'paciente') return router.createUrlTree(['/portal/paciente']);
  if (role === 'medico') return router.createUrlTree(['/portal/medico']);
  if (role === 'admin') return router.createUrlTree(['/portal/admin']);
  return true;
};
