/* =========================================================
   STUDENT CAREER DASHBOARD
   Main Application Controller
   ========================================================= */

/* =========================================================
   GLOBAL APP STATE
   ========================================================= */

const appState = {
    currentSection: "dashboard",
    editingId: null,
    currentModal: null
};

/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeApplication();
});

/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

function initializeApplication() {
    initializeNavigation();
    initializeMobileMenu();
    initializeThemeToggle();
    initializeModalControls();
    initializeGlobalButtons();
    updateUserInterface();

    /*
     * Other JavaScript modules will be loaded after
     * this file and can use the global application state.
     */
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {
    const navigationLinks =
        document.querySelectorAll(".nav-link");

    navigationLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const targetSection =
                link.dataset.section ||
                link.getAttribute("href")?.replace("#", "");

            if (!targetSection) {
                return;
            }

            navigateToSection(targetSection);
        });
    });
}

/* =========================================================
   NAVIGATE TO SECTION
   ========================================================= */

function navigateToSection(sectionName) {
    const sections =
        document.querySelectorAll(".page-section");

    const navigationLinks =
        document.querySelectorAll(".nav-link");

    let sectionFound = false;

    sections.forEach(section => {
        const matches =
            section.id === sectionName ||
            section.dataset.section === sectionName;

        section.classList.toggle(
            "active",
            matches
        );

        if (matches) {
            sectionFound = true;
        }
    });

    navigationLinks.forEach(link => {
        const linkSection =
            link.dataset.section ||
            link.getAttribute("href")?.replace("#", "");

        link.classList.toggle(
            "active",
            linkSection === sectionName
        );
    });

    if (!sectionFound) {
        console.warn(
            `Section "${sectionName}" was not found.`
        );

        return;
    }

    appState.currentSection = sectionName;

    updatePageHeader(sectionName);

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    /*
     * Tell other modules that the active section changed.
     */
    document.dispatchEvent(
        new CustomEvent("sectionChanged", {
            detail: {
                section: sectionName
            }
        })
    );
}

/* =========================================================
   PAGE HEADER
   ========================================================= */

function updatePageHeader(sectionName) {
    const pageTitle =
        document.querySelector(".page-title");

    const pageSubtitle =
        document.querySelector(".page-subtitle");

    if (!pageTitle) {
        return;
    }

    const headers = {
        dashboard: {
            title: "Dashboard",
            subtitle: "Overview of your career progress"
        },

        profile: {
            title: "Student Profile",
            subtitle: "Manage your professional identity"
        },

        skills: {
            title: "Skills",
            subtitle: "Track and improve your technical skills"
        },

        projects: {
            title: "Projects",
            subtitle: "Showcase your work and achievements"
        },

        applications: {
            title: "Applications",
            subtitle: "Track your internship and job applications"
        },

        learning: {
            title: "Learning",
            subtitle: "Monitor your learning goals"
        },

        analytics: {
            title: "Analytics",
            subtitle: "Understand your career progress"
        },

        settings: {
            title: "Settings",
            subtitle: "Customize your dashboard"
        }
    };

    const header =
        headers[sectionName] ||
        headers.dashboard;

    pageTitle.textContent = header.title;

    if (pageSubtitle) {
        pageSubtitle.textContent =
            header.subtitle;
    }
}

/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {
    const menuButton =
        document.querySelector(".mobile-menu-btn");

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener("click", () => {
        toggleMobileMenu();
    });

    if (overlay) {
        overlay.addEventListener("click", () => {
            closeMobileMenu();
        });
    }
}

/* =========================================================
   TOGGLE MOBILE MENU
   ========================================================= */

function toggleMobileMenu() {
    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("mobile-open");

    if (overlay) {
        overlay.classList.toggle(
            "active",
            sidebar.classList.contains("mobile-open")
        );
    }
}

/* =========================================================
   CLOSE MOBILE MENU
   ========================================================= */

function closeMobileMenu() {
    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (sidebar) {
        sidebar.classList.remove(
            "mobile-open"
        );
    }

    if (overlay) {
        overlay.classList.remove("active");
    }
}

/* =========================================================
   THEME TOGGLE
   ========================================================= */

function initializeThemeToggle() {
    const themeButtons =
        document.querySelectorAll(
            "[data-theme-toggle]"
        );

    themeButtons.forEach(button => {
        button.addEventListener("click", () => {
            toggleTheme();
        });
    });

    updateThemeIcons();
}

/* =========================================================
   TOGGLE THEME
   ========================================================= */

