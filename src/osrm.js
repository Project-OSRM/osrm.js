'use strict';

var http = require('http'),
    https = require('https'),
    qs = require('qs'),
    url = require('url');

function OSRM(arg) {
  this._url = 'https://router.project-osrm.org';
  this._profile = 'driving';

  if (typeof arg === 'string')
  {
      this._url = url;
  }
  else if (typeof arg === 'object')
  {
      this._url = arg.url || this._url;
      this._profile = arg.profile || this._profile;
  }
  else if (typeof arg !== 'undefined')
  {
    throw new Error('Argument must be string or options object');
  }

  var protocol = url.parse(this._url).protocol;
  if (protocol != "http:" && protocol != "https:")
  {
      throw new Error("Unsupported protocol: " + protocol);
  }

  this._get = function(url, callback) {
    if (protocol === "http:")
    {
      return http.get(url, callback);
    }
    else if (protocol == "https:")
    {
      return https.get(url, callback);
    }
    throw Error("No protocol handler found for " + protocol);
  }
}

OSRM.prototype = {
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

  _stringifyCoordinates: function(lonLats) {
    return lonLats.map(function(c) {return c[0] + ',' + c[1]; } ).join(';');
  },

  _stringifyOptionsArray: function(array) {
    array.map(function(value) { return value === null && '' || value; }).join(';')
  },

  _stringifyOptions: function(options) {
    // we use a different array encoding than the very wasteful QS encoding
    for (var key in options) {
      if (Array.isArray(options[key]))
      {
        options[key] = this._stringifyOptionsArray(options[key]);
      }
    }
    return qs.stringify(options);
  },

  _request: function(service, version, query, format, options, callback) {
    var url = this._url + '/' + service + '/' + version + '/' + this._profile + '/' + query + '.' + format;
    var option_string = this._stringifyOptions(options);
    if (option_string.length > 0)
    {
      url += '?' + option_string;
    }
    this._get(url, function (response) {
      var body = '';
      response.on('data', function(data) {
        body += data;
      });
      response.on('end', function() {
        if (format === 'json')
        {
          callback(null, JSON.parse(body));
        }
        else
        {
          callback(null, body);
        }
      });
    }).on('error', function(err) {
      callback(err);
    });
  },

  nearest: function(options, callback) {
    if (!options.coordinates) {
      throw new Error('No coordinates properties in options.');
    }
    if (options.coordinates.length != 1) {
      throw new Error('Only supports nearest queries for a single coordinate.');
    }
    var query = this._stringifyCoordinates(options.coordinates);
    options = this._filterOptions(options, ['coordinates']);
    this._request('nearest', 'v1', query, 'json', options, callback);
  },

  match: function(options, callback) {
    if (!options.coordinates) {
      throw new Error('No coordinates properties in options.');
    }
    if (options.coordinates.length < 2) {
      throw new Error('Needs at least two coordinates');
    }
    if (options.timestamps && options.coordinates.length != options.timestamps.length) {
      throw new Error('Timestamps array needs to be the same size as the coordinates array');
    }
    var query = this._stringifyCoordinates(options.coordinates);
    options = this._filterOptions(options, ['coordinates']);
    this._request('match', 'v1', query, 'json', options, callback);
  },

  route: function(options, callback) {
    if (!options.coordinates) {
      throw new Error('No coordinates properties in options.');
    }
    if (options.coordinates.length < 2) {
      throw new Error('Needs at least two coordinates');
    }

    var query = this._stringifyCoordinates(options.coordinates);
    options = this._filterOptions(options, ['coordinates']);
    this._request('route', 'v1', query, 'json', options, callback);
  },

  trip: function(options, callback) {
    if (!options.coordinates) {
      throw new Error('No coordinates properties in options.');
    }
    if (options.coordinates.length < 2) {
      throw new Error('Needs at least two coordinates');
    }

    var query = this._stringifyCoordinates(options.coordinates);
    options = this._filterOptions(options, ['coordinates']);
    this._request('trip', 'v1', query, 'json', options, callback);
  },

  table: function(options, callback) {
    if (!options.coordinates) {
      throw new Error('No coordinates properties in options.');
    }
    if (options.coordinates.length < 2) {
      throw new Error('Needs at least two coordinates');
    }

    var query = this._stringifyCoordinates(options.coordinates);
    options = this._filterOptions(options, ['coordinates']);
    this._request('table', 'v1', query, 'json', options, callback);
  },

  tile: function(xyz, callback) {
    var query = 'tile(' + xyz.join(',') + ')';
    this._request('tile', 'v1', query, 'mvt', {}, callback);
  },
};

if (typeof module !== 'undefined') module.exports = OSRM;
