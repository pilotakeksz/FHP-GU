function setupTagInput(containerId, options) {
  const container = document.getElementById(containerId);
  const input = container.querySelector("input");
  const ul = container.querySelector("ul");
  let tags = [];

  function refreshTags() {
    container.querySelectorAll(".tag").forEach(t => t.remove());
    tags.forEach(t => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag";
      tagEl.textContent = t;
      const x = document.createElement("span");
      x.className = "remove";
      x.textContent = "×";
      x.onclick = () => { tags = tags.filter(v => v !== t); refreshTags(); };
      tagEl.appendChild(x);
      container.insertBefore(tagEl, input);
    });
  }

  function showSuggestions(val = "") {
    ul.innerHTML = "";
    const filtered = options.filter(o => o.toLowerCase().includes(val.toLowerCase()) && !tags.includes(o));
    if (filtered.length === 0) { ul.style.display = "none"; return; }
    filtered.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f;
      li.onclick = () => { tags.push(f); input.value=""; ul.innerHTML=""; ul.style.display="none"; refreshTags(); };
      ul.appendChild(li);
    });
    ul.style.display = "block";
  }

  input.addEventListener("input", () => showSuggestions(input.value));
  input.addEventListener("focus", () => showSuggestions(input.value));
  container.addEventListener("click", () => input.focus());

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      tags.push(input.value.trim());
      input.value = "";
      ul.innerHTML = "";
      ul.style.display = "none";
      refreshTags();
      e.preventDefault();
    } else if (e.key === "Backspace" && !input.value) {
      tags.pop();
      refreshTags();
    }
  });
}

// setup multi-selects
setupTagInput("accessoriesContainer", ["Pushbar","MDT","Radar"]);
setupTagInput("lightingContainer", ["Rear Deck","Visor Lights"]);
