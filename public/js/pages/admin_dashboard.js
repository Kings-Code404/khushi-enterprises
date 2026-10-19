async function loadDashboardStats() {

    const response = await fetch("/api/admin/dashboard", {
    credentials: "include"
})

    const data = await response.json();

    if(data.success){

        document.getElementById("totalUsers")
        .innerText = data.stats.totalUsers;

        document.getElementById("totalProducts")
        .innerText = data.stats.totalProducts;

        document.getElementById("totalOrders")
        .innerText = data.stats.totalOrders;

        document.getElementById("totalRevenue")
        .innerText = "₹" + data.stats.totalRevenue;
    }
}

async function loadRecentOrders() {

    const response = await fetch("/api/admin/orders/recent", {
    credentials: "include"
})

    const data = await response.json();

    const container =
    document.getElementById("recentOrders");

    if(data.success){

        container.innerHTML = data.orders.map(order => `
            <div class="admin-item">
                <strong>#${order.order_id}</strong>
                <p>${order.name}</p>
                <span>₹${order.total_amount}</span>
            </div>
        `).join("");
    }
}

async function loadRecentUsers() {

    const response = await fetch("/api/admin/users/recent", {
    credentials: "include"
})

    const data = await response.json();

    const container =
    document.getElementById("recentUsers");

    if(data.success){

        container.innerHTML = data.users.map(user => `
            <div class="admin-item">
                <strong>${user.name}</strong>
                <p>${user.email}</p>
            </div>
        `).join("");
    }
}

loadDashboardStats();
loadRecentOrders();
loadRecentUsers();
