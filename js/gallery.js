document.addEventListener('DOMContentLoaded', () => {
  const GALLERY_JSON_URL = 'data/gallery.json';
  const SLIDE_INTERVAL = 5000; // 5 seconds

  let currentIndex = 0;
  let images = [];
  let captions = [];
  let credits = [];
  let slideshowTimer;

  const container = document.getElementById('carouselContainer');
  const wrapper = document.getElementById('carouselWrapper');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  // Overlay for caption + credit
  let overlay = document.getElementById('creditsOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'creditsOverlay';
    Object.assign(overlay.style, {
      position: 'absolute',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: '5px 10px',
      fontSize: '14px',
      textAlign: 'center',
      maxWidth: '90%',
      borderRadius: '4px',
      boxSizing: 'border-box',
      opacity: '0',
      transition: 'opacity 0.5s ease'
    });
    container.style.position = 'relative'; // ensure overlay positions correctly
    container.appendChild(overlay);
  }

  // Style wrapper to center images
  Object.assign(wrapper.style, {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
  });

  function updateButtons() {
    prevBtn.style.backgroundColor = currentIndex === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.5)';
    nextBtn.style.backgroundColor = currentIndex === images.length - 1 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.5)';
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === images.length - 1;
  }

  function resizeImage(img) {
    const availableHeight = window.innerHeight -
      (header ? header.offsetHeight : 0) -
      (footer ? footer.offsetHeight : 0) - 40; // padding
    const availableWidth = container.clientWidth;

    const aspect = img.naturalWidth / img.naturalHeight;

    let width = availableWidth;
    let height = width / aspect;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspect;
    }

    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
  }

  function showImage(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;

    images.forEach((img, i) => {
      if (i === currentIndex) {
        img.style.display = 'block';
        img.style.opacity = '0';
        resizeImage(img);
        requestAnimationFrame(() => {
          img.style.transition = 'opacity 1s ease';
          img.style.opacity = '1';
        });
      } else {
        img.style.transition = 'opacity 0.5s ease';
        img.style.opacity = '0';
        setTimeout(() => { img.style.display = 'none'; }, 500);
      }
    });

    // Show overlay
    const captionText = captions[currentIndex] ? `<strong>${captions[currentIndex]}</strong>` : '';
    const creditText = credits[currentIndex] ? `<span>${credits[currentIndex]}</span>` : '';
    overlay.innerHTML = `${captionText}${captionText && creditText ? ' - ' : ''}${creditText}`;
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.opacity = '1'; }, 200);

    updateButtons();
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % images.length;
    showImage(nextIndex);
  }

  function startSlideshow() {
    slideshowTimer = setInterval(nextSlide, SLIDE_INTERVAL);
  }

  function stopSlideshow() {
    clearInterval(slideshowTimer);
  }

  prevBtn.onclick = () => { stopSlideshow(); showImage(currentIndex - 1); startSlideshow(); };
  nextBtn.onclick = () => { stopSlideshow(); showImage(currentIndex + 1); startSlideshow(); };
  window.addEventListener('resize', () => showImage(currentIndex));

  // Load gallery
  fetch(GALLERY_JSON_URL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!data || data.length === 0) {
        wrapper.innerHTML = '<p>No images available.</p>';
        return;
      }

      data.forEach(imgData => {
        const img = document.createElement('img');
        img.src = `assets/gallery/gallery-${imgData.id}.png`;
        img.alt = imgData.caption || 'Gallery Image';
        img.style.display = 'none';
        img.style.objectFit = 'contain';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        wrapper.appendChild(img);
        images.push(img);

        captions.push(imgData.caption || '');
        credits.push(imgData.credit || '');
      });

      showImage(0);
      startSlideshow();
    })
    .catch(err => {
      console.error('Error loading gallery:', err);
      wrapper.innerHTML = '<p>Error loading gallery.</p>';
    });
});
