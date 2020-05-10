import { useState, useEffect } from "react";

import { getBoardEventStream } from "../../../lichess";

export const useBoardEventStream = (gameId) => {
  const [boardEvent, setBoardEvent] = useState(null);
  const [boardEventError, setBoardEventError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    getBoardEventStream(gameId, signal)
      .then((stream) => {
        const streamReader = stream.getReader();
        const read = (event) => {
          if (event.done) return;

          setBoardEvent(event.value);

          streamReader.read().then(read);
        };

        streamReader.read().then(read);
      })
      .catch((err) => {
        setBoardEventError(err);
      });

    return () => controller.abort();
  }, [gameId]);

  return { boardEvent, boardEventError };
};
