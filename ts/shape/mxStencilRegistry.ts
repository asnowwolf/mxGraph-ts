export let mxStencilRegistry = {
  stencils: {}, addStencil(name, stencil) {
    mxStencilRegistry.stencils[name] = stencil;
  }, getStencil(name) {
    return mxStencilRegistry.stencils[name];
  },
};
