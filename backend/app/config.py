import os

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")
REDIS_URL = os.environ.get("REDIS_URL")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-70b-versatile")

GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

CACHE_TTL_SECONDS = 24 * 60 * 60  # 24h
HIGH_RISK_THRESHOLD = 4  # risk_score >= 4 counts as high risk
MIN_CLAUSE_LENGTH = 30
