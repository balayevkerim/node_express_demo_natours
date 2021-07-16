export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmFsYXlldmtlcmltIiwiYSI6ImNra3B6czBlcjAybmcydnAxYjF5djhqZnUifQ.tCpBv5cJ5xYGhUX-nqfmxA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/balayevkerim/ckkq084ex1s4z17t9sd2d2zyn',
    interactive: false,
  });
};
