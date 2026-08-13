/* =========================================================
   STUDENT CAREER DASHBOARD
   LocalStorage & Data Management
   ========================================================= */

const STORAGE_KEY = "studentCareerDashboardData";
const THEME_KEY = "studentCareerDashboardTheme";

/* =========================================================
   DEMO DATA
   ========================================================= */

const defaultData = {
    profile: {
        fullName: "Alex Johnson",
        college: "Greenfield Institute of Technology",
        course: "B.Tech Computer Science",
        year: "3rd Year",
        location: "Pune, Maharashtra",
        email: "alex.johnson@example.com",
        github: "https://github.com/",
        linkedin: "https://linkedin.com/",
        bio: "Computer Science student passionate about web development, problem solving, and building useful digital products.",
        photo: ""
    },

    skills: [
        {
            id: generateId(),
            name: "JavaScript",
            category: "Programming",
            proficiency: 85
        },
        {
            id: generateId(),
            name: "HTML & CSS",
            category: "Web Development",
            proficiency: 90
        },
        {
            id: generateId(),
            name: "React Concepts",
            category: "Web Development",
            proficiency: 70
        },
        {
            id: generateId(),
            name: "MySQL",
            category: "Database",
            proficiency: 65
        },
        {
            id: generateId(),
            name: "Git & GitHub",
            category: "Tools",
            proficiency: 80
        },
        {
            id: generateId(),
            name: "Communication",
            category: "Soft Skills",
            proficiency: 85
        }
    ],

    projects: [
        {
            id: generateId(),
            title: "Student Career Dashboard",
            description:
                "A modern career management dashboard that helps students manage skills, projects, learning goals and job applications.",
            technologies: [
                "HTML",
                "CSS",
                "JavaScript",
                "Chart.js"
            ],
            githubUrl: "https://github.com/",
            liveUrl: "",
            status: "Completed",
            category: "Web Development"
        },
        {
            id: generateId(),
            title: "Expense Tracker",
            description:
                "A responsive personal expense tracker for monitoring income, spending categories and monthly financial activity.",
            technologies: [
                "HTML",
                "CSS",
                "JavaScript"
            ],
            githubUrl: "https://github.com/",
            liveUrl: "",
            status: "Completed",
            category: "Web Development"
        },
        {
            id: generateId(),
            title: "AI Study Assistant",
            description:
                "A concept project for an AI-powered study assistant that helps students organize learning resources and revision plans.",
            technologies: [
                "Python",
                "AI/ML",
                "API"
            ],
            githubUrl: "https://github.com/",
            liveUrl: "",
            status: "In Progress",
            category: "AI/ML"
        }
    ],

    applications: [
        {
            id: generateId(),
            company: "TechNova Solutions",
            position: "Frontend Developer Intern",
            applicationDate: "2026-07-15",
            status: "Interview",
            interviewDate: "2026-08-18",
            notes: "Technical interview scheduled."
        },
        {
            id: generateId(),
            company: "CloudPeak Technologies",
            position: "Software Developer Intern",
            applicationDate: "2026-07-20",
            status: "Shortlisted",
            interviewDate: "",
            notes: "Waiting for interview schedule."
        },
        {
            id: generateId(),
            company: "Innovate Labs",
            position: "Web Development Intern",
            applicationDate: "2026-07-05",
            status: "Applied",
            interviewDate: "",
            notes: "Application submitted through company portal."
        },
        {
            id: generateId(),
            company: "DataSphere",
            position: "Junior Developer Intern",
            applicationDate: "2026-06-28",
            status: "Rejected",
            interviewDate: "",
            notes: "Keep improving technical interview preparation."
        }
    ],

    learning: [
        {
            id: generateId(),
            topic: "JavaScript",
            progress: 78,
            targetDate: "2026-09-15",
            status: "In Progress"
        },
        {
            id: generateId(),
            topic: "Data Structures",
            progress: 62,
            targetDate: "2026-10-01",
            status: "In Progress"
        },
        {
            id: generateId(),
            topic: "Web Development",
            progress: 88,
            targetDate: "2026-08-30",
            status: "Almost Complete"
        },
        {
            id: generateId(),
            topic: "AI / ML",
            progress: 35,
            targetDate: "2026-11-15",
            status: "Started"
        }
    ],

    activities: [
        {
            id: generateId(),
            type: "project",
            text: "Added Student Career Dashboard project",
            date: new Date().toISOString()
        },
        {
            id: generateId(),
            type: "skill",
            text: "Updated JavaScript proficiency to 85%",
            date: new Date().toISOString()
        },
        {
            id: generateId(),
            type: "application",
            text: "Interview scheduled with TechNova Solutions",
            date: new Date().toISOString()
        },
        {
            id: generateId(),
            type: "learning",
            text: "Updated JavaScript learning progress",
            date: new Date().toISOString()
        }
    ]
};

