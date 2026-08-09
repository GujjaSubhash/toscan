from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

RATE_LIMIT_MESSAGE = "Rate limit reached. Try again in 1 hour."
