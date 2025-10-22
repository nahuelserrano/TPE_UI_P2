// ===== ELEMENTOS DEL DOM =====
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start-button');
const resetBtn = document.getElementById('reset-button');
const menuBtn = document.getElementById('menu-button');
const welcomeScreen = document.getElementById('welcome-screen');
const gameContent = document.getElementById('game-content');

// ===== CONSTANTES DEL JUEGO =====
const BLOCKA_SIZE = 300;
const INFO_HEIGHT = 60;
const GAME_OFFSET_Y = INFO_HEIGHT;
const TIME_LIMIT = 60;
const hashMap = new Map();

hashMap.set(4, {x: 2, y: 2});
hashMap.set(6, {x: 3, y: 2});
hashMap.set(8, {x: 4, y: 2});

// ===== IMÁGENES Y CONFIGURACIÓN =====
const images = [
    "../imagenes/ocarinaoftime.jpeg",
    "../imagenes/Peg hawaiano 1.png",
    "../imagenes/PORTAL 2.jpeg",
    "../imagenes/RED DEAD 2.jpeg",
    "../imagenes/STREET FIGHTER 6.jpeg",
    "../imagenes/THE WITCHER 3.jpeg",
    "../imagenes/VALORANT.jpeg",
    "../imagenes/WARZONE.jpeg"
];

// ===== VARIABLES DE ESTADO =====
let nivel = 0;
let gameWon = false;
let juegoActivo = false;
let pieces = [];
let tileCount = 4;
let imagenSeleccionada = null;
let ruletaActiva = false;

// ===== TEMPORIZADOR =====
let tiempoInicio = 0;
let tiempoActual = 0;
let timerInterval = null;

// ===== IMAGEN =====
const image = new Image();

/* ==================================================================================
   MANEJO DE ASINCRONÍA: Promises, async/await y sleep
   ==================================================================================

   JavaScript es single-threaded (un solo hilo de ejecución). Para operaciones que
   toman tiempo (cargar imágenes, esperar delays), usamos ASINCRONÍA.

   1. PROMISE:
      - Es un objeto que representa el resultado eventual de una operación asíncrona
      - Tiene 3 estados: pending (pendiente), fulfilled (cumplida), rejected (rechazada)
      - Sintaxis: new Promise((resolve, reject) => { ... })

   2. async/await:
      - 'async' convierte una función en asíncrona (siempre retorna una Promise)
      - 'await' pausa la ejecución de la función async hasta que la Promise se resuelva
      - IMPORTANTE: await SOLO funciona dentro de funciones async

   3. sleep (delay):
      - Función helper que crea una Promise que se resuelve después de X milisegundos
      - Uso: await sleep(1000) pausa la ejecución por 1 segundo
      - Equivalente a setTimeout pero con sintaxis más limpia usando await

   Ejemplo del flujo:

   async function ejemplo() {
       console.log('Inicio');                    // Se ejecuta inmediatamente
       await sleep(1000);                        // PAUSA aquí por 1 segundo
       console.log('Después de 1 segundo');      // Se ejecuta después del delay
       await cargarImagen();                     // PAUSA hasta que la imagen cargue
       console.log('Imagen cargada');            // Se ejecuta cuando termine la carga
   }

   Sin await, todo se ejecutaría inmediatamente sin esperar, causando errores.
   ================================================================================== */

