import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClinicalDataState } from '../services/clinical-data';
import { AgendaItem, AvailabilityBlock, CatalogApi, LocationItem } from '../services/catalog-api';

/**
 * Portal del profesional. Cubre HU-016 crear bloques, HU-017 modificar o eliminar bloques futuros,
 * HU-018 consultar el calendario propio, HU-025 la agenda de pacientes y HU-026 el cierre de la
 * atención como atendida o no asistió.
 *
 * El profesional nunca se identifica por un parámetro: el backend lo deriva del token, de modo que
 * no existe forma de pedir la agenda de otro.
 */
@Component({
  selector: 'app-doctor-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] w-full">

      <!-- Left Sidebar -->
      <aside class="w-full lg:w-64 bg-[#001549] text-white p-5 flex flex-col justify-between shadow-xl flex-shrink-0">
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-1 pb-4 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#afc6ff] text-[22px]">stethoscope</span>
              <span class="font-headline-md text-[16px] text-white font-bold tracking-tight">Panel Médico</span>
            </div>
            <span class="font-micro text-[10px] uppercase tracking-wider text-[#dee8ff]">Centros Integrados HIC &amp; ICV</span>
            <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-[#dce1ff] text-[11px] font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#006ef4]"></span>
              <span>PROFESIONAL DE LA SALUD</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-micro text-[10px] uppercase tracking-wider text-[#afc6ff] font-semibold">Mi disponibilidad</span>
            <div class="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
              <span class="text-[22px] font-bold text-white">{{ blocks().length }}</span>
              <span class="text-[11px] text-[#dce1ff]">
                bloque{{ blocks().length === 1 ? '' : 's' }} publicado{{ blocks().length === 1 ? '' : 's' }}
                en el rango consultado
              </span>
            </div>
            <div class="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
              <span class="text-[22px] font-bold text-white">{{ totalSlots() }}</span>
              <span class="text-[11px] text-[#dce1ff]">franjas de 30 minutos generadas</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 pt-4 border-t border-white/10">
          <span class="font-caption text-[12px] text-white font-semibold">
            {{ clinicalState.currentUser()?.name }}
          </span>
          <span class="font-micro text-[10px] text-[#afc6ff]">{{ clinicalState.currentUser()?.email }}</span>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col bg-[#f9f9ff]">
        <main class="flex-1 p-5 sm:p-8 flex flex-col gap-6 max-w-5xl w-full mx-auto">

          <header class="flex flex-col gap-1">
            <span class="font-micro text-[11px] uppercase tracking-wider text-[#757682] font-semibold">
              Gestión de agenda
            </span>
            <h1 class="font-headline-xl text-[26px] font-bold text-[#001549]">Bloques de disponibilidad</h1>
            <p class="font-body-md text-[13px] text-[#444651]">
              Cada bloque se divide en franjas de 30 minutos. La duración de la cita la fija la
              especialidad, no el bloque: una especialidad de 60 minutos ocupa dos franjas seguidas.
            </p>
          </header>

          @if (notice()) {
            <p class="p-3 rounded-xl bg-[#e6f6ec] text-[#14532d] text-[13px] border border-[#bbe5c8]" role="status">
              {{ notice() }}
            </p>
          }
          @if (error()) {
            <p class="p-3 rounded-xl bg-[#fdecec] text-[#7f1d1d] text-[13px] border border-[#f5c2c2]" role="alert">
              {{ error() }}
            </p>
          }

          <!-- HU-016: alta de bloque -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eeff] flex flex-col gap-4">
            <h2 class="font-label-md text-[15px] text-[#001549] font-bold">
              {{ editingId() ? 'Modificar bloque #' + editingId() : 'Publicar un bloque' }}
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="flex flex-col gap-1">
                <label for="blk-sede" class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Sede</label>
                <select
                  id="blk-sede"
                  [value]="formLocationId() ?? ''"
                  (change)="formLocationId.set(Number($any($event.target).value))"
                  class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[13px]"
                >
                  @for (location of locations(); track location.id) {
                    <option [value]="location.id">{{ location.name }}</option>
                  }
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label for="blk-fecha" class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Fecha</label>
                <input
                  id="blk-fecha"
                  type="date"
                  [value]="formDate()"
                  [min]="tomorrow()"
                  (change)="formDate.set($any($event.target).value)"
                  class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[13px]"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="blk-inicio" class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Desde</label>
                <select
                  id="blk-inicio"
                  [value]="formStart()"
                  (change)="formStart.set($any($event.target).value)"
                  class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[13px]"
                >
                  @for (time of halfHours(); track time) {
                    <option [value]="time">{{ time }}</option>
                  }
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label for="blk-fin" class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Hasta</label>
                <select
                  id="blk-fin"
                  [value]="formEnd()"
                  (change)="formEnd.set($any($event.target).value)"
                  class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[13px]"
                >
                  @for (time of halfHours(); track time) {
                    <option [value]="time">{{ time }}</option>
                  }
                </select>
              </div>
            </div>

            <p class="text-[12px] text-[#444651]">
              La fecha debe ser futura y los límites deben caer en horas o medias horas. No puede
              solaparse con otro bloque suyo en la misma sede.
            </p>

            <div class="flex justify-end gap-2">
              @if (editingId()) {
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="px-4 py-2 rounded-xl bg-white text-[#111c2c] border border-[#e7eeff] text-[13px] font-semibold cursor-pointer"
                >
                  Cancelar edición
                </button>
              }
              <button
                type="button"
                [disabled]="saving()"
                (click)="save()"
                class="px-5 py-2 rounded-xl bg-[#0056c3] text-white text-[13px] font-semibold hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer"
              >
                {{ editingId() ? 'Guardar cambios' : 'Publicar bloque' }}
              </button>
            </div>
          </section>

          <!-- HU-018: calendario propio -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eeff] flex flex-col gap-4">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <h2 class="font-label-md text-[15px] text-[#001549] font-bold">Mi calendario</h2>
              <div class="flex flex-wrap items-end gap-2">
                <div class="flex flex-col gap-1">
                  <label for="rng-desde" class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Desde</label>
                  <input
                    id="rng-desde"
                    type="date"
                    [value]="rangeFrom()"
                    (change)="rangeFrom.set($any($event.target).value); load()"
                    class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[13px]"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label for="rng-hasta" class="text-[11px] font-bold text-[#001549] uppercase tracking-wider">Hasta</label>
                  <input
                    id="rng-hasta"
                    type="date"
                    [value]="rangeTo()"
                    (change)="rangeTo.set($any($event.target).value); load()"
                    class="px-3 py-2 rounded-lg border border-[#e7eeff] text-[13px]"
                  />
                </div>
              </div>
            </div>

            @if (loading()) {
              <p class="p-3 text-[13px] text-[#444651]">Cargando calendario…</p>
            } @else if (blocks().length === 0) {
              <p class="p-4 rounded-xl bg-[#f0f3ff] text-[13px] text-[#444651] border border-[#e7eeff]">
                No tiene bloques publicados en este rango. Publique uno arriba para empezar a
                ofrecer disponibilidad.
              </p>
            } @else {
              <div class="flex flex-col gap-2">
                @for (block of blocks(); track block.id) {
                  <div class="p-3 rounded-xl bg-[#f0f3ff] border border-[#e7eeff] flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-col">
                      <span class="font-label-md text-[13px] text-[#001549] font-bold">
                        {{ block.availableDate | date:'EEEE d MMMM y' }}
                      </span>
                      <span class="font-caption text-[12px] text-[#444651]">
                        {{ block.startTime.slice(0, 5) }} – {{ block.endTime.slice(0, 5) }}
                        · {{ block.locationName }}
                        · {{ slotsOf(block) }} franjas
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="startEdit(block)"
                        class="px-2.5 py-1 rounded bg-[#dee8ff] text-[#001549] text-[11px] font-semibold hover:bg-[#cfdaf1] cursor-pointer"
                      >
                        Modificar
                      </button>
                      <button
                        type="button"
                        [disabled]="deletingId() === block.id"
                        (click)="remove(block.id)"
                        class="px-2.5 py-1 rounded bg-white text-[#7f1d1d] border border-[#f5c2c2] text-[11px] font-semibold hover:bg-[#fdecec] disabled:opacity-50 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

          <!-- HU-025 agenda propia y HU-026 cierre de atención -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eeff] flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#dee8ff] text-[#0056c3] flex items-center justify-center">
                  <span class="material-symbols-outlined text-[22px]">patient_list</span>
                </div>
                <div class="flex flex-col">
                  <h2 class="font-label-md text-[15px] text-[#001549] font-bold">Agenda de pacientes</h2>
                  <span class="font-caption text-[11px] text-[#757682]">
                    Solo sus propias citas: el backend las deriva del token.
                  </span>
                </div>
              </div>
              <div class="flex flex-wrap items-end gap-2">
                <div class="flex flex-col gap-1">
                  <label class="font-caption text-[11px] text-[#757682]" for="agendaFrom">Desde</label>
                  <input id="agendaFrom" type="date" [value]="agendaFrom()"
                    (change)="agendaFrom.set($any($event.target).value)"
                    class="px-2.5 py-1.5 rounded-lg border border-[#c3c5d4] text-[12px] text-[#001549]" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="font-caption text-[11px] text-[#757682]" for="agendaTo">Hasta</label>
                  <input id="agendaTo" type="date" [value]="agendaTo()"
                    (change)="agendaTo.set($any($event.target).value)"
                    class="px-2.5 py-1.5 rounded-lg border border-[#c3c5d4] text-[12px] text-[#001549]" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="font-caption text-[11px] text-[#757682]" for="agendaLocation">Sede</label>
                  <select id="agendaLocation" [value]="agendaLocationId() ?? ''"
                    (change)="agendaLocationId.set($any($event.target).value ? Number($any($event.target).value) : null)"
                    class="px-2.5 py-1.5 rounded-lg border border-[#c3c5d4] text-[12px] text-[#001549]">
                    <option value="">Todas</option>
                    @for (site of locations(); track site.id) { <option [value]="site.id">{{ site.name }}</option> }
                  </select>
                </div>
                <button type="button" (click)="loadAgenda()" [disabled]="agendaLoading()"
                  class="px-3 py-1.5 rounded-lg bg-[#0056c3] text-white text-[12px] font-semibold hover:bg-[#006ef4] disabled:opacity-50 cursor-pointer">
                  Consultar
                </button>
              </div>
            </div>

            @if (agendaError()) {
              <div class="p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[12px]">{{ agendaError() }}</div>
            }
            @if (agendaNotice()) {
              <div class="p-3 rounded-lg bg-[#dee8ff] text-[#001549] text-[12px]">{{ agendaNotice() }}</div>
            }

            @if (agendaLoading()) {
              <p class="font-body-md text-[13px] text-[#757682]">Cargando la agenda…</p>
            } @else if (agenda().length === 0) {
              <p class="font-body-md text-[13px] text-[#757682]">
                No hay citas en el rango consultado.
              </p>
            } @else {
              <div class="flex flex-col gap-2">
                @for (item of agenda(); track item.id) {
                  <div class="p-4 rounded-xl border border-[#e7eeff] bg-[#fbfcff] flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-col gap-0.5 min-w-[220px]">
                      <span class="font-label-md text-[13px] text-[#001549] font-semibold">{{ item.patientName }}</span>
                      <span class="font-caption text-[11px] text-[#757682]">{{ item.patientDocument }}</span>
                      <span class="font-caption text-[11px] text-[#444651]">
                        {{ item.startAt | date: 'EEE d MMM, HH:mm' }} · {{ item.durationMinutes }} min
                      </span>
                      <span class="font-caption text-[11px] text-[#444651]">
                        {{ item.specialtyName }} · {{ item.locationName }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold"
                        [class]="item.status === 'APPROVED' ? 'bg-[#dee8ff] text-[#001549]'
                          : item.status === 'COMPLETED' ? 'bg-[#dcf4e4] text-[#13532f]'
                          : 'bg-[#ffe2c7] text-[#7a3d00]'">
                        {{ statusLabel(item.status) }}
                      </span>
                      <!-- HU-026: solo una cita APPROVED cuya hora ya pasó es cerrable. Deshabilitar
                           el botón evita un 409 previsible; el backend lo vuelve a comprobar. -->
                      @if (item.status === 'APPROVED') {
                        <button type="button" (click)="close(item.id, 'COMPLETED')"
                          [disabled]="closingId() === item.id || !hasStarted(item.startAt)"
                          [title]="hasStarted(item.startAt) ? 'Marcar como atendida' : 'La cita aún no ha comenzado'"
                          class="px-2.5 py-1 rounded bg-[#13532f] text-white text-[11px] font-semibold hover:bg-[#1a6b3d] disabled:opacity-40 cursor-pointer">
                          Atendida
                        </button>
                        <button type="button" (click)="close(item.id, 'NO_SHOW')"
                          [disabled]="closingId() === item.id || !hasStarted(item.startAt)"
                          [title]="hasStarted(item.startAt) ? 'Marcar como no asistió' : 'La cita aún no ha comenzado'"
                          class="px-2.5 py-1 rounded bg-white text-[#7a3d00] border border-[#e9c89d] text-[11px] font-semibold hover:bg-[#fff6ea] disabled:opacity-40 cursor-pointer">
                          No asistió
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </section>

        </main>
      </div>
    </div>
  `,
})
export class DoctorPortal implements OnInit {
  clinicalState = inject(ClinicalDataState);
  private catalogApi = inject(CatalogApi);

  locations = signal<LocationItem[]>([]);
  blocks = signal<AvailabilityBlock[]>([]);
  loading = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  editingId = signal<number | null>(null);
  notice = signal('');
  error = signal('');

  rangeFrom = signal(this.isoToday());
  rangeTo = signal(this.isoPlusDays(60));

  formLocationId = signal<number | null>(null);
  formDate = signal(this.isoPlusDays(1));
  formStart = signal('08:00');
  formEnd = signal('12:00');

  // HU-025 y HU-026
  agenda = signal<AgendaItem[]>([]);
  agendaLoading = signal(false);
  agendaError = signal('');
  agendaNotice = signal('');
  agendaFrom = signal(this.isoToday());
  agendaTo = signal(this.isoPlusDays(7));
  agendaLocationId = signal<number | null>(null);
  closingId = signal<number | null>(null);

  protected readonly Number = Number;

  private static readonly AGENDA_STATUS_LABELS: Record<string, string> = {
    APPROVED: 'Confirmada',
    COMPLETED: 'Atendida',
    NO_SHOW: 'No asistió',
    REQUESTED: 'En revisión',
    CANCELLED: 'Cancelada',
    REJECTED: 'Rechazada',
  };

  statusLabel(code: string): string {
    return DoctorPortal.AGENDA_STATUS_LABELS[code] ?? code;
  }

  /** HU-026: la atención solo se cierra una vez comenzada. */
  hasStarted(startAt: string): boolean {
    return new Date(startAt).getTime() <= Date.now();
  }

  loadAgenda() {
    this.agendaLoading.set(true);
    this.agendaError.set('');
    this.catalogApi.professionalAgenda({
      from: this.agendaFrom(),
      to: this.agendaTo(),
      locationId: this.agendaLocationId() ?? undefined,
    }).subscribe({
      next: response => { this.agenda.set(response.items); this.agendaLoading.set(false); },
      error: err => {
        this.agendaLoading.set(false);
        this.agendaError.set(err.status === 403
          ? 'Su usuario no tiene una ficha de profesional activa.'
          : 'No fue posible cargar la agenda.');
      },
    });
  }

  close(id: number, outcome: 'COMPLETED' | 'NO_SHOW') {
    this.closingId.set(id);
    this.agendaError.set('');
    this.agendaNotice.set('');
    this.catalogApi.closeAttention(id, outcome).subscribe({
      next: () => {
        this.closingId.set(null);
        this.agendaNotice.set(outcome === 'COMPLETED'
          ? 'La atención quedó registrada como atendida.'
          : 'La cita quedó registrada como no asistida.');
        // Se recarga desde el servidor en lugar de mutar la lista: el estado real lo decide el
        // backend, y así un conflicto no deja la pantalla mostrando algo que no ocurrió.
        this.loadAgenda();
      },
      error: err => {
        this.closingId.set(null);
        this.agendaError.set(err.status === 409
          ? 'La cita no es cerrable: debe estar confirmada y haber comenzado.'
          : 'No fue posible cerrar la atención.');
      },
    });
  }

  ngOnInit() {
    this.catalogApi.locations().subscribe({
      next: items => {
        this.locations.set(items);
        if (this.formLocationId() === null) this.formLocationId.set(items[0]?.id ?? null);
      },
      error: () => this.error.set('No fue posible cargar las sedes.'),
    });
    this.load();
    this.loadAgenda();
  }

  /** HU-018: solo el calendario propio. El backend lo deriva del token, no de un id de la URL. */
  load() {
    this.loading.set(true);
    this.catalogApi.availabilityBlocks(this.rangeFrom(), this.rangeTo()).subscribe({
      next: items => {
        this.blocks.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.blocks.set([]);
        this.loading.set(false);
        this.error.set('No fue posible cargar el calendario.');
      },
    });
  }

  /** HU-016 al publicar y HU-017 al modificar: el backend aplica todas las validaciones. */
  save() {
    const locationId = this.formLocationId();
    if (!locationId) {
      this.error.set('Seleccione una sede.');
      return;
    }
    if (this.formEnd() <= this.formStart()) {
      this.error.set('La hora final debe ser posterior a la inicial.');
      return;
    }

    const payload = {
      locationId,
      availableDate: this.formDate(),
      startTime: this.formStart(),
      endTime: this.formEnd(),
    };
    const editing = this.editingId();
    const request = editing
      ? this.catalogApi.updateAvailabilityBlock(editing, payload)
      : this.catalogApi.createAvailabilityBlock(payload);

    this.saving.set(true);
    this.error.set('');
    this.notice.set('');
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notice.set(editing ? `Bloque #${editing} actualizado.` : 'Bloque publicado.');
        this.editingId.set(null);
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(this.messageOf(err, 'No fue posible guardar el bloque.'));
      },
    });
  }

  startEdit(block: AvailabilityBlock) {
    this.editingId.set(block.id);
    this.formLocationId.set(block.locationId);
    this.formDate.set(block.availableDate.slice(0, 10));
    this.formStart.set(block.startTime.slice(0, 5));
    this.formEnd.set(block.endTime.slice(0, 5));
    this.notice.set('');
    this.error.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.error.set('');
  }

  /** HU-017 CA-02: un bloque con cita comprometida no se puede eliminar; el backend responde 409. */
  remove(id: number) {
    this.deletingId.set(id);
    this.error.set('');
    this.notice.set('');
    this.catalogApi.deleteAvailabilityBlock(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.notice.set(`Bloque #${id} eliminado.`);
        if (this.editingId() === id) this.editingId.set(null);
        this.load();
      },
      error: (err: unknown) => {
        this.deletingId.set(null);
        this.error.set(this.messageOf(err, 'No fue posible eliminar el bloque.'));
        this.load();
      },
    });
  }

  /** Franjas de 30 minutos que genera un bloque, igual que las calcula el backend. */
  slotsOf(block: AvailabilityBlock): number {
    return Math.max(0, (this.minutesOf(block.endTime) - this.minutesOf(block.startTime)) / 30);
  }

  totalSlots(): number {
    return this.blocks().reduce((total, block) => total + this.slotsOf(block), 0);
  }

  /** Límites permitidos: solo horas y medias horas, como exige el backend. */
  halfHours(): string[] {
    const times: string[] = [];
    for (let minutes = 0; minutes <= 24 * 60; minutes += 30) {
      if (minutes === 24 * 60) break;
      times.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${minutes % 60 === 0 ? '00' : '30'}`);
    }
    return times;
  }

  tomorrow() { return this.isoPlusDays(1); }

  private minutesOf(time: string): number {
    const [hours, minutes] = time.split(':');
    return Number(hours) * 60 + Number(minutes);
  }

  private isoToday() { return new Date().toISOString().slice(0, 10); }

  private isoPlusDays(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  /** El backend explica por qué rechaza: fecha pasada, sede no asignada, solape o compromiso. */
  private messageOf(err: unknown, fallback: string): string {
    const response = err as { status?: number; error?: { message?: string } };
    if (response.error?.message) return response.error.message;
    if (response.status === 409) return 'El bloque se solapa con otro o tiene una cita comprometida.';
    if (response.status === 403) return 'No tiene permiso: revise que su ficha profesional esté activa.';
    return fallback;
  }
}
