import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClinicalDataState } from '../services/clinical-data';
import {
  AdminProfessional, AdminSpecialty, CatalogApi, LocationItem, RescheduleRequest, SpecializedRequest,
} from '../services/catalog-api';

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
            } @else if (mod.id === 'especialidades') {
              <!-- HU-012: alta, duración restringida a 30 o 60 y desactivación sin borrar -->
              <div class="flex flex-col gap-3">
                @if (decisionNotice()) {
                  <p class="p-3 rounded-xl bg-[#e6f6ec] text-[#14532d] text-[12px] border border-[#bbe5c8]" role="status">{{ decisionNotice() }}</p>
                }
                @if (decisionError()) {
                  <p class="p-3 rounded-xl bg-[#fdecec] text-[#7f1d1d] text-[12px] border border-[#f5c2c2]" role="alert">{{ decisionError() }}</p>
                }

                <div class="p-3 rounded-xl bg-[#f0f3ff] border border-[#e7eeff] flex flex-col gap-2">
                  <span class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Nueva especialidad</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <input [value]="spCode()" (input)="spCode.set($any($event.target).value)"
                      placeholder="Código" aria-label="Código"
                      class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="spName()" (input)="spName.set($any($event.target).value)"
                      placeholder="Nombre" aria-label="Nombre"
                      class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <select [value]="spDuration()" (change)="spDuration.set(Number($any($event.target).value))"
                      aria-label="Duración" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]">
                      <option [value]="30">30 minutos</option>
                      <option [value]="60">60 minutos</option>
                    </select>
                    <select [value]="spGeneral() ? 'true' : 'false'"
                      (change)="spGeneral.set($any($event.target).value === 'true')"
                      aria-label="Tipo" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]">
                      <option value="false">Especializada (requiere aprobación)</option>
                      <option value="true">General (aprobación automática)</option>
                    </select>
                  </div>
                  <div class="flex justify-end">
                    <button type="button" [disabled]="spCode().trim().length === 0 || spName().trim().length === 0"
                      (click)="createSpecialty()"
                      class="px-4 py-1.5 rounded bg-[#0056c3] text-white text-[11px] font-semibold hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer">
                      Crear
                    </button>
                  </div>
                </div>

                @if (specialties().length === 0) {
                  <p class="p-3 rounded-xl bg-[#f0f3ff] text-[12px] text-[#444651] border border-[#e7eeff]">Sin especialidades registradas.</p>
                } @else {
                  @for (sp of specialties(); track sp.id) {
                    <div class="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-[12px]"
                      [class]="sp.active ? 'bg-[#f0f3ff] border-[#e7eeff]' : 'bg-white border-[#f0d5a8]'">
                      <div class="flex flex-col">
                        <span class="text-[#111c2c] font-bold">{{ sp.name }} <span class="font-normal text-[#757682]">({{ sp.code }})</span></span>
                        <span class="text-[#444651]">
                          {{ sp.durationMinutes }} min · {{ sp.general ? 'General' : 'Especializada' }}
                          @if (!sp.active) { · <span class="text-[#7c4a03] font-semibold">desactivada</span> }
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button type="button" (click)="toggleDuration(sp)"
                          class="px-2.5 py-1 rounded bg-[#dee8ff] text-[#001549] text-[11px] font-semibold hover:bg-[#cfdaf1] cursor-pointer">
                          Pasar a {{ sp.durationMinutes === 30 ? 60 : 30 }} min
                        </button>
                        <button type="button" (click)="toggleSpecialtyActive(sp)"
                          class="px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                          [class]="sp.active ? 'bg-white text-[#7f1d1d] border border-[#f5c2c2] hover:bg-[#fdecec]' : 'bg-[#e6f6ec] text-[#14532d] border border-[#bbe5c8]'">
                          {{ sp.active ? 'Desactivar' : 'Reactivar' }}
                        </button>
                      </div>
                    </div>
                  }
                  <p class="text-[11px] text-[#757682]">
                    Las especialidades no se borran: se desactivan, para no perder las citas que las referencian.
                  </p>
                }
              </div>
            } @else if (mod.id === 'profesionales') {
              <!-- HU-013 alta, HU-014 especialidades y HU-015 sedes y estado -->
              <div class="flex flex-col gap-3">
                @if (decisionNotice()) {
                  <p class="p-3 rounded-xl bg-[#e6f6ec] text-[#14532d] text-[12px] border border-[#bbe5c8]" role="status">{{ decisionNotice() }}</p>
                }
                @if (decisionError()) {
                  <p class="p-3 rounded-xl bg-[#fdecec] text-[#7f1d1d] text-[12px] border border-[#f5c2c2]" role="alert">{{ decisionError() }}</p>
                }

                <div class="p-3 rounded-xl bg-[#f0f3ff] border border-[#e7eeff] flex flex-col gap-2">
                  <span class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Nuevo profesional</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <input [value]="prNames()" (input)="prNames.set($any($event.target).value)" placeholder="Nombres" aria-label="Nombres" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prSurnames()" (input)="prSurnames.set($any($event.target).value)" placeholder="Apellidos" aria-label="Apellidos" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prDocument()" (input)="prDocument.set($any($event.target).value)" placeholder="Documento" aria-label="Documento" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prEmail()" (input)="prEmail.set($any($event.target).value)" placeholder="Correo" type="email" aria-label="Correo" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prPhone()" (input)="prPhone.set($any($event.target).value)" placeholder="Teléfono" aria-label="Teléfono" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prCode()" (input)="prCode.set($any($event.target).value)" placeholder="Código profesional" aria-label="Código profesional" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prLicense()" (input)="prLicense.set($any($event.target).value)" placeholder="Matrícula" aria-label="Matrícula" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                    <input [value]="prPassword()" (input)="prPassword.set($any($event.target).value)" placeholder="Contraseña temporal (12+)" type="password" aria-label="Contraseña temporal" class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[12px]" />
                  </div>
                  <p class="text-[11px] text-[#757682]">
                    El profesional no se autorregistra: lo crea la coordinación. La contraseña nunca se devuelve ni se registra.
                  </p>
                  <div class="flex justify-end">
                    <button type="button" [disabled]="!professionalFormReady()" (click)="createProfessional()"
                      class="px-4 py-1.5 rounded bg-[#0056c3] text-white text-[11px] font-semibold hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer">
                      Crear profesional
                    </button>
                  </div>
                </div>

                @if (professionals().length === 0) {
                  <p class="p-3 rounded-xl bg-[#f0f3ff] text-[12px] text-[#444651] border border-[#e7eeff]">Sin profesionales registrados.</p>
                } @else {
                  @for (pro of professionals(); track pro.id) {
                    <div class="p-3 rounded-xl border flex flex-col gap-2 text-[12px]"
                      [class]="pro.active ? 'bg-[#f0f3ff] border-[#e7eeff]' : 'bg-white border-[#f0d5a8]'">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-col">
                          <span class="text-[#111c2c] font-bold">
                            {{ pro.name }} <span class="font-normal text-[#757682]">({{ pro.professionalCode }})</span>
                            @if (!pro.active) { <span class="text-[#7c4a03]">· inactivo</span> }
                          </span>
                          <span class="text-[#444651]">{{ pro.email }} · matrícula {{ pro.licenseNumber }}</span>
                          <span class="text-[#444651]">
                            Sedes: {{ pro.locations.length ? namesOf(pro.locations) : 'ninguna' }}
                          </span>
                          <span class="text-[#444651]">
                            Especialidades: {{ pro.specialties.length ? specialtyLabels(pro) : 'ninguna' }}
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button type="button" (click)="startAssign(pro)"
                            class="px-2.5 py-1 rounded bg-[#dee8ff] text-[#001549] text-[11px] font-semibold hover:bg-[#cfdaf1] cursor-pointer">
                            Asignar
                          </button>
                          <button type="button" (click)="toggleProfessionalActive(pro)"
                            class="px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                            [class]="pro.active ? 'bg-white text-[#7f1d1d] border border-[#f5c2c2] hover:bg-[#fdecec]' : 'bg-[#e6f6ec] text-[#14532d] border border-[#bbe5c8]'">
                            {{ pro.active ? 'Desactivar' : 'Reactivar' }}
                          </button>
                        </div>
                      </div>

                      @if (assigningId() === pro.id) {
                        <div class="flex flex-col gap-3 pt-2 border-t border-[#e7eeff]">
                          <div class="flex flex-col gap-1">
                            <span class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Sedes</span>
                            <div class="flex flex-wrap gap-3">
                              @for (loc of locations(); track loc.id) {
                                <label class="flex items-center gap-1.5">
                                  <input type="checkbox" [checked]="draftLocations().includes(loc.id)"
                                    (change)="toggleDraftLocation(loc.id)" />
                                  <span>{{ loc.name }}</span>
                                </label>
                              }
                            </div>
                          </div>

                          <div class="flex flex-col gap-1">
                            <span class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">
                              Especialidades — exactamente una principal
                            </span>
                            <div class="flex flex-col gap-1">
                              @for (sp of activeSpecialties(); track sp.id) {
                                <div class="flex items-center gap-3">
                                  <label class="flex items-center gap-1.5 min-w-[220px]">
                                    <input type="checkbox" [checked]="isDraftSpecialty(sp.id)"
                                      (change)="toggleDraftSpecialty(sp.id)" />
                                    <span>{{ sp.name }} ({{ sp.durationMinutes }} min)</span>
                                  </label>
                                  @if (isDraftSpecialty(sp.id)) {
                                    <label class="flex items-center gap-1.5 text-[#0056c3]">
                                      <input type="radio" name="primaria" [checked]="isDraftPrimary(sp.id)"
                                        (change)="setDraftPrimary(sp.id)" />
                                      <span>principal</span>
                                    </label>
                                  }
                                </div>
                              }
                            </div>
                          </div>

                          <div class="flex justify-end gap-2">
                            <button type="button" (click)="cancelAssign()"
                              class="px-3 py-1.5 rounded bg-white text-[#111c2c] border border-[#e7eeff] text-[11px] font-semibold cursor-pointer">
                              Cancelar
                            </button>
                            <button type="button" [disabled]="busyId() === pro.id" (click)="saveAssignments(pro.id)"
                              class="px-3 py-1.5 rounded bg-[#0056c3] text-white text-[11px] font-semibold hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer">
                              Guardar asignaciones
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            } @else if (mod.id === 'convenios' || mod.id === 'auditoria') {
              <div class="flex flex-col gap-2">
                <p class="p-3 rounded-xl bg-[#f0f3ff] text-[12px] text-[#444651] border border-[#e7eeff]">
                  @if (mod.id === 'convenios') {
                    Todavía no está disponible. Administrar EPS y sus planes corresponde a HU-010 y
                    HU-011, y la afiliación del paciente a HU-008; ninguna está implementada.
                  } @else {
                    Todavía no está disponible. El historial de cambios de estado corresponde a
                    HU-031, que aún no está implementada.
                  }
                </p>
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

  // HU-012 — especialidades
  specialties = signal<AdminSpecialty[]>([]);
  spCode = signal('');
  spName = signal('');
  spDuration = signal(30);
  spGeneral = signal(false);

  // HU-013, HU-014, HU-015 — profesionales
  professionals = signal<AdminProfessional[]>([]);
  locations = signal<LocationItem[]>([]);
  assigningId = signal<number | null>(null);
  draftLocations = signal<number[]>([]);
  draftSpecialties = signal<{ id: number; primary: boolean }[]>([]);
  prNames = signal('');
  prSurnames = signal('');
  prDocument = signal('');
  prEmail = signal('');
  prPhone = signal('');
  prCode = signal('');
  prLicense = signal('');
  prPassword = signal('');

  protected readonly Number = Number;
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
    this.loadSpecialties();
    this.loadProfessionals();
    this.catalogApi.locations().subscribe({ next: items => this.locations.set(items) });
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

  // ---------- HU-012: especialidades ----------

  loadSpecialties() {
    this.catalogApi.adminSpecialties().subscribe({
      next: items => {
        this.specialties.set(items);
        const module = this.modules.find(item => item.id === 'especialidades');
        if (module) module.badge = `${items.filter(s => s.active).length} Activas`;
      },
      error: () => this.decisionError.set('No fue posible cargar las especialidades.'),
    });
  }

  activeSpecialties() {
    return this.specialties().filter(sp => sp.active);
  }

  createSpecialty() {
    this.clearMessages();
    this.catalogApi.createSpecialty({
      code: this.spCode().trim().toUpperCase(),
      name: this.spName().trim(),
      durationMinutes: this.spDuration(),
      general: this.spGeneral(),
      requiresAdminApproval: !this.spGeneral(),
    }).subscribe({
      next: () => {
        this.decisionNotice.set('Especialidad creada.');
        this.spCode.set('');
        this.spName.set('');
        this.loadSpecialties();
      },
      error: (err: unknown) => this.decisionError.set(this.messageOf(err, 'No fue posible crear la especialidad.')),
    });
  }

  /** La duración solo admite 30 o 60, y el backend lo valida también al actualizar. */
  toggleDuration(specialty: AdminSpecialty) {
    this.patchSpecialty(specialty.id, { durationMinutes: specialty.durationMinutes === 30 ? 60 : 30 },
      `Duración de ${specialty.name} actualizada.`);
  }

  /** HU-012 CA-02: no se borra una especialidad referenciada; se desactiva. */
  toggleSpecialtyActive(specialty: AdminSpecialty) {
    this.patchSpecialty(specialty.id, { active: !specialty.active },
      specialty.active ? `${specialty.name} desactivada.` : `${specialty.name} reactivada.`);
  }

  private patchSpecialty(id: number, changes: { durationMinutes?: number; active?: boolean }, notice: string) {
    this.clearMessages();
    this.catalogApi.updateSpecialty(id, changes).subscribe({
      next: () => {
        this.decisionNotice.set(notice);
        this.loadSpecialties();
      },
      error: (err: unknown) => this.decisionError.set(this.messageOf(err, 'No fue posible actualizar la especialidad.')),
    });
  }

  // ---------- HU-013, HU-014, HU-015: profesionales ----------

  loadProfessionals() {
    this.catalogApi.adminProfessionals().subscribe({
      next: items => {
        this.professionals.set(items);
        const module = this.modules.find(item => item.id === 'profesionales');
        if (module) module.badge = `${items.filter(p => p.active).length} Activos`;
      },
      error: () => this.decisionError.set('No fue posible cargar los profesionales.'),
    });
  }

  professionalFormReady() {
    return [this.prNames(), this.prSurnames(), this.prDocument(), this.prEmail(), this.prPhone(),
      this.prCode(), this.prLicense()].every(value => value.trim().length > 0)
      && this.prPassword().length >= 12;
  }

  /** HU-013: solo el ADMIN crea profesionales; no hay autorregistro. */
  createProfessional() {
    this.clearMessages();
    this.catalogApi.createProfessional({
      names: this.prNames().trim(),
      surnames: this.prSurnames().trim(),
      documentType: 'CC',
      documentNumber: this.prDocument().trim(),
      email: this.prEmail().trim(),
      phone: this.prPhone().trim(),
      temporaryPassword: this.prPassword(),
      professionalCode: this.prCode().trim().toUpperCase(),
      licenseNumber: this.prLicense().trim(),
    }).subscribe({
      next: () => {
        this.decisionNotice.set('Profesional creado. Debe asignarle sedes y especialidades para que pueda publicar agenda.');
        for (const field of [this.prNames, this.prSurnames, this.prDocument, this.prEmail,
          this.prPhone, this.prCode, this.prLicense, this.prPassword]) field.set('');
        this.loadProfessionals();
      },
      error: (err: unknown) => this.decisionError.set(this.messageOf(err, 'No fue posible crear el profesional.')),
    });
  }

  startAssign(professional: AdminProfessional) {
    this.assigningId.set(professional.id);
    this.draftLocations.set(professional.locations.map(l => l.id));
    this.draftSpecialties.set(professional.specialties.map(s => ({ id: s.id, primary: s.primary })));
    this.clearMessages();
  }

  cancelAssign() {
    this.assigningId.set(null);
  }

  toggleDraftLocation(id: number) {
    const current = this.draftLocations();
    this.draftLocations.set(current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  isDraftSpecialty(id: number) {
    return this.draftSpecialties().some(s => s.id === id);
  }

  isDraftPrimary(id: number) {
    return this.draftSpecialties().some(s => s.id === id && s.primary);
  }

  toggleDraftSpecialty(id: number) {
    const current = this.draftSpecialties();
    if (current.some(s => s.id === id)) {
      const remaining = current.filter(s => s.id !== id);
      // Si se quita la principal, la primera que quede toma el relevo: HU-014 CA-02 exige
      // exactamente una, y el backend rechaza cero o varias.
      if (remaining.length > 0 && !remaining.some(s => s.primary)) remaining[0] = { ...remaining[0], primary: true };
      this.draftSpecialties.set(remaining);
    } else {
      this.draftSpecialties.set([...current, { id, primary: current.length === 0 }]);
    }
  }

  setDraftPrimary(id: number) {
    this.draftSpecialties.set(this.draftSpecialties().map(s => ({ ...s, primary: s.id === id })));
  }

  /** HU-014 y HU-015: dos llamadas distintas, porque son endpoints distintos del contrato. */
  saveAssignments(professionalId: number) {
    this.busyId.set(professionalId);
    this.clearMessages();
    this.catalogApi.assignLocations(professionalId, this.draftLocations()).subscribe({
      next: () => {
        const specialties = this.draftSpecialties();
        if (specialties.length === 0) {
          this.busyId.set(null);
          this.assigningId.set(null);
          this.decisionNotice.set('Sedes actualizadas. No se asignó ninguna especialidad.');
          this.loadProfessionals();
          return;
        }
        this.catalogApi.assignSpecialties(professionalId, specialties).subscribe({
          next: () => {
            this.busyId.set(null);
            this.assigningId.set(null);
            this.decisionNotice.set('Sedes y especialidades actualizadas.');
            this.loadProfessionals();
          },
          error: (err: unknown) => {
            this.busyId.set(null);
            this.decisionError.set(this.messageOf(err, 'No fue posible asignar las especialidades.'));
            this.loadProfessionals();
          },
        });
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.decisionError.set(this.messageOf(err, 'No fue posible asignar las sedes.'));
      },
    });
  }

  /** HU-015 CA-03: un profesional desactivado deja de ofrecerse y no puede publicar agenda. */
  toggleProfessionalActive(professional: AdminProfessional) {
    this.busyId.set(professional.id);
    this.clearMessages();
    this.catalogApi.setProfessionalActive(professional.id, !professional.active).subscribe({
      next: () => {
        this.busyId.set(null);
        this.decisionNotice.set(professional.active
          ? `${professional.name} desactivado: deja de ofrecerse en disponibilidad.`
          : `${professional.name} reactivado.`);
        this.loadProfessionals();
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.decisionError.set(this.messageOf(err, 'No fue posible cambiar el estado.'));
      },
    });
  }

  namesOf(items: { name: string }[]) {
    return items.map(item => item.name).join(', ');
  }

  specialtyLabels(professional: AdminProfessional) {
    return professional.specialties
      .map(s => s.primary ? `${s.name} (principal)` : s.name)
      .join(', ');
  }

  private clearMessages() {
    this.decisionNotice.set(null);
    this.decisionError.set(null);
  }

  private messageOf(err: unknown, fallback: string): string {
    const response = err as { status?: number; error?: { message?: string } };
    if (response.error?.message) return response.error.message;
    if (response.status === 409) return 'Ya existe un registro con esos identificadores.';
    if (response.status === 400) return 'Datos inválidos: revise el formulario.';
    return fallback;
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

