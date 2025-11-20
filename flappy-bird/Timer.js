/**
 * Timer para medir tiempo transcurrido y notificar en intervalos
 */
export class Timer {
    constructor(intervaloNotificacion = 10) {
        // Tiempo transcurrido en segundos
        this.tiempoTranscurrido = 0;

        // Última vez que se registró un frame
        this.ultimoFrame = Date.now();

        // Cada cuántos segundos notifica
        this.intervaloNotificacion = intervaloNotificacion;

        // Próximo momento de notificación
        this.proximaNotificacion = intervaloNotificacion;

        console.log(`Timer creado: notifica cada ${intervaloNotificacion}s`);
    }

    /**
     * Actualiza el timer y calcula deltaTime
     * @returns {boolean} - True si llegó al intervalo de notificación
     */
    update() {
        const tiempoActual = Date.now();
        const deltaTime = (tiempoActual - this.ultimoFrame) / 1000;
        this.ultimoFrame = tiempoActual;

        this.tiempoTranscurrido += deltaTime;

        // Verificar si llegamos al intervalo
        if (this.tiempoTranscurrido >= this.proximaNotificacion) {
            this.proximaNotificacion += this.intervaloNotificacion;
            return true;
        }

        return false;
    }

    /**
     * Obtiene el tiempo en segundos
     */
    getTiempoSegundos() {
        return Math.floor(this.tiempoTranscurrido);
    }

    /**
     * Obtiene el tiempo formateado MM:SS
     */
    getTiempoFormateado() {
        const totalSegundos = Math.floor(this.tiempoTranscurrido);
        const minutos = Math.floor(totalSegundos / 60);
        const segundos = totalSegundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    /**
     * Reinicia el timer a cero
     */
    reset() {
        this.tiempoTranscurrido = 0;
        this.ultimoFrame = Date.now();
        this.proximaNotificacion = this.intervaloNotificacion;
    }
}