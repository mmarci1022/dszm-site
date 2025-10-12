// Slider with lazy-loading of images
(function () {

  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const clickableAreas = document.querySelectorAll('.slider-clickable-area');
  let idx = 0;

  // No eager loading: let browser lazy-load thumbs

  const show = (n) => {
    slides.forEach((s) => s.classList.remove('active'));
    idx = (n + slides.length) % slides.length;
    const current = slides[idx];
    current.classList.add('active');
  };

  prevBtn.addEventListener('click', () => show(idx - 1));
  nextBtn.addEventListener('click', () => show(idx + 1));

  // Add click handlers for invisible areas, except center (handled by modal logic)
  clickableAreas.forEach(area => {
    if (area.classList.contains('slider-clickable-center')) return;
    area.addEventListener('click', () => {
      const action = area.dataset.slide;
      if (action === 'prev') {
        show(idx - 1);
      } else {
        show(idx + 1);
      }
    });
  });

  // initial
  show(0);


  // --- Modal image viewer logic ---
  function setupModalImageViewer() {
    // Remove click/keydown handlers from frame icons (if any)
    document.querySelectorAll('.frame-icon').forEach(function(icon) {
      const newIcon = icon.cloneNode(true);
      icon.parentNode.replaceChild(newIcon, icon);
    });

    const modal = document.getElementById('modalImgViewer');
    const modalImg = document.getElementById('modalImg');
    const modalClose = document.getElementById('modalImgClose');

    // Add modal open logic to the center helper
    const centerHelper = document.querySelector('.slider-clickable-center');
    if (centerHelper) {
      centerHelper.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Find the current active slide's image
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
          const img = activeSlide.querySelector('.card-img');
          if (img) {
            // Show loader and hide close button
            const loader = document.getElementById('modalImgLoader');
            const modalClose = document.getElementById('modalImgClose');
            if (loader) loader.style.display = 'flex';
            if (modalClose) modalClose.style.display = 'none';
            modalImg.style.display = 'none';
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            modal.focus();
            // Load full-res image
            const fullSrc = img.getAttribute('data-full') || img.src;
            // Preload image
            const tempImg = new window.Image();
            tempImg.onload = function() {
              modalImg.src = fullSrc;
              modalImg.style.display = 'block';
              if (loader) loader.style.display = 'none';
              if (modalClose) modalClose.style.display = 'flex';
            };
            tempImg.onerror = function() {
              modalImg.src = fullSrc;
              modalImg.style.display = 'block';
              if (loader) loader.style.display = 'none';
              if (modalClose) modalClose.style.display = 'flex';
            };
            tempImg.src = fullSrc;
          }
        }
      });
    }

    // Close modal on X click
    modalClose.addEventListener('click', function() {
  modal.classList.add('hidden');
  modalImg.src = '';
  modalImg.style.display = 'block';
  const loader = document.getElementById('modalImgLoader');
  if (loader) loader.style.display = 'none';
  document.body.classList.remove('modal-open');
    });

    // Close modal on background click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modalImg.src = '';
        modalImg.style.display = 'block';
        const loader = document.getElementById('modalImgLoader');
        if (loader) loader.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (!modal.classList.contains('hidden') && (e.key === 'Escape' || e.key === 'Esc')) {
        modal.classList.add('hidden');
        modalImg.src = '';
        modalImg.style.display = 'block';
        const loader = document.getElementById('modalImgLoader');
        if (loader) loader.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    });
  }

  // Wait for DOM content loaded (in case images are rendered after script)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModalImageViewer);
  } else {
    setupModalImageViewer();
  }

  // --- Contact form submission via backend API ---
  (function () {
    const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('form-status');
  const termsCheckbox = document.getElementById('terms');
  const submitBtn = document.getElementById('submitBtn');

  if (!form || !termsCheckbox || !submitBtn) return;

  // Enable submit only when terms are accepted
  termsCheckbox.addEventListener('change', function () {
    submitBtn.disabled = !this.checked;
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusEl.textContent = '';

    if (!form.reportValidity()) return;

    // Collect form data
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Disable submit during sending
    submitBtn.disabled = true;
    statusEl.style.color = '#555';
    // Use translation for sending message
    const lang = sessionStorage.getItem('lang') || 'hu';
    let translations = {};
    try {
      const resp = await fetch(`assets/lang/${lang}.json`);
      if (resp.ok) translations = await resp.json();
    } catch (e) {}
    statusEl.textContent = translations.formSending || 'Üzenet küldése folyamatban...';

    try {
      const resp = await fetch('https://your-backend.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await resp.json();

      if (data.status === 'ok') {
        statusEl.style.color = 'green';
        statusEl.textContent = translations.formSuccess || 'Üzenet sikeresen elküldve! Hamarosan felvesszük Önnel a kapcsolatot.';
        form.reset();
      } else {
        statusEl.style.color = 'red';
        statusEl.textContent = translations.formError || 'Hiba történt az üzenet küldésekor. Kérjük, próbálja újra.';
      }
    } catch (err) {
      statusEl.style.color = 'red';
      statusEl.textContent = translations.formNetworkError || 'Hálózati hiba történt. Kérjük, próbálja meg később újra.';
    } finally {
      setTimeout(() => {
        submitBtn.disabled = !termsCheckbox.checked;
      }, 1000);
    }
  });
  })();

})();
