import React, { useState, useEffect } from "react";
import { Typography } from "@material-ui/core";

function ucFirst(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const Result = ({ gameWinner, gameStatus }) => {
  let textResult, textStatus;

  switch (gameWinner) {
    case "white":
      textResult = "1-0";
      break;
    case "black":
      textResult = "0-1";
      break;
    default:
      if (gameStatus !== "aborted" && gameStatus !== "noStart") {
        textResult = "½-½";
      }
      break;
  }

  // Note: gameLoser will be 'White' in the event that the game has no winner yet;
  // gameLoser value only applicable when gameWinner is set
  gameWinner = ucFirst(gameWinner);
  let gameLoser = gameWinner === "White" ? "Black" : "White";

  switch (gameStatus) {
    case "mate":
      textStatus = `Checkmate, ${gameWinner} is victorious`;
      break;
    case "resign":
      textStatus = `${gameLoser} resigned, ${gameWinner} is victorious`;
      break;
    case "timeout":
      textStatus = `${gameLoser} left the game, ${gameWinner} is victorious`;
      break;
    case "outoftime":
      textStatus = `Time out, ${gameWinner} is victorious`;
      break;
    default:
      textStatus = `Game over: ${ucFirst(gameStatus)}`;
      break;
  }

  return (
    <>
      <Typography variant="h1" align="center">
        {textResult}
      </Typography>
      <Typography align="center">{textStatus}</Typography>
    </>
  );
};

export default Result;
