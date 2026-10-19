let couponDiscount = 0;

async function loadCart() {
    const cartItemsBox = document.getElementById("cartItemsBox");
    const cartSummary = document.getElementById("cartSummary");

    try {
        const response = await fetch("/api/cart", {
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            cartItemsBox.innerHTML = `
                <div class="empty-cart">
                    <h3>Please login to view your cart.</h3>
                    <a href="/login" class="btn">Login Now</a>
                </div>
            `;
            updateSummary(0, 0);
            return;
        }

        if (!data.cartItems.length) {
            cartItemsBox.innerHTML = `
                <div class="empty-cart">
                    <h3>Your shopping cart is empty.</h3>
                    <a href="/products" class="btn">Continue Shopping</a>
                </div>
            `;
            updateSummary(0, 0);
            return;
        }

        cartItemsBox.innerHTML = data.cartItems.map(item => `
            <div class="new-cart-item">

                <button 
                    class="cart-remove"
                    onclick="removeCartItem(${item.cart_id})"
                >
                    ×
                </button>

                <div class="cart-product">
                    <img 
                        src="/uploads/products/${item.image || "default.webp"}" 
                        alt="${item.product_name}"
                    >

                    <div>
                        <h3>${item.product_name}</h3>
                        <p>Color : ${item.color || "Brown"}</p>
                    </div>
                </div>

                <div class="cart-price">
                    ₹${Number(item.price).toFixed(2)}
                </div>

                <div class="cart-qty">
                    <button onclick="updateCart(${item.cart_id}, ${item.quantity - 1})">−</button>

                    <input 
                        type="number" 
                        value="${item.quantity}" 
                        min="1"
                        onchange="updateCart(${item.cart_id}, this.value)"
                    >

                    <button onclick="updateCart(${item.cart_id}, ${item.quantity + 1})">+</button>
                </div>

                <div class="cart-subtotal">
                    ₹${Number(item.subtotal).toFixed(2)}
                </div>

            </div>
        `).join("");

        updateSummary(data.cartItems.length, Number(data.total));

    } catch (error) {
        cartItemsBox.innerHTML = "<p>Failed to load cart.</p>";
    }
}

function updateSummary(items, subtotal) {
    const total = Math.max(subtotal - couponDiscount, 0);

    document.getElementById("cartSummary").innerHTML = `
        <h3>Order Summary</h3>

        <div class="summary-line">
            <span>Items</span>
            <strong>${items}</strong>
        </div>

        <div class="summary-line">
            <span>Sub Total</span>
            <strong>₹${subtotal.toFixed(2)}</strong>
        </div>

        <div class="summary-line">
            <span>Shipping</span>
            <strong>₹0.00</strong>
        </div>

        <div class="summary-line">
            <span>Taxes</span>
            <strong>₹0.00</strong>
        </div>

        <div class="summary-line discount">
            <span>Coupon Discount</span>
            <strong>-₹${couponDiscount.toFixed(2)}</strong>
        </div>

        <div class="summary-total">
            <span>Total</span>
            <strong>₹${total.toFixed(2)}</strong>
        </div>

        <a href="/checkout" class="checkout-btn">
            Proceed to Checkout
        </a>
    `;
}

async function updateCart(cartId, quantity) {
    quantity = Number(quantity);

    if (quantity < 1) {
        quantity = 1;
    }

    const result = await apiRequest(
        `/api/cart/${cartId}`,
        "PUT",
        { quantity }
    );

    showToast(result.message, result.success ? "success" : "error");

    loadCart();
}

async function removeCartItem(cartId) {
    if (!confirmDelete("Remove this item from cart?")) return;

    const result = await apiRequest(
        `/api/cart/${cartId}`,
        "DELETE"
    );

    showToast(result.message, result.success ? "success" : "error");

    loadCart();
}

async function clearCart() {
    if (!confirmDelete("Clear shopping cart?")) return;

    const result = await apiRequest(
        "/api/cart/clear/all",
        "DELETE"
    );

    showToast(result.message, result.success ? "success" : "error");

    loadCart();
}

async function applyCoupon() {
    const input = document.querySelector(".coupon-box input");
    const code = input ? input.value.trim() : "";
    if (!code) {
        showToast("Please enter a coupon code.", "error");
        return;
    }

    const response = await fetch(`/api/coupons/validate/${encodeURIComponent(code)}`);
    const result = await response.json();

    if (!result.success) {
        couponDiscount = 0;
        showToast(result.message, "error");
        loadCart();
        return;
    }

    const coupon = result.coupon;
    const subtotalText = document.querySelector(".summary-total strong")?.textContent || "0";
    const currentTotal = Number(subtotalText.replace(/[^0-9.]/g, "")) || 0;

    if (coupon.discount_type === "percentage") {
        couponDiscount = currentTotal * (Number(coupon.discount_value) / 100);
    } else {
        couponDiscount = Number(coupon.discount_value);
    }

    showToast(result.message, "success");
    loadCart();
}

loadCart();
