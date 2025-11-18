import {ExplosionAnimation, JumpParticlesAnimation, StarAnimation} from "./animations.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
import {Parallax} from './parallax.js';
import { Player } from './player.js';

class Game {
    constructor() {
        this.isRunning = false;
        this.score = 0;
        this.gameSpeed = 3;

        this.animations = [];

        this.parallax = new Parallax(canvas.width, canvas.height, this.gameSpeed);
        this.player = new Player(30, canvas.height / 2, canvas.height);

        // Sistema de colisión temporal
        this.collisionDetected = false;
        this.collisionTimer = 0;
        this.collisionDuration = 2000; // Duración en milisegundos (2 segundos)

        console.log('Juego inicializado');
    }

    async loadAssets() {
        console.log('Cargando imágenes del parallax...');
        try {
            await this.parallax.load();
            console.log('Imágenes cargadas.');
        } catch (error) {
            console.error('No se pudieron cargar los assets:', error);
            throw new Error('Error al cargar assets');
        }
    }

    start() {
        this.isRunning = true;
        console.log('Juego iniciado');
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.parallax.update();
        this.player.update();

        if (this.checkCollision()) {
            // Activar el estado de colisión temporal
            if (!this.collisionDetected) {
                this.collisionDetected = true;
                this.collisionTimer = Date.now();
                console.log('Colisión detectada');
            }
        }

        // Desactivar el mensaje después del tiempo establecido
        if (this.collisionDetected) {
            if (Date.now() - this.collisionTimer > this.collisionDuration) {
                this.collisionDetected = false;
            }
        }

        // Actualizar todas las animaciones activas
        this.animations.forEach(anim => anim.update());

        // Eliminar animaciones terminadas
        this.animations = this.animations.filter(anim => !anim.isFinished);

        this.checkScore();
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.parallax.draw(ctx);
        this.player.draw(ctx);

        // Mostrar mensaje de colisión temporal
        if (this.collisionDetected) {
            this.showCollisionMessage();
        }

        this.animations.forEach(anim => anim.draw(ctx));


        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#FF00FF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Puntos " + this.score, 75, 35, 200)

        // this.debugDrawHole();
    }

    pause() {
        this.isRunning = false;
        console.log('Juego pausado');
    }

    restart() {
        this.score = 0;
        this.parallax.reset();
        this.player.reset();
        this.collisionDetected = false;
        this.start();
    }

