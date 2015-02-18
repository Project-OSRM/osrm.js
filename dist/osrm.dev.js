!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.osrm=e():"undefined"!=typeof global?global.osrm=e():"undefined"!=typeof self&&(self.osrm=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.domain +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/* jshint: esnext: true */
var corslite = _interopRequire(require("corslite"));

var Client = (function () {
  function Client(url) {
    _classCallCheck(this, Client);

    this._url = url || "//router.project-osrm.org";
    this._lastSend = 0;
    this._lastReceived = 0;
  }

  _prototypeProperties(Client, null, {
    _formatLocs: {
      value: function _formatLocs(latLngs) {
        return "loc=" + latLngs.map(function (c) {
          return c[0] + "," + c[1];
        }).join("&loc=");
      },
      writable: true,
      configurable: true
    },
    _onResponse: {
      value: function _onResponse(err, response, callback) {
        if (err) {
          callback(err);
          return;
        }

        var data = JSON.parse(response.responseText);
        callback(null, data);
      },
      writable: true,
      configurable: true
    },
    _request: {
      value: function _request(service, encodedParams, callback) {
        var _this = this;
        var url = this._url + "/" + service + "?" + encodedParams,
            reqNumber = this._lastSend++;
        corslite(url, function (err, response) {
          if (reqNumber < _this._lastReceived) return;

          _this._lastReceived = reqNumber;

          _this._onResponse(err, response, callback);
        });
      },
      writable: true,
      configurable: true
    },
    locate: {
      value: function locate(latLng, callback) {
        this._request("locate", this._formatLocs([latLng]), callback);
      },
      writable: true,
      configurable: true
    },
    nearest: {
      value: function nearest(latLng, callback) {
        this._request("nearest", this._formatLocs([latLng]), callback);
      },
      writable: true,
      configurable: true
    },
    match: {
      value: function match(latLngs, callback) {
        this._request("match", this._formatLocs(latLngs), callback);
      },
      writable: true,
      configurable: true
    },
    route: {
      value: function route(latLngs, callback) {
        this._request("viaroute", this._formatLocs(latLngs), callback);
      },
      writable: true,
      configurable: true
    },
    table: {
      value: function table(latLngs, callback) {
        this._request("table", this._formatLocs(latLngs), callback);
      },
      writable: true,
      configurable: true
    }
  });

  return Client;
})();

module.exports = Client;

},{"corslite":1}],3:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

/* jshint: esnext: true */

_defaults(exports, _interopRequireWildcard(require("./client")));

