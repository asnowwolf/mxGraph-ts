export let mxCodecRegistry = {
  codecs: [], aliases: [], register(codec) {
    if (codec != null) {
      const name = codec.getName();
      mxCodecRegistry.codecs[name] = codec;
      const classname = mxUtils.getFunctionName(codec.template.constructor);
      if (classname != name) {
        mxCodecRegistry.addAlias(classname, name);
      }
    }
    return codec;
  }, addAlias(classname, codecname) {
    mxCodecRegistry.aliases[classname] = codecname;
  }, getCodec(ctor) {
    let codec = null;
    if (ctor != null) {
      let name = mxUtils.getFunctionName(ctor);
      const tmp = mxCodecRegistry.aliases[name];
      if (tmp != null) {
        name = tmp;
      }
      codec = mxCodecRegistry.codecs[name];
      if (codec == null) {
        try {
          codec = new mxObjectCodec(new ctor());
          mxCodecRegistry.register(codec);
        } catch (e) {
        }
      }
    }
    return codec;
  },
};
