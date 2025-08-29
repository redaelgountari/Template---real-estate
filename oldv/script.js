/*!
  car2.js (rewritten)
  - Fixes second carousel by scoping selectors to their containers
  - Initializes BOTH:
      1) Image Carousel (section#imageCarousel)
      2) Property Cards Carousel (section that contains .carousel-container and #dotsContainer)
  - Works even with duplicate IDs on the page (e.g., #carouselTrack, #prevBtn, #nextBtn, #dotsContainer)
  - Requires GSAP core; optionally uses ScrollTrigger and ScrollToPlugin if present
*/

(function () {
  'use strict';

  // Detect GSAP and plugins
  const hasGSAP = typeof window !== 'undefined' && !!window.gsap;
  const gsap = hasGSAP ? window.gsap : null;
  const ScrollTrigger = hasGSAP ? window.ScrollTrigger : null;
  const ScrollToPlugin = hasGSAP ? window.ScrollToPlugin : null;

  if (hasGSAP) {
    const toRegister = [];
    if (ScrollTrigger) toRegister.push(ScrollTrigger);
    if (ScrollToPlugin) toRegister.push(ScrollToPlugin);
    if (toRegister.length) gsap.registerPlugin(...toRegister);
    gsap.config({ force3D: true });
  }

  // Helpers
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

  // ---------------------------------------------------
  // Image Carousel (scoped to #imageCarousel)
  // ---------------------------------------------------
  function initImageCarousel(root) {
    if (!root) return;

    // Scoped elements (IDs may be duplicated globally)
    const track = root.querySelector('#carouselTrack');
    const prevBtn = root.querySelector('#prevBtn');
    const nextBtn = root.querySelector('#nextBtn');
    const playPauseBtn = root.querySelector('#playPauseBtn');
    const shuffleBtn = root.querySelector('#shuffleBtn');
    const fullscreenBtn = root.querySelector('#fullscreenBtn');
    const progressBar = root.querySelector('#progressBar');
    const currentIndexSpan = root.querySelector('#currentIndex');
    const totalImagesSpan = root.querySelector('#totalImages');
    const thumbnailNav = root.querySelector('#thumbnailNav');
    const loading = root.querySelector('#carouselLoading');

    if (!track) return;

    const slides = $$('.image-slide', track);
    const total = slides.length;
    let current = 0;
    let playing = true;
    let shuffle = false;
    let auto = null;
    const timeout = 5000;

    // Update total counter if present
    if (totalImagesSpan) totalImagesSpan.textContent = String(total);

    // Build simple thumbnails (uses titles for labels)
    function buildThumbs() {
      if (!thumbnailNav) return;
      thumbnailNav.innerHTML = '';
      slides.forEach((slide, i) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${i === 0 ? 'active' : ''}`;
        // Basic gradient; customize if you set slide background images via CSS
        thumb.style.background = 'linear-gradient(135deg,#e5e7eb,#cbd5e1)';
        thumb.title = slide.querySelector('.slide-title')?.textContent?.trim() || `Slide ${i + 1}`;
        thumb.addEventListener('click', () => goTo(i));
        thumbnailNav.appendChild(thumb);
      });
    }

    function updateUI() {
      if (currentIndexSpan) currentIndexSpan.textContent = String(current + 1);

      if (thumbnailNav) {
        $$('.thumbnail', thumbnailNav).forEach((el, idx) => {
          el.classList.toggle('active', idx === current);
        });
      }

      if (progressBar) {
        const width = ((current + 1) / total) * 100;
        if (hasGSAP) gsap.to(progressBar, { width: `${width}%`, duration: 0.3, ease: 'power2.out' });
        else progressBar.style.width = `${width}%`;
      }
    }

    function animateSlideContent() {
      if (!hasGSAP) return;
      const slide = slides[current];
      if (!slide) return;
      const content = slide.querySelector('.slide-content');
      if (!content) return;

      const items = content.querySelectorAll('.slide-title, .slide-description, .slide-features, .slide-cta');
      gsap.set(items, { opacity: 0, y: 50 });

      const tl = gsap.timeline({ delay: 0.15 });
      const title = content.querySelector('.slide-title');
      const desc = content.querySelector('.slide-description');
      const feats = content.querySelector('.slide-features');
      const cta = content.querySelector('.slide-cta');

      if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
      if (feats) tl.to(feats, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
      if (cta) tl.to(cta, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2');
    }

    function goTo(index) {
      if (!track) return;
      if (index >= total) index = 0;
      if (index < 0) index = total - 1;
      current = index;

      // Slides are 100% viewport width each in this layout
      const xPercent = -index * 100;
      if (hasGSAP) {
        gsap.to(track, { x: `${xPercent}%`, duration: 0.8, ease: 'power2.out' });
      } else {
        track.style.transform = `translateX(${xPercent}%)`;
      }
      updateUI();
      animateSlideContent();
      resetAuto();
    }

    function startAuto() {
      if (!playing || auto) return;
      auto = setInterval(() => {
        let next = shuffle ? Math.floor(Math.random() * total) : current + 1;
        if (next === current) next = (next + 1) % total;
        goTo(next);
      }, timeout);
    }

    function stopAuto() {
      if (auto) clearInterval(auto);
      auto = null;
    }

    function resetAuto() {
      stopAuto();
      if (playing) startAuto();
    }

    function togglePlay() {
      playing = !playing;
      if (playing) startAuto();
      else stopAuto();
      if (playPauseBtn) {
        playPauseBtn.textContent = playing ? '⏸️' : '▶️';
        playPauseBtn.classList.toggle('active', playing);
      }
    }

    function toggleShuffle() {
      shuffle = !shuffle;
      if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', shuffle);
        shuffleBtn.style.color = shuffle ? '#60A5FA' : '';
      }
    }

    function toggleFullscreen() {
      const el = root;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }

    // Events (scoped)
    prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));
    playPauseBtn && playPauseBtn.addEventListener('click', togglePlay);
    shuffleBtn && shuffleBtn.addEventListener('click', toggleShuffle);
    fullscreenBtn && fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard only when hovered (prevents conflicts)
    document.addEventListener('keydown', (e) => {
      if (!root.matches(':hover')) return;
      if (e.key === 'ArrowLeft') goTo(current - 1);
      else if (e.key === 'ArrowRight') goTo(current + 1);
      else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    });

    // Touch swipe
    let sx = 0, sy = 0;
    track.addEventListener('touchstart', (e) => {
      sx = e.changedTouches[0].screenX;
      sy = e.changedTouches[0].screenY;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - sx;
      const dy = e.changedTouches[0].screenY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx > 0) goTo(current - 1);
        else goTo(current + 1);
      }
      setTimeout(startAuto, 3000);
    }, { passive: true });

    // Hover pause/resume
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);

    // Hide loading state
    if (loading) {
      if (hasGSAP) gsap.to(loading, { opacity: 0, duration: 0.4, onComplete: () => (loading.style.display = 'none') });
      else loading.style.display = 'none';
    }

    // Init
    buildThumbs();
    goTo(0);
    startAuto();

    // Nice entrances (optional)
    if (hasGSAP) {
      const arrows = $$('.carousel-arrow', root);
      arrows.length && gsap.fromTo(arrows, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'back.out(1.7)' });
    }
  }

  // ---------------------------------------------------
  // Property Cards Carousel (scoped to its section)
  // ---------------------------------------------------
  function initPropertyCardsCarousel(sectionRoot) {
    if (!sectionRoot) return;

    const container = sectionRoot.querySelector('.carousel-container');
    const track = sectionRoot.querySelector('#carouselTrack');
    const prevBtn = sectionRoot.querySelector('#prevBtn');
    const nextBtn = sectionRoot.querySelector('#nextBtn');
    const dotsContainer = sectionRoot.querySelector('#dotsContainer');

    if (!container || !track || !dotsContainer) return;

    const slides = $$('.property-card', track);
    if (!slides.length) return;

    let current = 0;
    const total = slides.length;
    let dots = [];
    let auto = null;

    function buildDots() {
      dotsContainer.innerHTML = '';
      dots = [];
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot w-3 h-3 bg-slate-300 rounded-full cursor-pointer transition-all duration-300 hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400';
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }
    }

    function getSlideStep() {
      const first = slides[0];
      if (!first) return 0;
      const slideWidth = first.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap || '0'); // .flex gap-8 -> 32px
      return slideWidth + gap;
    }

    function getMaxIndex() {
      const overflowBox = container.querySelector('.overflow-hidden');
      const containerWidth = overflowBox ? overflowBox.offsetWidth : container.offsetWidth;
      const first = slides[0];
      const gap = 32; // tailwind gap-8
      const w = first ? first.offsetWidth : 0;
      const perView = Math.max(1, Math.floor(containerWidth / (w + gap)));
      return Math.max(0, total - perView);
    }

    function update(animate = true) {
      const translateX = -current * getSlideStep();
      if (hasGSAP && animate) gsap.to(track, { x: translateX, duration: 0.7, ease: 'power2.out' });
      else track.style.transform = 'translateX(' + translateX + 'px)';

      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('bg-blue-500', active);
        dot.classList.toggle('bg-slate-300', !active);
        dot.classList.toggle('animate-glow', active);
      });

      if (hasGSAP) {
        slides.forEach((slide, i) => {
          if (i === current) gsap.to(slide, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
          else gsap.to(slide, { scale: 0.97, opacity: 0.9, duration: 0.4, ease: 'power2.out' });
        });
      }
    }

    function goTo(index) {
      const max = getMaxIndex();
      current = clamp(index, 0, max);
      update();
    }

    function next() {
      const max = getMaxIndex();
      if (current < max) {
        current++;
        update();
      } else {
        current = 0; // loop
        update();
      }
    }

    function prev() {
      if (current > 0) {
        current--;
        update();
      }
    }

    function startAuto() {
      stopAuto();
      auto = setInterval(next, 5000);
    }

    function stopAuto() {
      if (auto) clearInterval(auto);
      auto = null;
    }

    function pauseAndResume() {
      stopAuto();
      setTimeout(startAuto, 3000);
    }

    // Events (scoped)
    nextBtn && nextBtn.addEventListener('click', () => { next(); pauseAndResume(); });
    prevBtn && prevBtn.addEventListener('click', () => { prev(); pauseAndResume(); });

    // Keyboard only while hovered (prevents conflicts with first carousel)
    document.addEventListener('keydown', (e) => {
      const hovered = sectionRoot.matches(':hover') || slides.some((s) => s.matches(':hover'));
      if (!hovered) return;
      if (e.key === 'ArrowLeft') { prev(); pauseAndResume(); }
      else if (e.key === 'ArrowRight') { next(); pauseAndResume(); }
    });

    // Touch swipe
    let startX = 0, isDragging = false;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; stopAuto(); }, { passive: true });
    track.addEventListener('touchmove', (e) => { if (!isDragging) return; e.preventDefault(); }, { passive: false });
    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
      isDragging = false;
      setTimeout(startAuto, 3000);
    }, { passive: true });

    // Pause on hover
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    // Parallax and entrances (optional)
    if (hasGSAP && ScrollTrigger) {
      $$('.parallax-img', track).forEach((img) => {
        const card = img.closest('.property-card');
        if (!card) return;
        gsap.fromTo(img, { yPercent: -5, scale: 1.05 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      gsap.timeline({ delay: 0.2 })
        .from($$('.property-card', track), { y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' })
        .from($$('#dotsContainer .dot', sectionRoot), { scale: 0, duration: 0.25, stagger: 0.05, ease: 'back.out(1.7)' }, '-=0.2');
    }

    // Card lift on hover
    slides.forEach((card, i) => {
      card.addEventListener('mouseenter', () => { if (hasGSAP && i !== current) gsap.to(card, { y: -5, duration: 0.2, ease: 'power2.out' }); });
      card.addEventListener('mouseleave', () => { if (hasGSAP && i !== current) gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out' }); });
      card.addEventListener('click', () => { if (i !== current) { goTo(i); pauseAndResume(); } });
    });

    // Build and start
    buildDots();
    update(false);
    startAuto();

    // Resize
    window.addEventListener('resize', () => update(false), { passive: true });
  }

  // ---------------------------------------------------
  // Boot: initialize both carousels
  // ---------------------------------------------------
  function boot() {
    // 1) Image Carousel in #imageCarousel
    const imageCarouselRoot = document.getElementById('imageCarousel');
    initImageCarousel(imageCarouselRoot);

    // 2) Property Cards Carousel: find its section by locating a section that has .carousel-container + #dotsContainer
    // This avoids the other duplicated IDs elsewhere.
    const propertySection = (() => {
      const dots = document.querySelectorAll('#dotsContainer');
      for (const el of dots) {
        const sec = el.closest('section');
        if (sec && sec.querySelector('.carousel-container') && sec.querySelector('#carouselTrack')) return sec;
      }
      // Fallback: nearest section around .carousel-container in your markup
      return document.querySelector('section.py-16') || null;
    })();

    initPropertyCardsCarousel(propertySection);

    // Log status for debugging
    console.log('car2.js initialized:', {
      imageCarousel: !!imageCarouselRoot,
      propertyCardsCarousel: !!propertySection,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();