/* ===== Clock ===== */

function updateMenuTime() {
  const el = document.getElementById("menu-time");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
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
  skills: "Skills",
  education: "Education",
};

let tabHistory = ["about"];
let historyIndex = 0;

function openFinderWindow() {
  const win = document.getElementById("finder-window");
  if (!win) return;
  win.classList.remove("is-minimized-anim");
  win.classList.add("is-active");
  bringToFront(win);
}

function switchTab(tabName, addToHistory = true) {
  if (!TAB_LABELS[tabName]) return;

  document.querySelectorAll(".finder-panel").forEach((p) => {
    p.classList.toggle("is-visible", p.dataset.panel === tabName);
  });

  document.querySelectorAll(".finder-sidebar-item[data-tab]").forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".menu-item[data-menu-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.menuTab === tabName);
  });

  const titleEl = document.getElementById("finder-title");
  if (titleEl) titleEl.textContent = TAB_LABELS[tabName] || tabName;

  if (addToHistory && tabHistory[historyIndex] !== tabName) {
    tabHistory = tabHistory.slice(0, historyIndex + 1);
    tabHistory.push(tabName);
    historyIndex = tabHistory.length - 1;
  }

  updateNavButtons();
  closeMobileSidebar();
}

function updateNavButtons() {
  const backBtn = document.getElementById("finder-back");
  const fwdBtn = document.getElementById("finder-forward");
  if (backBtn) backBtn.style.opacity = historyIndex > 0 ? "1" : "0.35";
  if (fwdBtn) fwdBtn.style.opacity = historyIndex < tabHistory.length - 1 ? "1" : "0.35";
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("finder-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("is-open");
  if (backdrop) backdrop.hidden = true;
}

let zCounter = 20;

function bringToFront(win) {
  if (!win) return;
  zCounter += 1;
  win.style.zIndex = String(zCounter);
}

/* ===== Toast ===== */

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

/* ===== About This Mac ===== */

function openAboutMac() {
  const el = document.getElementById("about-mac");
  if (el) el.hidden = false;
}

function closeAboutMac() {
  const el = document.getElementById("about-mac");
  if (el) el.hidden = true;
}

/* ===== Notifications ===== */

const NOTIFICATIONS = [
  {
    id: "storage",
    app: "System",
    title: "Storage optimized",
    body: "Version Retention Settings now saves 100+ TB of file versions daily across global DCs.",
    action: () => { openFinderWindow(); switchTab("about"); },
  },
  {
    id: "grad",
    app: "TCE",
    title: "Best Outgoing Student",
    body: "Honored for academics, leadership, and community service (2019–2023).",
    action: () => { openFinderWindow(); switchTab("education"); },
  },
  {
    id: "role",
    app: "Zoho",
    title: "Member Technical Staff",
    body: "Building scalable backend systems for enterprise SaaS — Java, Spring Boot, and distributed services.",
    action: () => { openFinderWindow(); switchTab("experience"); },
  },
];

let unreadCount = NOTIFICATIONS.length;

function renderNotificationCenter() {
  const list = document.getElementById("nc-list");
  const badge = document.getElementById("nc-badge");
  if (!list) return;

  if (!NOTIFICATIONS.length) {
    list.innerHTML = `<div class="nc-empty">No new notifications</div>`;
  } else {
    list.innerHTML = NOTIFICATIONS.map(
      (n) => `
      <article class="nc-card" data-nc-id="${n.id}">
        <div class="nc-card-app"><span>${n.app}</span><span>now</span></div>
        <div class="nc-card-title">${n.title}</div>
        <div class="nc-card-body">${n.body}</div>
      </article>`
    ).join("");

    list.querySelectorAll(".nc-card").forEach((card) => {
      card.addEventListener("click", () => {
        const item = NOTIFICATIONS.find((n) => n.id === card.dataset.ncId);
        closeNotificationCenter();
        if (item?.action) item.action();
      });
    });
  }

  if (badge) {
    if (unreadCount > 0) {
      badge.hidden = false;
      badge.textContent = String(unreadCount);
    } else {
      badge.hidden = true;
    }
  }
}

function openNotificationCenter() {
  const nc = document.getElementById("notification-center");
  const cc = document.getElementById("control-center");
  if (cc) cc.hidden = true;
  if (!nc) return;
  nc.hidden = false;
  unreadCount = 0;
  renderNotificationCenter();
}

function closeNotificationCenter() {
  const nc = document.getElementById("notification-center");
  if (nc) nc.hidden = true;
}

function clearNotifications() {
  NOTIFICATIONS.length = 0;
  unreadCount = 0;
  renderNotificationCenter();
}

function pushBanner(n, delay = 0) {
  const stack = document.getElementById("banner-stack");
  if (!stack || document.body.classList.contains("focus-mode")) return;

  setTimeout(() => {
    const el = document.createElement("div");
    el.className = "banner";
    el.innerHTML = `
      <div class="banner-app">${n.app}</div>
      <div class="banner-title">${n.title}</div>
      <div class="banner-body">${n.body}</div>`;
    el.addEventListener("click", () => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 220);
      closeNotificationCenter();
      if (n.action) n.action();
    });
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 250);
    }, 4500);
  }, delay);
}

