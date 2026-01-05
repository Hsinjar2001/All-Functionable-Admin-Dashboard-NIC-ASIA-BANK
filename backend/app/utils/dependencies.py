# app/utils/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.utils.security import decode_access_token

# HTTP Bearer security scheme
security = HTTPBearer()

# 🔍 DEBUG
print("🔍 dependencies.py loaded - HTTPBearer security scheme initialized")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
  
    # 🔍 DEBUG
    print(f"\n👤 get_current_user called")
    print(f"   Credentials: {credentials}")
    print(f"   Credentials type: {type(credentials)}")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Extract token from credentials
    token = credentials.credentials
    print(f"   Extracted token: {token[:50]}...")
    
    # Decode token (this will trigger debug prints in security.py)
    token_data = decode_access_token(token)
    
    print(f"   Token data result: {token_data}")
    
    if token_data is None or token_data.user_id is None:
        print("   ❌ Token data is None or missing user_id")
        raise credentials_exception
    
    print(f"   ✅ Token valid, looking for user_id={token_data.user_id}")
    
    # Get user from database
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    print(f"   User query result: {user}")
    
    if user is None:
        print("   ❌ User not found in database")
        raise credentials_exception
    
    # Check if user account is active
    if not user.is_active:
        print(f"   ❌ User account is inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    print(f"   ✅ User authenticated: {user.email}")
    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
 
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user