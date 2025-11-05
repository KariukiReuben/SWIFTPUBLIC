/* script.js
   Controls:
   - Preloader split animation and removal
   - Scroll direction detection for navbar hide/show
   - IntersectionObserver to reveal elements with fade-ins
   - Theme toggle (dark/light)
   - Product "See more" toggles
   - Mobile nav toggle
   - Typewriter effect in About section
   - Services card stream
*/

/* ======================
   PRELOADER
   ====================== */
   (function(){
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
  
    const videos = Array.from(preloader.querySelectorAll('video.pvid'));
    if (videos.length === 0) { 
      preloader.classList.add('hide'); 
      return; 
    }
  
    const master = videos[0]; 
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    const OPEN_DELAY = 900;        
    const SLIDE_DELAY = 1800;      
    const HIDE_DELAY = 2600;       
  
    function syncToMaster() {
      const t = master.currentTime || 0;
      videos.forEach((v) => {
        if (v !== master && Math.abs(v.currentTime - t) > 0.08) {
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
  
        setTimeout(() => {
          preloader.classList.add('slide-out');
        }, SLIDE_DELAY - OPEN_DELAY);
  
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
  
    master.addEventListener('canplay', startWhenReady, { once: true });
    setTimeout(() => { if (!started) startWhenReady(); }, 3000);
    master.addEventListener('timeupdate', syncToMaster);
  })();
  
  /* ======================
     NAVBAR HIDE/SHOW
     ====================== */
  (function(){
    const header = document.getElementById('mainHeader');
    let lastScroll = window.scrollY;
    let ticking = false;
  
    function onScroll(){
      const y = window.scrollY;
      const delta = y - lastScroll;
      if (delta > 8 && y > 80){
        header.classList.add('nav-hidden');
        header.classList.remove('nav-visible');
      } else if (delta < -8 || y < 80){
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      }
      lastScroll = y;
    }
  
    window.addEventListener('scroll', () => {
      if (!ticking){
        window.requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    }, {passive:true});
  })();
  
  /* ======================
     IntersectionObserver Reveal
     ====================== */
  (function(){
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting){
          ent.target.classList.add('show');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12 });
  
    reveals.forEach(r => io.observe(r));
  })();
  
  /* ======================
     THEME TOGGLE
     ====================== */
  (function(){
    const btn = document.getElementById('themeToggle');
    const body = document.body;
  
    const saved = localStorage.getItem('site-theme') || 'light';
    body.classList.add(saved === 'dark' ? 'dark' : 'light-mode');
    btn.innerText = saved === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-pressed', saved === 'dark');
  
    btn.addEventListener('click', () => {
      if (body.classList.contains('dark')) {
        body.classList.remove('dark');
        body.classList.add('light-mode');
        btn.innerText = '🌙';
        btn.setAttribute('aria-pressed', 'false');
        localStorage.setItem('site-theme', 'light');
      } else {
        body.classList.remove('light-mode');
        body.classList.add('dark');
        btn.innerText = '☀️';
        btn.setAttribute('aria-pressed', 'true');
        localStorage.setItem('site-theme', 'dark');
      }
    });
  })();
  
  /* ======================
     PRODUCT "See More"
     ====================== */
  (function(){
    document.addEventListener('click', (e) => {
      const see = e.target.closest('.see-more');
      if (!see) return;
  
      const card = see.closest('.product-card');
      if (!card) return;
  
      card.classList.toggle('expanded');
      see.textContent = card.classList.contains('expanded') ? 'Show less' : 'See more';
    });
  })();
  
  /* ======================
     FOOTER YEAR
     ====================== */
  (function(){
    const y = new Date().getFullYear();
    const el = document.getElementById('year');
    if (el) el.textContent = y;
  })();
  
  /* ======================
     MOBILE NAV TOGGLE
     ====================== */
  (function(){
    const mobileBtn = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
  
    mobileBtn && mobileBtn.addEventListener('click', () => {
      const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.right = '20px';
        navLinks.style.top = '66px';
        navLinks.style.background = 'var(--panel)';
        navLinks.style.padding = '12px';
        navLinks.style.borderRadius = '10px';
        navLinks.style.backdropFilter = 'blur(6px)';
      } else {
        navLinks.style = "";
      }
    });
  
    navLinks && navLinks.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'a' && window.innerWidth < 900){
        mobileBtn && mobileBtn.click();
      }
    });
  })();

  /* =========================
     About: Typewriter + image parallax
     Place this script before </body>
     ========================= */
  
  (function () {
    // TYPEWRITER: reads all .typewriter in the about section
    const aboutSection = document.getElementById('about');
    const typeLines = aboutSection ? aboutSection.querySelectorAll('.typewriter') : [];
  
    function typeText(element, text, speed = 28) {
      return new Promise((resolve) => {
        element.textContent = '';
        element.style.opacity = '1';
        let i = 0;
        const t = setInterval(() => {
          element.textContent += text.charAt(i);
          i++;
          if (i >= text.length) {
            clearInterval(t);
            // small pause after each line
            setTimeout(resolve, 350);
          }
        }, speed);
      });
    }
  
    // Start typing when About is mostly in view
    if (aboutSection && typeLines.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(async entry => {
          if (entry.isIntersecting) {
            observer.unobserve(aboutSection); // run only once
            // lock small overflow while typing to avoid jumpiness on mobile
            const originalOverflow = document.documentElement.style.overflow;
            // sequentially type lines
            for (let el of typeLines) {
              const text = el.dataset.text || el.textContent.trim();
              // animate entry
              el.style.opacity = '0';
              el.style.transform = 'translateY(8px)';
              await typeText(el, text, 26);
              // finalize appearance
              el.style.transition = 'transform 480ms ease, opacity 480ms ease';
              el.style.transform = 'translateY(0)';
              el.style.opacity = '1';
            }
            document.documentElement.style.overflow = originalOverflow;
          }
        });
      }, { threshold: 0.45 });
  
      observer.observe(aboutSection);
    }
  
    // SIMPLE PARALLAX: subtle translate on scroll for .main-photo and mini photos
    const mainPhoto = document.querySelector('.main-photo');
    const miniPhotos = document.querySelectorAll('.mini-photo');
  
    if (mainPhoto) {
      window.addEventListener('scroll', () => {
        const rect = mainPhoto.getBoundingClientRect();
        const winH = window.innerHeight;
        // only run when visible
        if (rect.top < winH && rect.bottom > 0) {
          const pct = (winH - rect.top) / (winH + rect.height);
          // translateY from 0px to -12px
          const t = (pct - 0.5) * -20;
          mainPhoto.style.transform = `translateY(${t}px) scale(1.01)`;
        }
      }, { passive: true });
    }
  
    // mini photos parallax tilt
    if (miniPhotos.length) {
      window.addEventListener('scroll', () => {
        miniPhotos.forEach((p, idx) => {
          const rect = p.getBoundingClientRect();
          const winH = window.innerHeight;
          if (rect.top < winH && rect.bottom > 0) {
            const pct = (winH - rect.top) / (winH + rect.height);
            const offset = ((pct - 0.5) * (10 + idx * 3));
            p.style.transform = `translateY(${offset}px)`;
          }
        });
      }, { passive: true });
    }
  
    // Make mini photos clickable to swap main image visually (optional UX)
    const miniGallery = document.querySelector('.floating-gallery');
    if (miniGallery && mainPhoto) {
      miniGallery.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.matches('.mini-photo')) {
          // animate swap
          mainPhoto.style.transition = 'opacity 260ms ease, transform 380ms ease';
          mainPhoto.style.opacity = '0.0';
          setTimeout(() => {
            mainPhoto.src = target.src;
            mainPhoto.alt = target.alt || mainPhoto.alt;
            mainPhoto.style.opacity = '1';
          }, 260);
        }
      });
    }
  })();
  

