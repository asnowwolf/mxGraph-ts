import { mxConstants } from '../util/mxConstants';
import { mxLog } from '../util/mxLog';
import { mxUtils } from '../util/mxUtils';
import { mxStyleRegistry } from '../view/mxStyleRegistry';
import { mxStylesheet } from '../view/mxStylesheet';
import { mxCodecRegistry } from './mxCodecRegistry';
import { mxObjectCodec } from './mxObjectCodec';

export let mxStylesheetCodec = mxCodecRegistry.register(function () {
  const codec = new mxObjectCodec(new mxStylesheet());
  codec.encode = function (enc, obj) {
    const node = enc.document.createElement(this.getName());
    for (const i in obj.styles) {
      const style = obj.styles[i];
      const styleNode = enc.document.createElement('add');
      if (!!i) {
        styleNode.setAttribute('as', i);
        for (const j in style) {
          const value = this.getStringValue(j, style[j]);
          if (!!value) {
            const entry = enc.document.createElement('add');
            entry.setAttribute('value', value);
            entry.setAttribute('as', j);
            styleNode.appendChild(entry);
          }
        }
        if (styleNode.childNodes.length > 0) {
          node.appendChild(styleNode);
        }
      }
    }
    return node;
  };
  codec.getStringValue = function (key, value) {
    const type = typeof (value);
    if (type == 'function') {
      value = mxStyleRegistry.getName(value);
    } else if (type == 'object') {
      value = undefined;
    }
    return value;
  };
  codec.decode = function (dec, node, into) {
    const obj = into || new this.template.constructor();
    const id = node.getAttribute('id');
    if (!!id) {
      dec.objects[id] = obj;
    }
    node = node.firstChild;
    while (!!node) {
      if (!this.processInclude(dec, node, obj) && node.nodeName == 'add') {
        const as = node.getAttribute('as');
        if (!!as) {
          const extend = node.getAttribute('extend');
          let style = (!!extend) ? mxUtils.clone(obj.styles[extend]) : null;
          if (!style) {
            if (!!extend) {
              mxLog.warn('mxStylesheetCodec.decode: stylesheet ' + extend + ' not found to extend');
            }
            style = {};
          }
          let entry = node.firstChild;
          while (!!entry) {
            if (entry.nodeType == mxConstants.NODETYPE_ELEMENT) {
              const key = entry.getAttribute('as');
              if (entry.nodeName == 'add') {
                const text = mxUtils.getTextContent(entry);
                let value = undefined;
                if (!!text && text.length > 0 && mxStylesheetCodec.allowEval) {
                  value = mxUtils.eval(text);
                } else {
                  value = entry.getAttribute('value');
                  if (mxUtils.isNumeric(value)) {
                    value = parseFloat(value);
                  }
                }
                if (!!value) {
                  style[key] = value;
                }
              } else if (entry.nodeName == 'remove') {
                delete style[key];
              }
            }
            entry = entry.nextSibling;
          }
          obj.putCellStyle(as, style);
        }
      }
      node = node.nextSibling;
    }
    return obj;
  };
  return codec;
}());
