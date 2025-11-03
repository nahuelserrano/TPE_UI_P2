/**
 * GameController - Controlador del juego (patrón MVC)
 * Responsabilidad: Manejar eventos del usuario y coordinar Model-View
 */
class GameController {
    /**
     * Constructor del controlador
     * @param {GameModel} model - Modelo del juego
     * @param {GameView} view - Vista del juego
     * @param {HTMLCanvasElement} canvas - Elemento canvas
     */
    constructor(model, view, canvas) {
        this.model = model;
        this.view = view;
        this.canvas = canvas;
        this.intervalo = null;
        this.jueguegoActivo = true;

        // Estado de interacción
        this.arrastrando = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.configurarEventos();
    }

    /**
     * Configura todos los event listeners del canvas
     */
    configurarEventos() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
    }

    /**
     * Obtiene las coordenadas del mouse relativas al canvas
     * @param {MouseEvent} e - Evento del mouse
     * @returns {Object} - Objeto con x e y
     */
    obtenerCoordenadas(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Maneja el evento mousedown (click inicial)
     * @param {MouseEvent} e - Evento del mouse
     */
    onMouseDown(e) {
        const coords = this.obtenerCoordenadas(e);
        const ficha = this.model.obtenerFichaEnCoordenadas(coords.x, coords.y);

        if (this.jueguegoActivo && ficha) {
            this.model.seleccionarFicha(ficha);
            this.arrastrando = true;
            ficha.arrastrando = true;

            // Calcular offset para drag suave
            this.offsetX = coords.x - ficha.x;
            this.offsetY = coords.y - ficha.y;

            this.view.dibujar();
            console.log(`Ficha seleccionada en (${ficha.fila}, ${ficha.col})`);
        }
    }

    /**
     * Maneja el evento mousemove (arrastrar)
     * @param {MouseEvent} e - Evento del mouse
     */
    onMouseMove(e) {
        if (this.jueguegoActivo && this.arrastrando && this.model.fichaSeleccionada) {
            const coords = this.obtenerCoordenadas(e);
            const ficha = this.model.fichaSeleccionada;

            // Actualizar posición visual
            ficha.actualizarPosicion(
                coords.x - this.offsetX,
                coords.y - this.offsetY
            );

            const celdaTarget = this.model.obtenerCeldaMasCercana(coords.x, coords.y);
            if (this.model.posicionVacia(celdaTarget.fila, celdaTarget.col)) {

                //evita resaltar la celda original de la ficha)
                if (celdaTarget.fila !== ficha.fila || celdaTarget.col !== ficha.col) {
                    this.model.resaltarCelda(celdaTarget.fila, celdaTarget.col);
                } else {
                    this.model.limpiarResaltado();
                }

            } else {
                // No es un hueco válido (o está ocupado), limpiar resaltado
                this.model.limpiarResaltado();
            }

            this.view.dibujar();
        }
    }

    /**
     * Maneja el evento mouseup (soltar)
     * @param {MouseEvent} e - Evento del mouse
     */
    onMouseUp(e) {
        if (this.jueguegoActivo && this.arrastrando && this.model.fichaSeleccionada) {
            const ficha = this.model.fichaSeleccionada;
            ficha.arrastrando = false;

            // 1. Obtener las coordenadas (x, y) donde se soltó la ficha
            const coords = this.obtenerCoordenadas(e);

            // 2. Convertir esas coordenadas (x, y) a la celda (fila, col) más cercana
            const celdaTarget = this.model.obtenerCeldaMasCercana(coords.x, coords.y);
            const nuevaFila = celdaTarget.fila;
            const nuevaCol = celdaTarget.col;
            // Aquí irá la lógica de validación de movimiento (Consigna 4)
            // Por ahora, resetear la ficha a su posición original
            // 3. Validar si la celda de destino es un hueco válido Y está vacío
            // (Aquí es donde luego irá la lógica de "salto" de Peg Solitaire)
            // console.log(this.model.posicionVacia(nuevaFila, nuevaCol))
            // console.log(this.model.sePuedeMoverFicha(ficha, nuevaFila, nuevaCol))

            if (this.model.posicionVacia(nuevaFila, nuevaCol)
                && this.model.sePuedeMoverFicha(ficha, nuevaFila, nuevaCol)) {

                console.log("Moviendo...")
                this.model.moverFichaA(ficha, nuevaFila, nuevaCol);
            }
            else{
                ficha.resetearPosicion(
                    this.model.START_X,
                    this.model.START_Y,
                    this.model.ESPACIADO
                );
            }
            this.arrastrando = false;
            this.model.deseleccionarFicha();
            this.model.limpiarResaltado();
            this.view.dibujar();
        }
    }

    /**
     * Maneja el evento mouseleave (mouse sale del canvas)
     * @param {MouseEvent} e - Evento del mouse
     */
    onMouseLeave(e) {
        if (this.jueguegoActivo && this.arrastrando) {
            this.onMouseUp(e);
            this.model.limpiarResaltado();
        }
    }

    /**
     * Inicia el bucle de renderizado
     */
    iniciarBucle() {
        this.view.dibujar();
        this.Temporizador();
    }


    Temporizador(){
        this.intervalo = setInterval(() => {
            this.view.limpiarCanvas();
            this.view.dibujar();
            this.tiempoTermino();
        }, 1000);

    }


    tiempoTermino(){
            let tiempoRestante=this.model.obtenerTiempoRestante();
            if(tiempoRestante<=0){
                this.jueguegoActivo = false;
                this.detenrerTemporizador();
                this.view.mostarMensajeFinJuego("⏰ ¡Tiempo agotado! ¡Juego reiniciado!");
                setTimeout(() => {  
                    this.reiniciarJuego();
                }, 3000);
              
            }
    }


    reiniciarJuego(){
        this.detenrerTemporizador();
        this.model.reiniciar();
        this.iniciarBucle();
        this.jueguegoActivo = true;
    }

    detenrerTemporizador(){
        clearInterval(this.intervalo);
        this.intervalo = null;
    }


}