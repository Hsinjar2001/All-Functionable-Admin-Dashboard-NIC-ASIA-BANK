# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime
import math
import logging
import sys

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

# ✅ VERIFY FILE IS LOADED
print("\n" + "="*70)
print("🎯 USERS.PY MODULE BEING LOADED!")
print(f"📁 File: {__file__}")
print("="*70 + "\n")
sys.stdout.flush()

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def require_admin(current_user: User):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

def require_admin_or_manager(current_user: User):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Manager access required")
    return current_user

def convert_role_to_enum(role_str: str) -> UserRole:
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
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value.lower(),
        "department": user.department or "N/A",
        "status": "Active" if user.is_active else "Inactive",
        "lastLogin": user.last_login.strftime("%Y-%m-%d %I:%M %p") if user.last_login else "Never",
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user statistics"""
    require_admin_or_manager(current_user)
    
    try:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        pending_approvals = db.query(User).filter(User.is_active == False).count()
        
        first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = db.query(User).filter(User.created_at >= first_day_of_month).count()
        
        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "pendingApprovals": pending_approvals,
            "newUsersThisMonth": new_users_this_month
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving statistics")


@router.get("/")
async def get_all_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated users list with WORKING PAGINATION"""
    
    # ✅ FORCED IMMEDIATE OUTPUT - MUST SHOW!
    sys.stdout.write("\n" + "="*70 + "\n")
    sys.stdout.write("🔥 GET /api/users/ ENDPOINT HIT!\n")
    sys.stdout.write("="*70 + "\n")
    sys.stdout.write(f"📄 Request by: {current_user.email} ({current_user.role.value})\n")
    sys.stdout.write(f"📄 Page: {page}, Limit: {limit}\n")
    sys.stdout.write(f"🔍 Search: {search}, Role: {role}, Status: {status}\n")
    sys.stdout.flush()  # Force immediate output
    
    require_admin_or_manager(current_user)
    
    try:
        # Build query
        query = db.query(User)
        
        # Apply search filter
        if search:
            pattern = f"%{search}%"
            query = query.filter(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
            sys.stdout.write(f"🔍 Search filter applied: {search}\n")
            sys.stdout.flush()
        
        # Apply role filter
        if role and role.lower() != "all":
            try:
                role_enum = convert_role_to_enum(role)
                query = query.filter(User.role == role_enum)
                sys.stdout.write(f"🏷️  Role filter applied: {role}\n")
                sys.stdout.flush()
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
        
        # Apply status filter
        if status and status.lower() != "all":
            is_active = status.lower() == "active"
            query = query.filter(User.is_active == is_active)
            sys.stdout.write(f"📊 Status filter applied: {status}\n")
            sys.stdout.flush()
        
        # GET TOTAL COUNT BEFORE PAGINATION
        total = query.count()
        sys.stdout.write(f"\n📊 TOTAL users matching filters: {total}\n")
        sys.stdout.flush()
        
        # CALCULATE PAGINATION
        total_pages = math.ceil(total / limit) if total > 0 else 1
        skip = (page - 1) * limit
        
        sys.stdout.write(f"📄 Pagination:\n")
        sys.stdout.write(f"  - Total pages: {total_pages}\n")
        sys.stdout.write(f"  - Skip (offset): {skip}\n")
        sys.stdout.write(f"  - Limit: {limit}\n")
        sys.stdout.flush()
        
        # Validate page number
        if page > total_pages and total > 0:
            sys.stdout.write(f"❌ Invalid page: {page} exceeds {total_pages}\n")
            sys.stdout.flush()
            raise HTTPException(status_code=400, detail=f"Page {page} exceeds total pages {total_pages}")
        
        # APPLY PAGINATION - THIS IS THE KEY!
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        
        sys.stdout.write(f"\n✅ Query executed:\n")
        sys.stdout.write(f"  - Retrieved: {len(users)} users from database\n")
        sys.stdout.write(f"  - Expected: {min(limit, max(0, total - skip))} users\n")
        sys.stdout.flush()
        
        # Format users
        users_data = [format_user_response(u) for u in users]
        
        # BUILD PAGINATED RESPONSE OBJECT
        response = {
            "users": users_data,
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages,
            "hasMore": page < total_pages
        }
        
        sys.stdout.write(f"\n📤 RESPONSE:\n")
        sys.stdout.write(f"  - users: {len(users_data)} items\n")
        sys.stdout.write(f"  - total: {total}\n")
        sys.stdout.write(f"  - page: {page}/{total_pages}\n")
        sys.stdout.write(f"  - hasMore: {response['hasMore']}\n")
        sys.stdout.write("="*70 + "\n\n")
        sys.stdout.flush()
        
        # RETURN PAGINATED OBJECT (NOT ARRAY!)
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        sys.stdout.write(f"❌ ERROR: {e}\n\n")
        sys.stdout.flush()
        logger.error(f"Error getting users: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new user (Admin only)"""
    require_admin(current_user)
    
    try:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            role=convert_role_to_enum(user_data.role),
            department=user_data.department,
            is_active=user_data.status.lower() == "active"
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "success": True,
            "message": "User created successfully",
            "data": format_user_response(new_user)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Error creating user")


@router.get("/{user_id}", response_model=UserManagementResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single user by ID"""
    require_admin_or_manager(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return format_user_response(user)


@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_self = (current_user.id == user_id)
        is_admin = (current_user.role == UserRole.ADMIN)
        
        if not is_admin and not is_self:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if is_self and user_data.role and not is_admin:
            raise HTTPException(status_code=403, detail="Cannot update your own role")
        
        if user_data.name:
            user.name = user_data.name
        
        if user_data.email:
            if user_data.email != user.email:
                existing = db.query(User).filter(
                    User.email == user_data.email, 
                    User.id != user_id
                ).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Email already exists")
            user.email = user_data.email
        
        if user_data.password:
            user.hashed_password = get_password_hash(user_data.password)
        
        if is_admin:
            if user_data.role:
                user.role = convert_role_to_enum(user_data.role)
            if user_data.department:
                user.department = user_data.department
            if user_data.status:
                user.is_active = user_data.status.lower() == "active"
        
        user.updated_at = datetime.now()
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "message": "User updated successfully",
            "data": format_user_response(user)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail="Error updating user")


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete user (Admin only)"""
    require_admin(current_user)
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
        db.delete(user)
        db.commit()
        
        return {
            "success": True,
            "message": "User deleted successfully",
            "data": {"id": user_id}
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Error deleting user")