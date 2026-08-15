/**
 * analytics.js — Skills distribution, application status, learning progress
 * and projects-by-technology charts.
 */
const Analytics = (() => {
  let skillsChart = null;
  let applicationsChart = null;
  let learningChart = null;
  let projectsChart = null;

  function palette() {
    const styles = getComputedStyle(document.documentElement);
    return {
      accent: styles.getPropertyValue("--accent").trim(),
      teal: styles.getPropertyValue("--teal").trim(),
      amber: styles.getPropertyValue("--amber").trim(),
      danger: styles.getPropertyValue("--danger").trim(),
      text: styles.getPropertyValue("--text-muted").trim(),
      grid: styles.getPropertyValue("--border").trim(),
      set: ["#4F46E5", "#0F9C8F", "#F59E0B", "#E5484D", "#6366F1", "#22C55E"],
    };
  }

  function renderSkillsChart() {
    const ctx = document.getElementById("skillsChart");
    if (!ctx) return;
    const skills = Storage.Skills.getAll();
    const byCategory = {};
    skills.forEach((s) => { byCategory[s.category] = (byCategory[s.category] || 0) + 1; });
    const p = palette();

    if (skillsChart) skillsChart.destroy();
    skillsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(byCategory),
        datasets: [{ data: Object.values(byCategory), backgroundColor: p.set }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { color: p.text, boxWidth: 10, font: { size: 11 } } } },
      },
    });
  }

  function renderApplicationsChart() {
    const ctx = document.getElementById("applicationsChart");
    if (!ctx) return;
    const apps = Storage.Applications.getAll();
    const statuses = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];
    const counts = statuses.map((s) => apps.filter((a) => a.status === s).length);
    const p = palette();

    if (applicationsChart) applicationsChart.destroy();
    applicationsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: statuses,
        datasets: [{ label: "Applications", data: counts, backgroundColor: [p.accent, p.amber, p.amber, p.teal, p.danger] }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: p.text } },
          y: { grid: { color: p.grid }, ticks: { color: p.text, stepSize: 1 }, beginAtZero: true },
        },
      },
    });
  }

  function renderLearningChart() {
    const ctx = document.getElementById("learningChart");
    if (!ctx) return;
    const goals = Storage.Learning.getAll();
    const p = palette();

    if (learningChart) learningChart.destroy();
    learningChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: goals.map((g) => g.topic),
        datasets: [{ label: "Progress %", data: goals.map((g) => g.progress), backgroundColor: p.accent }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: p.grid }, ticks: { color: p.text }, beginAtZero: true, max: 100 },
          y: { grid: { display: false }, ticks: { color: p.text, font: { size: 11 } } },
        },
      },
    });
  }

  function renderProjectsChart() {
    const ctx = document.getElementById("projectsChart");
    if (!ctx) return;
    const projects = Storage.Projects.getAll();
    const byTech = {};
    projects.forEach((proj) => (proj.tech || []).forEach((t) => { byTech[t] = (byTech[t] || 0) + 1; }));
    const p = palette();

    if (projectsChart) projectsChart.destroy();
    projectsChart = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: Object.keys(byTech),
        datasets: [{ data: Object.values(byTech), backgroundColor: p.set.map((c) => c + "CC") }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { color: p.text, boxWidth: 10, font: { size: 11 } } } },
        scales: { r: { ticks: { display: false }, grid: { color: p.grid } } },
      },
    });
  }

  function render() {
    renderSkillsChart();
    renderApplicationsChart();
    renderLearningChart();
    renderProjectsChart();
  }

  return { render };
})();
