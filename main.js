const canvas = document.querySelector("canvas");
const killBtn = document.querySelector("#kill-btn");
const ctx = canvas.getContext('2d'); // default is 2d

const modeTxt = document.querySelector('#mode');
const ageTxt = document.querySelector('#age');

let lastTimestamp = 0;
const maxFPS = 12;
const timestep = 1000 / maxFPS;

// constants
const WIDTH = 800;
const HEIGHT = 800;
const RESOLUTION = 20;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const NUM_COLS = WIDTH / RESOLUTION;
const NUM_ROWS = HEIGHT / RESOLUTION;

const GAME_MODES = {
  EVOLVING: 1,
  DRAWING: 2,
}

let age = 0;

let gameMode = GAME_MODES.EVOLVING;

class Cell {

  constructor(initialState = Math.floor(Math.random() * 2)) {
    this.currentState = initialState;
    this.total = this.currentState;
    this.maxTotal = 20;
  }

  setState(num) {
    this.currentState = num;
    if (num == 1 && this.total < this.maxTotal) {
      this.total += 1;
    }
  }
}

function createGrid() {
  return new Array(NUM_COLS).fill(null)
    .map(() => new Array(NUM_ROWS).fill(null)
      .map(() => new Cell()));
}

let grid = createGrid();

function render(grid) {
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];

      ctx.beginPath();
      ctx.rect(col * RESOLUTION, row * RESOLUTION, RESOLUTION, RESOLUTION);
      // ctx.fillStyle = cell.currentState ? `rgba(0,0,0, ${cell.total * 2 / cell.maxTotal})` : 'white';
      ctx.fillStyle = cell.currentState ? `rgba(0,0,0, 1)` : 'white';
      ctx.strokeStyle = `rgba(0,0,0, 0.25)`;
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${RESOLUTION / 2}px Arial`;
      ctx.fillStyle = 'white';
      ctx.fillText(`${cell.total}`, col * RESOLUTION + RESOLUTION / 2, row * RESOLUTION + RESOLUTION / 2);
    }
  }
}

function nextGen(grid) {
  const currentGen = grid.map(row => row.map(col => col.currentState));

  for (let col = 0; col < currentGen.length; col++) {
    for (let row = 0; row < currentGen[col].length; row++) {
      const cell = currentGen[col][row];
      let numNeighbours = 0;

      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i == 0 && j == 0) {
            continue;
          }

          let currNCol = col + i;
          let currNRow = row + j;

          if (currNCol > -1 && currNRow > -1 && currNCol < NUM_COLS && currNRow < NUM_ROWS) {
            currentNeighbour = currentGen[currNCol][currNRow];
            numNeighbours += currentNeighbour;
          }

        }
      } // 1st inner for loop

      // apply rules
      if (cell == 1) {
        if (numNeighbours < 2) { // underpopulation
          grid[col][row].setState(0);
        }
        else if (numNeighbours > 3) { // overpopulation
          grid[col][row].setState(0);
        }
      } else {
        if (numNeighbours == 3) { // reproduce
          grid[col][row].setState(1);
        }
      }

    }
  } // 1st outer for loop

  return grid;
}

requestAnimationFrame(update)


function update(timeStamp) {

  requestAnimationFrame(update);

  if (timeStamp - lastTimestamp < timestep) return;

  if (gameMode === GAME_MODES.EVOLVING) {
    grid = nextGen(grid);
    age += 1;
  }
  render(grid);
  updateUI();

  lastTimestamp = timeStamp;

}

canvas.addEventListener('click', changeCell);
document.addEventListener('keydown', enterDrawMode);
killBtn.addEventListener('click', killAll);

function changeCell(event) {
  const clickX = event.offsetX;
  const clickY = event.offsetY;
  const clickedCol = Math.round(clickX / RESOLUTION);
  const clickedRow = Math.round(clickY / RESOLUTION);
  console.log({ clickedCol, clickedRow })
  const clickedCell = grid[clickedCol - 1 < 0 ? clickedCol : clickedCol - 1][clickedRow - 1];
  clickedCell.setState(clickedCell.currentState ? 0 : 1);
}

function enterDrawMode(event) {
  if (event.code === 'Space' && gameMode == GAME_MODES.EVOLVING) {
    gameMode = GAME_MODES.DRAWING;
  } else if (event.code === 'Space' && gameMode == GAME_MODES.DRAWING) {
    gameMode = GAME_MODES.EVOLVING;
  }
}

function killAll(event) {
  gameMode = GAME_MODES.DRAWING;
  grid = new Array(NUM_COLS).fill(null)
    .map(() => new Array(NUM_ROWS).fill(null)
      .map(() => new Cell(0)));
}

function updateUI() {
  modeTxt.textContent = Object.entries(GAME_MODES).filter(([k, v]) => v === gameMode)[0][0];
  ageTxt.textContent = Intl.NumberFormat('en-KE', { style: 'decimal' }).format(age);
}
