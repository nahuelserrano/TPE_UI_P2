export class Timer {
    constructor(notificationInterval = 10) {
        // Tiempo transcurrido en segundos
        this.elapsedTime = 0;

        // Última vez que se registró un frame
        this.lastFrameTime = Date.now();

        // Cada cuántos segundos notifica
        this.notificationInterval = notificationInterval;

        // Próximo momento de notificación
        this.nextNotificationAt = notificationInterval;

        console.log(`Timer creado: notifica cada ${notificationInterval}s`);
    }

    /**
     * Actualiza el timer
     * @returns {boolean} - True si llegó al intervalo de notificación
     */
    update() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        this.elapsedTime += deltaTime;

        // ¿Llegamos al intervalo?
        if (this.elapsedTime >= this.nextNotificationAt) {
            this.nextNotificationAt += this.notificationInterval;
            return true; // Notificar al Game
        }

        return false;
    }

    /**
     * Obtiene el tiempo en segundos (entero)
     */
    getTimeInSeconds() {
        return Math.floor(this.elapsedTime);
    }

    /**
     * Obtiene el tiempo formateado MM:SS
     */
    getFormattedTime() {
        const totalSeconds = Math.floor(this.elapsedTime);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Reinicia el timer
     */
    reset() {
        this.elapsedTime = 0;
        this.lastFrameTime = Date.now();
        this.nextNotificationAt = this.notificationInterval;
    }
}