function scheduleBootBanners() {
  NOTIFICATIONS.forEach((n, i) => pushBanner(n, 700 + i * 900));
}

/* ===== Control Center ===== */

function toggleControlCenter() {
  const cc = document.getElementById("control-center");
  if (!cc) return;
  cc.hidden = !cc.hidden;
  if (!cc.hidden) closeNotificationCenter();
}

function closeControlCenter() {
  const cc = document.getElementById("control-center");
  if (cc) cc.hidden = true;
}

/* ===== Terminal ===== */

const TERM_HELP = `Available commands:
  help                 Show this help
  whoami               Who is Avinash
  neofetch             System / profile summary
  ls                   List portfolio sections
  cat <file>           Read a section (about, experience, projects, skills, education)
  open <section>       Open Finder to a section
  skills               List tech stack
  experience           Jump to experience
  projects             Jump to projects
  contact              Email Avinash
  github / linkedin    Open profiles
  clear                Clear the terminal
  exit                 Close Terminal`;

const TERM_FILES = {
  about: `Avinash R — Member Technical Staff @ Zoho
Backend Developer (Java & Spring Boot)
3+ years building scalable SaaS backends for Zoho WorkDrive.
Highlights: 100+ TB storage saved daily · 95% faster Large File View · SSL 3d→<4h`,
  experience: `Member Technical Staff · Zoho (Jun 2023 – Present)
  Version Retention, Large File View, SSL automation, storage alerts, admin dashboard
Project Trainee · Zoho (Jan–May 2023)
  Bulk Version Deletion · Restore Deleted Versions
Summer Intern · Zoho (Jul 2022) · E-commerce platform
Web Developer · Byonz (2020) · React + Firebase`,
  projects: `1. Full-Stack E-Commerce — Java, Spring Boot, Vue.js, Docker
2. macOS Portfolio — this site (HTML/CSS/JS)
3. Madurai Corona Counter — Chart.js + PHP`,
  skills: `Java · Python · Spring Boot · JPA · Kafka · Redis · MySQL
GCP · Docker · REST · System Design · JUnit · Maven
AI tools: Cursor · GitHub Copilot`,
  education: `B.Tech IT · Thiagarajar College of Engineering (2019–2023)
CGPA 9.49 · Best Outgoing Student
Dept. General Secretary · Placement Coordinator`,
};

let termHistory = [];
let termHistoryIndex = -1;
let termBooted = false;

function openTerminal() {
  const win = document.getElementById("terminal-window");
  const input = document.getElementById("terminal-input");
  if (!win) return;
  win.classList.remove("is-minimized-anim");
  win.classList.add("is-active");
  bringToFront(win);

  if (!termBooted) {
    termBooted = true;
    termPrint(`Last login: ${new Date().toLocaleString()} on ttys001`, "term-ok");
    termPrint("Welcome to AvinashOS. Type <span class=\"term-accent\">help</span> to explore the portfolio as a CLI.\n");
  }

  requestAnimationFrame(() => input?.focus());
}

function closeTerminal() {
  const win = document.getElementById("terminal-window");
  if (!win) return;
  win.classList.remove("is-active", "is-maximized");
}

