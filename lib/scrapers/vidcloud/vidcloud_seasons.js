const { cacheWrapStream } = require("../../cache");

function cacheStream(tt, season, episode, stream) {
  console.log(`vidcloud${tt}:${season}:${episode}`);
  cacheWrapStream(`vidcloud${tt}:${season}:${episode}`, () => stream);
}

module.exports = { cacheStream };
