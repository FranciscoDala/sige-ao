from fastapi import FastAPI

app = FastAPI(title="SIGE-AO API")

@app.get("/")
def root():
    return {"message": "SIGE-AO API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
