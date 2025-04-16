
function validateLogin(username, password) {
    if (!username || !password) {
        return { error: "Please enter both username and password." };
    }
    return { message: "Login triggered!" };
}

module.exports = { validateLogin };
