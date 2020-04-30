import ndjsonStream from "can-ndjson-stream";

const lichessApiEndpoint = process.env.REACT_APP_API_PREFIX;
const lichessApiToken = process.env.REACT_APP_API_KEY;

const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response); // Make this betterer
  }
  return response;
};

export const challengeAI = (level) => {
  var formData = new FormData();
  formData.append("level", level);

  return fetch(`${lichessApiEndpoint}/challenge/ai`, {
    headers: {
      Authorization: `Bearer ${lichessApiToken}`,
    },
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
    headers: {
      Authorization: `Bearer ${lichessApiToken}`,
    },
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const getProfile = () => {
  return fetch(`${lichessApiEndpoint}/account`, {
    headers: {
      Authorization: `Bearer ${lichessApiToken}`,
    },
  })
    .then(handleErrors)
    .then((response) => {
      return response.json();
    });
};

export const getEventStream = () => {
  return fetch(`${lichessApiEndpoint}/stream/event`, {
    headers: {
      Authorization: `Bearer ${lichessApiToken}`,
    },
  })
    .then(handleErrors)
    .then((response) => {
      return ndjsonStream(response.body);
    });
};

export const getBoardStream = (gameId) => {
  return fetch(`${lichessApiEndpoint}/board/game/stream/${gameId}`, {
    headers: {
      Authorization: `Bearer ${lichessApiToken}`,
    },
  })
    .then(handleErrors)
    .then((response) => {
      return ndjsonStream(response.body);
    });
};
