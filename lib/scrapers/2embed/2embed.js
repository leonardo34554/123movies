const needle = require("needle");

function request(url, options = {}) {
  return needle("get", url, Object.assign({ open_timeout: 5000 }, options));
}

function getId(body) {
  const idx = body.indexOf('data-id="') + 9;
  const idx2 = body.indexOf('"', idx);
  const key = body.substring(idx, idx2);

  if (key.length > 10) return Promise.reject();
  return /^\d+$/.test(key) ? key : null;
}

function getMovie(tt) {
  return request(
    `https://www.2embed.ru/embed/imdb/movie?id=${tt}`
  ).then((res) => getId(res.body));
}

function getShow(tt, season, episode) {
  return request(
    `https://www.2embed.ru/embed/imdb/tv?id=${tt}&s=${season}&e=${episode}`
  ).then((res) => getId(res.body));
}

function getPlayer(id) {
  return request(`https://www.2embed.ru/ajax/embed/play?id=${id}&_token=`).then(
    (res) => {
      if (typeof res.body === "object" && res.body.link !== "") {
        return res.body.link;
      }
      return Promise.reject();
    }
  );
}

function getSource(player) {
  return request(player).then((res) => {
    const body = res.body;
    const idx = body.indexOf('[{"file":"') + 10;
    const idx2 = body.indexOf('"', idx);
    const link = body.substring(idx, idx2).replace(/\\/gi, "");
    return link;
  });
}

function getStream(type, tt, season, episode) {
  return (type == "movie" ? getMovie(tt) : getShow(tt, season, episode))
    .then((id) => getPlayer(id))
    .then((player) => getSource(player))
    .catch((err) => "");
}

module.exports = getStream;
