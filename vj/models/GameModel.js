/**
 * GameModel - Modelo del juego (patrón MVC)
 * Responsabilidad: Gestionar el estado del juego, lógica de negocio y reglas
 */
class GameModel {
    constructor() {
        this.celdaResaltada = null; //Almacena la celda a resaltar

        this.TAMANIO_FICHA = 40;
        this.ESPACIADO = 100;
        this.START_X = 200;
        this.START_Y = 100;
        this.USAR_IMAGEN_TABLERO = false;

        // Imágenes
        this.imagesFichas = [
            "../imagenes/vj/Stich Elvis 2.jpeg",
            "../imagenes/vj/stich-vj-ejecucion.jpeg",
            "../imagenes/vj/LiloStitch-web.jpg",
            "../imagenes/vj/ruleta2.webp"
        ];
        this.fichasImg = [];
        this.tableroImg = new Image();
        this.imagenesCargadas = 0;

        // Matriz del tablero (1 = posición válida, 0 = fuera del tablero)
        this.matrizTablero = [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0]
        ];

        // Estado del juego
        this.fichas = [];
        this.fichaSeleccionada = null;
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
        this.imagesFichas.forEach((src, index) => {
            let img = new Image();
            img.src = src;
            img.onload = () => {
                this.imagenesCargadas++;
                console.log(`Imagen ${index + 1}/${this.imagesFichas.length} cargada`);

                if (this.imagenesCargadas === this.imagesFichas.length) {
                    console.log('✅ Todas las imágenes cargadas');
                    callback();
                }
            };
            img.onerror = () => {
                console.error(`❌ Error cargando imagen: ${src}`);
            };
            this.fichasImg.push(img);
        });
    }

    /**
     * Inicializa las fichas en el tablero
     * Coloca fichas en todas las posiciones excepto el centro (3,3)
     */
    inicializarFichas() {
        this.fichas = [];
        let contadorImg = 0;

        for (let fila = 0; fila < this.matrizTablero.length; fila++) {
            for (let col = 0; col < this.matrizTablero[fila].length; col++) {
                // Si es posición válida Y no es el centro
                if (this.matrizTablero[fila][col] === 1 && !(fila === 3 && col === 3)) {
                    const x = this.START_X + col * this.ESPACIADO;
                    const y = this.START_Y + fila * this.ESPACIADO;
                    const imagen = this.fichasImg[contadorImg % this.fichasImg.length];

                    const ficha = new Ficha(fila, col, x, y, imagen, this.TAMANIO_FICHA);
                    this.fichas.push(ficha);
                    contadorImg++;
                }
            }
        }

        console.log(`🎮 ${this.fichas.length} fichas creadas`);
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
        if (fila < 0 || fila >= 7 || col < 0 || col >= 7) return false;
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
            ficha.resetearPosicion(this.START_X, this.START_Y, this.ESPACIADO);
            return false;
        }

        if (nuevaFila === ficha.fila + 1 || nuevaFila === ficha.fila - 1 ){
            console.log("No puedes mover ahí, límite de distancia");
            ficha.resetearPosicion(this.START_X, this.START_Y, this.ESPACIADO);
            return false;
        }

        if (nuevaCol > ficha.col + 2 || nuevaCol < ficha.col - 2 ) {
            console.log("No puedes mover ahí, límite de distancia");
            ficha.resetearPosicion(this.START_X, this.START_Y, this.ESPACIADO);
            return false;
        }

        if (nuevaCol === ficha.col + 1 || nuevaCol === ficha.col - 1 ) {
            console.log("No puedes mover ahí, límite de distancia");
            ficha.resetearPosicion(this.START_X, this.START_Y, this.ESPACIADO);
            return false;
        }

        if(ficha.col !== nuevaCol && ficha.fila !== nuevaFila){
            console.log("No puedes mover ahí, los movimientos en diagonal no son validos");
            ficha.resetearPosicion(this.START_X, this.START_Y, this.ESPACIADO);
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
}