/* Services/Feedback: interactive bits
   - Testimonial slider auto-rotate + manual
   - optional: clicking small visual images swaps the large hero
*/

(function () {
  // TESTIMONIAL SLIDER
  const slides = Array.from(document.querySelectorAll('.testi-slider .testi'));
  const prevBtn = document.querySelector('.testimonials .prev');
  const nextBtn = document.querySelector('.testimonials .next');
  let current = 0;
  let testiInterval = null;
  const INTERVAL = 6000;

  function showTestimonial(index) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    current = index;
  }

  function nextTestimonial() {
    showTestimonial((current + 1) % slides.length);
  }

  function prevTestimonialFn() {
    showTestimonial((current - 1 + slides.length) % slides.length);
  }

  // attach buttons
  if (nextBtn) nextBtn.addEventListener('click', () => { nextTestimonial(); resetInterval(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevTestimonialFn(); resetInterval(); });

  function resetInterval() {
    if (testiInterval) clearInterval(testiInterval);
    testiInterval = setInterval(nextTestimonial, INTERVAL);
  }

  if (slides.length) {
    showTestimonial(0);
    testiInterval = setInterval(nextTestimonial, INTERVAL);
  }

  // VISUAL: swap large image when clicking smaller images (optional UX)
  const visualGrid = document.querySelector('.services-visual .visual-grid');
  if (visualGrid) {
    const largeImg = visualGrid.querySelector('.visual-large img');
    const smalls = visualGrid.querySelectorAll('.visual-small img');
    smalls.forEach(s => {
      s.addEventListener('click', () => {
        if (!largeImg || !s) return;
        largeImg.style.transition = 'opacity 260ms ease, transform 360ms ease';
        largeImg.style.opacity = '0';
        setTimeout(() => {
          largeImg.src = s.src;
          largeImg.alt = s.alt || largeImg.alt;
          largeImg.style.opacity = '1';
        }, 260);
      });
    });
  }

})();