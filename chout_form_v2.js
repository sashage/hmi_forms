(function(){
// Event listener to handle messages received by the 
window.addEventListener("message", receiveMessage);
window.addEventListener("load", processTrackingData);

// Define the Google Analytics Measurement ID.
const gaMeasurementId = "TL2ET8VS74";
const AFFILIATE_STORAGE_KEY = "hmiaid";
const cookies = parseCookies(document.cookie);

function getAffiliateData() {
    //check if there is already valid stored affiliate data
    var stored_data = getAffiliateStorage()
    if ( stored_data ) return stored_data;
    return null; 
}

function encodeBase64(string) {
		var b64 = window.btoa(encodeURIComponent(string))
		return b64;	
}

function decodeBase64(b64) {
    var string = decodeURIComponent(window.atob(b64))
    return string;	
}

function getAffiliateStorage() {
    const stored_data = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    if (stored_data) {
        var json_data;
        try {
            json_data = JSON.parse(decodeBase64(stored_data));
        } catch (error) {
            //remove item if invalid
            console.log("Error",error)
            localStorage.removeItem(AFFILIATE_STORAGE_KEY);
            return null;
        }

        //if not all values are present - delete and return
        if(!( (json_data.affiliate_id || json_data.affiliate_id_full_string) && json_data.affiliate_timestamp_created && json_data.affiliate_timestamp_expired)) {
            localStorage.removeItem(AFFILIATE_STORAGE_KEY);
            return null;
        }

        // If the data set is expired - delete and return
        if ( isValueExpired(json_data.affiliate_timestamp_expired) ) {
            localStorage.removeItem(AFFILIATE_STORAGE_KEY);
            return null;
        }

        return json_data;
    }

    // If no data is found or the data is expired, remove it
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    return null;
}


function isValueExpired(timestamp) {
    if (!timestamp) return true;

    const now = Date.now();
    return now > parseInt(timestamp, 10);
}


function getRootDomain() {
    // Define a regex pattern to match against the hostname
    var regex = /([a-zA-Z0-9-]+\.)*([a-zA-Z0-9-]+\.[a-zA-Z]{2,4})$/;

    // Attempt to extract the domain using window.location.hostname
    var hostname = window.location.hostname;
    var match = hostname.match(regex);
    if (match) {
        return match[2];
    }

    // Fallback 1: Using window.location.host (includes port numbers if present)
    var host = window.location.host;
    match = host.match(regex);
    if (match) {
        return match[2];
    }

    // Fallback 2: Using window.location.origin (scheme + hostname + port)
    var origin = new URL(window.location.origin);
    match = origin.hostname.match(regex);
    if (match) {
        return match[2];
    }

    // Fallback 3: Direct extraction from window.location.href
    var href = new URL(window.location.href);
    match = href.hostname.match(regex);
    if (match) {
        return match[2];
    }

    // Further Fallback: Parsing the hostname directly for simpler cases
    var parts = hostname.split('.');
    var partCount = parts.length;
    if (partCount > 1) {
        return parts[partCount - 2] + '.' + parts[partCount - 1];
    } else {
        // Last resort: return the hostname itself
        return hostname;
    }
}


function getLastUserId() {
    var storedUserInfo = localStorage.getItem('_ud');
    var userInfo = storedUserInfo ? JSON.parse(decodeBase64(storedUserInfo)) : {};
    
    var emailQueryParameter = extractEmailFromURL();
    if ( emailQueryParameter ) {
        userInfo.user_id = encodeBase64(emailQueryParameter);
        localStorage.setItem("_ud",encodeBase64(JSON.stringify(userInfo)));
        return encodeBase64(emailQueryParameter);
    } else if (userInfo && userInfo.user_id) {
        return userInfo.user_id;
    }
}

function getUserAgent() {
    return window.navigator.userAgent;
}

// Function to retrieve the Google Analytics session ID from the cookies
function getSessionID(gaMeasurementId, retries = 0) {
    const maxRetries = 10;
    if (retries >= maxRetries) return null;

    try {
        const pattern = new RegExp(`_ga_${gaMeasurementId}=GS\\d\\.\\d\\.(.+?)(?:;|$)`);
        const cookie = document.cookie;
        if (!cookie) {
            setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
            return;
        }

        const match = cookie.match(pattern);
        if (!match) {
            setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
            return;
        }

        const sessionId = match[1].split(".")[0];
        if (sessionId) {
            return sessionId;
        } else {
            setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
        }
    } catch (error) {
        console.error('Error retrieving GA4 session ID:', error);
        setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
    }

    return null;
}


// Function to handle received messages
function receiveMessage(msg) {
    //const msgObj = parseData(msg); 
    

        // Process and fill the input fields
        setTimeout(function(){
            processTrackingData();
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
    const gaCookieValue = getCookieValue["_ga"];
    if (gaCookieValue) {
        const parts = gaCookieValue.split(".");
        return `${parts[2]}.${parts[3]}`;
    }
    return null;
}

// Get a specific cookie's value by its name.
function getCookieValue(name) {
    // Encode the cookie name to handle special characters
    name = encodeURIComponent(name);

    // Retrieve all cookies, split them into individual cookie strings
    const cookieArray = document.cookie.split(';');

    // Iterate through each cookie string
    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();

        // Check if the current cookie string begins with the encoded name followed by '='
        if (cookie.indexOf(name + '=') === 0) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }

    // Return an empty string if the cookie with the specified name is not found
    return '';
}


function getStapeId() {
    var stape_id = getCookieValue("_hmi_stape_id");
    if (stape_id) return stape_id;
    return null;
}

function getSummitName() {
    return localStorage.getItem("summit_name") || null;
}

// Generate or retrieve the Facebook click ID cookie.
function generateFBCCookie() {
    let cookie_fbc = getCookieValue("_fbc") || undefined;
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

function generateFBPCookie() {
    let cookie_fbp = getCookieValue("_fbp") || null;
    if (!cookie_fbp) {
        const version = "fb";
        const subdomainIndex = "1";
        const creationTime = new Date().getTime();
        const randomNumber = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
        cookie_fbp = `${version}.${subdomainIndex}.${creationTime}.${randomNumber}`;
        const cookieName = "_fbp";
        let expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        const rootDomain = getRootDomain();
        document.cookie = cookieName + '=' + cookie_fbp + '; expires=' + expiryDate.toUTCString() + '; domain=' + rootDomain + '; path=/; SameSite=Lax';			
    }
    return cookie_fbp;
}

function generateClientId() {
    var timestampMillis = new Date().getTime();
    var randomNumber = Math.floor(Math.random() * 1000000000);
    return 'GA1.1.' + randomNumber + '.' + timestampMillis;
}

function getUrlParameter(name) {
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getUtmOrElValues(name) {
    const utmNames = ['utm_source', 'utm_medium', 'utm_campaign','utm_content','utm_term'];
    if (utmNames.includes(name)) {
        const utmValue = getUrlParameter(name);
        if (utmValue) {
            return utmValue;
        } else if (name === 'utm_source' && getUrlParameter('el')) {
            return 'kartra';
        } else if (name === 'utm_medium' && getUrlParameter('el')) {
            return 'email';
        } else if (name === 'utm_campaign' && getUrlParameter('el')) {
            return getUrlParameter('el');
        }
    }
    return getUrlParameter(name);
}


function setClientIdCookie() {
    var cookieName = "_ga";
    var expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    var existingCookie = getCookieValue(cookieName);
    var clientIdFromLocalStorage = localStorage.getItem(cookieName);
    
    var clientId = existingCookie || clientIdFromLocalStorage || window._globalClientId || generateClientId();
    
    if (existingCookie !== clientId) {
        var rootDomain = getRootDomain();
        document.cookie = cookieName + '=' + clientId + '; expires=' + expiryDate.toUTCString() + '; domain=' + rootDomain + '; path=/; SameSite=Lax';
    }
    
    if (clientIdFromLocalStorage !== clientId) {
        localStorage.setItem(cookieName, clientId);
    }
    
    if (window._globalClientId !== clientId) {
        window._globalClientId = clientId;
    }

    return clientId;
}

function getCookieValue(cookieName) {
    var matches = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
    return matches ? matches.pop() : '';
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

function getTimestampInMilliseconds() {
    try {
	return Date.now() || new Date().getTime();
    } catch (error) {
	console.error("Error 019: Failed to get timestamp", error);
    }
}

function getTimestampInMicroseconds() {
    try {
	var millis = getTimestampInMilliseconds();
	var randomNumber = Math.floor(Math.random() * 1000);
	if (millis && randomNumber) {
	    return (millis * 1000) + randomNumber;
	}
	return undefined;
    } catch (error) {
	console.error("Error 020: Failed to get timestamp", error);
    }
}

function buildTrackingObject() {
    var obj = {
        "created_at": getTimestampInMicroseconds(),
        "cookie_fbp": generateFBPCookie(),
        "cookie_fbc": generateFBCCookie(),
	"cookie_ttp": getCookieValue("_ttp"),
        "ga_client_id": setClientIdCookie(),
        "ga_session_id": getSessionID(gaMeasurementId),
        "utm_source": getUtmOrElValues("utm_source"),
        "utm_medium": getUtmOrElValues("utm_medium"),
        "utm_campaign": getUtmOrElValues("utm_campaign"),
        "utm_content": getUtmOrElValues("utm_content"),
        "utm_term": getUtmOrElValues("utm_term"),
        "affiliation": getAffiliation(),
	"audience": getAudience(),
        "page_location": getRootDomain(),
        "last_uid": getLastUserId(),
        "user_agent": getUserAgent(),
	"summit_name": getSummitName(),
	"stape_id": getStapeId()
    };


    var affiliate_data = getAffiliateData();
    if (affiliate_data && ( affiliate_data.affiliate_id || affiliate_data.affiliate_id_full_string ) ) {
        obj.affiliate_id = affiliate_data.affiliate_id;
        obj.affiliate_id_full_string = affiliate_data.affiliate_id_full_string;
        obj.affiliate_timestamp_created = affiliate_data.affiliate_timestamp_created;
        obj.affiliate_timestamp_expired = affiliate_data.affiliate_timestamp_expired;
    }

    return obj;

}

function getAffiliation() {
    return localStorage.getItem('affiliation');
}

function getAudience() {
    return localStorage.getItem('audience');
}

function extractEmailFromURL() {
    // Use window.location to access the current URL
    var urlObj = new URL(decodeURIComponent(window.location.href));

    // Use URLSearchParams to get the value of the 'he' parameter
    var email = urlObj.searchParams.get("he");

    // If the email parameter exists in the URL
    return email || null;


    // Return null if the email parameter doesn't exist in the URL
    return null;
}

function fillTrackingTextAreas(json_data) {
    if (!json_data) return;

    var string_data = encodeBase64(JSON.stringify(json_data));
    try {
        var textarea = document.querySelector('textarea[placeholder="Tracking_data"]')
        textarea.setAttribute("maxlength",5000)
        textarea.value = string_data;
    } catch (error) {
        //do nothing
    }

}


function processTrackingData() {
    var trackingData = buildTrackingObject();
    fillTrackingTextAreas(trackingData);

}


})();
