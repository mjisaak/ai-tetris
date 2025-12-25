# AI Tetris

A React-based Tetris game with integrated AI gameplay augmentation. Play manually, get AI assistance, or watch the AI play autonomously!

## Features

- **Three Game Modes**:
  - **Manual**: Classic Tetris with full player control
  - **AI-Assisted**: Play with real-time AI move suggestions
  - **AI-Autonomous**: Watch the AI play by itself

- **Intelligent AI Agent**: Heuristic-based AI that evaluates board states and makes optimal moves
- **Seamless Mode Switching**: Change modes at any time during gameplay
- **Modern UI**: Clean, responsive design with visual feedback
- **Score Tracking**: Track your score, level, and lines cleared

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Game

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

### Controls (Manual & AI-Assisted Modes)

- **←/→**: Move piece left/right
- **↑**: Rotate piece
- **↓**: Soft drop (move down faster)
- **Space**: Hard drop (instant drop)
- **P**: Pause/Resume

### Game Modes

1. **Manual Mode**: Traditional Tetris gameplay with keyboard controls
2. **AI-Assisted Mode**: Play normally while the AI shows suggested moves
3. **AI-Autonomous Mode**: Sit back and watch the AI play

Switch between modes using the buttons at the top of the screen!

## AI Design

The AI uses a heuristic-based evaluation system that considers:
- Aggregate height of all columns
- Number of holes in the grid
- Bumpiness (height variations between columns)
- Potential for clearing lines

For detailed information about the AI design, testing, and configuration, see [AI_DOCUMENTATION.md](./AI_DOCUMENTATION.md).

## Technology Stack

- **React**: UI framework
- **Vite**: Build tool and dev server
- **Vanilla JavaScript**: Game logic and AI implementation

## Project Structure

```
src/
├── constants.js      # Game constants and piece definitions
├── gameLogic.js      # Core Tetris game mechanics
├── aiAgent.js        # AI decision-making logic
├── Tetris.jsx        # Main game component
├── Tetris.css        # Game styling
├── App.jsx           # App wrapper
└── main.jsx          # Entry point
```

## License

MIT
