/**
 * Maneja la física del jugador (gravedad, velocidad, salto)
 * Separada de la visualización y lógica del Player
 */
export class FisicaPlayer {
    constructor(gravedad = 0.5, fuerzaSalto = -8, velocidadMaxima = 25) {
        // Configuración de física
        this.gravedad = gravedad;
        this.fuerzaSalto = fuerzaSalto;
        this.velocidadMaxima = velocidadMaxima;

        // Estado actual
        this.velocidadY = 0;

    }

    /**
     * Actualiza la velocidad aplicando gravedad
     */
    update() {
        // Aplicar gravedad
        this.velocidadY += this.gravedad;

        // Limitar velocidad máxima de caída
        if (this.velocidadY > this.velocidadMaxima) {
            this.velocidadY = this.velocidadMaxima;
        }
    }

    /**
     * Aplica impulso de salto
     */
    saltar() {
        this.velocidadY = this.fuerzaSalto;
    }

    /**
     * Obtiene la velocidad vertical actual
     */
    obtenerVelocidad() {
        return this.velocidadY;
    }

    /**
     * Establece la velocidad vertical (útil para colisiones)
     */
    establecerVelocidad(velocidad) {
        this.velocidadY = velocidad;
    }

    /**
     * Resetea la velocidad a cero
     */
    detener() {
        this.velocidadY = 0;
    }

    /**
     * Verifica si está cayendo rápidamente
     */
    estaCayendoRapido(umbral = 1) {
        return this.velocidadY > umbral;
    }

    /**
     * Verifica si está subiendo
     */
    estaSubiendo() {
        return this.velocidadY < 0;
    }

    /**
     * Resetea toda la física al estado inicial
     */
    reset() {
        this.velocidadY = 0;
    }
}