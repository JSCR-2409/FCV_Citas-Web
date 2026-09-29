import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderNav} from './components/header-nav';
import { inject } from '@angular/core';
import { ClinicalDataState } from './services/clinical-data';
import { CatalogApi } from './services/catalog-api';
import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderNav],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  clinicalState = inject(ClinicalDataState);
  private catalogApi = inject(CatalogApi);
  private router = inject(Router);
  isPublicRoute() { return ['/login', '/registro', '/recuperar'].some(path => this.router.url.startsWith(path)); }
  constructor() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('fcv_access_token')) this.catalogApi.me().subscribe({ next: profile => this.catalogApi.myAppointments().subscribe({ next: appointments => this.clinicalState.hydrateFromApi(profile, appointments), error: () => this.clinicalState.hydrateFromApi(profile, []) }), error: () => { this.clinicalState.currentUser.set(null); localStorage.removeItem('fcv_access_token'); localStorage.removeItem('hic_active_user'); } });
  }
}
