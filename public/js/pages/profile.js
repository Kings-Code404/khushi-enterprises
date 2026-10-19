document.querySelectorAll(".account-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".account-tab").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".account-panel").forEach(panel => panel.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

async function loadProfile() {
    const result = await apiRequest("/api/auth/profile", "GET");

    if (!result.success) return;

    const nameParts = result.user.name.split(" ");

    document.getElementById("firstName").value = nameParts[0] || "";
    document.getElementById("lastName").value = nameParts.slice(1).join(" ") || "";
    document.getElementById("email").value = result.user.email || "";
    document.getElementById("phone").value = result.user.phone || "";
}

document.getElementById("profileForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name =
        document.getElementById("firstName").value + " " +
        document.getElementById("lastName").value;

    const result = await apiRequest(
        "/api/auth/update-profile",
        "PUT",
        {
            name,
            phone: document.getElementById("phone").value,
            address: ""
        }
    );

    showToast(result.message, result.success ? "success" : "error");
});

async function loadAccountOrders() {
    const box = document.getElementById("accountOrders");

    const response = await fetch("/api/orders/my-orders", {
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success || !data.orders.length) {
        box.innerHTML = `<p>No orders found.</p>`;
        return;
    }

    box.innerHTML = data.orders.map(order => `
        <div class="account-order-card">
            <div class="account-order-head">
                <div>
                    <span>Order ID</span>
                    <strong>#KHUSHI${order.order_id}</strong>
                </div>

                <div>
                    <span>Total Payment</span>
                    <strong>₹${Number(order.total_amount).toFixed(2)}</strong>
                </div>

                <div>
                    <span>Payment Method</span>
                    <strong>${order.payment_method}</strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>${order.order_status}</strong>
                </div>
            </div>

            <div class="account-order-actions">
                <a href="/order-status/${order.order_id}" class="account-btn">Track Order</a>
                <a href="/order-completed/${order.order_id}" class="outline-btn">Invoice</a>
            </div>
        </div>
    `).join("");
}

async function logoutUser() {
    const result = await apiRequest("/api/auth/logout", "POST");

    if (result.success) {
        window.location.href = "/login";
    }
}

loadProfile();
loadAccountOrders();
