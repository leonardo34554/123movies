const embed = require("./2embed/2embed");
const movies = require("./123movies/123movies");
const vidcloud = require("./vidcloud/vidcloud");

module.exports = [
  {
    method: embed,
    prefix: "embed",
    quality: "HD",
  },
  {
    method: vidcloud,
    prefix: "vidcloud",
    quality: "SD",
  },
  {
    method: movies,
    prefix: "movies",
    quality: "SD",
  },
];
