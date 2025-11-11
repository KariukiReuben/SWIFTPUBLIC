/* contact.js
   - unified dark mode (persistent)
   - preloader sync (existing video preloader preserved)
   - navbar hide/show preserved
   - mobile nav toggle preserved
   - map cue injection + smooth scroll
   - map description injection for side-by-side layout on wide screens
*/

(function () {
    // --- helper safe query ---
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  
    // --- Persisted theme on load ---
    function applySavedTheme() {
      const saved = localStorage.getItem('site-theme') || 'light';
      if (saved === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
  
      // Update themeToggle button text if exists
      const tbtn = $('#themeToggle') || $('#theme-toggle');
      if (tbtn) tbtn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
    }
    applySavedTheme();
  
    // --- unified theme toggle handler ---
    function setupThemeToggle() {
      const tbtn = $('#themeToggle') || $('#theme-toggle');
      if (!tbtn) return;
      tbtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
        tbtn.innerText = isDark ? '☀️' : '🌙';
      });
    }
    setupThemeToggle();
  
    // --- preloader (video sync) - existing logic kept, but defensive ---
    (function preloaderSequence() {
      const preloader = document.getElementById('preloader');
      if (!preloader) return;
  
      // if there are video panels, run the sync sequence; otherwise just hide after short delay
      const videos = Array.from(preloader.querySelectorAll('video.pvid'));
      if (!videos.length) {
        // graceful fade then remove
        setTimeout(() => { preloader.classList.add('hide'); }, 600);
        return;
      }
  
      const master = videos[0];
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const OPEN_DELAY = 900, SLIDE_DELAY = 1800, HIDE_DELAY = 2600;
  
      function syncToMaster() {
        const t = master.currentTime || 0;
        videos.forEach(v => {
          if (v !== master && Math.abs((v.currentTime || 0) - t) > 0.08) {
            try { v.currentTime = t; } catch (e) {}
          }
        });
      }
  
      function startSequence() {
        if (prefersReduced) {
          preloader.classList.add('hide');
          videos.forEach(v => { try { v.pause(); v.currentTime = 0; } catch (e) {} });
          return;
        }
  
        try { videos.forEach(v => v.play().catch(()=>{})); } catch(e){}
  
        setTimeout(() => {
          const syncInterval = setInterval(syncToMaster, 80);
          preloader.classList.add('open');
  
          setTimeout(() => { preloader.classList.add('slide-out'); }, SLIDE_DELAY - OPEN_DELAY);
  
          setTimeout(() => {
            clearInterval(syncInterval);
            preloader.classList.add('hide');
            videos.forEach(v => { try { v.pause(); v.currentTime = 0; } catch (e) {} });
          }, HIDE_DELAY - OPEN_DELAY);
  
        }, OPEN_DELAY);
      }
  
      let started = false;
      const startWhenReady = () => {
        if (started) return;
        started = true;
        requestAnimationFrame(startSequence);
      };
  
      // defensive binding
      try {
        master.addEventListener('canplay', startWhenReady, { once: true });
        setTimeout(() => { if (!started) startWhenReady(); }, 3000);
        master.addEventListener('timeupdate', syncToMaster);
      } catch (e) {
        // fallback: just hide preloader after a moment
        setTimeout(() => preloader.classList.add('hide'), 1000);
      }
    })();
  
    // --- navbar hide/show on scroll (kept) ---
    (function navbarScroll() {
      const header = document.getElementById('mainHeader');
      if (!header) return;
      let lastScroll = window.scrollY;
      let ticking = false;
      function onScroll() {
        const y = window.scrollY;
        const delta = y - lastScroll;
        if (delta > 8 && y > 80) {
          header.classList.add('nav-hidden');
          header.classList.remove('nav-visible');
        } else if (delta < -8 || y < 80) {
          header.classList.remove('nav-hidden');
          header.classList.add('nav-visible');
        }
        lastScroll = y;
      }
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => { onScroll(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });
    })();
  
    // --- mobile nav toggle (defensive) ---
    (function mobileNav() {
      const mobileToggle = document.getElementById('mobileToggle') || document.getElementById('menu-toggle');
      const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
      if (!mobileToggle || !navLinks) return;
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', String(!expanded));
      });
    })();
  
    // --- footer year ---
    (function footerYear() {
      const yearEl = document.getElementById('year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    })();
  
    // --- MAP CUE + DESCRIPTION (injected) ---
    (function mapEnhancements() {
      const contactInner = document.querySelector('.contact_inner');
      const mapInner = document.querySelector('.map_inner') || document.querySelector('.map_inner');
      const mapSection = document.querySelector('.map_sec');
      if (!contactInner || !mapSection) return;
  
      // 1) inject the map-cue button (if not already present)
      let cue = document.querySelector('.map-cue');
      if (!cue) {
        cue = document.createElement('button');
        cue.className = 'map-cue';
        cue.setAttribute('aria-label', 'Show map below');
        cue.innerHTML = '<span class="sr-only">Scroll to map</span><span class="arrow"></span>';
        // append after contact_inner for visual positioning
        contactInner.appendChild(cue);
      }
  
      // on click scroll to the map
      cue.addEventListener('click', (e) => {
        e.preventDefault();
        // smooth scroll so user sees the map area
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // small pulse feedback
        cue.style.transform = 'translateX(-50%) scale(.95)';
        setTimeout(() => { cue.style.transform = 'translateX(-50%) scale(1)'; }, 300);
      });
  
      // 2) inject a description panel into the map_inner (if not present)
      // we create only if `.map_bind` exists
      const mapInnerContainer = document.querySelector('.map_inner');
      const mapBind = document.querySelector('.map_bind');
      if (mapInnerContainer && mapBind) {
        // create desc if missing
        if (!mapInnerContainer.querySelector('.map-desc')) {
          const desc = document.createElement('div');
          desc.className = 'map-desc';
          desc.innerHTML = `
            <h5>Visit Our Office</h5>
            <p>Telkom Plaza, Nairobi — open Mon–Fri, 8:00–17:00. Stop by for in-person support, demos, and partnerships.</p>
            <p><strong>Tip:</strong> Use the map to get directions, or click "Contact Us" above to send a message first.</p>
          `;
          // insert description before or after map depending on layout preference
          // put it as the second column on wide screens
          mapInnerContainer.insertBefore(desc, mapBind.nextSibling);
        }
      }
  
      // 3) visual auto-hide of cue when user scrolled past a threshold (or scrolled into map)
      function updateCueVisibility() {
        const contactRect = contactInner.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // if the bottom of contactInner is within viewport (user might see map), hide cue
        if (contactRect.bottom <= windowHeight * 0.9) {
          cue.style.opacity = '0';
          cue.style.pointerEvents = 'none';
        } else {
          cue.style.opacity = '1';
          cue.style.pointerEvents = 'auto';
        }
      }
      window.addEventListener('scroll', throttle(updateCueVisibility, 150), { passive: true });
      window.addEventListener('resize', throttle(updateCueVisibility, 250));
      updateCueVisibility();
    })();
  
    // --- small utility: throttle to limit scroll work ---
    function throttle(fn, wait) {
      let last = 0;
      return function (...args) {
        const now = Date.now();
        if (now - last >= wait) {
          last = now;
          fn.apply(this, args);
        }
      };
    }
  
  })();
  