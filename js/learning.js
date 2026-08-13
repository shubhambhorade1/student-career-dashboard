/* =========================================================
   LEARNING
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadLearning();

    const learningForm =
        document.querySelector("#learningForm");

    if (learningForm) {
        learningForm.addEventListener(
            "submit",
            saveLearningGoal
        );
    }

    document.addEventListener(
        "sectionChanged",
        function (event) {
            if (event.detail.section === "learning") {
                loadLearning();
            }
        }
    );
});


/* =========================================================
   LOAD LEARNING
   ========================================================= */

function loadLearning() {
    const data = loadData();

    renderLearning(data.learning);
    updateLearningStats(data.learning);
    updateDashboardLearning(data.learning);
}


/* =========================================================
   RENDER LEARNING GOALS
   ========================================================= */

function renderLearning(goals) {
    const container =
        document.querySelector(
            "[data-learning-list]"
        );

    if (!container) {
        return;
    }

    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-book-open"></i>
                </div>

                <h3>No learning goals yet</h3>

                <p>
                    Add a learning goal to start
                    tracking your progress.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        goals.map(function (goal) {

            const progress =
                Math.min(
                    Math.max(
                        Number(goal.progress) || 0,
                        0
                    ),
                    100
                );

            const statusClass =
                getLearningStatusClass(
                    goal.status
                );

            const targetDate =
                goal.targetDate
                    ? formatDate(goal.targetDate)
                    : "No target date";

            return `
                <div class="learning-card">

                    <div class="learning-card-header">

                        <div class="learning-icon">
                            <i class="fa-solid fa-book"></i>
                        </div>

                        <div class="learning-actions">

                            <button
                                type="button"
                                class="icon-btn"
                                onclick="editLearningGoal('${goal.id}')"
                                title="Edit goal"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="icon-btn delete-btn"
                                onclick="removeLearningGoal('${goal.id}')"
                                title="Delete goal"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>

                    <div class="learning-card-body">

                        <div class="learning-title-row">

                            <h3>
                                ${escapeHTML(goal.topic)}
                            </h3>

                            <span class="learning-status ${statusClass}">
                                ${escapeHTML(goal.status)}
                            </span>

                        </div>

                        <div class="learning-progress-info">

                            <span>
                                Progress
                            </span>

                            <strong>
                                ${progress}%
                            </strong>

                        </div>

                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width: ${progress}%"
                            ></div>

                        </div>

                        <div class="learning-target">

                            <i class="fa-regular fa-calendar"></i>

                            Target:
                            ${targetDate}

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   LEARNING STATUS CLASS
   ========================================================= */

function getLearningStatusClass(status) {
    const classes = {
        "Not Started": "learning-not-started",
        "In Progress": "learning-in-progress",
        "Completed": "learning-completed"
    };

    return classes[status] || "";
}


/* =========================================================
   SAVE LEARNING GOAL
   ========================================================= */

function saveLearningGoal(event) {
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

    const topic =
        document.querySelector("#learningTopic")
            ?.value.trim();

    const progress =
        Number(
            document.querySelector("#learningProgress")
                ?.value
        );

    const targetDate =
        document.querySelector("#learningTargetDate")
            ?.value;

    const status =
        document.querySelector("#learningStatus")
            ?.value;

    if (!topic) {
        showToast(
            "Please enter a learning topic.",
            "warning"
        );

        return;
    }

    if (
        Number.isNaN(progress) ||
        progress < 0 ||
        progress > 100
    ) {
        showToast(
            "Progress must be between 0 and 100.",
            "warning"
        );

        return;
    }

    if (!status) {
        showToast(
            "Please select a status.",
            "warning"
        );

        return;
    }

    /*
     * Automatically mark as completed
     * when progress reaches 100%.
     */
    let finalStatus = status;

    if (progress === 100) {
        finalStatus = "Completed";
    }

    const learningData = {
        topic: topic,
        progress: progress,
        targetDate: targetDate,
        status: finalStatus
    };

    const editingId =
        appState.editingId;

    if (editingId) {

        updateItem(
            "learning",
            editingId,
            learningData
        );

        addActivity(
            "learning",
            `Updated ${topic} learning goal`
        );

        showToast(
            "Learning goal updated successfully!",
            "success"
        );

    } else {

        addItem(
            "learning",
            learningData
        );

        addActivity(
            "learning",
            `Added ${topic} learning goal`
        );

        showToast(
            "Learning goal added successfully!",
            "success"
        );
    }

    resetLearningForm();

    loadLearning();

    document.dispatchEvent(
        new CustomEvent("learningUpdated")
    );
}


/* =========================================================
   EDIT LEARNING GOAL
   ========================================================= */

function editLearningGoal(id) {
    const goal =
        findItem(
            "learning",
            id
        );

    if (!goal) {
        showToast(
            "Learning goal could not be found.",
            "error"
        );

        return;
    }

    appState.editingId = id;

    setInputValue(
        "#learningTopic",
        goal.topic
    );

    setInputValue(
        "#learningProgress",
        goal.progress
    );

    setInputValue(
        "#learningTargetDate",
        goal.targetDate
    );

    setInputValue(
        "#learningStatus",
        goal.status
    );

    const formTitle =
        document.querySelector(
            "[data-learning-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Edit Learning Goal";
    }

    const submitButton =
        document.querySelector(
            "#learningForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-check"></i> Update Goal`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-learning]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "inline-flex";
    }

    const form =
        document.querySelector(
            "#learningForm"
        );

    if (form) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


/* =========================================================
   DELETE LEARNING GOAL
   ========================================================= */

function removeLearningGoal(id) {
    const goal =
        findItem(
            "learning",
            id
        );

    if (!goal) {
        return;
    }

    const confirmed =
        confirmDelete(
            `"${goal.topic}"`
        );

    if (!confirmed) {
        return;
    }

    deleteItem(
        "learning",
        id
    );

    addActivity(
        "learning",
        `Deleted ${goal.topic} learning goal`
    );

    showToast(
        "Learning goal deleted successfully.",
        "success"
    );

    loadLearning();

    document.dispatchEvent(
        new CustomEvent("learningUpdated")
    );
}


/* =========================================================
   RESET LEARNING FORM
   ========================================================= */

function resetLearningForm() {
    const form =
        document.querySelector(
            "#learningForm"
        );

    if (form) {
        form.reset();
    }

    appState.editingId = null;

    const formTitle =
        document.querySelector(
            "[data-learning-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Add Learning Goal";
    }

    const submitButton =
        document.querySelector(
            "#learningForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-plus"></i> Add Goal`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-learning]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "none";
    }
}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

const cancelLearningButton =
    document.querySelector(
        "[data-cancel-learning]"
    );

if (cancelLearningButton) {
    cancelLearningButton.addEventListener(
        "click",
        function () {
            resetLearningForm();
        }
    );
}


/* =========================================================
   LEARNING STATISTICS
   ========================================================= */

function updateLearningStats(goals) {
    const total =
        goals.length;

    const completed =
        goals.filter(function (goal) {
            return goal.status === "Completed";
        }).length;

    const inProgress =
        goals.filter(function (goal) {
            return goal.status === "In Progress";
        }).length;

    const average =
        total > 0
            ? Math.round(
                goals.reduce(function (
                    totalProgress,
                    goal
                ) {
                    return (
                        totalProgress +
                        Number(goal.progress)
                    );
                }, 0) / total
            )
            : 0;

    setElementText(
        "[data-learning-total]",
        total
    );

    setElementText(
        "[data-learning-completed]",
        completed
    );

    setElementText(
        "[data-learning-in-progress]",
        inProgress
    );

    setElementText(
        "[data-learning-average]",
        average + "%"
    );

    setElementText(
        "[data-stat='learning']",
        average + "%"
    );
}


/* =========================================================
   DASHBOARD LEARNING UPDATE
   ========================================================= */

function updateDashboardLearning(goals) {
    const average =
        goals.length > 0
            ? Math.round(
                goals.reduce(function (
                    total,
                    goal
                ) {
                    return (
                        total +
                        Number(goal.progress)
                    );
                }, 0) / goals.length
            )
            : 0;

    setElementText(
        "[data-stat='learning']",
        average + "%"
    );
}
