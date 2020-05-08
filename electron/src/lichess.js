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

export const challengeAI = (level, time, colour) => {
  var formData = new FormData();
  formData.append("level", level);
  formData.append("color", colour);
  formData.append("clock.limit", time.time * 60);
  formData.append("clock.increment", time.increment);

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

export const createSeek = (time, colour, rated) => {
  var formData = new FormData();
  formData.append("time", time.time);
  formData.append("increment", time.increment);
  formData.append("color", colour);
  formData.append("rated", rated);

  return fetch(`${lichessApiEndpoint}/board/seek`, {
    headers: headers,
    method: "POST",
    body: formData,
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const getPlayerStatus = (user) => {
  var queryParams = new URLSearchParams();
  queryParams.append("ids", user);

  return fetch(`${lichessApiEndpoint}/users/status?${queryParams.toString()}`, {
    headers: headers,
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
