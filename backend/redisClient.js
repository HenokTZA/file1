const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  },
});

let isConnected = false; // ✅ Track Redis connection status

redisClient.on("connect", () => {
  console.log("🔗 Connected to Redis");
  isConnected = true;
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

async function connectRedis() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
}

module.exports = { redisClient, connectRedis };