// ===== RULETA =====
async function ejecutarRuleta() {
    ruletaActiva = true;

    const y = canvas.height - 50;
    const x = canvas.width / images.length;
    const thumbnails = [];

    // Cargar cada thumbnail de forma secuencial
    // await dentro del loop asegura que cada imagen se carga antes de continuar
    for (let i = 0; i < images.length; i++) {
        const imagen = new Image();
        imagen.src = images[i];

        // Promise que se resuelve cuando la imagen termina de cargar
        // Si falla (onerror), igual resuelve para no bloquear el flujo
        await new Promise((resolve, reject) => {
            imagen.onload = resolve;
            imagen.onerror = () => {
                console.warn(`Thumbnail ${i} no cargó`);
                resolve();
            };
        });

        const thumbnail = {
            imagen: imagen,
            x: x * i,
            y: y,
            width: 30,
            height: 30,
            isSelected: false,
            borderColor: "#4CAF50",
            borderWidth: 4
        };
        thumbnails.push(thumbnail);
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#333";
    context.font = "bold 20px 'Helvetica Neue'";
    context.textAlign = "center";
    context.fillText("Seleccionando imagen...", canvas.width / 2, canvas.height / 2 - 40);

    thumbnails.forEach(thumb => dibujarThumbnail(thumb));

    // sleep: función que retorna una Promise que se resuelve después de 'ms' milisegundos
    // await sleep(X) pausa la ejecución por X milisegundos
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const cantVueltas = 3;
    let indiceGanador;

    // Animación: cada 'await sleep' pausa antes de continuar al siguiente frame
    for (let vuelta = 0; vuelta < cantVueltas; vuelta++) {
        let fin;
        if (vuelta === cantVueltas - 1) {
            fin = Math.floor(Math.random() * thumbnails.length);
            indiceGanador = fin === 0 ? 0 : fin - 1;
        } else {
            fin = thumbnails.length;
        }

        for (let i = 0; i < fin; i++) {
            thumbnails.forEach(t => t.isSelected = false);
            thumbnails[i].isSelected = true;

            context.clearRect(0, y - 5, canvas.width, 40);
            thumbnails.forEach(thumb => dibujarThumbnail(thumb));

            // Pausa de 100ms entre cada frame de animación
            await sleep(100);
        }
    }

    imagenSeleccionada = images[indiceGanador];

    context.fillStyle = "#4CAF50";
    context.font = "bold 24px 'Helvetica Neue'";
    context.fillText("¡Imagen seleccionada!", canvas.width / 2, canvas.height / 2 + 20);

    // Esperar 1.5 segundos antes de continuar
    await sleep(1500);

    ruletaActiva = false;

    return imagenSeleccionada;
}

function dibujarThumbnail(thumbnailData) {
    context.drawImage(
        thumbnailData.imagen,
        thumbnailData.x,
        thumbnailData.y,
        thumbnailData.width,
        thumbnailData.height
    );

    if (thumbnailData.isSelected) {
        context.strokeStyle = thumbnailData.borderColor;
        context.lineWidth = thumbnailData.borderWidth;
        context.strokeRect(
            thumbnailData.x - 2,
            thumbnailData.y - 2,
            thumbnailData.width + 4,
            thumbnailData.height + 4
        );
    }
}

// Retorna una Promise que se resuelve cuando la imagen se carga completamente
// Uso: await loadImage(url) pausa hasta que la imagen esté lista
function loadImage(src) {
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = (e) => {
            console.error('Error cargando imagen:', src, e);
            reject(e);
        };
        image.src = src;
    });
}

function drawGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawInfo();
    drawPieces();

    if (!gameWon) {
        filtro();
    }
}

function drawPieces() {
    const horizontal = hashMap.get(tileCount).x;
    const vertical = hashMap.get(tileCount).y;
    const parteWidth = BLOCKA_SIZE / horizontal;
    const parteHeight = BLOCKA_SIZE / vertical;

    pieces.forEach(piece => {
        context.save();
        context.translate(piece.dx + parteWidth/2, piece.dy + parteHeight/2);
        context.rotate(piece.rotation);
        context.drawImage(
            image,
            piece.sx, piece.sy, parteWidth, parteHeight,
            -parteWidth/2, -parteHeight/2, parteWidth, parteHeight
        );
        context.restore();
    });
}

function iniciarTemporizador() {
    tiempoInicio = Date.now();
    tiempoActual = 0;

    // Prevenir inicio si la ruleta está ejecutándose
    if (ruletaActiva) {
        return;
    }

    timerInterval = setInterval(() => {
        if (!gameWon && juegoActivo && !ruletaActiva) {
            tiempoActual = Math.floor((Date.now() - tiempoInicio) / 1000);

            if (tiempoActual >= TIME_LIMIT) {
                loseGame();
            } else {
                drawInfo();
            }
        }
    }, 1000);
}

function detenerTemporizador() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatearTiempo(segundos) {
    if (!juegoActivo) {
        return "--:--";
    }

    const tiempoRestante = TIME_LIMIT - segundos;
    const minutos = Math.floor(tiempoRestante / 60);
    const segs = tiempoRestante % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
}

