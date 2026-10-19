
async function adminLogout() {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        localStorage.clear();
        sessionStorage.clear();

        document.cookie = "token=; Max-Age=0; path=/";

        window.location.replace("/login");

    } catch (error) {
        console.error("Logout error:", error);
        window.location.replace("/login");
    }
}
