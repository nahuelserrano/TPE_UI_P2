// ============================================
// CONFIGURACIÓN INICIAL
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// CLASE PRINCIPAL DEL JUEGO
// ============================================
class Game {
    constructor() {
        this.isRunning = false;
        this.score = 0;
        this.gameSpeed = 3; // Velocidad base del juego

        // Inicializar sistemas
        this.parallax = new Parallax(canvas.width, canvas.height, this.gameSpeed);

        console.log('🎮 Juego inicializado');
    }

    /**
     * Inicia el juego
     */
    start() {
        this.isRunning = true;
        console.log('▶️ Juego iniciado');
        this.gameLoop(); // Arrancar el loop
    }

    /**
     * GAME LOOP PRINCIPAL
     * Se ejecuta ~60 veces por segundo gracias a requestAnimationFrame
     */
    gameLoop() {
        if (!this.isRunning) return; // Si el juego está pausado, no hacer nada

        // 1️⃣ ACTUALIZAR: Calcular nueva posición de todo
        this.update();

        // 2️⃣ DIBUJAR: Renderizar todo en el canvas
        this.draw();

        // 3️⃣ REPETIR: Llamar al loop nuevamente en el próximo frame
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Actualiza la lógica del juego (física, colisiones, etc)
     */
    update() {
        // Actualizar el parallax (fondo en movimiento)
        this.parallax.update();

        // Aquí luego agregarás:
        // - player.update();
        // - obstacles.update();
        // - checkCollisions();
    }

    /**
     * Dibuja todos los elementos en el canvas
     */
    draw() {
        // Limpiar canvas completo
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar el parallax (fondo)
        this.parallax.draw(ctx);

        // Aquí luego agregarás:
        // - player.draw(ctx);
        // - obstacles.draw(ctx);
        // - drawUI();
    }

    /**
     * Pausa el juego
     */
    pause() {
        this.isRunning = false;
        console.log('⏸️ Juego pausado');
    }

    /**
     * Reinicia el juego
     */
    restart() {
        this.score = 0;
        this.parallax.reset();
        // Aquí resetearás el jugador y obstáculos
        this.start();
    }
}

// ============================================
// INICIALIZAR JUEGO
// ============================================
const game = new Game();
game.start();