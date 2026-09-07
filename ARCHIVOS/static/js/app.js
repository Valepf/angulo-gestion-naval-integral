document.addEventListener("click", (event) => {
  const button = event.target.closest(".js-toggle-target");
  if (!button) return;
  const id = button.dataset.target;
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.toggle("hidden");
  if (!target.classList.contains("hidden")) {
    const firstField = target.querySelector("input, select, textarea");
    if (firstField) setTimeout(() => firstField.focus(), 80);
    target.scrollIntoView({behavior: "smooth", block: "nearest"});
  }
});

setTimeout(() => {
  document.querySelectorAll(".flash").forEach((el) => {
    el.style.transition = "opacity .3s ease";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 350);
  });
}, 5000);

function refreshHoursRow(row) {
  if (!row) return;
  const worked = row.querySelector('.js-worked-check');
  const type = row.querySelector('.js-shift-type');
  const realHours = row.querySelector('.js-real-hours');
  const label = row.querySelector('.js-shift-label');
  const enabled = !worked || worked.checked;

  row.querySelectorAll('input[type="text"], input[type="number"], select').forEach((field) => {
    field.disabled = !enabled;
  });

  if (!type || !realHours) return;
  const manual = type.value === 'Horas reales';
  realHours.disabled = !enabled || !manual;
  if (label) {
    if (!enabled) label.textContent = 'No trabaja';
    else if (type.value === 'Jornada completa') label.textContent = '8 h';
    else if (type.value === 'Media jornada') label.textContent = '4 h';
    else label.textContent = 'Manual';
  }
  row.classList.toggle('is-off', !enabled);
}

document.querySelectorAll('.js-hours-row').forEach(refreshHoursRow);

document.addEventListener('change', (event) => {
  if (!event.target.matches('.js-worked-check, .js-shift-type')) return;
  refreshHoursRow(event.target.closest('.js-hours-row'));
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('.js-hours-check');
  if (!button) return;
  const checked = button.dataset.state === '1';
  document.querySelectorAll('.js-hours-row').forEach((row) => {
    const box = row.querySelector('.js-worked-check');
    if (box) box.checked = checked;
    refreshHoursRow(row);
  });
});

// PWA: mantenemos el service worker para que ANGULO conserve su comportamiento
// como app instalada. La instalación se realiza desde el navegador del dispositivo.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
}

// Fichaje manual: propone el trabajo actual y permite completar la hora con un toque.
document.addEventListener('change', (event) => {
  if (!event.target.matches('.js-manual-person')) return;
  const option = event.target.selectedOptions[0];
  const job = document.querySelector('.js-manual-job');
  if (job && option && option.dataset.job && option.dataset.job !== '0') job.value = option.dataset.job;
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('.js-now-time');
  if (!button) return;
  const field = document.querySelector(`[name="${button.dataset.field}"]`);
  if (!field) return;
  const now = new Date();
  field.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
});

// V11: la pantalla de Mauricio se refresca sola para mostrar nuevas entradas del Hikvision.
// No recarga mientras está editando una hora de salida.
if (window.matchMedia('(max-width: 900px)').matches && ['/', '/equipo'].includes(window.location.pathname)) {
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    const active = document.activeElement;
    if (active && active.matches('input, select, textarea')) return;
    window.location.reload();
  }, 60000);
}
