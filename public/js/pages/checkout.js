let checkoutTotal = 0;
let checkoutItems = 0;
let submitting = false;
let activeIdempotencyKey = null;

function setNotice(message, type = "") { const box = document.getElementById("paymentNotice"); if (box) { box.textContent = message; box.className = type; } }
function setSubmitting(value) { submitting = value; const button = document.getElementById("confirmPaymentButton"); if (button) { button.disabled = value; button.textContent = value ? "Processing…" : "Confirm Payment"; } }
function billingPayload() { const data = new FormData(document.getElementById("billingForm")); return { first_name: data.get("first_name"), last_name: data.get("last_name"), phone: data.get("phone"), email: data.get("email"), country: data.get("country"), state: data.get("state"), city: data.get("city"), zip_code: data.get("zip"), street_address: data.get("address") }; }
function idempotencyKey() { return crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : `${Date.now()}${Math.random().toString(36).slice(2)}`.padEnd(16, "0"); }

async function loadCheckoutSummary() {
    const box = document.getElementById("checkoutSummary");
    try {
        const response = await fetch("/api/cart", { credentials: "include" });
        const data = await response.json();
        if (!data.success || !data.cartItems.length) { box.innerHTML = `<h3>Order Summary</h3><p>Your cart is empty.</p><a href="/products" class="checkout-main-btn">Shop Now</a>`; return; }
        checkoutTotal = Number(data.total); checkoutItems = data.cartItems.reduce((total, item) => total + Number(item.quantity), 0); renderCheckoutSummary();
    } catch (_) { box.innerHTML = `<h3>Order Summary</h3><p>Failed to load summary.</p>`; }
}

function renderCheckoutSummary() {
    const shipping = 0, taxes = 0, discount = 0, total = checkoutTotal + shipping + taxes - discount;
    document.getElementById("checkoutSummary").innerHTML = `<h3>Order Summary</h3><div class="summary-line"><span>Items</span><strong>${checkoutItems}</strong></div><div class="summary-line"><span>Sub Total</span><strong>₹${checkoutTotal.toFixed(2)}</strong></div><div class="summary-line"><span>Shipping</span><strong>₹${shipping.toFixed(2)}</strong></div><div class="summary-line"><span>Taxes</span><strong>₹${taxes.toFixed(2)}</strong></div><div class="summary-line discount"><span>Coupon Discount</span><strong>-₹${discount.toFixed(2)}</strong></div><div class="summary-total"><span>Total</span><strong>₹${total.toFixed(2)}</strong></div><button type="button" class="checkout-main-btn" onclick="goToPayment()">Proceed to Payment</button>`;
}

function goToPayment() {
    const form = document.getElementById("billingForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    document.getElementById("billingPanel").classList.remove("active"); document.getElementById("paymentPanel").classList.add("active");
    document.querySelectorAll(".checkout-step").forEach((item) => item.classList.toggle("active", item.dataset.step === "payment"));
}

document.querySelectorAll(".checkout-step").forEach((button) => button.addEventListener("click", () => button.dataset.step === "billing" ? (document.getElementById("billingPanel").classList.add("active"), document.getElementById("paymentPanel").classList.remove("active")) : goToPayment()));
document.querySelectorAll(".payment-box").forEach((box) => box.addEventListener("click", () => document.querySelectorAll(".payment-box").forEach((item) => item.classList.toggle("active", item === box))));

async function placeOrder() {
    if (submitting) return;
    const form = document.getElementById("billingForm");
    if (!form.checkValidity()) { goToPayment(); return; }
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    setSubmitting(true); setNotice("");
    try {
        if (method === "COD") {
            const result = await apiRequest("/api/orders", "POST", { ...billingPayload(), payment_method: "COD" });
            if (!result.success) throw new Error(result.message);
            window.location.assign(`/order-completed/${result.orderId}`); return;
        }
        activeIdempotencyKey = activeIdempotencyKey || idempotencyKey();
        const response = await fetch("/api/payments/razorpay/order", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "Idempotency-Key": activeIdempotencyKey }, body: JSON.stringify(billingPayload()) });
        const order = await response.json();
        if (!order.success) throw new Error(order.message);
        if (!window.Razorpay) throw new Error("Razorpay Checkout could not be loaded. Check your connection and try again.");
        const checkout = new Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, name: order.name, description: `Order #${order.internalOrderId}`, order_id: order.razorpayOrderId, prefill: { name: `${billingPayload().first_name} ${billingPayload().last_name}`.trim(), email: billingPayload().email, contact: billingPayload().phone }, handler: async (payment) => {
            const verified = await apiRequest("/api/payments/razorpay/verify", "POST", { internal_order_id: order.internalOrderId, ...payment });
            if (!verified.success) { setNotice(verified.message || "Payment received but verification is pending.", "error"); setSubmitting(false); return; }
            window.location.assign(`/order-completed/${verified.orderId}`);
        }, modal: { ondismiss: async () => { await apiRequest(`/api/payments/razorpay/${order.internalOrderId}/cancel`, "POST"); setNotice("Payment was cancelled. Your reserved stock was released.", "error"); setSubmitting(false); } }, theme: { color: "#3a7259" } });
        checkout.on("payment.failed", async () => { await apiRequest(`/api/payments/razorpay/${order.internalOrderId}/cancel`, "POST"); activeIdempotencyKey = null; setNotice("Payment failed. Please try again.", "error"); setSubmitting(false); });
        checkout.open();
    } catch (error) { activeIdempotencyKey = null; setNotice(error.message || "Unable to start payment.", "error"); setSubmitting(false); }
}

loadCheckoutSummary();
