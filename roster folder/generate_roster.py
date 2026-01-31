"""
Generate troopers.html from Google Sheet roster.
Downloads Roblox avatars to assets/avatars/ and embeds them in static HTML.
"""

import argparse
import csv
import io
import os
import re
import requests

SHEET_ID = "1HYp1vsJ-rqrTRlvJHibFPnjrPZEcuoFLW-IXRIvdKwg"
SHEET_GID = "0"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
AVATARS_DIR = os.path.join(PROJECT_ROOT, "assets", "avatars")
FALLBACK_AVATAR = "https://tr.rbxcdn.com/6c6b8e6b7b7e7b7b7b7b7b7b7b7b7b/420/420/AvatarHeadshot/Png"

def parse_args():
    p = argparse.ArgumentParser(description="Generate troopers.html from Google Sheet roster")
    p.add_argument(
        "--reload-all",
        action="store_true",
        help="Re-download all regular trooper avatars (HICOM still cached)",
    )
    return p.parse_args()

def get_sheet_data():
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&gid={SHEET_GID}"
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    return r.text

def get_roblox_user_info(username):
    url = "https://users.roblox.com/v1/usernames/users"
    r = requests.post(
        url,
        json={"usernames": [username], "excludeBannedUsers": False},
        timeout=10,
    )
    if r.status_code != 200:
        return None
    data = r.json()
    if not data.get("data"):
        return None
    u = data["data"][0]
    return {
        "userId": u["id"],
        "username": u["name"],  # <-- use username
        "displayName": u.get("displayName", u["name"]),
    }

def get_avatar_url(user_id, size=420):
    url = (
        "https://thumbnails.roblox.com/v1/users/avatar-headshot"
        f"?userIds={user_id}&size={size}x{size}&format=Png&isCircular=false"
    )
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        d = r.json()
        if d.get("data") and d["data"] and "imageUrl" in d["data"][0]:
            return d["data"][0]["imageUrl"]
    except Exception as e:
        print(f"  Avatar fetch error: {e}")
    return FALLBACK_AVATAR

def download_avatar(url, path):
    try:
        r = requests.get(url, timeout=15, stream=True)
        r.raise_for_status()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  Download error {path}: {e}")
        return False

def _cell(row, idx, default=""):
    if not row or idx >= len(row):
        return default
    v = row[idx]
    return (v or "").strip() if v is not None else default

def _is_checked(val):
    if not val:
        return False
    v = str(val).strip().upper()
    return v in ("TRUE", "YES", "1", "✓", "X")

def _specialties(row):
    """P (col 15) = HSPU, Q (col 16) = SRT."""
    h, s = _is_checked(_cell(row, 15)), _is_checked(_cell(row, 16))
    if h and s:
        return ("HSPU • SRT", "both")
    if h:
        return ("HSPU", "hspu")
    if s:
        return ("SRT", "srt")
    return ("", None)

def _sanitize_filename(name):
    return re.sub(r"[^\w\-.]", "_", str(name)) or "unknown"

def parse_roster(csv_text):
    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)

    dividers = [
        "HIGH COMMAND",
        "SENIOR HIGH RANK",
        "HIGH RANK",
        "SERGEANTS PROGRAMME",
        "SERGEANTS PROGRAM",
        "LOW RANKS",
    ]

    current_section = ""
    out = []

    for r in rows[1:]:
        row = [c.strip() if c else "" for c in r] if r else []
        if not row or not any(row):
            continue

        row_text = " ".join(row).upper()
        for d in dividers:
            if d in row_text:
                current_section = "SERGEANTS PROGRAMME" if d == "SERGEANTS PROGRAM" else d
                break
        else:
            if _cell(row, 2).lower() == "callsign":
                continue

            username = _cell(row, 3)
            callsign = _cell(row, 2)
            if not username or not callsign:
                continue

            rank = " ".join(filter(None, [_cell(row, 12), _cell(row, 13), _cell(row, 14)]))
            label, kind = _specialties(row)

            info = get_roblox_user_info(username)
            if not info:
                continue

            out.append(
                {
                    "callsign": callsign,
                    "roblox": info["username"],  # <-- username
                    "displayName": info["displayName"],
                    "rank": rank,
                    "section": current_section,
                    "userId": info["userId"],
                    "specialties": label,
                    "specialtiesKind": kind,
                }
            )
    return out

def _callsign_num(cs):
    m = re.search(r"(\d+)", cs)
    return int(m.group(1)) if m else 999

def sort_by_callsign(troopers):
    return sorted(troopers, key=lambda t: _callsign_num(t["callsign"]))

ROSTER_TIERS = [
    ("Senior High Rank", "shr", 10, 19),
    ("High Rank", "hr", 20, 35),
    ("Sergeants Program", "sp", 36, 60),
    ("Low Rank", "lr", 61, 250),
]

SECTION_TO_TIER = {
    "SENIOR HIGH RANK": ("Senior High Rank", "shr"),
    "HIGH RANK": ("High Rank", "hr"),
    "SERGEANTS PROGRAMME": ("Sergeants Program", "sp"),
    "LOW RANKS": ("Low Rank", "lr"),
}

