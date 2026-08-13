/* =========================================================
   PROFILE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();

    const profileForm =
        document.querySelector("#profileForm");

    if (profileForm) {
        profileForm.addEventListener(
            "submit",
            saveProfileForm
        );
    }
});


/* =========================================================
   LOAD PROFILE
   ========================================================= */

function loadProfile() {
    const data = loadData();

    if (!data.profile) {
        return;
    }

    const profile = data.profile;

    setInputValue(
        "#fullName",
        profile.fullName
    );

    setInputValue(
        "#college",
        profile.college
    );

    setInputValue(
        "#course",
        profile.course
    );

    setInputValue(
        "#year",
        profile.year
    );

    setInputValue(
        "#location",
        profile.location
    );

    setInputValue(
        "#email",
        profile.email
    );

    setInputValue(
        "#github",
        profile.github
    );

    setInputValue(
        "#linkedin",
        profile.linkedin
    );

    setInputValue(
        "#bio",
        profile.bio
    );

    updateProfilePhoto(
        profile.photo
    );

    updateProfilePreview(profile);
}


/* =========================================================
   SAVE PROFILE FORM
   ========================================================= */

function saveProfileForm(event) {
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

    const fullName =
        document.querySelector("#fullName")?.value.trim();

    const college =
        document.querySelector("#college")?.value.trim();

    const course =
        document.querySelector("#course")?.value.trim();

    const year =
        document.querySelector("#year")?.value.trim();

    const location =
        document.querySelector("#location")?.value.trim();

    const email =
        document.querySelector("#email")?.value.trim();

    const github =
        document.querySelector("#github")?.value.trim();

    const linkedin =
        document.querySelector("#linkedin")?.value.trim();

    const bio =
        document.querySelector("#bio")?.value.trim();

    /*
     * Basic email validation
     */
    if (!isValidEmail(email)) {
        showToast(
            "Please enter a valid email address.",
            "warning"
        );

        return;
    }

    /*
     * URL validation
     */
    if (
        github &&
        !isValidURL(github)
    ) {
        showToast(
            "Please enter a valid GitHub URL.",
            "warning"
        );

        return;
    }

    if (
        linkedin &&
        !isValidURL(linkedin)
    ) {
        showToast(
            "Please enter a valid LinkedIn URL.",
            "warning"
        );

        return;
    }

    const updatedProfile = {
        fullName,
        college,
        course,
        year,
        location,
        email,
        github,
        linkedin,
        bio
    };

    updateProfile(updatedProfile);

    updateUserNames(
        updatedProfile
    );

    updateProfilePreview(
        updatedProfile
    );

    /*
     * Refresh dashboard information.
     */
    document.dispatchEvent(
        new CustomEvent("profileUpdated")
    );

    showToast(
        "Profile updated successfully!",
        "success"
    );
}


/* =========================================================
   PROFILE PHOTO
   ========================================================= */

const photoInput =
    document.querySelector("#profilePhoto");

if (photoInput) {
    photoInput.addEventListener(
        "change",
        handleProfilePhoto
    );
}


function handleProfilePhoto(event) {
    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    /*
     * Only allow images.
     */
    if (!file.type.startsWith("image/")) {
        showToast(
            "Please select a valid image file.",
            "warning"
        );

        event.target.value = "";

        return;
    }

    /*
     * Limit image size to 2 MB.
     */
    if (file.size > 2 * 1024 * 1024) {
        showToast(
            "Profile photo must be smaller than 2 MB.",
            "warning"
        );

        event.target.value = "";

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {
        const imageData =
            reader.result;

        const data =
            loadData();

        data.profile.photo =
            imageData;

        saveData(data);

        updateProfilePhoto(
            imageData
        );

        updateUserAvatar(
            imageData
        );

        showToast(
            "Profile photo updated.",
            "success"
        );
    };

    reader.readAsDataURL(file);
}


/* =========================================================
   UPDATE PROFILE PHOTO
   ========================================================= */

function updateProfilePhoto(photo) {
    const photoElements =
        document.querySelectorAll(
            "[data-profile-photo]"
        );

    photoElements.forEach(
        function (element) {

            if (photo) {
                element.src = photo;
                element.classList.add(
                    "has-photo"
                );
            } else {
                element.removeAttribute(
                    "src"
                );

                element.classList.remove(
                    "has-photo"
                );
            }
        }
    );
}


/* =========================================================
   UPDATE USER AVATAR
   ========================================================= */

function updateUserAvatar(photo) {
    const avatarElements =
        document.querySelectorAll(
            "[data-user-avatar]"
        );

    avatarElements.forEach(
        function (element) {

            if (photo) {
                element.style.backgroundImage =
                    `url("${photo}")`;

                element.style.backgroundSize =
                    "cover";

                element.style.backgroundPosition =
                    "center";

                element.textContent = "";
            }
        }
    );
}


/* =========================================================
   PROFILE PREVIEW
   ========================================================= */

function updateProfilePreview(profile) {
    setElementText(
        "[data-preview-name]",
        profile.fullName || "Your Name"
    );

    setElementText(
        "[data-preview-college]",
        profile.college || "Your College"
    );

    setElementText(
        "[data-preview-course]",
        profile.course || "Your Course"
    );

    setElementText(
        "[data-preview-location]",
        profile.location || "Your Location"
    );

    setElementText(
        "[data-preview-email]",
        profile.email || "your@email.com"
    );

    setElementText(
        "[data-preview-bio]",
        profile.bio ||
        "Add a short professional bio."
    );

    const githubLink =
        document.querySelector(
            "[data-preview-github]"
        );

    if (githubLink) {
        githubLink.href =
            profile.github || "#";
    }

    const linkedinLink =
        document.querySelector(
            "[data-preview-linkedin]"
        );

    if (linkedinLink) {
        linkedinLink.href =
            profile.linkedin || "#";
    }

    updateProfilePhoto(
        profile.photo
    );

    updateUserAvatar(
        profile.photo
    );
}


/* =========================================================
   SET INPUT VALUE
   ========================================================= */

function setInputValue(
    selector,
    value
) {
    const input =
        document.querySelector(selector);

    if (input) {
        input.value =
            value || "";
    }
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {
    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);
}


/* =========================================================
   URL VALIDATION
   ========================================================= */

function isValidURL(url) {
    try {
        const parsedURL =
            new URL(url);

        return (
            parsedURL.protocol === "http:" ||
            parsedURL.protocol === "https:"
        );

    } catch (error) {
        return false;
    }
}


/* =========================================================
   PROFILE UPDATED EVENT
   ========================================================= */

document.addEventListener(
    "profileUpdated",
    function () {
        const data = loadData();

        updateProfileCompletion(data);
    }
);
