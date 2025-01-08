// document
// 	.getElementById('login-form')
// 	.addEventListener('submit', async function (event) {
// 		event.preventDefault(); // Prevent form from submitting normally

// 		const username = document.getElementById('username').value;
// 		const password = document.getElementById('password').value;

// 		// Prepare the login credentials to send to the server
// 		const credentials = {
// 			username: username,
// 			password: password
// 		};

// 		try {
// 			// // Send login credentials to the server for authentication
// 			// const response = await fetch('/login', {
// 			// 	method: 'POST',
// 			// 	headers: {
// 			// 		'Content-Type': 'application/json'
// 			// 	},
// 			// 	body: JSON.stringify(credentials)
// 			// });
// 			// // Parse the response from the server
// 			// const result = await response.json();
// 			// // Handle server response
// 			// if (response.ok) {
// 			// 	// On success, store the token (if returned) or session info
// 			// 	document.getElementById('message').textContent =
// 			// 		'Login successful!';
// 			// 	document.getElementById('message').style.color = 'green';
// 			// 	// Redirect or store token here if needed, e.g.:
// 			// 	// localStorage.setItem('auth_token', result.token);
// 			// 	window.location.href = '/dashboard'; // Redirect to dashboard after login
// 			// } else {
// 			// 	// On error, display the error message
// 			// 	document.getElementById('message').textContent =
// 			// 		result.message || 'Invalid username or password';
// 			// 	document.getElementById('message').style.color = 'red';
// 			// }
// 		} catch (error) {
// 			// console.error('Error:', error);
// 			// document.getElementById('message').textContent =
// 			// 	'An error occurred. Please try again later.';
// 			// document.getElementById('message').style.color = 'red';
// 		}
// 	});
