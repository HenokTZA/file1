const { redisClient } = require('../redisClient');

function getTenantRedis(orgId) {
  const prefix = `org:${orgId}:`;

  return {
    async get(key) {
      return await redisClient.get(prefix + key);
    },
    async set(key, value, options = {}) {
      if (options.expiration) {
        await redisClient.set(prefix + key, value, { EX: options.expiration });
      } else {
        await redisClient.set(prefix + key, value);
      }
    },
    async del(key) {
      return await redisClient.del(prefix + key);
    },
    async delPattern(pattern) {
      const fullPattern = prefix + pattern;
      const keys = await redisClient.keys(fullPattern);
      if (keys.length > 0) {
        return await redisClient.del(keys);
      }
      return 0;
    },
    async flush() {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) await redisClient.del(keys);
    },
    prefix
  };
}


module.exports = { getTenantRedis };
