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
        this.jumpForce = -8;    // Fuerza del salto (negativo = hacia arriba)
        this.maxVelocity = 15;   // Velocidad máxima de caída (evita caer muy rápido)

        // === VISUAL ===
        this.radius = 20;        // Tamaño del círculo
        this.color = '#FF0000';  // Color rojo

        this.sprite = new Image();
        this.sprite.src = '../imagenes/flappy-bird/stich-sp-default.png';
        this.spriteLoaded = false; // Flag para saber si ya cargó

        this.sprite.onload = () => {
            this.spriteLoaded = true;
            console.log('Sprite de Stitch cargado correctamente');
        };

        this.sprite.onerror = () => {
            console.error('Error al cargar el sprite de Stitch');
        };

        // === LÍMITES ===
        this.canvasHeight = canvasHeight;

        console.log('🔴 Jugador creado en posición:', this.x, this.y);
    }

    /**
     * Actualiza la física del jugador cada frame
     */
    update() {
        // En cada frame, la gravedad suma velocidad hacia abajo
        this.velocityY += this.gravity;

        // LIMITAR VELOCIDAD MÁXIMA
        // Si cae muy rápido, limitamos la velocidad
        if (this.velocityY > this.maxVelocity) {
            this.velocityY = this.maxVelocity;
        }

        // La velocidad cambia la posición
        this.y += this.velocityY;

        // COLISIÓN CON EL SUELO
        // Si toca el fondo del canvas, detenerlo
        if (this.y + this.radius > this.canvasHeight) {
            this.y = this.canvasHeight - this.radius; // Pegarlo al suelo
            this.velocityY = 0; // Detener la caída
        }

        // COLISIÓN CON EL TECHO
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
        // Si el sprite ya cargó, dibujarlo
        if (this.spriteLoaded) {
            const size = 100; // Tamaño del sprite
            const half = size / 2;

            // Dibuja la imagen CENTRADA en la posición del jugador
            // Restamos la mitad del tamaño para que el centro esté en (this.x, this.y)
            ctx.drawImage(
                this.sprite,           // Imagen a dibujar
                this.x - half,         // Posición X (centrada)
                this.y - half,         // Posición Y (centrada)
                size,                  // Ancho
                size                   // Alto
            );

            // ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            // ctx.beginPath();
            // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // ctx.stroke();

        } else {
            // Mientras carga, mostrar el círculo rojo temporal
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}