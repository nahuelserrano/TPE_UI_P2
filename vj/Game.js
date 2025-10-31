// ===== ELEMENTOS DEL DOM =====
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start-button');
const resetBtn = document.getElementById('reset-button');
const menuBtn = document.getElementById('menu-button');
const welcomeScreen = document.getElementById('welcome-screen');
const gameContent = document.getElementById('game-content');

// ===== CONSTANTES DEL JUEGO =====
const PIECE_SIZE = 150; // Tamaño base de cada pieza cuadrada
const INFO_HEIGHT = 60;
const GAME_OFFSET_Y = INFO_HEIGHT;
let TIME_LIMIT = 60;
const hashMap = new Map();
const VUELTAS_DE_RULETA = 3;

// Configuraciones con piezas CUADRADAS
// formato: {x: columnas, y: filas}
hashMap.set(4, {x: 2, y: 2});  // 2x2 = 4 piezas
hashMap.set(6, {x: 2, y: 3});  // 2x3 = 6 piezas
hashMap.set(8, {x: 2, y: 4});  // 3x3 = 8 piezas

// ===== IMÁGENES Y CONFIGURACIÓN =====
const images = [
    "../imagenes/vj/Lys Jugando 4.jpg",
    "../imagenes/vj/LyS 3 video.webp",
    "../imagenes/vj/Stich Elvis 2.jpeg",
    "../imagenes/vj/stich-vj-ejecucion.jpeg",
    "../imagenes/vj/LiloStitch-web.jpg",
    "../imagenes/vj/ruleta2.webp",
    "../imagenes/vj/lilo-stitch-1920581-2194132495.jpg",
    "../imagenes/vj/LyS-ruleta.jpg",
];

// ===== VARIABLES DE ESTADO =====
let nivel = 0;
let gameWon = false;
let juegoActivo = false;
let pieces = [];
let tileCount = 4;
let imagenSeleccionada = null;
let ruletaActiva = false;

// ===== VARIABLES DE DIMENSIONES DINÁMICAS =====
let BLOCKA_WIDTH = 300;
let BLOCKA_HEIGHT = 300;

// ===== TEMPORIZADOR =====
let tiempoInicio = 0;
let tiempoActual = 0;
let timerInterval = null;

// ===== IMAGEN =====
const image = new Image();

/* ==================================================================================
   ACTUALIZACIÓN DE DIMENSIONES DEL CANVAS
   ==================================================================================

   Ajusta el tamaño del canvas según la configuración de piezas para que todas
   sean cuadradas de PIECE_SIZE × PIECE_SIZE
   ================================================================================== */

function updateCanvasDimensions() {
    const config = hashMap.get(tileCount);
    BLOCKA_WIDTH = config.x * PIECE_SIZE;
    BLOCKA_HEIGHT = config.y * PIECE_SIZE;

    canvas.width = BLOCKA_WIDTH;
    canvas.height = BLOCKA_HEIGHT + INFO_HEIGHT;
}

/* ==================================================================================
   MANEJO DE ASINCRONÍA: Promises, async/await y sleep
   ================================================================================== */