function termPrint(html, className = "") {
  const out = document.getElementById("terminal-output");
  if (!out) return;
  const line = document.createElement("div");
  if (className) line.className = className;
  line.innerHTML = html;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function termRun(raw) {
  const line = raw.trim();
  const prompt = document.getElementById("terminal-prompt")?.textContent || "%";
  termPrint(`<span class="term-cmd">${prompt} ${escapeHtml(line)}</span>`);

  if (!line) return;

  termHistory.push(line);
  termHistoryIndex = termHistory.length;

  const [cmd, ...args] = line.split(/\s+/);
  const arg = args.join(" ").toLowerCase();

  switch (cmd.toLowerCase()) {
    case "help":
    case "?":
      termPrint(TERM_HELP);
      break;
    case "whoami":
      termPrint("avinash — backend engineer @ zoho · java · spring boot · workdrive", "term-ok");
      break;
    case "neofetch":
      termPrint(`<span class="term-accent">avinash@portfolio</span>
------------------
Role      Member Technical Staff, Zoho
Stack     Java, Spring Boot, Kafka, Redis, MySQL
Focus     Storage · Versioning · SSL automation
Edu       B.Tech IT, TCE · CGPA 9.49
Award     Best Outgoing Student 2019–23
Uptime    3+ years shipping SaaS backends`);
      break;
    case "ls":
      termPrint("about  experience  projects  skills  education  contact");
      break;
    case "cat": {
      const key = arg || "";
      if (TERM_FILES[key]) termPrint(TERM_FILES[key]);
      else termPrint(`cat: ${escapeHtml(arg || "(missing)")}: No such file. Try: about experience projects skills education`, "term-err");
      break;
    }
    case "open":
    case "cd": {
      const key = arg.replace(/^\.\//, "");
      if (TAB_LABELS[key]) {
        openFinderWindow();
        switchTab(key);
        termPrint(`Opened ${key}`, "term-ok");
      } else {
        termPrint(`open: unknown section '${escapeHtml(arg)}'`, "term-err");
      }
      break;
    }
    case "skills":
      openFinderWindow();
      switchTab("skills");
      termPrint(TERM_FILES.skills, "term-ok");
      break;
    case "experience":
      openFinderWindow();
      switchTab("experience");
      termPrint("Opening Experience…", "term-ok");
      break;
    case "projects":
      openFinderWindow();
      switchTab("projects");
      termPrint("Opening Projects…", "term-ok");
      break;
    case "contact":
    case "mail":
      termPrint("Opening mailto:avinashroffl@gmail.com …", "term-ok");
      window.location.href = "mailto:avinashroffl@gmail.com";
      break;
    case "github":
      termPrint("Opening GitHub…", "term-ok");
      window.open("https://github.com/avinashroffl", "_blank", "noopener");
      break;
    case "linkedin":
      termPrint("Opening LinkedIn…", "term-ok");
      window.open("https://www.linkedin.com/in/avinashrofficial/", "_blank", "noopener");
      break;
    case "clear":
    case "cls": {
      const out = document.getElementById("terminal-output");
      if (out) out.innerHTML = "";
      break;
    }
    case "exit":
    case "quit":
      closeTerminal();
      showToast("Terminal closed");
      break;
    case "sudo":
      termPrint("Nice try. Permission denied — hiring managers are still welcome.", "term-err");
      break;
    case "echo":
      termPrint(escapeHtml(args.join(" ")));
      break;
    case "date":
      termPrint(new Date().toString());
      break;
    default:
      termPrint(`zsh: command not found: ${escapeHtml(cmd)}. Type help.`, "term-err");
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ===== Spotlight ===== */

const SPOTLIGHT_ITEMS = [
  { label: "About", meta: "Section", action: () => { openFinderWindow(); switchTab("about"); } },
  { label: "Experience", meta: "Section", action: () => { openFinderWindow(); switchTab("experience"); } },
  { label: "Projects", meta: "Section", action: () => { openFinderWindow(); switchTab("projects"); } },
  { label: "Skills", meta: "Section", action: () => { openFinderWindow(); switchTab("skills"); } },
  { label: "Education", meta: "Section", action: () => { openFinderWindow(); switchTab("education"); } },
  { label: "Terminal", meta: "App", action: () => openTerminal() },
  { label: "Launchpad", meta: "App", action: () => openLaunchpad() },
  { label: "About This Mac", meta: "System", action: () => openAboutMac() },
  { label: "Notification Center", meta: "System", action: () => openNotificationCenter() },
  { label: "GitHub", meta: "Link", action: () => window.open("https://github.com/avinashroffl", "_blank", "noopener") },
  { label: "LinkedIn", meta: "Link", action: () => window.open("https://www.linkedin.com/in/avinashrofficial/", "_blank", "noopener") },
  { label: "Contact Email", meta: "Mail", action: () => { window.location.href = "mailto:avinashroffl@gmail.com"; } },
  { label: "Lock Screen", meta: "System", action: () => lockScreen() },
];

let spotlightIndex = 0;

function openSpotlight() {
  const login = document.getElementById("login-screen");
  if (login && !login.classList.contains("login-screen--hidden")) return;

  const spotlight = document.getElementById("spotlight");
  const input = document.getElementById("spotlight-input");
  if (!spotlight || !input) return;

  closeControlCenter();
  closeNotificationCenter();
  spotlight.hidden = false;
  input.value = "";
  spotlightIndex = 0;
  renderSpotlightResults("");
  requestAnimationFrame(() => input.focus());
}

function closeSpotlight() {
  const spotlight = document.getElementById("spotlight");
  if (spotlight) spotlight.hidden = true;
}

function renderSpotlightResults(query) {
  const list = document.getElementById("spotlight-results");
  if (!list) return;

  const q = query.trim().toLowerCase();
  const matches = SPOTLIGHT_ITEMS.filter(
    (item) => !q || item.label.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q)
  );

  if (!matches.length) {
    list.innerHTML = `<li class="spotlight-empty">No results</li>`;
    return;
  }

  spotlightIndex = Math.min(spotlightIndex, matches.length - 1);

  list.innerHTML = matches
    .map(
      (item, i) => `
      <li>
        <button type="button" class="spotlight-result${i === spotlightIndex ? " is-active" : ""}" data-spotlight-index="${i}">
          <span>${item.label}</span>
          <span class="spotlight-result-meta">${item.meta}</span>
        </button>
      </li>`
    )
    .join("");

  list.querySelectorAll(".spotlight-result").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.spotlightIndex);
      runSpotlightAction(matches[idx]);
    });
  });

  list._matches = matches;
}

