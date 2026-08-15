/**
 * learning.js — Learning goal CRUD with progress bars.
 */
const LearningModule = (() => {
  const STATUSES = ["Not Started", "In Progress", "Completed"];

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "No target date";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return `Target: ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  }

  function render() {
    const goals = Storage.Learning.getAll();
    const list = document.getElementById("learningList");
    const empty = document.getElementById("learningEmpty");

    if (goals.length === 0) {
      list.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    list.innerHTML = goals
      .map(
        (g) => `
      <article class="learning-card" data-id="${g.id}">
        <p class="learning-card__topic">${escapeHtml(g.topic)}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${g.progress}%"></div></div>
        <div class="learning-card__meta">
          <span>${g.progress}% complete</span>
          <span>${g.status}</span>
        </div>
        <div class="learning-card__meta">
          <span>${formatDate(g.targetDate)}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn--ghost btn--small edit-goal">Edit</button>
          <button class="btn btn--danger btn--small delete-goal">Delete</button>
        </div>
      </article>`
      )
      .join("");

    list.querySelectorAll(".edit-goal").forEach((btn) =>
      btn.addEventListener("click", (e) => openForm(e.target.closest(".learning-card").dataset.id))
    );
    list.querySelectorAll(".delete-goal").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".learning-card").dataset.id;
        UI.confirm("Delete this learning goal? This can't be undone.", () => {
          Storage.Learning.delete(id);
          Storage.Activity.log("Deleted a learning goal");
          render();
          Dashboard.render();
          Analytics.render();
          UI.toast("Learning goal deleted", "info");
        });
      })
    );
  }

  function openForm(id) {
    const existing = id ? Storage.Learning.getAll().find((g) => g.id === id) : null;
    const body = `
      <form id="learningForm" class="form-grid">
        <div class="field field--wide">
          <label for="goalTopic">Topic</label>
          <input type="text" id="goalTopic" required placeholder="e.g. React Fundamentals" value="${existing ? escapeHtml(existing.topic) : ""}">
        </div>
        <div class="field">
          <label for="goalProgress">Progress: <span id="goalProgressValue">${existing ? existing.progress : 0}</span>%</label>
          <input type="range" id="goalProgress" min="0" max="100" step="5" value="${existing ? existing.progress : 0}">
        </div>
        <div class="field">
          <label for="goalTargetDate">Target date</label>
          <input type="date" id="goalTargetDate" value="${existing ? existing.targetDate || "" : ""}">
        </div>
        <div class="field field--wide">
          <label for="goalStatus">Status</label>
          <select id="goalStatus">
            ${STATUSES.map((s) => `<option ${existing && existing.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-actions field--wide">
          <button type="submit" class="btn btn--primary">${existing ? "Save changes" : "Add goal"}</button>
        </div>
      </form>`;
    UI.openModal(existing ? "Edit learning goal" : "Add learning goal", body);

    document.getElementById("goalProgress").addEventListener("input", (e) => {
      document.getElementById("goalProgressValue").textContent = e.target.value;
    });

    document.getElementById("learningForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const topic = document.getElementById("goalTopic").value.trim();
      if (!topic) return;
      const payload = {
        topic,
        progress: Number(document.getElementById("goalProgress").value),
        targetDate: document.getElementById("goalTargetDate").value,
        status: document.getElementById("goalStatus").value,
      };
      if (existing) {
        Storage.Learning.update(existing.id, payload);
        Storage.Activity.log(`Updated learning goal "${topic}"`);
        UI.toast("Learning goal updated", "success");
      } else {
        Storage.Learning.add(payload);
        Storage.Activity.log(`Added learning goal "${topic}"`);
        UI.toast("Learning goal added", "success");
      }
      UI.closeModal();
      render();
      Dashboard.render();
      Analytics.render();
    });
  }

  function init() {
    document.getElementById("addLearningBtn").addEventListener("click", () => openForm(null));
    render();
  }

  return { init, render, STATUSES };
})();
