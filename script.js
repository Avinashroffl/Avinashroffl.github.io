/* ===== Clock ===== */

function updateMenuTime() {
  const el = document.getElementById("menu-time");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

setInterval(updateMenuTime, 30_000);
updateMenuTime();

/* ===== Tab System ===== */

const TAB_LABELS = {
  about: "About",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
};

let tabHistory = ["about"];
let historyIndex = 0;

function switchTab(tabName, addToHistory = true) {
  // Update panels
  document.querySelectorAll(".finder-panel").forEach((p) => {
    p.classList.toggle("is-visible", p.dataset.panel === tabName);
  });

  // Update sidebar selection
  document.querySelectorAll(".finder-sidebar-item[data-tab]").forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.tab === tabName);
  });

  // Update finder title
  const titleEl = document.getElementById("finder-title");
  if (titleEl) titleEl.textContent = TAB_LABELS[tabName] || tabName;

  // Manage history
  if (addToHistory && tabHistory[historyIndex] !== tabName) {
    // Trim forward history
    tabHistory = tabHistory.slice(0, historyIndex + 1);
    tabHistory.push(tabName);
    historyIndex = tabHistory.length - 1;
  }

  updateNavButtons();

  // Close mobile sidebar after switching
  const sidebar = document.getElementById("finder-sidebar");
  if (sidebar) sidebar.classList.remove("is-open");
}

function updateNavButtons() {
  const backBtn = document.getElementById("finder-back");
  const fwdBtn = document.getElementById("finder-forward");
  if (backBtn) backBtn.style.opacity = historyIndex > 0 ? "1" : "0.35";
  if (fwdBtn) fwdBtn.style.opacity = historyIndex < tabHistory.length - 1 ? "1" : "0.35";
}

/* ===== Window Controls ===== */

function initFinderWindow() {
  const win = document.getElementById("finder-window");
  if (!win) return;

  // Close & minimize
  const closeBtn = win.querySelector("[data-window-close]");
  const minimizeBtn = win.querySelector("[data-window-minimize]");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => win.classList.remove("is-active"));
  }
  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => win.classList.remove("is-active"));
  }

  // Drag support
  const handle = win.querySelector("[data-drag-handle]");
  if (!handle) return;

  let isDragging = false;
  let startX = 0, startY = 0, offsetX = 0, offsetY = 0;

  handle.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest(".window-controls") || e.target.closest(".finder-nav-btn")) return;
    isDragging = true;
    const rect = win.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    offsetX = rect.left;
    offsetY = rect.top;
    document.body.style.userSelect = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    win.style.left = `${offsetX + (e.clientX - startX)}px`;
    win.style.top = `${offsetY + (e.clientY - startY)}px`;
    win.style.transform = "none";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });

  // Touch drag
  handle.addEventListener("touchstart", (e) => {
    if (e.target.closest(".window-controls") || e.target.closest(".finder-nav-btn")) return;
    const touch = e.touches[0];
    isDragging = true;
    const rect = win.getBoundingClientRect();
    startX = touch.clientX;
    startY = touch.clientY;
    offsetX = rect.left;
    offsetY = rect.top;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    win.style.left = `${offsetX + (touch.clientX - startX)}px`;
    win.style.top = `${offsetY + (touch.clientY - startY)}px`;
    win.style.transform = "none";
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });
}

/* ===== Init ===== */

window.addEventListener("DOMContentLoaded", () => {
  initFinderWindow();
  updateNavButtons();

  // Sidebar tab buttons
  document.querySelectorAll(".finder-sidebar-item[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Dock buttons → open finder window + switch tab
  document.querySelectorAll(".dock-icon[data-dock-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const win = document.getElementById("finder-window");
      if (win) win.classList.add("is-active");
      switchTab(btn.dataset.dockTab);
    });
  });

  // Menu bar items
  document.querySelectorAll(".menu-item[data-menu-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const win = document.getElementById("finder-window");
      if (win) win.classList.add("is-active");
      switchTab(btn.dataset.menuTab);
    });
  });

  // In-content tab switch buttons (e.g. "View Projects" in About)
  document.querySelectorAll("[data-switch-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const win = document.getElementById("finder-window");
      if (win) win.classList.add("is-active");
      switchTab(btn.dataset.switchTab);
      // Close apple menu if open
      const appleMenu = document.getElementById("apple-menu");
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
    });
  });

  // Back / Forward navigation
  const backBtn = document.getElementById("finder-back");
  const fwdBtn = document.getElementById("finder-forward");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (historyIndex > 0) {
        historyIndex--;
        switchTab(tabHistory[historyIndex], false);
      }
    });
  }
  if (fwdBtn) {
    fwdBtn.addEventListener("click", () => {
      if (historyIndex < tabHistory.length - 1) {
        historyIndex++;
        switchTab(tabHistory[historyIndex], false);
      }
    });
  }

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("finder-sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("is-open");
    });
    // Close sidebar on click outside
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove("is-open");
      }
    });
  }

  // Login screen
  const login = document.getElementById("login-screen");
  function unlockDesktop() {
    if (!login || login.classList.contains("login-screen--hidden")) return;
    login.classList.add("login-screen--hidden");
    const win = document.getElementById("finder-window");
    if (win) win.classList.add("is-active");
  }

  if (login) {
    login.addEventListener("click", unlockDesktop);
    window.addEventListener("keydown", unlockDesktop);
  }

  // Apple menu
  const appleToggle = document.getElementById("apple-menu-toggle");
  const appleMenu = document.getElementById("apple-menu");
  const appleLock = document.getElementById("apple-lock");

  if (appleToggle && appleMenu) {
    appleToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      appleMenu.classList.toggle("apple-menu--open");
    });
    window.addEventListener("click", () => appleMenu.classList.remove("apple-menu--open"));
  }

  if (appleLock && login) {
    appleLock.addEventListener("click", (e) => {
      e.stopPropagation();
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
      login.classList.remove("login-screen--hidden");
    });
  }
});

