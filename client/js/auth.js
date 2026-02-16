import { apiRequest, getCurrentSession, dashboardPathByRole, showToast } from "./shared.js";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const registerPanel = document.getElementById("register-panel");
const loginPanel = document.getElementById("login-panel");
const showLoginBtn = document.getElementById("show-login-btn");
const showRegisterBtn = document.getElementById("show-register-btn");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");

const user = await getCurrentSession();
if (user) {
  window.location.href = dashboardPathByRole(user.role);
}

function showRegisterPanel() {
  registerPanel.classList.remove("hidden");
  loginPanel.classList.add("hidden");
}

function showLoginPanel(prefillEmail = "") {
  registerPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");

  if (prefillEmail) {
    loginEmailInput.value = prefillEmail;
  }
  loginPasswordInput.focus();
}

showLoginBtn.addEventListener("click", () => {
  showLoginPanel();
});

showRegisterBtn.addEventListener("click", () => {
  showRegisterPanel();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    email: loginEmailInput.value.trim(),
    password: loginPasswordInput.value
  };

  try {
    const data = await apiRequest("/auth/login", { method: "POST", body: payload });
    showToast("Login successful");
    window.location.href = dashboardPathByRole(data.user.role);
  } catch (error) {
    showToast(error.message);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const regEmailInput = document.getElementById("reg-email");

  const payload = {
    name: document.getElementById("reg-name").value.trim(),
    email: regEmailInput.value.trim(),
    password: document.getElementById("reg-password").value,
    role: document.getElementById("reg-role").value
  };

  try {
    await apiRequest("/auth/register", { method: "POST", body: payload });
    await apiRequest("/auth/logout", { method: "POST" });
    registerForm.reset();
    showToast("Account created. Please login.");
    showLoginPanel(payload.email);
  } catch (error) {
    showToast(error.message);
  }
});
