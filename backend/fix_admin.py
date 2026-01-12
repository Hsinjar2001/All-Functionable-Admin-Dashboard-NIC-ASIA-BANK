# backend/fix_admin.py
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils.security import get_password_hash

def fix_admin():
    db = SessionLocal()
    
    try:
        print("\n" + "="*70)
        print("🔧 FIXING ADMIN USER")
        print("="*70)
        
        # Delete ALL users
        deleted = db.query(User).delete()
        db.commit()
        print(f"✅ Deleted {deleted} existing users")
        
        # Create fresh admin user with PROPER hash
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
        
        print("\n✅ ADMIN USER CREATED!")
        print("="*70)
        print(f"📧 Email: admin@test.com")
        print(f"🔑 Password: admin123")
        print(f"👤 Name: {admin.name}")
        print(f"🆔 ID: {admin.id}")
        print(f"🏷️  Role: {admin.role.value}")
        print(f"🔐 Hash: {admin.hashed_password[:50]}...")
        print(f"🔐 Full Hash: {admin.hashed_password}")
        print(f"✅ Active: {admin.is_active}")
        print("="*70 + "\n")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin()