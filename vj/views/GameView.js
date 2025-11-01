/**
 * GameView - Vista del juego (patrón MVC)
 * Responsabilidad: Renderizar todo el contenido visual en el canvas
 */
class GameView {
    /**
     * Constructor de la vista
     * @param {HTMLCanvasElement} canvas - Elemento canvas
     * @param {GameModel} model - Modelo del juego
     */
    constructor(canvas, model) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.model = model;
    }

    /**
     * Dibuja todo el juego (método principal de renderizado)
     */
    dibujar() {
        this.limpiarCanvas();
        this.dibujarTablero();
        this.dibujarFichas();
    }

    /**
     * Limpia el canvas completamente
     */
    limpiarCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Dibuja el tablero de fondo
     */
    dibujarTablero() {
        if (this.model.USAR_IMAGEN_TABLERO) {
            this.ctx.drawImage(
                this.model.tableroImg,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        } else {
            this.dibujarTableroCodigo();
        }
    }

    /**
     * Dibuja el tablero usando código (versión temporal)
     */
    dibujarTableroCodigo() {
        // Fondo degradado temático Lilo & Stitch
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#4682B4');
        gradient.addColorStop(1, '#1E90FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar huecos del tablero
        const matriz = this.model.matrizTablero;
        const startX = this.model.START_X;
        const startY = this.model.START_Y;
        const espaciado = this.model.ESPACIADO;
        const radio = this.model.TAMAÑO_FICHA + 5;

        for (let fila = 0; fila < matriz.length; fila++) {
            for (let col = 0; col < matriz[fila].length; col++) {
                if (matriz[fila][col] === 1) {
                    const x = startX + col * espaciado;
                    const y = startY + fila * espaciado;

                    // Sombra del hueco
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    this.ctx.beginPath();
                    this.ctx.arc(x + 3, y + 3, radio, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Hueco principal
                    this.ctx.fillStyle = '#2C5F7C';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radio, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Borde del hueco
                    this.ctx.strokeStyle = '#1E3A5F';
                    this.ctx.lineWidth = 3;
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Dibuja todas las fichas en el tablero
     */
    dibujarFichas() {
        const fichas = this.model.obtenerFichas();
        fichas.forEach(ficha => this.dibujarFicha(ficha));
    }

    /**
     * Dibuja una ficha individual
     * @param {Ficha} ficha - Ficha a dibujar
     */
    dibujarFicha(ficha) {
        this.ctx.save();

        // Crear clip circular
        this.ctx.beginPath();
        this.ctx.arc(ficha.x, ficha.y, ficha.radio, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.clip();

        // Dibujar imagen
        this.ctx.drawImage(
            ficha.imagen,
            ficha.x - ficha.radio,
            ficha.y - ficha.radio,
            ficha.radio * 2,
            ficha.radio * 2
        );

        this.ctx.restore();

        // Borde de la ficha
        const colorBorde = ficha.seleccionada ? '#FFD700' : '#00CED1'; // Dorado si está seleccionada
        const anchoBorde = ficha.seleccionada ? 5 : 4;

        this.ctx.strokeStyle = colorBorde;
        this.ctx.lineWidth = anchoBorde;
        this.ctx.beginPath();
        this.ctx.arc(ficha.x, ficha.y, ficha.radio, 0, Math.PI * 2);
        this.ctx.stroke();

        // Sombra exterior
        if (!ficha.arrastrando) {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(ficha.x + 2, ficha.y + 2, ficha.radio + 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Efecto de elevación si está seleccionada
        if (ficha.seleccionada && !ficha.arrastrando) {
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.arc(ficha.x, ficha.y, ficha.radio + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}