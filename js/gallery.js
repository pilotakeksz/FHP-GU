/**
 * Gallery: static-first (data/gallery.json + assets/gallery/) so images persist across browsers.
 * Fallback: localStorage when static JSON missing. Upload prepares image + JSON for repo. Default: admin/admin123, moderator/mod456.
 */

const GALLERY_JSON_URL = (typeof window !== "undefined" && window.getAssetUrl) ? window.getAssetUrl("data/gallery.json") : "data/gallery.json";
const STORAGE_KEY = "fhp_gallery_data";
const USERS_KEY = "fhp_gallery_users";
const SESSION_USER_KEY = "fhp_gallery_current_user";

var currentGalleryData = [];
var gallerySource = "static";

function hashPassword(password) {
  var hash = 0;
  for (var i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash = hash & hash;
  }
  return "hash_" + Math.abs(hash).toString(16);
}

function getStoredUsers() {
  var raw = localStorage.getItem(USERS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return {
    admin: { hash: hashPassword("admin123"), role: "admin" },
    moderator: { hash: hashPassword("mod456"), role: "mod" }
  };
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function verifyCredentials(username, password) {
  var users = getStoredUsers();
  var user = users[username];
  if (!user || user.hash !== hashPassword(password)) return null;
  return { username: username, role: user.role };
}

function getCurrentUser() {
  var raw = sessionStorage.getItem(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem(SESSION_USER_KEY);
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text == null ? "" : text;
  return div.innerHTML;
}

function showStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = "upload-status show " + (type || "success");
  setTimeout(function () {
    el.classList.remove("show");
  }, 4000);
}

function showExportForRepo(dataUrl, suggestedFilename, jsonSnippet, statusDiv) {
  var wrap = document.getElementById("uploadExportWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "uploadExportWrap";
    wrap.className = "upload-export-wrap hidden";
    var form = document.getElementById("uploadForm");
    if (form && form.parentNode) form.parentNode.appendChild(wrap);
  }
  wrap.innerHTML =
    "<p class=\"upload-export-title\">Add to repo so everyone sees this image</p>" +
    "<p class=\"upload-export-step\">1) Save the image as <code>assets/gallery/" + escapeHtml(suggestedFilename) + "</code></p>" +
    "<button type=\"button\" class=\"admin-btn-discrete\" id=\"uploadExportDownload\">Download image</button>" +
    "<p class=\"upload-export-step\">2) Add this entry to <code>data/gallery.json</code> (inside the array):</p>" +
    "<pre class=\"upload-export-json\">" + escapeHtml(jsonSnippet) + "</pre>" +
    "<button type=\"button\" class=\"admin-btn-discrete\" id=\"uploadExportClose\">Close</button>";
  wrap.classList.remove("hidden");
  document.getElementById("uploadExportDownload").onclick = function () {
    var a = document.createElement("a");
    a.href = dataUrl;
    a.download = suggestedFilename;
    a.click();
  };
  document.getElementById("uploadExportClose").onclick = function () {
    wrap.classList.add("hidden");
  };
}

document.addEventListener("DOMContentLoaded", function () {
  initGallery();
  setupLogin();
  setupUploadForm();
  setupAdminPanel();
  setupManageMods();
  setupLogout();
  fetchAndLoadGallery();
  syncAdminUI();
});

function setupLogin() {
  var loginBtn = document.getElementById("adminLoginBtn");
  var loginForm = document.getElementById("loginForm");
  var loginCancel = document.getElementById("loginCancel");
  var loginUser = document.getElementById("loginUser");
  var loginPass = document.getElementById("loginPass");
  var loginStatus = document.getElementById("loginStatus");

  if (!loginBtn || !loginForm) return;

  loginBtn.addEventListener("click", function () {
    loginForm.classList.remove("hidden");
  });

  loginCancel.addEventListener("click", function () {
    loginForm.classList.add("hidden");
    loginForm.reset();
    if (loginStatus) loginStatus.textContent = "";
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = (loginUser && loginUser.value.trim()) || "";
    var password = (loginPass && loginPass.value) || "";
    var user = verifyCredentials(username, password);
    if (!user) {
      showStatus(loginStatus, "Invalid username or password.", "error");
      return;
    }
    setCurrentUser(user);
    loginForm.classList.add("hidden");
    loginForm.reset();
    syncAdminUI();
    loadGalleryData();
  });
}

function setupAdminPanel() {
  var uploadToggle = document.getElementById("uploadToggle");
  var uploadForm = document.getElementById("uploadForm");
  if (uploadToggle && uploadForm) {
    uploadToggle.addEventListener("click", function () {
      uploadForm.classList.toggle("hidden");
    });
  }
}

function setupUploadForm() {
  var form = document.getElementById("uploadForm");
  var cancelBtn = document.getElementById("uploadCancel");
  if (!form) return;

  cancelBtn.addEventListener("click", function () {
    form.classList.add("hidden");
    form.reset();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var user = getCurrentUser();
    if (!user) {
      showStatus(document.getElementById("uploadStatus"), "Please log in first.", "error");
      return;
    }

    var username = document.getElementById("uploadUser").value.trim();
    var password = document.getElementById("uploadPass").value;
    var file = document.getElementById("uploadFile").files[0];
    var caption = document.getElementById("uploadCaption").value.trim();
    var credit = document.getElementById("uploadCredit").value.trim();
    var statusDiv = document.getElementById("uploadStatus");

    if (!username || !password || !file) {
      showStatus(statusDiv, "Username, password, and image are required.", "error");
      return;
    }

    var verified = verifyCredentials(username, password);
    if (!verified) {
      showStatus(statusDiv, "Invalid username or password.", "error");
      return;
    }

    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        if (gallerySource === "static") {
          var id = Date.now();
          var ext = (file.name && file.name.split(".").pop()) || "jpg";
          var filename = "gallery-" + id + "." + ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
          var repoPath = "assets/gallery/" + filename;
          var entry = {
            id: String(id),
            src: repoPath,
            caption: caption || "Untitled",
            credit: credit || "Anonymous",
            date: new Date().toISOString()
          };
          var jsonSnippet = JSON.stringify(entry, null, 2);
          showStatus(statusDiv, "Static gallery: add image to repo. See instructions below.", "success");
          showExportForRepo(ev.target.result, filename, jsonSnippet, statusDiv);
          form.reset();
          return;
        }
        var galleryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        galleryData.unshift({
          id: Date.now(),
          src: ev.target.result,
          caption: caption || "Untitled",
          credit: credit || "Anonymous",
          date: new Date().toISOString(),
          username: username
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(galleryData));
        currentGalleryData = galleryData;
        showStatus(statusDiv, "Image uploaded successfully.", "success");
        form.reset();
        form.classList.add("hidden");
        loadGalleryData();
      } catch (err) {
        showStatus(statusDiv, "Error processing image.", "error");
      }
    };
    reader.readAsDataURL(file);
  });
}

function setupManageMods() {
  var wrap = document.getElementById("manageModsWrap");
  var toggle = document.getElementById("manageModsToggle");
  var form = document.getElementById("manageModsForm");
  var cancel = document.getElementById("manageModsCancel");
  var modUsername = document.getElementById("modUsername");
  var modPassword = document.getElementById("modPassword");
  var statusEl = document.getElementById("manageModsStatus");

  if (!wrap || !toggle || !form) return;

  toggle.addEventListener("click", function () {
    form.classList.toggle("hidden");
  });

  cancel.addEventListener("click", function () {
    form.classList.add("hidden");
    form.reset();
    if (statusEl) statusEl.textContent = "";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var user = getCurrentUser();
    if (!user || user.role !== "admin") {
      showStatus(statusEl, "Admin only.", "error");
      return;
    }
    var username = (modUsername && modUsername.value.trim()) || "";
    var password = (modPassword && modPassword.value) || "";
    if (!username || !password) {
      showStatus(statusEl, "Username and password required.", "error");
      return;
    }
    var users = getStoredUsers();
    if (users[username]) {
      showStatus(statusEl, "Username already exists.", "error");
      return;
    }
    users[username] = { hash: hashPassword(password), role: "mod" };
    saveUsers(users);
    showStatus(statusEl, "Mod account created.", "success");
    form.reset();
    form.classList.add("hidden");
  });
}

function setupLogout() {
  var btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      clearCurrentUser();
      syncAdminUI();
      reloadGallery();
    });
  }
}

