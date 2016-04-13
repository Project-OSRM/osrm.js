# osrm.js

[![Build Status](https://travis-ci.org/Project-OSRM/osrm.js.svg?branch=master)](https://travis-ci.org/Project-OSRM/osrm.js)

Client library for [Open Source Routing Machine - OSRM](https://github.com/Project-OSRM/osrm-backend) that uses the REST http API
that is exposed by ```osrm-routed```.

The interface is compatible with [node-osrm](https://github.com/Project-OSRM/node-osrm). However it is not meant as
replacement for ```node-osrm``` on the server.

Can be used with NodeJS and with browserify.

# Example

```js
var OSRM = require('osrm.js');

var osrm = new OSRM("https://router.project-osrm.org");

osrm.route({
      coordinates: [[52.519930,13.438640], [52.513191,13.415852]],
      steps: true,
      alternatives: false,
      overview: 'simplified',
      geometry: 'polyline'
   }, function(err, result) {
   console.log(result);
});

osrm.trip({
      coordinates: [[52.519930,13.438640], [52.513191,13.415852]],
      steps: true,
      overview: 'simplified',
      geometry: 'polyline'
   }, function(err, result) {
   console.log(result);
});

osrm.match({
      coordinates: [[52.519930,13.438640], [52.513191,13.415852]],
      timestamps: [1460585940, 1460585945],
      steps: true,
      overview: 'simplified',
      geometry: 'polyline'
   }, function(err, result) {
   console.log(result);
});

osrm.table({
      coordinates: [[52.519930,13.438640], [52.513191,13.415852], [52.4224, 13.333086]],
      sources: [0],
      destinations: [1, 2]
   }, function(err, result) {
   console.log(result);
});

osrm.tile([17603, 10747, 15], function(err, result) {
   console.log(result); // pbf encoded vector tile
});
```

# Testing

```
npm test # run node tape tests
firefox test.html # check the console if tape tests worked
```

