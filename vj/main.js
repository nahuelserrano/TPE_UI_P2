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
function inicializarJuego() {
    // Obtener canvas
    const canvas = document.getElementById('gameCanvas');

    // Crear instancias MVC
    gameModel = new GameModel();
    gameView = new GameView(canvas, gameModel);
    gameController = new GameController(gameModel, gameView, canvas);

    // Cargar imágenes e iniciar
    gameModel.cargarImagenes(() => {
        gameModel.inicializarFichas();
        gameController.iniciarBucle();
    });
}

// Iniciar cuando el DOM esté listo
window.addEventListener('load', inicializarJuego);

// Referencia al botón de reinicio
const resetButton = document.getElementById('reset-button');

resetButton.addEventListener('click', () => {
    gameController.reiniciarJuego();
});