# fix_admin_password.py
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User  # ✅ CORRECT: from app.models.user
from app.utils.security import get_password_hash  # ✅ CORRECT: get_password_hash
from app.config import settings

def fix_admin_password():
    print("🔧 Starting password fix...")
    
    # Create database session
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Find admin user
        admin = db.query(User).filter(User.email == "admin@test.com").first()
        
        if admin:
            print(f"✅ Found admin: {admin.name} (ID: {admin.id})")
            print(f"📝 Current hash (first 50 chars): {admin.hashed_password[:50] if len(admin.hashed_password) > 50 else admin.hashed_password}...")
            
            # Check if already hashed
            if admin.hashed_password.startswith("$2b$"):
                print("⚠️  Password is already hashed!")
                print("   If you can't login, try resetting anyway...")
                response = input("Reset password anyway? (yes/no): ")
                if response.lower() != "yes":
                    print("❌ Cancelled")
                    return
            
            # Hash the password properly with bcrypt
            new_hash = get_password_hash("admin123")
            admin.hashed_password = new_hash
            
            # Save to database
            db.commit()
            
            print(f"\n📝 New hash (first 50 chars): {new_hash[:50]}...")
            print("✅ Password fixed successfully!")
            print("\n🎉 You can now login with:")
            print("   Email: admin@test.com")
            print("   Password: admin123")
            print("\n🔍 Verifying the fix...")
            
            # Verify it works
            from app.utils.security import verify_password
            if verify_password("admin123", new_hash):
                print("✅ Password verification: SUCCESS!")
            else:
                print("❌ Password verification: FAILED!")
                
        else:
            print("❌ Admin user not found!")
            print("\n💡 Creating new admin user...")
            create_admin_user(db)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def create_admin_user(db):
    """Create a new admin user if none exists"""
    from app.models.user import UserRole
    from app.utils.security import get_password_hash
    
    try:
        admin = User(
            name="Admin User",
            email="admin@test.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            department="IT",
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Created new admin user (ID: {admin.id})")
        print("\n🎉 Login credentials:")
        print("   Email: admin@test.com")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()

if __name__ == "__main__":
    fix_admin_password()