var tape = require('tape'),
    OSRM = require('../src/osrm');

var testStreet = [52.4224, 13.333086];
var testCoords = [[52.519930,13.438640], [52.513191,13.415852]];
var traceCoordinates = [[52.542648,13.393252], [52.543079,13.394780], [52.542107,13.397389]];
var traceTimestamps = [1424684612, 1424684616, 1424684620];


tape('locate', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.locate(testStreet, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.mapped_coordinate);
  });
});

tape('nearest', function(t) {
  t.plan(3);

  var osrm = new OSRM();
  osrm.nearest(testStreet, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.mapped_coordinate);
    t.ok(response.name !== undefined);
  });
});

tape('viaroute', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.route({coordinates: testCoords}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.route_geometry);
  });
});

tape('match', function(t) {
  t.plan(4);

  var osrm = new OSRM();
  osrm.match({coordinates: traceCoordinates}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.matchings);
    t.ok(response.matchings.length > 0);
    t.deepEqual(response.matchings[0].matched_points, [[52.542648,13.393252],[52.543056,13.394707],[52.542107,13.397389]]);
  });
});

tape('match with timestamps', function(t) {
  t.plan(4);

  var osrm = new OSRM();
  osrm.match({coordinates: traceCoordinates, timestamps: traceTimestamps}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.matchings);
    t.ok(response.matchings.length > 0);
    t.deepEqual(response.matchings[0].matched_points, [[52.542648,13.393252],[52.543056,13.394707],[52.542107,13.397389]]);
  });
});

tape('match with timestamps and classification', function(t) {
  t.plan(5);

  var osrm = new OSRM();
  osrm.match({coordinates: traceCoordinates, timestamps: traceTimestamps, classify: true}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.matchings);
    t.ok(response.matchings.length > 0);
    t.deepEqual(response.matchings[0].matched_points, [[52.542648,13.393252],[52.543056,13.394707],[52.542107,13.397389]]);
    t.ok(response.matchings[0].confidence !== undefined);
  });
});

tape('table', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.table({coordinates: testCoords}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.distance_table);
  });
});
