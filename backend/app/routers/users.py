# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserManagementResponse,
    UserStatsResponse
)
from app.utils.dependencies import get_current_user
from app.utils.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)


# ========================================
# HELPER FUNCTIONS
# ========================================

def require_admin(current_user: User):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can perform this action"
        )
    return current_user


def require_admin_or_manager(current_user: User):
    """Require admin or manager role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or manager can perform this action"
        )
    return current_user


def convert_role_to_enum(role_str: str) -> UserRole:
    """
    Convert lowercase role string to UserRole enum
    Input: "user", "admin", "staff", "manager" (lowercase)
    Output: UserRole.USER, UserRole.ADMIN, etc. (uppercase enum)
    """
    role_mapping = {
        "user": UserRole.USER,
        "admin": UserRole.ADMIN,
        "staff": UserRole.STAFF,
        "manager": UserRole.MANAGER
    }
    role_lower = role_str.lower()
    if role_lower not in role_mapping:
        raise ValueError(f"Invalid role: {role_str}")
    return role_mapping[role_lower]


def format_user_response(user: User) -> dict:
    """Format user object for API response"""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value.lower(),  # Convert "USER" to "user"
        "department": user.department or "N/A",
        "status": "Active" if user.is_active else "Inactive",
        "lastLogin": user.last_login.strftime("%Y-%m-%d %I:%M %p") if user.last_login else "Never"
    }


# ========================================
# ENDPOINTS
# ========================================

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user statistics for dashboard
    
    Returns:
    - Total users count
    - Active users count
    - Pending approvals (inactive users)
    - New users this month
    """
    logger.info(f"📊 Getting stats for user: {current_user.email}")
    
    # Check permission
    require_admin_or_manager(current_user)
    
    try:
        # Total users
        total_users = db.query(User).count()
        
        # Active users
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # Pending approvals (inactive users)
        pending_approvals = db.query(User).filter(User.is_active == False).count()
        
        # New users this month
        first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = db.query(User).filter(
            User.created_at >= first_day_of_month
        ).count()
        
        stats = {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "pendingApprovals": pending_approvals,
            "newUsersThisMonth": new_users_this_month
        }
        
        logger.info(f"✅ Stats retrieved: {stats}")
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving statistics"
        )


@router.get("/", response_model=List[UserManagementResponse])
async def get_all_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all users with optional filters
    
    Requires: Admin or Manager role
    
    Query Parameters:
    - search: Search term for name or email
    - role: Filter by role (user, admin, staff, manager)
    - status: Filter by status (active, inactive)
    """
    logger.info(f"📋 Getting all users - Requested by: {current_user.email}")
    
    # Check permission
    require_admin_or_manager(current_user)
    
    try:
        # Build query
        query = db.query(User)
        
        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (User.name.ilike(search_pattern)) | 
                (User.email.ilike(search_pattern))
            )
        
        # Apply role filter
        if role:
            try:
                role_enum = convert_role_to_enum(role)
                query = query.filter(User.role == role_enum)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid role: {role}. Must be: user, admin, staff, manager"
                )
        
        # Apply status filter
        if status:
            if status.lower() == "active":
                query = query.filter(User.is_active == True)
            elif status.lower() == "inactive":
                query = query.filter(User.is_active == False)
        
        # Execute query
        users = query.order_by(User.created_at.desc()).all()
        
        logger.info(f"✅ Found {len(users)} users")
        
        # Format and return
        return [format_user_response(user) for user in users]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving users"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new user
    
    Requires: Admin role
    """
    logger.info(f"➕ Creating new user: {user_data.email}")
    
    # Check permission
    require_admin(current_user)
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.warning(f"⚠️ Email already registered: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Convert role string to enum
        role_enum = convert_role_to_enum(user_data.role)
        
        # Create new user
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=role_enum,
            department=user_data.department,
            is_active=user_data.status.lower() == "active"
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"✅ User created: ID={new_user.id}")
        
        return {
            "success": True,
            "message": "User created successfully",
            "data": format_user_response(new_user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )


@router.get("/{user_id}", response_model=UserManagementResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a single user by ID
    
    Requires: Admin or Manager role
    """
    logger.info(f"🔍 Getting user ID: {user_id}")
    
    # Check permission
    require_admin_or_manager(current_user)
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            logger.warning(f"❌ User not found: ID={user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"✅ User found: ID={user_id}")
        return format_user_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user"
        )


@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user information
    
    Permissions:
    - Users can update their own profile (limited fields: name, email, password)
    - Admins can update any user (all fields including role, department, status)
    """
    logger.info(f"✏️ Updating user ID: {user_id}")
    
    try:
        # Get the user to update
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"❌ User not found: ID={user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        is_self = (current_user.id == user_id)
        is_admin = (current_user.role == UserRole.ADMIN)
        
        if not is_admin and not is_self:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this user"
            )
        
        # Prevent users from updating their own role
        if is_self and user_data.role and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update your own role"
            )
        
        # Check email uniqueness if updating email
        if user_data.email and user_data.email != user.email:
            existing = db.query(User).filter(
                User.email == user_data.email,
                User.id != user_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Update fields
        if user_data.name:
            user.name = user_data.name
        
        if user_data.email:
            user.email = user_data.email
        
        if user_data.password:
            user.hashed_password = get_password_hash(user_data.password)
        
        # Admin-only fields
        if is_admin:
            if user_data.role:
                user.role = convert_role_to_enum(user_data.role)
            
            if user_data.department:
                user.department = user_data.department
            
            if user_data.status:
                user.is_active = user_data.status.lower() == "active"
        
        # Commit changes
        db.commit()
        db.refresh(user)
        
        logger.info(f"✅ User updated successfully: ID={user_id}")
        
        return {
            "success": True,
            "message": "User updated successfully",
            "data": format_user_response(user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user
    
    Requires: Admin role
    
    Restrictions:
    - Cannot delete your own account
    """
    logger.info(f"🗑️ Deleting user ID: {user_id}")
    
    # Check permission
    require_admin(current_user)
    
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"❌ User not found: ID={user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent self-deletion
        if user.id == current_user.id:
            logger.warning(f"⚠️ User tried to delete own account")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Delete user
        db.delete(user)
        db.commit()
        
        logger.info(f"✅ User deleted successfully: ID={user_id}")
        
        return {
            "success": True,
            "message": "User deleted successfully",
            "data": {"id": user_id}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting user"
        )