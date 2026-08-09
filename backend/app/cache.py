import redis.asyncio as redis

from app.config import REDIS_URL

_client: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(REDIS_URL, decode_responses=True)
    return _client


def cache_key(content_hash: str) -> str:
    return f"tos:hash:{content_hash}"
