(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Quagga = require("quagga")
var jQuery = require("jquery")
var Debounce = require("debounce")
var $ = jQuery

var Receipts = {
    2846365: {
        merchant: "Walmart",
        total: "$30.54",
        date: "January 11th, 2016",
        recipient: "Andrew McPherson",
        items: [
            {name: "golden bananas", cost: "$4.99"},
            {name: "magic cucumbers", cost: "$11.99"},
            {name: "a llama", cost: "$13.56"},
        ],
        comment: "You saved $4.01!"
    },
    9471534: {
        merchant: "Julie Darling Donuts",
        total: "$8.99",
        date: "December 21th, 2015",
        recipient: "Andrew McPherson",
        items: [
            {name: "dozens of donuts", cost: "$8.99"},
        ]
    },
    1111111: {
        merchant: "Ace Hardware",
        total: "$12.56",
        date: "February 30th, 201X",
        recipient: "David McPherson",
        items: [
            {name: "too many screws", cost: "$4.99"},
            {name: "hammer", cost: "7.57"}
        ],
        comment: "Never too many screws, right?"
    },
}

var render = function(receipt) {
    return (
        "<h1>" + receipt.merchant + " - " + receipt.total + "</h1>"
        + "<div>Recipient: " + receipt.recipient + "</div>" + "<div>Date of Purchase: " + receipt.date + "</div>"
        + "<br/><ul>" + receipt.items.map(function(item) {
            return "<li><b>" + item.name + "</b> ... " + item.cost + "</li>"
        }).join(" ") + "</ul>"
        + (receipt.comment ? "<br/><div>" + receipt.comment + "</div>" : "")
    )
}

var popup = function(code) {
    if(Receipts[code] != undefined) {
        $("#popup").html(render(Receipts[code]))
        $("#popup").addClass("active").addClass("more")
    } else {
        $("#popup").html("<h1>" + code + "</h1>")
        $("#popup").addClass("active").addClass("less")
    }
}

var unpopup = Debounce(function() {
    $("#popup").removeClass("active").removeClass("more").removeClass("less").html("")
}, 1000)

var collector = Quagga.ResultCollector.create({
    capture: true,
    capacity: 20,
    blacklist: [{code: "2167361334", format: "i2of5"}],
    filter: function(result) {
        return true
    }
})

Quagga.init({
    inputStream: {
        type : "LiveStream",
        constraints: {
            width: 640,
            height: 480,
            facing: "environment"
        }
    },
    locator: {
        patchSize: "medium",
        halfSample: true
    },
    numOfWorkers: 4,
    decoder: {
        readers : ["code_128_reader"]
    },
    locate: true
}, function(error) {
    if(!!error) {
        console.log(error)
    }
    Quagga.registerResultCollector(collector)
    Quagga.start()
})

Quagga.onProcessed(function(result) {
    var drawingCtx = Quagga.canvas.ctx.overlay
    var drawingCanvas = Quagga.canvas.dom.overlay

    if(result) {
        if(result.boxes) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")))
            result.boxes.filter(function (box) {
                return box !== result.box
            }).forEach(function (box) {
                Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2})
            })
        }

        if(result.box) {
            Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2})
        }

        if(result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3})
        }
    }
})

Quagga.onDetected(function(data) {
    var code = data.codeResult.code

    popup(code)
    unpopup()
})

},{"debounce":2,"jquery":4,"quagga":5}],2:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":3}],3:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],4:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v2.2.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-01-08T20:02Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var arr = [];

