import time

import redis.asyncio as aioredis

from app.core.config import settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def check_rate_limit(key: str) -> tuple[bool, int]:
    r = await get_redis()
    now = int(time.time())
    window = settings.RATE_LIMIT_WINDOW_MINUTES * 60
    pipe = r.pipeline()
    pipe.zadd(key, {str(now): now})
    pipe.zremrangebyscore(key, 0, now - window)
    pipe.zcard(key)
    pipe.expire(key, window)
    _, _, count, _ = await pipe.execute()
    return int(count) <= settings.RATE_LIMIT_ATTEMPTS, settings.RATE_LIMIT_ATTEMPTS - int(count)
