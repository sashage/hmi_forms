(function() {
	const gaMeasurementId = "TL2ET8VS74";
	const firstButtonText = "NO";
	const secondButtonText = "YES";
	//const firstButtonFormId = "XNl7s2FeYGCp";
	//const secondButtonFormId = "J7lSk6XBzaa4";
	const stepOneTexts = ["cke_2597"];
	const stepTwoTexts = ["cke_8066"];
	
	
	function getRootDomain() {
	    var domain = window.location.hostname;
	    var parts = domain.split('.');
	    if (parts.length > 2) {
	        return '.' + parts.slice(-2).join('.');
	    }
	    return domain;
	}
	
	function getAffiliateId() {
	    return localStorage.getItem("pap_id");
	}
	
	function storeAffiliateData() {
		const urlObj = new URL(window.location.href);
	    const fragment = urlObj.hash.substring(1); // Remove the '#' at the start
	    const params = new URLSearchParams(fragment);
		var pap_id = params.get('a_aid');
		if (pap_id) {
			pap_id = pap_id.split('?')[0];
			localStorage.setItem('affiliation','affiliate');
			localStorage.setItem('pap_id',pap_id);
		}
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
	    // Handle button show/hide logic
	
		checkForGaClientIdElement()
	    cookies = parseCookies(document.cookie);
	    formType = getFormType();
	
	    fields = {
	        "cookie_fbp": () => generateFBPCookie(),
	        "cookie_fbc": () => generateFBCCookie(),
	        "ga_client_id": getClientId,
	        "ga_session_id": () => getSessionID(gaMeasurementId),
	        "utm_source": () => getUtmOrElValues("utm_source"),
	        "utm_medium": () => getUtmOrElValues("utm_medium"),
	        "utm_campaign": () => getUtmOrElValues("utm_campaign"),
	        "affiliation": () => getAffiliation(),
	        "page_location": () => getRootDomain(),
	        "last_uid": () => getLastUserId(),
	        "pap_aid": () => getAffiliateId(),
			"user_agent": () => getUserAgent()
	    };
	
	    function encodeBase64(string) {
			return btoa(string);
		}
	    
	    //Function get last user id
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
	
		function extractEmailFromURL() {
			// Use window.location to access the current URL
			var urlObj = new URL(window.location.href);
	
			// Use URLSearchParams to get the value of the 'he' parameter
			var email = urlObj.searchParams.get("he");
	
			// If the email parameter exists in the URL
			if(email) {
				// The email might have a '+' which usually represents a space in URLs, so replace it
				email = email.replace('+', ' ');
				return email;
			}
	
			// Return null if the email parameter doesn't exist in the URL
			return null;
		}
	    
	    
	    
	
	    firstButtonContainers.forEach((btnContainer, index) => {
	        btnContainer.addEventListener("click", function() {
	            modals.forEach(function(modal){
	                let forms = modal.querySelectorAll('form');
	                let firstButtonForm = forms[0];
	                let secondButtonForm = forms[1];
	                if (firstButtonForm) firstButtonForm.style.display = 'block';
	                if (secondButtonForm) secondButtonForm.remove();
	                hideAllButtons();
	            });
	        });
	    });
	
	    secondButtonContainers.forEach((btnContainer, index) => {
	        btnContainer.addEventListener("click", function() {
	            modals.forEach(function(modal){
	                let forms = modal.querySelectorAll('form');
	                let firstButtonForm = forms[0];
	                let secondButtonForm = forms[1];
	                if (secondButtonForm) secondButtonForm.style.display = 'block';
	                if (firstButtonForm) firstButtonForm.remove();
	                hideAllButtons();
	            });
	        });
	    });
	
	    // Handle form data logic
	
	    if (formType === 'optin') {
			console.log("runformloop")
	        fields["page_referrer"] = getPageReferrer;
	        fields["affiliation"] = getAffiliation;
	
	        for(let fieldName in fields) {
	            document.querySelectorAll(`input[placeholder="${fieldName}"]`).forEach(function(elem){
	                if (elem) {
	                    elem.closest('div.kartra_optin_cg').style.display = "none";
	                    try {
	                        elem.value = fields[fieldName]() || "";
	                    } catch (error) {
	                        console.error("Error processing input field:", error);
	                    }
	                }
	            });
	        }
	    } else if (formType === 'checkout') {
	        window.addEventListener("message", receiveMessage);
	        processInputFields();
	
	        
	    }
	
	
		function hideAllButtons() {
				firstButtonContainers.forEach(buttonContainer => buttonContainer.remove());
				secondButtonContainers.forEach(buttonContainer => buttonContainer.remove());
	
				stepTwoTexts.forEach(function(text){
					var textElements = document.querySelectorAll('div[aria-controls="'+text+'"]');
					textElements.forEach(function(elem){
						elem.style.display = "block";
					});
				});
				stepOneTexts.forEach(function(text){
					var textElements = document.querySelectorAll('div[aria-controls="'+text+'"]');
					textElements.forEach(function(elem){
						elem.style.display = "none";
					});
				});
			}
	
	
		// Fallback routine to periodically check for the existence of ga_client_id element
		function checkForGaClientIdElement() {
			const intervalId = setInterval(() => {
				const gaClientIdElem = document.querySelector('input[placeholder="ga_client_id" i]');
				if (gaClientIdElem) {
					clearInterval(intervalId); // Clear the interval once the element is found
					processInputFields();
				}
			}, 250); // Check every 250 milliseconds
		}
	
	
		function processInputFields() {
			document.querySelectorAll('[id^="custom_"],label[for^="custom_"]').forEach(function(elem){
				elem.closest("div.form-group").style.display = "none";
			});
			for (let fieldName in fields) {
				document.querySelectorAll(`input[placeholder="${fieldName}" i]`).forEach(function(elem){
					if (elem) {
						try {
							elem.value = fields[fieldName]() || "";
						} catch (error) {
							console.error("Error processing input field:", error);
						}
					}
				});
			}
		}
	
		function receiveMessage(msg) {
			const msgObj = parseData(msg);
			if (msgObj.origin === 'https://assets.braintreegateway.com') {
				processInputFields();
			}
		}
	
		function parseData(data) {
			if (typeof data === 'string') {
				try {
					return JSON.parse(data);
				} catch {
					return {};
				}
			}
			return data || {};
		}
	
	
	
		function getFormType() {
			if (document.querySelector('div.kartra_optin_cg')) {
				return 'optin';
			} else if (document.querySelector('div.form-group')) {
				return 'checkout';
			}
			return null;
		}
	
		function getPageReferrer() {
			return document.referrer;
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
	
		function getClientId() {
			const gaCookieValue = cookies["_ga"];
			if (gaCookieValue) {
				return gaCookieValue;
			}
			return null;
		}
	
		function generateFBCCookie() {
			let cookie_fbc = getCookieValue("_fbc") || null;
			if ( cookie_fbc ) {
				cookie_fbc = cookie_fbc;
			}
			else {
				const fbclid = getUrlParameter('fbclid') || undefined;
				if(fbclid) {
					const creationTime = new Date().getTime();
					const fbcValue = `fb.1.${creationTime}.${fbclid}`;
					
					// Set the cookie
					const cookieName = "_fbc"
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
			if ( cookie_fbp ) {
				//do nothing
			}
			else {
				const version = "fb";
				const subdomainIndex = "1";
				const creationTime = new Date().getTime();
				const randomNumber = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
				const hostname = getRootDomain();
				cookie_fbp = `${version}.${subdomainIndex}.${creationTime}.${randomNumber}`;
				
				// Set the cookie
				const cookieName = "_fbp"
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
	
	
		function getSessionID(gaMeasurementId, intervalCount = 0) {
			const pattern = new RegExp(`_ga_${gaMeasurementId}=GS\\d\\.\\d\\.(.+?)(?:;|$)`);
			const match = document.cookie.match(pattern);
			const parts = match?.[1].split(".");
			intervalCount = intervalCount || 0;
			if ( !parts && intervalCount < 50 ) {
				intervalCount += 1;
				window.setTimeout(() => getSessionID(gaMeasurementId, intervalCount), 200);
				return;
			}
			return parts[0];
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
	
	}

	setClientIdCookie();
	storeAffiliateData();
	
	
	let cookies,formType,fields,firstButtonContainers,secondButtonContainers,firstButtonForms,secondButtonForms,modals;
	
	
	
	document.addEventListener("DOMContentLoaded", function() {
	
		firstButtonContainers = Array.from(document.querySelectorAll('.modal-body div[data-component="button"]')).filter(div => div.textContent.trim().includes(firstButtonText));
	    secondButtonContainers = Array.from(document.querySelectorAll('.modal-body div[data-component="button"]')).filter(div => div.textContent.trim().includes(secondButtonText));
	    modals = Array.from(document.querySelectorAll('.modal-body'));
	    modals.forEach(modal => {
	        let forms = modal.querySelectorAll('form');
	        let firstButtonForm = forms[0];
	        let secondButtonForm = forms[1];
	        if (firstButtonForm) firstButtonForm.style.display = 'none';
	        if (secondButtonForm) secondButtonForm.style.display = 'none';
	    });
	
	    stepTwoTexts.forEach(function(text){
	        var textElements = document.querySelectorAll('div[aria-controls="'+text+'"]');
	        textElements.forEach(function(elem){
	            elem.style.display = "none";
	        });
	    });
	
		document.querySelectorAll('a.toggle_contentbox').forEach(function(btn){
			btn.addEventListener("click",function(){
				setTimeout(function() {
					runScript();
				},1000)
			});
		});
	});
})();
