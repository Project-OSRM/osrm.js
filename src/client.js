/* jshint: esnext: true */
import corslite from 'corslite';

export default class Client {
  constructor(url) {
    this._url = url || "//router.project-osrm.org";
    this._lastSend = 0;
    this._lastReceived = 0;
  }

  _formatLocs(latLngs) {
    return 'loc=' + latLngs.map(function(c) {return c[0] + ',' + c[1]; } ).join("&loc=");
  }

  _onResponse(err, response, callback) {
    if (err) {
      callback(err);
      return;
    }

    var data = JSON.parse(response.responseText);
    callback(null, data);
  }

  _request(service, encodedParams, callback) {
    var url = this._url + '/' + service + '?' + encodedParams,
        reqNumber = this._lastSend++;
    corslite(url, (err, response) => {
      if (reqNumber < this._lastReceived) return;

      this._lastReceived = reqNumber;

      this._onResponse(err, response, callback);
    });
  }

  locate(latLng, callback) {
    this._request('locate',  this._formatLocs([latLng]), callback);
  }

  nearest(latLng, callback) {
    this._request('nearest',  this._formatLocs([latLng]), callback);
  }

  match(latLngs, callback) {
    this._request('match',  this._formatLocs(latLngs), callback);
  }

  route(latLngs, callback) {
    this._request('viaroute',  this._formatLocs(latLngs), callback);
  }

  table(latLngs, callback) {
    this._request('table',  this._formatLocs(latLngs), callback);
  }
}
