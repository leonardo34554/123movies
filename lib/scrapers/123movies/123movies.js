const needle = require("needle");
const { parse } = require("fast-html-parser");

function request(url, options = {}) {
  return needle("get", url, Object.assign({ open_timeout: 5000 }, options));
}

function getMirror(body) {
  const html = parse(body);
  const li = html.querySelector(".list-server-items");
  const a = li.querySelectorAll("a");
  const m = a[1].rawAttributes.href.replace("/streaming.php", "/ajax.php");
  if (m == '""') return Promise.reject();
  return "https:" + m;
}

function getMovie(tt) {
  return request(
    `https://databasegdriveplayer.co/player.php?imdb=${tt}`
  ).then((res) => getMirror(res.body));
}

function getShow(tt, season, episode) {
  return request(
    `https://series.databasegdriveplayer.co/player.php?type=series&imdb=${tt}&season=${season}&episode=${episode}`
  ).then((res) => getMirror(res.body));
}

function getSource(mirror) {
  return request(mirror, {
    headers: {
      "x-requested-with": "XMLHttpRequest",
    },
  }).then((res) => {
    const json = JSON.parse(res.body);
    const source = json.source;
    const file = source[0].file;
    return file;
  });
}

function getStream(type, tt, season, episode) {
  if (type != "movie") return;
  return (type == "movie" ? getMovie(tt) : getShow(tt, season, episode))
    .then((mirror) => getSource(mirror))
    .catch((err) => "");
}

module.exports = getStream;
