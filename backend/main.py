from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

# Internal Imports
import models 
import users.utils as utils
from database import engine, Base, get_db
from users import router as user_router
from users.utils import SECRET_KEY, ALGORITHM
import container_manager 

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skillev API")

# Setup OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# --- 1. CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. AUTHENTICATION DEPENDENCY ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- 3. ROUTER REGISTRATION ---
app.include_router(user_router.router)

# --- 4. CORE ROUTES ---

@app.get("/")
def root():
    return {
        "message": "Skillev Protocol API is running!", 
        "engine": "Docker-Orchestrator-v1",
        "status": "Online"
    }

# --- 5. DYNAMIC TASK EXECUTION ---

@app.post("/tasks/start/{domain}/{task_id}")
async def start_task(
    domain: str, 
    task_id: str, 
    request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mode = request.query_params.get("mode", "hiring").lower()
    
    valid_domains = ["cybersecurity", "fullstack"]
    if domain not in valid_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Domain '{domain}' is not authorized."
        )

    # Force kill any existing isolated container for this specific mode/user
    container_manager.cleanup_existing_task(current_user.id, task_id, mode)

    # Start fresh container with mode isolation
    result, error = container_manager.start_sub_room_container(
        user_id=current_user.id, 
        domain=domain, 
        task_id=task_id, 
        mode=mode
    )
    
    if error and not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Orchestration Failure: {error}"
        )
    
    return {
        "status": "success",
        "container_id": result["container_id"],
        "port": result["port"],
        "mode": mode,
        "url": f"http://127.0.0.1:{result['port']}?mode={mode}",
        "message": f"Protocol initialized in {mode} mode"
    }

@app.delete("/tasks/stop/{container_id}")
async def stop_task(
    container_id: str, 
    current_user = Depends(get_current_user)
):
    success = container_manager.kill_sub_room(container_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Node not found or already terminated."
        )
    return {"status": "success", "message": "Environment wiped."}

# --- 6. ANTI-CHEAT: BIOMETRIC SYNC ---

@app.post("/users/sync-typing-profile")
async def sync_typing_profile(
    request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = await request.json()
    keystrokes = data.get("keystrokes", [])
    report_id = data.get("report_id")
    mode = data.get("mode")

    if not report_id or not keystrokes:
        return {"status": "skipped", "reason": "Insufficient data"}

    # 1. Analyze the current behavior
    metrics = utils.analyze_typing_behavior(keystrokes)
    
    # 2. Find the report to attach metrics to
    report = db.query(models.EvidenceReport).filter(models.EvidenceReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if mode == "learning":
        # Store baseline for the user
        current_user.typing_profile = metrics
        report.integrity_score = 1.0 # Baseline is always perfect
        report.identity_verified = True
    else:
        # Cross-verify against the baseline stored in the User object
        verified, score = utils.verify_identity_match(current_user.typing_profile, metrics)
        report.identity_verified = verified
        report.integrity_score = score

    db.commit()
    return {
        "status": "verified", 
        "integrity": report.integrity_score, 
        "match": report.identity_verified
    }

# --- 7. EVIDENCE ROUTES ---

@app.get("/users/my-evidence")
def get_my_evidence(
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    reports = db.query(models.EvidenceReport)\
                .filter(models.EvidenceReport.user_id == current_user.id)\
                .order_by(models.EvidenceReport.created_at.desc())\
                .all()
    return reports

@app.get("/evidence/task-history/{task_id}")
def get_task_history(
    task_id: str, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    reports = db.query(models.EvidenceReport)\
                .filter(models.EvidenceReport.user_id == current_user.id)\
                .filter(models.EvidenceReport.task_id == task_id)\
                .order_by(models.EvidenceReport.mode.desc(), models.EvidenceReport.created_at.asc())\
                .all()
    
    if not reports:
        raise HTTPException(status_code=404, detail="No history found for this task.")
    
    return reports

@app.get("/evidence/public/{report_id}")
def get_public_evidence(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.EvidenceReport).filter(models.EvidenceReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Evidence Protocol not found.")
    
    return {
        "report_id": report.id,
        "status": report.status,
        "task": report.task_id,
        "mode": report.mode,
        "integrity_score": report.integrity_score,
        "identity_verified": report.identity_verified,
        "full_timeline": report.logs
    }

@app.post("/users/sync-typing-profile")
async def sync_typing_profile(
    request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = await request.json()
    report_id = data.get("report_id")
    keystrokes = data.get("keystrokes", [])
    violations = data.get("focus_violations", [])
    mode = data.get("mode")

    if not report_id:
        raise HTTPException(status_code=400, detail="Report ID is required.")

    # 1. Fetch the specific report and refresh to get latest logs from Evidence Engine
    report = db.query(models.EvidenceReport).filter(models.EvidenceReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Evidence Protocol not found.")
    
    db.refresh(report)

    # 2. Analyze Typing Biometrics
    metrics = utils.analyze_typing_behavior(keystrokes)
    
    # 3. Process Violations & Update Log Timeline
    updated_logs = list(report.logs) if report.logs else []
    
    # We use a set of timestamps to prevent duplicate violation entries
    existing_timestamps = {l.get("timestamp") for l in updated_logs if l.get("type") == "security_alert"}

    for v in violations:
        if v["time"] not in existing_timestamps:
            updated_logs.append({
                "timestamp": v["time"],
                "type": "security_alert",
                "message": "EVIDENCE_LOG: Integrity_Violation - Browser tab focus lost. External research suspected."
            })
    
    report.logs = updated_logs

    # 4. Identity & Integrity Scoring
    if mode == "learning":
        # Learning mode establishes the baseline; score is always 100%
        current_user.typing_profile = metrics
        report.integrity_score = 1.0
        report.identity_verified = True
    else:
        # Hiring mode performs cross-verification
        is_match, base_score = utils.verify_identity_match(current_user.typing_profile, metrics)
        
        # PENALTY LOGIC:
        # - Deduct 10% (0.10) for every focus violation (tab switch)
        # - Deduct 50% (0.50) if biometric identity does not match
        focus_penalty = len(violations) * 0.10
        identity_penalty = 0.0 if is_match else 0.50
        
        final_score = max(0.0, base_score - focus_penalty - identity_penalty)
        
        report.identity_verified = is_match
        report.integrity_score = round(final_score, 2)

    db.commit()
    
    return {
        "status": "sealed",
        "integrity": report.integrity_score,
        "violations_detected": len(violations),
        "identity_match": report.identity_verified
    }