(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const podium = document.getElementById("podium");
  const podiumStages = document.getElementById("podium-stages");
  const searchInput = document.getElementById("city-search");
  const listEl = document.getElementById("heat-list");
  const meterTemp = document.getElementById("meter-temp");
  const meterFill = document.getElementById("meter-fill");
  const meterGlow = document.getElementById("meter-glow");
  const cursorGlow = document.getElementById("cursor-glow");
  const statusEl = document.getElementById("status");

  let ranked = [];
  let activeId = null;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function heatPct(temp, minT, maxT) {
    if (maxT === minT) return 0.72;
    return 0.22 + ((temp - minT) / (maxT - minT)) * 0.78;
  }

  function setMeter(temp) {
    if (temp == null) {
      meterTemp.textContent = "—°";
      meterFill.style.width = "0%";
      meterGlow.style.left = "0%";
      return;
    }
    const pct = clamp(((temp - 28) / (52 - 28)) * 100, 4, 100);
    meterTemp.textContent = `${temp.toFixed(1)}°`;
    meterFill.style.width = `${pct}%`;
    meterGlow.style.left = `${pct}%`;
  }

  function decorateRows() {
    if (!ranked.length) return;
    const temps = ranked.map((c) => c.maxTemp);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);

    listEl.querySelectorAll(".heat-row").forEach((row) => {
      const city = ranked.find((c) => c.id === row.dataset.id);
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

      // Hide redundant "India" meta on this page
      const meta = row.querySelector(".heat-row__meta");
      if (meta) meta.textContent = `Rank #${city.rank}`;

      row.addEventListener(
        "mouseenter",
        () => {
          if (!row.classList.contains("is-dimmed")) setMeter(city.maxTemp);
        },
        { passive: true }
      );
    });
  }

  function renderPodium() {
    const top = ranked.slice(0, 3);
    if (top.length < 3) {
      podium.hidden = true;
      return;
    }
    podium.hidden = false;
    // Visual order in CSS: 2nd, 1st, 3rd via order — keep DOM as 1,2,3
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
        activeId = card.dataset.id;
        syncActive();
        document.getElementById("globe")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function syncActive() {
    listEl.querySelectorAll(".heat-row").forEach((row) => {
      row.classList.toggle("is-active", row.dataset.id === activeId);
    });
    podiumStages?.querySelectorAll(".india-podium__card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.id === activeId);
    });
    const city = ranked.find((c) => c.id === activeId);
    if (city) setMeter(city.maxTemp);
  }

  function applyFilter(q) {
    const query = q.trim().toLowerCase();
    const rows = [...listEl.querySelectorAll(".heat-row")];
    let visible = 0;
    rows.forEach((row) => {
      const city = ranked.find((c) => c.id === row.dataset.id);
      const match = !query || (city && city.name.toLowerCase().includes(query));
      row.classList.toggle("is-dimmed", !match);
      row.hidden = false;
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

  function bindListClicks() {
    listEl.addEventListener("click", (e) => {
      const row = e.target.closest(".heat-row");
      if (!row || row.classList.contains("is-dimmed")) return;
      activeId = row.dataset.id;
      syncActive();
    });
  }

  function watchFocusCard() {
    const cityEl = document.getElementById("focus-city");
    if (!cityEl) return;
    const obs = new MutationObserver(() => {
      const name = cityEl.textContent?.trim();
      const city = ranked.find((c) => c.name === name);
      if (city) {
        activeId = city.id;
        syncActive();
      }
    });
    obs.observe(cityEl, { childList: true, characterData: true, subtree: true });
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
    syncActive();
    if (searchInput?.value) applyFilter(searchInput.value);
    document.body.classList.remove("is-scanning");
  }

  searchInput?.addEventListener("input", () => applyFilter(searchInput.value));
  bindListClicks();
  watchFocusCard();
  setupCursorGlow();
  setupScanClass();

  window.IndiaHeat = { onRanked };
})();
