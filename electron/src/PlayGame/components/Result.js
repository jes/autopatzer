import React, { useState, useEffect } from "react";
import { Typography } from "@material-ui/core";

function ucFirst(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const Result = ({ state }) => {
  const [textResult, setTextResult] = useState("");
  const [textStatus, setTextStatus] = useState("");

  useEffect(() => {
    switch (state.gameWinner) {
      case "white":
        setTextResult("1-0");
        break;
      case "black":
        setTextResult("0-1");
        break;
      default:
        if (state.gameStatus !== "aborted" && state.gameStatus !== "noStart") {
          setTextResult("½-½");
        }
        break;
    }

    // Note: gameLoser will be 'White' in the event that the game has no winner yet;
    // gameLoser value only applicable when gameWinner is set
    let gameWinner = ucFirst(state.gameWinner);
    let gameLoser = gameWinner === "White" ? "Black" : "White";

    switch (state.gameStatus) {
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
        if (state.gameOver) {
          setTextStatus(`Game over: ${ucFirst(state.gameStatus)}`);
        } else {
          setTextStatus(ucFirst(state.gameStatus));
        }
        break;
    }
  }, [state.gameWinner, state.gameStatus, state.gameOver]);

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
