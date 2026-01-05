from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
from app.utils.security import hash_password, verify_password, create_access_token

class AuthService:
    """Authentication service with business logic"""
    
    @staticmethod
    def register_user(user_data: UserRegister, db: Session) -> User:
        """
        Register a new user
        
        Args:
            user_data: User registration data
            db: Database session
            
        Returns:
            Created user object
            
        Raises:
            HTTPException: If user already exists
        """
        # Check if user with this email already exists
        existing_user = db.query(User).filter(
            User.email == user_data.email
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create new user with hashed password
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hash_password(user_data.password)
        )
        
        # Add to database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    
    @staticmethod
    def login_user(login_data: UserLogin, db: Session) -> dict:
        """
        Authenticate user and generate access token
        
        Args:
            login_data: User login credentials
            db: Database session
            
        Returns:
            Dict with user info and access token
            
        Raises:
            HTTPException: If credentials are invalid or account is inactive
        """
        # Get user by email
        user = db.query(User).filter(
            User.email == login_data.email
        ).first()
        
        # Check if user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": user.id,  # 'sub' is standard JWT claim for subject
                "email": user.email
            }
        )
        
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "last_login": user.last_login
            },
            "token": access_token
        }
    
    @staticmethod
    def get_user_by_id(user_id: int, db: Session) -> User:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            User object
            
        Raises:
            HTTPException: If user not found
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    @staticmethod
    def get_user_by_email(email: str, db: Session) -> User:
        """
        Get user by email
        
        Args:
            email: User email
            db: Database session
            
        Returns:
            User object
            
        Raises:
            HTTPException: If user not found
        """
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user