function syncAdminUI() {
  var loginWrap = document.getElementById("adminLoginWrap");
  var adminPanel = document.getElementById("adminPanel");
  var panelUser = document.getElementById("adminPanelUser");
  var manageModsWrap = document.getElementById("manageModsWrap");

  var user = getCurrentUser();
  if (user) {
    if (loginWrap) loginWrap.classList.add("hidden");
    if (adminPanel) adminPanel.classList.remove("hidden");
    if (panelUser) panelUser.textContent = user.username + " (" + user.role + ")";
    if (manageModsWrap) {
      if (user.role === "admin") manageModsWrap.classList.remove("hidden");
      else manageModsWrap.classList.add("hidden");
    }
  } else {
    if (loginWrap) loginWrap.classList.remove("hidden");
    if (adminPanel) adminPanel.classList.add("hidden");
    if (manageModsWrap) manageModsWrap.classList.add("hidden");
  }
}

function fetchAndLoadGallery() {
  fetch(GALLERY_JSON_URL, { cache: "no-store" })
    .then(function (r) {
      if (r.ok) return r.json();
      throw new Error("not found");
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length >= 0) {
        gallerySource = "static";
        currentGalleryData = data;
        loadGalleryData();
        return;
      }
      throw new Error("invalid");
    })
    .catch(function () {
      gallerySource = "local";
      currentGalleryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      loadGalleryData();
    });
}

