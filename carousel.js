(function () {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const prev = carousel.querySelector('.nav.prev');
        const next = carousel.querySelector('.nav.next');
        const cards = Array.from(carousel.querySelectorAll('.game-card'));

        if (!track || !prev || !next || cards.length === 0) return;

        // ===== IDENTIFICAR CARRUSEL DESTACADO =====
        const isFeaturedCarousel = carousel.id === 'carousel-featured';

        // ===== ESTADO DE NAVEGACIÓN =====
        let currentIndex = 0;
        let isScrolling = false;

        // ===== ESTADO DE DRAG =====
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;

        // ===== HABILITAR SCROLL SNAP SI ES EL CARRUSEL DESTACADO =====
        if (isFeaturedCarousel) {
            track.style.scrollSnapType = 'x mandatory';
            cards.forEach(card => {
                card.style.scrollSnapAlign = 'center';
                card.style.scrollSnapStop = 'always';
            });
        }

        // ===== FUNCIÓN: Obtener índice de la card más cercana al centro =====
        function getClosestCardIndex() {
            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;

            let closestIndex = 0;
            let minDistance = Infinity;

            cards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - trackCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            return closestIndex;
        }

        // ===== FUNCIÓN: Scroll a índice específico =====
        function scrollToIndex(index) {
            const targetIndex = Math.max(0, Math.min(index, cards.length - 1));
            const targetCard = cards[targetIndex];
            if (!targetCard) return;

            targetCard.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });

            currentIndex = targetIndex;
        }

        // ===== FUNCIÓN: Actualizar botones =====
        function updateButtons() {
            const maxScroll = track.scrollWidth - track.clientWidth;
            const scrollLeft = track.scrollLeft;

            prev.disabled = scrollLeft <= 2;
            next.disabled = scrollLeft >= maxScroll - 2;

            if (isFeaturedCarousel) {
                prev.disabled = currentIndex <= 0;
                next.disabled = currentIndex >= cards.length - 1;
            }
        }

        // ===== FUNCIÓN: Aplicar efecto Coverflow CON ANIMACIÓN =====
        function applyCoverflowEffect() {
            if (!isFeaturedCarousel) return;

            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;

            let closestCard = null;
            let minDistance = Infinity;

            cards.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distanceFromCenter = Math.abs(cardCenter - trackCenter);

                if (distanceFromCenter < minDistance) {
                    minDistance = distanceFromCenter;
                    closestCard = card;
                }

                // Cálculos de efectos
                const maxDistance = trackRect.width / 2;
                const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

                // Efectos visuales
                const minScale = 0.8;
                const scale = 1 - (normalizedDistance * (1 - minScale));

                const minOpacity = 0.5;
                const opacity = 1 - (normalizedDistance * (1 - minOpacity));

                const maxDarkness = 0.6;
                const brightness = 1 - (normalizedDistance * (1 - maxDarkness));

                // ===== APLICAR CON TRANSICIONES =====
                // Las transiciones CSS se encargan de la animación suave
                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                card.style.filter = `brightness(${brightness})`;

                // Remover clase active de todas
                card.classList.remove('active');
            });

            // Agregar clase active SOLO a la más cercana
            if (closestCard) {
                closestCard.classList.add('active');
            }
        }

        // ===== DRAG: Inicio =====
        function handleDragStart(e) {
            isDragging = true;
            track.style.scrollSnapType = 'none'; // Desactivar snap durante drag
            track.style.cursor = 'grabbing';
            track.style.userSelect = 'none';

            // Guardar posición inicial
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            scrollLeft = track.scrollLeft;

            // Para calcular velocidad
            lastX = startX;
            lastTime = Date.now();
            velocity = 0;

            // Prevenir selección de texto
            e.preventDefault();
        }

        // ===== DRAG: Movimiento =====
        function handleDragMove(e) {
            if (!isDragging) return;

            const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const walk = (x - startX) * 2.5; // Multiplicador para sensibilidad
            track.scrollLeft = scrollLeft - walk;

            // Calcular velocidad para inercia
            const now = Date.now();
            const dt = now - lastTime;
            if (dt > 0) {
                velocity = (x - lastX) / dt;
            }
            lastX = x;
            lastTime = now;
        }

        // ===== DRAG: Fin =====
        function handleDragEnd() {
            if (!isDragging) return;

            isDragging = false;
            track.style.cursor = 'grab';
            track.style.userSelect = '';

            // Reactivar scroll snap
            if (isFeaturedCarousel) {
                track.style.scrollSnapType = 'x mandatory';
            }

            // Inercia: si la velocidad es alta, continuar el movimiento
            if (Math.abs(velocity) > 0.5) {
                const inertiaDistance = velocity * 200; // Factor de inercia
                track.scrollBy({
                    left: -inertiaDistance,
                    behavior: 'smooth'
                });
            }

            // Después de la inercia, el snap centrará automáticamente
            setTimeout(() => {
                if (isFeaturedCarousel) {
                    currentIndex = getClosestCardIndex();
                    applyCoverflowEffect();
                }
                updateButtons();
            }, 300);
        }

        // ===== EVENTOS DE DRAG =====
        // Mouse
        track.addEventListener('mousedown', handleDragStart);
        track.addEventListener('mousemove', handleDragMove);
        track.addEventListener('mouseup', handleDragEnd);
        track.addEventListener('mouseleave', handleDragEnd);

        // Touch (móviles)
        track.addEventListener('touchstart', handleDragStart, { passive: false });
        track.addEventListener('touchmove', handleDragMove, { passive: false });
        track.addEventListener('touchend', handleDragEnd);

        // Estilo de cursor
        track.style.cursor = 'grab';

        // ===== NAVEGACIÓN CON BOTONES =====
        prev.addEventListener('click', () => {
            if (isScrolling) return;
            isScrolling = true;

            if (isFeaturedCarousel) {
                scrollToIndex(currentIndex - 1);
            } else {
                const step = cards[0].getBoundingClientRect().width +
                    (parseFloat(getComputedStyle(track).gap) || 18);
                track.scrollBy({ left: -step, behavior: 'smooth' });
            }

            setTimeout(() => { isScrolling = false; }, 600);
        });

        next.addEventListener('click', () => {
            if (isScrolling) return;
            isScrolling = true;

            if (isFeaturedCarousel) {
                scrollToIndex(currentIndex + 1);
            } else {
                const step = cards[0].getBoundingClientRect().width +
                    (parseFloat(getComputedStyle(track).gap) || 18);
                track.scrollBy({ left: step, behavior: 'smooth' });
            }

            setTimeout(() => { isScrolling = false; }, 600);
        });

        // ===== NAVEGACIÓN CON TECLADO =====
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                next.click();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prev.click();
            }
        });

        // ===== EVENTO: Durante scroll =====
        let scrollTimeout = null;
        track.addEventListener('scroll', () => {
            if (isFeaturedCarousel) {
                applyCoverflowEffect(); // ← Esto anima las cards durante scroll
            }
            updateButtons();

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (isFeaturedCarousel) {
                    currentIndex = getClosestCardIndex();
                    applyCoverflowEffect();
                }
                updateButtons();
            }, 150);
        }, { passive: true });

        // ===== EVENTO: Resize =====
        let resizeTimeout = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isFeaturedCarousel) {
                    scrollToIndex(currentIndex);
                    applyCoverflowEffect();
                }
                updateButtons();
            }, 200);
        });

        // ===== INICIALIZACIÓN =====
        if (isFeaturedCarousel) {
            scrollToIndex(0);
            applyCoverflowEffect();
        }
        updateButtons();
    });
})();