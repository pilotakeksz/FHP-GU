/**
 * FHP Ghost Unit — Vehicle Configuration Checker
 * Validates: Division, Rank, Vehicle, Decal, Lightbar, Additional Lighting, Accessories.
 * Higher ranks inherit vehicles from lower ranks in the same division.
 * Optional accessories may require another (e.g. ALPR => Pushbar).
 */

(function () {
  "use strict";

  const RANK_ORDER = ["LR", "SGT", "HR", "SHR", "HICOM"];
  let rulesData = {};
  let optionalRules = {};
  let currentDivision = null;
  let currentRank = null;

  const divisionSelect = document.getElementById("division");
  const rankSelect = document.getElementById("rank");
  const vehicleSelect = document.getElementById("vehicle");
  const decalSelect = document.getElementById("decal");
  const lightbarSelect = document.getElementById("lightbar");
  const checkerResult = document.getElementById("checkerResult");
  const checkerBody = document.getElementById("checkerBody");
  const checkerToggle = document.getElementById("checkerToggle");
  const checkerArrow = document.getElementById("checkerArrow");

  if (!divisionSelect || !rankSelect) return;

  function parseKeyValue(right) {
    const out = {};
    const parts = right.split(";").map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => {
      const colon = p.indexOf(":");
      if (colon === -1) return;
      const key = p.slice(0, colon).trim();
      const val = p.slice(colon + 1).trim();
      out[key] = val.split(",").map((x) => x.trim()).filter(Boolean);
    });
    return out;
  }

  function parseRules(txt) {
    rulesData = {};
    optionalRules = {};
    currentDivision = null;
    currentRank = null;
    const lines = txt.split("\n").map((l) => l.trim());

    lines.forEach((line) => {
      if (!line || line.startsWith("#")) {
        const divMatch = line.match(/#\s*DIVISION\s*:?\s*(\w+)/i);
        if (divMatch) currentDivision = divMatch[1];
        return;
      }

      if (line.includes("=>")) {
        const [opt, mand] = line.split("=>").map((s) => s.trim());
        optionalRules[opt] = mand;
        return;
      }

      const rankMatch = line.match(/^(\w+)\s*=\s*(.*)$/);
      if (rankMatch) {
        const rank = rankMatch[1];
        const right = rankMatch[2];
        if (!currentDivision) currentDivision = "Normal";
        if (!rulesData[currentDivision]) rulesData[currentDivision] = {};
        currentRank = rank;
        rulesData[currentDivision][rank] = rulesData[currentDivision][rank] || {};
        Object.assign(rulesData[currentDivision][rank], parseKeyValue(right));
        return;
      }

      const keyMatch = line.match(/^([A-Z_]+):(.*)$/);
      if (keyMatch && currentDivision && currentRank) {
        const key = keyMatch[1];
        const right = keyMatch[2];
        const parsed = parseKeyValue(key + ":" + right);
        Object.keys(parsed).forEach((k) => {
          rulesData[currentDivision][currentRank][k] = parsed[k];
        });
      }
    });

    inheritCarsByRank();
  }

  function inheritCarsByRank() {
    Object.keys(rulesData).forEach((div) => {
      const ranks = Object.keys(rulesData[div]);
      const order = RANK_ORDER.filter((r) => ranks.includes(r));
      order.forEach((r, i) => {
        const cars = rulesData[div][r].ALLOWED_CARS || [];
        for (let j = i + 1; j < order.length; j++) {
          const higher = order[j];
          if (!rulesData[div][higher].ALLOWED_CARS) rulesData[div][higher].ALLOWED_CARS = [];
          const set = new Set([
            ...(rulesData[div][higher].ALLOWED_CARS || []),
            ...cars
          ]);
          rulesData[div][higher].ALLOWED_CARS = Array.from(set);
        }
      });
      ranks.filter((r) => !RANK_ORDER.includes(r)).forEach((r) => {
        rulesData[div][r].ALLOWED_CARS = rulesData[div][r].ALLOWED_CARS || [];
      });
    });
  }

  function updateDivisionOptions() {
    divisionSelect.innerHTML = '<option value="">Select Division</option>';
    Object.keys(rulesData).sort().forEach((div) => {
      const opt = document.createElement("option");
      opt.value = div;
      opt.textContent = div;
      divisionSelect.appendChild(opt);
    });
    updateRankOptions();
  }

  function updateRankOptions() {
    rankSelect.innerHTML = '<option value="">Select Rank</option>';
    const div = divisionSelect.value;
    if (!div || !rulesData[div]) return;
    Object.keys(rulesData[div]).sort((a, b) => {
      const ai = RANK_ORDER.indexOf(a);
      const bi = RANK_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      return String(a).localeCompare(b);
    }).forEach((rank) => {
      const opt = document.createElement("option");
      opt.value = rank;
      opt.textContent = rank;
      rankSelect.appendChild(opt);
    });
    updateVehicleOptions();
    updateDecalOptions();
    updateLightbarOptions();
  }

  function updateVehicleOptions() {
    vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return;
    const cars = rulesData[div][rank].ALLOWED_CARS || [];
    cars.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      vehicleSelect.appendChild(opt);
    });
  }

  function updateDecalOptions() {
    decalSelect.innerHTML = '<option value="">Select Decal</option>';
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return;
    const decals = rulesData[div][rank].DECALS || [];
    decals.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      decalSelect.appendChild(opt);
    });
  }

  function updateLightbarOptions() {
    lightbarSelect.innerHTML = '<option value="">Select Lightbar</option>';
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return;
    const bars = rulesData[div][rank].LIGHTBAR || [];
    bars.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      lightbarSelect.appendChild(opt);
    });
  }

  function checkConfig() {
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    const vehicle = vehicleSelect.value;
    const decal = decalSelect.value;
    const lightbar = lightbarSelect.value;
    const lighting = getLighting();
    const accessories = getAccessories();

    if (!div || !rank) {
      checkerResult.textContent = "Select division and rank.";
      return;
    }

    const data = rulesData[div] && rulesData[div][rank];
    if (!data) {
      checkerResult.textContent = "No rules for this division and rank.";
      return;
    }

    const messages = [];

    if (vehicle) {
      const allowed = data.ALLOWED_CARS || [];
      if (!allowed.includes(vehicle)) {
        messages.push("Vehicle \"" + vehicle + "\" is not allowed for " + div + " " + rank + ".");
      }
    } else {
      messages.push("Select a vehicle.");
    }

    if (data.DECALS && data.DECALS.length) {
      if (!decal) {
        messages.push("Select a decal.");
      } else if (!data.DECALS.includes(decal)) {
        messages.push("Decal \"" + decal + "\" is not allowed for this division/rank.");
      }
    }

    if (data.LIGHTBAR && data.LIGHTBAR.length) {
      if (!lightbar) {
        messages.push("Select a lightbar.");
      } else if (!data.LIGHTBAR.includes(lightbar)) {
        messages.push("Lightbar \"" + lightbar + "\" is not allowed for this division/rank.");
      }
    }

    const allowedLighting = data.REQUIRED_LIGHTING || [];
    allowedLighting.forEach((l) => {
      if (!lighting.includes(l)) {
        messages.push("Required additional lighting missing: " + l + ".");
      }
    });
    lighting.forEach((l) => {
      if (!allowedLighting.includes(l)) {
        messages.push("Additional lighting \"" + l + "\" is not allowed for this rank.");
      }
    });

    const requiredAcc = data.REQUIRED_ACCESSORIES || [];
    const optionalAcc = data.OPTIONAL_ACCESSORIES || [];
    const allowedAcc = [...requiredAcc, ...optionalAcc];

    requiredAcc.forEach((a) => {
      if (!accessories.includes(a)) {
        messages.push("Required accessory missing: " + a + ".");
      }
    });

    accessories.forEach((a) => {
      if (!allowedAcc.includes(a)) {
        messages.push("Accessory \"" + a + "\" is not allowed for this rank.");
      }
      if (optionalRules[a] && !accessories.includes(optionalRules[a])) {
        messages.push("Accessory \"" + a + "\" requires \"" + optionalRules[a] + "\" to be selected.");
      }
    });

    if (messages.length) {
      checkerResult.textContent = messages.join(" ");
      checkerResult.classList.add("error");
      checkerResult.classList.remove("ok");
    } else {
      checkerResult.textContent = "Configuration approved.";
      checkerResult.classList.add("ok");
      checkerResult.classList.remove("error");
    }
  }

  function setupTagInput(containerId, kind) {
    const container = document.getElementById(containerId);
    if (!container) return function () { return []; };
    const input = container.querySelector("input");
    const ul = container.querySelector("ul");
    let tags = [];
    const isLighting = kind === "lighting";

    function refreshTags() {
      container.querySelectorAll(".tag").forEach((t) => t.remove());
      tags.forEach((t) => {
        const tagEl = document.createElement("span");
        tagEl.className = "tag";
        tagEl.textContent = t;
        const x = document.createElement("span");
        x.className = "remove";
        x.textContent = "×";
        x.onclick = function () {
          tags = tags.filter((v) => v !== t);
          refreshTags();
          checkConfig();
        };
        tagEl.appendChild(x);
        container.insertBefore(tagEl, input);
      });
    }

    function getOptions() {
      const div = divisionSelect.value;
      const rank = rankSelect.value;
      if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return [];
      const data = rulesData[div][rank];
      if (isLighting) return data.REQUIRED_LIGHTING || [];
      return [...(data.REQUIRED_ACCESSORIES || []), ...(data.OPTIONAL_ACCESSORIES || [])];
    }

    function showSuggestions(val) {
      if (!ul) return;
      ul.innerHTML = "";
      const options = getOptions();
      const filtered = options.filter(
        (o) => !tags.includes(o) && (!val || o.toLowerCase().includes((val || "").toLowerCase()))
      );
      filtered.forEach((f) => {
        const li = document.createElement("li");
        li.textContent = f;
        li.onclick = function () {
          tags.push(f);
          input.value = "";
          refreshTags();
          checkConfig();
          input.focus();
          setTimeout(function () { showSuggestions(""); }, 0);
        };
        ul.appendChild(li);
      });
      ul.style.display = filtered.length ? "block" : "none";
    }

    input.addEventListener("input", function () { showSuggestions(input.value); });
    input.addEventListener("focus", function () { showSuggestions(input.value); });
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) ul.style.display = "none";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && input.value.trim()) {
        var added = input.value.trim();
        tags.push(added);
        input.value = "";
        refreshTags();
        checkConfig();
        input.focus();
        setTimeout(function () { showSuggestions(""); }, 0);
        e.preventDefault();
      } else if (e.key === "Backspace" && !input.value && tags.length) {
        tags.pop();
        refreshTags();
        checkConfig();
      }
    });
    container.addEventListener("click", function (e) {
      if (e.target === container || e.target === input) input.focus();
      if (e.target === container || e.target === input) showSuggestions(input.value);
    });

    return function () { return tags.slice(); };
  }

  const getLighting = setupTagInput("lightingContainer", "lighting");
  const getAccessories = setupTagInput("accessoriesContainer", "accessories");

  divisionSelect.addEventListener("change", function () {
    updateRankOptions();
    checkConfig();
  });
  rankSelect.addEventListener("change", function () {
    updateVehicleOptions();
    updateDecalOptions();
    updateLightbarOptions();
    checkConfig();
  });
  vehicleSelect.addEventListener("change", checkConfig);
  decalSelect.addEventListener("change", checkConfig);
  lightbarSelect.addEventListener("change", checkConfig);

  if (checkerToggle && checkerBody && checkerArrow) {
    checkerToggle.addEventListener("click", function () {
      const isOpen = checkerBody.classList.contains("open");
      checkerBody.classList.toggle("open", !isOpen);
      checkerArrow.textContent = isOpen ? "▼" : "▲";
      checkerToggle.setAttribute("aria-expanded", !isOpen);
    });
  }

  function slug(str) {
    return String(str).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  function buildGuide() {
    const selectEl = document.getElementById("guideDivisionSelect");
    const contentEl = document.getElementById("vehicleGuideContent");
    if (!selectEl || !contentEl) return;

    selectEl.innerHTML = "";
    contentEl.innerHTML = "";

    const divisions = Object.keys(rulesData).sort();
    divisions.forEach((div) => {
      const opt = document.createElement("option");
      opt.value = div;
      opt.textContent = div;
      selectEl.appendChild(opt);
    });

    divisions.forEach((div) => {
      const divSlug = slug(div);
      const section = document.createElement("div");
      section.className = "vehicle-guide-section vehicle-guide-section--" + divSlug;
      section.id = "division-" + divSlug;
      section.setAttribute("data-division", div);

      const h3 = document.createElement("h3");
      h3.textContent = "Division: " + div;
      section.appendChild(h3);

      const divDivider = document.createElement("div");
      divDivider.className = "divider";
      section.appendChild(divDivider);

      const ranks = Object.keys(rulesData[div]).sort((a, b) => {
        const ai = RANK_ORDER.indexOf(a);
        const bi = RANK_ORDER.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        return String(a).localeCompare(b);
      });

      ranks.forEach((rank) => {
        const data = rulesData[div][rank];
        const rankBlock = document.createElement("div");
        rankBlock.className = "vehicle-guide-rank";

        const rankTitle = document.createElement("h4");
        rankTitle.textContent = rank;
        rankBlock.appendChild(rankTitle);

        function addList(label, items) {
          if (!items || !items.length) return;
          const lbl = document.createElement("p");
          lbl.className = "guide-label";
          lbl.textContent = label;
          rankBlock.appendChild(lbl);
          const ul = document.createElement("ul");
          items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          });
          rankBlock.appendChild(ul);
        }

        addList("Vehicles", data.ALLOWED_CARS);
        if (ranks.length > 1 && ranks.indexOf(rank) > 0) {
          const note = document.createElement("p");
          note.className = "muted";
          note.style.fontSize = "12px";
          note.textContent = "Higher ranks may also use vehicles allowed for lower ranks in this division.";
          rankBlock.appendChild(note);
        }
        addList("Decals", data.DECALS);
        addList("Lightbar", data.LIGHTBAR);
        addList("Required additional lighting", data.REQUIRED_LIGHTING);
        addList("Required accessories", data.REQUIRED_ACCESSORIES);
        addList("Optional accessories", data.OPTIONAL_ACCESSORIES);

        const optRules = Object.keys(optionalRules).filter((o) => (data.OPTIONAL_ACCESSORIES || []).includes(o));
        if (optRules.length) {
          const optBlock = document.createElement("div");
          optBlock.className = "vehicle-guide-optional-rules";
          const label = document.createElement("span");
          label.className = "guide-label";
          label.textContent = "When using optional accessories";
          optBlock.appendChild(label);
          const ul = document.createElement("ul");
          optRules.forEach((o) => {
            const li = document.createElement("li");
            li.innerHTML = "If you select <strong>" + o + "</strong> you must also use <strong>" + optionalRules[o] + "</strong>.";
            ul.appendChild(li);
          });
          optBlock.appendChild(ul);
          rankBlock.appendChild(optBlock);
        }

        section.appendChild(rankBlock);
      });

      contentEl.appendChild(section);
    });

    function showDivision(value) {
      contentEl.querySelectorAll(".vehicle-guide-section").forEach(function (el) {
        el.classList.toggle("vehicle-guide-section--visible", el.getAttribute("data-division") === value);
      });
    }

    if (divisions.length) {
      selectEl.value = divisions[0];
      showDivision(divisions[0]);
    }
    selectEl.addEventListener("change", function () {
      showDivision(selectEl.value);
    });
  }

  function loadRules() {
    fetch("rules.txt")
      .then((r) => r.text())
      .then((txt) => {
        parseRules(txt);
        updateDivisionOptions();
        buildGuide();
        checkConfig();
      })
      .catch(function () {
        checkerResult.textContent = "Could not load rules.";
      });
  }

  loadRules();
})();