    checkCollision() {
        let posJugador = this.player.y;
        let tamanioJugador = this.player.radius;

        // Colisión con techo
        if (posJugador - tamanioJugador <= 0) {
            this.animations.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        // Colisión con suelo
        if (posJugador + tamanioJugador >= canvas.height) {
            this.animations.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        const tuboLayer = this.parallax.layers[1];

        if (!tuboLayer.image || tuboLayer.image.width === 0) {
            this.animations.push(new ExplosionAnimation(this.player.x, this.player.y));
            return false;
        }

        // Verificar tubo principal
        if (this.checkTubeCollision(tuboLayer, tuboLayer.x, tuboLayer.y)) {
            this.animations.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        // Verificar tubo copia
        if (this.checkTubeCollision(tuboLayer, tuboLayer.x + canvas.width, tuboLayer.next_y)) {
            this.animations.push(new ExplosionAnimation(this.player.x, this.player.y));
            return true;
        }

        return false;
    }

    checkTubeCollision(tuboLayer, tuboX, tuboY) {
        const player = this.player;

        // Verificar si el jugador está en el rango horizontal del tubo
        const enRangoX =
            player.x + player.radius > this.calcularInicioTubos(tuboX) &&
            player.x - player.radius < this.calcularFinTubos(tuboX, tuboLayer.scaledWidth);

        if (!enRangoX) {
            return false;
        }

        const porcentajeTuboSuperior = 0.365;
        const porcentajeHueco = 0.23;
        const imagenCompleta = tuboLayer.scaledHeight;

        // Calcular límites del hueco
        const finTuboSuperior = tuboY + (imagenCompleta * porcentajeTuboSuperior);
        const inicioTuboInferior = finTuboSuperior + (imagenCompleta * porcentajeHueco);

        const bordeSupJugador = player.y - player.radius;
        const bordeInfJugador = player.y + player.radius;

        // Verificar si está dentro del hueco
        const dentroDelHueco =
            bordeSupJugador >= finTuboSuperior &&
            bordeInfJugador <= inicioTuboInferior;

        if (dentroDelHueco) {
            return false;
        }

        console.log('Colisión con tubo');
        return true;
    }

    showCollisionMessage() {
        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texto de colisión
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('COLISION', canvas.width / 2, canvas.height / 2);

        // Tiempo restante
        const tiempoRestante = Math.ceil((this.collisionDuration - (Date.now() - this.collisionTimer)) / 1000);
        ctx.font = '40px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Continua en ${tiempoRestante}s`, canvas.width / 2, canvas.height / 2 + 60);
    }

    gameOver() {
        this.isRunning = false;
        console.log('GAME OVER - Puntaje final:', this.score);
        this.showGameOverScreen();
    }

    showGameOverScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 100px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = '50px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Puntaje: ${this.score}`, canvas.width / 2, canvas.height / 2 + 50);

        ctx.font = '30px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('Presiona R para reiniciar', canvas.width / 2, canvas.height / 2 + 120);
    }

    debugDrawHole() {
        const tuboLayer = this.parallax.layers[1];
        if (!tuboLayer.image || tuboLayer.image.width === 0) return;

        const porcentajeTuboSuperior = 0.365;
        const porcentajeHueco = 0.23;

        const dibujarLineasTubo = (tuboX, tuboY) => {
            // Solo dibujar si el tubo está visible

            if (tuboX > -tuboLayer.scaledWidth && tuboX < canvas.width) {
                const imagenCompleta = tuboLayer.scaledHeight;

                const finTuboSuperior = tuboY + (imagenCompleta * porcentajeTuboSuperior);
                const inicioTuboInferior = finTuboSuperior + (imagenCompleta * porcentajeHueco);

                const inicioTubos = this.calcularInicioTubos(tuboX);
                const finTubos = this.calcularFinTubos(tuboX, tuboLayer.scaledWidth);

                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 3;

                // Línea superior del hueco
                ctx.beginPath();
                ctx.moveTo(inicioTubos, finTuboSuperior);
                ctx.lineTo(finTubos, finTuboSuperior);
                ctx.stroke();

                // Línea inferior del hueco
                ctx.beginPath();
                ctx.moveTo(inicioTubos, inicioTuboInferior);
                ctx.lineTo(finTubos, inicioTuboInferior);
                ctx.stroke();
            }
        };

        dibujarLineasTubo(tuboLayer.x, tuboLayer.y);
        dibujarLineasTubo(tuboLayer.x + canvas.width, tuboLayer.next_y);
    }


    calcularInicioTubos(tuboX){
        return tuboX + 170;
    }

    calcularFinTubos(tuboX, tuboScaleWidth){
        return tuboX + tuboScaleWidth * 0.65;
    }

    /**
     * Verifica si el jugador pasó completamente un tubo y actualiza el puntaje
     */
    checkScore() {
        const tuboLayer = this.parallax.layers[1];
        if (!tuboLayer.image || tuboLayer.image.width === 0) return;

        const playerX = this.player.x;
        const finTuboPrincipal = this.calcularFinTubos(tuboLayer.x, tuboLayer.scaledWidth);
        const finTuboCopia = this.calcularFinTubos(tuboLayer.x + canvas.width, tuboLayer.scaledWidth);

        if (playerX > finTuboPrincipal && !tuboLayer.scored) {
            this.score++;
            tuboLayer.scored = true;
            this.animations.push(new StarAnimation(this.player.x + 50, this.player.y));
            console.log('Punto! Score:', this.score);
        }

        if (playerX > finTuboCopia && !tuboLayer.next_scored) {
            this.score++;
            tuboLayer.next_scored = true;
            this.animations.push(new StarAnimation(this.player.x + 50, this.player.y));
            console.log('Punto! Score:', this.score);
        }
    }
}

let game = new Game();

async function main() {
    await game.loadAssets();
    game.start();
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && game.isRunning) {
        event.preventDefault();
        game.player.jump();
        game.animations.push(new JumpParticlesAnimation(game.player.x, game.player.y));
    }

    if (event.code === 'KeyR' && !game.isRunning) {
        event.preventDefault();
        location.reload();
    }
});

main();