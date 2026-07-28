const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Mobile nav */
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
  link.addEventListener("click", () => setNavOpen(false));
});

document.querySelector('.brand[href="#top"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  setNavOpen(false);
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  history.replaceState(null, "", "#top");
});

/* Scroll reveal */
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

/* Animated counters */
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

/* Sticky topbar, progress, section spy */
const topbar = document.querySelector(".topbar");
const progress = document.getElementById("scroll-progress");
const navLinks = [...document.querySelectorAll(".topnav a[data-nav]")];
const sections = navLinks
  .map((link) => document.getElementById(link.dataset.nav))
  .filter(Boolean);

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
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Pointer-driven interactions (desktop) */
if (finePointer && !prefersReducedMotion) {
  document.body.classList.add("has-custom-cursor");

  const glow = document.getElementById("cursor-glow");
  const dot = document.getElementById("cursor-dot");
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

  function tickGlow() {
    gx += (mx - gx) * 0.18;
    gy += (my - gy) * 0.18;
    if (glow) {
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(tickGlow);
  }
  requestAnimationFrame(tickGlow);

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
