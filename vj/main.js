/**
 * Main - Punto de entrada de la aplicación
 * Responsabilidad: Inicializar y conectar Model-View-Controller
 */

// Referencias globales
let gameModel;
let gameView;
let gameController;

/**
 * Inicializa el juego completo
 */
function inicializarJuego(boardId, boardSrc, pieceSrc) {
    // Obtener canvas
    const canvas = document.getElementById('gameCanvas');

    // Crear instancias MVC
    // MODIFICADO: Pasamos el ID del tablero, la ruta del tablero y la ruta de la ficha
    gameModel = new GameModel(boardId, boardSrc, pieceSrc);
    gameView = new GameView(canvas, gameModel);
    gameController = new GameController(gameModel, gameView, canvas);

    // Cargar imágenes e iniciar
    gameModel.cargarImagenes(() => {
        gameModel.inicializarFichas();
        gameController.iniciarBucle();
    });
}

// Iniciar cuando el DOM esté listo
window.addEventListener('load', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('start-button');
    const gameContent = document.getElementById('game-content');

    if (welcomeScreen) {
        welcomeScreen.style.display = 'block';
    }
    if (gameContent) {
        gameContent.style.display = 'none'; // Ocultamos el juego
    }

    if (startButton) {
        startButton.addEventListener('click', () => {
            // 1. Obtener las selecciones del usuario

            // MODIFICADO: Obtenemos el radio button seleccionado del tablero
            const selectedBoardRadio = document.querySelector('input[name="board-select"]:checked');

            // Obtenemos su ID lógico (value) y su ruta de imagen (dataset)
            const selectedBoardId = selectedBoardRadio.value;
            const selectedBoardSrc = selectedBoardRadio.dataset.imageSrc;

            // La ficha sigue igual
            const selectedPiece = document.querySelector('input[name="piece-select"]:checked').value;

            // 2. Ocultar bienvenida y mostrar el juego
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
            if (gameContent) {
                gameContent.style.display = 'block';
            }

            // 3. Inicializar el juego con las selecciones
            // MODIFICADO: Pasamos los 3 valores
            inicializarJuego(selectedBoardId, selectedBoardSrc, selectedPiece);
        });
    }
});

// Referencia al botón de reinicio
const resetButton = document.getElementById('reset-button');

if (resetButton) {
    resetButton.addEventListener('click', () => {
        // Nos aseguramos que el controlador exista antes de llamarlo
        if (gameController) {
            gameController.reiniciarJuego();
        }
    });
}