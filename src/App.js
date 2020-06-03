import React, { useState } from 'react';
import './App.css';
import ReactDice from 'react-dice-complete'
import 'react-dice-complete/dist/react-dice-complete.css'


const WHITE_PLAYER = 'WHITE_PLAYER';
const BLACK_PLAYER = 'BLACK_PLAYER';

const POINTING_UP = 'POINTING_UP';
const POINTING_DOWN = 'POINTING_DOWN';

const BOARD_HEIGHT = 480;
const BOARD_WIDTH = 455;
const TRIANGLE_HEIGHT = BOARD_HEIGHT / 3;
const TRIANGLE_BASE = BOARD_WIDTH / 13;
const BORDER_WIDTH = TRIANGLE_BASE / 2;

// Game Logic

function isValidMove(player, points, move, dice, setDice, setTurn) {
  // player has at least one checker of their color to move
  const fromPoint = points[move.from];
  if (fromPoint.player !== player || fromPoint.count < 1)
    return false;

  // point moved to is your color or empty or your opponents color with only one checker
  const toPoint = points[move.to];
  if (!(toPoint.player === player || toPoint.count <= 1))
    return false;

  const distance = move.to - move.from;
  // movement is in the correct direction
  if (!(player === WHITE_PLAYER && distance < 0) || !(player === BLACK_PLAYER && distance > 0))
    return false;

  // there is a die with the correct number of steps
  const dieIndex = dice.findIndex((dieValue) => dieValue === Math.abs(distance));
  if (dieIndex < 0)
    return false;

  // special rules for bar
  if ((player === WHITE_PLAYER && points[24].count > 0) || (player === BLACK_PLAYER && points[25].count > 0)) {

  }

  dice.splice(dieIndex, 1);
  setDice(dice);

  fromPoint();

  if (dice.length === 0) {
    setTurn(player === WHITE_PLAYER ? BLACK_PLAYER : WHITE_PLAYER);
  }

  return true;
}

// CSS Shapes

function Circle({color, size, border, left, top, onClick}) {
  const circleStyle = {
    backgroundColor: color,
    width: size,
    height: size,
    border: border,
    borderRadius: size,
    position: "absolute",
    zIndex: 1,
    left: left,
    top: top,
  };
  return <div style={circleStyle} onClick={onClick} />;
}
Circle.defaultProps = {
  border: "none"
};

function Triangle({color, orientation, left, top}) {
  const triangleStyle = {
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
    position: "absolute",
    zIndex: 0,
    left: left,
    top: top,
    borderLeft: (TRIANGLE_BASE / 2) + "px solid transparent",
    borderRight: (TRIANGLE_BASE / 2) + "px solid transparent",
    borderTop: orientation === POINTING_UP ? '0' : TRIANGLE_HEIGHT + 'px solid ' + color,
    borderBottom: orientation === POINTING_UP ? TRIANGLE_HEIGHT + 'px solid ' + color : '0',
  };
  return <div style={triangleStyle} />;
}

// Game Components

function Checker({player, left, top, onClick}) {
  return (
    <Circle
      color={player === WHITE_PLAYER ? 'white' : 'black'}
      border={player === WHITE_PLAYER ? '1px solid black' : 'none'}
      size={(player === WHITE_PLAYER ? TRIANGLE_BASE - 2 : TRIANGLE_BASE) + "px"}
      left={left}
      top={top}
      onClick={onClick} />);
}

function Point({number, checkers, move, setMove}) {
  const inLowerBoard = number >= 12;
  const inRightBoard = (6 <= number && number < 12) || (18 <= number && number < 24);
  const leftOffset = ((number % 12) * TRIANGLE_BASE) + (inRightBoard ? TRIANGLE_BASE : 0);
  const topOffset = inLowerBoard ? BOARD_HEIGHT - TRIANGLE_HEIGHT : 0;

  const handleCheckerClick = (e) => {
    if (move.from == null) {
      move.from = number;
    } else {
      move.to = number;
      // isValidMove(move);
    }
    setMove(move);
    console.log(move);
  };

  let checkersView = [];
  if (checkers.player != null) {
    for (let i = 0; i < checkers.count; i++) {
      const checkerTopOffset = (inLowerBoard ? BOARD_HEIGHT - (i + 1) * TRIANGLE_BASE : i * TRIANGLE_BASE);
      checkersView.push(
        <Checker
          key={i}
          player={checkers.player}
          left={leftOffset + "px"}
          top={checkerTopOffset + "px"}
          onClick={handleCheckerClick} />
      );
    }
  }

  return (
    <>
      <Triangle
        left={leftOffset + "px"}
        top={topOffset + "px"}
        orientation={inLowerBoard ? POINTING_UP : POINTING_DOWN}
        color={(number % 2 === 0 ^ inLowerBoard) ? "green" : "red"} />
      {checkersView}
    </>);
}

function Dice() {
  return <div />;
}

function Board({board, move, setMove}) {
  const boardStyle = {
    position: "absolute",
    backgroundColor: "#FFFDD0",
    width: BOARD_WIDTH + "px",
    height: BOARD_HEIGHT + "px",
    top: "50%",
    left: "50%",
    marginTop: -(BOARD_WIDTH + 2 * BORDER_WIDTH) / 2 + "px",
    marginLeft: -(BOARD_HEIGHT + 2 * BORDER_WIDTH) / 2 + "px",
    border: BORDER_WIDTH + "px solid #8f5902",
  };
  const barStyle = {
    position: "relative",
    left: ((BOARD_WIDTH - TRIANGLE_BASE) / 2) + "px",
    width: TRIANGLE_BASE + "px",
    height: BOARD_HEIGHT + "px",
    backgroundColor: "#8f5902",
  };
  const points = board.slice(0, 24).map((checkers, index) =>
    <Point key={index} number={index} checkers={checkers} move={move} setMove={setMove} />);
  return (
    <div style={boardStyle}>
      <div style={barStyle}>

      </div>
      {points}
    </div>);
}

function Game() {
  // Indices 0-11 are the points at the top of the board moving left to right,
  // 12-23 are the points at the bottom of the board moving left to right,
  // index 24 is white's bar and 25 is black's bar.
  let initialPoints = [];
  for (let i = 0; i < 26; i++) {
    initialPoints.push({ player: null, count: 0 });
  }
  initialPoints[0] = { player: BLACK_PLAYER, count: 5 };
  initialPoints[4] = { player: WHITE_PLAYER, count: 3 };
  initialPoints[6] = { player: WHITE_PLAYER, count: 5 };
  initialPoints[11] = { player: BLACK_PLAYER, count: 2 };
  initialPoints[12] = { player: WHITE_PLAYER, count: 5 };
  initialPoints[16] = { player: BLACK_PLAYER, count: 3 };
  initialPoints[18] = { player: BLACK_PLAYER, count: 5 };
  initialPoints[23] = { player: WHITE_PLAYER, count: 2 };

  const [turn, setTurn] = useState(Math.random() <= 0.5 ? WHITE_PLAYER : BLACK_PLAYER);
  const [board, setBoard] = useState(initialPoints);
  const [move, setMove] = useState({from: null, to: null});
  const [dice, setDice] = useState([1, 1]);

  return (
    <>
      <Board board={board} move={move} setMove={setMove} />
      <Dice />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Game />
    </div>
  );
}

export default App;
