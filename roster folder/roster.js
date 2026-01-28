const SHEET_ID = "1HYp1vsJ-rqrTRlvJHibFPnjrPZEcuoFLW-IXRIvdKwg";
const SHEET_GID = "0";
const CACHE_KEY = "roster_cache";
const CACHE_EXPIRY_KEY = "roster_cache_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function csvToRows(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.map((cols) => cols.map((v) => v.trim()));
}

async function getRobloxUserInfo(username) {
  try {
    const response = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.data || data.data.length === 0) return null;
    const user = data.data[0];
    return {
      userId: user.id,
      username: user.name,
      displayName: user.displayName || user.name
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

async function getRobloxAvatarUrl(userId, size = 256) {
  if (!userId) return "https://tr.rbxcdn.com/6c6b8e6b7b7e7b7b7b7b7b7b7b7b7b/420/420/AvatarHeadshot/Png";
  
  const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=${size}x${size}&format=Png&isCircular=false`;
  try {
    const response = await fetch(url, { timeout: 10000 });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].imageUrl) {
      return data.data[0].imageUrl;
    }
  } catch (error) {
    console.error("Error fetching avatar:", error);
  }
  
  return "https://tr.rbxcdn.com/6c6b8e6b7b7e7b7b7b7b7b7b7b7b7b/420/420/AvatarHeadshot/Png";
}

async function parseRoster(csvText) {
  const rows = csvToRows(csvText);
  const sectionDividers = ["HIGH COMMAND", "SENIOR HIGH RANK", "HIGH RANK", "SERGEANTS PROGRAMME", "LOW RANKS"];
  let currentSection = "";
  const troopers = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (!row || !row.some((v) => v)) continue;

    // Check for section divider
    const rowText = row.join(" ").toUpperCase();
    let isSectionDivider = false;
    for (const divider of sectionDividers) {
      if (rowText.includes(divider)) {
        currentSection = divider;
        isSectionDivider = true;
        break;
      }
    }
    if (isSectionDivider) continue;

    // Skip header rows
    if (row[2] && row[2].toLowerCase() === "callsign") continue;

    // Skip rows without username
    if (!row[3]) continue;

    const callsign = row[2] || "";
    const username = row[3] || "";
    const rank = [row[12], row[13], row[14]].filter(Boolean).join(" ");

    if (!username || !callsign) continue;

    try {
      const info = await getRobloxUserInfo(username);
      if (!info) continue;

      const avatarUrl = await getRobloxAvatarUrl(info.userId);

      troopers.push({
        callsign,
        roblox: info.username,
        displayName: info.displayName,
        rank,
        section: currentSection,
        avatarUrl
      });
    } catch (error) {
      console.error(`Error processing trooper ${username}:`, error);
    }
  }

  return troopers;
}

function sortByCallsign(troopers) {
  return troopers.sort((a, b) => {
    const aMatch = a.callsign.match(/(\d+)/);
    const bMatch = b.callsign.match(/(\d+)/);
    const aNum = aMatch ? parseInt(aMatch[1]) : 999;
    const bNum = bMatch ? parseInt(bMatch[1]) : 999;
    return aNum - bNum;
  });
}

function renderRoster(container, troopers) {
  container.innerHTML = "";

  const hicom = troopers.filter((t) => t.section === "HIGH COMMAND");
  const regular = sortByCallsign(troopers.filter((t) => t.section !== "HIGH COMMAND"));

  // Render HIGH COMMAND section separately
  if (hicom.length > 0) {
    const hicomSection = document.createElement("div");
    hicomSection.className = "hicom-section";

    const title = document.createElement("h3");
    title.className = "hicom-title";
    title.textContent = "High Command";
    hicomSection.appendChild(title);

    const row = document.createElement("div");
    row.className = "leadership-row";

    hicom.forEach((trooper) => {
      const card = document.createElement("div");
      card.className = "leadership-card";
      card.innerHTML = `
        <img src="${trooper.avatarUrl}" alt="${trooper.roblox}" class="avatar" />
        <p class="name">${trooper.roblox}</p>
        <p class="rank">${trooper.rank}</p>
        <p class="callsign">${trooper.callsign}</p>
      `;
      row.appendChild(card);
    });

    hicomSection.appendChild(row);
    container.appendChild(hicomSection);
  }

  // Render regular roster section
  if (regular.length > 0) {
    const section = document.createElement("div");
    section.className = "rank-section";

    const title = document.createElement("h3");
    title.className = "rank-title";
    title.textContent = "Roster";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "roster-grid";

    regular.forEach((trooper) => {
      const card = document.createElement("div");
      card.className = "roster-card";
      card.innerHTML = `
        <img src="${trooper.avatarUrl}" alt="${trooper.roblox}" class="avatar" />
        <p class="name">${trooper.roblox}</p>
        <p class="rank">${trooper.rank}</p>
        <p class="callsign">${trooper.callsign}</p>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  }
}

async function loadRoster() {
  const container = document.querySelector("[data-roster-list]");
  if (!container) return;

  // Check cache
  const cached = localStorage.getItem(CACHE_KEY);
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

  if (cached && expiry && Date.now() < parseInt(expiry)) {
    console.log("Using cached roster");
    const troopers = JSON.parse(cached);
    renderRoster(container, troopers);
    return;
  }

  // Fetch fresh data
  console.log("Fetching fresh roster data");
  container.innerHTML = '<p class="muted">Loading roster...</p>';

  try {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
    const response = await fetch(sheetUrl);
    if (!response.ok) throw new Error("Failed to fetch sheet");

    const csvText = await response.text();
    const troopers = await parseRoster(csvText);

    // Cache for 24 hours
    localStorage.setItem(CACHE_KEY, JSON.stringify(troopers));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());

    renderRoster(container, troopers);
  } catch (error) {
    console.error("Error loading roster:", error);
    container.innerHTML = '<p class="muted">Unable to load roster. Check console for errors.</p>';
  }
}

// Load roster when page loads
document.addEventListener("DOMContentLoaded", loadRoster);
