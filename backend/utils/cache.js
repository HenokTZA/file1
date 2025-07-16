const { redisClient } = require('../redisClient');

function getKey(orgId, key) {
  return `org:${orgId}:${key}`;
}

async function getCache(orgId, key) {
  const data = await redisClient.get(getKey(orgId, key));
  return data ? JSON.parse(data) : null;
}

async function setCache(orgId, key, value, ttl = 300) { // default: 5 minutes
  await redisClient.setEx(getKey(orgId, key), ttl, JSON.stringify(value));
}

async function delCache(orgId, key) {
  await redisClient.del(getKey(orgId, key));
}

module.exports = { getCache, setCache, delCache };