function deleteImage(id) {
  var user = getCurrentUser();
  if (!user || user.role !== "admin") return;
  if (gallerySource === "static") return;
  var galleryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  galleryData = galleryData.filter(function (img) {
    return String(img.id) !== String(id);
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galleryData));
  currentGalleryData = galleryData;
  loadGalleryData();
}

function imageSrc(img) {
  var s = img.src || "";
  if (s.indexOf("data:") === 0) return s.replace(/"/g, "&quot;");
  var url = (typeof window !== "undefined" && window.getAssetUrl) ? window.getAssetUrl(s) : s;
  return url.replace(/"/g, "&quot;");
}

function loadGalleryData() {
  var galleryGrid = document.getElementById("galleryGrid");
  var creditsList = document.getElementById("creditsList");
  var galleryData = currentGalleryData;
  var user = getCurrentUser();
  var isAdmin = user && user.role === "admin";
  var canDelete = isAdmin && gallerySource === "local";

  if (!galleryGrid) return;

  if (galleryData.length === 0) {
    galleryGrid.innerHTML = '<div class="gallery-placeholder"><p>No images yet. Add images to <code>assets/gallery/</code> and entries to <code>data/gallery.json</code> in the repo, or log in and upload (local preview).</p></div>';
    if (creditsList) creditsList.innerHTML = "<p style=\"color: var(--muted); font-size: 13px;\">No credits yet.</p>";
    return;
  }

  galleryGrid.innerHTML = galleryData
    .map(function (img) {
      var deleteBtn =
        canDelete
          ? '<button type="button" class="gallery-item-delete" onclick="event.stopPropagation(); window.galleryDelete(' +
            JSON.stringify(img.id) +
            ')">Delete</button>'
          : "";
      return (
        '<div class="gallery-item" data-id="' +
        escapeHtml(String(img.id)) +
        '" onclick="openModal(' +
        JSON.stringify(img.id) +
        ')">' +
        deleteBtn +
        '<img src="' +
        imageSrc(img) +
        '" alt="' +
        escapeHtml(img.caption) +
        '" loading="lazy" />' +
        '<div class="gallery-overlay">' +
        '<div class="caption">' +
        escapeHtml(img.caption) +
        "</div>" +
        '<div class="credit">by ' +
        escapeHtml(img.credit) +
        "</div>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  var creditCounts = {};
  galleryData.forEach(function (img) {
    var credit = img.credit || "Anonymous";
    creditCounts[credit] = (creditCounts[credit] || 0) + 1;
  });
  if (creditsList) {
    creditsList.innerHTML = Object.entries(creditCounts)
      .sort(function (a, b) {
        return b[1] - a[1];
      })
      .map(function (entry) {
        var name = entry[0];
        var count = entry[1];
        return (
          '<div class="credit-item">' +
          '<div class="name">' +
          escapeHtml(name) +
          "</div>" +
          '<div class="count">' +
          count +
          " image" +
          (count !== 1 ? "s" : "") +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }
}

window.galleryDelete = function (id) {
  if (!confirm("Delete this image?")) return;
  deleteImage(id);
};

function initGallery() {
  if (document.getElementById("imageModal")) return;
  var modal = document.createElement("div");
  modal.id = "imageModal";
  modal.className = "modal";
  modal.innerHTML =
    '<div class="modal-content">' +
    '<button class="modal-close" onclick="closeModal()">&times;</button>' +
    '<img id="modalImage" class="modal-image" src="" alt="" />' +
    '<div class="modal-info">' +
    '<div class="caption" id="modalCaption"></div>' +
    '<div class="credit" id="modalCredit"></div>' +
    "</div>" +
    "</div>";
  document.body.appendChild(modal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
  modal.addEventListener("click", function (e) {
    if (e.target.id === "imageModal") closeModal();
  });
}

function openModal(imageId) {
  var image = currentGalleryData.find(function (img) {
    return img.id == imageId;
  });
  if (!image) return;
  var src = (image.src || "").indexOf("data:") === 0 ? image.src : ((window.getAssetUrl && window.getAssetUrl(image.src)) || image.src);
  document.getElementById("modalImage").src = src;
  document.getElementById("modalCaption").textContent = image.caption;
  document.getElementById("modalCredit").textContent = "by " + image.credit;
  document.getElementById("imageModal").classList.add("active");
}

function closeModal() {
  document.getElementById("imageModal").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
  var y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();
});
