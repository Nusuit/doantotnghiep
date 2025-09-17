// Test verify endpoint
const axios = require("axios");

const testVerify = async () => {
  try {
    console.log("🧪 Testing email verification...");

    const response = await axios.post(
      "http://localhost:4000/api/auth/verify-email",
      {
        token:
          "900e567f205141ff62a1c76b3196f7cc72eec39facc19c248d0db3902b944933",
      }
    );

    console.log("✅ Verification successful:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("❌ Verification failed:", error.response.data);
    } else {
      console.error("❌ Request failed:", error.message);
    }
  }
};

testVerify();
