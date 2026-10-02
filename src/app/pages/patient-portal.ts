import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Appointment, ClinicalDataState } from '../services/clinical-data';
import { AvailabilityItem, CatalogApi } from '../services/catalog-api';

@Component({
  selector: 'app-patient-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] w-full">
      
      <!-- Left Sidebar (Desktop) -->
      <aside class="w-full lg:w-64 bg-[#001549] text-white p-5 flex flex-col justify-between shadow-xl flex-shrink-0">
        <div class="flex flex-col gap-6">
          
          <!-- Brand and Role Header -->
          <div class="flex flex-col gap-1 pb-4 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#afc6ff] text-[22px]">health_and_safety</span>
              <span class="font-headline-md text-[16px] text-white font-bold tracking-tight">Portal Clínico</span>
            </div>
            <span class="font-micro text-[10px] uppercase tracking-wider text-[#dee8ff]">HIC &amp; ICV Bucaramanga</span>
            <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-[#dce1ff] text-[11px] font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#006ef4]"></span>
              <span>PACIENTE / USUARIO</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="flex flex-col gap-1.5" aria-label="Menú de navegación del paciente">
            <button
              (click)="startBooking()"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all cursor-pointer text-left"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">calendar_month</span>
              <span>Agendar Citas</span>
            </button>

            <button
              (click)="scrollToAppointments()"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-[#dce1ff] hover:bg-white/10 hover:text-white font-label-md text-[13px] transition-all cursor-pointer text-left"
              type="button"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">event_note</span>
                <span>Mis Citas</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-[#006ef4] text-white text-[11px] font-bold">
                {{ clinicalState.appointments().length }}
              </span>
            </button>

            <button
              (click)="showProfileModal.set(true)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#dce1ff] hover:bg-white/10 hover:text-white font-label-md text-[13px] transition-all cursor-pointer text-left"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">description</span>
              <span>Historial &amp; Órdenes</span>
            </button>

            <button
              (click)="showFacilities.set(true)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#dce1ff] hover:bg-white/10 hover:text-white font-label-md text-[13px] transition-all"
            >
              <span class="material-symbols-outlined text-[20px]">apartment</span>
              <span>Sedes &amp; Médicos</span>
            </button>
          </nav>
        </div>

        <!-- Sidebar Bottom Controls -->
        <div class="pt-6 border-t border-white/10 flex flex-col gap-2">
          <button
            (click)="showExpiredModal.set(true)"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-[#dee8ff] hover:bg-white/10 text-[12px] font-medium transition-colors cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[18px]">timer</span>
            <span>Simular Expiración</span>
          </button>
          
          <button
            (click)="showLogoutConfirm.set(true)"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-[#ffdad6] hover:bg-[#ba1a1a]/20 text-[12px] font-semibold transition-colors cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Portal Content -->
      <div class="flex-1 flex flex-col bg-[#f9f9ff] overflow-y-auto">
        
        <!-- Header Strip -->
        <header class="w-full bg-white px-6 py-3.5 border-b border-[#e7eeff] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#001549] text-[12px] font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#0056c3] animate-pulse"></span>
              <span>Sesión Activa - Auto-renovación segura</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="w-9 h-9 rounded-full bg-[#f0f3ff] text-[#444651] hover:text-[#001549] flex items-center justify-center relative cursor-pointer"
              title="Notificaciones de citas"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#006ef4]"></span>
            </button>

            <!-- User Menu -->
            <div class="flex items-center gap-2.5 pl-2 border-l border-[#c5c6d3]/40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL35ZtZEbH7xYXn1ig7lC1vhBl9wMZ7biHFHMy7aHx2VJhnFOLFHRQ8VaS4lZaUF257-xdxW1h6ybgmV5aPahDTDh-WXNu742R0jvyJeP2SGZNqzKk3RhK6D-VZxbEqvQvkTBUeOUWz578dEMGLhmS5_Nmgnu-YLQ4HR6Bl5F0H0wMqnOPXjCSHEh1oFditegEneXIpmrJeXwVddILAq_cjKKc5iJEZ7G6LuYdumYWboNSIUy15yI"
                alt="Foto de perfil del paciente"
                referrerpolicy="no-referrer"
                class="w-9 h-9 rounded-full object-cover border-2 border-[#0056c3]"
              />
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] text-[#001549] font-bold leading-tight">{{ clinicalState.currentUser()?.name }}</span>
                <span class="font-caption text-[11px] text-[#757682]">{{ clinicalState.currentUser()?.documentId }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Body Area -->
        <main class="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
          
          <!-- Hero Greeting Banner -->
          <section class="relative rounded-2xl bg-gradient-to-r from-[#001549] to-[#002777] text-white p-6 sm:p-8 shadow-md overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#006ef4]/20 blur-2xl pointer-events-none"></div>
            
            <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="flex flex-col gap-1">
                <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-[#afc6ff] text-[11px] font-semibold self-start">
                  <span class="material-symbols-outlined text-[15px]">badge</span>
                  <span>Paciente Acreditada</span>
                </div>
                <h1 class="font-headline-xl text-[26px] sm:text-[30px] font-bold text-white mt-1">¡Hola, {{ clinicalState.currentUser()?.name?.split(' ')?.[0] }}!</h1>
                <p class="font-subtitle text-[14px] text-[#dee8ff]">
                  Bienvenida a su panel clínico unificado del Hospital Internacional de Colombia y el Instituto Cardiovascular.
                </p>
              </div>

              <div class="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex flex-col gap-1 border border-white/10 sm:min-w-[200px]">
                <span class="font-micro text-[10px] uppercase text-[#afc6ff]">Centros Autorizados</span>
                <span class="font-label-md text-[13px] font-bold text-white leading-tight">HIC Floridablanca</span>
                <span class="font-label-md text-[13px] font-bold text-white leading-tight">ICV Piedecuesta</span>
              </div>
            </div>
          </section>

          <!-- 3 Main Interactive Action Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <!-- CARD 1: Agendar Nueva Cita Médica -->
            <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e7eeff] hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div class="flex flex-col gap-3">
                <div class="w-12 h-12 rounded-xl bg-[#dee8ff] text-[#0056c3] flex items-center justify-center">
                  <span class="material-symbols-outlined text-[26px]">calendar_add_on</span>
                </div>
                <div class="flex flex-col">
                  <h2 class="font-headline-md text-[18px] text-[#001549] font-bold">Agendar Nueva Cita</h2>
                  <p class="font-caption text-[12px] text-[#444651] mt-1">
                    +40 Especialidades disponibles con asignación prioritaria institucional en sedes HIC e ICV.
                  </p>
                </div>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <span class="px-2 py-0.5 rounded-md bg-[#f0f3ff] text-[#0056c3] font-caption text-[11px] font-semibold">
                    Disponibilidad Inmediata
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-[#f0f3ff] text-[#0056c3] font-caption text-[11px] font-semibold">
                    Convenios EPS &amp; Pólizas
                  </span>
                </div>
              </div>

              <button
                (click)="startBooking()"
                class="w-full py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                type="button"
              >
                <span>Iniciar Agendamiento</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <!-- CARD 2: Mis Citas Programadas -->
            <div id="citas-section" class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e7eeff] hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="w-12 h-12 rounded-xl bg-[#e7eeff] text-[#001549] flex items-center justify-center">
                    <span class="material-symbols-outlined text-[26px]">event_available</span>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-[#dee8ff] text-[#0056c3] font-caption text-[11px] font-bold">
                    {{ clinicalState.appointments().length }} Cita{{ clinicalState.appointments().length !== 1 ? 's' : '' }} Próxima{{ clinicalState.appointments().length !== 1 ? 's' : '' }}
                  </span>
                </div>

                @if (primaryAppointment(); as app) {
                  <div class="p-3 bg-[#f0f3ff] rounded-xl flex flex-col gap-1 border border-[#e7eeff]">
                    <span class="font-label-md text-[13px] text-[#001549] font-bold">{{ app.doctorName }}</span>
                    <span class="font-caption text-[12px] text-[#0056c3] font-semibold">{{ app.specialty }}</span>
                    <div class="flex items-center gap-2 text-[#444651] font-caption text-[11px] mt-1">
                      <span class="material-symbols-outlined text-[14px] text-[#0056c3]">schedule</span>
                      <span>{{ app.date }} • {{ app.time }}</span>
                    </div>
                  </div>
                } @else {
                  <div class="p-3 bg-[#f0f3ff] rounded-xl text-center text-[#757682] text-[12px]">
                    No registra citas pendientes actualmente.
                  </div>
                }
              </div>

              <button
                (click)="openAppointmentDetail()"
                class="w-full py-2.5 rounded-xl bg-[#dee8ff] text-[#001549] font-label-md text-[13px] font-semibold hover:bg-[#cfdaf1] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>Ver Detalle y Preparación</span>
                <span class="material-symbols-outlined text-[16px]">visibility</span>
              </button>
            </div>

            <!-- CARD 3: Mi Perfil y Documentos -->
            <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e7eeff] hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="w-12 h-12 rounded-xl bg-[#dee8ff] text-[#0056c3] flex items-center justify-center">
                    <span class="material-symbols-outlined text-[26px]">account_box</span>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-[#f0f3ff] text-[#444651] font-caption text-[11px] font-medium">
                    Expediente #HIC-99214
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <h2 class="font-headline-md text-[18px] text-[#001549] font-bold">Mi Perfil y Convenio</h2>
                  <p class="font-caption text-[12px] text-[#444651]">
                    Datos de contacto registrados, póliza médica vigente y autorizaciones hospitalarias.
                  </p>
                </div>
                <div class="flex flex-col gap-1 text-[12px] text-[#444651] pt-1">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[15px] text-[#0056c3]">verified</span>
                    <span>Póliza Sura Medicina Prepagada</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[15px] text-[#0056c3]">call</span>
                    <span>+57 (318) 459-2918</span>
                  </div>
                </div>
              </div>

              <button
                (click)="showProfileModal.set(true)"
                class="w-full py-2.5 rounded-xl bg-[#dee8ff] text-[#001549] font-label-md text-[13px] font-semibold hover:bg-[#cfdaf1] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>Gestionar Perfil</span>
                <span class="material-symbols-outlined text-[16px]">manage_accounts</span>
              </button>
            </div>

          </div>

          <!-- Protocol & Clinical Assistance Recommendations -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eeff] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#dee8ff] text-[#001549] flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-[26px]">medical_services</span>
              </div>
              <div class="flex flex-col">
                <h3 class="font-label-md text-[15px] text-[#001549] font-bold">Protocolo de Asistencia a Citas HIC &amp; ICV</h3>
                <ul class="font-caption text-[12px] text-[#444651] mt-1.5 flex flex-col gap-1 list-disc list-inside">
                  <li>Llegar con 20 minutos de antelación para validación biométrica en counter de admisiones.</li>
                  <li>Presentar documento de identidad original y orden de servicio expedida por su aseguradora.</li>
                  <li>Para cancelaciones o reprogramaciones, realizarlo con un mínimo de 12 horas de antelación.</li>
                </ul>
              </div>
            </div>

            <div class="bg-[#f0f3ff] rounded-xl p-4 flex flex-col gap-1 border border-[#e7eeff] sm:min-w-[220px]">
              <span class="font-micro text-[10px] uppercase text-[#757682] font-semibold">Línea de Asistencia Paciente</span>
              <span class="font-label-md text-[14px] text-[#0056c3] font-bold">(607) 639-4040 • Ext. 1001</span>
              <span class="font-caption text-[11px] text-[#444651]">Urgencias Cardiovasculares 24h</span>
            </div>
          </section>

        </main>
      </div>
    </div>

    <!-- MODAL 1: Agendar Nueva Cita Médica -->
    @if (openBookingModal()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7eeff] overflow-hidden flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-4 bg-[#001549] text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[22px] text-[#afc6ff]">calendar_month</span>
              <h3 class="font-headline-md text-[17px] font-bold text-white">Agendar Nueva Cita Médica</h3>
            </div>
            <button
              (click)="openBookingModal.set(false)"
              class="w-8 h-8 rounded-lg text-[#dee8ff] hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form class="p-6 overflow-y-auto flex flex-col gap-4" (submit)="handleBookAppointment($event)">
            <!-- Specialty -->
            <div class="flex flex-col gap-1.5">
              <label for="book-specialty" class="font-label-md text-[13px] text-[#001549] font-semibold">Especialidad Médica</label>
              <select
                id="book-specialty"
                class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] rounded-lg border border-[#c5c6d3]/60 font-body-md text-[14px] outline-none cursor-pointer"
                [value]="bookSpecialty()"
                (change)="bookSpecialty.set($any($event.target).value)"
                required
              >
                <option value="Medicina General">Medicina General</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Nefrología">Nefrología</option>
                <option value="Urología">Urología</option>
                <option value="Gastroenterología">Gastroenterología</option>
                <option value="Neumología Adulto">Neumología Adulto</option>
                <option value="Ortopedia y Traumatología">Ortopedia y Traumatología</option>
                <option value="Endocrinología">Endocrinología</option>
                <option value="Neurología">Neurología</option>
              </select>
            </div>

            <!-- Facility -->
            <div class="flex flex-col gap-1.5">
              <span class="font-label-md text-[13px] text-[#001549] font-semibold">Sede Hospitalaria</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="bookFacility.set('HIC')"
                  [class]="bookFacility() === 'HIC' ? 'bg-[#001549] text-white font-semibold' : 'bg-[#f0f3ff] text-[#444651]'"
                  class="p-2.5 rounded-xl border border-[#c5c6d3]/40 text-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">local_hospital</span>
                  <span>HIC Floridablanca</span>
                </button>
                <button
                  type="button"
                  (click)="bookFacility.set('ICV')"
                  [class]="bookFacility() === 'ICV' ? 'bg-[#001549] text-white font-semibold' : 'bg-[#f0f3ff] text-[#444651]'"
                  class="p-2.5 rounded-xl border border-[#c5c6d3]/40 text-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">cardiology</span>
                  <span>ICV Bucaramanga</span>
                </button>
              </div>
            </div>

            <!-- Doctor -->
            <div class="flex flex-col gap-1.5">
              <label for="book-doctor" class="font-label-md text-[13px] text-[#001549] font-semibold">Profesional Asignado</label>
              <select
                id="book-doctor"
                class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] rounded-lg border border-[#c5c6d3]/60 font-body-md text-[14px] outline-none cursor-pointer"
                [value]="bookDoctor()"
                (change)="bookDoctor.set($any($event.target).value)"
                required
              >
                <option value="Dr. Carlos E. Santos">Dr. Carlos E. Santos (Cardiología Adultos)</option>
                <option value="Dra. Sandra Milena Pérez">Dra. Sandra Milena Pérez (Fisiología Cardíaca)</option>
                <option value="Dr. Alejandro Morales">Dr. Alejandro Morales (Ecocardiografía Avanzada)</option>
              </select>
            </div>

            <!-- Date & Time -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label for="book-date" class="font-label-md text-[13px] text-[#001549] font-semibold">Fecha Deseada</label>
                <input
                  id="book-date"
                  type="date"
                  class="w-full h-11 px-3 bg-[#f0f3ff] text-[#111c2c] rounded-lg border border-[#c5c6d3]/60 text-[13px] outline-none"
                  [value]="bookDate()" [min]="today()"
                  (input)="bookDate.set($any($event.target).value)"
                  required
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label for="book-time" class="font-label-md text-[13px] text-[#001549] font-semibold">Hora de Consulta</label>
                <select
                  id="book-time"
                  class="w-full h-11 px-3 bg-[#f0f3ff] text-[#111c2c] rounded-lg border border-[#c5c6d3]/60 text-[13px] outline-none"
                  [value]="bookTime()"
                  (change)="bookTime.set($any($event.target).value)"
                  required
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>
            <button type="button" (click)="searchAvailability()" class="h-10 rounded-lg border border-[#0056c3] text-[#0056c3] text-[13px] font-semibold">Consultar horarios reales</button>
            @if (availability().length > 0) {
              <div class="flex flex-col gap-1.5">
                <label for="book-slot" class="font-label-md text-[13px] text-[#001549] font-semibold">Horario disponible</label>
                <select id="book-slot" class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] rounded-lg border border-[#c5c6d3]/60 text-[13px]" [value]="selectedSlot()?.slotId" (change)="selectSlot($any($event.target).value)">
                  @for (slot of availability(); track slot.slotId) { <option [value]="slot.slotId">{{ slot.startAt | date:'shortTime' }} — {{ slot.professionalCode }} — {{ slot.locationName }}</option> }
                </select>
              </div>
            }
            @if (bookingMessage()) { <p class="text-[12px] text-[#0056c3]">{{ bookingMessage() }}</p> }

            <!-- Insurance check -->
            <div class="p-3 bg-[#dee8ff]/50 rounded-xl flex items-center justify-between border border-[#dee8ff]">
              <div class="flex flex-col">
                <span class="font-caption text-[11px] text-[#757682]">Convenio Detectado</span>
                <span class="font-label-md text-[12px] text-[#001549] font-bold">Póliza Sura Medicina Prepagada</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-[#0056c3] text-white text-[10px] font-bold">Cubierto 100%</span>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3 pt-2 border-t border-[#e7eeff]">
              <button
                type="button"
                (click)="openBookingModal.set(false)"
                class="px-4 py-2.5 rounded-xl text-[#757682] hover:text-[#001549] text-[13px] font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Confirmar Agendamiento</span>
                <span class="material-symbols-outlined text-[16px]">done</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- MODAL 2: Detalle y Preparación de Cita -->
    @if (showDetailModal()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7eeff] overflow-hidden flex flex-col">
          <div class="px-6 py-4 bg-[#001549] text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[22px] text-[#afc6ff]">event_available</span>
              <h3 class="font-headline-md text-[17px] font-bold text-white">Detalle y Preparación de Cita</h3>
            </div>
            <button
              (click)="showDetailModal.set(false)"
              class="w-8 h-8 rounded-lg text-[#dee8ff] hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 flex flex-col gap-4">
            @if (selectedAppointment(); as app) {
              <div class="p-4 rounded-xl bg-[#f0f3ff] flex flex-col gap-2 border border-[#e7eeff]">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-label-md text-[15px] font-bold text-[#001549]">{{ app.doctorName }}</h4>
                    <span class="font-caption text-[12px] text-[#0056c3] font-semibold">{{ app.specialty }}</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#dee8ff] text-[#0056c3] font-caption text-[11px] font-bold">
                    {{ app.status }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[12px] text-[#444651] pt-2 border-t border-[#c5c6d3]/40">
                  <div>
                    <span class="block text-[#757682] text-[11px]">Fecha y Hora:</span>
                    <strong class="text-[#111c2c]">{{ app.date }} • {{ app.time }}</strong>
                  </div>
                  <div>
                    <span class="block text-[#757682] text-[11px]">Ubicación:</span>
                    <strong class="text-[#111c2c]">{{ app.room || 'Consultorio Principal' }}</strong>
                  </div>
                </div>
              </div>

              <!-- Prep note -->
              <div class="p-4 rounded-xl bg-[#dee8ff]/50 flex items-start gap-3 border border-[#dee8ff]">
                <span class="material-symbols-outlined text-[#0056c3] text-[22px] mt-0.5 flex-shrink-0">assignment</span>
                <div class="flex flex-col">
                  <span class="font-label-md text-[13px] text-[#001549] font-bold">Instrucciones de Preparación Médica</span>
                  <p class="font-body-md text-[12px] text-[#444651] mt-1 leading-relaxed">
                    {{ app.preparationNote }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-2">
                <button
                  type="button"
                  (click)="cancelActiveAppointment(app.id)"
                  class="px-4 py-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6] text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Cancelar Cita
                </button>
                <button
                  type="button"
                  (click)="showDetailModal.set(false)"
                  class="px-6 py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- MODAL 3: Gestionar Perfil -->
    @if (showFacilities()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
          <div class="flex items-center justify-between border-b border-[#e7eeff] pb-3"><h3 class="text-[#001549] font-bold">Sedes y profesionales</h3><button type="button" (click)="showFacilities.set(false)" class="text-[#757682]">✕</button></div>
          <div class="grid gap-3 mt-4"><div class="p-3 rounded-xl bg-[#f0f3ff]"><b>HIC</b><p class="text-[12px] text-[#444651]">Hospital Internacional de Colombia</p></div><div class="p-3 rounded-xl bg-[#f0f3ff]"><b>ICV</b><p class="text-[12px] text-[#444651]">Instituto Cardiovascular</p></div><p class="text-[12px] text-[#757682]">Los profesionales disponibles se muestran al consultar horarios reales en Agendar Citas.</p></div>
        </div>
      </div>
    }
    @if (showProfileModal()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e7eeff] overflow-hidden flex flex-col">
          <div class="px-6 py-4 bg-[#001549] text-white flex items-center justify-between">
            <h3 class="font-headline-md text-[17px] font-bold text-white">Expediente Clínico del Paciente</h3>
            <button
              (click)="showProfileModal.set(false)"
              class="w-8 h-8 rounded-lg text-[#dee8ff] hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="p-6 flex flex-col gap-4">
            <div class="flex items-center gap-3 pb-3 border-b border-[#e7eeff]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL35ZtZEbH7xYXn1ig7lC1vhBl9wMZ7biHFHMy7aHx2VJhnFOLFHRQ8VaS4lZaUF257-xdxW1h6ybgmV5aPahDTDh-WXNu742R0jvyJeP2SGZNqzKk3RhK6D-VZxbEqvQvkTBUeOUWz578dEMGLhmS5_Nmgnu-YLQ4HR6Bl5F0H0wMqnOPXjCSHEh1oFditegEneXIpmrJeXwVddILAq_cjKKc5iJEZ7G6LuYdumYWboNSIUy15yI"
                alt="Paciente"
                referrerpolicy="no-referrer"
                class="w-12 h-12 rounded-full object-cover border border-[#0056c3]"
              />
              <div>
                <h4 class="font-label-md text-[15px] font-bold text-[#001549]">{{ clinicalState.currentUser()?.name }}</h4>
                <span class="font-caption text-[12px] text-[#757682]">{{ clinicalState.currentUser()?.documentId }}</span>
              </div>
            </div>

            <div class="flex flex-col gap-2 text-[13px]">
              <div class="flex justify-between py-1 border-b border-[#f0f3ff]">
                <span class="text-[#757682]">Correo Registrado:</span>
                <span class="font-medium text-[#111c2c]">{{ clinicalState.currentUser()?.email }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-[#f0f3ff]">
                <span class="text-[#757682]">Teléfono:</span>
                <span class="font-medium text-[#111c2c]">{{ clinicalState.currentUser()?.phone }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-[#f0f3ff]">
                <span class="text-[#757682]">Convenio Aseguradora:</span>
                <span class="font-bold text-[#0056c3]">Póliza Sura Prepagada</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-[#757682]">Consentimiento Ley 1581:</span>
                <span class="font-bold text-[#0056c3]">Firmado Digitalmente</span>
              </div>
            </div>

            <button
              (click)="showProfileModal.set(false)"
              class="w-full py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all cursor-pointer mt-2"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 4: Simular Expiración de Sesión -->
    @if (showExpiredModal()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center gap-3 border border-[#e7eeff]">
          <div class="w-14 h-14 rounded-full bg-[#ffe168] text-[#6f5d00] flex items-center justify-center">
            <span class="material-symbols-outlined text-[32px]">schedule</span>
          </div>
          <h3 class="font-headline-md text-[18px] font-bold text-[#001549]">Sesión Expirada por Inactividad</h3>
          <p class="font-body-md text-[13px] text-[#444651]">
            Por protocolo de seguridad hospitalaria, su sesión se cerró tras superar el límite de tiempo sin actividad.
          </p>
          <button
            (click)="clinicalState.logout()"
            class="w-full py-3 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all cursor-pointer mt-2"
            type="button"
          >
            Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    }

    <!-- MODAL 5: Confirmar Logout -->
    @if (showLogoutConfirm()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center gap-3 border border-[#e7eeff]">
          <div class="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
            <span class="material-symbols-outlined text-[28px]">logout</span>
          </div>
          <h3 class="font-headline-md text-[18px] font-bold text-[#001549]">¿Desea Cerrar Sesión?</h3>
          <p class="font-body-md text-[13px] text-[#444651]">
            Sus datos clínicos están protegidos. Deberá iniciar sesión nuevamente para volver a acceder.
          </p>
          <div class="flex items-center gap-2 w-full pt-2">
            <button
              (click)="showLogoutConfirm.set(false)"
              class="flex-1 py-2.5 rounded-xl bg-[#f0f3ff] text-[#444651] font-label-md text-[13px] hover:bg-[#dee8ff] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              (click)="clinicalState.logout()"
              class="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] text-white font-label-md text-[13px] font-semibold hover:bg-[#93000a] transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PatientPortal {
  clinicalState = inject(ClinicalDataState);
  router = inject(Router);
  catalogApi = inject(CatalogApi);

  openBookingModal = signal(false);
  showDetailModal = signal(false);
  showProfileModal = signal(false);
  showExpiredModal = signal(false);
  showLogoutConfirm = signal(false);
  showFacilities = signal(false);

  selectedAppointment = signal<Appointment | null>(null);

  // Booking fields
  bookSpecialty = signal('Medicina General');
  bookFacility = signal<'HIC' | 'ICV'>('HIC');
  bookDoctor = signal('Dr. Carlos E. Santos');
  bookDate = signal(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  bookTime = signal('09:30 AM');
  availability = signal<AvailabilityItem[]>([]);
  selectedSlot = signal<AvailabilityItem | null>(null);
  bookingMessage = signal('');

  today() { return new Date().toISOString().slice(0, 10); }
  startBooking() { const date = new Date(); date.setDate(date.getDate() + 1); this.bookDate.set(date.toISOString().slice(0, 10)); this.openBookingModal.set(true); this.searchAvailability(); }

  primaryAppointment() {
    const apps = this.clinicalState.appointments();
    return apps.length > 0 ? apps[0] : null;
  }

  scrollToAppointments() {
    const el = document.getElementById('citas-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  openAppointmentDetail() {
    const first = this.primaryAppointment();
    if (first) {
      this.selectedAppointment.set(first);
      this.showDetailModal.set(true);
    }
  }

  handleBookAppointment(e: Event) {
    e.preventDefault();
    const slot = this.selectedSlot();
    if (!slot) { this.bookingMessage.set('Consulta y selecciona un horario disponible.'); return; }
    const specialtyId = this.specialtyId();
    const request = specialtyId === 1
      ? this.catalogApi.createGeneralAppointment(slot.slotId, specialtyId)
      : this.catalogApi.requestSpecializedAppointment(slot.slotId, specialtyId);
    request.subscribe({
      next: () => { this.bookingMessage.set('Cita creada correctamente.'); this.refreshAppointments(); this.openBookingModal.set(false); },
      error: err => this.bookingMessage.set(err.status === 409 ? 'El horario acaba de ser ocupado.' : 'No fue posible crear la cita.')
    });
    return;
    /* legacy visual fallback kept below for offline mock preview */
    const facName = this.bookFacility() === 'HIC' ? 'Hospital Internacional de Colombia' : 'Instituto Cardiovascular ICV';
    this.clinicalState.addAppointment({
      doctorName: this.bookDoctor(),
      specialty: this.bookSpecialty(),
      facility: this.bookFacility(),
      facilityFullName: facName,
      date: this.bookDate(),
      time: this.bookTime(),
      type: 'Presencial',
      status: 'Confirmada',
      preparationNote: 'Presentarse con 20 minutos de antelación con documento de identidad y orden médica.',
      room: 'Consultorio 301 • Piso 3',
    });
    this.openBookingModal.set(false);
  }

  searchAvailability() {
    const date = this.bookDate();
    this.bookingMessage.set('Consultando horarios…');
    this.catalogApi.availability({ date, specialtyId: this.specialtyId() }).subscribe({
      next: result => { this.availability.set(result.items); this.selectedSlot.set(result.items[0] ?? null); this.bookingMessage.set(result.items.length ? 'Selecciona un horario.' : 'No hay horarios disponibles para esa fecha.'); },
      error: () => { this.availability.set([]); this.bookingMessage.set('No fue posible consultar disponibilidad.'); }
    });
  }

  specialtyId() { const ids: Record<string, number> = { 'Medicina General': 1, 'Nefrología': 6, 'Urología': 7, 'Gastroenterología': 8, 'Neumología Adulto': 9, 'Ortopedia y Traumatología': 11, 'Endocrinología': 10, 'Neurología': 12 }; return ids[this.bookSpecialty()] ?? 1; }

  selectSlot(id: string) { this.selectedSlot.set(this.availability().find(slot => String(slot.slotId) === id) ?? null); }

  cancelActiveAppointment(id: string) {
    this.catalogApi.cancelAppointment(Number(id)).subscribe({ next: () => { this.refreshAppointments(); this.showDetailModal.set(false); }, error: () => this.bookingMessage.set('No fue posible cancelar la cita.') });
  }

  refreshAppointments() { this.catalogApi.myAppointments().subscribe({ next: items => this.clinicalState.setAppointmentsFromApi(items) }); }
}
