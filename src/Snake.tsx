import * as React from 'react';
import beep from './beep';

interface SnakeGameProps {
    canvasSize: number;
}

interface SnakeGameState {
    gameOver: boolean;
    direction: Direction;
    actualDirection: Direction;
    snakeX: number;
    snakeY: number;
    foodX: number;
    foodY: number;
    tailSize: number;
    tail: Point[];
    score: number;
}

interface Point {
    x: number;
    y: number;
}

enum Direction {
    Left,
    Right,
    Top,
    Bottom
}

const FREQUENCY: number = 100;

export class SnakeGame extends React.Component<SnakeGameProps, SnakeGameState> {
    tickInterval: number = 0;
    tickCounter: number = 0;
    lastKeyDown: number = 0;

    constructor(props: SnakeGameProps) {
        super(props);

        // bind this to 'Restart' click event handler...
        this.restartGame = this.restartGame.bind(this);

        this.resetGame();
        this.calculateNewFoodPosition();
        this.attachControls();

        window.setTimeout(this.start.bind(this), 3000);
    }

    resetGame() {
        var canvasSize = this.props.canvasSize;

        if (canvasSize < 10) {
            throw new Error('canvasSize must be greater than or equal to 10.');
        }

        this.state = {
            gameOver: false,
            actualDirection: Direction.Right,
            direction: Direction.Right,
            snakeX: Math.trunc(canvasSize / 2),
            snakeY: Math.trunc(canvasSize / 2),
            foodX: 0,
            foodY: 0,
            tailSize: 1,
            tail: [],
            score: 0
        };
    }

    calculateNewFoodPosition() {
        var _foodX: number = 0;
        var _foodY: number = 0;
        var _snakeX = Math.trunc(this.state.snakeX);
        var _snakeY = Math.trunc(this.state.snakeY);
        var canvasSize = this.props.canvasSize;

        do {
            _foodX = Math.trunc(Math.random() * canvasSize);
            _foodY = Math.trunc(Math.random() * canvasSize);
        } while (_foodX === _snakeX && _foodY === _snakeY);

        var state = this.state || {};
        state = Object.assign(state, { foodX: _foodX, foodY: _foodY });
        this.state = state;
    }

    handleKeyDownEvent = (event: KeyboardEvent) => {
        var directions = {};
        // Key Up
        directions[38] = Direction.Top;
        // Key Down
        directions[40] = Direction.Bottom;
        // Key Left
        directions[37] = Direction.Left;
        // Key Right
        directions[39] = Direction.Right;

        var forbiddenDirections = {};
        forbiddenDirections[Direction.Right] = Direction.Left;
        forbiddenDirections[Direction.Left] = Direction.Right;
        forbiddenDirections[Direction.Top] = Direction.Bottom;
        forbiddenDirections[Direction.Bottom] = Direction.Top;

        if (event.keyCode in directions) {
            window.console.log(this.tickCounter + ':', event.keyCode);

            var direction = directions[event.keyCode];
            var forbiddenDirection = forbiddenDirections[this.state.actualDirection];

            if (direction !== forbiddenDirection) {
                this.state = Object.assign(this.state, { direction: direction });
            }

            event.preventDefault();
        } else if (event.keyCode === 'P'.charCodeAt(0)) {
            // Play/Pause
            if (this.tickInterval > 0) {
                this.stop();
            } else {
                this.start();
            }
        }
    }

    attachControls() {
        window.addEventListener('keydown', this.handleKeyDownEvent.bind(this));
    }

