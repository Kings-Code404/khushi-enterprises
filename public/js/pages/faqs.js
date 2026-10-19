document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        const item = button.parentElement;

        document.querySelectorAll(".faq-item").forEach(faq => {
            if (faq !== item) {
                faq.classList.remove("active");
                faq.querySelector("span").innerText = "+";
            }
        });

        item.classList.toggle("active");

        button.querySelector("span").innerText =
            item.classList.contains("active") ? "−" : "+";
    });
});
