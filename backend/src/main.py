from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings

from src.food.router import router as food_router

app = FastAPI(title="Grocery, Meal Planning, and Calorie Tracking API")

# Configure CORS
origins = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

app.include_router(food_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
