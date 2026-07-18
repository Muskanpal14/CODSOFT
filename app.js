// Contact Book Application Logic

// Initial Starter Contacts Seed Data
const INITIAL_CONTACTS = [
  {
    id: 'contact-1',
    name: 'Alice Smith',
    phone: '+1 555-0142',
    email: 'alice.smith@example.com',
    address: '123 Market Street, San Francisco, CA',
    category: 'Work',
    isFavorite: true,
    avatarColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'contact-2',
    name: 'David Johnson',
    phone: '+1 555-0188',
    email: 'david.j@techsolutions.io',
    address: '456 Tech Boulevard, Austin, TX',
    category: 'Work',
    isFavorite: false,
    avatarColor: 'linear-gradient(135deg, #10b981, #047857)',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'contact-3',
    name: 'Emily Davis',
    phone: '+1 555-0199',
    email: 'emily.davis@family.net',
    address: '789 Oak Lane, Seattle, WA',
    category: 'Family',
    isFavorite: true,
    avatarColor: 'linear-gradient(135deg, #ec4899, #be185d)',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'contact-4',
    name: 'Michael Brown',
    phone: '+1 555-0123',
    email: 'mbrown@personalmail.org',
    address: '321 Pine Avenue, Chicago, IL',
    category: 'Personal',
    isFavorite: false,
    avatarColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    createdAt: Date.now()
  }
];

// Color gradients for generating vibrant avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #4338ca)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #10b981, #047857)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #f59e0b, #b45309)',
  'linear-gradient(135deg, #06b6d4, #0e7490)'
];

// Application State
let contacts = [];
let activeCategory = 'all';
let searchQuery = '';
let sortBy = 'name-asc';
let currentView = 'grid';
let pendingDeleteId = null;

// DOM Element References
const contactsContainer = document.getElementById('contactsContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const totalCountEl = document.getElementById('totalCount');
const favCountEl = document.getElementById('favCount');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

// Modal Elements
const contactModal = document.getElementById('contactModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const contactForm = document.getElementById('contactForm');
const contactIdInput = document.getElementById('contactId');
const contactNameInput = document.getElementById('contactName');
const contactPhoneInput = document.getElementById('contactPhone');
const contactEmailInput = document.getElementById('contactEmail');
const contactAddressInput = document.getElementById('contactAddress');
const contactCategoryInput = document.getElementById('contactCategory');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const deleteConfirmText = document.getElementById('deleteConfirmText');

// Import / Export
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFileInput');

// View Controls
const sortSelect = document.getElementById('sortSelect');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const categoryPillBtns = document.querySelectorAll('.pill-btn');
const toastContainer = document.getElementById('toastContainer');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadThemePreference();
  loadContacts();
  setupEventListeners();
  render();
});

// Load Contacts from LocalStorage
function loadContacts() {
  const savedData = localStorage.getItem('contact_book_data');
  if (savedData) {
    try {
      contacts = JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse local contacts:', e);
      contacts = INITIAL_CONTACTS;
    }
  } else {
    contacts = [...INITIAL_CONTACTS];
    saveContactsToStorage();
  }
}

// Save Contacts to LocalStorage
function saveContactsToStorage() {
  localStorage.setItem('contact_book_data', JSON.stringify(contacts));
}

// Set up Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    render();
  });

  // Modal open / close
  openAddModalBtn.addEventListener('click', () => openContactModal());
  closeModalBtn.addEventListener('click', closeContactModal);
  cancelModalBtn.addEventListener('click', closeContactModal);

  // Form submit
  contactForm.addEventListener('submit', handleFormSubmit);

  // Delete modal buttons
  closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Category Pills
  categoryPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      render();
    });
  });

  // Sort dropdown
  sortSelect.addEventListener('change', (e) => {
    sortBy = e.target.value;
    render();
  });

  // Grid / List View Toggles
  gridViewBtn.addEventListener('click', () => {
    currentView = 'grid';
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    contactsContainer.className = 'contacts-grid';
  });

  listViewBtn.addEventListener('click', () => {
    currentView = 'list';
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    contactsContainer.className = 'contacts-list';
  });

  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Export & Import
  exportBtn.addEventListener('click', exportContactsJSON);
  importFileInput.addEventListener('change', importContactsJSON);
}

// Get Filtered & Sorted Contacts
function getFilteredContacts() {
  return contacts.filter(contact => {
    // Search query match (name or phone)
    const matchesSearch = searchQuery === '' || 
      contact.name.toLowerCase().includes(searchQuery) || 
      contact.phone.toLowerCase().includes(searchQuery) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery));

    // Category filter match
    let matchesCategory = true;
    if (activeCategory === 'favorites') {
      matchesCategory = contact.isFavorite;
    } else if (activeCategory !== 'all') {
      matchesCategory = contact.category === activeCategory;
    }

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
    return 0;
  });
}

