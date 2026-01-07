from app.utils.security import hash_password
from app.database import get_db
from app.models import User

def fix_admin_password():
    print("🔧 Starting password fix...")
    
    db = next(get_db())
    
    try:
        # Find admin user
        admin = db.query(User).filter(User.email == "admin@test.com").first()
        
        if admin:
            print(f"✅ Found admin: {admin.name} (ID: {admin.id})")
            print(f"📝 Old hash (first 50 chars): {admin.hashed_password[:50]}...")
            
            # Hash the password properly
            new_hash = hash_password("admin123")
            admin.hashed_password = new_hash
            
            # Save to database
            db.commit()
            
            print(f"📝 New hash (first 50 chars): {new_hash[:50]}...")
            print("✅ Password fixed successfully!")
            print("\n🎉 You can now login with:")
            print("   Email: admin@test.com")
            print("   Password: admin123")
        else:
            print("❌ Admin user not found!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_password()