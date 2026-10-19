async function loadCoupons() {
    const table = document.getElementById("couponsTable");
    const res = await fetch("/api/admin/coupons", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.coupons.length) {
        table.innerHTML = `<tr><td colspan="7">No coupons found.</td></tr>`;
        return;
    }
    table.innerHTML = data.coupons.map(c => `
        <tr>
            <td>${c.coupon_id}</td><td>${c.code}</td><td>${c.discount_type}</td><td>${c.discount_value}</td>
            <td>${c.expiry_date || "N/A"}</td><td>${c.status}</td>
            <td><button class="small-btn danger" onclick="deleteCoupon(${c.coupon_id})">Delete</button></td>
        </tr>`).join("");
}
async function deleteCoupon(id) {
    if (!confirmDelete("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "error");
    loadCoupons();
}
document.getElementById("couponForm").addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/admin/coupons", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "error");
    if (data.success) e.target.reset();
    loadCoupons();
});
loadCoupons();
