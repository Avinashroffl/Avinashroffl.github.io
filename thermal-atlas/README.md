# Thermal Atlas · Top 50 Hottest Cities

Live site: [avinashroffl.github.io/thermal-atlas](https://avinashroffl.github.io/thermal-atlas/)

Old `/top50/` links redirect to `/thermal-atlas/`.

Static HTML / CSS / JS on GitHub Pages. The browser fetches fresh weather on every visit — **no daily manual updates**. Leave it alone until the API or CDN changes.

---

## How this works

Temperatures (and related metrics) come from [Open-Meteo](https://open-meteo.com/) — a free, open-source weather API (no key required).

On each visit we:

1. Scan a fixed sample of **1,000** heat-prone / major cities
2. Take each city’s **max hourly temperature** from the past 24 hours
3. Sort and show the **top 50**
4. Enrich those 50 with humidity, wind, precipitation, and AQI

This is **not every city on Earth** — rankings are relative to the 1,000-city sample in `cities.js`.

| Piece | Detail |
|---|---|
| **API** | Open-Meteo Forecast + `past_days=1` hourly `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `precipitation` |
| **AQI** | Open-Meteo Air Quality API — `us_aqi` (fallback `european_aqi`) |
| **Host** | Pure HTML / CSS / JS — `thermal-atlas/` on GitHub Pages |
| **Globe** | WebGL Earth via [globe.gl](https://globe.gl) (Three.js); heat pins from lat/lon |

---

## API calls on page load (not 1,000 requests)

Open-Meteo accepts **many lat/lon pairs in one request**. Init does **not** call the API once per city.

| Step | What | Requests |
|---|---|---|
| Weather scan | 1,000 cities ÷ **50 per batch** | **~20** forecast calls |
| Parallelism | Up to **4** batches in flight | `CONCURRENCY = 4` |
| Air quality | Only the **top 50** winners | **~1** AQI call |

**Total ≈ 21 API calls per page load** (plus a retry if a batch fails).

Constants live in `script.js`:

- `BATCH = 50`
- `CONCURRENCY = 4`
- `TOP_N = 50`

AQI is fetched **after** ranking so we don’t pull air quality for all 1,000 cities.

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
├── index.html      # Page shell
├── styles.css      # Layout + globe stage + error banner
├── script.js       # Fetch, rank, globe, errors
├── cities.js       # 1,000-city sample (window.THERMAL_CITIES)
└── README.md
```

---

## Local preview

```bash
cd /path/to/portfolio
python3 -m http.server 8080
```

Open [http://localhost:8080/thermal-atlas/](http://localhost:8080/thermal-atlas/)

---

## Attribution

Weather and air quality data © [Open-Meteo](https://open-meteo.com/) (CC BY 4.0).
