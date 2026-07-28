const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* —— Cinematic boot —— */
function finishBoot() {
  document.body.classList.remove("is-booting");
  document.body.classList.add("is-booted");
  requestAnimationFrame(() => {
    document.getElementById("hero-name")?.classList.add("is-ready");
  });
}

if (prefersReducedMotion) {
  finishBoot();
} else {
  window.addEventListener("load", () => {
    window.setTimeout(finishBoot, 120);
  });
  window.setTimeout(finishBoot, 1600);
}

/* —— Mobile nav —— */
const navToggle = document.getElementById("nav-toggle");
const topnav = document.getElementById("topnav");

function setNavOpen(open) {
  topnav?.classList.toggle("is-open", open);
  navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}

navToggle?.addEventListener("click", () => {
  setNavOpen(!topnav?.classList.contains("is-open"));
});

topnav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (e) => {
    setNavOpen(false);
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 72;
    startSmoothScrollTo(y);
    history.replaceState(null, "", href);
  });
});

document.querySelector('.brand[href="#top"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  setNavOpen(false);
  startSmoothScrollTo(0);
  history.replaceState(null, "", "#top");
});

/* —— Kinetic hero name —— */
const heroName = document.getElementById("hero-name");
const CIPHER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function letterizeName(el) {
  if (!el || el.dataset.letterized === "1") return;
  const raw = el.dataset.text || el.textContent.trim();
  const frag = document.createDocumentFragment();
  [...raw].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    if (ch === " ") {
      span.classList.add("is-space");
      span.innerHTML = "&nbsp;";
      span.dataset.char = " ";
    } else {
      span.textContent = ch;
      span.dataset.char = ch;
      if (i === raw.length - 1 && ch === "R") span.classList.add("is-accent");
    }
    span.style.transitionDelay = `${180 + i * 45}ms`;
    frag.appendChild(span);
  });
  el.appendChild(frag);
  el.classList.add("is-letterized");
  el.dataset.letterized = "1";
}

function scrambleName(el) {
  if (!el || prefersReducedMotion || el.dataset.scrambling === "1") return;
  const letters = [...el.querySelectorAll(".letter:not(.is-space)")];
  if (!letters.length) return;
  el.dataset.scrambling = "1";
  const duration = 520;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    letters.forEach((letter, i) => {
      const revealAt = i / letters.length;
      if (t < revealAt + 0.35 && t < 1) {
        letter.textContent = CIPHER[(Math.random() * CIPHER.length) | 0];
      } else {
        letter.textContent = letter.dataset.char;
      }
    });
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      letters.forEach((letter) => {
        letter.textContent = letter.dataset.char;
      });
      el.dataset.scrambling = "0";
    }
  }

  requestAnimationFrame(frame);
}

if (heroName) {
  letterizeName(heroName);
  if (!prefersReducedMotion) {
    heroName.addEventListener("mouseenter", () => scrambleName(heroName));
  }
}

/* —— Scroll reveal —— */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

document.querySelectorAll(".hero .reveal").forEach((el, i) => {
  el.style.transitionDelay = `${i * 70}ms`;
});

/* —— Mask titles —— */
const maskTitles = document.querySelectorAll(".mask-title");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const maskIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-shown");
        maskIo.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );
  maskTitles.forEach((el) => maskIo.observe(el));
} else {
  maskTitles.forEach((el) => el.classList.add("is-shown"));
}

/* —— Animated counters —— */
function animateCount(el) {
  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix || "";
  if (!target) return;
  const duration = 1100;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(target * eased);
    el.textContent = `${value.toLocaleString()}${suffix}`;
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const countEls = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window) {
  const countIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countIo.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  countEls.forEach((el) => countIo.observe(el));
}

/* —— Click ripples —— */
document.querySelectorAll(".ripple-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (prefersReducedMotion) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);
  });
});

/* —— Sticky topbar, progress, section spy, experience rail —— */
const topbar = document.querySelector(".topbar");
const progress = document.getElementById("scroll-progress");
const experienceRail = document.getElementById("experience-rail");
const navLinks = [...document.querySelectorAll(".topnav a[data-nav]")];
const sections = navLinks
  .map((link) => document.getElementById(link.dataset.nav))
  .filter(Boolean);

