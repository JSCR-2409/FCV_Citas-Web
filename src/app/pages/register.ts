import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ClinicalDataState } from '../services/clinical-data';
import { API_BASE_URL } from '../services/api-base-url';

export type RegisterState = 'default' | 'duplicate' | 'pwd' | 'success' | 'loading' | 'error';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col w-full min-h-[calc(100vh-4rem)]">
      <!-- Notice Banner: Patient Exclusive -->
      <section class="w-full bg-[#dee8ff] py-2 px-4 sm:px-6 lg:px-8 border-b border-[#cfdaf1]">
        <div class="max-w-7xl mx-auto flex items-center justify-center sm:justify-start gap-2.5 text-center sm:text-left">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#006ef4] text-white flex-shrink-0">
            <span class="material-symbols-outlined text-[14px]">info</span>
          </span>
          <p class="font-caption text-[12px] text-[#001549]">
            <strong class="font-semibold">Registro exclusivo para Pacientes.</strong> Médicos y personal administrativo son registrados por la coordinación institucional.
          </p>
        </div>
      </section>

      <!-- Main Split Architecture View -->
      <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex-1">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <!-- Left Column: Clinical Context & Visual Authority (5 Cols) -->
          <header class="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
            <!-- Badge -->
            <div class="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#dee8ff] text-[#001549] font-caption text-[12px] font-semibold shadow-sm">
              <span class="material-symbols-outlined text-[#0056c3] text-[16px]">verified_user</span>
              <span>Red Hospitalaria Certificada JCI</span>
            </div>

            <div>
              <span class="font-micro text-[11px] uppercase tracking-widest text-[#0056c3] font-bold block">Nuevo Expediente Digital</span>
              <h1 class="font-headline-xl text-[28px] sm:text-[32px] text-[#001549] font-bold mt-1">Registro de Paciente</h1>
              <p class="font-body-md text-[14px] text-[#444651] mt-1.5 leading-relaxed">
                Cree su perfil personal para programar citas de consulta externa, procedimientos especializados y consultar sus órdenes médicas en la red HIC e ICV.
              </p>
            </div>

            <!-- Institutional Trust Card with Photography -->
            <div class="relative w-full rounded-2xl overflow-hidden bg-[#001549] shadow-xl border border-[#c5c6d3]/30">
              <div
                class="relative h-44 w-full bg-cover bg-center"
                style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfnF23qOiqLuGcAp_D8cFGSC2QzK715DKOlGVQaoZrSg9mg5P2liCUvJuIGLJheUn_VpYBY1ukDp1QsoTysf4kLMV8FFeMXfZZaxoQmoW4YK2_hU2r0-7wr_N1QzG1Gs8HwxkrOcTfxIA1WGLYkmAfISIDHBGhjYCE6AAzHDTlKlZUjGGcpRt7AdNJMFtf_VPkQ7wyfhYEBZj_fk9U_PRZCzPWwzh2UIC4hVLF70lnn7qwnngo2w0')"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-[#001549] via-[#001549]/60 to-transparent"></div>
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-[#006ef4] animate-pulse"></span>
                  <span class="font-caption text-[11px] text-[#001549] font-semibold">Admisiones Centralizadas</span>
                </div>
              </div>

              <div class="p-4 text-white flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#002777] flex items-center justify-center text-[#dce1ff]">
                    <span class="material-symbols-outlined text-[20px]">medical_information</span>
                  </div>
                  <div>
                    <h2 class="font-label-md text-[14px] font-semibold">Historia Clínica Unificada</h2>
                    <p class="font-caption text-[12px] text-[#cfdaf1]">Sincronización directa con ICV e HIC Floridablanca</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                  <div class="bg-[#002777]/70 rounded-lg p-2 flex flex-col">
                    <span class="font-micro text-[10px] text-[#cfdaf1] uppercase">TIEMPO PROMEDIO</span>
                    <span class="font-label-md text-[13px] text-white font-semibold">2 Minutos</span>
                  </div>
                  <div class="bg-[#002777]/70 rounded-lg p-2 flex flex-col">
                    <span class="font-micro text-[10px] text-[#cfdaf1] uppercase">ENCRIPTACIÓN</span>
                    <span class="font-label-md text-[13px] text-white font-semibold">AES 256 Bits</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Assisted Registration Micro-help -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-[#e7eeff] flex items-start gap-3">
              <span class="material-symbols-outlined text-[#0056c3] mt-0.5 text-[22px]">contact_support</span>
              <div class="flex flex-col gap-0.5">
                <span class="font-label-md text-[13px] text-[#111c2c] font-semibold">¿Necesita asistencia para un menor o adulto mayor?</span>
                <p class="font-caption text-[12px] text-[#444651] leading-relaxed">
                  Puede registrar al beneficiario con su documento respectivo. Las citas podrán gestionarse con un acudiente acreditado.
                </p>
              </div>
            </div>
          </header>

          <!-- Right Column: Registration Card Container (7 Cols) -->
          <section class="lg:col-span-7">
            @if (state() !== 'success') {
              <!-- FORM VIEW -->
              <div class="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_4px_20px_-2px_rgba(0,39,119,0.06)] border border-[#e7eeff] flex flex-col gap-5">
                
                <!-- Duplicate Data Error Alert -->
                @if (state() === 'duplicate') {
                  <div class="p-4 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-start gap-3 animate-fadeIn border border-[#ba1a1a]/20">
                    <span class="material-symbols-outlined text-[#ba1a1a] text-[24px] flex-shrink-0">error</span>
                    <div class="flex flex-col">
                      <h3 class="font-label-md text-[14px] font-bold text-[#ba1a1a]">Registro Duplicado Detectado</h3>
                      <p class="font-body-md text-[13px] text-[#93000a] mt-0.5 leading-snug">
                        El documento o correo ya se encuentra registrado en el sistema. Por favor intente iniciar sesión o solicite la recuperación de su contraseña.
                      </p>
                      <div class="mt-2 flex items-center gap-3">
                        <a routerLink="/recuperar" class="font-label-md text-[13px] text-[#ba1a1a] font-bold hover:underline inline-flex items-center gap-1">
                          <span>Ir a Recuperar Cuenta</span>
                          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </a>
                      </div>
                    </div>
                  </div>
                }

                <!-- Form Header Indicator -->
                <div class="flex items-center justify-between pb-1 border-b border-[#e7eeff]">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#0056c3]"></span>
                    <span class="font-caption text-[12px] uppercase tracking-wider text-[#757682] font-semibold">Paso Único: Información del Paciente</span>
                  </div>
                  <span class="font-micro text-[11px] text-[#757682] uppercase font-medium">Campos obligatorios (*)</span>
                </div>

                <!-- Registration Form -->
                <form class="flex flex-col gap-4" (submit)="handleRegisterSubmit($event)">
                  <!-- Row 1: Nombres & Apellidos -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="firstName">
                        Nombres <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <input
                          class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="firstName"
                          placeholder="Ej. Sofía Mariana"
                          required
                          type="text"
                          [value]="firstName()"
                          (input)="firstName.set($any($event.target).value)"
                        />
                        <span class="material-symbols-outlined absolute right-3 top-2.5 text-[#757682] text-[20px] pointer-events-none">person</span>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="lastName">
                        Apellidos <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <input
                          class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="lastName"
                          placeholder="Ej. Restrepo Mendoza"
                          required
                          type="text"
                          [value]="lastName()"
                          (input)="lastName.set($any($event.target).value)"
                        />
                        <span class="material-symbols-outlined absolute right-3 top-2.5 text-[#757682] text-[20px] pointer-events-none">badge</span>
                      </div>
                    </div>
                  </div>

                  <!-- Row 2: Document Type & Number -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="docType">
                        Tipo de Documento <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <select
                          class="w-full h-11 px-3.5 pr-10 bg-[#f0f3ff] text-[#111c2c] rounded-lg border border-[#c5c6d3]/60 appearance-none focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all cursor-pointer outline-none"
                          id="docType"
                          [value]="docType()"
                          (change)="docType.set($any($event.target).value)"
                          required
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PA">Pasaporte</option>
                        </select>
                        <span class="material-symbols-outlined absolute right-3 top-2.5 text-[#757682] text-[20px] pointer-events-none">expand_more</span>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="docNumber">
                        Número de Documento <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <input
                          [class.border-[#ba1a1a]]="state() === 'duplicate'"
                          class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="docNumber"
                          placeholder="Sin puntos ni guiones"
                          required
                          type="text"
                          [value]="docNumber()"
                          (input)="docNumber.set($any($event.target).value)"
                        />
                        <span class="material-symbols-outlined absolute right-3 top-2.5 text-[#757682] text-[20px] pointer-events-none">pin</span>
                      </div>
                    </div>
                  </div>

                  <!-- Row 3: Email & Phone -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="email">
                        Correo Electrónico <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <input
                          [class.border-[#ba1a1a]]="state() === 'duplicate'"
                          class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="email"
                          placeholder="paciente@correo.com"
                          required
                          type="email"
                          [value]="email()"
                          (input)="email.set($any($event.target).value)"
                        />
                        <span class="material-symbols-outlined absolute right-3 top-2.5 text-[#757682] text-[20px] pointer-events-none">alternate_email</span>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="phone">
                        Teléfono de Contacto <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative flex">
                        <div class="flex items-center justify-center h-11 px-3 bg-[#dee8ff] text-[#444651] font-label-md text-[13px] rounded-l-lg border border-r-0 border-[#c5c6d3]/60 select-none">
                          +57
                        </div>
                        <input
                          class="w-full h-11 px-3.5 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-r-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="phone"
                          placeholder="300 000 0000"
                          required
                          type="tel"
                          [value]="phone()"
                          (input)="phone.set($any($event.target).value)"
                        />
                        <span class="material-symbols-outlined absolute right-3 top-2.5 text-[#757682] text-[20px] pointer-events-none">smartphone</span>
                      </div>
                    </div>
                  </div>

                  <!-- Row 4: Password & Confirm -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="pwd1">
                        Contraseña <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <input
                          class="w-full h-11 pl-3.5 pr-10 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="pwd1"
                          placeholder="Mínimo 8 caracteres"
                          required
                          [type]="showPwd1() ? 'text' : 'password'"
                          [value]="pwd1()"
                          (input)="pwd1.set($any($event.target).value)"
                        />
                        <button
                          type="button"
                          (click)="showPwd1.set(!showPwd1())"
                          class="absolute right-2.5 top-2.5 text-[#757682] hover:text-[#111c2c] cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[18px]">
                            {{ showPwd1() ? 'visibility_off' : 'visibility' }}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="font-label-md text-[13px] text-[#001549] font-semibold flex items-center gap-1" for="pwd2">
                        Confirmar Contraseña <span class="text-[#ba1a1a] leading-none">*</span>
                      </label>
                      <div class="relative">
                        <input
                          [class.border-[#ba1a1a]]="state() === 'pwd'"
                          class="w-full h-11 pl-3.5 pr-10 bg-[#f0f3ff] text-[#111c2c] placeholder:text-[#757682] rounded-lg border border-[#c5c6d3]/60 focus:bg-white focus:border-[#0056c3] focus:ring-2 focus:ring-[#0056c3]/20 font-body-md text-[14px] transition-all outline-none"
                          id="pwd2"
                          placeholder="Repita su contraseña"
                          required
                          [type]="showPwd2() ? 'text' : 'password'"
                          [value]="pwd2()"
                          (input)="pwd2.set($any($event.target).value)"
                        />
                        <button
                          type="button"
                          (click)="showPwd2.set(!showPwd2())"
                          class="absolute right-2.5 top-2.5 text-[#757682] hover:text-[#111c2c] cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[18px]">
                            {{ showPwd2() ? 'visibility_off' : 'visibility' }}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Password Mismatch Inline Warning -->
                  @if (state() === 'pwd') {
                    <div class="p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-2 animate-fadeIn">
                      <span class="material-symbols-outlined text-[#ba1a1a] text-[20px]">lock_reset</span>
                      <span class="font-caption text-[12px] font-semibold">Las contraseñas ingresadas no coinciden. Por favor verifique nuevamente.</span>
                    </div>
                  }
                  @if (state() === 'error') {
                    <div class="p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-2"><span class="material-symbols-outlined">error</span><span class="font-caption text-[12px] font-semibold">No fue posible completar el registro. Verifique los datos e intente nuevamente.</span></div>
                  }

                  <!-- Security Tip Box -->
                  <div class="p-3 rounded-xl bg-[#f0f3ff] flex items-start gap-2 border border-[#e7eeff]">
                    <span class="material-symbols-outlined text-[#0056c3] text-[18px] mt-0.5">security</span>
                    <p class="font-caption text-[12px] text-[#444651]">
                      <strong class="text-[#001549] font-semibold">Consejo de Seguridad:</strong> Utilice al menos 8 caracteres combinando letras mayúsculas, minúsculas y números.
                    </p>
                  </div>

                  <!-- Terms Consent Checkbox -->
                  <div class="flex items-start gap-2.5 pt-1">
                    <input
                      checked
                      class="w-5 h-5 mt-0.5 rounded text-[#0056c3] focus:ring-[#0056c3] cursor-pointer accent-[#0056c3]"
                      id="termsConsent"
                      required
                      type="checkbox"
                    />
                    <label class="font-body-md text-[13px] text-[#444651] leading-relaxed cursor-pointer" for="termsConsent">
                      He leído y acepto los <a routerLink="/recuperar" class="text-[#0056c3] underline font-medium hover:text-[#006ef4]">Términos de Servicio</a> y la <a routerLink="/recuperar" class="text-[#0056c3] underline font-medium hover:text-[#006ef4]">Política de Tratamiento de Datos Personales de HIC e ICV</a>.
                    </label>
                  </div>

                  <!-- Primary Action Buttons -->
                  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button
                      class="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0056c3] text-white font-label-md text-[14px] font-semibold hover:bg-[#006ef4] transition-all shadow-[0_4px_14px_rgba(0,86,195,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                      type="submit" [disabled]="state() === 'loading'"
                    >
                      <span>{{ state() === 'loading' ? 'Registrando…' : 'Crear Cuenta de Paciente' }}</span>
                      <span class="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                    <a
                      routerLink="/login"
                      class="font-label-md text-[13px] text-[#0056c3] hover:text-[#006ef4] hover:underline font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>¿Ya tiene una cuenta? Iniciar sesión</span>
                      <span class="material-symbols-outlined text-[18px]">login</span>
                    </a>
                  </div>
                </form>
              </div>
            } @else {
              <!-- SUCCESS VIEW -->
              <div class="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,39,119,0.08)] border border-[#e7eeff] flex flex-col items-center text-center gap-4 animate-fadeIn">
                <div class="w-16 h-16 rounded-full bg-[#dee8ff] flex items-center justify-center text-[#0056c3] mb-1">
                  <span class="material-symbols-outlined text-[36px]">task_alt</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dee8ff] text-[#001549] font-caption text-[12px] font-semibold">
                  <span class="w-2 h-2 rounded-full bg-[#0056c3] animate-pulse"></span>
                  <span>Cuenta Registrada con Éxito</span>
                </div>
                <h2 class="font-headline-lg text-[24px] sm:text-[28px] text-[#001549] font-bold">¡Bienvenido al Portal de Citas HIC &amp; ICV!</h2>
                <p class="font-body-md text-[14px] text-[#444651] max-w-lg leading-relaxed">
                  Su cuenta de paciente ha sido activada satisfactoriamente. Hemos enviado una copia del comprobante de bienvenida y sus instrucciones a su correo electrónico.
                </p>

                <!-- Summary Micro-Card -->
                <div class="w-full max-w-md bg-[#f0f3ff] rounded-xl p-4 text-left flex flex-col gap-2 border border-[#e7eeff]">
                  <div class="flex justify-between items-center pb-2 border-b border-[#c5c6d3]/40">
                    <span class="font-caption text-[12px] text-[#757682]">Paciente:</span>
                    <span class="font-label-md text-[13px] text-[#001549] font-bold">{{ firstName() }} {{ lastName() }}</span>
                  </div>
                  <div class="flex justify-between items-center pb-2 border-b border-[#c5c6d3]/40">
                    <span class="font-caption text-[12px] text-[#757682]">Documento:</span>
                    <span class="font-label-md text-[13px] text-[#111c2c] font-semibold">{{ docType() }} {{ docNumber() }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-caption text-[12px] text-[#757682]">Centros Autorizados:</span>
                    <span class="font-label-md text-[13px] text-[#0056c3] font-semibold">HIC &amp; ICV Bucaramanga</span>
                  </div>
                </div>

                <!-- Direct CTA to Login -->
                <div class="pt-4 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    (click)="proceedToLogin()"
                    class="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0056c3] text-white font-label-md text-[14px] font-semibold hover:bg-[#006ef4] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <span>Ir al Inicio de Sesión</span>
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                  <button
                    (click)="applyState('default')"
                    class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#dee8ff] text-[#001549] font-label-md text-[14px] font-semibold hover:bg-[#cfdaf1] transition-all cursor-pointer"
                    type="button"
                  >
                    Nuevo Registro
                  </button>
                </div>
              </div>
            }
          </section>
        </div>

        <!-- Hospital Network Institutional Chips & Accreditations -->
        <div class="mt-10 pt-6 border-t border-[#c5c6d3]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span class="font-caption text-[12px] text-[#757682] uppercase tracking-wider font-semibold">Sedes Adscritas:</span>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-[#e7eeff] text-[#001549] font-caption text-[12px]">
                <span class="material-symbols-outlined text-[#0056c3] text-[16px]">local_hospital</span>
                <span>Hospital Internacional de Colombia (HIC)</span>
              </div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-[#e7eeff] text-[#001549] font-caption text-[12px]">
                <span class="material-symbols-outlined text-[#0056c3] text-[16px]">cardiology</span>
                <span>Fundación Cardiovascular de Colombia / ICV</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 text-[#757682] font-micro text-[11px] uppercase tracking-wider font-semibold">
            <span class="material-symbols-outlined text-[16px] text-[#0056c3]">lock</span>
            <span>Habeas Data Ley 1581 de 2012</span>
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
export class Register {
  clinicalState = inject(ClinicalDataState);
  router = inject(Router);
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  state = signal<RegisterState>('default');

  firstName = signal('');
  lastName = signal('');
  docType = signal('CC');
  docNumber = signal('');
  email = signal('');
  phone = signal('');
  pwd1 = signal('');
  pwd2 = signal('');

  showPwd1 = signal(false);
  showPwd2 = signal(false);

  applyState(st: RegisterState) {
    this.state.set(st);
  }

  handleRegisterSubmit(e: Event) {
    e.preventDefault();
    if (this.pwd1() !== this.pwd2()) {
      this.state.set('pwd');
      return;
    }
    this.state.set('loading');
    this.http.post(`${this.apiBaseUrl.replace('/api/v1', '')}/api/auth/register`, {
      names: this.firstName(),
      surnames: this.lastName(),
      documentType: this.docType(),
      documentNumber: this.docNumber(),
      email: this.email(),
      phone: this.phone(),
      password: this.pwd1(),
    }).subscribe({
      next: () => this.state.set('success'),
      error: (error) => this.state.set(error.status === 409 || error.status === 403 ? 'duplicate' : 'error'),
    });
  }

  proceedToLogin() {
    this.router.navigate(['/login']);
  }
}
