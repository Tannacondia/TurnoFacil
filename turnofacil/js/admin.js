/* Panel administrativo ilustrativo. No hay autenticación ni servidor. */
const Store = window.TurnoFacil;
const $ = (selector, parent = document) => parent.querySelector(selector);
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const dateToday = Store.localDate(new Date());
const dateFilter = $('#filter-date');
const serviceFilter = $('#filter-service');
const statusFilter = $('#filter-status');
const searchInput = $('#search-client');
const tbody = $('#booking-list');
const feedback = $('#admin-feedback');
dateFilter.value = dateToday;
$('#year').textContent = new Date().getFullYear();

function escapeText(value) {
  const span = document.createElement('span'); span.textContent = String(value ?? ''); return span.innerHTML;
}
function renderServices() {
  const services = Store.getServices();
  serviceFilter.replaceChildren(new Option('Todos los servicios', 'all'));
  services.forEach((service) => serviceFilter.add(new Option(service.name, service.id)));
  const list = $('#service-list'); list.replaceChildren();
  services.forEach((service) => {
    const row = document.createElement('div'); row.className = 'admin-service';
    const label = document.createElement('div'); label.innerHTML = `<strong>${escapeText(service.name)}</strong><small>${service.duration} min</small>`;
    const price = document.createElement('input'); price.type = 'number'; price.min = '0'; price.step = '500'; price.value = service.price; price.setAttribute('aria-label', `Precio de ${service.name}`);
    price.addEventListener('change', () => { const all = Store.getServices(); const match = all.find((item) => item.id === service.id); if (match && Number(price.value) >= 0) match.price = Number(price.value); Store.setServices(all); render(); announce('Precio de servicio actualizado en esta demo.'); });
    const duration = document.createElement('input'); duration.type = 'number'; duration.min = '15'; duration.step = '15'; duration.value = service.duration; duration.setAttribute('aria-label', `Duración en minutos de ${service.name}`);
    duration.addEventListener('change', () => { const all = Store.getServices(); const match = all.find((item) => item.id === service.id); if (match && Number(duration.value) >= 15) match.duration = Number(duration.value); Store.setServices(all); render(); announce('Duración actualizada en esta demo.'); });
    const del = document.createElement('button'); del.type = 'button'; del.textContent = 'Quitar'; del.setAttribute('aria-label', `Quitar servicio ${service.name}`);
    del.addEventListener('click', () => { Store.setServices(Store.getServices().filter((item) => item.id !== service.id)); render(); announce('Servicio quitado.'); });
    row.append(label, price, duration, del); list.append(row);
  });
}
function renderBlocked() {
  const target = $('#blocked-dates'); target.replaceChildren();
  Store.getSettings().blockedDates.forEach((date) => { const chip = document.createElement('span'); chip.className = 'blocked-chip'; chip.textContent = date; target.append(chip); });
}
function renderClients() {
  const clients = new Map();
  Store.getBookings().forEach((booking) => { if (!clients.has(booking.email)) clients.set(booking.email, booking); });
  const list = $('#client-list'); list.replaceChildren();
  $('#client-count').textContent = `${clients.size} ${clients.size === 1 ? 'cliente' : 'clientes'}`;
  $('#stat-clients').textContent = clients.size;
  clients.forEach((client) => {
    const card = document.createElement('article'); card.className = 'client-card';
    const initials = document.createElement('span'); initials.className = 'client-initials'; initials.textContent = client.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    const detail = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = client.name;
    const email = document.createElement('small'); email.textContent = client.email;
    detail.append(name, email); card.append(initials, detail); list.append(card);
  });
}
function renderBookings() {
  const services = Store.getServices();
  const results = Store.getBookings().filter((booking) => {
    if (dateFilter.value && booking.date !== dateFilter.value) return false;
    if (serviceFilter.value !== 'all' && booking.serviceId !== serviceFilter.value) return false;
    if (statusFilter.value !== 'all' && booking.status !== statusFilter.value) return false;
    const query = searchInput.value.trim().toLowerCase();
    return !query || `${booking.name} ${booking.email} ${booking.phone}`.toLowerCase().includes(query);
  }).sort((a, b) => a.time.localeCompare(b.time));
  tbody.replaceChildren(); $('#empty-state').hidden = results.length > 0;
  results.forEach((booking) => {
    const tr = document.createElement('tr');
    const service = services.find((item) => item.id === booking.serviceId);
    const statusName = { pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado' }[booking.status] || booking.status;
    tr.innerHTML = `<td><strong>${escapeText(booking.time)}</strong><br><span class="customer-email">${escapeText(booking.date)}</span></td><td><span class="customer-name">${escapeText(booking.name)}</span><br><span class="customer-email">${escapeText(booking.email)}</span></td><td>${escapeText(service?.name || 'Servicio quitado')}</td><td>${escapeText(Store.professionals[booking.professionalId] || '—')}</td><td><span class="status-badge status-${escapeText(booking.status)}">${statusName}</span></td><td><div class="row-actions" data-id="${escapeText(booking.id)}"></div></td>`;
    const actions = tr.querySelector('.row-actions');
    if (booking.status === 'pending') addAction(actions, 'Confirmar', 'confirm');
    if (booking.status !== 'cancelled') addAction(actions, 'Reprogramar', 'reschedule');
    if (booking.status !== 'cancelled') addAction(actions, 'Cancelar', 'cancel', 'danger');
    tbody.append(tr);
  });
}
function addAction(parent, label, action, extra = '') { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.dataset.action = action; if (extra) button.className = extra; button.addEventListener('click', () => handleBookingAction(parent.dataset.id, action)); parent.append(button); }
function renderStats() {
  const bookings = Store.getBookings();
  const todays = bookings.filter((item) => item.date === dateToday && item.status !== 'cancelled');
  $('#stat-today').textContent = todays.length;
  $('#stat-today-note').textContent = `${todays.length} reservas activas`;
  $('#stat-pending').textContent = bookings.filter((item) => item.status === 'pending').length;
  $('#stat-services').textContent = Store.getServices().length;
}
function render() { renderServices(); renderBookings(); renderBlocked(); renderClients(); renderStats(); }
function announce(message) { feedback.textContent = message; window.setTimeout(() => { if (feedback.textContent === message) feedback.textContent = ''; }, 3500); }

function handleBookingAction(id, action) {
  const bookings = Store.getBookings(); const booking = bookings.find((item) => item.id === id); if (!booking) return;
  if (action === 'confirm') { booking.status = 'confirmed'; Store.setBookings(bookings); render(); announce('Reserva confirmada en esta demo.'); }
  if (action === 'cancel') { booking.status = 'cancelled'; Store.setBookings(bookings); render(); announce('Reserva cancelada en esta demo.'); }
  if (action === 'reschedule') showRescheduleEditor(booking);
}
function showRescheduleEditor(booking) {
  const actions = [...tbody.querySelectorAll('.row-actions')].find((item) => item.dataset.id === booking.id);
  if (!actions) return;
  actions.replaceChildren();
  const date = document.createElement('input'); date.type = 'date'; date.value = booking.date; date.min = dateToday; date.setAttribute('aria-label', `Nueva fecha para ${booking.name}`);
  const time = document.createElement('input'); time.type = 'time'; time.step = '1800'; time.value = booking.time; time.setAttribute('aria-label', `Nuevo horario para ${booking.name}`);
  const save = document.createElement('button'); save.type = 'button'; save.textContent = 'Guardar';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Volver';
  const error = document.createElement('span'); error.className = 'reschedule-error'; error.setAttribute('role', 'alert');
  actions.classList.add('editing'); actions.append(date, time, save, cancel, error); date.focus();
  cancel.addEventListener('click', renderBookings);
  save.addEventListener('click', () => {
    const nextDate = date.value; const nextTime = time.value;
    const parsedDate = new Date(`${nextDate}T12:00:00`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(nextDate) && !Number.isNaN(parsedDate.getTime()) && Store.localDate(parsedDate) === nextDate && parsedDate.getDay() !== 0;
    const validTime = /^(09|1[0-6]):(00|30)$/.test(nextTime);
    if (!validDate || !validTime) { error.textContent = 'Elegí una fecha de lunes a sábado y un horario en punto o y media.'; return; }
    const dur = Store.getService(booking.serviceId)?.duration || 30;
    const start = Number(nextTime.slice(0, 2)) * 60 + Number(nextTime.slice(3));
    const opening = parsedDate.getDay() === 6 ? 10 * 60 : 9 * 60;
    const closing = parsedDate.getDay() === 6 ? 14 * 60 : 17 * 60;
    if (start < opening || start + dur > closing || Store.getSettings().blockedDates.includes(nextDate)) { error.textContent = 'Ese horario está fuera del horario laboral o el día no está disponible.'; return; }
    const conflict = Store.getBookings().some((other) => other.id !== booking.id && other.date === nextDate && other.professionalId === booking.professionalId && other.status !== 'cancelled' && (() => { const otherStart = Number(other.time.slice(0, 2)) * 60 + Number(other.time.slice(3)); const otherDur = Store.getService(other.serviceId)?.duration || 30; return start < otherStart + otherDur && otherStart < start + dur; })());
    if (conflict) { error.textContent = 'Ese horario se superpone con otra reserva activa.'; return; }
    const bookings = Store.getBookings(); const target = bookings.find((item) => item.id === booking.id); if (!target) return;
    target.date = nextDate; target.time = nextTime;
    if (!Store.setBookings(bookings)) { error.textContent = 'No se pudo guardar el cambio en este navegador.'; return; }
    render(); announce('Reserva reprogramada en esta demo.');
  });
}
[dateFilter, serviceFilter, statusFilter].forEach((field) => field.addEventListener('change', renderBookings));
searchInput.addEventListener('input', renderBookings);
$('#clear-filters').addEventListener('click', () => { dateFilter.value = ''; serviceFilter.value = 'all'; statusFilter.value = 'all'; searchInput.value = ''; renderBookings(); });
$('#add-service').addEventListener('click', () => {
  const name = prompt('Nombre del servicio:'); if (!name?.trim()) return;
  const duration = Number(prompt('Duración en minutos:', '30')); const price = Number(prompt('Precio en pesos:', '15000'));
  if (!Number.isFinite(duration) || duration < 15 || !Number.isFinite(price) || price < 0) { announce('Ingresá una duración desde 15 minutos y un precio válido.'); return; }
  const id = `servicio-${Date.now()}`; Store.setServices([...Store.getServices(), { id, name: name.trim(), duration, price }]); render(); announce('Servicio agregado a esta demo.');
});
$('#block-date').addEventListener('click', () => {
  const input = $('#blocked-date'); if (!input.value) { input.reportValidity(); return; }
  const settings = Store.getSettings(); settings.blockedDates = [...new Set([...settings.blockedDates, input.value])]; Store.setSettings(settings); renderBlocked(); announce('Fecha marcada como no disponible.'); input.value = '';
});
$('#reset-demo').addEventListener('click', () => {
  ['turnofacil-bookings-v1', 'turnofacil-settings-v1', 'turnofacil-services-v1'].forEach((key) => localStorage.removeItem(key));
  render(); announce('Datos de ejemplo restablecidos.');
});
render();
