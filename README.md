# Avinash R — Portfolio

Personal portfolio with a **macOS desktop** on large screens and an **iPhone home screen** on phones. Built with vanilla HTML, CSS, and JavaScript — no build step, ready for GitHub Pages.

## Live

**[avinashroffl.github.io](https://avinashroffl.github.io)**

## Dual experience

| Viewport | Shell |
|---|---|
| **≥ 769px** (laptop / desktop) | macOS Finder desktop |
| **≤ 768px** (phone / small tablet) | iPhone lock → home → apps |

Resize the browser or use DevTools device mode to switch shells.

---

## macOS (desktop)

* **Lock screen** — Click or press any key to unlock
* **Finder window** — Sidebar tabs: About, Experience, Projects, Skills, Education
* **Traffic lights** — Close, minimize (toast), maximize / restore
* **Draggable windows** — Drag Finder or Terminal by the title bar
* **Dock** — Section shortcuts, Launchpad, Terminal, GitHub, LinkedIn
* **Launchpad** — Full-screen app grid · Dock icon · `F4` · `⌘L` / `Ctrl+L`
* **Spotlight** — Jump to sections and links · `⌘K` / `Ctrl+K`
* **Terminal** — Interactive CLI (`help`, `neofetch`, `cat about`, `open skills`, …) · `⌘T` / `Ctrl+T`
* **About This Mac** — Career-themed system specs dialog
* **Notification Center** — Boot banners + slide-over panel (bell or clock)
* **Control Center** — Wi‑Fi, Focus (Do Not Disturb), appearance dim, brightness
* **Desktop icons** — About, Projects, Terminal
* **Wallpaper parallax** — Subtle mouse-follow on desktop

## iPhone (mobile)

* **Lock screen** — Large clock · swipe up or tap to unlock
* **Unlock animation** — Lock lifts away; home springs from zoomed/blurred → sharp with staggered icons
* **Home screen** — Greeting widget, app grid, glass dock, Dynamic Island status bar
* **Apps** — Full-screen sections that zoom open/close from the tapped icon
* **Home indicator** — Tap to return from an app
* **Safe areas** — Respects notch / home-indicator insets

---

## Content

Aligned with [LinkedIn](https://www.linkedin.com/in/avinashrofficial/) and resume highlights:

* Zoho WorkDrive — version retention, Large File View, SSL automation, storage alerts
* Skills — Java, Spring Boot, Kafka, Redis, MySQL, GCP, Docker, system design
* Projects — E-commerce (Spring Boot + Vue), this portfolio, Madurai COVID tracker
* Education — B.Tech IT @ TCE, CGPA 9.49, Best Outgoing Student 2019–23

---

## Tech stack

* HTML5 · CSS3 (Flexbox, Grid, backdrop-filter, animations)
* Vanilla JavaScript (no frameworks)
* Google Fonts — Inter, JetBrains Mono
* Inline SVG icons

## Project structure

```
├── index.html        # macOS + iPhone shells
├── styles.css        # Layout, dual-shell breakpoints, animations
├── script.js         # Tabs, Terminal, Spotlight, iOS unlock, Launchpad
├── profile.jpeg      # Profile photo
├── background.png    # Wallpaper (desktop + lock screens)
└── README.md
```

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Static files only — push to the `main` branch of `Avinashroffl.github.io` and GitHub Pages serves them from the repo root.

### Keyboard shortcuts (desktop)

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Spotlight |
| `⌘T` / `Ctrl+T` | Terminal |
| `F4` / `⌘L` / `Ctrl+L` | Launchpad |
| `Esc` | Close overlays |

---

## Author

**Avinash R**  
Member Technical Staff @ Zoho · Backend Developer (Java & Spring Boot)  
B.Tech IT, Thiagarajar College of Engineering (Best Outgoing Student 2019–23)

* [LinkedIn](https://www.linkedin.com/in/avinashrofficial/)
* [GitHub](https://github.com/avinashroffl)
* [Email](mailto:avinashroffl@gmail.com)
