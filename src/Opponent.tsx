import { useEffect, useState } from "react";
import { Square } from "./useTetris";
import "./Opponent.css";
import { db } from "./firebase";
import useRTC from "./useRTC";

const Opponent = ({ lockedBoard }: { lockedBoard: Square[][] }) => {
  // const [board, setBoard] = useState<Square[][]>(
  //   new Array(20).fill(new Array(10).fill({}))
  // );
  const [board, setBoard] = useState<Square[][]>([
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [
      {},
      {},
      {},
      {
        name: "I",
        active: false,
      },
      {
        name: "I",
        active: false,
      },
      {
        name: "I",
        active: false,
      },
      {
        name: "I",
        active: false,
      },
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {},
      {
        name: "S",
        active: false,
      },
      {
        name: "S",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {
        name: "S",
        active: false,
      },
      {
        name: "S",
        active: false,
      },
      {},
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {},
      {
        name: "T",
        active: false,
      },
      {},
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {
        name: "T",
        active: false,
      },
      {
        name: "T",
        active: false,
      },
      {
        name: "T",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {
        name: "J",
        active: false,
      },
      {},
      {},
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {
        name: "J",
        active: false,
      },
      {
        name: "J",
        active: false,
      },
      {
        name: "J",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {},
      {
        name: "O",
        active: false,
      },
      {
        name: "O",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {},
      {
        name: "O",
        active: false,
      },
      {
        name: "O",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {},
      {},
      {
        name: "L",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {
        name: "L",
        active: false,
      },
      {
        name: "L",
        active: false,
      },
      {
        name: "L",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {
        name: "Z",
        active: false,
      },
      {
        name: "Z",
        active: false,
      },
      {},
      {},
      {},
      {},
      {},
    ],
    [
      {},
      {},
      {},
      {},
      {
        name: "Z",
        active: false,
      },
      {
        name: "Z",
        active: false,
      },
      {},
      {},
      {},
      {},
    ],
  ]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    console.log("Send to opponent");
  }, [lockedBoard]);

  useEffect(() => {
    
  }, []);

  const { sendData, startRTC } = useRTC();

  return (
    <div className="opponent">
      <div className="opponent-board-container">
        <h1>Opponent</h1>
        <button onClick={startRTC}>StartRTC</button>
        <div className="opponent-board">
          {board.map((row, i) => {
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
          <h1>{level}</h1>
          <h2>Lines</h2>
          <h1>{lines}</h1>
          <h2>Score</h2>
          <h1>{score}</h1>
          <h2>High Score</h2>
          <h1>{highScore}</h1>
        </div>
      </div>
    </div>
  );
};

export default Opponent;
