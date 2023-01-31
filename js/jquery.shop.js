---
---



(function( $ ) {
	$.Shop = function( element ) {
		this.$element = $( element );
		this.init();
	};
	
	$.Shop.prototype = {
		init: function() {
		
		    // Properties
		
			this.cartPrefix = "Monsoon-{{ site.url }}-"; // Prefix string to be prepended to the cart's name in the session storage
			this.cartName = this.cartPrefix + "cart"; // Cart name in the session storage
			this.shippingRates = this.cartPrefix + "shipping-rates"; // Shipping rates key in the session storage
			this.total = this.cartPrefix + "total"; // Total key in the session storage
			this.storage = sessionStorage; // shortcut to the sessionStorage object
			
			
			this.$formAddToCart = this.$element.find( "form.add-to-cart" ); // Forms for adding items to the cart
			this.$formCart = this.$element.find( "#shopping-cart" ); // Shopping cart form
			this.$fullSite = this.$element.find( "#full-site" ); // Shopping cart form
			this.$checkoutCart = this.$element.find( "#checkout-cart" ); // Checkout form cart
			this.$checkoutOrderForm = this.$element.find( "#checkout-order-form" ); // Checkout user details form
			this.$shipping = this.$element.find( "#sshipping" ); // Element that displays the shipping rates
			this.$subTotal = this.$element.find( "#stotal" ); // Element that displays the subtotal charges
			this.$shoppingCartActions = this.$element.find( "#shopping-cart-actions" ); // Cart actions links
			this.$updateCartBtn = this.$shoppingCartActions.find( "#update-cart" ); // Update cart button
			// this.$sendEmailBtn = this.$shoppingCartActions.find( "#send-email" ); // Update cart button
			this.$emptyCartBtn = this.$shoppingCartActions.find( "#empty-cart" ); // Empty cart button
			this.$userDetails = this.$element.find( "#user-details-content" ); // Element that displays the user information
			this.$paypalForm = this.$element.find( "#paypal-form" ); // PayPal form
			
			
			this.currency = "{% if site.currency_code and site.currency_code != '' %}{{ site.currency_code }}{% endif %}"; // HTML entity of the currency to be displayed in the layout
			this.currencyString = "{% if site.currency_code and site.currency_code != '' %}{{ site.currency_code }}{% endif %}"; // Currency symbol as textual string
			this.paypalCurrency = "{% if site.currency_code and site.currency_code != '' %}{{ site.currency_code }}{% endif %}"; // PayPal's currency code
			this.paypalBusinessEmail = "{% if site.paypal_email and site.paypal_email != '' %}{{ site.paypal_email }}{% endif %}"; // Your Business PayPal's account email address
			this.paypalURL = "https://www.paypal.com/cgi-bin/webscr"; // The URL of the PayPal's form
			
			// Object containing patterns for form validation
			this.requiredFields = {
				expression: {
					value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-z]){2,4}$/
				},
				
				str: {
					value: ""
				}
				
			};
			
			// Method invocation
			
			this.createCart();
			this.handleAddToCartForm();
			this.handleCheckoutOrderForm();
			this.emptyCart();
			this.updateCart();
			this.displayCart();
			this.fullSite();
			this.sendEmail();
			this.sendWhatsapp();
			{% if site.razorpay_key and site.razorpay_key != '' and site.currency_code and site.currency_code == 'INR' %}
			this.razorpay();
			{% endif %}
			this.deleteProduct();
			this.displayUserDetails();
			this.populatePayPalForm();
			
			
		},
		
		// Public methods
		
		// Creates the cart keys in the session storage
		
		createCart: function() {
			if( this.storage.getItem( this.cartName ) == null ) {
			
				var cart = {};
				cart.items = [];
			
				this.storage.setItem( this.cartName, this._toJSONString( cart ) );
				this.storage.setItem( this.shippingRates, "0" );
				this.storage.setItem( this.total, "0" );
			}
		},
		
		// Appends the required hidden values to the PayPal's form before submitting
		
		populatePayPalForm: function() {
			var self = this;
			if( self.$paypalForm.length ) {
				var $form = self.$paypalForm;
				var cart = self._toJSONObject( self.storage.getItem( self.cartName ) );
				var shipping = self.storage.getItem( self.shippingRates );
				var numShipping = self._convertString( shipping );
				var cartItems = cart.items; 
				var singShipping = Math.floor( numShipping / cartItems.length );
				
				$form.attr( "action", self.paypalURL );
				$form.find( "input[name='business']" ).val( self.paypalBusinessEmail );
				$form.find( "input[name='currency_code']" ).val( self.paypalCurrency );
				
				for( var i = 0; i < cartItems.length; ++i ) {
					var cartItem = cartItems[i];
					var n = i + 1;
					var name = cartItem.product;
					var price = cartItem.price;
					var qty = cartItem.qty;
					
					$( "<div/>" ).html( "<input type='hidden' name='quantity_" + n + "' value='" + qty + "'/>" ).
					insertBefore( "#paypal-btn" );
					$( "<div/>" ).html( "<input type='hidden' name='item_name_" + n + "' value='" + name + "'/>" ).
					insertBefore( "#paypal-btn" );
					$( "<div/>" ).html( "<input type='hidden' name='item_number_" + n + "' value='SKU " + name + "'/>" ).
					insertBefore( "#paypal-btn" );
					$( "<div/>" ).html( "<input type='hidden' name='amount_" + n + "' value='" + self._formatNumber( price, 2 ) + "'/>" ).
					insertBefore( "#paypal-btn" );
					$( "<div/>" ).html( "<input type='hidden' name='shipping_" + n + "' value='" + self._formatNumber( singShipping, 2 ) + "'/>" ).
					insertBefore( "#paypal-btn" );
					
				}
				
				
				
			}
		},
		
		// Displays the user's information
		
		displayUserDetails: function() {
			if( this.$userDetails.length ) {
				if( this.storage.getItem( "shipping-name" ) == null ) {
					var name = this.storage.getItem( "billing-name" );
					var email = this.storage.getItem( "billing-email" );
					var city = this.storage.getItem( "billing-city" );
					var address = this.storage.getItem( "billing-address" );
					var mobile = this.storage.getItem( "billing-mobile" );
					var zip = this.storage.getItem( "billing-zip" );
					
					var html = "<div class='detail'>";
						html += "<h2>Billing and Shipping</h2>";
						html += "<ul>";
						html += "<li>" + name + "</li>";
						html += "<li>" + email + "</li>";
						html += "<li>" + city + "</li>";
						html += "<li>" + address + "</li>";
						html += "<li>" + mobile + "</li>";
						html += "<li>" + zip + "</li>";
						html += "</ul></div>";
						
					this.$userDetails[0].innerHTML = html;
				} else {
					var name = this.storage.getItem( "billing-name" );
					var email = this.storage.getItem( "billing-email" );
					var city = this.storage.getItem( "billing-city" );
					var address = this.storage.getItem( "billing-address" );
					var mobile = this.storage.getItem( "billing-mobile" );
					var zip = this.storage.getItem( "billing-zip" );
					
					var sName = this.storage.getItem( "shipping-name" );
					var sEmail = this.storage.getItem( "shipping-email" );
					var sCity = this.storage.getItem( "shipping-city" );
					var sAddress = this.storage.getItem( "shipping-address" );
					var sMobile = this.storage.getItem( "shipping-mobile" );
					var sZip = this.storage.getItem( "shipping-zip" );
					
					var html = "<div class='detail'>";
						html += "<h2>Billing</h2>";
						html += "<ul>";
						html += "<li>" + name + "</li>";
						html += "<li>" + email + "</li>";
						html += "<li>" + city + "</li>";
						html += "<li>" + address + "</li>";
						html += "<li>" + mobile + "</li>";
						html += "<li>" + zip + "</li>";
						html += "</ul></div>";
						
						html += "<div class='detail right'>";
						html += "<h2>Shipping</h2>";
						html += "<ul>";
						html += "<li>" + sName + "</li>";
						html += "<li>" + sEmail + "</li>";
						html += "<li>" + sCity + "</li>";
						html += "<li>" + sAddress + "</li>";
						html += "<li>" + sMobile + "</li>";
						html += "<li>" + sZip + "</li>";
						html += "</ul></div>";
						
					this.$userDetails[0].innerHTML = html;	
				
				}
			}
		},

		// Delete a product from the shopping cart

		deleteProduct: function() {
			var self = this;
			if( self.$formCart.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;

				$( document ).on( "click", ".pdelete a", function( e ) {
					e.preventDefault();
					var productName = $( this ).data( "product" );
					var newItems = [];
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;	
						if( product == productName ) {
							items.splice( i, 1 );
						}
					}
					newItems = items;
					var updatedCart = {};
					updatedCart.items = newItems;

					var updatedTotal = 0;
					var totalQty = 0;
					if( newItems.length == 0 ) {
						updatedTotal = 0;
						totalQty = 0;
					} else {
						for( var j = 0; j < newItems.length; ++j ) {
							var prod = newItems[j];
							var sub = prod.price * prod.qty;
							updatedTotal += sub;
							totalQty += prod.qty;
						}
					}

					self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );
					self.storage.setItem( self.shippingRates, self._convertNumber( self._calculateShipping( totalQty ) ) );

					self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
					$( this ).parents( "tr" ).remove();
					self.$subTotal[0].innerHTML = self.currency + " " + self.storage.getItem( self.total );
				});
			}
		},
		
		fullSite: function() {
			if( this.$fullSite.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				

				if( items.length == 0 ) {
				} else {
				
					var prqty = 0;
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var qty = item.qty;
						prqty += qty;
					}
					var g = document.querySelector('.badge');
					g.innerHTML = prqty;
				}

				
			} 
		},


		// Displays the shopping cart
		
		displayCart: function() {
			if( this.$formCart.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var $tableCart = this.$formCart.find( ".shopping-cart" );
				var $tableCartBody = $tableCart.find( "tbody" );

				if( items.length == 0 ) {
					$tableCartBody.html( "" );	
				} else {
				
				
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;
						var price = this.currency + " " + item.price;
						var qty = item.qty;
						var html = "<tr><td class='pname'>" + product + "</td>" + "<td class='pqty qid'><span class='value-button minus' id='' value='Decrease Value'>-</span><input type='number' class='qty number' value='" + qty + "'  /><span class='value-button plus' id='' value='Increase Value'>+</span></td>";
					    	html += "<td class='pprice'>" + price + "</td><td class='pdelete'><a href='' data-product='" + product + "'><i class='fa fa-times' aria-hidden='true'></i></a></td></tr>";
					
						$tableCartBody.html( $tableCartBody.html() + html );
					}

				}

				if( items.length == 0 ) {
					this.$subTotal[0].innerHTML = this.currency + " " + 0.00;
				} else {	
				
					var total = this.storage.getItem( this.total );
					total = parseFloat(total).toFixed(2);
					this.$subTotal[0].innerHTML = this.currency + " " + total;
				}
			} else if( this.$checkoutCart.length ) {
				var checkoutCart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var cartItems = checkoutCart.items;
				var $cartBody = this.$checkoutCart.find( "tbody" );

				if( cartItems.length > 0 ) {
				
					for( var j = 0; j < cartItems.length; ++j ) {
						var cartItem = cartItems[j];
						var cartProduct = cartItem.product;
						var cartPrice = this.currency + " " + cartItem.price;
						var cartQty = cartItem.qty;
						var cartHTML = "<tr><td class='pname'>" + cartProduct + "</td>" + "<td class='pqty'>" + cartQty + "</td>" + "<td class='pprice'>" + cartPrice + "</td></tr>";
					
						$cartBody.html( $cartBody.html() + cartHTML );
					}
				} else {
					$cartBody.html( "" );	
				}

				if( cartItems.length > 0 ) {
				
					var cartTotal = this.storage.getItem( this.total );
					var cartShipping = this.storage.getItem( this.shippingRates );
					var subTot = this._convertString( cartTotal ) + this._convertString( cartShipping );
				
					this.$subTotal[0].innerHTML = this.currency + " " + ( subTot ).toFixed(2);
					this.$shipping[0].innerHTML = this.currency + " " + cartShipping;
				} else {
					this.$subTotal[0].innerHTML = this.currency + " " + 0.00;
					this.$shipping[0].innerHTML = this.currency + " " + 0.00;	
				}
			
			}
		},
		
		sendEmail: function() {
			if( this.$checkoutCart.length && this.$userDetails.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var $tableCart = this.$formCart.find( ".shopping-cart" );
				var $tableCartBody = $tableCart.find( "tbody" );

				if( items.length == 0 ) {
					$tableCartBody.html( "" );	
				} else {
					// console.log(this.storage.getItem( "billing-name" ));
					var email_content = "";
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;
						var price = item.price;
						var qty = item.qty;
						var etotal = price*qty;

						email_content += encodeURI(' Name - ' + product + '\n' + 'Quantity - ' + qty + '\n' + 'Price - ' + price + '\n' + 'Sub Total - ' + parseFloat(etotal).toFixed(2) + '\n' + '-----------------' + '\n');
					
						// $tableCartBody.html( $tableCartBody.html() + html );
					}
					
					email_content += encodeURI('*****************' + '\n' + 'Grand Total - ' + parseFloat(this.storage.getItem( this.total )).toFixed(2) + '\n\n');
					if( this.storage.getItem( "shipping-name" ) == null ) {
						var name = this.storage.getItem( "billing-name" );
						var email = this.storage.getItem( "billing-email" );
						var city = this.storage.getItem( "billing-city" );
						var address = this.storage.getItem( "billing-address" );
						var mobile = this.storage.getItem( "billing-mobile" );
						var zip = this.storage.getItem( "billing-zip" );
						
						email_content += encodeURI("Billing and Shipping" + "\n");
						email_content += encodeURI(name + "\n");
						email_content += encodeURI(email + "\n");
						email_content += encodeURI(city + "\n");
						email_content += encodeURI(address + "\n");
						email_content += encodeURI(mobile + "\n");
						email_content += encodeURI(zip + "\n");
							
					} else {
						var name = this.storage.getItem( "billing-name" );
						var email = this.storage.getItem( "billing-email" );
						var city = this.storage.getItem( "billing-city" );
						var address = this.storage.getItem( "billing-address" );
						var mobile = this.storage.getItem( "billing-mobile" );
						var zip = this.storage.getItem( "billing-zip" );
						
						var sName = this.storage.getItem( "shipping-name" );
						var sEmail = this.storage.getItem( "shipping-email" );
						var sCity = this.storage.getItem( "shipping-city" );
						var sAddress = this.storage.getItem( "shipping-address" );
						var sMobile = this.storage.getItem( "shipping-mobile" );
						var sZip = this.storage.getItem( "shipping-zip" );
						
						email_content += encodeURI("Billing" + "\n");
						email_content += encodeURI(name + "\n");
						email_content += encodeURI(email + "\n");
						email_content += encodeURI(city + "\n");
						email_content += encodeURI(address + "\n");
						email_content += encodeURI(mobile + "\n");
						email_content += encodeURI(zip + "\n");
							
						email_content += encodeURI("Shipping" + "\n");
						email_content += encodeURI(sName + "\n");
						email_content += encodeURI(sEmail + "\n");
						email_content += encodeURI(sCity + "\n");
						email_content += encodeURI(sAddress + "\n");
						email_content += encodeURI(sMobile + "\n");
						email_content += encodeURI(sZip + "\n");
							
					
					}


					var p = document.querySelector('.email_checkout');
					var uemail = '{{ site.email }}';
					p.href = 'mailto:'+uemail +'?subject=Order%20Recieved&body='+email_content;
				}

				
				
			}

		},


		sendWhatsapp: function() {
			if( this.$checkoutCart.length && this.$userDetails.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var $tableCart = this.$formCart.find( ".shopping-cart" );
				var $tableCartBody = $tableCart.find( "tbody" );

				if( items.length == 0 ) {
					$tableCartBody.html( "" );	
				} else {
				
					var email_content = '';
				
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;
						var price = item.price;
						var qty = item.qty;
						var etotal = price*qty;
						email_content += encodeURI(' Name - ' + product + '\n' + 'Quantity - ' + qty + '\n' + 'Price - ' + price + '\n' + 'Sub Total - ' + parseFloat(etotal).toFixed(2) + '\n' + '-----------------' + '\n');
					
						// $tableCartBody.html( $tableCartBody.html() + html );
					}
					email_content += encodeURI('=================' + '\n' + 'Grand Total - ' + parseFloat(this.storage.getItem( this.total )).toFixed(2) + '\n\n');
					
					if( this.storage.getItem( "shipping-name" ) == null ) {
						var name = this.storage.getItem( "billing-name" );
						var email = this.storage.getItem( "billing-email" );
						var city = this.storage.getItem( "billing-city" );
						var address = this.storage.getItem( "billing-address" );
						var mobile = this.storage.getItem( "billing-mobile" );
						var zip = this.storage.getItem( "billing-zip" );
						
						email_content += encodeURI("Billing and Shipping" + "\n");
						email_content += encodeURI(name + "\n");
						email_content += encodeURI(email + "\n");
						email_content += encodeURI(city + "\n");
						email_content += encodeURI(address + "\n");
						email_content += encodeURI(mobile + "\n");
						email_content += encodeURI(zip + "\n");
							
					} else {
						var name = this.storage.getItem( "billing-name" );
						var email = this.storage.getItem( "billing-email" );
						var city = this.storage.getItem( "billing-city" );
						var address = this.storage.getItem( "billing-address" );
						var mobile = this.storage.getItem( "billing-mobile" );
						var zip = this.storage.getItem( "billing-zip" );
						
						var sName = this.storage.getItem( "shipping-name" );
						var sEmail = this.storage.getItem( "shipping-email" );
						var sCity = this.storage.getItem( "shipping-city" );
						var sAddress = this.storage.getItem( "shipping-address" );
						var sMobile = this.storage.getItem( "shipping-mobile" );
						var sZip = this.storage.getItem( "shipping-zip" );
						
						email_content += encodeURI("Billing" + "\n");
						email_content += encodeURI(name + "\n");
						email_content += encodeURI(email + "\n");
						email_content += encodeURI(city + "\n");
						email_content += encodeURI(address + "\n");
						email_content += encodeURI(mobile + "\n");
						email_content += encodeURI(zip + "\n");
							
						email_content += encodeURI("Shipping" + "\n");
						email_content += encodeURI(sName + "\n");
						email_content += encodeURI(sEmail + "\n");
						email_content += encodeURI(sCity + "\n");
						email_content += encodeURI(sAddress + "\n");
						email_content += encodeURI(sMobile + "\n");
						email_content += encodeURI(sZip + "\n");
							
					
					}
					
					
					
					var p = document.querySelector('.whatsapp_checkout');

				    var cmobile = '{{ site.mobile }}';
				    p.href = 'https://wa.me/'+ cmobile +'?text='+email_content;
				}

				
				
			}

		},


		razorpay: function() {
			if( this.$checkoutCart.length && this.$userDetails.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var $tableCart = this.$formCart.find( ".shopping-cart" );
				var $tableCartBody = $tableCart.find( "tbody" );

				if( items.length == 0 ) {
					$tableCartBody.html( "" );	
				} else {
				
					var email_content = '';
				
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;
						var price = item.price;
						var qty = item.qty;
						var etotal = price*qty;
						email_content += encodeURI(' Name - ' + product + '\n' + 'Quantity - ' + qty + '\n' + 'Price - ' + price + '\n' + 'Sub Total - ' + parseFloat(etotal).toFixed(2) + '\n' + '-----------------' + '\n');
					
						// $tableCartBody.html( $tableCartBody.html() + html );
					}
					email_content += encodeURI('=================' + '\n' + 'Grand Total - ' + parseFloat(this.storage.getItem( this.total )).toFixed(2) + '\n\n');
					
					if( this.storage.getItem( "shipping-name" ) == null ) {
						var name = this.storage.getItem( "billing-name" );
						var email = this.storage.getItem( "billing-email" );
						var city = this.storage.getItem( "billing-city" );
						var address = this.storage.getItem( "billing-address" );
						var mobile = this.storage.getItem( "billing-mobile" );
						var zip = this.storage.getItem( "billing-zip" );
						
						email_content += encodeURI("Billing and Shipping" + "\n");
						email_content += encodeURI(name + "\n");
						email_content += encodeURI(email + "\n");
						email_content += encodeURI(city + "\n");
						email_content += encodeURI(address + "\n");
						email_content += encodeURI(mobile + "\n");
						email_content += encodeURI(zip + "\n");
							
					} else {
						var name = this.storage.getItem( "billing-name" );
						var email = this.storage.getItem( "billing-email" );
						var city = this.storage.getItem( "billing-city" );
						var address = this.storage.getItem( "billing-address" );
						var mobile = this.storage.getItem( "billing-mobile" );
						var zip = this.storage.getItem( "billing-zip" );
						
						var sName = this.storage.getItem( "shipping-name" );
						var sEmail = this.storage.getItem( "shipping-email" );
						var sCity = this.storage.getItem( "shipping-city" );
						var sAddress = this.storage.getItem( "shipping-address" );
						var sMobile = this.storage.getItem( "shipping-mobile" );
						var sZip = this.storage.getItem( "shipping-zip" );
						
						email_content += encodeURI("Billing" + "\n");
						email_content += encodeURI(name + "\n");
						email_content += encodeURI(email + "\n");
						email_content += encodeURI(city + "\n");
						email_content += encodeURI(address + "\n");
						email_content += encodeURI(mobile + "\n");
						email_content += encodeURI(zip + "\n");
							
						email_content += encodeURI("Shipping" + "\n");
						email_content += encodeURI(sName + "\n");
						email_content += encodeURI(sEmail + "\n");
						email_content += encodeURI(sCity + "\n");
						email_content += encodeURI(sAddress + "\n");
						email_content += encodeURI(sMobile + "\n");
						email_content += encodeURI(sZip + "\n");
							
					
					}
					
					
					
					var p = document.querySelector('.razor-hide');
					var r = document.querySelector('.razor');
									    var cmobile = '{{ site.mobile }}';
				    p.setAttribute('custom', email_content);
				    r.setAttribute('data-amount', Number(parseFloat(this.storage.getItem( this.total )).toFixed(2))*100);
					r.setAttribute('src', 'https://checkout.razorpay.com/v1/checkout.js');
				//	var r2 = document.querySelector('.razorpay-payment-button');
				//	r2.classList.add("btn", "btn-primary",  "btn-sm", "rounded-pill");

				    	
				}

				
				
			}

		},



		// Empties the cart by calling the _emptyCart() method
		// @see $.Shop._emptyCart()
		
		emptyCart: function() {
			var self = this;
			if( self.$emptyCartBtn.length ) {
				self.$emptyCartBtn.on( "click", function() {
					self._emptyCart();
				});
			}
		},
		
		// Updates the cart
		
		updateCart: function() {
			var self = this;
		  if( self.$updateCartBtn.length ) {
			self.$updateCartBtn.on( "click", function() {
				var $rows = self.$formCart.find( "tbody tr" );
				var cart = self.storage.getItem( self.cartName );
				var shippingRates = self.storage.getItem( self.shippingRates );
				var total = self.storage.getItem( self.total );
				
				var updatedTotal = 0;
				var totalQty = 0;
				var updatedCart = {};
				updatedCart.items = [];
				
				$rows.each(function() {
					var $row = $( this );
					var pname = $.trim( $row.find( ".pname" ).text() );
					var pqty = self._convertString( $row.find( ".pqty > .qty" ).val() );
					var pprice = self._convertString( self._extractPrice( $row.find( ".pprice" ) ) );
					
					var cartObj = {
						product: pname,
						price: pprice,
						qty: pqty
					};
					
					updatedCart.items.push( cartObj );
					
					var subTotal = pqty * pprice;
					updatedTotal += subTotal;
					totalQty += pqty;
				});
				
				self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );
				self.storage.setItem( self.shippingRates, self._convertNumber( self._calculateShipping( totalQty ) ) );
				self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
				
			});
		  }
		},
		
		// Adds items to the shopping cart
		
		handleAddToCartForm: function() {
			var self = this;
			self.$formAddToCart.each(function() {
				var $form = $( this );
				var $product = $form.parent();
				var price = self._convertString( $product.data( "price" ) );
				var name =  $product.data( "name" );
				
				$form.on( "submit", function() {
					var qty = self._convertString( $form.find( ".qty" ).val() );
					var subTotal = qty * price;
					var total = self._convertString( self.storage.getItem( self.total ) );
					var sTotal = total + subTotal;
					self.storage.setItem( self.total, sTotal );
					self._addToCart({
						product: name,
						price: price,
						qty: qty
					});
					var shipping = self._convertString( self.storage.getItem( self.shippingRates ) );
					var shippingRates = self._calculateShipping( qty );
					var totalShipping = shipping + shippingRates;
					
					self.storage.setItem( self.shippingRates, totalShipping );
				});
			});
		},
		
		// Handles the checkout form by adding a validation routine and saving user's info into the session storage
		
		handleCheckoutOrderForm: function() {
			var self = this;
			if( self.$checkoutOrderForm.length ) {
				var $sameAsBilling = $( "#same-as-billing" );
				$sameAsBilling.on( "change", function() {
					var $check = $( this );
					if( $check.prop( "checked" ) ) {
						$( "#fieldset-shipping" ).slideUp( "normal" );
					} else {
						$( "#fieldset-shipping" ).slideDown( "normal" );
					}
				});
				
				self.$checkoutOrderForm.on( "submit", function() {
					var $form = $( this );
					var valid = self._validateForm( $form );
					
					if( !valid ) {
						return valid;
					} else {
						self._saveFormData( $form );
					}
				});
			}
		},
		
		// Private methods
		
		
		// Empties the session storage
		
		_emptyCart: function() {
			this.storage.clear();
		},
		
		/* Format a number by decimal places
		 * @param num Number the number to be formatted
		 * @param places Number the decimal places
		 * @returns n Number the formatted number
		 */
		 
		 
		
		_formatNumber: function( num, places ) {
			var n = num.toFixed( places );
			return n;
		},
		
		/* Extract the numeric portion from a string
		 * @param element Object the jQuery element that contains the relevant string
		 * @returns price String the numeric string
		 */
		
		
		_extractPrice: function( element ) {
			var self = this;
			var text = element.text();
			var price = text.replace( self.currencyString, "" ).replace( " ", "" );
			return price;
		},
		
		/* Converts a numeric string into a number
		 * @param numStr String the numeric string to be converted
		 * @returns num Number the number
		 */
		
		_convertString: function( numStr ) {
			var num;
			if( /^[-+]?[0-9]+\.[0-9]+$/.test( numStr ) ) {
				num = parseFloat( numStr );
			} else if( /^\d+$/.test( numStr ) ) {
				num = parseInt( numStr, 10 );
			} else {
				num = Number( numStr );
			}
			
			if( !isNaN( num ) ) {
				return num;
			} else {
				console.warn( numStr + " cannot be converted into a number" );
				return false;
			}
		},
		
		/* Converts a number to a string
		 * @param n Number the number to be converted
		 * @returns str String the string returned
		 */
		
		_convertNumber: function( n ) {
			var str = n.toString();
			return str;
		},
		
		/* Converts a JSON string to a JavaScript object
		 * @param str String the JSON string
		 * @returns obj Object the JavaScript object
		 */
		
		_toJSONObject: function( str ) {
			var obj = JSON.parse( str );
			return obj;
		},
		
		/* Converts a JavaScript object to a JSON string
		 * @param obj Object the JavaScript object
		 * @returns str String the JSON string
		 */
		
		
		_toJSONString: function( obj ) {
			var str = JSON.stringify( obj );
			return str;
		},
		
		
		/* Add an object to the cart as a JSON string
		 * @param values Object the object to be added to the cart
		 * @returns void
		 */
		
		
		_addToCart: function( values ) {
			var cart = this.storage.getItem( this.cartName );
			
			var cartObject = this._toJSONObject( cart );
			var cartCopy = cartObject;
			var items = cartCopy.items;
			items.push( values );
			
			this.storage.setItem( this.cartName, this._toJSONString( cartCopy ) );
		},
		
		/* Custom shipping rates calculation based on the total quantity of items in the cart
		 * @param qty Number the total quantity of items
		 * @returns shipping Number the shipping rates
		 */
		
		_calculateShipping: function( qty ) {
			var shipping = 0;
			if( qty >= 6 ) {
				shipping = 0;
			}
			if( qty >= 12 && qty <= 30 ) {
				shipping = 0;	
			}
			
			if( qty >= 30 && qty <= 60 ) {
				shipping = 0;	
			}
			
			if( qty > 60 ) {
				shipping = 0;
			}
			
			return shipping;
		
		},
		
		/* Validates the checkout form
		 * @param form Object the jQuery element of the checkout form
		 * @returns valid Boolean true for success, false for failure
		 */
		 
		 
		
		_validateForm: function( form ) {
			var self = this;
			var fields = self.requiredFields;
			var $visibleSet = form.find( "fieldset:visible" );
			var valid = true;
			
			form.find( ".message" ).remove();
			
		  $visibleSet.each(function() {
			
			$( this ).find( ":input" ).each(function() {
				var $input = $( this );
				var type = $input.data( "type" );
				var msg = $input.data( "message" );
				
				if( type == "string" ) {
					if( $input.val() == fields.str.value ) {
						$( "<span class='message'/>" ).text( msg ).
						insertBefore( $input );
						
						valid = false;
					}
				} else {
					if( !fields.expression.value.test( $input.val() ) ) {
						$( "<span class='message'/>" ).text( msg ).
						insertBefore( $input );
						
						valid = false;
					}
				}
				
			});
		  });
			
			return valid;
		
		},
		
		/* Save the data entered by the user in the ckeckout form
		 * @param form Object the jQuery element of the checkout form
		 * @returns void
		 */
		
		
		_saveFormData: function( form ) {
			var self = this;
			var $visibleSet = form.find( "fieldset:visible" );
			
			$visibleSet.each(function() {
				var $set = $( this );
				if( $set.is( "#fieldset-billing" ) ) {
					var name = $( "#name", $set ).val();
					var email = $( "#email", $set ).val();
					var city = $( "#city", $set ).val();
					var address = $( "#address", $set ).val();
					var mobile = $( "#mobile", $set ).val();
					var zip = $( "#zip", $set ).val();
					
					self.storage.setItem( "billing-name", name );
					self.storage.setItem( "billing-email", email );
					self.storage.setItem( "billing-city", city );
					self.storage.setItem( "billing-address", address );
					self.storage.setItem( "billing-mobile", mobile );
					self.storage.setItem( "billing-zip", zip );
				} else {
					var sName = $( "#sname", $set ).val();
					var sEmail = $( "#semail", $set ).val();
					var sCity = $( "#scity", $set ).val();
					var sAddress = $( "#saddress", $set ).val();
					var sMobile = $( "#smobile", $set ).val();
					var sZip = $( "#szip", $set ).val();
					
					self.storage.setItem( "shipping-name", sName );
					self.storage.setItem( "shipping-email", sEmail );
					self.storage.setItem( "shipping-city", sCity );
					self.storage.setItem( "shipping-address", sAddress );
					self.storage.setItem( "shipping-mobile", sMobile );
					self.storage.setItem( "shipping-zip", sZip );
				
				}
			});
		}
	};
	
	$(function() {
		var shop = new $.Shop( "#site" );
	});

})( jQuery );
