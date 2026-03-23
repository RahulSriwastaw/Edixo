const Redis = require('ioredis');
const env = {
  REDIS_URL: "rediss://default:gQAAAAAAASuBAAIncDFkNGUwMTQ1NGJiZmY0YmE1ODNmZGMyN2FiNjkyZDNjNHAxNzY2NzM@teaching-spider-76673.upstash.io:6379"
};

async function main() {
  console.log('Connecting to Redis...');
  const redis = new Redis(env.REDIS_URL, {
    tls: { rejectUnauthorized: false },
    connectTimeout: 5000
  });

  try {
    const start = Date.now();
    await redis.set('test_key', 'hello');
    const val = await redis.get('test_key');
    console.log('Redis set/get success:', val, 'in', Date.now() - start, 'ms');
    
    const incrStart = Date.now();
    const attempts = await redis.incr('test_incr');
    console.log('Redis incr success:', attempts, 'in', Date.now() - incrStart, 'ms');
  } catch (err) {
    console.error('Redis Error:', err);
  } finally {
    redis.disconnect();
  }
}
main();
