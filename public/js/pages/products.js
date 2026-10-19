let allProducts = [];

async function loadProducts() {
    const productGrid = document.getElementById("productGrid");
    const resultCount = document.getElementById("resultCount");

    try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!data.success || !data.products.length) {
            productGrid.innerHTML = "<p>No products found.</p>";
            return;
        }

        allProducts = data.products;
        resultCount.innerText = `Showing 1-${data.products.length} of ${data.products.length} results`;

        renderProducts(allProducts);

    } catch (error) {
        productGrid.innerHTML = "<p>Failed to load products.</p>";
    }
}

function renderProducts(products) {
    const productGrid = document.getElementById("productGrid");

    productGrid.innerHTML = products.map(product => `
        <div class="shop-product-card">

            <div class="discount-badge">10% off</div>

            <div class="shop-product-img">
                <img 
                    src="/uploads/products/${product.image || 'default.webp'}" 
                    alt="${product.product_name}"
                >

                <div class="product-icons">
                    <button>♡</button>
                    <a href="/product/${product.product_id}">⌕</a>
                    <button onclick="addToCart(${product.product_id})">🛒</button>
                </div>
            </div>

            <div class="shop-product-info">
                <span>${product.category_name || "Beanbag"}</span>

                <div class="product-title-row">
                    <h3>${product.product_name}</h3>
                    <p>⭐ 4.9</p>
                </div>

                <div class="price-row">
                    <strong>₹${product.price}</strong>
                    <del>₹${Number(product.price) + 500}</del>
                </div>
            </div>

        </div>
    `).join("");
}

document.getElementById("sortProducts").addEventListener("change", function () {
    let sorted = [...allProducts];

    if (this.value === "low") {
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (this.value === "high") {
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (this.value === "latest") {
        sorted.sort((a, b) => b.product_id - a.product_id);
    }

    renderProducts(sorted);
});

loadProducts();
