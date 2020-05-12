import Chess from "chess.js";

export const playerOrder = ["white", "black"];

export const loadPGN = (moves) => {
  const board = new Chess();
  board.load_pgn(moves, { sloppy: true });
  return board;
};

export const moveToUCI = (board, move) => {
  console.log("fen = " + board.fen() + "; moveToUCI: " + move)
  const tempBoard = new Chess(board.fen());
  const moveDetails = tempBoard.move(move, { sloppy: true });
  if (!moveDetails) {
    return [undefined, false];
  }
  const isPawnPromotion = moveDetails.flags.includes("p");
  const promotionPiece = isPawnPromotion ? moveDetails.promotion : '';
  return [`${moveDetails.from}${moveDetails.to}${promotionPiece}`, isPawnPromotion];
};

export const transformPlayerDetails = (myUserId, white, black) => {
  white = {
    ...white,
    colour: "white",
    opponent: white.id === myUserId ? false : true,
  };

  black = {
    ...black,
    colour: "black",
    opponent: black.id === myUserId ? false : true,
  };

  return {
    white: white,
    black: black,
  };
};
