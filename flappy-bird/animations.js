/**
 * Clase base para todas las animaciones
 * Define la estructura común
 */
class Animation {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isFinished = false;
        this.frame = 0;
    }

    update() {
        throw new Error('El método update() debe ser implementado');
    }

    draw(ctx) {
        throw new Error('El método draw() debe ser implementado');
    }
}

// ====================================
// ANIMACIÓN: EXPLOSIÓN
// ====================================

class ExplosionAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        // Configuración
        this.radioMaximo = 60;
        this.radioActual = 0;
        this.velocidadExpansion = 4;
        this.opacidad = 1;
        this.velocidadDesvanecimiento = 0.04;

        // Colores progresivos (amarillo → rojo → gris)
        this.colores = ['#FFD700', '#FF6347', '#FF4500', '#8B0000', '#696969'];
        this.indiceColor = 0;
    }

    update() {
        // Expandir
        this.radioActual += this.velocidadExpansion;

        // Desvanecer
        this.opacidad -= this.velocidadDesvanecimiento;

        // Cambiar color cada 5 frames
        this.frame++;
        if (this.frame % 5 === 0 && this.indiceColor < this.colores.length - 1) {
            this.indiceColor++;
        }

        // Terminar cuando sea invisible o muy grande
        if (this.opacidad <= 0 || this.radioActual >= this.radioMaximo) {
            this.isFinished = true;
        }
    }

    draw(ctx) {
        if (this.opacidad <= 0) return;

        ctx.save();

        // Círculo principal
        ctx.globalAlpha = this.opacidad;
        ctx.fillStyle = this.colores[this.indiceColor];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radioActual, 0, Math.PI * 2);
        ctx.fill();

        // Círculo interior brillante
        ctx.globalAlpha = this.opacidad * 0.6;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radioActual * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ====================================
// ANIMACIÓN: PARTÍCULAS DE SALTO
// ====================================

class JumpParticlesAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        // Crear 8 partículas en direcciones radiales
        this.particulas = [];
        const cantidadParticulas = 8;
        const coloresDisponibles = ['#00CED1', '#1E90FF', '#4169E1'];

        for (let i = 0; i < cantidadParticulas; i++) {
            const angulo = (Math.PI * 2 / cantidadParticulas) * i;

            this.particulas.push({
                x: x,
                y: y,
                vx: Math.cos(angulo) * 3,
                vy: Math.sin(angulo) * 3 + 2, // Bias hacia abajo
                tamanio: Math.random() * 4 + 2,
                opacidad: 1,
                color: coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)]
            });
        }

        this.tiempoVida = 30; // Frames de duración
    }

    update() {
        this.frame++;

        // Actualizar cada partícula
        this.particulas.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;        // Gravedad
            p.opacidad -= 0.03; // Desvanecer
        });

        // Terminar cuando expire el tiempo
        if (this.frame >= this.tiempoVida) {
            this.isFinished = true;
        }
    }

    draw(ctx) {
        ctx.save();

        this.particulas.forEach(p => {
            if (p.opacidad <= 0) return;

            ctx.globalAlpha = p.opacidad;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.tamanio, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// ====================================
// ANIMACIÓN: ESTRELLA DE PUNTOS
// ====================================

class StarAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        this.tamanio = 5;
        this.tamanioMaximo = 30;
        this.velocidadCrecimiento = 2;
        this.rotacion = 0;
        this.velocidadRotacion = 0.2;
        this.opacidad = 1;
        this.fase = 'creciendo'; // 'creciendo' o 'contrayendo'
    }

    update() {
        // Rotar constantemente
        this.rotacion += this.velocidadRotacion;

        if (this.fase === 'creciendo') {
            this.tamanio += this.velocidadCrecimiento;
            if (this.tamanio >= this.tamanioMaximo) {
                this.fase = 'contrayendo';
            }
        } else {
            this.tamanio -= this.velocidadCrecimiento;
            this.opacidad -= 0.05;

            if (this.tamanio <= 0 || this.opacidad <= 0) {
                this.isFinished = true;
            }
        }
    }

    draw(ctx) {
        if (this.opacidad <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotacion);
        ctx.globalAlpha = this.opacidad;

        // Dibujar estrella de 5 puntas
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            // Punto exterior
            const anguloExterior = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const xExterior = Math.cos(anguloExterior) * this.tamanio;
            const yExterior = Math.sin(anguloExterior) * this.tamanio;

            if (i === 0) {
                ctx.moveTo(xExterior, yExterior);
            } else {
                ctx.lineTo(xExterior, yExterior);
            }

            // Punto interior
            const anguloInterior = anguloExterior + Math.PI / 5;
            const xInterior = Math.cos(anguloInterior) * (this.tamanio * 0.4);
            const yInterior = Math.sin(anguloInterior) * (this.tamanio * 0.4);
            ctx.lineTo(xInterior, yInterior);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}


// ====================================
// ANIMACIÓN: BONUS VOLTERETA
// ====================================

class VolteretaBonusAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        // Guardar posición inicial
        this.inicialY = y;

        // Configuración de movimiento
        this.velocidadY = -1.5;       // Sube más lento para ser visible
        this.opacidad = 1;
        this.escala = 0.5;            // Empieza pequeño
        this.escalaMaxima = 1.3;

        // Timing
        this.duracion = 90;           // Más tiempo visible (1.5 segundos a 60fps)
        this.faseCrecer = 15;         // Frames para crecer

        console.log('Animación bonus creada en:', x, y);
    }

    update() {
        this.frame++;

        // Fase 1: Crecer (primeros frames)
        if (this.frame <= this.faseCrecer) {
            // Escala de 0.5 a 1.3 con efecto "pop"
            const progreso = this.frame / this.faseCrecer;
            this.escala = 0.5 + (progreso * 0.8);

            // Efecto de rebote al final del crecimiento
            if (this.frame === this.faseCrecer) {
                this.escala = this.escalaMaxima;
            }
        }
        // Fase 2: Volver a tamaño normal
        else if (this.frame <= this.faseCrecer + 10) {
            this.escala = this.escalaMaxima - ((this.frame - this.faseCrecer) / 10) * 0.3;
        }
        // Fase 3: Subir y desvanecer
        else {
            this.escala = 1;
            this.y += this.velocidadY;

            // Calcular opacidad basada en frames restantes
            const framesRestantes = this.duracion - this.frame;
            const framesDeDesvanecimiento = 40;

            if (framesRestantes < framesDeDesvanecimiento) {
                this.opacidad = framesRestantes / framesDeDesvanecimiento;
            }
        }

        // Finalizar
        if (this.frame >= this.duracion) {
            this.isFinished = true;
            console.log('Animación bonus finalizada');
        }
    }

    draw(ctx) {
        if (this.opacidad <= 0) return;

        ctx.save();

        ctx.globalAlpha = this.opacidad;
        ctx.translate(this.x, this.y);
        ctx.scale(this.escala, this.escala);

        // Fondo semi-transparente (hace el texto más visible)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(-45, -18, 90, 50, 8);
        ctx.fill();

        // Texto principal "+1"
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Texto dorado
        ctx.fillStyle = '#FFD700';
        ctx.fillText('+1', 0, 0);

        // Quitar sombra para el texto secundario
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Texto "VOLTERETA"
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('VOLTERETA', 0, 20);

        ctx.restore();
    }
}

export { ExplosionAnimation, JumpParticlesAnimation, StarAnimation, VolteretaBonusAnimation };