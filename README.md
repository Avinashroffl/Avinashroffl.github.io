# Avinash R — Personal Website

Vanilla HTML / CSS / JS site on **GitHub Pages** — no build step, no framework.

Two surfaces share this repo:

| Path | What it is |
|---|---|
| [`/`](https://avinashroffl.github.io/) | Interactive portfolio (macOS desktop + iPhone shell) |
| [`/professional/`](https://avinashroffl.github.io/professional/) | Recruiter-focused backend resume page |

---

## Live links

* **Portfolio:** [avinashroffl.github.io](https://avinashroffl.github.io)
* **Professional page:** [avinashroffl.github.io/professional](https://avinashroffl.github.io/professional)
* **GitHub repo:** [Avinashroffl/Avinashroffl.github.io](https://github.com/Avinashroffl/Avinashroffl.github.io)

---

## About the author

**Avinash R** — Member Technical Staff @ Zoho · Backend Engineer (Java · Spring Boot · MySQL)

* Ships production SaaS backends with measurable impact (storage, latency, reliability)
* B.Tech Information Technology — Thiagarajar College of Engineering (Best Outgoing Student, 2019–23)
* Based in Chennai / Greater Madurai

**Contact**

* Email: [avinashroffl@gmail.com](mailto:avinashroffl@gmail.com)
* LinkedIn: [avinashrofficial](https://www.linkedin.com/in/avinashrofficial/)
* GitHub: [avinashroffl](https://github.com/avinashroffl)

---

## 1. Interactive portfolio (`/`)

A dual-shell experience that switches by viewport:

| Viewport | Shell |
|---|---|
| **≥ 769px** | macOS Finder-style desktop |
| **≤ 768px** | iPhone lock → home → apps |

### macOS (desktop)

* Lock screen — click or press any key to unlock
* Finder window — About, Experience, Projects, Skills, Education
* Window controls — close, minimize, maximize; drag by title bar
* Dock — section shortcuts, Launchpad, Terminal, GitHub, LinkedIn
* Launchpad — full-screen app grid · `F4` · `⌘L` / `Ctrl+L`
* Spotlight — jump to sections and links · `⌘K` / `Ctrl+K`
* Terminal — interactive CLI (`help`, `neofetch`, `cat about`, …) · `⌘T` / `Ctrl+T`
* About This Mac, Notification Center, Control Center
* Desktop icons + subtle wallpaper parallax

### iPhone (mobile)

* Lock screen with large clock — swipe up or tap to unlock
* Spring unlock animation into home grid
* Full-screen section apps with zoom open/close
* Glass dock, Dynamic Island–style status bar, safe-area insets

### Keyboard shortcuts (desktop)

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Spotlight |
| `⌘T` / `Ctrl+T` | Terminal |
| `F4` / `⌘L` / `Ctrl+L` | Launchpad |
| `Esc` | Close overlays |

---

## 2. Professional page (`/professional/`)

Recruiter-focused single page — midnight teal theme, mobile-responsive, honest skills tied to real Zoho work.

### Highlights

* Sticky nav with scroll spy and mobile menu
* Impact metrics from production work (storage, latency, SSL enablement, tickets)
* Core skills only: Java, Spring Boot, MySQL, Redis, Kafka, Docker, system design
* Motion system on desktop: boot veil, kinetic name, aurora, cursor trail, experience rail, beam borders, inertia scroll
* Respects `prefers-reduced-motion` and touch devices

### Hire / contact

* **Hire me** and **Email Avinash** open `mailto:avinashroffl@gmail.com`

---

## Content overview

* **Zoho** — version-retention settings at multi-DC scale, large-file APIs, SSL/domain enablement, storage monitoring, production support
* **Skills** — Java, Spring Boot, Spring Data JPA, REST, MySQL, Redis, Kafka, Docker, Maven, Git, JUnit; Copilot/Cursor as tooling
* **Projects** — Full-stack e-commerce (Spring Boot + Vue), this interactive portfolio, Madurai COVID tracker
* **Education** — B.Tech IT @ TCE · Best Outgoing Student 2019–23

---

## Tech stack

* HTML5 · CSS3 (Grid, Flexbox, custom properties, backdrop-filter, animations)
* Vanilla JavaScript (no frameworks, no bundler)
* Google Fonts — portfolio: Inter / JetBrains Mono · professional: Outfit / Source Serif 4
* Hosted as static files on GitHub Pages

---

## Project structure

```
├── index.html           # Interactive portfolio (macOS + iPhone)
├── styles.css
├── script.js
├── profile.jpeg         # Shared profile photo
├── favicon.png          # Tab icons (from profile photo)
├── favicon-32.png
├── apple-touch-icon.png
├── background.png       # Desktop / lock wallpaper
├── professional/
│   ├── index.html       # Recruiter-focused backend page
│   ├── styles.css
│   └── script.js
└── README.md
```

---

## Local preview

```bash
cd /path/to/portfolio
python3 -m http.server 8080
```

Then open:

* Portfolio → [http://localhost:8080/](http://localhost:8080/)
* Professional → [http://localhost:8080/professional/](http://localhost:8080/professional/)

Push to `main` on `Avinashroffl.github.io` and GitHub Pages serves from the repo root.

---

## License / use

Personal portfolio site for Avinash R. Feel free to explore the code for inspiration; please don’t republish the personal content or photos as your own.
