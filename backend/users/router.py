from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from users import models, schemas, utils

router = APIRouter(prefix="/users", tags=["Users"])

# 1. REGISTER
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create User
    otp = utils.generate_otp()
    hashed_pw = utils.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw, otp_code=otp, is_verified=False)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    utils.send_email_otp(user.email, otp, "Account Verification")
    return {"message": "User created. OTP sent to console/email."}

# 2. VERIFY EMAIL
@router.post("/verify")
def verify_email(data: schemas.UserVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user.is_verified = True
    user.otp_code = None # Clear OTP
    db.commit()
    return {"message": "Account verified!"}

# 3. LOGIN
@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    
    if not user or not utils.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    
    token = utils.create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# 4. FORGOT PASSWORD (Request OTP)
@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp = utils.generate_otp()
    user.otp_code = otp
    db.commit()
    
    utils.send_email_otp(user.email, otp, "Password Reset")
    return {"message": "OTP sent for password reset."}

# 5. RESET PASSWORD (New Password)
@router.post("/reset-password")
def reset_password(data: schemas.ResetPassword, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    if not user or user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user.hashed_password = utils.get_password_hash(data.new_password)
    user.otp_code = None
    db.commit()
    
    return {"message": "Password updated successfully!"}