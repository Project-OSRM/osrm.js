var test = require('tape'),
    OSRM = require('../src/osrm');

var testStreet = [13.333086, 52.4224];
var testCoords = [[13.438640,52.519930], [13.415852,52.513191]];
var traceCoordinates = [[13.393252,52.542648], [13.394780,52.543079], [13.397389,52.542107]];
var traceTimestamps = [1424684612, 1424684616, 1424684620];

test('contructor', function(t) {
  t.plan(3);

  t.throws(function() {new OSRM([1, 2, 3]); });
  t.doesNotThrow(function() {new OSRM({url: "http://127.0.0.1:5000", profile: "bicycle", timeout: 2000});});
  t.doesNotThrow(function() {new OSRM("http://127.0.0.1:5000");});
});

test('request', function(t) {
  t.plan(11);

  var osrm = new OSRM();
  osrm.request('/route/v1/driving/13.438640,52.519930;13.415852,52.513191', function(error, response) {
    t.notOk(error);
    t.ok(response);
    t.ok(response.waypoints);
    t.ok(response.routes);
    t.ok(response.routes[0].geometry);
    t.ok(response.routes[0].distance > 0);
    t.ok(response.routes[0].duration > 0);
    t.ok(response.routes[0].legs);
    t.equal(response.routes[0].legs.length, 1);
    t.ok(response.routes[0].legs[0].duration > 0);
    t.ok(response.routes[0].legs[0].distance > 0);
  });
});

test('nearest', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.nearest({coordinates: [testStreet]}, function(error, response) {
    t.notOk(error);
    t.ok(response.waypoints);
  });
});

test('route with default parameters', function(t) {
  t.plan(10);

  var osrm = new OSRM();
  osrm.route({coordinates: testCoords}, function(error, response) {
    t.notOk(error);
    t.ok(response.waypoints);
    t.ok(response.routes);
    t.ok(response.routes[0].geometry);
    t.ok(response.routes[0].distance > 0);
    t.ok(response.routes[0].duration > 0);
    t.ok(response.routes[0].legs);
    t.equal(response.routes[0].legs.length, 1);
    t.ok(response.routes[0].legs[0].duration > 0);
    t.ok(response.routes[0].legs[0].distance > 0);
  });
});

test('route with steps', function(t) {
  t.plan(11);

  var osrm = new OSRM();
  osrm.route({coordinates: testCoords, steps: true}, function(error, response) {
    t.notOk(error);
    t.ok(response.waypoints);
    t.ok(response.routes);
    t.ok(response.routes[0].geometry);
    t.ok(response.routes[0].distance > 0);
    t.ok(response.routes[0].duration > 0);
    t.ok(response.routes[0].legs);
    t.equal(response.routes[0].legs.length, 1);
    t.ok(response.routes[0].legs[0].duration > 0);
    t.ok(response.routes[0].legs[0].distance > 0);
    // at leats arrive + depart
    t.ok(response.routes[0].legs[0].steps.length >= 2);
  });
});

test('match', function(t) {
  t.plan(12);

  var osrm = new OSRM();
  osrm.match({coordinates: traceCoordinates}, function(error, response) {
    t.notOk(error);
    t.equal(response.code, "Ok");
    t.ok(response.matchings);
    t.ok(response.matchings.length > 0);
    t.ok(response.tracepoints);
    var reference_locations = [[13.393225, 52.542685], [13.39474, 52.543068], [13.397412, 52.542076]];
    response.tracepoints.forEach(function (tp, index) {
      t.ok(tp);
      t.deepEqual(tp.location, reference_locations[index]);
    });
    t.ok(response.matchings[0].confidence !== undefined);
  });
});

test('match with timestamps and classification', function(t) {
  t.plan(12);

  var osrm = new OSRM();
  osrm.match({coordinates: traceCoordinates, timestamps: traceTimestamps}, function(error, response) {
    t.notOk(error);
    t.equal(response.code, "Ok");
    t.ok(response.matchings);
    t.ok(response.matchings.length > 0);
    t.ok(response.tracepoints);
    var reference_locations = [[13.393225, 52.542685], [13.39474, 52.543068], [13.397412, 52.542076]];
    response.tracepoints.forEach(function (tp, index) {
      t.ok(tp);
      t.deepEqual(tp.location, reference_locations[index]);
    });
    t.ok(response.matchings[0].confidence !== undefined);
  });
});

test('table', function(t) {
  t.plan(7);

  var osrm = new OSRM();
  osrm.table({coordinates: testCoords}, function(error, response) {
    t.notOk(error);
    t.equal(response.code, "Ok");
    t.ok(response.durations);
    t.equal(response.durations.length, 2);
    t.equal(response.durations[0].length, 2);
    t.equal(response.durations[0][0], 0);
    t.equal(response.durations[1][1], 0);
  });
});

test('trip', function(t) {
  t.plan(4);

  var osrm = new OSRM();
  osrm.trip({coordinates: testCoords}, function(error, response) {
    t.notOk(error);
    t.equal(response.code, "Ok");
    t.ok(response.waypoints);
    t.ok(response.trips);
  });
});

test('tile', function(assert) {
  assert.plan(2);
  var osrm = new OSRM();
  osrm.tile([17603, 10747, 15], function(err, result) {
    assert.ifError(err);
    var reference = 48768.;
    var ratio = Math.round(Math.abs(1 - result.length / reference) * 100);
    assert.ok(ratio < 10);
  });
});

