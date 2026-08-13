/* =========================================================
   ANALYTICS
   ========================================================= */

let skillsChart = null;
let applicationsChart = null;
let learningChart = null;
let projectsChart = null;


/* =========================================================
   INITIALIZE ANALYTICS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadAnalytics();

    document.addEventListener(
        "sectionChanged",
        function (event) {
            if (event.detail.section === "analytics") {
                loadAnalytics();
            }
        }
    );

    /*
     * Update charts whenever data changes.
     */
    document.addEventListener(
        "skillsUpdated",
        loadAnalytics
    );

    document.addEventListener(
        "projectsUpdated",
        loadAnalytics
    );

    document.addEventListener(
        "applicationsUpdated",
        loadAnalytics
    );

    document.addEventListener(
        "learningUpdated",
        loadAnalytics
    );

    document.addEventListener(
        "themeChanged",
        loadAnalytics
    );
});


/* =========================================================
   LOAD ANALYTICS
   ========================================================= */

function loadAnalytics() {
    if (typeof Chart === "undefined") {
        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }

    const data = loadData();

    createSkillsChart(data.skills);
    createApplicationsChart(data.applications);
    createLearningChart(data.learning);
    createProjectsChart(data.projects);
}


/* =========================================================
   SKILLS DISTRIBUTION CHART
   ========================================================= */

function createSkillsChart(skills) {
    const canvas =
        document.querySelector(
            "#skillsDistributionChart"
        );

    if (!canvas) {
        return;
    }

    const categories = {};

    skills.forEach(function (skill) {

        if (!categories[skill.category]) {
            categories[skill.category] = 0;
        }

        categories[skill.category]++;
    });

    const labels =
        Object.keys(categories);

    const values =
        Object.values(categories);

    if (skillsChart) {
        skillsChart.destroy();
    }

    skillsChart = new Chart(
        canvas,
        {
            type: "doughnut",

            data: {
                labels: labels,

                datasets: [
                    {
                        data: values,

                        backgroundColor: [
                            "#6366f1",
                            "#8b5cf6",
                            "#06b6d4",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444"
                        ],

                        borderWidth: 0
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        }
    );
}


/* =========================================================
   APPLICATION STATUS CHART
   ========================================================= */

function createApplicationsChart(
    applications
) {
    const canvas =
        document.querySelector(
            "#applicationStatusChart"
        );

    if (!canvas) {
        return;
    }

    const statuses = [
        "Applied",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected"
    ];

    const values =
        statuses.map(function (status) {

            return applications.filter(
                function (application) {
                    return (
                        application.status ===
                        status
                    );
                }
            ).length;

        });

    if (applicationsChart) {
        applicationsChart.destroy();
    }

    applicationsChart = new Chart(
        canvas,
        {
            type: "bar",

            data: {
                labels: statuses,

                datasets: [
                    {
                        label:
                            "Applications",

                        data: values,

                        backgroundColor: [
                            "#6366f1",
                            "#8b5cf6",
                            "#06b6d4",
                            "#10b981",
                            "#ef4444"
                        ],

                        borderRadius: 8
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

                        ticks: {
                            precision: 0
                        },

                        grid: {
                            color:
                                getAnalyticsGridColor()
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
   LEARNING PROGRESS CHART
   ========================================================= */

function createLearningChart(
    learning
) {
    const canvas =
        document.querySelector(
            "#learningProgressChart"
        );

    if (!canvas) {
        return;
    }

    const labels =
        learning.map(function (item) {
            return item.topic;
        });

    const values =
        learning.map(function (item) {
            return Number(item.progress) || 0;
        });

    if (learningChart) {
        learningChart.destroy();
    }

    learningChart = new Chart(
        canvas,
        {
            type: "bar",

            data: {
                labels: labels,

                datasets: [
                    {
                        label:
                            "Progress",

                        data: values,

                        backgroundColor:
                            "#6366f1",

                        borderRadius: 8
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                indexAxis: "y",

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,

                        max: 100,

                        ticks: {
                            callback:
                                function (value) {
                                    return (
                                        value +
                                        "%"
                                    );
                                }
                        },

                        grid: {
                            color:
                                getAnalyticsGridColor()
                        }
                    },

                    y: {
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
   PROJECT TECHNOLOGY CHART
   ========================================================= */

function createProjectsChart(
    projects
) {
    const canvas =
        document.querySelector(
            "#projectsTechnologyChart"
        );

    if (!canvas) {
        return;
    }

    const technologies = {};

    projects.forEach(function (project) {

        if (
            !Array.isArray(
                project.technologies
            )
        ) {
            return;
        }

        project.technologies.forEach(
            function (technology) {

                const name =
                    technology.trim();

                if (!name) {
                    return;
                }

                if (!technologies[name]) {
                    technologies[name] = 0;
                }

                technologies[name]++;
            }
        );
    });

    const labels =
        Object.keys(technologies);

    const values =
        Object.values(technologies);

    if (projectsChart) {
        projectsChart.destroy();
    }

    projectsChart = new Chart(
        canvas,
        {
            type: "doughnut",

            data: {
                labels: labels,

                datasets: [
                    {
                        data: values,

                        backgroundColor: [
                            "#6366f1",
                            "#8b5cf6",
                            "#06b6d4",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#ec4899",
                            "#14b8a6"
                        ],

                        borderWidth: 0
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                cutout: "60%",

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        }
    );
}


/* =========================================================
   CHART GRID COLOR
   ========================================================= */

function getAnalyticsGridColor() {
    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );

    if (darkMode) {
        return "rgba(148, 163, 184, 0.12)";
    }

    return "rgba(148, 163, 184, 0.18)";
}


/* =========================================================
   CLEANUP CHARTS
   ========================================================= */

function destroyAnalyticsCharts() {

    if (skillsChart) {
        skillsChart.destroy();
        skillsChart = null;
    }

    if (applicationsChart) {
        applicationsChart.destroy();
        applicationsChart = null;
    }

    if (learningChart) {
        learningChart.destroy();
        learningChart = null;
    }

    if (projectsChart) {
        projectsChart.destroy();
        projectsChart = null;
    }
}
