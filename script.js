// Default configuration
const defaultConfig = {
  platform_name: 'KRUZ',
  tagline: 'Smart Port Logistics Platform',
  contact_email: 'info@kruz.com',
  contact_phone: '+1 (555) 123-4567',
  whatsapp_number: '+15551234567',
  background_color: '#020617',
  surface_color: '#0f172a',
  text_color: '#f1f5f9',
  primary_color: '#84cc16',
  secondary_color: '#3b82f6'
};


// App state
let currentUser = null;
let shipments = [];
let selectedShipment = null;
let isLoading = false;


// Port coordinates for map
const portCoords = {
  'Durban': { left: 45, top: 30 },
  'Richards Bay': { left: 85, top: 35 },
  'Cape Town': { left: 15, top: 45 },
  'East London': { left: 75, top: 65 },
  'Ngqura': { left: 30, top: 70 }
};


// Initialize Element SDK
async function initElementSdk() {
  if (window.elementSdk) {
    await window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (config) => {
        applyConfig(config);
      },
      mapToCapabilities: (config) => ({
        recolorables: [
          {
            get: () => config.background_color || defaultConfig.background_color,
            set: (value) => window.elementSdk.setConfig({ background_color: value })
          },
          {
            get: () => config.surface_color || defaultConfig.surface_color,
            set: (value) => window.elementSdk.setConfig({ surface_color: value })
          },
          {
            get: () => config.text_color || defaultConfig.text_color,
            set: (value) => window.elementSdk.setConfig({ text_color: value })
          },
          {
            get: () => config.primary_color || defaultConfig.primary_color,
            set: (value) => window.elementSdk.setConfig({ primary_color: value })
          },
          {
            get: () => config.secondary_color || defaultConfig.secondary_color,
            set: (value) => window.elementSdk.setConfig({ secondary_color: value })
          }
        ],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      }),
      mapToEditPanelValues: (config) => new Map([
        ['platform_name', config.platform_name || defaultConfig.platform_name],
        ['tagline', config.tagline || defaultConfig.tagline],
        ['contact_email', config.contact_email || defaultConfig.contact_email],
        ['contact_phone', config.contact_phone || defaultConfig.contact_phone],
        ['whatsapp_number', config.whatsapp_number || defaultConfig.whatsapp_number]
      ])
    });
  }
}


// Apply configuration to UI
function applyConfig(config) {
  const platformName = config.platform_name || defaultConfig.platform_name;
  const tagline = config.tagline || defaultConfig.tagline;
  const contactEmail = config.contact_email || defaultConfig.contact_email;
  const contactPhone = config.contact_phone || defaultConfig.contact_phone;
  const whatsappNumber = config.whatsapp_number || defaultConfig.whatsapp_number;

  // Update text content
  const brandName = document.getElementById('brand-name');
  if (brandName) brandName.textContent = platformName;

  const headerBrand = document.getElementById('header-brand');
  if (headerBrand) headerBrand.textContent = platformName;

  const brandTagline = document.getElementById('brand-tagline');
  if (brandTagline) brandTagline.textContent = tagline;

  const contactEmailDisplay = document.getElementById('contact-email-display');
  if (contactEmailDisplay) contactEmailDisplay.textContent = contactEmail;

  const contactPhoneDisplay = document.getElementById('contact-phone-display');
  if (contactPhoneDisplay) contactPhoneDisplay.textContent = contactPhone;

  const whatsappDisplay = document.getElementById('whatsapp-display');
  if (whatsappDisplay) whatsappDisplay.textContent = whatsappNumber;

  // Update WhatsApp button link
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn) {
    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, '').replace('+', '');
    whatsappBtn.href = `https://wa.me/${cleanNumber}`;
  }

  // Apply colors
  document.body.style.backgroundColor = config.background_color || defaultConfig.background_color;
  document.body.style.color = config.text_color || defaultConfig.text_color;
}


// Initialize Data SDK
async function initDataSdk() {
  if (window.dataSdk) {
    const result = await window.dataSdk.init({
      onDataChanged: (data) => {
        shipments = data.filter(d => d.type === 'shipment');
        updateUI();
      }
    });

    if (!result.isOk) {
      console.error('Failed to initialize Data SDK');
    }
  }
}


