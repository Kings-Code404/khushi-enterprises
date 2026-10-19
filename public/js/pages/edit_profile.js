async function loadProfile() {
    const result = await apiRequest("/api/auth/profile", "GET");

    if (!result.success) {
        window.location.href = "/login";
        return;
    }

    document.getElementById("name").value = result.user.name || "";
    document.getElementById("phone").value = result.user.phone || "";
    document.getElementById("address").value = result.user.address || "";
}

document.getElementById("editProfileForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const result = await apiRequest(
        "/api/auth/update-profile",
        "PUT",
        {
            name: formData.get("name"),
            phone: formData.get("phone"),
            address: formData.get("address")
        }
    );

    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
        setTimeout(() => {
            window.location.href = "/profile";
        }, 1000);
    }
});

loadProfile();
