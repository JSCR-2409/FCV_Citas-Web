import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ClinicalDataState } from '../services/clinical-data';

@Component({
  selector: 'app-header-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="fixed top-0 w-full z-50 bg-[#ffffff]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,39,119,0.06)] border-b border-[#e7eeff]">
      <div class="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        
        <!-- Left: Logo & Brand -->
        <div class="flex items-center gap-3 sm:gap-4">
          <a routerLink="/login" class="flex items-center gap-2.5 focus:outline-none group">
            <img
              alt="Portal de Citas Brand Mark"
              class="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              referrerpolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WfmbsGI9-6-64N8xor7CyDzAEcSIp34RH028KYRRrXL3NVPIeZjkcK2bUzG6ifXKwdcsEf5TsXsDBKhFchskmE1whV_XzVRCXUf_AJpNI5No7H3eDdTCJO1_Bx6yBSsZnnkOWrgI9vh7-vYfMA30xE63MVOBajGWjGqyFCDpCJpfu1JbAzPa5HmooAeTWTRSNH9ARf5kG0iz7k8oaZYSpAO2Q5Og5r6SXQWWH0u9x_PPiJFUJfwHw55A"
            />
            <div class="flex flex-col">
              <span class="font-headline-md text-[16px] tracking-tight text-[#001549] leading-none font-bold">Portal de Citas</span>
              <span class="font-micro text-[10px] uppercase tracking-wider text-[#757682] mt-0.5 font-semibold">Red Hospitalaria HIC &amp; ICV</span>
            </div>
          </a>

          <!-- Integrated Centers Chip -->
          <div class="hidden lg:flex items-center gap-1 pl-3 ml-2 border-l border-[#c5c6d3]/40">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#dee8ff] text-[#001549] font-caption text-[12px] font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-[#0056c3] mr-1.5 animate-pulse"></span>
              Centros Integrados: HIC &amp; ICV
            </span>
          </div>
        </div>

        <!-- Center: navegación contextual, sin exponer autenticación dentro del portal -->
        @if (clinicalState.currentUser()) { <div class="hidden xl:flex items-center bg-[#f0f3ff] p-1 rounded-lg gap-0.5 border border-[#c5c6d3]/40">
          <a
            routerLink="/portal/paciente"
            routerLinkActive="bg-[#ffffff] text-[#001549] shadow-sm font-semibold"
            class="px-2.5 py-1 text-[12px] rounded-md text-[#444651] hover:text-[#001549] transition-all"
          >
            Portal Paciente
          </a>
          <a
            routerLink="/portal/medico"
            routerLinkActive="bg-[#ffffff] text-[#001549] shadow-sm font-semibold"
            class="px-2.5 py-1 text-[12px] rounded-md text-[#444651] hover:text-[#001549] transition-all"
          >
            Panel Médico
          </a>
          <a
            routerLink="/portal/admin"
            routerLinkActive="bg-[#ffffff] text-[#001549] shadow-sm font-semibold"
            class="px-2.5 py-1 text-[12px] rounded-md text-[#444651] hover:text-[#001549] transition-all"
          >
            Consola Admin
          </a>
        </div> }

        <!-- Right: Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden md:flex items-center gap-1">
            <button
              class="inline-flex items-center gap-1 text-[#444651] hover:text-[#001549] font-label-md text-[13px] px-2 py-1.5 rounded-md hover:bg-[#f0f3ff] transition-colors"
              type="button"
              title="Centro de ayuda y soporte"
            >
              <span class="material-symbols-outlined text-[18px]">help</span>
              <span>Ayuda</span>
            </button>
            <button
              class="inline-flex items-center gap-1 text-[#444651] hover:text-[#001549] font-label-md text-[13px] px-2 py-1.5 rounded-md hover:bg-[#f0f3ff] transition-colors"
              type="button"
              title="Idioma"
            >
              <span class="material-symbols-outlined text-[18px]">language</span>
              <span>ES</span>
            </button>
          </div>

          @if (!clinicalState.currentUser()) {
            <a
              routerLink="/login"
              class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#0056c3] text-white font-label-md text-[13px] font-semibold hover:bg-[#006ef4] transition-all shadow-[0_2px_8px_rgba(0,86,195,0.25)]"
            >
              Acceso Pacientes
            </a>
          } @else {
            <div class="flex items-center gap-2">
              <span class="hidden sm:inline-block text-[13px] font-medium text-[#001549]">
                {{ clinicalState.currentUser()?.name }}
              </span>
              <button
                (click)="clinicalState.logout()"
                class="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-all text-[12px] font-semibold"
                type="button"
              >
                <span class="material-symbols-outlined text-[16px] mr-1">logout</span>
                Salir
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderNav {
  clinicalState = inject(ClinicalDataState);
}
