(function() {
	
	const gaMeasurementId = "TL2ET8VS74";
	var AFFILIATE_STORAGE_KEY = "hmi_aaid";
	const firstButtonText = "NO";
	const secondButtonText = "YES";
	//const firstButtonFormId = "XNl7s2FeYGCp";
	//const secondButtonFormId = "J7lSk6XBzaa4";
	const stepOneTexts = ["cke_2597"];
	const stepTwoTexts = ["cke_8066"];

	let cookies,formType,fields,firstButtonContainers,secondButtonContainers,firstButtonForms,secondButtonForms,modals;

	
	
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
		var hmi_aaid = params.get('a_aid'); //default PAP Affiliare ID from URL
		if (hmi_aaid) {
			hmi_aaid = hmi_aaid.split('?')[0];
			localStorage.setItem('affiliation','affiliate');
			var storedId = getAffiliateStorage();
			if (!storedId) {
				const now = new Date();
				const expirationTimestamp = new Date(now.setDate(now.getDate() + 60)).getTime();
				sessionStorage.setItem(AFFILIATE_STORAGE_KEY,hmi_aaid + ";" + expirationTimestamp);
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

        return clientId;
	}

	function getAffiliation() {
		return localStorage.getItem('affiliation');
	}

	function encodeBase64(string) {
		return btoa(string);
	}
	    
	//Function get last user id
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
	
	function parseCookies(cookieString) {
		const cookieArray = cookieString.split("; ");
		const cookieObj = {};
		cookieArray.forEach(cookie => {
			const [key, value] = cookie.split("=");
			cookieObj[key] = value;
		});
		return cookieObj;
	}
	

	function getValuesForInputFields() {
		return {
	        "cookie_fbp": () => generateFBPCookie(),
	        "cookie_fbc": () => generateFBCCookie(),
	        "ga_client_id": setClientIdCookie(),
	        "ga_session_id": () => getSessionID(gaMeasurementId),
	        "utm_source": () => getUtmOrElValues("utm_source"),
	        "utm_medium": () => getUtmOrElValues("utm_medium"),
	        "utm_campaign": () => getUtmOrElValues("utm_campaign"),
	        "affiliation": () => getAffiliation(),
	        "page_location": () => getRootDomain(),
			"page_referrer": () => getPageReferrer(),
	        "last_uid": () => getLastUserId(),
	        "pap_aid": () => getAffiliateId(),
			"user_agent": () => getUserAgent()
	    };

	}

	function processInputFields(fields) {
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


	function getPageReferrer() {
		return document.referrer;
	}


	// ########### single page run function ##################################

	function runScriptSingleForm() {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("running script...")
            document.querySelectorAll('form input[name^="custom_"]').forEach(function(el){
                el.closest('div.kartra_optin_cg').style.display = "none";
            });
        
            fields = getValuesForInputFields();
            processInputFields(fields)
        });
	}





	// ########### multi page run function ##################################

	function runScriptMultiForm() {
	    // Handle button show/hide logic
	
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
	
		//hide buttons on multiform
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
        fields = getValuesForInputFields();
		processInputFields(fields);

	}
	

	//##########################   Landingpage - Multiform   ########################## 

	function loadMultformLander() {
		setClientIdCookie();
		storeAffiliateData();
		
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
						runScriptMultiForm();
					},1000)
				});
			});
		});
	}





	//##########################   Determine page type and load correct script   ########################## 
	
	
	function countFormsOnPage() {
		var formsOnPage = 0;
		document.querySelectorAll(".modal-body").forEach(function(el){
			var count = el.querySelectorAll("form").length;
			if ( count > formsOnPage ) formsOnPage = count
		});
		return formsOnPage;
	}

	function checkIfCheckoutPage() {
		return (!!document.querySelector('div[data-kt-type="checkout"]'));
	}


	function selectScriptForPageType() {
		if ( checkIfCheckoutPage() ) {
			//run checkout script
		} else {
	    	cookies = parseCookies(document.cookie);
	    
	    	fields = getValuesForInputFields();
			var formCount = countFormsOnPage();
			if ( formCount == 2 ) {
				loadMultformLander();
			}
			else if ( formCount == 1 ) {
				runScriptSingleForm();
			}

		}
	}

	//##############################################################################################################

	selectScriptForPageType();
	
})();
