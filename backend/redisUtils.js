// redisUtils.js
const { redisClient } = require("./redisClient");

const getFromCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const setToCache = async (key, data, ttl = 3600) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

const deleteFromCache = async (key) => {
  try {
    console.log(`[Cache] Deleting key: ${key}`);
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};
const clearPattern = async (pattern) => {
  try {
    let cursor = '0';
    let totalDeleted = 0;

    do {
      const { cursor: nextCursor, keys } = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = nextCursor;

      if (keys.length) {
        console.log(`[Cache] Deleting keys for pattern "${pattern}":`, keys);
        await redisClient.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== '0');

    if (totalDeleted === 0) {
      console.warn(`[Cache] No keys matched pattern "${pattern}"`);
    }
  } catch (error) {
    console.error('Redis clear pattern error:', error);
  }
};

// Add to redisUtils.js
const generateCacheKey = (prefix, orgId, additionalParams = {}) => {
    const paramsString = Object.entries(additionalParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    
    return `${prefix}:org:${orgId}${paramsString ? `:${paramsString}` : ''}`;
  };
  
const cachePaginatedResults = async (cacheKey, data, ttl = 300) => {
    if (!data || !data.results || data.results.length === 0) return;
    await setToCache(cacheKey, data, ttl);
  };
  /**
 * Invalidates task-related caches using existing Redis utils
 * @param {string} orgId - Organization ID
 * @param {string|null} taskId - Specific task ID (optional)
 * @param {string|null} userId - Specific user ID (optional)
 */
const invalidateTaskCaches = async (orgId, taskId = null, userId = null) => {
  const operations = [];
  const cacheLog = [];
  
  // 1. Base patterns for task caches
  const basePatterns = [
    `tasks:org:${orgId}*`,          // All organization tasks
    `task_calendar:org:${orgId}*`,   // Calendar views
    `task_stats:org:${orgId}*`       // Statistics
  ];

  basePatterns.forEach(pattern => {
    operations.push(
      clearPattern(pattern)
        .then(() => cacheLog.push(`Cleared pattern: ${pattern}`))
        .catch(err => cacheLog.push(`ERROR clearing ${pattern}: ${err.message}`))
    );
  });

  // 2. User-specific caches if userId provided
  if (userId) {
    const userPatterns = [
      `user_tasks:${userId}:*`,
      `user_task_stats:${userId}:*`
    ];
    
    userPatterns.forEach(pattern => {
      operations.push(
        clearPattern(pattern)
          .then(() => cacheLog.push(`Cleared user pattern: ${pattern}`))
          .catch(err => cacheLog.push(`ERROR clearing user ${pattern}: ${err.message}`))
      );
    });
  }

  // 3. Specific task keys if taskId provided
  if (taskId) {
    const taskKeys = [
      `task:${taskId}`,
      `task_dependencies:${taskId}`,
      `task_assignees:${taskId}`
    ];
    
    taskKeys.forEach(key => {
      operations.push(
        deleteFromCache(key)
          .then(() => cacheLog.push(`Deleted key: ${key}`))
          .catch(err => cacheLog.push(`ERROR deleting ${key}: ${err.message}`))
      );
    });
  }

  // Execute all operations with timeout protection
  try {
    await Promise.race([
      Promise.allSettled(operations),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Cache invalidation timeout after 3s')), 3000)
      )
    ]);
    
    console.log('[Task Cache] Invalidation results:\n' + cacheLog.join('\n'));
  } catch (err) {
    console.error('[Task Cache] Invalidation timeout:', err.message);
  }
};
module.exports = { getFromCache, setToCache, deleteFromCache, clearPattern,generateCacheKey,cachePaginatedResults ,invalidateTaskCaches };