(function() {
	const gaMeasurementId = "TL2ET8VS74";
	var AFFILIATE_STORAGE_KEY = "hmiaid";
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
	
		
	function getAffiliateData() {
		//check if there is already valid stored affiliate data
		var stored_data = getAffiliateStorage()
		if ( stored_data ) return stored_data;
		

		var json_data =  {};
		const urlObj = new URL(window.location.href);
		const fragment = urlObj.hash.substring(1); // Remove the '#' at the start

		if (fragment.indexOf("a_aid") == 0) {
			json_data.affiliate_id_full_string = fragment;

			const params = new URLSearchParams(fragment);
			var hmi_aaid = params.get('a_aid'); //default PAP Affiliare ID from URL
			
			const now = new Date();
			const expirationTimestamp = new Date(now.setDate(now.getDate() + 60)).getTime();

			json_data.affiliate_id = hmi_aaid;
			json_data.affiliate_timestamp_created = new Date().getTime();
			json_data.affiliate_timestamp_expired = expirationTimestamp;


			//store affiliate data
			localStorage.setItem('affiliation','affiliate');
			sessionStorage.setItem(AFFILIATE_STORAGE_KEY,btoa(JSON.stringify(json_data)));

			return json_data;

		} else {
			localStorage.setItem('affiliation',window.affiliation);
		}

		return null;
		
	}

	function getAffiliateStorage() {
		const stored_data = localStorage.getItem(AFFILIATE_STORAGE_KEY);
		if (stored_data) {
			var json_data;
			try {
				json_data = JSON.parse(atob(stored_data));
			} catch (error) {
				//remove item if invalid
				console.log("Error",error)
				localStorage.removeItem(AFFILIATE_STORAGE_KEY);
				sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
				return null;
			}

			//if not all values are present - delete and return
			if(!( (json_data.affiliate_id || json_data.affiliate_id_full_string) && json_data.affiliate_timestamp_created && json_data.affiliate_timestamp_expired)) {
				localStorage.removeItem(AFFILIATE_STORAGE_KEY);
				sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
				return null;
			}

			// If the data set is expired - delete and return
			if ( isValueExpired(json_data.affiliate_timestamp_expired) ) {
				localStorage.removeItem(AFFILIATE_STORAGE_KEY);
				sessionStorage.removeItem(AFFILIATE_STORAGE_KEY);
				return null;
			}

			return json_data;
		}
	
		// If no data is found or the data is expired, remove it
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

	//Function get last user id
	function getLastUserId() {
		var storedUserInfo = localStorage.getItem('_ud');
		var userInfo = storedUserInfo ? JSON.parse(atob(storedUserInfo)) : {};
		var emailQueryParameter = extractEmailFromURL();
		if (emailQueryParameter) {
			userInfo.user_id = btoa(emailQueryParameter);
			localStorage.setItem("_ud", btoa(JSON.stringify(userInfo)));
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
	

	function buildTrackingObject() {
		var obj = {
			"cookie_fbp": generateFBPCookie(),
			"cookie_fbc": generateFBCCookie(),
			"ga_client_id": setClientIdCookie(),
			"ga_session_id": getSessionID(gaMeasurementId),
			"utm_source": getUtmOrElValues("utm_source"),
			"utm_medium": getUtmOrElValues("utm_medium"),
			"utm_campaign": getUtmOrElValues("utm_campaign"),
			"utm_content": getUtmOrElValues("utm_content"),
			"utm_term": getUtmOrElValues("utm_term"),
			"affiliation": getAffiliation(),
			"page_location": getRootDomain(),
			"page_referrer": getPageReferrer(),
			"last_uid": getLastUserId(),
			"user_agent": getUserAgent()
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

	function fillTrackingTextAreas(json_data) {
		if (!json_data) return;

		var string_data = btoa(JSON.stringify(json_data));
		document.querySelectorAll('textarea[placeholder="tracking_data"]').forEach(function(el){
			el.value = string_data;
		});

	}
	
	function getPageReferrer() {
		return document.referrer;
	}

	function hideAllTrackingTextAreas() {
		document.querySelectorAll('textarea[placeholder="tracking_data"]').forEach(function(el){
			el.style.display = "none";
			el.closest('.kartra_optin_cg').style.display = "none";
		});
	}




	// ########### single page run function ##################################

	function runScriptSingleForm() {
		
		console.log("running script...")
		
		hideAllTrackingTextAreas();
		var trackingData = buildTrackingObject();
		fillTrackingTextAreas(trackingData);
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

		hideAllTrackingTextAreas();
		var trackingData = buildTrackingObject();
		fillTrackingTextAreas(trackingData);

	}


	//##########################   Landingpage - Singleform   ########################## 


	function loadSingleformLander() {
		setClientIdCookie();
		
		document.querySelectorAll('a.toggle_optin').forEach(function(btn){
			btn.addEventListener("click",function(){
				setTimeout(function() {
					runScriptSingleForm();
				},600)
			});
		});
	
	}

	//##########################   Landingpage - Multiform   ########################## 

	function loadMultformLander() {
		setClientIdCookie();
		
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
			//do nothing - run checkout script
			console.log("Wrong script - implement the checkout page script")
		} else {
			cookies = parseCookies(document.cookie);
		
			var formCount = countFormsOnPage();
			if ( formCount == 2 ) {
				console.log("Loading multi-form script");
				loadMultformLander();
			}
			else if ( formCount == 1 ) {
				console.log("Loading single-form script");
				loadSingleformLander();
			}

		}
	}

	//##############################################################################################################

	console.log("initializing...")
	if (document.readyState === "loading") { 
		document.addEventListener("DOMContentLoaded", function() {
			console.log("DOM loaded. Starting...")
			selectScriptForPageType();
		});
	} else {
		console.log("Starting...")
		selectScriptForPageType();
	}
	

})();
