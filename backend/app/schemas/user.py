from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

# Base user schema
class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)

# Registration schema
class UserRegister(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Validate that passwords match"""
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('name')
    def name_not_empty(cls, v):
        """Validate name is not empty or just spaces"""
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

# Login schema
class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str = Field(..., min_length=1)

# User response schema
class UserResponse(UserBase):
    """Schema for user data in API responses"""
    id: int
    role: UserRole
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows SQLAlchemy models to be converted

# User in database (includes password)
class UserInDB(UserResponse):
    """Schema for user with hashed password"""
    hashed_password: str