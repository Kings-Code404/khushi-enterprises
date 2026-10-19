document
.getElementById("addProductForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch("/api/products", {
    method: "POST",
    credentials: "include",
    body: formData
});

    const result = await response.json();

    if (result.success) {
        showToast(result.message, "success");

        setTimeout(() => {
            window.location.href = "/admin/products";
        }, 1000);
    } else {
        showToast(result.message, "error");
    }
});
