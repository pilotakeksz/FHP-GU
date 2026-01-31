document.addEventListener('DOMContentLoaded', () => {
  const DATA_URL = 'data/gallery.json';
  const IMAGE_PATH = 'assets/gallery/gallery-';
  const INTERVAL = 6000; // slideshow interval

  const container = document.getElementById('carouselContainer');
  const wrapper = document.getElementById('carouselWrapper');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  let data = [];
  let index = 0;
  let timer = null;
  let paused = false;

  // ---- single image element ----
  const img = document.createElement('img');
  Object.assign(img.style, {
    display: 'block',
    margin: '0 auto',
    objectFit: 'contain',
    opacity: '0',
    transition: 'opacity 0.8s ease'
  });
  wrapper.innerHTML = '';
  wrapper.appendChild(img);

  // ---- overlay ----
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.65)',
    color: '#fff',
    padding: '6px 12px',
    fontSize: '14px',
    borderRadius: '4px',
    maxWidth: '90%',
    textAlign: 'center',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.5s ease'
  });
  container.style.position = 'relative';
  container.appendChild(overlay);

  function availableHeight() {
    return window.innerHeight
      - (header?.offsetHeight || 0)
      - (footer?.offsetHeight || 0)
      - 40;
  }

  function resize() {
    if (!img.naturalWidth) return;

    const maxH = availableHeight();
    const maxW = container.clientWidth;
    const ratio = img.naturalWidth / img.naturalHeight;

    let w = maxW;
    let h = w / ratio;

    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
  }

  function show(i) {
    if (!data.length) return;
    index = (i + data.length) % data.length;

    img.style.opacity = '0';

    const entry = data[index];
    const src = `${IMAGE_PATH}${entry.id}.png`;

    img.onload = () => {
      resize();
      requestAnimationFrame(() => {
        img.style.opacity = '1';
        overlay.style.opacity = '1';
      });
    };
    img.src = src;

    overlay.innerHTML = `
      ${entry.caption ? `<strong>${entry.caption}</strong>` : ''}
      ${entry.credit ? `<div style="font-size:12px;opacity:.8">${entry.credit}</div>` : ''}
    `;
    overlay.style.opacity = '0';
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  function startSlideshow() {
    stopSlideshow();
    timer = setInterval(() => {
      if (!paused) next();
    }, INTERVAL);
  }

  function stopSlideshow() {
    if (timer) clearInterval(timer);
  }

  // ---- Button events ----
  prevBtn.onclick = () => { stopSlideshow(); prev(); startSlideshow(); };
  nextBtn.onclick = () => { stopSlideshow(); next(); startSlideshow(); };

  // ---- Hover pause ----
  container.addEventListener('mouseenter', () => paused = true);
  container.addEventListener('mouseleave', () => paused = false);

  window.addEventListener('resize', resize);

  // ---- Load gallery ----
  fetch(DATA_URL)
    .then(r => r.json())
    .then(json => {
      data = json;
      show(0);
      startSlideshow();
    })
    .catch(err => {
      console.error(err);
      wrapper.innerHTML = '<p style="color:red">Gallery failed to load.</p>';
    });
});
