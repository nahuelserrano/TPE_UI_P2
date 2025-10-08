// loader.js
(function () {
    const scr = document.getElementById('loading-screen');
    const pct = document.getElementById('percentage');
    if (!scr || !pct) return;

    // Todas las imágenes que debe cargar la página (incluye carruseles)
    const imgs = Array.from(document.images);
    const total = Math.max(imgs.length, 1);
    let loaded = 0;

    const setPct = (n) => { pct.textContent = `${n}%`; };

    function tick() {
        const n = Math.min(100, Math.round((loaded / total) * 100));
        setPct(n);
        if (n >= 100) hide();
    }

    function hide() {
        // Quita el loader con una transición
        scr.classList.add('is-hidden');
        // opcional: retirarlo del DOM luego de la animación
        setTimeout(() => scr.remove(), 450);
    }

    // Contabiliza imágenes ya listas
    imgs.forEach(img => {
        if (img.complete) {
            loaded++; tick();
        } else {
            img.addEventListener('load', () => { loaded++; tick(); }, { once: true });
            img.addEventListener('error', () => { loaded++; tick(); }, { once: true });
        }
    });

    // Fallback: cuando todo el documento terminó de cargar
    window.addEventListener('load', () => { loaded = total; tick(); });

    // Safety net por si alguna imagen nunca emite eventos
    setTimeout(() => { loaded = total; tick(); }, 8000);
})();
