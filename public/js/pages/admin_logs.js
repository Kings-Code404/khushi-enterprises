async function loadLogs() {
    const table = document.getElementById("logsTable");
    const res = await fetch("/api/admin/logs", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.logs.length) {
        table.innerHTML = `<tr><td colspan="4">No logs found.</td></tr>`;
        return;
    }
    table.innerHTML = data.logs.map(l => `<tr><td>${l.log_id}</td><td>${l.admin_name || l.admin_id}</td><td>${l.action}</td><td>${l.created_at}</td></tr>`).join("");
}
loadLogs();
