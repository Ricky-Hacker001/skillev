from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware # <--- 1. Import this
from fastapi.security import OAuth2PasswordBearer
from database import engine, Base
from users import router as user_router

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skillev API")

# 2. Configure CORS
# This allows your React frontend to talk to this backend
origins = [
    "http://localhost:3000",    # React default
    "http://localhost:5173",    # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allow your frontend origins
    allow_credentials=True,
    allow_methods=["*"],              # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],              # Allow all headers (Content-Type, Authorization, etc.)
)

# Register the User Routes
app.include_router(user_router.router)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

@app.get("/secure-data")
def read_secure_data(token: str = Depends(oauth2_scheme)):
    return {"message": "Success", "status": "Authorized"}

@app.get("/")
def root():
    return {"message": "Skillev API is running!"}