(function () {
    // ===== REFERENCIAS AL DOM =====
    const scr = document.getElementById('loading-screen');
    const pct = document.getElementById('percentage');

    // ===== CONFIGURACIÓN DEL LOADING =====
    const TOTAL_TIME = 5000;        // 5 segundos en milisegundos
    const UPDATE_INTERVAL = 50;     // Actualizar cada 50ms (suave)
    const TOTAL_STEPS = TOTAL_TIME / UPDATE_INTERVAL; // 100 pasos
    const INCREMENT = 100 / TOTAL_STEPS; // 1% por paso

    let currentPercentage = 0;      // % actual mostrado
    let intervalId = null;          // ID del interval para poder detenerlo

    // ===== ACTUALIZAR EL % =====
    function updatePercentage() {
        // Incrementar el porcentaje
        currentPercentage += INCREMENT;

        // Asegurar que no pase del 100%
        if (currentPercentage >= 100) {
            currentPercentage = 100;
            pct.textContent = '100%';
            stopLoading(); // Detener y ocultar
            return;
        }

        // Actualizar el texto
        pct.textContent = `${Math.floor(currentPercentage)}%`;
    }

    // ===== FUNCIÓN PARA DETENER Y OCULTAR =====
    function stopLoading() {
        // Detener el interval
        clearInterval(intervalId);

        // Agregar clase para transición CSS
        scr.classList.add('is-hidden');

        // Opcional: remover del DOM después de la animación
        setTimeout(() => {
            scr.remove();
        }, 450); // 450ms = duración de tu transición CSS
    }

    // ===== INICIAR EL LOADING =====
    // Mostrar 0% al inicio
    pct.textContent = '0%';

    // Iniciar el interval que actualiza cada 50ms
    intervalId = setInterval(updatePercentage, UPDATE_INTERVAL);

})();