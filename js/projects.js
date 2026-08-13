/* =========================================================
   PROJECTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadProjects();

    const projectForm =
        document.querySelector("#projectForm");

    if (projectForm) {
        projectForm.addEventListener(
            "submit",
            saveProject
        );
    }

    document.addEventListener(
        "sectionChanged",
        function (event) {
            if (event.detail.section === "projects") {
                loadProjects();
            }
        }
    );
});


/* =========================================================
   LOAD PROJECTS
   ========================================================= */

function loadProjects() {
    const data = loadData();

    renderProjects(data.projects);

    updateProjectCount(data.projects);
}


/* =========================================================
   RENDER PROJECTS
   ========================================================= */

function renderProjects(projects) {
    const container =
        document.querySelector(
            "[data-projects-list]"
        );

    if (!container) {
        return;
    }

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-folder-open"></i>
                </div>

                <h3>No projects yet</h3>

                <p>
                    Add your first project to showcase
                    your work and technical skills.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        projects.map(function (project) {

            const technologies =
                Array.isArray(project.technologies)
                    ? project.technologies
                    : [];

            const technologyHTML =
                technologies.map(function (technology) {
                    return `
                        <span class="technology-tag">
                            ${escapeHTML(technology)}
                        </span>
                    `;
                }).join("");

            const statusClass =
                getProjectStatusClass(
                    project.status
                );

            return `
                <div class="project-card">

                    <div class="project-card-header">

                        <div class="project-icon">
                            <i class="fa-solid fa-code"></i>
                        </div>

                        <div class="project-actions">

                            <button
                                type="button"
                                class="icon-btn"
                                onclick="editProject('${project.id}')"
                                title="Edit project"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="icon-btn delete-btn"
                                onclick="removeProject('${project.id}')"
                                title="Delete project"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>

                    <div class="project-card-body">

                        <div class="project-status ${statusClass}">
                            ${escapeHTML(project.status)}
                        </div>

                        <h3 class="project-title">
                            ${escapeHTML(project.title)}
                        </h3>

                        <p class="project-description">
                            ${escapeHTML(project.description)}
                        </p>

                        <div class="project-technologies">
                            ${technologyHTML}
                        </div>

                    </div>

                    <div class="project-card-footer">

                        <div class="project-category">
                            <i class="fa-solid fa-layer-group"></i>
                            ${escapeHTML(project.category)}
                        </div>

                        <div class="project-links">

                            ${
                                project.githubUrl
                                    ? `
                                    <a
                                        href="${escapeHTML(project.githubUrl)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="project-link"
                                        title="GitHub"
                                    >
                                        <i class="fa-brands fa-github"></i>
                                    </a>
                                    `
                                    : ""
                            }

                            ${
                                project.liveUrl
                                    ? `
                                    <a
                                        href="${escapeHTML(project.liveUrl)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="project-link"
                                        title="Live Demo"
                                    >
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    </a>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   PROJECT STATUS CLASS
   ========================================================= */

function getProjectStatusClass(status) {
    if (status === "Completed") {
        return "status-completed";
    }

    if (status === "In Progress") {
        return "status-progress";
    }

    if (status === "Planned") {
        return "status-planned";
    }

    return "";
}


/* =========================================================
   SAVE PROJECT
   ========================================================= */

function saveProject(event) {
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

    const title =
        document.querySelector("#projectTitle")
            ?.value.trim();

    const description =
        document.querySelector("#projectDescription")
            ?.value.trim();

    const technologiesInput =
        document.querySelector("#projectTechnologies")
            ?.value.trim();

    const githubUrl =
        document.querySelector("#projectGithub")
            ?.value.trim();

    const liveUrl =
        document.querySelector("#projectLive")
            ?.value.trim();

    const status =
        document.querySelector("#projectStatus")
            ?.value;

    const category =
        document.querySelector("#projectCategory")
            ?.value;

    if (!title) {
        showToast(
            "Please enter a project title.",
            "warning"
        );

        return;
    }

    if (!description) {
        showToast(
            "Please enter a project description.",
            "warning"
        );

        return;
    }

    if (!technologiesInput) {
        showToast(
            "Please enter at least one technology.",
            "warning"
        );

        return;
    }

    /*
     * Convert comma-separated technologies
     * into an array.
     */
    const technologies =
        technologiesInput
            .split(",")
            .map(function (technology) {
                return technology.trim();
            })
            .filter(function (technology) {
                return technology !== "";
            });

    /*
     * Validate URLs only when provided.
     */
    if (
        githubUrl &&
        !isValidURL(githubUrl)
    ) {
        showToast(
            "Please enter a valid GitHub URL.",
            "warning"
        );

        return;
    }

    if (
        liveUrl &&
        !isValidURL(liveUrl)
    ) {
        showToast(
            "Please enter a valid live demo URL.",
            "warning"
        );

        return;
    }

    const projectData = {
        title: title,
        description: description,
        technologies: technologies,
        githubUrl: githubUrl,
        liveUrl: liveUrl,
        status: status,
        category: category
    };

    const editingId =
        appState.editingId;

    if (editingId) {

        updateItem(
            "projects",
            editingId,
            projectData
        );

        addActivity(
            "project",
            `Updated ${title} project`
        );

        showToast(
            "Project updated successfully!",
            "success"
        );

    } else {

        addItem(
            "projects",
            projectData
        );

        addActivity(
            "project",
            `Added ${title} project`
        );

        showToast(
            "Project added successfully!",
            "success"
        );
    }

    resetProjectForm();

    loadProjects();

    document.dispatchEvent(
        new CustomEvent("projectsUpdated")
    );
}


/* =========================================================
   EDIT PROJECT
   ========================================================= */

function editProject(id) {
    const project =
        findItem("projects", id);

    if (!project) {
        showToast(
            "Project could not be found.",
            "error"
        );

        return;
    }

    appState.editingId = id;

    setInputValue(
        "#projectTitle",
        project.title
    );

    setInputValue(
        "#projectDescription",
        project.description
    );

    setInputValue(
        "#projectTechnologies",
        project.technologies.join(", ")
    );

    setInputValue(
        "#projectGithub",
        project.githubUrl
    );

    setInputValue(
        "#projectLive",
        project.liveUrl
    );

    setInputValue(
        "#projectStatus",
        project.status
    );

    setInputValue(
        "#projectCategory",
        project.category
    );

    const formTitle =
        document.querySelector(
            "[data-project-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Edit Project";
    }

    const submitButton =
        document.querySelector(
            "#projectForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-check"></i> Update Project`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-project]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "inline-flex";
    }

    const form =
        document.querySelector(
            "#projectForm"
        );

    if (form) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


/* =========================================================
   DELETE PROJECT
   ========================================================= */

function removeProject(id) {
    const project =
        findItem("projects", id);

    if (!project) {
        return;
    }

    const confirmed =
        confirmDelete(
            `"${project.title}"`
        );

    if (!confirmed) {
        return;
    }

    deleteItem(
        "projects",
        id
    );

    addActivity(
        "project",
        `Deleted ${project.title} project`
    );

    showToast(
        "Project deleted successfully.",
        "success"
    );

    loadProjects();

    document.dispatchEvent(
        new CustomEvent("projectsUpdated")
    );
}


/* =========================================================
   RESET PROJECT FORM
   ========================================================= */

function resetProjectForm() {
    const form =
        document.querySelector(
            "#projectForm"
        );

    if (form) {
        form.reset();
    }

    appState.editingId = null;

    const formTitle =
        document.querySelector(
            "[data-project-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Add New Project";
    }

    const submitButton =
        document.querySelector(
            "#projectForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-plus"></i> Add Project`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-project]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "none";
    }
}


/* =========================================================
   CANCEL PROJECT EDIT
   ========================================================= */

const cancelProjectButton =
    document.querySelector(
        "[data-cancel-project]"
    );

if (cancelProjectButton) {
    cancelProjectButton.addEventListener(
        "click",
        function () {
            resetProjectForm();
        }
    );
}


/* =========================================================
   UPDATE PROJECT COUNT
   ========================================================= */

function updateProjectCount(projects) {
    setElementText(
        "[data-project-count]",
        projects.length
    );

    setElementText(
        "[data-stat='projects']",
        projects.length
    );
}
