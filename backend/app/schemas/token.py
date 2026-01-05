# backend/app/schemas/token.py
from pydantic import BaseModel
from typing import Optional, Any
from app.schemas.user import UserResponse  # ✅ IMPORTANT IMPORT

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }

class TokenData(BaseModel):
    """Data stored in JWT token"""
    user_id: Optional[int] = None
    email: Optional[str] = None

class RegisterResponse(BaseModel):
    """Response after successful registration"""
    success: bool = True
    message: str
    data: UserResponse  # ✅ CHANGED FROM dict TO UserResponse
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "User registered successfully",
                "data": {
                    "id": 1,
                    "name": "Rajnish Kumar",
                    "email": "rajnish@example.com",
                    "role": "user",
                    "is_active": True,
                    "created_at": "2024-01-05T12:00:00Z",
                    "updated_at": "2024-01-05T12:00:00Z",
                    "last_login": None
                }
            }
        }

class LoginResponse(BaseModel):
    """Response after successful login"""
    success: bool = True
    message: str
    data: UserResponse  # ✅ CHANGED FROM dict TO UserResponse
    token: Token
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Login successful",
                "data": {
                    "id": 1,
                    "name": "Rajnish Kumar",
                    "email": "rajnish@example.com",
                    "role": "user",
                    "is_active": True,
                    "created_at": "2024-01-05T12:00:00Z",
                    "updated_at": "2024-01-05T12:00:00Z",
                    "last_login": "2024-01-05T12:30:00Z"
                },
                "token": {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer"
                }
            }
        }

class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = False
    message: str
    detail: Optional[Any] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "message": "An error occurred",
                "detail": "Error details here"
            }
        }

class PasswordChangeRequest(BaseModel):
    """Password change request schema"""
    old_password: str
    new_password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "OldPassword123",
                "new_password": "NewPassword456"
            }
        }

class PasswordChangeResponse(BaseModel):
    """Password change response schema"""
    success: bool
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Password changed successfully"
            }
        }