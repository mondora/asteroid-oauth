(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AsteroidOauthMixin"] = factory();
	else
		root["AsteroidOauthMixin"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;
	exports.registerOauthProvider = registerOauthProvider;
	exports.loginWith = loginWith;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _urlParse = __webpack_require__(1);

	var _urlParse2 = _interopRequireDefault(_urlParse);

	var _libOpenOauthPopup = __webpack_require__(4);

	var _libOpenOauthPopup2 = _interopRequireDefault(_libOpenOauthPopup);

	// TODO implement some other common providers such as facebook and twitter

	var _providersGoogle = __webpack_require__(6);

	var google = _interopRequireWildcard(_providersGoogle);

	var providers = { google: google };

	function init(_ref) {
	    var endpoint = _ref.endpoint;
	    var platform = _ref.platform;

	    this.subscribe("meteor.loginServiceConfiguration");
	    this.oauth = {
	        platform: platform,
	        url: (0, _urlParse2["default"])(endpoint)
	    };
	}

	function registerOauthProvider(provider) {
	    providers[provider.name] = provider;
	}

	function loginWith(providerName, scope, offlineAccess, forcePrompt) {
	    var _this = this;

	    var options = providers[providerName].getOptions({
	        url: this.oauth.url,
	        // The mixin which implements collections must also implement the
	        // getServiceConfig method
	        configCollection: this.getServiceConfig(providerName),
	        scope: scope,
	        offlineAccess: offlineAccess,
	        forcePrompt: forcePrompt
	    });
	    return (0, _libOpenOauthPopup2["default"])(this.oauth.platform, this.oauth.url.host, options.credentialToken, options.loginUrl, function (oauth) {
	        return _this.login({ oauth: oauth });
	    });
	}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var required = __webpack_require__(2)
	  , qs = __webpack_require__(3)
	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
	  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

	/**
	 * These are the parse rules for the URL parser, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var rules = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];

	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 };

	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	function lolcation(loc) {
	  loc = loc || global.location || {};

	  var finaldestination = {}
	    , type = typeof loc
	    , key;

	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }

	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }

	  return finaldestination;
	}

	/**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase.
	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
	 * @property {String} rest Rest of the URL that is not part of the protocol.
	 */

	/**
	 * Extract protocol information from a URL with/without double slash ("//").
	 *
	 * @param {String} address URL we want to extract from.
	 * @return {ProtocolExtract} Extracted information.
	 * @api private
	 */
	function extractProtocol(address) {
	  var match = protocolre.exec(address);

	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3]
	  };
	}

	/**
	 * Resolve a relative URL pathname against a base URL pathname.
	 *
	 * @param {String} relative Pathname of the relative URL.
	 * @param {String} base Pathname of the base URL.
	 * @return {String} Resolved pathname.
	 * @api private
	 */
	function resolve(relative, base) {
	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
	    , i = path.length
	    , last = path[i - 1]
	    , unshift = false
	    , up = 0;

	  while (i--) {
	    if (path[i] === '.') {
	      path.splice(i, 1);
	    } else if (path[i] === '..') {
	      path.splice(i, 1);
	      up++;
	    } else if (up) {
	      if (i === 0) unshift = true;
	      path.splice(i, 1);
	      up--;
	    }
	  }

	  if (unshift) path.unshift('');
	  if (last === '.' || last === '..') path.push('');

	  return path.join('/');
	}

	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} location Location defaults for relative paths.
	 * @param {Boolean|Function} parser Parser for the query string.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }

	  var relative, extracted, parse, instruction, index, key
	    , instructions = rules.slice()
	    , type = typeof location
	    , url = this
	    , i = 0;

	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }

	  if (parser && 'function' !== typeof parser) parser = qs.parse;

	  location = lolcation(location);

	  //
	  // Extract protocol information before running the instructions.
	  //
	  extracted = extractProtocol(address || '');
	  relative = !extracted.protocol && !extracted.slashes;
	  url.slashes = extracted.slashes || relative && location.slashes;
	  url.protocol = extracted.protocol || location.protocol || '';
	  address = extracted.rest;

	  //
	  // When the authority component is absent the URL starts with a path
	  // component.
	  //
	  if (!extracted.slashes) instructions[2] = [/(.*)/, 'pathname'];

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];

	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if ((index = parse.exec(address))) {
	      url[key] = index[1];
	      address = address.slice(0, index.index);
	    }

	    url[key] = url[key] || (
	      relative && instruction[3] ? location[key] || '' : ''
	    );

	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) url[key] = url[key].toLowerCase();
	  }

	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);

	  //
	  // If the URL is relative, resolve the pathname against the base URL.
	  //
	  if (
	      relative
	    && location.slashes
	    && url.pathname.charAt(0) !== '/'
	    && (url.pathname !== '' || location.pathname !== '')
	  ) {
	    url.pathname = resolve(url.pathname, location.pathname);
	  }

	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }

	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }

	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}

	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function
	 *                               used to parse the query.
	 *                               When setting the protocol, double slash will be
	 *                               removed from the final url if it is true.
	 * @returns {URL}
	 * @api public
	 */
	function set(part, value, fn) {
	  var url = this;

	  switch (part) {
	    case 'query':
	      if ('string' === typeof value && value.length) {
	        value = (fn || qs.parse)(value);
	      }

	      url[part] = value;
	      break;

	    case 'port':
	      url[part] = value;

	      if (!required(value, url.protocol)) {
	        url.host = url.hostname;
	        url[part] = '';
	      } else if (value) {
	        url.host = url.hostname +':'+ value;
	      }

	      break;

	    case 'hostname':
	      url[part] = value;

	      if (url.port) value += ':'+ url.port;
	      url.host = value;
	      break;

	    case 'host':
	      url[part] = value;

	      if (/:\d+$/.test(value)) {
	        value = value.split(':');
	        url.port = value.pop();
	        url.hostname = value.join(':');
	      } else {
	        url.hostname = value;
	        url.port = '';
	      }

	      break;

	    case 'protocol':
	      url.protocol = value.toLowerCase();
	      url.slashes = !fn;
	      break;

	    case 'pathname':
	      url.pathname = value.length && value.charAt(0) !== '/' ? '/' + value : value;

	      break;

	    default:
	      url[part] = value;
	  }

	  for (var i = 0; i < rules.length; i++) {
	    var ins = rules[i];

	    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
	  }

	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  url.href = url.toString();

	  return url;
	}

	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

	  var query
	    , url = this
	    , protocol = url.protocol;

	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

	  var result = protocol + (url.slashes ? '//' : '');

	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }

	  result += url.host + url.pathname;

	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

	  if (url.hash) result += url.hash;

	  return result;
	}

	URL.prototype = { set: set, toString: toString };

	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	URL.extractProtocol = extractProtocol;
	URL.location = lolcation;
	URL.qs = qs;

	module.exports = URL;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;

	  if (!port) return false;

	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;

	    case 'https':
	    case 'wss':
	    return port !== 443;

	    case 'ftp':
	    return port !== 21;

	    case 'gopher':
	    return port !== 70;

	    case 'file':
	    return false;
	  }

	  return port !== 0;
	};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	var has = Object.prototype.hasOwnProperty;

	/**
	 * Decode a URI encoded string.
	 *
	 * @param {String} input The URI encoded string.
	 * @returns {String} The decoded string.
	 * @api private
	 */
	function decode(input) {
	  return decodeURIComponent(input.replace(/\+/g, ' '));
	}

	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=?([^&]*)/g
	    , result = {}
	    , part;

	  //
	  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
	  // the lastIndex property so we can continue executing this loop until we've
	  // parsed all results.
	  //
	  for (;
	    part = parser.exec(query);
	    result[decode(part[1])] = decode(part[2])
	  );

	  return result;
	}

	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';

	  var pairs = [];

	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';

	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
	    }
	  }

	  return pairs.length ? prefix + pairs.join('&') : '';
	}

	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = openOauthPopup;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _platformsBrowser = __webpack_require__(5);

	var _platformsBrowser2 = _interopRequireDefault(_platformsBrowser);

	var platformsOauthFlowClasses = {
	    browser: _platformsBrowser2["default"]
	};

	function openOauthPopup(platform, host, credentialToken, loginUrl, afterCredentialSecretReceived) {
	    var OauthFlow = platformsOauthFlowClasses[platform];
	    var oauthFlow = new OauthFlow({ host: host, credentialToken: credentialToken, loginUrl: loginUrl });
	    return oauthFlow.init().then(afterCredentialSecretReceived);
	}

	module.exports = exports["default"];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _urlParse = __webpack_require__(1);

	var _urlParse2 = _interopRequireDefault(_urlParse);

	var BrowserOauthFlow = (function () {
	    function BrowserOauthFlow(_ref) {
	        var _this = this;

	        var credentialToken = _ref.credentialToken;
	        var host = _ref.host;
	        var loginUrl = _ref.loginUrl;

	        _classCallCheck(this, BrowserOauthFlow);

	        this.credentialToken = credentialToken;
	        this.host = host;
	        this.loginUrl = loginUrl;
	        this._credentialSecretPromise = new Promise(function (resolve, reject) {
	            _this._resolvePromise = resolve;
	            _this._rejectPromise = reject;
	        });
	    }

	    _createClass(BrowserOauthFlow, [{
	        key: "_startPolling",
	        value: function _startPolling() {
	            var _this2 = this;

	            var request = JSON.stringify({
	                credentialToken: this.credentialToken
	            });
	            this.intervalId = window.setInterval(function () {
	                _this2.popup.postMessage(request, _this2.host);
	            }, 100);
	            window.addEventListener("message", this._onMessage.bind(this));
	        }
	    }, {
	        key: "_stopPolling",
	        value: function _stopPolling() {
	            window.clearInterval(this.intervalId);
	        }
	    }, {
	        key: "_onMessage",
	        value: function _onMessage(_ref2) {
	            var data = _ref2.data;
	            var origin = _ref2.origin;

	            try {
	                var message = JSON.parse(data);
	                if ((0, _urlParse2["default"])(origin).host !== this.host) {
	                    return;
	                }
	                if (message.credentialToken === this.credentialToken) {
	                    this._resolvePromise({
	                        credentialToken: message.credentialToken,
	                        credentialSecret: message.credentialSecret
	                    });
	                }
	                if (message.error) {
	                    this._rejectPromise(message.error);
	                }
	            } catch (ignore) {
	                /*
	                *   Simply ignore messages that:
	                *       - are not JSON strings
	                *       - don't match our `host`
	                *       - dont't match our `credentialToken`
	                */
	            }
	        }
	    }, {
	        key: "_openPopup",
	        value: function _openPopup() {
	            // Open the oauth popup
	            this.popup = window.open(this.loginUrl, "_blank", "location=no,toolbar=no");
	            // If the focus property exists, it's a function and it needs to be
	            // called in order to focus the popup
	            if (this.popup.focus) {
	                this.popup.focus();
	            }
	        }
	    }, {
	        key: "_closePopup",
	        value: function _closePopup() {
	            this.popup.close();
	        }
	    }, {
	        key: "init",
	        value: function init() {
	            var _this3 = this;

	            this._openPopup();
	            this._startPolling();
	            return this._credentialSecretPromise.then(function (credentialSecret) {
	                _this3._stopPolling();
	                _this3._closePopup();
	                return credentialSecret;
	            });
	        }
	    }]);

	    return BrowserOauthFlow;
	})();

	exports["default"] = BrowserOauthFlow;
	module.exports = exports["default"];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getOptions = getOptions;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _urlParse = __webpack_require__(1);

	var _urlParse2 = _interopRequireDefault(_urlParse);

	var _libGenerateCredentialToken = __webpack_require__(7);

	var _libGenerateCredentialToken2 = _interopRequireDefault(_libGenerateCredentialToken);

	var _libGetOauthState = __webpack_require__(8);

	var _libGetOauthState2 = _interopRequireDefault(_libGetOauthState);

	var _libGetOauthClientId = __webpack_require__(9);

	var _libGetOauthClientId2 = _interopRequireDefault(_libGetOauthClientId);

	var _libGetOauthProtocol = __webpack_require__(10);

	var _libGetOauthProtocol2 = _interopRequireDefault(_libGetOauthProtocol);

	var name = "google";

	exports.name = name;

	function getOptions(_ref) {
	    var url = _ref.url;
	    var configCollection = _ref.configCollection;
	    var scope = _ref.scope;
	    var offlineAccess = _ref.offlineAccess;
	    var forcePrompt = _ref.forcePrompt;

	    var credentialToken = (0, _libGenerateCredentialToken2["default"])();
	    var protocol = url.protocol;
	    var host = url.host;

	    var query = {
	        /*
	        *   `response_type` determines how the callback url is formed by the
	        *   google oauth service:
	        *       - `code` -> put the parameters in the querystring
	        *       - `token` -> put the parameters in the fragment
	        *   Meteor currently only supports a `code` response type
	        */
	        "response_type": "code",
	        "client_id": (0, _libGetOauthClientId2["default"])(configCollection),
	        "redirect_uri": (0, _libGetOauthProtocol2["default"])(protocol) + ("//" + host + "/_oauth/google"),
	        "state": (0, _libGetOauthState2["default"])(credentialToken),
	        "scope": scope || "openid email"
	    };

	    if (offlineAccess) query.access_type = 'offline';
	    if (forcePrompt) query.approval_prompt = 'force';

	    var loginUrl = (0, _urlParse2["default"])("https://accounts.google.com/o/oauth2/auth").set("query", query).toString();
	    return { credentialToken: credentialToken, loginUrl: loginUrl };
	}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = generateCredentialToken;

	function generateCredentialToken() {
	    var ret = "";
	    for (var i = 0; i < 8; i++) {
	        ret += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	    }
	    return ret;
	}

	module.exports = exports["default"];

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = getOauthState;

	function getOauthState(credentialToken) {
	    var state = {
	        loginStyle: "popup",
	        credentialToken: credentialToken,
	        isCordova: false
	    };
	    // Encode base64 as not all login services URI-encode the state
	    // parameter when they pass it back to us.
	    // TODO: document to include a btoa/atob polyfill to support older browsers
	    return window.btoa(JSON.stringify(state));
	}

	module.exports = exports["default"];

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = getOauthClientId;

	function getOauthClientId(serviceConfig) {
	    return serviceConfig.clientId || serviceConfig.consumerKey || serviceConfig.appId;
	}

	module.exports = exports["default"];

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = getOauthProtocol;

	function getOauthProtocol(protocol) {
	    if (protocol === "ws:" || protocol === "http:") {
	        return "http:";
	    } else if (protocol === "wss:" || protocol === "https:") {
	        return "https:";
	    }
	}

	module.exports = exports["default"];

/***/ })
/******/ ])
});
;