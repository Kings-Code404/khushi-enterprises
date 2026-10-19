const codeInputs = document.querySelectorAll(".verify-code-box input");

codeInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            codeInputs[index - 1].focus();
        }
    });
});

document
.getElementById("verifyCodeForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    showToast("Code verified successfully.", "success");

    setTimeout(() => {
        window.location.href = "/login";
    }, 1000);
});
