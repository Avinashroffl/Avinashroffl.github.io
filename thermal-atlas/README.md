# Thermal Atlas · Hottest Cities

Live site: [avinashroffl.github.io/thermal-atlas](https://avinashroffl.github.io/thermal-atlas/)

| View | URL |
|---|---|
| **World · Top 50** | [avinashroffl.github.io/thermal-atlas](https://avinashroffl.github.io/thermal-atlas/) |
| **India · Top 25** | [avinashroffl.github.io/thermal-atlas/india](https://avinashroffl.github.io/thermal-atlas/india/) |

Old `/top50/` links redirect to `/thermal-atlas/`.

Static HTML / CSS / JS on GitHub Pages. The browser fetches fresh weather on every visit — **no daily manual updates**. Leave it alone until the API or CDN changes.

---

## Views / tabs

Pages share `styles.css` + `script.js`, but use **separate city lists**:

| Page | City file | Sample size | Ranked |
|---|---|---|---|
| `/thermal-atlas/` | `cities.js` | **~250** world cities (**20** India) | Top **50** |
| `/thermal-atlas/india/` | `india/cities.js` | **100** India-only | Top **25** |

Why ~250 for world (not 1,000)? Open-Meteo’s free tier rate-limits bursty multi-location scans (`Minutely API request limit exceeded`). At 50 cities/batch, **250 cities ≈ 5 weather batches** (+ 1 AQI) — reliable with `concurrency: 2` and a short gap between batches. 1,000 cities (~20 batches) routinely skipped 8+ batches.

World list keeps only **20** India cities (hottest desert-belt + Madurai). Full India coverage lives on the India page.

Both World and India use the shared enriched UI (`enhance.css` + `enhance.js`): live mercury meter, top-3 podium, city filter, heat bars, orbit rings, and cursor glow.

---

## How this works

Temperatures (and related metrics) come from [Open-Meteo](https://open-meteo.com/) — a free, open-source weather API (no key required).

On each visit we:

1. Scan the page’s city sample (`cities.js` or `india/cities.js`)
2. Take each city’s **max hourly temperature** from the past 24 hours
3. Sort and show the top **50** (world) or **25** (India)
4. Enrich those winners with humidity, wind, precipitation, and AQI

This is **not every city on Earth / in India** — rankings are relative to each page’s sample.

| Piece | Detail |
|---|---|
| **API** | Open-Meteo Forecast + `past_days=1` hourly `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `precipitation` |
| **AQI** | Open-Meteo Air Quality API — `us_aqi` (fallback `european_aqi`) |
| **Host** | Pure HTML / CSS / JS — `thermal-atlas/` on GitHub Pages |
| **Globe** | WebGL Earth via [globe.gl](https://globe.gl) (Three.js); heat pins from lat/lon |

---

## API calls on page load (not 1 request per city)

Open-Meteo accepts **many lat/lon pairs in one request**. Init does **not** call the API once per city.

### World (`/thermal-atlas/`)

| Step | What | Requests |
|---|---|---|
| Weather scan | **~250** cities ÷ **50 per batch** | **~5** forecast calls |
| Parallelism | Up to **2** batches in flight + **400ms** gap | rate-limit safe |
| Air quality | Only the **top 50** winners | **~1** AQI call |

**Total ≈ 6 API calls** per world page load.

### India (`/thermal-atlas/india/`)

| Step | What | Requests |
|---|---|---|
| Weather scan | **100** India cities ÷ **50 per batch** | **2** forecast calls |
| Air quality | Only the **top 25** winners | **~1** AQI call |

**Total ≈ 3 API calls** per India page load.

Config (`THERMAL_ATLAS_CONFIG`):

- `batch: 50`, `concurrency: 2`, `batchGapMs: 300–400`
- World: `topN: 50`
- India: `topN: 25` (loads `india/cities.js`)

AQI is fetched **after** ranking so we don’t pull air quality for every scanned city.

---

## Metrics

- **Temperature** — max of hourly 2 m air temp over the past 24 hours (ranking key)
- **Humidity** — relative humidity at the hottest hour
- **Wind** — 10 m wind speed at the hottest hour
- **Precipitation** — sum of hourly precip over the past 24 hours
- **AQI** — latest US AQI (or European) from the past day

---

## Error handling

If Open-Meteo is unreachable, slow, or returns an error, the page shows a clear banner with:

- A short title (timeout, offline, HTTP 429, 5xx, etc.)
- The **exact error detail**
- A calm note that the site itself is fine
- A **Try again** button

Partial weather-batch failures are skipped when possible so rankings can still render from successful batches. AQI failures never block the temperature list.

---

## Project files

```
thermal-atlas/
├── index.html          # World top 50
├── cities.js           # ~250 world cities (20 India)
├── enhance.css         # Shared enriched UI styles
├── enhance.js          # Shared meter / podium / filter
├── india/
│   ├── index.html      # India top 25
│   └── cities.js       # 100 India-only cities
├── styles.css
├── script.js
└── README.md
```

---

## Local preview

```bash
cd /path/to/portfolio
python3 -m http.server 8080
```

- World → [http://localhost:8080/thermal-atlas/](http://localhost:8080/thermal-atlas/)
- India → [http://localhost:8080/thermal-atlas/india/](http://localhost:8080/thermal-atlas/india/)

---

## Attribution

Weather and air quality data © [Open-Meteo](https://open-meteo.com/) (CC BY 4.0).
