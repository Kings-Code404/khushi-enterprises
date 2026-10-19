function toggleLoginPassword() {
    const password = document.getElementById("loginPassword");

    password.type = password.type === "password" ? "text" : "password";
}

document
.getElementById("loginForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(e.target);

    const loginData = {
        email: formData.get("email"),
        password: formData.get("password")
    };

    const result = await apiRequest(
        "/api/auth/login",
        "POST",
        loginData
    );

    if(result.success){

        showToast(result.message, "success");

        setTimeout(() => {
            const next = new URLSearchParams(window.location.search).get("next");
            const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
            if (safeNext) {
                window.location.href = safeNext;
            } else if (result.user.role === "admin") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/";
            }
        }, 700);

    } else {
        showToast(result.message, "error");
    }
});
