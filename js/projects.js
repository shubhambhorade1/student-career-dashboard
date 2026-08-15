/**
 * projects.js — Project CRUD rendered as cards.
 */
const ProjectsModule = (() => {
  const STATUSES = ["Planned", "In Progress", "Completed"];

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function statusClass(status) {
    return status.replace(/\s+/g, "");
  }

  function render() {
    const projects = Storage.Projects.getAll();
    const list = document.getElementById("projectsList");
    const empty = document.getElementById("projectsEmpty");

    if (projects.length === 0) {
      list.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    list.innerHTML = projects
      .map(
        (p) => `
      <article class="project-card" data-id="${p.id}">
        <div class="project-card__top">
          <p class="project-card__title">${escapeHtml(p.title)}</p>
          <span class="status-badge status-badge--${statusClass(p.status)}">${escapeHtml(p.status)}</span>
        </div>
        <p class="project-card__desc">${escapeHtml(p.description)}</p>
        <div class="tag-row">${(p.tech || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="project-card__links">
          ${p.github ? `<a href="${escapeHtml(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
          ${p.demo ? `<a href="${escapeHtml(p.demo)}" target="_blank" rel="noopener">Live demo ↗</a>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn btn--ghost btn--small edit-project">Edit</button>
          <button class="btn btn--danger btn--small delete-project">Delete</button>
        </div>
      </article>`
      )
      .join("");

    list.querySelectorAll(".edit-project").forEach((btn) =>
      btn.addEventListener("click", (e) => openForm(e.target.closest(".project-card").dataset.id))
    );
    list.querySelectorAll(".delete-project").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".project-card").dataset.id;
        UI.confirm("Delete this project? This can't be undone.", () => {
          Storage.Projects.delete(id);
          Storage.Activity.log("Deleted a project");
          render();
          Dashboard.render();
          Analytics.render();
          UI.toast("Project deleted", "info");
        });
      })
    );
  }

  function openForm(id) {
    const existing = id ? Storage.Projects.getAll().find((p) => p.id === id) : null;
    const body = `
      <form id="projectForm" class="form-grid">
        <div class="field field--wide">
          <label for="projTitle">Project title</label>
          <input type="text" id="projTitle" required placeholder="e.g. Expense Tracker" value="${existing ? escapeHtml(existing.title) : ""}">
        </div>
        <div class="field field--wide">
          <label for="projDesc">Description</label>
          <textarea id="projDesc" rows="3" placeholder="What does it do?">${existing ? escapeHtml(existing.description) : ""}</textarea>
        </div>
        <div class="field field--wide">
          <label for="projTech">Technologies used (comma separated)</label>
          <input type="text" id="projTech" placeholder="HTML, CSS, JavaScript" value="${existing ? escapeHtml((existing.tech || []).join(", ")) : ""}">
        </div>
        <div class="field">
          <label for="projGithub">GitHub URL</label>
          <input type="url" id="projGithub" placeholder="https://github.com/..." value="${existing ? escapeHtml(existing.github) : ""}">
        </div>
        <div class="field">
          <label for="projDemo">Live demo URL</label>
          <input type="url" id="projDemo" placeholder="https://..." value="${existing ? escapeHtml(existing.demo) : ""}">
        </div>
        <div class="field field--wide">
          <label for="projStatus">Status</label>
          <select id="projStatus">
            ${STATUSES.map((s) => `<option ${existing && existing.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-actions field--wide">
          <button type="submit" class="btn btn--primary">${existing ? "Save changes" : "Add project"}</button>
        </div>
      </form>`;
    UI.openModal(existing ? "Edit project" : "Add project", body);

    document.getElementById("projectForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("projTitle").value.trim();
      if (!title) return;
      const payload = {
        title,
        description: document.getElementById("projDesc").value.trim(),
        tech: document.getElementById("projTech").value.split(",").map((t) => t.trim()).filter(Boolean),
        github: document.getElementById("projGithub").value.trim(),
        demo: document.getElementById("projDemo").value.trim(),
        status: document.getElementById("projStatus").value,
      };
      if (existing) {
        Storage.Projects.update(existing.id, payload);
        Storage.Activity.log(`Updated project "${title}"`);
        UI.toast("Project updated", "success");
      } else {
        Storage.Projects.add(payload);
        Storage.Activity.log(`Added project "${title}"`);
        UI.toast("Project added", "success");
      }
      UI.closeModal();
      render();
      Dashboard.render();
      Analytics.render();
    });
  }

  function init() {
    document.getElementById("addProjectBtn").addEventListener("click", () => openForm(null));
    render();
  }

  return { init, render, STATUSES };
})();
