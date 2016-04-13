# osrm.js

Client library for [Open Source Routing Machine - OSRM](https://github.com/Project-OSRM/osrm-backend) that uses the REST http API
that is exposed by ```osrm-routed```.

The interface is compatible with [node-osrm](https://github.com/Project-OSRM/node-osrm). However it is not meant as
replacement for ```node-osrm``` on the server.

Can be used with NodeJS and with browserify.

# Testing

```
npm test # run node tape tests
firefox test.html # check the console if tape tests worked
```

