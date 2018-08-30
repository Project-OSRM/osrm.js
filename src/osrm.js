'use strict';

var http = require('http'),
    https = require('https'),
    qs = require('qs'),
    Url = require('url');

function OSRM(arg) {
  this._url = 'https://router.project-osrm.org';
  this._profile = 'driving';
  this._timeout = 10000; // 10 seconds
  this._headers = {};

  if (typeof arg === 'string')
  {
      this._url = arg;
  }
  else if (Array.isArray(arg))
  {
    throw new Error('Argument must be string or options object');
  }
  else if (typeof arg === 'object')
  {
      this._url = arg.url || this._url;
      this._profile = arg.profile || this._profile;
      this._timeout = arg.timeout || this._timeout;
      this._headers = arg.headers || this._headers;
  }
  else if (typeof arg !== 'undefined')
  {
    throw new Error('Argument must be string or options object');
  }

  var protocol = Url.parse(this._url).protocol;
  if (protocol != "http:" && protocol != "https:")
  {
      throw new Error("Unsupported protocol: " + protocol);
  }

  this._get = function(url, callback) {
    console.log("URL : "+ url);
    var parsedUrl = Url.parse(url);
    var options = {
      protocol : parsedUrl.protocol,
      hostname : parsedUrl.hostname,
      port : parsedUrl.port,
      path : parsedUrl.path,
      headers : this._headers,
      timeout : this._timeout
    };
    if (protocol === "http:")
    {
      return http.get(options, callback);
    }
    else if (protocol == "https:")
    {
      return https.get(options, callback);
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
    return array.map(function(value) { return value === null && '' || value; }).join(';')
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

  _encodeUrl: function(service, version, query, format, options, callback) {
    var url = this._url + '/' + service + '/' + version + '/' + this._profile + '/' + query + '.' + format;
    var option_string = this._stringifyOptions(options);
    if (option_string.length > 0)
    {
      url += '?' + option_string;
    }
    return url;
  },

  request: function(arg, callback) {
    var url = (typeof arg === 'string') && (this._url + arg) ||
      this._encodeUrl(arg.service, arg.version, arg.query, arg.format, arg.options);

    var timeout = setTimeout(function() { callback(new Error("Request timed out")); }, this._timeout);

    this._get(url, function (response) {
      var body = '';
      response.on('data', function(data) {
        body += data;
      });
      response.on('end', function() {
        clearTimeout(timeout);
        if (response.headers['content-type'] === undefined)
        {
            return callback(new Error("Response does not have a content-type set."));
        }

        var format = response.headers['content-type'].split(";")[0];
        if (format === 'application/json')
        {
          callback(null, JSON.parse(body));
        }
        // unknonw, pass through
        else
        {
          callback(null, body);
        }
      });
    }).on('error', function(err) {
      clearTimeout(timeout);
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
    this.request({service: 'nearest', version: 'v1', query: query, format: 'json', options: options}, callback);
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
    this.request({service: 'match', version: 'v1', query: query, format: 'json', options: options}, callback);
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
    this.request({service: 'route', version: 'v1', query: query, format: 'json', options: options}, callback);
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
    this.request({service: 'trip', version: 'v1', query: query, format: 'json', options: options}, callback);
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
    this.request({service: 'table', version: 'v1', query: query, format: 'json', options: options}, callback);
  },

  tile: function(xyz, callback) {
    var query = 'tile(' + xyz.join(',') + ')';
    this.request({service: 'tile', version: 'v1', query: query, format: 'mvt', options: {}}, callback);
  },
};

if (typeof module !== 'undefined') module.exports = OSRM;
