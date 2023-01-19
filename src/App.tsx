import { Fragment } from "react";
import "./App.css";
import useTetris from "./useTetris";

function App() {
  const {
    start,
    setKeyLeft,
    setKeyRight,
    setKeyUp,
    setKeyDown,
    setLeftClicks,
    setRightClicks,
    setUpClicks,
    setDownClicks,
    board,
    gameOver,
    level,
    lines,
    score,
    highScores,
  } = useTetris();

  const leftPress = () => {
    setKeyLeft(true);
  };

  const rightPress = () => {
    setKeyRight(true);
  };

  const upPress = () => {
    setKeyUp(true);
  };

  const downPress = () => {
    setKeyDown(true);
  };

  const leftRelease = () => {
    setKeyLeft(false);
    setLeftClicks(0);
  };

  const rightRelease = () => {
    setKeyRight(false);
    setRightClicks(0);
  };

  const upRelease = () => {
    setKeyUp(false);
    setUpClicks(0);
  };

  const downRelease = () => {
    setKeyDown(false);
    setDownClicks(0);
  };

  return (
    <div className="App">
      <div className="game">
        <div className="opponent-container"></div>
        <div className="board-container">
          <div className="board">
            {board.map((row, i) => {
              return (
                <div className="row" key={"row" + i}>
                  {row.map((square, j) => {
                    return (
                      <div
                        className={`square ${square.name} ${
                          "preview-" + square.preview
                        }`}
                        key={"square" + j}
                      ></div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="info">
          <div className="score-grid">
            <h2>Level</h2>
            <h1>{level}</h1>
            <h2>Lines</h2>
            <h1>{lines}</h1>
            <h2>Score</h2>
            <h1>{score}</h1>
          </div>
          {gameOver && <h1 className="game-over">GAME OVER</h1>}
          {gameOver && (
            <div>
              <h2>High Scores</h2>
              <div className="high-grid">
                {highScores.map((score, i) => {
                  return (
                    <Fragment key={"score" + i}>
                      <h2>{i + 1}.</h2>
                      <h1>{score}</h1>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          )}
          {gameOver && <button onClick={() => start()}>Start</button>}
        </div>
      </div>
    </div>
  );
}

export default App;
