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

/**
 * Especialidad activa tal como la ofrece `GET /catalogs/specialties`. `general` es la que decide
 * el endpoint de reserva: una general se auto-aprueba (HU-020) y una especializada nace en
 * `REQUESTED` (HU-021).
 */
export interface SpecialtyOption extends CatalogItem {
  durationMinutes: number;
  general: boolean;
  requiresAdminApproval: boolean;
  active: boolean;
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
  /** HU-022 CA-03: motivo del rechazo administrativo; null cuando no aplica. */
  reason: string | null;
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

/** Especialidad completa que ve el ADMIN, incluidas las desactivadas. */
export interface AdminSpecialty {
  id: number;
  code: string;
  name: string;
  durationMinutes: number;
  general: boolean;
  requiresAdminApproval: boolean;
  active: boolean;
}

export interface SpecialtyInput {
  code: string;
  name: string;
  durationMinutes: number;
  general: boolean;
  requiresAdminApproval: boolean;
}

/** Profesional con sus asignaciones, tal como lo lista el ADMIN. */
export interface AdminProfessional {
  id: number;
  professionalCode: string;
  licenseNumber: string;
  active: boolean;
  userId: number;
  name: string;
  email: string;
  specialties: { id: number; name: string; primary: boolean; active: boolean }[];
  locations: { id: number; name: string }[];
}

export interface ProfessionalInput {
  names: string;
  surnames: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  temporaryPassword: string;
  professionalCode: string;
  licenseNumber: string;
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

/** HU-007. Los únicos campos editables por su titular; el backend ignora cualquier otro. */
export interface ProfileUpdate {
  names?: string;
  surnames?: string;
  phone?: string;
}

/**
 * HU-008. La afiliación relaciona EPS, plan y régimen sin copiar sus nombres: el backend los
 * resuelve por JOIN, de modo que renombrar una EPS se refleja aquí sin migrar nada.
 */
export interface Affiliation {
  id: number;
  membershipNumber: string;
  planId: number;
  planName: string;
  epsId: number;
  epsName: string;
  regimeId: number;
  regimeName: string;
  /** false cuando la EPS o el plan fueron desactivados: la UI debe pedir que se actualice. */
  catalogActive: boolean;
}

export interface EpsPlanOption {
  id: number;
  code: string;
  name: string;
  regimeId: number;
  regimeName: string;
}

export interface AdminEps {
  id: number;
  code: string;
  name: string;
  active: boolean;
  planCount: number;
}

export interface AdminEpsPlan {
  id: number;
  epsId: number;
  epsName: string;
  regimeId: number;
  regimeName: string;
  code: string;
  name: string;
  active: boolean;
}

/** HU-025. Cita de la agenda propia del profesional. */
export interface AgendaItem {
  id: number;
  startAt: string;
  endAt: string;
  status: string;
  patientName: string;
  /** Documento y no datos de contacto: identifica al paciente sin exponer su directorio. */
  patientDocument: string;
  specialtyName: string;
  durationMinutes: number;
  locationId: number;
  locationName: string;
}

export interface AgendaResponse {
  from: string;
  to: string;
  items: AgendaItem[];
  count: number;
}

/** HU-031. Una transición auditada; actorId y actorName son null cuando la fuente es SYSTEM. */
export interface HistoryEntry {
  id: number;
  appointmentId: number;
  statusCode: string;
  changeSource: 'SYSTEM' | 'USER' | 'ADMIN';
  reason: string | null;
  changedAt: string;
  actorId: number | null;
  actorName: string | null;
}

export interface HistoryResponse {
  items: HistoryEntry[];
  count: number;
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

  /**
   * HU-019. Devuelve la especialidad completa, no solo su nombre: `general` decide si la reserva
   * se auto-aprueba o nace como solicitud, y deducirlo del nombre o del id sería inventar la regla
   * en el cliente.
   */
  specialties(): Observable<SpecialtyOption[]> { return this.http.get<SpecialtyOption[]>(`${this.baseUrl}/catalogs/specialties`); }
  availability(params: { date: string; specialtyId: number; locationId?: number; professionalId?: number }): Observable<AvailabilityResponse> {
    const query = new URLSearchParams({ date: params.date, specialtyId: String(params.specialtyId) });
    if (params.locationId) query.set('locationId', String(params.locationId));
    if (params.professionalId) query.set('professionalId', String(params.professionalId));
    return this.http.get<AvailabilityResponse>(`${this.baseUrl}/availability?${query}`);
  }
  createGeneralAppointment(slotId: number, specialtyId: number): Observable<unknown> { return this.http.post(`${this.baseUrl}/appointments/general`, { slotId, specialtyId }); }
  requestSpecializedAppointment(slotId: number, specialtyId: number): Observable<unknown> { return this.http.post(`${this.baseUrl}/appointments/specialized`, { slotId, specialtyId }); }
  me(): Observable<MeProfile> { return this.http.get<MeProfile>(`${this.baseUrl}/me`); }
  /** HU-022. Los filtros se aplican en el servidor: la proyección devuelve solo lo que corresponde. */
  myAppointments(filters: { status?: string; from?: string; to?: string } = {}): Observable<MyAppointment[]> {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    const suffix = query.size ? `?${query}` : "";
    return this.http.get<MyAppointment[]>(`${this.baseUrl}/me/appointments${suffix}`);
  }
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

