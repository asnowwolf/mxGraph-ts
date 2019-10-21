import { mxDefaultToolbar } from '../editor/mxDefaultToolbar';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxLog } from '../util/mxLog';
import { mxResources } from '../util/mxResources';
import { mxUtils } from '../util/mxUtils';
import { mxCodecRegistry } from './mxCodecRegistry';
import { mxObjectCodec } from './mxObjectCodec';

export let mxDefaultToolbarCodec = mxCodecRegistry.register(function () {
  const codec = new mxObjectCodec(new mxDefaultToolbar());
  codec.encode = function (enc, obj) {
    return null;
  };
  codec.decode = function (dec, node, into) {
    if (!!into) {
      const editor = into.editor;
      node = node.firstChild;
      while (!!node) {
        if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {
          if (!this.processInclude(dec, node, into)) {
            if (node.nodeName == 'separator') {
              into.addSeparator();
            } else if (node.nodeName == 'br') {
              into.toolbar.addBreak();
            } else if (node.nodeName == 'hr') {
              into.toolbar.addLine();
            } else if (node.nodeName == 'add') {
              let as = node.getAttribute('as');
              as = mxResources.get(as) || as;
              const icon = node.getAttribute('icon');
              const pressedIcon = node.getAttribute('pressedIcon');
              const action = node.getAttribute('action');
              const mode = node.getAttribute('mode');
              const template = node.getAttribute('template');
              const toggle = node.getAttribute('toggle') != '0';
              const text = mxUtils.getTextContent(node);
              let elt = undefined;
              if (!!action) {
                elt = into.addItem(as, icon, action, pressedIcon);
              } else if (!!mode) {
                const funct = (mxDefaultToolbarCodec.allowEval) ? mxUtils.eval(text) : null;
                elt = into.addMode(as, icon, mode, pressedIcon, funct);
              } else if (!!template || (!!text && text.length > 0)) {
                let cell = editor.templates[template];
                const style = node.getAttribute('style');
                if (!!cell && !!style) {
                  cell = editor.graph.cloneCell(cell);
                  cell.setStyle(style);
                }
                let insertFunction = undefined;
                if (!!text && text.length > 0 && mxDefaultToolbarCodec.allowEval) {
                  insertFunction = mxUtils.eval(text);
                }
                elt = into.addPrototype(as, icon, cell, pressedIcon, insertFunction, toggle);
              } else {
                const children = mxUtils.getChildNodes(node);
                if (children.length > 0) {
                  if (!icon) {
                    const combo = into.addActionCombo(as);
                    for (let i = 0; i < children.length; i++) {
                      const child = children[i];
                      if (child.nodeName == 'separator') {
                        into.addOption(combo, '---');
                      } else if (child.nodeName == 'add') {
                        const lab = child.getAttribute('as');
                        const act = child.getAttribute('action');
                        into.addActionOption(combo, lab, act);
                      }
                    }
                  } else {
                    let select = undefined;
                    const create = function () {
                      const template = editor.templates[select.value];
                      if (!!template) {
                        const clone = template.clone();
                        const style = select.options[select.selectedIndex].cellStyle;
                        if (!!style) {
                          clone.setStyle(style);
                        }
                        return clone;
                      } else {
                        mxLog.warn('Template ' + template + ' not found');
                      }
                      return null;
                    };
                    const img = into.addPrototype(as, icon, create, null, null, toggle);
                    select = into.addCombo();
                    mxEvent.addListener(select, 'change', function () {
                      into.toolbar.selectMode(img, function (evt) {
                        const pt = mxUtils.convertPoint(editor.graph.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
                        return editor.addVertex(null, funct(), pt.x, pt.y);
                      });
                      into.toolbar.noReset = false;
                    });
                    for (let i = 0; i < children.length; i++) {
                      const child = children[i];
                      if (child.nodeName == 'separator') {
                        into.addOption(select, '---');
                      } else if (child.nodeName == 'add') {
                        const lab = child.getAttribute('as');
                        const tmp = child.getAttribute('template');
                        const option = into.addOption(select, lab, tmp || template);
                        option.cellStyle = child.getAttribute('style');
                      }
                    }
                  }
                }
              }
              if (!!elt) {
                const id = node.getAttribute('id');
                if (!!id && id.length > 0) {
                  elt.setAttribute('id', id);
                }
              }
            }
          }
        }
        node = node.nextSibling;
      }
    }
    return into;
  };
  return codec;
}());
