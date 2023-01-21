import { useEffect, useState } from "react";
import { Square } from "./useTetris";
import "./Opponent.css";
import { db } from "./firebase";
import useRTC from "./useRTC";

const Opponent = ({
  lockedBoard,
  gameInfo,
}: {
  lockedBoard: Square[][];
  gameInfo: { level: number; lines: number; score: number };
}) => {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    console.log("Send to opponent");
    sendData({
      board: lockedBoard,
      level: gameInfo.level,
      lines: gameInfo.lines,
      score: gameInfo.score,
    });
  }, [lockedBoard]);

  const { sendData, startRTC, opponent, connectionStatus } = useRTC();

  if (connectionStatus !== "connected") {
    return (
      <div className="opponent">
        <div className="opponent-board-container">
          <h1>{connectionStatus}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="opponent">
      <div className="opponent-board-container">
        <h1>Opponent</h1>
        <div className="opponent-board">
          {opponent.board.map((row, i) => {
            return (
              <div className="opponent-row" key={"row" + i}>
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
      <div className="opponent-info">
        <div className="opponent-score-grid">
          <h2>Level</h2>
          <h1>{opponent.level}</h1>
          <h2>Lines</h2>
          <h1>{opponent.lines}</h1>
          <h2>Score</h2>
          <h1>{opponent.score}</h1>
          <h2>High Score</h2>
          <h1>{highScore}</h1>
        </div>
      </div>
    </div>
  );
};

export default Opponent;
