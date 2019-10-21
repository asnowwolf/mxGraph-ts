import { mxUtils } from './mxUtils';

export let mxObjectIdentity = {
  FIELD_NAME: 'mxObjectId', counter: 0, get(obj) {
    if (!!obj) {
      if (!obj[mxObjectIdentity.FIELD_NAME]) {
        if (typeof obj === 'object') {
          const ctor = mxUtils.getFunctionName(obj.constructor);
          obj[mxObjectIdentity.FIELD_NAME] = ctor + '#' + mxObjectIdentity.counter++;
        } else if (typeof obj === 'function') {
          obj[mxObjectIdentity.FIELD_NAME] = 'Function#' + mxObjectIdentity.counter++;
        }
      }
      return obj[mxObjectIdentity.FIELD_NAME];
    }
    return null;
  }, clear(obj) {
    if (typeof (obj) === 'object' || typeof obj === 'function') {
      delete obj[mxObjectIdentity.FIELD_NAME];
    }
  },
};
