import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

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

  appointments = signal<Appointment[]>([
    {
      id: 'CIT-2024-8841',
      doctorName: 'Dr. Carlos E. Santos',
      specialty: 'Cardiología Clínica',
      facility: 'HIC',
      facilityFullName: 'HIC Floridablanca / Piedecuesta',
      date: 'Jueves, 24 Oct 2024',
      time: '08:30 AM',
      type: 'Presencial',
      status: 'Confirmada',
      preparationNote: 'Presentarse con 20 minutos de anticipación. Requiere 8 horas de ayuno para perfil lipídico y presentar documento de identidad original.',
      room: 'Consultorio 402 • Piso 4',
    },
    {
      id: 'CIT-2024-9120',
      doctorName: 'Dra. Sandra Milena Pérez',
      specialty: 'Electrocardiografía Diagnóstica',
      facility: 'ICV',
      facilityFullName: 'Instituto Cardiovascular - Floridablanca',
      date: 'Martes, 12 Nov 2024',
      time: '11:15 AM',
      type: 'Presencial',
      status: 'Confirmada',
      preparationNote: 'No aplicar cremas corporales en el pecho el día del examen. Traer ropa cómoda de dos piezas.',
      room: 'Unidad de Diagnóstico No Invasivo • Piso 2',
    },
  ]);

  constructor() {}


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
