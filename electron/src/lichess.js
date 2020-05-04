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

export const challengeAI = (level) => {
  var formData = new FormData();
  formData.append("level", level);
  formData.append("color", "black");
  formData.append("clock.limit", 3600);
  formData.append("clock.increment", 10);

  return fetch(`${lichessApiEndpoint}/challenge/ai`, {
    headers: headers,
    method: "POST",
    body: formData,
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const getNowPlaying = () => {
  return fetch(`${lichessApiEndpoint}/account/playing`, {
    headers: headers,
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const getProfile = () => {
  return fetch(`${lichessApiEndpoint}/account`, {
    headers: headers,
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const getEventStream = () => {
  return fetch(`${lichessApiEndpoint}/stream/event`, {
    headers: headers,
  })
    .then(handleErrors)
    .then((response) => {
      return ndjsonStream(response.body);
    });
};

export const getBoardEventStream = (gameId) => {
  return fetch(`${lichessApiEndpoint}/board/game/stream/${gameId}`, {
    headers: headers,
  })
    .then(handleErrors)
    .then((response) => {
      return ndjsonStream(response.body);
    });
};

export const makeBoardMove = (gameId, move) => {
  return fetch(`${lichessApiEndpoint}/board/game/${gameId}/move/${move}`, {
    headers: headers,
    method: "POST",
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};
