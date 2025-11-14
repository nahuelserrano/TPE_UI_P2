/**
 * Main - Punto de entrada de la aplicación
 * Responsabilidad: Inicializar y conectar Model-View-Controller
 */

// ============================================
// VARIABLES GLOBALES
// ============================================
let gameModel;
let gameView;
let gameController;

// Referencias a elementos del DOM (declaradas globalmente)
let welcomeScreen;
let gameContent;
let startButton;
let resetButton;
let menuButton;

/**
 * Inicializa el juego completo
 */
function inicializarJuego(boardId, boardSrc, pieceSrc) {
    // Obtener canvas
    const canvas = document.getElementById('gameCanvas');

    // Crear instancias MVC
    gameModel = new GameModel(boardId, boardSrc, pieceSrc);
    gameView = new GameView(canvas, gameModel);
    gameController = new GameController(gameModel, gameView, canvas);

    // Cargar imágenes e iniciar
    gameModel.cargarImagenes(() => {
        gameModel.inicializarFichas();
        gameController.iniciarBucle();
    });
}

/**
 * Vuelve al menú de selección
 */
function volverAlMenu() {
    // 1. Detener el juego actual
    if (gameController) {
        gameController.detenrerTemporizador();
        gameController.jueguegoActivo = false;
    }

    // 2. Mostrar pantalla de bienvenida
    if (welcomeScreen) {
        welcomeScreen.style.display = 'block';
    }

    // 3. Ocultar el juego
    if (gameContent) {
        gameContent.style.display = 'none';
    }

    // 4. Limpiar el canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    console.log('Volviendo al menú principal...');
}

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================
window.addEventListener('load', () => {
    // Obtener referencias a los elementos del DOM
    welcomeScreen = document.getElementById('welcome-screen');
    startButton = document.getElementById('start-button');
    gameContent = document.getElementById('game-content');
    resetButton = document.getElementById('reset-button');
    menuButton = document.getElementById('menu-button');

    // Configurar estado inicial
    if (welcomeScreen) {
        welcomeScreen.style.display = 'block';
    }
    if (gameContent) {
        gameContent.style.display = 'none';
    }

    // ============================================
    // EVENT LISTENER: BOTÓN "COMENZAR JUEGO"
    // ============================================
    if (startButton) {
        startButton.addEventListener('click', () => {
            // 1. Obtener las selecciones del usuario
            const selectedBoardRadio = document.querySelector('input[name="board-select"]:checked');
            const selectedBoardId = selectedBoardRadio.value;
            const selectedBoardSrc = selectedBoardRadio.dataset.imageSrc;
            const selectedPiece = document.querySelector('input[name="piece-select"]:checked').value;

            // 2. Ocultar bienvenida y mostrar el juego
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
            if (gameContent) {
                gameContent.style.display = 'block';
            }

            // 3. Inicializar el juego con las selecciones
            inicializarJuego(selectedBoardId, selectedBoardSrc, selectedPiece);

            console.log('Juego iniciado con:', {
                tablero: selectedBoardId,
                ficha: selectedPiece
            });
        });
    }

    // ============================================
    // EVENT LISTENER: BOTÓN "REINICIAR JUEGO"
    // ============================================
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (gameController) {
                gameController.reiniciarJuego();
                console.log('Juego reiniciado');
            }
        });
    }

    // ============================================
    // EVENT LISTENER: BOTÓN "VOLVER AL MENÚ"
    // ============================================
    if (menuButton) {
        menuButton.addEventListener('click', volverAlMenu);
    }
});