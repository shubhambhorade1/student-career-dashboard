/* =========================================================
   DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadDashboard();

    document.addEventListener("sectionChanged", function (event) {
        if (event.detail.section === "dashboard") {
            loadDashboard();
        }
    });
});


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

function loadDashboard() {
    const data = loadData();

    updateDashboardStats(data);
    updateProfileCompletion(data);
    updateRecentActivities(data);
    updateLearningProgress(data);
    updateDashboardChart(data);
}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

function updateDashboardStats(data) {
    const totalSkills = data.skills.length;
    const totalProjects = data.projects.length;

    const activeApplications =
        data.applications.filter(function (application) {
            return (
                application.status !== "Rejected" &&
                application.status !== "Selected"
            );
        }).length;

    const learningProgress =
        data.learning.length > 0
            ? Math.round(
                data.learning.reduce(function (total, item) {
                    return total + Number(item.progress);
                }, 0) / data.learning.length
            )
            : 0;

    setElementText(
        "[data-stat='skills']",
        totalSkills
    );

    setElementText(
        "[data-stat='projects']",
        totalProjects
    );

    setElementText(
        "[data-stat='applications']",
        activeApplications
    );

    setElementText(
        "[data-stat='learning']",
        learningProgress + "%"
    );
}


/* =========================================================
   PROFILE COMPLETION
   ========================================================= */

function updateProfileCompletion(data) {
    const percentage =
        calculateProfileCompletion(data.profile);

    const percentageText =
        document.querySelector(
            "[data-profile-percentage]"
        );

    if (percentageText) {
        percentageText.textContent =
            percentage + "%";
    }

    const progressCircle =
        document.querySelector(
            "[data-profile-circle]"
        );

    if (progressCircle) {
        const degrees =
            (percentage / 100) * 360;

        progressCircle.style.background =
            `conic-gradient(
                var(--primary) ${degrees}deg,
                var(--border-color) ${degrees}deg
            )`;
    }

    const progressBar =
        document.querySelector(
            "[data-profile-progress]"
        );

    if (progressBar) {
        progressBar.style.width =
            percentage + "%";
    }
}


/* =========================================================
   RECENT ACTIVITIES
   ========================================================= */

function updateRecentActivities(data) {
    const activityContainer =
        document.querySelector(
            "[data-recent-activities]"
        );

    if (!activityContainer) {
        return;
    }

    const activities =
        data.activities.slice(0, 5);

    if (activities.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>

                <h3>No recent activity</h3>

                <p>
                    Your recent career activities will appear here.
                </p>
            </div>
        `;

        return;
    }

    activityContainer.innerHTML =
        activities.map(function (activity) {

            const icon =
                getActivityIcon(activity.type);

            return `
                <div class="activity-item">

                    <div class="activity-icon">
                        <i class="fa-solid ${icon}"></i>
                    </div>

                    <div class="activity-content">

                        <div class="activity-text">
                            ${escapeHTML(activity.text)}
                        </div>

                        <div class="activity-time">
                            ${getRelativeTime(activity.date)}
                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   ACTIVITY ICON
   ========================================================= */

function getActivityIcon(type) {
    const icons = {
        project: "fa-folder",
        skill: "fa-code",
        application: "fa-briefcase",
        learning: "fa-book-open",
        profile: "fa-user"
    };

    return icons[type] || "fa-bell";
}


/* =========================================================
   LEARNING PROGRESS
   ========================================================= */

function updateLearningProgress(data) {
    const container =
        document.querySelector(
            "[data-learning-progress]"
        );

    if (!container) {
        return;
    }

    const learningItems =
        data.learning.slice(0, 4);

    if (learningItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-book"></i>
                </div>

                <h3>No learning goals</h3>

                <p>
                    Add a learning goal to start tracking your progress.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        learningItems.map(function (item) {

            const progress =
                Number(item.progress) || 0;

            return `
                <div class="progress-wrapper mb-20">

                    <div class="progress-label">

                        <span>
                            ${escapeHTML(item.topic)}
                        </span>

                        <span>
                            ${progress}%
                        </span>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width: ${progress}%"
                        ></div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   DASHBOARD CAREER CHART
   ========================================================= */

let dashboardChart = null;

function updateDashboardChart(data) {
    const canvas =
        document.querySelector(
            "#careerProgressChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const learningProgress =
        data.learning.length > 0
            ? Math.round(
                data.learning.reduce(function (total, item) {
                    return total + Number(item.progress);
                }, 0) / data.learning.length
            )
            : 0;

    const profileProgress =
        calculateProfileCompletion(data.profile);

    const skillsProgress =
        data.skills.length > 0
            ? Math.min(
                Math.round(
                    data.skills.reduce(function (
                        total,
                        skill
                    ) {
                        return (
                            total +
                            Number(skill.proficiency)
                        );
                    }, 0) /
                    data.skills.length
                ),
                100
            )
            : 0;

    const projectProgress =
        Math.min(
            data.projects.length * 20,
            100
        );

    const applicationProgress =
        Math.min(
            data.applications.length * 20,
            100
        );

    if (dashboardChart) {
        dashboardChart.destroy();
    }

    dashboardChart = new Chart(
        canvas,
        {
            type: "line",

            data: {
                labels: [
                    "Profile",
                    "Skills",
                    "Projects",
                    "Applications",
                    "Learning"
                ],

                datasets: [
                    {
                        label: "Career Progress",

                        data: [
                            profileProgress,
                            skillsProgress,
                            projectProgress,
                            applicationProgress,
                            learningProgress
                        ],

                        borderColor:
                            "#6366f1",

                        backgroundColor:
                            "rgba(99, 102, 241, 0.12)",

                        borderWidth: 3,

                        pointBackgroundColor:
                            "#6366f1",

                        pointBorderColor:
                            "#ffffff",

                        pointBorderWidth: 2,

                        pointRadius: 5,

                        tension: 0.4,

                        fill: true
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        max: 100,

                        ticks: {
                            callback: function (value) {
                                return value + "%";
                            }
                        },

                        grid: {
                            color:
                                getChartGridColor()
                        }
                    },

                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        }
    );
}


/* =========================================================
   CHART GRID COLOR
   ========================================================= */

function getChartGridColor() {
    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );

    return darkMode
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.18)";
}


/* =========================================================
   SIMPLE DOM HELPER
   ========================================================= */

function setElementText(selector, value) {
    const element =
        document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   UPDATE CHART WHEN THEME CHANGES
   ========================================================= */

document.addEventListener(
    "themeChanged",
    function () {
        const data = loadData();

        updateDashboardChart(data);
    }
);
