// ====================================
// SISTEMA DE ANIMACIONES
// ====================================

/**
 * Clase base para todas las animaciones
 * Define la estructura común que compartirán todas las animaciones
 */
class Animation {
    constructor(x, y) {
        this.x = x;              // Posición horizontal
        this.y = y;              // Posición vertical
        this.isFinished = false; // Indica si la animación terminó
        this.frame = 0;          // Frame actual de la animación
    }

    // Métodos que cada animación debe implementar
    update() {
        throw new Error('El método update() debe ser implementado');
    }

    draw(ctx) {
        throw new Error('El método draw() debe ser implementado');
    }
}

// ====================================
// ANIMACIÓN 1: EXPLOSIÓN
// ====================================
/**
 * Simula una explosión con círculos que se expanden y desvanecen
 * Perfecta para cuando el jugador choca con un obstáculo
 */
class ExplosionAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        // Configuración de la explosión
        this.maxRadius = 60;        // Radio máximo que alcanzará
        this.currentRadius = 0;     // Radio actual (empieza en 0)
        this.expansionSpeed = 4;    // Qué tan rápido crece
        this.opacity = 1;           // Opacidad (1 = opaco, 0 = invisible)
        this.fadeSpeed = 0.04;      // Qué tan rápido se desvanece

        // Colores que va cambiando (de amarillo a rojo a gris)
        this.colors = ['#FFD700', '#FF6347', '#FF4500', '#8B0000', '#696969'];
        this.currentColorIndex = 0;
    }

    /**
     * Actualiza el estado de la explosión en cada frame
     */
    update() {
        // Expandir el círculo
        this.currentRadius += this.expansionSpeed;

        // Desvanecer gradualmente
        this.opacity -= this.fadeSpeed;

        // Cambiar de color cada 5 frames
        this.frame++;
        if (this.frame % 5 === 0 && this.currentColorIndex < this.colors.length - 1) {
            this.currentColorIndex++;
        }

        // Terminar cuando sea invisible o demasiado grande
        if (this.opacity <= 0 || this.currentRadius >= this.maxRadius) {
            this.isFinished = true;
        }
    }

    /**
     * Dibuja la explosión en el canvas
     */
    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();

        // Círculo principal (grande)
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.colors[this.currentColorIndex];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Círculo interior (más brillante)
        ctx.globalAlpha = this.opacity * 0.6;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ====================================
// ANIMACIÓN 2: PARTÍCULAS DE IMPULSO
// ====================================
/**
 * Genera partículas que salen disparadas hacia abajo
 * Ideal para mostrar cuando el jugador salta
 */
class JumpParticlesAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        // Crear 8 partículas en diferentes direcciones
        this.particles = [];
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i; // Distribuir en círculo

            this.particles.push({
                x: x,
                y: y,
                // Velocidad en X e Y basada en el ángulo
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3 + 2, // +2 para que caigan más
                size: Math.random() * 4 + 2, // Tamaño aleatorio entre 2 y 6
                opacity: 1,
                color: ['#00CED1', '#1E90FF', '#4169E1'][Math.floor(Math.random() * 3)]
            });
        }

        this.lifetime = 30; // Duración en frames
    }

    /**
     * Actualiza la posición y opacidad de todas las partículas
     */
    update() {
        this.frame++;

        // Actualizar cada partícula
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravedad ligera
            p.opacity -= 0.03; // Desvanecer
        });

        // Terminar cuando se acabe el tiempo
        if (this.frame >= this.lifetime) {
            this.isFinished = true;
        }
    }

    /**
     * Dibuja todas las partículas
     */
    draw(ctx) {
        ctx.save();

        this.particles.forEach(p => {
            if (p.opacity <= 0) return;

            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// ====================================
// ANIMACIÓN 3: ESTRELLAS BRILLANTES
// ====================================
/**
 * Estrellas que aparecen, rotan y desaparecen
 * Útil para efectos de bonus o puntos especiales
 */
class StarAnimation extends Animation {
    constructor(x, y) {
        super(x, y);

        this.size = 5;              // Tamaño inicial
        this.maxSize = 30;          // Tamaño máximo
        this.growSpeed = 2;         // Velocidad de crecimiento
        this.rotation = 0;          // Ángulo de rotación
        this.rotationSpeed = 0.2;   // Velocidad de rotación
        this.opacity = 1;
        this.phase = 'growing';     // Fases: 'growing', 'shrinking'
    }

    /**
     * Actualiza el tamaño, rotación y fase de la estrella
     */
    update() {
        // Rotar constantemente
        this.rotation += this.rotationSpeed;

        if (this.phase === 'growing') {
            // Fase de crecimiento
            this.size += this.growSpeed;
            if (this.size >= this.maxSize) {
                this.phase = 'shrinking';
            }
        } else {
            // Fase de contracción
            this.size -= this.growSpeed;
            this.opacity -= 0.05;

            if (this.size <= 0 || this.opacity <= 0) {
                this.isFinished = true;
            }
        }
    }

    /**
     * Dibuja una estrella de 5 puntas rotando
     */
    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        // Dibujar estrella de 5 puntas
        ctx.fillStyle = '#FFD700'; // Dorado
        ctx.strokeStyle = '#FFA500'; // Naranja
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Punto interior (para forma de estrella)
            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * (this.size * 0.4);
            const innerY = Math.sin(innerAngle) * (this.size * 0.4);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}

// ====================================
// EXPORTAR LAS CLASES
// ====================================
export { ExplosionAnimation, JumpParticlesAnimation, StarAnimation };