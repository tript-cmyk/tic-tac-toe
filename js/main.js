const PLAYERS = {
  X: "X",
  O: "O",
};

const SKIP_BOARD_SIZE = 4;

const MIN_WIN_LENGTH = 3;
const MAX_WIN_LENGTH = 5;
const MIN_BOARD_SIZE = 3;
const MAX_BOARD_SIZE = 20;

const LARGE_BOARD_THRESHOLD = 5;

const DEFAULT_BOARD_SIZE = 3;
const DEFAULT_WIN_LENGTH = 3;

const BOARD_BREAKPOINTS = {
  MEDIUM: 6,
  LARGE: 11,
};

const CONTAINER_WIDTHS = {
  SMALL: "440px",
  MEDIUM: "550px",
  LARGE: "700px",
};

const GAME_CONFIG = {
  boardSize: DEFAULT_BOARD_SIZE,
  winLength: DEFAULT_WIN_LENGTH,
};

let board = [];
let currentPlayer = PLAYERS.X;
let gameOver = false;
let winningCells = [];
let score = {
  X: 0,
  Draw: 0,
  O: 0,
};

const statusEl = document.getElementById("game-status");
const scoreXEl = document.getElementById("score-x");
const scoreDrawEl = document.getElementById("score-draw");
const scoreOEl = document.getElementById("score-o");
const gameBoardEl = document.getElementById("game-board");
const newGameBtn = document.getElementById("new-game-button");
const resetGameBtn = document.getElementById("reset-game-button");

const gameModeSelect = document.getElementById("game-mode-select");
const customSettingsContainer = document.getElementById("custom-settings");
const customBoardSizeInput = document.getElementById("custom-board-size");
const customWinLengthInput = document.getElementById("custom-win-length");
const customWinLengthLabel = document.getElementById("custom-win-length-label");

function createBoard() {
  return Array(GAME_CONFIG.boardSize * GAME_CONFIG.boardSize).fill(null);
}

function checkWinner(board, size, winLen) {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const index = r * size + c;
      const player = board[index];
      if (!player) continue;

      for (const { dr, dc } of directions) {
        let cells = [index];
        let isWin = true;

        for (let i = 1; i < winLen; i++) {
          const nextRow = r + dr * i;
          const nextCol = c + dc * i;

          if (
            nextRow < 0 ||
            nextRow >= size ||
            nextCol < 0 ||
            nextCol >= size
          ) {
            isWin = false;
            break;
          }

          const nIndex = nextRow * size + nextCol;

          if (board[nIndex] !== player) {
            isWin = false;
            break;
          }

          cells.push(nIndex);
        }

        if (isWin) {
          return { winner: player, cells };
        }
      }
    }
  }

  return null;
}

function isDraw(board) {
  return board.every((cell) => cell != null);
}

function switchPlayer(player) {
  return player === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
}

function makeMove(board, index, player) {
  if (board[index] !== null) {
    return board;
  }

  const nextBoard = [...board];
  nextBoard[index] = player;

  return nextBoard;
}

function renderStatus() {
  statusEl.className = "";
  if (gameOver) {
    const winResult = checkWinner(
      board,
      GAME_CONFIG.boardSize,
      GAME_CONFIG.winLength,
    );
    if (winResult) {
      const winner = winResult.winner;
      statusEl.textContent = `Player ${winner} Wins!`;
      statusEl.classList.add("game__status");
      statusEl.classList.add(
        winner === PLAYERS.X ? "game__status--x" : "game__status--o",
      );
      return;
    }

    statusEl.textContent = `It's a draw`;
    statusEl.classList.add("game__status");
    return;
  }

  statusEl.textContent = `Turn of Player ${currentPlayer}`;
  statusEl.classList.add("game__status");
  statusEl.classList.add(
    currentPlayer === PLAYERS.X ? "game__status--x" : "game__status--o",
  );
}

function renderScore() {
  scoreXEl.textContent = score.X;
  scoreDrawEl.textContent = score.Draw;
  scoreOEl.textContent = score.O;
}

function initBoardDOM() {
  let gameBoardCells = "";
  const totalCells = GAME_CONFIG.boardSize * GAME_CONFIG.boardSize;

  for (let i = 0; i < totalCells; i++) {
    gameBoardCells += `<button class="cell" data-index="${i}" aria-label="Cell ${i + 1}"></button>`;
  }

  gameBoardEl.innerHTML = gameBoardCells;
}

