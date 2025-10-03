// carousel.js
(function () {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const prev = carousel.querySelector('.nav.prev');
        const next = carousel.querySelector('.nav.next');

        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18;

        function getStep() {
            const card = carousel.querySelector('.game-card');
            if (!card) return 300;
            const rect = card.getBoundingClientRect();
            return rect.width + gap; // 1 card por click (podés multiplicar por 2)
        }

        function updateButtons() {
            const maxScroll = track.scrollWidth - track.clientWidth - 1;
            prev.disabled = track.scrollLeft <= 0;
            next.disabled = track.scrollLeft >= maxScroll;
        }

        // Clicks
        prev.addEventListener('click', () => {
            track.scrollBy({ left: -getStep(), behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            track.scrollBy({ left:  getStep(), behavior: 'smooth' });
        });

        // Drag / Swipe
        let isDown = false, startX = 0, startScroll = 0, pointerId = null;

        track.addEventListener('pointerdown', (e) => {
            isDown = true;
            pointerId = e.pointerId;
            startX = e.clientX;
            startScroll = track.scrollLeft;
            track.setPointerCapture(pointerId);
            track.style.cursor = 'grabbing';
        });

        track.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            track.scrollLeft = startScroll - dx;
            updateButtons();
        });

        ['pointerup','pointercancel','pointerleave'].forEach(type => {
            track.addEventListener(type, () => {
                if (!isDown) return;
                isDown = false;
                track.style.cursor = '';
                if (pointerId !== null) {
                    try { track.releasePointerCapture(pointerId); } catch {}
                    pointerId = null;
                }
            });
        });

        // Teclado (opcional)
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') next.click();
            if (e.key === 'ArrowLeft')  prev.click();
        });

        track.addEventListener('scroll', updateButtons, { passive: true });
        window.addEventListener('resize', updateButtons);
        updateButtons();
    });
})();
