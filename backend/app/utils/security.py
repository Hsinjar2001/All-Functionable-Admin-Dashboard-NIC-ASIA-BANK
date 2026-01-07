# app/utils/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ========================================
# CONFIGURATION
# ========================================

# Get SECRET_KEY from environment
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

print(f"🔍 security.py loaded - SECRET_KEY: {SECRET_KEY[:15]}... (length: {len(SECRET_KEY)})")

# Password hashing context using Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ========================================
# PASSWORD FUNCTIONS
# ========================================

def hash_password(password: str) -> str:
    """
    Hash a password using Argon2 (original name)
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using Argon2 (alias for hash_password)
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return hash_password(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ========================================
# JWT TOKEN FUNCTIONS
# ========================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing token payload (usually user_id and email)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration to token payload
    to_encode.update({"exp": expire})
    
    print(f"\n🔑 Creating token for user_id={data.get('sub')}, email={data.get('email')}")
    print(f"   Using SECRET_KEY: {SECRET_KEY[:15]}...")
    print(f"   Token payload: {to_encode}")
    
    # Encode token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    print(f"   ✅ Token created: {encoded_jwt[:50]}...")
    
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload dictionary
        
    Raises:
        JWTError: If token is invalid or expired
    """
    print(f"\n🔓 Decoding token: {token[:50]}...")
    print(f"   Using SECRET_KEY: {SECRET_KEY[:15]}...")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"   ✅ Token decoded successfully!")
        print(f"   Payload: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        print(f"   ❌ Token expired")
        raise
    except jwt.JWTError as e:
        print(f"   ❌ Token decode error: {e}")
        raise