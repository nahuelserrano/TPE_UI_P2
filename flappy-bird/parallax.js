// ============================================
// SISTEMA DE PARALLAX SCROLLING
// ============================================
export class Parallax {
     constructor(canvasWidth, canvasHeight, baseSpeed) {
         this.canvasWidth = canvasWidth;
         this.canvasHeight = canvasHeight;
         this.baseSpeed = baseSpeed;

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

                     layer.x = 0; // <-- (IMPORTANTE) Vuelve a poner 0

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

                         layer.next_y = Math.floor(Math.random() * (max_y - min_y + 1)) + min_y;
                     }
                 }
             }
         });
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
             layer.x = 0;
             if (layer.name === 'tubos') {
                 layer.y = 0;
                 layer.next_y = 0;
                 layer.scored = false;
                 layer.next_scored = false;
             }
         });
     }
     /**
      * Cambia la velocidad del parallax (útil para acelerar el juego)
      */
     setSpeed(newSpeed) {
         this.baseSpeed = newSpeed;
     }
 }