function toggleTheme() {
    const isDark =
        document.body.classList.toggle(
            "dark-mode"
        );

    const theme =
        isDark ? "dark" : "light";

    saveTheme(theme);

    updateThemeIcons();

    showToast(
        `${capitalize(theme)} mode enabled`,
        "success"
    );

    /*
     * Notify charts that theme colors may need
     * to be refreshed.
     */
    document.dispatchEvent(
        new CustomEvent("themeChanged", {
            detail: {
                theme
            }
        })
    );
}

/* =========================================================
   THEME ICONS
   ========================================================= */

function updateThemeIcons() {
    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

    const themeIcons =
        document.querySelectorAll(
            "[data-theme-icon]"
        );

    themeIcons.forEach(icon => {
        if (isDark) {
            icon.classList.remove(
                "fa-moon"
            );

            icon.classList.add(
                "fa-sun"
            );
        } else {
            icon.classList.remove(
                "fa-sun"
            );

            icon.classList.add(
                "fa-moon"
            );
        }
    });
}

/* =========================================================
   MODAL CONTROLS
   ========================================================= */

function initializeModalControls() {
    /*
     * Close buttons
     */
    document.addEventListener("click", event => {
        const closeButton =
            event.target.closest(
                "[data-modal-close]"
            );

        if (closeButton) {
            closeModal();
        }
    });

    /*
     * Clicking outside the modal closes it.
     */
    document.addEventListener("click", event => {
        const overlay =
            event.target.closest(
                ".modal-overlay"
            );

        if (
            overlay &&
            event.target === overlay
        ) {
            closeModal();
        }
    });

    /*
     * Escape key closes modal.
     */
    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                appState.currentModal
            ) {
                closeModal();
            }
        }
    );
}

/* =========================================================
   OPEN MODAL
   ========================================================= */

function openModal(modalId) {
    const modal =
        document.getElementById(modalId);

    if (!modal) {
        console.warn(
            `Modal "${modalId}" not found.`
        );

        return;
    }

    modal.classList.add("active");

    appState.currentModal = modalId;

    document.body.style.overflow = "hidden";
}

/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {
    const activeModal =
        document.querySelector(
            ".modal-overlay.active"
        );

    if (activeModal) {
        activeModal.classList.remove(
            "active"
        );
    }

    appState.currentModal = null;
    appState.editingId = null;

    document.body.style.overflow = "";
}

/* =========================================================
   GLOBAL BUTTONS
   ========================================================= */

function initializeGlobalButtons() {
    /*
     * Export data
     */
    const exportButton =
        document.querySelector(
            "[data-export-data]"
        );

    if (exportButton) {
        exportButton.addEventListener(
            "click",
            () => {
                exportData();

                showToast(
                    "Your dashboard data has been exported.",
                    "success"
                );
            }
        );
    }

    /*
     * Reset demo data
     */
    const resetButton =
        document.querySelector(
            "[data-reset-data]"
        );

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            () => {
                const confirmed =
                    confirm(
                        "Reset all dashboard data to the original demo data?"
                    );

                if (!confirmed) {
                    return;
                }

                resetDemoData();

                showToast(
                    "Demo data has been restored.",
                    "success"
                );

                reloadApplication();
            }
        );
    }

    /*
     * Delete all data
     */
    const clearButton =
        document.querySelector(
            "[data-clear-data]"
        );

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            () => {
                const confirmed =
                    confirm(
                        "This will permanently delete all your dashboard data. Continue?"
                    );

                if (!confirmed) {
                    return;
                }

                clearAllData();

                showToast(
                    "All dashboard data has been deleted.",
                    "success"
                );

                reloadApplication();
            }
        );
    }

    /*
     * Import data
     */
    const importInput =
        document.querySelector(
            "[data-import-data]"
        );

    if (importInput) {
        importInput.addEventListener(
            "change",
            async event => {
                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }

                try {
                    await importData(file);

                    showToast(
                        "Dashboard data imported successfully.",
                        "success"
                    );

                    reloadApplication();

                } catch (error) {
                    console.error(error);

                    showToast(
                        "Unable to import the selected file.",
                        "error"
                    );
                }

                event.target.value = "";
            }
        );
    }
}

/* =========================================================
   UPDATE USER INTERFACE
   ========================================================= */

function updateUserInterface() {
    const data = loadData();

    updateUserNames(data.profile);

    updateDateDisplay();

    updateThemeIcons();
}

/* =========================================================
   UPDATE USER NAMES
   ========================================================= */

