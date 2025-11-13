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
        this.dibujarTemporizador();
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
            // CONFIGURACIÓN DEL RECORTE
            // Estos valores los ajustás según cuánto borde blanco querés eliminar
            const recorteIzquierdo = 40;   // píxeles a recortar desde la izquierda
            const recorteSuperior = 40;    // píxeles a recortar desde arriba
            const recorteDerecho = 40;     // píxeles a recortar desde la derecha
            const recorteInferior = 40;    // píxeles a recortar desde abajo

            // Área ORIGINAL de la imagen (después del recorte)
            const sx = recorteIzquierdo;
            const sy = recorteSuperior;
            const sWidth = this.model.tableroImg.width - recorteIzquierdo - recorteDerecho;
            const sHeight = this.model.tableroImg.height - recorteSuperior - recorteInferior;

            // Dónde dibujarlo en el CANVAS (centrado)
            const anchoFinal = 500;
            const altoFinal = 500;
            const dx = (this.canvas.width - anchoFinal) / 2;
            const dy = (this.canvas.height - altoFinal) / 2;

            // Dibujar imagen RECORTADA y centrada
            this.ctx.drawImage(
                this.model.tableroImg,
                sx, sy, sWidth, sHeight,      // Recortar desde la imagen original
                dx, dy, anchoFinal, altoFinal // Dibujar en el canvas
            );
        } else {
            this.dibujarTableroCodigo();
        }
    }

    /**
     * Dibuja el tablero usando código (versión temporal)
     */
    dibujarTableroCodigo() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#4682B4');
        gradient.addColorStop(1, '#1E90FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // --- Definiciones de dibujado ---
        const matriz = this.model.matrizTablero;
        const startX = this.model.START_X;
        const startY = this.model.START_Y;
        const espaciado = this.model.ESPACIADO;

        // 1. Radio para HUECOS NORMALES
        const radioNormal = this.model.TAMANIO_FICHA + 5; // 40 + 5 = 45px

        // 2. Radio para HUECOS RESALTADOS (más grande que el normal)
        const radioResaltado = radioNormal + 5; // 45 + 5 = 50px

        // Bucle de dibujado ---
        for (let fila = 0; fila < matriz.length; fila++) {
            for (let col = 0; col < matriz[fila].length; col++) {

                // Solo dibujar si es una posición válida (1)
                if (matriz[fila][col] === 1) {
                    const x = startX + col * espaciado;
                    const y = startY + fila * espaciado;

                    let filaCeldaResaltada;
                    let colCeldaResaltada;
                    let esMovimientoValido = true;

                    if(this.model.celdaResaltada != null) {
                        filaCeldaResaltada = this.model.celdaResaltada.fila;
                        colCeldaResaltada = this.model.celdaResaltada.col;

                        const ficha = this.model.fichaSeleccionada;

                        if (filaCeldaResaltada !== null) {}
                            esMovimientoValido = this.model.sePuedeMoverFicha(ficha, fila, col);
                    }

                    // Comprobar si esta celda debe resaltarse
                    const esCeldaResaltada = this.model.celdaResaltada &&
                        filaCeldaResaltada === fila &&
                        colCeldaResaltada === col;

                    if (esCeldaResaltada && !esMovimientoValido) {
                        this.ctx.fillStyle = '#FF1111'; // Rojo
                        this.ctx.strokeStyle = '#FF5500'; // Borde Blanco
                        this.ctx.lineWidth = 3;

                        this.ctx.beginPath();
                        this.ctx.arc(x, y, radioResaltado, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.stroke();
                    }
                    else if (esCeldaResaltada) {
                        // DIBUJAR HUECO RESALTADO ---
                        // (Centrado en x, y, con el radio GRANDE)
                        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'; // Amarillo
                        this.ctx.strokeStyle = '#FFFFFF'; // Borde Blanco
                        this.ctx.lineWidth = 3;

                        this.ctx.beginPath();
                        this.ctx.arc(x, y, radioResaltado, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.stroke();

                    } else {
                        // --- DIBUJAR HUECO NORMAL ---

                        // Sombra del hueco (descentrada a propósito)
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                        this.ctx.beginPath();
                        this.ctx.arc(x, y , radioNormal, 0, Math.PI * 2);
                        this.ctx.fill();

                        // Hueco principal (centrado)
                        this.ctx.fillStyle = '#2C5F7C';
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, radioNormal, 0, Math.PI * 2);
                        this.ctx.fill();

                        // Borde del hueco (centrado)
                        this.ctx.strokeStyle = '#1E3A5F';
                        this.ctx.lineWidth = 3;
                        this.ctx.stroke(); // Dibuja el borde del último path (el de x,y)
                    }
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
    //dibuja el temporizador en la esquina superior izquierda
    dibujarTemporizador() {
        const tiempoRestante = this.model.obtenerTiempoRestante();
        this.ctx.fillStyle = "#333";
        this.ctx.font = "bold 18px 'Baloo 2', sans-serif";
        this.ctx.textAlign = "left";

        this.ctx.fillText("Tiempo:", 15, 30);
        this.ctx.fillStyle = "#007bff";
        this.ctx.fillText(this.formatearTiempo(tiempoRestante), 15, 50);
    }

    //formatea el tiempo en minutos y segundos
    formatearTiempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return   `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }

    //muestra un mensaje de fin de juego en el centro del canvas
    mostarMensajeFinJuego(mensaje) {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 40px 'Baloo 2', sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(mensaje, this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = "bold 24px 'Baloo 2', sans-serif";
        this.ctx.fillText("Reiniciando Juego...", this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
}