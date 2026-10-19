const orderId = window.location.pathname.split("/").pop();

    async function loadOrderDetails() {
        const container = document.getElementById("orderDetailsContainer");

        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!data.success) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h3>Order not found or please login first.</h3>
                    <a href="/orders" class="btn">Back To Orders</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="order-details-card">
                <h3>Order #${data.order.order_id}</h3>
                <p><strong>Status:</strong> ${data.order.order_status}</p>
                <p><strong>Payment Method:</strong> ${data.order.payment_method}</p>
                <p><strong>Total Amount:</strong> ₹${data.order.total_amount}</p>
                <p><strong>Order Date:</strong> ${new Date(data.order.created_at).toLocaleDateString()}</p>
            </div>

            <div class="ordered-items">
                <h3>Ordered Items</h3>

                ${data.items.map(item => `
                    <div class="ordered-item">
                        <img 
                            src="/uploads/products/${item.image || 'default.webp'}" 
                            alt="${item.product_name}"
                        >

                        <div>
                            <h4>${item.product_name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: ₹${item.price}</p>
                            <p>Subtotal: ₹${item.quantity * item.price}</p>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    loadOrderDetails();
