async function loadUsers() {
    const table = document.getElementById("usersTable");

    const response = await fetch("/api/admin/users", {
    credentials: "include"
});
    const data = await response.json();

    if (!data.success || !data.users.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No users found.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.users.map(user => `
        <tr>
            <td>${user.user_id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || "N/A"}</td>
            <td>${user.role}</td>
            <td>
                <button 
                    class="small-btn danger"
                    onclick="deleteUser(${user.user_id})"
                >
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

async function deleteUser(userId) {
    if (!confirmDelete("Delete this user?")) return;

    const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
    });

    const result = await response.json();

    showToast(result.message, result.success ? "success" : "error");

    loadUsers();
}

loadUsers();