    tick() {
        this.tickCounter += 1;

        var _newSnakeX = this.state.snakeX;
        var _newSnakeY = this.state.snakeY;
        var _canvasSize = this.props.canvasSize;
        var _foodX = this.state.foodX;
        var _foodY = this.state.foodY;
        var _tailSize = this.state.tailSize;
        var _tail = this.state.tail;
        var direction = this.state.direction;
        var score = this.state.score;

        _tail.splice(0, 0, { x: _newSnakeX, y: _newSnakeY });
        while (_tail.length > _tailSize) {
            _tail.pop();
        }

        switch (direction) {
            case Direction.Top:
                _newSnakeY -= 1;
                break;
            case Direction.Bottom:
                _newSnakeY += 1;
                break;
            case Direction.Left:
                _newSnakeX -= 1;
                break;
            case Direction.Right:
                _newSnakeX += 1;
                break;
            default:
                break;
        }

        var tailKeys = _tail.map(p => p.y + '_' + p.x);
        // Check if the head hitted the borders...
        var isGameOver = (_newSnakeX < 0 || _newSnakeY < 0 || _newSnakeX >= _canvasSize || _newSnakeY >= _canvasSize);
        // Check if the head hitted the tail...
        isGameOver = isGameOver || (tailKeys.indexOf(_newSnakeY + '_' + _newSnakeX) > -1);

        if (isGameOver) {
            // GAME OVER
            this.setState(Object.assign(this.state, { gameOver: true, snakeX: _newSnakeX, snakeY: _newSnakeY }));
            this.stop();
        } else {
            if (_foodX === _newSnakeX && _foodY === _newSnakeY) {
                // HIT TEST
                _tailSize += 1;
                score += 1;
                this.calculateNewFoodPosition();
                beep();
            }

            this.setState(Object.assign(this.state, {
                actualDirection: direction,
                snakeX: _newSnakeX,
                snakeY: _newSnakeY,
                tailSize: _tailSize,
                tail: _tail,
                score: score
            }));
        }
    }

    start() {
        if (this.tickInterval <= 0) {
            var tick = this.tick.bind(this);
            var prev: number = 0;
            var handler = (f: number) => {
                if (f >= (prev + FREQUENCY)) {
                    tick();
                    prev = f;
                }

                // tickInterval > 0 = IsPlaying, else = IsPaused.
                if (this.tickInterval > 0) {
                    window.requestAnimationFrame(handler);
                }
            };

            this.tickInterval = 1;
            window.requestAnimationFrame(handler);
        }
    }

    stop() {
        if (this.tickInterval > 0) {
            window.clearInterval(this.tickInterval);
            this.tickInterval = 0;
        }
    }

    restartGame() {
        this.resetGame();
        this.setState(this.state);

        window.setTimeout(this.start.bind(this), 3000);
    }

    render() {
        var rows = [];
        var canvasSize = this.props.canvasSize;
        var snakeX = this.state.snakeX;
        var snakeY = this.state.snakeY;
        var foodX = this.state.foodX;
        var foodY = this.state.foodY;
        var tailKeys = this.state.tail.map((p) => p.y + '_' + p.x);

        for (let rowIndex = 0; rowIndex < canvasSize; rowIndex++) {
            var cells = [];

            for (let colIndex = 0; colIndex < canvasSize; colIndex++) {
                var key = rowIndex + '_' + colIndex;
                var className = '';

                if (snakeX === colIndex && snakeY === rowIndex) {
                    className = 'snake-head';
                } else if (foodX === colIndex && foodY === rowIndex) {
                    className = 'snake-food';
                } else if (tailKeys.indexOf(key) > -1) {
                    className = 'snake-body';
                }

                cells.push(<td key={key} className={className} />);
            }

            rows.push(<tr key={rowIndex}>{cells}</tr>);
        }

        var gameOverVDom = (
            <div className="game-message">
                <p>GAME OVER</p>
                <a onClick={this.restartGame} href="#">Restart</a>
            </div>
        );

        var tableVDom = (
            <table className="snake-game">
                <tbody>
                    {rows}
                </tbody>
            </table>
        );

        return (
            <div className="game-canvas">
                {this.state.gameOver ? gameOverVDom : null}
                <div>Score: {this.state.score}</div>
                <div className={this.state.gameOver ? 'snake-game-over' : ''}>
                    {tableVDom}
                </div>
            </div>
        );
    }
}