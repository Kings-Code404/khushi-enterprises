async function loadOrders() {
        const container = document.getElementById("ordersContainer");

        const response = await fetch("/api/orders/my-orders");
        const data = await response.json();

        if (!data.success) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h3>Please login to view your orders.</h3>
                    <a href="/login" class="btn">Login Now</a>
                </div>
            `;
            return;
        }

        if (!data.orders.length) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h3>No orders found.</h3>
                    <a href="/products" class="btn">Shop Products</a>
                </div>
            `;
            return;
        }

        container.innerHTML = data.orders.map(order => `
            <div class="order-card">
                <div>
                    <h3>Order #${order.order_id}</h3>
                    <p>Total Amount: ₹${order.total_amount}</p>
                    <p>Payment: ${order.payment_method}</p>
                    <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                    <span class="status">${order.order_status}</span>
                    <br><br>
                    <a href="/order/${order.order_id}" class="btn">View Details</a>
                </div>
            </div>
        `).join("");
    }

    loadOrders();
