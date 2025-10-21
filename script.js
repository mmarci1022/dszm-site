// Slider with lazy-loading of images
(function () {
  // Defensive: ensure modal starts hidden in case HTML/CSS/previous JS left it visible
  try {
    const _m = document.getElementById('modalImgViewer');
    if (_m) {
      _m.style.display = 'none';
      _m.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  } catch (e) {}
  // --- Mobile Info Section Dropdowns ---
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.dropdown-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !expanded);
        const content = btn.parentElement.querySelector('.dropdown-content');
        if (content) {
          content.classList.toggle('active', !expanded);
        }
      });
    });
  });

  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const clickableAreas = document.querySelectorAll('.slider-clickable-area');
  let idx = 0;

  const show = (n) => {
    slides.forEach((s) => s.classList.remove('active'));
    idx = (n + slides.length) % slides.length;
    const current = slides[idx];
    current.classList.add('active');
  };

  prevBtn.addEventListener('click', () => show(idx - 1));
  nextBtn.addEventListener('click', () => show(idx + 1));

  clickableAreas.forEach(area => {
    if (area.classList.contains('slider-clickable-center')) return;
    area.addEventListener('click', () => {
      const action = area.dataset.slide;
      if (action === 'prev') show(idx - 1);
      else show(idx + 1);
    });
  });

  show(0);

  // --- Modal image viewer logic ---
  let currentModalImageIndex = 0;
  const allImages = [];
  
  function getAllSlideImages() {
    allImages.length = 0; // Clear array
    document.querySelectorAll('.slide .card-img').forEach(img => {
      const fullSrc = img.getAttribute('data-full') || img.src;
      
      // Use medium-sized images on mobile for better performance
      const isMobile = window.innerWidth <= 768;
      let mobileSrc = fullSrc;
      if (isMobile) {
        // Try to use medium-sized image if available
        mobileSrc = fullSrc.replace('/img/', '/img/medium/');
      }
      
      allImages.push({
        thumb: img.src,
        full: fullSrc,
        mobile: mobileSrc,
        alt: img.getAttribute('alt') || '',
        slideIndex: parseInt(img.closest('.slide').getAttribute('data-index'))
      });
    });
  }

  function showModalImage(index) {
    if (index < 0 || index >= allImages.length) return;

    const modal = document.getElementById('modalImgViewer');
    const modalImg = document.getElementById('modalImg');
    const placeholder = document.querySelector('.modal-img-placeholder');

    currentModalImageIndex = index;

    // Show loader overlay on placeholder immediately
    if (placeholder) {
      placeholder.classList.remove('loaded');
      placeholder.classList.add('loading');
    }

    const imageData = allImages[index];
    const isMobile = window.innerWidth <= 768;
    const imageSrc = isMobile ? (imageData.mobile || imageData.full) : imageData.full;

    // Ensure modal is visible
    try {
      if (modal && modal.classList.contains('hidden')) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
      }
    } catch (e) {}

    // show loading box in modal content
    const modalContent = document.querySelector('.modal-img-content');
    if (modalContent) {
      modalContent.classList.add('loading');

      // Move the single close button into the loading box so it pins to the 16:9 ghost box
      try {
        const loadingBox = modalContent.querySelector('.modal-loading-box');
        const placeholderEl = modalContent.querySelector('.modal-img-placeholder');
        const closeBtn = document.getElementById('modalImgClose');
        if (loadingBox && closeBtn && placeholderEl && placeholderEl.contains(closeBtn)) {
          loadingBox.appendChild(closeBtn);
        }
      } catch (e) { /* ignore */ }
    }

    // Sync hero slider so the card follows the modal viewer
    try { show(imageData.slideIndex); } catch (e) {}

    // Remove previous handlers to avoid double callbacks
    modalImg.onload = null;
    modalImg.onerror = null;

    // Assign new handlers
    modalImg.onload = function() {
      if (placeholder) {
        placeholder.classList.remove('loading');
        placeholder.classList.add('loaded');
      }
      if (modalContent) {
        modalContent.classList.remove('loading');
      }
      // clear any inline positioning so CSS default takes over
      try { const closeBtn = document.getElementById('modalImgClose'); if (closeBtn) { closeBtn.style.top = ''; closeBtn.style.right = ''; } } catch (e) {}
      // Move close button back into placeholder so it pins to the image corner
      try {
        const placeholderEl = document.querySelector('.modal-img-placeholder');
        const closeBtn = document.getElementById('modalImgClose');
        if (placeholderEl && closeBtn && !placeholderEl.contains(closeBtn)) {
          placeholderEl.appendChild(closeBtn);
        }
      } catch (e) { /* ignore */ }
    };

    modalImg.onerror = function() {
      if (placeholder) {
        placeholder.classList.remove('loading');
        placeholder.classList.remove('loaded');
      }
      if (modalContent) modalContent.classList.remove('loading');
      try { const closeBtn = document.getElementById('modalImgClose'); if (closeBtn) { closeBtn.style.top = ''; closeBtn.style.right = ''; } } catch (e) {}
      // Ensure close button is back in placeholder on error
      try {
        const placeholderEl = document.querySelector('.modal-img-placeholder');
        const closeBtn = document.getElementById('modalImgClose');
        if (placeholderEl && closeBtn && !placeholderEl.contains(closeBtn)) {
          placeholderEl.appendChild(closeBtn);
        }
      } catch (e) { /* ignore */ }
    };

    // Start loading into the DOM image directly (no temp preload/resize logic)
    modalImg.src = imageSrc;
    modalImg.alt = imageData.alt || '';
  }

  function setupModalImageViewer() {
    getAllSlideImages();
    
    // Remove old event listeners by cloning frame icons
    document.querySelectorAll('.frame-icon').forEach(function(icon) {
      const newIcon = icon.cloneNode(true);
      icon.parentNode.replaceChild(newIcon, icon);
    });

    const modal = document.getElementById('modalImgViewer');
    const modalImg = document.getElementById('modalImg');
    const modalClose = document.getElementById('modalImgClose');
    const modalNavPrev = document.getElementById('modalNavPrev');
    const modalNavNext = document.getElementById('modalNavNext');

    // Helper to open modal with scrollbar compensation
    function openModal() {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + 'px';
      // make modal visible explicitly to avoid CSS conflicts
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }

    // Add frame-icon click handlers
    document.querySelectorAll('.frame-icon').forEach(function(icon) {
      icon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const slide = icon.closest('.slide');
        if (slide) {
          const slideIndex = parseInt(slide.getAttribute('data-index'));
          const imageIndex = allImages.findIndex(img => img.slideIndex === slideIndex);
          if (imageIndex !== -1) {
            openModal();
            showModalImage(imageIndex);
          }
        }
      });
    });

    // Center clickable area for backward compatibility
    const centerHelper = document.querySelector('.slider-clickable-center');
    if (centerHelper) {
      centerHelper.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
          const slideIndex = parseInt(activeSlide.getAttribute('data-index'));
          const imageIndex = allImages.findIndex(img => img.slideIndex === slideIndex);
          if (imageIndex !== -1) {
            openModal();
            showModalImage(imageIndex);
          }
        }
      });
    }

    // Modal navigation
    function nextModalImage() {
      showModalImage((currentModalImageIndex + 1) % allImages.length);
    }

    function prevModalImage() {
      showModalImage((currentModalImageIndex - 1 + allImages.length) % allImages.length);
    }

    // Navigation button event listeners
    if (modalNavNext) {
      modalNavNext.addEventListener('click', function(e) {
        e.stopPropagation();
        nextModalImage();
      });
    }

    if (modalNavPrev) {
      modalNavPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        prevModalImage();
      });
    }

    // Close modal
    function closeModal() {
      // hide modal explicitly and cleanup
      modal.style.display = 'none';
      modal.classList.add('hidden');
      modalImg.src = '';
      // reset placeholder state
      try {
        const ph = document.querySelector('.modal-img-placeholder');
        if (ph) { ph.classList.remove('loading'); ph.classList.remove('loaded'); }
      } catch (e) {}
      document.body.classList.remove('modal-open');
      // Remove padding compensation
      document.body.style.paddingRight = '';
    }

    modalClose.addEventListener('click', closeModal);
  // close button is inside the placeholder and handled below

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!modal.classList.contains('hidden')) {
        if (e.key === 'Escape' || e.key === 'Esc') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevModalImage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextModalImage();
        }
      }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });

    modal.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        nextModalImage(); // Swipe left = next
      } else if (touchEndX - touchStartX > swipeThreshold) {
        prevModalImage(); // Swipe right = previous
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModalImageViewer);
  } else {
    setupModalImageViewer();
  }

  // Rebuild image index on resize so mobile/full selections are accurate
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      try { getAllSlideImages(); } catch (e) {}
    }, 250);
  });

  // --- Contact form logic (with double protection) ---
  (function () {
    if (window.__formInit) return; // prevent double init
    window.__formInit = true;

    const form = document.getElementById('contactForm');
    const statusEl = document.getElementById('form-status');
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = document.getElementById('submitBtn');

    if (!form || !termsCheckbox || !submitBtn) return;

    termsCheckbox.addEventListener('change', function () {
      submitBtn.disabled = !this.checked;
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      statusEl.textContent = '';

      if (!form.reportValidity()) return;

      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      submitBtn.disabled = true;
      statusEl.style.color = '#555';

      const lang = sessionStorage.getItem('lang') || 'hu';
      let translations = {};
      try {
        const resp = await fetch(`assets/lang/${lang}.json`);
        if (resp.ok) translations = await resp.json();
      } catch (e) {}

      // Update button text and status with correct language
      submitBtn.textContent = translations.formSending || 'Küldés folyamatban...';
      statusEl.textContent = translations.formSending || 'Üzenet küldése folyamatban...';

      try {
        const payload = { name, email, message };
        console.debug('[Contact] Sending payload to backend:', payload);
        const resp = await fetch('https://dszm-backend.onrender.com/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.debug('[Contact] Response status:', resp.status, resp.statusText);
        let data;
        try {
          data = await resp.json();
          console.debug('[Contact] Response JSON:', data);
        } catch (parseErr) {
          const text = await resp.text();
          console.warn('[Contact] Response not JSON, raw text:', text);
          data = { status: 'error', raw: text };
        }

        if (data.status === 'ok') {
          statusEl.style.color = 'green';
          statusEl.textContent = translations.formSuccess || 'Üzenet sikeresen elküldve! Hamarosan felvesszük Önnel a kapcsolatot.';
          form.reset();
        } else {
          console.warn('[Contact] Backend returned non-ok status:', data);
          statusEl.style.color = 'red';
          statusEl.textContent = translations.formError || 'Hiba történt az üzenet küldésekor. Kérjük, próbálja újra.';
        }
      } catch (err) {
        console.error('[Contact] Network or JS error while sending:', err);
        statusEl.style.color = 'red';
        statusEl.textContent = translations.formNetworkError || 'Hálózati hiba történt. Kérjük, próbálja meg később újra.';
      } finally {
        setTimeout(() => {
          submitBtn.disabled = !termsCheckbox.checked;
          submitBtn.textContent = translations.formSubmit || 'Beküldés';
        }, 1000);
      }
    });
  })();

  // --- Backend ping + soft retry ---
  async function pingBackend(retryCount = 0) {
    try {
      const resp = await fetch('https://dszm-backend.onrender.com/ping');
      if (resp.ok) {
        console.log(`[Ping] Backend alive ✅ (status: ${resp.status})`);
        return;
      }
      console.warn(`[Ping] Backend responded with status ${resp.status}`);
    } catch (err) {
      console.error('[Ping] Network error:', err);
    }

    if (retryCount < 3) {
      console.log(`[Ping] Retrying in 30s... (${retryCount + 1}/3)`);
      setTimeout(() => pingBackend(retryCount + 1), 30000);
    }
  }

  // First ping + 10 min interval
  pingBackend();
  setInterval(pingBackend, 10 * 60 * 1000);

  // --- Hamburger menu toggle (fixed + smooth) ---
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('active');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('active');
    });
  });
});


})();