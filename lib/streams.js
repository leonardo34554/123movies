const { cacheWrapStream } = require("./cache");
const sources = require("./scrapers/sources");
const mydb = require("./mdb");

function getStreams(type, media) {
  const arr = media.split(":");
  const tt = arr[0];
  const season = arr[1];
  const episode = arr[2];

  return Promise.all(
    sources
      .map(({ method, prefix, quality }) =>
        cacheWrapStream(prefix + media, () => method(type, tt, season, episode))
          .then((res) => (res != "" ? res : null))
          .then((stream) => ({
            name: "123movies",
            title: quality,
            url: stream,
          }))
      )
      .concat(mydb(media))
  ).then((streams) => {
    console.log(streams);
    return { streams: streams };
  });
}

module.exports = getStreams;
