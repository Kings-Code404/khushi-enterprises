document
.getElementById("completeProfileForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const result = await apiRequest(
        "/api/auth/update-profile",
        "PUT",
        {
            name: "",
            phone: formData.get("phone"),
            address: ""
        }
    );

    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
        setTimeout(() => {
            window.location.href = "/profile";
        }, 1000);
    }
});
