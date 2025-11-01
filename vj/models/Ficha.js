/**
 * Clase Ficha - representa cada pieza del juego
 */
export class Ficha {
    constructor(fila, col, imagen) {
        this.fila = fila;
        this.col = col;
        this.x = START_X + col * ESPACIADO;
        this.y = START_Y + fila * ESPACIADO;
        this.imagen = imagen;
        this.radio = TAMAÑO_FICHA;
    }

    /**
     * Dibuja la ficha en el canvas
     */
    dibujar() {
        ctx.save();

        // Crear clip circular para que la imagen sea redonda
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Dibujar la imagen dentro del círculo
        ctx.drawImage(
            this.imagen,
            this.x - this.radio,
            this.y - this.radio,
            this.radio * 2,
            this.radio * 2
        );

        ctx.restore();

        // Borde de la ficha (efecto 3D)
        ctx.strokeStyle = '#00CED1'; // Color cyan de Stitch
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.stroke();

        // Sombra exterior
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 2, this.radio + 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}