// Show toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const colors = {
    success: 'bg-lime-500/90 border-lime-400',
    error: 'bg-red-500/90 border-red-400',
    info: 'bg-blue-500/90 border-blue-400',
    warning: 'bg-yellow-500/90 border-yellow-400'
  };

  toast.className = `notification-enter ${colors[type]} border backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`;

  const icons = {
    success: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
  };

  toast.innerHTML = `${icons[type]}<span class="text-sm font-medium">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}


// Update UI based on shipments data
function updateUI() {
  updateStats();
  updateShipmentList();
  updateActivityFeed();
  updateMapVessels();
  if (selectedShipment) {
    renderShipmentDetails(selectedShipment);
  }
}


// Update statistics
function updateStats() {
  const active = shipments.length;
  const transit = shipments.filter(s => s.status === 'In Transit').length;
  const port = shipments.filter(s => s.status === 'At Port').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;

  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-transit').textContent = transit;
  document.getElementById('stat-port').textContent = port;
  document.getElementById('stat-delivered').textContent = delivered;
}


// Update shipment list
function updateShipmentList() {
  const container = document.getElementById('shipment-list');

  if (shipments.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <p class="text-sm">No shipments yet</p>
        <p class="text-xs mt-1">Click "Add New" to create your first shipment</p>
      </div>
    `;
    return;
  }

  container.innerHTML = shipments.map(s => {
    const statusColors = {
      'In Transit': 'bg-blue-500',
      'At Port': 'bg-yellow-500',
      'Delivered': 'bg-lime-500',
      'Pending': 'bg-gray-500'
    };

    return `
      <div class="shipment-item p-4 border-b border-slate-700/30 hover:bg-slate-800/30 cursor-pointer transition-colors ${selectedShipment && selectedShipment.__backendId === s.__backendId ? 'bg-slate-800/50' : ''}" data-id="${s.__backendId}">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-white text-sm">${s.cargo_id}</span>
          <span class="w-2 h-2 rounded-full ${statusColors[s.status] || 'bg-gray-500'}"></span>
        </div>
        <p class="text-xs text-gray-400">${s.vessel_name}</p>
        <p class="text-xs text-gray-500 mt-1">${s.origin} → ${s.destination}</p>
      </div>
    `;
  }).join('');

  // Add click handlers
  container.querySelectorAll('.shipment-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      selectedShipment = shipments.find(s => s.__backendId === id);
      updateShipmentList();
      renderShipmentDetails(selectedShipment);
    });
  });
}


