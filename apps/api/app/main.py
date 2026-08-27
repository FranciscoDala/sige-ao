from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SIGE-AO API")

# Libera CORS para o front
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite/React dev
        "http://localhost:3000",  # Next.js dev
        "https://sige-ao.vercel.app",  # Troca pelo link do teu front
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SIGE-AO API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
