app.use((req, res, next) => {
    const originalSend = res.send; // Store original send function

    res.send = function (body) {
        if (typeof body === 'object' && body.error === 'http: named cookie not present') {
            console.error('Redirecting to login due to missing cookie.');
            return res.redirect('http://localhost:8080'); // Redirect to login
        }
        return originalSend.call(this, body);
    };

    next();
});



/* export async function fetchData(url) {
    try {
        const response = await fetch(url, { credentials: 'include' }); // Include cookies for auth
        const data = await response.json();

        if (data.error) {
            if (data.error === "http: named cookie not present" || data.error === "Invalid or expired token.") {
                // Redirect to login
                window.location.href = "http://localhost:8080/";
            } else if (data.error === "Invalid path.") {
                // Prevent navigation by doing nothing (could show an error message)
                console.error("Invalid path. Staying on the current page.");
            }
        } else {
            return data; // Handle valid data
        }
    } catch (error) {
        console.error("Network error:", error);
    }
} */