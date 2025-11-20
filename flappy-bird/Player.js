import { AnimationController } from './AnimationController.js';
import { FisicaPlayer } from './FisicaPlayer.js';

export class Player {
    constructor(x, y, canvasHeight) {
        // === POSICIÓN ===
        this.x = x;
        this.y = y;
        this.posicionInicialY = y;

        // === FÍSICA (DELEGADA) ===
        this.fisica = new FisicaPlayer(0.5, -8, 25);

        // === VISUAL ===
        this.radio = 25;
        this.color = '#FF0000';
        this.canvasHeight = canvasHeight;

        // === ROTACIÓN ===
        this.rotacion = 0;
        this.rotacionMaxima = Math.PI / 3;

        // === SPRITES ===
        this.spriteNormal = new Image();
        this.spriteNormal.src = '../imagenes/flappy-bird/stich-sp-default.png';

        this.spriteVoltereta = new Image();
        this.spriteVoltereta.src = '../imagenes/flappy-bird/stich-sp-voltereta.png';

        // === ANIMACIÓN DE VOLTERETA ===
        this.animacionVoltereta = this.crearAnimacionVoltereta();

        // === ESTADOS ===
        this.estaEnVoltereta = false;
        this.tiempoCayendo = 0;
        this.umbralVoltereta = 0.2;

        this.spriteActual = this.spriteNormal;
        this.spriteCargado = false;

        this.spriteNormal.onload = () => {
            this.spriteCargado = true;
            console.log('✅ Sprite normal cargado');
        };

        console.log('🎮 Player creado');
    }

    crearAnimacionVoltereta() {
        const frames = Array(6).fill(this.spriteVoltereta);
        const animacion = new AnimationController(frames, 0.05, true);
        console.log('🌀 Animación de voltereta creada');
        return animacion;
    }

    /**
     * Actualiza física, rotación y animaciones
     */
    update(deltaTime = 1/60) {
        // Actualizar física
        this.fisica.update();

        // Aplicar velocidad a la posición
        this.y += this.fisica.obtenerVelocidad();

        // Colisiones con bordes
        this.verificarColisionesBordes();

        // Visual
        this.actualizarRotacion();
        this.actualizarEstadoCaida(deltaTime);
        this.actualizarSprite(deltaTime);
    }

    /**
     * Verifica colisiones con techo y suelo
     */
    verificarColisionesBordes() {
        // Colisión con suelo
        if (this.y + this.radio > this.canvasHeight) {
            this.y = this.canvasHeight - this.radio;
            this.fisica.detener();
            this.resetearEstadoCaida();
        }

        // Colisión con techo
        if (this.y - this.radio < 0) {
            this.y = this.radio;
            this.fisica.detener();
        }
    }

    /**
     * Actualiza la rotación del sprite según la velocidad
     */
    actualizarRotacion() {
        if (this.estaEnVoltereta) return;

        // Mapear velocidad Y a rotación
        const velocidadActual = this.fisica.obtenerVelocidad();
        const rotacionObjetivo = velocidadActual * (this.rotacionMaxima / 15);

        // Interpolación suave
        const velocidadRotacion = 0.2;
        this.rotacion += (rotacionObjetivo - this.rotacion) * velocidadRotacion;

        // Limitar rotación
        this.rotacion = Math.max(-this.rotacionMaxima, Math.min(this.rotacionMaxima, this.rotacion));
    }

    /**
     * Gestiona el estado de caída y la voltereta
     */
    actualizarEstadoCaida(deltaTime) {
        // Usar el método de la clase de física
        const estaCayendoRapido = this.fisica.estaCayendoRapido(1);

        if (estaCayendoRapido) {
            this.tiempoCayendo += deltaTime;

            if (this.tiempoCayendo >= this.umbralVoltereta && !this.estaEnVoltereta) {
                this.iniciarVoltereta();
            }
        } else {
            if (this.estaEnVoltereta) {
                this.detenerVoltereta();
            }
            this.tiempoCayendo = 0;
        }
    }

    iniciarVoltereta() {
        this.estaEnVoltereta = true;
        this.animacionVoltereta.play();
        this.rotacion = 0;
        console.log('🌀 Voltereta activada');
    }

    detenerVoltereta() {
        this.estaEnVoltereta = false;
        this.animacionVoltereta.stop();
        this.spriteActual = this.spriteNormal;
        console.log('🛑 Voltereta detenida');
    }

    resetearEstadoCaida() {
        this.tiempoCayendo = 0;
        if (this.estaEnVoltereta) {
            this.detenerVoltereta();
        }
    }

    actualizarSprite(deltaTime) {
        if (this.estaEnVoltereta) {
            this.animacionVoltereta.update(deltaTime);
            this.spriteActual = this.animacionVoltereta.getSpriteActual();
        } else {
            this.spriteActual = this.spriteNormal;
        }
    }

    /**
     * Aplica impulso de salto (delegado a la física)
     */
    jump() {
        this.fisica.saltar();
        this.resetearEstadoCaida();
        console.log('⬆️ Salto');
    }

    draw(ctx) {
        if (this.spriteCargado) {
            const tamanio = 125;
            const mitad = tamanio / 2;

            ctx.save();
            ctx.translate(this.x, this.y);

            if (!this.estaEnVoltereta) {
                ctx.rotate(this.rotacion);
            } else {
                const progresoAnimacion = this.animacionVoltereta.frameActual / this.animacionVoltereta.sprites.length;
                const rotacionVoltereta = progresoAnimacion * Math.PI * 2;
                ctx.rotate(rotacionVoltereta);
            }

            ctx.drawImage(this.spriteActual, -mitad, -mitad, tamanio, tamanio);
            ctx.restore();

        } else {
            // Círculo temporal
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    reset() {
        this.y = this.posicionInicialY;
        this.rotacion = 0;
        this.fisica.reset();
        this.resetearEstadoCaida();
    }
}