/**
 * 7LITE MUSIC — OFFICIAL CLIENT CORE (ES6+)
 * Engineering, Zero Latency & Street Audio Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  initInteractiveAudioCanvas();
  initTextScramble();
  initTiltAndSpotlight();
  initWebAudioPreviews();
  initUISoundFX();
  initLaserHUDCursor();
  initStudioStemsMixer();
  initTapTempo();
  initMobileMenu();
  initScrollSpy();
  initSmoothScroll();
  initWhatsAppHandlers();
  initChannelDirectNav();
  initContactForm();
  initCustomDropdowns();
  initLicenseCompareModal();
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
   4. WEB AUDIO SYNTHESIZED SOUND BITES (Instant Live Previews)
   ========================================================================== */
function initWebAudioPreviews() {
  let audioCtx = null;
  let activeChannel = null;
  let loopInterval = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, startTime, vol = 0.2) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function playSub808(startFreq, endFreq, duration, startTime, vol = 0.4) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function triggerVibesPattern() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Smooth R&B lush chords + soft sub
    playTone(261.63, 'sine', 0.8, now, 0.15); // C4
    playTone(329.63, 'sine', 0.8, now, 0.12); // E4
    playTone(392.00, 'triangle', 0.8, now, 0.1); // G4
    playSub808(80, 40, 1.2, now + 0.1, 0.25);
  }

  function triggerFlowPattern() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Aggressive Trap/Drill sliding 808 sub + metallic hi-hat
    playSub808(140, 38, 0.9, now, 0.4);
    // Hi-hat triplet clicks
    playTone(1200, 'square', 0.04, now, 0.04);
    playTone(1200, 'square', 0.04, now + 0.15, 0.04);
    playTone(1200, 'square', 0.04, now + 0.3, 0.04);
    playTone(1200, 'square', 0.04, now + 0.45, 0.06);
  }

  function triggerWavesPattern() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Bouncing Dembow rhythm (Kick, snare syncopation, modern pluck)
    playSub808(100, 50, 0.3, now, 0.35); // Kick
    playTone(440, 'triangle', 0.2, now + 0.18, 0.15); // Snare snap
    playTone(523.25, 'sine', 0.25, now + 0.36, 0.12); // Pluck
  }

  const previewButtons = document.querySelectorAll('.btn-audio-preview');

  previewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const channel = btn.getAttribute('data-preview-channel');
      const card = btn.closest('article');

      // If already playing this channel, stop it
      if (activeChannel === channel) {
        stopAudioPreview();
        return;
      }

      // Stop previous if playing
      stopAudioPreview();

      // Start new
      activeChannel = channel;
      card?.classList.add('playing');
      btn.classList.add('bg-white', 'text-black');
      btn.querySelector('.preview-btn-label').textContent = 'Pausar Vibe';

      if (channel === 'Vibes') {
        triggerVibesPattern();
        loopInterval = setInterval(triggerVibesPattern, 1800);
      } else if (channel === 'Flow') {
        triggerFlowPattern();
        loopInterval = setInterval(triggerFlowPattern, 1200);
      } else if (channel === 'Waves') {
        triggerWavesPattern();
        loopInterval = setInterval(triggerWavesPattern, 1400);
      }
    });
  });

  function stopAudioPreview() {
    if (loopInterval) {
      clearInterval(loopInterval);
      loopInterval = null;
    }
    activeChannel = null;

    document.querySelectorAll('.card-tilt').forEach(c => c.classList.remove('playing'));
    previewButtons.forEach(btn => {
      btn.classList.remove('bg-white', 'text-black');
      const label = btn.querySelector('.preview-btn-label');
      if (label) label.textContent = 'Preview Vibe';
    });
  }

  window.stopAudioPreview = stopAudioPreview;
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
    const defaultText = 'Hola 7lite Music, me gustaría consultar sobre beats y proyectos de producción musical.';
    const textToSend = encodeURIComponent(customText || defaultText);
    const waUrl = `https://wa.me/${phoneNumber}?text=${textToSend}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const exclusiveButtons = document.querySelectorAll('.btn-exclusive-wa');
  exclusiveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const beatName = btn.getAttribute('data-beat') || 'un beat';
      const msg = `Hola 7lite Music, me interesa negociar los derechos de la Licencia Exclusiva para ${beatName}. ¿Podríamos coordinar los detalles?`;
      window.open7liteWhatsApp(msg);
    });
  });
}

/**
 * Channel Direct Filter Helper & Toast Notification
 */
function initChannelDirectNav() {
  const channelBtns = document.querySelectorAll('.btn-channel-filter');
  const beatstoreSection = document.getElementById('catalogo');

  channelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const channelName = btn.getAttribute('data-channel') || 'Vibes';
      
      if (beatstoreSection) {
        const offsetPosition = beatstoreSection.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }

      showAudioToast(`Canal ${channelName.toUpperCase()} seleccionado. Utiliza el buscador dentro del reproductor para filtrar el catálogo.`);
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

    const originalText = submitBtnText.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    submitBtnText.textContent = 'Transmitiendo paquete...';

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
        submitBtnText.textContent = '¡Transmitido con Éxito!';
        
        if (statusBox) {
          statusBox.className = 'block text-xs font-mono px-4 py-2.5 rounded-lg border border-[#4EFFAE]/30 bg-[#4EFFAE]/10 text-[#4EFFAE]';
          statusBox.innerHTML = '✓ <strong>Transmisión recibida:</strong> Nos pondremos en contacto contigo a la brevedad posible.';
        }

        showAudioToast('Transmisión exitosa: Tu mensaje ha sido enviado a 7lite Music.');

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
          submitBtnText.textContent = originalText;
        }, 4000);
      } else {
        const data = await response.json();
        const errorMessage = data && data.errors && data.errors.length 
          ? data.errors.map(err => err.message).join(', ') 
          : 'Error al enviar el formulario.';
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      submitBtnText.textContent = originalText;

      if (statusBox) {
        statusBox.className = 'block text-xs font-mono px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400';
        statusBox.innerHTML = `✕ <strong>Aviso:</strong> ${err.message || 'Error de conexión'}. Puedes contactarnos directamente por WhatsApp (+504 9870-0953).`;
      }

      showAudioToast('Error en la transmisión. Intenta vía WhatsApp o email directo.');
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
    if (uiSoundEnabled) {
      led.className = 'w-1.5 h-1.5 rounded-full bg-[#4EFFAE] animate-pulse';
      label.textContent = 'SFX: ON';
    } else {
      led.className = 'w-1.5 h-1.5 rounded-full bg-[#666666]';
      label.textContent = 'SFX: OFF';
    }
  }
  updateToggleUI();

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
    const target = e.target.closest('button, a, input[type="range"], .stem-channel-card, .mpc-pad');
    if (target && target.id !== 'ui-sound-toggle' && target.id !== 'tap-tempo-pad') {
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
  const interactiveSelectors = 'a, button, input, select, textarea, .card-tilt, .stem-channel-card, .mpc-pad, [role="button"]';
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

/* ==========================================================================
   4. INTERACTIVE 4-TRACK STEMS STUDIO CONSOLE & VU METERS
   ========================================================================== */
function initStudioStemsMixer() {
  const masterBtn = document.getElementById('stems-master-toggle');
  const playIcon = document.getElementById('stems-play-icon');
  const stopIcon = document.getElementById('stems-stop-icon');
  const playText = document.getElementById('stems-play-text');
  const resetBtn = document.getElementById('stems-reset-btn');

  if (!masterBtn) return;

  let stemsAudioCtx = null;
  let masterGain = null;
  let isPlaying = false;
  let schedulerTimer = null;
  let nextBeatTime = 0;
  let currentStep = 0;
  const bpm = 128;
  const secondsPerBeat = 60.0 / bpm;
  const stepTime = secondsPerBeat / 4; // 16th note = 0.117s

  // Tracks Configuration
  const tracks = {
    drums: {
      faderEl: document.getElementById('fader-drums'),
      meterEl: document.getElementById('vu-drums'),
      gainNode: null,
      faderVal: 0.85,
      isMuted: false,
      isSolo: false,
      level: 0
    },
    bass: {
      faderEl: document.getElementById('fader-bass'),
      meterEl: document.getElementById('vu-bass'),
      gainNode: null,
      faderVal: 0.90,
      isMuted: false,
      isSolo: false,
      level: 0
    },
    synth: {
      faderEl: document.getElementById('fader-synth'),
      meterEl: document.getElementById('vu-synth'),
      gainNode: null,
      faderVal: 0.80,
      isMuted: false,
      isSolo: false,
      level: 0
    },
    fx: {
      faderEl: document.getElementById('fader-fx'),
      meterEl: document.getElementById('vu-fx'),
      gainNode: null,
      faderVal: 0.75,
      isMuted: false,
      isSolo: false,
      level: 0
    }
  };

  function applyTrackGains() {
    const hasSolo = Object.values(tracks).some(t => t.isSolo);
    Object.keys(tracks).forEach(key => {
      const track = tracks[key];
      if (!track.gainNode || !stemsAudioCtx) return;

      let effectiveGain = 0;
      if (hasSolo) {
        effectiveGain = track.isSolo ? track.faderVal : 0;
      } else {
        effectiveGain = track.isMuted ? 0 : track.faderVal;
      }
      track.gainNode.gain.setTargetAtTime(effectiveGain, stemsAudioCtx.currentTime, 0.03);
    });
  }

  function setupAudioNodes() {
    if (!stemsAudioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      stemsAudioCtx = new AudioContextClass();
    }
    if (stemsAudioCtx.state === 'suspended') stemsAudioCtx.resume();

    if (!masterGain) {
      masterGain = stemsAudioCtx.createGain();
      masterGain.gain.setValueAtTime(0.7, stemsAudioCtx.currentTime);
      masterGain.connect(stemsAudioCtx.destination);
    }

    Object.keys(tracks).forEach(key => {
      if (!tracks[key].gainNode) {
        const gn = stemsAudioCtx.createGain();
        gn.gain.setValueAtTime(tracks[key].faderVal, stemsAudioCtx.currentTime);
        gn.connect(masterGain);
        tracks[key].gainNode = gn;
      }
    });

    applyTrackGains();
  }

  // Synthesize instruments for 16-step bar
  function scheduleStep(step, time) {
    // 1. DRUMS (16-step pattern)
    if (step % 8 === 0) { // Kick on beat 1 & 3
      triggerKick(time, tracks.drums.gainNode);
      tracks.drums.level = Math.max(tracks.drums.level, 0.95);
    }
    if (step === 4 || step === 12) { // Snare / Clap on beat 2 & 4
      triggerClap(time, tracks.drums.gainNode);
      tracks.drums.level = Math.max(tracks.drums.level, 0.85);
    }
    if (step % 2 === 0) { // 8th note hi-hat
      triggerHiHat(time, tracks.drums.gainNode, step % 4 === 2);
      tracks.drums.level = Math.max(tracks.drums.level, 0.6);
    }

    // 2. 808 SUB BASS (Glide notes)
    if (step === 0 || step === 6 || step === 10 || step === 14) {
      const notes = [43.65, 43.65, 38.89, 41.20]; // F1, F1, Eb1, E1
      const noteIdx = Math.floor(step / 4);
      trigger808(time, notes[noteIdx] || 43.65, tracks.bass.gainNode);
      tracks.bass.level = Math.max(tracks.bass.level, 0.9);
    }

    // 3. SYNTH & KEYS (Dark nocturnal progression)
    if (step % 8 === 0) {
      const chords = [
        [174.61, 220.00, 261.63], // F minor
        [164.81, 207.65, 246.94]  // E major
      ];
      const chord = chords[Math.floor((step / 8) % 2)];
      triggerSynthChord(time, chord, tracks.synth.gainNode);
      tracks.synth.level = Math.max(tracks.synth.level, 0.8);
    }

    // 4. VOCAL FX / ATMOSPHERE (Ambient swell every 16 steps)
    if (step === 12) {
      triggerVocalFX(time, tracks.fx.gainNode);
      tracks.fx.level = Math.max(tracks.fx.level, 0.75);
    }
  }

  function triggerKick(time, dest) {
    if (!dest) return;
    const osc = stemsAudioCtx.createOscillator();
    const gain = stemsAudioCtx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  function triggerClap(time, dest) {
    if (!dest) return;
    const bufferSize = stemsAudioCtx.sampleRate * 0.08;
    const buffer = stemsAudioCtx.createBuffer(1, bufferSize, stemsAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = stemsAudioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = stemsAudioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    const gain = stemsAudioCtx.createGain();
    gain.gain.setValueAtTime(0.8, time);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
  }

  function triggerHiHat(time, dest, accent = false) {
    if (!dest) return;
    const bufferSize = stemsAudioCtx.sampleRate * 0.035;
    const buffer = stemsAudioCtx.createBuffer(1, bufferSize, stemsAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = stemsAudioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = stemsAudioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    const gain = stemsAudioCtx.createGain();
    gain.gain.setValueAtTime(accent ? 0.35 : 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
  }

  function trigger808(time, freq, dest) {
    if (!dest) return;
    const osc = stemsAudioCtx.createOscillator();
    const gain = stemsAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.04);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.45);
  }

  function triggerSynthChord(time, freqs, dest) {
    if (!dest) return;
    freqs.forEach(freq => {
      const osc = stemsAudioCtx.createOscillator();
      const gain = stemsAudioCtx.createGain();
      const filter = stemsAudioCtx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, time);
      filter.frequency.exponentialRampToValueAtTime(350, time + 0.6);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.7);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.7);
    });
  }

  function triggerVocalFX(time, dest) {
    if (!dest) return;
    const osc = stemsAudioCtx.createOscillator();
    const gain = stemsAudioCtx.createGain();
    const filter = stemsAudioCtx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(750, time + 0.35);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, time);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  // Audio Loop Scheduler
  function runScheduler() {
    while (nextBeatTime < stemsAudioCtx.currentTime + 0.15) {
      scheduleStep(currentStep, nextBeatTime);
      nextBeatTime += stepTime;
      currentStep = (currentStep + 1) % 16;
    }
    schedulerTimer = setTimeout(runScheduler, 25);
  }

  function startPlayback() {
    setupAudioNodes();
    isPlaying = true;
    nextBeatTime = stemsAudioCtx.currentTime + 0.05;
    currentStep = 0;
    runScheduler();

    playIcon.classList.add('hidden');
    stopIcon.classList.remove('hidden');
    playText.textContent = 'Detener Mezcla';
    masterBtn.classList.add('ring-2', 'ring-[#00BFFF]', 'bg-[#4EFFAE]');
    masterBtn.classList.remove('bg-[#00BFFF]');
    showAudioToast('Stems Mixer iniciado: Experimenta aislando canales con Solo y Mute.');
  }

  function stopPlayback() {
    isPlaying = false;
    if (schedulerTimer) clearTimeout(schedulerTimer);
    playIcon.classList.remove('hidden');
    stopIcon.classList.add('hidden');
    playText.textContent = 'Iniciar Mezcla';
    masterBtn.classList.remove('ring-2', 'ring-[#00BFFF]', 'bg-[#4EFFAE]');
    masterBtn.classList.add('bg-[#00BFFF]');

    // Clear VU levels
    Object.keys(tracks).forEach(k => {
      tracks[k].level = 0;
      updateVUMeter(tracks[k].meterEl, 0);
    });
  }

  masterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  // Faders Event Listeners
  Object.keys(tracks).forEach(key => {
    const track = tracks[key];
    if (track.faderEl) {
      track.faderEl.addEventListener('input', (e) => {
        track.faderVal = parseFloat(e.target.value) / 100;
        applyTrackGains();
      });
    }
  });

  // Mute & Solo Buttons
  document.querySelectorAll('.stem-btn-mute').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const trackKey = btn.getAttribute('data-track');
      if (!tracks[trackKey]) return;
      tracks[trackKey].isMuted = !tracks[trackKey].isMuted;
      
      if (tracks[trackKey].isMuted) {
        btn.classList.add('bg-[#ff3b30]/20', 'border-[#ff3b30]', 'text-[#ff3b30]');
        btn.classList.remove('text-[#888888]');
      } else {
        btn.classList.remove('bg-[#ff3b30]/20', 'border-[#ff3b30]', 'text-[#ff3b30]');
        btn.classList.add('text-[#888888]');
      }
      applyTrackGains();
    });
  });

  document.querySelectorAll('.stem-btn-solo').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const trackKey = btn.getAttribute('data-track');
      if (!tracks[trackKey]) return;
      tracks[trackKey].isSolo = !tracks[trackKey].isSolo;

      if (tracks[trackKey].isSolo) {
        btn.classList.add('bg-[#ffd000]/20', 'border-[#ffd000]', 'text-[#ffd000]');
        btn.classList.remove('text-[#888888]');
      } else {
        btn.classList.remove('bg-[#ffd000]/20', 'border-[#ffd000]', 'text-[#ffd000]');
        btn.classList.add('text-[#888888]');
      }
      applyTrackGains();
    });
  });

  // Reset Console Faders
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaults = { drums: 85, bass: 90, synth: 80, fx: 75 };
      Object.keys(tracks).forEach(key => {
        const track = tracks[key];
        track.faderVal = defaults[key] / 100;
        if (track.faderEl) track.faderEl.value = defaults[key];
        track.isMuted = false;
        track.isSolo = false;
      });

      document.querySelectorAll('.stem-btn-mute').forEach(b => {
        b.classList.remove('bg-[#ff3b30]/20', 'border-[#ff3b30]', 'text-[#ff3b30]');
        b.classList.add('text-[#888888]');
      });
      document.querySelectorAll('.stem-btn-solo').forEach(b => {
        b.classList.remove('bg-[#ffd000]/20', 'border-[#ffd000]', 'text-[#ffd000]');
        b.classList.add('text-[#888888]');
      });

      applyTrackGains();
      showAudioToast('Consola de Stems restablecida a niveles de fábrica.');
    });
  }

  // Dynamic LED VU Meters Animation Loop
  function updateVUMeter(meterEl, level) {
    if (!meterEl) return;
    const segments = meterEl.querySelectorAll('.vu-segment');
    const totalSegments = segments.length; // 8
    const litCount = Math.round(level * totalSegments);

    segments.forEach((seg, index) => {
      seg.className = 'vu-segment';
      if (index < litCount) {
        if (index >= 7) {
          seg.classList.add('lit-red');
        } else if (index >= 5) {
          seg.classList.add('lit-yellow');
        } else {
          seg.classList.add('lit-green');
        }
      }
    });
  }

  function vuAnimationLoop() {
    if (isPlaying) {
      Object.keys(tracks).forEach(key => {
        const track = tracks[key];
        const effectiveLevel = track.isMuted ? 0 : (track.level * track.faderVal);
        updateVUMeter(track.meterEl, effectiveLevel);
        track.level = Math.max(0, track.level - 0.08); // Decay
      });
    }
    requestAnimationFrame(vuAnimationLoop);
  }
  requestAnimationFrame(vuAnimationLoop);
}

/* ==========================================================================
   5. MPC TAP TEMPO BPM FINDER & GENRE DETECTION
   ========================================================================== */
function initTapTempo() {
  const pad = document.getElementById('tap-tempo-pad');
  const bpmDisplay = document.getElementById('bpm-display-value');
  const tapCounter = document.getElementById('bpm-counter-taps');
  const pulseDot = document.getElementById('bpm-pulse-dot');
  const channelName = document.getElementById('bpm-channel-name');
  const toCatalogBtn = document.getElementById('btn-bpm-to-catalog');

  if (!pad || !bpmDisplay) return;

  let tapTimes = [];
  let currentBPM = 0;
  let resetTimeout = null;

  function registerTap() {
    const now = performance.now();

    // Trigger visual hit effect
    pad.classList.add('pad-hit');
    setTimeout(() => pad.classList.remove('pad-hit'), 120);

    if (pulseDot) {
      pulseDot.classList.add('bg-[#4EFFAE]', 'scale-125');
      setTimeout(() => pulseDot.classList.remove('bg-[#4EFFAE]', 'scale-125'), 120);
    }

    // Play tactile mechanical pad sound
    playAnalogClick(850, 0.04, 0.06);

    // If more than 2.2 seconds since last tap, reset history
    if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2200) {
      tapTimes = [];
    }

    tapTimes.push(now);
    if (tapTimes.length > 8) tapTimes.shift();

    if (tapCounter) {
      tapCounter.textContent = `${tapTimes.length} ${tapTimes.length === 1 ? 'tap' : 'taps'}`;
    }

    if (tapTimes.length >= 2) {
      // Calculate intervals
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      currentBPM = Math.round(60000 / avgInterval);

      // Sanity clamp (40 - 240 BPM)
      if (currentBPM >= 40 && currentBPM <= 240) {
        bpmDisplay.textContent = currentBPM;
        updateGenreSuggestion(currentBPM);
      }
    }

    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      if (tapCounter) tapCounter.textContent = '0 taps';
    }, 4500);
  }

  function updateGenreSuggestion(bpm) {
    if (!channelName) return;

    if (bpm < 95) {
      channelName.textContent = 'Canal Vibes (Smooth R&B)';
      channelName.className = 'text-xs font-bold font-heading text-[#4EFFAE]';
    } else if (bpm >= 95 && bpm <= 118) {
      channelName.textContent = 'Canal Waves (Reggaetón & Afro)';
      channelName.className = 'text-xs font-bold font-heading text-[#a074ff]';
    } else {
      channelName.textContent = 'Canal Flow (Trap & Drill)';
      channelName.className = 'text-xs font-bold font-heading text-[#00BFFF]';
    }
  }

  pad.addEventListener('click', (e) => {
    e.preventDefault();
    registerTap();
  });

  // Spacebar tap listener
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      
      e.preventDefault();
      registerTap();
    }
  });

  // Navigate to catalog with recommended tempo
  if (toCatalogBtn) {
    toCatalogBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetBPM = currentBPM > 0 ? currentBPM : 128;
      const targetSec = document.getElementById('catalogo');
      if (targetSec) {
        const offset = targetSec.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      showAudioToast(`Buscando instrumentales en torno a ${targetBPM} BPM en el catálogo oficial.`);
    });
  }
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
        const label = opt.getAttribute('data-label') || value;
        const dotColor = opt.getAttribute('data-dot') || '#00BFFF';

        hiddenInput.value = value;
        if (labelText) labelText.textContent = label;
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




