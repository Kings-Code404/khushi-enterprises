async function loadMessages() {
    const response = await fetch("/api/contact", {
        credentials: "include"
    });

    const data = await response.json();
    const table = document.getElementById("messagesTable");

    if (!data.success || !data.messages.length) {
        table.innerHTML = `<tr><td colspan="6">No messages found.</td></tr>`;
        return;
    }

    table.innerHTML = data.messages.map(msg => `
        <tr>
            <td>${msg.contact_id}</td>
            <td>${msg.name}</td>
            <td>${msg.email}</td>
            <td>${msg.subject || "N/A"}</td>
            <td>${msg.message}</td>
            <td>
                <button class="small-btn danger" onclick="deleteMessage(${msg.contact_id})">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

async function deleteMessage(id) {
    if (!confirmDelete("Delete this message?")) return;

    const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    const result = await response.json();

    showToast(result.message, result.success ? "success" : "error");
    loadMessages();
}

loadMessages();
