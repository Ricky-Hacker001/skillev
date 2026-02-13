from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import random

# CONFIGURATION
SECRET_KEY = "hackathon_secret_key" # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Hashing ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- JWT Token ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- OTP Logic ---
def generate_otp():
    return str(random.randint(100000, 999999))

def send_email_otp(email: str, otp: str, type: str = "Verification"):
    # ⚠️ HACKATHON MODE: We print to console instead of using SMTP
    print(f"\n{'='*30}")
    print(f"📧 [MOCK EMAIL] To: {email}")
    print(f"🔑 Subject: {type} Code")
    print(f"🔢 OTP: {otp}")
    print(f"{'='*30}\n")