document
.getElementById("forgotPasswordForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const email = formData.get("email") || document.querySelector("input[type='email']")?.value;

    const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    const result = await response.json();
    showToast(result.message, result.success ? "success" : "error");

    if (result.success && result.resetToken) {
        localStorage.setItem("reset_token", result.resetToken);
        setTimeout(() => window.location.href = "/set-new-password", 700);
    }
});