function updateBoardLayout() {
  gameBoardEl.style.setProperty("--repeat-cellboard", GAME_CONFIG.boardSize);

  let maxWidth = CONTAINER_WIDTHS.SMALL;
  if (GAME_CONFIG.boardSize >= BOARD_BREAKPOINTS.LARGE) {
    maxWidth = CONTAINER_WIDTHS.LARGE;
  } else if (GAME_CONFIG.boardSize >= BOARD_BREAKPOINTS.MEDIUM) {
    maxWidth = CONTAINER_WIDTHS.MEDIUM;
  }

  document
    .querySelector(".game")
    .style.setProperty("--game-max-width", maxWidth);
}

function renderBoard() {
  const cellsEl = gameBoardEl.querySelectorAll(".cell");

  cellsEl.forEach((cell, index) => {
    cell.textContent = board[index] ?? "";
    cell.disabled = gameOver || board[index] !== null;

    cell.classList.remove("cell--x", "cell--o", "cell--winning");
    if (board[index] === PLAYERS.X) {
      cell.classList.add("cell--x");
    } else if (board[index] === PLAYERS.O) {
      cell.classList.add("cell--o");
    }

    if (winningCells.includes(index)) {
      cell.classList.add("cell--winning");
    }
  });
}

function render() {
  renderStatus();
  renderScore();
  renderBoard();
}

function handleCellClick(event) {
  const cell = event.target.closest(".cell");
  if (!cell) return;

  const index = Number(cell.dataset.index);

  if (gameOver) return;

  if (board[index] !== null) return;

  board = makeMove(board, index, currentPlayer);

  const winResult = checkWinner(
    board,
    GAME_CONFIG.boardSize,
    GAME_CONFIG.winLength,
  );

  if (winResult) {
    gameOver = true;
    score[winResult.winner] += 1;
    winningCells = winResult.cells;
    render();

    return;
  }

  if (isDraw(board)) {
    gameOver = true;
    score.Draw += 1;
    render();

    return;
  }

  currentPlayer = switchPlayer(currentPlayer);

  render();
}

function handleResetGame() {
  board = createBoard();
  currentPlayer = PLAYERS.X;
  gameOver = false;
  winningCells = [];
  score = {
    X: 0,
    Draw: 0,
    O: 0,
  };

  initBoardDOM();
  updateBoardLayout();
  render();
}

function handleNewGame() {
  board = createBoard();
  currentPlayer = PLAYERS.X;
  gameOver = false;
  winningCells = [];

  initBoardDOM();
  updateBoardLayout();
  render();
}

function applyGameConfig() {
  const preset = gameModeSelect.value;
  if (preset === "custom") {
    customSettingsContainer.classList.remove("hidden");

    let size = parseInt(customBoardSizeInput.value, 10);
    if (isNaN(size) || size < MIN_BOARD_SIZE) {
      size = MIN_BOARD_SIZE;
    }
    if (size > MAX_BOARD_SIZE) {
      size = MAX_BOARD_SIZE;
    }

    if (size === SKIP_BOARD_SIZE) {
      if (GAME_CONFIG.boardSize === MIN_BOARD_SIZE) {
        size = LARGE_BOARD_THRESHOLD;
      } else {
        size = MIN_BOARD_SIZE;
      }
    }

    let win = DEFAULT_WIN_LENGTH;
    if (size >= LARGE_BOARD_THRESHOLD) {
      win = MAX_WIN_LENGTH;
      customWinLengthInput.min = MAX_WIN_LENGTH;
      customWinLengthInput.max = MAX_WIN_LENGTH;
      customWinLengthInput.disabled = true;
      if (customWinLengthLabel) {
        customWinLengthLabel.textContent = `Win Length [${MAX_WIN_LENGTH}]`;
      }
    } else {
      customWinLengthInput.min = MIN_WIN_LENGTH;
      customWinLengthInput.max = MIN_WIN_LENGTH;
      customWinLengthInput.disabled = true;
      if (customWinLengthLabel) {
        customWinLengthLabel.textContent = `Win Length [${MIN_WIN_LENGTH}]`;
      }
    }

    GAME_CONFIG.boardSize = size;
    GAME_CONFIG.winLength = win;

    customBoardSizeInput.value = size;
    customWinLengthInput.value = win;
  } else {
    customSettingsContainer.classList.add("hidden");
    const [size, _] = preset.split("x").map(Number);

    GAME_CONFIG.boardSize = size;
    GAME_CONFIG.winLength =
      size === MIN_BOARD_SIZE ? MIN_WIN_LENGTH : MAX_WIN_LENGTH;
  }

  handleNewGame();
}

newGameBtn.addEventListener("click", handleNewGame);
resetGameBtn.addEventListener("click", handleResetGame);

gameModeSelect.addEventListener("change", applyGameConfig);
customBoardSizeInput.addEventListener("change", applyGameConfig);
customWinLengthInput.addEventListener("change", applyGameConfig);

gameBoardEl.addEventListener("click", handleCellClick);

applyGameConfig();
