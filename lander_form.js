(function() {})(
var gaMeasurementId = "TL2ET8VS74";
var AFFILIATE_STORAGE_KEY = "hmi_aaid";


function getRootDomain() {
    var domain = window.location.hostname;
    var parts = domain.split('.');
    if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
    }
    return domain;
}

function getAffiliateId(part = 0) {
	if (!part) part = 0;
	if ( localStorage.getItem("hmi_aaid") ) {
		return localStorage.getItem("hmi_aaid").split(";")[part];
	} else if ( sessionStorage.getItem("hmi_aaid") )  {
    	return sessionStorage.getItem("hmi_aaid").split(";")[part];
	}
}



function storeAffiliateData() {
	const urlObj = new URL(window.location.href);
    const fragment = urlObj.hash.substring(1); // Remove the '#' at the start
    const params = new URLSearchParams(fragment);
	var hmi_aaid = params.get('a_aid');
	if (hmi_aaid) {
		hmi_aaid = hmi_aaid.split('?')[0];
		localStorage.setItem('affiliation','affiliate');
		var storedId = getAffiliateStorage();
		if (!storedId) {
			const now = new Date();
			const expirationTimestamp = new Date(now.setDate(now.getDate() + 60)).getTime();
			sessionStorage.setItem("hmi_aaid",hmi_aaid + ";" + expirationTimestamp);
		}
	}
}

function getAffiliateStorage() {
	const data = localStorage.getItem(AFFILIATE_STORAGE_KEY);
	if (data) {
		const [storedValue, expirationTimestamp] = data.split(';');

		// If a timestamp exists and is not expired, return the value
		if (expirationTimestamp && !isValueExpired(data)) {
		return storedValue;
		}
		// If a timestamp doesn't exist (old data), add a timestamp
		else if (!expirationTimestamp) {
		setNewValueWithTimestamp(storedValue);
		return storedValue;
		}
	}

	// If no data is found or the data is expired, remove it
	localStorage.removeItem(AFFILIATE_STORAGE_KEY);
	return null;
}

function setNewValueWithTimestamp(value) {
	const now = new Date();
	const expirationTimestamp = new Date(now.setDate(now.getDate() + 60)).getTime();
	localStorage.setItem(AFFILIATE_STORAGE_KEY, `${value};${expirationTimestamp}`);
}

function isValueExpired(data) {
	const [, expirationTimestamp] = data.split(';');
	// If there's no expiration timestamp, consider the value as not expired
	if (!expirationTimestamp) return false;

	const now = Date.now();
	return now > parseInt(expirationTimestamp, 10);
}

function generateClientId() {
    var timestampMillis = new Date().getTime();
    var randomNumber = Math.floor(Math.random() * 1000000000);
    return 'GA1.1.' + randomNumber + '.' + timestampMillis;
}

function getCookieValue(cookieName) {
    var matches = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
    return matches ? matches.pop() : '';
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
}


function runScript() {
    console.log("running script...")
    document.querySelectorAll('form input[name^="custom_"]').forEach(function(el){
        el.closest('div.kartra_optin_cg').style.display = "none";
    });

    const fields = {
        "cookie_fbp": generateFBPCookie,
        "cookie_fbc": generateFBCCookie,
        "ga_client_id": getClientId,
        "ga_session_id": () => getSessionID(gaMeasurementId),
        "utm_source": getUtmOrElValues,
        "utm_medium": getUtmOrElValues,
        "utm_campaign": getUtmOrElValues,
        "affiliation": getAffiliation,
        "page_location": getRootDomain,
        "last_uid": getLastUserId,
        "pap_aid": () => getAffiliateId(0),
		"pap_aid_timestamp": () => getAffiliateId(1),
		"user_agent": getUserAgent
    };
    
    for(let fieldName in fields) {
        document.querySelectorAll(`input[placeholder="${fieldName}"]`).forEach(function(elem){
            if (elem) {
                //elem.closest('div.kartra_optin_cg').style.display = "none";
                try {
                    elem.value = fields[fieldName]() || "";
                } catch (error) {
                    console.error("Error processing input field:", error);
                }
            }
        });
    }
}

// Utility functions
function encodeBase64(string) {
	return btoa(string);
}

function getLastUserId() {
    var storedUserInfo = localStorage.getItem('_ud');
    var userInfo = storedUserInfo ? JSON.parse(atob(storedUserInfo)) : {};
    var emailQueryParameter = extractEmailFromURL();
    if (emailQueryParameter) {
        userInfo.user_id = btoa(emailQueryParameter);
        localStorage.setItem("_ud", encodeBase64(JSON.stringify(userInfo)));
        return btoa(emailQueryParameter);
    } else if (userInfo && userInfo.user_id) {
        return userInfo.user_id;
    }
}

function getUserAgent() {
	return window.navigator.userAgent;
}

function extractEmailFromURL() {
    var urlObj = new URL(window.location.href);
    var email = urlObj.searchParams.get("he");
    if(email) {
        email = email.replace('+', ' ');
        return email;
    }
    return null;
}

function generateFBCCookie() {
    let cookie_fbc = getCookieValue("_fbc") || null;
    if (cookie_fbc) {
        cookie_fbc = cookie_fbc;
    } else {
        const fbclid = getUrlParameter('fbclid') || undefined;
        if(fbclid) {
            const creationTime = new Date().getTime();
            const fbcValue = `fb.1.${creationTime}.${fbclid}`;
            const cookieName = "_fbc";
            let expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 2);
            const rootDomain = getRootDomain();
            document.cookie = cookieName + '=' + fbcValue + '; expires=' + expiryDate.toUTCString() + '; domain=' + rootDomain + '; path=/; SameSite=Lax';
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

function getUrlParameter(name) {
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getClientId() {
    const gaCookieValue = getCookieValue("_ga");
    if (gaCookieValue) {
        return gaCookieValue;
    }
    return null;
}

function getAffiliation() {
    return localStorage.getItem('affiliation');
}

function getUtmOrElValues(name) {
    const utmNames = ['utm_source', 'utm_medium', 'utm_campaign'];
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

function getSessionID(gaMeasurementId, intervalCount = 0) {
    const pattern = new RegExp(`_ga_${gaMeasurementId}=GS\\d\\.\\d\\.(.+?)(?:;|$)`);
    const match = document.cookie.match(pattern);
    const parts = match?.[1].split(".");
    if (!parts && intervalCount < 50) {
        intervalCount += 1;
        window.setTimeout(() => getSessionID(gaMeasurementId, intervalCount), 200);
        return;
    }
    return parts[0];
}

setClientIdCookie();
storeAffiliateData();

document.addEventListener("DOMContentLoaded", function() {
        
    // Run the script to process form fields
    document.querySelectorAll('a[href="javascript: void(0);"]').forEach(function(btn){
        btn.addEventListener("click", runScript)
    });
    
    //runScript();
});
);