function updateUserNames(profile) {
    if (!profile) {
        return;
    }

    const fullName =
        profile.fullName ||
        "Student";

    const firstName =
        fullName
            .trim()
            .split(" ")[0];

    /*
     * Welcome message
     */
    const welcomeName =
        document.querySelector(
            "[data-user-name]"
        );

    if (welcomeName) {
        welcomeName.textContent =
            firstName;
    }

    /*
     * Sidebar user
     */
    const sidebarName =
        document.querySelector(
            ".sidebar-user-name"
        );

    if (sidebarName) {
        sidebarName.textContent =
            fullName;
    }

    /*
     * Avatar initials
     */
    const avatarElements =
        document.querySelectorAll(
            "[data-user-avatar]"
        );

    const initials =
        getInitials(fullName);

    avatarElements.forEach(
        avatar => {
            avatar.textContent =
                initials;
        }
    );
}

/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {
    if (!name) {
        return "ST";
    }

    const words =
        name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}

/* =========================================================
   DATE DISPLAY
   ========================================================= */

function updateDateDisplay() {
    const dateElement =
        document.querySelector(
            "[data-current-date]"
        );

    if (!dateElement) {
        return;
    }

    const now = new Date();

    dateElement.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}

/* =========================================================
   RELOAD APPLICATION
   ========================================================= */

function reloadApplication() {
    /*
     * A short delay gives LocalStorage time to update
     * before the page is reloaded.
     */
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */

function showToast(
    message,
    type = "info"
) {
    let container =
        document.querySelector(
            ".toast-container"
        );

    /*
     * Create toast container if HTML doesn't
     * already contain one.
     */
    if (!container) {
        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    const iconMap = {
        success: "fa-check",
        error: "fa-xmark",
        info: "fa-circle-info",
        warning: "fa-triangle-exclamation"
    };

    const icon =
        iconMap[type] ||
        iconMap.info;

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${icon}"></i>
        </div>

        <div class="toast-message">
            ${escapeHTML(message)}
        </div>
    `;

    container.appendChild(toast);

    /*
     * Remove after 3 seconds.
     */
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(20px)";

        setTimeout(() => {
            toast.remove();
        }, 250);

    }, 3000);
}

/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(value) {
    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

/* =========================================================
   CONFIRM DELETE
   ========================================================= */

function confirmDelete(
    itemName = "this item"
) {
    return confirm(
        `Are you sure you want to delete ${itemName}? This action cannot be undone.`
    );
}

/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoading(
    element,
    loading = true
) {
    if (!element) {
        return;
    }

    if (loading) {
        element.dataset.originalText =
            element.innerHTML;

        element.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Please wait...
        `;

        element.disabled = true;

    } else {
        element.innerHTML =
            element.dataset.originalText ||
            "Save";

        element.disabled = false;
    }
}

/* =========================================================
   FORM RESET
   ========================================================= */

function resetForm(form) {
    if (!form) {
        return;
    }

    form.reset();

    /*
     * Remove hidden edit ID.
     */
    const idInput =
        form.querySelector(
            'input[name="id"]'
        );

    if (idInput) {
        idInput.value = "";
    }

    appState.editingId = null;
}

/* =========================================================
   FORM DATA HELPER
   ========================================================= */

function getFormData(form) {
    if (!form) {
        return {};
    }

    const formData =
        new FormData(form);

    const data = {};

    formData.forEach(
        (value, key) => {
            data[key] =
                typeof value === "string"
                    ? value.trim()
                    : value;
        }
    );

    return data;
}

/* =========================================================
   VALIDATE REQUIRED FIELDS
   ========================================================= */

function validateRequiredFields(
    form
) {
    if (!form) {
        return false;
    }

    const requiredFields =
        form.querySelectorAll(
            "[required]"
        );

    let valid = true;

    requiredFields.forEach(field => {
        const value =
            field.value.trim();

        field.classList.remove(
            "input-error"
        );

        if (!value) {
            valid = false;

            field.classList.add(
                "input-error"
            );
        }
    });

    return valid;
}

/* =========================================================
   GLOBAL KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Ctrl + K focuses search.
         */
        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();

            const searchInput =
                document.querySelector(
                    "[data-search]"
                );

            if (searchInput) {
                searchInput.focus();
            }
        }
    }
);

/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
         * Automatically close mobile sidebar
         * when returning to desktop.
         */
        if (
            window.innerWidth > 768
        ) {
            closeMobileMenu();
        }
    }
);
