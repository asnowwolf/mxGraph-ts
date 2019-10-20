export let mxMarker = {
  markers: [], addMarker(type, funct) {
    mxMarker.markers[type] = funct;
  }, createMarker(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
    const funct = mxMarker.markers[type];
    return (funct != null) ? funct(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) : null;
  },
};
