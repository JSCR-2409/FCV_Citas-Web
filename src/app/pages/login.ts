import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClinicalDataState, UserRole } from '../services/clinical-data';

export type UXState = 'normal' | 'loading' | 'invalid' | 'expired';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="w-full min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <!-- Left 45% Contextual Panel -->
      <div class="relative w-full lg:w-[45%] bg-[#002777] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden shadow-2xl z-10">
        <!-- Soft ambient backdrop waves & decorative light accents -->
        <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#006ef4]/20 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[480px] h-[480px] rounded-full bg-[#405aaa]/25 blur-3xl pointer-events-none"></div>

        <!-- Subtle vector capsule rhythm background -->
        <svg class="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg">
          <path class="text-[#cfdaf1]" d="M-50,150 C120,80 200,260 380,190 C470,155 520,220 560,310" fill="none" stroke="currentColor" stroke-width="2.5"></path>
          <path class="text-[#afc6ff]" d="M-80,320 C100,230 250,440 430,340 C520,290 540,410 590,480" fill="none" stroke="currentColor" stroke-width="2"></path>
          <path class="text-[#cfdaf1]" d="M-20,490 C160,420 220,590 410,510 C490,480 530,580 570,640" fill="none" stroke="currentColor" stroke-width="1.5"></path>
          <circle class="opacity-70" cx="380" cy="190" fill="#78C8ED" r="6"></circle>
          <circle class="opacity-50" cx="430" cy="340" fill="#78C8ED" r="4"></circle>
        </svg>

        <!-- Top Branding & Context Tag -->
        <div class="relative z-10 flex flex-col gap-4">
          <div class="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md shadow-sm">
            <span class="inline-block w-2 h-2 rounded-full bg-[#afc6ff] animate-pulse"></span>
            <span class="font-micro text-[11px] uppercase tracking-wider text-[#dee8ff]">Red Hospitalaria de Alta Complejidad</span>
          </div>

          <div class="mt-2">
            <h1 class="font-headline-xl text-[30px] sm:text-[34px] text-white tracking-tight leading-tight font-bold">
              Gestión Integral de Citas Médicas
            </h1>
            <p class="mt-2.5 font-subtitle text-[15px] text-[#dee8ff] leading-relaxed max-w-lg">
              Conectamos con rigor institucional a nuestros pacientes con especialistas certificados, asegurando confidencialidad clínica y continuidad médica de vanguardia.
            </p>
          </div>

          <!-- Hospital Location Pills -->
          <div class="mt-2 flex flex-wrap gap-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md shadow-sm">
              <span class="material-symbols-outlined text-[20px] text-[#cfdaf1]">local_hospital</span>
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] text-white font-semibold leading-tight">HIC</span>
                <span class="font-caption text-[11px] text-[#dee8ff]">Hospital Internacional de Colombia</span>
              </div>
            </div>

            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md shadow-sm">
              <span class="material-symbols-outlined text-[20px] text-[#cfdaf1]">cardiology</span>
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] text-white font-semibold leading-tight">ICV</span>
                <span class="font-caption text-[11px] text-[#dee8ff]">Instituto Cardiovascular</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Clinical Image Feature -->
        <div class="relative z-10 my-6 hidden sm:block">
          <div class="relative rounded-2xl overflow-hidden shadow-xl bg-white/10 border border-white/10">
            <img
              class="w-full h-44 object-cover opacity-85 hover:opacity-100 transition-all duration-500"
              alt="Instalaciones clínicas HIC e ICV"
              referrerpolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI1RZm37HcAxTmjZzBGsUcDMgGGvpsVgpSlysSTRvD9OAGA5D5I9T64vxN0JAIvf86A-bn5phhWupn9MXM87aSViSKjlcKJvE8FB_QuajxkyhS2LMrJNxPEK3euB2AREQ1SVFD1oeIPDYC6doU3HdRfcLWpew6e5JbWJp88VxSbgWshrTZJbunc3W9BYl9n6kAlkoHhYevfyPxX9JthX__JD-1QxcaC_zqtTYnGIE3buD8sjZuPB8"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#001549] via-[#001549]/40 to-transparent"></div>
            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[#006ef4]"></span>
                <span class="font-caption text-[12px] text-white font-medium">JCI Accredited Infrastructure</span>
              </div>
              <span class="font-micro text-[11px] text-[#dee8ff] uppercase tracking-wider">Protocolo SSL-256</span>
            </div>
          </div>
        </div>

        <!-- Bottom Security Verification Points -->
        <div class="relative z-10 pt-4 mt-auto">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#cfdaf1] shadow-sm">
                <span class="material-symbols-outlined text-[20px]">encrypted</span>
              </div>
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] text-white font-medium leading-snug">Acceso seguro con cifrado avanzado</span>
                <span class="font-caption text-[11px] text-[#dee8ff]">Protección integral de historia médica y datos sensibles.</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#cfdaf1] shadow-sm">
                <span class="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] text-white font-medium leading-snug">Sesión protegida y monitoreo en tiempo real</span>
                <span class="font-caption text-[11px] text-[#dee8ff]">Detección proactiva de accesos y tokens auditados.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 55% Form Interactive Area -->
      <div class="w-full lg:w-[55%] bg-[#f9f9ff] p-5 sm:p-8 lg:p-12 flex flex-col justify-center items-center">
        <div class="w-full max-w-[460px] flex flex-col gap-4">
          
          <!-- Interactive UX State Switcher Banner -->
          <div class="w-full bg-white rounded-xl p-2.5 shadow-sm border border-[#e7eeff]">
            <div class="flex items-center justify-between px-1 mb-2">
              <span class="font-micro text-[11px] text-[#757682] uppercase tracking-wider flex items-center gap-1 font-semibold">
                <span class="material-symbols-outlined text-[14px]">tune</span> Estados de Prueba UX
              </span>
              <span class="font-caption text-[12px] text-[#0056c3] font-semibold">
                {{ activeStateLabel() }}
              </span>
            </div>
            <div class="grid grid-cols-4 gap-1">
              <button
                (click)="setUXState('normal')"
                [class]="uxState() === 'normal' ? 'bg-[#e7eeff] font-semibold text-[#111c2c]' : 'text-[#444651] hover:bg-[#f0f3ff]'"
                class="py-1.5 text-center rounded-md font-caption text-[12px] transition-all cursor-pointer"
                type="button"
              >
                Normal
              </button>
              <button
                (click)="setUXState('loading')"
                [class]="uxState() === 'loading' ? 'bg-[#e7eeff] font-semibold text-[#111c2c]' : 'text-[#444651] hover:bg-[#f0f3ff]'"
                class="py-1.5 text-center rounded-md font-caption text-[12px] transition-all cursor-pointer"
                type="button"
              >
                Loading
              </button>
              <button
                (click)="setUXState('invalid')"
                [class]="uxState() === 'invalid' ? 'bg-[#e7eeff] font-semibold text-[#111c2c]' : 'text-[#444651] hover:bg-[#f0f3ff]'"
                class="py-1.5 text-center rounded-md font-caption text-[12px] transition-all cursor-pointer"
                type="button"
              >
                Inválidas
              </button>
              <button
                (click)="setUXState('expired')"
                [class]="uxState() === 'expired' ? 'bg-[#e7eeff] font-semibold text-[#111c2c]' : 'text-[#444651] hover:bg-[#f0f3ff]'"
                class="py-1.5 text-center rounded-md font-caption text-[12px] transition-all cursor-pointer"
                type="button"
              >
                Expirada
              </button>
            </div>
          </div>

          <!-- Header Section -->
          <div class="flex flex-col gap-1">
            <h2 class="font-headline-lg text-[26px] text-[#001549] tracking-tight font-bold">
              Iniciar Sesión
            </h2>
            <p class="font-subtitle text-[15px] text-[#444651]">
              Ingrese sus credenciales para acceder a su cuenta.
            </p>
          </div>

          <!-- UX Alert 1: Invalid Credentials Alert -->
          @if (uxState() === 'invalid') {
            <div class="w-full p-3.5 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-start gap-3 shadow-sm transition-all animate-fadeIn">
              <span class="material-symbols-outlined text-[#ba1a1a] text-[22px] mt-0.5">error</span>
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] font-semibold text-[#ba1a1a]">Acceso denegado</span>
                <span class="font-caption text-[12px] leading-snug text-[#93000a]">Correo electrónico o contraseña incorrectos. Por favor verifique sus datos e intente nuevamente.</span>
              </div>
            </div>
          }

          <!-- UX Alert 2: Session Expired Alert -->
          @if (uxState() === 'expired') {
            <div class="w-full p-3.5 rounded-xl bg-[#ffe168] text-[#221b00] flex items-start gap-3 shadow-sm transition-all animate-fadeIn">
              <span class="material-symbols-outlined text-[#6f5d00] text-[22px] mt-0.5">schedule</span>
              <div class="flex flex-col">
                <span class="font-label-md text-[13px] font-semibold text-[#6f5d00]">Sesión Caducada</span>
                <span class="font-caption text-[12px] leading-snug text-[#4c3f00]">Su sesión ha expirado por inactividad. Por favor inicie sesión nuevamente para continuar.</span>
              </div>
            </div>
          }

          <!-- Form Component -->
          <form class="w-full flex flex-col gap-3.5" (submit)="handleLoginSubmit($event)">
            <!-- Email Input Group -->
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center justify-between" for="user-email">
                <span>Correo Electrónico</span>
                <span class="font-caption text-[11px] text-[#757682] font-normal">Requerido</span>
              </label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3.5 text-[#757682] text-[20px] pointer-events-none">mail</span>
                <input
                  class="w-full h-12 pl-11 pr-4 rounded-xl bg-white text-[#111c2c] font-body-md text-[14px] placeholder:text-[#757682] border border-[#c5c6d3]/60 focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 shadow-sm transition-all outline-none"
                  id="user-email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  required
                  type="email"
                  [value]="emailValue()"
                  (input)="emailValue.set($any($event.target).value)"
                />
              </div>
              <span class="font-caption text-[11px] text-[#444651] pl-1">
                Dirección vinculada a su historia clínica o usuario institucional.
              </span>
            </div>

            <!-- Password Input Group -->
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center justify-between" for="user-password">
                <span>Contraseña</span>
                <span class="font-caption text-[11px] text-[#757682] font-normal">Sensible a mayúsculas</span>
              </label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3.5 text-[#757682] text-[20px] pointer-events-none">lock</span>
                <input
                  class="w-full h-12 pl-11 pr-12 rounded-xl bg-white text-[#111c2c] font-body-md text-[14px] placeholder:text-[#757682] border border-[#c5c6d3]/60 focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 shadow-sm transition-all outline-none"
                  id="user-password"
                  name="password"
                  placeholder="••••••••••••"
                  required
                  [type]="showPassword() ? 'text' : 'password'"
                  [value]="passwordValue()"
                  (input)="passwordValue.set($any($event.target).value)"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-2.5 w-8 h-8 flex items-center justify-center rounded-lg text-[#757682] hover:text-[#111c2c] hover:bg-[#f0f3ff] transition-all cursor-pointer"
                  title="Mostrar u ocultar contraseña"
                >
                  <span class="material-symbols-outlined text-[20px]">
                    {{ showPassword() ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Options Row: Remember Me & Forgot Password -->
            <div class="flex items-center justify-between pt-0.5">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  checked
                  class="w-4 h-4 rounded text-[#0056c3] border-[#c5c6d3] focus:ring-2 focus:ring-[#0056c3] cursor-pointer accent-[#0056c3]"
                  type="checkbox"
                />
                <span class="font-label-md text-[13px] text-[#444651] font-medium">Recordar mi cuenta</span>
              </label>
              <a
                routerLink="/recuperar"
                class="font-label-md text-[13px] text-[#0056c3] hover:text-[#006ef4] font-semibold transition-colors"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <!-- Submit CTA Button -->
            <button
              class="w-full h-[46px] rounded-xl bg-[#0056c3] text-white font-label-md text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#006ef4] active:bg-[#002777] shadow-md transition-all duration-200 mt-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#0056c3]/20"
              type="submit"
              [disabled]="uxState() === 'loading'"
            >
              @if (uxState() === 'loading') {
                <span class="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                <span>Verificando credenciales...</span>
              } @else {
                <span>Iniciar Sesión</span>
                <span class="material-symbols-outlined text-[18px]">login</span>
              }
            </button>
          </form>

          <!-- Role Quick Switcher Demo Buttons -->
          <div class="flex flex-col gap-1.5 pt-1">
            <span class="font-micro text-[11px] text-[#757682] uppercase tracking-wider text-center font-semibold">
              Acceso Rápido de Prueba por Rol
            </span>
            <div class="grid grid-cols-3 gap-2">
              <button
                class="px-2 py-2.5 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#001549] font-caption text-[12px] font-semibold transition-all text-center flex flex-col items-center gap-1 shadow-sm border border-[#e7eeff] cursor-pointer"
                (click)="selectRoleDemo('paciente')"
                type="button"
              >
                <span class="material-symbols-outlined text-[18px] text-[#0056c3]">person</span>
                <span>Paciente</span>
              </button>
              <button
                class="px-2 py-2.5 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#001549] font-caption text-[12px] font-semibold transition-all text-center flex flex-col items-center gap-1 shadow-sm border border-[#e7eeff] cursor-pointer"
                (click)="selectRoleDemo('medico')"
                type="button"
              >
                <span class="material-symbols-outlined text-[18px] text-[#0056c3]">stethoscope</span>
                <span>Profesional</span>
              </button>
              <button
                class="px-2 py-2.5 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#001549] font-caption text-[12px] font-semibold transition-all text-center flex flex-col items-center gap-1 shadow-sm border border-[#e7eeff] cursor-pointer"
                (click)="selectRoleDemo('admin')"
                type="button"
              >
                <span class="material-symbols-outlined text-[18px] text-[#0056c3]">admin_panel_settings</span>
                <span>Administrador</span>
              </button>
            </div>
          </div>

          <!-- Secondary Clinical Registration Prompt -->
          <div class="mt-1 p-3.5 rounded-xl bg-[#f0f3ff] flex flex-col items-center text-center gap-1 shadow-sm border border-[#e7eeff]">
            <p class="font-body-md text-[13px] text-[#111c2c]">
              ¿No tiene una cuenta?
              <a
                routerLink="/registro"
                class="font-label-md text-[13px] text-[#0056c3] hover:text-[#006ef4] font-bold inline-flex items-center gap-0.5 ml-1"
              >
                Regístrese aquí
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </p>
            <span class="font-caption text-[11px] text-[#757682]">
              Nota: El autoregistro está habilitado únicamente para pacientes.
            </span>
          </div>

        </div>
      </div>
    </div>

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
  `,
})
export class Login {
  clinicalState = inject(ClinicalDataState);
  router = inject(Router);

  emailValue = signal('paciente@hic.org.co');
  passwordValue = signal('HospitalSeguro2024!');
  showPassword = signal(false);
  uxState = signal<UXState>('normal');
  selectedRole = signal<UserRole>('paciente');

  activeStateLabel() {
    switch (this.uxState()) {
      case 'loading': return 'Cargando...';
      case 'invalid': return 'Error: Inválidas';
      case 'expired': return 'Sesión Expirada';
      default: return 'Normal';
    }
  }

  setUXState(st: UXState) {
    this.uxState.set(st);
  }

  selectRoleDemo(role: UserRole) {
    this.selectedRole.set(role);
    if (role === 'paciente') {
      this.emailValue.set('paciente@hic.org.co');
      this.passwordValue.set('HospitalSeguro2024!');
    } else if (role === 'medico') {
      this.emailValue.set('dr.especialista@icv.org.co');
      this.passwordValue.set('ClinicaCardio2024!');
    } else if (role === 'admin') {
      this.emailValue.set('coordinacion.citas@hic.org.co');
      this.passwordValue.set('MasterHIC2024#');
    }
    this.uxState.set('normal');
  }

  handleLoginSubmit(event: Event) {
    event.preventDefault();
    this.uxState.set('loading');
    setTimeout(() => {
      this.clinicalState.loginAs(this.selectedRole());
    }, 600);
  }
}