// ===== RULETA =====
async function ejecutarRuleta() {
    ruletaActiva = true;

    const y = canvas.height - 50;
    const x = canvas.width / images.length;
    const thumbnails = [];

    for (let i = 0; i < images.length; i++) {
        const imagen = new Image();

        // CORRECCIÓN: Asignar handlers ANTES del src
        const loadPromise = new Promise((resolve, reject) => {
            imagen.onload = () => resolve(true);
            imagen.onerror = () => {
                console.warn(`Thumbnail ${i} no cargó: ${images[i]}`);
                resolve(false); // Retorna false si falla
            };
        });

        imagen.src = images[i];
        const cargadaCorrectamente = await loadPromise;

        if (cargadaCorrectamente) {
            const thumbnail = {
                imagen: imagen,
                x: x * i,
                y: y,
                width: 30,
                height: 30,
                isSelected: false,
                borderColor: "#11BFEE",
                borderWidth: 4
            };
            thumbnails.push(thumbnail);
        }
    }

    if (thumbnails.length === 0) {
        console.error("No se pudo cargar ninguna imagen");
        ruletaActiva = false;
        return images[0]; // Retornar la primera por defecto
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#11BFEE";
    context.font = "bold 18px 'Baloo 2', sans-serif";
    context.textAlign = "center";
    context.fillText("Seleccionando imagen...", canvas.width / 2, canvas.height / 2 - 40);

    thumbnails.forEach(thumb => dibujarThumbnail(thumb));

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let indiceImagenSelec;

    for (let vuelta = 0; vuelta < VUELTAS_DE_RULETA; vuelta++) {
        let fin;
        if (vuelta === VUELTAS_DE_RULETA - 1) {
            fin = Math.floor(Math.random() * thumbnails.length) + 1; // fin = imagen seleccionada
            console.log("FIN: " + fin)
            indiceImagenSelec = fin - 1;
            console.log("SELEC: " + indiceImagenSelec);
        } else {
            fin = thumbnails.length;
        }

        for (let i = 0; i < fin; i++) {
            for (let j = 0; j < thumbnails.length; j++) {
                thumbnails[j].isSelected = false;
            }

            thumbnails[i].isSelected = true;

            context.clearRect(0, y - 5, canvas.width, 40);
            thumbnails.forEach(thumb => dibujarThumbnail(thumb));

            await sleep(100);
        }
    }

    imagenSeleccionada = thumbnails[indiceImagenSelec].imagen.src;

    context.fillStyle = "#022B49";
    context.font = "bold 24px 'Baloo 2', sans-serif";
    context.fillText("¡Imagen seleccionada!", canvas.width / 2, canvas.height / 2 + 20);

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

// Carga una imagen y retorna una promesa
function loadImage(src) {
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
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

/**
 * Dibuja todas las piezas del puzzle en el canvas
 * Cada pieza:
 * - Toma un pedazo de la imagen original
 * - Lo rota según su estado actual
 * - Lo dibuja en su posición del canvas
 */
function drawPieces() {
    const config = hashMap.get(tileCount);
    const horizontal = config.x;  // Columnas
    const vertical = config.y;    // Filas

    // Calcular tamaño de cada pieza en la imagen original
    const anchoOriginalPieza = image.width / horizontal;
    const altoOriginalPieza = image.height / vertical;

    pieces.forEach((piece) => {
        context.save();

        // Calcular qué pieza es (su posición en la grilla)
        const columna = Math.floor(piece.dx / PIECE_SIZE);
        const fila = Math.floor((piece.dy - GAME_OFFSET_Y) / PIECE_SIZE);

        // Calcular de dónde recortar la imagen original
        const recorteX = columna * anchoOriginalPieza;
        const recorteY = fila * altoOriginalPieza;

        // Mover el origen al centro de la pieza para rotarla
        context.translate(
            piece.dx + PIECE_SIZE / 2,
            piece.dy + PIECE_SIZE / 2
        );
        context.rotate(piece.rotation);

        // Dibujar la pieza rotada
        context.drawImage(
            image,
            recorteX, recorteY,                    // Desde dónde recortar
            anchoOriginalPieza, altoOriginalPieza, // Cuánto recortar
            -PIECE_SIZE / 2, -PIECE_SIZE / 2,      // Dónde dibujar (centrado)
            PIECE_SIZE, PIECE_SIZE                 // Tamaño final
        );

        context.restore();
    });
}

function iniciarTemporizador() {
    tiempoInicio = Date.now();
    tiempoActual = 0;

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
    context.fillRect(0, 0, BLOCKA_WIDTH, INFO_HEIGHT);

    context.strokeStyle = "#333";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, INFO_HEIGHT);
    context.lineTo(BLOCKA_WIDTH, INFO_HEIGHT);
    context.stroke();

    context.fillStyle = "#333";
    context.font = "bold 18px 'Baloo 2', sans-serif";
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
    context.fillText("Nivel:", BLOCKA_WIDTH - 15, 30);
    context.fillStyle = "#007bff";
    context.fillText((nivel + 1).toString(), BLOCKA_WIDTH - 15, 50);
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

startBtn.addEventListener('click', async () => {
    mostrarJuego();

    // Actualizar dimensiones del canvas antes de empezar
    updateCanvasDimensions();

    await ejecutarRuleta();
    await startLevel();
});

menuBtn.addEventListener('click', () => {
    mostrarBienvenida();
    nivel = 0;
    TIME_LIMIT = 60;
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
    // Progresión automática de dificultad cada ciertos niveles
    if (nivel < 3) {
        tileCount = 4;  // Niveles 0-2: 4 piezas (Fácil)
    } else if (nivel < 6) {
        tileCount = 6;  // Niveles 3-5: 6 piezas (Medio)
    } else {
        tileCount = 8;  // Niveles 6+: 8 piezas (Difícil)
    }

    // Actualizar dimensiones del canvas según la nueva dificultad
    updateCanvasDimensions();

    if (nivel >= images.length) {
        detenerTemporizador();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.font = "bold 30px 'Baloo 2', sans-serif";
        context.textAlign = "center";
        context.fillText("¡Juego Completado!", canvas.width / 2, canvas.height / 2);

        await new Promise(resolve => setTimeout(resolve, 3000));

        nivel = 0;
        mostrarBienvenida();
        return;
    }

    try {
        const imagenACargar = imagenSeleccionada || images[nivel];
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

    const config = hashMap.get(tileCount);
    const horizontal = config.x;
    const vertical = config.y;
    const rotaciones = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

    // Crear piezas en la grilla
    for (let x = 0; x < horizontal; x++) {
        for (let y = 0; y < vertical; y++) {
            const piece = {
                // Coordenadas en la imagen (se calcularán en drawPieces con object-fit)
                sx: x * PIECE_SIZE,
                sy: y * PIECE_SIZE,
                // Coordenadas en el canvas
                dx: x * PIECE_SIZE,
                dy: y * PIECE_SIZE + GAME_OFFSET_Y,
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

    const clickedPiece = pieces.find(piece =>
        x >= piece.dx && x < piece.dx + PIECE_SIZE &&
        y >= piece.dy && y < piece.dy + PIECE_SIZE
    );

    if (clickedPiece) {
        clickedPiece.rotation += Math.PI / 2;

        context.clearRect(0, GAME_OFFSET_Y, BLOCKA_WIDTH, BLOCKA_HEIGHT);
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

        if (TIME_LIMIT > 10)
            TIME_LIMIT -= 5;

        await new Promise(resolve => setTimeout(resolve, 100));

        drawGame();

        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(0, GAME_OFFSET_Y, BLOCKA_WIDTH, BLOCKA_HEIGHT);
        context.fillStyle = "white";
        context.font = "bold 40px 'Baloo 2', sans-serif";
        context.textAlign = "center";
        context.fillText("¡Ganaste!", BLOCKA_WIDTH / 2, canvas.height / 2);
        context.fillText("avanzando...", BLOCKA_WIDTH / 2, canvas.height / 2 + 40);

        await new Promise(resolve => setTimeout(resolve, 2000));

        nivel++;

        ruletaActiva = true;

        if(nivel !== images.length)
            await ejecutarRuleta();

        ruletaActiva = false;

        await startLevel();
    }
}

async function loseGame() {
    juegoActivo = false;
    detenerTemporizador();
    TIME_LIMIT = 60;
    await new Promise(resolve => setTimeout(resolve, 100));

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(0, GAME_OFFSET_Y, BLOCKA_WIDTH, BLOCKA_HEIGHT);
    context.fillStyle = "white";
    context.font = "bold 40px 'Baloo 2', sans-serif";
    context.textAlign = "center";
    context.fillText("¡Tiempo agotado!", BLOCKA_WIDTH / 2, canvas.height / 2 - 20);
    context.font = "bold 24px 'Baloo 2', sans-serif";
    context.fillText("Comenzando desde nivel 1...", BLOCKA_WIDTH / 2, canvas.height / 2 + 30);

    await new Promise(resolve => setTimeout(resolve, 3000));

    nivel = 0;

    ruletaActiva = true;
    await ejecutarRuleta();
    ruletaActiva = false;

    await startLevel();
}

function filtro() {
    const imageData = context.getImageData(0, GAME_OFFSET_Y, BLOCKA_WIDTH, BLOCKA_HEIGHT);

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
            imageData.data[index] = Math.min(255, Math.round(r * 1.3));
            imageData.data[index + 1] = Math.min(255, Math.round(g * 1.3));
            imageData.data[index + 2] = Math.min(255, Math.round(b * 1.3));
            break;
        case 2:
            imageData.data[index] = 255-imageData.data[index];
            imageData.data[index+1] = 255-imageData.data[index+1];
            imageData.data[index+2] = 255-imageData.data[index+2];
            break;
        case 3:
            imageData.data[index] = Math.min(255, Math.round(r * 1.3));
            imageData.data[index + 1] = Math.min(255, Math.round(g * 1.3));
            imageData.data[index + 2] = Math.min(255, Math.round(b * 1.3));
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
            imageData.data[index] = Math.min(255, Math.round(r * 1.3));
            imageData.data[index + 1] = Math.min(255, Math.round(g * 1.3));
            imageData.data[index + 2] = Math.min(255, Math.round(b * 1.3));
            break;
        case 7:
            imageData.data[index] = gray;
            imageData.data[index+1] = gray;
            imageData.data[index+2] = gray;
            break;
    }
}