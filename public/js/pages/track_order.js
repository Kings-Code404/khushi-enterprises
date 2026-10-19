document
.getElementById("trackOrderForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    let orderId = formData.get("order_id").trim();
    const email = formData.get("email").trim();

    orderId = orderId.replace("#", "").replace("KHUSHI", "");

    const resultBox = document.getElementById("trackResult");

    resultBox.innerHTML = "<p>Checking order...</p>";

    try {
        const response = await fetch(`/api/orders/track/${orderId}?email=${encodeURIComponent(email)}`, {
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            resultBox.innerHTML = `
                <div class="track-result error">
                    <h3>Order Not Found</h3>
                    <p>Please check your Order ID and try again.</p>
                </div>
            `;
            return;
        }

        resultBox.innerHTML = `
            <div class="track-result success">
                <h3>Order Found</h3>

                <p><strong>Order ID:</strong> #KHUSHI${data.order.order_id}</p>
                <p><strong>Status:</strong> ${data.order.order_status}</p>
                <p><strong>Payment:</strong> ${data.order.payment_method}</p>
                <p><strong>Total:</strong> ₹${Number(data.order.total_amount).toFixed(2)}</p>
                <p><strong>Order Date:</strong> ${new Date(data.order.created_at).toLocaleDateString()}</p>

                <a href="/order-completed/${data.order.order_id}" class="track-btn">
                    View Order Details
                </a>
            </div>
        `;

    } catch (error) {
        resultBox.innerHTML = `
            <div class="track-result error">
                <h3>Something went wrong</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
});
