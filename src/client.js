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
