const productId = window.location.pathname.split("/").pop();

async function loadProduct() {
    const response = await fetch(`/api/products/${productId}`, {
        credentials: "include"
    });
    const data = await response.json();

    if (!data.success) {
        showToast("Product not found.", "error");
        return;
    }

    const product = data.product;

    document.getElementById("product_name").value = product.product_name || "";
    document.getElementById("description").value = product.description || "";
    document.getElementById("size").value = product.size || "";
    document.getElementById("color").value = product.color || "";
    document.getElementById("material").value = product.material || "";
    document.getElementById("price").value = product.price || "";
    document.getElementById("stock").value = product.stock || "";
}

document
.getElementById("editProductForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
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

loadProduct();
