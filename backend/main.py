from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Internal Imports
from database import engine, Base, get_db
from users import router as user_router
import container_manager 

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skillev API")

# --- 1. CORS CONFIGURATION ---
# Note: For the hackathon, we allow all origins, but in production, 
# you'd restrict this to your specific frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. ROUTER REGISTRATION ---
app.include_router(user_router.router)

# --- 3. CORE ROUTES ---

@app.get("/")
def root():
    return {
        "message": "Skillev Protocol API is running!", 
        "engine": "Docker-Orchestrator-v1",
        "status": "Online"
    }

# --- 4. TASK EXECUTION (The Engine) ---

@app.post("/tasks/start/{domain}/{task_id}")
async def start_task(domain: str, task_id: str, user_id: int):
    """
    Triggers the creation of an isolated, timed Docker node.
    Returns the dynamic port for the frontend iframe.
    """
    valid_domains = ["cybersecurity", "fullstack"]
    if domain not in valid_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Domain '{domain}' is not authorized in this sector."
        )

    # Calling the container manager
    # Now returns a dict: {"container_id": ..., "port": ...} or (None, error_msg)
    result, error = container_manager.start_sub_room_container(user_id, domain, task_id)
    
    if error and not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Orchestration Failure: {error}"
        )
    
    # Success response
    return {
        "status": "success",
        "container_id": result["container_id"],
        "port": result["port"],
        "url": f"http://127.0.0.1:{result['port']}",
        "message": f"Node isolated and live on port {result['port']}",
        "warnings": error if error else None # Capture health-check timeouts
    }

@app.delete("/tasks/stop/{container_id}")
async def stop_task(container_id: str):
    """
    Terminates the environment and releases host resources.
    """
    success = container_manager.kill_sub_room(container_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Node not found or already terminated."
        )
    return {
        "status": "success", 
        "message": "Protocol environment successfully wiped."
    }

# --- 5. LOGGING & EVIDENCE (Coming Soon) ---

@app.get("/secure-data")
def read_secure_data():
    # Placeholder for the protected endpoint
    return {"message": "You are authorized.", "status": "Secure"}

