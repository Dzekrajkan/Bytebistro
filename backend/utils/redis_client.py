import logging
import time
import threading
from django.core.cache import cache

logger = logging.getLogger(__name__)

_redis_status = {
    "available": False,
    "checked_at": 0,
    "checking": False,
}
REDIS_CHECK_INTERVAL = 30

#Initial check on startup
def is_redis_available() -> bool:
    now = time.time()

    try:
        cache.set("health_check", "ok", timeout=5)
        ok = cache.get("health_check") == "ok"
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
        ok = False

    _redis_status["available"] = ok
    _redis_status["checked_at"] = now

    if ok:
        logger.info("Redis is available")
    else:
        logger.warning("Redis is unavailable, falling back to database")

    return ok

def _check_redis_in_background():
    if _redis_status["checking"]:
        return

    _redis_status["checking"] = True
    try:
        cache.set("health_check", "ok", timeout=5)
        ok = cache.get("health_check") == "ok"
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
        ok = False
    finally:
        _redis_status["available"] = ok
        _redis_status["checked_at"] = time.time()
        _redis_status["checking"] = False

def _write_to_cache(key: str, data, timeout: int):
    try:
        cache.set(key, data, timeout=timeout)
    except Exception as e:
        logger.warning(f"Async Redis write failed for key '{key}': {e}")

def _maybe_trigger_check():
    now = time.time()
    if now - _redis_status["checked_at"] >= REDIS_CHECK_INTERVAL:
        thread = threading.Thread(target=_check_redis_in_background, daemon=True)
        thread.start()

def get_or_fetch(key: str, fetch_fn, timeout: int = 60):
    _maybe_trigger_check()

    if _redis_status["available"]:
        try:
            cached = cache.get(key)
            if cached is not None:
                return cached
        except Exception as e:
            logger.warning(f"Could not read Redis key '{key}': {e}")
            _redis_status["available"] = False

    data = fetch_fn()

    if _redis_status["available"]:
        thread = threading.Thread(target=_write_to_cache, args=(key, data, timeout), daemon=True)
        thread.start()

    return data