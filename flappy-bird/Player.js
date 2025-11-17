// ============================================
// CLASE JUGADOR
// ============================================
export class Player {
    /**
     * Constructor del jugador
     * @param {number} x - Posición inicial en X
     * @param {number} y - Posición inicial en Y
     * @param {number} canvasHeight - Altura del canvas (para límites)
     */
    constructor(x, y, canvasHeight) {
        // === POSICIÓN ===
        this.x = x;              // Posición horizontal (fija, no se mueve)
        this.y = y;              // Posición vertical (cambia con gravedad)

        // === FÍSICA ===
        this.velocityY = 0;      // Velocidad actual en Y (empieza en 0)
        this.gravity = 0.5;      // Fuerza de gravedad (cuánto acelera la caída)
        this.jumpForce = -10;    // Fuerza del salto (negativo = hacia arriba)
        this.maxVelocity = 15;   // Velocidad máxima de caída (evita caer muy rápido)

        // === VISUAL ===
        this.radius = 25;        // Tamaño del círculo
        this.color = '#FF0000';  // Color rojo

        // === LÍMITES ===
        this.canvasHeight = canvasHeight;

        console.log('🔴 Jugador creado en posición:', this.x, this.y);
    }

    /**
     * Actualiza la física del jugador cada frame
     */
    update() {
        // 1️⃣ APLICAR GRAVEDAD
        // En cada frame, la gravedad suma velocidad hacia abajo
        this.velocityY += this.gravity;

        // 2️⃣ LIMITAR VELOCIDAD MÁXIMA
        // Si cae muy rápido, limitamos la velocidad
        if (this.velocityY > this.maxVelocity) {
            this.velocityY = this.maxVelocity;
        }

        // 3️⃣ ACTUALIZAR POSICIÓN
        // La velocidad cambia la posición
        this.y += this.velocityY;

        // 4️⃣ COLISIÓN CON EL SUELO
        // Si toca el fondo del canvas, detenerlo
        if (this.y + this.radius > this.canvasHeight) {
            this.y = this.canvasHeight - this.radius; // Pegarlo al suelo
            this.velocityY = 0; // Detener la caída
        }

        // 5️⃣ COLISIÓN CON EL TECHO
        // Si toca el techo del canvas, detenerlo
        if (this.y - this.radius < 0) {
            this.y = this.radius; // Pegarlo al techo
            this.velocityY = 0; // Detener el movimiento hacia arriba
        }
    }

    /**
     * Hace que el jugador salte (impulso hacia arriba)
     */
    jump() {
        // Aplicar una velocidad negativa (hacia arriba)
        this.velocityY = this.jumpForce;

        console.log('⬆️ Salto! velocityY:', this.velocityY);
    }

    /**
     * Dibuja el jugador en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    draw(ctx) {
        // Dibujar el círculo rojo
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // (Opcional) Borde negro para verlo mejor
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}