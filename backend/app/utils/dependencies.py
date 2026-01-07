# app/utils/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError

from app.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token

# Security scheme
security = HTTPBearer()

print("🔍 dependencies.py loaded - HTTPBearer security scheme initialized")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    print(f"\n👤 get_current_user called")
    print(f"   Credentials: {credentials}")
    print(f"   Credentials type: {type(credentials)}")
    
    # Extract token
    token = credentials.credentials
    print(f"   Extracted token: {token[:50]}...")
    
    try:
        # Decode token
        token_data = decode_access_token(token)
        print(f"   Token data result: {token_data}")
        
        # Check if token data is valid
        if token_data is None or token_data.get('sub') is None:
            print(f"   ❌ Invalid token data: {token_data}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user ID from token (sub is the user_id as string)
        user_id = int(token_data.get('sub'))
        print(f"   User ID from token: {user_id}")
        
    except JWTError as e:
        print(f"   ❌ JWT Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        print(f"   ❌ Value Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        print(f"   ❌ User not found in database: ID={user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        print(f"   ❌ User account is inactive: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    print(f"   ✅ User authenticated: {user.email} (ID: {user.id}, Role: {user.role.value})")
    
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Require admin role
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current user if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    from app.models.user import UserRole
    
    if current_user.role != UserRole.ADMIN:
        print(f"   ❌ Admin access denied for user: {current_user.email} (Role: {current_user.role.value})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    print(f"   ✅ Admin access granted: {current_user.email}")
    return current_user