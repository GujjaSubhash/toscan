from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.rate_limit import RATE_LIMIT_MESSAGE, limiter
from app.routers import analyze, demo, document, eval

app = FastAPI(title="ClarityToS API")

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": RATE_LIMIT_MESSAGE})


app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(document.router, prefix="/api")
app.include_router(eval.router, prefix="/api")
app.include_router(demo.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
