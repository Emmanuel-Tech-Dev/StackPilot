const NodeCache = require("node-cache");
const { stringify } = require("flatted");

const cach = new NodeCache({ stdTTL: 300 });
const MAX_CACHE_SIZE = 10000;

const generateCacheKey = (req) => {
  const url = req.originalUrl;
  const query = JSON.stringify(req.query);
  return `${url}${query}`;
};

const clearCacheOnModify = (req) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const baseUrl = req.baseUrl || req.originalUrl.split("?")[0];

    const keysToDelete = cach.keys().filter((key) => key.startsWith(baseUrl));

    keysToDelete.forEach((key) => cach.del(key));
    console.log(`Cache cleared for: ${keysToDelete.join(", ")}`);
  }
};

const cachedMiddleware = (req, res, next) => {
  const key = generateCacheKey(req);

  if (req.method === "GET") {
    const cachedData = cach.get(key);
    if (cachedData) {
      const parsedData =
        typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      return res.status(200).json({ ...parsedData });
    }

    // Modify response send to cache the data
    const originalSend = res.send;
    res.send = (data) => {
      const dataSize = Buffer.byteLength(JSON.stringify(data), "utf8");

      if (dataSize < MAX_CACHE_SIZE) {
        cach.set(key, data);
      } else {
        console.warn(
          `Data size too large (${dataSize} bytes) for caching. Skipping caching.`
        );
      }

      originalSend.call(res, data);
    };
  } else {
    // For modifying requests, clear the cache
    clearCacheOnModify(req);

    // After clearing, optionally repopulate cache
    // If the modified data is accessed frequently, you can reload it here
  }

  next();
};

module.exports = cachedMiddleware;