function drawInfo() {
    if (ruletaActiva) return;

    context.fillStyle = "#f0f0f0";
    context.fillRect(0, 0, BLOCKA_SIZE, INFO_HEIGHT);

    context.strokeStyle = "#333";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, INFO_HEIGHT);
    context.lineTo(BLOCKA_SIZE, INFO_HEIGHT);
    context.stroke();

    context.fillStyle = "#333";
    context.font = "bold 18px 'Helvetica Neue'";
    context.textAlign = "left";

    context.fillText("Tiempo:", 15, 30);

    const tiempoRestante = TIME_LIMIT - tiempoActual;
    if (tiempoRestante <= 10) {
        context.fillStyle = "#f44336";
    } else if (tiempoRestante <= 20) {
        context.fillStyle = "#ff9800";
    } else {
        context.fillStyle = "#007bff";
    }
    context.fillText(formatearTiempo(tiempoActual), 15, 50);

    context.fillStyle = "#333";
    context.textAlign = "right";
    context.fillText("Nivel:", BLOCKA_SIZE - 15, 30);
    context.fillStyle = "#28a745";
    context.fillText((nivel + 1).toString(), BLOCKA_SIZE - 15, 50);
}

function mostrarBienvenida() {
    welcomeScreen.classList.remove('hidden');
    gameContent.classList.remove('active');
    juegoActivo = false;
    detenerTemporizador();
}

function mostrarJuego() {
    welcomeScreen.classList.add('hidden');
    gameContent.classList.add('active');
}

/* ==================================================================================
   EVENT LISTENERS

   Flujo de ejecución con async/await:

   1. Usuario hace click en Start
   2. mostrarJuego() ejecuta sincronicamente
   3. await ejecutarRuleta() PAUSA aquí hasta que la ruleta termine (~10 segundos)
   4. await startLevel() PAUSA aquí hasta que la imagen cargue y el nivel inicie
   5. Solo después de todo lo anterior, el event listener termina

   Sin 'await', todas las funciones se ejecutarían simultáneamente causando
   race conditions y bugs visuales.
   ================================================================================== */

startBtn.addEventListener('click', async () => {
    mostrarJuego();

    // Esperar a que la ruleta termine completamente
    await ejecutarRuleta();

    // Esperar a que el nivel se cargue e inicialice
    await startLevel();
});

menuBtn.addEventListener('click', () => {
    mostrarBienvenida();
    nivel = 0;
    gameWon = false;
    juegoActivo = false;
    imagenSeleccionada = null;
});

resetBtn.addEventListener('click', async () => {
    detenerTemporizador();
    await initializePuzzle();
});

canvas.addEventListener('mousedown', onCanvasClick);

async function startLevel() {
    if (nivel >= images.length) {
        detenerTemporizador();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.font = "bold 30px 'Helvetica Neue'";
        context.textAlign = "center";
        context.fillText("¡Juego Completado!", canvas.width / 2, canvas.height / 2);

        // new Promise + setTimeout crea un delay de 3 segundos
        // resolve() se llama después de 3000ms, permitiendo que await continúe
        await new Promise(resolve => setTimeout(resolve, 3000));

        nivel = 0;
        mostrarBienvenida();
        return;
    }

    try {
        const imagenACargar = imagenSeleccionada || images[nivel];

        // await pausa hasta que loadImage() complete la carga
        await loadImage(imagenACargar);

        await initializePuzzle();
        juegoActivo = true;

    } catch (error) {
        console.error('Error al cargar nivel:', error);
        alert('Error cargando la imagen. Verifica las rutas de las imágenes.');
    }
}

async function initializePuzzle() {
    gameWon = false;
    pieces = [];
    juegoActivo = true;

    detenerTemporizador();
    iniciarTemporizador();

    const horizontal = hashMap.get(tileCount).x;
    const vertical = hashMap.get(tileCount).y;
    const parteWidth = BLOCKA_SIZE / horizontal;
    const parteHeight = BLOCKA_SIZE / vertical;
    const rotaciones = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

    for (let x = 0; x < horizontal; x++) {
        for (let y = 0; y < vertical; y++) {
            const piece = {
                sx: x * parteWidth,
                sy: y * parteHeight,
                dx: x * parteWidth,
                dy: y * parteHeight + GAME_OFFSET_Y,
                rotation: rotaciones[Math.floor(Math.random() * rotaciones.length)],
            };
            pieces.push(piece);
        }
    }

    drawGame();
}

