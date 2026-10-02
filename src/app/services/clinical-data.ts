import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MeProfile, MyAppointment } from './catalog-api';
import { ACCESS_TOKEN_KEY, roleFromClaim, storedRoles } from './jwt-role';

export type { UserRole } from './jwt-role';
import type { UserRole } from './jwt-role';

export interface UserProfile {
  name: string;
  /** Rol de presentacion. Para decidir accesos se usa `roles`. */
  role: UserRole;
  /** Todos los roles del usuario: user_roles es N:M. */
  roles: UserRole[];
  email: string;
  documentId: string;
  avatarUrl: string;
  affiliation?: string;
  specialty?: string;
  tokenCode?: string;
  phone?: string;
  insurance?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  facility: 'HIC' | 'ICV';
  facilityFullName: string;
  date: string;
  time: string;
  type: 'Presencial' | 'Teleconsulta';
  status: 'Confirmada' | 'En Espera' | 'Atendida' | 'Cancelada';
  preparationNote?: string;
  room?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClinicalDataState {
  private router = inject(Router);
  currentUser = signal<UserProfile | null>(null);

  appointments = signal<Appointment[]>([]);

  /**
   * Roles con los que el usuario puede navegar. Mientras el perfil no se ha hidratado se usan los
   * del token, para que un refresco de pagina no expulse al usuario de su portal.
   */
  availableRoles(): UserRole[] {
    const fromProfile = this.currentUser()?.roles;
    return fromProfile && fromProfile.length ? fromProfile : storedRoles();
  }

  hydrateFromApi(profile: MeProfile & { role?: string; roles?: string[] }, remoteAppointments: MyAppointment[]) {
    const roles = (profile.roles ?? (profile.role ? [profile.role] : []))
      .map(roleFromClaim)
      .filter((r): r is UserRole => r !== null);
    const effective = roles.length ? roles : storedRoles();
    this.currentUser.set({ name: `${profile.names} ${profile.surnames}`, role: effective[0] ?? 'paciente', roles: effective, email: profile.email, documentId: `${profile.documentType} ${profile.documentNumber}`, avatarUrl: '', phone: profile.phone });
    this.setAppointmentsFromApi(remoteAppointments);
  }

  /** Recarga solo las citas y conserva la sesion, sin reconstruir el perfil. */
  setAppointmentsFromApi(remoteAppointments: MyAppointment[]) {
    this.appointments.set(remoteAppointments.map(item => ({ id: String(item.id), doctorName: item.doctorName, specialty: item.specialty, facility: item.facility === 'ICV' ? 'ICV' : 'HIC', facilityFullName: item.facilityFullName, date: new Date(item.startAt).toLocaleDateString('es-CO'), time: new Date(item.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }), type: 'Presencial', status: item.status === 'APPROVED' ? 'Confirmada' : item.status === 'REQUESTED' ? 'En Espera' : item.status === 'COMPLETED' ? 'Atendida' : 'Cancelada' } as Appointment)));
  }

  logout() {
    this.currentUser.set(null);
    this.appointments.set([]);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('hic_active_user');
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    this.router.navigate(['/login']);
  }

  setGuestUser() {
    this.currentUser.set(null);
  }
}
