import traceback

print("🔍 Testing imports step by step...")

try:
    print("1. Importing models...")
    from models.coin_transaction import CoinTransaction, TransactionType
    print("   ✅ CoinTransaction model imported")
except Exception as e:
    print(f"   ❌ CoinTransaction import error: {e}")
    traceback.print_exc()

try:
    print("2. Importing schemas...")
    from schemas.coin import CoinBalance, CoinTransactionCreate
    print("   ✅ Coin schemas imported")
except Exception as e:
    print(f"   ❌ Coin schemas import error: {e}")
    traceback.print_exc()

try:
    print("3. Importing service...")
    from services.coin_service import CoinService
    print("   ✅ CoinService imported")
except Exception as e:
    print(f"   ❌ CoinService import error: {e}")
    traceback.print_exc()

try:
    print("4. Importing API router...")
    from api.coins import router
    print("   ✅ Coins router imported")
    print(f"   📍 Router has {len(router.routes)} routes")
except Exception as e:
    print(f"   ❌ Coins API import error: {e}")
    traceback.print_exc()

try:
    print("5. Testing main app...")
    from main import app
    print("   ✅ Main app imported")
    
    # Count routes
    total_routes = len([r for r in app.routes if hasattr(r, 'path')])
    coin_routes = len([r for r in app.routes if hasattr(r, 'path') and 'coin' in r.path])
    print(f"   📊 Total routes: {total_routes}, Coin routes: {coin_routes}")
    
except Exception as e:
    print(f"   ❌ Main app error: {e}")
    traceback.print_exc() 