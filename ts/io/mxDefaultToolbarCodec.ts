export let mxDefaultToolbarCodec = mxCodecRegistry.register(function () {
  const codec = new mxObjectCodec(new mxDefaultToolbar());
  codec.encode = function (enc, obj) {
    return null;
  };
  codec.decode = function (dec, node, into) {
    if (into != null) {
      const editor = into.editor;
      node = node.firstChild;
      while (node != null) {
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
              let elt = null;
              if (action != null) {
                elt = into.addItem(as, icon, action, pressedIcon);
              } else if (mode != null) {
                const funct = (mxDefaultToolbarCodec.allowEval) ? mxUtils.eval(text) : null;
                elt = into.addMode(as, icon, mode, pressedIcon, funct);
              } else if (template != null || (text != null && text.length > 0)) {
                let cell = editor.templates[template];
                const style = node.getAttribute('style');
                if (cell != null && style != null) {
                  cell = editor.graph.cloneCell(cell);
                  cell.setStyle(style);
                }
                let insertFunction = null;
                if (text != null && text.length > 0 && mxDefaultToolbarCodec.allowEval) {
                  insertFunction = mxUtils.eval(text);
                }
                elt = into.addPrototype(as, icon, cell, pressedIcon, insertFunction, toggle);
              } else {
                const children = mxUtils.getChildNodes(node);
                if (children.length > 0) {
                  if (icon == null) {
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
                    let select = null;
                    const create = function () {
                      const template = editor.templates[select.value];
                      if (template != null) {
                        const clone = template.clone();
                        const style = select.options[select.selectedIndex].cellStyle;
                        if (style != null) {
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
              if (elt != null) {
                const id = node.getAttribute('id');
                if (id != null && id.length > 0) {
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
