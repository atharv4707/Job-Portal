import {
  apiRequest,
  getCurrentSession,
  dashboardPathByRole,
  formatDate,
  showToast,
  escapeHtml,
  statusBadge,
  logoutUser
} from "./shared.js";

const latestJobsEl = document.getElementById("latest-jobs");
const searchForm = document.getElementById("quick-search-form");
const dashboardLinkEl = document.getElementById("dashboard-link");
const logoutBtn = document.getElementById("logout-btn");

let currentUser = null;

function renderJobs(jobs) {
  if (!jobs.length) {
    latestJobsEl.innerHTML = `<p class="notice">No jobs available yet.</p>`;
    return;
  }

  latestJobsEl.innerHTML = jobs
    .map((job) => {
      const employerName = job.employerId?.name || "Employer";
      const canApply = currentUser?.role === "JOBSEEKER" && job.status === "OPEN";
      return `
        <article class="card job-card">
          <h3>${escapeHtml(job.title)}</h3>
          <p class="meta">${escapeHtml(employerName)} | ${escapeHtml(job.location)} | ${escapeHtml(job.jobType)}</p>
          <p>${escapeHtml(job.description).slice(0, 180)}...</p>
          <div class="toolbar">
            <div class="stack">
              ${statusBadge(job.status)}
              <span class="meta">Posted ${formatDate(job.createdAt)}</span>
            </div>
            ${canApply ? `<button class="btn btn-primary apply-btn" data-id="${job._id}">Apply</button>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadLatestJobs() {
  const data = await apiRequest("/jobs?status=OPEN&limit=6");
  renderJobs(data.jobs || []);
}

function wireSearchForm() {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const params = new URLSearchParams({
      q: searchForm.q.value.trim(),
      location: searchForm.location.value.trim(),
      jobType: searchForm.jobType.value
    });
    window.location.href = `/jobs.html?${params.toString()}`;
  });
}

function wireApplyButtons() {
  latestJobsEl.addEventListener("click", async (event) => {
    const button = event.target.closest(".apply-btn");
    if (!button) return;

    if (!currentUser || currentUser.role !== "JOBSEEKER") {
      showToast("Please login as a job seeker first.");
      return;
    }

    button.disabled = true;

    try {
      await apiRequest(`/jobs/${button.dataset.id}/apply`, { method: "POST" });
      showToast("Application submitted.");
      await loadLatestJobs();
    } catch (error) {
      showToast(error.message);
      button.disabled = false;
    }
  });
}

async function wireSessionNav() {
  currentUser = await getCurrentSession();
  if (!currentUser) return;

  dashboardLinkEl.classList.remove("hidden");
  dashboardLinkEl.href = dashboardPathByRole(currentUser.role);
  logoutBtn.classList.remove("hidden");
}

logoutBtn?.addEventListener("click", async () => {
  await logoutUser();
  window.location.href = "/auth.html";
});

await wireSessionNav();
wireSearchForm();
wireApplyButtons();

loadLatestJobs().catch((error) => {
  showToast(error.message);
});

