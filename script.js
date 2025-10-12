// Slider with lazy-loading of images
(function () {

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
      if (action === 'prev') {
        show(idx - 1);
      } else {
        show(idx + 1);
      }
    });
  });

  show(0);

  // --- Modal image viewer logic ---
  function setupModalImageViewer() {
    document.querySelectorAll('.frame-icon').forEach(function(icon) {
      const newIcon = icon.cloneNode(true);
      icon.parentNode.replaceChild(newIcon, icon);
    });

    const modal = document.getElementById('modalImgViewer');
    const modalImg = document.getElementById('modalImg');
    const modalClose = document.getElementById('modalImgClose');

    const centerHelper = document.querySelector('.slider-clickable-center');
    if (centerHelper) {
      centerHelper.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
          const img = activeSlide.querySelector('.card-img');
          if (img) {
            const loader = document.getElementById('modalImgLoader');
            const modalClose = document.getElementById('modalImgClose');
            if (loader) loader.style.display = 'flex';
            if (modalClose) modalClose.style.display = 'none';
            modalImg.style.display = 'none';
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            modal.focus();
            const fullSrc = img.getAttribute('data-full') || img.src;
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

    modalClose.addEventListener('click', function() {
  modal.classList.add('hidden');
  modalImg.src = '';
  modalImg.style.display = 'block';
  const loader = document.getElementById('modalImgLoader');
  if (loader) loader.style.display = 'none';
  document.body.classList.remove('modal-open');
    });

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModalImageViewer);
  } else {
    setupModalImageViewer();
  }

  (function () {
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
    statusEl.textContent = translations.formSending || 'Üzenet küldése folyamatban...';

    try {
      const resp = await fetch('https://dszm-email-backend.onrender.com/send', {
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
