(() => {
  const CITIES = window.THERMAL_CITIES || [];
  const TOP_N = 50;
  const BATCH = 40;
  const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
  const AQI_API = "https://air-quality-api.open-meteo.com/v1/air-quality";
  const EARTH_IMG =
    "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-blue-marble.jpg";
  const TOPO_IMG =
    "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-topology.png";

  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("heat-list");
  const sampleEl = document.getElementById("sample-size");
  const refreshBtn = document.getElementById("refresh-btn");
  const globeStage = document.getElementById("globe-stage");
  const globeViz = document.getElementById("globe-viz");
  const globeHint = document.getElementById("globe-hint");
  const focusCard = document.getElementById("focus-card");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ranked = [];
  let globe = null;
  let activeId = null;
  let resizeObserver = null;

  function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("is-error", isError);
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function inPast24h(iso) {
    const ms = Date.parse(iso);
    if (Number.isNaN(ms)) return false;
    const now = Date.now();
    return ms >= now - 25 * 60 * 60 * 1000 && ms <= now + 60 * 60 * 1000;
  }

  function indexOfMaxTemp(temps, times) {
    let best = -1;
    let bestVal = -Infinity;
    for (let i = 0; i < temps.length; i++) {
      const t = temps[i];
      if (t == null || !inPast24h(times[i])) continue;
      if (t > bestVal) {
        bestVal = t;
        best = i;
      }
    }
    if (best >= 0) return best;
    // fallback: hottest among last 24 slots
    const start = Math.max(0, temps.length - 24);
    for (let i = start; i < temps.length; i++) {
      const t = temps[i];
      if (t == null) continue;
      if (t > bestVal) {
        bestVal = t;
        best = i;
      }
    }
    return best;
  }

  function sumPast24h(values, times) {
    let sum = 0;
    let n = 0;
    for (let i = 0; i < values.length; i++) {
      if (!inPast24h(times[i])) continue;
      sum += values[i] || 0;
      n += 1;
    }
    if (n) return sum;
    return values.slice(-24).reduce((a, b) => a + (b || 0), 0);
  }

  function latestValue(values, times) {
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] != null && inPast24h(times[i])) return values[i];
    }
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] != null) return values[i];
    }
    return null;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchWeatherBatch(cities) {
    const latitudes = cities.map((c) => c.lat).join(",");
    const longitudes = cities.map((c) => c.lon).join(",");
    const url =
      `${WEATHER_API}?latitude=${latitudes}&longitude=${longitudes}` +
      `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation` +
      `&past_days=1&forecast_days=1&timezone=UTC`;

    const data = await fetchJson(url);
    const rows = Array.isArray(data) ? data : [data];

    return cities.map((city, i) => {
      const row = rows[i];
      const h = row?.hourly;
      if (!h) return { ...city, id: `${city.name}-${city.country}`, maxTemp: null };

      const idx = indexOfMaxTemp(h.temperature_2m || [], h.time || []);
      const maxTemp = idx >= 0 ? h.temperature_2m[idx] : null;

      return {
        ...city,
        id: `${city.name}-${city.country}`,
        maxTemp,
        humidity: idx >= 0 ? h.relative_humidity_2m?.[idx] ?? null : null,
        wind: idx >= 0 ? h.wind_speed_10m?.[idx] ?? null : null,
        precip: sumPast24h(h.precipitation || [], h.time || []),
        aqi: null,
      };
    });
  }

  async function fetchAqiBatch(cities) {
    const latitudes = cities.map((c) => c.lat).join(",");
    const longitudes = cities.map((c) => c.lon).join(",");
    const url =
      `${AQI_API}?latitude=${latitudes}&longitude=${longitudes}` +
      `&hourly=us_aqi,european_aqi&past_days=1&forecast_days=1&timezone=UTC`;

    try {
      const data = await fetchJson(url);
      const rows = Array.isArray(data) ? data : [data];
      return cities.map((city, i) => {
        const h = rows[i]?.hourly;
        if (!h) return { id: city.id, aqi: null, aqiLabel: null };
        const us = latestValue(h.us_aqi || [], h.time || []);
        const eu = latestValue(h.european_aqi || [], h.time || []);
        if (us != null) return { id: city.id, aqi: us, aqiLabel: "US" };
        if (eu != null) return { id: city.id, aqi: eu, aqiLabel: "EU" };
        return { id: city.id, aqi: null, aqiLabel: null };
      });
    } catch (err) {
      console.warn("AQI fetch failed", err);
      return cities.map((c) => ({ id: c.id, aqi: null, aqiLabel: null }));
    }
  }

  function heatColor(temp, minT, maxT) {
    const t = maxT === minT ? 1 : (temp - minT) / (maxT - minT);
    if (t < 0.5) return mixHex("#2f9a9e", "#ffba08", t / 0.5);
    return mixHex("#ffba08", "#e85d04", (t - 0.5) / 0.5);
  }

  function mixHex(a, b, t) {
    const pa = hexToRgb(a);
    const pb = hexToRgb(b);
    return `rgb(${Math.round(pa.r + (pb.r - pa.r) * t)},${Math.round(
      pa.g + (pb.g - pa.g) * t
    )},${Math.round(pa.b + (pb.b - pa.b) * t)})`;
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function fmt(n, digits = 0, suffix = "") {
    if (n == null || Number.isNaN(n)) return "—";
    return `${Number(n).toFixed(digits)}${suffix}`;
  }

  function aqiText(city) {
    if (city.aqi == null) return "—";
    return `${Math.round(city.aqi)} ${city.aqiLabel || ""}`.trim();
  }

  function skeletonList() {
    listEl.innerHTML = Array.from({ length: 6 }, () =>
      `<li class="heat-list__skeleton" aria-hidden="true"></li>`
    ).join("");
  }

  function renderList() {
    const temps = ranked.map((c) => c.maxTemp);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);

    listEl.innerHTML = ranked
      .map((city, i) => {
        const color = heatColor(city.maxTemp, minT, maxT);
        return `
          <li
            class="heat-row${city.id === activeId ? " is-active" : ""}"
            data-id="${city.id}"
            style="--heat: ${color}; --delay: ${Math.min(i, 24) * 0.025}s"
            tabindex="0"
            role="button"
            aria-label="Show ${city.name} on the globe"
          >
            <span class="heat-row__rank">${String(city.rank).padStart(2, "0")}</span>
            <span>
              <span class="heat-row__city">${city.name}</span>
              <span class="heat-row__meta">${city.country}</span>
              <span class="heat-row__stats">
                <span>Hum ${fmt(city.humidity, 0, "%")}</span>
                <span>Wind ${fmt(city.wind, 0, " km/h")}</span>
                <span>Rain ${fmt(city.precip, 1, " mm")}</span>
                <span>AQI ${aqiText(city)}</span>
              </span>
            </span>
            <span class="heat-row__temp">${city.maxTemp.toFixed(1)}°</span>
          </li>
        `;
      })
      .join("");

    listEl.querySelectorAll(".heat-row").forEach((row) => {
      const activate = () => selectCity(row.dataset.id, true);
      row.addEventListener("click", activate);
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function updateFocusCard(city) {
    if (!city) {
      focusCard.hidden = true;
      return;
    }
    focusCard.hidden = false;
    document.getElementById("focus-rank").textContent = `#${String(city.rank).padStart(2, "0")}`;
    document.getElementById("focus-city").textContent = city.name;
    document.getElementById("focus-country").textContent = city.country;
    document.getElementById("focus-temp").textContent = `${city.maxTemp.toFixed(1)}°`;
    document.getElementById("m-humidity").textContent = fmt(city.humidity, 0, "%");
    document.getElementById("m-wind").textContent = fmt(city.wind, 0, " km/h");
    document.getElementById("m-precip").textContent = fmt(city.precip, 1, " mm");
    document.getElementById("m-aqi").textContent = aqiText(city);
  }

  function pointColor(city) {
    if (!ranked.length) return "#e85d04";
    const temps = ranked.map((c) => c.maxTemp);
    return heatColor(city.maxTemp, Math.min(...temps), Math.max(...temps));
  }

  function pointsData() {
    return ranked.map((c) => ({
      ...c,
      size: 0.35 + (c.rank <= 5 ? 0.35 : c.rank <= 15 ? 0.2 : 0.08),
      color: pointColor(c),
    }));
  }

  function initGlobe() {
    if (typeof Globe !== "function") {
      setStatus("Globe library failed to load.", true);
      return;
    }

    const size = Math.floor(globeStage.clientWidth);

    globe = Globe()(globeViz)
      .width(size)
      .height(size)
      .backgroundColor("rgba(0,0,0,0)")
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor("#7ed0cb")
      .atmosphereAltitude(0.18)
      .globeImageUrl(EARTH_IMG)
      .bumpImageUrl(TOPO_IMG)
      .pointsData([])
      .pointLat("lat")
      .pointLng("lon")
      .pointAltitude((d) => 0.01 + (TOP_N - d.rank) * 0.0012)
      .pointRadius("size")
      .pointColor("color")
      .pointsMerge(false)
      .pointLabel(
        (d) =>
          `<div style="font-family:Figtree,sans-serif;padding:2px 0">
            <b>#${d.rank} ${d.name}</b><br/>${d.maxTemp.toFixed(1)}°C · ${d.country}
          </div>`
      )
      .onPointClick((d) => selectCity(d.id, true));

    const controls = globe.controls();
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.55;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 140;
    controls.maxDistance = 420;
    controls.enablePan = false;

    // Pause auto-rotate while interacting
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      globeHint.textContent = "Release to keep exploring · pick a pin or city";
    });
    controls.addEventListener("end", () => {
      if (!reduceMotion && !activeId) controls.autoRotate = true;
      globeHint.textContent = "Drag to explore · scroll to zoom · tap a heat pin";
    });

    resizeObserver = new ResizeObserver(() => {
      if (!globe) return;
      const s = Math.floor(globeStage.clientWidth);
      globe.width(s).height(s);
    });
    resizeObserver.observe(globeStage);
  }

  function refreshGlobePoints() {
    if (!globe) return;
    globe.pointsData(pointsData());
  }

  function selectCity(id, fly = false) {
    activeId = id;
    const city = ranked.find((c) => c.id === id);
    if (!city) return;

    listEl.querySelectorAll(".heat-row").forEach((row) => {
      row.classList.toggle("is-active", row.dataset.id === id);
    });
    updateFocusCard(city);

    if (globe) {
      const controls = globe.controls();
      controls.autoRotate = false;
      if (fly) {
        globe.pointOfView({ lat: city.lat, lng: city.lon, altitude: 1.65 }, 1100);
      }
      globeHint.textContent = `#${city.rank} ${city.name} · ${city.maxTemp.toFixed(1)}°C`;
    }
  }

  async function loadTemperatures() {
    setStatus("Fetching live weather & air quality…");
    refreshBtn.disabled = true;
    skeletonList();
    focusCard.hidden = true;
    activeId = null;

    try {
      if (!CITIES.length) throw new Error("City list missing");

      const batches = chunk(CITIES, BATCH);
      const weather = [];
      for (const batch of batches) {
        weather.push(...(await fetchWeatherBatch(batch)));
      }

      const withTemp = weather.filter((c) => c.maxTemp != null);
      const aqiRows = [];
      for (const batch of chunk(withTemp, BATCH)) {
        aqiRows.push(...(await fetchAqiBatch(batch)));
      }
      const aqiMap = new Map(aqiRows.map((r) => [r.id, r]));

      ranked = withTemp
        .map((c) => {
          const a = aqiMap.get(c.id);
          return {
            ...c,
            aqi: a?.aqi ?? null,
            aqiLabel: a?.aqiLabel ?? null,
          };
        })
        .sort((a, b) => b.maxTemp - a.maxTemp)
        .slice(0, TOP_N)
        .map((c, i) => ({ ...c, rank: i + 1 }));

      if (!ranked.length) throw new Error("No readings returned");

      sampleEl.textContent = `(${CITIES.length} cities sampled)`;
      const top = ranked[0];
      setStatus(`Live · #1 ${top.name} at ${top.maxTemp.toFixed(1)}°C`);
      renderList();
      refreshGlobePoints();

      // Soft focus on hottest city without locking forever
      selectCity(top.id, true);
      if (!reduceMotion && globe) {
        setTimeout(() => {
          if (activeId === top.id) {
            globe.controls().autoRotate = true;
          }
        }, 2200);
      }
    } catch (err) {
      console.error(err);
      setStatus("Could not load weather data. Tap Refresh.", true);
      listEl.innerHTML =
        '<li class="heat-row"><span class="heat-row__city">Weather API unavailable</span></li>';
    } finally {
      refreshBtn.disabled = false;
    }
  }

  refreshBtn.addEventListener("click", loadTemperatures);

  // Init
  skeletonList();
  initGlobe();
  loadTemperatures();
})();
