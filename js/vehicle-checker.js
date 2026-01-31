/**
 * FHP Ghost Unit — Vehicle Configuration Checker
 * MASTER VEHICLE GUIDES — Date of Issue: 10/16/25 | Last updated: 12/12/25 | Approved by: GU-001 | saabsterz
 * SRT One = standard for additional lighting unless otherwise stated.
 * If a customization option is not listed, you may not use it. Black decals for all; HICOM may use White. HR/SHR may request HICOM White Decal permissions.
 */

(function () {
  "use strict";

  const RANK_ORDER = {
    HSPU: [
      "Probationary Officer",
      "Officer First+",
      "Senior Officer+",
      "Head Officer+",
      "Director+",
      "High Command"
    ],
    SRT: [
      "Probationary Operative+",
      "Operative+",
      "Senior Operative+"
    ],
    Normal: [
      "Low Rank",
      "SGTP",
      "HR",
      "SHR",
      "HICOM"
    ]
  };

  const rulesData = {
    HSPU: {
      "Probationary Officer": {
        ALLOWED_CARS: ["Bullhorn Prancer Pursuit 2015"],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: ["Side Window Lights", "Plate Lights", "Small Siderunners"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "Grappler", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "Officer First+": {
        ALLOWED_CARS: ["Chevlon Amigo ZLR 2011"],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: ["Side Window Lights", "Plate Lights", "Small Siderunners"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "Grappler", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "Senior Officer+": {
        ALLOWED_CARS: ["Bullhorn Prancer Pursuit 2011"],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: ["Side Window Lights", "Plate Lights", "Small Siderunners"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "Grappler", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "Head Officer+": {
        ALLOWED_CARS: ["Falcon Stallion 350 2015"],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: ["Side Window Lights", "Plate Lights", "Small Siderunners"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "Grappler", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "Director+": {
        ALLOWED_CARS: ["Bullhorn Prancer Pursuit Widebody 2020"],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: ["Side Window Lights", "Plate Lights", "Small Siderunners"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "Grappler", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "High Command": {
        ALLOWED_CARS: ["Chevlon Corbeta RZR 2014"],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: ["Side Window Lights", "Plate Lights", "Small Siderunners"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "Grappler", "ALPR"],
        DECALS: ["Black Decal", "White Decal"]
      }
    },

    SRT: {
      "Probationary Operative+": {
        ALLOWED_CARS: [
          "2008 Chevlon Camion PPV",
          "2015 Bullhorn Prancer Pursuit",
          "Equipment Trailer"
        ],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fender Lights",
          "Fog Lights",
          "Small Siderunners"
        ],
        ACCESSORIES: ["Trailer Hitch", "LED Spotlights", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "Operative+": {
        ALLOWED_CARS: ["2019 Chevlon Plotoro"],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fender Lights",
          "Fog Lights",
          "Small Siderunners"
        ],
        ACCESSORIES: ["Trailer Hitch", "LED Spotlights", "ALPR"],
        DECALS: ["Black Decal"]
      },
      "Senior Operative+": {
        ALLOWED_CARS: [
          "2020 Emergency Services Falcon Advance+",
          "2011 SWAT Truck"
        ],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Front Bumper Lights",
          "Fender Lights",
          "Fog Lights",
          "Small Siderunners",
          "Siderunners"
        ],
        ACCESSORIES: ["Trailer Hitch", "LED Spotlights", "Flood Lights", "ALPR"],
        DECALS: ["Black Decal"]
      }
    },

    Normal: {
      "Low Rank": {
        ALLOWED_CARS: [
          "Chevlon Camion PPV 2018",
          "Bullhorn Prancer Pursuit 2015",
          "Chevlon Antelope 1994",
          "Chevlon Camion PPV 2008"
        ],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fog Lights",
          "Small Siderunners"
        ],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "ALPR"],
        DECALS: ["Black Decal"]
      },
      SGTP: {
        ALLOWED_CARS: [
          "Bullhorn Pueblo Pursuit 2018",
          "Falcon Interceptor Utility 2019",
          "Falcon Interceptor Utility 2013"
        ],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fender Lights",
          "Fog Lights",
          "Siderunners"
        ],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "ALPR"],
        DECALS: ["Black Decal"]
      },
      HR: {
        ALLOWED_CARS: [
          "Chevlon Camion PPV 2021",
          "Falcon Interceptor Utility 2024"
        ],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fog Lights",
          "Fender Lights",
          "Siderunners"
        ],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "ALPR"],
        DECALS: ["Black Decal"]
      },
      SHR: {
        ALLOWED_CARS: [
          "Bullhorn Prancer Pursuit 2011",
          "Chevlon Platoro PPV 2019",
          "Falcon Estallion 2024"
        ],
        REAR_LIGHTS: ["Rear Light Stick"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fog Lights",
          "Fender Lights",
          "Grill Lights",
          "Siderunners"
        ],
        OPTIONAL_LIGHTING: ["LED Spotlight (Optional)", "Passenger Spotlight (Optional)"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "ALPR"],
        DECALS: ["Black Decal"]
      },
      HICOM: {
        ALLOWED_CARS: [
          "Mobile Command 2005",
          "Chevlon Corbeta RZR 2014"
        ],
        REAR_LIGHTS: ["Rear Window Lights"],
        LIGHTING: [
          "Side Window Lights",
          "Plate Lights",
          "Fog Lights",
          "Fender Lights",
          "Grill Lights",
          "Siderunners"
        ],
        OPTIONAL_LIGHTING: ["LED Spotlight (Optional)", "Passenger Spotlight (Optional)"],
        ACCESSORIES: ["Pushbar", "Wraparound Bar", "ALPR"],
        DECALS: ["Black Decal", "White Decal"]
      }
    }
  };

  const MAIN_LIGHTS = ["Visor Lights", "Legacy Lightbar"];

  /** Guide-only: antennas (with positions), spotlights, texture, notes (not validated by checker) */
  const GUIDE_NOTES = {
    SRT: {
      ANTENNAS: [
        "5G Antenna – Right (Front Right on ES Falcon Advance+)",
        "Low Profile Antenna – Front Center",
        "Long Range Antenna – Rear Center/Trunk Center (Rear on ES Falcon Advance+)"
      ],
      SPOTLIGHTS: ["LED Spotlight", "Passenger Spotlight (Optional)"],
      NOTES: ["2011 SWAT Truck: Senior Operative+ when 4+ SRT units available, Chief+ permission."]
    },
    HSPU: {
      TEXTURE: "FHP Ghost Unit | WL",
      ANTENNAS: [
        "5G Antenna (Right)",
        "Long Range Antenna (Center)",
        "Low Profile Antenna (Front Center)"
      ],
      SPOTLIGHTS: ["LED Spotlight", "Passenger Spotlight (Optional)"],
      NOTES: ["Grappler: see handbook for use."]
    },
    Normal: {
      TEXTURE: "FHP Ghost Unit | WL",
      TEXTURE_HICOM: "FHP Ghost Unit | WL | White / FHP Ghost Unit | WL",
      RANK_ANTENNAS: {
        "Low Rank": {
          ANTENNAS: [
            "5G Antenna (Right)",
            "Long Range Antenna (Center)",
            "Low Profile Antenna (Front Center)"
          ]
        },
        SGTP: {
          ANTENNAS: [
            "5G Antenna (Right)",
            "Long Range Antenna (Rear Center / Trunk center)",
            "Low Profile Antenna (Front Center)"
          ]
        },
        HR: {
          ANTENNAS_SEDAN: [
            "5G Antenna (Trunk Right)",
            "Long Range Antenna (Rear Center / trunk center)",
            "Low Profile Antenna (Front Center)"
          ],
          ANTENNAS_SUV: [
            "5G Antenna (Right)",
            "Long Range Antenna (Rear/Center)",
            "Low Profile Antenna (Front)"
          ]
        },
        SHR: {
          ANTENNAS_SEDAN: [
            "5G Antenna (Trunk Right)",
            "Long Range Antenna (Rear Center / trunk center)",
            "Low Profile Antenna (Front Center)"
          ],
          ANTENNAS_SUV: [
            "5G Antenna (Right)",
            "Long Range Antenna (Rear / Center)",
            "Low Profile Antenna (Front)"
          ]
        },
        HICOM: {
          ANTENNAS_SEDAN: [
            "5G Antenna (Trunk Right)",
            "Long Range Antenna (Rear Center)",
            "Low Profile Antenna (Front Center)"
          ],
          ANTENNAS_SUV: [
            "5G Antenna (Right)",
            "Long Range Antenna (Rear/Center)",
            "Low Profile Antenna (Front)"
          ]
        }
      },
      SPOTLIGHTS: ["LED Spotlight", "Passenger Spotlight (Optional)"],
      NOTES: ["All ranks: Black Decals only. HR/SHR may request HICOM White Decal permissions. HICOM may use White Decals.", "HICOM: Pushbar (Optional), ALPR (Optional), Spotlights (Optional)."]
    }
  };

  const OPTIONAL_RULES = {
    Pushbar: "Wraparound Bar",
    ALPR: null,
    "Flood Lights": null,
    "Passenger Spotlight": null
  };

  const OPTIONAL_ACCESSORIES = ["ALPR", "Flood Lights", "Passenger Spotlight", "Grappler"];

  /**
   * Allowed cars for a rank: own cars + all lower ranks' cars (higher ranks inherit).
   * Returns list with this rank's cars first, then inherited in rank order (SHR, HR, SGTP, LR).
   */
  function getAllowedCars(div, rank) {
    const order = RANK_ORDER[div];
    if (!order || !rulesData[div] || !rulesData[div][rank]) return [];
    const idx = order.indexOf(rank);
    if (idx === -1) return rulesData[div][rank].ALLOWED_CARS || [];
    const out = [];
    for (let i = idx; i >= 0; i--) {
      const r = order[i];
      (rulesData[div][r].ALLOWED_CARS || []).forEach(c => out.push(c));
    }
    return Array.from(new Set(out));
  }

  /** ---------------- TAG INPUT ---------------- */

  function setupTagInput(containerId, optionsGetter) {
    const container = document.getElementById(containerId);
    if (!container) return () => [];

    const input = container.querySelector("input");
    const ul = container.querySelector("ul");
    let tags = [];
    let justSelected = false;

    function refresh() {
      container.querySelectorAll(".tag").forEach(t => t.remove());
      tags.forEach(t => {
        const el = document.createElement("span");
        el.className = "tag";
        el.textContent = t;
        const x = document.createElement("span");
        x.className = "remove";
        x.textContent = "×";
        x.onclick = () => {
          tags = tags.filter(v => v !== t);
          refresh();
          checkConfig();
        };
        el.appendChild(x);
        container.insertBefore(el, input);
      });
    }

    function showSuggestions(val = "") {
      if (!ul) return;
      ul.innerHTML = "";
      const opts = (optionsGetter() || []).filter(
        o =>
          !tags.includes(o) &&
          o.toLowerCase().includes((val || "").toLowerCase())
      );
      opts.forEach(o => {
        const li = document.createElement("li");
        li.textContent = o;
        li.onclick = () => {
          justSelected = true;
          tags.push(o);
          input.value = "";
          refresh();
          checkConfig();
          showSuggestions();
        };
        ul.appendChild(li);
      });
      ul.style.display = opts.length ? "block" : "none";
    }

    input.addEventListener("input", () => showSuggestions(input.value));
    input.addEventListener("focus", () => showSuggestions(input.value));
    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !input.value && tags.length) {
        tags.pop();
        refresh();
        checkConfig();
      }
    });

    document.addEventListener("click", e => {
      if (!ul) return;
      if (justSelected) {
        justSelected = false;
        return;
      }
      if (!container.contains(e.target)) ul.style.display = "none";
    });

    return () => tags.slice();
  }

  /** ---------------- SELECTORS (resolved when DOM is ready) ---------------- */

  let divisionSelect, rankSelect, vehicleSelect, lightbarSelect, decalSelect, checkerResult;
  let getLighting, getAccessories;

  function bindElements() {
    divisionSelect = document.getElementById("division");
    rankSelect = document.getElementById("rank");
    vehicleSelect = document.getElementById("vehicle");
    lightbarSelect = document.getElementById("lightbar");
    decalSelect = document.getElementById("decal");
    checkerResult = document.getElementById("checkerResult");
  }

  function bindTagInputs() {
    getLighting = setupTagInput("lightingContainer", () => {
    if (!divisionSelect || !rankSelect) return [];
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return [];
    const data = rulesData[div][rank];
    return [...(data.LIGHTING || []), ...(data.REAR_LIGHTS || []), ...(data.OPTIONAL_LIGHTING || [])];
  });

  getAccessories = setupTagInput("accessoriesContainer", () => {
    if (!divisionSelect || !rankSelect) return [];
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return [];
    return rulesData[div][rank].ACCESSORIES || [];
  });
  }

  /** ---------------- POPULATION ---------------- */

  function populateDivisions() {
    if (!divisionSelect) return;
    divisionSelect.innerHTML = "<option value=''>Select Division</option>";
    Object.keys(rulesData).forEach(d => {
      const o = document.createElement("option");
      o.value = d;
      o.textContent = d;
      divisionSelect.appendChild(o);
    });
  }

  function populateRanks() {
    if (!rankSelect || !divisionSelect) return;
    rankSelect.innerHTML = "<option value=''>Select Rank</option>";
    const div = divisionSelect.value;
    if (!div) return;
    const order = RANK_ORDER[div];
    const ranks = order ? order.filter(r => rulesData[div][r]) : Object.keys(rulesData[div]);
    const ranksHighestFirst = ranks.slice().reverse();
    ranksHighestFirst.forEach(r => {
      const o = document.createElement("option");
      o.value = r;
      o.textContent = r;
      rankSelect.appendChild(o);
    });
  }

  function populateVehicleOptions() {
    if (!vehicleSelect || !divisionSelect || !rankSelect) return;
    vehicleSelect.innerHTML = "<option value=''>Select Vehicle</option>";
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank) return;
    getAllowedCars(div, rank).forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      vehicleSelect.appendChild(o);
    });
  }

  function populateStatic() {
    if (lightbarSelect) {
      lightbarSelect.innerHTML = "<option value=''>Select Lightbar</option>";
      MAIN_LIGHTS.forEach(l => {
        const o = document.createElement("option");
        o.value = l;
        o.textContent = l;
        lightbarSelect.appendChild(o);
      });
    }
    if (decalSelect) {
      decalSelect.innerHTML = "<option value=''>Select Decal</option>";
      ["Black Decal", "White Decal"].forEach(d => {
        const o = document.createElement("option");
        o.value = d;
        o.textContent = d;
        decalSelect.appendChild(o);
      });
    }
  }

  function updateDecalOptions() {
    if (!decalSelect) return;
    const div = divisionSelect && divisionSelect.value;
    const rank = rankSelect && rankSelect.value;
    const options = ["Black Decal"];
    if (div && rank && rulesData[div] && rulesData[div][rank]) {
      const decals = rulesData[div][rank].DECALS || ["Black Decal"];
      if (decals.includes("White Decal")) options.push("White Decal");
    }
    decalSelect.innerHTML = "<option value=''>Select Decal</option>";
    options.forEach(d => {
      const o = document.createElement("option");
      o.value = d;
      o.textContent = d;
      decalSelect.appendChild(o);
    });
  }

  /**
   * Returns antenna sections for the checker: { sections: [ { title, items } ] } or null.
   */
  function getAntennasForChecker(div, rank) {
    if (!div || !rank || !GUIDE_NOTES[div]) return null;
    const notes = GUIDE_NOTES[div];
    if (div === "Normal" && notes.RANK_ANTENNAS && notes.RANK_ANTENNAS[rank]) {
      const r = notes.RANK_ANTENNAS[rank];
      if (r.ANTENNAS) {
        return { sections: [{ title: "Antennas (positions)", items: r.ANTENNAS }] };
      }
      if (r.ANTENNAS_SEDAN && r.ANTENNAS_SUV) {
        return {
          sections: [
            { title: "Antennas – Sedan (positions)", items: r.ANTENNAS_SEDAN },
            { title: "Antennas – SUV (positions)", items: r.ANTENNAS_SUV }
          ]
        };
      }
    }
    if (notes.ANTENNAS && notes.ANTENNAS.length) {
      return { sections: [{ title: "Antennas (positions)", items: notes.ANTENNAS }] };
    }
    return null;
  }

  function updateCheckerAntennas() {
    const el = document.getElementById("checkerAntennas");
    if (!el) return;
    const div = divisionSelect && divisionSelect.value;
    const rank = rankSelect && rankSelect.value;
    const data = getAntennasForChecker(div, rank);
    el.innerHTML = "";
    if (!data || !data.sections.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Select division and rank to see allowed antennas and positions.";
      el.appendChild(p);
      return;
    }
    data.sections.forEach(function (sec) {
      const label = document.createElement("p");
      label.className = "guide-label";
      label.textContent = sec.title;
      el.appendChild(label);
      const ul = document.createElement("ul");
      ul.className = "checker-antennas-ul";
      (sec.items || []).forEach(function (item) {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      el.appendChild(ul);
    });
  }

  /** ---------------- CHECKER ---------------- */

  function getData() {
    if (!divisionSelect || !rankSelect) return null;
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    if (!div || !rank || !rulesData[div] || !rulesData[div][rank]) return null;
    return rulesData[div][rank];
  }

  function checkConfig() {
    if (!checkerResult) return;
    if (!divisionSelect || !rankSelect) return;
    const div = divisionSelect.value;
    const rank = rankSelect.value;
    const vehicle = vehicleSelect ? vehicleSelect.value : "";
    const lightbar = lightbarSelect ? lightbarSelect.value : "";
    const decal = decalSelect ? decalSelect.value : "";
    const lighting = getLighting();
    const accessories = getAccessories();
    const data = getData();

    if (!data) {
      checkerResult.textContent = "Select division and rank.";
      checkerResult.classList.remove("ok");
      checkerResult.classList.add("error");
      return;
    }

    const errors = [];

    if (!vehicle) {
      errors.push("Select a vehicle.");
    } else if (!getAllowedCars(div, rank).includes(vehicle)) {
      errors.push(`Vehicle "${vehicle}" not allowed for this rank.`);
    }

    if (lightbar && !MAIN_LIGHTS.includes(lightbar)) {
      errors.push(`Lightbar "${lightbar}" not allowed.`);
    }

    if (decal) {
      const allowedDecals = data.DECALS || ["Black Decal"];
      if (!allowedDecals.includes(decal)) {
        errors.push(`Decal "${decal}" not allowed; use Black or request HICOM permissions.`);
      }
    }

    const requiredAccessories = (data.ACCESSORIES || []).filter(
      a => !OPTIONAL_ACCESSORIES.includes(a)
    );
    requiredAccessories.forEach(a => {
      if (!accessories.includes(a)) errors.push(`Required accessory missing: ${a}.`);
    });

    accessories.forEach(a => {
      if (!(data.ACCESSORIES || []).includes(a)) {
        errors.push(`Accessory "${a}" not permitted for this division/rank.`);
      } else if (OPTIONAL_RULES[a] && OPTIONAL_RULES[a] !== null && !accessories.includes(OPTIONAL_RULES[a])) {
        errors.push(`"${a}" requires "${OPTIONAL_RULES[a]}".`);
      }
    });

    const allowedLighting = [...(data.LIGHTING || []), ...(data.REAR_LIGHTS || []), ...MAIN_LIGHTS, ...(data.OPTIONAL_LIGHTING || [])];
    const requiredLighting = [...(data.LIGHTING || []), ...(data.REAR_LIGHTS || [])];
    requiredLighting.forEach(l => {
      if (!lighting.includes(l)) errors.push(`Required lighting missing: ${l}.`);
    });
    lighting.forEach(l => {
      if (!allowedLighting.includes(l)) {
        errors.push(`Lighting "${l}" not permitted.`);
      }
    });

    if (checkerResult) {
      checkerResult.textContent =
        errors.length > 0 ? errors.join(" ") : "Configuration approved.";
      checkerResult.classList.toggle("error", errors.length > 0);
      checkerResult.classList.toggle("ok", errors.length === 0);
    }
  }

  /** ---------------- DIVISION GUIDE (guide-only: antennas, spotlights, texture, notes) ---------------- */

  function buildVehicleGuide() {
    const content = document.getElementById("vehicleGuideContent");
    const guideSelect = document.getElementById("guideDivisionSelect");
    if (!content) return;

    function addList(block, label, items) {
      if (!items || !items.length) return;
      const p = document.createElement("p");
      p.className = "guide-label";
      p.textContent = label;
      block.appendChild(p);
      const ul = document.createElement("ul");
      items.forEach(i => {
        const li = document.createElement("li");
        li.textContent = i;
        ul.appendChild(li);
      });
      block.appendChild(ul);
    }

    function render(div) {
      content.innerHTML = "";
      if (!div || !rulesData[div]) return;
      const section = document.createElement("div");
      const visibleClass = "vehicle-guide-section--visible";
      const divClass = "vehicle-guide-section--" + div.toLowerCase();
      section.className = "vehicle-guide-section " + visibleClass + " " + divClass;
      const h3 = document.createElement("h3");
      h3.textContent = div;
      section.appendChild(h3);

      const ranksWrapper = document.createElement("div");
      ranksWrapper.className = "vehicle-guide-ranks";
      const order = RANK_ORDER[div];
      const ranks = order ? order.filter(r => rulesData[div][r]) : Object.keys(rulesData[div]);
      const ranksHighestFirst = ranks.slice().reverse();
      ranksHighestFirst.forEach(rank => {
        const data = rulesData[div][rank];
        const block = document.createElement("div");
        block.className = "vehicle-guide-rank";
        const h4 = document.createElement("h4");
        h4.textContent = rank;
        block.appendChild(h4);

        addList(block, "Vehicles", getAllowedCars(div, rank));
        addList(block, "Main Light Options", MAIN_LIGHTS);
        addList(block, "Rear Light Options", data.REAR_LIGHTS);
        addList(block, "Additional Lighting", data.LIGHTING);
        if (data.OPTIONAL_LIGHTING && data.OPTIONAL_LIGHTING.length) {
          addList(block, "Optional Lighting", data.OPTIONAL_LIGHTING);
        }
        addList(block, "Accessories", data.ACCESSORIES);
        addList(block, "Decals", data.DECALS);

        const rankNotes = div === "Normal" && GUIDE_NOTES.Normal && GUIDE_NOTES.Normal.RANK_ANTENNAS && GUIDE_NOTES.Normal.RANK_ANTENNAS[rank];
        if (rankNotes) {
          if (rankNotes.ANTENNAS) {
            addList(block, "Antennas (positions)", rankNotes.ANTENNAS);
          }
          if (rankNotes.ANTENNAS_SEDAN) {
            addList(block, "Antennas – Sedan (positions)", rankNotes.ANTENNAS_SEDAN);
            addList(block, "Antennas – SUV (positions)", rankNotes.ANTENNAS_SUV);
          }
        } else if (GUIDE_NOTES[div] && GUIDE_NOTES[div].ANTENNAS) {
          addList(block, "Antennas (positions)", GUIDE_NOTES[div].ANTENNAS);
        }

        const spotlights = GUIDE_NOTES[div] && GUIDE_NOTES[div].SPOTLIGHTS;
        if (spotlights && spotlights.length) {
          addList(block, "Spotlights", spotlights);
        }

        ranksWrapper.appendChild(block);
      });
      section.appendChild(ranksWrapper);

      const notes = GUIDE_NOTES[div];
      if (notes) {
        const notesBlock = document.createElement("div");
        notesBlock.className = "guide-notes";
        const notesTitle = document.createElement("h4");
        notesTitle.textContent = "Division details (texture, notes)";
        notesBlock.appendChild(notesTitle);
        if (notes.TEXTURE) {
          const p = document.createElement("p");
          p.className = "guide-label";
          p.textContent = "Texture";
          notesBlock.appendChild(p);
          const span = document.createElement("p");
          span.textContent = notes.TEXTURE;
          notesBlock.appendChild(span);
        }
        if (notes.TEXTURE_HICOM && div === "Normal") {
          const p2 = document.createElement("p");
          p2.className = "guide-label";
          p2.textContent = "Texture (HICOM)";
          notesBlock.appendChild(p2);
          const span2 = document.createElement("p");
          span2.textContent = notes.TEXTURE_HICOM;
          notesBlock.appendChild(span2);
        }
        addList(notesBlock, "Notes", notes.NOTES);
        section.appendChild(notesBlock);
      }

      content.appendChild(section);
    }

    if (guideSelect) {
      guideSelect.innerHTML = "<option value=''>Select Division</option>";
      const divisions = Object.keys(rulesData);
      divisions.forEach(d => {
        const o = document.createElement("option");
        o.value = d;
        o.textContent = d;
        guideSelect.appendChild(o);
      });
      guideSelect.addEventListener("change", () => render(guideSelect.value));
      const firstDiv = divisions[0];
      if (firstDiv) {
        guideSelect.value = firstDiv;
        render(firstDiv);
      }
    }
  }

  /** ---------------- INIT (run when DOM is ready) ---------------- */

  function runInit() {
    bindElements();
    bindTagInputs();
    if (!divisionSelect || !rankSelect) return;

    const checkerToggle = document.getElementById("checkerToggle");
    const checkerBody = document.getElementById("checkerBody");
    const checkerArrow = document.getElementById("checkerArrow");
    if (checkerToggle && checkerBody) {
      checkerToggle.addEventListener("click", () => {
        checkerBody.classList.toggle("open");
        if (checkerArrow) checkerArrow.textContent = checkerBody.classList.contains("open") ? "▲" : "▼";
        checkerToggle.setAttribute("aria-expanded", checkerBody.classList.contains("open"));
      });
    }

    populateDivisions();
    populateStatic();
    updateDecalOptions();
    updateCheckerAntennas();
    buildVehicleGuide();

    divisionSelect.addEventListener("change", () => {
      populateRanks();
      populateVehicleOptions();
      updateDecalOptions();
      updateCheckerAntennas();
      checkConfig();
    });

    rankSelect.addEventListener("change", () => {
      populateVehicleOptions();
      updateDecalOptions();
      updateCheckerAntennas();
      checkConfig();
    });

    if (vehicleSelect) vehicleSelect.addEventListener("change", checkConfig);
    if (lightbarSelect) lightbarSelect.addEventListener("change", checkConfig);
    if (decalSelect) decalSelect.addEventListener("change", checkConfig);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInit);
  } else {
    runInit();
  }
})();
