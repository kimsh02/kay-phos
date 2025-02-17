//debug console message
console.log("login.js is running!");

function login(event) {
     // Prevent form submission
    if (event) event.preventDefault();
    console.log("login function running")

    let username = $('#username').val().trim();
    let password = $('#password').val().trim();

    // Check if fields are empty
    if (!username || !password) {
        $('#error-message').text("Please enter both username and password.");
        return;
    }

    let txdata = {
        //NEED TO CHECK IF SERVER RECIEVES USERNAME AND PASSWORD IN UPPER OR LOWERCASE
        username: username.toLowerCase(),  // Convert username to uppercase
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
        //should redirect if correct username and password or send error message if not
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
        //error messages in console not viewed by user
        console.log("AJAX Error:", jqXHR);
        console.log("Text Status:", textStatus);
        console.log("Error Thrown:", errorThrown);
        
        let errorMsg = "Invalid request";
        //checking status through console
        if (jqXHR.status === 400) {
            console.log("Error Response JSON:", jqXHR.responseJSON);
            errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.error 
                        ? jqXHR.responseJSON.error 
                        : "Invalid username or password";
                        
        } else if (jqXHR.status === 0) {
            errorMsg = "Server not responding. Is it running?";
        } else {
            errorMsg = "Unexpected error occurred.";
        }

        $('#rxData').text(errorMsg).css("color", "red"); 
        //$('#login-error').text(message).show();
    });
}

$(function () {
    console.log("running here too!");
    $('#username, #password').on('input', function () {
        $('#error-message').text("");  // Clear the error message
    });
    //submit button redirects to login function
    $('#submit').click(function () {
    
        event.preventDefault(); 
        console.log("submit running!");
        login(event);
    });
    //button redirects to new-accoung.html
    $('#button').click(function () {
        console.log("button running!");
        window.location.href = "public/html/new-account.html";
    });
});
