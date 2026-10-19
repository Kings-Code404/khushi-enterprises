async function loadOrders() {
    const table = document.getElementById("ordersTable");

    const response = await fetch("/api/orders/admin/all", {
    credentials: "include"
});
    const data = await response.json();

    if (!data.success || !data.orders.length) {
        table.innerHTML = `
            <tr>
                <td colspan="7">No orders found.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.orders.map(order => `
        <tr>
            <td>#${order.order_id}</td>
            <td>${order.name}</td>
            <td>${order.email || order.user_email || "N/A"}</td>
            <td>₹${order.total_amount}</td>
            <td>
                <select onchange="updateStatus(${order.order_id}, this.value)">
                    <option value="pending" ${String(order.order_status).toLowerCase() === "pending" ? "selected" : ""}>Pending</option>
                    <option value="confirmed" ${String(order.order_status).toLowerCase() === "confirmed" ? "selected" : ""}>Confirmed</option>
                    <option value="shipped" ${String(order.order_status).toLowerCase() === "shipped" ? "selected" : ""}>Shipped</option>
                    <option value="delivered" ${String(order.order_status).toLowerCase() === "delivered" ? "selected" : ""}>Delivered</option>
                    <option value="cancelled" ${String(order.order_status).toLowerCase() === "cancelled" ? "selected" : ""}>Cancelled</option>
                </select>
            </td>
            <td>${order.payment_method}</td>
            <td>
                <button 
                    class="small-btn danger"
                    onclick="deleteOrder(${order.order_id})"
                >
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

async function updateStatus(orderId, status) {
    const result = await apiRequest(
        `/api/orders/admin/${orderId}`,
        "PUT",
        { status }
    );

    showToast(result.message, result.success ? "success" : "error");
}

async function deleteOrder(orderId) {
    if (!confirmDelete("Delete this order?")) return;

    const response = await fetch(`/api/orders/admin/${orderId}`, {
        method: "DELETE",
        credentials: "include"
    });

    const result = await response.json();

    showToast(result.message, result.success ? "success" : "error");

    loadOrders();
}

loadOrders();
