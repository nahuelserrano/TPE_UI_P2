// menu.js
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('#menuBtn') || document.querySelector('.icon-btn');
    const drawer = document.getElementById('drawer');
    const closeBtn = document.getElementById('drawerClose');
    const backdrop = document.getElementById('backdrop');

    if (!menuBtn || !drawer || !closeBtn || !backdrop) return;

    const openDrawer = () => {
        drawer.classList.add('open');
        backdrop.classList.add('show');
        backdrop.hidden = false;
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('drawer-open');
        // foco al botón cerrar
        closeBtn.focus();
    };

    const closeDrawer = () => {
        drawer.classList.remove('open');
        backdrop.classList.remove('show');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('drawer-open');
        // pequeño delay para ocultar el nodo y permitir la animación
        setTimeout(() => { if (!backdrop.classList.contains('show')) backdrop.hidden = true; }, 250);
    };

    menuBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
});
