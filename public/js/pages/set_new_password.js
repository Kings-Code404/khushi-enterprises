function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}

document
.getElementById("setNewPasswordForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();

    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const reset_token = localStorage.getItem("reset_token") || new URLSearchParams(window.location.search).get("token");

    if (password.length < 8) {
        showToast("Password must be at least 8 characters.", "error");
        return;
    }
    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }
    if (!reset_token) {
        showToast("Reset token not found. Please request password reset again.", "error");
        return;
    }

    const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token, password })
    });
    const result = await response.json();
    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
        localStorage.removeItem("reset_token");
        setTimeout(() => window.location.href = "/login", 1200);
    }
});
