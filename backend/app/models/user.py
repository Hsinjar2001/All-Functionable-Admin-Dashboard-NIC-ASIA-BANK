# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enum - VALUES MUST MATCH DATABASE ENUM"""
    USER = "USER"        # Database has uppercase
    ADMIN = "ADMIN"      # Database has uppercase
    MANAGER = "MANAGER"  # Database has uppercase
    STAFF = "STAFF"      # Database has uppercase


class User(Base):
    """User database model"""
    __tablename__ = "users"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # User info
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Role and status
    role = Column(SQLEnum(UserRole, name='userrole'), default=UserRole.USER, nullable=False)
    department = Column(String(100), default="Operations", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"