function updateExperienceRail() {
  if (!experienceRail) return;
  const rect = experienceRail.getBoundingClientRect();
  const view = window.innerHeight || 1;
  const start = view * 0.75;
  const end = view * 0.2;
  const progressRail = (start - rect.top) / (start - end + rect.height);
  const clamped = Math.max(0, Math.min(1, progressRail));
  experienceRail.style.setProperty("--rail", String(clamped));
}

function onScroll() {
  const y = window.scrollY || 0;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (y / max) * 100 : 0;
  if (progress) progress.style.width = `${pct}%`;

  topbar?.classList.toggle("is-scrolled", y > 12);

  let current = sections[0]?.id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 140) current = section.id;
  }
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === current);
  });

  updateExperienceRail();
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* —— Inertia-feel scroll (desktop) —— */
let smoothScrollActive = false;
let targetY = window.scrollY || 0;
let currentY = targetY;
let scrolling = false;

function startSmoothScrollTo(y) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  targetY = Math.max(0, Math.min(max, y));
  if (!smoothScrollActive) {
    window.scrollTo({ top: targetY, behavior: prefersReducedMotion ? "auto" : "smooth" });
    return;
  }
  if (!scrolling) {
    scrolling = true;
    requestAnimationFrame(smoothTick);
  }
}

function smoothTick() {
  currentY += (targetY - currentY) * 0.12;
  if (Math.abs(targetY - currentY) < 0.35) {
    currentY = targetY;
    window.scrollTo(0, currentY);
    scrolling = false;
    onScroll();
    return;
  }
  window.scrollTo(0, currentY);
  onScroll();
  requestAnimationFrame(smoothTick);
}

if (finePointer && !prefersReducedMotion) {
  smoothScrollActive = true;
  document.documentElement.style.scrollBehavior = "auto";

  window.addEventListener(
    "wheel",
    (e) => {
      if (document.body.classList.contains("is-booting")) return;
      if (topnav?.classList.contains("is-open")) return;
      e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(max, targetY + e.deltaY));
      if (!scrolling) {
        scrolling = true;
        requestAnimationFrame(smoothTick);
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (scrolling) return;
      targetY = window.scrollY || 0;
      currentY = targetY;
    },
    { passive: true }
  );
}

/* —— Pointer-driven interactions (desktop) —— */
if (finePointer && !prefersReducedMotion) {
  document.body.classList.add("has-custom-cursor");

  const glow = document.getElementById("cursor-glow");
  const dot = document.getElementById("cursor-dot");
  const trailRoot = document.getElementById("cursor-trail");
  const trailCount = 8;
  const trail = [];

  for (let i = 0; i < trailCount; i += 1) {
    const node = document.createElement("span");
    node.className = "trail-dot";
    trailRoot?.appendChild(node);
    trail.push({ el: node, x: 0, y: 0 });
  }

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let gx = mx;
  let gy = my;

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      document.documentElement.style.setProperty("--mx", `${(mx / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty("--my", `${(my / window.innerHeight) * 100}%`);

      if (dot) {
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }
    },
    { passive: true }
  );

  function tickPointer() {
    gx += (mx - gx) * 0.18;
    gy += (my - gy) * 0.18;
    if (glow) {
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
    }

    let px = mx;
    let py = my;
    trail.forEach((point, i) => {
      const lag = 0.22 - i * 0.018;
      point.x += (px - point.x) * Math.max(0.08, lag);
      point.y += (py - point.y) * Math.max(0.08, lag);
      const scale = 1 - i * 0.1;
      const opacity = 0.55 - i * 0.06;
      point.el.style.opacity = String(Math.max(0, opacity));
      point.el.style.transform = `translate(${point.x}px, ${point.y}px) scale(${scale})`;
      px = point.x;
      py = point.y;
    });

    requestAnimationFrame(tickPointer);
  }
  requestAnimationFrame(tickPointer);

  document.querySelectorAll("a, button, .interactive-tile, .portrait-frame").forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  document.querySelectorAll("[data-tilt], .skill-block, .project").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--local-x", `${x}%`);
      el.style.setProperty("--local-y", `${y}%`);

      if (el.hasAttribute("data-tilt")) {
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      }
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  const portrait = document.getElementById("portrait");
  if (portrait) {
    portrait.addEventListener("mousemove", (e) => {
      const rect = portrait.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      portrait.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    portrait.addEventListener("mouseleave", () => {
      portrait.style.transform = "";
    });
  }
}
