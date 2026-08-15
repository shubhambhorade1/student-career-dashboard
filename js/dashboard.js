/**
 * dashboard.js — Overview stats, profile completion ring, activity feed,
 * and the career progress line chart.
 */
const Dashboard = (() => {
  let progressChart = null;

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function renderStatCards() {
    const skills = Storage.Skills.getAll();
    const projects = Storage.Projects.getAll();
    const applications = Storage.Applications.getAll();
    const learning = Storage.Learning.getAll();

    document.getElementById("statSkills").textContent = skills.length;
    document.getElementById("statSkillsHint").textContent =
      skills.length ? `${new Set(skills.map((s) => s.category)).size} categories` : "Add your first skill";

    document.getElementById("statProjects").textContent = projects.length;
    const completed = projects.filter((p) => p.status === "Completed").length;
    document.getElementById("statProjectsHint").textContent = projects.length ? `${completed} completed` : "Add your first project";

    const active = applications.filter((a) => !["Selected", "Rejected"].includes(a.status)).length;
    document.getElementById("statApplications").textContent = active;
    document.getElementById("statApplicationsHint").textContent = `${applications.length} total logged`;

    const avgLearning = learning.length
      ? Math.round(learning.reduce((sum, g) => sum + g.progress, 0) / learning.length)
      : 0;
    document.getElementById("statLearning").textContent = `${avgLearning}%`;
    document.getElementById("statLearningHint").textContent = `${learning.length} active goal${learning.length === 1 ? "" : "s"}`;
  }

  function renderProfileRing() {
    const profile = Storage.Profile.get();
    const pct = ProfileModule.computeCompletion(profile);
    document.getElementById("profileCompletionText").textContent = `${pct}%`;
    const circumference = 2 * Math.PI * 27;
    const offset = circumference - (pct / 100) * circumference;
    const ring = document.getElementById("profileRing");
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
  }

  function renderActivity() {
    const items = Storage.Activity.getAll().slice(0, 8);
    const list = document.getElementById("activityList");
    if (items.length === 0) {
      list.innerHTML = `<li style="opacity:.6">No activity yet — start by adding a skill or project.</li>`;
      return;
    }
    list.innerHTML = items
      .map((a) => `<li>${a.text}<span class="activity-time">${timeAgo(a.time)}</span></li>`)
      .join("");
  }

  function renderChart() {
    const ctx = document.getElementById("careerProgressChart");
    if (!ctx) return;

    const skills = Storage.Skills.getAll();
    const projects = Storage.Projects.getAll();
    const learning = Storage.Learning.getAll();

    // Build a simple 6-month trailing snapshot using current totals as the
    // final point, with a gentle synthetic ramp for earlier months so the
    // chart reads as a trend rather than a single flat line.
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString("en-IN", { month: "short" }));
    }
    const ramp = (total) => months.map((_, idx) => Math.round((total * (idx + 1)) / months.length));

    const skillsData = ramp(skills.length);
    const projectsData = ramp(projects.length);
    const avgLearning = learning.length ? Math.round(learning.reduce((s, g) => s + g.progress, 0) / learning.length) : 0;
    const learningData = ramp(avgLearning === 0 ? 0 : Math.max(avgLearning, 10));

    if (progressChart) progressChart.destroy();

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim();
    const teal = styles.getPropertyValue("--teal").trim();
    const amber = styles.getPropertyValue("--amber").trim();
    const gridColor = styles.getPropertyValue("--border").trim();
    const textColor = styles.getPropertyValue("--text-muted").trim();

    progressChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          { label: "Skills", data: skillsData, borderColor: accent, backgroundColor: accent, tension: 0.35, pointRadius: 3 },
          { label: "Projects", data: projectsData, borderColor: teal, backgroundColor: teal, tension: 0.35, pointRadius: 3 },
          { label: "Learning %", data: learningData, borderColor: amber, backgroundColor: amber, tension: 0.35, pointRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { color: textColor, boxWidth: 10, font: { size: 11 } } },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
        },
      },
    });
  }

  function render() {
    renderStatCards();
    renderProfileRing();
    renderActivity();
    renderChart();
  }

  return { render, renderChart };
})();
