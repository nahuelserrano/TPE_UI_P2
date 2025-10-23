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
hashMap.set(4, {x: 2, y: 2});  // 2x2 = 4 piezas (300x300)
hashMap.set(6, {x: 2, y: 3});  // 2x3 = 6 piezas (300x450)
hashMap.set(8, {x: 2, y: 4});  // 3x3 = 9 piezas (300x300)

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
let tileCount = 4; // Cambia esto a 4, 6 o 8 para probar diferentes configuraciones
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
let imageMetadata = {
    width: 0,
    height: 0,
    aspectRatio: 1,
    isPortrait: false
};

/* ==================================================================================
   SISTEMA DE OBJECT-FIT: COVER
   ==================================================================================

   Implementa la lógica de CSS object-fit: cover en canvas:
   - La imagen cubre completamente el área sin deformarse
   - Se mantiene el aspect ratio original
   - Se recorta lo que excede (centrado)

   Parámetros:
   - imgWidth/imgHeight: dimensiones originales de la imagen
   - canvasWidth/canvasHeight: dimensiones del área a cubrir

   Retorna: {sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight}
   - s* = source (área de la imagen a usar)
   - d* = destination (área del canvas donde dibujar)
   ================================================================================== */

function calculateObjectFitCover(imgWidth, imgHeight, canvasWidth, canvasHeight) {
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let sx, sy, sWidth, sHeight;

    if (imgAspect > canvasAspect) {
        // Imagen más ancha: recortar los lados
        sHeight = imgHeight;
        sWidth = imgHeight * canvasAspect;
        sx = (imgWidth - sWidth) / 2;
        sy = 0;
    } else {
        // Imagen más alta: recortar arriba/abajo
        sWidth = imgWidth;
        sHeight = imgWidth / canvasAspect;
        sx = 0;
        sy = (imgHeight - sHeight) / 2;
    }

    return {
        sx: sx,
        sy: sy,
        sWidth: sWidth,
        sHeight: sHeight,
        dx: 0,
        dy: 0,
        dWidth: canvasWidth,
        dHeight: canvasHeight
    };
}

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
        imagen.src = images[i];

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
    context.font = "bold 18px 'Baloo 2', sans-serif";
    context.textAlign = "center";
    context.fillText("Seleccionando imagen...", canvas.width / 2, canvas.height / 2 - 40);

    thumbnails.forEach(thumb => dibujarThumbnail(thumb));

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let indiceGanador;

    for (let vuelta = 0; vuelta < VUELTAS_DE_RULETA; vuelta++) {
        let fin;
        if (vuelta === VUELTAS_DE_RULETA - 1) {
            fin = Math.floor(Math.random() * thumbnails.length);
            indiceGanador = fin === 0 ? 0 : fin - 1;
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

    imagenSeleccionada = images[indiceGanador];

    context.fillStyle = "#4CAF50";
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

// Carga la imagen y guarda sus metadatos
function loadImage(src) {
    return new Promise((resolve, reject) => {
        image.onload = () => {
            // Guardar metadatos de la imagen
            imageMetadata.width = image.naturalWidth;
            imageMetadata.height = image.naturalHeight;
            imageMetadata.aspectRatio = image.naturalWidth / image.naturalHeight;
            imageMetadata.isPortrait = imageMetadata.aspectRatio < 1;

            console.log(`Imagen cargada: ${imageMetadata.width}x${imageMetadata.height}, aspect: ${imageMetadata.aspectRatio.toFixed(2)}, portrait: ${imageMetadata.isPortrait}`);

            resolve(image);
        };
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

/* ==================================================================================
   DRAW PIECES
   ==================================================================================

   Cambios principales:
   1. Calcula el área de recorte usando calculateObjectFitCover
   2. Aplica el recorte a cada pieza individualmente
   3. Las piezas son siempre cuadradas (PIECE_SIZE × PIECE_SIZE)
   ================================================================================== */

function drawPieces() {
    const config = hashMap.get(tileCount);
    const horizontal = config.x;
    const vertical = config.y;

    // Las piezas son siempre cuadradas
    const parteWidth = PIECE_SIZE;
    const parteHeight = PIECE_SIZE;

    // Calcular cómo recortar la imagen para que cubra el área completa
    const coverData = calculateObjectFitCover(
        imageMetadata.width,
        imageMetadata.height,
        BLOCKA_WIDTH,
        BLOCKA_HEIGHT
    );

    // Tamaño de cada pieza en la imagen fuente (después del recorte)
    const sourcePieceWidth = coverData.sWidth / horizontal;
    const sourcePieceHeight = coverData.sHeight / vertical;

    pieces.forEach((piece, index) => {
        context.save();

        // Calcular posición de la pieza en la grilla
        const gridX = Math.floor((piece.dx) / PIECE_SIZE);
        const gridY = Math.floor((piece.dy - GAME_OFFSET_Y) / PIECE_SIZE);

        // Calcular área de la imagen fuente para esta pieza
        const pieceSx = coverData.sx + (gridX * sourcePieceWidth);
        const pieceSy = coverData.sy + (gridY * sourcePieceHeight);

        // Aplicar transformaciones de rotación
        context.translate(piece.dx + parteWidth/2, piece.dy + parteHeight/2);
        context.rotate(piece.rotation);

        // Dibujar la pieza con el recorte correcto
        context.drawImage(
            image,
            pieceSx, pieceSy, sourcePieceWidth, sourcePieceHeight,  // Source
            -parteWidth/2, -parteHeight/2, parteWidth, parteHeight  // Destination
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
    context.fillStyle = "#28a745";
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