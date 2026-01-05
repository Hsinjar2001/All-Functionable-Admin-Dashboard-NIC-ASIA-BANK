"""
Debug JWT Token Issue
"""
import jwt
import json
from app.config import settings

print("🔍 JWT TOKEN DEBUGGING")
print("=" * 70)

# Your token from login
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoicmFqbmlzaEBleGFtcGxlLmNvbSIsImV4cCI6MTc2NzUyMjI5MH0.h7NiL50T1pwDaw8xDjOqvSLhYwjYxaqyMjbP8aBh05c"

# Step 1: Check SECRET_KEY
print("\n1️⃣  Checking SECRET_KEY from config...")
print(f"SECRET_KEY: {settings.SECRET_KEY}")
print(f"ALGORITHM: {settings.ALGORITHM}")

# Step 2: Decode without verification
print("\n2️⃣  Decoding token payload (without verification)...")
try:
    payload = jwt.decode(TOKEN, options={"verify_signature": False})
    print("✅ Token payload:")
    print(json.dumps(payload, indent=2))
except Exception as e:
    print(f"❌ Error: {e}")

# Step 3: Decode with verification (same as app does)
print("\n3️⃣  Verifying token with SECRET_KEY...")
try:
    payload = jwt.decode(
        TOKEN, 
        settings.SECRET_KEY, 
        algorithms=[settings.ALGORITHM]
    )
    print("✅ Token is VALID!")
    print("Payload:")
    print(json.dumps(payload, indent=2))
    print(f"\nUser ID (sub): {payload.get('sub')}")
    print(f"Email: {payload.get('email')}")
    print(f"Expires: {payload.get('exp')}")
    
except jwt.ExpiredSignatureError:
    print("❌ Token has EXPIRED!")
    
except jwt.InvalidSignatureError:
    print("❌ INVALID SIGNATURE - SECRET_KEY mismatch!")
    print("\nPossible causes:")
    print("1. SECRET_KEY in .env is different from when token was created")
    print("2. Token was created with different SECRET_KEY")
    print("\nSolution: Login again to get new token with current SECRET_KEY")
    
except jwt.InvalidTokenError as e:
    print(f"❌ Invalid token: {e}")
    
except Exception as e:
    print(f"❌ Error: {e}")

# Step 4: Test decode_access_token function
print("\n4️⃣  Testing decode_access_token function...")
try:
    from app.utils.security import decode_access_token
    
    result = decode_access_token(TOKEN)
    if result:
        print("✅ decode_access_token works!")
        print(json.dumps(result, indent=2))
    else:
        print("❌ decode_access_token returned None")
        print("This means token verification failed in the function")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 70)