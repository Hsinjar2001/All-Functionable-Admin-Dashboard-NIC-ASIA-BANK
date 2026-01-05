# app/utils/security.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.schemas.token import TokenData

# Use Argon2 instead of bcrypt
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# 🔍 DEBUG: Print SECRET_KEY on module load
print(f"🔍 security.py loaded - SECRET_KEY: {settings.SECRET_KEY[:15]}... (length: {len(settings.SECRET_KEY)})")


def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing user data (must include 'sub' for user_id)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    # 🔥 FIX: Convert 'sub' to string (JWT standard requires subject as string)
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    
    # 🔍 DEBUG: Print token creation info
    print(f"\n🔑 Creating token for user_id={data.get('sub')}, email={data.get('email')}")
    print(f"   Using SECRET_KEY: {settings.SECRET_KEY[:15]}...")
    print(f"   Token payload: {to_encode}")
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    
    print(f"   Token created: {encoded_jwt[:50]}...")
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        TokenData if valid, None if invalid
    """
    try:
        # 🔍 DEBUG: Print decode attempt
        print(f"\n🔓 Decoding token: {token[:50]}...")
        print(f"   Using SECRET_KEY: {settings.SECRET_KEY[:15]}...")
        
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        
        print(f"   ✅ Token decoded successfully!")
        print(f"   📦 Payload: {payload}")
        
        # Extract user_id from 'sub' claim (standard JWT claim)
        sub = payload.get("sub")
        email = payload.get("email")
        
        if sub is None:
            print(f"   ❌ No 'sub' in payload")
            return None
        
        # Convert sub to integer (user_id)
        # Now 'sub' should be a string like "9", convert it to int
        try:
            user_id = int(sub)
            print(f"   ✅ User ID from token: {user_id}")
        except (TypeError, ValueError) as e:
            print(f"   ❌ Cannot convert sub to int: {sub}, error: {e}")
            return None
        
        token_data = TokenData(user_id=user_id, email=email)
        print(f"   ✅ TokenData created: user_id={user_id}, email={email}")
        
        return token_data
        
    except JWTError as e:
        # Token is invalid (expired, wrong signature, malformed, etc.)
        print(f"   ❌ JWT Error: {type(e).__name__}: {e}")
        return None