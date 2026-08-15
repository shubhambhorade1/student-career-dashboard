/**
 * applications.js — Internship / job application tracker.
 */
const ApplicationsModule = (() => {
  const STATUSES = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function renderStats() {
    const apps = Storage.Applications.getAll();
    const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    apps.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });

    const wrap = document.getElementById("applicationStats");
    wrap.innerHTML = STATUSES.map(
      (s) => `<article class="stat-card"><p class="stat-card__label">${s}</p><p class="stat-card__value">${counts[s]}</p></article>`
    ).join("");
  }

  function render() {
    renderStats();
    const apps = Storage.Applications.getAll();
    const body = document.getElementById("applicationsTableBody");
    const empty = document.getElementById("applicationsEmpty");
    const table = document.getElementById("applicationsTable");

    if (apps.length === 0) {
      body.innerHTML = "";
      empty.hidden = false;
      table.hidden = true;
      return;
    }
    empty.hidden = true;
    table.hidden = false;

    body.innerHTML = apps
      .map(
        (a) => `
      <tr data-id="${a.id}">
        <td>${escapeHtml(a.company)}</td>
        <td>${escapeHtml(a.position)}</td>
        <td>${formatDate(a.appliedDate)}</td>
        <td><span class="status-pill status-pill--${a.status}">${a.status}</span></td>
        <td>${formatDate(a.interviewDate)}</td>
        <td class="notes-cell" title="${escapeHtml(a.notes)}">${escapeHtml(a.notes) || "—"}</td>
        <td>
          <div class="table-actions">
            <button class="icon-btn edit-app" aria-label="Edit application">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="icon-btn delete-app" aria-label="Delete application">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"/></svg>
            </button>
          </div>
        </td>
      </tr>`
      )
      .join("");

    body.querySelectorAll(".edit-app").forEach((btn) =>
      btn.addEventListener("click", (e) => openForm(e.target.closest("tr").dataset.id))
    );
    body.querySelectorAll(".delete-app").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("tr").dataset.id;
        UI.confirm("Delete this application record? This can't be undone.", () => {
          Storage.Applications.delete(id);
          Storage.Activity.log("Deleted an application record");
          render();
          Dashboard.render();
          Analytics.render();
          UI.toast("Application deleted", "info");
        });
      })
    );
  }

  function openForm(id) {
    const existing = id ? Storage.Applications.getAll().find((a) => a.id === id) : null;
    const body = `
      <form id="applicationForm" class="form-grid">
        <div class="field">
          <label for="appCompany">Company</label>
          <input type="text" id="appCompany" required placeholder="e.g. Wipro" value="${existing ? escapeHtml(existing.company) : ""}">
        </div>
        <div class="field">
          <label for="appPosition">Position</label>
          <input type="text" id="appPosition" placeholder="e.g. Frontend Intern" value="${existing ? escapeHtml(existing.position) : ""}">
        </div>
        <div class="field">
          <label for="appDate">Application date</label>
          <input type="date" id="appDate" value="${existing ? existing.appliedDate : ""}">
        </div>
        <div class="field">
          <label for="appStatus">Status</label>
          <select id="appStatus">
            ${STATUSES.map((s) => `<option ${existing && existing.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="appInterviewDate">Interview date (optional)</label>
          <input type="date" id="appInterviewDate" value="${existing ? existing.interviewDate || "" : ""}">
        </div>
        <div class="field field--wide">
          <label for="appNotes">Notes</label>
          <textarea id="appNotes" rows="2" placeholder="Anything worth remembering">${existing ? escapeHtml(existing.notes) : ""}</textarea>
        </div>
        <div class="form-actions field--wide">
          <button type="submit" class="btn btn--primary">${existing ? "Save changes" : "Log application"}</button>
        </div>
      </form>`;
    UI.openModal(existing ? "Edit application" : "Log application", body);

    document.getElementById("applicationForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const company = document.getElementById("appCompany").value.trim();
      if (!company) return;
      const payload = {
        company,
        position: document.getElementById("appPosition").value.trim(),
        appliedDate: document.getElementById("appDate").value,
        status: document.getElementById("appStatus").value,
        interviewDate: document.getElementById("appInterviewDate").value,
        notes: document.getElementById("appNotes").value.trim(),
      };
      if (existing) {
        Storage.Applications.update(existing.id, payload);
        Storage.Activity.log(`Updated application to ${company}`);
        UI.toast("Application updated", "success");
      } else {
        Storage.Applications.add(payload);
        Storage.Activity.log(`Logged application to ${company}`);
        UI.toast("Application logged", "success");
      }
      UI.closeModal();
      render();
      Dashboard.render();
      Analytics.render();
    });
  }

  function init() {
    document.getElementById("addApplicationBtn").addEventListener("click", () => openForm(null));
    render();
  }

  return { init, render, STATUSES };
})();
