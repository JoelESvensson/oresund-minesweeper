/* --------------------------------------------------------
   Öresund Minesweeper
   Inspired by https://hormuz.pythonic.ninja/
   Classic Minesweeper across the Öresund strait
   between Denmark and Sweden.
   -------------------------------------------------------- */

const PLAYABLE_MASK = [
  "000000000111111110000000000000",  // Row 0: Landskrona strait (9 wide)
  "000000001111111111000000000000",  // Row 1: (10 wide)
  "000000001111111111000000000000",  // Row 2: (10 wide)
  "000000000111111111100000000000",  // Row 3: DK coast pushes east (10 wide)
  "000000000011111111100000000000",  // Row 4: Amager approach (9 wide)
  "000000000001111111100000000000",  // Row 5: Amager narrows (8 wide)
  "000000000000111111100000000000",  // Row 6: Saltholm area (7 wide)
  "000000000000011111100000000000",  // Row 7: Narrowest — Dragør (6 wide)
  "000000000001111111110000000000",  // Row 8: South of Amager, opens fast (9 wide)
  "000000001111111111110000000000",  // Row 9: Rapid widening (12 wide)
  "000000111111111111111000000000",  // Row 10: (15 wide)
  "000011111111111111111100000000",  // Row 11: Køgebukten forming (18 wide)
  "000111111111111111111100000000",  // Row 12: (19 wide)
  "000111111111111111111110000000",  // Row 13: Deep Køge Bay (20 wide)
  "001111111111111111111110000000",  // Row 14: (21 wide)
  "001111111111111111111110000000",  // Row 15: Widest (21 wide)
  "001111111111111111111110000000",  // Row 16: (21 wide)
  "001111111111111111111100000000",  // Row 17: (20 wide)
  "000111111111111111111100000000",  // Row 18: (19 wide)
  "000111111111111111111000000000",  // Row 19: (18 wide)
  "000011111111111111110000000000",  // Row 20: Falsterbo approach (16 wide)
  "000001111111111111110000000000",  // Row 21: (15 wide)
  "000001111111111111100000000000",  // Row 22: Falsterbo peninsula (14 wide)
  "000000111111111111110000000000",  // Row 23: (14 wide)
  "000000111111111111111000000000",  // Row 24: Past Falsterbo (15 wide)
  "000000111111111111110000000000",  // Row 25: Southern end (14 wide)
];

const ROWS = PLAYABLE_MASK.length;
const COLS = PLAYABLE_MASK[0].length;
const MINE_RATIO = 0.15;

const boardElement = document.getElementById("board");
const mineCounterElement = document.getElementById("mine-counter");
const statusElement = document.getElementById("status-text");
const statusNoteElement = document.getElementById("status-note");
const resetButton = document.getElementById("reset-button");
const resultModal = document.getElementById("result-modal");
const resultModalTitle = document.getElementById("result-modal-title");
const resultModalMessage = document.getElementById("result-modal-message");
const resultModalClose = document.getElementById("result-modal-close");

const FLAG_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="10.5" y="2" width="2" height="14" fill="#000000" />
    <polygon points="12.5,2 4,6.6 12.5,10.8" fill="#d3161d" stroke="#7b0000" stroke-width="0.6" />
    <rect x="8" y="16" width="7" height="2" fill="#000000" />
    <rect x="5" y="18" width="13" height="2.8" fill="#d8d8d8" />
    <rect x="4" y="20.3" width="15" height="1.7" fill="#6c6c6c" />
  </svg>
`;

const MINE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <line x1="12" y1="1.8" x2="12" y2="22.2" stroke="#000000" stroke-width="1.4" />
    <line x1="1.8" y1="12" x2="22.2" y2="12" stroke="#000000" stroke-width="1.4" />
    <line x1="4.1" y1="4.1" x2="19.9" y2="19.9" stroke="#000000" stroke-width="1.4" />
    <line x1="19.9" y1="4.1" x2="4.1" y2="19.9" stroke="#000000" stroke-width="1.4" />
    <circle cx="12" cy="12" r="5.1" fill="#000000" />
    <circle cx="10.2" cy="9.8" r="1.7" fill="#ffffff" />
  </svg>
`;

