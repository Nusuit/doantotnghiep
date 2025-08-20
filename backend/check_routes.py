from main import app

print("🚀 Checking registered routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = getattr(route, 'methods', set())
        print(f"  {route.path} - {list(methods)}")
        
print("\n🔍 Looking specifically for coin routes...")
coin_routes = [route for route in app.routes if hasattr(route, 'path') and 'coin' in route.path]
print(f"Found {len(coin_routes)} coin-related routes")
for route in coin_routes:
    methods = getattr(route, 'methods', set())
    print(f"  {route.path} - {list(methods)}") 