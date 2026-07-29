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

Both pages share `cities.js`, `styles.css`, and `script.js`. Config is set per page via `window.THERMAL_ATLAS_CONFIG`:

| Page | Filter | Ranked |
|---|---|---|
| `/thermal-atlas/` | Full worldwide sample in `cities.js` | Top **50** worldwide |
| `/thermal-atlas/india/` | `country === "India"` only (**100** cities) | Top **25** in India |

The top bar switches between **World** and **India**. Madurai is in the India sample, so it appears on the India tab whenever it ranks in that top 25 (even when it misses the world top 50).

### India city sample (100)

The India list is a curated set of **100 real cities** biased toward places that historically record the highest summer maxima (IMD / heatwave reporting): Thar Desert belt (Phalodi, Churu, Sri Ganganagar, Bikaner, Barmer, Jaisalmer, Jodhpur…), hot Gujarat, NW plains, Vidarbha, and other high-max metros. False name collisions from open city dumps (**Dubai**, **Doha**, **George Town**, **Oran**, etc. mislabeled as India) were removed; coordinates for cities like Chandigarh and Jodhpur were corrected.

---

## How this works

Temperatures (and related metrics) come from [Open-Meteo](https://open-meteo.com/) — a free, open-source weather API (no key required).

On each visit we:

1. Scan the relevant city sample (world or India-filtered)
2. Take each city’s **max hourly temperature** from the past 24 hours
3. Sort and show the top **50** (world) or **25** (India)
4. Enrich those winners with humidity, wind, precipitation, and AQI

This is **not every city on Earth / in India** — rankings are relative to the sample in `cities.js`.

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
| Weather scan | ~1,000 cities ÷ **50 per batch** | **~20** forecast calls |
| Parallelism | Up to **4** batches in flight | `CONCURRENCY = 4` |
| Air quality | Only the **top 50** winners | **~1** AQI call |

**Total ≈ 21 API calls** per world page load (plus a retry if a batch fails).

### India (`/thermal-atlas/india/`)

| Step | What | Requests |
|---|---|---|
| Weather scan | **100** India cities ÷ **50 per batch** | **2** forecast calls |
| Air quality | Only the **top 25** winners | **~1** AQI call |

**Total ≈ 3 API calls** per India page load.

Constants live in `script.js` / page config:

- `BATCH = 50`
- `CONCURRENCY = 4`
- World: `topN: 50`
- India: `topN: 25`, `country: "India"`

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
├── india/
│   └── index.html      # India top 25
├── styles.css
├── script.js           # Shared fetch / rank / globe / errors
├── cities.js           # ~1,000-city sample (window.THERMAL_CITIES)
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