// Render Main UI
function render() {
  const filtered = getFilteredContacts();

  // Update counters
  totalCountEl.textContent = contacts.length;
  favCountEl.textContent = contacts.filter(c => c.isFavorite).length;

  // Render contacts grid/list
  if (filtered.length === 0) {
    contactsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-address-card"></i>
        </div>
        <h3>No contacts found</h3>
        <p>${searchQuery ? `No contact matches "${searchQuery}". Try searching for another name or phone number.` : 'Your contact list is currently empty. Click "Add New Contact" to create one.'}</p>
        ${searchQuery ? `<button class="btn-secondary" onclick="resetSearch()"><i class="fa-solid fa-rotate-left"></i> Reset Search</button>` : ''}
      </div>
    `;
    return;
  }

  contactsContainer.innerHTML = filtered.map(contact => createContactCardHTML(contact)).join('');
}

// Global Helper to Reset Search from Empty State
window.resetSearch = function() {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  render();
};

// Generate Contact Initials
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Create Contact Card HTML Template
function createContactCardHTML(contact) {
  const initials = getInitials(contact.name);
  const avatarBg = contact.avatarColor || AVATAR_GRADIENTS[0];

  return `
    <div class="contact-card" data-id="${contact.id}">
      <div class="card-header">
        <div class="contact-avatar" style="background: ${avatarBg};">
          ${initials}
        </div>
        <div class="contact-main-info">
          <div class="contact-name">${escapeHTML(contact.name)}</div>
          <span class="contact-category">${escapeHTML(contact.category || 'General')}</span>
        </div>
        <button class="btn-fav ${contact.isFavorite ? 'active' : ''}" onclick="toggleFavorite('${contact.id}')" title="${contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <i class="fa-${contact.isFavorite ? 'solid' : 'regular'} fa-star"></i>
        </button>
      </div>

      <div class="card-body">
        <div class="info-item">
          <i class="fa-solid fa-phone"></i>
          <a href="tel:${escapeHTML(contact.phone)}">${escapeHTML(contact.phone)}</a>
        </div>
        ${contact.email ? `
          <div class="info-item">
            <i class="fa-solid fa-envelope"></i>
            <a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a>
          </div>
        ` : ''}
        ${contact.address ? `
          <div class="info-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHTML(contact.address)}</span>
          </div>
        ` : ''}
      </div>

      <div class="card-footer">
        <button class="card-action-btn" onclick="openContactModal('${contact.id}')" title="Edit Contact">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="card-action-btn delete-btn" onclick="openDeleteModal('${contact.id}')" title="Delete Contact">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;
}

// Escape HTML utility to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Modal Handlers (Add / Edit)
function openContactModal(contactId = null) {
  contactForm.reset();
  if (contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    modalTitle.textContent = 'Edit Contact';
    contactIdInput.value = contact.id;
    contactNameInput.value = contact.name;
    contactPhoneInput.value = contact.phone;
    contactEmailInput.value = contact.email || '';
    contactAddressInput.value = contact.address || '';
    contactCategoryInput.value = contact.category || 'Personal';
  } else {
    modalTitle.textContent = 'Add New Contact';
    contactIdInput.value = '';
  }
  contactModal.classList.add('active');
  contactNameInput.focus();
}

function closeContactModal() {
  contactModal.classList.remove('active');
}

// Form Submit Handler (Add / Edit)
function handleFormSubmit(e) {
  e.preventDefault();

  const id = contactIdInput.value;
  const name = contactNameInput.value.trim();
  const phone = contactPhoneInput.value.trim();
  const email = contactEmailInput.value.trim();
  const address = contactAddressInput.value.trim();
  const category = contactCategoryInput.value;

  if (!name || !phone) {
    showToast('Name and Phone Number are required fields.', 'warning');
    return;
  }

  if (id) {
    // Update Contact
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        name,
        phone,
        email,
        address,
        category
      };
      showToast(`Contact "${name}" updated successfully.`, 'success');
    }
  } else {
    // Add New Contact
    const randomAvatarGradient = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];
    const newContact = {
      id: 'contact-' + Date.now(),
      name,
      phone,
      email,
      address,
      category,
      isFavorite: false,
      avatarColor: randomAvatarGradient,
      createdAt: Date.now()
    };
    contacts.unshift(newContact);
    showToast(`New contact "${name}" added.`, 'success');
  }

  saveContactsToStorage();
  closeContactModal();
  render();
}

// Favorite Toggle Handler
window.toggleFavorite = function(contactId) {
  const contact = contacts.find(c => c.id === contactId);
  if (contact) {
    contact.isFavorite = !contact.isFavorite;
    saveContactsToStorage();
    showToast(contact.isFavorite ? `Added "${contact.name}" to favorites.` : `Removed "${contact.name}" from favorites.`, 'info');
    render();
  }
};

// Delete Handlers
window.openDeleteModal = function(contactId) {
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return;
  pendingDeleteId = contactId;
  deleteConfirmText.textContent = `Are you sure you want to delete contact "${contact.name}"?`;
  deleteModal.classList.add('active');
};

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  pendingDeleteId = null;
}

function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  const index = contacts.findIndex(c => c.id === pendingDeleteId);
  if (index !== -1) {
    const deletedContact = contacts[index];
    contacts.splice(index, 1);
    saveContactsToStorage();
    showToast(`Deleted contact "${deletedContact.name}".`, 'danger');
  }

  closeDeleteModal();
  render();
}

// Theme Switcher
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('contact_book_theme', newTheme);
  updateThemeIcon(newTheme);
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem('contact_book_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// Export Contacts to JSON File
function exportContactsJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `contacts_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Contacts exported successfully.', 'success');
}

// Import Contacts from JSON File
function importContactsJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        contacts = importedData;
        saveContactsToStorage();
        showToast(`Successfully imported ${importedData.length} contacts.`, 'success');
        render();
      } else {
        showToast('Invalid file format. Expected a JSON array of contacts.', 'danger');
      }
    } catch (err) {
      showToast('Error reading JSON file.', 'danger');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset input
}

// Toast Notification System
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'danger') iconClass = 'fa-circle-exclamation';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
