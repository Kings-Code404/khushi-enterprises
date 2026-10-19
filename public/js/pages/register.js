function toggleRegisterPassword() {
    const password = document.getElementById("registerPassword");

    password.type = password.type === "password" ? "text" : "password";
}

document
.getElementById("registerForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(e.target);

    const registerData = {
        name: `${formData.get("first_name")} ${formData.get("last_name")}`,
        email: formData.get("email"),
        phone: "",
        address: "",
        password: formData.get("password")
    };

    const result = await apiRequest(
        "/api/auth/register",
        "POST",
        registerData
    );

    if(result.success){

        showToast(result.message, "success");

        setTimeout(() => {
            window.location.href = "/login";
        }, 1200);

    } else {
        showToast(result.message, "error");
    }
});
