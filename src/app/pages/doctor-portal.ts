import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ClinicalDataState } from '../services/clinical-data';

interface PatientRecord {
  id: string;
  name: string;
  docId: string;
  age: number;
  time: string;
  type: string;
  insurance: string;
  status: 'Llamado' | 'En Espera' | 'Atendido';
  photoUrl: string;
}

@Component({
  selector: 'app-doctor-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] w-full">
      
      <!-- Left Sidebar -->
      <aside class="w-full lg:w-64 bg-[#001549] text-white p-5 flex flex-col justify-between shadow-xl flex-shrink-0">
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-1 pb-4 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#afc6ff] text-[22px]">stethoscope</span>
              <span class="font-headline-md text-[16px] text-white font-bold tracking-tight">Panel Médico</span>
            </div>
            <span class="font-micro text-[10px] uppercase tracking-wider text-[#dee8ff]">Instituto Cardiovascular ICV</span>
            <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-[#dce1ff] text-[11px] font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#006ef4]"></span>
              <span>PROFESIONAL DE LA SALUD</span>
            </div>
          </div>

          <nav class="flex flex-col gap-1.5" aria-label="Menú médico">
            <button
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all cursor-pointer text-left"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">calendar_today</span>
              <span>Agenda de Consultas</span>
            </button>

            <button
              (click)="showAgendaModal.set(true)"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-[#dce1ff] hover:bg-white/10 hover:text-white font-label-md text-[13px] transition-all cursor-pointer text-left"
              type="button"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">patient_list</span>
                <span>Pacientes del Día</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-[#006ef4] text-white text-[11px] font-bold">8</span>
            </button>

            <button
              (click)="openPatientRecord()"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#dce1ff] hover:bg-white/10 hover:text-white font-label-md text-[13px] transition-all cursor-pointer text-left"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">clinical_notes</span>
              <span>Historia Clínica</span>
            </button>

            <button
              (click)="toggleAvailability()"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#dce1ff] hover:bg-white/10 hover:text-white font-label-md text-[13px] transition-all cursor-pointer text-left"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">manage_history</span>
              <span>Disponibilidad</span>
            </button>
          </nav>
        </div>

        <div class="pt-6 border-t border-white/10 flex flex-col gap-2">
          <div class="flex items-center justify-between px-2 text-[11px] text-[#dee8ff]">
            <span>Token Clínico:</span>
            <strong class="font-mono text-[#afc6ff]">MED-ICV-7740</strong>
          </div>
          <button
            (click)="clinicalState.logout()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-[#ffdad6] hover:bg-[#ba1a1a]/20 text-[12px] font-semibold transition-colors cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>Cerrar Turno Médico</span>
          </button>
        </div>
      </aside>

      <!-- Main Body -->
      <div class="flex-1 flex flex-col bg-[#f9f9ff] overflow-y-auto">
        
        <!-- Header Strip -->
        <header class="w-full bg-white px-6 py-3.5 border-b border-[#e7eeff] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#001549] text-[12px] font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#0056c3] animate-pulse"></span>
              <span>Conexión Biomédica Activa • Red ICV</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" [class]="consultationActive() ? 'bg-[#ffe168] text-[#4c3f00]' : 'bg-[#dee8ff] text-[#001549]'">
              {{ consultationActive() ? 'En Consulta Activa' : 'Consultorio Disponible' }}
            </span>

            <div class="flex items-center gap-2.5 pl-2 border-l border-[#c5c6d3]/40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL35ZtZEbH7xYXn1ig7lC1vhBl9wMZ7biHFHMy7aHx2VJhnFOLFHRQ8VaS4lZaUF257-xdxW1h6ybgmV5aPahDTDh-WXNu742R0jvyJeP2SGZNqzKk3RhK6D-VZxbEqvQvkTBUeOUWz578dEMGLhmS5_Nmgnu-YLQ4HR6Bl5F0H0wMqnOPXjCSHEh1oFditegEneXIpmrJeXwVddILAq_cjKKc5iJEZ7G6LuYdumYWboNSIUy15yI"
                alt="Dr. Alejandro Morales"
                referrerpolicy="no-referrer"
                class="w-9 h-9 rounded-full object-cover border-2 border-[#0056c3]"
              />
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] text-[#001549] font-bold leading-tight">Dr. Alejandro Morales</span>
                <span class="font-caption text-[11px] text-[#757682]">Cardiología Clínica • Consultorio 402</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Doctor Portal Body -->
        <main class="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
          
          <!-- Hero Banner -->
          <section class="relative rounded-2xl bg-gradient-to-r from-[#001549] to-[#002777] text-white p-6 sm:p-8 shadow-md overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#006ef4]/20 blur-2xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="flex flex-col gap-1">
                <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-[#afc6ff] text-[11px] font-semibold self-start">
                  <span class="material-symbols-outlined text-[15px]">medical_services</span>
                  <span>Turno Mañana: Activo (07:00 - 13:00)</span>
                </div>
                <h1 class="font-headline-xl text-[24px] sm:text-[28px] font-bold text-white mt-1">
                  Panel Médico • Dr. Alejandro Morales
                </h1>
                <p class="font-subtitle text-[14px] text-[#dee8ff]">
                  Especialista en Cardiología Clínica y Diagnóstico Cardiovascular No Invasivo.
                </p>
              </div>

              <div class="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex flex-col gap-1 border border-white/10 sm:min-w-[200px]">
                <span class="font-micro text-[10px] uppercase text-[#afc6ff]">Ubicación Actual</span>
                <span class="font-label-md text-[13px] font-bold text-white leading-tight">Instituto Cardiovascular</span>
                <span class="font-caption text-[11px] text-[#dee8ff]">Piso 4 • Consultorio 402</span>
              </div>
            </div>
          </section>

          <!-- 3 Clinical Metric Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <!-- Metric 1: Consultas Hoy -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-caption text-[11px] uppercase tracking-wider text-[#757682] font-semibold">Consultas Hoy</span>
                <span class="material-symbols-outlined text-[#0056c3] text-[20px]">groups</span>
              </div>
              <div class="my-3">
                <div class="flex items-baseline gap-2">
                  <span class="font-headline-xl text-[32px] text-[#001549] font-bold">8</span>
                  <span class="text-[13px] text-[#444651]">pacientes</span>
                </div>
                <div class="flex items-center gap-3 text-[12px] text-[#444651] mt-1">
                  <span class="text-[#0056c3] font-semibold">3 Atendidos</span>
                  <span>•</span>
                  <span class="text-[#ba1a1a] font-semibold">5 Pendientes</span>
                </div>
              </div>
              <div class="w-full bg-[#f0f3ff] h-2 rounded-full overflow-hidden">
                <div class="bg-[#0056c3] h-full rounded-full w-[37.5%]"></div>
              </div>
            </div>

            <!-- Metric 2: Próxima Consulta -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-caption text-[11px] uppercase tracking-wider text-[#757682] font-semibold">Próxima Consulta</span>
                <span class="material-symbols-outlined text-[#0056c3] text-[20px]">schedule</span>
              </div>
              <div class="my-3">
                <span class="font-headline-xl text-[28px] text-[#001549] font-bold">10:30 AM</span>
                <p class="font-caption text-[12px] text-[#444651] mt-0.5">
                  Paciente en Sala de Espera • <strong class="text-[#0056c3]">Turno #04</strong>
                </p>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-[#f0f3ff] text-[#0056c3] font-caption text-[11px] font-semibold self-start">
                Ecocardiograma Transesofágico
              </span>
            </div>

            <!-- Metric 3: Rendimiento Jornada -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-caption text-[11px] uppercase tracking-wider text-[#757682] font-semibold">Rendimiento Jornada</span>
                <span class="material-symbols-outlined text-[#0056c3] text-[20px]">donut_large</span>
              </div>
              <div class="my-2 flex items-center justify-between">
                <div>
                  <span class="font-headline-xl text-[26px] text-[#001549] font-bold">62%</span>
                  <p class="font-caption text-[11px] text-[#444651]">22 min promedio / consulta</p>
                </div>
                <!-- Mini Progress Ring -->
                <svg class="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="#f0f3ff" stroke-width="4" fill="transparent" />
                  <circle cx="24" cy="24" r="18" stroke="#0056c3" stroke-width="4" fill="transparent" stroke-dasharray="113" stroke-dashoffset="43" stroke-linecap="round" />
                </svg>
              </div>
              <span class="font-caption text-[11px] text-[#757682]">Finalización estimada: 12:45 PM</span>
            </div>

          </div>

          <!-- In-Office Patient Spotlight: Paciente Listo para Ingreso -->
          <section class="bg-white rounded-2xl p-6 shadow-md border-2 border-[#afc6ff] flex flex-col gap-5">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e7eeff]">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#0056c3] animate-ping"></span>
                <h2 class="font-headline-md text-[18px] text-[#001549] font-bold">Paciente Listo para Ingreso</h2>
              </div>
              <span class="px-3 py-1 rounded-full bg-[#dee8ff] text-[#001549] text-[12px] font-bold">
                Llamado a Consultorio: {{ calledStatus() ? 'Realizado' : 'Pendiente' }}
              </span>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAooDGeeBjXD5js4ukBFsvZeezLlQvXVDkRQbwR3OnFBVDOZ1_PHPLbD8a6I3DD6uqvsUiBp1ZNVuSdvvrfF8ur5VrhtwelcwOGLH8-2Gd8paARwe23NeGvNhfEeTXF2C43d1cqYRiBuXnI8J7l0887N_QCo-nDfqXVu7OtwEUaZnoICeS09i5OnZeUVV3meqeBrhs_c9d5f-LbQK3HcOErcfPAglJtIu4j3V9VCfX6WhKIXcBlpx8"
                  alt="Elena Vargas Ruiz"
                  referrerpolicy="no-referrer"
                  class="w-16 h-16 rounded-2xl object-cover border-2 border-[#0056c3] shadow-sm"
                />
                <div class="flex flex-col">
                  <span class="font-headline-md text-[18px] text-[#001549] font-bold">Elena Vargas Ruiz</span>
                  <span class="font-caption text-[12px] text-[#444651]">CC 37.892.104 • 62 años</span>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="font-caption text-[11px] px-2 py-0.5 rounded bg-[#f0f3ff] text-[#0056c3] font-semibold">
                      Sura EPS Plan Preferencial
                    </span>
                    <span class="font-caption text-[11px] text-[#757682]">Orden #ECO-2024-88</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  (click)="callPatient()"
                  [class]="calledStatus() ? 'bg-[#dee8ff] text-[#001549]' : 'bg-[#0056c3] text-white hover:bg-[#006ef4] shadow-md'"
                  class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-label-md text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  type="button"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ calledStatus() ? 'volume_up' : 'campaign' }}</span>
                  <span>{{ calledStatus() ? 'Volver a Llamar' : 'Llamar a Consultorio' }}</span>
                </button>

                <button
                  (click)="openPatientRecord()"
                  class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#001549] text-white font-label-md text-[13px] font-semibold hover:bg-[#002777] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  type="button"
                >
                  <span class="material-symbols-outlined text-[18px]">folder_shared</span>
                  <span>Abrir Historia Clínica</span>
                </button>
              </div>
            </div>

            <!-- Pre-consulta quick clinical summary -->
            <div class="p-3.5 rounded-xl bg-[#f0f3ff] grid grid-cols-1 sm:grid-cols-3 gap-3 border border-[#e7eeff] text-[12px]">
              <div>
                <span class="block text-[#757682] text-[11px]">Motivo de Consulta:</span>
                <strong class="text-[#001549]">Revisión Ecocardiograma Transesofágico</strong>
              </div>
              <div>
                <span class="block text-[#757682] text-[11px]">Antecedentes:</span>
                <strong class="text-[#001549]">Hipertensión Arterial, Insuficiencia Mitral Leve</strong>
              </div>
              <div>
                <span class="block text-[#757682] text-[11px]">Signos Vitales Triage:</span>
                <strong class="text-[#0056c3]">PA 125/82 • FC 68 lpm • SpO2 98%</strong>
              </div>
            </div>
          </section>

          <!-- Today's Schedule Table Preview -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eeff] flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="font-headline-md text-[17px] text-[#001549] font-bold">Listado de Citas del Día (Turno Mañana)</h3>
              <button
                (click)="showAgendaModal.set(true)"
                class="font-label-md text-[13px] text-[#0056c3] hover:underline cursor-pointer"
                type="button"
              >
                Ver Agenda Completa
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-[13px]">
                <thead class="bg-[#f0f3ff] text-[#757682] font-caption text-[11px] uppercase">
                  <tr>
                    <th class="p-3 rounded-l-lg">Hora</th>
                    <th class="p-3">Paciente</th>
                    <th class="p-3">Documento</th>
                    <th class="p-3">Procedimiento</th>
                    <th class="p-3">Convenio</th>
                    <th class="p-3 rounded-r-lg text-right">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#f0f3ff]">
                  @for (p of patients(); track p.id) {
                    <tr class="hover:bg-[#f9f9ff] transition-colors">
                      <td class="p-3 font-semibold text-[#001549]">{{ p.time }}</td>
                      <td class="p-3 font-bold text-[#111c2c]">{{ p.name }}</td>
                      <td class="p-3 text-[#757682]">{{ p.docId }}</td>
                      <td class="p-3 text-[#444651]">{{ p.type }}</td>
                      <td class="p-3 text-[#444651]">{{ p.insurance }}</td>
                      <td class="p-3 text-right">
                        <span
                          class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                          [class]="p.status === 'Atendido' ? 'bg-[#dee8ff] text-[#001549]' : p.status === 'Llamado' ? 'bg-[#ffe168] text-[#4c3f00]' : 'bg-[#f0f3ff] text-[#757682]'"
                        >
                          {{ p.status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- Institutional Notice -->
          <div class="bg-[#dee8ff]/50 rounded-xl p-4 flex items-center justify-between border border-[#dee8ff]">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[#0056c3] text-[22px]">info</span>
              <p class="font-caption text-[12px] text-[#001549]">
                <strong>Soporte de Coordinación Médica ICV:</strong> Si requiere reasignar turnos por urgencia quirúrgica o interconsulta en UCI, comuníquese con el interno 4010.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- MODAL: Historia Clínica -->
    @if (showClinicalModal()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7eeff] overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 bg-[#001549] text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[22px] text-[#afc6ff]">medical_information</span>
              <h3 class="font-headline-md text-[17px] font-bold text-white">Historia Clínica • Elena Vargas Ruiz</h3>
            </div>
            <button
              (click)="showClinicalModal.set(false)"
              class="w-8 h-8 rounded-lg text-[#dee8ff] hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 overflow-y-auto flex flex-col gap-4">
            <div class="p-4 rounded-xl bg-[#f0f3ff] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
              <div>
                <span class="text-[#757682] block text-[11px]">Edad / Sexo:</span>
                <strong class="text-[#111c2c]">62 Años • Femenino</strong>
              </div>
              <div>
                <span class="text-[#757682] block text-[11px]">Identificación:</span>
                <strong class="text-[#111c2c]">CC 37.892.104</strong>
              </div>
              <div>
                <span class="text-[#757682] block text-[11px]">Régimen:</span>
                <strong class="text-[#0056c3]">Sura Preferencial</strong>
              </div>
              <div>
                <span class="text-[#757682] block text-[11px]">Alergias:</span>
                <strong class="text-[#ba1a1a]">Penicilina</strong>
              </div>
            </div>

            <!-- Evolución médica -->
            <div class="flex flex-col gap-1.5">
              <label for="doctor-evolution-note" class="font-label-md text-[13px] text-[#001549] font-bold">Nota de Evolución Médica</label>
              <textarea
                id="doctor-evolution-note"
                class="w-full h-28 p-3 rounded-xl bg-[#f9f9ff] border border-[#c5c6d3]/60 text-[13px] outline-none focus:border-[#0056c3]"
                placeholder="Escriba la evolución clínica del paciente..."
              >Paciente acude a control post-ecocardiograma transesofágico. Se constata adecuada fracción de eyección ventricular izquierda (FEVI 58%). Sin signos de derrame pericárdico ni descompensación hemodinámica aguda.</textarea>
            </div>


            <!-- Formulación -->
            <div class="p-3.5 rounded-xl bg-[#dee8ff]/50 border border-[#dee8ff] flex flex-col gap-2">
              <span class="font-label-md text-[13px] text-[#001549] font-bold">Conducta &amp; Prescripción</span>
              <p class="font-caption text-[12px] text-[#444651]">
                Continuar Losartán 50mg cada 12h. Programar ecocardiograma de control en 6 meses y prueba de esfuerzo de rutina.
              </p>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showClinicalModal.set(false)"
                class="px-5 py-2 rounded-xl text-[#757682] text-[13px]"
              >
                Cerrar
              </button>
              <button
                type="button"
                (click)="saveEvolution()"
                class="px-6 py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] cursor-pointer"
              >
                Guardar y Firmar Consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: Agenda Completa -->
    @if (showAgendaModal()) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7eeff] p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
            <h3 class="font-headline-md text-[17px] font-bold text-[#001549]">Gestión de Agenda y Disponibilidad</h3>
            <button (click)="showAgendaModal.set(false)" class="text-[#757682] hover:text-[#001549] cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p class="font-body-md text-[13px] text-[#444651]">
            Turno programado: <strong>07:00 AM - 01:00 PM</strong> en Consultorio 402 del Instituto Cardiovascular.
          </p>
          <div class="p-3 bg-[#f0f3ff] rounded-xl flex items-center justify-between">
            <span class="text-[13px] font-medium text-[#111c2c]">Bloquear franja para interconsulta quirúrgica</span>
            <input type="checkbox" class="w-4 h-4 accent-[#0056c3] cursor-pointer" />
          </div>
          <button
            (click)="showAgendaModal.set(false)"
            class="w-full py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    }
  `,
})
export class DoctorPortal {
  clinicalState = inject(ClinicalDataState);

  consultationActive = signal(true);
  calledStatus = signal(false);
  showClinicalModal = signal(false);
  showAgendaModal = signal(false);

  patients = signal<PatientRecord[]>([
    { id: '1', name: 'Alfonso Gómez Moreno', docId: 'CC 13.984.210', age: 58, time: '08:00 AM', type: 'Consulta Cardiología', insurance: 'Sanitas EPS', status: 'Atendido', photoUrl: '' },
    { id: '2', name: 'Marta Cecilia Duarte', docId: 'CC 63.491.002', age: 49, time: '08:45 AM', type: 'Ecocardiograma Stress', insurance: 'Póliza Sura', status: 'Atendido', photoUrl: '' },
    { id: '3', name: 'Carlos Julio Vega', docId: 'CC 91.204.118', age: 71, time: '09:30 AM', type: 'Holter de Ritmo', insurance: 'Nueva EPS', status: 'Atendido', photoUrl: '' },
    { id: '4', name: 'Elena Vargas Ruiz', docId: 'CC 37.892.104', age: 62, time: '10:30 AM', type: 'Ecocardiograma Transesofágico', insurance: 'Sura Preferencial', status: 'Llamado', photoUrl: '' },
    { id: '5', name: 'Guillermo Peñaloza', docId: 'CC 88.192.304', age: 54, time: '11:15 AM', type: 'Valoración Pre-quirúrgica', insurance: 'Colmédica', status: 'En Espera', photoUrl: '' },
    { id: '6', name: 'Rosa Helena Barajas', docId: 'CC 28.391.009', age: 66, time: '11:45 AM', type: 'Control de Marcapasos', insurance: 'Salud Total', status: 'En Espera', photoUrl: '' },
    { id: '7', name: 'Javier Enrique Prada', docId: 'CC 1.098.441.902', age: 34, time: '12:15 PM', type: 'Ergometría', insurance: 'Sura EPS', status: 'En Espera', photoUrl: '' },
    { id: '8', name: 'Beatriz Suárez Otero', docId: 'CC 37.190.221', age: 60, time: '12:45 PM', type: 'Consulta Cardiología', insurance: 'Allianz', status: 'En Espera', photoUrl: '' },
  ]);

  callPatient() {
    this.calledStatus.set(true);
    // Play subtle audio chime or prompt
  }

  openPatientRecord() {
    this.showClinicalModal.set(true);
  }

  saveEvolution() {
    this.showClinicalModal.set(false);
    this.calledStatus.set(false);
  }

  toggleAvailability() {
    this.consultationActive.set(!this.consultationActive());
  }
}
