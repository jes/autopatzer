import { useState, useEffect } from "react";

import { getEventStream } from "../../../../../lichess";

export const useLichessEventStream = () => {
  const [lichessEvent, setLichessEvent] = useState(null);
  const [lichessEventError, setLichessEventError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    getEventStream(signal)
      .then((stream) => {
        const streamReader = stream.getReader();
        const read = (event) => {
          if (event.done) return;

          setLichessEvent(event.value);

          streamReader.read().then(read);
        };

        streamReader.read().then(read);
      })
      .catch((err) => {
        setLichessEventError(err);
      });

    return () => controller.abort();
  }, []);

  return { lichessEvent, lichessEventError };
};
