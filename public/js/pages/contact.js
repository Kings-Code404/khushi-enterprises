document
.getElementById("contactForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const contactData = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message")
    };

    const result = await apiRequest(
        "/api/contact",
        "POST",
        contactData
    );

    if (result.success) {
        showToast(result.message, "success");
        this.reset();
    } else {
        showToast(result.message, "error");
    }
});
