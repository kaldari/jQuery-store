/*
 * jQuery store - Plugin for persistent, cached data storage using localStorage, userData,
 * or cookies
 *
 * Authors: Rodney Rehm, Ryan Kaldari
 * Based on original plug-in at http://medialize.github.com/jQuery-store/. Added cookie
 * fall-back and caching. Removed window storage and serialization. Input should be
 * properly serialized before being passed to set().
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

/************************************************************************************
 * INITIALIZE EXAMPLES:
 ************************************************************************************
 *  // automatically detect best suited storage driver
 *  $.storage = new $.store();
 *  // optionally initialize with specific driver
 *  $.storage = new $.store( [driver] );
 *      driver      key for storage method ("localStorage", "userData", or "cookies")
 ************************************************************************************
 * USAGE EXAMPLES:
 ************************************************************************************
 *  $.storage.get( key );           // retrieves a value
 *  $.storage.set( key, value );    // saves a value
 *  $.storage.remove( key );        // deletes a value
 *  $.storage.driverInUse();        // states which driver is being used
 ************************************************************************************
 */
( function( $ ) {

$.store = function( driver ) {
	var self = this;

	this.cache = {};
	if ( driver ) {
		if ( $.store.drivers[driver] ) {
			this.driver = $.store.drivers[driver];
		} else {
			throw new Error( 'Unknown driver ' + driver );
		}
	} else {
		// detect and initialize storage driver
		$.each( $.store.fallback, function( index, driver ) {
			// skip unavailable drivers
			if ( !$.store.drivers[driver].available() ) {
				return true; // continue;
			}
			self.driver = $.store.drivers[driver];
			if ( self.driver.init() === false ) {
				self.driver = null;
				return true; // continue;
			}
			return false; // break;
		} );
	}
};

$.extend( $.store.prototype, {
	get: function( key ) {
		if ( key in this.cache ) {
			return this.cache.key;
		} else {
			return this.driver.get( key );
		}
	},
	set: function( key, value ) {
		this.cache.key = value;
		this.driver.set( key, value );
	},
	remove: function( key ) {
		delete this.cache.key;
		this.driver.remove( key );
	},
	driverInUse: function() {
		return this.driver.ident;
	}
} );

// Define the preferred fall-back order. Try localStorage first, then userData, then cookies.
$.store.fallback = [ 'localStorage', 'userData', 'cookies' ];

$.store.drivers = {
	// Firefox 3.5, Safari 4.0, Chrome 5, Opera 10.5, IE8
	'localStorage': {
		// see https://developer.mozilla.org/en/dom/storage#localStorage
		ident: '$.store.drivers.localStorage',
		available: function() {
			try {
				if ( window.localStorage ) {
					// Safari's "Private" mode throws a QUOTA_EXCEEDED_ERR on setItem
					window.localStorage.setItem( 'localStorageTest', 'localStorageTest' );
					window.localStorage.removeItem( 'localStorageTest' );
					return true;
				}
				return false;
			} catch(e) {
				return false;
			}
		},
		init: $.noop,
		get: function( key ) {
			return window.localStorage.getItem( key );
		},
		set: function( key, value ) {
			window.localStorage.setItem( key, value );
		},
		remove: function( key ) {
			window.localStorage.removeItem( key );
		}
	},

	// IE6, IE7
	'userData': {
		// see http://msdn.microsoft.com/en-us/library/ms531424.aspx
		ident: '$.store.drivers.userData',
		element: null,
		nodeName: 'userdatadriver',
		initialized: false,
		available: function() {
			try {
				return !!( document.documentElement && document.documentElement.addBehavior );
			} catch(e) {
				return false;
			}
		},
		init: function() {
			// $.store can only utilize one userData store at a time, thus avoid duplicate initialization
			if ( this.initialized ) {
				return;
			}
			try {
				// Create a non-existing element and append it to the root element (html)
				this.element = document.createElement( this.nodeName );
				document.documentElement.insertBefore( this.element, document.getElementsByTagName('title')[0] );
				// Apply userData behavior
				this.element.addBehavior( '#default#userData' );
				this.initialized = true;
			} catch( e ) {
				return false;
			}
		},
		get: function( key ) {
			this.element.load( this.nodeName );
			return this.element.getAttribute( key );
		},
		set: function( key, value ) {
			this.element.setAttribute( key, value );
			this.element.save( this.nodeName );
		},
		remove: function( key ) {
			this.element.removeAttribute( key );
			this.element.save( this.nodeName );
		}
	},

	// most other browsers
	'cookies': {
		ident: '$.store.drivers.cookies',
		available: function() {
			return true;
		},
		init: $.noop,
		get: function( key ) {
			var nameEQ = key + '=',
				ca = document.cookie.split( ';' ),
				i, c;
			for ( i = 0; i < ca.length; i++ ) {
				c = ca[i];
				while ( c.charAt(0) === ' ' ) {
					c = c.substring( 1, c.length );
				}
				if ( c.indexOf( nameEQ ) === 0 ) {
					return c.substring( nameEQ.length, c.length );
				}
			}
			return null;
		},
		set: function( key, value ) {
			var date = new Date(),
				expires;
			// store cookie for 1 year
			date.setTime( date.getTime() + ( 365 * 24 * 60 * 60 * 1000 ) );
			expires = "; expires=" + date.toGMTString();
			document.cookie = key + '=' + value + expires + '; path=/';
		},
		remove: function( key ) {
			document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
	}
};

} ( jQuery ) );
