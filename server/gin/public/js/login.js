function login(event) {
    event.preventDefault(); // Prevents form submission

    let txdata = {
        username: $('#username').val().toUpperCase(),  
        inputpassword: $('#inputpassword').val()  
    };

    $.ajax({
        url: 'http://localhost:8080/',  
        method: 'POST',
        contentType: 'application/json',  
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data) {
        console.log("Success:", data);
        if (data.token) {  
            localStorage.setItem("token", data.token);  
            window.location.replace("dashboard.html");
        } else {
            $('#rxData').text("Login failed: No token received.");
        }
    })
    .fail(function (jqXHR) {
        console.log("AJAX Error:", jqXHR);

        let errorMsg = "Invalid request";
        if (jqXHR.status === 400) {
            // API returns an error message for invalid login
            errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.error 
                        ? jqXHR.responseJSON.error 
                        : "Invalid username or password";
        } else if (jqXHR.status === 0) {
            errorMsg = "Server not responding. Is it running?";
        } else {
            errorMsg = "Unexpected error occurred.";
        }

        $('#rxData').text(errorMsg).css("color", "red"); // Show error message in red
    });
}

$(function () {
    $('#submit').click(login);
    $('#button').click(function () {
        window.location.href = "new-account.html";
    });
});
