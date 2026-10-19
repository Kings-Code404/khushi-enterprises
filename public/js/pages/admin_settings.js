document.getElementById("settingsForm").addEventListener("submit", function(e) {
    e.preventDefault();

    showToast("Settings saved successfully.", "success");
});
