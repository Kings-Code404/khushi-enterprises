const orderId = window.location.pathname.split("/").pop();

async function loadCompletedOrder() {
    const infoStrip = document.getElementById("orderInfoStrip");
    const detailsBox = document.getElementById("orderDetailsBox");

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            infoStrip.innerHTML = "";
            detailsBox.innerHTML = `
                <div class="empty-cart">
                    <h3>Order not found.</h3>
                    <a href="/orders" class="btn">View Orders</a>
                </div>
            `;
            return;
        }

        const order = data.order;
        const items = data.items || [];

        infoStrip.innerHTML = `
            <div>
                <span>Order ID</span>
                <strong>#KHUSHI${order.order_id}</strong>
            </div>

            <div>
                <span>Payment Method</span>
                <strong>${order.payment_method || "COD"}</strong>
            </div>

            <div>
                <span>Transaction ID</span>
                <strong>TXN${order.order_id}${Date.now().toString().slice(-4)}</strong>
            </div>

            <div>
                <span>Estimated Delivery Date</span>
                <strong>${getDeliveryDate()}</strong>
            </div>

            <button onclick="window.print()">
                Download Invoice
            </button>
        `;

        detailsBox.innerHTML = `
            <h3>Order Details</h3>

            <div class="completed-table-head">
                <span>Products</span>
                <span>Sub Total</span>
            </div>

            <div class="completed-products">
                ${items.map(item => `
                    <div class="completed-product">
                        <div class="completed-product-left">
                            <img 
                                src="/uploads/products/${item.image || "default.webp"}" 
                                alt="${item.product_name}"
                            >

                            <div>
                                <h4>${item.product_name}</h4>
                                <p>Quantity : ${item.quantity}</p>
                            </div>
                        </div>

                        <strong>₹${Number(item.quantity * item.price).toFixed(2)}</strong>
                    </div>
                `).join("")}
            </div>

            <div class="completed-total-row">
                <span>Shipping</span>
                <strong>₹0.00</strong>
            </div>

            <div class="completed-total-row">
                <span>Taxes</span>
                <strong>₹0.00</strong>
            </div>

            <div class="completed-total-row">
                <span>Coupon Discount</span>
                <strong>-₹0.00</strong>
            </div>

            <div class="completed-total-row final">
                <span>Total</span>
                <strong>₹${Number(order.total_amount).toFixed(2)}</strong>
            </div>
        `;

    } catch (error) {
        detailsBox.innerHTML = "<p>Failed to load order details.</p>";
    }
}

function getDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 5);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

loadCompletedOrder();
