import { Timer } from './timer.js';

export class AnimationController {
    /**
     * Controlador de animaciones por frames
     * @param {Array<Image>} sprites - Array de imágenes para la animación
     * @param {number} frameDuration - Duración de cada frame en SEGUNDOS
     * @param {boolean} loop - Si la animación se repite (true) o se detiene al final (false)
     */
    constructor(sprites, frameDuration = 0.1, loop = false) {
        // Sprites de la animación
        this.sprites = sprites;

        // Configuración
        this.frameDuration = frameDuration; // Duración de cada frame (en segundos)
        this.loop = loop;                   // ¿Se repite la animación?

        // Control de frames
        this.currentFrame = 0;              // Frame actual (índice del array)
        this.isPlaying = false;             // ¿Está reproduciéndose?
        this.hasFinished = false;           // ¿Terminó la animación?

        // Timer interno para controlar el tiempo entre frames
        this.timer = new Timer(frameDuration);

        console.log(`AnimationController creado: ${sprites.length} frames, ${frameDuration}s por frame, loop: ${loop}`);
    }

    /**
     * Inicia la animación desde el principio
     */
    play() {
        this.isPlaying = true;
        this.hasFinished = false;
        this.currentFrame = 0;
        this.timer.reset();
        console.log('Animación iniciada');
    }

    /**
     * Pausa la animación
     */
    pause() {
        this.isPlaying = false;
        console.log('Animación pausada');
    }

    /**
     * Detiene y resetea la animación
     */
    stop() {
        this.isPlaying = false;
        this.hasFinished = false;
        this.currentFrame = 0;
        this.timer.reset();
        console.log('Animación detenida');
    }

    /**
     * Actualiza la animación (llamar en cada frame del juego)
     */
    update() {
        // Si no está reproduciéndose, no hacer nada
        if (!this.isPlaying) return;

        // Actualizar el timer
        const shouldAdvance = this.timer.update();

        // Si el timer notifica, avanzar al siguiente frame
        if (shouldAdvance) {
            this.currentFrame++;

            // ¿Llegamos al final de la secuencia?
            if (this.currentFrame >= this.sprites.length) {
                if (this.loop) {
                    // Si hace loop, volver al principio
                    this.currentFrame = 0;
                } else {
                    // Si no hace loop, detener la animación
                    this.currentFrame = this.sprites.length - 1; // Quedarse en el último frame
                    this.isPlaying = false;
                    this.hasFinished = true;
                    console.log('Animación completada');
                }
            }
        }
    }

    /**
     * Obtiene el sprite actual que debe dibujarse
     * @returns {Image} - Imagen del frame actual
     */
    getCurrentSprite() {
        return this.sprites[this.currentFrame];
    }

    /**
     * Verifica si la animación terminó (solo relevante si loop = false)
     * @returns {boolean}
     */
    isFinished() {
        return this.hasFinished;
    }

    /**
     * Obtiene el progreso de la animación (0.0 a 1.0)
     * @returns {number}
     */
    getProgress() {
        return this.currentFrame / (this.sprites.length - 1);
    }
}