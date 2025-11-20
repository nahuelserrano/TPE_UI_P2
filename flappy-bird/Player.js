import { AnimationController } from './animationController.js';

export class Player {
    constructor(x, y, canvasHeight) {
        // === POSICIÓN ===
        this.x = x;
        this.y = y;

        // === FÍSICA ===
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpForce = -8;
        this.maxVelocity = 25;

        // === VISUAL ===
        this.radius = 25;
        this.color = '#FF0000';
        this.canvasHeight = canvasHeight;

        // === ROTACIÓN ===
        this.rotation = 0;           // Ángulo actual en radianes
        this.maxRotation = Math.PI / 3; // 45 grados máximo hacia arriba/abajo

        // === SPRITES ===
        this.normalSprite = new Image();
        this.normalSprite.src = '../imagenes/flappy-bird/stich-sp-default.png';

        // Sprites de voltereta (usar 4-6 frames para efecto rápido)
        this.spinSprites = this.loadSpinSprites();

        // === CONTROLADOR DE VOLTERETA ===
        this.spinAnimation = new AnimationController(
            this.spinSprites,
            0.05,  // 50ms por frame = MUY RÁPIDO (voltereta veloz)
            true   // Loop = se repite mientras cae
        );

        // === ESTADOS ===
        this.isSpinning = false;     // ¿Está en voltereta?
        this.fallTime = 0;           // Tiempo cayendo (para activar voltereta)
        this.spinThreshold = 0.2;    // Segundos cayendo antes de voltereta (ajustable)

        this.currentSprite = this.normalSprite;
        this.spriteLoaded = false;

        this.normalSprite.onload = () => {
            this.spriteLoaded = true;
            console.log('✅ Sprite normal cargado');
        };

        console.log('🎮 Jugador con sistema de rotación creado');
    }

    /**
     * Carga los sprites de la voltereta
     * Puedes usar el mismo sprite rotado o 4-6 sprites diferentes
     */
    loadSpinSprites() {

        const spritePaths = Array(6).fill('../imagenes/flappy-bird/stich-sp-voltereta.png');

        return spritePaths.map((path, index) => {
            const sprite = new Image();
            sprite.src = path;
            sprite.onload = () => {
                console.log(`Sprite de voltereta ${index + 1} cargado`);
            };
            return sprite;
        });
    }

    update() {
        // === FÍSICA ===
        this.velocityY += this.gravity;

        if (this.velocityY > this.maxVelocity) {
            this.velocityY = this.maxVelocity;
        }

        this.y += this.velocityY;

        // Colisión con suelo
        if (this.y + this.radius > this.canvasHeight) {
            this.y = this.canvasHeight - this.radius;
            this.velocityY = 0;
            this.resetFallState(); // Resetear estado de caída
        }

        // Colisión con techo
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocityY = 0;
        }

        // === ACTUALIZAR ROTACIÓN Y ANIMACIÓN ===
        this.updateRotation();
        this.updateFallState();
        this.updateSprite();
    }

    /**
     * Actualiza la rotación del sprite según la velocidad
     * Rotación suave basada en velocidad Y
     */
    updateRotation() {
        // Si está en voltereta, la rotación la maneja la animación
        if (this.isSpinning) {
            return;
        }

        // Calcular rotación deseada según velocidad
        // velocityY negativa (subiendo) → rotación negativa (hacia arriba)
        // velocityY positiva (bajando) → rotación positiva (hacia abajo)

        // Mapear velocidad a rotación (-8 a +15 → -45° a +45°)
        const targetRotation = this.velocityY * (this.maxRotation / 15);

        // Suavizar la rotación (interpolación)
        const rotationSpeed = 0.2; // Qué tan rápido rota (0.1 = suave)
        this.rotation += (targetRotation - this.rotation) * rotationSpeed;

        // Limitar rotación máxima
        if (this.rotation > this.maxRotation) {
            this.rotation = this.maxRotation;
        }
        if (this.rotation < -this.maxRotation) {
            this.rotation = -this.maxRotation;
        }
    }

    /**
     * Gestiona el estado de caída y activa la voltereta
     */
    updateFallState() {
        const isFalling = this.velocityY > 3; // Cayendo rápido

        if (isFalling) {
            // Incrementar tiempo de caída
            this.fallTime += 1 / 60; // Asumiendo 60 FPS

            // Si llevamos suficiente tiempo cayendo, activar voltereta
            if (this.fallTime >= this.spinThreshold && !this.isSpinning) {
                this.startSpin();
            }
        } else {
            // Si no está cayendo rápido, resetear
            if (this.isSpinning) {
                this.stopSpin();
            }
            this.fallTime = 0;
        }
    }

    /**
     * Inicia la voltereta loca
     */
    startSpin() {
        this.isSpinning = true;
        this.spinAnimation.play();
        this.rotation = 0; // Resetear rotación suave
        console.log('¡Voltereta activada!');
    }

    /**
     * Detiene la voltereta
     */
    stopSpin() {
        this.isSpinning = false;
        this.spinAnimation.stop();
        this.currentSprite = this.normalSprite;
        console.log('Voltereta detenida');
    }

    /**
     * Resetea el estado de caída (al tocar suelo o saltar)
     */
    resetFallState() {
        this.fallTime = 0;
        if (this.isSpinning) {
            this.stopSpin();
        }
    }

    /**
     * Gestiona qué sprite mostrar
     */
    updateSprite() {
        if (this.isSpinning) {
            // Si está en voltereta, actualizar animación
            this.spinAnimation.update();
            this.currentSprite = this.spinAnimation.getSpriteActual();
        } else {
            // Si no, usar sprite normal
            this.currentSprite = this.normalSprite;
        }
    }

    jump() {
        this.velocityY = this.jumpForce;
        this.resetFallState(); // Resetear estado de caída al saltar
        console.log('Salto - velocityY:', this.velocityY);
    }

    /**
     * Dibuja el jugador con rotación
     */
    draw(ctx) {
        if (this.spriteLoaded) {
            const size = 125;
            const half = size / 2;

            // Guardar el estado del contexto
            ctx.save();

            // Mover el origen al centro del jugador
            ctx.translate(this.x, this.y);

            // Aplicar rotación (solo si NO está en voltereta)
            if (!this.isSpinning) {
                ctx.rotate(this.rotation);
            } else {
                // En voltereta, rotar según el frame actual
                const spinRotation = (this.spinAnimation.currentFrame / this.spinAnimation.sprites.length) * Math.PI * 2;
                ctx.rotate(spinRotation);
            }

            // Dibujar sprite centrado en el origen
            ctx.drawImage(
                this.currentSprite,
                -half,  // Centrado en X
                -half,  // Centrado en Y
                size,
                size
            );

            // Restaurar el estado del contexto
            ctx.restore();

        } else {
            // Círculo temporal
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}