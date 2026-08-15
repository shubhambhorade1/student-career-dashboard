
/**
 * storage.js
 * All LocalStorage read/write logic lives here. No other file should call
 * localStorage directly — everything goes through Storage.*
 */
const Storage = (() => {
  const KEYS = {
    profile: "tcd_profile",
    skills: "tcd_skills",
    projects: "tcd_projects",
    applications: "tcd_applications",
    learning: "tcd_learning",
    activity: "tcd_activity",
    settings: "tcd_settings",
    seeded: "tcd_seeded",
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Storage: failed to load ${key}`, err);
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Storage: failed to save ${key}`, err);
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function logActivity(text) {
    const list = load(KEYS.activity, []);
    list.unshift({ id: uid(), text, time: new Date().toISOString() });
    save(KEYS.activity, list.slice(0, 30));
  }

  // ---- Generic collection helpers ----------------------------------------
  function getAll(key) {
    return load(key, []);
  }
  function addItem(key, item) {
    const list = load(key, []);
    const record = { id: uid(), ...item };
    list.unshift(record);
    save(key, list);
    return record;
  }
  function updateItem(key, id, patch) {
    const list = load(key, []);
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    save(key, list);
    return list[idx];
  }
  function deleteItem(key, id) {
    const list = load(key, []);
    const next = list.filter((i) => i.id !== id);
    save(key, next);
    return next.length !== list.length;
  }

  // ---- Domain-specific accessors -----------------------------------------
  const Profile = {
    get: () => load(KEYS.profile, {}),
    save: (data) => save(KEYS.profile, data),
  };
  const Skills = {
    getAll: () => getAll(KEYS.skills),
    add: (s) => addItem(KEYS.skills, s),
    update: (id, p) => updateItem(KEYS.skills, id, p),
    delete: (id) => deleteItem(KEYS.skills, id),
  };
  const Projects = {
    getAll: () => getAll(KEYS.projects),
    add: (p) => addItem(KEYS.projects, p),
    update: (id, patch) => updateItem(KEYS.projects, id, patch),
    delete: (id) => deleteItem(KEYS.projects, id),
  };
  const Applications = {
    getAll: () => getAll(KEYS.applications),
    add: (a) => addItem(KEYS.applications, a),
    update: (id, patch) => updateItem(KEYS.applications, id, patch),
    delete: (id) => deleteItem(KEYS.applications, id),
  };
  const Learning = {
    getAll: () => getAll(KEYS.learning),
    add: (l) => addItem(KEYS.learning, l),
    update: (id, patch) => updateItem(KEYS.learning, id, patch),
    delete: (id) => deleteItem(KEYS.learning, id),
  };
  const Activity = {
    getAll: () => load(KEYS.activity, []),
    log: logActivity,
  };
  const Settings = {
    get: () => load(KEYS.settings, { theme: "light" }),
    save: (s) => save(KEYS.settings, s),
  };

  // ---- Demo data ----------------------------------------------------------
  function seedDemoData() {
    save(KEYS.profile, {
      fullName: "",
      college: "",
      course: "",
      year: "",
      location: "",
      email: "",
      github: "",
      linkedin: "",
      bio: "",
      photo: "",
    });

    save(KEYS.skills, [
      { id: uid(), name: "JavaScript", category: "Programming", level: 75 },
      { id: uid(), name: "HTML5 & CSS3", category: "Web Development", level: 85 },
      { id: uid(), name: "C Programming", category: "Programming", level: 65 },
      { id: uid(), name: "MySQL", category: "Database", level: 55 },
      { id: uid(), name: "Git & GitHub", category: "Tools", level: 70 },
      { id: uid(), name: "Communication", category: "Soft Skills", level: 80 },
    ]);

    save(KEYS.projects, [
      {
        id: uid(),
        title: "Personal Portfolio Website",
        description: "A single-page portfolio with a dark theme, smooth animations and embedded project details.",
        tech: ["HTML5", "CSS3", "JavaScript"],
        github: "https://github.com/",
        demo: "",
        status: "Completed",
      },
      {
        id: uid(),
        title: "Student Career Dashboard",
        description: "A localStorage-backed dashboard for tracking skills, projects, applications and learning goals.",
        tech: ["HTML5", "CSS3", "JavaScript", "Chart.js"],
        github: "https://github.com/",
        demo: "",
        status: "In Progress",
      },
      {
        id: uid(),
        title: "Library Management System",
        description: "A C-based console application for issuing and returning books with file-based record storage.",
        tech: ["C"],
        github: "",
        demo: "",
        status: "Completed",
      },
    ]);

    save(KEYS.applications, [
      {
        id: uid(),
        company: "Infosys",
        position: "Trainee Software Engineer",
        appliedDate: "2026-06-12",
        status: "Interview",
        interviewDate: "2026-08-20",
        notes: "Round 1 cleared, technical round scheduled.",
      },
      {
        id: uid(),
        company: "TCS",
        position: "Ninja Associate",
        appliedDate: "2026-05-30",
        status: "Applied",
        interviewDate: "",
        notes: "Awaiting NQT results.",
      },
      {
        id: uid(),
        company: "Local Web Agency",
        position: "Frontend Intern",
        appliedDate: "2026-04-18",
        status: "Rejected",
        interviewDate: "",
        notes: "Asked for React experience.",
      },
    ]);

    save(KEYS.learning, [
      { id: uid(), topic: "JavaScript (Advanced)", progress: 70, targetDate: "2026-09-30", status: "In Progress" },
      { id: uid(), topic: "Data Structures", progress: 40, targetDate: "2026-10-15", status: "In Progress" },
      { id: uid(), topic: "AI/ML Fundamentals", progress: 15, targetDate: "2026-12-01", status: "Not Started" },
    ]);

    save(KEYS.activity, [
      { id: uid(), text: "Added project \"Student Career Dashboard\"", time: new Date(Date.now() - 3600e3).toISOString() },
      { id: uid(), text: "Updated skill \"JavaScript\" to 75%", time: new Date(Date.now() - 26 * 3600e3).toISOString() },
      { id: uid(), text: "Logged application to Infosys", time: new Date(Date.now() - 50 * 3600e3).toISOString() },
    ]);

    save(KEYS.seeded, true);
  }

  function ensureSeeded() {
    if (!load(KEYS.seeded, false)) {
      seedDemoData();
    }
  }

  function clearAll() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  }

  return {
    KEYS,
    uid,
    Profile,
    Skills,
    Projects,
    Applications,
    Learning,
    Activity,
    Settings,
    seedDemoData,
    ensureSeeded,
    clearAll,
  };
})();
