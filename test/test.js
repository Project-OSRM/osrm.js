var tape = require('tape'),
    OSRM = require('../src/osrm');

var testStreet = [52.4224, 13.333086];
var testCoords = [[52.519930,13.438640], [52.513191,13.415852]];

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

/* TODO Enable if matching branch is merged
tape('match', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.match({coordinates: testCoords}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.traces);
  });
});

tape('match with timestamps', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.match({coordinates: testCoords, timestamps: [0, 1]}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.traces);
  });
});
*/

tape('table', function(t) {
  t.plan(2);

  var osrm = new OSRM();
  osrm.table({coordinates: testCoords}, function(error, response) {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.distance_table);
  });
});
