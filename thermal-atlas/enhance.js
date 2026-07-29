(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const podium = document.getElementById("podium");
  const podiumStages = document.getElementById("podium-stages");
  const searchInput = document.getElementById("city-search");
  const listEl = document.getElementById("heat-list");
  const meterTemp = document.getElementById("meter-temp");
  const meterCity = document.getElementById("meter-city");
  const meterFill = document.getElementById("meter-fill");
  const meterGlow = document.getElementById("meter-glow");
  const cursorGlow = document.getElementById("cursor-glow");
  const statusEl = document.getElementById("status");
  const focusCityEl = document.getElementById("focus-city");
  const focusTempEl = document.getElementById("focus-temp");

  let ranked = [];
  let activeId = null;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function heatPct(temp, minT, maxT) {
    if (maxT === minT) return 0.72;
    return 0.22 + ((temp - minT) / (maxT - minT)) * 0.78;
  }

  function setMeter(temp, cityName) {
    if (!meterTemp || !meterFill || !meterGlow) return;
    if (temp == null || Number.isNaN(Number(temp))) {
      meterTemp.textContent = "—°";
      meterFill.style.width = "0%";
      meterGlow.style.left = "0%";
      if (meterCity) meterCity.textContent = "pick a city";
      return;
    }
    const value = Number(temp);
    const pct = clamp(((value - 28) / (52 - 28)) * 100, 4, 100);
    meterTemp.textContent = `${value.toFixed(1)}°`;
    meterFill.style.width = `${pct}%`;
    meterGlow.style.left = `${pct}%`;
    if (meterCity) meterCity.textContent = cityName || "selected";
  }

  function cityById(id) {
    return ranked.find((c) => c.id === id) || null;
  }

  function decorateRows() {
    if (!ranked.length || !listEl) return;
    const temps = ranked.map((c) => c.maxTemp);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);

    listEl.querySelectorAll(".heat-row").forEach((row) => {
      const city = cityById(row.dataset.id);
      if (!city) return;
      const pct = heatPct(city.maxTemp, minT, maxT);
      row.style.setProperty("--heat-pct", pct.toFixed(3));

      if (!row.querySelector(".heat-row__bar")) {
        const host = row.querySelector("span:nth-child(2)");
        if (host) {
          const bar = document.createElement("span");
          bar.className = "heat-row__bar";
          bar.setAttribute("aria-hidden", "true");
          bar.innerHTML = "<i></i>";
          host.appendChild(bar);
        }
      }

      const meta = row.querySelector(".heat-row__meta");
      if (meta) {
        const indiaOnly = document.body.classList.contains("page-india");
        meta.textContent = indiaOnly ? `Rank #${city.rank}` : city.country;
      }
    });
  }

  function renderPodium() {
    if (!podium || !podiumStages) return;
    const top = ranked.slice(0, 3);
    if (top.length < 3) {
      podium.hidden = true;
      return;
    }
    podium.hidden = false;
    podiumStages.innerHTML = top
      .map(
        (c, i) => `
        <button type="button" class="india-podium__card${c.id === activeId ? " is-active" : ""}" data-id="${c.id}" style="--delay:${0.05 + i * 0.07}s">
          <div class="india-podium__place">${i === 0 ? "Gold" : i === 1 ? "Silver" : "Bronze"}</div>
          <div class="india-podium__city">${c.name}</div>
          <div class="india-podium__temp">${c.maxTemp.toFixed(1)}°</div>
        </button>
      `
      )
      .join("");

    podiumStages.querySelectorAll(".india-podium__card").forEach((card) => {
      card.addEventListener("click", () => {
        window.__thermalAtlas?.selectCity?.(card.dataset.id, true);
        activate(card.dataset.id);
        document.getElementById("globe")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function activate(id) {
    activeId = id;
    const city = cityById(id);
    listEl?.querySelectorAll(".heat-row").forEach((row) => {
      row.classList.toggle("is-active", row.dataset.id === activeId);
    });
    podiumStages?.querySelectorAll(".india-podium__card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.id === activeId);
    });
    if (city) setMeter(city.maxTemp, city.name);
  }

  function syncFromFocusCard() {
    const name = focusCityEl?.textContent?.trim();
    const tempText = focusTempEl?.textContent?.trim() || "";
    if (name && name !== "—") {
      const city = ranked.find((c) => c.name === name);
      if (city) {
        activate(city.id);
        return;
      }
    }
    const parsed = parseFloat(tempText);
    if (!Number.isNaN(parsed)) {
      setMeter(parsed, name && name !== "—" ? name : "selected");
    }
  }

  function applyFilter(q) {
    if (!listEl) return;
    const query = q.trim().toLowerCase();
    const rows = [...listEl.querySelectorAll(".heat-row")];
    let visible = 0;
    rows.forEach((row) => {
      const city = cityById(row.dataset.id);
      const match = !query || (city && city.name.toLowerCase().includes(query));
      row.classList.toggle("is-dimmed", !match);
      if (match) visible += 1;
    });

    let empty = listEl.querySelector(".india-empty");
    if (!visible && query) {
      if (!empty) {
        empty = document.createElement("li");
        empty.className = "india-empty";
        listEl.appendChild(empty);
      }
      empty.hidden = false;
      empty.textContent = `No city matches “${q.trim()}”`;
    } else if (empty) {
      empty.hidden = true;
    }
  }

  function bindListInteractions() {
    if (!listEl) return;
    listEl.addEventListener("click", (e) => {
      const row = e.target.closest(".heat-row");
      if (!row || row.classList.contains("is-dimmed")) return;
      activate(row.dataset.id);
    });
    listEl.addEventListener(
      "mouseover",
      (e) => {
        const row = e.target.closest(".heat-row");
        if (!row || row.classList.contains("is-dimmed")) return;
        const city = cityById(row.dataset.id);
        if (city) setMeter(city.maxTemp, city.name);
      },
      { passive: true }
    );
    listEl.addEventListener(
      "mouseleave",
      () => {
        const city = cityById(activeId);
        if (city) setMeter(city.maxTemp, city.name);
      },
      { passive: true }
    );
  }

  function watchFocusCard() {
    if (!focusCityEl && !focusTempEl) return;
    const obs = new MutationObserver(() => syncFromFocusCard());
    if (focusCityEl) obs.observe(focusCityEl, { childList: true, characterData: true, subtree: true });
    if (focusTempEl) obs.observe(focusTempEl, { childList: true, characterData: true, subtree: true });
  }

  function setupCursorGlow() {
    if (coarse || reduceMotion || !cursorGlow) return;
    document.body.classList.add("is-pointer");
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      cursorGlow.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setupScanClass() {
    if (!statusEl) return;
    const obs = new MutationObserver(() => {
      const t = statusEl.textContent || "";
      document.body.classList.toggle(
        "is-scanning",
        /scanning|loading|spinning/i.test(t) && !statusEl.classList.contains("is-error")
      );
    });
    obs.observe(statusEl, { childList: true, characterData: true, subtree: true });
  }

  function onRanked(next) {
    ranked = Array.isArray(next) ? next : [];
    activeId = ranked[0]?.id || null;
    decorateRows();
    renderPodium();
    if (ranked[0]) {
      setMeter(ranked[0].maxTemp, ranked[0].name);
      activate(ranked[0].id);
    }
    // Focus card may update a tick later — re-sync
    requestAnimationFrame(() => {
      syncFromFocusCard();
      if (ranked[0] && (meterTemp?.textContent || "").includes("—")) {
        setMeter(ranked[0].maxTemp, ranked[0].name);
      }
    });
    if (searchInput?.value) applyFilter(searchInput.value);
    document.body.classList.remove("is-scanning");
  }

  searchInput?.addEventListener("input", () => applyFilter(searchInput.value));
  bindListInteractions();
  watchFocusCard();
  setupCursorGlow();
  setupScanClass();

  const api = { onRanked, setMeter, activate };
  window.HeatUI = api;
  window.IndiaHeat = api; // back-compat for India page config
})();
