import {ExplosionAnimation, JumpParticlesAnimation, StarAnimation, VolteretaBonusAnimation} from "./animations.js";
import { Timer } from './Timer.js';
import {Parallax} from './parallax.js';
import { Player } from './Player.js';

// ====================================
// CONSTANTES DE CONFIGURACIÓN
// ====================================

// Calibración de colisiones (específico para la imagen 'tubo.png')
const COLISION = {
    PORCENTAJE_TUBO_SUPERIOR: 0.365,  // 36.5% de la imagen es el tubo superior
    PORCENTAJE_HUECO: 0.23,            // 23% de la imagen es el espacio libre
    OFFSET_INICIO_TUBO: 170,           // Píxeles desde el borde izquierdo donde empieza la colisión
    PORCENTAJE_ANCHO_COLISION: 0.65    // 65% del ancho del tubo es colisionable
};

// Configuración del juego
const CONFIG = {
    VELOCIDAD_INICIAL: 3,
    INCREMENTO_VELOCIDAD: 1,
    VELOCIDAD_MAXIMA: 10,
    INTERVALO_DIFICULTAD: 8,           // Segundos entre incrementos
    DURACION_MENSAJE_COLISION: 2000    // Milisegundos
};

// ====================================
// CLASE GAME
// ====================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Referencias a los elementos del DOM
const menuScreen = document.getElementById('menu-screen');
const gameContent = document.getElementById('game-content');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const menuButton = document.getElementById('menu-button');

class Game {
    constructor() {
        this.estaEnEjecucion = false;
        this.assetsLoaded = false;
        this.colisionDetectada = false;
        this.puntos = 0;

        // Sistema de velocidad
        this.velocidadActual = CONFIG.VELOCIDAD_INICIAL;

        // Sistemas del juego
        this.animaciones = [];
        this.timer = new Timer(CONFIG.INTERVALO_DIFICULTAD);
        this.parallax = new Parallax(canvas.width, canvas.height, this.velocidadActual);
        this.player = new Player(30, canvas.height / 2, canvas.height);

        this.configurarEventosPlayer();

        this.tiempoColision = 0;

    }

    /**
     * Configura los eventos/callbacks del player
     */
    configurarEventosPlayer() {
        const game = this;
        this.player.setOnVolteretaCompletada(() => {
            this.otorgarBonusVoltereta();
        });
    }

    /**
     * Otorga punto extra por completar una voltereta
     */
    otorgarBonusVoltereta() {
        this.puntos++;

        // Crear animación de bonus (aparece arriba del jugador)
        this.animaciones.push(
            new VolteretaBonusAnimation(
                this.player.x + 50,  // Un poco a la derecha
                this.player.y - 40   // Arriba del jugador
            )
        );

        console.log('BONUS VOLTERETA! Puntos:', this.puntos);
    }

    async loadAssets() {
        try {
            await this.parallax.load();
        } catch (error) {
            console.error('No se pudieron cargar los assets:', error);
            throw new Error('Error al cargar assets');
        }
    }

    start() {
        this.estaEnEjecucion = true;
        this.timer.reset();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.estaEnEjecucion) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Calcular deltaTime para animaciones precisas
        const deltaTime = 1/60;

        // Verificar si es momento de aumentar dificultad
        const intervaloAlcanzado = this.timer.update();
        if (intervaloAlcanzado) {
            this.aumentarDificultad();
        }

        // Actualizar sistemas principales
        this.parallax.update();
        this.player.update(deltaTime);

        this.colisionDetectada = this.verificarColisiones();

        if (this.colisionDetectada) {
            // if (!this.colisionDetectada) {
            //     this.colisionDetectada = true;
            //     this.tiempoColision = Date.now();
            //     console.log('Colisión detectada');
            // }
            this.gameOver();
        }

        // Desactivar mensaje de colisión después del tiempo establecido
        // if (this.colisionDetectada) {
        //     if (Date.now() - this.tiempoColision > CONFIG.DURACION_MENSAJE_COLISION) {
        //         this.colisionDetectada = false;
        //     }
        // }

        // Actualizar animaciones activas
        this.animaciones.forEach(anim => anim.update());
        this.animaciones = this.animaciones.filter(anim => !anim.isFinished);

