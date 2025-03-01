(function () {
    "use strict";

    try {
        const gaMeasurementId = "TL2ET8VS74";
        var AFFILIATE_STORAGE_KEY = "hmiaid";
        const firstButtonText = "NO";
        const secondButtonText = "YES";
        //const firstButtonFormId = "XNl7s2FeYGCp";
        //const secondButtonFormId = "J7lSk6XBzaa4";
        const stepOneTexts = ["cke_2597"];
        const stepTwoTexts = ["cke_8066"];

        let cookies, formType, fields, firstButtonContainers, secondButtonContainers, firstButtonForms, secondButtonForms, modals;
        let affiliateTimestampClick;
        let currentAffiliateClickIsAttributable = 1; //by default current affiliate is considered to be the first
        let dataLayerPushes = [];

        function getRootDomain() {
            try {
                try {
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
                } catch (error) {
                    console.error("Error 009: Failed to get root domain", error);
                }
            } catch (error) {
                console.error("Error 001: Failed to get root domain", error);
            }
        }


        function encodeBase64(string) {
            try {
                var b64 = window.btoa(encodeURIComponent(string))
                return b64;
            } catch (error) {
                console.error("Error 002: Failed to encode base64", error);
            }
        }

        function decodeBase64(b64) {
            try {
                var string = decodeURIComponent(window.atob(b64))
                return string;
            } catch (error) {
                console.error("Error 003: Failed to decode base64", error);
            }
        }

        function extractAffiliateString(string) {
            try {
                const regex = /a_aid=[a-zA-Z0-9_-]+/;
                const match = decodeURIComponent(string.replace(/\s/g, "")).match(regex);
                if (match) {
                    return match[0];
                } else {
                    return string; // return original string if not matched
                }
            } catch (error) {
                console.error("Error 004: Failed to extract affiliate string", error);
            }
        }

        function getAffiliateTimestampClick() {
            affiliateTimestampClick = affiliateTimestampClick || getTimestampInMicroseconds();
            return affiliateTimestampClick;
        }

        //check if there is already valid stored affiliate data
        function getAffiliateData() {
            var extracted_affiliate_id, extracted_affiliate_id_full_string;
            
            try {

                getAffiliateTimestampClick();

                let stored_data = getAffiliateStorage()
                if (stored_data && !stored_data["is_stored_affiliate_id"]) return stored_data; //only return affiliate data if not read from affiliate storage

                let json_data = {};
                if (stored_data && stored_data["is_stored_affiliate_id"]) {
                    currentAffiliateClickIsAttributable = 0 //previous affiliate_id was detected
                    json_data.restored_affiliate_id_full_string = stored_data.affiliate_id_full_string;
                    json_data.restored_affiliate_id = stored_data.affiliate_id;
                    json_data.restored_affiliate_timestamp_created = stored_data.affiliate_timestamp_created;
                    json_data.restored_affiliate_timestamp_expired = stored_data.affiliate_timestamp_expired;
                }


                //let urlObj = new URL(decodeURIComponent(window.location.href)); //make sure the url is properly decoded before using it
                //let fragment = urlObj.hash.substring(1); // Remove the '#' at the start
                let url = decodeURIComponent(decodeURIComponent(window.location.href)).replace(/\s+/g, "").trim()

                const regex = /[&|\?|#]a_aid[=|%3d|%3D]([A-Za-z0-9_-]+)/;

                // Executing the regex on the provided URL
                const matches = regex.exec(url);
            
                // Check if we found affiliate_full_string
                if (matches && matches[0]) {
                    // Validate that the captured group only consists of allowed characters
                    //console.log("Affiliate Data: ", matches)
                    const idPattern_full_string = /^a_aid[=|%3d|%3D][A-Za-z0-9_-]+$/;
                    let shortenedString = decodeURIComponent(matches[0]).substring(1);
                    
                    if (idPattern_full_string.test(shortenedString)) {
                        extracted_affiliate_id_full_string = shortenedString;
                        // Check if we found affiliate_id inside fullstring
                        if (matches[1]) {
                            // Validate that the captured group only consists of allowed characters
                            const idPattern = /^[A-Za-z0-9_-]+$/;
                            if (idPattern.test(matches[1])) {
                                extracted_affiliate_id = matches[3];
                            }
                        else if (extracted_affiliate_id_full_string) {
                            const idPattern_full_string_extract = /^a_aid[=|%3d|%3D]([A-Za-z0-9_-]+).*$/;
                            var extracted_id = idPattern_full_string_extract.exec(extracted_affiliate_id_full_string);
                            extracted_affiliate_id = extracted_id[1]
                        }
                            
                        }
                        
                    }
                    
                }

                
                if (  extracted_affiliate_id_full_string || extracted_affiliate_id ) {
                    json_data.affiliate_id_full_string = extracted_affiliate_id_full_string;

                    //let params = new URLSearchParams(fragment);
                    //let hmi_aaid = params.get('a_aid'); //default PAP Affiliare ID from URL
                    let hmi_aaid = extracted_affiliate_id || extracted_affiliate_id_full_string.split("=")[1];

                    const now = new Date();
                    const expirationTimestamp = new Date(now.setDate(now.getDate() + 60)).getTime();

                    json_data.affiliate_id = hmi_aaid;
                    json_data.affiliate_timestamp_created = new Date().getTime();
                    json_data.affiliate_timestamp_expired = expirationTimestamp;
                    json_data.affiliate_timestamp_click = getAffiliateTimestampClick();
                    json_data.current_affiliate_click_is_attributable = currentAffiliateClickIsAttributable;


                    fireDataLayerEvent("affiliate_click", json_data
                        // {
                        // 	"affiliate_id": hmi_aaid,
                        // 	"affiliate_id_full_string": fragment,
                        // 	"affiliate_timestamp_click": getAffiliateTimestampClick();,
                        // 	"currentAffiliateClickIsAttributable": currentAffiliateClickIsAttributable || undefined
                        // }
                    );

                    //store affiliate data
                    localStorage.setItem('affiliation', 'affiliate');

                    //store affiliate_date to session storage. Will be copied to local storage after optin

                    if (currentAffiliateClickIsAttributable && currentAffiliateClickIsAttributable == 1) { //only set sessionStorage if current affiliate is attributable
                        var session_json_data = json_data;
                        delete session_json_data.restored_affiliate_id_full_string;
                        delete session_json_data.restored_affiliate_id;
                        delete session_json_data.restored_affiliate_timestamp_created;
                        delete session_json_data.restored_affiliate_timestamp_expired;
                        delete session_json_data.current_affiliate_click_is_attributable;
                        sessionStorage.setItem(AFFILIATE_STORAGE_KEY, encodeBase64(JSON.stringify(session_json_data)));
                    }

                    return json_data;

                } else {
                    localStorage.setItem('affiliation', window.affiliation);
                }

                return null;
            } catch (error) {
                console.error("Error 005: Failed to get affiliate storage", error);
            }

        }

        function getAffiliateStorage() {
            const local_data = localStorage.getItem(AFFILIATE_STORAGE_KEY);
            const session_data = sessionStorage.getItem(AFFILIATE_STORAGE_KEY);
            if (local_data) {
                var json_data;
                try {
                    json_data = JSON.parse(decodeBase64(local_data));
                } catch (error) {
                    //remove item if invalid
                    console.log("Error", error)
                    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    //sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    return null;
                }

                //if not all values are present - delete and return
                if (!((json_data.affiliate_id || json_data.affiliate_id_full_string) && json_data.affiliate_timestamp_created && json_data.affiliate_timestamp_expired)) {
                    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    //sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    return null;
                }

                // If the data set is expired - delete and return
                if (isValueExpired(json_data.affiliate_timestamp_expired)) {
                    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    //sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    return null;
                }

                json_data["is_stored_affiliate_id"] = 1 //add field to indicate that the affilaite ID was loaded from storage
                return json_data;
            }

            else if (session_data) {
                var json_data;
                try {
                    json_data = JSON.parse(decodeBase64(session_data));
                    return json_data;
                } catch (error) {
                    //remove item if invalid
                    console.log("Error", error)
                    sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
                    return null;
                }
            }

            // If no valid data is found or the data is expired, remove it
            localStorage.removeItem(AFFILIATE_STORAGE_KEY);
            sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
            return null;
        }


        function isValueExpired(timestamp) {
            try {
                if (!timestamp) return true;

                const now = Date.now();
                return now > parseInt(timestamp, 10);
            } catch (error) {
                console.error("Error 007: Failed to check if value is expired", error);
            }
        }

        function generateClientId() {
            try {
                var timestampMillis = new Date().getTime();
                var randomNumber = Math.floor(Math.random() * 1000000000);
                return 'GA1.1.' + randomNumber + '.' + timestampMillis;
            } catch (error) {
                console.error("Error 008: Failed to generate client ID", error);
            }
        }

        function getCookieValue(name) {
            try {
                // Encode the cookie name to handle special characters
                const cookieName = decodeURIComponent(name);

                // Retrieve all cookies, split them into individual cookie strings
                const cookieArray = document.cookie.split(';');

                // Iterate through each cookie string
                for (let i = 0; i < cookieArray.length; i++) {
                    const cookie = decodeURIComponent(cookieArray[i].trim());

                    // Check if the current cookie string begins with the encoded name followed by '='
                    if (cookie.indexOf(cookieName + '=') === 0) {
                        return decodeURIComponent(cookie.substring(cookieName.length + 1));
                    }
                }

                // Return an empty string if the cookie with the specified name is not found
                return '';
            } catch (error) {
                console.error("Error 010: Failed to get cookie value", error);
            }
        }

        function setClientIdCookie() {
            try {
                var cookieName = "_ga";
                var expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 2); // Setting cookie expiration to 2 years

                var existingCookie = getCookieValue(cookieName);
                var clientIdFromLocalStorage = localStorage.getItem(cookieName);

                var clientId = existingCookie || clientIdFromLocalStorage || window._globalClientId || generateClientId();

                if (existingCookie !== clientId) {
                    var rootDomain = getRootDomain();
                    document.cookie = `${cookieName}=${clientId}; expires=${expiryDate.toUTCString()}; domain=${rootDomain}; path=/; Secure; HttpOnly; SameSite=Lax`;
                }

                if (clientIdFromLocalStorage !== clientId) {
                    localStorage.setItem(cookieName, clientId);
                }

                if (window._globalClientId !== clientId) {
                    window._globalClientId = clientId;
                }

                if (!/GA1\.1\.\d{4,}\.\d{4,}/.test(clientId)) return undefined;
                return clientId;
            } catch (error) {
                console.error("Error 011: Failed to set client ID cookie", error);
            }
        }

        function getStapeId() {
            var stape_id = getCookieValue("_hmi_stape_id");
            if (stape_id) return stape_id;
            return undefined;
        }
        function getSummitName() {
            return localStorage.getItem("summit_name") || undefined;
        }

        function getAffiliation() {
            return localStorage.getItem('affiliation');
        }

        function getAudience() {
            return localStorage.getItem('audience');
        }


        function isNumber(value) {

            try {
                var regex = /\d+/;
                return value.match(regex);
            } catch (error) {
                console.error("Error 014: Failed to check if value is a number", error);
                return false;
            }

        }

        //Function get last user id
        function getLastUserId() {
            try {
                var storedUserInfo = localStorage.getItem('_ud');
                var userInfo = {};
                if (storedUserInfo) {
                    try {
                        userInfo = JSON.parse(decodeBase64(storedUserInfo));
                    } catch (e) {
                        console.error("Error 028: Failed to parse user info from local storage", e);
                        localStorage.removeItem('_ud');
                        return null;
                    }
                    var emailQueryParameter = extractEmailFromURL();
                    if (emailQueryParameter) {
                        userInfo.user_id = window.btoa(decodeURIComponent(emailQueryParameter.toLowerCase()));
                        window.localStorage.setItem("_ud", encodeBase64(JSON.stringify(userInfo)));
                        return window.btoa(decodeURIComponent(emailQueryParameter.toLowerCase()));
                    } else if (userInfo && userInfo.user_id) {
                        return decodeURIComponent(userInfo.user_id);
                    }
                }
                return null;
            } catch (error) {
                console.error("Error 029: Failed to get last user ID", error);
            }
        }

        function getUserAgent() {
            return window.navigator.userAgent;
        }

        function extractEmailFromURL() {
            // Use window.location to access the current URL
            var urlObj = new URL(decodeURIComponent(window.location.href));

            // Use URLSearchParams to get the value of the 'he' parameter
            var email = urlObj.searchParams.get("he");

            if ( email ) { email = decodeURIComponent(email).replace("%40","@"); }

            // If the email parameter exists in the URL
            return email || null;


            // Return null if the email parameter doesn't exist in the URL
            return null;
        }

        function generateFBCCookie() {
            try {
                let cookie_fbc = getCookieValue("_fbc") || null;
                if (!cookie_fbc) {
                    const fbclid = getUrlParameter('fbclid') || undefined;
                    if (fbclid) {
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
            } catch (error) {
                console.error("Error 013: Failed to generate or retrieve _fbc cookie", error);
            }
        }


        function generateFBPCookie() {
            try {
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
            } catch (error) {
                console.error("Error 014: Failed to generate or retrieve _fbc cookie", error);
            }
        }


        function getUrlParameter(name) {
            try {
                const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
                const results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            } catch (error) {
                console.error("Error 015: Failed to get URL parameters ", error);
            }
        }

        function getUtmOrElValues(name) {
            try {
                const utmNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
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
            } catch (error) {
                console.error("Error 016: Failed to to get URL parameters", error);
            }
        }


        function getSessionID(gaMeasurementId = gaMeasurementId, retries = 0) {
            const maxRetries = 25;
            //if (retries >= maxRetries) return null;

            try {
                const pattern = new RegExp(`_ga_${gaMeasurementId}=GS\\d\\.\\d\\.(.+?)(?:;|$)`);
                const cookie = document.cookie;
                if (!cookie) {
                    //setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
                    return;
                }

                const match = cookie.match(pattern);
                if (!match) {
                    //setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
                    return;
                }

                const sessionId = match[1].split(".")[0];
                if (sessionId && isNumber(sessionId)) {
                    return sessionId;
                } else {
                    //setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
                }
            } catch (error) {
                console.error('Error 017: Error retrieving GA4 session ID:', error);
                //setTimeout(() => getSessionID(gaMeasurementId, retries + 1), 500);
            }

            return null;
        }

        function parseCookies(cookieString) {
            try {
                const cookieArray = cookieString.split("; ");
                const cookieObj = {};
                cookieArray.forEach(cookie => {
                    const [key, value] = cookie.split("=");
                    cookieObj[key] = value;
                });
                return cookieObj;
            } catch (error) {
                console.error("Error 018: Failed to parse cookie", error);
            }
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

        // Store and retrieve the value from window variable
        function storeValueToWindow(key, str) {
            try {
                var encoded = encodeBase64(str);
                window[key] = encoded;
            } catch (error) {
                console.error("Error 021: Failed to store to window", error);
            }
        }

        function getValueFromWindow(key) {
            try {
                var encoded = window[key];
                return encoded ? decodeBase64(encoded) : null;
            } catch (error) {
                console.error("Error 022: Failed to read from window", error);
            }
        }

        // Manual object merge function for ES5
        function mergeObjects(target, source) {
            try {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
                return target;
            } catch (error) {
                console.error("Error 023: Failed to merge objects", error);
            }
        }


        // Main function to build and update the tracking object
        function buildTrackingObject() {
            var storageKey = 'trackingData';
            var existingObj = {};
            var storedString = getValueFromWindow(storageKey) || undefined;
            try {
                if (storedString) existingObj = JSON.parse(storedString) || {};
            } catch (error) {
                console.error("Error 024: Failed to parse string", error);
            }

            try {
                var affiliate_data = getAffiliateData() || {};
                existingObj = mergeObjects(existingObj, {
                    affiliate_id: existingObj["affiliate_id"] || affiliate_data["affiliate_id"] || existingObj["affiliate_id"] || "",
                    affiliate_id_full_string: existingObj["affiliate_id_full_string"] || affiliate_data["affiliate_id_full_string"] || existingObj["affiliate_id_full_string"] || undefined,
                    affiliate_timestamp_created: existingObj["affiliate_timestamp_created"] || affiliate_data["affiliate_timestamp_created"] || existingObj["affiliate_timestamp_created"] || undefined,
                    affiliate_timestamp_expired: existingObj["affiliate_timestamp_expired"] || affiliate_data["affiliate_timestamp_expired"] || existingObj["affiliate_timestamp_expired"] || undefined,
                    affiliate_timestamp_click: existingObj["affiliate_timestamp_click"] || affiliate_data["affiliate_timestamp_expired"] || getAffiliateTimestampClick() || undefined,

                    restored_affiliate_id: existingObj["restored_affiliate_id"] || affiliate_data["restored_affiliate_id"] || existingObj["restored_affiliate_id"] || undefined,
                    restored_affiliate_id_full_string: existingObj["restored_affiliate_id_full_string"] || affiliate_data["restored_affiliate_id_full_string"] || existingObj["restored_affiliate_id_full_string"] || undefined,
                    restored_affiliate_timestamp_created: existingObj["restored_affiliate_timestamp_created"] || affiliate_data["restored_affiliate_timestamp_created"] || existingObj["restored_affiliate_timestamp_created"] || undefined,
                    restored_affiliate_timestamp_expired: existingObj["restored_affiliate_timestamp_expired"] || affiliate_data["restored_affiliate_timestamp_expired"] || existingObj["restored_affiliate_timestamp_expired"] || undefined,
                    current_affiliate_click_is_attributable: existingObj["current_affiliate_click_is_attributable"] || affiliate_data["current_affiliate_click_is_attributable"] || existingObj["current_affiliate_click_is_attributable"] || undefined,

                    created_at: existingObj["created_at"] || getTimestampInMilliseconds() || undefined,
                    stape_id: getStapeId() || undefined,
                    ga_client_id: setClientIdCookie() || undefined,
                    ga_session_id: getSessionID(gaMeasurementId) || undefined,
                    affiliation: getAffiliation() || undefined,
                    audience: getAudience() || undefined,
                    page_referrer: getPageReferrer() || undefined,
                    last_uid: getLastUserId() || undefined,
                    user_agent: getUserAgent() || undefined,
                    summit_name: getSummitName() || undefined,
                    cookie_fbp: generateFBPCookie() || undefined,
                    cookie_fbc: generateFBCCookie() || undefined,
                    cookie_ttp: getCookieValue("_ttp") || undefined,
                    utm_source: getUtmOrElValues("utm_source") || undefined,
                    utm_medium: getUtmOrElValues("utm_medium") || undefined,
                    utm_campaign: getUtmOrElValues("utm_campaign") || undefined,
                    utm_content: getUtmOrElValues("utm_content") || undefined,
                    utm_term: getUtmOrElValues("utm_term") || undefined,
                    page_location: getRootDomain() || undefined

                });
            } catch (error) {
                console.error("Error 025: Failed to build object", error);
            }

            // Store the updated object back into session storage
            storeValueToWindow(storageKey, JSON.stringify(existingObj));

            return existingObj;
        }

        function fillTrackingTextAreas(json_data) {
            try {
                if (!json_data) return;

                var string_data = encodeBase64(JSON.stringify(json_data));
                document.querySelectorAll('textarea[placeholder="tracking_data"]').forEach(function (el) {
                    el.value = string_data;
                });
            } catch (error) {
                console.error("Error 026: Failed to store object", error);
            }

        }

        function getPageReferrer() {
            return document.referrer;
        }

        function hideAllTrackingTextAreas() {
            try {
                document.querySelectorAll('textarea[placeholder="tracking_data"]').forEach(function (el) {
                    el.style.display = "none";
                    el.closest('.kartra_optin_cg').style.display = "none";
                });
            } catch (error) {
                console.error("Error 027: Failed to hide texts", error);
            }
        }

        function prefillEmailAddressinForms() {
            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get('he');
            const emailInputName = 'email'; // Input field name attribute
            const localStorageKey = 'email';
        
            // Helper function to populate input fields
            function populateEmailFields(email) {
                const emailInputs = document.querySelectorAll(`input[name="${emailInputName}"]`);
                emailInputs.forEach(input => {
                    input.value = email;
                });
            }
        
            if (emailParam) {
                // URL decode the email and store it in localStorage
                const decodedEmail = decodeURIComponent(emailParam);
                localStorage.setItem(localStorageKey, decodedEmail);
                populateEmailFields(decodedEmail);
            } else {
                // Check localStorage if query parameter is not present
                const storedEmail = localStorage.getItem(localStorageKey);
                if (storedEmail) {
                    populateEmailFields(storedEmail);
                }
            }
        }




        // ########### single page run function ##################################

        function runScriptSingleForm() {

            console.log("running SingleForm script...")

            hideAllTrackingTextAreas();
            var trackingData = buildTrackingObject();
            fillTrackingTextAreas(trackingData);
        }

        // ########### multi page run function ##################################

        function runScriptMultiForm(isReset) {
            
            console.log("running MultiForm script...")
            if (isReset == "reset") resetMultiForms();
            // Handle button show/hide logic
            firstButtonContainers.forEach((btnContainer, index) => {
                btnContainer.addEventListener("click", function () {
                    setTimeout(function () {
                        modals.forEach(function (modal) {
                            let forms = modal.querySelectorAll('form');
                            let firstButtonForm = forms[0];
                            let secondButtonForm = forms[1];
                            if (firstButtonForm) firstButtonForm.style.display = 'block';
                            if (secondButtonForm) secondButtonForm.style.display = 'none';
                            hideAllButtons();
                        });
                        window.localStorage.audience = "general";
                    }, 200);
                });
            });

            secondButtonContainers.forEach((btnContainer, index) => {
                btnContainer.addEventListener("click", function () {
                    setTimeout(function () {
                        modals.forEach(function (modal) {
                            let forms = modal.querySelectorAll('form');
                            let firstButtonForm = forms[0];
                            let secondButtonForm = forms[1];
                            if (secondButtonForm) secondButtonForm.style.display = 'block';
                            if (firstButtonForm) firstButtonForm.style.display = 'none';
                            hideAllButtons();
                        });
                        window.localStorage.audience = "mhp";
                    }, 200);
                });
            });

            //hide buttons on multiform
            function hideAllButtons() {
                firstButtonContainers.forEach(buttonContainer => buttonContainer.style.display = 'none');
                secondButtonContainers.forEach(buttonContainer => buttonContainer.style.display = 'none');

                stepTwoTexts.forEach(function (text) {
                    var textElements = document.querySelectorAll('div[aria-controls="' + text + '"]');
                    textElements.forEach(function (elem) {
                        elem.style.display = "block";
                    });
                });
                stepOneTexts.forEach(function (text) {
                    var textElements = document.querySelectorAll('div[aria-controls="' + text + '"]');
                    textElements.forEach(function (elem) {
                        elem.style.display = "none";
                    });
                });

            }

            function resetMultiForms() {
                // Hide all buttons
                firstButtonContainers.forEach(buttonContainer => buttonContainer.style.display = 'block');
                secondButtonContainers.forEach(buttonContainer => buttonContainer.style.display = 'block');

                // Hide all forms
                modals.forEach(modal => {
                    let forms = modal.querySelectorAll('form');
                    forms.forEach(function (form) {
                        form.style.display = 'none';
                        form.reset();
                    });

                });

                // Show the first button text areas
                stepOneTexts.forEach(text => {
                    var textElements = document.querySelectorAll('div[aria-controls="' + text + '"]');
                    textElements.forEach(elem => {
                        elem.style.display = "block";
                    });
                });

                // Hide the second button text areas
                stepTwoTexts.forEach(text => {
                    var textElements = document.querySelectorAll('div[aria-controls="' + text + '"]');
                    textElements.forEach(elem => {
                        elem.style.display = "none";
                    });
                });

            }

            hideAllTrackingTextAreas();
            var trackingData = buildTrackingObject();
            fillTrackingTextAreas(trackingData);

        }


        //##########################   Landingpage - Singleform   ########################## 


        function loadSingleformLander() {
            try {
                document.querySelectorAll('a.toggle_optin, a.kartra_button1, button[type="submit"]').forEach(function (btn) {
                    btn.addEventListener("click", function () {
                        runScriptSingleForm();
                        fireDataLayerEvent("data_processed");
                    });
                });
            } catch (error) {
                console.error("Error 035: Failed add event listeners", error);
            }

            setTimeout(function () {
                runScriptSingleForm();
                prefillEmailAddressinForms();
            }, 500);

            setInterval(function () {
                runScriptSingleForm();
            }, 5000);

        }

        //##########################   Landingpage - Multiform   ########################## 

        function loadMultformLander() {
            setTimeout(function () {
                firstButtonContainers = Array.from(document.querySelectorAll('.modal-body div[data-component="button"]')).filter(div => div.textContent.trim().includes(firstButtonText));
                secondButtonContainers = Array.from(document.querySelectorAll('.modal-body div[data-component="button"]')).filter(div => div.textContent.trim().includes(secondButtonText));
                console.log("firstButtonContainers: ", firstButtonContainers);
                console.log("secondButtonContainers: ", secondButtonContainers);
                modals = Array.from(document.querySelectorAll('.modal-body'));
                modals.forEach(modal => {
                    let forms = modal.querySelectorAll('form');
                    let firstButtonForm = forms[0];
                    let secondButtonForm = forms[1];
                    if (firstButtonForm) firstButtonForm.style.display = 'none';
                    if (secondButtonForm) secondButtonForm.style.display = 'none';
                });

                console.log("Hidden respecitive containers.");

                stepTwoTexts.forEach(function (text) {
                    var textElements = document.querySelectorAll('div[aria-controls="' + text + '"]');
                    textElements.forEach(function (elem) {
                        elem.style.display = "none";
                    });
                });

                document.querySelectorAll('button[type="submit"]').forEach(function (btn) {
                    btn.addEventListener("click", function () {
                        setTimeout(function () {
                            runScriptMultiForm("noReset");
                        }, 200)
                    });
                    console.log("added event listeners...");
                });

                document.querySelectorAll('a.toggle_contentbox').forEach(function (btn) {
                    btn.addEventListener("click", function () {
                        setTimeout(function () {
                            
                            runScriptMultiForm("reset");
                            prefillEmailAddressinForms();
                            
                        }, 200)
                    });
                    console.log("added event listeners...");
                });
                
                setTimeout(function () {
                    runScriptMultiForm("noReset");
                    prefillEmailAddressinForms();
                }, 200)
            }, 500);
        }





        //##########################   Determine page type and load correct script   ########################## 


        function countFormsOnPage() {
            var formsOnPage = 0;
            try {
                document.querySelectorAll(".modal-body").forEach(function (el) {
                    var count = el.querySelectorAll("form").length;
                    if (count > formsOnPage) formsOnPage = count
                });
                return formsOnPage;
            } catch (error) {
                console.error("Error 034: Failed to count forms", error);
            }
        }

        function checkIfCheckoutPage() {
            return (!!document.querySelector('div[data-kt-type="checkout"]'));
        }

        function fireDataLayerEvent(event, payload = {}) {
            if (dataLayerPushes.includes(event)) return;
            payload["event"] = event;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(payload);
            dataLayerPushes.push(event);

        }


        function selectScriptForPageType() {
            console.log("Setting or refreshing ga_client_id to ", setClientIdCookie());
            if (checkIfCheckoutPage()) {
                //do nothing - run checkout script
                console.log("Wrong script - implement the checkout page script")
            } else {
                cookies = parseCookies(document.cookie);

                var formCount = countFormsOnPage();
                if (formCount == 2) {
                    console.log("Loading multi-form script");
                    loadMultformLander();
                }
                else if (formCount == 1) {
                    console.log("Loading single-form script");
                    loadSingleformLander();
                }

                else {
                    setInterval(function(){
                        console.log("Just run script");
                        var trackingData = buildTrackingObject();
                        fillTrackingTextAreas(trackingData);
                    },2000);
                }

            }
        }

        //##############################################################################################################

        console.log("initializing...");
        console.log("setting landing page...");
        try {
            window.page_type = "landing_page";
        } catch (error) {
            console.error("Error 031: failed to write to window", error);
        }

        try {
            document.addEventListener("DOMContentLoaded", function () {
                setTimeout(function () {
                    console.log("DOM Ready. Starting...")
                    fireDataLayerEvent("landing_page");
                    selectScriptForPageType();
                }, 200);
            });
        } catch (error) {
            console.error("Error 032: Failed add event listener", error);
        }

        try {
            if (document.readyState === "interactive") {
                setTimeout(function () {
                    console.log("Page is interactive. Starting...")
                    fireDataLayerEvent("landing_page");
                    selectScriptForPageType();
                }, 200);
            }
        } catch (error) {
            console.error("Error 033: Failed to run runscript", error);
        }

    } catch (error) {
        console.error("Error 100: Failed script", error);
    }


})();

