from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.api import api_router

app = FastAPI(
    title="Zyro Phase 2 Backend",
    description="AI-powered parametric income protection for gig workers",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Zyro Phase 2 Backend is live"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
