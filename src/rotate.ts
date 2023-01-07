import { Square } from "./App";

export const findBounds = (board: Square[][]) => {
  let [lowI, highI, lowJ, highJ] = [20, -1, 10, -1];
  let shape = {} as Square;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j].active) {
        shape = board[i][j];
      }
    }
  }

  // Finds lowest and highest boundaries of the active piece
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j].active) {
        if (i < lowI) {
          lowI = i;
        }
        if (i > highI) {
          highI = i;
        }
        if (j < lowJ) {
          lowJ = j;
        }
        if (j > highJ) {
          highJ = j;
        }
      }
    }
  }

  // Adds extra width to boundary to make square
  switch (shape.name) {
    case "I":
      if (shape.orientation === 0) {
        return [lowI - 1, highI + 2, lowJ, highJ];
      } else if (shape.orientation === 1) {
        return [lowI, highI, lowJ - 2, highJ + 1];
      } else if (shape.orientation === 2) {
        return [lowI - 2, highI + 1, lowJ, highJ];
      } else {
        return [lowI, highI, lowJ - 1, highJ + 2];
      }
    case "O":
      return [lowI, highI, lowJ, highJ];
    default:
      if (shape.orientation === 0) {
        return [lowI, highI + 1, lowJ, highJ];
      } else if (shape.orientation === 1) {
        return [lowI, highI, lowJ - 1, highJ];
      } else if (shape.orientation === 2) {
        return [lowI - 1, highI, lowJ, highJ];
      } else {
        return [lowI, highI, lowJ, highJ + 1];
      }
  }
};

export const rotate = (board: Square[][]) => {
  const [lowI, highI, lowJ, highJ] = findBounds(board);

  const newBoard: Square[][] = [
    ...board.map((row) => [...row.map((square) => ({ ...square }))]),
  ];

  const width = Math.max(highI - lowI, highJ - lowJ);

  // Create matrix containing square around active piece
  const matrix = [];
  for (let i = lowI; i <= lowI + width; i++) {
    const row = [];
    for (let j = lowJ; j <= lowJ + width; j++) {
      row.push(board[i][j]);
    }
    matrix.push(row);
  }
  console.log(matrix);

  // Rotate piece by transposing matrix and reversing each row
  const transposed = [];
  for (let i = 0; i < matrix.length; i++) {
    const row = [];
    for (let j = 0; j < matrix[i].length; j++) {
      row.push(matrix[j][i]);
    }
    transposed.push(row.reverse());
  }

  // Check if piece would cover another
  for (let i = 0; i < transposed.length; i++) {
    for (let j = 0; j < transposed[i].length; j++) {
      if (
        transposed[i][j].active &&
        !board[i + lowI][j + lowJ].active &&
        board[i + lowI][j + lowJ].name
      ) {
        return;
      }
    }
  }

  // Swap matrix into board
  for (let i = 0; i < transposed.length; i++) {
    for (let j = 0; j < transposed[i].length; j++) {
      newBoard[lowI + i][lowJ + j] = {
        ...transposed[i][j],
        orientation: (transposed[i][j].orientation! + 1) % 4,
      };
    }
  }

  return newBoard;
};