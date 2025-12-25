import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createEmptyGrid, 
  getRandomPiece, 
  rotatePiece, 
  checkCollision, 
  mergePieceToGrid, 
  clearLines, 
  calculateScore,
  getDropPosition 
} from './gameLogic';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, PIECE_COLORS, GAME_MODES } from './constants';
import { findBestMove, getMoveActions, getMoveSuggestion } from './aiAgent';
import './Tetris.css';

const Tetris = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece());
  const [nextPiece, setNextPiece] = useState(getRandomPiece());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState(GAME_MODES.MANUAL);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  const gameLoopRef = useRef(null);
  const aiActionsRef = useRef([]);
  const aiDelayRef = useRef(null);

  // Calculate drop speed based on level
  const getDropSpeed = () => {
    return Math.max(100, 1000 - (level - 1) * 100);
  };

  // Move piece down
  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return false;

    if (!checkCollision(currentPiece, grid, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
      return true;
    } else {
      // Lock piece
      const newGrid = mergePieceToGrid(currentPiece, grid);
      const { grid: clearedGrid, linesCleared: cleared } = clearLines(newGrid);
      
      setGrid(clearedGrid);
      setLinesCleared(prev => prev + cleared);
      setScore(prev => prev + calculateScore(cleared, level));
      
      // Check for level up (every 10 lines)
      if (Math.floor((linesCleared + cleared) / 10) > level - 1) {
        setLevel(prev => prev + 1);
      }

      // Spawn new piece
      const newPiece = nextPiece;
      setCurrentPiece(newPiece);
      setNextPiece(getRandomPiece());

      // Check game over
      if (checkCollision(newPiece, clearedGrid)) {
        setGameOver(true);
        return false;
      }

      return false;
    }
  }, [currentPiece, grid, gameOver, isPaused, level, linesCleared, nextPiece]);

  // Move piece left
  const moveLeft = useCallback(() => {
    if (gameOver || isPaused) return;
    if (!checkCollision(currentPiece, grid, -1, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, grid, gameOver, isPaused]);

  // Move piece right
  const moveRight = useCallback(() => {
    if (gameOver || isPaused) return;
    if (!checkCollision(currentPiece, grid, 1, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, grid, gameOver, isPaused]);

  // Rotate piece
  const rotate = useCallback(() => {
    if (gameOver || isPaused) return;
    const rotated = rotatePiece(currentPiece);
    if (!checkCollision(rotated, grid)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, grid, gameOver, isPaused]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return;
    const dropY = getDropPosition(currentPiece, grid);
    setCurrentPiece(prev => ({ ...prev, y: dropY }));
    // Force immediate lock
    setTimeout(() => moveDown(), 50);
  }, [currentPiece, grid, gameOver, isPaused, moveDown]);

  // Execute AI action
  const executeAiAction = useCallback((action) => {
    switch (action) {
      case 'left':
        moveLeft();
        break;
      case 'right':
        moveRight();
        break;
      case 'rotate':
        rotate();
        break;
      case 'drop':
        hardDrop();
        break;
      default:
        break;
    }
  }, [moveLeft, moveRight, rotate, hardDrop]);

  // AI autonomous mode logic
  useEffect(() => {
    if (gameMode === GAME_MODES.AI_AUTONOMOUS && !gameOver && !isPaused) {
      // Calculate best move when piece changes or no actions queued
      if (aiActionsRef.current.length === 0) {
        const bestMove = findBestMove(currentPiece, grid);
        if (bestMove) {
          aiActionsRef.current = getMoveActions(currentPiece, bestMove);
        }
      }

      // Execute actions with delay
      if (aiActionsRef.current.length > 0 && !aiDelayRef.current) {
        aiDelayRef.current = setTimeout(() => {
          const action = aiActionsRef.current.shift();
          executeAiAction(action);
          aiDelayRef.current = null;
        }, 100); // Small delay between actions for visibility
      }
    }

    return () => {
      if (aiDelayRef.current) {
        clearTimeout(aiDelayRef.current);
        aiDelayRef.current = null;
      }
    };
  }, [gameMode, currentPiece, grid, gameOver, isPaused, executeAiAction]);

  // Update AI suggestion in AI-assisted mode
  useEffect(() => {
    if (gameMode === GAME_MODES.AI_ASSISTED && !gameOver && !isPaused) {
      const suggestion = getMoveSuggestion(currentPiece, grid);
      setAiSuggestion(suggestion);
    } else {
      setAiSuggestion(null);
    }
  }, [gameMode, currentPiece, grid, gameOver, isPaused]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      moveDown();
    }, getDropSpeed());

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveDown, gameOver, isPaused, level]);

  // Keyboard controls for manual and AI-assisted modes
  useEffect(() => {
    if (gameMode === GAME_MODES.AI_AUTONOMOUS) return;

    const handleKeyPress = (e) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameMode, moveLeft, moveRight, rotate, moveDown, hardDrop, gameOver]);

  // Reset game
  const resetGame = () => {
    setGrid(createEmptyGrid());
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    aiActionsRef.current = [];
    setAiSuggestion(null);
  };

  // Change game mode
  const handleModeChange = (mode) => {
    setGameMode(mode);
    aiActionsRef.current = [];
    setAiSuggestion(null);
    if (!gameOver) {
      setIsPaused(false);
    }
  };

  // Render the game grid
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    
    // Add current piece to display
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] && currentPiece.y + y >= 0) {
          const gridY = currentPiece.y + y;
          const gridX = currentPiece.x + x;
          if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
            displayGrid[gridY][gridX] = currentPiece.type;
          }
        }
      }
    }

    // Show ghost piece (drop preview)
    if (gameMode !== GAME_MODES.AI_AUTONOMOUS) {
      const ghostY = getDropPosition(currentPiece, grid);
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] && ghostY + y >= 0) {
            const gridY = ghostY + y;
            const gridX = currentPiece.x + x;
            if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
              if (!displayGrid[gridY][gridX]) {
                displayGrid[gridY][gridX] = 'ghost';
              }
            }
          }
        }
      }
    }

    return displayGrid.map((row, y) => (
      <div key={y} className="grid-row">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`cell ${cell === 'ghost' ? 'ghost-cell' : ''}`}
            style={{
              backgroundColor: cell && cell !== 'ghost' ? PIECE_COLORS[cell] : '#1a1a1a',
              border: cell ? '1px solid #333' : '1px solid #0a0a0a',
            }}
          />
        ))}
      </div>
    ));
  };

  // Render next piece preview
  const renderNextPiece = () => {
    return (
      <div className="next-piece">
        {nextPiece.shape.map((row, y) => (
          <div key={y} className="grid-row">
            {row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="cell"
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: cell ? PIECE_COLORS[nextPiece.type] : 'transparent',
                  border: cell ? '1px solid #333' : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tetris-container">
      <div className="game-header">
        <h1>AI Tetris</h1>
        <div className="mode-selector">
          <button
            className={gameMode === GAME_MODES.MANUAL ? 'active' : ''}
            onClick={() => handleModeChange(GAME_MODES.MANUAL)}
          >
            Manual
          </button>
          <button
            className={gameMode === GAME_MODES.AI_ASSISTED ? 'active' : ''}
            onClick={() => handleModeChange(GAME_MODES.AI_ASSISTED)}
          >
            AI Assisted
          </button>
          <button
            className={gameMode === GAME_MODES.AI_AUTONOMOUS ? 'active' : ''}
            onClick={() => handleModeChange(GAME_MODES.AI_AUTONOMOUS)}
          >
            AI Autonomous
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className="game-area">
          <div className="grid-container">
            {renderGrid()}
            {gameOver && (
              <div className="game-over-overlay">
                <h2>Game Over!</h2>
                <button onClick={resetGame}>Play Again</button>
              </div>
            )}
            {isPaused && !gameOver && (
              <div className="pause-overlay">
                <h2>Paused</h2>
                <p>Press P to resume</p>
              </div>
            )}
          </div>
        </div>

        <div className="side-panel">
          <div className="info-section">
            <h3>Score</h3>
            <p className="stat">{score}</p>
          </div>

          <div className="info-section">
            <h3>Level</h3>
            <p className="stat">{level}</p>
          </div>

          <div className="info-section">
            <h3>Lines</h3>
            <p className="stat">{linesCleared}</p>
          </div>

          <div className="info-section">
            <h3>Next Piece</h3>
            {renderNextPiece()}
          </div>

          <div className="info-section">
            <h3>Mode</h3>
            <p className="mode-display">
              {gameMode === GAME_MODES.MANUAL && 'Manual'}
              {gameMode === GAME_MODES.AI_ASSISTED && 'AI Assisted'}
              {gameMode === GAME_MODES.AI_AUTONOMOUS && 'AI Autonomous'}
            </p>
          </div>

          {gameMode === GAME_MODES.AI_ASSISTED && aiSuggestion && (
            <div className="info-section ai-suggestion">
              <h3>AI Suggestion</h3>
              <p>Position: {aiSuggestion.targetX}</p>
              <p>Rotation: {aiSuggestion.rotation}</p>
              <p>Score: {aiSuggestion.score.toFixed(2)}</p>
            </div>
          )}

          <div className="info-section controls">
            <h3>Controls</h3>
            {gameMode !== GAME_MODES.AI_AUTONOMOUS && (
              <>
                <p>← → : Move</p>
                <p>↑ : Rotate</p>
                <p>↓ : Soft Drop</p>
                <p>Space : Hard Drop</p>
                <p>P : Pause</p>
              </>
            )}
            {gameMode === GAME_MODES.AI_AUTONOMOUS && (
              <p>AI is playing autonomously</p>
            )}
          </div>

          <button className="reset-button" onClick={resetGame}>
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
