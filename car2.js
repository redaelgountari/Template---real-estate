/*!
  All-in-One Animations + Carousels (scoped + multi-carousel safe)

  Requires:
    - GSAP core: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
  Optional (auto-registered if found):
    - ScrollTrigger: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
    - ScrollToPlugin: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js
    - TextPlugin: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js

  Notes:
    - Safeguards against missing elements.
    - Smooth scroll falls back to native if ScrollToPlugin is not present.
    - Carousels:
        A) Image Carousel (thumbnails, shuffle, fullscreen) -> scoped to #imageCarousel
        B) Property Cards Carousel (dots, autoplay, parallax) -> initializes for each section that contains its own controls/track
*/

(function () {
  'use strict';

  // --------------------------------
  // Utilities
  // --------------------------------
  const hasGSAP = typeof window !== 'undefined' && !!window.gsap;
  const gsap = hasGSAP ? window.gsap : null;
  const plugins = {
    ScrollTrigger: hasGSAP ? window.ScrollTrigger : null,
    ScrollToPlugin: hasGSAP ? window.ScrollToPlugin : null,
    TextPlugin: hasGSAP ? window.TextPlugin : null,
  };

  if (hasGSAP) {
    const toRegister = [];
    if (plugins.ScrollTrigger) toRegister.push(plugins.ScrollTrigger);
    if (plugins.ScrollToPlugin) toRegister.push(plugins.ScrollToPlugin);
    if (plugins.TextPlugin) toRegister.push(plugins.TextPlugin);
    if (toRegister.length) gsap.registerPlugin(...toRegister);
    gsap.config({ force3D: true });
  }

  const onLoad = (fn) => window.addEventListener('load', fn);
  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const exists = (sel, root = document) => !!$(sel, root);
  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

  // --------------------------------
  // Global Page Animations
  // --------------------------------
  function initGlobalAnimations() {
    if (!hasGSAP) return;
    // Navbar
    if (exists('.navbar')) {
      const navTl = gsap.timeline({ delay: 0.3 });
      navTl
        .to('.navbar', { y: 0, duration: 1.2, ease: 'power3.out' })
        .to('.logo', { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, '-=0.7')
        .to(
          '.nav-links li',
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
          '-=0.6'
        );
    }

    // Hero
    if (exists('.hero')) {
      const heroTl = gsap.timeline({ delay: 0.8 });
      if (exists('.hero h1')) {
        heroTl.to('.hero h1', { opacity: 1, y: 0, duration: 2, ease: 'power3.out' });
      }
      if (exists('.hero-tagline')) {
        heroTl.to(
          '.hero-tagline',
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' },
          '-=1.5'
        );
      }
      if (exists('.cta-button')) {
        heroTl.to(
          '.cta-button',
          { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' },
          '-=0.8'
        );
      }

      $$('.hero-floating-element').forEach((el, i) => {
        gsap.to(el, { opacity: 0.6, duration: 1.5, delay: 1 + i * 0.3, ease: 'power2.out' });
      });

      if (plugins.ScrollTrigger) {
        gsap.to('.hero', {
          backgroundPosition: '50% 80%',
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    }

    // Section titles
    $$('.section-title').forEach((title) => {
      const words = (title.textContent || '').trim().split(/\s+/);
      title.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(' ');
      if (plugins.ScrollTrigger) {
        gsap.fromTo(
          title.querySelectorAll('.word'),
          { opacity: 0, y: 50, rotateX: 90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
    });

    // Location title/subtitle/divider
    if (plugins.ScrollTrigger) {
      if (exists('.location-title')) {
        gsap.fromTo(
          '.location-title',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.location-title', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      if (exists('.location-subtitle')) {
        gsap.fromTo(
          '.location-subtitle',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.location-subtitle', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      if (exists('.location-divider')) {
        gsap.fromTo(
          '.location-divider',
          { opacity: 0, scaleX: 0 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 1.2,
            delay: 0.5,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.location-divider', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }

    // Section dividers pulse
    $$('.section-divider').forEach((divider) => {
      if (!plugins.ScrollTrigger) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: divider, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
      tl.fromTo(divider, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 1.2, ease: 'power2.out' })
        .to(divider, { boxShadow: '0 0 20px rgba(5, 150, 105, 0.5)', duration: 0.3, yoyo: true, repeat: 1 });
    });

    // Section subtitles
    if (plugins.ScrollTrigger) {
      $$('.section-subtitle').forEach((subtitle) => {
        gsap.fromTo(
          subtitle,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: subtitle, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }

    // About image
    if (plugins.ScrollTrigger && exists('.about-image')) {
      gsap.fromTo(
        '.about-image',
        { opacity: 0, y: 50, rotation: -5 },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.about-image', start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    }

    // Stats counters
    $$('.stat').forEach((stat, i) => {
      const numberElement = stat.querySelector('.stat-number');
      if (!numberElement || !plugins.ScrollTrigger) return;
      const finalNumber = (numberElement.textContent || '').trim();
      gsap.fromTo(
        stat,
        { opacity: 0, scale: 0.5, rotation: -10 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(2)',
          delay: i * 0.15,
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            onStart: () => {
              const isPlus = finalNumber.includes('+');
              const isPercent = finalNumber.includes('%');
              const num = parseInt(finalNumber.replace(/[^\d]/g, ''), 10);
              if (!Number.isFinite(num)) return;
              const opts = {
                duration: 2,
                ease: 'power2.out',
                snap: { textContent: 1 },
                onUpdate: function () {
                  const current = Math.ceil(this.targets()[0].textContent);
                  if (isPlus) numberElement.textContent = current + '+';
                  else if (isPercent) numberElement.textContent = current + '%';
                  else numberElement.textContent = String(current);
                },
              };
              if (hasGSAP) gsap.fromTo(numberElement, { textContent: 0 }, { textContent: num, ...opts });
            },
          },
        }
      );
    });

    // Location items + hover
    $$('.location-item').forEach((item, index) => {
      if (plugins.ScrollTrigger) {
        gsap.fromTo(
          item,
          { opacity: 0, y: 80, scale: 0.9, rotation: -5 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 1,
            ease: 'back.out(1.7)',
            delay: index * 0.15,
            scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      item.addEventListener('mouseenter', () => {
        if (!hasGSAP) return;
        gsap.to(item, { y: -15, scale: 1.02, duration: 0.4, ease: 'power2.out' });
        const icon = item.querySelector('.location-icon');
        if (icon) gsap.to(icon, { scale: 1.15, rotation: 10, duration: 0.4, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => {
        if (!hasGSAP) return;
        gsap.to(item, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
        const icon = item.querySelector('.location-icon');
        if (icon) gsap.to(icon, { scale: 1, rotation: 0, duration: 0.4, ease: 'power2.out' });
      });
    });

    // Feature items + hover
    $$('.feature-item').forEach((item, index) => {
      if (plugins.ScrollTrigger) {
        gsap.fromTo(
          item,
          { opacity: 0, x: -80, rotation: -5 },
          {
            opacity: 1,
            x: 0,
            rotation: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 0.8,
            scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      item.addEventListener('mouseenter', () => {
        if (!hasGSAP) return;
        gsap.to(item, { x: 15, scale: 1.02, duration: 0.3, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => {
        if (!hasGSAP) return;
        gsap.to(item, { x: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

    // Architecture images
    if (plugins.ScrollTrigger) {
      if (exists('.main-arch-image')) {
        gsap.fromTo(
          '.main-arch-image',
          { opacity: 0, y: 80, rotateX: 45 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.main-arch-image', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      if (exists('.secondary-arch-image')) {
        gsap.fromTo(
          '.secondary-arch-image',
          { opacity: 0, x: 80, rotateY: -45 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1,
            ease: 'back.out(1.7)',
            delay: 0.3,
            scrollTrigger: { trigger: '.secondary-arch-image', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      if (exists('.tertiary-arch-image')) {
        gsap.fromTo(
          '.tertiary-arch-image',
          { opacity: 0, x: -80, rotateY: 45 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1,
            ease: 'back.out(1.7)',
            delay: 0.6,
            scrollTrigger: { trigger: '.tertiary-arch-image', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }

    // Info bubbles
    if (plugins.ScrollTrigger) {
      $$('.info-bubble').forEach((bubble, index) => {
        gsap.fromTo(
          bubble,
          { opacity: 0, y: 30, scale: 0.5 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(2)',
            delay: index * 0.3 + 1,
            scrollTrigger: { trigger: bubble, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }

    // Contact form container
    if (plugins.ScrollTrigger && exists('.luxury-form-container')) {
      gsap.fromTo(
        '.luxury-form-container',
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.luxury-form-container', start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    }

    // Contact image content
    if (plugins.ScrollTrigger && exists('.contact-image-content')) {
      const contactTitle = $('.contact-image-content h3');
      const contactText = $('.contact-image-content p');
      plugins.ScrollTrigger.create({
        trigger: '.contact-image-content',
        start: 'top 85%',
        onEnter: () => {
          if (contactTitle) gsap.to(contactTitle, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
          if (contactText) gsap.to(contactText, { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power2.out' });
        },
      });
    }

    // Form fields cascade
    if (plugins.ScrollTrigger && exists('.luxury-form-container')) {
      $$('.minimal-form-group').forEach((group, index) => {
        gsap.fromTo(
          group,
          { opacity: 0, y: 30, x: -20 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: index * 0.1 + 0.5,
            scrollTrigger: { trigger: '.luxury-form-container', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
      $$('.minimal-checkbox-item').forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 20, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            delay: index * 0.1 + 1.2,
            scrollTrigger: { trigger: '.luxury-form-container', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
      if (exists('.minimal-submit-btn')) {
        gsap.fromTo(
          '.minimal-submit-btn',
          { opacity: 0, y: 30, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'back.out(1.7)',
            delay: 1.5,
            scrollTrigger: { trigger: '.luxury-form-container', start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }

    // Contact image parallax
    if (plugins.ScrollTrigger && exists('.contact-section') && exists('.contact-image-side')) {
      gsap.to('.contact-image-side', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: { trigger: '.contact-section', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    // Floating particles
    $$('.particle').forEach((p) => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      p.style.transform = `translate(${x}px, ${y}px)`;
      if (hasGSAP) {
        gsap.to(p, {
          x: `+=${Math.random() * 200 - 100}`,
          y: `+=${Math.random() * 200 - 100}`,
          duration: 10 + Math.random() * 20,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
      }
    });

    // Scroll progress
    if (plugins.ScrollTrigger && exists('.scroll-progress')) {
      gsap.to('.scroll-progress', {
        width: '100%',
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      });
    }

    // Navbar scrolled
    if (plugins.ScrollTrigger && exists('.navbar')) {
      plugins.ScrollTrigger.create({
        start: 'top -100',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '.navbar' },
      });
    }

    // Cursor trail
    const cursorTrail = $('.cursor-trail');
    if (cursorTrail) {
      let mouseX = 0,
        mouseY = 0,
        trailX = 0,
        trailY = 0;
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });
      (function animateTrail() {
        const dx = mouseX - trailX;
        const dy = mouseY - trailY;
        trailX += dx * 0.1;
        trailY += dy * 0.1;
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
        requestAnimationFrame(animateTrail);
      })();
    }

    // Button hover
    $$('.cta-button, .minimal-submit-btn').forEach((btn) => {
      btn.addEventListener('mouseenter', () => { if (hasGSAP) gsap.to(btn, { scale: 1.05, duration: 0.3, ease: 'power2.out' }); });
      btn.addEventListener('mouseleave', () => { if (hasGSAP) gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' }); });
    });

    // Feature icon hover rotation
    $$('.feature-icon').forEach((icon) => {
      icon.addEventListener('mouseenter', () => {
        if (!hasGSAP) return;
        gsap.to(icon, { rotation: 360, scale: 1.1, duration: 0.8, ease: 'power2.out' });
      });
      icon.addEventListener('mouseleave', () => {
        if (!hasGSAP) return;
        gsap.to(icon, { rotation: 0, scale: 1, duration: 0.8, ease: 'power2.out' });
      });
    });

    // Image tilt hovers
    $$('.about-img, .main-arch-image img').forEach((img) => {
      if (!img.parentElement) return;
      img.parentElement.addEventListener('mouseenter', (e) => {
        if (!hasGSAP) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        gsap.to(img, { scale: 1.1, rotateX, rotateY, duration: 0.6, ease: 'power2.out' });
      });
      img.parentElement.addEventListener('mouseleave', () => {
        if (!hasGSAP) return;
        gsap.to(img, { scale: 1, rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
      });
    });

    // Refresh ScrollTrigger on resize
    window.addEventListener('resize', () => { if (plugins.ScrollTrigger) plugins.ScrollTrigger.refresh(); }, { passive: true });
  }

  // --------------------------------
  // Smooth Scrolling for Anchors
  // --------------------------------
  function initSmoothScrolling() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (hasGSAP && plugins.ScrollToPlugin) {
          gsap.to(window, { duration: 2, scrollTo: { y: target, offsetY: 100 }, ease: 'power3.inOut' });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // --------------------------------
  // Scroll-to-top Button
  // --------------------------------
  function initScrollTopButton() {
    const scrollTopBtn = $('#scrollTop');
    if (!scrollTopBtn) return;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) scrollTopBtn.classList.add('visible');
      else scrollTopBtn.classList.remove('visible');
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      if (hasGSAP && plugins.ScrollToPlugin) gsap.to(window, { duration: 2, scrollTo: { y: 0 }, ease: 'power3.inOut' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------
  // Enhanced Input Interactions
  // --------------------------------
  function initInputInteractions() {
    $$('.minimal-input, .minimal-textarea').forEach((input) => {
      input.addEventListener('focus', function () {
        if (!hasGSAP) return;
        gsap.to(this, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
        if (this.previousElementSibling) gsap.to(this.previousElementSibling, { color: '#0ea5e9', scale: 1.05, duration: 0.3, ease: 'power2.out' });
      });
      input.addEventListener('blur', function () {
        if (!hasGSAP) return;
        gsap.to(this, { scale: 1, duration: 0.3, ease: 'power2.out' });
        if (this.previousElementSibling) gsap.to(this.previousElementSibling, { color: '#374151', scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  // --------------------------------
  // Form Handling with Animations
  // --------------------------------
  function initFormHandling() {
    const form = $('#luxuryContactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('.minimal-submit-btn');
      if (!submitBtn) return;

      const originalText = submitBtn.innerHTML;

      // Ripple keyframes once
      if (!$('#ripple-keyframes-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes-style';
        style.textContent = `
          @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute; border-radius: 50%;
        background: rgba(14, 165, 233, 0.3);
        transform: scale(0); animation: ripple 0.6s linear;
        pointer-events: none; left: 50%; top: 50%;
        width: 20px; height: 20px; margin-left: -10px; margin-top: -10px;
      `;
      submitBtn.appendChild(ripple);

      if (hasGSAP) gsap.to(submitBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' });

      submitBtn.innerHTML = '<span>Envoi en cours...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        const successMessage = $('#luxurySuccessMessage');
        if (successMessage) successMessage.classList.add('show');

        if (!$('#confetti-style')) {
          const confettiStyle = document.createElement('style');
          confettiStyle.id = 'confetti-style';
          confettiStyle.textContent = `
            @keyframes confetti-fall { to { transform: translateY(100vh) rotate(720deg); } }
          `;
          document.head.appendChild(confettiStyle);
        }

        for (let i = 0; i < 50; i++) {
          const confetti = document.createElement('div');
          const colors = ['#059669', '#10b981', '#34d399'];
          confetti.style.cssText = `
            position: fixed; width: 10px; height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation: confetti-fall 3s linear forwards;
            z-index: 10000; top: -10px;
          `;
          document.body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 3000);
        }

        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        ripple.remove();

        if (successMessage) setTimeout(() => successMessage.classList.remove('show'), 5000);
      }, 2000);
    });
  }

  // --------------------------------
  // Image Carousel (scoped to #imageCarousel)
  // --------------------------------
  class PropertyImageCarousel {
            constructor() {
                this.currentSlide = 0;
                this.totalSlides = 8;
                this.isPlaying = true;
                this.isShuffleMode = false;
                this.autoPlayInterval = null;
                this.slideTimeout = 5000; // 5 seconds

                this.carouselTrack = document.getElementById('carouselTrack');
                this.progressBar = document.getElementById('progressBar');
                this.currentIndexSpan = document.getElementById('currentIndex');
                this.totalImagesSpan = document.getElementById('totalImages');
                this.playPauseBtn = document.getElementById('playPauseBtn');
                this.shuffleBtn = document.getElementById('shuffleBtn');
                this.thumbnailNav = document.getElementById('thumbnailNav');
                this.loading = document.getElementById('carouselLoading');

                this.slides = [
                    {
                        bg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Vue Extérieure'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Salon Principal'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Cuisine Moderne'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Suite Parentale'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Salle de Bain'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Terrasse Privée'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Piscine & Spa'
                    },
                    {
                        bg: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        title: 'Jardins Paysagers'
                    }
                ];

                this.init();
            }

            async init() {
                await this.preloadImages();
                this.createThumbnails();
                this.setupEventListeners();
                this.startAutoPlay();
                this.animateSlideContent();
                this.hideLoading();
            }

            async preloadImages() {
                const imagePromises = this.slides.map(slide => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = slide.bg;
                    });
                });

                try {
                    await Promise.all(imagePromises);
                } catch (error) {
                    console.log('Some images failed to load, continuing anyway...');
                }
            }

            hideLoading() {
                gsap.to(this.loading, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        this.loading.style.display = 'none';
                    }
                });
            }

            createThumbnails() {
                this.slides.forEach((slide, index) => {
                    const thumbnail = document.createElement('div');
                    thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                    thumbnail.style.backgroundImage = `url(${slide.bg})`;
                    thumbnail.setAttribute('data-slide', index);
                    thumbnail.setAttribute('title', slide.title);

                    thumbnail.addEventListener('click', () => {
                        this.goToSlide(index);
                    });

                    this.thumbnailNav.appendChild(thumbnail);
                });
            }

            setupEventListeners() {
                // Arrow navigation
                document.getElementById('prevBtn').addEventListener('click', () => {
                    this.goToSlide(this.currentSlide - 1);
                });

                document.getElementById('nextBtn').addEventListener('click', () => {
                    this.goToSlide(this.currentSlide + 1);
                });

                // Control buttons
                this.playPauseBtn.addEventListener('click', () => {
                    this.togglePlayPause();
                });

                this.shuffleBtn.addEventListener('click', () => {
                    this.toggleShuffle();
                });

                // Fullscreen
                document.getElementById('fullscreenBtn').addEventListener('click', () => {
                    this.toggleFullscreen();
                });

                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    switch (e.key) {
                        case 'ArrowLeft':
                            this.goToSlide(this.currentSlide - 1);
                            break;
                        case 'ArrowRight':
                            this.goToSlide(this.currentSlide + 1);
                            break;
                        case ' ':
                            e.preventDefault();
                            this.togglePlayPause();
                            break;
                        case 'f':
                        case 'F':
                            this.toggleFullscreen();
                            break;
                    }
                });

                // Touch/swipe support
                let touchStartX = 0;
                let touchEndX = 0;
                let touchStartY = 0;
                let touchEndY = 0;

                this.carouselTrack.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                    touchStartY = e.changedTouches[0].screenY;
                });

                this.carouselTrack.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    touchEndY = e.changedTouches[0].screenY;
                    this.handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
                });

                // Pause on hover
                document.querySelector('.image-carousel').addEventListener('mouseenter', () => {
                    this.pauseAutoPlay();
                });

                document.querySelector('.image-carousel').addEventListener('mouseleave', () => {
                    this.resumeAutoPlay();
                });
            }

            handleSwipe(startX, endX, startY, endY) {
                const deltaX = endX - startX;
                const deltaY = endY - startY;

                // Check if horizontal swipe is stronger than vertical
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.goToSlide(this.currentSlide - 1); // Swipe right
                    } else {
                        this.goToSlide(this.currentSlide + 1); // Swipe left
                    }
                }
            }

            goToSlide(slideIndex) {
                // Handle boundaries
                if (slideIndex >= this.totalSlides) slideIndex = 0;
                if (slideIndex < 0) slideIndex = this.totalSlides - 1;

                this.currentSlide = slideIndex;

                // Update carousel position
                const translateX = -slideIndex * 100;
                gsap.to(this.carouselTrack, {
                    x: `${translateX}%`,
                    duration: 0.8,
                    ease: "power2.out"
                });

                // Update UI elements
                this.updateUI();
                this.animateSlideContent();
                this.resetAutoPlay();
            }

            updateUI() {
                // Update counter
                this.currentIndexSpan.textContent = this.currentSlide + 1;

                // Update thumbnails
                document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
                    thumb.classList.toggle('active', index === this.currentSlide);
                });

                // Update progress bar
                const progressWidth = ((this.currentSlide + 1) / this.totalSlides) * 100;
                gsap.to(this.progressBar, {
                    width: `${progressWidth}%`,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }

            animateSlideContent() {
                const currentSlideEl = this.carouselTrack.children[this.currentSlide];
                const content = currentSlideEl.querySelector('.slide-content');

                // Reset content animation
                gsap.set(content.querySelectorAll('.slide-title, .slide-description, .slide-features, .slide-cta'), {
                    opacity: 0,
                    y: 50
                });

                // Animate content
                const tl = gsap.timeline({ delay: 0.3 });

                tl.to(content.querySelector('.slide-title'), {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out"
                })
                    .to(content.querySelector('.slide-description'), {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    }, "-=0.6")
                    .to(content.querySelector('.slide-features'), {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    }, "-=0.4")
                    .to(content.querySelector('.slide-cta'), {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)"
                    }, "-=0.3");

                // Animate feature numbers
                content.querySelectorAll('.feature-number').forEach((number, index) => {
                    gsap.fromTo(number, {
                        scale: 0.5,
                        opacity: 0
                    }, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.6,
                        delay: 0.8 + (index * 0.1),
                        ease: "back.out(2)"
                    });
                });
            }

            togglePlayPause() {
                if (this.isPlaying) {
                    this.pauseAutoPlay();
                    this.playPauseBtn.textContent = '▶️';
                    this.playPauseBtn.classList.remove('active');
                } else {
                    this.resumeAutoPlay();
                    this.playPauseBtn.textContent = '⏸️';
                    this.playPauseBtn.classList.add('active');
                }
            }

            toggleShuffle() {
                this.isShuffleMode = !this.isShuffleMode;
                this.shuffleBtn.classList.toggle('active', this.isShuffleMode);

                if (this.isShuffleMode) {
                    this.shuffleBtn.style.color = '#60A5FA';
                } else {
                    this.shuffleBtn.style.color = '';
                }
            }

            startAutoPlay() {
                if (!this.isPlaying) return;

                this.autoPlayInterval = setInterval(() => {
                    let nextSlide;
                    if (this.isShuffleMode) {
                        do {
                            nextSlide = Math.floor(Math.random() * this.totalSlides);
                        } while (nextSlide === this.currentSlide);
                    } else {
                        nextSlide = this.currentSlide + 1;
                    }
                    this.goToSlide(nextSlide);
                }, this.slideTimeout);
            }

            pauseAutoPlay() {
                this.isPlaying = false;
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                }
            }

            resumeAutoPlay() {
                this.isPlaying = true;
                this.startAutoPlay();
            }

            resetAutoPlay() {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                }
                if (this.isPlaying) {
                    this.startAutoPlay();
                }
            }

            toggleFullscreen() {
                const carousel = document.getElementById('imageCarousel');

                if (!document.fullscreenElement) {
                    if (carousel.requestFullscreen) {
                        carousel.requestFullscreen();
                    } else if (carousel.webkitRequestFullscreen) {
                        carousel.webkitRequestFullscreen();
                    } else if (carousel.msRequestFullscreen) {
                        carousel.msRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            }
        }

  // --------------------------------
  // Property Cards Carousel (scoped per section)
  // --------------------------------
  function initPropertyCardsCarousel(sectionRoot) {
    if (!sectionRoot) return;

    const container = sectionRoot.querySelector('.carousel-container');
    const track = sectionRoot.querySelector('#carouselTrack'); // duplicate ID, but scoped
    const prevBtn = sectionRoot.querySelector('#prevBtn');     // duplicate ID, but scoped
    const nextBtn = sectionRoot.querySelector('#nextBtn');     // duplicate ID, but scoped
    const dotsContainer = sectionRoot.querySelector('#dotsContainer'); // duplicate ID, scoped

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
      const gap = parseFloat(getComputedStyle(track).gap || '0'); // gap-8 -> 32px
      return slideWidth + gap;
    }

    function getMaxIndex() {
      const overflowBox = container.querySelector('.overflow-hidden');
      const containerWidth = overflowBox ? overflowBox.offsetWidth : container.offsetWidth;
      const first = slides[0];
      const gap = 32;
      const slideWidth = first ? first.offsetWidth : 0;
      const perView = Math.max(1, Math.floor(containerWidth / (slideWidth + gap)));
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
      if (current < max) current++;
      else current = 0; // loop
      update();
    }

    function prev() {
      if (current > 0) current--;
      update();
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

    // Keyboard only when hovered over this section
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

    // Entrances + parallax
    if (hasGSAP && plugins.ScrollTrigger) {
      $$('.parallax-img', track).forEach((img) => {
        const card = img.closest('.property-card');
        if (!card) return;
        gsap.fromTo(
          img,
          { yPercent: -5, scale: 1.05 },
          { yPercent: 5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      });

      gsap.timeline({ delay: 0.2 })
        .from($$('.property-card', track), { y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' })
        .from($$('#dotsContainer .dot', sectionRoot), { scale: 0, duration: 0.25, stagger: 0.05, ease: 'back.out(1.7)' }, '-=0.2');
    }

    // Card hover lift
    slides.forEach((card, i) => {
      card.addEventListener('mouseenter', () => { if (hasGSAP && i !== current) gsap.to(card, { y: -5, duration: 0.2, ease: 'power2.out' }); });
      card.addEventListener('mouseleave', () => { if (hasGSAP && i !== current) gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out' }); });
      card.addEventListener('click', () => { if (i !== current) { goTo(i); pauseAndResume(); } });
    });

    // Build & start
    buildDots();
    update(false);
    startAuto();

    // Resize
    window.addEventListener('resize', () => update(false), { passive: true });
  }

  // --------------------------------
  // Extra Interactions
  // --------------------------------
  function initExtraInteractions() {
    // Slide CTA hover scale
    document.addEventListener('mouseover', (e) => {
      const cta = e.target?.closest?.('.slide-cta');
      if (!cta || !hasGSAP) return;
      gsap.to(cta, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
    });
    document.addEventListener('mouseout', (e) => {
      const cta = e.target?.closest?.('.slide-cta');
      if (!cta || !hasGSAP) return;
      gsap.to(cta, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });

    // Feature item slight hover
    document.addEventListener('mouseover', (e) => {
      const item = e.target?.closest?.('.feature-item');
      if (!item || !hasGSAP) return;
      gsap.to(item, { y: -5, duration: 0.3, ease: 'power2.out' });
    });
    document.addEventListener('mouseout', (e) => {
      const item = e.target?.closest?.('.feature-item');
      if (!item || !hasGSAP) return;
      gsap.to(item, { y: 0, duration: 0.3, ease: 'power2.out' });
    });

    // Parallax overlay on mousemove (only inside #imageCarousel)
    document.addEventListener('mousemove', (e) => {
      const carousel = $('#imageCarousel');
      if (!carousel) return;
      const rect = carousel.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      $$('.slide-overlay', carousel).forEach((overlay) => {
        if (!hasGSAP) return;
        gsap.to(overlay, {
          backgroundPosition: `${50 + (x - 0.5) * 10}% ${50 + (y - 0.5) * 10}%`,
          duration: 0.5,
          ease: 'power2.out',
        });
      });
    });
  }

  // --------------------------------
  // Initialize Carousels
  // --------------------------------
  function initCarousels() {
    // A) Image Carousel (single root: #imageCarousel)
    const imageCarouselRoot = document.getElementById('imageCarousel');
    if (imageCarouselRoot) {
      const imgCarousel = new PropertyImageCarousel(imageCarouselRoot);
      window.propertyCarousel = imgCarousel; // debug
    }

    // B) Property Cards Carousel(s) — initialize each section that has its own controls
    // Approach: find all #dotsContainer elements, scope to their section, ensure it contains .carousel-container and a scoped #carouselTrack.
    const dotElements = document.querySelectorAll('#dotsContainer');
    const initialized = new Set();
    dotElements.forEach((dot) => {
      const sec = dot.closest('section');
      if (!sec || initialized.has(sec)) return;
      const hasContainer = !!sec.querySelector('.carousel-container');
      const hasTrack = !!sec.querySelector('#carouselTrack');
      if (hasContainer && hasTrack) {
        initPropertyCardsCarousel(sec);
        initialized.add(sec);
      }
    });
  }

  // --------------------------------
  // Boot
  // --------------------------------
  onReady(() => {
    initSmoothScrolling();
    initInputInteractions();
    initFormHandling();
    initExtraInteractions();
  });

  onLoad(() => {
    initGlobalAnimations();
    initCarousels();
    console.log("🏠 All-in-One initialized. Carousels and animations are ready.");
    console.log('⌨️ Shortcuts for image carousel: ←/→ navigate, Space play/pause, F fullscreen (while hovered)');
  });
})();