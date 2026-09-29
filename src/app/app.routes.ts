import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Recovery } from './pages/recovery';
import { PatientPortal } from './pages/patient-portal';
import { DoctorPortal } from './pages/doctor-portal';
import { AdminPortal } from './pages/admin-portal';
import { requireRole } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'recuperar', component: Recovery },
  { path: 'portal/paciente', component: PatientPortal, canActivate: [requireRole('paciente')] },
  { path: 'portal/medico', component: DoctorPortal, canActivate: [requireRole('medico')] },
  { path: 'portal/admin', component: AdminPortal, canActivate: [requireRole('admin')] },
  { path: '**', redirectTo: 'login' },
];
