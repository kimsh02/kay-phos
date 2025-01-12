function getAccountStatus() {
	let cookieArr = document.cookie.split(';');

	// Loop through the cookies array
	for (let i = 0; i < cookieArr.length; i++) {
		let cookie = cookieArr[i].trim();

		// Check if the cookie name matches 'accountStatus'
		if (cookie.startsWith('accountStatus=')) {
			// Return the value of the cookie (after the '=' sign)
			console.log(cookie.substring('accountStatus='.length));
			return cookie.substring('accountStatus='.length);
		}
	}

	// Return null if cookie is not found
	return null;
}
window.onload = function () {
	// var accountStatus = getAccountStatus();
	getAccountStatus();
};

// alert(accountStatus);
// if (accountStatus == 'created') {
// 	alert('Account created successfully!');
// } else if (accountStatus == 'not logged in') {
// 	alert('Please log in.');
// }

// alert('Your account has been created successfully!');