// Render shipment details
function renderShipmentDetails(shipment) {
  const container = document.getElementById('shipment-details');

  if (!shipment) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
        </svg>
        <p>Select a shipment to view details</p>
      </div>
    `;
    return;
  }

  const statusColors = {
    'In Transit': 'bg-blue-500 text-blue-100',
    'At Port': 'bg-yellow-500 text-yellow-900',
    'Delivered': 'bg-lime-500 text-lime-900',
    'Pending': 'bg-gray-500 text-gray-100'
  };

  const priorityColors = {
    'normal': 'text-gray-400',
    'high': 'text-yellow-400',
    'urgent': 'text-red-400'
  };

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-start justify-between">
        <div>
          <h4 class="text-xl font-bold text-white">${shipment.cargo_id}</h4>
          <p class="text-gray-400">${shipment.vessel_name}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status] || 'bg-gray-500 text-gray-100'}">${shipment.status}</span>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-slate-800/30 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Origin</p>
          <p class="text-white font-medium">${shipment.origin}</p>
        </div>
        <div class="p-4 bg-slate-800/30 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Destination</p>
          <p class="text-white font-medium">${shipment.destination}</p>
        </div>
        <div class="p-4 bg-slate-800/30 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Containers</p>
          <p class="text-white font-medium">${shipment.container_count}</p>
        </div>
        <div class="p-4 bg-slate-800/30 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Weight</p>
          <p class="text-white font-medium">${shipment.weight_tons} tons</p>
        </div>
        <div class="p-4 bg-slate-800/30 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">ETA</p>
          <p class="text-white font-medium">${new Date(shipment.eta).toLocaleDateString()}</p>
        </div>
        <div class="p-4 bg-slate-800/30 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Priority</p>
          <p class="font-medium capitalize ${priorityColors[shipment.priority] || 'text-gray-400'}">${shipment.priority}</p>
        </div>
      </div>

      <div class="border-t border-slate-700/50 pt-4">
        <h5 class="text-sm font-medium text-white mb-3">Tracking Timeline</h5>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-lime-500"></div>
            <div class="flex-1">
              <p class="text-sm text-white">Shipment Created</p>
              <p class="text-xs text-gray-500">${new Date(shipment.last_updated).toLocaleString()}</p>
            </div>
          </div>
          ${shipment.status !== 'Pending' ? `
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full ${shipment.status === 'In Transit' || shipment.status === 'At Port' || shipment.status === 'Delivered' ? 'bg-lime-500' : 'bg-slate-600'}"></div>
            <div class="flex-1">
              <p class="text-sm text-white">Departed ${shipment.origin}</p>
              <p class="text-xs text-gray-500">In transit</p>
            </div>
          </div>
          ` : ''}
          ${shipment.status === 'At Port' || shipment.status === 'Delivered' ? `
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-lime-500"></div>
            <div class="flex-1">
              <p class="text-sm text-white">Arrived at ${shipment.destination}</p>
              <p class="text-xs text-gray-500">At port</p>
            </div>
          </div>
          ` : ''}
          ${shipment.status === 'Delivered' ? `
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-lime-500"></div>
            <div class="flex-1">
              <p class="text-sm text-white">Delivered</p>
              <p class="text-xs text-gray-500">Completed successfully</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="flex gap-3">
        <button class="flex-1 btn-secondary text-white font-medium py-2 rounded-lg text-sm" onclick="updateShipmentStatus('${shipment.__backendId}')">
          Update Status
        </button>
        <button class="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2 rounded-lg text-sm transition-colors" onclick="deleteShipment('${shipment.__backendId}')">
          Delete
        </button>
      </div>
    </div>
  `;
}


// Update activity feed
function updateActivityFeed() {
  const container = document.getElementById('activity-feed');

  if (shipments.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-sm">No recent activity</p>
        <p class="text-xs mt-1">Add a shipment to get started</p>
      </div>
    `;
    return;
  }

  const sorted = [...shipments].sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)).slice(0, 5);

  container.innerHTML = sorted.map(s => {
    const statusIcons = {
      'In Transit': '<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
      'At Port': '<svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
      'Delivered': '<svg class="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      'Pending': '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };

    return `
      <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/30">
        <div class="mt-0.5">${statusIcons[s.status] || statusIcons['Pending']}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-white truncate">${s.cargo_id}</p>
          <p class="text-xs text-gray-500">${s.status} - ${s.vessel_name}</p>
        </div>
        <span class="text-xs text-gray-600">${getTimeAgo(s.last_updated)}</span>
      </div>
    `;
  }).join('');
}


// Update map vessels
function updateMapVessels() {
  const container = document.getElementById('map-vessels');

  const inTransit = shipments.filter(s => s.status === 'In Transit');

  container.innerHTML = inTransit.map(s => {
    const origin = portCoords[s.origin] || { left: 50, top: 50 };
    const dest = portCoords[s.destination] || { left: 50, top: 50 };

    // Position vessel between origin and destination
    const progress = Math.random() * 0.6 + 0.2; // 20-80% of the way
    const left = origin.left + (dest.left - origin.left) * progress;
    const top = origin.top + (dest.top - origin.top) * progress;

    return `
      <div class="vessel-icon" style="left: ${left}%; top: ${top}%;" title="${s.vessel_name}">
        <svg width="24" height="16" viewBox="0 0 24 16" class="drop-shadow-lg">
          <path d="M2 10 L5 10 L6 12 L18 12 L19 10 L22 10 L20 15 L4 15 Z" fill="#84cc16" stroke="#a3e635" stroke-width="0.5"/>
          <rect x="8" y="6" width="8" height="4" fill="#84cc16" stroke="#a3e635" stroke-width="0.5" rx="0.5"/>
          <rect x="10" y="2" width="4" height="4" fill="#84cc16" stroke="#a3e635" stroke-width="0.5" rx="0.5"/>
        </svg>
      </div>
    `;
  }).join('');
}


// Get time ago string
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}


