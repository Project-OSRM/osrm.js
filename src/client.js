var request = process.browser && require('browser-request') || require('request'),
    headers = process.browser && {} || {'User-Agent:': 'osrm-client-js/0.0.6'};

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

  _formatOptions: function(options) {
      var keyValue = [];
      for (var key in options) {
          keyValue.push(key + "=" + options[key]);
      }
      return keyValue.join("&");
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

  _filterOptions: function(options, keys) {
    var filtered = {};
    for (var k in options) {
        if (keys.indexOf(k) >= 0 ) {
          continue;
        }
        filtered[k] = options[k];
    }
    return filtered;
  },

  _joinParams: function(p1, p2) {
    if (p1 === "") return p2;
    if (p2 === "") return p1;

    return [p1, p2].join("&");
  },

  locate: function(latLng, callback) {
    this._request('locate',  this._formatLocs([latLng]), callback);
  },

  nearest: function(latLng, callback) {
    this._request('nearest',  this._formatLocs([latLng]), callback);
  },

  match: function(query, callback) {
    var options = this._filterOptions(query, ['coordinates', 'timestamps']);
    if (query.timestamps) {
      if (query.timestamps.length != query.coordinates.length)
      {
        callback(new Error("Invalid number of timestamps! Is " + query.timestamps.length + " should be: " + query.length));
      }
      this._request('match',  this._joinParams(this._formatStampedLocs(query.coordinates, query.timestamps), this._formatOptions(options)), callback);
    }
    else this._request('match',  this._joinParams(this._formatLocs(query.coordinates),this._formatOptions(options)), callback);
  },

  route: function(query, callback) {
    var options = this._filterOptions(query, ['coordinates']);
    this._request('viaroute',  this._joinParams(this._formatLocs(query.coordinates), this._formatOptions(options)), callback);
  },

  table: function(query, callback) {
    var options = this._filterOptions(query, ['coordinates']);
    this._request('table',  this._joinParams(this._formatLocs(query.coordinates), this._formatOptions(options)), callback);
  },
};

if (typeof module !== 'undefined') module.exports = Client;
