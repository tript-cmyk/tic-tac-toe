const PLAYERS = {
  X: "X",
  O: "O",
};

const BOARD_SIZE = 9;

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

const statusEl = document.getElementById("game-status");
const scoreXEl = document.getElementById("score-x");
const scoreDrawEl = document.getElementById("score-draw");
const scoreOEl = document.getElementById("score-o");
const gameBoardEl = document.getElementById("game-board");
const newGameBtn = document.getElementById("new-game-button");
const resetGameBtn = document.getElementById("reset-game-button");
const cellsEl = document.querySelectorAll(".cell");

function createBoard() {
  return Array(BOARD_SIZE).fill(null);
}

function checkWinner(board) {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function isDraw(board) {
  return board.every((ceil) => ceil != null);
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

let board = createBoard();
let currentPlayer = PLAYERS.X;
let gameOver = false;
let score = {
  X: 0,
  Draw: 0,
  O: 0,
};

function renderStatus() {
  statusEl.className = "";
  if (gameOver) {
    const winner = checkWinner(board);
    if (winner) {
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

function renderBoard() {
  cellsEl.forEach((cell, index) => {
    cell.textContent = board[index] ?? "";
    cell.disabled = gameOver || board[index] !== null;

    cell.classList.remove("cell--x", "cell--o");
    if (board[index] === PLAYERS.X) {
      cell.classList.add(board[index] === PLAYERS.X ? "cell--x" : "cell--o");
    } else if (board[index] === PLAYERS.O) {
      cell.classList.add("cell--o");
    }
  });
}

function render() {
  renderStatus();
  renderScore();
  renderBoard();
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (gameOver) return;

  if (board[index] !== null) return;

  board = makeMove(board, index, currentPlayer);

  const winner = checkWinner(board);

  if (winner) {
    gameOver = true;
    score[winner] += 1;
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
  score = {
    X: 0,
    Draw: 0,
    O: 0,
  };

  render();
}

function handleNewGame() {
  board = createBoard();
  currentPlayer = PLAYERS.X;
  gameOver = false;

  render();
}

cellsEl.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

newGameBtn.addEventListener("click", handleNewGame);
resetGameBtn.addEventListener("click", handleResetGame);

render();