function runSpotlightAction(item) {
  if (!item) return;
  closeSpotlight();
  item.action();
}

function lockScreen() {
  const login = document.getElementById("login-screen");
  const appleMenu = document.getElementById("apple-menu");
  if (appleMenu) appleMenu.classList.remove("apple-menu--open");
  closeSpotlight();
  closeAboutMac();
  closeControlCenter();
  closeNotificationCenter();
  closeLaunchpad();
  closeTerminal();
  if (login) login.classList.remove("login-screen--hidden");
}

/* ===== Window drag / controls ===== */

function initDraggableWindow(win) {
  if (!win) return;
  const handle = win.querySelector("[data-drag-handle]");
  if (!handle) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  const canDrag = () =>
    window.matchMedia("(min-width: 901px)").matches && !win.classList.contains("is-maximized");

  handle.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest(".window-controls") || e.target.closest(".finder-nav-btn")) return;
    if (!canDrag()) return;
    isDragging = true;
    bringToFront(win);
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

  handle.addEventListener(
    "touchstart",
    (e) => {
      if (e.target.closest(".window-controls") || e.target.closest(".finder-nav-btn")) return;
      if (!canDrag()) return;
      const touch = e.touches[0];
      isDragging = true;
      bringToFront(win);
      const rect = win.getBoundingClientRect();
      startX = touch.clientX;
      startY = touch.clientY;
      offsetX = rect.left;
      offsetY = rect.top;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      win.style.left = `${offsetX + (touch.clientX - startX)}px`;
      win.style.top = `${offsetY + (touch.clientY - startY)}px`;
      win.style.transform = "none";
    },
    { passive: true }
  );

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  win.addEventListener("mousedown", () => bringToFront(win));
}

function initFinderWindow() {
  const win = document.getElementById("finder-window");
  if (!win) return;

  const closeBtn = win.querySelector("[data-window-close]");
  const minimizeBtn = win.querySelector("[data-window-minimize]");
  const maximizeBtn = win.querySelector("[data-window-maximize]");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      win.classList.remove("is-active", "is-maximized");
      showToast("Finder closed — reopen from the Dock");
    });
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => {
      win.classList.add("is-minimized-anim");
      setTimeout(() => {
        win.classList.remove("is-active", "is-minimized-anim", "is-maximized");
        showToast("Minimized — tap a Dock icon to restore");
      }, 280);
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", () => {
      win.classList.toggle("is-maximized");
      if (win.classList.contains("is-maximized")) {
        win.style.left = "";
        win.style.top = "";
        win.style.transform = "";
      }
    });
  }

  initDraggableWindow(win);
}

