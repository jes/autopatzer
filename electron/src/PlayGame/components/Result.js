import React, { useState, useEffect } from "react";
import { Typography } from "@material-ui/core";

function ucFirst(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const Result = ({ gameWinner, gameStatus }) => {
  const [textResult, setTextResult] = useState("");
  const [textStatus, setTextStatus] = useState("");

  useEffect(() => {
    switch (gameWinner) {
      case "white":
        setTextResult("1-0");
        break;
      case "black":
        setTextResult("0-1");
        break;
      default:
        if (gameStatus !== "aborted" && gameStatus !== "noStart") {
          setTextResult("½-½");
        }
        break;
    }

    // Note: gameLoser will be 'White' in the event that the game has no winner yet;
    // gameLoser value only applicable when gameWinner is set
    let gameWinner = ucFirst(gameWinner);
    let gameLoser = gameWinner === "White" ? "Black" : "White";

    switch (gameStatus) {
      case "mate":
        setTextStatus(`Checkmate, ${gameWinner} is victorious`);
        break;
      case "resign":
        setTextStatus(`${gameLoser} resigned, ${gameWinner} is victorious`);
        break;
      case "timeout":
        setTextStatus(
          `${gameLoser} left the game, ${gameWinner} is victorious`
        );
        break;
      case "outoftime":
        setTextStatus(`Time out, ${gameWinner} is victorious`);
        break;
      default:
        setTextStatus(`Game over: ${ucFirst(gameStatus)}`);
        break;
    }
  }, [gameWinner, gameStatus]);

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
