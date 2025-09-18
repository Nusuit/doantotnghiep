import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000"

async def test_endpoints():
    """Test all API endpoints"""
    async with aiohttp.ClientSession() as session:
        
        print("🔬 Testing Backend API Endpoints")
        print("=" * 50)
        
        # Test health check
        print("\n1. Testing Health Check...")
        try:
            async with session.get(f"{BASE_URL}/health") as response:
                data = await response.json()
                print(f"✅ Health: {data}")
        except Exception as e:
            print(f"❌ Health check failed: {e}")
        
        # Test root endpoint
        print("\n2. Testing Root Endpoint...")
        try:
            async with session.get(f"{BASE_URL}/") as response:
                data = await response.json()
                print(f"✅ Root: {data}")
        except Exception as e:
            print(f"❌ Root endpoint failed: {e}")
        
        # Test user creation
        print("\n3. Testing User Creation...")
        user_data = {
            "username": "testuser",
            "email": "test@example.com"
        }
        try:
            async with session.post(f"{BASE_URL}/api/users/", json=user_data) as response:
                if response.status == 200:
                    user = await response.json()
                    user_id = user['id']
                    print(f"✅ User created: {user}")
                else:
                    error = await response.text()
                    print(f"❌ User creation failed: {error}")
                    user_id = 1  # Fallback for testing
        except Exception as e:
            print(f"❌ User creation error: {e}")
            user_id = 1
        
        # Test chat message
        print("\n4. Testing Chat Message...")
        chat_data = {
            "user_id": user_id,
            "message": "Xin chào! Bạn có thể giúp tôi không?"
        }
        try:
            async with session.post(f"{BASE_URL}/api/chat/send", json=chat_data) as response:
                if response.status == 200:
                    chat_response = await response.json()
                    conversation_id = chat_response['conversation_id']
                    print(f"✅ Chat response: {chat_response}")
                else:
                    error = await response.text()
                    print(f"❌ Chat failed: {error}")
                    conversation_id = None
        except Exception as e:
            print(f"❌ Chat error: {e}")
            conversation_id = None
        
        # Test get conversations
        if user_id:
            print("\n5. Testing Get Conversations...")
            try:
                async with session.get(f"{BASE_URL}/api/chat/conversations/{user_id}") as response:
                    if response.status == 200:
                        conversations = await response.json()
                        print(f"✅ Conversations: {conversations}")
                    else:
                        error = await response.text()
                        print(f"❌ Get conversations failed: {error}")
            except Exception as e:
                print(f"❌ Get conversations error: {e}")
        
        # Test get messages
        if conversation_id:
            print("\n6. Testing Get Messages...")
            try:
                async with session.get(f"{BASE_URL}/api/chat/conversations/{conversation_id}/messages") as response:
                    if response.status == 200:
                        messages = await response.json()
                        print(f"✅ Messages: {messages}")
                    else:
                        error = await response.text()
                        print(f"❌ Get messages failed: {error}")
            except Exception as e:
                print(f"❌ Get messages error: {e}")
        
        print("\n" + "=" * 50)
        print("🎉 Testing completed!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())