function initTerminalWindow() {
  const win = document.getElementById("terminal-window");
  if (!win) return;

  const closeBtn = win.querySelector("[data-term-close]");
  const minimizeBtn = win.querySelector("[data-term-minimize]");
  const maximizeBtn = win.querySelector("[data-term-maximize]");
  const input = document.getElementById("terminal-input");
  const body = document.getElementById("terminal-body");

  if (closeBtn) closeBtn.addEventListener("click", () => closeTerminal());

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => {
      win.classList.add("is-minimized-anim");
      setTimeout(() => {
        win.classList.remove("is-active", "is-minimized-anim", "is-maximized");
        showToast("Terminal minimized");
      }, 280);
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", () => {
      win.classList.toggle("is-maximized");
      if (win.classList.contains("is-maximized")) {
        win.style.left = "";
        win.style.top = "";
        win.style.transform = "";
      }
    });
  }

  if (body) {
    body.addEventListener("click", () => input?.focus());
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = input.value;
        input.value = "";
        termRun(value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!termHistory.length) return;
        termHistoryIndex = Math.max(0, termHistoryIndex - 1);
        input.value = termHistory[termHistoryIndex] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!termHistory.length) return;
        termHistoryIndex = Math.min(termHistory.length, termHistoryIndex + 1);
        input.value = termHistoryIndex === termHistory.length ? "" : termHistory[termHistoryIndex] || "";
      } else if (e.key === "c" && (e.metaKey || e.ctrlKey)) {
        termPrint("^C");
        input.value = "";
      }
    });
  }

  initDraggableWindow(win);
}

/* ===== Init ===== */

