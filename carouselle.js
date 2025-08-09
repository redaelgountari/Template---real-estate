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

        // Initialize carousel when page loads
        window.addEventListener('load', () => {
            const carousel = new PropertyImageCarousel();

            // Make available globally for console debugging
            window.propertyCarousel = carousel;

            // Additional GSAP animations for UI elements
            gsap.fromTo('.carousel-arrow', {
                opacity: 0,
                scale: 0.5
            }, {
                opacity: 1,
                scale: 1,
                duration: 1,
                delay: 1,
                stagger: 0.2,
                ease: "back.out(1.7)"
            });

            gsap.fromTo('.carousel-controls .control-btn', {
                opacity: 0,
                y: -30
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 1.2,
                stagger: 0.1,
                ease: "power2.out"
            });

            gsap.fromTo('.image-counter', {
                opacity: 0,
                x: 30
            }, {
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: 1.4,
                ease: "power2.out"
            });

            gsap.fromTo('.thumbnail-nav', {
                opacity: 0,
                y: 30
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 1.6,
                ease: "power2.out"
            });

            gsap.fromTo('.fullscreen-btn', {
                opacity: 0,
                scale: 0.5
            }, {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                delay: 1.8,
                ease: "back.out(1.7)"
            });
        });

        // Add some additional interactive effects
        document.addEventListener('DOMContentLoaded', () => {
            // Enhanced hover effects for CTAs
            document.addEventListener('mouseover', (e) => {
                if (e.target.classList.contains('slide-cta')) {
                    gsap.to(e.target, {
                        scale: 1.05,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            document.addEventListener('mouseout', (e) => {
                if (e.target.classList.contains('slide-cta')) {
                    gsap.to(e.target, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            // Feature items hover animation
            document.addEventListener('mouseover', (e) => {
                if (e.target.closest('.feature-item')) {
                    const item = e.target.closest('.feature-item');
                    gsap.to(item, {
                        y: -5,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            document.addEventListener('mouseout', (e) => {
                if (e.target.closest('.feature-item')) {
                    const item = e.target.closest('.feature-item');
                    gsap.to(item, {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            // Add parallax effect to slide overlays
            document.addEventListener('mousemove', (e) => {
                const carousel = document.getElementById('imageCarousel');
                const rect = carousel.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                document.querySelectorAll('.slide-overlay').forEach((overlay) => {
                    gsap.to(overlay, {
                        backgroundPosition: `${50 + (x - 0.5) * 10}% ${50 + (y - 0.5) * 10}%`,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                });
            });
        });

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (document.fullscreenElement) {
                fullscreenBtn.textContent = '⛉';
                fullscreenBtn.title = 'Quitter plein écran';
            } else {
                fullscreenBtn.textContent = '⛶';
                fullscreenBtn.title = 'Mode plein écran';
            }
        });

        // Add loading progress feedback
        window.addEventListener('load', () => {
            console.log('🏠 Carousel d\'images immobilières chargé avec succès!');
            console.log('⌨️ Raccourcis clavier: ←→ (navigation), Espace (pause), F (plein écran)');
        });