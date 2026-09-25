/**
 * 7LITE MUSIC — OFFICIAL CLIENT CORE (ES6+)
 * Engineering, Zero Latency & Street Audio Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.initLanguageEngine) initLanguageEngine();
  initInteractiveAudioCanvas();
  initTextScramble();
  initTiltAndSpotlight();
  initUISoundFX();
  initLaserHUDCursor();
  initMobileMenu();
  initScrollSpy();
  initSmoothScroll();
  initWhatsAppHandlers();
  initContactForm();
  initCustomDropdowns();
  initLicenseCompareModal();
  initLegalModal();
  initBackToTop();
});

/* ==========================================================================
   1. INTERACTIVE AUDIO WAVE CANVAS (Cyber-Mesh Dynamic Background)
   ========================================================================== */
function initInteractiveAudioCanvas() {
  const canvas = document.getElementById('audio-bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;
  let animationFrameId;
  let isVisible = true;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }, { passive: true });

  // Handle visibility to save battery/CPU when tab is inactive
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible) render();
  });

  let step = 0;
  const waves = [
    { freq: 0.003, speed: 0.015, amp: 55, color: 'rgba(0, 191, 255, 0.45)', width: 2 },   // Flow (Celeste)
    { freq: 0.004, speed: 0.02, amp: 40, color: 'rgba(78, 255, 174, 0.4)', width: 1.5 },   // Vibes (Neon Green)
    { freq: 0.0025, speed: 0.012, amp: 65, color: 'rgba(78, 0, 255, 0.35)', width: 2.5 }   // Waves (Purple)
  ];

  function render() {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    // Smooth mouse inertia
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    step += 1;

    // Draw flowing multi-frequency sound strands
    waves.forEach((w, index) => {
      ctx.beginPath();
      ctx.lineWidth = w.width;
      ctx.strokeStyle = w.color;

      const mouseInfluenceY = ((mouseY / height) - 0.5) * 60;
      const mouseInfluenceX = ((mouseX / width) - 0.5) * 40;
      const baseVerticalPos = height * (0.35 + index * 0.15) + mouseInfluenceY;

      for (let x = 0; x <= width; x += 12) {
        // Multi-harmonic sine equation simulating studio frequency response
        const distToMouse = Math.abs(x - mouseX);
        const waveDamp = Math.max(0, 1 - distToMouse / (width * 0.4));
        const mouseDip = Math.sin((x + mouseX) * 0.01) * waveDamp * 30;

        const y = baseVerticalPos + 
                  Math.sin(x * w.freq + step * w.speed + mouseInfluenceX * 0.02) * (w.amp + waveDamp * 20) +
                  Math.cos(x * (w.freq * 0.6) - step * (w.speed * 0.8)) * 18 +
                  mouseDip;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Ambient audio particle nodes on the wave
      const particleX = (step * (1.5 + index * 0.5)) % width;
      const particleY = baseVerticalPos + Math.sin(particleX * w.freq + step * w.speed) * w.amp;
      ctx.fillStyle = w.color.replace('0.4', '0.9').replace('0.35', '0.9');
      ctx.beginPath();
      ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. TERMINAL / HACKER SCRAMBLE TEXT EFFECT
   ========================================================================== */
function initTextScramble() {
  const chars = '!<>-_\\/[]{}—=+*^?#_017X';
  const scrambleElements = document.querySelectorAll('.text-scramble');

  scrambleElements.forEach(el => {
    const originalText = el.getAttribute('data-original-text') || el.innerText;
    el.setAttribute('data-original-text', originalText);
    
    let frame = 0;
    let queue = [];

    function setupQueue() {
      queue = [];
      for (let i = 0; i < originalText.length; i++) {
        const from = '';
        const to = originalText[i];
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 25);
        queue.push({ from, to, start, end, char: '' });
      }
    }

    function update() {
      let output = '';
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        let { to, start, end, char } = queue[i];
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = chars[Math.floor(Math.random() * chars.length)];
            queue[i].char = char;
          }
          output += `<span class="text-flow font-mono opacity-80">${char}</span>`;
        } else {
          output += '';
        }
      }

      el.innerHTML = output;

      if (complete === queue.length) {
        el.innerText = originalText;
      } else {
        frame++;
        requestAnimationFrame(update);
      }
    }

    // Trigger on load
    setupQueue();
    update();

    // Re-trigger subtly on hover
    el.addEventListener('mouseenter', () => {
      frame = 0;
      setupQueue();
      update();
    });
  });
}

/* ==========================================================================
   3. 3D TILT EFFECT & MOUSE SPOTLIGHT (Holographic Cards)
   ========================================================================== */