function onCanvasClick(event) {
    if (!juegoActivo || gameWon || ruletaActiva) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const horizontal = hashMap.get(tileCount).x;
    const vertical = hashMap.get(tileCount).y;
    const tileW = BLOCKA_SIZE / horizontal;
    const tileH = BLOCKA_SIZE / vertical;

    const clickedPiece = pieces.find(piece =>
        x >= piece.dx && x < piece.dx + tileW &&
        y >= piece.dy && y < piece.dy + tileH
    );

    if (clickedPiece) {
        clickedPiece.rotation += Math.PI / 2;

        context.clearRect(0, GAME_OFFSET_Y, BLOCKA_SIZE, BLOCKA_SIZE);
        drawPieces();

        if (!gameWon) {
            filtro();
        }

        checkWinCondition();
    }
}

async function checkWinCondition() {
    const isSolved = pieces.every(p => (p.rotation % (2 * Math.PI)).toFixed(4) == 0.0000);

    if (isSolved) {
        gameWon = true;
        detenerTemporizador();

        await new Promise(resolve => setTimeout(resolve, 100));

        drawGame();

        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(0, GAME_OFFSET_Y, BLOCKA_SIZE, BLOCKA_SIZE);
        context.fillStyle = "white";
        context.font = "bold 40px 'Helvetica Neue'";
        context.textAlign = "center";
        context.fillText("¡Ganaste!", BLOCKA_SIZE / 2, canvas.height / 2);
        context.fillText("avanzando...", BLOCKA_SIZE / 2, canvas.height / 2 + 40);

        await new Promise(resolve => setTimeout(resolve, 2000));

        nivel++;

        // Ejecutar ruleta y ESPERAR a que termine antes de continuar
        ruletaActiva = true;
        await ejecutarRuleta();
        ruletaActiva = false;

        await startLevel();
    }
}

async function loseGame() {
    juegoActivo = false;
    detenerTemporizador();

    await new Promise(resolve => setTimeout(resolve, 100));

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(0, GAME_OFFSET_Y, BLOCKA_SIZE, BLOCKA_SIZE);
    context.fillStyle = "white";
    context.font = "bold 40px 'Helvetica Neue'";
    context.textAlign = "center";
    context.fillText("¡Tiempo agotado!", BLOCKA_SIZE / 2, canvas.height / 2 - 20);
    context.font = "bold 24px 'Helvetica Neue'";
    context.fillText("Comenzando desde nivel 1...", BLOCKA_SIZE / 2, canvas.height / 2 + 30);

    await new Promise(resolve => setTimeout(resolve, 3000));

    nivel = 0;

    ruletaActiva = true;
    await ejecutarRuleta();
    ruletaActiva = false;

    await startLevel();
}

function filtro() {
    const imageData = context.getImageData(0, GAME_OFFSET_Y, BLOCKA_SIZE, BLOCKA_SIZE);

    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            setPixel(imageData, x, y);
        }
    }

    context.putImageData(imageData, 0, GAME_OFFSET_Y);
}

function setPixel(imageData, x, y) {
    const index = (x + y * imageData.width) * 4;
    const r = imageData.data[index];
    const g = imageData.data[index + 1];
    const b = imageData.data[index + 2];
    const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

    switch (nivel) {
        case 0:
            imageData.data[index] = gray;
            imageData.data[index+1] = gray;
            imageData.data[index+2] = gray;
            break;
        case 1:
            imageData.data[index] = imageData.data[index]+50;
            imageData.data[index+1] = imageData.data[index+1]+50;
            imageData.data[index+2] = imageData.data[index+2]+50;
            break;
        case 2:
            imageData.data[index] = 255-imageData.data[index];
            imageData.data[index+1] = 255-imageData.data[index+1];
            imageData.data[index+2] = 255-imageData.data[index+2];
            break;
        case 3:
            imageData.data[index] = imageData.data[index]+50;
            imageData.data[index+1] = imageData.data[index+1]+50;
            imageData.data[index+2] = imageData.data[index+2]+50;
            break;
        case 4:
            imageData.data[index] = gray;
            imageData.data[index+1] = gray;
            imageData.data[index+2] = gray;
            break;
        case 5:
            imageData.data[index] = 255-imageData.data[index];
            imageData.data[index+1] = 255-imageData.data[index+1];
            imageData.data[index+2] = 255-imageData.data[index+2];
            break;
        case 6:
            imageData.data[index] = imageData.data[index]+50;
            imageData.data[index+1] = imageData.data[index+1]+50;
            imageData.data[index+2] = imageData.data[index+2]+50;
            break;
        case 7:
            imageData.data[index] = gray;
            imageData.data[index+1] = gray;
            imageData.data[index+2] = gray;
            break;
    }
}