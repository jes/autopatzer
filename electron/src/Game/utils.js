import Chess from "chess.js";
import moment from "moment";

export const playerOrder = ["me", "opponent"];

export const loadPGN = (moves) => {
  const board = new Chess();
  board.load_pgn(moves, { sloppy: true });
  return board;
};

export const moveToUCI = (board, move) => {
  const tempBoard = new Chess(board.fen());
  const moveDetails = tempBoard.move(move, { sloppy: true });
  return `${moveDetails.from}${moveDetails.to}`;
};

export const transformPlayerDetails = (myUserId, white, black) => {
  white.colour = "white";
  black.colour = "black";

  let players = [white, black];

  players.forEach((player) => {
    player.id === myUserId
      ? (player.opponent = false)
      : (player.opponent = true);
  });

  const p = {
    me: players.find((p) => !p.opponent),
    opponent: players.find((p) => p.opponent),
  };

  return p;
};

export const getEndTimes = (white, black) => {
  const timestamp = moment().endOf("second");

  return {
    white: moment(timestamp).add(white, "ms"),
    black: moment(timestamp).add(black, "ms"),
  };
};
