import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Recovery } from './pages/recovery';
import { PatientPortal } from './pages/patient-portal';
import { DoctorPortal } from './pages/doctor-portal';
import { AdminPortal } from './pages/admin-portal';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'recuperar', component: Recovery },
  { path: 'portal/paciente', component: PatientPortal },
  { path: 'portal/medico', component: DoctorPortal },
  { path: 'portal/admin', component: AdminPortal },
  { path: '**', redirectTo: 'login' },
];
