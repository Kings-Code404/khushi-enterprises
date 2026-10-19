async function loadHomeProducts() {
    const grid = document.getElementById("homeProductGrid");

    try {
        const response = await fetch("/api/products/latest");
        const data = await response.json();

        if (!data.success || !data.products.length) {
            grid.innerHTML = "<p>No products found.</p>";
            return;
        }

        grid.innerHTML = data.products.map(product => `
            <div class="ke-product-card">
                <div class="ke-discount">NEW</div>

                <img 
                    src="/uploads/products/${product.image || 'default.webp'}" 
                    alt="${product.product_name}"
                >

                <div class="ke-product-info">
                    <h3>${product.product_name}</h3>
                    <p>${product.material || "Premium Material"}</p>

                    <div class="ke-product-bottom">
                        <strong>₹${product.price}</strong>
                        <span>⭐ 4.9</span>
                    </div>

                    <div class="ke-product-actions">
                        <a href="/product/${product.product_id}">View</a>
                        <button onclick="addToCart(${product.product_id})">+</button>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (error) {
        grid.innerHTML = "<p>Failed to load products.</p>";
    }
}

loadHomeProducts();
