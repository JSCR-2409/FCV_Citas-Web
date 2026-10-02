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

/** Solicitud especializada pendiente, tal como la entrega GET /admin/specialized-requests. */
export interface SpecializedRequest {
  id: number;
  patientUserId: number;
  patientName: string;
  professionalId: number;
  professionalCode: string;
  locationId: number;
  locationName: string;
  specialtyId: number;
  specialtyName: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  status: string;
}

/** Perfil propio que entrega GET /me. */
export interface MeProfile {
  id: number;
  names: string;
  surnames: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  active?: boolean;
  role?: string;
}

/** Cita del paciente tal como la entrega GET /me/appointments. */
export interface MyAppointment {
  id: number;
  startAt: string;
  endAt: string;
  status: string;
  specialty: string;
  doctorName: string;
  facility: string;
  facilityFullName: string;
  /** Necesarios para reprogramar: la nueva franja conserva profesional y especialidad. */
  professionalId: number;
  specialtyId: number;
  durationMinutes: number;
}

/** Solicitud de reprogramación vista por el paciente. */
export interface MyRescheduleRequest {
  id: number;
  appointmentId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  previousStartAt: string;
  requestedStartAt: string;
  decisionReason: string | null;
  patientAction: string | null;
  specialtyName: string;
  locationName: string;
}

/** Solicitud de reprogramación pendiente, tal como la ve el ADMIN. */
export interface RescheduleRequest {
  id: number;
  appointmentId: number;
  patientName: string;
  professionalId: number;
  professionalCode: string;
  professionalName: string;
  specialtyId: number;
  specialtyName: string;
  durationMinutes: number;
  locationId: number;
  locationName: string;
  previousStartAt: string;
  previousEndAt: string;
  requestedStartAt: string;
  requestedEndAt: string;
  status: string;
}

export interface DecisionResult {
  id: number;
  status: 'APPROVED' | 'REJECTED';
  reason: string;
}

/** Bloque de disponibilidad del profesional, tal como lo entrega el calendario. */
export interface AvailabilityBlock {
  id: number;
  locationId: number;
  locationName: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface AvailabilityBlockInput {
  locationId: number;
  availableDate: string;
  startTime: string;
  endTime: string;
}

export interface SpecializedRequestFilters {
  locationId?: number;
  professionalId?: number;
  specialtyId?: number;
  date?: string;
}

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
  me(): Observable<MeProfile> { return this.http.get<MeProfile>(`${this.baseUrl}/me`); }
  myAppointments(): Observable<MyAppointment[]> { return this.http.get<MyAppointment[]>(`${this.baseUrl}/me/appointments`); }
  specializedRequests(filters: SpecializedRequestFilters = {}): Observable<SpecializedRequest[]> {
    const query = new URLSearchParams();
    if (filters.locationId) query.set('locationId', String(filters.locationId));
    if (filters.professionalId) query.set('professionalId', String(filters.professionalId));
    if (filters.specialtyId) query.set('specialtyId', String(filters.specialtyId));
    if (filters.date) query.set('date', filters.date);
    const suffix = query.size ? `?${query}` : '';
    return this.http.get<SpecializedRequest[]>(`${this.baseUrl}/admin/specialized-requests${suffix}`);
  }
  decideSpecializedRequest(id: number, status: 'APPROVED'|'REJECTED', reason?: string): Observable<DecisionResult> { return this.http.patch<DecisionResult>(`${this.baseUrl}/admin/specialized-requests/${id}`, { status, reason }); }
  cancelAppointment(id: number): Observable<void> { return this.http.patch<void>(`${this.baseUrl}/me/appointments/${id}/cancel`, {}); }

  // --- Bloques de disponibilidad del profesional: HU-016, HU-017 y HU-018 ---

  availabilityBlocks(from?: string, to?: string): Observable<AvailabilityBlock[]> {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    const suffix = query.size ? `?${query}` : '';
    return this.http.get<AvailabilityBlock[]>(`${this.baseUrl}/professional/availability-blocks${suffix}`);
  }

  createAvailabilityBlock(block: AvailabilityBlockInput): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.baseUrl}/professional/availability-blocks`, block);
  }

  updateAvailabilityBlock(id: number, block: AvailabilityBlockInput): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/professional/availability-blocks/${id}`, block);
  }

  deleteAvailabilityBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/professional/availability-blocks/${id}`);
  }

  // --- Reprogramación: HU-024 (paciente), HU-029 y HU-030 (ADMIN) ---

  requestReschedule(appointmentId: number, slotId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/me/appointments/${appointmentId}/reschedule-requests`, { slotId });
  }

  myRescheduleRequests(): Observable<MyRescheduleRequest[]> {
    return this.http.get<MyRescheduleRequest[]>(`${this.baseUrl}/me/reschedule-requests`);
  }

  respondAfterRejection(requestId: number, action: 'KEEP_APPOINTMENT' | 'CANCEL_APPOINTMENT'): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/me/reschedule-requests/${requestId}/action`, { action });
  }

  rescheduleRequests(filters: SpecializedRequestFilters = {}): Observable<RescheduleRequest[]> {
    const query = new URLSearchParams();
    if (filters.locationId) query.set('locationId', String(filters.locationId));
    if (filters.professionalId) query.set('professionalId', String(filters.professionalId));
    if (filters.specialtyId) query.set('specialtyId', String(filters.specialtyId));
    if (filters.date) query.set('date', filters.date);
    const suffix = query.size ? `?${query}` : '';
    return this.http.get<RescheduleRequest[]>(`${this.baseUrl}/admin/reschedule-requests${suffix}`);
  }

  decideReschedule(id: number, status: 'APPROVED' | 'REJECTED', reason?: string): Observable<DecisionResult> {
    return this.http.patch<DecisionResult>(`${this.baseUrl}/admin/reschedule-requests/${id}`, { status, reason });
  }
}
