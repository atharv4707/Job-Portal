import {
  apiRequest,
  getCurrentSession,
  dashboardPathByRole,
  showToast,
  formatDate,
  statusBadge,
  escapeHtml,
  logoutUser
} from "./shared.js";

const profileForm = document.getElementById("profile-form");
const applicationsBody = document.getElementById("applications-body");
const refreshAppsBtn = document.getElementById("refresh-apps");
const logoutBtn = document.getElementById("logout-btn");

function asText(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function setProfileForm(data) {
  const { user, profile } = data;
  document.getElementById("name").value = user?.name || "";
  document.getElementById("phone").value = profile?.phone || "";
  document.getElementById("location").value = profile?.location || "";
  document.getElementById("skills").value = asText(profile?.skills);
  document.getElementById("education").value = asText(profile?.education);
  document.getElementById("experience").value = asText(profile?.experience);
  document.getElementById("resumeUrl").value = profile?.resumeUrl || "";
}

function renderApplications(applications) {
  if (!applications.length) {
    applicationsBody.innerHTML = `<tr><td colspan="4"><div class="notice">No applications yet.</div></td></tr>`;
    return;
  }

  applicationsBody.innerHTML = applications
    .map((item) => {
      const job = item.jobId || {};
      return `
        <tr>
          <td>${escapeHtml(job.title || "Deleted Job")}</td>
          <td>${escapeHtml(job.location || "-")}</td>
          <td>${statusBadge(item.status)}</td>
          <td>${formatDate(item.appliedAt)}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadProfile() {
  const data = await apiRequest("/profile/me");
  setProfileForm(data);
}

async function loadApplications() {
  const data = await apiRequest("/jobseeker/applications");
  renderApplications(data.applications || []);
}

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    location: document.getElementById("location").value.trim(),
    skills: document.getElementById("skills").value,
    education: document.getElementById("education").value,
    experience: document.getElementById("experience").value,
    resumeUrl: document.getElementById("resumeUrl").value.trim()
  };

  try {
    await apiRequest("/profile/me", { method: "PUT", body: payload });
    showToast("Profile updated");
    await loadProfile();
  } catch (error) {
    showToast(error.message);
  }
});

refreshAppsBtn.addEventListener("click", () => {
  loadApplications().catch((error) => showToast(error.message));
});

logoutBtn.addEventListener("click", async () => {
  await logoutUser();
  window.location.href = "/auth.html";
});

const user = await getCurrentSession();
if (!user) {
  window.location.href = "/auth.html";
} else if (user.role !== "JOBSEEKER") {
  window.location.href = dashboardPathByRole(user.role);
}

loadProfile().catch((error) => showToast(error.message));
loadApplications().catch((error) => showToast(error.message));