def _escape(s):
    if not s:
        return ""
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def _roster_card(t, is_hicom=False):
    name = _escape(t.get("roblox", "unknown"))
    rank = _escape(t.get("rank", ""))
    callsign = _escape(t.get("callsign", ""))
    avatar = t.get("avatarPath", "").strip() or FALLBACK_AVATAR
    specialties = t.get("specialties") or ""
    specialties_kind = t.get("specialtiesKind")

    spec_class = ""
    spec_style = ""

    if specialties_kind == "both":
        spec_class = "specialties specialties--both"
        spec_style = "style='animation: fadeBlueRed 3s infinite alternate;'"
    elif specialties_kind == "hspu":
        spec_class = "specialties specialties--hspu"
        spec_style = "style='background-color: rgba(111,148,187,1);'"
    elif specialties_kind == "srt":
        spec_class = "specialties specialties--srt"
        spec_style = "style='background-color: rgba(186,101,115,1);'"

    spec_html = f'<p class="{spec_class}" {spec_style}>{_escape(specialties)}</p>' if specialties else ""

    card_class = "leadership-card" if is_hicom else "roster-card"

    return f"""            <div class="{card_class}">
              <img src="{_escape(avatar)}" alt="{name}" class="avatar" />
              <p class="name">{name}</p>
              <p class="rank">{rank}</p>
              <p class="callsign">{callsign}</p>
              {spec_html}
            </div>"""

def build_troopers_html(hicom, regular_all):
    cards_hicom = "\n".join(_roster_card(t, is_hicom=True) for t in hicom)
    sections_html = []

    for section_key, (title, suffix) in SECTION_TO_TIER.items():
        tier_troopers = [t for t in regular_all if t.get("section") == section_key]
        if not tier_troopers:
            continue
        cards = "\n".join(_roster_card(t, is_hicom=False) for t in tier_troopers)
        sections_html.append(
            f"""        <div class="rank-section roster-tier--{suffix}">
          <h3 class="rank-title">{_escape(title)}</h3>
          <div class="roster-grid">
{cards}
          </div>
        </div>"""
        )
    sections_body = "\n".join(sections_html)

    # CSS for specialties
    specialties_css = """
<style>
.specialties {
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  font-size: 0.9em;
  font-weight: bold;
  color: #fff;
  text-align: center;
}
.specialties--hspu { background-color: rgba(0, 0, 255, 0.25); }
.specialties--srt  { background-color: rgba(255, 0, 0, 0.25); }
@keyframes fadeBlueRed {
  0%   { background-color: rgba(0,0,255,0.25); }
  50%  { background-color: rgba(255,0,0,0.25); }
  100% { background-color: rgba(0,0,255,0.25); }
}
.specialties--both { animation: fadeBlueRed 3s infinite alternate; }
</style>
"""

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>FHP Ghost Unit Troopers</title>
  <link rel="stylesheet" href="css/main.css" />
  <link rel="stylesheet" href="css/roster.css" />
  {specialties_css}
</head>
<body>
  <div id="particles-js"></div>
  <div class="page-wrap">
    <header>
      <div class="nav-wrap">
        <div class="brand">
            <img src="assets/logo.png" alt="FHP Ghost Unit logo" class="logo" />
            <span class="eyebrow">FSRP • Ghost Unit</span>
            <h1>Trooper Roster</h1>
        </div>
        <nav>
          <a href="index.html">Home</a>
          <a href="handbook.html">Handbook</a>
          <a href="chain-of-command.html">Chain of Command</a>
          <a href="vehicle-guidelines.html">Vehicle Guidelines</a>
          <a class="active" href="troopers.html">Troopers</a>
          <a href="official_media.html">Official Media</a>
        </nav>
      </div>
    </header>

    <main class="wrap">
      <section class="intro">
        <span class="tag">Active Roster</span>
      </section>

      <section class="section">
        <div class="hicom-section">
          <h3 class="rank-title">High Command</h3>
          <div class="leadership-row">
{cards_hicom}
          </div>
        </div>
{sections_body}
      </section>
    </main>

    <footer>
       <span id="y"></span> FSRP • Florida Highway Patrol Ghost Unit
    </footer>
  </div>

  <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
"""

def main():
    args = parse_args()

    print("Fetching sheet...")
    csv_text = get_sheet_data()

    print("Parsing roster...")
    troopers = parse_roster(csv_text)
    print(f"Found {len(troopers)} troopers")

    os.makedirs(AVATARS_DIR, exist_ok=True)

    hicom = [t for t in troopers if 1 <= _callsign_num(t["callsign"]) <= 6]
    regular_all = [t for t in troopers if _callsign_num(t["callsign"]) > 6]

    # ---- HICOM ----
    for t in hicom:
        name = _sanitize_filename(t["roblox"])
        rel = f"assets/avatars/{name}.png"
        path = os.path.join(AVATARS_DIR, f"{name}.png")
        if os.path.isfile(path):
            t["avatarPath"] = rel
            continue
        print(f"  [HICOM] {t['callsign']} ({t['roblox']})")
        url = get_avatar_url(t["userId"])
        t["avatarPath"] = rel if download_avatar(url, path) else FALLBACK_AVATAR

    # ---- Regular ----
    for i, t in enumerate(regular_all, 1):
        uid = t["userId"]
        rel = f"assets/avatars/{uid}.png"
        path = os.path.join(AVATARS_DIR, f"{uid}.png")
        if os.path.isfile(path) and not args.reload_all:
            t["avatarPath"] = rel
            continue
        print(f"  [{i}/{len(regular_all)}] Downloading {t['callsign']} ({t['roblox']})")
        url = get_avatar_url(uid)
        t["avatarPath"] = rel if download_avatar(url, path) else FALLBACK_AVATAR

    html = build_troopers_html(hicom, regular_all)
    out_path = os.path.join(PROJECT_ROOT, "troopers.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Wrote {out_path}")
    print("Done.")

if __name__ == "__main__":
    main()
