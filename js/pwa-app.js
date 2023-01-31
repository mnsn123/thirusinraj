
			var deferredPrompt;
			window.addEventListener('beforeinstallprompt', function(event) {
				document.getElementById("install").style.display = "inline-block"
				// event.preventDefault();
			deferredPrompt = event;
			return false;
			});
	
			function addToHomeScreen() {
			if (deferredPrompt) {
				deferredPrompt.prompt();
				deferredPrompt.userChoice.then(function (choiceResult) {
				console.log(choiceResult.outcome);
				if (choiceResult.outcome === 'dismissed') {
					console.log('User cancelled installation');
				} else {
					console.log('User added to home screen');
				}
				});
				deferredPrompt = null;
				}
			}



			var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);


			const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
			const isBrowser = window.matchMedia('(display-mode: browser)').matches;
			const url = new URL(window.location.href);
			if(url.searchParams.get('external')) {
			  sessionStorage.setItem('external', url.searchParams.get('external'));
			}


			$(document).ready(function(){
				//Get current time
				var currentTime = new Date().getTime();
					var clicked = 0;
					//Add hours function
				Date.prototype.addHours = function(h) {    
				   this.setTime(this.getTime() + (h*60*60*1000)); 
				   return this;   
				}
				//Get time after 24 hours
				var after24 = new Date().addHours(70).getTime();
				//Hide div click
				$('#close2').click(function(){
					clicked=localStorage.getItem('clicked');
		clicked++;
		localStorage.setItem('clicked', clicked);
		if (localStorage.getItem('clicked') >= 3) {
			localStorage.setItem('clicked', 0);
					//Hide div
					// $(this).hide();
					//Set desired time till you want to hide that div
					localStorage.setItem('desiredTime', after24); 
		}
				});
				//If desired time >= currentTime, based on that HIDE / SHOW
				if( ( localStorage.getItem('desiredTime') <= currentTime && sessionStorage.getItem('external')==='true' && (!iOS) ) || ( localStorage.getItem('desiredTime') <= currentTime && isBrowser && (!iOS) && (sessionStorage.getItem('external')!=='false')) )
				{
					$('#and-show').show();
				}
				// else if (localStorage.getItem('desiredTime') <= currentTime && (!iOS) && (!(navigator.standalone || isStandalone)) ) {
				// 	$('#and-show').show();
				// }
				else
				{
					$('#and-show').hide();
				}
			});




				// ios app alert

	

	// if ((!(navigator.standalone || isStandalone)) && iOSSafari ) {
	// 	document.getElementById("ios-show").style.display = "block"
	// }
	// else if ((!(navigator.standalone || isStandalone)) && iOSSafari ) {
	// 	document.getElementById("ios-show").style.display = "block"
	// }
	   
	// else 
	// 	document.getElementById("ios-show").style.display = "none"





$(document).ready(function(){
	//Get current time
	var currentTime = new Date().getTime();
	var clicked = 0;
	//Add hours function
	Date.prototype.addHours = function(h) {    
	   this.setTime(this.getTime() + (h*60*60*1000)); 
	   return this;   
	}
	//Get time after 24 hours
	var after24 = new Date().addHours(70).getTime();
	//Hide div click
	$('#close1').click(function(){
		clicked=localStorage.getItem('clicked');
		clicked++;
		localStorage.setItem('clicked', clicked);
		if (localStorage.getItem('clicked') >= 3) {
			localStorage.setItem('clicked', 0);
			
		//Hide div
		// $(this).hide();
		//Set desired time till you want to hide that div
		localStorage.setItem('desiredTime', after24); 
		}
	});
	//If desired time >= currentTime, based on that HIDE / SHOW
	// alert(navigator.standalone);
	if(localStorage.getItem('desiredTime') <= currentTime && (!(navigator.standalone || isStandalone)) && iOSSafari && (sessionStorage.getItem('external')!=='false') )
	{
		$('#ios-show').show();
	}
	else
	{
		$('#ios-show').hide();
	}
});
