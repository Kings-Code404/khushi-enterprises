async function loadNotifications() {
    const table = document.getElementById("notificationsTable");
    const res = await fetch("/api/admin/notifications", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.notifications.length) {
        table.innerHTML = `<tr><td colspan="5">No notifications found.</td></tr>`;
        return;
    }
    table.innerHTML = data.notifications.map(n => `<tr><td>${n.notification_id}</td><td>${n.name || n.email}</td><td>${n.title}</td><td>${n.message}</td><td>${n.status}</td></tr>`).join("");
}
document.getElementById("notificationForm").addEventListener("submit", async e => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch("/api/admin/notifications", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "error");
    if (data.success) e.target.reset();
    loadNotifications();
});
loadNotifications();
