from fastapi import FastAPI
from database import engine, Base
from users import router as user_router

# Create Tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skillev API")

# Register the User Routes
app.include_router(user_router.router)

@app.get("/")
def root():
    return {"message": "Skillev API is running!"}