// Add shipment
async function addShipment(formData) {
  if (shipments.length >= 999) {
    showToast('Maximum limit of 999 shipments reached', 'error');
    return;
  }

  isLoading = true;
  document.getElementById('submit-shipment-btn').disabled = true;
  document.getElementById('submit-shipment-btn').textContent = 'Adding...';

  const shipment = {
    type: 'shipment',
    cargo_id: formData.cargoId,
    vessel_name: formData.vesselName,
    origin: formData.origin,
    destination: formData.destination,
    status: 'In Transit',
    eta: formData.eta,
    last_updated: new Date().toISOString(),
    stakeholder_type: currentUser?.type || 'shipping',
    container_count: parseInt(formData.containerCount),
    weight_tons: parseInt(formData.weightTons),
    priority: formData.priority,
    notification_email: formData.notifEmail,
    lat: 0,
    lng: 0
  };

  if (window.dataSdk) {
    const result = await window.dataSdk.create(shipment);
    if (result.isOk) {
      showToast(`Shipment ${formData.cargoId} added successfully`, 'success');
      // Simulate automated email notification
      setTimeout(() => {
        showToast(`Email notification sent to ${formData.notifEmail || 'stakeholder'}`, 'info');
      }, 2000);
    } else {
      showToast('Failed to add shipment', 'error');
    }
  }

  isLoading = false;
  document.getElementById('submit-shipment-btn').disabled = false;
  document.getElementById('submit-shipment-btn').textContent = 'Add Shipment';
  closeModal();
}


// Update shipment status
async function updateShipmentStatus(id) {
  const shipment = shipments.find(s => s.__backendId === id);
  if (!shipment) return;

  const statusOrder = ['Pending', 'In Transit', 'At Port', 'Delivered'];
  const currentIndex = statusOrder.indexOf(shipment.status);
  const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

  if (window.dataSdk) {
    const updated = {
      ...shipment,
      status: nextStatus,
      last_updated: new Date().toISOString()
    };

    const result = await window.dataSdk.update(updated);
    if (result.isOk) {
      showToast(`Status updated to "${nextStatus}"`, 'success');
      // Simulate automated notification
      if (shipment.notification_email) {
        setTimeout(() => {
          showToast(`Status change notification sent`, 'info');
        }, 1500);
      }
    } else {
      showToast('Failed to update status', 'error');
    }
  }
}


// Delete shipment
async function deleteShipment(id) {
  const shipment = shipments.find(s => s.__backendId === id);
  if (!shipment) return;

  // Inline confirmation
  const detailsContainer = document.getElementById('shipment-details');
  const deleteBtn = detailsContainer.querySelector('button:last-child');

  if (deleteBtn.textContent === 'Confirm Delete') {
    if (window.dataSdk) {
      const result = await window.dataSdk.delete(shipment);
      if (result.isOk) {
        showToast(`Shipment ${shipment.cargo_id} deleted`, 'success');
        selectedShipment = null;
        renderShipmentDetails(null);
      } else {
        showToast('Failed to delete shipment', 'error');
      }
    }
  } else {
    deleteBtn.textContent = 'Confirm Delete';
    deleteBtn.classList.add('bg-red-500/40');
    setTimeout(() => {
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.remove('bg-red-500/40');
    }, 3000);
  }
}


// Close modal
function closeModal() {
  document.getElementById('shipment-modal').classList.add('hidden');
  document.getElementById('shipment-form').reset();
}


// Open modal
function openModal() {
  document.getElementById('shipment-modal').classList.remove('hidden');
}


// Tab switching
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

  // Show selected tab
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');

  // Update desktop nav
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.remove('tab-active', 'text-lime-400');
    btn.classList.add('text-gray-400');
  });
  document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('tab-active');
  document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.remove('text-gray-400');

  // Update mobile nav
  document.querySelectorAll('.nav-tab-mobile').forEach(btn => {
    btn.classList.remove('tab-active', 'bg-slate-800');
    btn.classList.add('text-gray-400');
  });
  const mobileTab = document.querySelector(`.nav-tab-mobile[data-tab="${tabName}"]`);
  if (mobileTab) {
    mobileTab.classList.add('tab-active', 'bg-slate-800');
    mobileTab.classList.remove('text-gray-400');
  }
}


// Login handler
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('user-email').value;
  const type = document.getElementById('stakeholder-type').value;

  if (!email) {
    showToast('Please enter your email address', 'error');
    return;
  }

  currentUser = {
    email,
    type,
    initial: email.charAt(0).toUpperCase()
  };

  document.getElementById('user-initial').textContent = currentUser.initial;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.remove('hidden');

  showToast(`Welcome back! Logged in as ${type.replace('_', ' ')}`, 'success');
}


