import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';

export interface CatalogItem {
  id: number;
  code: string;
  name: string;
}

export interface LocationItem extends CatalogItem {
  address: string;
}

export interface AvailabilityItem { slotId: number; startAt: string; endAt: string; professionalId: number; professionalCode: string; locationId: number; locationName: string; specialtyName: string; }
export interface AvailabilityResponse { date: string; durationMinutes: number; items: AvailabilityItem[]; }

@Injectable({ providedIn: 'root' })
export class CatalogApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  roles(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalogs/roles`);
  }

  appointmentStatuses(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalogs/appointment-statuses`);
  }

  rescheduleStatuses(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalogs/reschedule-statuses`);
  }

  regimes(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalogs/regimes`);
  }

  locations(): Observable<LocationItem[]> {
    return this.http.get<LocationItem[]>(`${this.baseUrl}/catalogs/locations`);
  }

  specialties(): Observable<CatalogItem[]> { return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalogs/specialties`); }
  availability(params: { date: string; specialtyId: number; locationId?: number; professionalId?: number }): Observable<AvailabilityResponse> {
    const query = new URLSearchParams({ date: params.date, specialtyId: String(params.specialtyId) });
    if (params.locationId) query.set('locationId', String(params.locationId));
    if (params.professionalId) query.set('professionalId', String(params.professionalId));
    return this.http.get<AvailabilityResponse>(`${this.baseUrl}/availability?${query}`);
  }
  createGeneralAppointment(slotId: number, specialtyId: number): Observable<unknown> { return this.http.post(`${this.baseUrl}/appointments/general`, { slotId, specialtyId }); }
  requestSpecializedAppointment(slotId: number, specialtyId: number): Observable<unknown> { return this.http.post(`${this.baseUrl}/appointments/specialized`, { slotId, specialtyId }); }
}
