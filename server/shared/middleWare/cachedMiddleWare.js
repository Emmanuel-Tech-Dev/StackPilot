const CacheManager = require("../helpers/cacheManager");
const Utilities = require("../helpers/functions");

const cacheMiddleware = (cache, ttl = 1000 * 60 * 5) => {
  return (req, res, next) => {
    const key = `api:${req.method}:${req.originalUrl}`;
    console.log(key);

    const cached = cache.get(key);
    // console.log("get cached data", cached);
    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json;
    res.json = function (data) {
      const serialized = Utilities.serializeForCache(data);
      // console.log("set cached data", serialized);
      cache.set(key, serialized, ttl);
      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = cacheMiddleware;