const FACE_ICONS = {
  idle: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="#ffd34d" stroke="#000000" stroke-width="1.2" />
      <circle cx="8.2" cy="9.2" r="1.15" fill="#000000" />
      <circle cx="15.8" cy="9.2" r="1.15" fill="#000000" />
      <path d="M7.2 14.2c1.4 2 8.2 2 9.6 0" fill="none" stroke="#000000" stroke-width="1.3" stroke-linecap="round" />
    </svg>
  `,
  surprised: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="#ffd34d" stroke="#000000" stroke-width="1.2" />
      <circle cx="8.2" cy="9.2" r="1.15" fill="#000000" />
      <circle cx="15.8" cy="9.2" r="1.15" fill="#000000" />
      <circle cx="12" cy="15.1" r="2" fill="#000000" />
    </svg>
  `,
  won: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="#ffd34d" stroke="#000000" stroke-width="1.2" />
      <path d="M6.9 9.2l2 1.3 1.1-2.2" fill="none" stroke="#000000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14 9.2l2 1.3 1.1-2.2" fill="none" stroke="#000000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M7.2 14c1.4 2.4 8.2 2.4 9.6 0" fill="none" stroke="#000000" stroke-width="1.3" stroke-linecap="round" />
    </svg>
  `,
  lost: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="#ffd34d" stroke="#000000" stroke-width="1.2" />
      <path d="M6.9 7.9l2.6 2.6M9.5 7.9l-2.6 2.6" stroke="#000000" stroke-width="1.2" stroke-linecap="round" />
      <path d="M14.5 7.9l2.6 2.6M17.1 7.9l-2.6 2.6" stroke="#000000" stroke-width="1.2" stroke-linecap="round" />
      <path d="M7.6 16.5c1.3-1.9 7.5-1.9 8.8 0" fill="none" stroke="#000000" stroke-width="1.3" stroke-linecap="round" />
    </svg>
  `
};

const TITLE_ROTATIONS = [
  "\u00D6resund Minsvepare",
  "\u00D6resund | Rensa sundet",
  "\u00D6resund | K\u00F8benhavn \u2194 Malm\u00F6",
  "\u00D6resund | Nordiska vatten",
  "\u00D6resund | Skandinavisk svepning"
];

const cells = [];
const neighbors = [];
const playableIndices = [];

let mineCount = 0;
let flaggedCount = 0;
let safeCellsRemaining = 0;
let minesSeeded = false;
let gameState = "ready";
let faceState = "idle";
let titleIndex = 0;

function setBrowserTitle(index) {
  document.title = TITLE_ROTATIONS[index];
}

function advanceBrowserTitle() {
  titleIndex = (titleIndex + 1) % TITLE_ROTATIONS.length;
  setBrowserTitle(titleIndex);
}

function buildBoard() {
  boardElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const index = row * COLS + col;
      const playable = PLAYABLE_MASK[row][col] === "1";
      const button = document.createElement("button");

      button.type = "button";
      button.className = `cell ${playable ? "playable" : "blocked"}`;
      button.dataset.index = String(index);

      if (!playable) {
        button.tabIndex = -1;
        button.setAttribute("aria-hidden", "true");
      }

      boardElement.append(button);
      cells.push({
        row,
        col,
        playable,
        mine: false,
        flagged: false,
        revealed: false,
        exploded: false,
        adjacent: 0,
        element: button
      });

      if (playable) {
        playableIndices.push(index);
      }
    }
  }

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const adjacentIndices = [];

    if (cell.playable) {
      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          if (rowOffset === 0 && colOffset === 0) {
            continue;
          }

          const neighborRow = cell.row + rowOffset;
          const neighborCol = cell.col + colOffset;

          if (
            neighborRow < 0 ||
            neighborRow >= ROWS ||
            neighborCol < 0 ||
            neighborCol >= COLS
          ) {
            continue;
          }

          const neighborIndex = neighborRow * COLS + neighborCol;

          if (cells[neighborIndex].playable) {
            adjacentIndices.push(neighborIndex);
          }
        }
      }
    }

    neighbors[index] = adjacentIndices;
  }

  mineCount = Math.max(30, Math.round(playableIndices.length * MINE_RATIO));
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
}

function formatCounter(value) {
  const clamped = Math.max(-99, Math.min(999, value));

  if (clamped < 0) {
    return `-${String(Math.abs(clamped)).padStart(2, "0")}`;
  }

  return String(clamped).padStart(3, "0");
}

function setFace(state) {
  faceState = state;
  resetButton.innerHTML = FACE_ICONS[faceState];
}

