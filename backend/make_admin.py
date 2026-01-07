# make_admin.py
"""
Script to make a user an admin
Usage: python make_admin.py
"""

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import from your app
from app.config import settings
from app.models.user import User, UserRole

def make_user_admin(email: str):
    """Make a user an admin by email"""
    
    print(f"\n🔧 Making user admin...")
    print(f"   Email: {email}")
    print(f"   Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'PostgreSQL'}")
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"\n❌ User not found: {email}")
            print(f"   Please check the email address.")
            return False
        
        # Show current user info
        print(f"\n📋 Current user info:")
        print(f"   ID: {user.id}")
        print(f"   Name: {user.name}")
        print(f"   Email: {user.email}")
        print(f"   Current Role: {user.role.value}")
        print(f"   Active: {user.is_active}")
        
        # Check if already admin
        if user.role == UserRole.ADMIN:
            print(f"\n✅ User is already an ADMIN")
            return True
        
        # Update to admin
        old_role = user.role.value
        user.role = UserRole.ADMIN
        db.commit()
        
        print(f"\n✅ SUCCESS! User role updated")
        print(f"   Old Role: {old_role}")
        print(f"   New Role: {user.role.value}")
        print(f"\n🎉 {user.name} is now an ADMIN!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()


def list_all_users():
    """List all users in database"""
    
    print(f"\n👥 Listing all users...")
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        
        if not users:
            print("   No users found in database")
            return
        
        print(f"\n{'ID':<5} {'Name':<20} {'Email':<30} {'Role':<10} {'Active'}")
        print("-" * 80)
        
        for user in users:
            print(f"{user.id:<5} {user.name:<20} {user.email:<30} {user.role.value:<10} {user.is_active}")
        
        print(f"\nTotal users: {len(users)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*80)
    print("                    MAKE USER ADMIN SCRIPT")
    print("="*80)
    
    # Change this email to the user you want to make admin
    EMAIL_TO_MAKE_ADMIN = "rajakumarsaphi@example.com"
    
    # Option 1: Make specific user admin
    success = make_user_admin(EMAIL_TO_MAKE_ADMIN)
    
    # Option 2: List all users (uncomment to see all users)
    # list_all_users()
    
    print("\n" + "="*80)
    
    if success:
        print("✅ Done! You can now login with admin privileges.")
        print("   Login at: http://localhost:8000/docs")
        sys.exit(0)
    else:
        print("❌ Failed to make user admin")
        sys.exit(1)