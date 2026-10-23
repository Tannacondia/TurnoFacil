/* Flujo de reserva de demostración. No envía datos ni realiza reservas reales. */
const { localDate, professionals, getBookings, setBookings, getSettings, getService } = window.TurnoFacil;
const $ = (selector, parent = document) => parent.querySelector(selector);
const bookingForm = $('#booking-form');
const serviceSelect = $('#service');
const professionalSelect = $('#professional');
const dateInput = $('#date');
const timeSlots = $('#time-slots');
const slotError = $('#slot-error');
const bookingError = $('#booking-error');
const successPanel = $('#booking-success');
const stepsIndicator = $('.steps-indicator');
let selectedTime = '';
let currentStep = 1;

// Refleja en el formulario los servicios que se agregan o editan en el panel.
const savedService = serviceSelect.value;
serviceSelect.replaceChildren(new Option('Seleccioná un servicio', ''));
window.TurnoFacil.getServices().forEach((service) => {
  const option = new Option(`${service.name} · ${service.duration} min · ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(service.price)}`, service.id);
  serviceSelect.add(option);
});
if (savedService) serviceSelect.value = savedService;

const today = localDate(new Date());
dateInput.min = today;
dateInput.value = today;
$('#year').textContent = new Date().getFullYear();

function setStep(step) {
  currentStep = step;
  document.querySelectorAll('.form-step').forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.step) === step));
  stepsIndicator.setAttribute('aria-label', `Paso ${step} de 3`);
  stepsIndicator.querySelectorAll('span').forEach((item, index) => item.classList.toggle('step-active', index < step));
  const heading = $(`[data-step="${step}"] h3`);
  if (heading) heading.setAttribute('tabindex', '-1'), heading.focus();
}
function validateFields(ids) {
  for (const id of ids) {
    const field = document.getElementById(id);
    if (!field.reportValidity()) return false;
  }
  return true;
}
function bookedSlots() {
  return getBookings().filter((booking) => booking.date === dateInput.value && booking.professionalId === professionalSelect.value && booking.status !== 'cancelled');
}
function renderSlots() {
  selectedTime = '';
  slotError.textContent = '';
  timeSlots.replaceChildren();
  const date = dateInput.value;
  const day = new Date(`${date}T12:00:00`).getDay();
  const settings = getSettings();
  if (!date || day === 0 || (settings.blockedDates || []).includes(date)) {
    timeSlots.textContent = day === 0 ? 'El estudio permanece cerrado los domingos.' : 'No hay disponibilidad en esta fecha.';
    return;
  }
  const service = getService(serviceSelect.value);
  if (!service) return;
  const opening = day === 6 ? 10 : 9;
  const closing = day === 6 ? 14 : 17;
  const duration = service.duration;
  const occupied = bookedSlots();
  const now = new Date();
  for (let minutes = opening * 60; minutes + duration <= closing * 60; minutes += 30) {
    const hour = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const end = minutes + duration;
    const conflict = occupied.some((booking) => {
      const existing = getService(booking.serviceId);
      if (!existing) return false;
      const start = Number(booking.time.slice(0, 2)) * 60 + Number(booking.time.slice(3));
      return minutes < start + existing.duration && start < end;
    });
    const isPast = date === today && minutes <= now.getHours() * 60 + now.getMinutes();
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'time-slot'; button.textContent = hour;
    if (conflict || isPast) { button.disabled = true; button.setAttribute('aria-label', `${hour}, no disponible`); }
    else button.addEventListener('click', () => {
      selectedTime = hour;
      timeSlots.querySelectorAll('.time-slot').forEach((slot) => slot.classList.toggle('selected', slot === button));
    });
    timeSlots.append(button);
  }
  if (!timeSlots.querySelector('.time-slot:not(:disabled)')) timeSlots.textContent = 'No quedan horarios libres para esta combinación.';
}

