const user = {
  id: 5,
  email: "yukisawari@gmail.com",
  full_name: "Sawari Yuki",
  given_name: "Sawari",
  family_name: "Yuki",
  profile_picture:
    "https://lh3.googleusercontent.com/a/ACg8ocJ1QLv4tFZt25xjQS1MMsodbtM20I81hyynDx9kVz9DSnAp=s96-c",
  is_email_verified: 1,
  account_status: "active",
  auth_provider: "local",
  created_at: "2025-09-17T01:22:34.767Z",
  fullName: "Sawari Yuki",
  dateOfBirth: "2004-03-28",
  gender: "male",
  phoneNumber: "+84946350603",
  country: "Việt Nam",
  address: "Thành phố Hồ Chí Minh, Bình Dương, Việt Nam",
  foodPreferences: {
    breakfast: true,
    lunch: false,
    dinner: false,
    snack: false,
  },
  priceRange: "50k-100k",
  preferredLocation: "Thành phố Hồ Chí Minh",
  displayName: "Sawari Yuki",
  isProfileSetup: true,
  profileComplete: true,
};

console.log("User data check:");
console.log("full_name:", user.full_name);
console.log("fullName:", user.fullName);
console.log("profileComplete:", user.profileComplete);
console.log("isProfileSetup:", user.isProfileSetup);

// Current logic from App.jsx
function isFirstTimeUser(user) {
  // Nếu user có full_name từ OAuth nhưng chưa setup profile chi tiết
  if (user.full_name && !user.profileComplete && !user.isProfileSetup) {
    return true;
  }

  // Nếu user không có cả full_name và fullName (user mới hoàn toàn)
  if (
    !user.fullName &&
    !user.full_name &&
    !user.profileComplete &&
    !user.isProfileSetup
  ) {
    return true;
  }

  return false;
}

console.log("=== CURRENT LOGIC ===");
console.log("isFirstTimeUser result:", isFirstTimeUser(user));

// Improved logic
function isFirstTimeUserFixed(user) {
  // User đã setup profile thì không phải first time
  if (user.profileComplete === true || user.isProfileSetup === true) {
    return false;
  }

  // Nếu user chưa setup profile thì là first time
  return true;
}

console.log("=== FIXED LOGIC ===");
console.log("isFirstTimeUserFixed result:", isFirstTimeUserFixed(user));
