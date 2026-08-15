/**
 * skills.js — Skills CRUD with category filter and progress bars.
 */
const SkillsModule = (() => {
  const CATEGORIES = ["Programming", "Web Development", "Database", "Tools", "Soft Skills"];
  let activeFilter = "All";

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderFilters() {
    const row = document.getElementById("skillFilterRow");
    const cats = ["All", ...CATEGORIES];
    row.innerHTML = cats
      .map((c) => `<button class="chip ${c === activeFilter ? "is-active" : ""}" data-filter="${c}">${c}</button>`)
      .join("");
    row.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        render();
      });
    });
  }

  function render() {
    renderFilters();
    const skills = Storage.Skills.getAll().filter((s) => activeFilter === "All" || s.category === activeFilter);
    const list = document.getElementById("skillsList");
    const empty = document.getElementById("skillsEmpty");

    if (skills.length === 0) {
      list.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    list.innerHTML = skills
      .map(
        (s) => `
      <div class="skill-row" data-id="${s.id}">
        <div>
          <p class="skill-row__name">${escapeHtml(s.name)}</p>
          <p class="skill-row__category">${escapeHtml(s.category)}</p>
        </div>
        <span class="skill-row__badge">${s.level}%</span>
        <div class="progress-track"><div class="progress-fill" style="width:${s.level}%"></div></div>
        <div class="skill-row__actions">
          <button class="icon-btn edit-skill" aria-label="Edit skill">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="icon-btn delete-skill" aria-label="Delete skill">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"/></svg>
          </button>
        </div>
      </div>`
      )
      .join("");

    list.querySelectorAll(".edit-skill").forEach((btn) =>
      btn.addEventListener("click", (e) => openForm(e.target.closest(".skill-row").dataset.id))
    );
    list.querySelectorAll(".delete-skill").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".skill-row").dataset.id;
        UI.confirm("Delete this skill? This can't be undone.", () => {
          Storage.Skills.delete(id);
          Storage.Activity.log("Deleted a skill");
          render();
          Dashboard.render();
          Analytics.render();
          UI.toast("Skill deleted", "info");
        });
      })
    );
  }

  function openForm(id) {
    const existing = id ? Storage.Skills.getAll().find((s) => s.id === id) : null;
    const body = `
      <form id="skillForm" class="form-grid">
        <div class="field field--wide">
          <label for="skillName">Skill name</label>
          <input type="text" id="skillName" required placeholder="e.g. React" value="${existing ? escapeHtml(existing.name) : ""}">
        </div>
        <div class="field">
          <label for="skillCategory">Category</label>
          <select id="skillCategory">
            ${CATEGORIES.map((c) => `<option ${existing && existing.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="skillLevel">Proficiency: <span id="skillLevelValue">${existing ? existing.level : 50}</span>%</label>
          <input type="range" id="skillLevel" min="0" max="100" step="5" value="${existing ? existing.level : 50}">
        </div>
        <div class="form-actions field--wide">
          <button type="submit" class="btn btn--primary">${existing ? "Save changes" : "Add skill"}</button>
        </div>
      </form>`;
    UI.openModal(existing ? "Edit skill" : "Add skill", body);

    document.getElementById("skillLevel").addEventListener("input", (e) => {
      document.getElementById("skillLevelValue").textContent = e.target.value;
    });

    document.getElementById("skillForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("skillName").value.trim();
      if (!name) return;
      const payload = {
        name,
        category: document.getElementById("skillCategory").value,
        level: Number(document.getElementById("skillLevel").value),
      };
      if (existing) {
        Storage.Skills.update(existing.id, payload);
        Storage.Activity.log(`Updated skill "${name}"`);
        UI.toast("Skill updated", "success");
      } else {
        Storage.Skills.add(payload);
        Storage.Activity.log(`Added skill "${name}"`);
        UI.toast("Skill added", "success");
      }
      UI.closeModal();
      render();
      Dashboard.render();
      Analytics.render();
    });
  }

  function init() {
    document.getElementById("addSkillBtn").addEventListener("click", () => openForm(null));
    render();
  }

  return { init, render, CATEGORIES };
})();
