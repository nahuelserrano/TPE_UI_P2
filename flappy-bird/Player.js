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
        this.umbralVoltereta = 0.3;

        // === SISTEMA DE COMBO ===
        this.comboActual = 0;
        this.tiempoDesdeUltimaVoltereta = 0;
        this.tiempoMaximoCombo = 2.0;  // Segundos para mantener el combo

        this.spriteActual = this.spriteNormal;
        this.spriteCargado = false;

        // === CALLBACK DE VOLTERETA ===
        this.onVolteretaCompletada = null;  // Se configura desde Game

        this.spriteNormal.onload = () => {
            this.spriteCargado = true;
            console.log('Sprite normal cargado');
        };

        console.log('Player creado');
    }

    /**
     * Registra un callback para cuando se complete una voltereta
     * @param {Function} callback - Función a ejecutar al completar voltereta
     */
    setOnVolteretaCompletada(callback) {
        this.onVolteretaCompletada = callback;
    }

    crearAnimacionVoltereta() {
        const frames = Array(6).fill(this.spriteVoltereta);
        const animacion = new AnimationController(frames, 0.05, true);
        return animacion;
    }

    update(deltaTime = 1/60) {
        this.fisica.update();
        this.y += this.fisica.obtenerVelocidad();
        this.verificarColisionesBordes();
        this.actualizarRotacion();
        this.actualizarEstadoCaida(deltaTime);
        this.actualizarSprite(deltaTime);

        // Actualizar timer del combo
        this.actualizarCombo(deltaTime);
    }

    /**
     * Gestiona el tiempo del combo
     * Si pasa mucho tiempo sin voltereta, se pierde el combo
     */
    actualizarCombo(deltaTime) {
        if (this.comboActual > 0) {
            this.tiempoDesdeUltimaVoltereta += deltaTime;

            // Si pasó el tiempo máximo, romper combo
            if (this.tiempoDesdeUltimaVoltereta >= this.tiempoMaximoCombo) {
                this.romperCombo('timeout');
            }
        }
    }

    /**
     * Rompe el combo actual
     */
    romperCombo(razon = 'unknown') {
        if (this.comboActual > 0) {
            console.log(`Combo roto (${razon}). Era: x${this.comboActual}`);
            this.comboActual = 0;
        }
        this.tiempoDesdeUltimaVoltereta = 0;
    }

    verificarColisionesBordes() {
        // Colisión con suelo
        if (this.y + this.radio > this.canvasHeight) {
            this.y = this.canvasHeight - this.radio;
            this.fisica.detener();
            this.resetearEstadoCaida();
            this.romperCombo('suelo');  // Rompe combo al tocar suelo
        }

        // Colisión con techo
        if (this.y - this.radio < 0) {
            this.y = this.radio;
            this.fisica.detener();
            this.romperCombo('techo');  // Rompe combo al tocar techo
        }
    }

    actualizarRotacion() {
        if (this.estaEnVoltereta) return;

        const velocidadActual = this.fisica.obtenerVelocidad();
        const rotacionObjetivo = velocidadActual * (this.rotacionMaxima / 15);
        const velocidadRotacion = 0.2;
        this.rotacion += (rotacionObjetivo - this.rotacion) * velocidadRotacion;
        this.rotacion = Math.max(-this.rotacionMaxima, Math.min(this.rotacionMaxima, this.rotacion));
    }

    actualizarEstadoCaida(deltaTime) {
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
        console.log('Voltereta activada');
    }

    detenerVoltereta() {
        this.estaEnVoltereta = false;
        this.animacionVoltereta.stop();
        this.spriteActual = this.spriteNormal;
        console.log('Voltereta detenida');
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
     * Obtiene el combo actual (para mostrar en UI)
     */
    getCombo() {
        return this.comboActual;
    }

    /**
     * Aplica impulso de salto
     * Si estaba en voltereta, la completa y notifica
     */
    jump() {
        // Verificar si estaba en voltereta ANTES de saltar
        const estabaEnVoltereta = this.estaEnVoltereta;

        // Ejecutar el salto
        this.fisica.saltar();
        this.resetearEstadoCaida();

        // Si estaba en voltereta, notificar que se completó
        if (estabaEnVoltereta && this.onVolteretaCompletada) {
            this.onVolteretaCompletada();
            console.log('VOLTERETA COMPLETADA - Bonus!');
        }

        console.log('Salto');
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
        this.comboActual = 0;
        this.tiempoDesdeUltimaVoltereta = 0;
    }
}