Object.defineProperty(exports, "__esModule", {
  value: true
});

},{"./client":2}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3BhdHJpY2svQ29kZS9vc3JtLWNsaWVudC9ub2RlX21vZHVsZXMvY29yc2xpdGUvY29yc2xpdGUuanMiLCIvaG9tZS9wYXRyaWNrL0NvZGUvb3NybS1jbGllbnQvc3JjL2NsaWVudC5qcyIsIi9ob21lL3BhdHJpY2svQ29kZS9vc3JtLWNsaWVudC9zcmMvb3NybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0lDNUZPLFFBQVEsMkJBQU0sVUFBVTs7SUFFVixNQUFNO0FBQ2QsV0FEUSxNQUFNLENBQ2IsR0FBRzswQkFESSxNQUFNOztBQUV2QixRQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQztBQUMvQyxRQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNuQixRQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztHQUN4Qjs7dUJBTGtCLE1BQU07QUFPekIsZUFBVzthQUFBLHFCQUFDLE9BQU8sRUFBRTtBQUNuQixlQUFPLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQUMsaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRSxDQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3RGOzs7O0FBRUQsZUFBVzthQUFBLHFCQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQ25DLFlBQUksR0FBRyxFQUFFO0FBQ1Asa0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNkLGlCQUFPO1NBQ1I7O0FBRUQsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0MsZ0JBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDdEI7Ozs7QUFFRCxZQUFRO2FBQUEsa0JBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUU7O0FBQ3pDLFlBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsYUFBYTtZQUNyRCxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2pDLGdCQUFRLENBQUMsR0FBRyxFQUFFLFVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBSztBQUMvQixjQUFJLFNBQVMsR0FBRyxNQUFLLGFBQWEsRUFBRSxPQUFPOztBQUUzQyxnQkFBSyxhQUFhLEdBQUcsU0FBUyxDQUFDOztBQUUvQixnQkFBSyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMzQyxDQUFDLENBQUM7T0FDSjs7OztBQUVELFVBQU07YUFBQSxnQkFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ2hFOzs7O0FBRUQsV0FBTzthQUFBLGlCQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDeEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDakU7Ozs7QUFFRCxTQUFLO2FBQUEsZUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDOUQ7Ozs7QUFFRCxTQUFLO2FBQUEsZUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDakU7Ozs7QUFFRCxTQUFLO2FBQUEsZUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDOUQ7Ozs7OztTQW5Ea0IsTUFBTTs7O2lCQUFOLE1BQU07Ozs7Ozs7Ozs7O21EQ0RiLFVBQVUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGNvcnNsaXRlKHVybCwgY2FsbGJhY2ssIGNvcnMpIHtcbiAgICB2YXIgc2VudCA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cuWE1MSHR0cFJlcXVlc3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhFcnJvcignQnJvd3NlciBub3Qgc3VwcG9ydGVkJykpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29ycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIG0gPSB1cmwubWF0Y2goL15cXHMqaHR0cHM/OlxcL1xcL1teXFwvXSovKTtcbiAgICAgICAgY29ycyA9IG0gJiYgKG1bMF0gIT09IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmRvbWFpbiArXG4gICAgICAgICAgICAgICAgKGxvY2F0aW9uLnBvcnQgPyAnOicgKyBsb2NhdGlvbi5wb3J0IDogJycpKTtcbiAgICB9XG5cbiAgICB2YXIgeCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIGZ1bmN0aW9uIGlzU3VjY2Vzc2Z1bChzdGF0dXMpIHtcbiAgICAgICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwIHx8IHN0YXR1cyA9PT0gMzA0O1xuICAgIH1cblxuICAgIGlmIChjb3JzICYmICEoJ3dpdGhDcmVkZW50aWFscycgaW4geCkpIHtcbiAgICAgICAgLy8gSUU4LTlcbiAgICAgICAgeCA9IG5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QoKTtcblxuICAgICAgICAvLyBFbnN1cmUgY2FsbGJhY2sgaXMgbmV2ZXIgY2FsbGVkIHN5bmNocm9ub3VzbHksIGkuZS4sIGJlZm9yZVxuICAgICAgICAvLyB4LnNlbmQoKSByZXR1cm5zICh0aGlzIGhhcyBiZWVuIG9ic2VydmVkIGluIHRoZSB3aWxkKS5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LmpzL2lzc3Vlcy80NzJcbiAgICAgICAgdmFyIG9yaWdpbmFsID0gY2FsbGJhY2s7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoc2VudCkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5hcHBseSh0aGF0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRlZCgpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgLy8gWERvbWFpblJlcXVlc3RcbiAgICAgICAgICAgIHguc3RhdHVzID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgICAgICAgICAgaXNTdWNjZXNzZnVsKHguc3RhdHVzKSkgY2FsbGJhY2suY2FsbCh4LCBudWxsLCB4KTtcbiAgICAgICAgZWxzZSBjYWxsYmFjay5jYWxsKHgsIHgsIG51bGwpO1xuICAgIH1cblxuICAgIC8vIEJvdGggYG9ucmVhZHlzdGF0ZWNoYW5nZWAgYW5kIGBvbmxvYWRgIGNhbiBmaXJlLiBgb25yZWFkeXN0YXRlY2hhbmdlYFxuICAgIC8vIGhhcyBbYmVlbiBzdXBwb3J0ZWQgZm9yIGxvbmdlcl0oaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvOTE4MTUwOC8yMjkwMDEpLlxuICAgIGlmICgnb25sb2FkJyBpbiB4KSB7XG4gICAgICAgIHgub25sb2FkID0gbG9hZGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHgub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gcmVhZHlzdGF0ZSgpIHtcbiAgICAgICAgICAgIGlmICh4LnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBsb2FkZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBYTUxIdHRwUmVxdWVzdCBvYmplY3QgYXMgYW4gZXJyb3IgYW5kIHByZXZlbnRcbiAgICAvLyBpdCBmcm9tIGV2ZXIgYmVpbmcgY2FsbGVkIGFnYWluIGJ5IHJlYXNzaWduaW5nIGl0IHRvIGBub29wYFxuICAgIHgub25lcnJvciA9IGZ1bmN0aW9uIGVycm9yKGV2dCkge1xuICAgICAgICAvLyBYRG9tYWluUmVxdWVzdCBwcm92aWRlcyBubyBldnQgcGFyYW1ldGVyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZXZ0IHx8IHRydWUsIG51bGwpO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyB9O1xuICAgIH07XG5cbiAgICAvLyBJRTkgbXVzdCBoYXZlIG9ucHJvZ3Jlc3MgYmUgc2V0IHRvIGEgdW5pcXVlIGZ1bmN0aW9uLlxuICAgIHgub25wcm9ncmVzcyA9IGZ1bmN0aW9uKCkgeyB9O1xuXG4gICAgeC5vbnRpbWVvdXQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBldnQsIG51bGwpO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyB9O1xuICAgIH07XG5cbiAgICB4Lm9uYWJvcnQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBldnQsIG51bGwpO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyB9O1xuICAgIH07XG5cbiAgICAvLyBHRVQgaXMgdGhlIG9ubHkgc3VwcG9ydGVkIEhUVFAgVmVyYiBieSBYRG9tYWluUmVxdWVzdCBhbmQgaXMgdGhlXG4gICAgLy8gb25seSBvbmUgc3VwcG9ydGVkIGhlcmUuXG4gICAgeC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdC4gU2VuZGluZyBkYXRhIGlzIG5vdCBzdXBwb3J0ZWQuXG4gICAgeC5zZW5kKG51bGwpO1xuICAgIHNlbnQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHg7XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgbW9kdWxlLmV4cG9ydHMgPSBjb3JzbGl0ZTtcbiIsIi8qIGpzaGludDogZXNuZXh0OiB0cnVlICovXG5pbXBvcnQgY29yc2xpdGUgZnJvbSAnY29yc2xpdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xuICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICB0aGlzLl91cmwgPSB1cmwgfHwgXCIvL3JvdXRlci5wcm9qZWN0LW9zcm0ub3JnXCI7XG4gICAgdGhpcy5fbGFzdFNlbmQgPSAwO1xuICAgIHRoaXMuX2xhc3RSZWNlaXZlZCA9IDA7XG4gIH1cblxuICBfZm9ybWF0TG9jcyhsYXRMbmdzKSB7XG4gICAgcmV0dXJuICdsb2M9JyArIGxhdExuZ3MubWFwKGZ1bmN0aW9uKGMpIHtyZXR1cm4gY1swXSArICcsJyArIGNbMV07IH0gKS5qb2luKFwiJmxvYz1cIik7XG4gIH1cblxuICBfb25SZXNwb25zZShlcnIsIHJlc3BvbnNlLCBjYWxsYmFjaykge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XG4gICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gIH1cblxuICBfcmVxdWVzdChzZXJ2aWNlLCBlbmNvZGVkUGFyYW1zLCBjYWxsYmFjaykge1xuICAgIHZhciB1cmwgPSB0aGlzLl91cmwgKyAnLycgKyBzZXJ2aWNlICsgJz8nICsgZW5jb2RlZFBhcmFtcyxcbiAgICAgICAgcmVxTnVtYmVyID0gdGhpcy5fbGFzdFNlbmQrKztcbiAgICBjb3JzbGl0ZSh1cmwsIChlcnIsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVxTnVtYmVyIDwgdGhpcy5fbGFzdFJlY2VpdmVkKSByZXR1cm47XG5cbiAgICAgIHRoaXMuX2xhc3RSZWNlaXZlZCA9IHJlcU51bWJlcjtcblxuICAgICAgdGhpcy5fb25SZXNwb25zZShlcnIsIHJlc3BvbnNlLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBsb2NhdGUobGF0TG5nLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlcXVlc3QoJ2xvY2F0ZScsICB0aGlzLl9mb3JtYXRMb2NzKFtsYXRMbmddKSwgY2FsbGJhY2spO1xuICB9XG5cbiAgbmVhcmVzdChsYXRMbmcsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVxdWVzdCgnbmVhcmVzdCcsICB0aGlzLl9mb3JtYXRMb2NzKFtsYXRMbmddKSwgY2FsbGJhY2spO1xuICB9XG5cbiAgbWF0Y2gobGF0TG5ncywgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yZXF1ZXN0KCdtYXRjaCcsICB0aGlzLl9mb3JtYXRMb2NzKGxhdExuZ3MpLCBjYWxsYmFjayk7XG4gIH1cblxuICByb3V0ZShsYXRMbmdzLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlcXVlc3QoJ3ZpYXJvdXRlJywgIHRoaXMuX2Zvcm1hdExvY3MobGF0TG5ncyksIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHRhYmxlKGxhdExuZ3MsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVxdWVzdCgndGFibGUnLCAgdGhpcy5fZm9ybWF0TG9jcyhsYXRMbmdzKSwgY2FsbGJhY2spO1xuICB9XG59XG4iLCIvKiBqc2hpbnQ6IGVzbmV4dDogdHJ1ZSAqL1xuXG5leHBvcnQgKiBmcm9tICcuL2NsaWVudCc7XG5cbiJdfQ==
(3)
});
;