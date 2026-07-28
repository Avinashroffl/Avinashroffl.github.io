# Thermal Atlas · Top 50 Hottest Cities

Live site: [avinashroffl.github.io/top50](https://avinashroffl.github.io/top50/)

Static HTML / CSS / JS on GitHub Pages. The browser fetches fresh weather on every visit — no daily manual updates.

> This folder only redirects to `/top50/`. App files live in [`../top50/`](../top50/).

---

## How this works

Temperatures (and related metrics) come from [Open-Meteo](https://open-meteo.com/) — a free, open-source weather API (no key required). We query a fixed sample of heat-prone and major cities, take each city’s max hourly reading from the past day, then sort for the top 50. This is not every city on Earth — it’s a transparent sample you can host as static files on GitHub Pages.

Each page load also pulls humidity, wind, precipitation, and air quality for the ranked cities.

| Piece | Detail |
|---|---|
| **API** | Open-Meteo Forecast + `past_days=1` hourly `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `precipitation` |
| **AQI** | Open-Meteo Air Quality API — `us_aqi` (fallback `european_aqi`) |
| **Host** | Pure HTML / CSS / JS — drop the `top50/` folder on GitHub Pages |
| **Globe** | WebGL Earth via [globe.gl](https://globe.gl) (Three.js); heat pins from lat/lon |

---

## Metrics

- **Temperature** — max of hourly 2 m air temp over the past 24 hours (ranking key)
- **Humidity** — relative humidity at the hottest hour
- **Wind** — 10 m wind speed at the hottest hour
- **Precipitation** — sum of hourly precip over the past 24 hours
- **AQI** — latest US AQI (or European) from the past day

---

## Local preview

```bash
cd /path/to/portfolio
python3 -m http.server 8080
```

Open [http://localhost:8080/top50/](http://localhost:8080/top50/)

---

## Attribution

Weather and air quality data © [Open-Meteo](https://open-meteo.com/) (CC BY 4.0).
