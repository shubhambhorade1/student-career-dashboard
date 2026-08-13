/* =========================================================
   SKILLS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadSkills();

    const skillForm =
        document.querySelector("#skillForm");

    if (skillForm) {
        skillForm.addEventListener(
            "submit",
            saveSkill
        );
    }

    document.addEventListener(
        "sectionChanged",
        function (event) {
            if (event.detail.section === "skills") {
                loadSkills();
            }
        }
    );
});


/* =========================================================
   LOAD SKILLS
   ========================================================= */

function loadSkills() {
    const data = loadData();

    renderSkills(data.skills);
    updateSkillCount(data.skills);
}


/* =========================================================
   RENDER SKILLS
   ========================================================= */

function renderSkills(skills) {
    const container =
        document.querySelector(
            "[data-skills-list]"
        );

    if (!container) {
        return;
    }

    if (skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-code"></i>
                </div>

                <h3>No skills added yet</h3>

                <p>
                    Add your first skill to start building
                    your professional profile.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        skills.map(function (skill) {

            const proficiency =
                Number(skill.proficiency) || 0;

            return `
                <div class="skill-card">

                    <div class="skill-card-top">

                        <div>
                            <h3>
                                ${escapeHTML(skill.name)}
                            </h3>

                            <span class="skill-category">
                                ${escapeHTML(skill.category)}
                            </span>
                        </div>

                        <div class="skill-actions">

                            <button
                                type="button"
                                class="icon-btn"
                                onclick="editSkill('${skill.id}')"
                                title="Edit skill"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="icon-btn delete-btn"
                                onclick="removeSkill('${skill.id}')"
                                title="Delete skill"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>

                    <div class="skill-progress-info">

                        <span>
                            Proficiency
                        </span>

                        <strong>
                            ${proficiency}%
                        </strong>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width: ${proficiency}%"
                        ></div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   SAVE SKILL
   ========================================================= */

function saveSkill(event) {
    event.preventDefault();

    const form =
        event.target;

    if (!validateRequiredFields(form)) {
        showToast(
            "Please fill in all required fields.",
            "warning"
        );

        return;
    }

    const name =
        document.querySelector("#skillName")
            ?.value.trim();

    const category =
        document.querySelector("#skillCategory")
            ?.value;

    const proficiency =
        Number(
            document.querySelector("#skillProficiency")
                ?.value
        );

    if (!name) {
        showToast(
            "Please enter a skill name.",
            "warning"
        );

        return;
    }

    if (!category) {
        showToast(
            "Please select a skill category.",
            "warning"
        );

        return;
    }

    if (
        Number.isNaN(proficiency) ||
        proficiency < 0 ||
        proficiency > 100
    ) {
        showToast(
            "Proficiency must be between 0 and 100.",
            "warning"
        );

        return;
    }

    const editingId =
        appState.editingId;

    if (editingId) {

        updateItem(
            "skills",
            editingId,
            {
                name: name,
                category: category,
                proficiency: proficiency
            }
        );

        addActivity(
            "skill",
            `Updated ${name} proficiency to ${proficiency}%`
        );

        showToast(
            "Skill updated successfully!",
            "success"
        );

    } else {

        addItem(
            "skills",
            {
                name: name,
                category: category,
                proficiency: proficiency
            }
        );

        addActivity(
            "skill",
            `Added ${name} skill`
        );

        showToast(
            "Skill added successfully!",
            "success"
        );
    }

    resetSkillForm();
    loadSkills();

    document.dispatchEvent(
        new CustomEvent("skillsUpdated")
    );
}


/* =========================================================
   EDIT SKILL
   ========================================================= */

function editSkill(id) {
    const skill =
        findItem("skills", id);

    if (!skill) {
        showToast(
            "Skill could not be found.",
            "error"
        );

        return;
    }

    appState.editingId = id;

    setInputValue(
        "#skillName",
        skill.name
    );

    setInputValue(
        "#skillCategory",
        skill.category
    );

    setInputValue(
        "#skillProficiency",
        skill.proficiency
    );

    const formTitle =
        document.querySelector(
            "[data-skill-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Edit Skill";
    }

    const submitButton =
        document.querySelector(
            "#skillForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-check"></i> Update Skill`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-skill]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "inline-flex";
    }

    /*
     * Scroll to form.
     */
    const form =
        document.querySelector(
            "#skillForm"
        );

    if (form) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


/* =========================================================
   DELETE SKILL
   ========================================================= */

function removeSkill(id) {
    const skill =
        findItem("skills", id);

    if (!skill) {
        return;
    }

    const confirmed =
        confirmDelete(
            `"${skill.name}"`
        );

    if (!confirmed) {
        return;
    }

    deleteItem(
        "skills",
        id
    );

    addActivity(
        "skill",
        `Deleted ${skill.name} skill`
    );

    showToast(
        "Skill deleted successfully.",
        "success"
    );

    loadSkills();

    document.dispatchEvent(
        new CustomEvent("skillsUpdated")
    );
}


/* =========================================================
   RESET SKILL FORM
   ========================================================= */

function resetSkillForm() {
    const form =
        document.querySelector(
            "#skillForm"
        );

    if (form) {
        form.reset();
    }

    appState.editingId = null;

    const formTitle =
        document.querySelector(
            "[data-skill-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Add New Skill";
    }

    const submitButton =
        document.querySelector(
            "#skillForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-plus"></i> Add Skill`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-skill]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "none";
    }
}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

const cancelSkillButton =
    document.querySelector(
        "[data-cancel-skill]"
    );

if (cancelSkillButton) {
    cancelSkillButton.addEventListener(
        "click",
        function () {
            resetSkillForm();
        }
    );
}


/* =========================================================
   UPDATE SKILL COUNT
   ========================================================= */

function updateSkillCount(skills) {
    setElementText(
        "[data-skill-count]",
        skills.length
    );

    setElementText(
        "[data-stat='skills']",
        skills.length
    );
}
