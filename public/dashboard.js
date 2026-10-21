const grid = document.querySelector('#service-grid');
const dataGrid = document.querySelector('#data-grid');
const onlineCount = document.querySelector('#online-count');
const checkedAt = document.querySelector('#checked-at');
const loadError = document.querySelector('#load-error');

function render(health) {
  onlineCount.textContent = `${health.online} / ${health.total} online`;
  checkedAt.textContent = `Last checked ${new Date(health.checkedAt).toLocaleTimeString()}`;
  grid.innerHTML = health.services.map((service) => `
    <article class="service-card accent-${service.accent}">
      <div class="service-head">
        <span class="service-icon">${service.icon}</span>
        <span class="status status-${service.status}"><span class="status-dot"></span>${service.status}</span>
      </div>
      <h2>${service.name}</h2>
      <p>${service.description}</p>
      <div class="service-meta">${service.httpStatus ? `HTTP ${service.httpStatus}` : service.error || 'No response'} · ${service.latencyMs} ms</div>
      <a class="button button-open" href="${service.url}" target="_blank" rel="noreferrer">Open ${service.name}</a>
    </article>
  `).join('');

  dataGrid.innerHTML = health.services.map((service) => renderDataCard(service)).join('');
}

function renderDataCard(service) {
  if (!service.data) {
    return `
      <article class="data-card data-card-muted accent-${service.accent}">
        <div class="data-card-head"><span class="service-icon">${service.icon}</span><strong>${service.name}</strong></div>
        <p class="data-empty">${service.status === 'online' ? 'Connected, but no business summary is available yet.' : 'Business data is unavailable while this application is offline.'}</p>
        <a class="text-link" href="${service.url}" target="_blank" rel="noreferrer">Open ${service.name}</a>
      </article>
    `;
  }

  if (service.key === 'hris') {
    const data = service.data;
    return `
      <article class="data-card accent-${service.accent}">
        <div class="data-card-head"><span class="service-icon">${service.icon}</span><strong>${service.name}</strong><span class="status status-online"><span class="status-dot"></span>live</span></div>
        <div class="metric-grid">
          <div><strong>${data.employees.total}</strong><span>employees</span></div>
          <div><strong>${data.employees.active}</strong><span>active</span></div>
          <div><strong>${data.departments}</strong><span>departments</span></div>
          <div><strong>${data.payrollRecords}</strong><span>payroll records</span></div>
          <div><strong>${data.pendingLeave}</strong><span>pending leave</span></div>
          <div><strong>${data.pendingOvertime}</strong><span>pending overtime</span></div>
        </div>
        <a class="text-link" href="${service.url}/admin/login" target="_blank" rel="noreferrer">Open ${service.name}</a>
      </article>
    `;
  }

  return `
    <article class="data-card accent-${service.accent}">
      <div class="data-card-head"><span class="service-icon">${service.icon}</span><strong>${service.name}</strong><span class="status status-online"><span class="status-dot"></span>live</span></div>
      <pre class="data-json">${JSON.stringify(service.data, null, 2)}</pre>
      <a class="text-link" href="${service.url}" target="_blank" rel="noreferrer">Open ${service.name}</a>
    </article>
  `;
}

async function loadStatus() {
  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    if (response.status === 401) {
      window.location.href = '/';
      return;
    }
    if (!response.ok) throw new Error('Status request failed');
    render(await response.json());
    loadError.hidden = true;
  } catch {
    loadError.hidden = false;
    onlineCount.textContent = 'Status unavailable';
    checkedAt.textContent = 'Retrying automatically';
  }
}

loadStatus();
setInterval(loadStatus, 30_000);
