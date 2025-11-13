/**
 * // TABLERO CON IMAGEN
 * // ANIMACIÓN DE HINTS
 * // POSIBILIDAD DE USAR OTRA IMAGEN
 * // CORREGIR BUGS
 * GameModel - Modelo del juego (patrón MVC)
 * Responsabilidad: Gestionar el estado del juego, lógica de negocio y reglas
 */
class GameModel {
    constructor(boardId, boardSrc, pieceSrc) {
        this.celdaResaltada = null;

        // Constantes de dibujado
        this.TAMANIO_FICHA = 20;
        this.ESPACIADO = 51;
        this.START_X = 76;
        this.START_Y = 76;
        this.USAR_IMAGEN_TABLERO = true;

        // Almacenamos las rutas seleccionadas
        this.selectedBoardSrc = boardSrc;
        this.selectedPieceSrc = pieceSrc;

        // Instancias de Imagen
        this.piezaImg = new Image();
        this.tableroImg = new Image();
        this.imagenesCargadas = 0;

        // --- ¡NUEVA LÓGICA DE MATRICES! ---
        // Almacenamos todas las matrices lógicas disponibles
        // Usamos exactamente las matrices que tú proporcionaste.
        const boardLayouts = {
            "board_cross": [
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0]
            ],
            "board_diamond": [
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0]
            ]
        };

        // Matriz del tablero
        // Seleccionamos la matriz correcta basándonos en el boardId que recibimos.
        // Si por alguna razón el ID no existe, usamos "board_cross" como default.
        this.matrizTablero = boardLayouts[boardId] || boardLayouts["board_cross"];

        // Estado del juego
        this.fichas = [];
        this.fichaSeleccionada = null;
        this.TIME_LIMIT = 300; // Tiempo límite en segundos (5 minutos)
        this.tiempoInicio = Date.now();
    }



    /**
     * Establece la celda que debe ser resaltada visualmente
     * @param {number} fila
     * @param {number} col
     */
    resaltarCelda(fila, col) {
        this.celdaResaltada = { fila, col };
    }

    /**
     * Limpia la celda resaltada
     */
    limpiarResaltado() {
        this.celdaResaltada = null;
    }

    /**
     * Carga todas las imágenes necesarias
     * @param {Function} callback - Función a ejecutar cuando todas las imágenes estén cargadas
     */

    cargarImagenes(callback) {
        let imagenesCargadas = 0;
        const totalImagenes = 2; // Solo cargamos el tablero y la ficha elegida

        const onImageLoad = () => {
            imagenesCargadas++;
            console.log(`Imagen ${imagenesCargadas}/${totalImagenes} cargada`);
            if (imagenesCargadas === totalImagenes) {
                console.log('Todas las imágenes seleccionadas cargadas');
                callback();
            }
        };

        const onImageError = (e) => {
            console.error(`Error cargando imagen: ${e.target.src}`);
        };

        // Cargar imagen de tablero seleccionado
        this.tableroImg.src = this.selectedBoardSrc;
        this.tableroImg.onload = onImageLoad;
        this.tableroImg.onerror = onImageError;

        // Cargar imagen de la pieza seleccionada
        this.piezaImg.src = this.selectedPieceSrc;
        this.piezaImg.onload = onImageLoad;
        this.piezaImg.onerror = onImageError;
    }

    /**
     * Inicializa las fichas en el tablero
     * Coloca fichas en todas las posiciones excepto el centro (3,3)
     */
    inicializarFichas() {
        this.fichas = [];

        // Obtenemos el centro (asumiendo tableros de 9x9)
        const centroFila = 4;
        const centroCol = 4;

        for (let fila = 0; fila < this.matrizTablero.length; fila++) {
            for (let col = 0; col < this.matrizTablero[fila].length; col++) {

                // Si es posición válida (1) Y no es el centro
                if (this.matrizTablero[fila][col] === 1 && !(fila === centroFila && col === centroCol)) {
                    const x = this.START_X + col * this.ESPACIADO;
                    const y = this.START_Y + fila * this.ESPACIADO;

                    // Usamos la única imagen de ficha cargada
                    const imagen = this.piezaImg;

                    const ficha = new Ficha(fila, col, x, y, imagen, this.TAMANIO_FICHA);
                    this.fichas.push(ficha);
                }
            }
        }
    }

    /**
     * Obtiene la ficha en una posición específica del tablero
     * @param {number} fila - Fila del tablero
     * @param {number} col - Columna del tablero
     * @returns {Ficha|null} - La ficha encontrada o null
     */
    obtenerFichaEnPosicion(fila, col) {
        return this.fichas.find(f => f.fila === fila && f.col === col) || null;
    }

    /**
     * Verifica si una posición del tablero está vacía
     * @param {number} fila - Fila del tablero
     * @param {number} col - Columna del tablero
     * @returns {boolean} - True si está vacía
     */
    posicionVacia(fila, col) {
        // Primero verificar que sea una posición válida del tablero
        if (fila < 0 || fila >= 9 || col < 0 || col >= 9) return false;
        if (this.matrizTablero[fila][col] === 0) return false;

        // Verificar que no haya ficha en esa posición
        return !this.obtenerFichaEnPosicion(fila, col);
    }

    /**
     * Obtiene la ficha en unas coordenadas del canvas
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {Ficha|null} - La ficha encontrada o null
     */
    obtenerFichaEnCoordenadas(x, y) {
        // Recorrer de atrás hacia adelante para obtener la ficha superior
        for (let i = this.fichas.length - 1; i >= 0; i--) {
            if (this.fichas[i].contienePunto(x, y)) {
                return this.fichas[i];
            }
        }
        return null;
    }

    /**
     * Selecciona una ficha
     * @param {Ficha} ficha - Ficha a seleccionar
     */
    seleccionarFicha(ficha) {
        if (this.fichaSeleccionada) {
            this.fichaSeleccionada.seleccionada = false;
        }
        this.fichaSeleccionada = ficha;
        ficha.seleccionada = true;
    }

    /**
     * Deselecciona la ficha actual
     */
    deseleccionarFicha() {
        if (this.fichaSeleccionada) {
            this.fichaSeleccionada.seleccionada = false;
            this.fichaSeleccionada = null;
        }
    }

    /**
     * Obtiene todas las fichas del juego
     * @returns {Array<Ficha>} - Array de fichas
     */
    obtenerFichas() {
        return this.fichas;
    }

    obtenerCeldaMasCercana(x, y) {
        // Usamos Math.round para encontrar el índice de la celda más cercana
        const col = Math.round((x - this.START_X) / this.ESPACIADO);
        const fila = Math.round((y - this.START_Y) / this.ESPACIADO);
        return { fila, col };
    }

    moverFichaA(ficha, nuevaFila, nuevaCol) {
        console.log("Ficha queriendo desplegarse en fila " + nuevaFila + " columna " + nuevaCol);

        // 1. Actualizar la posición lógica (matriz) de la ficha

        if(ficha.col !== nuevaCol){
            const filaAEliminar = ficha.fila;
            if(ficha.col > nuevaCol){
                const colAEliminar = ficha.col - 1;
                this.eliminarFicha(filaAEliminar, colAEliminar);
            } else {
                const colAEliminar = ficha.col + 1;
                this.eliminarFicha(filaAEliminar, colAEliminar);
            }
        } else {
            const colAEliminar = ficha.col;
            if(ficha.fila > nuevaFila){
                const filaAEliminar = ficha.fila - 1;
                this.eliminarFicha(filaAEliminar, colAEliminar);
            } else {
                const filaAEliminar = ficha.fila + 1;
                this.eliminarFicha(filaAEliminar, colAEliminar);
            }
        }

        ficha.fila = nuevaFila;
        ficha.col = nuevaCol;


        // 2. Actualizar la posición visual (snap)
        // Reutilizamos resetearPosicion() que calcula el (x, y) exacto
        // en base a la nueva (fila, col) de la ficha.
        ficha.resetearPosicion(this.START_X, this.START_Y, this.ESPACIADO);
    }

    sePuedeMoverFicha(ficha, nuevaFila, nuevaCol){
        if (nuevaFila > ficha.fila + 2 || nuevaFila < ficha.fila - 2 ){
            console.log("No puedes mover ahí, límite de distancia");
            return false;
        }

        if (nuevaFila === ficha.fila + 1 || nuevaFila === ficha.fila - 1 ){
            console.log("No puedes mover ahí, límite de distancia");
            return false;
        }

        if (nuevaCol > ficha.col + 2 || nuevaCol < ficha.col - 2 ) {
            console.log("No puedes mover ahí, límite de distancia");
            return false;
        }

        if (nuevaCol === ficha.col + 1 || nuevaCol === ficha.col - 1 ) {
            console.log("No puedes mover ahí, límite de distancia");
            return false;
        }

        if(ficha.col !== nuevaCol && ficha.fila !== nuevaFila){
            console.log("No puedes mover ahí, los movimientos en diagonal no son validos");
            return false;
        }

        if(nuevaCol > ficha.col){
            if (this.posicionVacia(ficha.fila, nuevaCol - 1)){
                console.log("Debes saltar sobre una ficha adyacente")
                return false
            }
        }

        if(nuevaCol < ficha.col){
            if (this.posicionVacia(ficha.fila, nuevaCol + 1)){
                console.log("Debes saltar sobre una ficha adyacente")
                return false
            }
        }

        if (nuevaFila > ficha.fila){
            if (this.posicionVacia(nuevaFila - 1,  ficha.col)){
                console.log("Debes saltar sobre una ficha adyacente")
                return false
            }
        }

        if (nuevaFila < ficha.fila){
            if (this.posicionVacia(nuevaFila + 1,  ficha.col)){
                console.log("Debes saltar sobre una ficha adyacente")
                return false
            }
        }

        return true;
    }

    /**
     *
     */
    eliminarFicha(fila, col){
        const indice = this.fichas.findIndex(f => f.fila === fila && f.col === col);
        if (indice !== -1) {
            this.fichas.splice(indice, 1); // Elimina 1 elemento en esa posición
        }
    }

    //verifica si hay más movimientos por hacer
    hayMasMovimientos(){
        let i = 0;
        while(this.fichas.length > i){
            if(this.tieneMovimientosPosibles(this.fichas[i])){
                return true;
            }
            i++;
        }
        return false;
    }

    /**
     * @param {Object} ficha
     * Verifica que la ficha tenga movimientos disponibles
     * Revisa que tenga adyacentes y que el siguiente espacio este vacio
     * Para poder saltar
     */
    tieneMovimientosPosibles(ficha){
        let tieneMovimientoPosibles = false;

         this.fichas.forEach(fichaActual => {
            // Ficha izquierda
            if (ficha.fila === fichaActual.fila && fichaActual.col === ficha.col - 1) {
                if (this.posicionVacia(ficha.fila, fichaActual.col - 1)){
                    tieneMovimientoPosibles = true;
                    return;
                }
            }
            // Ficha derecha
            if (ficha.fila === fichaActual.fila && fichaActual.col === ficha.col + 1) {
                if (this.posicionVacia(ficha.fila, fichaActual.col + 1)){
                    tieneMovimientoPosibles = true;
                    return;
                }
            }
            // Ficha arriba
            if (ficha.col === fichaActual.col && fichaActual.fila === ficha.fila - 1) {
                if (this.posicionVacia(fichaActual.fila - 1, ficha.col)) {
                    tieneMovimientoPosibles = true;
                    return;
                }
            }
            // Ficha abajo
            if (ficha.col === fichaActual.col && fichaActual.fila === ficha.fila + 1) {
                if (this.posicionVacia(fichaActual.fila + 1, ficha.col)) {
                    tieneMovimientoPosibles = true;
                }
            }
        })

        return tieneMovimientoPosibles;
    }

    
    validarJuegoGanado() {
        if (this.fichas.length === 1 && this.fichas[0].fila === 3 && this.fichas[0].col === 3) {
            return true;
        }
        return false;
    }

    //devuelve el tiempo restante en segundos
    obtenerTiempoRestante() {
        let tiempoActual = Math.floor((Date.now() - this.tiempoInicio) / 1000);
        return this.TIME_LIMIT - tiempoActual;
    }

    //reinicia las variables del juego
    reiniciar(){
        this.tiempoInicio = Date.now();
        this.inicializarFichas();
        this.deseleccionarFicha();
        this.limpiarResaltado();
    }

}