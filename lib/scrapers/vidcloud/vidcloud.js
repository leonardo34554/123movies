const needle = require("needle");
const { parse } = require("fast-html-parser");
const { getMeta } = require("../../cinemeta");
const { cacheStream } = require("./vidcloud_seasons");

function request(url, options = {}) {
  return needle("get", url, Object.assign({ open_timeout: 5000 }, options));
}

async function getSeason(tt, season, episode, episodes) {
  const arr = [];
  for (const ep in episodes) {
    arr.push({ episode: ep, href: episodes[ep] });
  }

  arr.forEach(({ episode, href }) => {
    getPlayer(href)
      .then((player) => getSource(player))
      .then((stream) => {
        cacheStream(tt, season, episode, stream);
      })
      .catch();
  });
}

function getEpisode(tt, season, episode, href) {
  return request(`https://vidcloud9.com${href}`).then((res) => {
    const html = parse(res.body);
    const group = html.querySelector(".listing.items.lists");
    const episodes = group
      .querySelectorAll("a")
      .map((x) => x.rawAttributes.href);

    const obj = {};
    episodes.forEach((x) => {
      const eidx = x.indexOf("episode-") + 8;
      const eidx2 = x.indexOf("-", eidx);
      const epi = x.substring(eidx, eidx2);
      const ep = epi.startsWith("0") ? epi.substring(1) : epi;
      obj[ep] = x;
    });

    const href = obj[episode];
    delete obj[episode];

    getSeason(tt, season, episode, obj);

    if (href) return href;

    return Promise.reject();
  });
}

function search(tt, season, episode, title) {
  return request(
    `https://vidcloud9.com/ajax-search.html?keyword=${title}${
      season ? " season " + season : ""
    }&id=-1`,
    {
      headers: {
        "x-requested-with": "XMLHttpRequest",
      },
    }
  ).then((res) => {
    const html = parse(res.body);
    const a = html.querySelectorAll("a");
    const titles = a.map((x) => x.rawAttributes.href.replace(/\\|"/gi, ""));

    if (titles.length == 0) return Promise.reject();
    if (!season) return titles[0];

    var i;
    for (i = 0; i < titles.length; i++)
      if (titles[i].includes(`- Season ${season}`)) break;
    i %= titles.length;

    return getEpisode(tt, season, episode, titles[i]);
  });
}

function getPlayer(href) {
  return request(`https://vidcloud9.com${href}`).then((res) => {
    const body = res.body;
    const idx = body.indexOf('<iframe src="') + 13;
    const idx2 = body.indexOf('"', idx);
    const tunnel =
      "http:" + body.substring(idx, idx2).replace("streaming", "ajax");
    return tunnel;
  });
}

function getSource(player) {
  return request(player, {
    follow: 1,
    headers: {
      "x-requested-with": "XMLHttpRequest",
    },
  }).then((res) => {
    const json = JSON.parse(res.body);
    const source = json.source;
    const link = source[0].file;
    return link;
  });
}

function getStream(type, tt, season, episode) {
  return getMeta(type, tt)
    .then(({ name }) => search(tt, season, episode, name))
    .then((href) => getPlayer(href))
    .then((player) => getSource(player))
    .catch((err) => {
      return "";
    });
}

module.exports = getStream;