        // Verificar puntaje
        this.verificarPuntos();
    }

    aumentarDificultad() {
        if (this.velocidadActual >= CONFIG.VELOCIDAD_MAXIMA) {
            console.log('Velocidad máxima alcanzada');
            return;
        }

        this.velocidadActual += CONFIG.INCREMENTO_VELOCIDAD;
        this.parallax.setSpeed(this.velocidadActual);

        console.log(`Dificultad aumentada - Velocidad: ${this.velocidadActual.toFixed(1)}`);
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar sistemas principales
        this.parallax.draw(ctx);
        this.player.draw(ctx);

        // Mensaje de colisión temporal
        // if (this.colisionDetectada) {
        //     this.mostrarMensajeColision();
        // }

        // Animaciones activas
        this.animaciones.forEach(anim => anim.draw(ctx));

        // UI
        this.dibujarTimer();
        this.dibujarPuntos();
        this.checkWinCondition();

        // Debug (descomentar si es necesario)
        // this.dibujarDebugHueco();
    }

    dibujarTimer() {
        const tiempo = this.timer.getTiempoFormateado();

        // Timer principal
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#00FFFF';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(tiempo, canvas.width - 30, 20);

        // Velocidad actual
        ctx.font = '24px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(`Vel: ${this.velocidadActual.toFixed(1)}`, canvas.width - 35, 65);
    }

    dibujarPuntos() {
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#F ';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.puntos}`, canvas.width / 2, 35);
    }

    pause() {
        this.estaEnEjecucion = false;
        console.log('Juego pausado');
    }

    restart() {
        this.puntos = 0;
        this.velocidadActual = CONFIG.VELOCIDAD_INICIAL;
        this.parallax.reset();
        this.parallax.setSpeed(this.velocidadActual);
        this.timer.reset();
        this.player.reset();
        this.colisionDetectada = false;
        this.animaciones = [];
        this.start();
    }

    // ====================================
    // SISTEMA DE COLISIONES
    // ====================================

    verificarColisiones() {
        const posJugador = this.player.y;
        const radioJugador = this.player.radio;

        // Colisión con techo
        if (posJugador - radioJugador <= 0) {
            this.animaciones.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        // Colisión con suelo
        if (posJugador + radioJugador >= canvas.height) {
            this.animaciones.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        // Colisión con tubos
        const capasTubos = this.parallax.layers[3];

        if (!capasTubos.image || capasTubos.image.width === 0) {
            return false;
        }

        // Verificar tubo principal
        if (this.verificarColisionTubo(capasTubos, capasTubos.x, capasTubos.y)) {
            this.animaciones.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        // Verificar tubo secundario
        if (this.verificarColisionTubo(capasTubos, capasTubos.x + canvas.width, capasTubos.next_y)) {
            this.animaciones.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        return false;
    }

    checkWinCondition() {
        if (this.timer.getTiempoSegundos() >= 60){
            this.pause();
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#00AA00';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let offsetY = 40;
            ctx.fillText('Felicitaciones', canvas.width / 2, canvas.height / 2 - offsetY );
            ctx.fillText('Ganaste', canvas.width / 2, canvas.height / 2 + offsetY);

            setTimeout(this.restart, 3000)
        }
    }

    verificarColisionTubo(capaTubo, tuboX, tuboY) {
        const jugador = this.player;

        // Calcular límites del tubo
        const inicioTubo = tuboX + COLISION.OFFSET_INICIO_TUBO;
        const finTubo = tuboX + (capaTubo.scaledWidth * COLISION.PORCENTAJE_ANCHO_COLISION);

        // Verificar si el jugador está en el rango horizontal del tubo
        const estaEnRangoHorizontal =
            jugador.x + jugador.radio > inicioTubo &&
            jugador.x - jugador.radio < finTubo;

        if (!estaEnRangoHorizontal) {
            return false;
        }

        // Calcular límites del hueco
        const alturaImagenCompleta = capaTubo.scaledHeight;
        const finTuboSuperior = tuboY + (alturaImagenCompleta * COLISION.PORCENTAJE_TUBO_SUPERIOR);
        const inicioTuboInferior = finTuboSuperior + (alturaImagenCompleta * COLISION.PORCENTAJE_HUECO);

        // Bordes del jugador
        const bordeSupJugador = jugador.y - jugador.radio;
        const bordeInfJugador = jugador.y + jugador.radio;

        // Verificar si está dentro del hueco (seguro)
        const estaDentroDelHueco =
            bordeSupJugador >= finTuboSuperior &&
            bordeInfJugador <= inicioTuboInferior;

        if (estaDentroDelHueco) {
            return false;
        }

        console.log('Colisión con tubo');
        return true;
    }

    mostrarMensajeColision() {
        // Fondo rojo semi-transparente
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texto de colisión
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('COLISION', canvas.width / 2, canvas.height / 2);

        // Tiempo restante
        const tiempoRestante = Math.ceil((CONFIG.DURACION_MENSAJE_COLISION - (Date.now() - this.tiempoColision)) / 1000);
        ctx.font = '40px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Continua en ${tiempoRestante}s`, canvas.width / 2, canvas.height / 2 + 60);
    }

    gameOver() {
        setTimeout(() => {
            this.pause();
            this.mostrarPantallaGameOver();
        }, 300);
    }


    mostrarPantallaGameOver() {

        ctx.font = 'bold 100px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = '50px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Puntaje: ${this.puntos}`, canvas.width / 2, canvas.height / 2 + 50);

        ctx.font = '30px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('Presiona R para reiniciar', canvas.width / 2, canvas.height / 2 + 120);
    }

    // ====================================
    // SISTEMA DE PUNTUACIÓN
    // ====================================

    verificarPuntos() {
        const capaTubo = this.parallax.layers[3];
        if (!capaTubo.image || capaTubo.image.width === 0) return;

        const posXJugador = this.player.x;

        // Calcular fin de cada tubo
        const finTuboPrincipal = capaTubo.x + (capaTubo.scaledWidth * COLISION.PORCENTAJE_ANCHO_COLISION);
        const finTuboSecundario = (capaTubo.x + canvas.width) + (capaTubo.scaledWidth * COLISION.PORCENTAJE_ANCHO_COLISION);

        // Verificar tubo principal
        if (posXJugador > finTuboPrincipal && !capaTubo.scored) {
            this.puntos++;
            capaTubo.scored = true;
            this.animaciones.push(new StarAnimation(this.player.x + 50, this.player.y));
            console.log('Punto! Score:', this.puntos);
        }

        // Verificar tubo secundario
        if (posXJugador > finTuboSecundario && !capaTubo.next_scored) {
            this.puntos++;
            capaTubo.next_scored = true;
            this.animaciones.push(new StarAnimation(this.player.x + 50, this.player.y));
            console.log('Punto! Score:', this.puntos);
        }
    }

    // ====================================
    // DEBUG - Visualización del hueco
    // ====================================

    dibujarDebugHueco() {
        const capaTubo = this.parallax.layers[3];
        if (!capaTubo.image || capaTubo.image.width === 0) return;

        // Función auxiliar para dibujar líneas de un tubo
        const dibujarLineasTubo = (tuboX, tuboY) => {
            // Solo dibujar si el tubo está visible en pantalla
            if (tuboX <= -capaTubo.scaledWidth || tuboX >= canvas.width) return;

            const alturaCompleta = capaTubo.scaledHeight;
            const finTuboSuperior = tuboY + (alturaCompleta * COLISION.PORCENTAJE_TUBO_SUPERIOR);
            const inicioTuboInferior = finTuboSuperior + (alturaCompleta * COLISION.PORCENTAJE_HUECO);

            const inicioX = tuboX + COLISION.OFFSET_INICIO_TUBO;
            const finX = tuboX + (capaTubo.scaledWidth * COLISION.PORCENTAJE_ANCHO_COLISION);

            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 3;

            // Línea superior del hueco
            ctx.beginPath();
            ctx.moveTo(inicioX, finTuboSuperior);
            ctx.lineTo(finX, finTuboSuperior);
            ctx.stroke();

            // Línea inferior del hueco
            ctx.beginPath();
            ctx.moveTo(inicioX, inicioTuboInferior);
            ctx.lineTo(finX, inicioTuboInferior);
            ctx.stroke();
        };

        // Dibujar líneas para ambos tubos
        dibujarLineasTubo(capaTubo.x, capaTubo.y);
        dibujarLineasTubo(capaTubo.x + canvas.width, capaTubo.next_y);
    }
}

// ====================================
// INICIALIZACIÓN Y CONTROLES
// ====================================

let game = new Game();

async function main() {
    await game.loadAssets();
    game.start();
}

/**
 * Muestra el menú y oculta el juego
 */
function mostrarMenu() {
    menuScreen.classList.remove('hidden');
    gameContent.classList.remove('active');
    game.pause();
}

/**
 * Oculta el menú e inicia el juego
 */
async function iniciarJuego() {
    menuScreen.classList.add('hidden');
    gameContent.classList.add('active');

    // Cargar assets solo la primera vez
    if (!game.assetsLoaded) {
        await game.loadAssets();
        game.assetsLoaded = true;
    }

    game.restart();
}

// Event Listeners para los botones
startButton.addEventListener('click', iniciarJuego);

restartButton.addEventListener('click', () => {
    game.restart();
});

menuButton.addEventListener('click', mostrarMenu);

// Controles del teclado
document.addEventListener('keydown', (event) => {
    // Solo funciona si el juego está corriendo
    if (event.code === 'Space' && game.estaEnEjecucion) {
        event.preventDefault();
        if (!game.colisionDetectada){
            game.player.jump();
            game.animaciones.push(new JumpParticlesAnimation(game.player.x, game.player.y));
        }
    }

    // R para reiniciar (solo si el juego terminó)
    if (event.code === 'KeyR' && !game.estaEnEjecucion) {
        event.preventDefault();
        game.restart();
    }

    // ESC para volver al menú
    if (event.code === 'Escape') {
        mostrarMenu();
    }
});
