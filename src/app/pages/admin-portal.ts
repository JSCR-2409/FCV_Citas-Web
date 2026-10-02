import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClinicalDataState } from '../services/clinical-data';
import { CatalogApi, RescheduleRequest, SpecializedRequest } from '../services/catalog-api';

export interface AdminModule {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  badgeColor: string;
  details: string[];
}

@Component({
  selector: 'app-admin-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="flex flex-col min-h-[calc(100vh-4rem)] w-full bg-[#f9f9ff]">
      
      <!-- Top Service Status Bar -->
      <aside class="w-full bg-[#001549] text-white py-2 px-4 sm:px-6 lg:px-8 border-b border-[#002777]">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div class="flex flex-wrap items-center gap-3 sm:gap-4">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[#cfdaf1]">Estado del Servicio: <strong class="text-white">Operativo</strong></span>
            </div>
            <span class="text-white/20 hidden sm:inline">|</span>
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-[#afc6ff]">lan</span>
              <span class="text-[#cfdaf1]">Sedes HIC &amp; ICV: <strong class="text-white">Conectadas</strong></span>
            </div>
            <span class="text-white/20 hidden sm:inline">|</span>
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-[#afc6ff]">lock</span>
              <span class="text-[#cfdaf1]">Cifrado: <strong class="text-white">SSL-256</strong></span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#dce1ff]">
              <span class="material-symbols-outlined text-[15px] text-[#ffe168]">timer</span>
              <span>Inactividad: <strong class="font-mono">{{ timerString() }}</strong></span>
              <button
                (click)="resetTimer()"
                class="ml-1 text-[#afc6ff] hover:text-white underline text-[11px] cursor-pointer"
                title="Reiniciar temporizador de seguridad"
              >
                Renovar
              </button>
            </div>
            <button
              (click)="clinicalState.logout()"
              class="px-2.5 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-semibold hover:bg-[#93000a] transition-colors cursor-pointer"
              type="button"
            >
              Desconectar
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col gap-6">
        
        <!-- Hero Header -->
        <section class="relative rounded-2xl bg-gradient-to-r from-[#001549] to-[#002777] text-white p-6 sm:p-8 shadow-md overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#006ef4]/20 blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div class="flex flex-col gap-1.5">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#afc6ff] text-[12px] font-semibold self-start">
                <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                <span>Dirección de Tecnología y Admisiones • Rol: Super-Admin</span>
              </div>
              <h1 class="font-headline-xl text-[26px] sm:text-[30px] font-bold text-white mt-1">
                Consola de Gestión Administrativa
              </h1>
              <p class="font-subtitle text-[14px] text-[#dee8ff] max-w-2xl">
                Supervisión centralizada de agendas, auditoría hospitalaria y control de disponibilidad institucional HIC e ICV.
              </p>
            </div>

            <!-- Telemetry Micro-Grid -->
            <div class="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 w-full lg:w-auto">
              <div class="flex flex-col px-3 py-1 text-center">
                <span class="font-micro text-[10px] uppercase text-[#afc6ff]">Pendientes Hoy</span>
                <span class="font-headline-md text-[20px] font-bold text-white">18</span>
                <span class="text-[10px] text-[#dce1ff]">Solicitudes</span>
              </div>
              <div class="flex flex-col px-3 py-1 text-center border-x border-white/15">
                <span class="font-micro text-[10px] uppercase text-[#afc6ff]">Sedes Activas</span>
                <span class="font-headline-md text-[20px] font-bold text-white">2 / 2</span>
                <span class="text-[10px] text-[#dce1ff]">HIC + ICV</span>
              </div>
              <div class="flex flex-col px-3 py-1 text-center">
                <span class="font-micro text-[10px] uppercase text-[#afc6ff]">Latencia API</span>
                <span class="font-headline-md text-[20px] font-bold text-emerald-300">38ms</span>
                <span class="text-[10px] text-[#dce1ff]">Núcleo Salud</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Governance Policy Notice -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e7eeff] flex items-start gap-3">
          <div class="w-9 h-9 rounded-lg bg-[#dee8ff] text-[#001549] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[20px]">policy</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-md text-[13px] text-[#001549] font-bold">Política de Acceso y Gestión Restringida (Nivel 4 de Auditoría)</span>
            <p class="font-caption text-[12px] text-[#444651] mt-0.5 leading-relaxed">
              Toda modificación sobre disponibilidad de agendas, apertura de cupos extraordinarios o bloqueo de consultorios queda registrada en la bitácora institucional bajo el identificador de operador <strong>ADM-PINEDA-638</strong>.
            </p>
          </div>
        </div>

        <!-- 6 Administrative Modules Grid -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="font-headline-md text-[18px] text-[#001549] font-bold">Módulos de Gestión Clínica</h2>
            <span class="font-caption text-[12px] text-[#757682]">Haga clic en cualquier módulo para gestionar</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (mod of modules; track mod.id) {
              <button
                type="button"
                (click)="openModule(mod)"
                class="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] hover:shadow-md hover:border-[#afc6ff] transition-all flex flex-col justify-between gap-4 cursor-pointer group text-left w-full"
              >
                <div class="flex flex-col gap-2.5">
                  <div class="flex items-center justify-between">
                    <div class="w-11 h-11 rounded-xl bg-[#f0f3ff] text-[#0056c3] flex items-center justify-center group-hover:bg-[#0056c3] group-hover:text-white transition-colors">
                      <span class="material-symbols-outlined text-[24px]">{{ mod.icon }}</span>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold" [class]="mod.badgeColor">
                      {{ mod.badge }}
                    </span>
                  </div>
                  <div>
                    <h3 class="font-headline-md text-[16px] text-[#001549] font-bold group-hover:text-[#0056c3] transition-colors">
                      {{ mod.title }}
                    </h3>
                    <p class="font-caption text-[12px] text-[#444651] mt-1 leading-snug">
                      {{ mod.description }}
                    </p>
                  </div>
                </div>

                <div class="pt-2 border-t border-[#f0f3ff] flex items-center justify-between text-[12px] text-[#0056c3] font-semibold w-full">
                  <span>Administrar Módulo</span>
                  <span class="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
              </button>
            }
          </div>
        </section>

        <!-- Recent Administrative Activity Feed -->
        <section class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eeff] flex flex-col gap-4">
          <div class="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#0056c3] text-[20px]">history</span>
              <h3 class="font-headline-md text-[17px] text-[#001549] font-bold">Actividad Administrativa Reciente</h3>
            </div>
            <span class="font-caption text-[12px] text-[#757682]">Últimas 24 horas</span>
          </div>

          <div class="flex flex-col divide-y divide-[#f0f3ff]">
            <div class="py-3 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div class="flex flex-col">
                  <span class="font-label-md text-[13px] text-[#001549] font-semibold">Orden Especial #ORD-9842 Aprobada</span>
                  <span class="font-caption text-[11px] text-[#757682]">Paciente Sofía Restrepo • Ecocardiograma ICV</span>
                </div>
              </div>
              <span class="font-caption text-[11px] text-[#757682]">Hace 4 min</span>
            </div>

            <div class="py-3 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full bg-[#006ef4]"></span>
                <div class="flex flex-col">
                  <span class="font-label-md text-[13px] text-[#001549] font-semibold">Bloqueo por Comisión Quirúrgica Dr. Morales</span>
                  <span class="font-caption text-[11px] text-[#757682]">Franja 11:30 - 12:30 reservada para procedimiento UCI</span>
                </div>
              </div>
              <span class="font-caption text-[11px] text-[#757682]">Hace 18 min</span>
            </div>

            <div class="py-3 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full bg-[#ffe168]"></span>
                <div class="flex flex-col">
                  <span class="font-label-md text-[13px] text-[#001549] font-semibold">Sincronización Tarifaria EPS Sura</span>
                  <span class="font-caption text-[11px] text-[#757682]">34 códigos de procedimiento actualizados con manual tarifario 2024</span>
                </div>
              </div>
              <span class="font-caption text-[11px] text-[#757682]">Hace 42 min</span>
            </div>
          </div>
        </section>

      </main>

      <!-- Footer -->
      <footer class="w-full bg-[#f0f3ff] py-4 border-t border-[#e7eeff] mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p class="font-caption text-[12px] text-[#444651]">
            © 2024 Portal de Citas HIC &amp; ICV • Consola de Gestión Gubernamental y Seguridad Clínica.
          </p>
          <div class="flex items-center gap-4">
            <span class="font-caption text-[12px] text-[#0056c3] font-semibold">Auditoría Nivel 4 Activa</span>
            <span class="text-[#c5c6d3]">•</span>
            <span class="font-caption text-[12px] text-[#444651]">Servidores Floridablanca</span>
          </div>
        </div>
      </footer>
    </div>

    <!-- MODAL: Inspección de Módulo Administrativo -->
    @if (selectedModule(); as mod) {
      <div class="fixed inset-0 z-50 bg-[#001549]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7eeff] overflow-hidden flex flex-col">
          <div class="px-6 py-4 bg-[#001549] text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[22px] text-[#afc6ff]">{{ mod.icon }}</span>
              <h3 class="font-headline-md text-[17px] font-bold text-white">{{ mod.title }}</h3>
            </div>
            <button (click)="selectedModule.set(null)" class="text-[#dee8ff] hover:bg-white/10 w-8 h-8 rounded flex items-center justify-center cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <span class="text-[13px] text-[#444651]">{{ mod.description }}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold" [class]="mod.badgeColor">
                {{ mod.badge }}
              </span>
            </div>

            @if (mod.id === 'solicitudes') {
              <div class="flex flex-col gap-2">
                <span class="font-label-md text-[13px] text-[#001549] font-bold">Solicitudes pendientes de decisión:</span>

                @if (decisionNotice()) {
                  <p class="p-3 rounded-xl bg-[#e6f6ec] text-[#14532d] text-[12px] border border-[#bbe5c8]" role="status">
                    {{ decisionNotice() }}
                  </p>
                }
                @if (decisionError()) {
                  <p class="p-3 rounded-xl bg-[#fdecec] text-[#7f1d1d] text-[12px] border border-[#f5c2c2]" role="alert">
                    {{ decisionError() }}
                  </p>
                }

                @if (loadingRequests()) {
                  <p class="p-3 text-[12px] text-[#444651]">Cargando solicitudes…</p>
                } @else if (specializedRequests().length === 0) {
                  <p class="p-3 rounded-xl bg-[#f0f3ff] text-[12px] text-[#444651] border border-[#e7eeff]">
                    No hay solicitudes especializadas pendientes.
                  </p>
                } @else {
                  @for (req of specializedRequests(); track req.id) {
                    <div class="p-3 rounded-xl bg-[#f0f3ff] flex flex-col gap-2 text-[12px] border border-[#e7eeff]">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-col">
                          <span class="text-[#111c2c] font-bold">#{{ req.id }} · {{ req.patientName }}</span>
                          <span class="text-[#444651]">
                            {{ req.specialtyName }} · {{ req.durationMinutes }} min · {{ req.locationName }}
                          </span>
                          <span class="text-[#444651]">
                            {{ req.startAt }} — profesional {{ req.professionalCode }}
                          </span>
                        </div>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            [disabled]="busyId() === req.id"
                            (click)="approve(req.id)"
                            class="px-2.5 py-1 rounded bg-[#0056c3] text-white font-semibold text-[11px] hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            [disabled]="busyId() === req.id"
                            (click)="startReject(req.id)"
                            class="px-2.5 py-1 rounded bg-white text-[#7f1d1d] border border-[#f5c2c2] font-semibold text-[11px] hover:bg-[#fdecec] disabled:opacity-50 cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>

                      @if (rejectingId() === req.id) {
                        <div class="flex flex-col gap-2 pt-2 border-t border-[#e7eeff]">
                          <label class="text-[11px] font-bold text-[#001549]" [attr.for]="'motivo-' + req.id">
                            Motivo del rechazo (obligatorio)
                          </label>
                          <input
                            [id]="'motivo-' + req.id"
                            type="text"
                            [value]="rejectReason()"
                            (input)="rejectReason.set($any($event.target).value)"
                            class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]"
                            placeholder="Indique por qué se rechaza la solicitud"
                          />
                          <div class="flex gap-2 justify-end">
                            <button
                              type="button"
                              (click)="cancelReject()"
                              class="px-3 py-1.5 rounded bg-white text-[#111c2c] border border-[#e7eeff] text-[11px] font-semibold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              [disabled]="rejectReason().trim().length === 0 || busyId() === req.id"
                              (click)="confirmReject(req.id)"
                              class="px-3 py-1.5 rounded bg-[#b91c1c] text-white text-[11px] font-semibold hover:bg-[#dc2626] disabled:opacity-50 cursor-pointer"
                            >
                              Confirmar rechazo
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            } @else if (mod.id === 'reagendamientos') {
              <!-- HU-029 y HU-030: bandeja de reprogramaciones con comparación de franjas -->
              <div class="flex flex-col gap-2">
                <span class="font-label-md text-[13px] text-[#001549] font-bold">Reprogramaciones pendientes:</span>

                @if (decisionNotice()) {
                  <p class="p-3 rounded-xl bg-[#e6f6ec] text-[#14532d] text-[12px] border border-[#bbe5c8]" role="status">
                    {{ decisionNotice() }}
                  </p>
                }
                @if (decisionError()) {
                  <p class="p-3 rounded-xl bg-[#fdecec] text-[#7f1d1d] text-[12px] border border-[#f5c2c2]" role="alert">
                    {{ decisionError() }}
                  </p>
                }

                @if (loadingReschedules()) {
                  <p class="p-3 text-[12px] text-[#444651]">Cargando reprogramaciones…</p>
                } @else if (rescheduleRequests().length === 0) {
                  <p class="p-3 rounded-xl bg-[#f0f3ff] text-[12px] text-[#444651] border border-[#e7eeff]">
                    No hay reprogramaciones pendientes.
                  </p>
                } @else {
                  @for (req of rescheduleRequests(); track req.id) {
                    <div class="p-3 rounded-xl bg-[#f0f3ff] flex flex-col gap-2 text-[12px] border border-[#e7eeff]">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-col">
                          <span class="text-[#111c2c] font-bold">#{{ req.id }} · {{ req.patientName }}</span>
                          <span class="text-[#444651]">
                            {{ req.specialtyName }} · {{ req.durationMinutes }} min · {{ req.professionalName }}
                            ({{ req.professionalCode }})
                          </span>
                          <span class="text-[#444651]">{{ req.locationName }}</span>
                        </div>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            [disabled]="busyId() === req.id"
                            (click)="approveReschedule(req.id)"
                            class="px-2.5 py-1 rounded bg-[#0056c3] text-white font-semibold text-[11px] hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            [disabled]="busyId() === req.id"
                            (click)="startRejectReschedule(req.id)"
                            class="px-2.5 py-1 rounded bg-white text-[#7f1d1d] border border-[#f5c2c2] font-semibold text-[11px] hover:bg-[#fdecec] disabled:opacity-50 cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-[#e7eeff]">
                        <div class="flex flex-col">
                          <span class="text-[10px] uppercase text-[#757682] font-semibold">Franja actual</span>
                          <span class="text-[#111c2c] font-medium">
                            {{ req.previousStartAt | date:'dd/MM/yyyy HH:mm' }}
                          </span>
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[10px] uppercase text-[#757682] font-semibold">Franja propuesta</span>
                          <span class="text-[#0056c3] font-bold">
                            {{ req.requestedStartAt | date:'dd/MM/yyyy HH:mm' }}
                          </span>
                        </div>
                      </div>

                      @if (rejectingRescheduleId() === req.id) {
                        <div class="flex flex-col gap-2 pt-2 border-t border-[#e7eeff]">
                          <label class="text-[11px] font-bold text-[#001549]" [attr.for]="'motivo-rp-' + req.id">
                            Motivo del rechazo (obligatorio)
                          </label>
                          <input
                            [id]="'motivo-rp-' + req.id"
                            type="text"
                            [value]="rejectReason()"
                            (input)="rejectReason.set($any($event.target).value)"
                            class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]"
                            placeholder="Indique por qué no procede la reprogramación"
                          />
                          <div class="flex gap-2 justify-end">
                            <button
                              type="button"
                              (click)="cancelReject()"
                              class="px-3 py-1.5 rounded bg-white text-[#111c2c] border border-[#e7eeff] text-[11px] font-semibold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              [disabled]="rejectReason().trim().length === 0 || busyId() === req.id"
                              (click)="confirmRejectReschedule(req.id)"
                              class="px-3 py-1.5 rounded bg-[#b91c1c] text-white text-[11px] font-semibold hover:bg-[#dc2626] disabled:opacity-50 cursor-pointer"
                            >
                              Confirmar rechazo
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            } @else {
              <div class="flex flex-col gap-2">
                <span class="font-label-md text-[13px] text-[#001549] font-bold">Registros del Módulo:</span>
                @for (item of mod.details; track item) {
                  <div class="p-3 rounded-xl bg-[#f0f3ff] flex items-center justify-between text-[12px] border border-[#e7eeff]">
                    <span class="text-[#111c2c] font-medium">{{ item }}</span>
                  </div>
                }
              </div>
            }

            <div class="flex justify-end gap-3 pt-3 border-t border-[#e7eeff]">
              <button
                type="button"
                (click)="selectedModule.set(null)"
                class="px-6 py-2.5 rounded-xl bg-[#001549] text-white font-label-md text-[13px] font-semibold hover:bg-[#002777] cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminPortal implements OnInit, OnDestroy {
  clinicalState = inject(ClinicalDataState);
  private catalogApi = inject(CatalogApi);
  specializedRequests = signal<SpecializedRequest[]>([]);
  loadingRequests = signal(false);
  rescheduleRequests = signal<RescheduleRequest[]>([]);
  loadingReschedules = signal(false);
  rejectingRescheduleId = signal<number | null>(null);
  busyId = signal<number | null>(null);
  rejectingId = signal<number | null>(null);
  rejectReason = signal('');
  decisionNotice = signal<string | null>(null);
  decisionError = signal<string | null>(null);

  remainingSeconds = signal(14 * 60 + 59);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  selectedModule = signal<AdminModule | null>(null);

  modules: AdminModule[] = [
    {
      id: 'solicitudes',
      title: 'Solicitudes de Citas',
      badge: '6 Prioritarias',
      description: 'Gestión de cupos directos y autorizaciones especiales de aseguradoras.',
      icon: 'inbox',
      badgeColor: 'bg-[#ffdad6] text-[#ba1a1a]',
      details: [
        '#SOL-8819: Elena Vargas Ruiz - Ecocardiograma Transesofágico (Sura)',
        '#SOL-8820: Carlos Julio Vega - Holter 24 horas (Nueva EPS)',
        '#SOL-8821: Lucía Fernanda Gómez - Consulta Genética HIC',
      ],
    },
    {
      id: 'reagendamientos',
      title: 'Reagendamientos y Cancelaciones',
      badge: 'Contingencias',
      description: 'Alertas por inasistencias de pacientes o cambios de turno médico.',
      icon: 'update',
      badgeColor: 'bg-[#ffe168] text-[#4c3f00]',
      details: [
        '#REAG-201: Dra. Sandra Pérez - Reubicación turno mañana',
        '#REAG-202: 4 Pacientes por mantenimiento de Resonador 3T',
      ],
    },
    {
      id: 'profesionales',
      title: 'Directorio de Profesionales',
      badge: '142 Activos',
      description: 'Asignación de consultorios y turnos en red HIC e ICV.',
      icon: 'badge',
      badgeColor: 'bg-[#dee8ff] text-[#001549]',
      details: [
        'Dr. Alejandro Morales - Cardiología Clínica (Consultorio 402 ICV)',
        'Dr. Carlos E. Santos - Cardiología Adultos (Consultorio 301 HIC)',
        'Dra. Marcela Silva - Coordinación Consulta Externa',
      ],
    },
    {
      id: 'especialidades',
      title: 'Catálogo de Especialidades',
      badge: '38 Servicios',
      description: 'Cardiología, Oncología, Neurología, Cirugía Robótica y Pediatría.',
      icon: 'category',
      badgeColor: 'bg-[#f0f3ff] text-[#0056c3]',
      details: [
        'Cardiología Clínica y Fisiología Cardiovascular',
        'Cirugía Cardiovascular y Torácica de Alta Complejidad',
        'Unidad de Diagnóstico No Invasivo HIC',
      ],
    },
    {
      id: 'convenios',
      title: 'Convenios EPS y Planes',
      badge: '24 Entidades',
      description: 'Sura, Sanitas, Colsánitas, Seguros Bolívar y planes particulares.',
      icon: 'handshake',
      badgeColor: 'bg-[#dee8ff] text-[#0056c3]',
      details: [
        'Sura Medicina Prepagada - Sincronización Automática API',
        'Sanitas EPS - Cupos autorizados en línea',
        'Seguros Bolívar - Pólizas de Salud Internacional',
      ],
    },
    {
      id: 'auditoria',
      title: 'Pistas de Auditoría y Trazabilidad',
      badge: 'En Integración',
      description: 'Registro inmutable de transacciones, aperturas de turno y accesos.',
      icon: 'security',
      badgeColor: 'bg-[#e7eeff] text-[#111c2c]',
      details: [
        'Token MED-ICV-7740: 12 Accesos a Historia Clínica auditados',
        'Cambio de agenda #AG-8819 registrado con firma digital',
      ],
    },
  ];

  ngOnInit() {
    this.loadRequests();
    this.loadReschedules();
    this.timerInterval = setInterval(() => {
      this.remainingSeconds.update((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  timerString() {
    const total = this.remainingSeconds();
    const min = Math.floor(total / 60).toString().padStart(2, '0');
    const sec = (total % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  resetTimer() {
    this.remainingSeconds.set(15 * 60);
  }

  openModule(mod: AdminModule) {
    this.selectedModule.set(mod);
  }

  /** HU-027: la bandeja muestra solo las solicitudes REQUESTED que entrega el backend. */
  loadRequests() {
    this.loadingRequests.set(true);
    this.catalogApi.specializedRequests().subscribe({
      next: requests => {
        this.specializedRequests.set(requests);
        this.loadingRequests.set(false);
        const module = this.modules.find(item => item.id === 'solicitudes');
        if (module) module.badge = `${requests.length} Pendientes`;
      },
      error: () => {
        this.specializedRequests.set([]);
        this.loadingRequests.set(false);
        this.decisionError.set('No fue posible cargar las solicitudes pendientes.');
      },
    });
  }

  /** HU-029: la bandeja muestra solo las reprogramaciones PENDING. */
  loadReschedules() {
    this.loadingReschedules.set(true);
    this.catalogApi.rescheduleRequests().subscribe({
      next: requests => {
        this.rescheduleRequests.set(requests);
        this.loadingReschedules.set(false);
        const module = this.modules.find(item => item.id === 'reagendamientos');
        if (module) module.badge = `${requests.length} Pendientes`;
      },
      error: () => {
        this.rescheduleRequests.set([]);
        this.loadingReschedules.set(false);
        this.decisionError.set('No fue posible cargar las reprogramaciones pendientes.');
      },
    });
  }

  /** HU-030 CA-01: aprobar libera la franja antigua y mueve la cita. */
  approveReschedule(id: number) {
    this.decideReschedule(id, 'APPROVED', undefined, `Reprogramación #${id} aprobada.`);
  }

  startRejectReschedule(id: number) {
    this.rejectingRescheduleId.set(id);
    this.rejectReason.set('');
    this.decisionError.set(null);
    this.decisionNotice.set(null);
  }

  /** HU-030 CA-02: el rechazo exige motivo, libera la propuesta y conserva la cita original. */
  confirmRejectReschedule(id: number) {
    const reason = this.rejectReason().trim();
    if (!reason) {
      this.decisionError.set('El motivo del rechazo es obligatorio.');
      return;
    }
    this.decideReschedule(id, 'REJECTED', reason, `Reprogramación #${id} rechazada.`);
  }

  private decideReschedule(id: number, status: 'APPROVED' | 'REJECTED', reason: string | undefined, notice: string) {
    this.busyId.set(id);
    this.decisionError.set(null);
    this.decisionNotice.set(null);
    this.catalogApi.decideReschedule(id, status, reason).subscribe({
      next: () => {
        this.busyId.set(null);
        this.rejectingRescheduleId.set(null);
        this.rejectReason.set('');
        this.decisionNotice.set(notice);
        this.loadReschedules();
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        const response = err as { status?: number; error?: { message?: string } };
        this.decisionError.set(
          response.status === 409
            ? 'La reprogramación ya fue resuelta por otra persona. Se recargó la bandeja.'
            : response.error?.message ?? 'No fue posible registrar la decisión.',
        );
        this.loadReschedules();
      },
    });
  }

  /** HU-028 CA-01: aprobar conserva la franja retenida. */
  approve(id: number) {
    this.decide(id, 'APPROVED', undefined, `Solicitud #${id} aprobada.`);
  }

  startReject(id: number) {
    this.rejectingId.set(id);
    this.rejectReason.set('');
    this.decisionError.set(null);
    this.decisionNotice.set(null);
  }

  cancelReject() {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  /** HU-028 CA-02: el rechazo exige motivo y libera la franja. */
  confirmReject(id: number) {
    const reason = this.rejectReason().trim();
    if (!reason) {
      this.decisionError.set('El motivo del rechazo es obligatorio.');
      return;
    }
    this.decide(id, 'REJECTED', reason, `Solicitud #${id} rechazada.`);
  }

  private decide(id: number, status: 'APPROVED' | 'REJECTED', reason: string | undefined, notice: string) {
    this.busyId.set(id);
    this.decisionError.set(null);
    this.decisionNotice.set(null);
    this.catalogApi.decideSpecializedRequest(id, status, reason).subscribe({
      next: () => {
        this.busyId.set(null);
        this.rejectingId.set(null);
        this.rejectReason.set('');
        this.decisionNotice.set(notice);
        this.loadRequests();
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        const response = err as { status?: number; error?: { message?: string } };
        this.decisionError.set(
          response.status === 409
            ? 'La solicitud ya fue resuelta por otra persona. Se recargó la bandeja.'
            : response.error?.message ?? 'No fue posible registrar la decisión.',
        );
        this.loadRequests();
      },
    });
  }
}

