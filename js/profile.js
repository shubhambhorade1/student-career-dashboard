/**
 * profile.js — Student profile form: load, save, photo upload, completion %.
 */
const ProfileModule = (() => {
  const FIELDS = ["fullName", "college", "course", "year", "location", "email", "github", "linkedin", "bio"];

  function getInitials(name) {
    if (!name) return "SB";
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  function computeCompletion(profile) {
    const weighted = ["fullName", "college", "course", "year", "location", "email", "github", "linkedin", "bio", "photo"];
    const filled = weighted.filter((f) => profile[f] && String(profile[f]).trim() !== "").length;
    return Math.round((filled / weighted.length) * 100);
  }

  function renderPhoto(profile) {
    const img = document.getElementById("profilePhotoPreview");
    const initials = document.getElementById("profilePhotoInitials");
    if (profile.photo) {
      img.src = profile.photo;
      img.hidden = false;
      initials.hidden = true;
    } else {
      img.hidden = true;
      initials.hidden = false;
      initials.textContent = getInitials(profile.fullName);
    }
  }

  function loadForm() {
    const profile = Storage.Profile.get();
    FIELDS.forEach((f) => {
      const el = document.getElementById(f);
      if (el) el.value = profile[f] || "";
    });
    renderPhoto(profile);

    const welcome = document.getElementById("welcomeMessage");
    if (welcome) {
      welcome.textContent = profile.fullName ? `Welcome back, ${profile.fullName.split(" ")[0]}` : "Welcome back";
    }
  }

  function bindForm() {
    const form = document.getElementById("profileForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const existing = Storage.Profile.get();
      const data = { ...existing };
      FIELDS.forEach((f) => {
        data[f] = document.getElementById(f).value.trim();
      });
      Storage.Profile.save(data);
      Storage.Activity.log("Updated profile details");

      const status = document.getElementById("profileSaveStatus");
      status.textContent = "Saved ✓";
      status.classList.add("is-visible");
      setTimeout(() => status.classList.remove("is-visible"), 2000);

      UI.toast("Profile saved", "success");
      renderPhoto(data);
      loadForm();
      Dashboard.render();
    });

    const photoInput = document.getElementById("photoInput");
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        UI.toast("Please choose an image file", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const existing = Storage.Profile.get();
        const data = { ...existing, photo: reader.result };
        Storage.Profile.save(data);
        renderPhoto(data);
        UI.toast("Photo updated", "success");
        Dashboard.render();
      };
      reader.readAsDataURL(file);
    });
  }

  function init() {
    bindForm();
    loadForm();
  }

  return { init, loadForm, computeCompletion, getInitials };
})();
