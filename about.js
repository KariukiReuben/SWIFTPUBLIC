
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

window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => preloader.classList.add("hide"), 1000);
    }
  
    // Set current year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // Initialize GSAP animations
    gsap.registerPlugin(ScrollTrigger);
  
    // Hero text fade-in
    gsap.from(".hero-content h1", {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: "power3.out"
    });
    gsap.from(".hero-content p", {
      opacity: 0,
      y: 30,
      delay: 0.3,
      duration: 1.2,
      ease: "power3.out"
    });
  
    // Timeline scroll animation
    gsap.utils.toArray(".timeline-item").forEach((item, i) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1,
        delay: i * 0.1,
        ease: "power2.out"
      });
    });
  
    // Team cards reveal
    gsap.from(".team-card", {
      scrollTrigger: {
        trigger: ".team-section",
        start: "top 80%"
      },
      opacity: 0,
      y: 50,
      duration: 1.2,
      stagger: 0.2,
      ease: "power3.out"
    });
  
    // Mission stats pop-up
    gsap.from(".stat-box", {
      scrollTrigger: {
        trigger: ".mission-section",
        start: "top 85%"
      },
      opacity: 0,
      scale: 0.8,
      duration: 1,
      stagger: 0.2,
      ease: "back.out(1.7)"
    });
  });
  