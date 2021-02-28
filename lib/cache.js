require("dotenv").config();
const cacheManager = require("cache-manager");
const mongodbStore = require("cache-manager-mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const STREAM_TTL = 60 * 60 * 4;
const META_TTL = 60 * 60 * 12;

const mongoCache = cacheManager.caching({
  store: mongodbStore,
  uri: MONGODB_URI,
  options: {
    collection: "cacheManager",
    useNewUrlParser: true,
    useUnifiedTopology: false,
  },
});

function getCached(key, method, ttl) {
  return mongoCache.wrap(key, method, { ttl: ttl });
}

function cacheWrapStream(key, method) {
  return getCached(key, method, STREAM_TTL);
}

function cacheWrapMeta(key, method) {
  return getCached(key, method, META_TTL);
}

module.exports = { cacheWrapStream, cacheWrapMeta };
