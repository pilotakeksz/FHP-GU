#!/usr/bin/env python3
import os
import json
from datetime import datetime
from pathlib import Path
from PIL import ImageGrab  # for clipboard images

# --- Paths ---
GALLERY_DIR = Path("assets/gallery")
GALLERY_JSON = Path("data/gallery.json")

# Ensure directories exist
GALLERY_DIR.mkdir(parents=True, exist_ok=True)
GALLERY_JSON.parent.mkdir(parents=True, exist_ok=True)

# Ensure gallery JSON exists
if not GALLERY_JSON.exists():
    with open(GALLERY_JSON, "w") as f:
        json.dump([], f, indent=2)
    print(f"Created empty gallery JSON at {GALLERY_JSON}")

def save_clipboard_image():
    img = ImageGrab.grabclipboard()
    if img is None:
        print("No image found in clipboard. Copy an image first.")
    return img

def create_gallery_entry(img, caption="Untitled", credit="Anonymous"):
    entry_id = int(datetime.now().timestamp() * 1000)
    filename = f"gallery-{entry_id}.png"
    dest_path = GALLERY_DIR / filename
    img.save(dest_path, format="PNG")
    print(f"Saved image to {dest_path}")

    entry = {
        "id": str(entry_id),
        "src": f"assets/gallery/{filename}",
        "caption": caption,
        "credit": credit,
        "date": datetime.now().isoformat()
    }
    return entry

def load_gallery_json():
    with open(GALLERY_JSON, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_gallery_json(data):
    with open(GALLERY_JSON, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Updated {GALLERY_JSON} with {len(data)} entries.")

def main():
    print("=== Clipboard Gallery Manager ===")
    gallery_data = load_gallery_json()
    try:
        while True:
            input("\nPress Enter to paste an image from clipboard (Ctrl+C to quit)...")
            img = save_clipboard_image()
            if not img:
                continue
            caption = input("  Caption: ").strip() or "Untitled"
            credit = input("  Credit: ").strip() or "Anonymous"

            entry = create_gallery_entry(img, caption, credit)
            gallery_data.append(entry)
            save_gallery_json(gallery_data)
            print("\nJSON entry added successfully!")
    except KeyboardInterrupt:
        print("\nExiting. Gallery JSON is up to date.")

if __name__ == "__main__":
    main()