window.addEventListener("DOMContentLoaded", () => {
  initFinderWindow();
  initTerminalWindow();
  updateNavButtons();
  renderNotificationCenter();

  document.querySelectorAll(".finder-sidebar-item[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll(".dock-icon[data-dock-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFinderWindow();
      switchTab(btn.dataset.dockTab);
    });
  });

  document.querySelectorAll(".desktop-icon[data-desktop-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFinderWindow();
      switchTab(btn.dataset.desktopTab);
    });
  });

  document.querySelectorAll(".menu-item[data-menu-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFinderWindow();
      switchTab(btn.dataset.menuTab);
    });
  });

  document.querySelectorAll("[data-switch-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFinderWindow();
      switchTab(btn.dataset.switchTab);
      const appleMenu = document.getElementById("apple-menu");
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
      closeAboutMac();
    });
  });

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

  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("finder-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !sidebar.classList.contains("is-open");
      sidebar.classList.toggle("is-open", open);
      if (backdrop) backdrop.hidden = !open;
    });
  }

  if (backdrop) backdrop.addEventListener("click", closeMobileSidebar);

  const login = document.getElementById("login-screen");
  let bannersScheduled = false;

  function unlockDesktop() {
    if (!login || login.classList.contains("login-screen--hidden")) return;
    login.classList.add("login-screen--hidden");
    openFinderWindow();
    if (!bannersScheduled) {
      bannersScheduled = true;
      scheduleBootBanners();
    }
  }

  if (login) {
    login.addEventListener("click", unlockDesktop);
    window.addEventListener("keydown", (e) => {
      if (!login.classList.contains("login-screen--hidden")) {
        unlockDesktop();
        e.preventDefault();
      }
    });
  }

  const appleToggle = document.getElementById("apple-menu-toggle");
  const appleMenu = document.getElementById("apple-menu");
  const appleLock = document.getElementById("apple-lock");
  const appleSpotlight = document.getElementById("apple-spotlight");
  const appleAbout = document.getElementById("apple-about-mac");
  const appleTerminal = document.getElementById("apple-terminal");

  if (appleToggle && appleMenu) {
    appleToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      appleMenu.classList.toggle("apple-menu--open");
      closeControlCenter();
    });
  }

  if (appleLock) {
    appleLock.addEventListener("click", (e) => {
      e.stopPropagation();
      lockScreen();
    });
  }

  if (appleSpotlight) {
    appleSpotlight.addEventListener("click", (e) => {
      e.stopPropagation();
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
      openSpotlight();
    });
  }

  if (appleAbout) {
    appleAbout.addEventListener("click", (e) => {
      e.stopPropagation();
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
      openAboutMac();
    });
  }

  if (appleTerminal) {
    appleTerminal.addEventListener("click", (e) => {
      e.stopPropagation();
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
      openTerminal();
    });
  }

  document.getElementById("about-mac-close")?.addEventListener("click", closeAboutMac);
  document.getElementById("about-mac")?.addEventListener("click", (e) => {
    if (e.target.id === "about-mac") closeAboutMac();
  });

  document.getElementById("dock-terminal")?.addEventListener("click", openTerminal);
  document.getElementById("desktop-terminal")?.addEventListener("click", openTerminal);

  const spotlightTrigger = document.getElementById("spotlight-trigger");
  const spotlight = document.getElementById("spotlight");
  const spotlightInput = document.getElementById("spotlight-input");

  if (spotlightTrigger) {
    spotlightTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      openSpotlight();
    });
  }

  if (spotlight) {
    spotlight.addEventListener("click", (e) => {
      if (e.target === spotlight) closeSpotlight();
    });
  }

  if (spotlightInput) {
    spotlightInput.addEventListener("input", () => {
      spotlightIndex = 0;
      renderSpotlightResults(spotlightInput.value);
    });

    spotlightInput.addEventListener("keydown", (e) => {
      const list = document.getElementById("spotlight-results");
      const matches = list?._matches || [];

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!matches.length) return;
        spotlightIndex = (spotlightIndex + 1) % matches.length;
        renderSpotlightResults(spotlightInput.value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!matches.length) return;
        spotlightIndex = (spotlightIndex - 1 + matches.length) % matches.length;
        renderSpotlightResults(spotlightInput.value);
      } else if (e.key === "Enter") {
        e.preventDefault();
        runSpotlightAction(matches[spotlightIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeSpotlight();
      }
    });
  }

  // Notification Center
  const ncTrigger = document.getElementById("nc-trigger");
  const menuTime = document.getElementById("menu-time");
  const ncClear = document.getElementById("nc-clear");

  const toggleNc = (e) => {
    e.stopPropagation();
    closeControlCenter();
    const nc = document.getElementById("notification-center");
    if (nc?.hidden) openNotificationCenter();
    else closeNotificationCenter();
  };
  ncTrigger?.addEventListener("click", toggleNc);
  menuTime?.addEventListener("click", toggleNc);

  document.getElementById("notification-center")?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  ncClear?.addEventListener("click", (e) => {
    e.stopPropagation();
    clearNotifications();
  });

  // Control Center
  const ccTrigger = document.getElementById("control-center-trigger");
  ccTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (appleMenu) appleMenu.classList.remove("apple-menu--open");
    toggleControlCenter();
  });

  document.getElementById("control-center")?.addEventListener("click", (e) => e.stopPropagation());

  document.getElementById("cc-wifi")?.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("is-on");
    const small = e.currentTarget.querySelector("small");
    if (small) small.textContent = e.currentTarget.classList.contains("is-on") ? "Connected" : "Off";
  });

  document.getElementById("cc-focus")?.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("is-on");
    const on = e.currentTarget.classList.contains("is-on");
    document.body.classList.toggle("focus-mode", on);
    const small = e.currentTarget.querySelector("small");
    if (small) small.textContent = on ? "Do Not Disturb" : "Off";
    showToast(on ? "Focus: Do Not Disturb" : "Focus off");
  });

  document.getElementById("cc-dark")?.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("is-on");
    const dim = e.currentTarget.classList.contains("is-on");
    document.body.classList.toggle("appearance-dim", dim);
    const brightness = document.getElementById("cc-brightness");
    const desktop = document.querySelector(".desktop");
    if (desktop && !dim && brightness) {
      desktop.style.setProperty("--desktop-brightness", String(Number(brightness.value) / 100));
    } else if (desktop && dim) {
      desktop.style.removeProperty("--desktop-brightness");
    }
    const small = e.currentTarget.querySelector("small");
    if (small) small.textContent = dim ? "Dimmed" : "Dark";
  });

  document.getElementById("cc-brightness")?.addEventListener("input", (e) => {
    const desktop = document.querySelector(".desktop");
    if (!desktop) return;
    document.body.classList.remove("appearance-dim");
    document.getElementById("cc-dark")?.classList.remove("is-on");
    const darkLabel = document.querySelector("#cc-dark small");
    if (darkLabel) darkLabel.textContent = "Dark";
    desktop.style.setProperty("--desktop-brightness", String(Number(e.target.value) / 100));
  });

  window.addEventListener("click", () => {
    if (appleMenu) appleMenu.classList.remove("apple-menu--open");
    closeControlCenter();
    closeNotificationCenter();
  });

  window.addEventListener("keydown", (e) => {
    const loginHidden = !login || login.classList.contains("login-screen--hidden");
    if (!loginHidden) return;

    const meta = e.metaKey || e.ctrlKey;
    const tag = (e.target && e.target.tagName) || "";
    const typing = tag === "INPUT" || tag === "TEXTAREA";

    if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (spotlight && !spotlight.hidden) closeSpotlight();
      else openSpotlight();
    }

    if (meta && e.key.toLowerCase() === "t" && !typing) {
      e.preventDefault();
      openTerminal();
    }

    if ((e.key === "F4" || (meta && e.key.toLowerCase() === "l")) && !typing) {
      e.preventDefault();
      toggleLaunchpad();
    }

    if (e.key === "Escape") {
      closeSpotlight();
      closeAboutMac();
      closeControlCenter();
      closeNotificationCenter();
      closeLaunchpad();
      closeMobileSidebar();
      if (appleMenu) appleMenu.classList.remove("apple-menu--open");
    }
  });

  initIosShell();
});

