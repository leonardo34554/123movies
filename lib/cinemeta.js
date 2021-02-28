const needle = require("needle");

const { cacheWrapMeta } = require("./cache");

function meta(type, tt) {
  return needle(
    "get",
    `https://v3-cinemeta.strem.io/meta/${type}/${tt}.json`
  ).then((res) => {
    const body = res.body;
    if (body && body.meta) {
      const meta = body.meta;
      const name = meta.name.toLowerCase().replace(/[^a-z0-9 ]/gi, " ");
      const year = meta.year.substring(0, 4);
      return { name: name, year, year };
    }
    return Promise.reject();
  });
}

function getMeta(type, tt) {
  return cacheWrapMeta(tt, () => meta(type, tt));
}

module.exports = { getMeta };
