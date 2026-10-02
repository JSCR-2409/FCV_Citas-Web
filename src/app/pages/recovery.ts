import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../services/api-base-url';

@Component({
  selector: 'app-recovery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        
        <!-- Breadcrumb & Top Indicator -->
        <nav aria-label="Navegación de retorno" class="mb-6 flex flex-wrap items-center justify-between gap-2">
          <a
            routerLink="/login"
            class="inline-flex items-center gap-1.5 font-label-md text-[13px] text-[#0056c3] hover:text-[#001549] transition-colors group"
          >
            <span class="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
            <span>Regresar a Inicio de Sesión</span>
          </a>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#001549] font-caption text-[12px] font-semibold border border-[#e7eeff]">
            <span class="w-2 h-2 rounded-full bg-[#006ef4]"></span>
            <span>Seguridad de Credenciales SSL 256-bit</span>
          </div>
        </nav>

        <!-- Main 2-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <!-- Left Column: Context, Steps & Support (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-5">
            <div>
              <span class="font-micro text-[11px] uppercase tracking-wider text-[#0056c3] font-bold">Centro de Identidad / Acceso Clínico Protegido</span>
              <h1 class="font-headline-xl text-[26px] sm:text-[30px] text-[#001549] font-bold mt-1 leading-tight">
                Restablecer Credenciales de Acceso
              </h1>
              <p class="font-body-md text-[14px] text-[#444651] mt-2 leading-relaxed">
                Siga el protocolo institucional para renovar su contraseña de ingreso a los servicios clínicos ambulatorios y hospitalarios del HIC e ICV.
              </p>
            </div>

            <!-- Visual Guide of the 3 Steps -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] flex flex-col gap-4">
              <span class="font-caption text-[11px] uppercase tracking-wider text-[#757682] font-semibold">Guía Rápida de Restauración</span>
              
              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-full bg-[#dee8ff] text-[#001549] font-label-md text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <span class="font-label-md text-[13px] text-[#111c2c] font-semibold">Ingrese su correo</span>
                  <p class="font-caption text-[12px] text-[#444651]">El mismo que tiene registrado en su historia clínica.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-full bg-[#dee8ff] text-[#001549] font-label-md text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <span class="font-label-md text-[13px] text-[#111c2c] font-semibold">Verifique su bandeja de entrada</span>
                  <p class="font-caption text-[12px] text-[#444651]">Recibirá un código seguro o enlace válido por 15 minutos.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-full bg-[#dee8ff] text-[#001549] font-label-md text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <span class="font-label-md text-[13px] text-[#111c2c] font-semibold">Defina su nueva clave</span>
                  <p class="font-caption text-[12px] text-[#444651]">Use combinaciones de seguridad para salvaguardar sus datos médicos.</p>
                </div>
              </div>
            </div>

            <!-- Institutional Help Desk Feature with Photography -->
            <div class="relative w-full rounded-2xl overflow-hidden bg-[#001549] text-white shadow-md border border-[#c5c6d3]/30">
              <div
                class="relative h-36 w-full bg-cover bg-center"
                style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqsT8UXjSAq3Zu-tOyw1n8kGJjBtpggAnERP9V0-1NTTyEyfCIGESdm_ujN3dGY4ffys6BmgpcN0vTAQ4V3MI7hC_G3yie-ovbQUZukU3H5Cn3gLolbGqX28339LbG0pkoGmURrFQioTpdtkjGnmsoHe6DfN1Xe_XhcgwNNufC9mrSBToPpBq28Z8krp-Wfh8pcW61q5aIzt7n0L4ojAfp1A_NEg6YsaIlYPMd36uJQ7RTc9P6i1E')"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-[#001549] via-[#001549]/70 to-transparent"></div>
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-[#006ef4] animate-pulse"></span>
                  <span class="font-caption text-[11px] text-[#001549] font-semibold">Mesa de Ayuda de Pacientes</span>
                </div>
              </div>

              <div class="p-4 flex flex-col gap-1">
                <span class="font-caption text-[11px] text-[#dee8ff] uppercase tracking-wider">Atención Telefónica 24/7</span>
                <span class="font-headline-md text-[18px] font-bold text-white tracking-tight">(607) 639-4040 • Ext. 1001</span>
                <p class="font-caption text-[11px] text-[#dee8ff] mt-0.5">
                  Si no tiene acceso a su correo registrado, comuníquese con nuestra central telefónica de admisiones.
                </p>
              </div>
            </div>

            <!-- Security Notice -->
            <div class="bg-[#f0f3ff] p-3.5 rounded-xl flex items-start gap-2.5 border border-[#e7eeff]">
              <span class="material-symbols-outlined text-[#0056c3] text-[20px] mt-0.5 flex-shrink-0">shield</span>
              <p class="font-caption text-[12px] text-[#444651]">
                <strong class="text-[#001549] font-semibold">Aviso Institucional:</strong> El personal del Hospital nunca le solicitará contraseñas por WhatsApp, llamada o mensaje de texto.
              </p>
            </div>
          </div>

          <!-- Right Column: Interactive 2-Step Recovery Flow (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-4">
            
            <!-- Step Navigation Tabs -->
            <div class="bg-[#f0f3ff] p-1 rounded-xl flex items-center gap-1 border border-[#e7eeff] select-none">
              <button
                (click)="activeStep.set(1)"
                [class]="activeStep() === 1 ? 'bg-white text-[#001549] shadow-sm font-semibold' : 'text-[#444651] hover:text-[#001549]'"
                class="flex-1 py-2 px-3 rounded-lg font-label-md text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                type="button"
              >
                <span class="w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold" [class]="activeStep() === 1 ? 'bg-[#0056c3] text-white' : 'bg-[#dee8ff] text-[#001549]'">1</span>
                <span>Solicitud de Enlace</span>
              </button>
              <button
                (click)="activeStep.set(2)"
                [class]="activeStep() === 2 ? 'bg-white text-[#001549] shadow-sm font-semibold' : 'text-[#444651] hover:text-[#001549]'"
                class="flex-1 py-2 px-3 rounded-lg font-label-md text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                type="button"
              >
                <span class="w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold" [class]="activeStep() === 2 ? 'bg-[#0056c3] text-white' : 'bg-[#dee8ff] text-[#001549]'">2</span>
                <span>Restablecer Clave</span>
              </button>
            </div>

            <!-- STEP 1: Solicitud de Enlace -->
            @if (activeStep() === 1) {
              <div class="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_4px_20px_-2px_rgba(0,39,119,0.06)] border border-[#e7eeff] flex flex-col gap-5 animate-fadeIn">
                <div class="flex flex-col gap-1 pb-2 border-b border-[#e7eeff]">
                  <h2 class="font-headline-lg text-[20px] sm:text-[22px] text-[#001549] font-bold">Paso 1: Solicitud de Enlace de Recuperación</h2>
                  <p class="font-body-md text-[13px] text-[#444651]">
                    Ingrese la dirección de correo electrónico vinculada a su historia clínica o usuario hospitalario.
                  </p>
                </div>
                @if (recoveryError()) { <div class="p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[12px]">{{ recoveryError() }}</div> }

                @if (!linkSent()) {
                  <form class="flex flex-col gap-4" (submit)="handleSendLink($event)">
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center justify-between" for="recoveryEmail">
                        <span>Correo Electrónico Registrado</span>
                        <span class="font-caption text-[11px] text-[#757682] font-normal">Requerido</span>
                      </label>
                      <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-3.5 text-[#757682] text-[20px] pointer-events-none">mail</span>
                        <input
                          class="w-full h-12 pl-11 pr-4 rounded-xl bg-[#f0f3ff] text-[#111c2c] font-body-md text-[14px] placeholder:text-[#757682] border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 shadow-sm transition-all outline-none"
                          id="recoveryEmail"
                          placeholder="paciente@correo.com"
                          required
                          type="email"
                          [value]="recoveryEmail()"
                          (input)="recoveryEmail.set($any($event.target).value)"
                        />
                      </div>
                      <span class="font-caption text-[11px] text-[#444651] pl-1">
                        Verificaremos que la cuenta exista. Si el correo no está disponible, podrá continuar directamente al cambio de clave.
                      </span>
                    </div>

                    <div class="p-3.5 rounded-xl bg-[#dee8ff]/50 flex items-start gap-2.5 border border-[#dee8ff]">
                      <span class="material-symbols-outlined text-[#0056c3] text-[20px] mt-0.5">info</span>
                      <p class="font-caption text-[12px] text-[#001549]">
                        Por favor revise su carpeta de <strong>Spam o Correo no deseado</strong> si no observa el mensaje en su bandeja principal dentro de los siguientes 2 minutos.
                      </p>
                    </div>

                    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        class="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0056c3] text-white font-label-md text-[14px] font-semibold hover:bg-[#006ef4] transition-all shadow-[0_4px_14px_rgba(0,86,195,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                        type="submit"
                        [disabled]="sendingLink()"
                      >
                        @if (sendingLink()) {
                          <span class="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                          <span>Generando enlace seguro...</span>
                        } @else {
                        <span>Verificar cuenta y continuar</span>
                          <span class="material-symbols-outlined text-[18px]">send</span>
                        }
                      </button>
                      <a routerLink="/login" class="font-label-md text-[13px] text-[#757682] hover:text-[#001549] transition-colors">
                        Cancelar y regresar
                      </a>
                    </div>
                  </form>
                } @else {
                  <!-- Confirmation Banner -->
                  <div class="p-5 rounded-2xl bg-[#dee8ff]/60 border border-[#afc6ff] flex flex-col items-center text-center gap-3 animate-fadeIn">
                    <div class="w-12 h-12 rounded-full bg-[#0056c3] text-white flex items-center justify-center shadow-md">
                      <span class="material-symbols-outlined text-[26px]">mark_email_read</span>
                    </div>
                    <h3 class="font-label-md text-[16px] text-[#001549] font-bold">Solicitud registrada</h3>
                    <p class="font-body-md text-[13px] text-[#444651] max-w-md">
                      Si <strong class="text-[#001549]">{{ recoveryEmail() }}</strong> corresponde a una cuenta activa, se generó un código de un solo uso válido por 30 minutos.
                    </p>
                    @if (recoveryToken()) {
                      <p class="font-caption text-[11px] text-[#444651] max-w-md">
                        Entorno de laboratorio: el código se entrega aquí porque el envío por correo es opcional.
                        En un entorno real llegaría al buzón y se pegaría en el paso siguiente.
                      </p>
                    }
                    <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        (click)="activeStep.set(2)"
                        class="px-5 py-2.5 rounded-xl bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        type="button"
                      >
                        <span>Continuar al cambio de clave</span>
                        <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                      </button>
                      <button
                        (click)="linkSent.set(false)"
                        class="px-4 py-2 rounded-xl text-[#0056c3] hover:bg-white text-[12px] font-medium transition-colors cursor-pointer"
                        type="button"
                      >
                        Usar otro correo
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- STEP 2: Restablecer Clave -->
            @if (activeStep() === 2) {
              <div class="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_4px_20px_-2px_rgba(0,39,119,0.06)] border border-[#e7eeff] flex flex-col gap-5 animate-fadeIn">
                <div class="flex flex-col gap-1 pb-2 border-b border-[#e7eeff]">
                  <h2 class="font-headline-lg text-[20px] sm:text-[22px] text-[#001549] font-bold">Paso 2: Definir Nueva Contraseña</h2>
                  <p class="font-body-md text-[13px] text-[#444651]">
                    Establezca una nueva clave institucional para proteger su expediente y citas médicas.
                  </p>
                  @if (recoveryError()) { <div class="p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[12px]">{{ recoveryError() }}</div> }
                </div>

                @if (!passwordChanged()) {
                  <form class="flex flex-col gap-4" (submit)="handlePasswordReset($event)">

                    <!-- Field 0: código de un solo uso (HU-006) -->
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold" for="recoveryToken">
                        Código de recuperación
                      </label>
                      <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-3.5 text-[#757682] text-[20px] pointer-events-none">key</span>
                        <input
                          id="recoveryToken"
                          name="recoveryToken"
                          type="text"
                          autocomplete="one-time-code"
                          placeholder="Pegue aquí el código de un solo uso"
                          class="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c3c5d4] bg-white font-mono text-[12px] text-[#001549] focus:outline-none focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 transition-all"
                          [value]="recoveryToken()"
                          (input)="recoveryToken.set($any($event.target).value)"
                        />
                      </div>
                      <p class="font-caption text-[11px] text-[#757682]">
                        Un solo uso y válido por 30 minutos. Si venció, vuelva al paso 1 y solicite otro.
                      </p>
                    </div>

                    <!-- Field 1: New Password -->
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center justify-between" for="newPassword">
                        <span>Nueva Contraseña</span>
                        <span class="font-caption text-[11px] text-[#757682]">Sensible a mayúsculas</span>
                      </label>
                      <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-3.5 text-[#757682] text-[20px] pointer-events-none">lock</span>
                        <input
                          class="w-full h-12 pl-11 pr-12 rounded-xl bg-[#f0f3ff] text-[#111c2c] font-body-md text-[14px] placeholder:text-[#757682] border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 shadow-sm transition-all outline-none"
                          id="newPassword"
                          placeholder="Mínimo 8 caracteres seguros"
                          required
                          [type]="showNewPwd() ? 'text' : 'password'"
                          [value]="newPassword()"
                          (input)="newPassword.set($any($event.target).value)"
                        />
                        <button
                          type="button"
                          (click)="showNewPwd.set(!showNewPwd())"
                          class="absolute right-2.5 w-8 h-8 flex items-center justify-center rounded-lg text-[#757682] hover:text-[#111c2c] cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[20px]">
                            {{ showNewPwd() ? 'visibility_off' : 'visibility' }}
                          </span>
                        </button>
                      </div>

                      <!-- Password Strength Live Meter -->
                      <div class="mt-2 flex flex-col gap-1.5">
                        <div class="flex items-center justify-between">
                          <span class="font-caption text-[11px] text-[#757682]">Fortaleza de la contraseña:</span>
                          <span class="font-label-md text-[11px] font-bold" [class]="strengthColorClass()">
                            {{ strengthLabel() }}
                          </span>
                        </div>
                        <div class="w-full h-2 rounded-full bg-[#f0f3ff] overflow-hidden flex gap-1">
                          <div class="h-full rounded-full transition-all duration-300" [class]="score() >= 1 ? 'w-1/4 bg-[#ba1a1a]' : 'w-0'"></div>
                          <div class="h-full rounded-full transition-all duration-300" [class]="score() >= 2 ? 'w-1/4 bg-[#ffe168]' : 'w-0'"></div>
                          <div class="h-full rounded-full transition-all duration-300" [class]="score() >= 3 ? 'w-1/4 bg-[#006ef4]' : 'w-0'"></div>
                          <div class="h-full rounded-full transition-all duration-300" [class]="score() >= 4 ? 'w-1/4 bg-[#0056c3]' : 'w-0'"></div>
                        </div>
                      </div>

                      <!-- Criteria Checklist -->
                      <div class="grid grid-cols-2 gap-2 mt-1.5 p-3 rounded-xl bg-[#f9f9ff] border border-[#e7eeff]">
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-[16px]" [class]="hasMinLength() ? 'text-[#0056c3]' : 'text-[#c5c6d3]'">
                            {{ hasMinLength() ? 'check_circle' : 'radio_button_unchecked' }}
                          </span>
                          <span class="font-caption text-[11px]" [class]="hasMinLength() ? 'text-[#001549] font-medium' : 'text-[#757682]'">8+ caracteres</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-[16px]" [class]="hasCase() ? 'text-[#0056c3]' : 'text-[#c5c6d3]'">
                            {{ hasCase() ? 'check_circle' : 'radio_button_unchecked' }}
                          </span>
                          <span class="font-caption text-[11px]" [class]="hasCase() ? 'text-[#001549] font-medium' : 'text-[#757682]'">Mayús. y minús.</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-[16px]" [class]="hasNumber() ? 'text-[#0056c3]' : 'text-[#c5c6d3]'">
                            {{ hasNumber() ? 'check_circle' : 'radio_button_unchecked' }}
                          </span>
                          <span class="font-caption text-[11px]" [class]="hasNumber() ? 'text-[#001549] font-medium' : 'text-[#757682]'">Al menos un número</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-[16px]" [class]="hasSpecial() ? 'text-[#0056c3]' : 'text-[#c5c6d3]'">
                            {{ hasSpecial() ? 'check_circle' : 'radio_button_unchecked' }}
                          </span>
                          <span class="font-caption text-[11px]" [class]="hasSpecial() ? 'text-[#001549] font-medium' : 'text-[#757682]'">Símbolo especial</span>
                        </div>
                      </div>
                    </div>

                    <!-- Field 2: Confirm Password -->
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center justify-between" for="confirmPassword">
                        <span>Confirmar Nueva Contraseña</span>
                        @if (newPassword() && confirmPassword()) {
                          <span class="font-caption text-[11px] font-bold" [class]="passwordsMatch() ? 'text-[#0056c3]' : 'text-[#ba1a1a]'">
                            {{ passwordsMatch() ? 'Coinciden correctamente' : 'No coinciden' }}
                          </span>
                        }
                      </label>
                      <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-3.5 text-[#757682] text-[20px] pointer-events-none">lock_reset</span>
                        <input
                          class="w-full h-12 pl-11 pr-12 rounded-xl bg-[#f0f3ff] text-[#111c2c] font-body-md text-[14px] placeholder:text-[#757682] border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 shadow-sm transition-all outline-none"
                          id="confirmPassword"
                          placeholder="Repita la nueva contraseña"
                          required
                          [type]="showConfirmPwd() ? 'text' : 'password'"
                          [value]="confirmPassword()"
                          (input)="confirmPassword.set($any($event.target).value)"
                        />
                        <button
                          type="button"
                          (click)="showConfirmPwd.set(!showConfirmPwd())"
                          class="absolute right-2.5 w-8 h-8 flex items-center justify-center rounded-lg text-[#757682] hover:text-[#111c2c] cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[20px]">
                            {{ showConfirmPwd() ? 'visibility_off' : 'visibility' }}
                          </span>
                        </button>
                      </div>
                    </div>

                    <!-- Action Submit -->
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        class="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0056c3] text-white font-label-md text-[14px] font-semibold hover:bg-[#006ef4] transition-all shadow-[0_4px_14px_rgba(0,86,195,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                        type="submit"
                        [disabled]="!passwordsMatch() || !hasMinLength()"
                      >
                        <span>Guardar Nueva Contraseña</span>
                        <span class="material-symbols-outlined text-[18px]">verified</span>
                      </button>
                      <button
                        (click)="activeStep.set(1)"
                        class="font-label-md text-[13px] text-[#757682] hover:text-[#001549] transition-colors cursor-pointer"
                        type="button"
                      >
                        Volver al paso 1
                      </button>
                    </div>
                  </form>
                } @else {
                  <!-- Success State in Step 2 -->
                  <div class="p-6 rounded-2xl bg-[#dee8ff]/70 border border-[#afc6ff] flex flex-col items-center text-center gap-3 animate-fadeIn">
                    <div class="w-14 h-14 rounded-full bg-[#0056c3] text-white flex items-center justify-center shadow-lg">
                      <span class="material-symbols-outlined text-[30px]">check_circle</span>
                    </div>
                    <h3 class="font-headline-md text-[20px] text-[#001549] font-bold">¡Contraseña Actualizada con Éxito!</h3>
                    <p class="font-body-md text-[13px] text-[#444651] max-w-md">
                      Sus credenciales han sido reestablecidas en la red clínica HIC &amp; ICV. Ya puede acceder a sus citas y registros con su nueva clave.
                    </p>
                    <div class="pt-2">
                      <a
                        routerLink="/login"
                        class="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#0056c3] text-white font-label-md text-[14px] font-semibold hover:bg-[#006ef4] transition-all shadow-md"
                      >
                        <span>Iniciar Sesión Ahora</span>
                        <span class="material-symbols-outlined text-[18px]">login</span>
                      </a>
                    </div>
                  </div>
                }
              </div>
            }

          </div>
        </div>

        <!-- Bottom Security Information Grid -->
        <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#c5c6d3]/30">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-[#e7eeff] flex items-start gap-3">
            <span class="material-symbols-outlined text-[#0056c3] text-[22px]">health_and_safety</span>
            <div class="flex flex-col">
              <span class="font-label-md text-[13px] text-[#001549] font-semibold">Confidencialidad Hospitalaria</span>
              <p class="font-caption text-[11px] text-[#444651] mt-0.5">
                Cumplimiento estricto de la ley de protección de datos clínicos y reserva médica.
              </p>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm border border-[#e7eeff] flex items-start gap-3">
            <span class="material-symbols-outlined text-[#0056c3] text-[22px]">timer</span>
            <div class="flex flex-col">
              <span class="font-label-md text-[13px] text-[#001549] font-semibold">Vigencia Limitada</span>
              <p class="font-caption text-[11px] text-[#444651] mt-0.5">
                El enlace generado caduca automáticamente a los 15 minutos por seguridad informática.
              </p>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm border border-[#e7eeff] flex items-start gap-3">
            <span class="material-symbols-outlined text-[#0056c3] text-[22px]">support_agent</span>
            <div class="flex flex-col">
              <span class="font-label-md text-[13px] text-[#001549] font-semibold">¿Problemas con su correo?</span>
              <p class="font-caption text-[11px] text-[#444651] mt-0.5">
                Acérquese a las ventanillas de Admisiones HIC o ICV con su documento físico.
              </p>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="w-full bg-[#f0f3ff] py-4 border-t border-[#e7eeff]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p class="font-caption text-[12px] text-[#444651]">
            © 2024 Portal de Citas HIC &amp; ICV. Sistema Integral de Agendamiento Clínico.
          </p>
          <div class="flex items-center gap-4">
            <a routerLink="/recuperar" class="font-caption text-[12px] text-[#444651] hover:text-[#001549] transition-colors">
              Privacidad y Datos
            </a>
            <span class="text-[#c5c6d3]">•</span>
            <a routerLink="/recuperar" class="font-caption text-[12px] text-[#444651] hover:text-[#001549] transition-colors">
              Contacto Clínico
            </a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class Recovery {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);
  activeStep = signal<1 | 2>(1);

  // Step 1
  recoveryEmail = signal('');
  sendingLink = signal(false);
  linkSent = signal(false);
  /** Código de un solo uso que exige el paso 2. Se rellena solo si el canal lo entrega. */
  recoveryToken = signal('');

  // Step 2
  newPassword = signal('');
  confirmPassword = signal('');
  showNewPwd = signal(false);
  showConfirmPwd = signal(false);
  passwordChanged = signal(false);
  recoveryError = signal('');

  hasMinLength = computed(() => this.newPassword().length >= 8);
  hasCase = computed(() => /[A-Z]/.test(this.newPassword()) && /[a-z]/.test(this.newPassword()));
  hasNumber = computed(() => /[0-9]/.test(this.newPassword()));
  hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.newPassword()));

  score = computed(() => {
    let s = 0;
    if (this.hasMinLength()) s++;
    if (this.hasCase()) s++;
    if (this.hasNumber()) s++;
    if (this.hasSpecial()) s++;
    return s;
  });

  strengthLabel = computed(() => {
    const s = this.score();
    if (s <= 1) return 'Débil';
    if (s === 2) return 'Regular';
    if (s === 3) return 'Buena';
    return 'Excelente (Segura)';
  });

  strengthColorClass = computed(() => {
    const s = this.score();
    if (s <= 1) return 'text-[#ba1a1a]';
    if (s === 2) return 'text-[#6f5d00]';
    if (s === 3) return 'text-[#0056c3]';
    return 'text-[#0056c3]';
  });

  passwordsMatch = computed(() => {
    return this.newPassword() === this.confirmPassword() && this.newPassword().length > 0;
  });

  /**
   * HU-006 CA-01. La respuesta es la misma exista o no la cuenta, de modo que esta pantalla no
   * puede decir si el correo está registrado: hacerlo convertiría el formulario en un medio para
   * enumerar cuentas. El token llega en la respuesta solo por el canal de laboratorio que admite
   * RF-03; cuando se active un envío real por correo, el usuario lo pegará en el paso 2.
   */
  handleSendLink(e: Event) {
    e.preventDefault();
    this.sendingLink.set(true);
    this.recoveryError.set('');
    this.http.post<{ message: string; token?: string }>(
      `${this.apiBaseUrl.replace('/api/v1', '')}/api/auth/recovery/request`,
      { email: this.recoveryEmail() }
    ).subscribe({
      next: response => {
        this.sendingLink.set(false);
        this.linkSent.set(true);
        this.recoveryToken.set(response.token ?? '');
      },
      error: () => {
        this.sendingLink.set(false);
        this.recoveryError.set('No fue posible procesar la solicitud. Puede intentarlo nuevamente.');
      }
    });
  }

  /** CA-02 y CA-03. El cambio exige el token: sin él el backend rechaza la petición. */
  handlePasswordReset(e: Event) {
    e.preventDefault();
    if (!this.passwordsMatch() || !this.hasMinLength()) return;
    const token = this.recoveryToken().trim();
    if (!token) {
      this.recoveryError.set('Falta el código de recuperación. Solicítelo de nuevo en el paso 1.');
      return;
    }
    this.recoveryError.set('');
    this.http.post(`${this.apiBaseUrl.replace('/api/v1', '')}/api/auth/recovery/confirm`,
      { token, password: this.newPassword() }
    ).subscribe({
      next: () => this.passwordChanged.set(true),
      error: err => this.recoveryError.set(err.status === 400
        ? 'El código de recuperación no es válido, ya fue usado o venció. Solicite uno nuevo.'
        : 'No fue posible actualizar la contraseña.')
    });
  }
}
