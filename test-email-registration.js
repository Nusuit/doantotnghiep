// Test registration with email sending
const axios = require("axios");

const testRegistration = async () => {
  try {
    console.log("🧪 Testing registration with email sending...");

    const response = await axios.post(
      "http://localhost:4000/api/auth/register",
      {
        email: "test123@example.com",
        password: "password123",
        username: "testuser123",
        full_name: "Test User",
      }
    );

    console.log("✅ Registration successful:", response.data);
  } catch (error) {
    console.error(
      "❌ Registration failed:",
      error.response?.data || error.message
    );
  }
};

testRegistration();