function initTiltAndSpotlight() {
  const tiltCards = document.querySelectorAll('.card-tilt');
  if (!tiltCards.length) return;

  // Check if touch device - avoid 3D tilt on mobile for performance
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  tiltCards.forEach(card => {
    // Inject spotlight overlay if missing
    if (!card.querySelector('.spotlight-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'spotlight-overlay';
      card.appendChild(overlay);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update spotlight position CSS variables
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate 3D tilt angles (max +/- 7 degrees for refined feel)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   5. NAVIGATION & UTILITIES
   ========================================================================== */

/**
 * Mobile Navigation Menu Handler
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  function toggleMenu(isOpen) {
    const shouldOpen = isOpen !== undefined ? isOpen : mobileMenu.classList.contains('hidden');
    
    if (shouldOpen) {
      mobileMenu.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuIconOpen?.classList.add('hidden');
      menuIconClose?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuIconOpen?.classList.remove('hidden');
      menuIconClose?.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', () => toggleMenu());

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMenu(false);
    }
  });
}

/**
 * Smooth Scroll with Navbar Offset
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const navHeight = 80;

  links.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        history.pushState(null, null, targetId);
      }
    });
  });
}

/**
 * Active Navigation Link Scroll Spy
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link-desktop');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').substring(1);
          if (href === currentId) {
            link.classList.add('text-white', 'border-b-2', 'border-accent-flow');
            link.classList.remove('text-[#888888]');
          } else {
            link.classList.remove('text-white', 'border-b-2', 'border-accent-flow');
            link.classList.add('text-[#888888]');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * Direct WhatsApp Link & Interaction Generator
 */
function initWhatsAppHandlers() {
  const phoneNumber = '50498700953';

  window.open7liteWhatsApp = function(customText) {
    const t = (window.translations && window.currentLanguage) ? window.translations[window.currentLanguage] : null;
    const defaultText = (t && t.wa_default_msg) ? t.wa_default_msg : "Hi 7lite Music, I'd like to inquire about beats and music production projects.";
    const textToSend = encodeURIComponent(customText || defaultText);
    const waUrl = `https://wa.me/${phoneNumber}?text=${textToSend}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const exclusiveButtons = document.querySelectorAll('.btn-exclusive-wa');
  exclusiveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const t = (window.translations && window.currentLanguage) ? window.translations[window.currentLanguage] : null;
      const msg = (t && t.wa_exclusive_msg) ? t.wa_exclusive_msg : "Hi 7lite Music, I'm interested in negotiating Exclusive Rights. Could we coordinate the details?";
      window.open7liteWhatsApp(msg);
    });
  });
}

/**
 * Sleek Minimalist Notification Toast
 */
function showAudioToast(message) {
  let toast = document.getElementById('audio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'audio-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1F1F1F] border border-[#333333] text-white px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-20 opacity-0 pointer-events-none max-w-md';
    toast.innerHTML = `
      <div class="w-3 h-3 rounded-full bg-[#00BFFF] animate-ping flex-shrink-0"></div>
      <p class="text-xs sm:text-sm font-medium text-neutral-200" id="toast-text"></p>
    `;
    document.body.appendChild(toast);
  }

  const toastText = document.getElementById('toast-text');
  if (toastText) toastText.textContent = message;

  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 4500);
}

/**
 * Back to Top Button Handler
 */
function initBackToTop() {
  const bttBtn = document.getElementById('back-to-top-btn');
  if (!bttBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      bttBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      bttBtn.classList.add('opacity-100', 'translate-y-0');
    } else {
      bttBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      bttBtn.classList.remove('opacity-100', 'translate-y-0');
    }
  });

  bttBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Formspree Contact Form Asynchronous Handler
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusBox = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit-btn');
  const submitBtnText = document.getElementById('submit-btn-text');

  if (!form || !submitBtn || !submitBtnText) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const t = (window.translations && window.currentLanguage) ? window.translations[window.currentLanguage] : null;
    const originalText = submitBtnText.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    submitBtnText.textContent = (t && t.contact_transmitting) ? t.contact_transmitting : 'Transmitting package...';

    if (statusBox) {
      statusBox.className = 'hidden text-xs font-mono px-4 py-2.5 rounded-lg border';
      statusBox.innerHTML = '';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        form.reset();
        submitBtnText.textContent = (t && t.contact_success_btn) ? t.contact_success_btn : 'Successfully Transmitted!';
        
        if (statusBox) {
          statusBox.className = 'block text-xs font-mono px-4 py-2.5 rounded-lg border border-[#4EFFAE]/30 bg-[#4EFFAE]/10 text-[#4EFFAE]';
          statusBox.innerHTML = (t && t.contact_success_msg) ? t.contact_success_msg : '✓ <strong>Transmission received:</strong> We will contact you as soon as possible.';
        }

        showAudioToast((t && t.contact_toast_success) ? t.contact_toast_success : 'Transmission successful: Your message was sent to 7lite Music.');

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
          submitBtnText.textContent = originalText;
        }, 4000);
      } else {
        const data = await response.json();
        const errorMessage = data && data.errors && data.errors.length 
          ? data.errors.map(err => err.message).join(', ') 
          : 'Error sending message.';
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      submitBtnText.textContent = originalText;

      const fallbackErr = (t && t.contact_error_msg) ? t.contact_error_msg : '✕ <strong>Notice:</strong> Connection error. You can contact us directly via WhatsApp (+504 9870-0953).';
      if (statusBox) {
        statusBox.className = 'block text-xs font-mono px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400';
        statusBox.innerHTML = err.message && err.message !== 'Failed to fetch' ? `✕ <strong>Notice:</strong> ${err.message}` : fallbackErr;
      }

      showAudioToast((t && t.contact_toast_error) ? t.contact_toast_error : 'Transmission error. Please reach out via WhatsApp or direct email.');
    }
  });
}

/* ==========================================================================
   2. ANALOG STUDIO UI MICRO-SOUNDS ENGINE (Web Audio API)
   ========================================================================== */
let uiAudioCtx = null;
let uiSoundEnabled = true;

function initUISoundFX() {
  const toggleBtn = document.getElementById('ui-sound-toggle');
  const led = document.getElementById('ui-sound-led');
  const label = document.getElementById('ui-sound-label');

  // Check persisted preference
  const savedPref = localStorage.getItem('7lite_sfx_enabled');
  if (savedPref !== null) {
    uiSoundEnabled = savedPref === 'true';
  }

  function updateToggleUI() {
    if (!led || !label) return;
    const t = (window.translations && window.currentLanguage) ? window.translations[window.currentLanguage] : null;
    if (uiSoundEnabled) {
      led.className = 'w-1.5 h-1.5 rounded-full bg-[#4EFFAE] animate-pulse';
      label.textContent = (t && t.nav_sfx_on) ? t.nav_sfx_on : 'SFX: ON';
    } else {
      led.className = 'w-1.5 h-1.5 rounded-full bg-[#666666]';
      label.textContent = (t && t.nav_sfx_off) ? t.nav_sfx_off : 'SFX: OFF';
    }
  }
  updateToggleUI();

  window.addEventListener('languagechange', () => {
    updateToggleUI();
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      uiSoundEnabled = !uiSoundEnabled;
      localStorage.setItem('7lite_sfx_enabled', uiSoundEnabled.toString());
      updateToggleUI();
      if (uiSoundEnabled) {
        playAnalogClick(900, 0.03, 0.05);
      }
    });
  }

  // Play subtle click on interactive clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, input[type="range"]');
    if (target && target.id !== 'ui-sound-toggle') {
      playAnalogClick(1200, 0.02, 0.03);
    }
  }, { passive: true });
}

function playAnalogClick(freq = 1100, duration = 0.025, vol = 0.035) {
  if (!uiSoundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!uiAudioCtx) uiAudioCtx = new AudioContextClass();
    if (uiAudioCtx.state === 'suspended') uiAudioCtx.resume();

    const osc = uiAudioCtx.createOscillator();
    const gain = uiAudioCtx.createGain();
    const filter = uiAudioCtx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(450, uiAudioCtx.currentTime);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, uiAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, uiAudioCtx.currentTime + duration);

    gain.gain.setValueAtTime(vol, uiAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, uiAudioCtx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(uiAudioCtx.destination);

    osc.start();
    osc.stop(uiAudioCtx.currentTime + duration);
  } catch (err) {
    // Ignore autoplay restriction errors
  }
}

/* ==========================================================================
   3. CYBERNETIC LASER HUD AUDIO CURSOR
   ========================================================================== */
function initLaserHUDCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.remove('has-custom-cursor');
    return;
  }

  const cursor = document.getElementById('hud-cursor');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.classList.add('visible');
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    isVisible = false;
  });

  // Smooth lerp loop
  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.28;
    cursorY += (mouseY - cursorY) * 0.28;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Click Sonic Ripple
  window.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'hud-sonic-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);

    cursor.classList.add('clicking');
    setTimeout(() => cursor.classList.remove('clicking'), 150);
  });

  // Hover reaction over interactive targets
  const interactiveSelectors = 'a, button, input, select, textarea, .card-tilt, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('hovering');
    }
  }, { passive: true });
}

/**
 * Modern Custom Dropdowns & Accordion Interactions
 */
function initCustomDropdowns() {
  // 1. Custom Contact Project Select Dropdown
  const wrapper = document.getElementById('project-select-wrapper');
  const trigger = document.getElementById('custom-select-trigger');
  const menu = document.getElementById('custom-select-menu');
  const hiddenInput = document.getElementById('contact-project-input');
  const labelDot = document.getElementById('selected-option-dot');
  const labelText = document.getElementById('selected-option-text');
  const options = document.querySelectorAll('.custom-option');

  if (wrapper && trigger && menu && hiddenInput) {
    function openMenu() {
      menu.classList.add('is-active');
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.classList.remove('is-active');
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = menu.classList.contains('is-active');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.getAttribute('data-value');
        const localizedText = opt.querySelector('[data-i18n]')?.textContent || opt.getAttribute('data-label') || value;
        const dotColor = opt.getAttribute('data-dot') || '#00BFFF';

        hiddenInput.value = value;
        if (labelText) labelText.textContent = localizedText;
        if (labelDot) labelDot.style.backgroundColor = dotColor;

        options.forEach(o => {
          o.classList.remove('is-selected');
          const check = o.querySelector('.option-check');
          if (check) check.classList.add('hidden');
        });

        opt.classList.add('is-selected');
        const activeCheck = opt.querySelector('.option-check');
        if (activeCheck) activeCheck.classList.remove('hidden');

        closeMenu();
        if (typeof playAnalogClick === 'function') {
          playAnalogClick(1100, 0.02, 0.035);
        }
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-active')) {
        closeMenu();
      }
    });
  }

  // 2. Modern FAQ Accordion Behavior (Exclusive expansion)
  const faqItems = document.querySelectorAll('.faq-accordion');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        if (typeof playAnalogClick === 'function') {
          playAnalogClick(950, 0.025, 0.03);
        }
        // Auto-close other items for clean single-view accordion
        faqItems.forEach(other => {
          if (other !== item && other.open) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });
}

/**
 * Fullscreen Interactive License Comparison Modal
 */
function initLicenseCompareModal() {
  const modal = document.getElementById('license-compare-modal');
  const openMainBtn = document.getElementById('btn-open-compare-modal');
  const closeBtn = document.getElementById('btn-close-compare-modal');
  const triggerBtns = document.querySelectorAll('.btn-trigger-compare');
  const ctaCloseBtns = document.querySelectorAll('.modal-cta-close');

  if (!modal) return;

  function openModal() {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden');
    if (typeof playAnalogClick === 'function') {
      playAnalogClick(1200, 0.03, 0.04);
    }
  }

  function closeModal() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
    if (typeof playAnalogClick === 'function') {
      playAnalogClick(800, 0.02, 0.03);
    }
  }

  if (openMainBtn) {
    openMainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Close when clicking directly on backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('pointer-events-none')) {
      closeModal();
    }
  });

  // Close when clicking action button inside table
  ctaCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
    });
  });
}

/**
 * Interactive Legal Documentation & Policies Modal
 */
function initLegalModal() {
  const modal = document.getElementById('legal-modal');
  const closeBtn = document.getElementById('btn-close-legal-modal');
  const openBtns = document.querySelectorAll('.btn-open-legal');
  const tabBtns = document.querySelectorAll('.legal-tab-btn');
  const tabPanels = document.querySelectorAll('.legal-tab-panel');

  if (!modal) return;

  function switchTab(targetTab) {
    tabBtns.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === targetTab;
      if (isTarget) {
        btn.className = 'legal-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-[#00BFFF] text-black shadow-sm';
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.className = 'legal-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all bg-[#222222] text-[#888888] hover:text-white';
        btn.setAttribute('aria-selected', 'false');
      }
    });

    tabPanels.forEach(panel => {
      if (panel.id === `panel-${targetTab}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    if (typeof playAnalogClick === 'function') {
      playAnalogClick(1100, 0.02, 0.03);
    }
  }

  function openModal(defaultTab = 'privacy') {
    switchTab(defaultTab);
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden');
    if (typeof playAnalogClick === 'function') {
      playAnalogClick(1200, 0.03, 0.04);
    }
  }

  function closeModal() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
    if (typeof playAnalogClick === 'function') {
      playAnalogClick(800, 0.02, 0.03);
    }
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab') || 'privacy';
      openModal(tab);
    });
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('pointer-events-none')) {
      closeModal();
    }
  });
}
