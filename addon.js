const { addonBuilder } = require("stremio-addon-sdk");

const streams = require("./lib/streams");

const manifest = require("./manifest.json");

const builder = new addonBuilder(manifest);

builder.defineStreamHandler((args) => {
  if (manifest.types.includes(args.type) && args.id.match(/tt\d+/i)) {
    return Promise.resolve(streams(args.type, args.id));
  } else {
    return Promise.resolve({ streams: [] });
  }
});

module.exports = builder.getInterface();
