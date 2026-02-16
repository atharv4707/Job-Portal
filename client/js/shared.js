const API_BASE = "/api";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, ...rest } = options;
  const requestHeaders = { ...headers };

  const fetchOptions = {
    method,
    credentials: "include",
    headers: requestHeaders,
    ...rest
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, fetchOptions);
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status})`;
    const err = new Error(message);
    err.details = payload?.details;
    throw err;
  }

  return payload;
}

export function showToast(message, timeoutMs = 2600) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, timeoutMs);
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function statusBadge(status) {
  const key = String(status || "").toLowerCase();
  const className = `badge badge-${key}`;
  return `<span class="${className}">${escapeHtml(status || "UNKNOWN")}</span>`;
}

export async function getCurrentSession() {
  try {
    const data = await apiRequest("/auth/me");
    return data?.user || null;
  } catch (error) {
    return null;
  }
}

export function dashboardPathByRole(role) {
  if (role === "JOBSEEKER") return "/seeker.html";
  if (role === "EMPLOYER") return "/employer.html";
  return "/";
}

export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch (error) {
    // Ignore auth errors during logout.
  }
}

