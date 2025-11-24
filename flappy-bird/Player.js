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

        // === RUTAS DE SPRITES DE VOLTERETA ===
        this.rutasVoltereta = [
            "../imagenes/flappy-bird/stich-sp-voltereta-1-removebg-preview.png",
            "../imagenes/flappy-bird/stich-sp-voltereta-2-removebg-preview.png",
            "../imagenes/flappy-bird/stich-sp-voltereta-3-removebg-preview.png",
            "../imagenes/flappy-bird/stich-sp-voltereta-4-removebg-preview.png",
            "../imagenes/flappy-bird/stich-sp-voltereta-5-removebg-preview.png",
            "../imagenes/flappy-bird/stich-sp-voltereta-6-removebg-preview.png"
        ];

        // === CARGAR IMÁGENES DE VOLTERETA ===
        this.imagenesVoltereta = [];
        this.volteretatImagenesCargadas = 0;
        this.cargarImagenesVoltereta();

        // === ANIMACIÓN (se creará cuando las imágenes estén listas) ===
        this.animacionVoltereta = null;

        // === ESTADOS ===
        this.estaEnVoltereta = false;
        this.tiempoCayendo = 0;
        this.umbralVoltereta = 0.3;

        // === SISTEMA DE PUNTOS POR VOLTERETA ===
        this.tiempoEnVoltereta = 0;           // Tiempo acumulado en voltereta actual
        this.intervaloPuntosVoltereta = 0.1;  // Cada 0.1 segundos suma un punto
        this.ultimoPuntoVoltereta = 0;        // Para trackear cuándo dar el siguiente punto

        // === SISTEMA DE COMBO ===
        this.comboActual = 0;
        this.tiempoDesdeUltimaVoltereta = 0;
        this.tiempoMaximoCombo = 2.0;

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
     * Carga todas las imágenes de la voltereta
     * Solo crea el AnimationController cuando todas estén listas
     */
    cargarImagenesVoltereta() {
        this.rutasVoltereta.forEach((ruta, index) => {
            const imagen = new Image();
            imagen.onload = () => {
                this.volteretatImagenesCargadas++;
                console.log(`Imagen voltereta ${index + 1}/6 cargada`);

                // Cuando todas las imágenes estén cargadas, crear la animación
                if (this.volteretatImagenesCargadas === this.rutasVoltereta.length) {
                    this.animacionVoltereta = new AnimationController(
                        this.imagenesVoltereta,
                        0.05,
                        true
                    );
                    console.log('Animación de voltereta lista!');
                }
            };
            imagen.onerror = () => {
                console.error(`Error cargando imagen voltereta: ${ruta}`);
            };
            imagen.src = ruta;
            this.imagenesVoltereta.push(imagen);
        });
    }

    /**
     * Registra un callback para cuando se complete una voltereta
     * @param {Function} callback - Función a ejecutar al completar voltereta
     */
    setOnVolteretaCompletada(callback) {
        this.onVolteretaCompletada = callback;
    }

    /**
     * Registra un callback para cuando se gane un punto durante voltereta
     */
    setOnPuntoVoltereta(callback) {
        this.onPuntoVoltereta = callback;
    }

    update(deltaTime = 1/60) {
        this.fisica.update();
        this.y += this.fisica.obtenerVelocidad();
        this.verificarColisionesBordes();
        this.actualizarRotacion();
        this.actualizarEstadoCaida(deltaTime);
        this.actualizarSprite(deltaTime);

        // Actualizar puntos por voltereta continua
        this.actualizarPuntosVoltereta(deltaTime);

        // Actualizar timer del combo
        this.actualizarCombo(deltaTime);
    }

    /**
     * Otorga puntos por cada 0.1 segundos en voltereta
     */
    actualizarPuntosVoltereta(deltaTime) {
        if (!this.estaEnVoltereta) return;

        // Acumular tiempo en voltereta
        this.tiempoEnVoltereta += deltaTime;

        // Verificar si alcanzamos el siguiente intervalo de puntos
        const puntosActuales = Math.floor(this.tiempoEnVoltereta / this.intervaloPuntosVoltereta);
        const puntosAnteriores = Math.floor(this.ultimoPuntoVoltereta / this.intervaloPuntosVoltereta);

        // Si cruzamos un umbral de 0.1 segundos, otorgar punto
        if (puntosActuales > puntosAnteriores && this.onPuntoVoltereta) {
            this.onPuntoVoltereta();
            console.log(`Punto voltereta! Tiempo: ${this.tiempoEnVoltereta.toFixed(2)}s`);
        }

        this.ultimoPuntoVoltereta = this.tiempoEnVoltereta;
    }

    /**
     * Gestiona el tiempo del combo
     */
    actualizarCombo(deltaTime) {
        if (this.comboActual > 0) {
            this.tiempoDesdeUltimaVoltereta += deltaTime;

            if (this.tiempoDesdeUltimaVoltereta >= this.tiempoMaximoCombo) {
                this.romperCombo('timeout');
            }
        }
    }

    /**
     * Rompe el combo actual
     */
    romperCombo() {
        if (this.comboActual > 0) {
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
            this.romperCombo('suelo');
        }

        // Colisión con techo
        if (this.y - this.radio < 0) {
            this.y = this.radio;
            this.fisica.detener();
            this.romperCombo('techo');
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
        const estaCayendoRapido = this.fisica.estaCayendoRapido(this.umbralVoltereta);

        if (estaCayendoRapido) {
            this.tiempoCayendo += deltaTime;

            if (this.tiempoCayendo >= this.umbralVoltereta && !this.estaEnVoltereta) {
                console.log('ACTIVANDO VOLTERETA');
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
        if (!this.animacionVoltereta) {
            console.warn('Animación de voltereta no está lista aún');
            return;
        }

        this.estaEnVoltereta = true;
        this.tiempoEnVoltereta = 0;        // Resetear contador de tiempo
        this.ultimoPuntoVoltereta = 0;     // Resetear tracker de puntos
        this.animacionVoltereta.play();
        this.rotacion = 0;
    }

    detenerVoltereta() {
        console.log(`Voltereta finalizada - Duración: ${this.tiempoEnVoltereta.toFixed(2)}s`);

        this.estaEnVoltereta = false;
        this.tiempoEnVoltereta = 0;
        this.ultimoPuntoVoltereta = 0;
        this.animacionVoltereta.stop();
        this.spriteActual = this.spriteNormal;
    }

    resetearEstadoCaida() {
        this.tiempoCayendo = 0;
        if (this.estaEnVoltereta) {
            this.detenerVoltereta();
        }
    }

    actualizarSprite(deltaTime) {
        if (this.estaEnVoltereta && this.animacionVoltereta) {
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
     * Obtiene el tiempo actual en voltereta
     */
    getTiempoVoltereta() {
        return this.tiempoEnVoltereta;
    }

    /**
     * Lee y resetea los puntos ganados por voltereta
     * Game llama esto cada frame
     */
    consumirPuntosVoltereta() {
        const puntos = this.puntosVolteretaGanados;
        this.puntosVolteretaGanados = 0;
        return puntos;
    }

    /**
     * Aplica impulso de salto
     * Si estaba en voltereta, la completa y notifica
     */
    jump() {
        const estabaEnVoltereta = this.estaEnVoltereta;

        this.fisica.saltar();
        this.resetearEstadoCaida();

        // Bonus por completar voltereta con salto
        if (estabaEnVoltereta && this.onVolteretaCompletada) {
            this.onVolteretaCompletada();
        }

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
        this.tiempoEnVoltereta = 0;
        this.ultimoPuntoVoltereta = 0;
    }
}