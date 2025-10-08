// carousel.js
(function () {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const prev = carousel.querySelector('.nav.prev');
        const next = carousel.querySelector('.nav.next');

        // Calcula el espacio entre tarjetas para un desplazamiento preciso
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18;

        // Calcula cuánto se debe desplazar el carrusel con cada clic
        function getStep() {
            const card = carousel.querySelector('.game-card');
            if (!card) return 300; // Un valor por defecto si no hay tarjetas
            const rect = card.getBoundingClientRect();
            return rect.width + gap; // Desplaza el ancho de una tarjeta más el espacio
        }

        // Habilita o deshabilita los botones de navegación si se llega al final
        function updateButtons() {
            // Se resta 1 para asegurar que el final se detecte correctamente
            const maxScroll = track.scrollWidth - track.clientWidth - 1;
            prev.disabled = track.scrollLeft <= 0;
            next.disabled = track.scrollLeft >= maxScroll;
        }

        // --- Navegación con los botones (Flechas) ---
        prev.addEventListener('click', () => {
            track.scrollBy({ left: -getStep(), behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            track.scrollBy({ left:  getStep(), behavior: 'smooth' });
        });


        // --- SE HA ELIMINADO TODA LA LÓGICA DE DRAG / SWIPE ---


        // Navegación con teclado (opcional)
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') next.click();
            if (e.key === 'ArrowLeft')  prev.click();
        });

        // Actualiza los botones al hacer scroll o cambiar el tamaño de la ventana
        track.addEventListener('scroll', updateButtons, { passive: true });
        window.addEventListener('resize', updateButtons);

        // Llama a la función una vez al inicio para establecer el estado inicial de los botones
        updateButtons();
    });
})();