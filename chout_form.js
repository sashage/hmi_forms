(function(){
// Event listener to handle messages received by the 
window.addEventListener("message", receiveMessage);
window.addEventListener("load", processInputFields);

// Define the Google Analytics Measurement ID.
const gaMeasurementId = "TL2ET8VS74";
const cookies = parseCookies(document.cookie);

// Map custom fields to their retrieval methods.
const fields = {
    "ga_session_id": () => getSessionID(gaMeasurementId, 0),
    "ga_client_id": getClientId,
    "cookie_fbp": () => getCookie("_fbp"),
    "cookie_fbc": generateFBCCookie,
    "page_location": generateFBCCookie,
    "page_location": () => getRootDomain(),
    "last_uid": () => getLastUserId(),
    "user_agent": () => getUserAgent(),
	"pap_aid": () => getAffilateId(0),
    "pap_aid_timestamp": () => getAffilateId(1)
};


function getAffilateId(part = 0) {
    if(!part) part = 0;
	const data = localStorage.getItem("hmi_aaid");
	if (data) {
		const storedData = data.split(";")[part];
        const storedValue = data.split(";")[0];
        const expirationTimestamp = data.split(";")[1];

		// If a timestamp exists and is not expired, return the value
		if (expirationTimestamp && !isValueExpired(data)) {
		    return storedData;
		}
		// If a timestamp doesn't exist (old data), add a timestamp
		else if (!expirationTimestamp) {
            setNewValueWithTimestamp(storedValue);
            return storedData;
		}
	}

	// If no data is found or the data is expired, remove it
	localStorage.removeItem(AFFILIATE_STORAGE_KEY);
	return null;
}

function isValueExpired(data) {
	const [, expirationTimestamp] = data.split(';');
	// If there's no expiration timestamp, consider the value as not expired
	if (!expirationTimestamp) return false;

	const now = Date.now();
	return now > parseInt(expirationTimestamp, 10);
}

function getRootDomain() {
    var domain = window.location.hostname;
    var parts = domain.split('.');
    if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
    }
    return domain;
}

function getLastUserId() {
    var storedUserInfo = localStorage.getItem('_ud');
    var userInfo = storedUserInfo ? JSON.parse(atob(storedUserInfo)) : {};
    
    var emailQueryParameter = extractEmailFromURL();
    if ( emailQueryParameter ) {
        userInfo.user_id = btoa(emailQueryParameter);
        localStorage.setItem("_ud",encodeBase64(JSON.stringify(userInfo)));
        return btoa(emailQueryParameter);
    } else if (userInfo && userInfo.user_id) {
        return userInfo.user_id;
    }
}

function getUserAgent() {
    return window.navigator.userAgent;
}

// Process and populate the input fields based on their placeholders.
function processInputFields() {
console.log("process started...");
    // Hide the custom fields and their associated labels in the form
    document.querySelectorAll('[id^="custom_"],label[for^="custom_"]').forEach(function(elem){
        elem.closest("div.form-group").style.display = "none";
    });
    for (let fieldName in fields) {
        document.querySelectorAll(`input[placeholder="${fieldName}" i]`).forEach(function(elem){
            if (elem) {
                try {
                    // Set the value of the input field.
                    elem.value = fields[fieldName]() || "";
                } catch (error) {
                    // Log any errors during the process.
                    console.error("Error processing input field:", error);
                }
            }
        });
    }
}
// Function to retrieve the Google Analytics session ID from the cookies
function getSessionID(gaMeasurementId, retries) {
    const maxRetries = 10;
    if (retries >= maxRetries) return null;

    const pattern = new RegExp(`_ga_${gaMeasurementId}=GS\\d\\.\\d\\.(.+?)(?:;|$)`);
    const match = document.cookie.match(pattern);
    const parts = match?.[1].split(".");
    
    if (!parts) {
        window.setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
        return;
    }
    
    return parts[0];
}

// Function to handle received messages
function receiveMessage(msg) {
    //const msgObj = parseData(msg); 
    

        // Process and fill the input fields
        setTimeout(function(){
             processInputFields();
        },200);
}

// Function to parse the received data; returns an object
function parseData(data) {
    if (typeof data === 'string') {
        try {
            // Attempt to parse the string data as JSON
            return JSON.parse(data);
        } catch {
            // If parsing fails, return an empty object
            return {};
        }
    }
    // If data is already an object or undefined/null, return it or an empty object respectively
    return data || {};
}

// Retrieve the Google Analytics client ID from cookies.
function getClientId() {
    const gaCookieValue = cookies["_ga"];
    if (gaCookieValue) {
        const parts = gaCookieValue.split(".");
        return `${parts[2]}.${parts[3]}`;
    }
    return null;
}

// Get a specific cookie's value by its name.
function getCookie(CookieName) {
    const Cookie = document.cookie.split(';').find(row => row.trim().startsWith(CookieName));
    return Cookie ? Cookie.split('=')[1] : null;
}

// Generate or retrieve the Facebook click ID cookie.
function generateFBCCookie() {
    let cookie_fbc = getCookie("_fbc") || undefined;
    if (!cookie_fbc) {
        const fbclid = getUrlParameter('fbclid') || undefined;
        if(fbclid) {
            const date = new Date();
            const timestamp = date.getTime();
            const fbcValue = `fb.1.${timestamp}.${fbclid}`;
            document.cookie = `_fbc=${fbcValue}; path=/`;
            cookie_fbc = fbcValue;
        }
    }
    return cookie_fbc;
}

function getCookie(CookieName) {
    return cookies[CookieName] || null;
}

// Get URL parameters.
function getUrlParameter(name) {
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function parseCookies(cookieString) {
    const cookieArray = cookieString.split("; ");
    const cookieObj = {};
    cookieArray.forEach(cookie => {
        const [key, value] = cookie.split("=");
        cookieObj[key] = value;
    });
    return cookieObj;
}

})();