var document = window.document;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "2.2.0",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isPlainObject: function( obj ) {

		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {

			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf( "use strict" ) === 1 ) {
				script = document.createElement( "script" );
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {

				// Otherwise, avoid the DOM node creation, insertion
				// and removal by using an indirect global eval

				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {

						// Inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE9-10 only
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	register: function( owner, initial ) {
		var value = initial || {};

		// If it is a node unlikely to be stringify-ed or looped over
		// use plain assignment
		if ( owner.nodeType ) {
			owner[ this.expando ] = value;

		// Otherwise secure it in a non-enumerable, non-writable property
		// configurability must be true to allow the property to be
		// deleted with the delete operator
		} else {
			Object.defineProperty( owner, this.expando, {
				value: value,
				writable: true,
				configurable: true
			} );
		}
		return owner[ this.expando ];
	},
	cache: function( owner ) {

		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return an empty object.
		if ( !acceptData( owner ) ) {
			return {};
		}

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ prop ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :
			owner[ this.expando ] && owner[ this.expando ][ key ];
	},
	access: function( owner, key, value ) {
		var stored;

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase( key ) );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key === undefined ) {
			this.register( owner );

		} else {

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );

				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;

			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <= 35-45+
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://code.google.com/p/chromium/issues/detail?id=378607
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data, camelKey;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// with the key as-is
				data = dataUser.get( elem, key ) ||

					// Try to find dashed key if it exists (gh-2779)
					// This is for 2.2.x only
					dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

				if ( data !== undefined ) {
					return data;
				}

				camelKey = jQuery.camelCase( key );

				// Attempt to get data from the cache
				// with the key camelized
				data = dataUser.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			camelKey = jQuery.camelCase( key );
			this.each( function() {

				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = dataUser.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				dataUser.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
					dataUser.set( this, key, value );
				}
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE9
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE9-11+
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0-4.3, Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return this;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
			"screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {
	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

function manipulationTarget( elem, content ) {
	if ( jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return elem.getElementsByTagName( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {
		div.style.cssText =

			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );
	}

	jQuery.extend( support, {
		pixelPosition: function() {

			// This test is executed only once but we still do memoizing
			// since we can use the boxSizingReliable pre-computing.
			// No need to check if the test was already performed, though.
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
			// since that compresses better and they're computed together anyway.
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		},
		reliableMarginRight: function() {

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// This support function is only executed once so no memoizing is needed.
			var ret,
				marginDiv = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			marginDiv.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;box-sizing:content-box;" +
				"display:block;margin:0;border:0;padding:0";
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			documentElement.appendChild( container );

			ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

			documentElement.removeChild( container );
			div.removeChild( marginDiv );

			return ret;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// http://dev.w3.org/csswg/cssom/#resolved-values
		if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE9-11+
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Support: IE11 only
	// In IE 11 fullscreen elements inside of an iframe have
	// 100x too small dimensions (gh-1764).
	if ( document.msFullscreenElement && window.top !== window ) {

		// Support: IE11 only
		// Running getBoundingClientRect on a disconnected node
		// in IE throws an error.
		if ( elem.getClientRects().length ) {
			val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
		}
	}

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = dataPriv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = dataPriv.access(
					elem,
					"olddisplay",
					defaultDisplay( elem.nodeName )
				);
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				dataPriv.set(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = dataPriv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;

			dataPriv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {
	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
		opt.duration : opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );

	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// Handle most common string cases
					ret.replace( rreturn, "" ) :

					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				// Support: IE<11
				// option.value not trimmed (#14858)
				return jQuery.trim( elem.value );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// But now, this "simulate" function is used only for events
				// for which stopPropagation() is noop, so there is no need for that anymore.
				//
				// For the compat branch though, guard for "click" and "submit"
				// events is still used, but was moved to jQuery.event.stopPropagation function
				// because `originalEvent` should point to the original event for the constancy
				// with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




support.focusin = "onfocusin" in window;


// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE8-11+
			// IE throws exception if url is malformed, e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE8-11+
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


jQuery.expr.filters.hidden = function( elem ) {
	return !jQuery.expr.filters.visible( elem );
};
jQuery.expr.filters.visible = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	// Use OR instead of AND as the element is not visible if either is true
	// See tickets #10406 and #13132
	return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE9
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE9
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8+
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	// Stop scripts or inline event handlers from being executed immediately
	// by using document.implementation
	context = context || ( support.createHTMLDocument ?
		document.implementation.createHTMLDocument( "" ) :
		document );

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		box = elem.getBoundingClientRect();
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			// Subtract offsetParent scroll positions
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ) -
				offsetParent.scrollTop();
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true ) -
				offsetParent.scrollLeft();
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},
	size: function() {
		return this.length;
	}
} );

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

},{}],5:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(e.toString()):"object"==typeof exports?exports.Quagga=e(e.toString()):t.Quagga=e(e.toString())}(this,function(t){return function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return t[r].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var n={};return e.m=t,e.c=n,e.p="/",e(0)}([function(t,e,n){t.exports=n(1)},function(e,n,r){"use strict";function o(t){return t&&t.__esModule?t:{"default":t}}function a(t){s(t),O=L["default"].create(tt.decoder,A)}function i(){if("undefined"!=typeof document)for(var t=[{node:document.querySelector("div[data-controls]"),prop:tt.controls},{node:K.dom.overlay,prop:tt.visual.show}],e=0;e<t.length;e++)t[e].node&&(t[e].prop===!0?t[e].node.style.display="block":t[e].node.style.display="none")}function u(t){var e;if("VideoStream"===tt.inputStream.type)e=document.createElement("video"),b=Q.createVideoStream(e);else if("ImageStream"===tt.inputStream.type)b=Q.createImageStream();else if("LiveStream"===tt.inputStream.type){var n=document.querySelector("#interactive.viewport");n&&(e=n.querySelector("video"),e||(e=document.createElement("video"),n.appendChild(e))),b=Q.createLiveStream(e),F["default"].request(e,tt.inputStream.constraints,function(e){return e?t(e):void b.trigger("canrecord")})}b.setAttribute("preload","auto"),b.setAttribute("autoplay",!0),b.setInputStream(tt.inputStream),b.addEventListener("canrecord",c.bind(void 0,t))}function c(t){I["default"].checkImageConstraints(b,tt.locator),f(),R=Z.create(b,K.dom.image),i(),tt.numOfWorkers>0?y(function(){console.log("Workers created"),l(t)}):(a(),l(t))}function l(t){b.play(),t()}function f(){if("undefined"!=typeof document){var t=document.querySelector("#interactive.viewport");if(K.dom.image=document.querySelector("canvas.imgBuffer"),K.dom.image||(K.dom.image=document.createElement("canvas"),K.dom.image.className="imgBuffer",t&&"ImageStream"===tt.inputStream.type&&t.appendChild(K.dom.image)),K.ctx.image=K.dom.image.getContext("2d"),K.dom.image.width=b.getCanvasSize().x,K.dom.image.height=b.getCanvasSize().y,K.dom.overlay=document.querySelector("canvas.drawingBuffer"),!K.dom.overlay){K.dom.overlay=document.createElement("canvas"),K.dom.overlay.className="drawingBuffer",t&&t.appendChild(K.dom.overlay);var e=document.createElement("br");e.setAttribute("clear","all"),t&&t.appendChild(e)}K.ctx.overlay=K.dom.overlay.getContext("2d"),K.dom.overlay.width=b.getCanvasSize().x,K.dom.overlay.height=b.getCanvasSize().y}}function s(t){A=t?t:new P["default"]({x:b.getWidth(),y:b.getHeight()}),console.log(A.size),C=[Y.vec2.clone([0,0]),Y.vec2.clone([0,A.size.y]),Y.vec2.clone([A.size.x,A.size.y]),Y.vec2.clone([A.size.x,0])],I["default"].init(A,tt.locator)}function d(){return tt.locate?I["default"].locate():[[Y.vec2.clone(C[0]),Y.vec2.clone(C[1]),Y.vec2.clone(C[2]),Y.vec2.clone(C[3])]]}function h(t){function e(t){for(var e=t.length;e--;)t[e][0]+=a,t[e][1]+=i}function n(t){t[0].x+=a,t[0].y+=i,t[1].x+=a,t[1].y+=i}var r,o=b.getTopRight(),a=o.x,i=o.y;if(t&&(0!==a||0!==i)&&(t.line&&2===t.line.length&&n(t.line),t.boxes&&t.boxes.length>0))for(r=0;r<t.boxes.length;r++)e(t.boxes[r])}function p(t,e){J&&(h(t),e&&t&&t.codeResult&&T&&T.addResult(e,b.getCanvasSize(),t.codeResult)),U["default"].publish("processed",t),t&&t.codeResult&&U["default"].publish("detected",t)}function v(){var t,e;e=d(),e?(t=O.decodeFromBoundingBoxes(e),t=t||{},t.boxes=e,p(t,A.data)):p()}function g(){var t;if(J){if($.length>0){if(t=$.filter(function(t){return!t.busy})[0],!t)return;R.attachData(t.imageData)}else R.attachData(A.data);R.grab()&&(t?(t.busy=!0,t.worker.postMessage({cmd:"process",imageData:t.imageData},[t.imageData.buffer])):v())}else v()}function m(){E=!1,function t(){E||(g(),J&&"LiveStream"===tt.inputStream.type&&window.requestAnimFrame(t))}()}function y(t){function e(e){$.push(e),$.length>=tt.numOfWorkers&&t()}var n;for($=[],n=0;n<tt.numOfWorkers;n++)_(e)}function _(t){var e,n={worker:void 0,imageData:new Uint8Array(b.getWidth()*b.getHeight()),busy:!0};e=M(),n.worker=new Worker(e),n.worker.onmessage=function(r){return"initialized"===r.data.event?(URL.revokeObjectURL(e),n.busy=!1,n.imageData=new Uint8Array(r.data.imageData),console.log("Worker initialized"),t(n)):void("processed"===r.data.event?(n.imageData=new Uint8Array(r.data.imageData),n.busy=!1,p(r.data.result,n.imageData)):"error"===r.data.event&&console.log("Worker error: "+r.data.message))},n.worker.postMessage({cmd:"init",size:{x:b.getWidth(),y:b.getHeight()},imageData:n.imageData,config:tt},[n.imageData.buffer])}function x(t){function e(t){self.postMessage({event:"processed",imageData:o.data,result:t},[o.data.buffer])}function n(){self.postMessage({event:"initialized",imageData:o.data},[o.data.buffer])}if(t){var r=t();if(!r)return void self.postMessage({event:"error",message:"Quagga could not be created"})}var o;self.onmessage=function(t){if("init"===t.data.cmd){var a=t.data.config;a.numOfWorkers=0,o=new r.ImageWrapper({x:t.data.size.x,y:t.data.size.y},new Uint8Array(t.data.imageData)),r.init(a,n,o),r.onProcessed(e)}else"process"===t.data.cmd?(o.data=new Uint8Array(t.data.imageData),r.start()):"setReaders"===t.data.cmd&&r.setReaders(t.data.readers)}}function M(){var e,n;return"undefined"!=typeof t&&(n=t),e=new Blob(["("+x.toString()+")("+n+");"],{type:"text/javascript"}),window.URL.createObjectURL(e)}function w(t){O?O.setReaders(t):J&&$.length>0&&$.forEach(function(e){e.worker.postMessage({cmd:"setReaders",readers:t})})}Object.defineProperty(n,"__esModule",{value:!0});var b,R,E,A,C,O,T,D=r(2),S=(o(D),r(3)),P=o(S),z=r(18),I=o(z),N=r(23),L=o(N),j=r(68),k=o(j),q=r(69),U=o(q),W=r(70),F=o(W),B=r(22),G=o(B),Y=r(7),V=r(71),H=o(V),X=r(35),Q=r(72),Z=r(74),K={ctx:{image:null,overlay:null},dom:{image:null,overlay:null}},$=[],J=!0,tt={};n["default"]={init:function(t,e,n){return tt=X({},k["default"],t),n?(J=!1,a(n),e()):void u(e)},start:function(){m()},stop:function(){E=!0,$.forEach(function(t){t.worker.terminate(),console.log("Worker terminated!")}),$.length=0,"LiveStream"===tt.inputStream.type&&(F["default"].release(),b.clearEventHandlers())},pause:function(){E=!0},onDetected:function(t){U["default"].subscribe("detected",t)},offDetected:function(t){U["default"].unsubscribe("detected",t)},onProcessed:function(t){U["default"].subscribe("processed",t)},offProcessed:function(t){U["default"].unsubscribe("processed",t)},setReaders:function(t){w(t)},registerResultCollector:function(t){t&&"function"==typeof t.addResult&&(T=t)},canvas:K,decodeSingle:function(t,e){t=X({inputStream:{type:"ImageStream",sequence:!1,size:800,src:t.src},numOfWorkers:1,locator:{halfSample:!1}},t),this.init(t,function(){U["default"].once("processed",function(t){E=!0,e.call(null,t)},!0),m()})},ImageWrapper:P["default"],ImageDebug:G["default"],ResultCollector:H["default"]},e.exports=n["default"]},function(t,e){"use strict";"undefined"!=typeof window&&(window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)}}(),navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia,window.URL=window.URL||window.webkitURL||window.mozURL||window.msURL),Math.imul=Math.imul||function(t,e){var n=t>>>16&65535,r=65535&t,o=e>>>16&65535,a=65535&e;return r*a+(n*a+r*o<<16>>>0)|0}},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(t,e,n,r){e?this.data=e:n?(this.data=new n(t.x*t.y),n===Array&&r&&f["default"].init(this.data,0)):(this.data=new Uint8Array(t.x*t.y),Uint8Array===Array&&r&&f["default"].init(this.data,0)),this.size=t}Object.defineProperty(e,"__esModule",{value:!0});var a=n(4),i=r(a),u=n(5),c=r(u),l=n(17),f=r(l),s=n(7);o.prototype.inImageWithBorder=function(t,e){return t.x>=e&&t.y>=e&&t.x<this.size.x-e&&t.y<this.size.y-e},o.sample=function(t,e,n){var r=Math.floor(e),o=Math.floor(n),a=t.size.x,i=o*t.size.x+r,u=t.data[i+0],c=t.data[i+1],l=t.data[i+a],f=t.data[i+a+1],s=u-c;e-=r,n-=o;var d=Math.floor(e*(n*(s-l+f)-s)+n*(l-u)+u);return d},o.clearArray=function(t){for(var e=t.length;e--;)t[e]=0},o.prototype.subImage=function(t,e){return new i["default"](t,e,this)},o.prototype.subImageAsCopy=function(t,e){var n,r,o=t.size.y,a=t.size.x;for(n=0;a>n;n++)for(r=0;o>r;r++)t.data[r*a+n]=this.data[(e.y+r)*this.size.x+e.x+n]},o.prototype.copyTo=function(t){for(var e=this.data.length,n=this.data,r=t.data;e--;)r[e]=n[e]},o.prototype.get=function(t,e){return this.data[e*this.size.x+t]},o.prototype.getSafe=function(t,e){var n;if(!this.indexMapping){for(this.indexMapping={x:[],y:[]},n=0;n<this.size.x;n++)this.indexMapping.x[n]=n,this.indexMapping.x[n+this.size.x]=n;for(n=0;n<this.size.y;n++)this.indexMapping.y[n]=n,this.indexMapping.y[n+this.size.y]=n}return this.data[this.indexMapping.y[e+this.size.y]*this.size.x+this.indexMapping.x[t+this.size.x]]},o.prototype.set=function(t,e,n){return this.data[e*this.size.x+t]=n,this},o.prototype.zeroBorder=function(){var t,e=this.size.x,n=this.size.y,r=this.data;for(t=0;e>t;t++)r[t]=r[(n-1)*e+t]=0;for(t=1;n-1>t;t++)r[t*e]=r[t*e+(e-1)]=0},o.prototype.invert=function(){for(var t=this.data,e=t.length;e--;)t[e]=t[e]?0:1},o.prototype.convolve=function(t){var e,n,r,o,a=t.length/2|0,i=0;for(n=0;n<this.size.y;n++)for(e=0;e<this.size.x;e++){for(i=0,o=-a;a>=o;o++)for(r=-a;a>=r;r++)i+=t[o+a][r+a]*this.getSafe(e+r,n+o);this.data[n*this.size.x+e]=i}},o.prototype.moments=function(t){var e,n,r,o,a,i,u,c,l,f,d,h,p=this.data,v=this.size.y,g=this.size.x,m=[],y=[],_=Math.PI,x=_/4;if(0>=t)return y;for(a=0;t>a;a++)m[a]={m00:0,m01:0,m10:0,m11:0,m02:0,m20:0,theta:0,rad:0};for(n=0;v>n;n++)for(o=n*n,e=0;g>e;e++)r=p[n*g+e],r>0&&(i=m[r-1],i.m00+=1,i.m01+=n,i.m10+=e,i.m11+=e*n,i.m02+=o,i.m20+=e*e);for(a=0;t>a;a++)i=m[a],isNaN(i.m00)||0===i.m00||(f=i.m10/i.m00,d=i.m01/i.m00,u=i.m11/i.m00-f*d,c=i.m02/i.m00-d*d,l=i.m20/i.m00-f*f,h=(c-l)/(2*u),h=.5*Math.atan(h)+(u>=0?x:-x)+_,i.theta=(180*h/_+90)%180-90,i.theta<0&&(i.theta+=180),i.rad=h>_?h-_:h,i.vec=s.vec2.clone([Math.cos(h),Math.sin(h)]),y.push(i));return y},o.prototype.show=function(t,e){var n,r,o,a,i,u,c;for(e||(e=1),n=t.getContext("2d"),t.width=this.size.x,t.height=this.size.y,r=n.getImageData(0,0,t.width,t.height),o=r.data,a=0,c=0;c<this.size.y;c++)for(u=0;u<this.size.x;u++)i=c*this.size.x+u,a=this.get(u,c)*e,o[4*i+0]=a,o[4*i+1]=a,o[4*i+2]=a,o[4*i+3]=255;n.putImageData(r,0,0)},o.prototype.overlay=function(t,e,n){(!e||0>e||e>360)&&(e=360);for(var r=[0,1,1],o=[0,0,0],a=[255,255,255],i=[0,0,0],u=[],l=t.getContext("2d"),f=l.getImageData(n.x,n.y,this.size.x,this.size.y),s=f.data,d=this.data.length;d--;)r[0]=this.data[d]*e,u=r[0]<=0?a:r[0]>=360?i:c["default"].hsv2rgb(r,o),s[4*d+0]=u[0],s[4*d+1]=u[1],s[4*d+2]=u[2],s[4*d+3]=255;l.putImageData(f,n.x,n.y)},e["default"]=o,t.exports=e["default"]},function(t,e){"use strict";function n(t,e,n){n||(n={data:null,size:e}),this.data=n.data,this.originalSize=n.size,this.I=n,this.from=t,this.size=e}Object.defineProperty(e,"__esModule",{value:!0}),n.prototype.show=function(t,e){var n,r,o,a,i,u,c;for(e||(e=1),n=t.getContext("2d"),t.width=this.size.x,t.height=this.size.y,r=n.getImageData(0,0,t.width,t.height),o=r.data,a=0,i=0;i<this.size.y;i++)for(u=0;u<this.size.x;u++)c=i*this.size.x+u,a=this.get(u,i)*e,o[4*c+0]=a,o[4*c+1]=a,o[4*c+2]=a,o[4*c+3]=255;r.data=o,n.putImageData(r,0,0)},n.prototype.get=function(t,e){return this.data[(this.from.y+e)*this.originalSize.x+this.from.x+t]},n.prototype.updateData=function(t){this.originalSize=t.size,this.data=t.data},n.prototype.updateFrom=function(t){return this.from=t,this},e["default"]=n,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(6),a=r(o),i=n(17),u=r(i),c=n(7),l={};l.imageRef=function(t,e){var n={x:t,y:e,toVec2:function(){return c.vec2.clone([this.x,this.y])},toVec3:function(){return c.vec3.clone([this.x,this.y,1])},round:function(){return this.x=this.x>0?Math.floor(this.x+.5):Math.floor(this.x-.5),this.y=this.y>0?Math.floor(this.y+.5):Math.floor(this.y-.5),this}};return n},l.computeIntegralImage2=function(t,e){var n,r,o=t.data,a=t.size.x,i=t.size.y,u=e.data,c=0,l=0,f=0,s=0,d=0;for(f=a,c=0,r=1;i>r;r++)c+=o[l],u[f]+=c,l+=a,f+=a;for(l=0,f=1,c=0,n=1;a>n;n++)c+=o[l],u[f]+=c,l++,f++;for(r=1;i>r;r++)for(l=r*a+1,f=(r-1)*a+1,s=r*a,d=(r-1)*a,n=1;a>n;n++)u[l]+=o[l]+u[f]+u[s]-u[d],l++,f++,s++,d++},l.computeIntegralImage=function(t,e){for(var n=t.data,r=t.size.x,o=t.size.y,a=e.data,i=0,u=0;r>u;u++)i+=n[u],a[u]=i;for(var c=1;o>c;c++){i=0;for(var l=0;r>l;l++)i+=n[c*r+l],a[c*r+l]=i+a[(c-1)*r+l]}},l.thresholdImage=function(t,e,n){n||(n=t);for(var r=t.data,o=r.length,a=n.data;o--;)a[o]=r[o]<e?1:0},l.computeHistogram=function(t,e){e||(e=8);for(var n=t.data,r=n.length,o=8-e,a=1<<e,i=new Int32Array(a);r--;)i[n[r]>>o]++;return i},l.sharpenLine=function(t){var e,n,r=t.length,o=t[0],a=t[1];for(e=1;r-1>e;e++)n=t[e+1],t[e-1]=2*a-o-n&255,o=a,a=n;return t},l.determineOtsuThreshold=function(t,e){function n(t,e){var n,r=0;for(n=t;e>=n;n++)r+=a[n];return r}function r(t,e){var n,r=0;for(n=t;e>=n;n++)r+=n*a[n];return r}function o(){var o,i,c,f,s,d,h,p=[0],v=(1<<e)-1;for(a=l.computeHistogram(t,e),f=1;v>f;f++)o=n(0,f),i=n(f+1,v),c=o*i,0===c&&(c=1),s=r(0,f)*i,d=r(f+1,v)*o,h=s-d,p[f]=h*h/c;return u["default"].maxIndex(p)}e||(e=8);var a,i,c=8-e;return i=o(),i<<c},l.otsuThreshold=function(t,e){var n=l.determineOtsuThreshold(t);return l.thresholdImage(t,n,e),n},l.computeBinaryImage=function(t,e,n){l.computeIntegralImage(t,e),n||(n=t);var r,o,a,i,u,c,f,s=t.data,d=n.data,h=t.size.x,p=t.size.y,v=e.data,g=0,m=3,y=(2*m+1)*(2*m+1);for(r=0;m>=r;r++)for(o=0;h>o;o++)d[r*h+o]=0,d[(p-1-r)*h+o]=0;for(r=m;p-m>r;r++)for(o=0;m>=o;o++)d[r*h+o]=0,d[r*h+(h-1-o)]=0;for(r=m+1;p-m-1>r;r++)for(o=m+1;h-m>o;o++)a=v[(r-m-1)*h+(o-m-1)],i=v[(r-m-1)*h+(o+m)],u=v[(r+m)*h+(o-m-1)],c=v[(r+m)*h+(o+m)],g=c-u-i+a,f=g/y,d[r*h+o]=s[r*h+o]>f+5?0:1},l.cluster=function(t,e,n){function r(t){var e=!1;for(i=0;i<l.length;i++)u=l[i],u.fits(t)&&(u.add(t),e=!0);return e}var o,i,u,c,l=[];for(n||(n="rad"),o=0;o<t.length;o++)c=a["default"].createPoint(t[o],o,n),r(c)||l.push(a["default"].create(c,e));return l},l.Tracer={trace:function f(t,e){function f(n,r){function o(t,e){return t.x>e.x-l&&t.x<e.x+l&&t.y>e.y-f&&t.y<e.y+f?!0:!1}var a,i,u,c,l=1,f=Math.abs(e[1]/10),s=!1;for(a=t[n],c=r?{x:a.x+e[0],y:a.y+e[1]}:{x:a.x-e[0],y:a.y-e[1]},u=r?n+1:n-1,i=t[u];i&&(s=o(i,c))!==!0&&Math.abs(i.y-a.y)<e[1];)u=r?u+1:u-1,i=t[u];return s?u:null}var n,r=10,o=[],a=[],i=0,u=0;for(n=0;r>n;n++){for(i=Math.floor(Math.random()*t.length),o=[],u=i,o.push(t[u]);null!==(u=f(u,!0));)o.push(t[u]);if(i>0)for(u=i;null!==(u=f(u,!1));)o.push(t[u]);o.length>a.length&&(a=o)}return a}},l.DILATE=1,l.ERODE=2,l.dilate=function(t,e){var n,r,o,a,i,u,c,l=t.data,f=e.data,s=t.size.y,d=t.size.x;for(n=1;s-1>n;n++)for(r=1;d-1>r;r++)a=n-1,i=n+1,u=r-1,c=r+1,o=l[a*d+u]+l[a*d+c]+l[n*d+r]+l[i*d+u]+l[i*d+c],f[n*d+r]=o>0?1:0},l.erode=function(t,e){var n,r,o,a,i,u,c,l=t.data,f=e.data,s=t.size.y,d=t.size.x;for(n=1;s-1>n;n++)for(r=1;d-1>r;r++)a=n-1,i=n+1,u=r-1,c=r+1,o=l[a*d+u]+l[a*d+c]+l[n*d+r]+l[i*d+u]+l[i*d+c],f[n*d+r]=5===o?1:0},l.subtract=function(t,e,n){n||(n=t);for(var r=t.data.length,o=t.data,a=e.data,i=n.data;r--;)i[r]=o[r]-a[r]},l.bitwiseOr=function(t,e,n){n||(n=t);for(var r=t.data.length,o=t.data,a=e.data,i=n.data;r--;)i[r]=o[r]||a[r]},l.countNonZero=function(t){for(var e=t.data.length,n=t.data,r=0;e--;)r+=n[e];return r},l.topGeneric=function(t,e,n){var r,o,a,i,u=0,c=0,l=[];for(r=0;e>r;r++)l[r]={score:0,item:null};for(r=0;r<t.length;r++)if(o=n.apply(this,[t[r]]),o>c)for(a=l[u],a.score=o,a.item=t[r],c=Number.MAX_VALUE,i=0;e>i;i++)l[i].score<c&&(c=l[i].score,u=i);return l},l.grayArrayFromImage=function(t,e,n,r){n.drawImage(t,e,0,t.width,t.height);var o=n.getImageData(e,0,t.width,t.height).data;l.computeGray(o,r)},l.grayArrayFromContext=function(t,e,n,r){var o=t.getImageData(n.x,n.y,e.x,e.y).data;l.computeGray(o,r)},l.grayAndHalfSampleFromCanvasData=function(t,e,n){for(var r,o=0,a=e.x,i=Math.floor(t.length/4),u=e.x/2,c=0,l=e.x;i>a;){for(r=0;u>r;r++)n[c]=Math.floor((.299*t[4*o+0]+.587*t[4*o+1]+.114*t[4*o+2]+(.299*t[4*(o+1)+0]+.587*t[4*(o+1)+1]+.114*t[4*(o+1)+2])+(.299*t[4*a+0]+.587*t[4*a+1]+.114*t[4*a+2])+(.299*t[4*(a+1)+0]+.587*t[4*(a+1)+1]+.114*t[4*(a+1)+2]))/4),c++,o+=2,a+=2;o+=l,a+=l}},l.computeGray=function(t,e,n){var r,o=t.length/4|0,a=n&&n.singleChannel===!0;if(a)for(r=0;o>r;r++)e[r]=t[4*r+0];else for(r=0;o>r;r++)e[r]=Math.floor(.299*t[4*r+0]+.587*t[4*r+1]+.114*t[4*r+2])},l.loadImageArray=function(t,e,n){n||(n=document.createElement("canvas"));var r=new Image;r.callback=e,r.onload=function(){n.width=this.width,n.height=this.height;var t=n.getContext("2d");t.drawImage(this,0,0);var e=new Uint8Array(this.width*this.height);t.drawImage(this,0,0);var r=t.getImageData(0,0,this.width,this.height).data;l.computeGray(r,e),this.callback(e,{x:this.width,y:this.height},this)},r.src=t},l.halfSample=function(t,e){for(var n=t.data,r=t.size.x,o=e.data,a=0,i=r,u=n.length,c=r/2,l=0;u>i;){for(var f=0;c>f;f++)o[l]=Math.floor((n[a]+n[a+1]+n[i]+n[i+1])/4),l++,a+=2,i+=2;a+=r,i+=r}},l.hsv2rgb=function(t,e){var n=t[0],r=t[1],o=t[2],a=o*r,i=a*(1-Math.abs(n/60%2-1)),u=o-a,c=0,l=0,f=0;return e=e||[0,0,0],60>n?(c=a,l=i):120>n?(c=i,l=a):180>n?(l=a,f=i):240>n?(l=i,f=a):300>n?(c=i,f=a):360>n&&(c=a,f=i),e[0]=255*(c+u)|0,e[1]=255*(l+u)|0,e[2]=255*(f+u)|0,e},l._computeDivisors=function(t){var e,n=[],r=[];for(e=1;e<Math.sqrt(t)+1;e++)t%e===0&&(r.push(e),e!==t/e&&n.unshift(Math.floor(t/e)));return r.concat(n)},l._computeIntersection=function(t,e){for(var n=0,r=0,o=[];n<t.length&&r<e.length;)t[n]===e[r]?(o.push(t[n]),n++,r++):t[n]>e[r]?r++:n++;return o},l.calculatePatchSize=function(t,e){function n(t){for(var e=0,n=t[Math.floor(t.length/2)];e<t.length-1&&t[e]<d;)e++;return e>0&&(n=Math.abs(t[e]-d)>Math.abs(t[e-1]-d)?t[e-1]:t[e]),d/n<c[f+1]/c[f]&&d/n>c[f-1]/c[f]?{x:n,y:n}:null}var r,o=this._computeDivisors(e.x),a=this._computeDivisors(e.y),i=Math.max(e.x,e.y),u=this._computeIntersection(o,a),c=[8,10,15,20,32,60,80],l={"x-small":5,small:4,medium:3,large:2,"x-large":1},f=l[t]||l.medium,s=c[f],d=Math.floor(i/s);return r=n(u),r||(r=n(this._computeDivisors(i)),r||(r=n(this._computeDivisors(d*s)))),r},l._parseCSSDimensionValues=function(t){var e={value:parseFloat(t),unit:(t.indexOf("%")===t.length-1,"%")};return e},l._dimensionsConverters={top:function(t,e){return"%"===t.unit?Math.floor(e.height*(t.value/100)):void 0},right:function(t,e){return"%"===t.unit?Math.floor(e.width-e.width*(t.value/100)):void 0},bottom:function(t,e){return"%"===t.unit?Math.floor(e.height-e.height*(t.value/100)):void 0},left:function(t,e){return"%"===t.unit?Math.floor(e.width*(t.value/100)):void 0}},l.computeImageArea=function(t,e,n){var r={width:t,height:e},o=Object.keys(n).reduce(function(t,e){var o=n[e],a=l._parseCSSDimensionValues(o),i=l._dimensionsConverters[e](a,r);return t[e]=i,t},{});return{sx:o.left,sy:o.top,sw:o.right-o.left,sh:o.bottom-o.top}},e["default"]=l,t.exports=e["default"]},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(7);e["default"]={create:function(t,e){function n(){o(t),a()}function o(t){c[t.id]=t,i.push(t)}function a(){var t,e=0;for(t=0;t<i.length;t++)e+=i[t].rad;u.rad=e/i.length,u.vec=r.vec2.clone([Math.cos(u.rad),Math.sin(u.rad)])}var i=[],u={rad:0,vec:r.vec2.clone([0,0])},c={};return n(),{add:function(t){c[t.id]||(o(t),a())},fits:function(t){var n=Math.abs(r.vec2.dot(t.point.vec,u.vec));return n>e?!0:!1},getPoints:function(){return i},getCenter:function(){return u}}},createPoint:function(t,e,n){return{rad:t[n],point:t,id:e}}},t.exports=e["default"]},function(t,e,n){e.glMatrix=n(8),e.mat2=n(9),e.mat2d=n(10),e.mat3=n(11),e.mat4=n(12),e.quat=n(13),e.vec2=n(16),e.vec3=n(14),e.vec4=n(15)},function(t,e){var n={};n.EPSILON=1e-6,n.ARRAY_TYPE="undefined"!=typeof Float32Array?Float32Array:Array,n.RANDOM=Math.random,n.setMatrixArrayType=function(t){GLMAT_ARRAY_TYPE=t};var r=Math.PI/180;n.toRadian=function(t){return t*r},t.exports=n},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(4);return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t},o.clone=function(t){var e=new r.ARRAY_TYPE(4);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},o.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t},o.transpose=function(t,e){if(t===e){var n=e[1];t[1]=e[2],t[2]=n}else t[0]=e[0],t[1]=e[2],t[2]=e[1],t[3]=e[3];return t},o.invert=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=n*a-o*r;return i?(i=1/i,t[0]=a*i,t[1]=-r*i,t[2]=-o*i,t[3]=n*i,t):null},o.adjoint=function(t,e){var n=e[0];return t[0]=e[3],t[1]=-e[1],t[2]=-e[2],t[3]=n,t},o.determinant=function(t){return t[0]*t[3]-t[2]*t[1]},o.multiply=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=n[0],c=n[1],l=n[2],f=n[3];return t[0]=r*u+a*c,t[1]=o*u+i*c,t[2]=r*l+a*f,t[3]=o*l+i*f,t},o.mul=o.multiply,o.rotate=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=Math.sin(n),c=Math.cos(n);return t[0]=r*c+a*u,t[1]=o*c+i*u,t[2]=r*-u+a*c,t[3]=o*-u+i*c,t},o.scale=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=n[0],c=n[1];return t[0]=r*u,t[1]=o*u,t[2]=a*c,t[3]=i*c,t},o.fromRotation=function(t,e){var n=Math.sin(e),r=Math.cos(e);return t[0]=r,t[1]=n,t[2]=-n,t[3]=r,t},o.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=e[1],t},o.str=function(t){return"mat2("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},o.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2))},o.LDU=function(t,e,n,r){return t[2]=r[2]/r[0],n[0]=r[0],n[1]=r[1],n[3]=r[3]-t[2]*n[1],[t,e,n]},t.exports=o},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(6);return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t},o.clone=function(t){var e=new r.ARRAY_TYPE(6);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t},o.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t},o.invert=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=e[4],u=e[5],c=n*a-r*o;return c?(c=1/c,t[0]=a*c,t[1]=-r*c,t[2]=-o*c,t[3]=n*c,t[4]=(o*u-a*i)*c,t[5]=(r*i-n*u)*c,t):null},o.determinant=function(t){return t[0]*t[3]-t[1]*t[2]},o.multiply=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=n[0],f=n[1],s=n[2],d=n[3],h=n[4],p=n[5];return t[0]=r*l+a*f,t[1]=o*l+i*f,t[2]=r*s+a*d,t[3]=o*s+i*d,t[4]=r*h+a*p+u,t[5]=o*h+i*p+c,t},o.mul=o.multiply,o.rotate=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=Math.sin(n),f=Math.cos(n);return t[0]=r*f+a*l,t[1]=o*f+i*l,t[2]=r*-l+a*f,t[3]=o*-l+i*f,t[4]=u,t[5]=c,t},o.scale=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=n[0],f=n[1];return t[0]=r*l,t[1]=o*l,t[2]=a*f,t[3]=i*f,t[4]=u,t[5]=c,t},o.translate=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=n[0],f=n[1];return t[0]=r,t[1]=o,t[2]=a,t[3]=i,t[4]=r*l+a*f+u,t[5]=o*l+i*f+c,t},o.fromRotation=function(t,e){var n=Math.sin(e),r=Math.cos(e);return t[0]=r,t[1]=n,t[2]=-n,t[3]=r,t[4]=0,t[5]=0,t},o.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=e[1],t[4]=0,t[5]=0,t},o.fromTranslation=function(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=e[0],t[5]=e[1],t},o.str=function(t){return"mat2d("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+")"},o.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2)+Math.pow(t[4],2)+Math.pow(t[5],2)+1)},t.exports=o},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(9);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},o.fromMat4=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[4],t[4]=e[5],t[5]=e[6],t[6]=e[8],t[7]=e[9],t[8]=e[10],t},o.clone=function(t){var e=new r.ARRAY_TYPE(9);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},o.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},o.transpose=function(t,e){if(t===e){var n=e[1],r=e[2],o=e[5];t[1]=e[3],t[2]=e[6],t[3]=n,t[5]=e[7],t[6]=r,t[7]=o}else t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8];return t},o.invert=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=e[4],u=e[5],c=e[6],l=e[7],f=e[8],s=f*i-u*l,d=-f*a+u*c,h=l*a-i*c,p=n*s+r*d+o*h;return p?(p=1/p,t[0]=s*p,t[1]=(-f*r+o*l)*p,t[2]=(u*r-o*i)*p,t[3]=d*p,t[4]=(f*n-o*c)*p,t[5]=(-u*n+o*a)*p,t[6]=h*p,t[7]=(-l*n+r*c)*p,t[8]=(i*n-r*a)*p,t):null},o.adjoint=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=e[4],u=e[5],c=e[6],l=e[7],f=e[8];return t[0]=i*f-u*l,t[1]=o*l-r*f,t[2]=r*u-o*i,t[3]=u*c-a*f,t[4]=n*f-o*c,t[5]=o*a-n*u,t[6]=a*l-i*c,t[7]=r*c-n*l,t[8]=n*i-r*a,t},o.determinant=function(t){var e=t[0],n=t[1],r=t[2],o=t[3],a=t[4],i=t[5],u=t[6],c=t[7],l=t[8];return e*(l*a-i*c)+n*(-l*o+i*u)+r*(c*o-a*u)},o.multiply=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=e[6],f=e[7],s=e[8],d=n[0],h=n[1],p=n[2],v=n[3],g=n[4],m=n[5],y=n[6],_=n[7],x=n[8];return t[0]=d*r+h*i+p*l,t[1]=d*o+h*u+p*f,t[2]=d*a+h*c+p*s,t[3]=v*r+g*i+m*l,t[4]=v*o+g*u+m*f,t[5]=v*a+g*c+m*s,t[6]=y*r+_*i+x*l,t[7]=y*o+_*u+x*f,t[8]=y*a+_*c+x*s,t},o.mul=o.multiply,o.translate=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=e[6],f=e[7],s=e[8],d=n[0],h=n[1];return t[0]=r,t[1]=o,t[2]=a,t[3]=i,t[4]=u,t[5]=c,t[6]=d*r+h*i+l,t[7]=d*o+h*u+f,t[8]=d*a+h*c+s,t},o.rotate=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=e[6],f=e[7],s=e[8],d=Math.sin(n),h=Math.cos(n);return t[0]=h*r+d*i,t[1]=h*o+d*u,t[2]=h*a+d*c,t[3]=h*i-d*r,t[4]=h*u-d*o,t[5]=h*c-d*a,t[6]=l,t[7]=f,t[8]=s,t},o.scale=function(t,e,n){var r=n[0],o=n[1];return t[0]=r*e[0],t[1]=r*e[1],t[2]=r*e[2],t[3]=o*e[3],t[4]=o*e[4],t[5]=o*e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},o.fromTranslation=function(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=e[0],t[7]=e[1],t[8]=1,t},o.fromRotation=function(t,e){var n=Math.sin(e),r=Math.cos(e);return t[0]=r,t[1]=n,t[2]=0,t[3]=-n,t[4]=r,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},o.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=0,t[4]=e[1],t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},o.fromMat2d=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=0,t[3]=e[2],t[4]=e[3],t[5]=0,t[6]=e[4],t[7]=e[5],t[8]=1,t},o.fromQuat=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=n+n,u=r+r,c=o+o,l=n*i,f=r*i,s=r*u,d=o*i,h=o*u,p=o*c,v=a*i,g=a*u,m=a*c;return t[0]=1-s-p,t[3]=f-m,t[6]=d+g,t[1]=f+m,t[4]=1-l-p,t[7]=h-v,t[2]=d-g,t[5]=h+v,t[8]=1-l-s,t},o.normalFromMat4=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=e[4],u=e[5],c=e[6],l=e[7],f=e[8],s=e[9],d=e[10],h=e[11],p=e[12],v=e[13],g=e[14],m=e[15],y=n*u-r*i,_=n*c-o*i,x=n*l-a*i,M=r*c-o*u,w=r*l-a*u,b=o*l-a*c,R=f*v-s*p,E=f*g-d*p,A=f*m-h*p,C=s*g-d*v,O=s*m-h*v,T=d*m-h*g,D=y*T-_*O+x*C+M*A-w*E+b*R;return D?(D=1/D,t[0]=(u*T-c*O+l*C)*D,t[1]=(c*A-i*T-l*E)*D,t[2]=(i*O-u*A+l*R)*D,t[3]=(o*O-r*T-a*C)*D,t[4]=(n*T-o*A+a*E)*D,t[5]=(r*A-n*O-a*R)*D,t[6]=(v*b-g*w+m*M)*D,t[7]=(g*x-p*b-m*_)*D,t[8]=(p*w-v*x+m*y)*D,t):null},o.str=function(t){return"mat3("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+")"},o.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2)+Math.pow(t[4],2)+Math.pow(t[5],2)+Math.pow(t[6],2)+Math.pow(t[7],2)+Math.pow(t[8],2))},t.exports=o},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(16);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.clone=function(t){var e=new r.ARRAY_TYPE(16);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},o.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.transpose=function(t,e){if(t===e){var n=e[1],r=e[2],o=e[3],a=e[6],i=e[7],u=e[11];t[1]=e[4],t[2]=e[8],t[3]=e[12],t[4]=n,t[6]=e[9],t[7]=e[13],t[8]=r,t[9]=a,t[11]=e[14],t[12]=o,t[13]=i,t[14]=u}else t[0]=e[0],t[1]=e[4],t[2]=e[8],t[3]=e[12],t[4]=e[1],t[5]=e[5],t[6]=e[9],t[7]=e[13],t[8]=e[2],t[9]=e[6],t[10]=e[10],t[11]=e[14],t[12]=e[3],t[13]=e[7],t[14]=e[11],t[15]=e[15];return t},o.invert=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=e[4],u=e[5],c=e[6],l=e[7],f=e[8],s=e[9],d=e[10],h=e[11],p=e[12],v=e[13],g=e[14],m=e[15],y=n*u-r*i,_=n*c-o*i,x=n*l-a*i,M=r*c-o*u,w=r*l-a*u,b=o*l-a*c,R=f*v-s*p,E=f*g-d*p,A=f*m-h*p,C=s*g-d*v,O=s*m-h*v,T=d*m-h*g,D=y*T-_*O+x*C+M*A-w*E+b*R;return D?(D=1/D,t[0]=(u*T-c*O+l*C)*D,t[1]=(o*O-r*T-a*C)*D,t[2]=(v*b-g*w+m*M)*D,t[3]=(d*w-s*b-h*M)*D,t[4]=(c*A-i*T-l*E)*D,t[5]=(n*T-o*A+a*E)*D,t[6]=(g*x-p*b-m*_)*D,t[7]=(f*b-d*x+h*_)*D,t[8]=(i*O-u*A+l*R)*D,t[9]=(r*A-n*O-a*R)*D,t[10]=(p*w-v*x+m*y)*D,t[11]=(s*x-f*w-h*y)*D,t[12]=(u*E-i*C-c*R)*D,t[13]=(n*C-r*E+o*R)*D,t[14]=(v*_-p*M-g*y)*D,t[15]=(f*M-s*_+d*y)*D,t):null},o.adjoint=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=e[4],u=e[5],c=e[6],l=e[7],f=e[8],s=e[9],d=e[10],h=e[11],p=e[12],v=e[13],g=e[14],m=e[15];return t[0]=u*(d*m-h*g)-s*(c*m-l*g)+v*(c*h-l*d),t[1]=-(r*(d*m-h*g)-s*(o*m-a*g)+v*(o*h-a*d)),t[2]=r*(c*m-l*g)-u*(o*m-a*g)+v*(o*l-a*c),t[3]=-(r*(c*h-l*d)-u*(o*h-a*d)+s*(o*l-a*c)),t[4]=-(i*(d*m-h*g)-f*(c*m-l*g)+p*(c*h-l*d)),t[5]=n*(d*m-h*g)-f*(o*m-a*g)+p*(o*h-a*d),t[6]=-(n*(c*m-l*g)-i*(o*m-a*g)+p*(o*l-a*c)),t[7]=n*(c*h-l*d)-i*(o*h-a*d)+f*(o*l-a*c),t[8]=i*(s*m-h*v)-f*(u*m-l*v)+p*(u*h-l*s),t[9]=-(n*(s*m-h*v)-f*(r*m-a*v)+p*(r*h-a*s)),t[10]=n*(u*m-l*v)-i*(r*m-a*v)+p*(r*l-a*u),t[11]=-(n*(u*h-l*s)-i*(r*h-a*s)+f*(r*l-a*u)),t[12]=-(i*(s*g-d*v)-f*(u*g-c*v)+p*(u*d-c*s)),t[13]=n*(s*g-d*v)-f*(r*g-o*v)+p*(r*d-o*s),t[14]=-(n*(u*g-c*v)-i*(r*g-o*v)+p*(r*c-o*u)),t[15]=n*(u*d-c*s)-i*(r*d-o*s)+f*(r*c-o*u),t},o.determinant=function(t){var e=t[0],n=t[1],r=t[2],o=t[3],a=t[4],i=t[5],u=t[6],c=t[7],l=t[8],f=t[9],s=t[10],d=t[11],h=t[12],p=t[13],v=t[14],g=t[15],m=e*i-n*a,y=e*u-r*a,_=e*c-o*a,x=n*u-r*i,M=n*c-o*i,w=r*c-o*u,b=l*p-f*h,R=l*v-s*h,E=l*g-d*h,A=f*v-s*p,C=f*g-d*p,O=s*g-d*v;return m*O-y*C+_*A+x*E-M*R+w*b},o.multiply=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=e[6],f=e[7],s=e[8],d=e[9],h=e[10],p=e[11],v=e[12],g=e[13],m=e[14],y=e[15],_=n[0],x=n[1],M=n[2],w=n[3];return t[0]=_*r+x*u+M*s+w*v,t[1]=_*o+x*c+M*d+w*g,t[2]=_*a+x*l+M*h+w*m,t[3]=_*i+x*f+M*p+w*y,_=n[4],x=n[5],M=n[6],w=n[7],t[4]=_*r+x*u+M*s+w*v,t[5]=_*o+x*c+M*d+w*g,t[6]=_*a+x*l+M*h+w*m,t[7]=_*i+x*f+M*p+w*y,_=n[8],x=n[9],M=n[10],w=n[11],t[8]=_*r+x*u+M*s+w*v,t[9]=_*o+x*c+M*d+w*g,t[10]=_*a+x*l+M*h+w*m,t[11]=_*i+x*f+M*p+w*y,_=n[12],x=n[13],M=n[14],w=n[15],t[12]=_*r+x*u+M*s+w*v,t[13]=_*o+x*c+M*d+w*g,t[14]=_*a+x*l+M*h+w*m,t[15]=_*i+x*f+M*p+w*y,t},o.mul=o.multiply,o.translate=function(t,e,n){var r,o,a,i,u,c,l,f,s,d,h,p,v=n[0],g=n[1],m=n[2];return e===t?(t[12]=e[0]*v+e[4]*g+e[8]*m+e[12],t[13]=e[1]*v+e[5]*g+e[9]*m+e[13],t[14]=e[2]*v+e[6]*g+e[10]*m+e[14],t[15]=e[3]*v+e[7]*g+e[11]*m+e[15]):(r=e[0],o=e[1],a=e[2],i=e[3],u=e[4],c=e[5],l=e[6],f=e[7],s=e[8],d=e[9],h=e[10],p=e[11],t[0]=r,t[1]=o,t[2]=a,t[3]=i,t[4]=u,t[5]=c,t[6]=l,t[7]=f,t[8]=s,t[9]=d,t[10]=h,t[11]=p,t[12]=r*v+u*g+s*m+e[12],t[13]=o*v+c*g+d*m+e[13],t[14]=a*v+l*g+h*m+e[14],t[15]=i*v+f*g+p*m+e[15]),t},o.scale=function(t,e,n){var r=n[0],o=n[1],a=n[2];return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t[3]=e[3]*r,t[4]=e[4]*o,t[5]=e[5]*o,t[6]=e[6]*o,t[7]=e[7]*o,t[8]=e[8]*a,t[9]=e[9]*a,t[10]=e[10]*a,
t[11]=e[11]*a,t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},o.rotate=function(t,e,n,o){var a,i,u,c,l,f,s,d,h,p,v,g,m,y,_,x,M,w,b,R,E,A,C,O,T=o[0],D=o[1],S=o[2],P=Math.sqrt(T*T+D*D+S*S);return Math.abs(P)<r.EPSILON?null:(P=1/P,T*=P,D*=P,S*=P,a=Math.sin(n),i=Math.cos(n),u=1-i,c=e[0],l=e[1],f=e[2],s=e[3],d=e[4],h=e[5],p=e[6],v=e[7],g=e[8],m=e[9],y=e[10],_=e[11],x=T*T*u+i,M=D*T*u+S*a,w=S*T*u-D*a,b=T*D*u-S*a,R=D*D*u+i,E=S*D*u+T*a,A=T*S*u+D*a,C=D*S*u-T*a,O=S*S*u+i,t[0]=c*x+d*M+g*w,t[1]=l*x+h*M+m*w,t[2]=f*x+p*M+y*w,t[3]=s*x+v*M+_*w,t[4]=c*b+d*R+g*E,t[5]=l*b+h*R+m*E,t[6]=f*b+p*R+y*E,t[7]=s*b+v*R+_*E,t[8]=c*A+d*C+g*O,t[9]=l*A+h*C+m*O,t[10]=f*A+p*C+y*O,t[11]=s*A+v*C+_*O,e!==t&&(t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t)},o.rotateX=function(t,e,n){var r=Math.sin(n),o=Math.cos(n),a=e[4],i=e[5],u=e[6],c=e[7],l=e[8],f=e[9],s=e[10],d=e[11];return e!==t&&(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[4]=a*o+l*r,t[5]=i*o+f*r,t[6]=u*o+s*r,t[7]=c*o+d*r,t[8]=l*o-a*r,t[9]=f*o-i*r,t[10]=s*o-u*r,t[11]=d*o-c*r,t},o.rotateY=function(t,e,n){var r=Math.sin(n),o=Math.cos(n),a=e[0],i=e[1],u=e[2],c=e[3],l=e[8],f=e[9],s=e[10],d=e[11];return e!==t&&(t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[0]=a*o-l*r,t[1]=i*o-f*r,t[2]=u*o-s*r,t[3]=c*o-d*r,t[8]=a*r+l*o,t[9]=i*r+f*o,t[10]=u*r+s*o,t[11]=c*r+d*o,t},o.rotateZ=function(t,e,n){var r=Math.sin(n),o=Math.cos(n),a=e[0],i=e[1],u=e[2],c=e[3],l=e[4],f=e[5],s=e[6],d=e[7];return e!==t&&(t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[0]=a*o+l*r,t[1]=i*o+f*r,t[2]=u*o+s*r,t[3]=c*o+d*r,t[4]=l*o-a*r,t[5]=f*o-i*r,t[6]=s*o-u*r,t[7]=d*o-c*r,t},o.fromTranslation=function(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=e[0],t[13]=e[1],t[14]=e[2],t[15]=1,t},o.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=e[1],t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=e[2],t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.fromRotation=function(t,e,n){var o,a,i,u=n[0],c=n[1],l=n[2],f=Math.sqrt(u*u+c*c+l*l);return Math.abs(f)<r.EPSILON?null:(f=1/f,u*=f,c*=f,l*=f,o=Math.sin(e),a=Math.cos(e),i=1-a,t[0]=u*u*i+a,t[1]=c*u*i+l*o,t[2]=l*u*i-c*o,t[3]=0,t[4]=u*c*i-l*o,t[5]=c*c*i+a,t[6]=l*c*i+u*o,t[7]=0,t[8]=u*l*i+c*o,t[9]=c*l*i-u*o,t[10]=l*l*i+a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t)},o.fromXRotation=function(t,e){var n=Math.sin(e),r=Math.cos(e);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=r,t[6]=n,t[7]=0,t[8]=0,t[9]=-n,t[10]=r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.fromYRotation=function(t,e){var n=Math.sin(e),r=Math.cos(e);return t[0]=r,t[1]=0,t[2]=-n,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=n,t[9]=0,t[10]=r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.fromZRotation=function(t,e){var n=Math.sin(e),r=Math.cos(e);return t[0]=r,t[1]=n,t[2]=0,t[3]=0,t[4]=-n,t[5]=r,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.fromRotationTranslation=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=r+r,c=o+o,l=a+a,f=r*u,s=r*c,d=r*l,h=o*c,p=o*l,v=a*l,g=i*u,m=i*c,y=i*l;return t[0]=1-(h+v),t[1]=s+y,t[2]=d-m,t[3]=0,t[4]=s-y,t[5]=1-(f+v),t[6]=p+g,t[7]=0,t[8]=d+m,t[9]=p-g,t[10]=1-(f+h),t[11]=0,t[12]=n[0],t[13]=n[1],t[14]=n[2],t[15]=1,t},o.fromRotationTranslationScale=function(t,e,n,r){var o=e[0],a=e[1],i=e[2],u=e[3],c=o+o,l=a+a,f=i+i,s=o*c,d=o*l,h=o*f,p=a*l,v=a*f,g=i*f,m=u*c,y=u*l,_=u*f,x=r[0],M=r[1],w=r[2];return t[0]=(1-(p+g))*x,t[1]=(d+_)*x,t[2]=(h-y)*x,t[3]=0,t[4]=(d-_)*M,t[5]=(1-(s+g))*M,t[6]=(v+m)*M,t[7]=0,t[8]=(h+y)*w,t[9]=(v-m)*w,t[10]=(1-(s+p))*w,t[11]=0,t[12]=n[0],t[13]=n[1],t[14]=n[2],t[15]=1,t},o.fromRotationTranslationScaleOrigin=function(t,e,n,r,o){var a=e[0],i=e[1],u=e[2],c=e[3],l=a+a,f=i+i,s=u+u,d=a*l,h=a*f,p=a*s,v=i*f,g=i*s,m=u*s,y=c*l,_=c*f,x=c*s,M=r[0],w=r[1],b=r[2],R=o[0],E=o[1],A=o[2];return t[0]=(1-(v+m))*M,t[1]=(h+x)*M,t[2]=(p-_)*M,t[3]=0,t[4]=(h-x)*w,t[5]=(1-(d+m))*w,t[6]=(g+y)*w,t[7]=0,t[8]=(p+_)*b,t[9]=(g-y)*b,t[10]=(1-(d+v))*b,t[11]=0,t[12]=n[0]+R-(t[0]*R+t[4]*E+t[8]*A),t[13]=n[1]+E-(t[1]*R+t[5]*E+t[9]*A),t[14]=n[2]+A-(t[2]*R+t[6]*E+t[10]*A),t[15]=1,t},o.fromQuat=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=n+n,u=r+r,c=o+o,l=n*i,f=r*i,s=r*u,d=o*i,h=o*u,p=o*c,v=a*i,g=a*u,m=a*c;return t[0]=1-s-p,t[1]=f+m,t[2]=d-g,t[3]=0,t[4]=f-m,t[5]=1-l-p,t[6]=h+v,t[7]=0,t[8]=d+g,t[9]=h-v,t[10]=1-l-s,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},o.frustum=function(t,e,n,r,o,a,i){var u=1/(n-e),c=1/(o-r),l=1/(a-i);return t[0]=2*a*u,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=2*a*c,t[6]=0,t[7]=0,t[8]=(n+e)*u,t[9]=(o+r)*c,t[10]=(i+a)*l,t[11]=-1,t[12]=0,t[13]=0,t[14]=i*a*2*l,t[15]=0,t},o.perspective=function(t,e,n,r,o){var a=1/Math.tan(e/2),i=1/(r-o);return t[0]=a/n,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=a,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=(o+r)*i,t[11]=-1,t[12]=0,t[13]=0,t[14]=2*o*r*i,t[15]=0,t},o.perspectiveFromFieldOfView=function(t,e,n,r){var o=Math.tan(e.upDegrees*Math.PI/180),a=Math.tan(e.downDegrees*Math.PI/180),i=Math.tan(e.leftDegrees*Math.PI/180),u=Math.tan(e.rightDegrees*Math.PI/180),c=2/(i+u),l=2/(o+a);return t[0]=c,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=l,t[6]=0,t[7]=0,t[8]=-((i-u)*c*.5),t[9]=(o-a)*l*.5,t[10]=r/(n-r),t[11]=-1,t[12]=0,t[13]=0,t[14]=r*n/(n-r),t[15]=0,t},o.ortho=function(t,e,n,r,o,a,i){var u=1/(e-n),c=1/(r-o),l=1/(a-i);return t[0]=-2*u,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*c,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*l,t[11]=0,t[12]=(e+n)*u,t[13]=(o+r)*c,t[14]=(i+a)*l,t[15]=1,t},o.lookAt=function(t,e,n,a){var i,u,c,l,f,s,d,h,p,v,g=e[0],m=e[1],y=e[2],_=a[0],x=a[1],M=a[2],w=n[0],b=n[1],R=n[2];return Math.abs(g-w)<r.EPSILON&&Math.abs(m-b)<r.EPSILON&&Math.abs(y-R)<r.EPSILON?o.identity(t):(d=g-w,h=m-b,p=y-R,v=1/Math.sqrt(d*d+h*h+p*p),d*=v,h*=v,p*=v,i=x*p-M*h,u=M*d-_*p,c=_*h-x*d,v=Math.sqrt(i*i+u*u+c*c),v?(v=1/v,i*=v,u*=v,c*=v):(i=0,u=0,c=0),l=h*c-p*u,f=p*i-d*c,s=d*u-h*i,v=Math.sqrt(l*l+f*f+s*s),v?(v=1/v,l*=v,f*=v,s*=v):(l=0,f=0,s=0),t[0]=i,t[1]=l,t[2]=d,t[3]=0,t[4]=u,t[5]=f,t[6]=h,t[7]=0,t[8]=c,t[9]=s,t[10]=p,t[11]=0,t[12]=-(i*g+u*m+c*y),t[13]=-(l*g+f*m+s*y),t[14]=-(d*g+h*m+p*y),t[15]=1,t)},o.str=function(t){return"mat4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+", "+t[9]+", "+t[10]+", "+t[11]+", "+t[12]+", "+t[13]+", "+t[14]+", "+t[15]+")"},o.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2)+Math.pow(t[4],2)+Math.pow(t[5],2)+Math.pow(t[6],2)+Math.pow(t[7],2)+Math.pow(t[8],2)+Math.pow(t[9],2)+Math.pow(t[10],2)+Math.pow(t[11],2)+Math.pow(t[12],2)+Math.pow(t[13],2)+Math.pow(t[14],2)+Math.pow(t[15],2))},t.exports=o},function(t,e,n){var r=n(8),o=n(11),a=n(14),i=n(15),u={};u.create=function(){var t=new r.ARRAY_TYPE(4);return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t},u.rotationTo=function(){var t=a.create(),e=a.fromValues(1,0,0),n=a.fromValues(0,1,0);return function(r,o,i){var c=a.dot(o,i);return-.999999>c?(a.cross(t,e,o),a.length(t)<1e-6&&a.cross(t,n,o),a.normalize(t,t),u.setAxisAngle(r,t,Math.PI),r):c>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(a.cross(t,o,i),r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=1+c,u.normalize(r,r))}}(),u.setAxes=function(){var t=o.create();return function(e,n,r,o){return t[0]=r[0],t[3]=r[1],t[6]=r[2],t[1]=o[0],t[4]=o[1],t[7]=o[2],t[2]=-n[0],t[5]=-n[1],t[8]=-n[2],u.normalize(e,u.fromMat3(e,t))}}(),u.clone=i.clone,u.fromValues=i.fromValues,u.copy=i.copy,u.set=i.set,u.identity=function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t},u.setAxisAngle=function(t,e,n){n=.5*n;var r=Math.sin(n);return t[0]=r*e[0],t[1]=r*e[1],t[2]=r*e[2],t[3]=Math.cos(n),t},u.add=i.add,u.multiply=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3],u=n[0],c=n[1],l=n[2],f=n[3];return t[0]=r*f+i*u+o*l-a*c,t[1]=o*f+i*c+a*u-r*l,t[2]=a*f+i*l+r*c-o*u,t[3]=i*f-r*u-o*c-a*l,t},u.mul=u.multiply,u.scale=i.scale,u.rotateX=function(t,e,n){n*=.5;var r=e[0],o=e[1],a=e[2],i=e[3],u=Math.sin(n),c=Math.cos(n);return t[0]=r*c+i*u,t[1]=o*c+a*u,t[2]=a*c-o*u,t[3]=i*c-r*u,t},u.rotateY=function(t,e,n){n*=.5;var r=e[0],o=e[1],a=e[2],i=e[3],u=Math.sin(n),c=Math.cos(n);return t[0]=r*c-a*u,t[1]=o*c+i*u,t[2]=a*c+r*u,t[3]=i*c-o*u,t},u.rotateZ=function(t,e,n){n*=.5;var r=e[0],o=e[1],a=e[2],i=e[3],u=Math.sin(n),c=Math.cos(n);return t[0]=r*c+o*u,t[1]=o*c-r*u,t[2]=a*c+i*u,t[3]=i*c-a*u,t},u.calculateW=function(t,e){var n=e[0],r=e[1],o=e[2];return t[0]=n,t[1]=r,t[2]=o,t[3]=Math.sqrt(Math.abs(1-n*n-r*r-o*o)),t},u.dot=i.dot,u.lerp=i.lerp,u.slerp=function(t,e,n,r){var o,a,i,u,c,l=e[0],f=e[1],s=e[2],d=e[3],h=n[0],p=n[1],v=n[2],g=n[3];return a=l*h+f*p+s*v+d*g,0>a&&(a=-a,h=-h,p=-p,v=-v,g=-g),1-a>1e-6?(o=Math.acos(a),i=Math.sin(o),u=Math.sin((1-r)*o)/i,c=Math.sin(r*o)/i):(u=1-r,c=r),t[0]=u*l+c*h,t[1]=u*f+c*p,t[2]=u*s+c*v,t[3]=u*d+c*g,t},u.sqlerp=function(){var t=u.create(),e=u.create();return function(n,r,o,a,i,c){return u.slerp(t,r,i,c),u.slerp(e,o,a,c),u.slerp(n,t,e,2*c*(1-c)),n}}(),u.invert=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=n*n+r*r+o*o+a*a,u=i?1/i:0;return t[0]=-n*u,t[1]=-r*u,t[2]=-o*u,t[3]=a*u,t},u.conjugate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t[3]=e[3],t},u.length=i.length,u.len=u.length,u.squaredLength=i.squaredLength,u.sqrLen=u.squaredLength,u.normalize=i.normalize,u.fromMat3=function(t,e){var n,r=e[0]+e[4]+e[8];if(r>0)n=Math.sqrt(r+1),t[3]=.5*n,n=.5/n,t[0]=(e[5]-e[7])*n,t[1]=(e[6]-e[2])*n,t[2]=(e[1]-e[3])*n;else{var o=0;e[4]>e[0]&&(o=1),e[8]>e[3*o+o]&&(o=2);var a=(o+1)%3,i=(o+2)%3;n=Math.sqrt(e[3*o+o]-e[3*a+a]-e[3*i+i]+1),t[o]=.5*n,n=.5/n,t[3]=(e[3*a+i]-e[3*i+a])*n,t[a]=(e[3*a+o]+e[3*o+a])*n,t[i]=(e[3*i+o]+e[3*o+i])*n}return t},u.str=function(t){return"quat("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},t.exports=u},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(3);return t[0]=0,t[1]=0,t[2]=0,t},o.clone=function(t){var e=new r.ARRAY_TYPE(3);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e},o.fromValues=function(t,e,n){var o=new r.ARRAY_TYPE(3);return o[0]=t,o[1]=e,o[2]=n,o},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},o.set=function(t,e,n,r){return t[0]=e,t[1]=n,t[2]=r,t},o.add=function(t,e,n){return t[0]=e[0]+n[0],t[1]=e[1]+n[1],t[2]=e[2]+n[2],t},o.subtract=function(t,e,n){return t[0]=e[0]-n[0],t[1]=e[1]-n[1],t[2]=e[2]-n[2],t},o.sub=o.subtract,o.multiply=function(t,e,n){return t[0]=e[0]*n[0],t[1]=e[1]*n[1],t[2]=e[2]*n[2],t},o.mul=o.multiply,o.divide=function(t,e,n){return t[0]=e[0]/n[0],t[1]=e[1]/n[1],t[2]=e[2]/n[2],t},o.div=o.divide,o.min=function(t,e,n){return t[0]=Math.min(e[0],n[0]),t[1]=Math.min(e[1],n[1]),t[2]=Math.min(e[2],n[2]),t},o.max=function(t,e,n){return t[0]=Math.max(e[0],n[0]),t[1]=Math.max(e[1],n[1]),t[2]=Math.max(e[2],n[2]),t},o.scale=function(t,e,n){return t[0]=e[0]*n,t[1]=e[1]*n,t[2]=e[2]*n,t},o.scaleAndAdd=function(t,e,n,r){return t[0]=e[0]+n[0]*r,t[1]=e[1]+n[1]*r,t[2]=e[2]+n[2]*r,t},o.distance=function(t,e){var n=e[0]-t[0],r=e[1]-t[1],o=e[2]-t[2];return Math.sqrt(n*n+r*r+o*o)},o.dist=o.distance,o.squaredDistance=function(t,e){var n=e[0]-t[0],r=e[1]-t[1],o=e[2]-t[2];return n*n+r*r+o*o},o.sqrDist=o.squaredDistance,o.length=function(t){var e=t[0],n=t[1],r=t[2];return Math.sqrt(e*e+n*n+r*r)},o.len=o.length,o.squaredLength=function(t){var e=t[0],n=t[1],r=t[2];return e*e+n*n+r*r},o.sqrLen=o.squaredLength,o.negate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t},o.inverse=function(t,e){return t[0]=1/e[0],t[1]=1/e[1],t[2]=1/e[2],t},o.normalize=function(t,e){var n=e[0],r=e[1],o=e[2],a=n*n+r*r+o*o;return a>0&&(a=1/Math.sqrt(a),t[0]=e[0]*a,t[1]=e[1]*a,t[2]=e[2]*a),t},o.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]},o.cross=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=n[0],u=n[1],c=n[2];return t[0]=o*c-a*u,t[1]=a*i-r*c,t[2]=r*u-o*i,t},o.lerp=function(t,e,n,r){var o=e[0],a=e[1],i=e[2];return t[0]=o+r*(n[0]-o),t[1]=a+r*(n[1]-a),t[2]=i+r*(n[2]-i),t},o.hermite=function(t,e,n,r,o,a){var i=a*a,u=i*(2*a-3)+1,c=i*(a-2)+a,l=i*(a-1),f=i*(3-2*a);return t[0]=e[0]*u+n[0]*c+r[0]*l+o[0]*f,t[1]=e[1]*u+n[1]*c+r[1]*l+o[1]*f,t[2]=e[2]*u+n[2]*c+r[2]*l+o[2]*f,t},o.bezier=function(t,e,n,r,o,a){var i=1-a,u=i*i,c=a*a,l=u*i,f=3*a*u,s=3*c*i,d=c*a;return t[0]=e[0]*l+n[0]*f+r[0]*s+o[0]*d,t[1]=e[1]*l+n[1]*f+r[1]*s+o[1]*d,t[2]=e[2]*l+n[2]*f+r[2]*s+o[2]*d,t},o.random=function(t,e){e=e||1;var n=2*r.RANDOM()*Math.PI,o=2*r.RANDOM()-1,a=Math.sqrt(1-o*o)*e;return t[0]=Math.cos(n)*a,t[1]=Math.sin(n)*a,t[2]=o*e,t},o.transformMat4=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=n[3]*r+n[7]*o+n[11]*a+n[15];return i=i||1,t[0]=(n[0]*r+n[4]*o+n[8]*a+n[12])/i,t[1]=(n[1]*r+n[5]*o+n[9]*a+n[13])/i,t[2]=(n[2]*r+n[6]*o+n[10]*a+n[14])/i,t},o.transformMat3=function(t,e,n){var r=e[0],o=e[1],a=e[2];return t[0]=r*n[0]+o*n[3]+a*n[6],t[1]=r*n[1]+o*n[4]+a*n[7],t[2]=r*n[2]+o*n[5]+a*n[8],t},o.transformQuat=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=n[0],u=n[1],c=n[2],l=n[3],f=l*r+u*a-c*o,s=l*o+c*r-i*a,d=l*a+i*o-u*r,h=-i*r-u*o-c*a;return t[0]=f*l+h*-i+s*-c-d*-u,t[1]=s*l+h*-u+d*-i-f*-c,t[2]=d*l+h*-c+f*-u-s*-i,t},o.rotateX=function(t,e,n,r){var o=[],a=[];return o[0]=e[0]-n[0],o[1]=e[1]-n[1],o[2]=e[2]-n[2],a[0]=o[0],a[1]=o[1]*Math.cos(r)-o[2]*Math.sin(r),a[2]=o[1]*Math.sin(r)+o[2]*Math.cos(r),t[0]=a[0]+n[0],t[1]=a[1]+n[1],t[2]=a[2]+n[2],t},o.rotateY=function(t,e,n,r){var o=[],a=[];return o[0]=e[0]-n[0],o[1]=e[1]-n[1],o[2]=e[2]-n[2],a[0]=o[2]*Math.sin(r)+o[0]*Math.cos(r),a[1]=o[1],a[2]=o[2]*Math.cos(r)-o[0]*Math.sin(r),t[0]=a[0]+n[0],t[1]=a[1]+n[1],t[2]=a[2]+n[2],t},o.rotateZ=function(t,e,n,r){var o=[],a=[];return o[0]=e[0]-n[0],o[1]=e[1]-n[1],o[2]=e[2]-n[2],a[0]=o[0]*Math.cos(r)-o[1]*Math.sin(r),a[1]=o[0]*Math.sin(r)+o[1]*Math.cos(r),a[2]=o[2],t[0]=a[0]+n[0],t[1]=a[1]+n[1],t[2]=a[2]+n[2],t},o.forEach=function(){var t=o.create();return function(e,n,r,o,a,i){var u,c;for(n||(n=3),r||(r=0),c=o?Math.min(o*n+r,e.length):e.length,u=r;c>u;u+=n)t[0]=e[u],t[1]=e[u+1],t[2]=e[u+2],a(t,t,i),e[u]=t[0],e[u+1]=t[1],e[u+2]=t[2];return e}}(),o.angle=function(t,e){var n=o.fromValues(t[0],t[1],t[2]),r=o.fromValues(e[0],e[1],e[2]);o.normalize(n,n),o.normalize(r,r);var a=o.dot(n,r);return a>1?0:Math.acos(a)},o.str=function(t){return"vec3("+t[0]+", "+t[1]+", "+t[2]+")"},t.exports=o},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(4);return t[0]=0,t[1]=0,t[2]=0,t[3]=0,t},o.clone=function(t){var e=new r.ARRAY_TYPE(4);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},o.fromValues=function(t,e,n,o){var a=new r.ARRAY_TYPE(4);return a[0]=t,a[1]=e,a[2]=n,a[3]=o,a},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},o.set=function(t,e,n,r,o){return t[0]=e,t[1]=n,t[2]=r,t[3]=o,t},o.add=function(t,e,n){return t[0]=e[0]+n[0],t[1]=e[1]+n[1],t[2]=e[2]+n[2],t[3]=e[3]+n[3],t},o.subtract=function(t,e,n){return t[0]=e[0]-n[0],t[1]=e[1]-n[1],t[2]=e[2]-n[2],t[3]=e[3]-n[3],t},o.sub=o.subtract,o.multiply=function(t,e,n){return t[0]=e[0]*n[0],t[1]=e[1]*n[1],t[2]=e[2]*n[2],t[3]=e[3]*n[3],t},o.mul=o.multiply,o.divide=function(t,e,n){return t[0]=e[0]/n[0],t[1]=e[1]/n[1],t[2]=e[2]/n[2],t[3]=e[3]/n[3],t},o.div=o.divide,o.min=function(t,e,n){return t[0]=Math.min(e[0],n[0]),t[1]=Math.min(e[1],n[1]),t[2]=Math.min(e[2],n[2]),t[3]=Math.min(e[3],n[3]),t},o.max=function(t,e,n){return t[0]=Math.max(e[0],n[0]),t[1]=Math.max(e[1],n[1]),t[2]=Math.max(e[2],n[2]),t[3]=Math.max(e[3],n[3]),t},o.scale=function(t,e,n){return t[0]=e[0]*n,t[1]=e[1]*n,t[2]=e[2]*n,t[3]=e[3]*n,t},o.scaleAndAdd=function(t,e,n,r){return t[0]=e[0]+n[0]*r,t[1]=e[1]+n[1]*r,t[2]=e[2]+n[2]*r,t[3]=e[3]+n[3]*r,t},o.distance=function(t,e){var n=e[0]-t[0],r=e[1]-t[1],o=e[2]-t[2],a=e[3]-t[3];return Math.sqrt(n*n+r*r+o*o+a*a)},o.dist=o.distance,o.squaredDistance=function(t,e){var n=e[0]-t[0],r=e[1]-t[1],o=e[2]-t[2],a=e[3]-t[3];return n*n+r*r+o*o+a*a},o.sqrDist=o.squaredDistance,o.length=function(t){var e=t[0],n=t[1],r=t[2],o=t[3];return Math.sqrt(e*e+n*n+r*r+o*o)},o.len=o.length,o.squaredLength=function(t){var e=t[0],n=t[1],r=t[2],o=t[3];return e*e+n*n+r*r+o*o},o.sqrLen=o.squaredLength,o.negate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t[3]=-e[3],t},o.inverse=function(t,e){return t[0]=1/e[0],t[1]=1/e[1],t[2]=1/e[2],t[3]=1/e[3],t},o.normalize=function(t,e){var n=e[0],r=e[1],o=e[2],a=e[3],i=n*n+r*r+o*o+a*a;return i>0&&(i=1/Math.sqrt(i),t[0]=n*i,t[1]=r*i,t[2]=o*i,t[3]=a*i),t},o.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]+t[3]*e[3]},o.lerp=function(t,e,n,r){var o=e[0],a=e[1],i=e[2],u=e[3];return t[0]=o+r*(n[0]-o),t[1]=a+r*(n[1]-a),t[2]=i+r*(n[2]-i),t[3]=u+r*(n[3]-u),t},o.random=function(t,e){return e=e||1,t[0]=r.RANDOM(),t[1]=r.RANDOM(),t[2]=r.RANDOM(),t[3]=r.RANDOM(),o.normalize(t,t),o.scale(t,t,e),t},o.transformMat4=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=e[3];return t[0]=n[0]*r+n[4]*o+n[8]*a+n[12]*i,t[1]=n[1]*r+n[5]*o+n[9]*a+n[13]*i,t[2]=n[2]*r+n[6]*o+n[10]*a+n[14]*i,t[3]=n[3]*r+n[7]*o+n[11]*a+n[15]*i,t},o.transformQuat=function(t,e,n){var r=e[0],o=e[1],a=e[2],i=n[0],u=n[1],c=n[2],l=n[3],f=l*r+u*a-c*o,s=l*o+c*r-i*a,d=l*a+i*o-u*r,h=-i*r-u*o-c*a;return t[0]=f*l+h*-i+s*-c-d*-u,t[1]=s*l+h*-u+d*-i-f*-c,t[2]=d*l+h*-c+f*-u-s*-i,t[3]=e[3],t},o.forEach=function(){var t=o.create();return function(e,n,r,o,a,i){var u,c;for(n||(n=4),r||(r=0),c=o?Math.min(o*n+r,e.length):e.length,u=r;c>u;u+=n)t[0]=e[u],t[1]=e[u+1],t[2]=e[u+2],t[3]=e[u+3],a(t,t,i),e[u]=t[0],e[u+1]=t[1],e[u+2]=t[2],e[u+3]=t[3];return e}}(),o.str=function(t){return"vec4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},t.exports=o},function(t,e,n){var r=n(8),o={};o.create=function(){var t=new r.ARRAY_TYPE(2);return t[0]=0,t[1]=0,t},o.clone=function(t){var e=new r.ARRAY_TYPE(2);return e[0]=t[0],e[1]=t[1],e},o.fromValues=function(t,e){var n=new r.ARRAY_TYPE(2);return n[0]=t,n[1]=e,n},o.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t},o.set=function(t,e,n){return t[0]=e,t[1]=n,t},o.add=function(t,e,n){return t[0]=e[0]+n[0],t[1]=e[1]+n[1],t},o.subtract=function(t,e,n){return t[0]=e[0]-n[0],t[1]=e[1]-n[1],t},o.sub=o.subtract,o.multiply=function(t,e,n){return t[0]=e[0]*n[0],t[1]=e[1]*n[1],t},o.mul=o.multiply,o.divide=function(t,e,n){return t[0]=e[0]/n[0],t[1]=e[1]/n[1],t},o.div=o.divide,o.min=function(t,e,n){return t[0]=Math.min(e[0],n[0]),t[1]=Math.min(e[1],n[1]),t},o.max=function(t,e,n){return t[0]=Math.max(e[0],n[0]),t[1]=Math.max(e[1],n[1]),t},o.scale=function(t,e,n){return t[0]=e[0]*n,t[1]=e[1]*n,t},o.scaleAndAdd=function(t,e,n,r){return t[0]=e[0]+n[0]*r,t[1]=e[1]+n[1]*r,t},o.distance=function(t,e){var n=e[0]-t[0],r=e[1]-t[1];return Math.sqrt(n*n+r*r)},o.dist=o.distance,o.squaredDistance=function(t,e){var n=e[0]-t[0],r=e[1]-t[1];return n*n+r*r},o.sqrDist=o.squaredDistance,o.length=function(t){var e=t[0],n=t[1];return Math.sqrt(e*e+n*n)},o.len=o.length,o.squaredLength=function(t){var e=t[0],n=t[1];return e*e+n*n},o.sqrLen=o.squaredLength,o.negate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t},o.inverse=function(t,e){return t[0]=1/e[0],t[1]=1/e[1],t},o.normalize=function(t,e){var n=e[0],r=e[1],o=n*n+r*r;return o>0&&(o=1/Math.sqrt(o),t[0]=e[0]*o,t[1]=e[1]*o),t},o.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]},o.cross=function(t,e,n){var r=e[0]*n[1]-e[1]*n[0];return t[0]=t[1]=0,t[2]=r,t},o.lerp=function(t,e,n,r){var o=e[0],a=e[1];return t[0]=o+r*(n[0]-o),t[1]=a+r*(n[1]-a),t},o.random=function(t,e){e=e||1;var n=2*r.RANDOM()*Math.PI;return t[0]=Math.cos(n)*e,t[1]=Math.sin(n)*e,t},o.transformMat2=function(t,e,n){var r=e[0],o=e[1];return t[0]=n[0]*r+n[2]*o,t[1]=n[1]*r+n[3]*o,t},o.transformMat2d=function(t,e,n){var r=e[0],o=e[1];return t[0]=n[0]*r+n[2]*o+n[4],t[1]=n[1]*r+n[3]*o+n[5],t},o.transformMat3=function(t,e,n){var r=e[0],o=e[1];return t[0]=n[0]*r+n[3]*o+n[6],t[1]=n[1]*r+n[4]*o+n[7],t},o.transformMat4=function(t,e,n){var r=e[0],o=e[1];return t[0]=n[0]*r+n[4]*o+n[12],t[1]=n[1]*r+n[5]*o+n[13],t},o.forEach=function(){var t=o.create();return function(e,n,r,o,a,i){var u,c;for(n||(n=2),r||(r=0),c=o?Math.min(o*n+r,e.length):e.length,u=r;c>u;u+=n)t[0]=e[u],t[1]=e[u+1],a(t,t,i),e[u]=t[0],e[u+1]=t[1];return e}}(),o.str=function(t){return"vec2("+t[0]+", "+t[1]+")"},t.exports=o},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]={init:function(t,e){for(var n=t.length;n--;)t[n]=e},shuffle:function(t){var e,n,r=t.length-1;for(r;r>=0;r--)e=Math.floor(Math.random()*r),n=t[r],t[r]=t[e],t[e]=n;return t},toPointList:function(t){var e,n,r=[],o=[];for(e=0;e<t.length;e++){for(r=[],n=0;n<t[e].length;n++)r[n]=t[e][n];o[e]="["+r.join(",")+"]"}return"["+o.join(",\r\n")+"]"},threshold:function(t,e,n){var r,o=[];for(r=0;r<t.length;r++)n.apply(t,[t[r]])>=e&&o.push(t[r]);return o},maxIndex:function(t){var e,n=0;for(e=0;e<t.length;e++)t[e]>t[n]&&(n=e);return n},max:function n(t){var e,n=0;for(e=0;e<t.length;e++)t[e]>n&&(n=t[e]);return n},sum:function r(t){for(var e=t.length,r=0;e--;)r+=t[e];return r}},t.exports=e["default"]},function(t,e,n){(function(r){"use strict";function o(t){return t&&t.__esModule?t:{"default":t}}function a(){var t;m=g.halfSample?new T["default"]({x:A.size.x/2|0,y:A.size.y/2|0}):A,E=S["default"].calculatePatchSize(g.patchSize,m.size),Y.x=m.size.x/E.x|0,Y.y=m.size.y/E.y|0,R=new T["default"](m.size,void 0,Uint8Array,!1),x=new T["default"](E,void 0,Array,!0),t=new ArrayBuffer(65536),_=new T["default"](E,new Uint8Array(t,0,E.x*E.y)),y=new T["default"](E,new Uint8Array(t,E.x*E.y*3,E.x*E.y),void 0,!0),C=(0,j["default"])("undefined"!=typeof window?window:"undefined"!=typeof self?self:r,{size:E.x},t),b=new T["default"]({x:m.size.x/_.size.x|0,y:m.size.y/_.size.y|0},void 0,Array,!0),M=new T["default"](b.size,void 0,void 0,!0),w=new T["default"](b.size,void 0,Int32Array,!0)}function i(){g.useWorker||"undefined"==typeof document||(G.dom.binary=document.createElement("canvas"),G.dom.binary.className="binaryBuffer",g.showCanvas===!0&&document.querySelector("#debug").appendChild(G.dom.binary),G.ctx.binary=G.dom.binary.getContext("2d"),G.dom.binary.width=R.size.x,G.dom.binary.height=R.size.y)}function u(t){var e,n,r,o,a,i,u,c=R.size.x,l=R.size.y,f=-R.size.x,s=-R.size.y;for(e=0,n=0;n<t.length;n++)o=t[n],e+=o.rad,g.showPatches&&W["default"].drawRect(o.pos,_.size,G.ctx.binary,{color:"red"});for(e/=t.length,e=(180*e/Math.PI+90)%180-90,0>e&&(e+=180),e=(180-e)*Math.PI/180,a=H.clone([Math.cos(e),Math.sin(e),-Math.sin(e),Math.cos(e)]),n=0;n<t.length;n++){for(o=t[n],r=0;4>r;r++)V.transformMat2(o.box[r],o.box[r],a);g.boxFromPatches.showTransformed&&W["default"].drawPath(o.box,{x:0,y:1},G.ctx.binary,{color:"#99ff00",lineWidth:2})}for(n=0;n<t.length;n++)for(o=t[n],r=0;4>r;r++)o.box[r][0]<c&&(c=o.box[r][0]),o.box[r][0]>f&&(f=o.box[r][0]),o.box[r][1]<l&&(l=o.box[r][1]),o.box[r][1]>s&&(s=o.box[r][1]);for(i=[[c,l],[f,l],[f,s],[c,s]],g.boxFromPatches.showTransformedBox&&W["default"].drawPath(i,{x:0,y:1},G.ctx.binary,{color:"#ff0000",lineWidth:2}),u=g.halfSample?2:1,a=H.invert(a,a),r=0;4>r;r++)V.transformMat2(i[r],i[r],a);for(g.boxFromPatches.showBB&&W["default"].drawPath(i,{x:0,y:1},G.ctx.binary,{color:"#ff0000",lineWidth:2}),r=0;4>r;r++)V.scale(i[r],i[r],u);return i}function c(){S["default"].otsuThreshold(m,R),R.zeroBorder(),g.showCanvas&&R.show(G.dom.binary,255)}function l(){var t,e,n,r,o,a,i,u,c=[];for(t=0;t<Y.x;t++)for(e=0;e<Y.y;e++)n=_.size.x*t,r=_.size.y*e,h(n,r),y.zeroBorder(),q["default"].init(x.data,0),a=z["default"].create(y,x),i=a.rasterize(0),g.showLabels&&x.overlay(G.dom.binary,Math.floor(360/i.count),{x:n,y:r}),o=x.moments(i.count),c=c.concat(p(o,[t,e],n,r));if(g.showFoundPatches)for(t=0;t<c.length;t++)u=c[t],W["default"].drawRect(u.pos,_.size,G.ctx.binary,{color:"#99ff00",lineWidth:2});return c}function f(t){var e,n,r=[],o=[];for(e=0;t>e;e++)r.push(0);for(n=w.data.length;n--;)w.data[n]>0&&r[w.data[n]-1]++;return r=r.map(function(t,e){return{val:t,label:e+1}}),r.sort(function(t,e){return e.val-t.val}),o=r.filter(function(t){return t.val>=5})}function s(t,e){var n,r,o,a,i,c=[],l=[],f=[0,1,1],s=[0,0,0];for(n=0;n<t.length;n++){for(o=w.data.length,c.length=0;o--;)w.data[o]===t[n].label&&(a=b.data[o],c.push(a));if(i=u(c),i&&(l.push(i),g.showRemainingPatchLabels))for(r=0;r<c.length;r++)a=c[r],f[0]=t[n].label/(e+1)*360,S["default"].hsv2rgb(f,s),W["default"].drawRect(a.pos,_.size,G.ctx.binary,{color:"rgb("+s.join(",")+")",lineWidth:2})}return l}function d(t){var e=S["default"].cluster(t,.9),n=S["default"].topGeneric(e,1,function(t){return t.getPoints().length}),r=[],o=[];if(1===n.length){r=n[0].item.getPoints();for(var a=0;a<r.length;a++)o.push(r[a].point)}return o}function h(t,e){R.subImageAsCopy(_,S["default"].imageRef(t,e)),C.skeletonize(),g.showSkeleton&&y.overlay(G.dom.binary,360,S["default"].imageRef(t,e))}function p(t,e,n,r){var o,a,i,u,c=[],l=[],f=Math.ceil(E.x/3);if(t.length>=2){for(o=0;o<t.length;o++)t[o].m00>f&&c.push(t[o]);if(c.length>=2){for(i=d(c),a=0,o=0;o<i.length;o++)a+=i[o].rad;i.length>1&&i.length>=c.length/4*3&&i.length>t.length/4&&(a/=i.length,u={index:e[1]*Y.x+e[0],pos:{x:n,y:r},box:[V.clone([n,r]),V.clone([n+_.size.x,r]),V.clone([n+_.size.x,r+_.size.y]),V.clone([n,r+_.size.y])],moments:i,rad:a,vec:V.clone([Math.cos(a),Math.sin(a)])},l.push(u))}}return l}function v(t){function e(){var t;for(t=0;t<w.data.length;t++)if(0===w.data[t]&&1===M.data[t])return t;return w.length}function n(t){var e,r,o,u,c,l,f={x:t%w.size.x,y:t/w.size.x|0};if(t<w.data.length)for(o=b.data[t],w.data[t]=a,c=0;c<N["default"].searchDirections.length;c++)r=f.y+N["default"].searchDirections[c][0],e=f.x+N["default"].searchDirections[c][1],u=r*w.size.x+e,0!==M.data[u]?0===w.data[u]&&(l=Math.abs(V.dot(b.data[u].vec,o.vec)),l>i&&n(u)):w.data[u]=Number.MAX_VALUE}var r,o,a=0,i=.95,u=0,c=[0,1,1],l=[0,0,0];for(q["default"].init(M.data,0),q["default"].init(w.data,0),q["default"].init(b.data,null),r=0;r<t.length;r++)o=t[r],b.data[o.index]=o,M.data[o.index]=1;for(M.zeroBorder();(u=e())<w.data.length;)a++,n(u);if(g.showPatchLabels)for(r=0;r<w.data.length;r++)w.data[r]>0&&w.data[r]<=a&&(o=b.data[r],c[0]=w.data[r]/(a+1)*360,S["default"].hsv2rgb(c,l),W["default"].drawRect(o.pos,_.size,G.ctx.binary,{color:"rgb("+l.join(",")+")",lineWidth:2}));return a}Object.defineProperty(e,"__esModule",{value:!0});var g,m,y,_,x,M,w,b,R,E,A,C,O=n(3),T=o(O),D=n(5),S=o(D),P=n(19),z=o(P),I=n(20),N=o(I),L=n(21),j=o(L),k=n(17),q=o(k),U=n(22),W=o(U),F=n(7),B=o(F),G={ctx:{binary:null},dom:{binary:null}},Y={x:0,y:0},V=B["default"].vec2,H=B["default"].mat2;e["default"]={init:function(t,e){g=e,A=t,a(),i()},locate:function(){var t,e,n;if(g.halfSample&&S["default"].halfSample(A,m),c(),t=l(),t.length<Y.x*Y.y*.05)return null;var r=v(t);return 1>r?null:(e=f(r),0===e.length?null:n=s(e,r))},checkImageConstraints:function(t,e){var n,r,o,a=t.getWidth(),i=t.getHeight(),u=e.halfSample?.5:1;if(t.getConfig().area&&(o=S["default"].computeImageArea(a,i,t.getConfig().area),t.setTopRight({x:o.sx,y:o.sy}),t.setCanvasSize({x:a,y:i}),a=o.sw,i=o.sh),r={x:Math.floor(a*u),y:Math.floor(i*u)},n=S["default"].calculatePatchSize(e.patchSize,r),console.log("Patch-Size: "+JSON.stringify(n)),t.setWidth(Math.floor(Math.floor(r.x/n.x)*(1/u)*n.x)),t.setHeight(Math.floor(Math.floor(r.y/n.y)*(1/u)*n.y)),t.getWidth()%n.x===0&&t.getHeight()%n.y===0)return!0;throw new Error("Image dimensions do not comply with the current settings: Width ("+a+" )and height ("+i+") must a multiple of "+n.x)}},t.exports=e["default"]}).call(e,function(){return this}())},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(20),a=r(o),i={createContour2D:function(){return{dir:null,index:null,firstVertex:null,insideContours:null,nextpeer:null,prevpeer:null}},CONTOUR_DIR:{CW_DIR:0,CCW_DIR:1,UNKNOWN_DIR:2},DIR:{OUTSIDE_EDGE:-32767,INSIDE_EDGE:-32766},create:function(t,e){var n=t.data,r=e.data,o=t.size.x,u=t.size.y,c=a["default"].create(t,e);return{rasterize:function(t){var e,a,l,f,s,d,h,p,v,g,m,y,_=[],x=0;for(y=0;400>y;y++)_[y]=0;for(_[0]=n[0],v=null,d=1;u-1>d;d++)for(f=0,a=_[0],s=1;o-1>s;s++)if(m=d*o+s,0===r[m])if(e=n[m],e!==a){if(0===f)l=x+1,_[l]=e,a=e,h=c.contourTracing(d,s,l,e,i.DIR.OUTSIDE_EDGE),null!==h&&(x++,f=l,p=i.createContour2D(),p.dir=i.CONTOUR_DIR.CW_DIR,p.index=f,p.firstVertex=h,p.nextpeer=v,p.insideContours=null,null!==v&&(v.prevpeer=p),v=p);else if(h=c.contourTracing(d,s,i.DIR.INSIDE_EDGE,e,f),null!==h){for(p=i.createContour2D(),p.firstVertex=h,p.insideContours=null,0===t?p.dir=i.CONTOUR_DIR.CCW_DIR:p.dir=i.CONTOUR_DIR.CW_DIR,p.index=t,g=v;null!==g&&g.index!==f;)g=g.nextpeer;null!==g&&(p.nextpeer=g.insideContours,null!==g.insideContours&&(g.insideContours.prevpeer=p),g.insideContours=p)}}else r[m]=f;else r[m]===i.DIR.OUTSIDE_EDGE||r[m]===i.DIR.INSIDE_EDGE?(f=0,a=r[m]===i.DIR.INSIDE_EDGE?n[m]:_[0]):(f=r[m],a=_[f]);for(g=v;null!==g;)g.index=t,g=g.nextpeer;return{cc:v,count:x}},debug:{drawContour:function(t,e){var n,r,o,a=t.getContext("2d"),u=e;for(a.strokeStyle="red",a.fillStyle="red",a.lineWidth=1,n=null!==u?u.insideContours:null;null!==u;){switch(null!==n?(r=n,n=n.nextpeer):(r=u,u=u.nextpeer,n=null!==u?u.insideContours:null),r.dir){case i.CONTOUR_DIR.CW_DIR:a.strokeStyle="red";break;case i.CONTOUR_DIR.CCW_DIR:a.strokeStyle="blue";break;case i.CONTOUR_DIR.UNKNOWN_DIR:a.strokeStyle="green"}o=r.firstVertex,a.beginPath(),a.moveTo(o.x,o.y);do o=o.next,a.lineTo(o.x,o.y);while(o!==r.firstVertex);a.stroke()}}}}}};e["default"]=i,t.exports=e["default"]},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n={searchDirections:[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]],create:function(t,e){function n(t,e,n,r){var o,f,s;for(o=0;7>o;o++){if(f=t.cy+c[t.dir][0],s=t.cx+c[t.dir][1],a=f*l+s,i[a]===e&&(0===u[a]||u[a]===n))return u[a]=n,t.cy=f,t.cx=s,!0;0===u[a]&&(u[a]=r),t.dir=(t.dir+1)%8}return!1}function r(t,e,n){return{dir:n,x:t,y:e,next:null,prev:null}}function o(t,e,o,a,i){var u,c,l,f=null,s={cx:e,cy:t,dir:0};if(n(s,a,o,i)){f=r(e,t,s.dir),u=f,l=s.dir,c=r(s.cx,s.cy,0),c.prev=u,u.next=c,c.next=null,u=c;do s.dir=(s.dir+6)%8,n(s,a,o,i),l!==s.dir?(u.dir=s.dir,c=r(s.cx,s.cy,0),c.prev=u,u.next=c,c.next=null,u=c):(u.dir=l,u.x=s.cx,u.y=s.cy),l=s.dir;while(s.cx!==e||s.cy!==t);f.prev=u.prev,u.prev.next=f}return f}var a,i=t.data,u=e.data,c=this.searchDirections,l=t.size.x;return{trace:function(t,e,r,o){return n(t,e,r,o)},contourTracing:function(t,e,n,r,a){return o(t,e,n,r,a)}}}};e["default"]=n,t.exports=e["default"]},function(module, exports) {"use strict";Object.defineProperty(exports, "__esModule", {value: true});function Skeletonizer(stdlib, foreign, buffer) {"use asm";var images=new stdlib.Uint8Array(buffer),size=foreign.size|0,imul=stdlib.Math.imul;function erode(inImagePtr, outImagePtr) {inImagePtr=inImagePtr|0;outImagePtr=outImagePtr|0;var v=0,u=0,sum=0,yStart1=0,yStart2=0,xStart1=0,xStart2=0,offset=0;for (v=1; (v|0)<(size - 1|0); v=v+1|0) {offset=offset+size|0;for (u=1; (u|0)<(size - 1|0); u=u+1|0) {yStart1=offset - size|0;yStart2=offset+size|0;xStart1=u - 1|0;xStart2=u+1|0;sum=(images[inImagePtr+yStart1+xStart1|0]|0)+(images[inImagePtr+yStart1+xStart2|0]|0)+(images[inImagePtr+offset+u|0]|0)+(images[inImagePtr+yStart2+xStart1|0]|0)+(images[inImagePtr+yStart2+xStart2|0]|0)|0;if ((sum|0) == (5|0)) {images[outImagePtr+offset+u|0]=1;} else {images[outImagePtr+offset+u|0]=0;}}}return;}function subtract(aImagePtr, bImagePtr, outImagePtr) {aImagePtr=aImagePtr|0;bImagePtr=bImagePtr|0;outImagePtr=outImagePtr|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[outImagePtr+length|0]=(images[aImagePtr+length|0]|0) - (images[bImagePtr+length|0]|0)|0;}}function bitwiseOr(aImagePtr, bImagePtr, outImagePtr) {aImagePtr=aImagePtr|0;bImagePtr=bImagePtr|0;outImagePtr=outImagePtr|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[outImagePtr+length|0]=images[aImagePtr+length|0]|0|(images[bImagePtr+length|0]|0)|0;}}function countNonZero(imagePtr) {imagePtr=imagePtr|0;var sum=0,length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;sum=(sum|0)+(images[imagePtr+length|0]|0)|0;}return sum|0;}function init(imagePtr, value) {imagePtr=imagePtr|0;value=value|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[imagePtr+length|0]=value;}}function dilate(inImagePtr, outImagePtr) {inImagePtr=inImagePtr|0;outImagePtr=outImagePtr|0;var v=0,u=0,sum=0,yStart1=0,yStart2=0,xStart1=0,xStart2=0,offset=0;for (v=1; (v|0)<(size - 1|0); v=v+1|0) {offset=offset+size|0;for (u=1; (u|0)<(size - 1|0); u=u+1|0) {yStart1=offset - size|0;yStart2=offset+size|0;xStart1=u - 1|0;xStart2=u+1|0;sum=(images[inImagePtr+yStart1+xStart1|0]|0)+(images[inImagePtr+yStart1+xStart2|0]|0)+(images[inImagePtr+offset+u|0]|0)+(images[inImagePtr+yStart2+xStart1|0]|0)+(images[inImagePtr+yStart2+xStart2|0]|0)|0;if ((sum|0)>(0|0)) {images[outImagePtr+offset+u|0]=1;} else {images[outImagePtr+offset+u|0]=0;}}}return;}function memcpy(srcImagePtr, dstImagePtr) {srcImagePtr=srcImagePtr|0;dstImagePtr=dstImagePtr|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[dstImagePtr+length|0]=images[srcImagePtr+length|0]|0;}}function zeroBorder(imagePtr) {imagePtr=imagePtr|0;var x=0,y=0;for (x=0; (x|0)<(size - 1|0); x=x+1|0) {images[imagePtr+x|0]=0;images[imagePtr+y|0]=0;y=y+size - 1|0;images[imagePtr+y|0]=0;y=y+1|0;}for (x=0; (x|0)<(size|0); x=x+1|0) {images[imagePtr+y|0]=0;y=y+1|0;}}function skeletonize() {var subImagePtr=0,erodedImagePtr=0,tempImagePtr=0,skelImagePtr=0,sum=0,done=0;erodedImagePtr=imul(size, size)|0;tempImagePtr=erodedImagePtr+erodedImagePtr|0;skelImagePtr=tempImagePtr+erodedImagePtr|0;init(skelImagePtr, 0);zeroBorder(subImagePtr);do {erode(subImagePtr, erodedImagePtr);dilate(erodedImagePtr, tempImagePtr);subtract(subImagePtr, tempImagePtr, tempImagePtr);bitwiseOr(skelImagePtr, tempImagePtr, skelImagePtr);memcpy(erodedImagePtr, subImagePtr);sum=countNonZero(subImagePtr)|0;done=(sum|0) == 0|0;} while (!done);}return {skeletonize: skeletonize};}exports["default"]=Skeletonizer;module.exports=exports["default"]; },function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]={drawRect:function(t,e,n,r){n.strokeStyle=r.color,n.fillStyle=r.color,n.lineWidth=1,n.beginPath(),n.strokeRect(t.x,t.y,e.x,e.y)},drawPath:function(t,e,n,r){n.strokeStyle=r.color,n.fillStyle=r.color,n.lineWidth=r.lineWidth,n.beginPath(),n.moveTo(t[0][e.x],t[0][e.y]);for(var o=1;o<t.length;o++)n.lineTo(t[o][e.x],t[o][e.y]);n.closePath(),n.stroke()},drawImage:function(t,e,n){var r,o=n.getImageData(0,0,e.x,e.y),a=o.data,i=t.length,u=a.length;if(u/i!==4)return!1;for(;i--;)r=t[i],a[--u]=255,a[--u]=r,a[--u]=r,a[--u]=r;return n.putImageData(o,0,0),!0}},t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(24),a=r(o),i=n(22),u=r(i),c=n(25),l=r(c),f=n(27),s=r(f),d=n(28),h=r(d),p=n(29),v=r(p),g=n(30),m=r(g),y=n(31),_=r(y),x=n(32),M=r(x),w=n(33),b=r(w),R=n(34),E=r(R),A={code_128_reader:l["default"],ean_reader:s["default"],ean_8_reader:M["default"],code_39_reader:h["default"],code_39_vin_reader:v["default"],codabar_reader:m["default"],upc_reader:_["default"],upc_e_reader:b["default"],i2of5_reader:E["default"]};e["default"]={create:function(t,e){function n(){if("undefined"!=typeof document){var t=document.querySelector("#debug.detection");h.dom.frequency=document.querySelector("canvas.frequency"),h.dom.frequency||(h.dom.frequency=document.createElement("canvas"),h.dom.frequency.className="frequency",t&&t.appendChild(h.dom.frequency)),h.ctx.frequency=h.dom.frequency.getContext("2d"),h.dom.pattern=document.querySelector("canvas.patternBuffer"),h.dom.pattern||(h.dom.pattern=document.createElement("canvas"),h.dom.pattern.className="patternBuffer",t&&t.appendChild(h.dom.pattern)),h.ctx.pattern=h.dom.pattern.getContext("2d"),h.dom.overlay=document.querySelector("canvas.drawingBuffer"),h.dom.overlay&&(h.ctx.overlay=h.dom.overlay.getContext("2d"))}}function r(){t.readers.forEach(function(t){var e,n={};"object"==typeof t?(e=t.format,n=t.config):"string"==typeof t&&(e=t),console.log("Before registering reader: ",e),p.push(new A[e](n))}),console.log("Registered Readers: "+p.map(function(t){return JSON.stringify({format:t.FORMAT,config:t.config})}).join(", "))}function o(){if("undefined"!=typeof document){var e,n=[{node:h.dom.frequency,prop:t.showFrequency},{node:h.dom.pattern,prop:t.showPattern}];for(e=0;e<n.length;e++)n[e].prop===!0?n[e].node.style.display="block":n[e].node.style.display="none"}}function i(t,n,r){function o(e){var r={y:e*Math.sin(n),x:e*Math.cos(n)};t[0].y-=r.y,t[0].x-=r.x,t[1].y+=r.y,t[1].x+=r.x}for(o(r);r>1&&(!e.inImageWithBorder(t[0],0)||!e.inImageWithBorder(t[1],0));)r-=Math.ceil(r/2),o(-r);return t}function c(t){return[{x:(t[1][0]-t[0][0])/2+t[0][0],y:(t[1][1]-t[0][1])/2+t[0][1]},{x:(t[3][0]-t[2][0])/2+t[2][0],y:(t[3][1]-t[2][1])/2+t[2][1]}]}function l(n){var r,o=null,i=a["default"].getBarcodeLine(e,n[0],n[1]);for(t.showFrequency&&(u["default"].drawPath(n,{x:"x",y:"y"},h.ctx.overlay,{color:"red",lineWidth:3}),a["default"].debug.printFrequency(i.line,h.dom.frequency)),a["default"].toBinaryLine(i),t.showPattern&&a["default"].debug.printPattern(i.line,h.dom.pattern),r=0;r<p.length&&null===o;r++)o=p[r].decodePattern(i.line);return null===o?null:{codeResult:o,barcodeLine:i}}function f(t,e,n){var r,o,a,i=Math.sqrt(Math.pow(t[1][0]-t[0][0],2)+Math.pow(t[1][1]-t[0][1],2)),u=16,c=null,f=Math.sin(n),s=Math.cos(n);for(r=1;u>r&&null===c;r++)o=i/u*r*(r%2===0?-1:1),a={y:o*f,x:o*s},e[0].y+=a.x,e[0].x-=a.y,e[1].y+=a.x,e[1].x-=a.y,c=l(e);return c}function s(t){return Math.sqrt(Math.pow(Math.abs(t[1].y-t[0].y),2)+Math.pow(Math.abs(t[1].x-t[0].x),2))}function d(e){var n,r,o,a,d=h.ctx.overlay;return t.drawBoundingBox&&d&&u["default"].drawPath(e,{x:0,y:1},d,{color:"blue",lineWidth:2}),n=c(e),a=s(n),r=Math.atan2(n[1].y-n[0].y,n[1].x-n[0].x),n=i(n,r,Math.floor(.1*a)),null===n?null:(o=l(n),null===o&&(o=f(e,n,r)),null===o?null:(o&&t.drawScanline&&d&&u["default"].drawPath(n,{x:"x",y:"y"},d,{color:"red",lineWidth:3}),{codeResult:o.codeResult,line:n,angle:r,pattern:o.barcodeLine.line,threshold:o.barcodeLine.threshold}))}var h={ctx:{frequency:null,pattern:null,overlay:null},dom:{frequency:null,pattern:null,overlay:null}},p=[];return n(),r(),o(),{decodeFromBoundingBox:function(t){return d(t)},decodeFromBoundingBoxes:function(t){var e,n;for(e=0;e<t.length;e++)if(n=d(t[e]),n&&n.codeResult)return n.box=t[e],n},setReaders:function(e){t.readers=e,p.length=0,r()}}}},t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),a=r(o),i=n(3),u=r(i),c={},l={DIR:{UP:1,DOWN:-1}};c.getBarcodeLine=function(t,e,n){function r(t,e){s=y[e*_+t],x+=s,M=M>s?s:M,w=s>w?s:w,m.push(s)}var o,a,i,u,c,l,f,s,d=0|e.x,h=0|e.y,p=0|n.x,v=0|n.y,g=Math.abs(v-h)>Math.abs(p-d),m=[],y=t.data,_=t.size.x,x=0,M=255,w=0;for(g&&(l=d,d=h,h=l,l=p,p=v,v=l),d>p&&(l=d,d=p,p=l,l=h,h=v,v=l),o=p-d,a=Math.abs(v-h),i=o/2|0,c=h,u=v>h?1:-1,f=d;p>f;f++)g?r(c,f):r(f,c),i-=a,0>i&&(c+=u,i+=o);return{line:m,min:M,max:w}},c.toOtsuBinaryLine=function(t){var e=t.line,n=new u["default"]({x:e.length-1,y:1},e),r=a["default"].determineOtsuThreshold(n,5);return e=a["default"].sharpenLine(e),a["default"].thresholdImage(n,r),{line:e,threshold:r}},c.toBinaryLine=function(t){var e,n,r,o,a,i,u=t.min,c=t.max,f=t.line,s=u+(c-u)/2,d=[],h=(c-u)/12,p=-h;for(r=f[0]>s?l.DIR.UP:l.DIR.DOWN,d.push({pos:0,val:f[0]}),a=0;a<f.length-2;a++)e=f[a+1]-f[a],n=f[a+2]-f[a+1],o=p>e+n&&f[a+1]<1.5*s?l.DIR.DOWN:e+n>h&&f[a+1]>.5*s?l.DIR.UP:r,r!==o&&(d.push({pos:a,val:f[a]}),r=o);for(d.push({pos:f.length,val:f[f.length-1]}),i=d[0].pos;i<d[1].pos;i++)f[i]=f[i]>s?0:1;for(a=1;a<d.length-1;a++)for(h=d[a+1].val>d[a].val?d[a].val+(d[a+1].val-d[a].val)/3*2|0:d[a+1].val+(d[a].val-d[a+1].val)/3|0,i=d[a].pos;i<d[a+1].pos;i++)f[i]=f[i]>h?0:1;return{line:f,threshold:h}},c.debug={printFrequency:function(t,e){var n,r=e.getContext("2d");for(e.width=t.length,e.height=256,r.beginPath(),r.strokeStyle="blue",n=0;n<t.length;n++)r.moveTo(n,255),r.lineTo(n,255-t[n]);r.stroke(),r.closePath()},printPattern:function(t,e){var n,r=e.getContext("2d");for(e.width=t.length,r.fillColor="black",n=0;n<t.length;n++)1===t[n]&&r.fillRect(n,0,1,100)}},e["default"]=c,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(26),i=r(a),u={CODE_SHIFT:{value:98},CODE_C:{value:99},CODE_B:{value:100},CODE_A:{value:101},START_CODE_A:{value:103},START_CODE_B:{value:104},START_CODE_C:{value:105},STOP_CODE:{value:106},MODULO:{value:11},CODE_PATTERN:{value:[[2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],[1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],[2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],[1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],[2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],[3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],[2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],[1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],[2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],[2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],[3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],[3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],[1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],[1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],[2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],[1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],[1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],[2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],[1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],[1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],[2,1,1,2,3,2],[2,3,3,1,1,1,2]]},SINGLE_CODE_ERROR:{value:1},AVG_CODE_ERROR:{value:.5},FORMAT:{value:"code_128",writeable:!1}};o.prototype=Object.create(i["default"].prototype,u),o.prototype.constructor=o,o.prototype._decodeCode=function(t){var e,n,r,o,a=[0,0,0,0,0,0],i=this,u=t,c=!i._row[u],l=0,f={error:Number.MAX_VALUE,code:-1,start:t,end:t};for(e=u;e<i._row.length;e++)if(i._row[e]^c)a[l]++;else{if(l===a.length-1){if(o=i._normalize(a)){for(n=0;n<i.CODE_PATTERN.length;n++)r=i._matchPattern(o,i.CODE_PATTERN[n]),r<f.error&&(f.code=n,f.error=r);return f.end=e,f}}else l++;a[l]=1,c=!c}return null},o.prototype._findStart=function(){var t,e,n,r,o,a,i=[0,0,0,0,0,0],u=this,c=u._nextSet(u._row),l=!1,f=0,s={error:Number.MAX_VALUE,code:-1,start:0,end:0};for(t=c;t<u._row.length;t++)if(u._row[t]^l)i[f]++;else{if(f===i.length-1){for(o=0,r=0;r<i.length;r++)o+=i[r];if(a=u._normalize(i)){for(e=u.START_CODE_A;e<=u.START_CODE_C;e++)n=u._matchPattern(a,u.CODE_PATTERN[e]),n<s.error&&(s.code=e,s.error=n);if(s.error<u.AVG_CODE_ERROR)return s.start=t-o,s.end=t,s}for(r=0;4>r;r++)i[r]=i[r+2];i[4]=0,i[5]=0,f--}else f++;i[f]=1,l=!l}return null},o.prototype._decode=function(){var t,e,n=this,r=n._findStart(),o=null,a=!1,i=[],u=0,c=0,l=[],f=[],s=!1,d=!0;if(null===r)return null;switch(o={code:r.code,start:r.start,end:r.end},f.push(o),c=o.code,o.code){case n.START_CODE_A:t=n.CODE_A;break;case n.START_CODE_B:t=n.CODE_B;break;case n.START_CODE_C:t=n.CODE_C;break;default:return null}for(;!a;){if(e=s,s=!1,o=n._decodeCode(o.end),null!==o)switch(o.code!==n.STOP_CODE&&(d=!0),o.code!==n.STOP_CODE&&(l.push(o.code),u++,c+=u*o.code),f.push(o),t){case n.CODE_A:if(o.code<64)i.push(String.fromCharCode(32+o.code));else if(o.code<96)i.push(String.fromCharCode(o.code-64));else switch(o.code!==n.STOP_CODE&&(d=!1),o.code){case n.CODE_SHIFT:s=!0,t=n.CODE_B;break;case n.CODE_B:t=n.CODE_B;break;case n.CODE_C:t=n.CODE_C;break;case n.STOP_CODE:a=!0}break;case n.CODE_B:if(o.code<96)i.push(String.fromCharCode(32+o.code));else switch(o.code!==n.STOP_CODE&&(d=!1),o.code){case n.CODE_SHIFT:s=!0,t=n.CODE_A;break;case n.CODE_A:t=n.CODE_A;break;case n.CODE_C:t=n.CODE_C;break;case n.STOP_CODE:a=!0}break;case n.CODE_C:if(o.code<100)i.push(o.code<10?"0"+o.code:o.code);else switch(o.code!==n.STOP_CODE&&(d=!1),o.code){case n.CODE_A:t=n.CODE_A;break;case n.CODE_B:t=n.CODE_B;break;case n.STOP_CODE:a=!0}}else a=!0;e&&(t=t===n.CODE_A?n.CODE_B:n.CODE_A)}return null===o?null:(o.end=n._nextUnset(n._row,o.end),n._verifyTrailingWhitespace(o)?(c-=u*l[l.length-1],c%103!==l[l.length-1]?null:i.length?(d&&i.splice(i.length-1,1),{code:i.join(""),start:r.start,end:o.end,codeset:t,startInfo:r,decodedCodes:f,endInfo:o}):null):null)},i["default"].prototype._verifyTrailingWhitespace=function(t){var e,n=this;return e=t.end+(t.end-t.start)/2,e<n._row.length&&n._matchRange(t.end,e,0)?t:null},e["default"]=o,t.exports=e["default"]},function(t,e){"use strict";function n(t){return this._row=[],this.config=t||{},this}Object.defineProperty(e,"__esModule",{value:!0}),n.prototype._nextUnset=function(t,e){var n;for(void 0===e&&(e=0),n=e;n<t.length;n++)if(!t[n])return n;return t.length},n.prototype._matchPattern=function(t,e){var n,r=0,o=0,a=this.MODULO,i=this.SINGLE_CODE_ERROR||1;for(n=0;n<t.length;n++){if(o=Math.abs(e[n]-t[n]),o>i)return Number.MAX_VALUE;r+=o}return r/a},n.prototype._nextSet=function(t,e){var n;for(e=e||0,n=e;n<t.length;n++)if(t[n])return n;return t.length},n.prototype._normalize=function(t,e){var n,r,o=this,a=0,i=0,u=[],c=0;for(e||(e=o.MODULO),n=0;n<t.length;n++)1===t[n]?i++:a+=t[n];if(r=a/(e-i),r>1)for(n=0;n<t.length;n++)c=1===t[n]?t[n]:t[n]/r,u.push(c);else for(r=(a+i)/e,n=0;n<t.length;n++)c=t[n]/r,u.push(c);return u},n.prototype._matchTrace=function(t,e){var n,r,o=[],a=this,i=a._nextSet(a._row),u=!a._row[i],c=0,l={error:Number.MAX_VALUE,code:-1,start:0};if(t){for(n=0;n<t.length;n++)o.push(0);for(n=i;n<a._row.length;n++)if(a._row[n]^u)o[c]++;else{if(c===o.length-1)return r=a._matchPattern(o,t),e>r?(l.start=n-i,l.end=n,l.counter=o,l):null;c++,o[c]=1,u=!u}}else for(o.push(0),n=i;n<a._row.length;n++)a._row[n]^u?o[c]++:(c++,o.push(0),o[c]=1,u=!u);return l.start=i,l.end=a._row.length-1,l.counter=o,l},n.prototype.decodePattern=function(t){var e,r=this;return r._row=t,e=r._decode(),null===e?(r._row.reverse(),e=r._decode(),e&&(e.direction=n.DIRECTION.REVERSE,e.start=r._row.length-e.start,e.end=r._row.length-e.end)):e.direction=n.DIRECTION.FORWARD,e&&(e.format=r.FORMAT),e},n.prototype._matchRange=function(t,e,n){var r;for(t=0>t?0:t,r=t;e>r;r++)if(this._row[r]!==n)return!1;return!0},n.prototype._fillCounters=function(t,e,n){var r,o=this,a=0,i=[];for(n="undefined"!=typeof n?n:!0,t="undefined"!=typeof t?t:o._nextUnset(o._row),e=e||o._row.length,i[a]=0,r=t;e>r;r++)o._row[r]^n?i[a]++:(a++,i[a]=1,n=!n);return i},Object.defineProperty(n.prototype,"FORMAT",{value:"unknown",writeable:!1}),n.DIRECTION={FORWARD:1,REVERSE:-1},n.Exception={StartNotFoundException:"Start-Info was not found!",CodeNotFoundException:"Code could not be found!",PatternNotFoundException:"Pattern could not be found!"},n.CONFIG_KEYS={},e["default"]=n,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(t){i["default"].call(this,t)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(26),i=r(a),u={CODE_L_START:{value:0},MODULO:{value:7},CODE_G_START:{value:10},START_PATTERN:{value:[1/3*7,1/3*7,1/3*7]},STOP_PATTERN:{value:[1/3*7,1/3*7,1/3*7]},MIDDLE_PATTERN:{value:[.2*7,.2*7,.2*7,.2*7,.2*7]},CODE_PATTERN:{value:[[3,2,1,1],[2,2,2,1],[2,1,2,2],[1,4,1,1],[1,1,3,2],[1,2,3,1],[1,1,1,4],[1,3,1,2],[1,2,1,3],[3,1,1,2],[1,1,2,3],[1,2,2,2],[2,2,1,2],[1,1,4,1],[2,3,1,1],[1,3,2,1],[4,1,1,1],[2,1,3,1],[3,1,2,1],[2,1,1,3]]},CODE_FREQUENCY:{value:[0,11,13,14,19,25,28,21,22,26]},SINGLE_CODE_ERROR:{value:.67},AVG_CODE_ERROR:{value:.27},FORMAT:{value:"ean_13",writeable:!1}};o.prototype=Object.create(i["default"].prototype,u),o.prototype.constructor=o,o.prototype._decodeCode=function(t,e){var n,r,o,a,i=[0,0,0,0],u=this,c=t,l=!u._row[c],f=0,s={error:Number.MAX_VALUE,code:-1,start:t,end:t};for(e||(e=u.CODE_PATTERN.length),n=c;n<u._row.length;n++)if(u._row[n]^l)i[f]++;else{if(f===i.length-1){if(a=u._normalize(i)){for(r=0;e>r;r++)o=u._matchPattern(a,u.CODE_PATTERN[r]),o<s.error&&(s.code=r,s.error=o);return s.end=n,s.error>u.AVG_CODE_ERROR?null:s}}else f++;i[f]=1,l=!l}return null},o.prototype._findPattern=function(t,e,n,r,o){var a,i,u,c,l,f=[],s=this,d=0,h={error:Number.MAX_VALUE,code:-1,start:0,end:0};for(e||(e=s._nextSet(s._row)),void 0===n&&(n=!1),void 0===r&&(r=!0),void 0===o&&(o=s.AVG_CODE_ERROR),a=0;a<t.length;a++)f[a]=0;for(a=e;a<s._row.length;a++)if(s._row[a]^n)f[d]++;else{if(d===f.length-1){for(c=0,u=0;u<f.length;u++)c+=f[u];if(l=s._normalize(f),l&&(i=s._matchPattern(l,t),o>i))return h.error=i,h.start=a-c,h.end=a,h;if(!r)return null;for(u=0;u<f.length-2;u++)f[u]=f[u+2];f[f.length-2]=0,f[f.length-1]=0,d--}else d++;f[d]=1,n=!n}return null},o.prototype._findStart=function(){for(var t,e,n=this,r=n._nextSet(n._row);!e;){if(e=n._findPattern(n.START_PATTERN,r),!e)return null;if(t=e.start-(e.end-e.start),t>=0&&n._matchRange(t,e.start,0))return e;r=e.end,e=null}},o.prototype._verifyTrailingWhitespace=function(t){var e,n=this;return e=t.end+(t.end-t.start),e<n._row.length&&n._matchRange(t.end,e,0)?t:null},o.prototype._findEnd=function(t,e){var n=this,r=n._findPattern(n.STOP_PATTERN,t,e,!1);return null!==r?n._verifyTrailingWhitespace(r):null},o.prototype._calculateFirstDigit=function(t){var e,n=this;for(e=0;e<n.CODE_FREQUENCY.length;e++)if(t===n.CODE_FREQUENCY[e])return e;return null},o.prototype._decodePayload=function(t,e,n){var r,o,a=this,i=0;for(r=0;6>r;r++){if(t=a._decodeCode(t.end),!t)return null;t.code>=a.CODE_G_START?(t.code=t.code-a.CODE_G_START,i|=1<<5-r):i|=0<<5-r,e.push(t.code),n.push(t)}if(o=a._calculateFirstDigit(i),null===o)return null;if(e.unshift(o),t=a._findPattern(a.MIDDLE_PATTERN,t.end,!0,!1),null===t)return null;for(n.push(t),r=0;6>r;r++){if(t=a._decodeCode(t.end,a.CODE_G_START),!t)return null;n.push(t),e.push(t.code)}return t},o.prototype._decode=function(){var t,e,n=this,r=[],o=[];return(t=n._findStart())?(e={code:t.code,start:t.start,end:t.end},o.push(e),(e=n._decodePayload(e,r,o))&&(e=n._findEnd(e.end,!1))?(o.push(e),n._checksum(r)?{code:r.join(""),start:t.start,end:e.end,codeset:"",startInfo:t,decodedCodes:o}:null):null):null},o.prototype._checksum=function(t){var e,n=0;for(e=t.length-2;e>=0;e-=2)n+=t[e];for(n*=3,e=t.length-1;e>=0;e-=2)n+=t[e];return n%10===0},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(26),i=r(a),u=n(17),c=r(u),l={ALPHABETH_STRING:{value:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%"},ALPHABET:{value:[48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,45,46,32,42,36,47,43,37]},CHARACTER_ENCODINGS:{value:[52,289,97,352,49,304,112,37,292,100,265,73,328,25,280,88,13,268,76,28,259,67,322,19,274,82,7,262,70,22,385,193,448,145,400,208,133,388,196,148,168,162,138,42]},ASTERISK:{value:148},FORMAT:{value:"code_39",writeable:!1}};o.prototype=Object.create(i["default"].prototype,l),o.prototype.constructor=o,o.prototype._toCounters=function(t,e){var n,r=this,o=e.length,a=r._row.length,i=!r._row[t],u=0;for(c["default"].init(e,0),n=t;a>n;n++)if(r._row[n]^i)e[u]++;else{if(u++,u===o)break;e[u]=1,i=!i}return e},o.prototype._decode=function(){var t,e,n,r,o=this,a=[0,0,0,0,0,0,0,0,0],i=[],u=o._findStart();if(!u)return null;r=o._nextSet(o._row,u.end);do{if(a=o._toCounters(r,a),n=o._toPattern(a),0>n)return null;if(t=o._patternToChar(n),0>t)return null;i.push(t),e=r,r+=c["default"].sum(a),r=o._nextSet(o._row,r)}while("*"!==t);return i.pop(),i.length&&o._verifyTrailingWhitespace(e,r,a)?{code:i.join(""),start:u.start,end:r,startInfo:u,decodedCodes:i}:null},o.prototype._verifyTrailingWhitespace=function(t,e,n){var r,o=c["default"].sum(n);return r=e-t-o,3*r>=o?!0:!1},o.prototype._patternToChar=function(t){var e,n=this;for(e=0;e<n.CHARACTER_ENCODINGS.length;e++)if(n.CHARACTER_ENCODINGS[e]===t)return String.fromCharCode(n.ALPHABET[e]);return-1},o.prototype._findNextWidth=function(t,e){var n,r=Number.MAX_VALUE;for(n=0;n<t.length;n++)t[n]<r&&t[n]>e&&(r=t[n]);return r},o.prototype._toPattern=function(t){for(var e,n,r=t.length,o=0,a=r,i=0,u=this;a>3;){for(o=u._findNextWidth(t,o),a=0,e=0,n=0;r>n;n++)t[n]>o&&(e|=1<<r-1-n,a++,i+=t[n]);if(3===a){for(n=0;r>n&&a>0;n++)if(t[n]>o&&(a--,2*t[n]>=i))return-1;return e}}return-1},o.prototype._findStart=function(){var t,e,n,r=this,o=r._nextSet(r._row),a=o,i=[0,0,0,0,0,0,0,0,0],u=0,c=!1;for(t=o;t<r._row.length;t++)if(r._row[t]^c)i[u]++;else{if(u===i.length-1){if(r._toPattern(i)===r.ASTERISK&&(n=Math.floor(Math.max(0,a-(t-a)/4)),r._matchRange(n,a,0)))return{start:a,end:t};for(a+=i[0]+i[1],e=0;7>e;e++)i[e]=i[e+2];i[7]=0,i[8]=0,u--}else u++;i[u]=1,c=!c}return null},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(28),i=r(a),u={IOQ:/[IOQ]/g,AZ09:/[A-Z0-9]{17}/};o.prototype=Object.create(i["default"].prototype),o.prototype.constructor=o,o.prototype._decode=function(){var t=i["default"].prototype._decode.apply(this);if(!t)return null;var e=t.code;return e?(e=e.replace(u.IOQ,""),e.match(u.AZ09)?this._checkChecksum(e)?(t.code=e,t):null:(console.log("Failed AZ09 pattern code:",e),null)):null},o.prototype._checkChecksum=function(t){return!!t},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this),this._counters=[]}Object.defineProperty(e,"__esModule",{value:!0});var a=n(26),i=r(a),u={ALPHABETH_STRING:{value:"0123456789-$:/.+ABCD"},ALPHABET:{value:[48,49,50,51,52,53,54,55,56,57,45,36,58,47,46,43,65,66,67,68]},CHARACTER_ENCODINGS:{value:[3,6,9,96,18,66,33,36,48,72,12,24,69,81,84,21,26,41,11,14]},START_END:{value:[26,41,11,14]},MIN_ENCODED_CHARS:{value:4},MAX_ACCEPTABLE:{value:2},PADDING:{value:1.5},FORMAT:{value:"codabar",writeable:!1}};o.prototype=Object.create(i["default"].prototype,u),o.prototype.constructor=o,o.prototype._decode=function(){var t,e,n,r,o,a=this,i=[];if(this._counters=a._fillCounters(),t=a._findStart(),!t)return null;r=t.startCounter;do{if(n=a._toPattern(r),0>n)return null;if(e=a._patternToChar(n),0>e)return null;if(i.push(e),r+=8,i.length>1&&a._isStartEnd(n))break}while(r<a._counters.length);return i.length-2<a.MIN_ENCODED_CHARS||!a._isStartEnd(n)?null:a._verifyWhitespace(t.startCounter,r-8)&&a._validateResult(i,t.startCounter)?(r=r>a._counters.length?a._counters.length:r,o=t.start+a._sumCounters(t.startCounter,r-8),{code:i.join(""),start:t.start,end:o,startInfo:t,decodedCodes:i}):null},o.prototype._verifyWhitespace=function(t,e){return(0>=t-1||this._counters[t-1]>=this._calculatePatternLength(t)/2)&&(e+8>=this._counters.length||this._counters[e+7]>=this._calculatePatternLength(e)/2)?!0:!1},o.prototype._calculatePatternLength=function(t){var e,n=0;for(e=t;t+7>e;e++)n+=this._counters[e];return n},o.prototype._thresholdResultPattern=function(t,e){var n,r,o,a,i,u=this,c={space:{narrow:{size:0,counts:0,min:0,max:Number.MAX_VALUE},wide:{size:0,counts:0,min:0,max:Number.MAX_VALUE}},bar:{narrow:{size:0,counts:0,min:0,max:Number.MAX_VALUE},wide:{size:0,counts:0,min:0,max:Number.MAX_VALUE}}},l=e;for(o=0;o<t.length;o++){for(i=u._charToPattern(t[o]),a=6;a>=0;a--)n=2===(1&a)?c.bar:c.space,r=1===(1&i)?n.wide:n.narrow,r.size+=u._counters[l+a],r.counts++,i>>=1;l+=8}return["space","bar"].forEach(function(t){var e=c[t];e.wide.min=Math.floor((e.narrow.size/e.narrow.counts+e.wide.size/e.wide.counts)/2),e.narrow.max=Math.ceil(e.wide.min),e.wide.max=Math.ceil((e.wide.size*u.MAX_ACCEPTABLE+u.PADDING)/e.wide.counts)}),c},o.prototype._charToPattern=function(t){var e,n=this,r=t.charCodeAt(0);for(e=0;e<n.ALPHABET.length;e++)if(n.ALPHABET[e]===r)return n.CHARACTER_ENCODINGS[e];return 0},o.prototype._validateResult=function(t,e){var n,r,o,a,i,u,c=this,l=c._thresholdResultPattern(t,e),f=e;for(n=0;n<t.length;n++){for(u=c._charToPattern(t[n]),r=6;r>=0;r--){if(o=0===(1&r)?l.bar:l.space,a=1===(1&u)?o.wide:o.narrow,i=c._counters[f+r],i<a.min||i>a.max)return!1;u>>=1}f+=8}return!0},o.prototype._patternToChar=function(t){var e,n=this;for(e=0;e<n.CHARACTER_ENCODINGS.length;e++)if(n.CHARACTER_ENCODINGS[e]===t)return String.fromCharCode(n.ALPHABET[e]);return-1},o.prototype._computeAlternatingThreshold=function(t,e){var n,r,o=Number.MAX_VALUE,a=0;for(n=t;e>n;n+=2)r=this._counters[n],r>a&&(a=r),o>r&&(o=r);return(o+a)/2|0},o.prototype._toPattern=function(t){var e,n,r,o,a=7,i=t+a,u=1<<a-1,c=0;if(i>this._counters.length)return-1;for(e=this._computeAlternatingThreshold(t,i),n=this._computeAlternatingThreshold(t+1,i),r=0;a>r;r++)o=0===(1&r)?e:n,this._counters[t+r]>o&&(c|=u),u>>=1;return c},o.prototype._isStartEnd=function(t){var e;for(e=0;e<this.START_END.length;e++)if(this.START_END[e]===t)return!0;return!1},o.prototype._sumCounters=function(t,e){var n,r=0;for(n=t;e>n;n++)r+=this._counters[n];return r},o.prototype._findStart=function(){var t,e,n,r=this,o=r._nextUnset(r._row);for(t=1;t<this._counters.length;t++)if(e=r._toPattern(t),-1!==e&&r._isStartEnd(e))return o+=r._sumCounters(0,t),n=o+r._sumCounters(t,t+8),{start:o,end:n,startCounter:t,endCounter:t+8}},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(27),i=r(a),u={FORMAT:{value:"upc_a",writeable:!1}};o.prototype=Object.create(i["default"].prototype,u),o.prototype.constructor=o,o.prototype._decode=function(){var t=i["default"].prototype._decode.call(this);return t&&t.code&&13===t.code.length&&"0"===t.code.charAt(0)?(t.code=t.code.substring(1),t):null},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(27),i=r(a),u={FORMAT:{value:"ean_8",writeable:!1}};o.prototype=Object.create(i["default"].prototype,u),o.prototype.constructor=o,o.prototype._decodePayload=function(t,e,n){var r,o=this;for(r=0;4>r;r++){if(t=o._decodeCode(t.end,o.CODE_G_START),!t)return null;e.push(t.code),n.push(t)}if(t=o._findPattern(o.MIDDLE_PATTERN,t.end,!0,!1),null===t)return null;for(n.push(t),r=0;4>r;r++){if(t=o._decodeCode(t.end,o.CODE_G_START),!t)return null;n.push(t),e.push(t.code)}return t},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(){i["default"].call(this)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(27),i=r(a),u={CODE_FREQUENCY:{value:[[56,52,50,49,44,38,35,42,41,37],[7,11,13,14,19,25,28,21,22,26]]},STOP_PATTERN:{value:[1/6*7,1/6*7,1/6*7,1/6*7,1/6*7,1/6*7]},FORMAT:{value:"upc_e",writeable:!1}};o.prototype=Object.create(i["default"].prototype,u),o.prototype.constructor=o,o.prototype._decodePayload=function(t,e,n){var r,o=this,a=0;for(r=0;6>r;r++){if(t=o._decodeCode(t.end),!t)return null;t.code>=o.CODE_G_START&&(t.code=t.code-o.CODE_G_START,a|=1<<5-r),e.push(t.code),n.push(t)}return o._determineParity(a,e)?t:null},o.prototype._determineParity=function(t,e){var n,r;for(r=0;r<this.CODE_FREQUENCY.length;r++)for(n=0;n<this.CODE_FREQUENCY[r].length;n++)if(t===this.CODE_FREQUENCY[r][n])return e.unshift(r),e.push(n),!0;return!1},o.prototype._convertToUPCA=function(t){var e=[t[0]],n=t[t.length-2];return e=2>=n?e.concat(t.slice(1,3)).concat([n,0,0,0,0]).concat(t.slice(3,6)):3===n?e.concat(t.slice(1,4)).concat([0,0,0,0,0]).concat(t.slice(4,6)):4===n?e.concat(t.slice(1,5)).concat([0,0,0,0,0,t[5]]):e.concat(t.slice(1,6)).concat([0,0,0,0,n]),e.push(t[t.length-1]),e},o.prototype._checksum=function(t){return i["default"].prototype._checksum.call(this,this._convertToUPCA(t))},o.prototype._findEnd=function(t,e){return e=!0,i["default"].prototype._findEnd.call(this,t,e)},o.prototype._verifyTrailingWhitespace=function(t){var e,n=this;return e=t.end+(t.end-t.start)/2,e<n._row.length&&n._matchRange(t.end,e,0)?t:void 0},e["default"]=o,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(t){t=c(a(),t),u["default"].call(this,t),this.barSpaceRatio=[1,1],t.normalizeBarSpaceWidth&&(this.SINGLE_CODE_ERROR=.38,this.AVG_CODE_ERROR=.09)}function a(){var t={};return Object.keys(o.CONFIG_KEYS).forEach(function(e){t[e]=o.CONFIG_KEYS[e]["default"]}),t}Object.defineProperty(e,"__esModule",{value:!0});var i=n(26),u=r(i),c=n(35),l=1,f=3,s={MODULO:{value:10},START_PATTERN:{value:[2.5*l,2.5*l,2.5*l,2.5*l]},STOP_PATTERN:{value:[2*l,2*l,2*f]},CODE_PATTERN:{value:[[l,l,f,f,l],[f,l,l,l,f],[l,f,l,l,f],[f,f,l,l,l],[l,l,f,l,f],[f,l,f,l,l],[l,f,f,l,l],[l,l,l,f,f],[f,l,l,f,l],[l,f,l,f,l]]},SINGLE_CODE_ERROR:{value:.78,writable:!0},AVG_CODE_ERROR:{value:.38,writable:!0},MAX_CORRECTION_FACTOR:{value:5},FORMAT:{value:"i2of5"}};o.prototype=Object.create(u["default"].prototype,s),o.prototype.constructor=o,o.prototype._matchPattern=function(t,e){if(this.config.normalizeBarSpaceWidth){var n,r=[0,0],o=[0,0],a=[0,0],i=this.MAX_CORRECTION_FACTOR,c=1/i;for(n=0;n<t.length;n++)r[n%2]+=t[n],o[n%2]+=e[n];for(a[0]=o[0]/r[0],a[1]=o[1]/r[1],a[0]=Math.max(Math.min(a[0],i),c),a[1]=Math.max(Math.min(a[1],i),c),this.barSpaceRatio=a,n=0;n<t.length;n++)t[n]*=this.barSpaceRatio[n%2]}return u["default"].prototype._matchPattern.call(this,t,e)},o.prototype._findPattern=function(t,e,n,r){var o,a,i,u,c,l=[],f=this,s=0,d={error:Number.MAX_VALUE,code:-1,start:0,end:0},h=f.AVG_CODE_ERROR;for(n=n||!1,r=r||!1,e||(e=f._nextSet(f._row)),o=0;o<t.length;o++)l[o]=0;for(o=e;o<f._row.length;o++)if(f._row[o]^n)l[s]++;else{if(s===l.length-1){for(u=0,i=0;i<l.length;i++)u+=l[i];if(c=f._normalize(l),c&&(a=f._matchPattern(c,t),h>a))return d.error=a,d.start=o-u,d.end=o,d;if(!r)return null;for(i=0;i<l.length-2;i++)l[i]=l[i+2];l[l.length-2]=0,l[l.length-1]=0,s--}else s++;l[s]=1,n=!n}return null},o.prototype._findStart=function(){for(var t,e,n=this,r=n._nextSet(n._row),o=1;!e;){if(e=n._findPattern(n.START_PATTERN,r,!1,!0),!e)return null;if(o=Math.floor((e.end-e.start)/4),t=e.start-10*o,t>=0&&n._matchRange(t,e.start,0))return e;r=e.end,e=null}},o.prototype._verifyTrailingWhitespace=function(t){var e,n=this;return e=t.end+(t.end-t.start)/2,e<n._row.length&&n._matchRange(t.end,e,0)?t:null},o.prototype._findEnd=function(){var t,e,n=this;return n._row.reverse(),t=n._findPattern(n.STOP_PATTERN),n._row.reverse(),null===t?null:(e=t.start,t.start=n._row.length-t.end,t.end=n._row.length-e,null!==t?n._verifyTrailingWhitespace(t):null)},o.prototype._decodePair=function(t){var e,n,r=[],o=this;for(e=0;e<t.length;e++){if(n=o._decodeCode(t[e]),!n)return null;r.push(n)}return r},o.prototype._decodeCode=function(t){var e,n,r,o,a=this,i=0,u=a.AVG_CODE_ERROR,c={error:Number.MAX_VALUE,code:-1,start:0,end:0};for(e=0;e<t.length;e++)i+=t[e];if(n=a._normalize(t)){for(o=0;o<a.CODE_PATTERN.length;o++)r=a._matchPattern(n,a.CODE_PATTERN[o]),r<c.error&&(c.code=o,c.error=r);if(c.error<u)return c}return null},o.prototype._decodePayload=function(t,e,n){for(var r,o,a=this,i=0,u=t.length,c=[[0,0,0,0,0],[0,0,0,0,0]];u>i;){for(r=0;5>r;r++)c[0][r]=t[i]*this.barSpaceRatio[0],c[1][r]=t[i+1]*this.barSpaceRatio[1],i+=2;if(o=a._decodePair(c),!o)return null;for(r=0;r<o.length;r++)e.push(o[r].code+""),n.push(o[r])}return o},o.prototype._verifyCounterLength=function(t){return t.length%10===0},o.prototype._decode=function(){var t,e,n,r,o=this,a=[],i=[];return(t=o._findStart())?(i.push(t),(e=o._findEnd())?(r=o._fillCounters(t.end,e.start,!1),o._verifyCounterLength(r)&&(n=o._decodePayload(r,a,i))?a.length%2!==0||a.length<6?null:(i.push(e),{code:a.join(""),start:t.start,end:e.end,startInfo:t,decodedCodes:i}):null):null):null},o.CONFIG_KEYS={normalizeBarSpaceWidth:{type:"boolean","default":!1,description:"If true, the reader tries to normalize thewidth-difference between bars and spaces"}},e["default"]=o,t.exports=e["default"]},function(t,e,n){var r=n(36),o=n(63),a=o(r);t.exports=a},function(t,e,n){function r(t,e,n,d,h){if(!c(t))return t;var p=u(e)&&(i(e)||f(e)),v=p?void 0:s(e);return o(v||e,function(o,i){if(v&&(i=o,o=e[i]),l(o))d||(d=[]),h||(h=[]),a(t,e,i,r,n,d,h);else{var u=t[i],c=n?n(u,o,i,t,e):void 0,f=void 0===c;f&&(c=o),void 0===c&&(!p||i in t)||!f&&(c===c?c===u:u!==u)||(t[i]=c)}}),t}var o=n(37),a=n(38),i=n(46),u=n(41),c=n(50),l=n(45),f=n(58),s=n(61);t.exports=r},function(t,e){function n(t,e){for(var n=-1,r=t.length;++n<r&&e(t[n],n,t)!==!1;);return t}t.exports=n},function(t,e,n){function r(t,e,n,r,s,d,h){for(var p=d.length,v=e[n];p--;)if(d[p]==v)return void(t[n]=h[p]);var g=t[n],m=s?s(g,v,n,t,e):void 0,y=void 0===m;y&&(m=v,u(v)&&(i(v)||l(v))?m=i(g)?g:u(g)?o(g):[]:c(v)||a(v)?m=a(g)?f(g):c(g)?g:{}:y=!1),d.push(v),h.push(m),y?t[n]=r(m,v,s,d,h):(m===m?m!==g:g===g)&&(t[n]=m)}var o=n(39),a=n(40),i=n(46),u=n(41),c=n(51),l=n(58),f=n(59);t.exports=r},function(t,e){function n(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}t.exports=n},function(t,e,n){function r(t){return a(t)&&o(t)&&u.call(t,"callee")&&!c.call(t,"callee")}var o=n(41),a=n(45),i=Object.prototype,u=i.hasOwnProperty,c=i.propertyIsEnumerable;t.exports=r},function(t,e,n){function r(t){return null!=t&&a(o(t))}var o=n(42),a=n(44);t.exports=r},function(t,e,n){var r=n(43),o=r("length");t.exports=o},function(t,e){function n(t){return function(e){return null==e?void 0:e[t];
}}t.exports=n},function(t,e){function n(t){return"number"==typeof t&&t>-1&&t%1==0&&r>=t}var r=9007199254740991;t.exports=n},function(t,e){function n(t){return!!t&&"object"==typeof t}t.exports=n},function(t,e,n){var r=n(47),o=n(44),a=n(45),i="[object Array]",u=Object.prototype,c=u.toString,l=r(Array,"isArray"),f=l||function(t){return a(t)&&o(t.length)&&c.call(t)==i};t.exports=f},function(t,e,n){function r(t,e){var n=null==t?void 0:t[e];return o(n)?n:void 0}var o=n(48);t.exports=r},function(t,e,n){function r(t){return null==t?!1:o(t)?f.test(c.call(t)):a(t)&&i.test(t)}var o=n(49),a=n(45),i=/^\[object .+?Constructor\]$/,u=Object.prototype,c=Function.prototype.toString,l=u.hasOwnProperty,f=RegExp("^"+c.call(l).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");t.exports=r},function(t,e,n){function r(t){return o(t)&&u.call(t)==a}var o=n(50),a="[object Function]",i=Object.prototype,u=i.toString;t.exports=r},function(t,e){function n(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}t.exports=n},function(t,e,n){function r(t){var e;if(!i(t)||f.call(t)!=u||a(t)||!l.call(t,"constructor")&&(e=t.constructor,"function"==typeof e&&!(e instanceof e)))return!1;var n;return o(t,function(t,e){n=e}),void 0===n||l.call(t,n)}var o=n(52),a=n(40),i=n(45),u="[object Object]",c=Object.prototype,l=c.hasOwnProperty,f=c.toString;t.exports=r},function(t,e,n){function r(t,e){return o(t,e,a)}var o=n(53),a=n(56);t.exports=r},function(t,e,n){var r=n(54),o=r();t.exports=o},function(t,e,n){function r(t){return function(e,n,r){for(var a=o(e),i=r(e),u=i.length,c=t?u:-1;t?c--:++c<u;){var l=i[c];if(n(a[l],l,a)===!1)break}return e}}var o=n(55);t.exports=r},function(t,e,n){function r(t){return o(t)?t:Object(t)}var o=n(50);t.exports=r},function(t,e,n){function r(t){if(null==t)return[];c(t)||(t=Object(t));var e=t.length;e=e&&u(e)&&(a(t)||o(t))&&e||0;for(var n=t.constructor,r=-1,l="function"==typeof n&&n.prototype===t,s=Array(e),d=e>0;++r<e;)s[r]=r+"";for(var h in t)d&&i(h,e)||"constructor"==h&&(l||!f.call(t,h))||s.push(h);return s}var o=n(40),a=n(46),i=n(57),u=n(44),c=n(50),l=Object.prototype,f=l.hasOwnProperty;t.exports=r},function(t,e){function n(t,e){return t="number"==typeof t||r.test(t)?+t:-1,e=null==e?o:e,t>-1&&t%1==0&&e>t}var r=/^\d+$/,o=9007199254740991;t.exports=n},function(t,e,n){function r(t){return a(t)&&o(t.length)&&!!T[S.call(t)]}var o=n(44),a=n(45),i="[object Arguments]",u="[object Array]",c="[object Boolean]",l="[object Date]",f="[object Error]",s="[object Function]",d="[object Map]",h="[object Number]",p="[object Object]",v="[object RegExp]",g="[object Set]",m="[object String]",y="[object WeakMap]",_="[object ArrayBuffer]",x="[object Float32Array]",M="[object Float64Array]",w="[object Int8Array]",b="[object Int16Array]",R="[object Int32Array]",E="[object Uint8Array]",A="[object Uint8ClampedArray]",C="[object Uint16Array]",O="[object Uint32Array]",T={};T[x]=T[M]=T[w]=T[b]=T[R]=T[E]=T[A]=T[C]=T[O]=!0,T[i]=T[u]=T[_]=T[c]=T[l]=T[f]=T[s]=T[d]=T[h]=T[p]=T[v]=T[g]=T[m]=T[y]=!1;var D=Object.prototype,S=D.toString;t.exports=r},function(t,e,n){function r(t){return o(t,a(t))}var o=n(60),a=n(56);t.exports=r},function(t,e){function n(t,e,n){n||(n={});for(var r=-1,o=e.length;++r<o;){var a=e[r];n[a]=t[a]}return n}t.exports=n},function(t,e,n){var r=n(47),o=n(41),a=n(50),i=n(62),u=r(Object,"keys"),c=u?function(t){var e=null==t?void 0:t.constructor;return"function"==typeof e&&e.prototype===t||"function"!=typeof t&&o(t)?i(t):a(t)?u(t):[]}:i;t.exports=c},function(t,e,n){function r(t){for(var e=c(t),n=e.length,r=n&&t.length,l=!!r&&u(r)&&(a(t)||o(t)),s=-1,d=[];++s<n;){var h=e[s];(l&&i(h,r)||f.call(t,h))&&d.push(h)}return d}var o=n(40),a=n(46),i=n(57),u=n(44),c=n(56),l=Object.prototype,f=l.hasOwnProperty;t.exports=r},function(t,e,n){function r(t){return i(function(e,n){var r=-1,i=null==e?0:n.length,u=i>2?n[i-2]:void 0,c=i>2?n[2]:void 0,l=i>1?n[i-1]:void 0;for("function"==typeof u?(u=o(u,l,5),i-=2):(u="function"==typeof l?l:void 0,i-=u?1:0),c&&a(n[0],n[1],c)&&(u=3>i?void 0:u,i=1);++r<i;){var f=n[r];f&&t(e,f,u)}return e})}var o=n(64),a=n(66),i=n(67);t.exports=r},function(t,e,n){function r(t,e,n){if("function"!=typeof t)return o;if(void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 3:return function(n,r,o){return t.call(e,n,r,o)};case 4:return function(n,r,o,a){return t.call(e,n,r,o,a)};case 5:return function(n,r,o,a,i){return t.call(e,n,r,o,a,i)}}return function(){return t.apply(e,arguments)}}var o=n(65);t.exports=r},function(t,e){function n(t){return t}t.exports=n},function(t,e,n){function r(t,e,n){if(!i(n))return!1;var r=typeof e;if("number"==r?o(n)&&a(e,n.length):"string"==r&&e in n){var u=n[e];return t===t?t===u:u!==u}return!1}var o=n(41),a=n(57),i=n(50);t.exports=r},function(t,e){function n(t,e){if("function"!=typeof t)throw new TypeError(r);return e=o(void 0===e?t.length-1:+e||0,0),function(){for(var n=arguments,r=-1,a=o(n.length-e,0),i=Array(a);++r<a;)i[r]=n[e+r];switch(e){case 0:return t.call(this,i);case 1:return t.call(this,n[0],i);case 2:return t.call(this,n[0],n[1],i)}var u=Array(e+1);for(r=-1;++r<e;)u[r]=n[r];return u[e]=i,t.apply(this,u)}}var r="Expected a function",o=Math.max;t.exports=n},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]={inputStream:{name:"Live",type:"LiveStream",constraints:{width:640,height:480,minAspectRatio:0,maxAspectRatio:100,facing:"environment"},area:{top:"0%",right:"0%",left:"0%",bottom:"0%"},singleChannel:!1},tracking:!1,debug:!1,controls:!1,locate:!0,numOfWorkers:4,visual:{show:!0},decoder:{drawBoundingBox:!1,showFrequency:!1,drawScanline:!1,showPattern:!1,readers:["code_128_reader"]},locator:{halfSample:!0,patchSize:"medium",showCanvas:!1,showPatches:!1,showFoundPatches:!1,showSkeleton:!1,showLabels:!1,showPatchLabels:!1,showRemainingPatchLabels:!1,boxFromPatches:{showTransformed:!1,showTransformedBox:!1,showBB:!1}}},t.exports=e["default"]},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=function(){function t(t){return o[t]||(o[t]={subscribers:[]}),o[t]}function e(){o={}}function n(t,e){t.async?setTimeout(function(){t.callback(e)},4):t.callback(e)}function r(e,n,r){var o;if("function"==typeof n)o={callback:n,async:r};else if(o=n,!o.callback)throw"Callback was not specified on options";t(e).subscribers.push(o)}var o={};return{subscribe:function(t,e,n){return r(t,e,n)},publish:function(e,r){var o=t(e),a=o.subscribers;o.subscribers=a.filter(function(t){return n(t,r),!t.once})},once:function(t,e,n){r(t,{callback:e,async:n,once:!0})},unsubscribe:function(n,r){var o;n?(o=t(n),o&&r?o.subscribers=o.subscribers.filter(function(t){return t.callback!==r}):o.subscribers=[]):e()}}}(),t.exports=e["default"]},function(t,e,n){"use strict";function r(t,e,n){"undefined"!=typeof navigator.getUserMedia?navigator.getUserMedia(t,function(t){c=t;var n=window.URL&&window.URL.createObjectURL(t)||t;e.apply(null,[n])},n):n(new TypeError("getUserMedia not available"))}function o(t,e){function n(){r>0?t.videoWidth>0&&t.videoHeight>0?(console.log(t.videoWidth+"px x "+t.videoHeight+"px"),e()):window.setTimeout(n,500):e("Unable to play video stream. Is webcam working?"),r--}var r=10;n()}function a(t,e,n){r(t,function(t){e.src=t,l&&e.removeEventListener("loadeddata",l,!1),l=o.bind(null,e,n),e.addEventListener("loadeddata",l,!1),e.play()},function(t){n(t)})}function i(t,e){var n={audio:!1,video:!0},r=f({width:640,height:480,minAspectRatio:0,maxAspectRatio:100,facing:"environment"},t);return"undefined"==typeof MediaStreamTrack||"undefined"==typeof MediaStreamTrack.getSources?(n.video={mediaSource:"camera",width:{min:r.width,max:r.width},height:{min:r.height,max:r.height},require:["width","height"]},e(n)):void MediaStreamTrack.getSources(function(t){for(var o,a=0;a<t.length;++a){var i=t[a];"video"===i.kind&&i.facing===r.facing&&(o=i.id)}return n.video={mandatory:{minWidth:r.width,minHeight:r.height,minAspectRatio:r.minAspectRatio,maxAspectRatio:r.maxAspectRatio},optional:[{sourceId:o}]},e(n)})}function u(t,e,n){i(e,function(e){a(e,t,n)})}Object.defineProperty(e,"__esModule",{value:!0});var c,l,f=n(35);e["default"]={request:function(t,e,n){u(t,e,n)},release:function(){var t=c&&c.getVideoTracks();t.length&&t[0].stop(),c=null}},t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(t,e){return e?e.some(function(e){return Object.keys(e).every(function(n){return e[n]===t[n]})}):!1}function a(t,e){return"function"==typeof e?e(t):!0}Object.defineProperty(e,"__esModule",{value:!0});var i=n(22),u=r(i);e["default"]={create:function(t){function e(e){return c&&e&&!o(e,t.blacklist)&&a(e,t.filter)}var n=document.createElement("canvas"),r=n.getContext("2d"),i=[],c=t.capacity||20,l=t.capture===!0;return{addResult:function(t,o,a){var f={};e(a)&&(c--,f.codeResult=a,l&&(n.width=o.x,n.height=o.y,u["default"].drawImage(t,o,r),f.frame=n.toDataURL()),i.push(f))},getResults:function(){return i}}}},t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(73),a=r(o),i={};i.createVideoStream=function(t){function e(){var e=t.videoWidth,o=t.videoHeight;n=a.size?e/o>1?a.size:Math.floor(e/o*a.size):e,r=a.size?e/o>1?Math.floor(o/e*a.size):a.size:o,l.x=n,l.y=r}var n,r,o={},a=null,i=["canrecord","ended"],u={},c={x:0,y:0},l={x:0,y:0};return o.getRealWidth=function(){return t.videoWidth},o.getRealHeight=function(){return t.videoHeight},o.getWidth=function(){return n},o.getHeight=function(){return r},o.setWidth=function(t){n=t},o.setHeight=function(t){r=t},o.setInputStream=function(e){a=e,t.src="undefined"!=typeof e.src?e.src:""},o.ended=function(){return t.ended},o.getConfig=function(){return a},o.setAttribute=function(e,n){t.setAttribute(e,n)},o.pause=function(){t.pause()},o.play=function(){t.play()},o.setCurrentTime=function(e){"LiveStream"!==a.type&&(t.currentTime=e)},o.addEventListener=function(e,n,r){-1!==i.indexOf(e)?(u[e]||(u[e]=[]),u[e].push(n)):t.addEventListener(e,n,r)},o.clearEventHandlers=function(){i.forEach(function(e){var n=u[e];n&&n.length>0&&n.forEach(function(n){t.removeEventListener(e,n)})})},o.trigger=function(t,n){var r,a=u[t];if("canrecord"===t&&e(),a&&a.length>0)for(r=0;r<a.length;r++)a[r].apply(o,n)},o.setTopRight=function(t){c.x=t.x,c.y=t.y},o.getTopRight=function(){return c},o.setCanvasSize=function(t){l.x=t.x,l.y=t.y},o.getCanvasSize=function(){return l},o.getFrame=function(){return t},o},i.createLiveStream=function(t){t.setAttribute("autoplay",!0);var e=i.createVideoStream(t);return e.ended=function(){return!1},e},i.createImageStream=function(){function t(){s=!1,a["default"].load(v,function(t){d=t,u=t[0].width,c=t[0].height,n=i.size?u/c>1?i.size:Math.floor(u/c*i.size):u,r=i.size?u/c>1?Math.floor(c/u*i.size):i.size:c,x.x=n,x.y=r,s=!0,l=0,setTimeout(function(){e("canrecord",[])},0)},p,h,i.sequence)}function e(t,e){var n,r=y[t];if(r&&r.length>0)for(n=0;n<r.length;n++)r[n].apply(o,e)}var n,r,o={},i=null,u=0,c=0,l=0,f=!0,s=!1,d=null,h=0,p=1,v=null,g=!1,m=["canrecord","ended"],y={},_={x:0,y:0},x={x:0,y:0};return o.trigger=e,o.getWidth=function(){return n},o.getHeight=function(){return r},o.setWidth=function(t){n=t},o.setHeight=function(t){r=t},o.getRealWidth=function(){return u},o.getRealHeight=function(){return c},o.setInputStream=function(e){i=e,e.sequence===!1?(v=e.src,h=1):(v=e.src,h=e.length),t()},o.ended=function(){return g},o.setAttribute=function(){},o.getConfig=function(){return i},o.pause=function(){f=!0},o.play=function(){f=!1},o.setCurrentTime=function(t){l=t},o.addEventListener=function(t,e){-1!==m.indexOf(t)&&(y[t]||(y[t]=[]),y[t].push(e))},o.setTopRight=function(t){_.x=t.x,_.y=t.y},o.getTopRight=function(){return _},o.setCanvasSize=function(t){x.x=t.x,x.y=t.y},o.getCanvasSize=function(){return x},o.getFrame=function(){var t;return s?(f||(t=d[l],h-1>l?l++:setTimeout(function(){g=!0,e("ended",[])},0)),t):null},o},e["default"]=i,t.exports=e["default"]},function(t,e){"use strict";function n(t,e){t.onload=function(){e.loaded(this)}}Object.defineProperty(e,"__esModule",{value:!0});var r={};r.load=function(t,e,r,o,a){var i,u,c,l=new Array(o),f=new Array(l.length);if(a===!1)l[0]=t;else for(i=0;i<l.length;i++)c=r+i,l[i]=t+"image-"+("00"+c).slice(-3)+".jpg";for(f.notLoaded=[],f.addImage=function(t){f.notLoaded.push(t)},f.loaded=function(t){for(var n=f.notLoaded,r=0;r<n.length;r++)if(n[r]===t){n.splice(r,1);for(var o=0;o<l.length;o++){var a=l[o].substr(l[o].lastIndexOf("/"));if(-1!==t.src.lastIndexOf(a)){f[o]=t;break}}break}0===n.length&&(console.log("Images loaded"),e.apply(null,[f]))},i=0;i<l.length;i++)u=new Image,f.addImage(u),n(u,f),u.src=l[i]},e["default"]=r,t.exports=e["default"]},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),a=r(o),i={};i.create=function(t,e){var n,r={},o=t.getConfig(),i=a["default"].imageRef(t.getRealWidth(),t.getRealHeight()),u=t.getCanvasSize(),c=a["default"].imageRef(t.getWidth(),t.getHeight()),l=t.getTopRight(),f=l.x,s=l.y,d=null,h=null;return n=e?e:document.createElement("canvas"),n.width=u.x,n.height=u.y,d=n.getContext("2d"),h=new Uint8Array(c.x*c.y),console.log("FrameGrabber",JSON.stringify({size:c,topRight:l,videoSize:i,canvasSize:u})),r.attachData=function(t){h=t},r.getData=function(){return h},r.grab=function(){var e,n=o.halfSample,r=t.getFrame();return r?(d.drawImage(r,0,0,u.x,u.y),e=d.getImageData(f,s,c.x,c.y).data,n?a["default"].grayAndHalfSampleFromCanvasData(e,c,h):a["default"].computeGray(e,h,o),!0):!1},r.getSize=function(){return c},r},e["default"]=i,t.exports=e["default"]}])});
},{}]},{},[1]);
