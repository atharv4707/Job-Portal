import {
  apiRequest,
  getCurrentSession,
  dashboardPathByRole,
  showToast,
  escapeHtml,
  formatDate,
  statusBadge
} from "./shared.js";

const filterForm = document.getElementById("filter-form");
const clearFiltersBtn = document.getElementById("clear-filters");
const jobsGrid = document.getElementById("jobs-grid");
const dashboardLinkEl = document.getElementById("dashboard-link");

let currentUser = null;

function setFiltersFromQuery() {
  const params = new URLSearchParams(window.location.search);
  filterForm.q.value = params.get("q") || "";
  filterForm.location.value = params.get("location") || "";
  filterForm.jobType.value = params.get("jobType") || "";
  filterForm.status.value = params.get("status") || "";
}

function buildQueryFromFilters() {
  const params = new URLSearchParams();
  const fields = ["q", "location", "jobType", "status"];

  fields.forEach((field) => {
    const value = filterForm[field].value.trim();
    if (value) params.set(field, value);
  });

  return params;
}

function renderJobs(jobs) {
  if (!jobs.length) {
    jobsGrid.innerHTML = `<p class="notice">No jobs matched your filters.</p>`;
    return;
  }

  jobsGrid.innerHTML = jobs
    .map((job) => {
      const employer = job.employerId?.name || "Employer";
      const canApply = currentUser?.role === "JOBSEEKER" && job.status === "OPEN";
      const requirements = (job.requirements || []).slice(0, 4);
      return `
        <article class="card job-card">
          <h3>${escapeHtml(job.title)}</h3>
          <p class="meta">${escapeHtml(employer)} | ${escapeHtml(job.location)} | ${escapeHtml(job.jobType)}</p>
          <p>${escapeHtml(job.description)}</p>
          <div class="stack" style="margin-bottom:0.65rem;">
            ${requirements.map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join("")}
          </div>
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

async function loadJobs() {
  const params = buildQueryFromFilters();
  const query = params.toString();
  const endpoint = query ? `/jobs?${query}` : "/jobs";
  const data = await apiRequest(endpoint);
  renderJobs(data.jobs || []);
}

filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const params = buildQueryFromFilters();
  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);

  try {
    await loadJobs();
  } catch (error) {
    showToast(error.message);
  }
});

clearFiltersBtn.addEventListener("click", async () => {
  filterForm.reset();
  window.history.replaceState({}, "", window.location.pathname);
  try {
    await loadJobs();
  } catch (error) {
    showToast(error.message);
  }
});

jobsGrid.addEventListener("click", async (event) => {
  const button = event.target.closest(".apply-btn");
  if (!button) return;

  if (!currentUser || currentUser.role !== "JOBSEEKER") {
    showToast("Please login as a job seeker to apply.");
    return;
  }

  button.disabled = true;

  try {
    await apiRequest(`/jobs/${button.dataset.id}/apply`, { method: "POST" });
    showToast("Application submitted.");
    await loadJobs();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
});

currentUser = await getCurrentSession();
if (currentUser) {
  dashboardLinkEl.classList.remove("hidden");
  dashboardLinkEl.href = dashboardPathByRole(currentUser.role);
}

setFiltersFromQuery();
loadJobs().catch((error) => showToast(error.message));

