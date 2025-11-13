/**
 * Clase Ficha - Representa una pieza del juego
 * Responsabilidad: Almacenar datos de posición e imagen de cada ficha
 */
class Ficha {
    /**
     * Constructor de la ficha
     * @param {number} fila - Fila en la matriz del tablero
     * @param {number} col - Columna en la matriz del tablero
     * @param {number} x - Posición X en canvas
     * @param {number} y - Posición Y en canvas
     * @param {HTMLImageElement} imagen - Imagen a mostrar
     * @param {number} radio - Radio de la ficha
     */
    constructor(fila, col, x, y, imagen, radio) {
        this.fila = fila;
        this.col = col;
        this.x = x;
        this.y = y;
        this.imagen = imagen;
        this.radio = radio;
        this.seleccionada = false;
        this.arrastrando = false;
        this.tamanioBorde = 4;
    }

    /**
     * Verifica si un punto está dentro de la ficha
     * @param {number} px - Coordenada X del punto
     * @param {number} py - Coordenada Y del punto
     * @returns {boolean} - True si el punto está dentro
     */
    contienePunto(px, py) {
        const distancia = Math.sqrt(
            Math.pow(px - this.x, 2) + Math.pow(py - this.y, 2)
        );
        return distancia <= this.radio + this.tamanioBorde;
    }

    /**
     * Actualiza la posición visual de la ficha (para drag)
     * @param {number} x - Nueva posición X
     * @param {number} y - Nueva posición Y
     */
    actualizarPosicion(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Resetea la posición de la ficha a su celda original
     * @param {number} startX - Coordenada X inicial del tablero
     * @param {number} startY - Coordenada Y inicial del tablero
     * @param {number} espaciado - Espaciado entre celdas
     */
    resetearPosicion(startX, startY, espaciado) {
        this.x = startX + this.col * espaciado;
        this.y = startY + this.fila * espaciado;
    }
}