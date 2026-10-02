import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MeProfile, MyAppointment } from './catalog-api';

export type UserRole = 'paciente' | 'medico' | 'admin' | 'guest';

export interface UserProfile {
  name: string;
  role: UserRole;
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

  hydrateFromApi(profile: MeProfile & { role?: string }, remoteAppointments: MyAppointment[]) {
    const role: UserRole = profile.role === 'ADMIN' ? 'admin' : profile.role === 'PROFESSIONAL' ? 'medico' : 'paciente';
    this.currentUser.set({ name: `${profile.names} ${profile.surnames}`, role, email: profile.email, documentId: `${profile.documentType} ${profile.documentNumber}`, avatarUrl: '', phone: profile.phone });
    this.setAppointmentsFromApi(remoteAppointments);
  }

  /** Recarga solo las citas y conserva la sesion, sin reconstruir el perfil. */
  setAppointmentsFromApi(remoteAppointments: MyAppointment[]) {
    this.appointments.set(remoteAppointments.map(item => ({ id: String(item.id), doctorName: item.doctorName, specialty: item.specialty, facility: item.facility === 'ICV' ? 'ICV' : 'HIC', facilityFullName: item.facilityFullName, date: new Date(item.startAt).toLocaleDateString('es-CO'), time: new Date(item.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }), type: 'Presencial', status: item.status === 'APPROVED' ? 'Confirmada' : item.status === 'REQUESTED' ? 'En Espera' : item.status === 'COMPLETED' ? 'Atendida' : 'Cancelada' } as Appointment)));
  }


  loginAs(role: UserRole) {
    let profile: UserProfile;
    if (role === 'paciente') {
      profile = {
        name: 'Sofía Mariana Restrepo',
        role: 'paciente',
        email: 'paciente@hic.org.co',
        documentId: 'CC 1.098.342.190',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL35ZtZEbH7xYXn1ig7lC1vhBl9wMZ7biHFHMy7aHx2VJhnFOLFHRQ8VaS4lZaUF257-xdxW1h6ybgmV5aPahDTDh-WXNu742R0jvyJeP2SGZNqzKk3RhK6D-VZxbEqvQvkTBUeOUWz578dEMGLhmS5_Nmgnu-YLQ4HR6Bl5F0H0wMqnOPXjCSHEh1oFditegEneXIpmrJeXwVddILAq_cjKKc5iJEZ7G6LuYdumYWboNSIUy15yI',
        affiliation: 'Paciente Afiliada',
        phone: '+57 (318) 459-2918',
        insurance: 'Póliza Sura Medicina Prepagada',
      };
      this.currentUser.set(profile);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('hic_active_user', JSON.stringify(profile));
      }
      this.router.navigate(['/portal/paciente']);
    } else if (role === 'medico') {
      profile = {
        name: 'Dr. Alejandro Morales',
        role: 'medico',
        email: 'dr.especialista@icv.org.co',
        documentId: 'CC 88.391.029',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL35ZtZEbH7xYXn1ig7lC1vhBl9wMZ7biHFHMy7aHx2VJhnFOLFHRQ8VaS4lZaUF257-xdxW1h6ybgmV5aPahDTDh-WXNu742R0jvyJeP2SGZNqzKk3RhK6D-VZxbEqvQvkTBUeOUWz578dEMGLhmS5_Nmgnu-YLQ4HR6Bl5F0H0wMqnOPXjCSHEh1oFditegEneXIpmrJeXwVddILAq_cjKKc5iJEZ7G6LuYdumYWboNSIUy15yI',
        specialty: 'Cardiología Clínica',
        tokenCode: 'MED-ICV-7740',
      };
      this.currentUser.set(profile);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('hic_active_user', JSON.stringify(profile));
      }
      this.router.navigate(['/portal/medico']);
    } else if (role === 'admin') {
      profile = {
        name: 'Ing. Marcela Pineda',
        role: 'admin',
        email: 'coordinacion.citas@hic.org.co',
        documentId: 'CC 63.892.411',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL35ZtZEbH7xYXn1ig7lC1vhBl9wMZ7biHFHMy7aHx2VJhnFOLFHRQ8VaS4lZaUF257-xdxW1h6ybgmV5aPahDTDh-WXNu742R0jvyJeP2SGZNqzKk3RhK6D-VZxbEqvQvkTBUeOUWz578dEMGLhmS5_Nmgnu-YLQ4HR6Bl5F0H0wMqnOPXjCSHEh1oFditegEneXIpmrJeXwVddILAq_cjKKc5iJEZ7G6LuYdumYWboNSIUy15yI',
        affiliation: 'Dirección de Tecnología y Admisiones',
      };
      this.currentUser.set(profile);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('hic_active_user', JSON.stringify(profile));
      }
      this.router.navigate(['/portal/admin']);
    }
  }

  logout() {
    this.currentUser.set(null);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('hic_active_user');
      localStorage.removeItem('fcv_access_token');
    }
    this.router.navigate(['/login']);
  }

  setGuestUser() {
    this.currentUser.set(null);
  }

  addAppointment(app: Omit<Appointment, 'id'>) {
    const newApp: Appointment = {
      ...app,
      id: 'CIT-2024-' + Math.floor(1000 + Math.random() * 9000),
    };
    this.appointments.update((prev) => [newApp, ...prev]);
    return newApp;
  }

  cancelAppointment(id: string) {
    this.appointments.update((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelada' } : a))
    );
  }
}
