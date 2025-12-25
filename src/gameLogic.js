import { PIECES, GRID_WIDTH, GRID_HEIGHT } from './constants';

// Create an empty grid
export const createEmptyGrid = () => {
  return Array.from({ length: GRID_HEIGHT }, () =>
    Array(GRID_WIDTH).fill(null)
  );
};

// Get a random piece
export const getRandomPiece = () => {
  const pieces = Object.keys(PIECES);
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    shape: PIECES[randomPiece],
    type: randomPiece,
    x: Math.floor(GRID_WIDTH / 2) - Math.floor(PIECES[randomPiece][0].length / 2),
    y: 0,
  };
};

// Rotate a piece 90 degrees clockwise
export const rotatePiece = (piece) => {
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map(row => row[i]).reverse()
  );
  return { ...piece, shape: rotated };
};

// Check if a piece collides with the grid or boundaries
export const checkCollision = (piece, grid, offsetX = 0, offsetY = 0) => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;

        // Check boundaries
        if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
          return true;
        }

        // Check grid collision (only if newY is non-negative)
        if (newY >= 0 && grid[newY]?.[newX]) {
          return true;
        }
      }
    }
  }
  return false;
};

// Merge piece into grid
export const mergePieceToGrid = (piece, grid) => {
  const newGrid = grid.map(row => [...row]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const gridY = piece.y + y;
        const gridX = piece.x + x;
        if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
          newGrid[gridY][gridX] = piece.type;
        }
      }
    }
  }
  return newGrid;
};

// Clear completed lines and return new grid and number of lines cleared
export const clearLines = (grid) => {
  let linesCleared = 0;
  const newGrid = grid.filter(row => {
    if (row.every(cell => cell !== null)) {
      linesCleared++;
      return false;
    }
    return true;
  });

  // Add empty rows at the top
  while (newGrid.length < GRID_HEIGHT) {
    newGrid.unshift(Array(GRID_WIDTH).fill(null));
  }

  return { grid: newGrid, linesCleared };
};

// Calculate score based on lines cleared
export const calculateScore = (linesCleared, level) => {
  const scores = [0, 40, 100, 300, 1200];
  return scores[linesCleared] * (level + 1);
};

// Get the drop position (hard drop)
export const getDropPosition = (piece, grid) => {
  let dropY = piece.y;
  while (!checkCollision({ ...piece, y: dropY + 1 }, grid)) {
    dropY++;
  }
  return dropY;
};
