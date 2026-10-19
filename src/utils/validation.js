function positiveInteger(value) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function passwordError(password) {
    if (typeof password !== "string" || password.length < 10) return "Password must be at least 10 characters long.";
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return "Password must include uppercase, lowercase, and a number.";
    return null;
}

module.exports = { positiveInteger, passwordError };
