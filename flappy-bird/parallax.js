// ============================================
// SISTEMA DE PARALLAX SCROLLING
// ============================================
class Parallax {
    constructor(canvasWidth, canvasHeight, baseSpeed) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.baseSpeed = baseSpeed;

        // Array de capas (de atrás hacia adelante)
        this.layers = [
            {
                name: 'Cielo',
                color: '#87CEEB', // Color temporal (luego será imagen)
                speed: 0, // No se mueve
                x: 0
            },
            {
                name: 'Montañas lejanas',
                color: '#8B7355',
                speed: 0.2, // 20% de la velocidad base
                x: 0
            },
            {
                name: 'Árboles medios',
                color: '#6B8E23',
                speed: 0.5, // 50% de la velocidad base
                x: 0
            },
            {
                name: 'Arbustos cercanos',
                color: '#228B22',
                speed: 0.8, // 80% de la velocidad base
                x: 0
            },
            {
                name: 'Suelo',
                color: '#8B4513',
                speed: 1.0, // 100% de la velocidad base
                x: 0
            }
        ];

        console.log('🌄 Parallax creado con', this.layers.length, 'capas');
    }

    /**
     * Actualiza la posición de todas las capas
     */
    update() {
        this.layers.forEach(layer => {
            if (layer.speed > 0) {
                // Mover la capa hacia la izquierda
                layer.x -= this.baseSpeed * layer.speed;

                // Si la capa salió completamente, resetear posición (loop infinito)
                if (layer.x <= -this.canvasWidth) {
                    layer.x = 0;
                }
            }
        });
    }

    /**
     * Dibuja todas las capas del parallax
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    draw(ctx) {
        this.layers.forEach((layer, index) => {
            // Altura de cada capa según su posición
            const layerHeight = this.canvasHeight / this.layers.length;
            const y = index * layerHeight;

            ctx.fillStyle = layer.color;

            // Dibujar la capa 2 veces para hacer el loop infinito
            ctx.fillRect(layer.x, y, this.canvasWidth, layerHeight);
            ctx.fillRect(layer.x + this.canvasWidth, y, this.canvasWidth, layerHeight);

            // DEBUG: Mostrar nombre de la capa (opcional, borrar después)
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(layer.name, 20, y + 30);
        });
    }

    /**
     * Reinicia todas las capas a su posición inicial
     */
    reset() {
        this.layers.forEach(layer => {
            layer.x = 0;
        });
    }

    /**
     * Cambia la velocidad del parallax (útil para acelerar el juego)
     */
    setSpeed(newSpeed) {
        this.baseSpeed = newSpeed;
    }
}