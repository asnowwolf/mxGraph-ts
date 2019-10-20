export let mxStyleRegistry = {
  values: [], putValue(name, obj) {
    mxStyleRegistry.values[name] = obj;
  }, getValue(name) {
    return mxStyleRegistry.values[name];
  }, getName(value) {
    for (const key in mxStyleRegistry.values) {
      if (mxStyleRegistry.values[key] == value) {
        return key;
      }
    }
    return null;
  },
};
