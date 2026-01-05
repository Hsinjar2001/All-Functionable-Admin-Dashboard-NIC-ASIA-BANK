# app/routers/auth.py
print("=" * 60)
print("🔍 LOADING app/routers/auth.py...")
print("=" * 60)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

print("✅ FastAPI imports loaded")

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.token import Token, LoginResponse, RegisterResponse
from app.utils.dependencies import get_current_user
from app.utils.security import create_access_token, verify_password, hash_password

print("✅ All app imports loaded")

# Create router
print("🔧 Creating router...")
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
print(f"✅ Router created: {router}")
print(f"✅ Router type: {type(router)}")
print("=" * 60)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Register a new user with email and password"
)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    print(f"\n📝 Register request for email: {user_data.email}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"   ❌ Email already registered: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,  # ✅ FIXED
        role=UserRole.USER,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"   ✅ User created successfully: {new_user.email} (ID: {new_user.id})")
    
    # Convert to response model
    user_response = UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role.value,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
        last_login=new_user.last_login
    )
    
    return RegisterResponse(
        success=True,
        message="User registered successfully",
        data=user_response
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="User login",
    description="Authenticate user and get access token"
)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):

    print(f"\n🔐 Login attempt for email: {credentials.email}")
    
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        print(f"   ❌ User not found: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"   ✅ User found: {user.email} (ID: {user.id})")
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):  # ✅ FIXED
        print(f"   ❌ Invalid password for user: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"   ✅ Password verified for user: {user.email}")
    
    # Check if account is active
    if not user.is_active:
        print(f"   ❌ Account inactive: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    print(f"   ✅ Last login updated for user: {user.email}")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    print(f"   ✅ Access token created for user: {user.email}")
    print(f"   Token: {access_token[:50]}...")
    
    # Convert to response model
    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login=user.last_login
    )
    
    token = Token(
        access_token=access_token,
        token_type="bearer"
    )
    
    return LoginResponse(
        success=True,
        message="Login successful",
        data=user_response,
        token=token
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get current authenticated user information"
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
   
    print(f"\n👤 Get current user info: {current_user.email}")
    
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role.value,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        last_login=current_user.last_login
    )


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update user profile",
    description="Update current user's profile information"
)
async def update_profile(
    name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    print(f"\n✏️ Update profile for user: {current_user.email}")
    
    current_user.name = name
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    print(f"   ✅ Profile updated: {current_user.name}")
    
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role.value,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        last_login=current_user.last_login
    )


@router.post(
    "/change-password",
    summary="Change password",
    description="Change current user's password"
)
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    print(f"\n🔑 Change password for user: {current_user.email}")
    
    # Verify old password
    if not verify_password(old_password, current_user.hashed_password):  # ✅ FIXED
        print(f"   ❌ Invalid old password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid old password"
        )
    
    # Update password
    current_user.hashed_password = hash_password(new_password)  # ✅ FIXED
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    print(f"   ✅ Password changed successfully")
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }


print("✅ All routes registered")
print("=" * 60)