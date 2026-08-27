from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import routers_auth

app = FastAPI(title="SIGE-AO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://sige-ao.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers_auth.router)

@app.get("/")
def root():
    return {"message": "SIGE-AO API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
