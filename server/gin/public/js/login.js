function getCookieValue(name) {
	const cookies = document.cookie.split('; ');
	for (let cookie of cookies) {
		const [key, value] = cookie.split('=');
		if (key === name) {
			return decodeURIComponent(value);
		}
	}
	return null;
}

function waitForCookie(name, callback, interval = 100) {
	const checkCookie = setInterval(() => {
		const value = getCookieValue(name);
		if (value !== null) {
			clearInterval(checkCookie);
			callback(value);
		}
	}, interval);
}

// Usage
waitForCookie('accountStatus', (value) => {
	console.log('Account Status:', value);
	if (value === 'not+logged+in') {
		alert('Please log in!');
	}
});

document
	.getElementById('login-form')
	.addEventListener('submit', async function (event) {
		event.preventDefault();

		const formData = {
			username: document.getElementById('username').value,
			inputpassword: document.getElementById('password').value
		};

		console.log(formData);

		try {
			const response = await fetch('/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				if (response.redirected) {
					window.location.href = response.url;
				}
			} else {
				// Handle login failure by parsing JSON response
				const result = await response.json();
				alert(result.error); // Show error message
			}
		} catch (error) {
			console.error('Error:', error);
		}
	});
