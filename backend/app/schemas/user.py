# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ========================================
# ROLE ENUM FOR VALIDATION
# ========================================

class RoleEnum(str, Enum):
    """Role enum for validation"""
    USER = "user"
    ADMIN = "admin"
    STAFF = "staff"
    MANAGER = "manager"


# ========================================
# BASE SCHEMAS
# ========================================

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)


# ========================================
# AUTHENTICATION SCHEMAS
# ========================================

class UserRegister(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6, max_length=100)
    
    @validator('name')
    def name_not_empty(cls, v):
        """Validate name is not empty or just spaces"""
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "password123"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str = Field(..., min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@test.com",
                "password": "admin123"
            }
        }


class UserResponse(UserBase):
    """Schema for user data in API responses"""
    id: int
    role: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Schema for user with hashed password"""
    hashed_password: str


# ========================================
# USER MANAGEMENT SCHEMAS
# ========================================

class UserCreate(BaseModel):
    """Schema for creating a new user (Admin only)"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(default="user")
    department: str = Field(default="Operations")
    status: str = Field(default="active")
    
    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['user', 'admin', 'manager', 'staff']
        v_lower = v.lower()
        if v_lower not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v_lower


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    
    @validator('name')
    def name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v
    
    @validator('role')
    def validate_role(cls, v):
        if v is not None:
            allowed_roles = ['user', 'admin', 'manager', 'staff']
            v_lower = v.lower()
            if v_lower not in allowed_roles:
                raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
            return v_lower
        return v
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['active', 'inactive']
            v_lower = v.lower()
            if v_lower not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
            return v_lower
        return v


class UserManagementResponse(BaseModel):
    """Response schema for user management"""
    id: int
    name: str
    email: EmailStr
    role: str
    department: str
    status: str
    lastLogin: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    """Schema for user statistics"""
    totalUsers: int
    activeUsers: int
    pendingApprovals: int
    newUsersThisMonth: int


# ========================================
# ✅ PAGINATION SCHEMA
# ========================================

class PaginatedUsersResponse(BaseModel):
    """Response model for paginated users list"""
    users: List[UserManagementResponse]
    total: int = Field(..., description="Total number of users matching filters")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Items per page")
    totalPages: int = Field(..., description="Total number of pages")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "users": [
                    {
                        "id": 1,
                        "name": "John Doe",
                        "email": "john@example.com",
                        "role": "admin",
                        "department": "IT",
                        "status": "Active",
                        "lastLogin": "2024-01-07 09:30 AM"
                    },
                    {
                        "id": 2,
                        "name": "Jane Smith",
                        "email": "jane@example.com",
                        "role": "manager",
                        "department": "Finance",
                        "status": "Active",
                        "lastLogin": "2024-01-06 03:15 PM"
                    }
                ],
                "total": 50,
                "page": 1,
                "limit": 10,
                "totalPages": 5
            }
        }


# ========================================
# UTILITY SCHEMAS
# ========================================

class PasswordChange(BaseModel):
    """Schema for changing password"""
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=100)
    
    @validator('new_password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class EmailVerification(BaseModel):
    """Schema for email verification"""
    email: EmailStr
    verification_code: str = Field(..., min_length=6, max_length=6)


class PasswordReset(BaseModel):
    """Schema for password reset"""
    email: EmailStr
    reset_token: str
    new_password: str = Field(..., min_length=6, max_length=100)