/* ===== iPhone shell ===== */

const IOS_TITLES = {
  about: "About",
  experience: "Work",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
};

function isMobileShell() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function updateIosClocks() {
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  document.querySelectorAll("[data-ios-clock]").forEach((el) => {
    el.textContent = time;
  });
  const lockTime = document.getElementById("ios-lock-time");
  if (lockTime) lockTime.textContent = time;
  const lockDate = document.getElementById("ios-lock-date");
  if (lockDate) {
    lockDate.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
}

let iosUnlocking = false;
let iosLastIconRect = null;

function iosFinishUnlock() {
  const lock = document.getElementById("ios-lock");
  const home = document.getElementById("ios-home");
  const shell = document.getElementById("ios-shell");
  if (lock) lock.hidden = true;
  if (home) {
    home.classList.remove("ios-home--locked", "ios-home--unlocking");
    home.classList.add("ios-home--ready");
  }
  shell?.classList.remove("ios-unlocking");
  iosUnlocking = false;
}

function iosOpenApp(section, originEl) {
  if (!TAB_LABELS[section]) return;

  const app = document.getElementById("ios-app");
  const scroll = document.getElementById("ios-app-scroll");
  const title = document.getElementById("ios-nav-title");
  const panel = document.querySelector(`.finder-panel[data-panel="${section}"]`);

  if (!app || !scroll || !panel) return;

  // Cancel any in-flight close so a quick reopen isn't wiped by a stale timeout
  iosAppCloseToken += 1;
  app.classList.remove("ios-app--closing");

  if (originEl) {
    const rect = originEl.getBoundingClientRect();
    iosLastIconRect = rect;
    const ox = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const oy = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    app.style.setProperty("--app-ox", `${ox}%`);
    app.style.setProperty("--app-oy", `${oy}%`);
  } else {
    app.style.setProperty("--app-ox", "50%");
    app.style.setProperty("--app-oy", "50%");
  }

  scroll.innerHTML = "";
  const clone = panel.cloneNode(true);
  clone.classList.add("is-visible");
  clone.removeAttribute("data-panel");
  scroll.appendChild(clone);

  if (title) title.textContent = IOS_TITLES[section] || TAB_LABELS[section];
  app.hidden = false;
  app.classList.remove("ios-app--closing");
  app.classList.add("ios-app--opening");
  scroll.scrollTop = 0;

  const clearOpen = () => app.classList.remove("ios-app--opening");
  app.addEventListener("animationend", clearOpen, { once: true });

  scroll.querySelectorAll("[data-switch-tab]").forEach((btn) => {
    btn.addEventListener("click", () => iosOpenApp(btn.dataset.switchTab));
  });
}

let iosAppCloseToken = 0;

function iosGoHome() {
  const app = document.getElementById("ios-app");
  if (!app || app.hidden || app.classList.contains("ios-app--closing")) return;

  if (iosLastIconRect) {
    const ox = ((iosLastIconRect.left + iosLastIconRect.width / 2) / window.innerWidth) * 100;
    const oy = ((iosLastIconRect.top + iosLastIconRect.height / 2) / window.innerHeight) * 100;
    app.style.setProperty("--app-ox", `${ox}%`);
    app.style.setProperty("--app-oy", `${oy}%`);
  }

  const token = ++iosAppCloseToken;
  app.classList.remove("ios-app--opening");
  app.classList.add("ios-app--closing");

  const finish = () => {
    if (token !== iosAppCloseToken) return;
    app.hidden = true;
    app.classList.remove("ios-app--closing");
  };
  app.addEventListener("animationend", finish, { once: true });
  setTimeout(finish, 400);
}

function iosUnlock() {
  const lock = document.getElementById("ios-lock");
  const home = document.getElementById("ios-home");
  const shell = document.getElementById("ios-shell");
  if (!lock || lock.hidden || iosUnlocking) return;

  iosUnlocking = true;
  shell?.classList.add("ios-unlocking");
  home?.classList.remove("ios-home--locked", "ios-home--ready");
  home?.classList.add("ios-home--unlocking");

  setTimeout(() => {
    iosFinishUnlock();
  }, 820);
}

function initIosShell() {
  updateIosClocks();
  setInterval(updateIosClocks, 30_000);

  const lock = document.getElementById("ios-lock");
  if (lock) {
    let touchStartY = null;
    let unlockedByGesture = false;

    lock.addEventListener("click", () => {
      if (unlockedByGesture) {
        unlockedByGesture = false;
        return;
      }
      iosUnlock();
    });

    lock.addEventListener(
      "touchstart",
      (e) => {
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    lock.addEventListener(
      "touchend",
      (e) => {
        if (touchStartY == null) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        touchStartY = null;
        if (dy > 40) {
          unlockedByGesture = true;
          iosUnlock();
        }
      },
      { passive: true }
    );
  }

  document.querySelectorAll("[data-ios-app]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const section = el.dataset.iosApp;
      if (!section) return;
      e.preventDefault();
      const origin = el.querySelector(".ios-app-glyph") || el;
      iosOpenApp(section, origin);
    });
  });

  document.getElementById("ios-nav-back")?.addEventListener("click", iosGoHome);
  document.getElementById("ios-app-home-bar")?.addEventListener("click", iosGoHome);

  initLaunchpad();
  initDesktopParallax();
}

