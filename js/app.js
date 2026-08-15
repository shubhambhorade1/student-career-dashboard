/**
 * app.js — Shared UI helpers (toast, modal, confirm), view router,
 * theme toggle, mobile sidebar, and application bootstrap.
 */
const UI = (() => {
  function toast(message, type = "info") {
    const stack = document.getElementById("toastStack");
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 200ms ease";
      setTimeout(() => el.remove(), 220);
    }, 2600);
  }

  function openModal(title, bodyHtml) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    document.getElementById("modalBackdrop").hidden = false;
    const firstInput = document.querySelector("#modalBody input, #modalBody select, #modalBody textarea");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    document.getElementById("modalBackdrop").hidden = true;
    document.getElementById("modalBody").innerHTML = "";
  }

  function confirm(message, onConfirm) {
    const backdrop = document.getElementById("confirmBackdrop");
    document.getElementById("confirmMessage").textContent = message;
    backdrop.hidden = false;

    const okBtn = document.getElementById("confirmOk");
    const cancelBtn = document.getElementById("confirmCancel");

    const cleanup = () => {
      backdrop.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    };
    const onOk = () => { cleanup(); onConfirm(); };
    const onCancel = () => cleanup();

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  }

  return { toast, openModal, closeModal, confirm };
})();

const Router = (() => {
  function goTo(target) {
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === target));
    document.querySelectorAll(".journey__btn[data-target]").forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.target === target)
    );
    if (target === "analytics") Analytics.render();
    if (target === "dashboard") Dashboard.renderChart();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    closeMobileSidebar();
  }

  function closeMobileSidebar() {
    document.getElementById("sidebar").classList.remove("is-open");
    document.getElementById("sidebarBackdrop").classList.remove("is-visible");
  }

  function init() {
    document.querySelectorAll(".journey__btn[data-target]").forEach((btn) => {
      btn.addEventListener("click", () => goTo(btn.dataset.target));
    });
  }

  return { init, goTo };
})();

const ThemeManager = (() => {
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    Storage.Settings.save({ theme });
    // Re-render any visible charts so their colors pick up new CSS vars.
    Dashboard.renderChart();
    Analytics.render();
  }

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    apply(current === "dark" ? "light" : "dark");
  }

  function init() {
    const saved = Storage.Settings.get().theme;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply(saved || (prefersDark ? "dark" : "light"));

    document.getElementById("desktopThemeToggle").addEventListener("click", toggle);
    document.getElementById("mobileThemeToggle").addEventListener("click", toggle);
    document.getElementById("settingsThemeToggle").addEventListener("click", toggle);
  }

  return { init, toggle };
})();

function initMobileNav() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const openBtn = document.getElementById("hamburgerBtn");

  openBtn.addEventListener("click", () => {
    sidebar.classList.add("is-open");
    backdrop.classList.add("is-visible");
  });
  backdrop.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
  });
}

function initModalDismiss() {
  document.getElementById("modalClose").addEventListener("click", UI.closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "modalBackdrop") UI.closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      UI.closeModal();
      document.getElementById("confirmBackdrop").hidden = true;
    }
  });
}

function initSettings() {
  document.getElementById("resetDemoBtn").addEventListener("click", () => {
    UI.confirm("Reset to demo data? This replaces everything currently saved.", () => {
      Storage.seedDemoData();
      refreshAllModules();
      UI.toast("Demo data restored", "success");
      Router.goTo("dashboard");
    });
  });

  document.getElementById("clearAllBtn").addEventListener("click", () => {
    UI.confirm("Clear all data permanently? This cannot be undone.", () => {
      Storage.clearAll();
      localStorage.setItem(Storage.KEYS.seeded, JSON.stringify(true)); // prevent auto re-seed
      refreshAllModules();
      UI.toast("All data cleared", "info");
      Router.goTo("dashboard");
    });
  });
}

function refreshAllModules() {
  ProfileModule.loadForm();
  SkillsModule.render();
  ProjectsModule.render();
  ApplicationsModule.render();
  LearningModule.render();
  Dashboard.render();
  Analytics.render();
}

document.addEventListener("DOMContentLoaded", () => {
  Storage.ensureSeeded();

  ThemeManager.init();
  Router.init();
  initMobileNav();
  initModalDismiss();
  initSettings();

  ProfileModule.init();
  SkillsModule.init();
  ProjectsModule.init();
  ApplicationsModule.init();
  LearningModule.init();
  Dashboard.render();
});
