const productId = window.location.pathname.split("/").pop();
let currentProduct = null;

async function loadProductDetails() {
    const box = document.getElementById("productDetailsBox");

    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (!data.success || !data.product) {
            box.innerHTML = `
                <div class="empty-cart">
                    <h3>Product not found.</h3>
                    <a href="/products" class="btn">Back To Shop</a>
                </div>
            `;
            return;
        }

        currentProduct = data.product;

        document.getElementById("infoMaterial").innerText =
            currentProduct.material || "Premium Material";

        document.getElementById("infoColor").innerText =
            currentProduct.color || "Multiple Colors";

        document.getElementById("infoSize").innerText =
            currentProduct.size || "Medium / Large / XL";

        renderProduct(currentProduct);
        loadReviews();
        loadRelatedProducts();

    } catch (error) {
        box.innerHTML = "<p>Failed to load product details.</p>";
    }
}

function renderProduct(product) {
    const box = document.getElementById("productDetailsBox");

    const imagePath = `/uploads/products/${product.image || "default.webp"}`;

    box.innerHTML = `
        <div class="pd-gallery">
            <div class="pd-main-image">
                <button class="pd-arrow left">‹</button>

                <img 
                    src="${imagePath}" 
                    alt="${product.product_name}"
                    id="mainProductImage"
                >

                <button class="pd-arrow right">›</button>
            </div>

            <div class="pd-thumbs">
                <img src="${imagePath}" class="active" onclick="changeMainImage(this)">
                <img src="${imagePath}" onclick="changeMainImage(this)">
                <img src="${imagePath}" onclick="changeMainImage(this)">
                <img src="${imagePath}" onclick="changeMainImage(this)">
            </div>
        </div>

        <div class="pd-info">
            <span class="pd-category">
                ${product.category_name || "Beanbag"}
            </span>

            <div class="pd-title-row">
                <h1>${product.product_name}</h1>
                <span class="pd-stock">In Stock</span>
            </div>

            <div class="pd-stars">
                ★★★★★ <span>4.9 (245 Review)</span>
            </div>

            <div class="pd-price">
                <strong>₹${product.price}</strong>
                <del>₹${Number(product.price) + 500}</del>
            </div>

            <p class="pd-short-desc">
                ${product.description || "Premium quality beanbag designed for modern comfort and relaxation."}
            </p>

            <div class="pd-color">
                <strong>Color :</strong>
                <span>${product.color || "Brown"}</span>

                <div class="pd-color-dots">
                    <i style="background:#111"></i>
                    <i style="background:#7a3e24"></i>
                    <i style="background:#e5e5e5"></i>
                    <i style="background:#00896f"></i>
                    <i style="background:#0077b6"></i>
                </div>
            </div>

            <div class="pd-buy-row">
                <div class="pd-qty">
                    <button onclick="changeQty(-1)">−</button>
                    <input type="number" id="quantity" value="1" min="1">
                    <button onclick="changeQty(1)">+</button>
                </div>

                <button class="pd-cart-btn" onclick="addProductToCart(${product.product_id})">
                    Add To Cart
                </button>

                <button class="pd-buy-btn" onclick="buyNow(${product.product_id})">
                    Buy Now
                </button>

                <button class="pd-heart" onclick="toggleWishlist(${product.product_id})" aria-label="Add to wishlist">♡</button>
            </div>

            <div class="pd-meta">
                <p><strong>SKU :</strong> KHUSHI${product.product_id}BEAN</p>
                <p><strong>Tags :</strong> Beanbag, Comfort, Home, ${product.category_name || "Furniture"}</p>
                <p><strong>Share :</strong> 🟢 🐦 📌 📷</p>
            </div>
        </div>
    `;
}

function changeMainImage(img) {
    document.getElementById("mainProductImage").src = img.src;

    document.querySelectorAll(".pd-thumbs img").forEach(item => {
        item.classList.remove("active");
    });

    img.classList.add("active");
}

function changeQty(num) {
    const qty = document.getElementById("quantity");
    let value = Number(qty.value) + num;

    if (value < 1) value = 1;

    qty.value = value;
}

async function addProductToCart(id) {
    const quantity = document.getElementById("quantity").value;
    await addToCart(id, quantity);
}

async function buyNow(id) {
    const quantity = document.getElementById("quantity").value;

    await addToCart(id, quantity);

    setTimeout(() => {
        window.location.href = "/cart";
    }, 600);
}

async function loadReviews() {
    const reviewList = document.getElementById("reviewList");

    try {
        const response = await fetch(`/api/reviews/${productId}`);
        const data = await response.json();

        if (!data.success || !data.reviews.length) {
            reviewList.innerHTML = `
                <div class="pd-review-item">
                    <h4>No reviews yet.</h4>
                    <p>Be the first to review this product.</p>
                </div>
            `;
            return;
        }

        reviewList.innerHTML = data.reviews.map(review => `
            <div class="pd-review-item">
                <div class="pd-review-head">
                    <div>
                        <h4>${review.name}</h4>
                        <p>Verified Customer</p>
                    </div>

                    <span>${new Date(review.created_at).toLocaleDateString()}</span>
                </div>

                <div class="pd-review-stars">
                    ${"★".repeat(review.rating)} ${review.rating}.0
                </div>

                <p>${review.review}</p>
            </div>
        `).join("");

    } catch (error) {
        reviewList.innerHTML = "<p>Failed to load reviews.</p>";
    }
}

document.getElementById("reviewForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const result = await apiRequest(
        "/api/reviews",
        "POST",
        {
            product_id: productId,
            rating: formData.get("rating"),
            review: formData.get("review")
        }
    );

    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
        this.reset();
        loadReviews();
    }
});

document.querySelectorAll(".pd-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".pd-tab-btn").forEach(item => {
            item.classList.remove("active");
        });

        document.querySelectorAll(".pd-tab-content").forEach(content => {
            content.classList.remove("active");
        });

        btn.classList.add("active");

        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

async function loadRelatedProducts() {
    const grid = document.getElementById("relatedProductsGrid");

    try {
        const response = await fetch("/api/products/latest");
        const data = await response.json();

        if (!data.success || !data.products.length) {
            grid.innerHTML = "<p>No related products found.</p>";
            return;
        }

        grid.innerHTML = data.products.map(product => `
            <div class="ke-product-card">
                <div class="ke-discount">10% off</div>

                <img 
                    src="/uploads/products/${product.image || "default.webp"}" 
                    alt="${product.product_name}"
                >

                <div class="ke-product-info">
                    <h3>${product.product_name}</h3>
                    <p>${product.category_name || "Beanbag"}</p>

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
        grid.innerHTML = "<p>Failed to load related products.</p>";
    }
}

loadProductDetails();

async function toggleWishlist(productId){const result=await apiRequest("/api/wishlist","POST",{product_id:productId});showToast(result.message,result.success?"success":"error");}