/* ===== Launchpad ===== */

function openLaunchpad() {
  const lp = document.getElementById("launchpad");
  if (!lp || isMobileShell()) return;
  closeControlCenter();
  closeNotificationCenter();
  closeSpotlight();
  lp.hidden = false;
}

function closeLaunchpad() {
  const lp = document.getElementById("launchpad");
  if (lp) lp.hidden = true;
}

function toggleLaunchpad() {
  const lp = document.getElementById("launchpad");
  if (!lp) return;
  if (lp.hidden) openLaunchpad();
  else closeLaunchpad();
}

function initLaunchpad() {
  document.getElementById("dock-launchpad")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleLaunchpad();
  });

  const lp = document.getElementById("launchpad");
  lp?.addEventListener("click", (e) => {
    if (e.target === lp || e.target.id === "launchpad-backdrop") closeLaunchpad();
  });

  document.querySelectorAll("[data-launch]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.launch;
      closeLaunchpad();
      if (id === "terminal") openTerminal();
      else if (TAB_LABELS[id]) {
        openFinderWindow();
        switchTab(id);
      }
    });
  });
}

function initDesktopParallax() {
  if (!window.matchMedia("(min-width: 769px) and (hover: hover)").matches) return;
  const desktop = document.querySelector(".desktop");
  if (!desktop) return;

  window.addEventListener(
    "mousemove",
    (e) => {
      const x = 50 + (e.clientX / window.innerWidth - 0.5) * 4;
      const y = 50 + (e.clientY / window.innerHeight - 0.5) * 4;
      desktop.style.backgroundPosition = `${x}% ${y}%`;
    },
    { passive: true }
  );
}