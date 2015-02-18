# osrm-client

Browser client library for [Open Source Routing Machine - OSRM](https://github.com/Project-OSRM/osrm-backend) that uses the REST http API.

The interface is compatible with [node-osrm](https://github.com/Project-OSRM/node-osrm).

# Example

```js
var OSRM = require('osrm-client')
var osrm = new OSRM("//router.project-osrm.org");

osrm.locate([52.4224,13.333086], function (err, result) {
  console.log(result);
  // Output: {"status":0,"mapped_coordinate":[52.422442,13.332101]}
});

osrm.nearest([52.4224, 13.333086], function (err, result) {
  console.log(result);
  // Output: {"status":0,"mapped_coordinate":[52.422590,13.333838],"name":"Mariannenstraße"}
});

osrm.table([52.4224, 13.333086], function (err, result) {
  console.log(result);
  // Output: {"distance_table":[[0,2207],[2175,0]]}
});

var query = {coordinates: [[52.519930,13.438640], [52.513191,13.415852]]};
osrm.route(query, function (err, result) {
  console.log(result);
  /* Output:
    { status: 0,
      status_message: 'Found route between points',
      route_geometry: '{~pdcBmjfsXsBrD{KhS}DvHyApCcf@l}@kg@z|@_MbX|GjHdXh^fm@dr@~\\l_@pFhF|GjCfeAbTdh@fFqRp}DoEn\\cHzR{FjLgCnFuBlG{AlHaAjJa@hLXtGnCnKtCnFxCfCvEl@lHBzA}@vIoFzCs@|CcAnEQ~NhHnf@zUpm@rc@d]zVrTnTr^~]xbAnaAhSnPgJd^kExPgOzk@maAx_Ek@~BuKvd@cJz`@oAzFiAtHvKzAlBXzNvB|b@hGl@Dha@zFbGf@fBAjQ_AxEbA`HxBtPpFpa@rO_Cv_B_ZlD}LlBGB',
      route_instructions:
       [ ... ],
      route_summary:
       { total_distance: 2814,
         total_time: 211,
         start_point: 'Friedenstraße',
         end_point: 'Am Köllnischen Park' },
      alternative_geometries: [],
      alternative_instructions: [],
      alternative_summaries: [],
      route_name:
       [ 'Lichtenberger Straße',
         'Holzmarktstraße' ],
      alternative_names: [ [ '', '' ] ],
      via_points:
       [ [ 52.519934, 13.438647 ],
         [ 52.513162, 13.415509 ] ],
      via_indices: [ 0, 69 ],
      alternative_indices: [],
      hint_data:
       { checksum: 222545162,
         locations:
          [ '9XkCAJgBAAAtAAAA____f7idcBkPGuw__mMhA7cOzQA',
            'TgcEAFwFAAAAAAAAVAAAANIeb5DqBHs_ikkhA1W0zAA' ] } }
  */
});
```

# Testing

    npm test
    firefox test.html # Check the console if tape tests worked

