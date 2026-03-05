from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="AI Cloud ML Service",
    version="1.0"
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "AI Cloud ML Service",
        "status": "running"
    }