function updateHud() {
  let statusText = "REDO \u2014 rensa sundet!";

  if (gameState === "playing") {
    statusText = `${String(safeCellsRemaining).padStart(3, "0")} S\u00C4KRA`;
  } else if (gameState === "won") {
    statusText = "SUNDET RENSAT!";
  } else if (gameState === "lost") {
    statusText = "BOOM";
  }

  mineCounterElement.textContent = formatCounter(mineCount - flaggedCount);
  statusElement.textContent = statusText;
}

function resetGame() {
  flaggedCount = 0;
  safeCellsRemaining = playableIndices.length - mineCount;
  minesSeeded = false;
  gameState = "ready";
  setTouchMode("dig");
  setFace("idle");

  for (const cell of cells) {
    cell.mine = false;
    cell.flagged = false;
    cell.revealed = false;
    cell.exploded = false;
    cell.adjacent = 0;
  }

  render();
}

function seedMines(firstIndex) {
  const protectedIndices = new Set([firstIndex, ...neighbors[firstIndex]]);
  const candidates = playableIndices.filter((index) => !protectedIndices.has(index));

  shuffle(candidates);

  for (let index = 0; index < mineCount; index += 1) {
    cells[candidates[index]].mine = true;
  }

  for (const index of playableIndices) {
    const cell = cells[index];

    if (cell.mine) {
      continue;
    }

    let adjacentMines = 0;

    for (const neighborIndex of neighbors[index]) {
      if (cells[neighborIndex].mine) {
        adjacentMines += 1;
      }
    }

    cell.adjacent = adjacentMines;
  }

  minesSeeded = true;
  gameState = "playing";
}

function revealAllMines() {
  for (const index of playableIndices) {
    const cell = cells[index];

    if (cell.mine) {
      cell.revealed = true;
    }
  }
}

function showResultModal(title, message, buttonText) {
  resultModalTitle.textContent = title;
  resultModalMessage.textContent = message;
  resultModalClose.textContent = buttonText;
  resultModal.hidden = false;
}

function hideResultModal() {
  resultModal.hidden = true;
  resetGame();
}

function finishLost() {
  gameState = "lost";
  revealAllMines();
  setFace("lost");
  setTimeout(() => showResultModal(
    "BOOM!",
    "Du tr\u00E4ffade en mina i \u00D6resund. Farleden \u00E4r fortfarande farlig.",
    "F\u00F6rs\u00F6k igen"
  ), 200);
}

function finishWon() {
  gameState = "won";
  flaggedCount = mineCount;
  setFace("won");

  for (const index of playableIndices) {
    const cell = cells[index];

    if (cell.mine) {
      cell.flagged = true;
    }
  }

  setTimeout(() => showResultModal(
    "SUNDET RENSAT!",
    "Alla minor svepade. \u00D6resund \u00E4r s\u00E4kert f\u00F6r passage mellan Danmark och Sverige.",
    "Svep igen?"
  ), 200);
}

function revealCell(index) {
  const origin = cells[index];

  if (
    gameState === "won" ||
    gameState === "lost" ||
    !origin.playable ||
    origin.flagged ||
    origin.revealed
  ) {
    return;
  }

  if (!minesSeeded) {
    seedMines(index);
  }

  if (origin.mine) {
    origin.exploded = true;
    finishLost();
    render();
    return;
  }

  const stack = [index];

  while (stack.length > 0) {
    const currentIndex = stack.pop();
    const cell = cells[currentIndex];

    if (cell.revealed || cell.flagged || !cell.playable) {
      continue;
    }

    cell.revealed = true;
    safeCellsRemaining -= 1;

    if (cell.adjacent === 0) {
      for (const neighborIndex of neighbors[currentIndex]) {
        const neighbor = cells[neighborIndex];

        if (!neighbor.revealed && !neighbor.flagged && !neighbor.mine) {
          stack.push(neighborIndex);
        }
      }
    }
  }

  if (safeCellsRemaining === 0) {
    finishWon();
  }

  render();
}

function chordCell(index) {
  const cell = cells[index];

  if (
    gameState === "won" ||
    gameState === "lost" ||
    !cell.playable ||
    !cell.revealed ||
    cell.adjacent === 0
  ) {
    return;
  }

  let flagCount = 0;
  for (const neighborIndex of neighbors[index]) {
    if (cells[neighborIndex].flagged) {
      flagCount += 1;
    }
  }

  if (flagCount !== cell.adjacent) {
    return;
  }

  for (const neighborIndex of neighbors[index]) {
    const neighbor = cells[neighborIndex];
    if (!neighbor.revealed && !neighbor.flagged && neighbor.playable) {
      revealCell(neighborIndex);
    }
  }
}

