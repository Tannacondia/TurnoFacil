// Datos ficticios del Estudio Luz. La demo guarda cambios solo en este navegador.
window.TurnoFacil = (() => {
  const services = [
    { id: 'consulta', name: 'Consulta inicial', duration: 30, price: 12000 },
    { id: 'sesion', name: 'Sesión individual', duration: 60, price: 22000 },
    { id: 'seguimiento', name: 'Seguimiento', duration: 45, price: 17000 },
  ];
  const professionals = { martina: 'Martina López', julian: 'Julián Costa' };
  const defaultBookings = () => {
    const day = new Date();
    const date = localDate(day);
    return [
      { id: 'demo-001', name: 'Lucía Fernández', email: 'lucia@ejemplo.com', phone: '+54 9 11 5555 0101', serviceId: 'consulta', professionalId: 'martina', date, time: '10:00', status: 'confirmed', demo: true },
      { id: 'demo-002', name: 'Mateo Ruiz', email: 'mateo@ejemplo.com', phone: '+54 9 11 5555 0202', serviceId: 'sesion', professionalId: 'julian', date, time: '11:00', status: 'pending', demo: true },
      { id: 'demo-003', name: 'Sofía Torres', email: 'sofia@ejemplo.com', phone: '+54 9 11 5555 0303', serviceId: 'seguimiento', professionalId: 'martina', date, time: '14:00', status: 'confirmed', demo: true },
      { id: 'demo-004', name: 'Nicolás Díaz', email: 'nicolas@ejemplo.com', phone: '+54 9 11 5555 0404', serviceId: 'consulta', professionalId: 'julian', date, time: '15:00', status: 'cancelled', demo: true },
    ];
  };
  function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function read(key, fallback) {
    try { const value = localStorage.getItem(key); return value === null ? fallback() : JSON.parse(value); }
    catch { return fallback(); }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  function getBookings() { return read('turnofacil-bookings-v1', defaultBookings); }
  function setBookings(value) { return save('turnofacil-bookings-v1', value); }
  function getSettings() { return read('turnofacil-settings-v1', () => ({ blockedDates: [] })); }
  function setSettings(value) { return save('turnofacil-settings-v1', value); }
  function getServices() { return read('turnofacil-services-v1', () => services); }
  function setServices(value) { return save('turnofacil-services-v1', value); }
  function getService(id) { return getServices().find((service) => service.id === id); }
  return { services, professionals, localDate, defaultBookings, getBookings, setBookings, getSettings, setSettings, getServices, setServices, getService };
})();
