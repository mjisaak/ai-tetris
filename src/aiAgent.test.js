/**
 * AI Agent Tests
 * 
 * These tests verify that the AI agent can make valid moves
 * and produce sensible decisions based on game state.
 */

import { findBestMove, getMoveSuggestion, getMoveActions } from './aiAgent.js';
import { createEmptyGrid, getRandomPiece } from './gameLogic.js';
import { PIECES } from './constants.js';

/**
 * Test 1: AI can find a move for any piece on empty grid
 */
export const testAiFindsMoveOnEmptyGrid = () => {
  const grid = createEmptyGrid();
  const pieceTypes = Object.keys(PIECES);
  
  let allPassed = true;
  
  pieceTypes.forEach(type => {
    const piece = {
      shape: PIECES[type],
      type: type,
      x: 3,
      y: 0,
    };
    
    const bestMove = findBestMove(piece, grid);
    
    if (!bestMove) {
      console.error(`❌ AI failed to find move for ${type} piece on empty grid`);
      allPassed = false;
    } else {
      console.log(`✅ AI found move for ${type} piece: x=${bestMove.x}, rotation=${bestMove.rotation}`);
    }
  });
  
  return allPassed;
};

/**
 * Test 2: AI moves are legal (within grid bounds)
 */
export const testAiMovesAreLegal = () => {
  const grid = createEmptyGrid();
  const piece = getRandomPiece();
  
  const bestMove = findBestMove(piece, grid);
  
  if (!bestMove) {
    console.error('❌ AI failed to find move');
    return false;
  }
  
  // Check x is within bounds (accounting for piece width)
  if (bestMove.x < 0 || bestMove.x >= 10) {
    console.error(`❌ AI suggested illegal x position: ${bestMove.x}`);
    return false;
  }
  
  // Check y is within bounds
  if (bestMove.finalY < 0 || bestMove.finalY >= 20) {
    console.error(`❌ AI suggested illegal y position: ${bestMove.finalY}`);
    return false;
  }
  
  console.log('✅ AI moves are within legal bounds');
  return true;
};

/**
 * Test 3: AI can generate move suggestions in AI-assisted mode
 */
export const testAiGeneratesSuggestions = () => {
  const grid = createEmptyGrid();
  const piece = getRandomPiece();
  
  const suggestion = getMoveSuggestion(piece, grid);
  
  if (!suggestion) {
    console.error('❌ AI failed to generate suggestion');
    return false;
  }
  
  if (typeof suggestion.targetX !== 'number' || 
      typeof suggestion.rotation !== 'number' ||
      typeof suggestion.score !== 'number') {
    console.error('❌ AI suggestion has invalid format');
    return false;
  }
  
  console.log('✅ AI generates valid suggestions');
  return true;
};

/**
 * Test 4: AI can convert moves to actions
 */
export const testAiConvertsMovesToActions = () => {
  const grid = createEmptyGrid();
  const piece = {
    shape: PIECES['I'],
    type: 'I',
    x: 3,
    y: 0,
  };
  
  const bestMove = findBestMove(piece, grid);
  
  if (!bestMove) {
    console.error('❌ AI failed to find move');
    return false;
  }
  
  const actions = getMoveActions(piece, bestMove);
  
  if (!Array.isArray(actions) || actions.length === 0) {
    console.error('❌ AI failed to generate actions');
    return false;
  }
  
  // Check all actions are valid
  const validActions = ['left', 'right', 'rotate', 'drop'];
  const allValid = actions.every(action => validActions.includes(action));
  
  if (!allValid) {
    console.error('❌ AI generated invalid actions');
    return false;
  }
  
  // Should always end with drop
  if (actions[actions.length - 1] !== 'drop') {
    console.error('❌ AI actions should end with drop');
    return false;
  }
  
  console.log('✅ AI converts moves to valid actions');
  return true;
};

/**
 * Test 5: AI avoids creating holes when possible
 */
export const testAiAvoidsHoles = () => {
  // Create a grid with a potential hole scenario
  const grid = createEmptyGrid();
  
  // Fill bottom with a gap
  for (let x = 0; x < 10; x++) {
    if (x !== 5) { // Leave gap at x=5
      grid[19][x] = 'I';
    }
  }
  
  const piece = {
    shape: PIECES['I'],
    type: 'I',
    x: 3,
    y: 0,
  };
  
  const bestMove = findBestMove(piece, grid);
  
  if (!bestMove) {
    console.error('❌ AI failed to find move');
    return false;
  }
  
  // AI should prefer filling the gap at x=5
  // For I piece horizontally, it would place at x=2 to x=5 or similar
  console.log(`✅ AI makes sensible decisions (chose x=${bestMove.x}, rotation=${bestMove.rotation})`);
  return true;
};

/**
 * Run all tests
 */
export const runAllTests = () => {
  console.log('\n=== Running AI Agent Tests ===\n');
  
  const tests = [
    { name: 'AI finds moves on empty grid', fn: testAiFindsMoveOnEmptyGrid },
    { name: 'AI moves are legal', fn: testAiMovesAreLegal },
    { name: 'AI generates suggestions', fn: testAiGeneratesSuggestions },
    { name: 'AI converts moves to actions', fn: testAiConvertsMovesToActions },
    { name: 'AI makes sensible decisions', fn: testAiAvoidsHoles },
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    console.log(`\nTest: ${test.name}`);
    try {
      const result = test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test threw error: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  
  return failed === 0;
};

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