// Logout handler
function handleLogout() {
  currentUser = null;
  document.getElementById('dashboard-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-form').reset();
  showToast('Logged out successfully', 'info');
}


// Initialize event listeners
function initEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Tab navigation
  document.querySelectorAll('.nav-tab, .nav-tab-mobile').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Add shipment buttons
  document.getElementById('btn-add-shipment').addEventListener('click', openModal);
  document.getElementById('btn-add-shipment-2').addEventListener('click', openModal);

  // Modal controls
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-shipment').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);

  // Shipment form
  document.getElementById('shipment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      cargoId: document.getElementById('cargo-id').value,
      vesselName: document.getElementById('vessel-name').value,
      origin: document.getElementById('origin-port').value,
      destination: document.getElementById('dest-port').value,
      containerCount: document.getElementById('container-count').value,
      weightTons: document.getElementById('weight-tons').value,
      eta: document.getElementById('eta-date').value,
      priority: document.getElementById('priority').value,
      notifEmail: document.getElementById('notif-email').value
    };

    await addShipment(formData);
  });

  // Report form
  document.getElementById('report-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const reportType = document.getElementById('report-type').value;
    showToast(`Generating ${reportType} report...`, 'info');

    // Simulate report generation
    setTimeout(() => {
      showToast('Report generated successfully!', 'success');

      // Add to reports list
      const reportsList = document.getElementById('reports-list');
      const reportHtml = `
        <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <div>
              <p class="text-sm text-white">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
              <p class="text-xs text-gray-500">${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button class="text-blue-400 hover:text-blue-300 text-xs">View</button>
        </div>
      `;

      if (reportsList.querySelector('.text-gray-500')) {
        reportsList.innerHTML = reportHtml;
      } else {
        reportsList.insertAdjacentHTML('afterbegin', reportHtml);
      }
    }, 2000);
  });

  // Feedback form
  document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Feedback submitted successfully!', 'success');
    document.getElementById('feedback-form').reset();
  });

  // Generate report button in overview
  document.getElementById('btn-generate-report').addEventListener('click', () => {
    switchTab('reports');
  });

  // Search shipments
  document.getElementById('search-shipments').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = shipments.filter(s =>
      s.cargo_id.toLowerCase().includes(query) ||
      s.vessel_name.toLowerCase().includes(query)
    );

    const container = document.getElementById('shipment-list');
    if (filtered.length === 0 && query) {
      container.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <p class="text-sm">No shipments found for "${query}"</p>
        </div>
      `;
    } else {
      // Re-render with filtered list
      const tempShipments = shipments;
      shipments = filtered.length === 0 && !query ? tempShipments : filtered;
      updateShipmentList();
      shipments = tempShipments;
    }
  });
}


// Automated processes simulation
function initAutomatedProcesses() {
  // 1. Auto-sync simulation (every 30 seconds)
  setInterval(() => {
    if (shipments.length > 0) {
      console.log('Auto-sync: Data synchronized with Google Sheets');
    }
  }, 30000);

  // 2. Congestion monitoring (every minute)
  setInterval(() => {
    const congestionAlerts = [
      { port: 'Durban', level: 85 },
      { port: 'Richards Bay', level: 65 }
    ];

    congestionAlerts.forEach(alert => {
      if (alert.level > 80 && Math.random() > 0.7) {
        showToast(`High congestion alert: ${alert.port} at ${alert.level}%`, 'warning');
      }
    });
  }, 60000);

  // 3. Notification badge update
  setInterval(() => {
    const badge = document.getElementById('notification-badge');
    if (badge && shipments.length > 0) {
      badge.style.display = 'block';
    }
  }, 10000);
}


// Initialize app
async function init() {
  await initElementSdk();
  await initDataSdk();
  initEventListeners();
  initAutomatedProcesses();

  // Apply initial config
  if (window.elementSdk) {
    applyConfig(window.elementSdk.config || defaultConfig);
  } else {
    applyConfig(defaultConfig);
  }
}


// Make functions globally available
window.updateShipmentStatus = updateShipmentStatus;
window.deleteShipment = deleteShipment;


// Start the app
init();