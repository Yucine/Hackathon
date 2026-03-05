from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware




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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)