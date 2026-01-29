/**
 * Gallery JavaScript - Handles image gallery, upload, and credits
 */

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  setupUploadForm();
  loadGalleryData();
});

// Gallery data stored in localStorage
const STORAGE_KEY = 'fhp_gallery_data';
const USERS_KEY = 'fhp_gallery_users';

// Initialize upload form listeners
function setupUploadForm() {
  const toggleBtn = document.getElementById('uploadToggle');
  const uploadForm = document.getElementById('uploadForm');
  const cancelBtn = document.getElementById('uploadCancel');
  const form = document.getElementById('uploadForm');

  toggleBtn.addEventListener('click', () => {
    uploadForm.classList.toggle('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    uploadForm.classList.add('hidden');
    form.reset();
  });

  form.addEventListener('submit', handleUpload);
}

// Handle image upload with authentication
async function handleUpload(e) {
  e.preventDefault();

  const username = document.getElementById('uploadUser').value.trim();
  const password = document.getElementById('uploadPass').value;
  const file = document.getElementById('uploadFile').files[0];
  const caption = document.getElementById('uploadCaption').value.trim();
  const credit = document.getElementById('uploadCredit').value.trim();
  const statusDiv = document.getElementById('uploadStatus');

  // Validate
  if (!username || !password || !file) {
    showStatus('All fields required.', 'error', statusDiv);
    return;
  }

  // Verify credentials (check against stored users)
  if (!verifyCredentials(username, password)) {
    showStatus('Invalid username or password.', 'error', statusDiv);
    return;
  }

  // Read file and convert to base64
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      // Store image data
      const imageData = {
        id: Date.now(),
        src: event.target.result,
        caption: caption || 'Untitled',
        credit: credit || 'Anonymous',
        date: new Date().toISOString(),
        username: username
      };

      // Get existing gallery data
      let galleryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      galleryData.unshift(imageData); // Add to beginning (latest first)
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(galleryData));

      showStatus('Image uploaded successfully!', 'success', statusDiv);
      
      // Reset form
      document.getElementById('uploadForm').reset();
      document.getElementById('uploadForm').classList.add('hidden');
      
      // Reload gallery
      loadGalleryData();
    } catch (err) {
      showStatus('Error processing image.', 'error', statusDiv);
    }
  };

  reader.readAsDataURL(file);
}

// Verify credentials against stored users
function verifyCredentials(username, password) {
  // Simple SHA-256 hash comparison (client-side only)
  // For production, this should be server-side!
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || {
    'admin': hashPassword('admin123'),
    'moderator': hashPassword('mod456')
  };

  const hashedPassword = hashPassword(password);
  return users[username] === hashedPassword;
}

// Simple hash function (NOT cryptographically secure - for demo only!)
// For production, use bcrypt or similar on the server
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

// Show upload status message
function showStatus(message, type, element) {
  element.textContent = message;
  element.className = `upload-status show ${type}`;
  setTimeout(() => {
    element.classList.remove('show');
  }, 4000);
}

// Load and display gallery
function loadGalleryData() {
  const galleryGrid = document.getElementById('galleryGrid');
  const creditsList = document.getElementById('creditsList');
  
  const galleryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (galleryData.length === 0) {
    galleryGrid.innerHTML = '<div class="gallery-placeholder"><p>No images yet. Upload some!</p></div>';
    creditsList.innerHTML = '<p style="color: var(--muted); font-size: 13px;">No credits yet.</p>';
    return;
  }

  // Display gallery items (latest first)
  galleryGrid.innerHTML = galleryData.map(img => `
    <div class="gallery-item" onclick="openModal('${img.id}')">
      <img src="${img.src}" alt="${img.caption}" loading="lazy" />
      <div class="gallery-overlay">
        <div class="caption">${escapeHtml(img.caption)}</div>
        <div class="credit">by ${escapeHtml(img.credit)}</div>
      </div>
    </div>
  `).join('');

  // Build credits list (count images per photographer)
  const creditCounts = {};
  galleryData.forEach(img => {
    const credit = img.credit || 'Anonymous';
    creditCounts[credit] = (creditCounts[credit] || 0) + 1;
  });

  creditsList.innerHTML = Object.entries(creditCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `
      <div class="credit-item">
        <div class="name">${escapeHtml(name)}</div>
        <div class="count">${count} image${count !== 1 ? 's' : ''}</div>
      </div>
    `).join('');
}

// Initialize gallery modal
function initGallery() {
  // Create modal if it doesn't exist
  if (!document.getElementById('imageModal')) {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <img id="modalImage" class="modal-image" src="" alt="" />
        <div class="modal-info">
          <div class="caption" id="modalCaption"></div>
          <div class="credit" id="modalCredit"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Close modal on background click
  document.getElementById('imageModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'imageModal') closeModal();
  });
}

// Open image in modal
function openModal(imageId) {
  const galleryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const image = galleryData.find(img => img.id == imageId);

  if (!image) return;

  document.getElementById('modalImage').src = image.src;
  document.getElementById('modalCaption').textContent = image.caption;
  document.getElementById('modalCredit').textContent = `by ${image.credit}`;
  document.getElementById('imageModal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('imageModal').classList.remove('active');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add year to footer
document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('y');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
