const orderId = window.location.pathname.split("/").pop();

async function loadOrderStatus() {
    const statusOrderId = document.getElementById("statusOrderId");
    const statusProducts = document.getElementById("statusProducts");

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            statusProducts.innerHTML = `
                <div class="empty-cart">
                    <h3>Order not found.</h3>
                    <a href="/orders" class="btn">Back To Orders</a>
                </div>
            `;
            return;
        }

        const order = data.order;
        const items = data.items || [];

        statusOrderId.innerText = `Order ID : #KHUSHI${order.order_id}`;

        updateProgress(order.order_status);

        statusProducts.innerHTML = items.map(item => `
            <div class="status-product-row">
                <img 
                    src="/uploads/products/${item.image || "default.webp"}" 
                    alt="${item.product_name}"
                >

                <div>
                    <h4>${item.product_name}</h4>
                    <p>Quantity : ${item.quantity}</p>
                </div>
            </div>
        `).join("");

    } catch (error) {
        statusProducts.innerHTML = "<p>Failed to load order status.</p>";
    }
}

function updateProgress(status) {
    const progressStep = document.getElementById("progressStep");
    const wayStep = document.getElementById("wayStep");
    const deliveredStep = document.getElementById("deliveredStep");

    if (
        status === "Pending" ||
        status === "Confirmed"
    ) {
        return;
    }

    if (
        status === "Shipped"
    ) {
        progressStep.classList.add("active");
        wayStep.classList.add("active");
    }

    if (
        status === "Delivered"
    ) {
        progressStep.classList.add("active");
        wayStep.classList.add("active");
        deliveredStep.classList.add("active");
    }
}

loadOrderStatus();
