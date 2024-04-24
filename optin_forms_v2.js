(function () {
    const gaMeasurementId = "TL2ET8VS74";
    var AFFILIATE_STORAGE_KEY = "hmiaid";
    const firstButtonText = "NO";
    const secondButtonText = "YES";
    //const firstButtonFormId = "XNl7s2FeYGCp";
    //const secondButtonFormId = "J7lSk6XBzaa4";
    const stepOneTexts = ["cke_2597"];
    const stepTwoTexts = ["cke_8066"];

    let cookies, formType, fields, firstButtonContainers, secondButtonContainers, firstButtonForms, secondButtonForms, modals;
    let affiliateTimestampClick = getTimestampInMicroseconds();
    let currentAffiliateClickIsAttributable = 1; //by default current affiliate is considered to be the first
    let dataLayerPushes = [];

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


    function encodeBase64(string) {
        var b64 = window.btoa(encodeURIComponent(string))
        return b64;
    }

    function decodeBase64(b64) {
        var string = decodeURIComponent(window.atob(b64))
        return string;
    }

    function extractAffiliateString(string) {
        const regex = /a_aid=[a-zA-Z0-9_-]+/;
        const match = decodeURIComponent(string.replace(/\s/g,"")).match(regex);
        if (match) {
            return match[0];
        } else {
            return string; // return original string if not matched
        }
    }

    function getAffiliateTimestampClick() {
        affiliateTimestampClick = affiliateTimestampClick || getTimestampInMicroseconds();
        return affiliateTimestampClick;
    }

    //check if there is already valid stored affiliate data
    function getAffiliateData() {
        
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
        let url = decodeURIComponent(decodeURIComponent(window.location.href))
        let fragment = url.split("#")[1];
        // Replace non-alphanumeric characters with an empty string to keep only alphanumeric characters
        // if (fragment !== null && ( fragment.indexOf("?") > -1 || fragment.indexOf("&") > -1 ) ) { // Ensure fragment is not null before applying the regex
        //     fragment = fragment.split("?")[0];
        //     fragment = fragment.split("&")[0];
        // }

        if (fragment !== null) {
            fragment = decodeURIComponent(fragment);
            fragment = extractAffiliateString(decodeURIComponent(fragment));
        }

        if (fragment.indexOf("a_aid") > -1) {
            json_data.affiliate_id_full_string = fragment;
            
            //let params = new URLSearchParams(fragment);
            //let hmi_aaid = params.get('a_aid'); //default PAP Affiliare ID from URL
            let hmi_aaid = fragment.replace(/\s+/g, "").split("=")[1].trim();
            
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
        if (!timestamp) return true;

        const now = Date.now();
        return now > parseInt(timestamp, 10);
    }

    function generateClientId() {
        var timestampMillis = new Date().getTime();
        var randomNumber = Math.floor(Math.random() * 1000000000);
        return 'GA1.1.' + randomNumber + '.' + timestampMillis;
    }

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

    function getStapeId() {
        var stape_id = getCookieValue("_hmi_stape_id");
        if (stape_id) return stape_id;
        return null;
    }
    function getSummitName() {
        return localStorage.getItem("summit_name") || null;
    }

    function getAffiliation() {
        return localStorage.getItem('affiliation');
    }

    //Function get last user id
    function getLastUserId() {
        var storedUserInfo = localStorage.getItem('_ud');
        var userInfo = storedUserInfo ? JSON.parse(decodeBase64(storedUserInfo)) : {};
        var emailQueryParameter = extractEmailFromURL();
        if (emailQueryParameter) {
            userInfo.user_id = window.btoa(emailQueryParameter.toLowerCase());
            window.localStorage.setItem("_ud", encodeBase64(JSON.stringify(userInfo)));
            return window.btoa(emailQueryParameter);
        } else if (userInfo && userInfo.user_id) {
            return userInfo.user_id;
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

        // If the email parameter exists in the URL
        return email || null;


        // Return null if the email parameter doesn't exist in the URL
        return null;
    }

    function generateFBCCookie() {
        let cookie_fbc = getCookieValue("_fbc") || null;
        if (cookie_fbc) {
            cookie_fbc = cookie_fbc;
        } else {
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

    function getUtmOrElValues(name) {
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
    }


    function getSessionID(gaMeasurementId, retries = 0) {
        const maxRetries = 25;
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
        return Date.now() || new Date().getTime() || undefined;
    }

    function getTimestampInMicroseconds() {
        var millis = getTimestampInMilliseconds();
        var randomNumber = Math.floor(Math.random() * 1000);
        if (millis && randomNumber) {
            return (millis * 1000) + randomNumber;
        }
        return undefined;
    }

    function buildTrackingObject() {

        var affiliate_data = getAffiliateData();
        affObj = {};
        if (affiliate_data && (affiliate_data["affiliate_id"] || affiliate_data["affiliate_id_full_string"])) {      
            affObj["affiliate_id"] = affiliate_data.affiliate_id + "";
            affObj["affiliate_id_full_string"] = affiliate_data.affiliate_id_full_string + "";
            affObj["affiliate_timestamp_created"] = affiliate_data.affiliate_timestamp_created + "";
            affObj["affiliate_timestamp_expired"] = affiliate_data.affiliate_timestamp_expired + "";
            affObj["affiliate_timestamp_click"] = getAffiliateTimestampClick() + "";
            affObj["restored_affiliate_id"] = affiliate_data.restored_affiliate_id + "";
            affObj["restored_affiliate_id_full_string"] = affiliate_data.restored_affiliate_id_full_string + "";
            affObj["restored_affiliate_timestamp_created"] = affiliate_data.restored_affiliate_timestamp_created + "";
            affObj["restored_affiliate_timestamp_expired"] = affiliate_data.restored_affiliate_timestamp_expired + "";
            affObj["current_affiliate_click_is_attributable"] = affiliate_data.current_affiliate_click_is_attributable + "";
        }
        
        var obj = {
            "created_at": getTimestampInMilliseconds() + "",
            "stape_id": getStapeId() + "",
            "ga_client_id": setClientIdCookie() + "",
            "ga_session_id": getSessionID(gaMeasurementId) + "",
            "affiliation": getAffiliation(),
            "page_referrer": getPageReferrer(),
            "last_uid": getLastUserId(),
            "user_agent": getUserAgent(),
            "summit_name": getSummitName(),
            "cookie_fbp": generateFBPCookie(),
            "cookie_fbc": generateFBCCookie(),
            "cookie_ttp": getCookieValue("_ttp"),
            "utm_source": getUtmOrElValues("utm_source"),
            "utm_medium": getUtmOrElValues("utm_medium"),
            "utm_campaign": getUtmOrElValues("utm_campaign"),
            "utm_content": getUtmOrElValues("utm_content"),
            "utm_term": getUtmOrElValues("utm_term"),
            "page_location": getRootDomain()
        };

        var mergedObj = Object.assign({}, affObj, obj);
        //console.log("obj: ", mergedObj);
        return mergedObj;

    }

    function fillTrackingTextAreas(json_data) {
        if (!json_data) return;

        var string_data = encodeBase64(JSON.stringify(json_data));
        document.querySelectorAll('textarea[placeholder="tracking_data"]').forEach(function (el) {
            el.value = string_data;
        });

    }

    function getPageReferrer() {
        return document.referrer;
    }

    function hideAllTrackingTextAreas() {
        document.querySelectorAll('textarea[placeholder="tracking_data"]').forEach(function (el) {
            el.style.display = "none";
            el.closest('.kartra_optin_cg').style.display = "none";
        });
    }




    // ########### single page run function ##################################

    function runScriptSingleForm() {

        console.log("running SingleForm script...")

        hideAllTrackingTextAreas();
        var trackingData = buildTrackingObject();
        fillTrackingTextAreas(trackingData);
    }

    // ########### multi page run function ##################################

    function runScriptMultiForm() {

        console.log("running MultiForm script...")
        resetMultiForms();
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
        setTimeout(function () {
            runScriptSingleForm();
        }, 1500);
        document.querySelectorAll('a.toggle_optin, a.kartra_button1, button[type="submit"]').forEach(function (btn) {

            btn.addEventListener("click", function () {
                runScriptSingleForm();
            });
        });

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

            document.querySelectorAll('a.toggle_contentbox, button[type="submit"]').forEach(function (btn) {
                btn.addEventListener("click", function () {
                    setTimeout(function () {
                        runScriptMultiForm();
                    }, 200)
                });
                console.log("added event listeners...");
            });
        }, 500);
    }





    //##########################   Determine page type and load correct script   ########################## 


    function countFormsOnPage() {
        var formsOnPage = 0;
        document.querySelectorAll(".modal-body").forEach(function (el) {
            var count = el.querySelectorAll("form").length;
            if (count > formsOnPage) formsOnPage = count
        });
        return formsOnPage;
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

        }
    }

    //##############################################################################################################

    console.log("initializing...");
    console.log("setting landing page...");
    window.page_type = "landing_page";


    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(function () {
            console.log("DOM Ready. Starting...")
            fireDataLayerEvent("landing_page");
            selectScriptForPageType();
        }, 250);
    });

    if (document.readyState === "interactive") {
        setTimeout(function () {
            console.log("Page is interactive. Starting...")
            fireDataLayerEvent("landing_page");
            selectScriptForPageType();
        }, 300);
    }


})();