/* =========================================================
   ID GENERATOR
   ========================================================= */

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/* =========================================================
   INITIALIZE STORAGE
   ========================================================= */

function initializeStorage() {
    const existingData = localStorage.getItem(STORAGE_KEY);

    if (!existingData) {
        saveData(defaultData);
        return;
    }

    try {
        const parsedData = JSON.parse(existingData);

        if (!parsedData.profile) {
            parsedData.profile = defaultData.profile;
        }

        if (!Array.isArray(parsedData.skills)) {
            parsedData.skills = [];
        }

        if (!Array.isArray(parsedData.projects)) {
            parsedData.projects = [];
        }

        if (!Array.isArray(parsedData.applications)) {
            parsedData.applications = [];
        }

        if (!Array.isArray(parsedData.learning)) {
            parsedData.learning = [];
        }

        if (!Array.isArray(parsedData.activities)) {
            parsedData.activities = [];
        }

        saveData(parsedData);

    } catch (error) {
        console.error("Invalid stored data. Resetting dashboard data.");

        saveData(defaultData);
    }
}

/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData(data) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {
        console.error("Unable to save data:", error);

        showToast(
            "Unable to save data. Please check browser storage.",
            "error"
        );

        return false;
    }
}

/* =========================================================
   LOAD DATA
   ========================================================= */

function loadData() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            saveData(defaultData);

            return structuredClone
                ? structuredClone(defaultData)
                : JSON.parse(JSON.stringify(defaultData));
        }

        return JSON.parse(storedData);

    } catch (error) {
        console.error("Unable to load data:", error);

        return JSON.parse(
            JSON.stringify(defaultData)
        );
    }
}

/* =========================================================
   UPDATE PROFILE
   ========================================================= */

function updateProfile(profileData) {
    const data = loadData();

    data.profile = {
        ...data.profile,
        ...profileData
    };

    saveData(data);

    return data.profile;
}

/* =========================================================
   ADD ITEM
   ========================================================= */

function addItem(collectionName, item) {
    const data = loadData();

    if (!Array.isArray(data[collectionName])) {
        data[collectionName] = [];
    }

    const newItem = {
        id: generateId(),
        ...item
    };

    data[collectionName].push(newItem);

    saveData(data);

    return newItem;
}

/* =========================================================
   UPDATE ITEM
   ========================================================= */

function updateItem(collectionName, id, updatedFields) {
    const data = loadData();

    if (!Array.isArray(data[collectionName])) {
        return null;
    }

    const index = data[collectionName].findIndex(
        item => item.id === id
    );

    if (index === -1) {
        return null;
    }

    data[collectionName][index] = {
        ...data[collectionName][index],
        ...updatedFields
    };

    saveData(data);

    return data[collectionName][index];
}

/* =========================================================
   DELETE ITEM
   ========================================================= */

function deleteItem(collectionName, id) {
    const data = loadData();

    if (!Array.isArray(data[collectionName])) {
        return false;
    }

    const originalLength = data[collectionName].length;

    data[collectionName] = data[collectionName].filter(
        item => item.id !== id
    );

    if (data[collectionName].length === originalLength) {
        return false;
    }

    saveData(data);

    return true;
}

/* =========================================================
   FIND ITEM
   ========================================================= */

function findItem(collectionName, id) {
    const data = loadData();

    if (!Array.isArray(data[collectionName])) {
        return null;
    }

    return data[collectionName].find(
        item => item.id === id
    ) || null;
}

/* =========================================================
   ADD ACTIVITY
   ========================================================= */

function addActivity(type, text) {
    const data = loadData();

    if (!Array.isArray(data.activities)) {
        data.activities = [];
    }

    const activity = {
        id: generateId(),
        type,
        text,
        date: new Date().toISOString()
    };

    data.activities.unshift(activity);

    /*
     * Keep only the latest 20 activities.
     */
    data.activities = data.activities.slice(0, 20);

    saveData(data);

    return activity;
}

/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);

    initializeStorage();
}

/* =========================================================
   RESET DEMO DATA
   ========================================================= */

function resetDemoData() {
    const freshData = JSON.parse(
        JSON.stringify(defaultData)
    );

    /*
     * Generate fresh IDs for demo records.
     */
    freshData.skills.forEach(item => {
        item.id = generateId();
    });

    freshData.projects.forEach(item => {
        item.id = generateId();
    });

    freshData.applications.forEach(item => {
        item.id = generateId();
    });

    freshData.learning.forEach(item => {
        item.id = generateId();
    });

    freshData.activities.forEach(item => {
        item.id = generateId();
    });

    saveData(freshData);

    return freshData;
}

