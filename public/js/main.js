// ===============================
// KHUSHI ENTERPRISES MAIN JS
// ===============================

console.log("Khushi Enterprises frontend loaded successfully.");

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message || "Done";
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function apiRequest(url, method = "GET", data = null) {
    try {
        const options = {
            method,
            credentials: "include",
            headers: {}
        };

        if (data) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        return await response.json();

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Something went wrong."
        };
    }
}

async function addToCart(productId, quantity = 1) {
    const result = await apiRequest("/api/cart", "POST", {
        product_id: productId,
        quantity
    });

    showToast(
        result.message || (result.success ? "Product added to cart." : "Please login first."),
        result.success ? "success" : "error"
    );
}

function confirmDelete(message = "Are you sure?") {
    return confirm(message);
}

function validateRequiredFields(fields) {
    for (let field of fields) {
        if (!field.value.trim()) {
            showToast(`${field.name} is required`, "error");
            field.focus();
            return false;
        }
    }
    return true;
}

async function checkLoginStatus() {
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminLink = document.getElementById("adminLink");
    const profileLink = document.getElementById("profileLink");

    if (!loginLink || !logoutBtn) return;

    const result = await apiRequest("/api/auth/profile", "GET");

    if (result.success && result.user) {
        loginLink.style.display = "none";
        logoutBtn.style.display = "inline-block";

        if (profileLink) profileLink.style.display = "inline-block";

        if (adminLink) {
            adminLink.style.display = result.user.role === "admin" ? "inline-block" : "none";
        }
    } else {
        loginLink.style.display = "inline-block";
        logoutBtn.style.display = "none";

        if (profileLink) profileLink.style.display = "none";
        if (adminLink) adminLink.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});

document.addEventListener("click", async function(e) {
    if (e.target && e.target.id === "logoutBtn") {
        const result = await apiRequest("/api/auth/logout", "POST");
        showToast(result.message, result.success ? "success" : "error");

        if (result.success) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 800);
        }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const searchToggle = document.getElementById("searchToggle");
    const searchBox = document.getElementById("searchBox");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNav = document.getElementById("mobileNav");

    if (searchToggle && searchBox) {
        searchToggle.addEventListener("click", () => {
            searchBox.classList.toggle("active");
        });
    }

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileNav.classList.toggle("active");
        });
    }
});

function searchFromHeader() {
    const input = document.getElementById("headerSearchInput");

    if (!input) return;

    const keyword = input.value.trim();

    if (keyword) {
        window.location.href = `/products?search=${keyword}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const newsletterForm = document.querySelector(".footer-newsletter-form");
    if (!newsletterForm) return;

    newsletterForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector("input[type='email']");
        const email = input ? input.value.trim() : "";
        if (!email) {
            showToast("Please enter email address.", "error");
            return;
        }
        const result = await apiRequest("/api/newsletter/subscribe", "POST", { email });
        showToast(result.message, result.success ? "success" : "error");
        if (result.success) newsletterForm.reset();
    });
});