  // --- Administración de especialidades y profesionales: HU-012 a HU-015 ---

  adminSpecialties(): Observable<AdminSpecialty[]> {
    return this.http.get<AdminSpecialty[]>(`${this.baseUrl}/admin/specialties`);
  }

  createSpecialty(specialty: SpecialtyInput): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/specialties`, specialty);
  }

  updateSpecialty(id: number, changes: { name?: string; durationMinutes?: number; active?: boolean }): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/admin/specialties/${id}`, changes);
  }

  adminProfessionals(): Observable<AdminProfessional[]> {
    return this.http.get<AdminProfessional[]>(`${this.baseUrl}/admin/professionals`);
  }

  createProfessional(professional: ProfessionalInput): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/professionals`, professional);
  }

  assignSpecialties(id: number, assignments: { id: number; primary: boolean }[]): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/admin/professionals/${id}/specialties`, { assignments });
  }

  assignLocations(id: number, ids: number[]): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/admin/professionals/${id}/locations`, { ids });
  }

  setProfessionalActive(id: number, active: boolean): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/admin/professionals/${id}/active`, { active });
  }

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

  // --- Perfil y afiliación: HU-007 y HU-008 ---

  updateProfile(changes: ProfileUpdate): Observable<MeProfile> {
    return this.http.patch<MeProfile>(`${this.baseUrl}/me`, changes);
  }

  myAffiliation(): Observable<{ affiliation: Affiliation | null }> {
    return this.http.get<{ affiliation: Affiliation | null }>(`${this.baseUrl}/me/insurance-affiliation`);
  }

  saveAffiliation(planId: number, membershipNumber: string): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/me/insurance-affiliation`, { planId, membershipNumber });
  }

  epsCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalogs/eps`);
  }

  epsPlans(epsId: number): Observable<EpsPlanOption[]> {
    return this.http.get<EpsPlanOption[]>(`${this.baseUrl}/catalogs/eps/${epsId}/plans`);
  }

  // --- Agenda y cierre de atención: HU-025 y HU-026 ---

  professionalAgenda(params: { from?: string; to?: string; locationId?: number; status?: string } = {}): Observable<AgendaResponse> {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.locationId) query.set('locationId', String(params.locationId));
    if (params.status) query.set('status', params.status);
    const suffix = query.size ? `?${query}` : '';
    return this.http.get<AgendaResponse>(`${this.baseUrl}/professional/appointments${suffix}`);
  }

  closeAttention(id: number, outcome: 'COMPLETED' | 'NO_SHOW', notes?: string): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/professional/appointments/${id}/attention`, { outcome, notes });
  }

  // --- EPS y planes como catálogo administrable: HU-010 y HU-011 ---

  adminEps(): Observable<AdminEps[]> {
    return this.http.get<AdminEps[]>(`${this.baseUrl}/admin/eps`);
  }

  createEps(code: string, name: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/eps`, { code, name });
  }

  updateEps(id: number, changes: { name?: string; active?: boolean }): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/admin/eps/${id}`, changes);
  }

  adminEpsPlans(epsId?: number): Observable<AdminEpsPlan[]> {
    const suffix = epsId ? `?epsId=${epsId}` : '';
    return this.http.get<AdminEpsPlan[]>(`${this.baseUrl}/admin/eps-plans${suffix}`);
  }

  createEpsPlan(plan: { epsId: number; regimeId: number; code: string; name: string }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/eps-plans`, plan);
  }

  updateEpsPlan(id: number, changes: { name?: string; regimeId?: number; active?: boolean }): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/admin/eps-plans/${id}`, changes);
  }

  // --- Auditoría de estados: HU-031 ---

  appointmentHistory(params: { appointmentId?: number; from?: string; to?: string; limit?: number } = {}): Observable<HistoryResponse> {
    const query = new URLSearchParams();
    if (params.appointmentId) query.set('appointmentId', String(params.appointmentId));
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.size ? `?${query}` : '';
    return this.http.get<HistoryResponse>(`${this.baseUrl}/admin/appointment-history${suffix}`);
  }
}
