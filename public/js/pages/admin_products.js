async function loadAdminProducts() {
    const table = document.getElementById("productTable");

    const response = await fetch("/api/products?includeInactive=true", {
        credentials: "include"
    });
    const data = await response.json();

    if (!data.success || !data.products.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No products found.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.products.map(product => `
        <tr>
            <td>
                <img 
                    src="/uploads/products/${product.image || 'default.webp'}" 
                    class="table-img"
                >
            </td>

            <td>${product.product_name}</td>
            <td>${product.category_name || "N/A"}</td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>

            <td>
                <a href="/admin/products/edit/${product.product_id}" class="small-btn">
                    Edit
                </a>

                <button 
                    class="small-btn danger"
                    onclick="deleteProduct(${product.product_id})"
                >
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

async function deleteProduct(productId) {
    if (!confirmDelete("Delete this product?")) return;

    const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
    credentials: "include"
});

    const result = await response.json();

    showToast(result.message, result.success ? "success" : "error");

    loadAdminProducts();
}

loadAdminProducts();
