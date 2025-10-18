(function () {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const prev = carousel.querySelector('.nav.prev');
        const next = carousel.querySelector('.nav.next');
        const cards = Array.from(carousel.querySelectorAll('.game-card'));

        if (!track || !prev || !next || cards.length === 0) return;

        // ===== VERIFICAR SI ESTE CARRUSEL DEBE TENER EFECTO =====
        const isFeaturedCarousel = carousel.id === 'carousel-featured';

        // ===== CONFIGURACIÓN =====
        let isScrolling = false;
        let scrollTimeout = null;

        // ===== FUNCIÓN: Calcular desplazamiento CORRECTO =====
        function getStep() {
            // Obtener el ancho de una card incluyendo el gap
            const trackStyles = getComputedStyle(track);
            const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 18;

            // Obtener el ancho real de una card
            const firstCard = cards[0];
            if (!firstCard) return 300;

            const cardWidth = firstCard.getBoundingClientRect().width;

            // Retornar ancho + gap para desplazamiento preciso
            return cardWidth + gap;
        }

        // ===== FUNCIÓN: Actualizar estado de botones =====
        function updateButtons() {
            const maxScroll = track.scrollWidth - track.clientWidth;

            // Considerar un pequeño margen de error (2px)
            const isAtStart = track.scrollLeft <= 2;
            const isAtEnd = track.scrollLeft >= maxScroll - 2;

            prev.disabled = isAtStart;
            next.disabled = isAtEnd;
        }

        // ===== FUNCIÓN: Aplicar efecto Coverflow (SIN BLUR) =====
        function applyCoverflowEffect() {
            // Solo aplicar si es el carrusel destacado
            if (!isFeaturedCarousel) return;

            // Obtener el centro del track (viewport del carrusel)
            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;

            cards.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;

                // Calcular distancia del centro
                const distanceFromCenter = Math.abs(cardCenter - trackCenter);

                // Normalizar distancia (0 = centro, 1 = borde)
                const maxDistance = trackRect.width / 2;
                const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

                // ===== EFECTOS VISUALES (SIN BLUR) =====

                // 1. ESCALA: 1.0 en centro → 0.8 en bordes
                const minScale = 0.8;
                const scale = 1 - (normalizedDistance * (1 - minScale));

                // 2. OPACIDAD: 1.0 en centro → 0.5 en bordes
                const minOpacity = 0.5;
                const opacity = 1 - (normalizedDistance * (1 - minOpacity));

                // 3. BRILLO: Normal en centro → oscurecido en bordes
                const maxDarkness = 0.6; // 60% de brillo en bordes
                const brightness = 1 - (normalizedDistance * (1 - maxDarkness));

                // ===== APLICAR TRANSFORMACIONES =====
                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                card.style.filter = `brightness(${brightness})`; // Brillo en vez de blur

                // ===== CLASE 'ACTIVE' =====
                // Card está en el centro si distance < 15% del máximo
                if (normalizedDistance < 0.15) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

        // ===== FUNCIÓN: Navegación suave con callback =====
        function smoothScroll(direction) {
            if (isScrolling) return; // Prevenir múltiples clicks rápidos

            isScrolling = true;
            const step = getStep();
            const scrollAmount = direction === 'next' ? step : -step;

            track.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });

            // Resetear flag después de la animación
            setTimeout(() => {
                isScrolling = false;
            }, 400); // Duración de scroll smooth
        }

        // ===== EVENTOS DE NAVEGACIÓN =====
        prev.addEventListener('click', () => {
            smoothScroll('prev');
        });

        next.addEventListener('click', () => {
            smoothScroll('next');
        });

        // ===== NAVEGACIÓN CON TECLADO =====
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                smoothScroll('next');
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                smoothScroll('prev');
            }
        });

        // ===== EVENTO: Durante el scroll =====
        track.addEventListener('scroll', () => {
            // Aplicar efecto coverflow si corresponde
            if (isFeaturedCarousel) {
                applyCoverflowEffect();
            }

            // Actualizar botones
            updateButtons();

            // Debounce: limpiar timeout anterior
            clearTimeout(scrollTimeout);

            // Actualizar nuevamente después de que termine el scroll
            scrollTimeout = setTimeout(() => {
                updateButtons();
                if (isFeaturedCarousel) {
                    applyCoverflowEffect();
                }
            }, 150);
        }, { passive: true });

        // ===== EVENTO: Redimensionar ventana =====
        let resizeTimeout = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isFeaturedCarousel) {
                    applyCoverflowEffect();
                }
                updateButtons();
            }, 200);
        });

        // ===== INICIALIZACIÓN =====
        if (isFeaturedCarousel) {
            applyCoverflowEffect();
        }
        updateButtons();
    });
})();