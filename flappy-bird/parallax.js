// ============================================
// SISTEMA DE PARALLAX SCROLLING
// ============================================
export class Parallax {
     constructor(canvasWidth, canvasHeight, baseSpeed) {
         this.canvasWidth = canvasWidth;
         this.canvasHeight = canvasHeight;
         this.baseSpeed = baseSpeed;

         // this.tubeDistance = canvasWidth / 2;

         const layerImage = [
             "../imagenes/flappy-bird/fondo_playa.jpg", //fondo completo
             "../imagenes/flappy-bird/nubes.png",
             "../imagenes/flappy-bird/viento.png",
             "../imagenes/flappy-bird/tubo.png"//tubos
         ]

         this.layers = [
             {
                 name: 'playa',
                 speed: 0,
                 x: 0,
                 image: new Image()
             },

             {
                 name: 'nubes',
                 speed: 0.5,
                 x: 0,
                 image: new Image()
             },
             {
                 name: 'viento',
                 speed: 2.5  ,
                 x: 0,
                 image: new Image()
             },
             {
                 name: 'tubos',
                 speed: 0.9,
                 x: canvasWidth,
                 y: 0,
                 next_y: 0,
                 scored: false,
                 next_scored: false,
                 image: new Image(),
                 scaledWidth: 500, // Ajusta esto a tu gusto (ej. 55)
                 scaledHeight: 0
             }
         ];
         this.layers.forEach((layer, index) => {
             layer.image.src = layerImage[index];
         });

         console.log('🌄 Parallax creado con', this.layers.length, 'capas');
     }

     async load() {
         // Creamos un array de promesas, una por cada imagen
         const promises = this.layers.map(layer => {
             return new Promise((resolve, reject) => {
                 // Si ya está cargada (caché)
                 if (layer.image.complete) {
                     this.calculateScaledHeight(layer); // <-- (NUEVO)
                     return resolve(layer.image);
                 }
                 // Si no, esperamos a que cargue
                 layer.image.onload = () => {
                     this.calculateScaledHeight(layer); // <-- (NUEVO)
                     resolve(layer.image);
                 };
                 layer.image.onerror = (e) => reject(new Error(`Error cargando ${layer.image.src}: ${e}`));
             });
         });
         await Promise.all(promises);
         console.log('✅ Todas las capas del parallax han cargado.');
     }

     calculateScaledHeight(layer) {
         // Solo lo hacemos para capas que tengan 'scaledWidth' (los tubos)
         if (layer.scaledWidth && layer.image.width > 0) {
             const originalWidth = layer.image.width;
             const originalHeight = layer.image.height;
             const ratio = originalHeight / originalWidth;
             layer.scaledHeight = layer.scaledWidth * ratio;
         }
     }
     /**
      * Actualiza la posición de todas las capas
      */
     update() {
         this.layers.forEach(layer => {
             if (layer.speed > 0) {

                 layer.x -= this.baseSpeed * layer.speed;

                 if (layer.x <= -this.canvasWidth) { //

                     layer.x = 0;

                     if (layer.name === 'tubos') {
                         // La 'y' actual toma el valor de la 'y' siguiente
                         layer.y = layer.next_y;
                         layer.scored = layer.next_scored;
                         layer.next_scored = false;

                         // Y calculamos una nueva 'y' siguiente
                         const tubeHeight = layer.scaledHeight;
                         const canvasHeight = this.canvasHeight;
                         const padding = 80;

                         const max_y = -padding;
                         const min_y = -(tubeHeight - canvasHeight - padding);

                         layer.next_y = this.generateRandomTubePosition(layer);
                     }
                 }
             }
         });
     }

