# app/services/user_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserManagementResponse
from app.utils.security import hash_password


class UserService:
    """Service class for user management operations"""
    
    @staticmethod
    def get_user_stats(db: Session) -> dict:
        """
        Get user statistics for dashboard
        
        Returns:
            dict: Statistics including total users, active users, etc.
        """
        # Total users
        total_users = db.query(User).count()
        
        # Active users
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # New users this month
        first_day_of_month = datetime.now().replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        new_users_this_month = db.query(User).filter(
            User.created_at >= first_day_of_month
        ).count()
        
        # Pending approvals (placeholder - implement your logic)
        pending_approvals = 2
        
        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "pendingApprovals": pending_approvals,
            "newUsersThisMonth": new_users_this_month
        }
    
    @staticmethod
    def get_all_users(
        db: Session,
        search: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[User]:
        """
        Get all users with optional filters
        
        Args:
            db: Database session
            search: Search term for name or email
            role: Filter by role
            status: Filter by status (active/inactive)
            
        Returns:
            List[User]: List of users matching the criteria
        """
        query = db.query(User)
        
        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (User.name.ilike(search_pattern)) | 
                (User.email.ilike(search_pattern))
            )
        
        # Apply role filter
        if role and role.lower() != "all":
            query = query.filter(User.role == role.lower())
        
        # Apply status filter
        if status and status.lower() != "all":
            is_active = (status.lower() == "active")
            query = query.filter(User.is_active == is_active)
        
        # Order by creation date (newest first)
        users = query.order_by(User.created_at.desc()).all()
        
        return users
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Get user by ID
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User or None
        """
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User or None
        """
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user
        
        Args:
            db: Database session
            user_data: User creation data
            
        Returns:
            User: Created user
            
        Raises:
            ValueError: If email already exists
        """
        # Check if email exists
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
        
        # Map role string to UserRole enum
        role_mapping = {
            "user": UserRole.USER,
            "admin": UserRole.ADMIN,
            "manager": UserRole.MANAGER,
            "staff": UserRole.STAFF
        }
        
        # Create new user
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            role=role_mapping.get(user_data.role.lower(), UserRole.USER),
            department=user_data.department,
            is_active=(user_data.status.lower() == "active"),
            created_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    
    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        user_data: UserUpdate,
        is_admin: bool = False
    ) -> Optional[User]:
        """
        Update user information
        
        Args:
            db: Database session
            user_id: User ID to update
            user_data: Update data
            is_admin: Whether the requester is admin
            
        Returns:
            User or None
            
        Raises:
            ValueError: If email already exists or unauthorized
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        
        # Map role string to UserRole enum
        role_mapping = {
            "user": UserRole.USER,
            "admin": UserRole.ADMIN,
            "manager": UserRole.MANAGER,
            "staff": UserRole.STAFF
        }
        
        for field, value in update_data.items():
            if field == "password":
                user.hashed_password = hash_password(value)
            elif field == "status":
                if not is_admin:
                    raise ValueError("Only admin can change status")
                user.is_active = (value.lower() == "active")
            elif field == "role":
                if not is_admin:
                    raise ValueError("Only admin can change role")
                user.role = role_mapping.get(value.lower(), UserRole.USER)
            elif field == "email":
                # Check if new email exists
                existing = db.query(User).filter(
                    User.email == value,
                    User.id != user_id
                ).first()
                if existing:
                    raise ValueError("Email already exists")
                user.email = value
            else:
                setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int, current_user_id: int) -> bool:
        """
        Delete a user
        
        Args:
            db: Database session
            user_id: User ID to delete
            current_user_id: ID of user making the request
            
        Returns:
            bool: True if deleted, False otherwise
            
        Raises:
            ValueError: If trying to delete self
        """
        # Prevent self-deletion
        if user_id == current_user_id:
            raise ValueError("You cannot delete your own account")
        
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        
        return True
    
    @staticmethod
    def format_user_response(user: User) -> dict:
        """
        Format user object for API response
        
        Args:
            user: User object
            
        Returns:
            dict: Formatted user data
        """
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,  # Convert enum to string
            "department": user.department,
            "status": "Active" if user.is_active else "Inactive",
            "lastLogin": user.last_login.strftime("%Y-%m-%d %I:%M %p") if user.last_login else "Never"
        }