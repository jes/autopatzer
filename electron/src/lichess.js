import ndjsonStream from "can-ndjson-stream";

const lichessApiEndpoint = process.env.REACT_APP_API_PREFIX;
const lichessApiToken = process.env.REACT_APP_API_KEY;

const headers = {
  Authorization: `Bearer ${lichessApiToken}`,
};

const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response); // Make this betterer
  }
  return response;
};

export const streamLichess = (uri, signal) => {
  return fetch(lichessApiEndpoint + uri, {
    headers: headers,
    signal,
  })
    .then(handleErrors)
    .then((response) => {
      return ndjsonStream(response.body);
    });
};

export const getLichess = (uri) => {
  return fetch(lichessApiEndpoint + uri, {
    headers: headers,
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const postLichess = (uri, formData) => {
  return fetch(lichessApiEndpoint + uri, {
    headers: headers,
    method: "POST",
    body: formData,
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const challengeAI = (level, time, colour) => {
  var formData = new FormData();
  formData.append("level", level);
  formData.append("color", colour);
  formData.append("clock.limit", time.time * 60);
  formData.append("clock.increment", time.increment);

  return postLichess('/challenge/ai', formData);
};

export const createSeek = (time, colour, rated) => {
  var formData = new FormData();
  formData.append("time", time.time);
  formData.append("increment", time.increment);
  formData.append("color", colour);
  formData.append("rated", rated);

  return postLichess('/board/seek', formData);
};

export const getPlayerStatus = (user) => {
  var queryParams = new URLSearchParams();
  queryParams.append("ids", user);

  return getLichess(`/users/status?${queryParams.toString()}`);
};

export const getNowPlaying = () => {
  return getLichess('/account/playing');
};

export const getProfile = () => {
  return getLichess('/account');
};

export const getEventStream = (signal) => {
  return streamLichess('/stream/event', signal);
};

export const getBoardEventStream = (gameId, signal) => {
  return streamLichess(`/board/game/stream/${gameId}`, signal);
};

export const makeBoardMove = (gameId, move) => {
  return postLichess(`/board/game/${gameId}/move/${move}`);
};

export const resignGame = (gameId) => {
  return postLichess(`/board/game/${gameId}/resign`);
};

export const requestDraw = (gameId) => {
  return postLichess(`/board/game/${gameId}/draw/yes`);
};
