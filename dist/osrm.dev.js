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
var corslite = require('corslite');

function Client(url) {
  this._url = url || "//router.project-osrm.org";
  this._lastSend = 0;
  this._lastReceived = 0;
}

Client.prototype = {
  _formatLocs: function(latLngs) {
    return 'loc=' + latLngs.map(function(c) {return c[0] + ',' + c[1]; } ).join("&loc=");
  },

  _onResponse: function(err, response, callback) {
    if (err) {
      callback(err);
      return;
    }

    var data = JSON.parse(response.responseText);
    callback(null, data);
  },

  _request: function(service, encodedParams, callback) {
    var url = this._url + '/' + service + '?' + encodedParams,
        reqNumber = this._lastSend++;
    corslite(url, function (err, response) {
      if (reqNumber < this._lastReceived) return;

      this._lastReceived = reqNumber;

      this._onResponse(err, response, callback);
    }.bind(this));
  },

  locate: function(latLng, callback) {
    this._request('locate',  this._formatLocs([latLng]), callback);
  },

  nearest: function(latLng, callback) {
    this._request('nearest',  this._formatLocs([latLng]), callback);
  },

  match: function(latLngs, callback) {
    this._request('match',  this._formatLocs(latLngs), callback);
  },

  route: function(latLngs, callback) {
    this._request('viaroute',  this._formatLocs(latLngs), callback);
  },

  table: function(latLngs, callback) {
    this._request('table',  this._formatLocs(latLngs), callback);
  },
};

