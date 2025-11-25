/**
 * Controlador de animaciones por frames
 */
export class AnimationController {
    /**
     * @param {Array<Image>} sprites - Array de imágenes para la animación
     * @param {number} duracionFrame - Duración de cada frame en SEGUNDOS
     * @param {boolean} loop - Si la animación se repite
     */
    constructor(sprites, duracionFrame = 0.1, loop = false) {
        // Sprites de la animación
        this.sprites = sprites;

        // Configuración
        this.duracionFrame = duracionFrame;  // Duración de cada frame (segundos)
        this.loop = loop;

        // Control de frames
        this.frameActual = 0;
        this.estaReproduciendo = false;
        this.haTerminado = false;

        // Control de tiempo
        this.tiempoAcumulado = 0;            // Tiempo transcurrido desde el último cambio de frame
    }

    /**
     * Inicia la animación desde el principio
     */
    play() {
        this.estaReproduciendo = true;
        this.haTerminado = false;
        this.frameActual = 0;
        this.tiempoAcumulado = 0;
    }

    /**
     * Pausa la animación
     */
    pause() {
        this.estaReproduciendo = false;
        console.log('Animación pausada');
    }

    /**
     * Detiene y resetea la animación
     */
    stop() {
        this.estaReproduciendo = false;
        this.haTerminado = false;
        this.frameActual = 0;
        this.tiempoAcumulado = 0;
        console.log('Animación detenida');
    }

    /**
     * Actualiza la animación (llamar en cada frame del juego)
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame (en segundos)
     */
    update(deltaTime = 1/60) {
        // Si no está reproduciéndose, no hacer nada
        if (!this.estaReproduciendo) return;

        // Acumular tiempo
        this.tiempoAcumulado += deltaTime;

        // ¿Es momento de avanzar al siguiente frame?
        if (this.tiempoAcumulado >= this.duracionFrame) {
            this.tiempoAcumulado = 0; // Resetear contador
            this.frameActual++;

            // ¿Llegamos al final de la secuencia?
            if (this.frameActual >= this.sprites.length) {
                if (this.loop) {
                    // Si hace loop, volver al principio
                    this.frameActual = 0;
                } else {
                    // Si no hace loop, quedarse en el último frame y detener
                    this.frameActual = this.sprites.length - 1;
                    this.estaReproduciendo = false;
                    this.haTerminado = true;
                    console.log('Animación completada');
                }
            }
        }
    }

    /**
     * Obtiene el sprite actual que debe dibujarse
     * @returns {Image} - Imagen del frame actual
     */
    getSpriteActual() {
        return this.sprites[this.frameActual];
    }
}