import tape from 'tape';
import OSRM from '../src/osrm';

let testStreet = [52.4224, 13.333086];
let testCoords = [[52.519930,13.438640], [52.513191,13.415852]];

tape('locate', t => {
  t.plan(2);

  let osrm = new OSRM();
  osrm.locate(testStreet, (error, response) => {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.mapped_coordinate);
  });
});

tape('nearest', t => {
  t.plan(3);

  let osrm = new OSRM();
  osrm.nearest(testStreet, (error, response) => {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.mapped_coordinate);
    t.ok(response.name !== undefined);
  });
});

tape('viaroute', t => {
  t.plan(2);

  let osrm = new OSRM();
  osrm.route(testCoords, (error, response) => {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.route_geometry);
  });
});

/* TODO Enable if matching branch is merged
tape('match', t => {
  t.plan(1);

  let osrm = new OSRM();
  osrm.match(testCoords, (error, response) => {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.traces);
  });
});
*/

tape('table', t => {
  t.plan(2);

  let osrm = new OSRM();
  osrm.table(testCoords, (error, response) => {
    console.log("Response: " + JSON.stringify(response));
    t.notOk(error);
    t.ok(response.distance_table);
  });
});