if (typeof module !== 'undefined') module.exports = Client;

},{"corslite":1}],3:[function(require,module,exports){
var client = require('./client.js');

if (typeof module !== 'undefined') module.exports = client;

},{"./client.js":2}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3BhdHJpY2svQ29kZS9vc3JtLWNsaWVudC9ub2RlX21vZHVsZXMvY29yc2xpdGUvY29yc2xpdGUuanMiLCIvaG9tZS9wYXRyaWNrL0NvZGUvb3NybS1jbGllbnQvc3JjL2NsaWVudC5qcyIsIi9ob21lL3BhdHJpY2svQ29kZS9vc3JtLWNsaWVudC9zcmMvb3NybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY29yc2xpdGUodXJsLCBjYWxsYmFjaywgY29ycykge1xuICAgIHZhciBzZW50ID0gZmFsc2U7XG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdy5YTUxIdHRwUmVxdWVzdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKEVycm9yKCdCcm93c2VyIG5vdCBzdXBwb3J0ZWQnKSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBjb3JzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgbSA9IHVybC5tYXRjaCgvXlxccypodHRwcz86XFwvXFwvW15cXC9dKi8pO1xuICAgICAgICBjb3JzID0gbSAmJiAobVswXSAhPT0gbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uZG9tYWluICtcbiAgICAgICAgICAgICAgICAobG9jYXRpb24ucG9ydCA/ICc6JyArIGxvY2F0aW9uLnBvcnQgOiAnJykpO1xuICAgIH1cblxuICAgIHZhciB4ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgZnVuY3Rpb24gaXNTdWNjZXNzZnVsKHN0YXR1cykge1xuICAgICAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDAgfHwgc3RhdHVzID09PSAzMDQ7XG4gICAgfVxuXG4gICAgaWYgKGNvcnMgJiYgISgnd2l0aENyZWRlbnRpYWxzJyBpbiB4KSkge1xuICAgICAgICAvLyBJRTgtOVxuICAgICAgICB4ID0gbmV3IHdpbmRvdy5YRG9tYWluUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIEVuc3VyZSBjYWxsYmFjayBpcyBuZXZlciBjYWxsZWQgc3luY2hyb25vdXNseSwgaS5lLiwgYmVmb3JlXG4gICAgICAgIC8vIHguc2VuZCgpIHJldHVybnMgKHRoaXMgaGFzIGJlZW4gb2JzZXJ2ZWQgaW4gdGhlIHdpbGQpLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3guanMvaXNzdWVzLzQ3MlxuICAgICAgICB2YXIgb3JpZ2luYWwgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChzZW50KSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZGVkKCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAvLyBYRG9tYWluUmVxdWVzdFxuICAgICAgICAgICAgeC5zdGF0dXMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgLy8gbW9kZXJuIGJyb3dzZXJzXG4gICAgICAgICAgICBpc1N1Y2Nlc3NmdWwoeC5zdGF0dXMpKSBjYWxsYmFjay5jYWxsKHgsIG51bGwsIHgpO1xuICAgICAgICBlbHNlIGNhbGxiYWNrLmNhbGwoeCwgeCwgbnVsbCk7XG4gICAgfVxuXG4gICAgLy8gQm90aCBgb25yZWFkeXN0YXRlY2hhbmdlYCBhbmQgYG9ubG9hZGAgY2FuIGZpcmUuIGBvbnJlYWR5c3RhdGVjaGFuZ2VgXG4gICAgLy8gaGFzIFtiZWVuIHN1cHBvcnRlZCBmb3IgbG9uZ2VyXShodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS85MTgxNTA4LzIyOTAwMSkuXG4gICAgaWYgKCdvbmxvYWQnIGluIHgpIHtcbiAgICAgICAgeC5vbmxvYWQgPSBsb2FkZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgeC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiByZWFkeXN0YXRlKCkge1xuICAgICAgICAgICAgaWYgKHgucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGxvYWRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIENhbGwgdGhlIGNhbGxiYWNrIHdpdGggdGhlIFhNTEh0dHBSZXF1ZXN0IG9iamVjdCBhcyBhbiBlcnJvciBhbmQgcHJldmVudFxuICAgIC8vIGl0IGZyb20gZXZlciBiZWluZyBjYWxsZWQgYWdhaW4gYnkgcmVhc3NpZ25pbmcgaXQgdG8gYG5vb3BgXG4gICAgeC5vbmVycm9yID0gZnVuY3Rpb24gZXJyb3IoZXZ0KSB7XG4gICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IHByb3ZpZGVzIG5vIGV2dCBwYXJhbWV0ZXJcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBldnQgfHwgdHJ1ZSwgbnVsbCk7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IH07XG4gICAgfTtcblxuICAgIC8vIElFOSBtdXN0IGhhdmUgb25wcm9ncmVzcyBiZSBzZXQgdG8gYSB1bmlxdWUgZnVuY3Rpb24uXG4gICAgeC5vbnByb2dyZXNzID0gZnVuY3Rpb24oKSB7IH07XG5cbiAgICB4Lm9udGltZW91dCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGV2dCwgbnVsbCk7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IH07XG4gICAgfTtcblxuICAgIHgub25hYm9ydCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGV2dCwgbnVsbCk7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IH07XG4gICAgfTtcblxuICAgIC8vIEdFVCBpcyB0aGUgb25seSBzdXBwb3J0ZWQgSFRUUCBWZXJiIGJ5IFhEb21haW5SZXF1ZXN0IGFuZCBpcyB0aGVcbiAgICAvLyBvbmx5IG9uZSBzdXBwb3J0ZWQgaGVyZS5cbiAgICB4Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0LiBTZW5kaW5nIGRhdGEgaXMgbm90IHN1cHBvcnRlZC5cbiAgICB4LnNlbmQobnVsbCk7XG4gICAgc2VudCA9IHRydWU7XG5cbiAgICByZXR1cm4geDtcbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGNvcnNsaXRlO1xuIiwidmFyIGNvcnNsaXRlID0gcmVxdWlyZSgnY29yc2xpdGUnKTtcblxuZnVuY3Rpb24gQ2xpZW50KHVybCkge1xuICB0aGlzLl91cmwgPSB1cmwgfHwgXCIvL3JvdXRlci5wcm9qZWN0LW9zcm0ub3JnXCI7XG4gIHRoaXMuX2xhc3RTZW5kID0gMDtcbiAgdGhpcy5fbGFzdFJlY2VpdmVkID0gMDtcbn1cblxuQ2xpZW50LnByb3RvdHlwZSA9IHtcbiAgX2Zvcm1hdExvY3M6IGZ1bmN0aW9uKGxhdExuZ3MpIHtcbiAgICByZXR1cm4gJ2xvYz0nICsgbGF0TG5ncy5tYXAoZnVuY3Rpb24oYykge3JldHVybiBjWzBdICsgJywnICsgY1sxXTsgfSApLmpvaW4oXCImbG9jPVwiKTtcbiAgfSxcblxuICBfb25SZXNwb25zZTogZnVuY3Rpb24oZXJyLCByZXNwb25zZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xuICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICB9LFxuXG4gIF9yZXF1ZXN0OiBmdW5jdGlvbihzZXJ2aWNlLCBlbmNvZGVkUGFyYW1zLCBjYWxsYmFjaykge1xuICAgIHZhciB1cmwgPSB0aGlzLl91cmwgKyAnLycgKyBzZXJ2aWNlICsgJz8nICsgZW5jb2RlZFBhcmFtcyxcbiAgICAgICAgcmVxTnVtYmVyID0gdGhpcy5fbGFzdFNlbmQrKztcbiAgICBjb3JzbGl0ZSh1cmwsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICBpZiAocmVxTnVtYmVyIDwgdGhpcy5fbGFzdFJlY2VpdmVkKSByZXR1cm47XG5cbiAgICAgIHRoaXMuX2xhc3RSZWNlaXZlZCA9IHJlcU51bWJlcjtcblxuICAgICAgdGhpcy5fb25SZXNwb25zZShlcnIsIHJlc3BvbnNlLCBjYWxsYmFjayk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBsb2NhdGU6IGZ1bmN0aW9uKGxhdExuZywgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yZXF1ZXN0KCdsb2NhdGUnLCAgdGhpcy5fZm9ybWF0TG9jcyhbbGF0TG5nXSksIGNhbGxiYWNrKTtcbiAgfSxcblxuICBuZWFyZXN0OiBmdW5jdGlvbihsYXRMbmcsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVxdWVzdCgnbmVhcmVzdCcsICB0aGlzLl9mb3JtYXRMb2NzKFtsYXRMbmddKSwgY2FsbGJhY2spO1xuICB9LFxuXG4gIG1hdGNoOiBmdW5jdGlvbihsYXRMbmdzLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlcXVlc3QoJ21hdGNoJywgIHRoaXMuX2Zvcm1hdExvY3MobGF0TG5ncyksIGNhbGxiYWNrKTtcbiAgfSxcblxuICByb3V0ZTogZnVuY3Rpb24obGF0TG5ncywgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yZXF1ZXN0KCd2aWFyb3V0ZScsICB0aGlzLl9mb3JtYXRMb2NzKGxhdExuZ3MpLCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgdGFibGU6IGZ1bmN0aW9uKGxhdExuZ3MsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVxdWVzdCgndGFibGUnLCAgdGhpcy5fZm9ybWF0TG9jcyhsYXRMbmdzKSwgY2FsbGJhY2spO1xuICB9LFxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbiIsInZhciBjbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC5qcycpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0gY2xpZW50O1xuIl19
(3)
});
;