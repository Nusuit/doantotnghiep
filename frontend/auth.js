// auth.js: Xử lý chuyển tab và ẩn/hiện form đăng nhập/đăng ký

document.addEventListener("DOMContentLoaded", function () {
  const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
  const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  loginTab.addEventListener("click", function () {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab.addEventListener("click", function () {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Optional: Xử lý submit form (chặn reload)
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // TODO: Gửi request đăng nhập
    alert("Đăng nhập thành công (demo)!");
  });

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // TODO: Gửi request đăng ký
    alert("Đăng ký thành công (demo)!");
  });
});
