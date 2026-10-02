import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';

import { ClinicalDataState } from './clinical-data';
import { MyAppointment } from './catalog-api';

/**
 * HU-022 consultar mis citas. La tarjeta del portal mostraba apps[0] sobre una lista ordenada de
 * forma descendente, asi que presentaba la cita mas lejana como si fuera la siguiente, y el
 * contador de "proximas" incluia las canceladas.
 */
describe('ClinicalDataState — clasificacion de citas', () => {
  let state: ClinicalDataState;

  const appointment = (id: number, status: string, startAt: string): MyAppointment => ({
    id,
    startAt,
    endAt: startAt,
    status,
    specialty: 'Medicina General',
    doctorName: 'Andrea Ruiz',
    facility: 'HIC',
    facilityFullName: 'Hospital Internacional de Colombia (HIC)',
    professionalId: 1,
    specialtyId: 1,
    durationMinutes: 30,
  });

  const future = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 19);
  const past = (days: number) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 19);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    state = TestBed.inject(ClinicalDataState);
  });

  it('ordena las proximas de la mas cercana a la mas lejana', () => {
    state.setAppointmentsFromApi([
      appointment(10, 'APPROVED', future(4)),
      appointment(9, 'APPROVED', future(1)),
      appointment(11, 'APPROVED', future(2)),
    ]);

    expect(state.upcomingAppointments().map(a => a.id)).toEqual(['9', '11', '10']);
    expect(state.nextAppointment()?.id).toBe('9');
  });

  it('excluye de proximas las canceladas y rechazadas', () => {
    state.setAppointmentsFromApi([
      appointment(8, 'CANCELLED', future(1)),
      appointment(9, 'APPROVED', future(2)),
      appointment(12, 'REJECTED', future(3)),
    ]);

    expect(state.upcomingAppointments().map(a => a.id)).toEqual(['9']);
    expect(state.pastAppointments().map(a => a.id)).toEqual(['12', '8']);
  });

  it('excluye de proximas las que ya ocurrieron, aunque sigan aprobadas', () => {
    state.setAppointmentsFromApi([
      appointment(5, 'APPROVED', past(1)),
      appointment(6, 'APPROVED', future(1)),
    ]);

    expect(state.upcomingAppointments().map(a => a.id)).toEqual(['6']);
    expect(state.pastAppointments().map(a => a.id)).toEqual(['5']);
  });

  it('cuenta una solicitud pendiente como proxima', () => {
    state.setAppointmentsFromApi([appointment(7, 'REQUESTED', future(1))]);

    expect(state.upcomingAppointments()).toHaveLength(1);
    expect(state.upcomingAppointments()[0].status).toBe('En Espera');
  });

  it('traduce los seis estados del PRD', () => {
    state.setAppointmentsFromApi([
      appointment(1, 'APPROVED', future(1)),
      appointment(2, 'REQUESTED', future(2)),
      appointment(3, 'COMPLETED', past(1)),
      appointment(4, 'CANCELLED', past(2)),
      appointment(5, 'REJECTED', past(3)),
      appointment(6, 'NO_SHOW', past(4)),
    ]);

    const labels = state.appointments().map(a => a.status);
    expect(labels).toEqual(expect.arrayContaining([
      'Confirmada', 'En Espera', 'Atendida', 'Cancelada', 'Rechazada', 'No asistió',
    ]));
  });

  it('solo permite cancelar una cita vigente y futura', () => {
    state.setAppointmentsFromApi([
      appointment(1, 'APPROVED', future(1)),
      appointment(2, 'APPROVED', past(1)),
      appointment(3, 'CANCELLED', future(1)),
    ]);
    const byId = new Map(state.appointments().map(a => [a.id, a]));

    expect(state.canBeCancelled(byId.get('1')!)).toBe(true);
    expect(state.canBeCancelled(byId.get('2')!)).toBe(false);
    expect(state.canBeCancelled(byId.get('3')!)).toBe(false);
  });
});