    /**
     * Genera una posición Y aleatoria para el tubo
     * @param {Object} layer - La capa del tubo
     * @returns {number} - Posición Y calculada
     */
    generateRandomTubePosition(layer) {
        const tubeHeight = layer.scaledHeight;
        const canvasHeight = this.canvasHeight;

        // Porcentajes de la imagen del tubo
        const porcentajeTuboSuperior = 0.365;  // 36.5% tubo superior
        const porcentajeHueco = 0.23;          // 23% hueco

        // Calcular altura del hueco en píxeles
        const alturaHueco = tubeHeight * porcentajeHueco;

        // Definir margen de seguridad (para que el hueco nunca salga del canvas)
        const margenSuperior = 100;  // Píxeles mínimos desde el techo
        const margenInferior = 100;  // Píxeles mínimos desde el suelo

        // Calcular posición más alta permitida (hueco cerca del techo)
        // El hueco debe empezar al menos a 'margenSuperior' del techo
        const posicionMasAlta = -(tubeHeight * porcentajeTuboSuperior) + margenSuperior;

        // Calcular posición más baja permitida (hueco cerca del suelo)
        // El hueco debe terminar al menos a 'margenInferior' del suelo
        const alturaTuboSuperior = tubeHeight * porcentajeTuboSuperior;
        const posicionMasBaja = -(alturaTuboSuperior - (canvasHeight - margenInferior - alturaHueco));

        // Generar posición aleatoria en el rango completo
        const rango = posicionMasAlta - posicionMasBaja;
        const posicionAleatoria = posicionMasBaja + (Math.random() * rango);

        // Debug (opcional)
        console.log(`Rango Y: [${posicionMasBaja.toFixed(0)}, ${posicionMasAlta.toFixed(0)}]`);
        console.log(`Nueva posición: ${posicionAleatoria.toFixed(0)}`);

        return posicionAleatoria;
    }


     /**
      * Dibuja todas las capas del parallax
      * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
      */
     draw(ctx) {
         this.layers.forEach((layer, index) => {

             if (layer.name === 'tubos') { //
                 if (layer.image.width === 0) return;

                 // Tubo 1 (Principal) usa layer.y
                 ctx.drawImage(
                     layer.image,
                     layer.x,
                     layer.y, // <-- USA 'y'
                     layer.scaledWidth,
                     layer.scaledHeight
                 );

                 // Tubo 2 (Copia) usa layer.next_y
                 ctx.drawImage(
                     layer.image,
                     layer.x + this.canvasWidth,
                     layer.next_y, // <-- USA 'next_y'
                     layer.scaledWidth,
                     layer.scaledHeight
                 );
             }else {
                 // Estas capas son fondos simples.
                 // Las dibujamos ocupando todo el ancho y alto del canvas.

                 // Copia 1
                 ctx.drawImage(
                     layer.image,
                     layer.x,
                     0,
                     this.canvasWidth,
                     this.canvasHeight
                 );

                 // Copia 2 (Loop infinito)
                 ctx.drawImage(
                     layer.image,
                     layer.x + this.canvasWidth,
                     0,
                     this.canvasWidth,
                     this.canvasHeight
                 );
             }


         });
     }

     /**
      * Reinicia todas las capas a su posición inicial
      */
     reset() {
         this.layers.forEach(layer => {
             if (layer.name === 'tubos') {
                 // Los tubos deben empezar FUERA de pantalla (derecha)
                 layer.x = this.canvasWidth;

                 // Generar posiciones Y aleatorias desde el inicio
                 layer.y = this.generateRandomTubePosition(layer);
                 layer.next_y = this.generateRandomTubePosition(layer);

                 // Resetear flags de puntuación
                 layer.scored = false;
                 layer.next_scored = false;
             } else {
                 // Fondos simples empiezan en x=0
                 layer.x = 0;
             }
         });

         console.log('🔄 Parallax reset completado - baseSpeed:', this.baseSpeed);
     }
     /**
      * Cambia la velocidad del parallax (útil para acelerar el juego)
      */
     setSpeed(newSpeed) {
         this.baseSpeed = newSpeed;
     }
 }