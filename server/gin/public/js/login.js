console.log("login.js is running!");

function login(event) {
     // Prevent form submission
    if (event) event.preventDefault();
    console.log("login function running")

    let username = $('#username').val().trim();
    let password = $('#password').val().trim();

    // Client-side validation: Check if fields are empty
    if (!username || !password) {
        $('#error-message').text("Please enter both username and password.");
        return;
    }

    let txdata = {
        username: username.toUpperCase(),  // Convert username to uppercase
        inputpassword: password
    };


    $.ajax({
        url: 'http://localhost:8080/',  
        method: 'POST',
        contentType: 'application/json',  
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data) {
        console.log("Success response:", data);
        if (data.message) {  
            localStorage.setItem("message", data.message);  
            window.location.replace("public/html/dashboard.html");
        } else {
            console.log("Login failed: No message received.");
            $('#rxData').text("Login failed: No message received.");
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("AJAX Error:", jqXHR);
        console.log("Text Status:", textStatus);
        console.log("Error Thrown:", errorThrown);
        
        let errorMsg = "Invalid request";
        
        if (jqXHR.status === 400) {
            // Log the full error response for debugging
            console.log("Error Response JSON:", jqXHR.responseJSON);
            errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.error 
                        ? jqXHR.responseJSON.error 
                        : "Invalid username or password";
        } else if (jqXHR.status === 0) {
            errorMsg = "Server not responding. Is it running?";
        } else {
            errorMsg = "Unexpected error occurred.";
        }

        $('#rxData').text(errorMsg).css("color", "red");  // Show error message in red
    });
}

$(function () {
    console.log("running here too!");
    $('#username, #password').on('input', function () {
        $('#error-message').text("");  // Clear the error message
    });
    $('#submit').click(function () {
        event.preventDefault(); 
        console.log("submit running!");
        login(event);
    });
    $('#button').click(function () {
        console.log("button running!");
        window.location.href = "public/html/new-account.html";
    });
});
