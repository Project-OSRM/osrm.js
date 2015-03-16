var request = process.browser && require('browser-request') || require('request'),
    headers = process.browser && {} || {'User-Agent:': 'osrm-client-js/0.0.5'};

function Client(url) {
  this._url = url || (process.browser && "" || "http:") + "//router.project-osrm.org";
}

Client.prototype = {
  _formatLocs: function(latLngs) {
    return 'loc=' + latLngs.map(function(c) {return c[0] + ',' + c[1]; } ).join("&loc=");
  },

  _formatStampedLocs: function(latLngs, timestamps) {
    var pairs = latLngs.map(function(c, i) { return [c[0]+','+c[1], timestamps[i]]; });
    return 'loc=' + pairs.map(function(p) { return p.join("&t="); } ).join("&loc=");
  },

  _onResponse: function(err, data, callback) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, data);
  },

  _request: function(service, encodedParams, callback) {
    var url = this._url + '/' + service + '?' + encodedParams;
    request.get({uri: url, json: true, headers: headers}, function (err, response, body) {

      this._onResponse(err, body, callback);
    }.bind(this));
  },

  locate: function(latLng, callback) {
    this._request('locate',  this._formatLocs([latLng]), callback);
  },

  nearest: function(latLng, callback) {
    this._request('nearest',  this._formatLocs([latLng]), callback);
  },

  match: function(query, callback) {
    if (query.timestamps) {
      if (query.timestamps.length != query.coordinates.length)
      {
        callback(new Error("Invalid number of timestamps! Is " + query.timestamps.length + " should be: " + query.length));
      }
      this._request('match',  this._formatStampedLocs(query.coordinates, query.timestamps), callback);
    }
    else this._request('match',  this._formatLocs(query.coordinates), callback);
  },

  route: function(query, callback) {
    this._request('viaroute',  this._formatLocs(query.coordinates), callback);
  },

  table: function(query, callback) {
    this._request('table',  this._formatLocs(query.coordinates), callback);
  },
};

if (typeof module !== 'undefined') module.exports = Client;