/* =========================================================
   THEME MANAGEMENT
   ========================================================= */

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}

function applySavedTheme() {
    const theme = loadTheme();

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

/* =========================================================
   STATISTICS
   ========================================================= */

function calculateStatistics() {
    const data = loadData();

    const totalSkills = data.skills.length;

    const totalProjects = data.projects.length;

    const activeApplications = data.applications.filter(
        application =>
            application.status !== "Rejected" &&
            application.status !== "Selected"
    ).length;

    const totalApplications = data.applications.length;

    const learningProgress =
        data.learning.length > 0
            ? Math.round(
                data.learning.reduce(
                    (total, item) =>
                        total + Number(item.progress || 0),
                    0
                ) / data.learning.length
            )
            : 0;

    const profileCompletion =
        calculateProfileCompletion(data.profile);

    return {
        totalSkills,
        totalProjects,
        activeApplications,
        totalApplications,
        learningProgress,
        profileCompletion
    };
}

/* =========================================================
   PROFILE COMPLETION
   ========================================================= */

function calculateProfileCompletion(profile) {
    const fields = [
        "fullName",
        "college",
        "course",
        "year",
        "location",
        "email",
        "github",
        "linkedin",
        "bio"
    ];

    const completedFields = fields.filter(field => {
        return (
            profile &&
            profile[field] &&
            String(profile[field]).trim() !== ""
        );
    }).length;

    return Math.round(
        (completedFields / fields.length) * 100
    );
}

/* =========================================================
   APPLICATION STATISTICS
   ========================================================= */

function getApplicationStatistics() {
    const data = loadData();

    const statistics = {
        Applied: 0,
        Shortlisted: 0,
        Interview: 0,
        Selected: 0,
        Rejected: 0
    };

    data.applications.forEach(application => {
        if (statistics[application.status] !== undefined) {
            statistics[application.status]++;
        }
    });

    return statistics;
}

/* =========================================================
   SKILL STATISTICS
   ========================================================= */

function getSkillStatistics() {
    const data = loadData();

    const statistics = {};

    data.skills.forEach(skill => {
        const category = skill.category || "Other";

        if (!statistics[category]) {
            statistics[category] = 0;
        }

        statistics[category]++;
    });

    return statistics;
}

/* =========================================================
   PROJECT STATISTICS
   ========================================================= */

function getProjectStatistics() {
    const data = loadData();

    const statistics = {};

    data.projects.forEach(project => {
        const category = project.category || "Other";

        if (!statistics[category]) {
            statistics[category] = 0;
        }

        statistics[category]++;
    });

    return statistics;
}

/* =========================================================
   LEARNING STATISTICS
   ========================================================= */

function getLearningStatistics() {
    const data = loadData();

    return data.learning.map(item => ({
        topic: item.topic,
        progress: Number(item.progress || 0)
    }));
}

/* =========================================================
   SAFE TEXT HELPER
   ========================================================= */

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   DATE FORMATTER
   ========================================================= */

function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/* =========================================================
   RELATIVE TIME
   ========================================================= */

function getRelativeTime(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);
    const now = new Date();

    const difference =
        Math.floor((now - date) / 1000);

    if (difference < 60) {
        return "Just now";
    }

    const minutes = Math.floor(
        difference / 60
    );

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days < 7) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return formatDate(dateString);
}

/* =========================================================
   EXPORT DATA
   ========================================================= */

function exportData() {
    const data = loadData();

    const jsonData = JSON.stringify(
        data,
        null,
        4
    );

    const blob = new Blob(
        [jsonData],
        {
            type: "application/json"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
        "student-career-dashboard-data.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/* =========================================================
   IMPORT DATA
   ========================================================= */

function importData(file) {
    return new Promise((resolve, reject) => {

        if (!file) {
            reject(
                new Error("No file selected.")
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = event => {
            try {
                const importedData =
                    JSON.parse(
                        event.target.result
                    );

                if (
                    typeof importedData !== "object" ||
                    importedData === null
                ) {
                    throw new Error(
                        "Invalid data format."
                    );
                }

                saveData(importedData);

                resolve(importedData);

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(
                new Error(
                    "Unable to read the selected file."
                )
            );
        };

        reader.readAsText(file);
    });
}

/* =========================================================
   INITIALIZE STORAGE ON LOAD
   ========================================================= */

initializeStorage();
applySavedTheme();
