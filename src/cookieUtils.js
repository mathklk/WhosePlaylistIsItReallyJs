const cookieClientId = "client_id";
const cookieAccessToken = "access_token";

// If a cookie is expired, the browser will not reveal it in document.cookie and thus it will be null
function getCookie(name) {
	const nameEquals = name + '=';
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEquals) === 0) return decodeURIComponent(c.substring(nameEquals.length, c.length));
	}
	return null;
}

function setCookie(name, value, days, hours=0) {
	let cookieString = name + '=' + encodeURIComponent(value);
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + ((days * 24 + hours) * 60 * 60 * 1000));
		cookieString += '; expires=' + date.toUTCString();
	}
	document.cookie = cookieString;
}

function deleteCookie(name) {
	setCookie(name, '', -1);
}