function toggleFlag(index) {
  const cell = cells[index];

  if (
    gameState === "won" ||
    gameState === "lost" ||
    !cell.playable ||
    cell.revealed
  ) {
    return;
  }

  cell.flagged = !cell.flagged;
  flaggedCount += cell.flagged ? 1 : -1;
  render();
}

function renderCell(cell) {
  const button = cell.element;
  button.className = "cell";
  button.replaceChildren();

  if (!cell.playable) {
    button.classList.add("blocked");
    return;
  }

  button.classList.add("playable");

  if (cell.revealed) {
    button.classList.add("revealed");

    if (cell.mine) {
      button.classList.add("mine");

      if (cell.exploded) {
        button.classList.add("exploded");
      }

      button.innerHTML = MINE_ICON;
      return;
    }

    if (cell.adjacent > 0) {
      button.innerHTML = `<span class="digit digit-${cell.adjacent}">${cell.adjacent}</span>`;
    }

    return;
  }

  button.classList.add("hidden");

  if (cell.flagged) {
    button.innerHTML = FLAG_ICON;
  }
}

function render() {
  for (const cell of cells) {
    renderCell(cell);
  }

  updateHud();
}

function handleBoardClick(event) {
  advanceBrowserTitle();

  const button = event.target.closest(".cell");

  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  const cell = cells[index];

  if (cell.revealed && cell.adjacent > 0) {
    chordCell(index);
    return;
  }

  if (touchMode === "flag") {
    toggleFlag(index);
  } else {
    revealCell(index);
  }
}

function handleBoardContextMenu(event) {
  event.preventDefault();
  advanceBrowserTitle();

  const button = event.target.closest(".cell");

  if (!button) {
    return;
  }

  toggleFlag(Number(button.dataset.index));
}

function handleBoardMouseDown(event) {
  if (event.button !== 0 || (gameState !== "ready" && gameState !== "playing")) {
    return;
  }

  const button = event.target.closest(".cell");

  if (!button) {
    return;
  }

  const cell = cells[Number(button.dataset.index)];

  if (!cell.playable || cell.revealed || cell.flagged) {
    return;
  }

  setFace("surprised");
}

function handleMouseUp() {
  if (gameState === "ready" || gameState === "playing") {
    setFace("idle");
    updateHud();
  }
}

function handleBoardDblClick(event) {
  const button = event.target.closest(".cell");
  if (!button) return;
  chordCell(Number(button.dataset.index));
}

let touchMode = "dig";
const flagToggle = document.getElementById("flag-toggle");
const flagFabIcon = document.getElementById("flag-fab-icon");
const flagToggleLabel = document.getElementById("flag-toggle-label");

function setTouchMode(mode) {
  touchMode = mode;
  boardElement.dataset.touchMode = mode;
  if (flagFabIcon) {
    flagFabIcon.innerHTML = mode === "flag" ? FLAG_ICON : MINE_ICON;
  }
  if (flagToggle) {
    flagToggle.classList.toggle("active", mode === "flag");
  }
  if (flagToggleLabel) {
    flagToggleLabel.textContent = mode === "flag" ? "flagga" : "gr\u00E4v";
  }
}

if (flagToggle) {
  let toggledByTouch = false;

  flagToggle.addEventListener("touchend", (event) => {
    event.preventDefault();
    toggledByTouch = true;
    setTouchMode(touchMode === "dig" ? "flag" : "dig");
  });

  flagToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (toggledByTouch) {
      toggledByTouch = false;
      return;
    }
    setTouchMode(touchMode === "dig" ? "flag" : "dig");
  });
}

boardElement.addEventListener("click", handleBoardClick);
boardElement.addEventListener("dblclick", handleBoardDblClick);
boardElement.addEventListener("contextmenu", handleBoardContextMenu);
boardElement.addEventListener("mousedown", handleBoardMouseDown);
document.addEventListener("mouseup", handleMouseUp);
resetButton.addEventListener("click", () => {
  advanceBrowserTitle();
  resetGame();
});
resultModalClose.addEventListener("click", hideResultModal);

buildBoard();
setBrowserTitle(titleIndex);
resetGame();
