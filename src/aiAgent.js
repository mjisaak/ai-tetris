import { rotatePiece, checkCollision, mergePieceToGrid, clearLines, getDropPosition } from './gameLogic';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

/**
 * AI Agent for Tetris using heuristic-based evaluation
 * Evaluates board states using multiple heuristics:
 * - Aggregate height
 * - Complete lines
 * - Holes
 * - Bumpiness (height differences between columns)
 */

// Calculate the height of each column
const getColumnHeights = (grid) => {
  const heights = Array(GRID_WIDTH).fill(0);
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (grid[y][x]) {
        heights[x] = GRID_HEIGHT - y;
        break;
      }
    }
  }
  return heights;
};

// Count holes (empty cells with filled cells above)
const countHoles = (grid) => {
  let holes = 0;
  for (let x = 0; x < GRID_WIDTH; x++) {
    let blockFound = false;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (grid[y][x]) {
        blockFound = true;
      } else if (blockFound) {
        holes++;
      }
    }
  }
  return holes;
};

// Calculate bumpiness (sum of absolute height differences between adjacent columns)
const calculateBumpiness = (heights) => {
  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }
  return bumpiness;
};

// Evaluate board state using heuristics
const evaluateBoard = (grid) => {
  const heights = getColumnHeights(grid);
  const aggregateHeight = heights.reduce((sum, h) => sum + h, 0);
  const holes = countHoles(grid);
  const bumpiness = calculateBumpiness(heights);
  const maxHeight = Math.max(...heights);

  // Weights tuned for decent performance
  // Lower score is better
  const score = 
    (aggregateHeight * 0.5) +
    (holes * 3) +
    (bumpiness * 0.2) +
    (maxHeight * 0.5);

  return score;
};

// Get all possible rotations of a piece
const getAllRotations = (piece) => {
  const rotations = [piece];
  let rotated = piece;
  
  // Try up to 3 more rotations
  for (let i = 0; i < 3; i++) {
    rotated = rotatePiece(rotated);
    // Check if it's a unique rotation (some pieces have symmetry)
    const isDuplicate = rotations.some(r => 
      JSON.stringify(r.shape) === JSON.stringify(rotated.shape)
    );
    if (!isDuplicate) {
      rotations.push(rotated);
    }
  }
  
  return rotations;
};

// Find the best move for the current piece
export const findBestMove = (piece, grid) => {
  const rotations = getAllRotations(piece);
  let bestMove = null;
  let bestScore = Infinity;

  // Try all rotations
  for (const rotation of rotations) {
    // Try all horizontal positions
    for (let x = -2; x < GRID_WIDTH + 2; x++) {
      const testPiece = { ...rotation, x, y: 0 };
      
      // Check if piece can be placed at this position
      if (checkCollision(testPiece, grid)) {
        continue;
      }

      // Drop piece to final position
      const dropY = getDropPosition(testPiece, grid);
      const droppedPiece = { ...testPiece, y: dropY };

      // Simulate placing the piece
      const newGrid = mergePieceToGrid(droppedPiece, grid);
      const { grid: clearedGrid, linesCleared } = clearLines(newGrid);

      // Evaluate the resulting board
      let score = evaluateBoard(clearedGrid);
      
      // Bonus for clearing lines
      score -= linesCleared * 10;

      if (score < bestScore) {
        bestScore = score;
        bestMove = {
          rotation: rotations.indexOf(rotation),
          x,
          finalY: dropY,
          score,
          linesCleared,
        };
      }
    }
  }

  return bestMove;
};

// Convert AI move to a sequence of actions
export const getMoveActions = (currentPiece, bestMove) => {
  if (!bestMove) return [];

  const actions = [];

  // Add rotations
  for (let i = 0; i < bestMove.rotation; i++) {
    actions.push('rotate');
  }

  // Calculate horizontal movement
  const dx = bestMove.x - currentPiece.x;
  if (dx > 0) {
    for (let i = 0; i < dx; i++) {
      actions.push('right');
    }
  } else if (dx < 0) {
    for (let i = 0; i < Math.abs(dx); i++) {
      actions.push('left');
    }
  }

  // Hard drop
  actions.push('drop');

  return actions;
};

// Get move suggestion for AI-assisted mode
export const getMoveSuggestion = (piece, grid) => {
  const bestMove = findBestMove(piece, grid);
  if (!bestMove) return null;

  return {
    targetX: bestMove.x,
    rotation: bestMove.rotation,
    score: bestMove.score,
    linesCleared: bestMove.linesCleared,
  };
};
