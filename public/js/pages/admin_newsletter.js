async function loadSubscribers() {
    const table = document.getElementById("newsletterTable");
    const res = await fetch("/api/admin/newsletter", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.subscribers.length) {
        table.innerHTML = `<tr><td colspan="4">No subscribers found.</td></tr>`;
        return;
    }
    table.innerHTML = data.subscribers.map(s => `<tr><td>${s.subscriber_id}</td><td>${s.email}</td><td>${s.status}</td><td>${s.created_at}</td></tr>`).join("");
}
loadSubscribers();
