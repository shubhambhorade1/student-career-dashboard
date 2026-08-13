/* =========================================================
   APPLICATIONS
   Internship / Job Application Tracker
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadApplications();

    const applicationForm =
        document.querySelector("#applicationForm");

    if (applicationForm) {
        applicationForm.addEventListener(
            "submit",
            saveApplication
        );
    }

    document.addEventListener(
        "sectionChanged",
        function (event) {
            if (event.detail.section === "applications") {
                loadApplications();
            }
        }
    );
});


/* =========================================================
   LOAD APPLICATIONS
   ========================================================= */

function loadApplications() {
    const data = loadData();

    renderApplications(data.applications);
    updateApplicationStats(data.applications);
}


/* =========================================================
   RENDER APPLICATIONS
   ========================================================= */

function renderApplications(applications) {
    const container =
        document.querySelector(
            "[data-applications-list]"
        );

    if (!container) {
        return;
    }

    if (applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-briefcase"></i>
                </div>

                <h3>No applications yet</h3>

                <p>
                    Start tracking your internship and
                    job applications here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        applications.map(function (application) {

            const statusClass =
                getApplicationStatusClass(
                    application.status
                );

            const interviewDate =
                application.interviewDate
                    ? formatDate(
                        application.interviewDate
                    )
                    : "Not scheduled";

            return `
                <div class="application-card">

                    <div class="application-card-header">

                        <div class="company-icon">
                            <i class="fa-solid fa-building"></i>
                        </div>

                        <div class="application-actions">

                            <button
                                type="button"
                                class="icon-btn"
                                onclick="editApplication('${application.id}')"
                                title="Edit application"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="icon-btn delete-btn"
                                onclick="removeApplication('${application.id}')"
                                title="Delete application"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>

                    <div class="application-card-body">

                        <span class="application-status ${statusClass}">
                            ${escapeHTML(application.status)}
                        </span>

                        <h3>
                            ${escapeHTML(application.position)}
                        </h3>

                        <p class="company-name">
                            ${escapeHTML(application.company)}
                        </p>

                        <div class="application-info">

                            <div>
                                <i class="fa-regular fa-calendar"></i>

                                <span>
                                    Applied:
                                    ${formatDate(application.applicationDate)}
                                </span>
                            </div>

                            <div>
                                <i class="fa-solid fa-calendar-check"></i>

                                <span>
                                    Interview:
                                    ${interviewDate}
                                </span>
                            </div>

                        </div>

                        ${
                            application.notes
                                ? `
                                <div class="application-notes">
                                    <strong>Notes:</strong>
                                    ${escapeHTML(application.notes)}
                                </div>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   APPLICATION STATUS CLASS
   ========================================================= */

function getApplicationStatusClass(status) {
    const classes = {
        Applied: "status-applied",
        Shortlisted: "status-shortlisted",
        Interview: "status-interview",
        Selected: "status-selected",
        Rejected: "status-rejected"
    };

    return classes[status] || "";
}


/* =========================================================
   SAVE APPLICATION
   ========================================================= */

function saveApplication(event) {
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

    const company =
        document.querySelector("#company")
            ?.value.trim();

    const position =
        document.querySelector("#position")
            ?.value.trim();

    const applicationDate =
        document.querySelector("#applicationDate")
            ?.value;

    const status =
        document.querySelector("#applicationStatus")
            ?.value;

    const interviewDate =
        document.querySelector("#interviewDate")
            ?.value;

    const notes =
        document.querySelector("#applicationNotes")
            ?.value.trim();

    if (!company) {
        showToast(
            "Please enter the company name.",
            "warning"
        );

        return;
    }

    if (!position) {
        showToast(
            "Please enter the position.",
            "warning"
        );

        return;
    }

    if (!applicationDate) {
        showToast(
            "Please select the application date.",
            "warning"
        );

        return;
    }

    if (!status) {
        showToast(
            "Please select an application status.",
            "warning"
        );

        return;
    }

    /*
     * Interview date should not be before
     * application date.
     */
    if (
        interviewDate &&
        interviewDate < applicationDate
    ) {
        showToast(
            "Interview date cannot be before the application date.",
            "warning"
        );

        return;
    }

    const applicationData = {
        company: company,
        position: position,
        applicationDate: applicationDate,
        status: status,
        interviewDate: interviewDate,
        notes: notes
    };

    const editingId =
        appState.editingId;

    if (editingId) {

        updateItem(
            "applications",
            editingId,
            applicationData
        );

        addActivity(
            "application",
            `Updated ${position} application at ${company}`
        );

        showToast(
            "Application updated successfully!",
            "success"
        );

    } else {

        addItem(
            "applications",
            applicationData
        );

        addActivity(
            "application",
            `Applied for ${position} at ${company}`
        );

        showToast(
            "Application added successfully!",
            "success"
        );
    }

    resetApplicationForm();

    loadApplications();

    document.dispatchEvent(
        new CustomEvent("applicationsUpdated")
    );
}


/* =========================================================
   EDIT APPLICATION
   ========================================================= */

function editApplication(id) {
    const application =
        findItem(
            "applications",
            id
        );

    if (!application) {
        showToast(
            "Application could not be found.",
            "error"
        );

        return;
    }

    appState.editingId = id;

    setInputValue(
        "#company",
        application.company
    );

    setInputValue(
        "#position",
        application.position
    );

    setInputValue(
        "#applicationDate",
        application.applicationDate
    );

    setInputValue(
        "#applicationStatus",
        application.status
    );

    setInputValue(
        "#interviewDate",
        application.interviewDate
    );

    setInputValue(
        "#applicationNotes",
        application.notes
    );

    const formTitle =
        document.querySelector(
            "[data-application-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Edit Application";
    }

    const submitButton =
        document.querySelector(
            "#applicationForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-check"></i> Update Application`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-application]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "inline-flex";
    }

    const form =
        document.querySelector(
            "#applicationForm"
        );

    if (form) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


/* =========================================================
   DELETE APPLICATION
   ========================================================= */

function removeApplication(id) {
    const application =
        findItem(
            "applications",
            id
        );

    if (!application) {
        return;
    }

    const confirmed =
        confirmDelete(
            `"${application.position} at ${application.company}"`
        );

    if (!confirmed) {
        return;
    }

    deleteItem(
        "applications",
        id
    );

    addActivity(
        "application",
        `Deleted ${application.position} application`
    );

    showToast(
        "Application deleted successfully.",
        "success"
    );

    loadApplications();

    document.dispatchEvent(
        new CustomEvent("applicationsUpdated")
    );
}


/* =========================================================
   RESET APPLICATION FORM
   ========================================================= */

function resetApplicationForm() {
    const form =
        document.querySelector(
            "#applicationForm"
        );

    if (form) {
        form.reset();
    }

    appState.editingId = null;

    const formTitle =
        document.querySelector(
            "[data-application-form-title]"
        );

    if (formTitle) {
        formTitle.textContent =
            "Add Application";
    }

    const submitButton =
        document.querySelector(
            "#applicationForm button[type='submit']"
        );

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fa-solid fa-plus"></i> Add Application`;
    }

    const cancelButton =
        document.querySelector(
            "[data-cancel-application]"
        );

    if (cancelButton) {
        cancelButton.style.display =
            "none";
    }
}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

const cancelApplicationButton =
    document.querySelector(
        "[data-cancel-application]"
    );

if (cancelApplicationButton) {
    cancelApplicationButton.addEventListener(
        "click",
        function () {
            resetApplicationForm();
        }
    );
}


/* =========================================================
   APPLICATION STATISTICS
   ========================================================= */

function updateApplicationStats(
    applications
) {
    const total =
        applications.length;

    const applied =
        applications.filter(function (item) {
            return item.status === "Applied";
        }).length;

    const shortlisted =
        applications.filter(function (item) {
            return item.status === "Shortlisted";
        }).length;

    const interviews =
        applications.filter(function (item) {
            return item.status === "Interview";
        }).length;

    const selected =
        applications.filter(function (item) {
            return item.status === "Selected";
        }).length;

    const rejected =
        applications.filter(function (item) {
            return item.status === "Rejected";
        }).length;

    const active =
        applications.filter(function (item) {
            return (
                item.status !== "Rejected" &&
                item.status !== "Selected"
            );
        }).length;

    setElementText(
        "[data-application-total]",
        total
    );

    setElementText(
        "[data-application-applied]",
        applied
    );

    setElementText(
        "[data-application-shortlisted]",
        shortlisted
    );

    setElementText(
        "[data-application-interview]",
        interviews
    );

    setElementText(
        "[data-application-selected]",
        selected
    );

    setElementText(
        "[data-application-rejected]",
        rejected
    );

    setElementText(
        "[data-stat='applications']",
        active
    );
}