document.querySelectorAll('[data-service]').forEach((link) => link.addEventListener('click', () => { serviceSelect.value = link.dataset.service; }));
serviceSelect.addEventListener('change', renderSlots);
professionalSelect.addEventListener('change', renderSlots);
dateInput.addEventListener('change', renderSlots);
document.querySelectorAll('[data-next="2"]').forEach((button) => button.addEventListener('click', () => {
  if (!validateFields(['service', 'professional'])) return;
  renderSlots(); setStep(2);
}));
document.querySelector('[data-next="3"]').addEventListener('click', () => {
  slotError.textContent = '';
  if (!validateFields(['date'])) return;
  if (!selectedTime) { slotError.textContent = 'Elegí un horario disponible para continuar.'; return; }
  const service = getService(serviceSelect.value);
  $('#review-line').textContent = `${service.name} · ${dateInput.value} a las ${selectedTime} · ${professionals[professionalSelect.value]}`;
  setStep(3);
});
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => setStep(Number(button.dataset.back))));

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault(); bookingError.textContent = '';
  if (!validateFields(['name', 'email', 'phone'])) { bookingError.textContent = 'Revisá tus datos antes de continuar.'; return; }
  if (!selectedTime) { setStep(2); slotError.textContent = 'Elegí un horario disponible.'; return; }
  // Volvemos a validar al confirmar para detectar cambios hechos en otra pestaña local.
  const collision = bookedSlots().some((booking) => {
    const other = getService(booking.serviceId); const target = getService(serviceSelect.value);
    if (!other || !target) return false;
    const a = Number(booking.time.slice(0, 2)) * 60 + Number(booking.time.slice(3));
    const b = Number(selectedTime.slice(0, 2)) * 60 + Number(selectedTime.slice(3));
    return b < a + other.duration && a < b + target.duration;
  });
  if (collision) { setStep(2); renderSlots(); slotError.textContent = 'Ese horario acaba de ocuparse. Elegí otro, por favor.'; return; }
  const form = new FormData(bookingForm);
  const booking = { id: `tf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: String(form.get('name')).trim(), email: String(form.get('email')).trim().toLowerCase(), phone: String(form.get('phone')).trim(), serviceId: serviceSelect.value, professionalId: professionalSelect.value, date: dateInput.value, time: selectedTime, status: 'pending', demo: true };
  if (!setBookings([...getBookings(), booking])) { bookingError.textContent = 'No se pudo guardar en este navegador. Revisá la configuración de almacenamiento.'; return; }
  const service = getService(booking.serviceId);
  $('#success-summary').textContent = `${service.name} · ${booking.date} a las ${booking.time} con ${professionals[booking.professionalId]}. La reserva quedó guardada como pendiente en este navegador.`;
  bookingForm.querySelectorAll('.form-step').forEach((step) => step.classList.remove('active'));
  stepsIndicator.hidden = true; successPanel.hidden = false; successPanel.querySelector('h3').focus();
});

const managePanel = $('#manage-panel');
$('#manage-booking').addEventListener('click', () => { bookingForm.hidden = true; managePanel.hidden = false; $('#lookup-email').focus(); });
$('#back-to-booking').addEventListener('click', () => { managePanel.hidden = true; bookingForm.hidden = false; });
$('#lookup-button').addEventListener('click', () => {
  const email = $('#lookup-email'); const results = $('#lookup-results');
  results.replaceChildren();
  if (!email.reportValidity() || !email.value.trim()) { email.setCustomValidity('Ingresá el correo utilizado para reservar.'); email.reportValidity(); email.setCustomValidity(''); return; }
  const matches = getBookings().filter((booking) => booking.email === email.value.trim().toLowerCase());
  if (!matches.length) { results.textContent = 'No encontramos reservas con ese correo en este navegador.'; return; }
  matches.forEach((booking) => {
    const card = document.createElement('article'); card.className = 'lookup-card';
    const details = document.createElement('p');
    const service = getService(booking.serviceId);
    details.textContent = `${service?.name || 'Servicio'} · ${booking.date} a las ${booking.time} · ${booking.status === 'cancelled' ? 'Cancelado' : booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}`;
    card.append(details);
    if (booking.status !== 'cancelled') {
      const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'text-button'; cancel.textContent = 'Cancelar esta reserva';
      cancel.addEventListener('click', () => {
        const bookings = getBookings(); const target = bookings.find((item) => item.id === booking.id);
        if (target) target.status = 'cancelled';
        if (setBookings(bookings)) { card.querySelector('.text-button')?.remove(); details.textContent = `${service?.name || 'Servicio'} · ${booking.date} a las ${booking.time} · Cancelado`; }
      });
      card.append(cancel);
    }
    results.append(card);
  });
});

// Menú compacto accesible en pantallas pequeñas.
const menu = $('.menu-toggle'); const nav = $('#nav');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); nav.classList.toggle('nav-open', !open); });
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('nav-open'); }));
