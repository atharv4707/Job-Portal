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

const companyForm = document.getElementById("company-form");
const jobForm = document.getElementById("job-form");
const jobsBody = document.getElementById("jobs-body");
const applicantsBody = document.getElementById("applicants-body");
const applicantsTitle = document.getElementById("applicants-title");
const refreshJobsBtn = document.getElementById("refresh-jobs");
const logoutBtn = document.getElementById("logout-btn");

function setCompanyForm(data) {
  const { user, profile } = data;
  document.getElementById("name").value = user?.name || "";
  document.getElementById("companyName").value = profile?.companyName || "";
  document.getElementById("companyWebsite").value = profile?.companyWebsite || "";
  document.getElementById("companyLocation").value = profile?.location || "";
  document.getElementById("companyDescription").value = profile?.companyDescription || "";
}

function renderJobs(jobs) {
  if (!jobs.length) {
    jobsBody.innerHTML = `<tr><td colspan="4"><div class="notice">No jobs posted yet.</div></td></tr>`;
    return;
  }

  jobsBody.innerHTML = jobs
    .map((job) => {
      return `
        <tr>
          <td>
            <strong>${escapeHtml(job.title)}</strong>
            <div class="meta">${escapeHtml(job.location)} | ${formatDate(job.createdAt)}</div>
          </td>
          <td>${escapeHtml(job.jobType)}</td>
          <td>
            ${statusBadge(job.status)}
            <div style="margin-top:0.45rem;">
              <select class="status-select" data-id="${job._id}">
                <option ${job.status === "OPEN" ? "selected" : ""}>OPEN</option>
                <option ${job.status === "FILLED" ? "selected" : ""}>FILLED</option>
                <option ${job.status === "CLOSED" ? "selected" : ""}>CLOSED</option>
              </select>
            </div>
          </td>
          <td>
            <div class="stack">
              <button class="btn btn-outline view-applicants-btn" data-id="${job._id}" data-title="${escapeHtml(
        job.title
      )}">Applicants</button>
              <button class="btn btn-danger delete-job-btn" data-id="${job._id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderApplicants(applications) {
  if (!applications.length) {
    applicantsBody.innerHTML = `<tr><td colspan="4"><div class="notice">No applicants for this job yet.</div></td></tr>`;
    return;
  }

  applicantsBody.innerHTML = applications
    .map((item) => {
      const candidate = item.jobseekerId || {};
      return `
        <tr>
          <td>
            <strong>${escapeHtml(candidate.name || "-")}</strong>
            <div class="meta">${escapeHtml(item.jobseekerProfile?.skills?.join(", ") || "No skills listed")}</div>
          </td>
          <td>
            ${escapeHtml(candidate.email || "-")}
            <div class="meta">${escapeHtml(item.jobseekerProfile?.resumeUrl || "No resume URL")}</div>
          </td>
          <td>${statusBadge(item.status)}</td>
          <td>
            <div class="stack">
              <select class="application-status-select" data-id="${item._id}">
                <option ${item.status === "APPLIED" ? "selected" : ""}>APPLIED</option>
                <option ${item.status === "UNDER_REVIEW" ? "selected" : ""}>UNDER_REVIEW</option>
                <option ${item.status === "REJECTED" ? "selected" : ""}>REJECTED</option>
                <option ${item.status === "SELECTED" ? "selected" : ""}>SELECTED</option>
              </select>
              <button class="btn btn-primary save-app-status-btn" data-id="${item._id}">Save</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadCompany() {
  const data = await apiRequest("/profile/me");
  setCompanyForm(data);
}

async function loadJobs() {
  const data = await apiRequest("/employer/jobs");
  renderJobs(data.jobs || []);
}

companyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    companyName: document.getElementById("companyName").value.trim(),
    companyWebsite: document.getElementById("companyWebsite").value.trim(),
    location: document.getElementById("companyLocation").value.trim(),
    companyDescription: document.getElementById("companyDescription").value.trim()
  };

  try {
    await apiRequest("/profile/me", { method: "PUT", body: payload });
    showToast("Company profile updated");
    await loadCompany();
  } catch (error) {
    showToast(error.message);
  }
});

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    location: document.getElementById("location").value.trim(),
    jobType: document.getElementById("jobType").value,
    salaryRange: document.getElementById("salaryRange").value.trim(),
    deadline: document.getElementById("deadline").value || null,
    requirements: document.getElementById("requirements").value
  };

  try {
    await apiRequest("/jobs", { method: "POST", body: payload });
    showToast("Job posted");
    jobForm.reset();
    await loadJobs();
  } catch (error) {
    showToast(error.message);
  }
});

refreshJobsBtn.addEventListener("click", () => {
  loadJobs().catch((error) => showToast(error.message));
});

jobsBody.addEventListener("change", async (event) => {
  const select = event.target.closest(".status-select");
  if (!select) return;

  try {
    await apiRequest(`/jobs/${select.dataset.id}/status`, {
      method: "PATCH",
      body: { status: select.value }
    });
    showToast("Job status updated");
    await loadJobs();
  } catch (error) {
    showToast(error.message);
  }
});

jobsBody.addEventListener("click", async (event) => {
  const deleteBtn = event.target.closest(".delete-job-btn");
  if (deleteBtn) {
    try {
      await apiRequest(`/jobs/${deleteBtn.dataset.id}`, { method: "DELETE" });
      showToast("Job deleted");
      applicantsBody.innerHTML = "";
      applicantsTitle.textContent = "Select a job to view applicants";
      await loadJobs();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const viewBtn = event.target.closest(".view-applicants-btn");
  if (viewBtn) {
    try {
      const data = await apiRequest(`/employer/jobs/${viewBtn.dataset.id}/applications`);
      applicantsTitle.textContent = `Applicants for ${viewBtn.dataset.title}`;
      renderApplicants(data.applications || []);
    } catch (error) {
      showToast(error.message);
    }
  }
});

applicantsBody.addEventListener("click", async (event) => {
  const saveBtn = event.target.closest(".save-app-status-btn");
  if (!saveBtn) return;

  const select = applicantsBody.querySelector(`.application-status-select[data-id="${saveBtn.dataset.id}"]`);
  if (!select) return;

  try {
    await apiRequest(`/applications/${saveBtn.dataset.id}/status`, {
      method: "PATCH",
      body: { status: select.value }
    });
    showToast("Application updated");
  } catch (error) {
    showToast(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await logoutUser();
  window.location.href = "/auth.html";
});

const user = await getCurrentSession();
if (!user) {
  window.location.href = "/auth.html";
} else if (user.role !== "EMPLOYER") {
  window.location.href = dashboardPathByRole(user.role);
}

loadCompany().catch((error) => showToast(error.message));
loadJobs().catch((error) => showToast(error.message));

