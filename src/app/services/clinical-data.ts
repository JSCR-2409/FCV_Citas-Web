import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MeProfile, MyAppointment } from './catalog-api';
import { ACCESS_TOKEN_KEY, roleFromClaim, storedRoles } from './jwt-role';

export type { UserRole } from './jwt-role';
import type { UserRole } from './jwt-role';

/** Etiquetas de presentacion de los seis estados de cita del PRD. */
const STATUS_LABELS: Record<string, Appointment['status']> = {
  APPROVED: 'Confirmada',
  REQUESTED: 'En Espera',
  COMPLETED: 'Atendida',
  CANCELLED: 'Cancelada',
  REJECTED: 'Rechazada',
  NO_SHOW: 'No asistió',
};

/** Estados en los que la cita sigue viva: el resto son terminales. */
const ACTIVE_STATUSES = new Set(['APPROVED', 'REQUESTED']);

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
  /** Instante de inicio sin formatear, para ordenar y comparar con el momento actual. */
  startAt: string;
  /** Codigo de estado del backend; `status` es solo la etiqueta de presentacion. */
  statusCode: string;
  /** Para reprogramar: la nueva franja conserva profesional y especialidad. */
  professionalId: number;
  specialtyId: number;
  durationMinutes: number;
  /** HU-022 CA-03: motivo del rechazo administrativo cuando existe. */
  reason: string | null;
  type: 'Presencial' | 'Teleconsulta';
  status: 'Confirmada' | 'En Espera' | 'Atendida' | 'Cancelada' | 'Rechazada' | 'No asistió';
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
    this.appointments.set(remoteAppointments.map(item => {
      const start = new Date(item.startAt);
      return {
        id: String(item.id),
        doctorName: item.doctorName,
        specialty: item.specialty,
        facility: item.facility === 'ICV' ? 'ICV' : 'HIC',
        facilityFullName: item.facilityFullName,
        date: start.toLocaleDateString('es-CO'),
        time: start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        startAt: item.startAt,
        statusCode: item.status,
        professionalId: item.professionalId,
        specialtyId: item.specialtyId,
        durationMinutes: item.durationMinutes,
        reason: item.reason,
        type: 'Presencial',
        status: STATUS_LABELS[item.status] ?? item.status,
      } as Appointment;
    }));
  }

  /** Citas que siguen vigentes y aun no han ocurrido, de la mas proxima a la mas lejana. */
  upcomingAppointments(): Appointment[] {
    const now = Date.now();
    return this.appointments()
      .filter(a => ACTIVE_STATUSES.has(a.statusCode) && new Date(a.startAt).getTime() >= now)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  /** Citas ya pasadas o en un estado terminal, de la mas reciente a la mas antigua. */
  pastAppointments(): Appointment[] {
    const upcoming = new Set(this.upcomingAppointments().map(a => a.id));
    return this.appointments()
      .filter(a => !upcoming.has(a.id))
      .sort((a, b) => b.startAt.localeCompare(a.startAt));
  }

  /** La siguiente cita vigente, o null. */
  nextAppointment(): Appointment | null {
    return this.upcomingAppointments()[0] ?? null;
  }

  /** Solo una cita vigente y futura puede cancelarse; el backend aplica la misma regla. */
  canBeCancelled(appointment: Appointment): boolean {
    return ACTIVE_STATUSES.has(appointment.statusCode) && new Date(appointment.startAt).getTime() >= Date.now();
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
