/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 * @param editor {Editor}
 * @param container {HTMLElement}
 * @param lightbox {boolean}
 * @class
 * @extends {mxEventSource}
 */
export class EditorUi {
  constructor(editor, container, lightbox) {
    mxEventSource.call(this);
    this.destroyFunctions = [];
    this.editor = editor || new Editor();
    this.container = container || document.body;
    var graph = this.editor.graph;
    graph.lightbox = lightbox;
    if (graph.useCssTransforms) {
      this.lazyZoomDelay =;
    }
    if (mxClient.IS_SVG) {
      mxPopupMenu.prototype.submenuImage =;
    } else {
      new Image().src = mxPopupMenu.prototype.submenuImage;
    }
    if (!mxClient.IS_SVG && mxConnectionHandler.prototype.connectImage != null) {
      new Image().src = mxConnectionHandler.prototype.connectImage.src;
    }
    if (this.editor.chromeless && !this.editor.editable) {
      this.footerHeight =;
      graph.isEnabled = function () {
        return false;
      };
      graph.panningHandler.isForcePanningEvent = function (me) {
        return !mxEvent.isPopupTrigger(me.getEvent());
      };
    }
    this.actions = new Actions(this);
    this.menus = this.createMenus();
    if (!graph.standalone) {
      this.createDivs();
      this.createUi();
      this.refresh();
      var textEditing = mxUtils.bind(this, function (evt) {
        if (evt == null) {
          evt = window.event;
        }
        return graph.isEditing() || (evt != null && this.isSelectionAllowed(evt));
      });
      if (this.container == document.body) {
        this.menubarContainer.onselectstart = textEditing;
        this.menubarContainer.onmousedown = textEditing;
        this.toolbarContainer.onselectstart = textEditing;
        this.toolbarContainer.onmousedown = textEditing;
        this.diagramContainer.onselectstart = textEditing;
        this.diagramContainer.onmousedown = textEditing;
        this.sidebarContainer.onselectstart = textEditing;
        this.sidebarContainer.onmousedown = textEditing;
        this.formatContainer.onselectstart = textEditing;
        this.formatContainer.onmousedown = textEditing;
        this.footerContainer.onselectstart = textEditing;
        this.footerContainer.onmousedown = textEditing;
        if (this.tabContainer != null) {
          this.tabContainer.onselectstart = textEditing;
        }
      }
      if (!this.editor.chromeless || this.editor.editable) {
        var linkHandler = function (evt) {
          if (evt != null) {
            var source = mxEvent.getSource(evt);
            if (source.nodeName ==) {
              while (source != null) {
                if (source.className ==) {
                  return true;
                }
                source = source.parentNode;
              }
            }
          }
          return textEditing(evt);
        };
        if (mxClient.IS_IE && (typeof (document.documentMode) === || document.documentMode <)) {
          mxEvent.addListener(this.diagramContainer, , linkHandler);
        } else {
          this.diagramContainer.oncontextmenu = linkHandler;
        }
      } else {
        graph.panningHandler.usePopupTrigger = false;
      }
      graph.init(this.diagramContainer);
      if (mxClient.IS_SVG && graph.view.getDrawPane() != null) {
        var root = graph.view.getDrawPane().ownerSVGElement;
        if (root != null) {
          root.style.position =;
        }
      }
      this.hoverIcons = this.createHoverIcons();
      mxEvent.addListener(this.diagramContainer, , mxUtils.bind(this, function (evt) {
        var off = mxUtils.getOffset(this.diagramContainer);
        if (mxEvent.getClientX(evt) - off.x - this.diagramContainer.clientWidth > || mxEvent.getClientY(evt) - off.y - this.diagramContainer.clientHeight >) {
          this.diagramContainer.setAttribute(, mxResources.get());
        } else {
          this.diagramContainer.removeAttribute();
        }
      }));
      var spaceKeyPressed = false;
      var hoverIconsIsResetEvent = this.hoverIcons.isResetEvent;
      this.hoverIcons.isResetEvent = function (evt, allowShift) {
        return spaceKeyPressed || hoverIconsIsResetEvent.apply(this, arguments);
      };
      this.keydownHandler = mxUtils.bind(this, function (evt) {
        if (evt.which ==) {
          spaceKeyPressed = true;
          this.hoverIcons.reset();
          graph.container.style.cursor =;
          if (!graph.isEditing() && mxEvent.getSource(evt) == graph.container) {
            mxEvent.consume(evt);
          }
        } else if (!mxEvent.isConsumed(evt) && evt.keyCode ==) {
          this.hideDialog(null, true);
        }
      });
      mxEvent.addListener(document, , this.keydownHandler);
      this.keyupHandler = mxUtils.bind(this, function (evt) {
        graph.container.style.cursor =;
        spaceKeyPressed = false;
      });
      mxEvent.addListener(document, , this.keyupHandler);
      var panningHandlerIsForcePanningEvent = graph.panningHandler.isForcePanningEvent;
      graph.panningHandler.isForcePanningEvent = function (me) {
        return panningHandlerIsForcePanningEvent.apply(this, arguments) || spaceKeyPressed || (mxEvent.isMouseEvent(me.getEvent()) && (this.usePopupTrigger || !mxEvent.isPopupTrigger(me.getEvent())) && ((!mxEvent.isControlDown(me.getEvent()) && mxEvent.isRightMouseButton(me.getEvent())) || mxEvent.isMiddleMouseButton(me.getEvent())));
      };
      var cellEditorIsStopEditingEvent = graph.cellEditor.isStopEditingEvent;
      graph.cellEditor.isStopEditingEvent = function (evt) {
        return cellEditorIsStopEditingEvent.apply(this, arguments) || (evt.keyCode == && ((!mxClient.IS_SF && mxEvent.isControlDown(evt)) || (mxClient.IS_MAC && mxEvent.isMetaDown(evt)) || (mxClient.IS_SF && mxEvent.isShiftDown(evt))));
      };
      var textMode = false;
      var fontMenu = null;
      var sizeMenu = null;
      var nodes = null;
      var updateToolbar = mxUtils.bind(this, function () {
        if (this.toolbar != null && textMode != graph.cellEditor.isContentEditing()) {
          var node = this.toolbar.container.firstChild;
          var newNodes = [];
          while (node != null) {
            var tmp = node.nextSibling;
            if (mxUtils.indexOf(this.toolbar.staticElements, node) <) {
              node.parentNode.removeChild(node);
              newNodes.push(node);
            }
            node = tmp;
          }
          var tmp1 = this.toolbar.fontMenu;
          var tmp2 = this.toolbar.sizeMenu;
          if (nodes == null) {
            this.toolbar.createTextToolbar();
          } else {
            for (var i =; i < nodes.length; i++) {
              this.toolbar.container.appendChild(nodes[i]);
            }
            this.toolbar.fontMenu = fontMenu;
            this.toolbar.sizeMenu = sizeMenu;
          }
          textMode = graph.cellEditor.isContentEditing();
          fontMenu = tmp1;
          sizeMenu = tmp2;
          nodes = newNodes;
        }
      });
      var ui = this;
      var cellEditorStartEditing = graph.cellEditor.startEditing;
      graph.cellEditor.startEditing = function () {
        cellEditorStartEditing.apply(this, arguments);
        updateToolbar();
        if (graph.cellEditor.isContentEditing()) {
          var updating = false;
          var updateCssHandler = function () {
            if (!updating) {
              updating = true;
              window.setTimeout(function () {
                var selectedElement = graph.getSelectedElement();
                var node = selectedElement;
                while (node != null && node.nodeType != mxConstants.NODETYPE_ELEMENT) {
                  node = node.parentNode;
                }
                if (node != null) {
                  var css = mxUtils.getCurrentStyle(node);
                  if (css != null && ui.toolbar != null) {
                    var ff = css.fontFamily;
                    if (ff.charAt() ==) {
                      ff = ff.substring();
                    }
                    if (ff.charAt(ff.length -) ==) {
                      ff = ff.substring(, ff.length -);
                    }
                    ui.toolbar.setFontName(ff);
                    ui.toolbar.setFontSize(parseInt(css.fontSize));
                  }
                }
                updating = false;
              });
            }
          };
          mxEvent.addListener(graph.cellEditor.textarea, , updateCssHandler);
          mxEvent.addListener(graph.cellEditor.textarea, , updateCssHandler);
          mxEvent.addListener(graph.cellEditor.textarea, , updateCssHandler);
          mxEvent.addListener(graph.cellEditor.textarea, , updateCssHandler);
          updateCssHandler();
        }
      };
      var cellEditorStopEditing = graph.cellEditor.stopEditing;
      graph.cellEditor.stopEditing = function (cell, trigger) {
        cellEditorStopEditing.apply(this, arguments);
        updateToolbar();
      };
      graph.container.setAttribute(,);
      graph.container.style.cursor =;
      if (window.self === window.top && graph.container.parentNode != null) {
        try {
          graph.container.focus();
        } catch (e) {
        }
      }
      var graphFireMouseEvent = graph.fireMouseEvent;
      graph.fireMouseEvent = function (evtName, me, sender) {
        if (evtName == mxEvent.MOUSE_DOWN) {
          this.container.focus();
        }
        graphFireMouseEvent.apply(this, arguments);
      };
      graph.popupMenuHandler.autoExpand = true;
      if (this.menus != null) {
        graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function (menu, cell, evt) {
          this.menus.createPopupMenu(menu, cell, evt);
        });
      }
      mxEvent.addGestureListeners(document, mxUtils.bind(this, function (evt) {
        graph.popupMenuHandler.hideMenu();
      }));
      this.keyHandler = this.createKeyHandler(editor);
      this.getKeyHandler = function () {
        return keyHandler;
      };
      var styles = [, , , , , ];
      var connectStyles = [, , , , , , ];
      this.setDefaultStyle = function (cell) {
        try {
          var state = graph.view.getState(cell);
          if (state != null) {
            var clone = cell.clone();
            clone.style =;
            var defaultStyle = graph.getCellStyle(clone);
            var values = [];
            var keys = [];
            for (var key in state.style) {
              if (defaultStyle[key] != state.style[key]) {
                values.push(state.style[key]);
                keys.push(key);
              }
            }
            var cellStyle = graph.getModel().getStyle(state.cell);
            var tokens = (cellStyle != null) ? cellStyle.split() : [];
            for (var i =; i < tokens.length; i++) {
              var tmp = tokens[i];
              var pos = tmp.indexOf();
              if (pos >=) {
                var key = tmp.substring(, pos);
                var value = tmp.substring(pos +);
                if (defaultStyle[key] != null && value ==) {
                  values.push(value);
                  keys.push(key);
                }
              }
            }
            if (graph.getModel().isEdge(state.cell)) {
              graph.currentEdgeStyle = {};
            } else {
              graph.currentVertexStyle = {};
            }
            this.fireEvent(new mxEventObject(, , keys, , values, , [state.cell]));
          }
        } catch (e) {
          this.handleError(e);
        }
      };
      this.clearDefaultStyle = function () {
        graph.currentEdgeStyle = mxUtils.clone(graph.defaultEdgeStyle);
        graph.currentVertexStyle = mxUtils.clone(graph.defaultVertexStyle);
        this.fireEvent(new mxEventObject(, , [], , [], , []));
      };
      var valueStyles = [, ];
      var alwaysEdgeStyles = [, , , , , ];
      var keyGroups = [[, , , , , , ], [], [], valueStyles, [], [], []];
      for (var i =; i < keyGroups.length; i++) {
        for (var j =; j < keyGroups[i].length; j++) {
          styles.push(keyGroups[i][j]);
        }
      }
      for (var i =; i < connectStyles.length; i++) {
        if (mxUtils.indexOf(styles, connectStyles[i]) <) {
          styles.push(connectStyles[i]);
        }
      }
      var insertHandler = function (cells, asText) {
        var model = graph.getModel();
        model.beginUpdate();
        try {
          if (asText) {
            var edge = model.isEdge(cell);
            var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
            var textStyles = [, ];
            for (var j =; j < textStyles.length; j++) {
              var value = current[textStyles[j]];
              if (value != null) {
                graph.setCellStyles(textStyles[j], value, cells);
              }
            }
          } else {
            for (var i =; i < cells.length; i++) {
              var cell = cells[i];
              var cellStyle = model.getStyle(cell);
              var tokens = (cellStyle != null) ? cellStyle.split() : [];
              var appliedStyles = styles.slice();
              for (var j =; j < tokens.length; j++) {
                var tmp = tokens[j];
                var pos = tmp.indexOf();
                if (pos >=) {
                  var key = tmp.substring(, pos);
                  var index = mxUtils.indexOf(appliedStyles, key);
                  if (index >=) {
                    appliedStyles.splice(index);
                  }
                  for (var k =; k < keyGroups.length; k++) {
                    var group = keyGroups[k];
                    if (mxUtils.indexOf(group, key) >=) {
                      for (var l =; l < group.length; l++) {
                        var index2 = mxUtils.indexOf(appliedStyles, group[l]);
                        if (index2 >=) {
                          appliedStyles.splice(index2);
                        }
                      }
                    }
                  }
                }
              }
              var edge = model.isEdge(cell);
              var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
              var newStyle = model.getStyle(cell);
              for (var j =; j < appliedStyles.length; j++) {
                var key = appliedStyles[j];
                var styleValue = current[key];
                if (styleValue != null && (key != || edge)) {
                  if (!edge || mxUtils.indexOf(connectStyles, key) <) {
                    newStyle = mxUtils.setStyle(newStyle, key, styleValue);
                  }
                }
              }
              model.setStyle(cell, newStyle);
            }
          }
        } finally {
          model.endUpdate();
        }
      };
      graph.addListener(, function (sender, evt) {
        insertHandler(evt.getProperty());
      });
      graph.addListener(, function (sender, evt) {
        insertHandler(evt.getProperty(), true);
      });
      graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
        var cells = [evt.getProperty()];
        if (evt.getProperty()) {
          cells.push(evt.getProperty());
        }
        insertHandler(cells);
      });
      this.addListener(, mxUtils.bind(this, function (sender, evt) {
        var cells = evt.getProperty();
        var vertex = false;
        var edge = false;
        if (cells.length >) {
          for (var i =; i < cells.length; i++) {
            vertex = graph.getModel().isVertex(cells[i]) || vertex;
            edge = graph.getModel().isEdge(cells[i]) || edge;
            if (edge && vertex) {
              break;
            }
          }
        } else {
          vertex = true;
          edge = true;
        }
        var keys = evt.getProperty();
        var values = evt.getProperty();
        for (var i =; i < keys.length; i++) {
          var common = mxUtils.indexOf(valueStyles, keys[i]) >=;
          if (keys[i] != || (values[i] != null && values[i] !=)) {
            if (mxUtils.indexOf(connectStyles, keys[i]) >=) {
              if (edge || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >=) {
                if (values[i] == null) {
                  delete graph.currentEdgeStyle[keys[i]];
                } else {
                  graph.currentEdgeStyle[keys[i]] = values[i];
                }
              } else if (vertex && mxUtils.indexOf(styles, keys[i]) >=) {
                if (values[i] == null) {
                  delete graph.currentVertexStyle[keys[i]];
                } else {
                  graph.currentVertexStyle[keys[i]] = values[i];
                }
              }
            } else if (mxUtils.indexOf(styles, keys[i]) >=) {
              if (vertex || common) {
                if (values[i] == null) {
                  delete graph.currentVertexStyle[keys[i]];
                } else {
                  graph.currentVertexStyle[keys[i]] = values[i];
                }
              }
              if (edge || common || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >=) {
                if (values[i] == null) {
                  delete graph.currentEdgeStyle[keys[i]];
                } else {
                  graph.currentEdgeStyle[keys[i]] = values[i];
                }
              }
            }
          }
        }
        if (this.toolbar != null) {
          this.toolbar.setFontName(graph.currentVertexStyle[] || Menus.prototype.defaultFont);
          this.toolbar.setFontSize(graph.currentVertexStyle[] || Menus.prototype.defaultFontSize);
          if (this.toolbar.edgeStyleMenu != null) {
            var edgeStyleDiv = this.toolbar.edgeStyleMenu.getElementsByTagName()[];
            if (graph.currentEdgeStyle[] == && graph.currentEdgeStyle[] ==) {
              edgeStyleDiv.className =;
            } else if (graph.currentEdgeStyle[] == || graph.currentEdgeStyle[] == || graph.currentEdgeStyle[] == null) {
              edgeStyleDiv.className =;
            } else if (graph.currentEdgeStyle[] ==) {
              edgeStyleDiv.className =;
            } else if (graph.currentEdgeStyle[] ==) {
              edgeStyleDiv.className = +((graph.currentEdgeStyle[] ==) ? :);
            } else if (graph.currentEdgeStyle[] ==) {
              edgeStyleDiv.className = +((graph.currentEdgeStyle[] ==) ? :);
            } else {
              edgeStyleDiv.className =;
            }
          }
          if (this.toolbar.edgeShapeMenu != null) {
            var edgeShapeDiv = this.toolbar.edgeShapeMenu.getElementsByTagName()[];
            if (graph.currentEdgeStyle[] ==) {
              edgeShapeDiv.className =;
            } else if (graph.currentEdgeStyle[] ==) {
              edgeShapeDiv.className =;
            } else if (graph.currentEdgeStyle[] ==) {
              edgeShapeDiv.className =;
            } else {
              edgeShapeDiv.className =;
            }
          }
          if (this.toolbar.lineStartMenu != null) {
            var lineStartDiv = this.toolbar.lineStartMenu.getElementsByTagName()[];
            lineStartDiv.className = this.getCssClassForMarker(, graph.currentEdgeStyle[], graph.currentEdgeStyle[mxConstants.STYLE_STARTARROW], mxUtils.getValue(graph.currentEdgeStyle ,));
          }
          if (this.toolbar.lineEndMenu != null) {
            var lineEndDiv = this.toolbar.lineEndMenu.getElementsByTagName()[];
            lineEndDiv.className = this.getCssClassForMarker(, graph.currentEdgeStyle[], graph.currentEdgeStyle[mxConstants.STYLE_ENDARROW], mxUtils.getValue(graph.currentEdgeStyle ,));
          }
        }
      }));
      if (this.toolbar != null) {
        var update = mxUtils.bind(this, function () {
          var ff = graph.currentVertexStyle[] ||;
          var fs = String(graph.currentVertexStyle[] ||);
          var state = graph.getView().getState(graph.getSelectionCell());
          if (state != null) {
            ff = state.style[mxConstants.STYLE_FONTFAMILY] || ff;
            fs = state.style[mxConstants.STYLE_FONTSIZE] || fs;
            if (ff.length >) {
              ff = ff.substring(,) +;
            }
          }
          this.toolbar.setFontName(ff);
          this.toolbar.setFontSize(fs);
        });
        graph.getSelectionModel().addListener(mxEvent.CHANGE, update);
        graph.getModel().addListener(mxEvent.CHANGE, update);
      }
      graph.addListener(mxEvent.CELLS_ADDED, function (sender, evt) {
        var cells = evt.getProperty();
        var parent = evt.getProperty();
        if (graph.getModel().isLayer(parent) && !graph.isCellVisible(parent) && cells != null && cells.length >) {
          graph.getModel().setVisible(parent, true);
        }
      });
      this.gestureHandler = mxUtils.bind(this, function (evt) {
        if (this.currentMenu != null && mxEvent.getSource(evt) != this.currentMenu.div) {
          this.hideCurrentMenu();
        }
      });
      mxEvent.addGestureListeners(document, this.gestureHandler);
      this.resizeHandler = mxUtils.bind(this, function () {
        window.setTimeout(mxUtils.bind(this, function () {
          if (this.editor.graph != null) {
            this.refresh();
          }
        }));
      });
      mxEvent.addListener(window, , this.resizeHandler);
      this.orientationChangeHandler = mxUtils.bind(this, function () {
        this.refresh();
      });
      mxEvent.addListener(window, , this.orientationChangeHandler);
      if (mxClient.IS_IOS && !window.navigator.standalone) {
        this.scrollHandler = mxUtils.bind(this, function () {
          window.scrollTo(,);
        });
        mxEvent.addListener(window, , this.scrollHandler);
      }
      this.editor.addListener(, mxUtils.bind(this, function () {
        this.resetScrollbars();
      }));
      this.addListener(, mxUtils.bind(this, function () {
        graph.view.validateBackground();
      }));
      this.addListener(, mxUtils.bind(this, function () {
        graph.view.validateBackground();
      }));
      graph.addListener(, mxUtils.bind(this, function () {
        if (graph.isGridEnabled()) {
          graph.view.validateBackground();
        }
      }));
      this.editor.resetGraph();
    }
    this.init();
    if (!graph.standalone) {
      this.open();
    }
  }

  /**
   Global config that specifies if the compact UI elements should be used.
   */
  compactUi = true;
  /**
   Specifies the size of the split bar.
   */
  splitSize = (mxClient.IS_TOUCH || mxClient.IS_POINTER) ? :;
  /**
   Specifies the height of the menubar. Default is 34.
   */
  menubarHeight =;
  /**
   Specifies the width of the format panel should be enabled. Default is true.
   */
  formatEnabled = false;
  /**
   Specifies the width of the format panel. Default is 240.
   */
  formatWidth =;
  /**
   Specifies the height of the toolbar. Default is 38.
   */
  toolbarHeight =;
  /**
   Specifies the height of the footer. Default is 28.
   */
  footerHeight =;
  /**
   Specifies the height of the optional sidebarFooterContainer. Default is 34.
   */
  sidebarFooterHeight =;
  /**
   Specifies the position of the horizontal split bar. Default is 240 or 118 for
   screen widths <= 640px.
   */
  hsplitPosition = (screen.width <=) ? : ((urlParams[] !=) ? :);
  /**
   Specifies if animations are allowed in <executeLayout>. Default is true.
   */
  allowAnimation = true;
  /**
   Specifies if animations are allowed in <executeLayout>. Default is true.
   */
  lightboxMaxFitScale =;
  /**
   Specifies if animations are allowed in <executeLayout>. Default is true.
   */
  lightboxVerticalDivider =;
  /**
   Specifies if single click on horizontal split should collapse sidebar. Default is false.
   */
  hsplitClickEnabled = false;

  /**
   Installs the listeners to update the action states.
   */
  init() {
    this.setPageFormat(new mxRectangle(, , ,));
    var graph = this.editor.graph;
    if (!graph.standalone) {
      mxEvent.addListener(graph.container, , mxUtils.bind(this, function (evt) {
        this.onKeyDown(evt);
      }));
      mxEvent.addListener(graph.container, , mxUtils.bind(this, function (evt) {
        this.onKeyPress(evt);
      }));
      this.addUndoListener();
      this.addBeforeUnloadListener();
      graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
        this.updateActionStates();
      }));
      graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
        this.updateActionStates();
      }));
      var graphSetDefaultParent = graph.setDefaultParent;
      var ui = this;
      this.editor.graph.setDefaultParent = function () {
        graphSetDefaultParent.apply(this, arguments);
        ui.updateActionStates();
      };
      graph.editLink = ui.actions.get().funct;
      this.updateActionStates();
      this.initClipboard();
      this.initCanvas();
      if (this.format != null) {
        this.format.init();
      }
    }
  }

  /**
   Returns true if the given event should start editing. This implementation returns true.
   */
  onKeyDown(evt) {
    var graph = this.editor.graph;
    if (evt.which == && graph.isEnabled() && !mxEvent.isAltDown(evt)) {
      if (graph.isEditing()) {
        graph.stopEditing(false);
      } else {
        graph.selectCell(!mxEvent.isShiftDown(evt));
      }
      mxEvent.consume(evt);
    }
  }

  /**
   Returns true if the given event should start editing. This implementation returns true.
   */
  onKeyPress(evt) {
    var graph = this.editor.graph;
    if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== && !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt)) {
      graph.escape();
      graph.startEditing();
      if (mxClient.IS_FF) {
        var ce = graph.cellEditor;
        ce.textarea.innerHTML = String.fromCharCode(evt.which);
        var range = document.createRange();
        range.selectNodeContents(ce.textarea);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  /**
   Returns true if the given event should start editing. This implementation returns true.
   */
  isImmediateEditingEvent(evt) {
    return true;
  }

  /**
   Private helper method.
   */
  getCssClassForMarker(prefix, shape, marker, fill) {
    var result =;
    if (shape ==) {
      result = (marker != null && marker != mxConstants.NONE) ? +prefix + :;
    } else {
      if (marker == mxConstants.ARROW_CLASSIC) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_CLASSIC_THIN) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_OPEN) {
        result = +prefix +;
      } else if (marker == mxConstants.ARROW_OPEN_THIN) {
        result = +prefix +;
      } else if (marker == mxConstants.ARROW_BLOCK) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_BLOCK_THIN) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_OVAL) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_DIAMOND) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_DIAMOND_THIN) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == || marker ==) {
        result = (fill == || marker ==) ? +prefix + : +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else {
        result =;
      }
    }
    return result;
  }

  /**
   Overridden in Menus.js
   */
  createMenus() {
    return null;
  }

  /**
   Hook for allowing selection and context menu for certain events.
   */
  updatePasteActionStates() {
    var graph = this.editor.graph;
    var paste = this.actions.get();
    var pasteHere = this.actions.get();
    paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!mxClipboard.isEmpty() && graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
    pasteHere.setEnabled(paste.isEnabled());
  }

  /**
   Hook for allowing selection and context menu for certain events.
   */
  initClipboard() {
    var ui = this;
    var mxClipboardCut = mxClipboard.cut;
    mxClipboard.cut = function (graph) {
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand(, false, null);
      } else {
        mxClipboardCut.apply(this, arguments);
      }
      ui.updatePasteActionStates();
    };
    var mxClipboardCopy = mxClipboard.copy;
    mxClipboard.copy = function (graph) {
      var result = null;
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand(, false, null);
      } else {
        result = result || graph.getSelectionCells();
        result = graph.getExportableCells(graph.model.getTopmostCells(result));
        var cloneMap = new Object();
        var lookup = graph.createCellLookup(result);
        var clones = graph.cloneCells(result, null, cloneMap);
        var model = new mxGraphModel();
        var parent = model.getChildAt(model.getRoot());
        for (var i =; i < clones.length; i++) {
          model.add(parent, clones[i]);
        }
        graph.updateCustomLinks(graph.createCellMapping(cloneMap, lookup), clones);
        mxClipboard.insertCount =;
        mxClipboard.setCells(clones);
      }
      ui.updatePasteActionStates();
      return result;
    };
    var mxClipboardPaste = mxClipboard.paste;
    mxClipboard.paste = function (graph) {
      var result = null;
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand(, false, null);
      } else {
        result = mxClipboardPaste.apply(this, arguments);
      }
      ui.updatePasteActionStates();
      return result;
    };
    var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
    this.editor.graph.cellEditor.startEditing = function () {
      cellEditorStartEditing.apply(this, arguments);
      ui.updatePasteActionStates();
    };
    var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
    this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
      cellEditorStopEditing.apply(this, arguments);
      ui.updatePasteActionStates();
    };
    this.updatePasteActionStates();
  }

  /**
   Initializes the infinite canvas.
   */
  lazyZoomDelay =;

  /**
   Initializes the infinite canvas.
   */
  initCanvas() {
    var graph = this.editor.graph;
    graph.timerAutoScroll = true;
    graph.getPagePadding = function () {
      return new mxPoint(,);
    };
    graph.view.getBackgroundPageBounds = function () {
      var layout = this.graph.getPageLayout();
      var page = this.graph.getPageSize();
      return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width), this.scale * (this.translate.y + layout.y * page.height), this.scale * layout.width * page.width, this.scale * layout.height * page.height);
    };
    graph.getPreferredPageSize = function (bounds, width, height) {
      var pages = this.getPageLayout();
      var size = this.getPageSize();
      return new mxRectangle(, , pages.width * size.width, pages.height * size.height);
    };
    var resize = null;
    var ui = this;
    if (this.editor.isChromelessView()) {
      resize = mxUtils.bind(this, function (autoscale, maxScale, cx, cy) {
        if (graph.container != null && !graph.isViewer()) {
          cx = (cx != null) ? cx :;
          cy = (cy != null) ? cy :;
          var bds = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
          var scroll = mxUtils.hasScrollbars(graph.container);
          var tr = graph.view.translate;
          var s = graph.view.scale;
          var b = mxRectangle.fromRectangle(bds);
          b.x = b.x / s - tr.x;
          b.y = b.y / s - tr.y;
          b.width /= s;
          b.height /= s;
          var st = graph.container.scrollTop;
          var sl = graph.container.scrollLeft;
          var sb = (mxClient.IS_QUIRKS || document.documentMode >=) ? :;
          if (document.documentMode == || document.documentMode ==) {
            sb +=;
          }
          var cw = graph.container.offsetWidth - sb;
          var ch = graph.container.offsetHeight - sb;
          var ns = (autoscale) ? Math.max(, Math.min(maxScale ||, cw / b.width)) : s;
          var dx = ((cw - ns * b.width) /) / ns;
          var dy = (this.lightboxVerticalDivider ==) ? : ((ch - ns * b.height) / this.lightboxVerticalDivider) / ns;
          if (scroll) {
            dx = Math.max(dx);
            dy = Math.max(dy);
          }
          if (scroll || bds.width < cw || bds.height < ch) {
            graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
            graph.container.scrollTop = st * ns / s;
            graph.container.scrollLeft = sl * ns / s;
          } else if (cx != || cy !=) {
            var t = graph.view.translate;
            graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
          }
        }
      });
      this.chromelessResize = resize;
      this.chromelessWindowResize = mxUtils.bind(this, function () {
        this.chromelessResize(false);
      });
      var autoscaleResize = mxUtils.bind(this, function () {
        this.chromelessWindowResize(false);
      });
      mxEvent.addListener(window, , autoscaleResize);
      this.destroyFunctions.push(function () {
        mxEvent.removeListener(window, , autoscaleResize);
      });
      this.editor.addListener(, mxUtils.bind(this, function () {
        this.chromelessResize(true);
      }));
      this.actions.get().funct = mxUtils.bind(this, function (evt) {
        graph.zoomIn();
        this.chromelessResize(false);
      });
      this.actions.get().funct = mxUtils.bind(this, function (evt) {
        graph.zoomOut();
        this.chromelessResize(false);
      });
      if (urlParams[] !=) {
        var toolbarConfig = JSON.parse(decodeURIComponent(urlParams[] ||));
        this.chromelessToolbar = document.createElement();
        this.chromelessToolbar.style.position =;
        this.chromelessToolbar.style.overflow =;
        this.chromelessToolbar.style.boxSizing =;
        this.chromelessToolbar.style.whiteSpace =;
        this.chromelessToolbar.style.backgroundColor =;
        this.chromelessToolbar.style.padding =;
        this.chromelessToolbar.style.left = (graph.isViewer()) ? :;
        if (!mxClient.IS_VML) {
          mxUtils.setPrefixedStyle(this.chromelessToolbar.style ,);
          mxUtils.setPrefixedStyle(this.chromelessToolbar.style ,);
        }
        var updateChromelessToolbarPosition = mxUtils.bind(this, function () {
          var css = mxUtils.getCurrentStyle(graph.container);
          if (graph.isViewer()) {
            this.chromelessToolbar.style.top =;
          } else {
            this.chromelessToolbar.style.bottom = ((css != null) ? parseInt(css[] ||) :) + ((this.tabContainer != null) ? (+parseInt(this.tabContainer.style.height)) :) +;
          }
        });
        this.editor.addListener(, updateChromelessToolbarPosition);
        updateChromelessToolbarPosition();
        var btnCount =;
        var addButton = mxUtils.bind(this, function (fn, imgSrc, tip) {
          btnCount++;
          var a = document.createElement();
          a.style.paddingLeft =;
          a.style.paddingRight =;
          a.style.cursor =;
          mxEvent.addListener(a, , fn);
          if (tip != null) {
            a.setAttribute(, tip);
          }
          var img = document.createElement();
          img.setAttribute(,);
          img.setAttribute(, imgSrc);
          a.appendChild(img);
          this.chromelessToolbar.appendChild(a);
          return a;
        });
        if (toolbarConfig.backBtn != null) {
          addButton(mxUtils.bind(this, function (evt) {
            window.location.href = toolbarConfig.backBtn.url;
            mxEvent.consume(evt);
          }), Editor.backLargeImage, mxResources.get(, null));
        }
        var prevButton = addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.previousLargeImage, mxResources.get());
        var pageInfo = document.createElement();
        pageInfo.style.display =;
        pageInfo.style.verticalAlign =;
        pageInfo.style.fontFamily =;
        pageInfo.style.marginTop =;
        pageInfo.style.fontSize =;
        pageInfo.style.color =;
        this.chromelessToolbar.appendChild(pageInfo);
        var nextButton = addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.nextLargeImage, mxResources.get());
        var updatePageInfo = mxUtils.bind(this, function () {
          if (this.pages != null && this.pages.length > && this.currentPage != null) {
            pageInfo.innerHTML =;
            mxUtils.write(pageInfo, (mxUtils.indexOf(this.pages, this.currentPage) +) + +this.pages.length);
          }
        });
        prevButton.style.paddingLeft =;
        prevButton.style.paddingRight =;
        nextButton.style.paddingLeft =;
        nextButton.style.paddingRight =;
        var updatePageButtons = mxUtils.bind(this, function () {
          if (this.pages != null && this.pages.length > && this.currentPage != null) {
            nextButton.style.display =;
            prevButton.style.display =;
            pageInfo.style.display =;
          } else {
            nextButton.style.display =;
            prevButton.style.display =;
            pageInfo.style.display =;
          }
          updatePageInfo();
        });
        this.editor.addListener(, updatePageButtons);
        this.editor.addListener(, updatePageInfo);
        addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.zoomOutLargeImage, mxResources.get() +);
        addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.zoomInLargeImage, mxResources.get() +);
        addButton(mxUtils.bind(this, function (evt) {
          if (graph.isLightboxView()) {
            if (graph.view.scale ==) {
              this.lightboxFit();
            } else {
              graph.zoomTo();
            }
            this.chromelessResize(false);
          } else {
            this.chromelessResize(true);
          }
          mxEvent.consume(evt);
        }), Editor.actualSizeLargeImage, mxResources.get());
        var fadeThread = null;
        var fadeThread2 = null;
        var fadeOut = mxUtils.bind(this, function (delay) {
          if (fadeThread != null) {
            window.clearTimeout(fadeThread);
            fadeThead = null;
          }
          if (fadeThread2 != null) {
            window.clearTimeout(fadeThread2);
            fadeThead2 = null;
          }
          fadeThread = window.setTimeout(mxUtils.bind(this, function () {
            mxUtils.setOpacity(this.chromelessToolbar);
            fadeThread = null;
            fadeThread2 = window.setTimeout(mxUtils.bind(this, function () {
              this.chromelessToolbar.style.display =;
              fadeThread2 = null;
            }));
          }), delay ||);
        });
        var fadeIn = mxUtils.bind(this, function (opacity) {
          if (fadeThread != null) {
            window.clearTimeout(fadeThread);
            fadeThead = null;
          }
          if (fadeThread2 != null) {
            window.clearTimeout(fadeThread2);
            fadeThead2 = null;
          }
          this.chromelessToolbar.style.display =;
          mxUtils.setOpacity(this.chromelessToolbar, opacity ||);
        });
        if (urlParams[] ==) {
          this.layersDialog = null;
          var layersButton = addButton(mxUtils.bind(this, function (evt) {
            if (this.layersDialog != null) {
              this.layersDialog.parentNode.removeChild(this.layersDialog);
              this.layersDialog = null;
            } else {
              this.layersDialog = graph.createLayersDialog();
              mxEvent.addListener(this.layersDialog, , mxUtils.bind(this, function () {
                this.layersDialog.parentNode.removeChild(this.layersDialog);
                this.layersDialog = null;
              }));
              var r = layersButton.getBoundingClientRect();
              mxUtils.setPrefixedStyle(this.layersDialog.style ,);
              this.layersDialog.style.position =;
              this.layersDialog.style.fontFamily =;
              this.layersDialog.style.backgroundColor =;
              this.layersDialog.style.width =;
              this.layersDialog.style.padding =;
              this.layersDialog.style.color =;
              mxUtils.setOpacity(this.layersDialog);
              this.layersDialog.style.left = r.left +;
              this.layersDialog.style.bottom = parseInt(this.chromelessToolbar.style.bottom) + this.chromelessToolbar.offsetHeight + +;
              var style = mxUtils.getCurrentStyle(this.editor.graph.container);
              this.layersDialog.style.zIndex = style.zIndex;
              document.body.appendChild(this.layersDialog);
            }
            mxEvent.consume(evt);
          }), Editor.layersLargeImage, mxResources.get());
          var model = graph.getModel();
          model.addListener(mxEvent.CHANGE, function () {
            layersButton.style.display = (model.getChildCount(model.root) >) ? :;
          });
        }
        this.addChromelessToolbarItems(addButton);
        if (this.editor.editButtonLink != null || this.editor.editButtonFunc != null) {
          addButton(mxUtils.bind(this, function (evt) {
            if (this.editor.editButtonFunc != null) {
              this.editor.editButtonFunc();
            } else if (this.editor.editButtonLink ==) {
              this.editor.editAsNew(this.getEditBlankXml());
            } else {
              graph.openLink(this.editor.editButtonLink);
            }
            mxEvent.consume(evt);
          }), Editor.editLargeImage, mxResources.get());
        }
        if (this.lightboxToolbarActions != null) {
          for (var i =; i < this.lightboxToolbarActions.length; i++) {
            var lbAction = this.lightboxToolbarActions[i];
            addButton(lbAction.fn, lbAction.icon, lbAction.tooltip);
          }
        }
        if (toolbarConfig.refreshBtn != null) {
          addButton(mxUtils.bind(this, function (evt) {
            if (toolbarConfig.refreshBtn.url) {
              window.location.href = toolbarConfig.refreshBtn.url;
            } else {
              window.location.reload();
            }
            mxEvent.consume(evt);
          }), Editor.refreshLargeImage, mxResources.get(, null));
        }
        if (toolbarConfig.fullscreenBtn != null && window.self !== window.top) {
          addButton(mxUtils.bind(this, function (evt) {
            if (toolbarConfig.fullscreenBtn.url) {
              graph.openLink(toolbarConfig.fullscreenBtn.url);
            } else {
              graph.openLink(window.location.href);
            }
            mxEvent.consume(evt);
          }), Editor.fullscreenLargeImage, mxResources.get(, null));
        }
        if ((toolbarConfig.closeBtn && window.self === window.top) || (graph.lightbox && (urlParams[] == || this.container != document.body))) {
          addButton(mxUtils.bind(this, function (evt) {
            if (urlParams[] == || toolbarConfig.closeBtn) {
              window.close();
            } else {
              this.destroy();
              mxEvent.consume(evt);
            }
          }), Editor.closeLargeImage, mxResources.get() +);
        }
        this.chromelessToolbar.style.display =;
        if (!graph.isViewer()) {
          mxUtils.setPrefixedStyle(this.chromelessToolbar.style ,);
        }
        graph.container.appendChild(this.chromelessToolbar);
        mxEvent.addListener(graph.container, (mxClient.IS_POINTER) ? :, mxUtils.bind(this, function (evt) {
          if (!mxEvent.isTouchEvent(evt)) {
            if (!mxEvent.isShiftDown(evt)) {
              fadeIn();
            }
            fadeOut();
          }
        }));
        mxEvent.addListener(this.chromelessToolbar, (mxClient.IS_POINTER) ? :, function (evt) {
          mxEvent.consume(evt);
        });
        mxEvent.addListener(this.chromelessToolbar, , mxUtils.bind(this, function (evt) {
          if (!mxEvent.isShiftDown(evt)) {
            fadeIn();
          } else {
            fadeOut();
          }
        }));
        mxEvent.addListener(this.chromelessToolbar, , mxUtils.bind(this, function (evt) {
          if (!mxEvent.isShiftDown(evt)) {
            fadeIn();
          } else {
            fadeOut();
          }
          mxEvent.consume(evt);
        }));
        mxEvent.addListener(this.chromelessToolbar, , mxUtils.bind(this, function (evt) {
          if (!mxEvent.isTouchEvent(evt)) {
            fadeIn();
          }
        }));
        var tol = graph.getTolerance();
        graph.addMouseListener({
          startX:, startY:, scrollLeft:, scrollTop:, mouseDown: function (sender, me) {
            this.startX = me.getGraphX();
            this.startY = me.getGraphY();
            this.scrollLeft = graph.container.scrollLeft;
            this.scrollTop = graph.container.scrollTop;
          }, mouseMove: function (sender, me) {
          }, mouseUp: function (sender, me) {
            if (mxEvent.isTouchEvent(me.getEvent())) {
              if ((Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol && Math.abs(this.scrollTop - graph.container.scrollTop) < tol) && (Math.abs(this.startX - me.getGraphX()) < tol && Math.abs(this.startY - me.getGraphY()) < tol)) {
                if (parseFloat(ui.chromelessToolbar.style.opacity ||) >) {
                  fadeOut();
                } else {
                  fadeIn();
                }
              }
            }
          },
        });
      }
      if (!this.editor.editable) {
        this.addChromelessClickHandler();
      }
    } else if (this.editor.extendCanvas) {
      var graphViewValidate = graph.view.validate;
      graph.view.validate = function () {
        if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container)) {
          var pad = this.graph.getPagePadding();
          var size = this.graph.getPageSize();
          var tx = this.translate.x;
          var ty = this.translate.y;
          this.translate.x = pad.x - (this.x0 ||) * size.width;
          this.translate.y = pad.y - (this.y0 ||) * size.height;
        }
        graphViewValidate.apply(this, arguments);
      };
      if (!graph.isViewer()) {
        var graphSizeDidChange = graph.sizeDidChange;
        graph.sizeDidChange = function () {
          if (this.container != null && mxUtils.hasScrollbars(this.container)) {
            var pages = this.getPageLayout();
            var pad = this.getPagePadding();
            var size = this.getPageSize();
            var minw = Math.ceil( * pad.x + pages.width * size.width;
          )
            ;
            var minh = Math.ceil( * pad.y + pages.height * size.height;
          )
            ;
            var min = graph.minimumGraphSize;
            if (min == null || min.width != minw || min.height != minh) {
              graph.minimumGraphSize = new mxRectangle(, , minw, minh);
            }
            var dx = pad.x - pages.x * size.width;
            var dy = pad.y - pages.y * size.height;
            if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
              this.autoTranslate = true;
              this.view.x0 = pages.x;
              this.view.y0 = pages.y;
              var tx = graph.view.translate.x;
              var ty = graph.view.translate.y;
              graph.view.setTranslate(dx, dy);
              graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
              graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);
              this.autoTranslate = false;
              return;
            }
            graphSizeDidChange.apply(this, arguments);
          } else {
            this.fireEvent(new mxEventObject(mxEvent.SIZE, , this.getGraphBounds()));
          }
        };
      }
    }
    graph.updateZoomTimeout = null;
    graph.cumulativeZoomFactor =;
    var cursorPosition = null;
    graph.lazyZoom = function (zoomIn) {
      if (this.updateZoomTimeout != null) {
        window.clearTimeout(this.updateZoomTimeout);
      }
      if (zoomIn) {
        if (this.view.scale * this.cumulativeZoomFactor <) {
          this.cumulativeZoomFactor = (this.view.scale +) / this.view.scale;
        } else {
          this.cumulativeZoomFactor *= this.zoomFactor;
          this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor *) / / this.view.scale;;
        }
      } else {
        if (this.view.scale * this.cumulativeZoomFactor <=) {
          this.cumulativeZoomFactor = (this.view.scale -) / this.view.scale;
        } else {
          this.cumulativeZoomFactor /= this.zoomFactor;
          this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor *) / / this.view.scale;;
        }
      }
      this.cumulativeZoomFactor = Math.max(, Math.min(this.view.scale * this.cumulativeZoomFactor) / this.view.scale);
      this.updateZoomTimeout = window.setTimeout(mxUtils.bind(this, function () {
        var offset = mxUtils.getOffset(graph.container);
        var dx =;
        var dy =;
        if (cursorPosition != null) {
          dx = graph.container.offsetWidth / -cursorPosition.x + offset.x;
          dy = graph.container.offsetHeight / -cursorPosition.y + offset.y;
        }
        var prev = this.view.scale;
        this.zoom(this.cumulativeZoomFactor);
        var s = this.view.scale;
        if (s != prev) {
          if (resize != null) {
            ui.chromelessResize(false, null, dx * (this.cumulativeZoomFactor -), dy * (this.cumulativeZoomFactor -));
          }
          if (mxUtils.hasScrollbars(graph.container) && (dx != || dy !=)) {
            graph.container.scrollLeft -= dx * (this.cumulativeZoomFactor -);
            graph.container.scrollTop -= dy * (this.cumulativeZoomFactor -);
          }
        }
        this.cumulativeZoomFactor =;
        this.updateZoomTimeout = null;
      }), this.lazyZoomDelay);
    };
    mxEvent.addMouseWheelListener(mxUtils.bind(this, function (evt, up) {
      if ((this.dialogs == null || this.dialogs.length ==) && graph.isZoomWheelEvent(evt)) {
        var source = mxEvent.getSource(evt);
        while (source != null) {
          if (source == graph.container) {
            cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
            graph.lazyZoom(up);
            mxEvent.consume(evt);
            return false;
          }
          source = source.parentNode;
        }
      }
    }), graph.container);
  }

  /**
   Creates a temporary graph instance for rendering off-screen content.
   */
  addChromelessToolbarItems(addButton) {
    addButton(mxUtils.bind(this, function (evt) {
      this.actions.get().funct();
      mxEvent.consume(evt);
    }), Editor.printLargeImage, mxResources.get());
  }

  /**
   Creates a temporary graph instance for rendering off-screen content.
   */
  createTemporaryGraph(stylesheet) {
    var graph = new Graph(document.createElement(), null, null, stylesheet);
    graph.resetViewOnRootChange = false;
    graph.setConnectable(false);
    graph.gridEnabled = false;
    graph.autoScroll = false;
    graph.setTooltips(false);
    graph.setEnabled(false);
    graph.container.style.visibility =;
    graph.container.style.position =;
    graph.container.style.overflow =;
    graph.container.style.height =;
    graph.container.style.width =;
    return graph;
  }

  /**
   undefined
   */
  addChromelessClickHandler() {
    var hl = urlParams[];
    if (hl != null && hl.length >) {
      hl = +hl;
    }
    this.editor.graph.addClickHandler(hl);
  }

  /**
   undefined
   */
  toggleFormatPanel(forceHide) {
    if (this.format != null) {
      this.formatWidth = (forceHide || this.formatWidth >) ? :;
      this.formatContainer.style.display = (forceHide || this.formatWidth >) ? :;
      this.refresh();
      this.format.refresh();
      this.fireEvent(new mxEventObject());
    }
  }

  /**
   Adds support for placeholders in labels.
   */
  lightboxFit(maxHeight) {
    if (this.isDiagramEmpty()) {
      this.editor.graph.view.setScale();
    } else {
      var p = urlParams[];
      var border =;
      if (p != null) {
        border = parseInt(p);
      }
      this.editor.graph.maxFitScale = this.lightboxMaxFitScale;
      this.editor.graph.fit(border, null, null, null, null, null, maxHeight);
      this.editor.graph.maxFitScale = null;
    }
  }

  /**
   Translates this point by the given vector.
   */
  isDiagramEmpty() {
    var model = this.editor.graph.getModel();
    return model.getChildCount(model.root) == && model.getChildCount(model.getChildAt(model.root)) ==;
  }

  /**
   Hook for allowing selection and context menu for certain events.
   */
  isSelectionAllowed(evt) {
    return mxEvent.getSource(evt).nodeName == || (mxEvent.getSource(evt).nodeName == && mxUtils.isAncestorNode(this.formatContainer, mxEvent.getSource(evt)));
  }

  /**
   Installs dialog if browser window is closed without saving
   This must be disabled during save and image export.
   */
  addBeforeUnloadListener() {
    window.onbeforeunload = mxUtils.bind(this, function () {
      if (!this.editor.isChromelessView()) {
        return this.onBeforeUnload();
      }
    });
  }

  /**
   Sets the onbeforeunload for the application
   */
  onBeforeUnload() {
    if (this.editor.modified) {
      return mxResources.get();
    }
  }

  /**
   Opens the current diagram via the window.opener if one exists.
   */
  open() {
    try {
      if (window.opener != null && window.opener.openFile != null) {
        window.opener.openFile.setConsumer(mxUtils.bind(this, function (xml, filename) {
          try {
            var doc = mxUtils.parseXml(xml);
            this.editor.setGraphXml(doc.documentElement);
            this.editor.setModified(false);
            this.editor.undoManager.clear();
            if (filename != null) {
              this.editor.setFilename(filename);
              this.updateDocumentTitle();
            }
            return;
          } catch (e) {
            mxUtils.alert(mxResources.get() + +e.message);
          }
        }));
      }
    } catch (e) {
    }
    this.editor.graph.view.validate();
    this.editor.graph.sizeDidChange();
    this.editor.fireEvent(new mxEventObject());
  }

  /**
   Sets the current menu and element.
   */
  setCurrentMenu(menu, elt) {
    this.currentMenuElt = elt;
    this.currentMenu = menu;
  }

  /**
   Resets the current menu and element.
   */
  resetCurrentMenu() {
    this.currentMenuElt = null;
    this.currentMenu = null;
  }

  /**
   Hides and destroys the current menu.
   */
  hideCurrentMenu() {
    if (this.currentMenu != null) {
      this.currentMenu.hideMenu();
      this.resetCurrentMenu();
    }
  }

  /**
   Updates the document title.
   */
  updateDocumentTitle() {
    var title = this.editor.getOrCreateFilename();
    if (this.editor.appName != null) {
      title += +this.editor.appName;
    }
    document.title = title;
  }

  /**
   Updates the document title.
   */
  createHoverIcons() {
    return new HoverIcons(this.editor.graph);
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  redo() {
    try {
      var graph = this.editor.graph;
      if (graph.isEditing()) {
        document.execCommand(, false, null);
      } else {
        this.editor.undoManager.redo();
      }
    } catch (e) {
    }
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  undo() {
    try {
      var graph = this.editor.graph;
      if (graph.isEditing()) {
        var value = graph.cellEditor.textarea.innerHTML;
        document.execCommand(, false, null);
        if (value == graph.cellEditor.textarea.innerHTML) {
          graph.stopEditing(true);
          this.editor.undoManager.undo();
        }
      } else {
        this.editor.undoManager.undo();
      }
    } catch (e) {
    }
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  canRedo() {
    return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  canUndo() {
    return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
  }

  /**
   undefined
   */
  getEditBlankXml() {
    return mxUtils.getXml(this.editor.getGraphXml());
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  getUrl(pathname) {
    var href = (pathname != null) ? pathname : window.location.pathname;
    var parms = (href.indexOf() >) ? :;
    for (var key in urlParams) {
      if (parms ==) {
        href +=;
      } else {
        href +=;
      }
      href += key + +urlParams[key];
      parms++;
    }
    return href;
  }

  /**
   Specifies if the graph has scrollbars.
   */
  setScrollbars(value) {
    var graph = this.editor.graph;
    var prev = graph.container.style.overflow;
    graph.scrollbars = value;
    this.editor.updateGraphComponents();
    if (prev != graph.container.style.overflow) {
      if (graph.container.style.overflow ==) {
        var t = graph.view.translate;
        graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
        graph.container.scrollLeft =;
        graph.container.scrollTop =;
        graph.minimumGraphSize = null;
        graph.sizeDidChange();
      } else {
        var dx = graph.view.translate.x;
        var dy = graph.view.translate.y;
        graph.view.translate.x =;
        graph.view.translate.y =;
        graph.sizeDidChange();
        graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
        graph.container.scrollTop -= Math.round(dy * graph.view.scale);
      }
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Returns true if the graph has scrollbars.
   */
  hasScrollbars() {
    return this.editor.graph.scrollbars;
  }

  /**
   Resets the state of the scrollbars.
   */
  resetScrollbars() {
    var graph = this.editor.graph;
    if (!this.editor.extendCanvas) {
      graph.container.scrollTop =;
      graph.container.scrollLeft =;
      if (!mxUtils.hasScrollbars(graph.container)) {
        graph.view.setTranslate(,);
      }
    } else if (!this.editor.isChromelessView()) {
      if (mxUtils.hasScrollbars(graph.container)) {
        if (graph.pageVisible) {
          var pad = graph.getPagePadding();
          graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) -;
          graph.container.scrollLeft = Math.floor(Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) /)) -;
          var bounds = graph.getGraphBounds();
          if (bounds.width > && bounds.height >) {
            if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth *) {
              graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x -);
            }
            if (bounds.y > graph.container.scrollTop + graph.container.clientHeight *) {
              graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y -);
            }
          }
        } else {
          var bounds = graph.getGraphBounds();
          var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
          var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
          graph.container.scrollTop = Math.floor(Math.max(, bounds.y - Math.max(, (graph.container.clientHeight - height) /)));
          graph.container.scrollLeft = Math.floor(Math.max(, bounds.x - Math.max(, (graph.container.clientWidth - width) /)));
        }
      } else {
        if (graph.pageVisible) {
          var b = graph.view.getBackgroundPageBounds();
          graph.view.setTranslate(Math.floor(Math.max(, (graph.container.clientWidth - b.width) /) - b.x), Math.floor(Math.max(, (graph.container.clientHeight - b.height) /) - b.y));
        } else {
          var bounds = graph.getGraphBounds();
          graph.view.setTranslate(Math.floor(Math.max(, Math.max(, (graph.container.clientWidth - bounds.width) /) - bounds.x)), Math.floor(Math.max(, Math.max(, (graph.container.clientHeight - bounds.height) /)) - bounds.y));
        }
      }
    }
  }

  /**
   Loads the stylesheet for this graph.
   */
  setPageVisible(value) {
    var graph = this.editor.graph;
    var hasScrollbars = mxUtils.hasScrollbars(graph.container);
    var tx =;
    var ty =;
    if (hasScrollbars) {
      tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
      ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
    }
    graph.pageVisible = value;
    graph.pageBreaksVisible = value;
    graph.preferPageSize = value;
    graph.view.validateBackground();
    if (hasScrollbars) {
      var cells = graph.getSelectionCells();
      graph.clearSelection();
      graph.setSelectionCells(cells);
    }
    graph.sizeDidChange();
    if (hasScrollbars) {
      graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
      graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Implementation of the undoable page rename.
   */
  execute() {
    var graph = this.ui.editor.graph;
    if (!this.ignoreColor) {
      this.color = this.previousColor;
      var tmp = graph.background;
      this.ui.setBackgroundColor(this.previousColor);
      this.previousColor = tmp;
    }
    if (!this.ignoreImage) {
      this.image = this.previousImage;
      var tmp = graph.backgroundImage;
      this.ui.setBackgroundImage(this.previousImage);
      this.previousImage = tmp;
    }
    if (this.previousFormat != null) {
      this.format = this.previousFormat;
      var tmp = graph.pageFormat;
      if (this.previousFormat.width != tmp.width || this.previousFormat.height != tmp.height) {
        this.ui.setPageFormat(this.previousFormat);
        this.previousFormat = tmp;
      }
    }
    if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled) {
      this.ui.setFoldingEnabled(this.foldingEnabled);
      this.foldingEnabled = !this.foldingEnabled;
    }
  }

  /**
   Loads the stylesheet for this graph.
   */
  setBackgroundColor(value) {
    this.editor.graph.background = value;
    this.editor.graph.view.validateBackground();
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setFoldingEnabled(value) {
    this.editor.graph.foldingEnabled = value;
    this.editor.graph.view.revalidate();
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setPageFormat(value) {
    this.editor.graph.pageFormat = value;
    if (!this.editor.graph.pageVisible) {
      this.actions.get().funct();
    } else {
      this.editor.graph.view.validateBackground();
      this.editor.graph.sizeDidChange();
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setPageScale(value) {
    this.editor.graph.pageScale = value;
    if (!this.editor.graph.pageVisible) {
      this.actions.get().funct();
    } else {
      this.editor.graph.view.validateBackground();
      this.editor.graph.sizeDidChange();
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setGridColor(value) {
    this.editor.graph.view.gridColor = value;
    this.editor.graph.view.validateBackground();
    this.fireEvent(new mxEventObject());
  }

  /**
   Updates the states of the given undo/redo items.
   */
  addUndoListener() {
    var undo = this.actions.get();
    var redo = this.actions.get();
    var undoMgr = this.editor.undoManager;
    var undoListener = mxUtils.bind(this, function () {
      undo.setEnabled(this.canUndo());
      redo.setEnabled(this.canRedo());
    });
    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);
    var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
    this.editor.graph.cellEditor.startEditing = function () {
      cellEditorStartEditing.apply(this, arguments);
      undoListener();
    };
    var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
    this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
      cellEditorStopEditing.apply(this, arguments);
      undoListener();
    };
    undoListener();
  }

  /**
   Updates the states of the given toolbar items based on the selection.
   */
  updateActionStates() {
    var graph = this.editor.graph;
    var selected = !graph.isSelectionEmpty();
    var vertexSelected = false;
    var edgeSelected = false;
    var cells = graph.getSelectionCells();
    if (cells != null) {
      for (var i =; i < cells.length; i++) {
        var cell = cells[i];
        if (graph.getModel().isEdge(cell)) {
          edgeSelected = true;
        }
        if (graph.getModel().isVertex(cell)) {
          vertexSelected = true;
        }
        if (edgeSelected && vertexSelected) {
          break;
        }
      }
    }
    var actions = [, , , , , , , , , , , , , , , , , , , , , , , , , , , ];
    for (var i =; i < actions.length; i++) {
      this.actions.get(actions[i]).setEnabled(selected);
    }
    this.actions.get().setEnabled(graph.getSelectionCount() ==);
    this.actions.get().setEnabled(!graph.isSelectionEmpty());
    this.actions.get().setEnabled(graph.getSelectionCount() ==);
    this.actions.get().setEnabled(!graph.isSelectionEmpty());
    this.actions.get().setEnabled(edgeSelected);
    this.actions.get().setEnabled(vertexSelected);
    this.actions.get().setEnabled(vertexSelected);
    this.actions.get().setEnabled(vertexSelected);
    var oneVertexSelected = vertexSelected && graph.getSelectionCount() ==;
    this.actions.get().setEnabled(graph.getSelectionCount() > || (oneVertexSelected && !graph.isContainer(graph.getSelectionCell())));
    this.actions.get().setEnabled(graph.getSelectionCount() == && (graph.getModel().getChildCount(graph.getSelectionCell()) > || (oneVertexSelected && graph.isContainer(graph.getSelectionCell()))));
    this.actions.get().setEnabled(oneVertexSelected && graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));
    var state = graph.view.getState(graph.getSelectionCell());
    this.menus.get().setEnabled(selected || graph.view.currentRoot != null);
    this.actions.get().setEnabled(vertexSelected && (graph.isContainer(graph.getSelectionCell()) || graph.model.getChildCount(graph.getSelectionCell()) >));
    this.actions.get().setEnabled(graph.view.currentRoot != null);
    this.actions.get().setEnabled(graph.view.currentRoot != null);
    this.actions.get().setEnabled(graph.getSelectionCount() == && graph.isValidRoot(graph.getSelectionCell()));
    var foldable = graph.getSelectionCount() == && graph.isCellFoldable(graph.getSelectionCell());
    this.actions.get().setEnabled(foldable);
    this.actions.get().setEnabled(foldable);
    this.actions.get().setEnabled(graph.getSelectionCount() ==);
    this.actions.get().setEnabled(graph.getSelectionCount() == && graph.getLinkForCell(graph.getSelectionCell()) != null);
    this.actions.get().setEnabled(graph.isEnabled());
    this.actions.get().setEnabled(!this.editor.chromeless || this.editor.editable);
    var unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
    this.menus.get().setEnabled(unlocked);
    this.menus.get().setEnabled(unlocked);
    this.menus.get().setEnabled(unlocked && vertexSelected);
    this.menus.get().setEnabled(unlocked && vertexSelected && graph.getSelectionCount() >);
    this.menus.get().setEnabled(unlocked && vertexSelected && graph.getSelectionCount() >);
    this.actions.get().setEnabled(unlocked);
    this.actions.get().setEnabled(unlocked);
    this.actions.get().setEnabled(unlocked);
    this.actions.get().setEnabled(unlocked);
    this.updatePasteActionStates();
  }

  /**
   Refreshes the viewport.
   */
  refresh(sizeDidChange) {
    sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;
    var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode ==);
    var w = this.container.clientWidth;
    var h = this.container.clientHeight;
    if (this.container == document.body) {
      w = document.body.clientWidth || document.documentElement.clientWidth;
      h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
    }
    var off =;
    if (mxClient.IS_IOS && !window.navigator.standalone) {
      if (window.innerHeight != document.documentElement.clientHeight) {
        off = document.documentElement.clientHeight - window.innerHeight;
        window.scrollTo(,);
      }
    }
    var effHsplitPosition = Math.max(, Math.min(this.hsplitPosition, w - this.splitSize -));
    var tmp =;
    if (this.menubar != null) {
      this.menubarContainer.style.height = this.menubarHeight +;
      tmp += this.menubarHeight;
    }
    if (this.toolbar != null) {
      this.toolbarContainer.style.top = this.menubarHeight +;
      this.toolbarContainer.style.height = this.toolbarHeight +;
      tmp += this.toolbarHeight;
    }
    if (tmp > && !mxClient.IS_QUIRKS) {
      tmp +=;
    }
    var sidebarFooterHeight =;
    if (this.sidebarFooterContainer != null) {
      var bottom = this.footerHeight + off;
      sidebarFooterHeight = Math.max(, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
      this.sidebarFooterContainer.style.width = effHsplitPosition +;
      this.sidebarFooterContainer.style.height = sidebarFooterHeight +;
      this.sidebarFooterContainer.style.bottom = bottom +;
    }
    var fw = (this.format != null) ? this.formatWidth :;
    this.sidebarContainer.style.top = tmp +;
    this.sidebarContainer.style.width = effHsplitPosition +;
    this.formatContainer.style.top = tmp +;
    this.formatContainer.style.width = fw +;
    this.formatContainer.style.display = (this.format != null) ? :;
    this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + :;
    this.diagramContainer.style.top = this.sidebarContainer.style.top;
    this.footerContainer.style.height = this.footerHeight +;
    this.hsplit.style.top = this.sidebarContainer.style.top;
    this.hsplit.style.bottom = (this.footerHeight + off) +;
    this.hsplit.style.left = effHsplitPosition +;
    this.footerContainer.style.display = (this.footerHeight ==) ? :;
    if (this.tabContainer != null) {
      this.tabContainer.style.left = this.diagramContainer.style.left;
    }
    if (quirks) {
      this.menubarContainer.style.width = w +;
      this.toolbarContainer.style.width = this.menubarContainer.style.width;
      var sidebarHeight = Math.max(, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
      this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) +;
      this.formatContainer.style.height = sidebarHeight +;
      this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(, w - effHsplitPosition - this.splitSize - fw) + : w +;
      this.footerContainer.style.width = this.menubarContainer.style.width;
      var diagramHeight = Math.max(, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
      if (this.tabContainer != null) {
        this.tabContainer.style.width = this.diagramContainer.style.width;
        this.tabContainer.style.bottom = (this.footerHeight + off) +;
        diagramHeight -= this.tabContainer.clientHeight;
      }
      this.diagramContainer.style.height = diagramHeight +;
      this.hsplit.style.height = diagramHeight +;
    } else {
      if (this.footerHeight >) {
        this.footerContainer.style.bottom = off +;
      }
      this.diagramContainer.style.right = fw +;
      var th =;
      if (this.tabContainer != null) {
        this.tabContainer.style.bottom = (this.footerHeight + off) +;
        this.tabContainer.style.right = this.diagramContainer.style.right;
        th = this.tabContainer.clientHeight;
      }
      this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) +;
      this.formatContainer.style.bottom = (this.footerHeight + off) +;
      this.diagramContainer.style.bottom = (this.footerHeight + off + th) +;
    }
    if (sizeDidChange) {
      this.editor.graph.sizeDidChange();
    }
  }

  /**
   Creates the required containers.
   */
  createTabContainer() {
    return null;
  }

  /**
   Creates the required containers.
   */
  createDivs() {
    this.menubarContainer = this.createDiv();
    this.toolbarContainer = this.createDiv();
    this.sidebarContainer = this.createDiv();
    this.formatContainer = this.createDiv();
    this.diagramContainer = this.createDiv();
    this.footerContainer = this.createDiv();
    this.hsplit = this.createDiv();
    this.hsplit.setAttribute(, mxResources.get());
    this.menubarContainer.style.top =;
    this.menubarContainer.style.left =;
    this.menubarContainer.style.right =;
    this.toolbarContainer.style.left =;
    this.toolbarContainer.style.right =;
    this.sidebarContainer.style.left =;
    this.formatContainer.style.right =;
    this.formatContainer.style.zIndex =;
    this.diagramContainer.style.right = ((this.format != null) ? this.formatWidth :) +;
    this.footerContainer.style.left =;
    this.footerContainer.style.right =;
    this.footerContainer.style.bottom =;
    this.footerContainer.style.zIndex = mxPopupMenu.prototype.zIndex -;
    this.hsplit.style.width = this.splitSize +;
    this.sidebarFooterContainer = this.createSidebarFooterContainer();
    if (this.sidebarFooterContainer) {
      this.sidebarFooterContainer.style.left =;
    }
    if (!this.editor.chromeless) {
      this.tabContainer = this.createTabContainer();
    } else {
      this.diagramContainer.style.border =;
    }
  }

  /**
   Hook for sidebar footer container. This implementation returns null.
   */
  createSidebarFooterContainer() {
    return null;
  }

  /**
   Creates the required containers.
   */
  createUi() {
    if (this.menubar != null) {
      this.menubarContainer.appendChild(this.menubar.container);
    }
    if (this.menubar != null) {
      this.statusContainer = this.createStatusContainer();
      this.editor.addListener(, mxUtils.bind(this, function () {
        this.setStatusText(this.editor.getStatus());
      }));
      this.setStatusText(this.editor.getStatus());
      this.menubar.container.appendChild(this.statusContainer);
      this.container.appendChild(this.menubarContainer);
    }
    this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);
    if (this.sidebar != null) {
      this.container.appendChild(this.sidebarContainer);
    }
    this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createFormat(this.formatContainer);
    if (this.format != null) {
      this.container.appendChild(this.formatContainer);
    }
    var footer = (this.editor.chromeless) ? null : this.createFooter();
    if (footer != null) {
      this.footerContainer.appendChild(footer);
      this.container.appendChild(this.footerContainer);
    }
    if (this.sidebar != null && this.sidebarFooterContainer) {
      this.container.appendChild(this.sidebarFooterContainer);
    }
    this.container.appendChild(this.diagramContainer);
    if (this.container != null && this.tabContainer != null) {
      this.container.appendChild(this.tabContainer);
    }
    this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv());
    if (this.toolbar != null) {
      this.toolbarContainer.appendChild(this.toolbar.container);
      this.container.appendChild(this.toolbarContainer);
    }
    if (this.sidebar != null) {
      this.container.appendChild(this.hsplit);
      this.addSplitHandler(this.hsplit, true, , mxUtils.bind(this, function (value) {
        this.hsplitPosition = value;
        this.refresh();
      }));
    }
  }

  /**
   Creates a new toolbar for the given container.
   */
  createStatusContainer() {
    var container = document.createElement();
    container.className =;
    if (screen.width <) {
      container.style.maxWidth = Math.max(, screen.width -) +;
      container.style.overflow =;
    }
    return container;
  }

  /**
   Creates a new toolbar for the given container.
   */
  setStatusText(value) {
    this.statusContainer.innerHTML = value;
  }

  /**
   Creates a new toolbar for the given container.
   */
  createToolbar(container) {
    return new Toolbar(this, container);
  }

  /**
   Creates a new sidebar for the given container.
   */
  createSidebar(container) {
    return new Sidebar(this, container);
  }

  /**
   Creates a new sidebar for the given container.
   */
  createFormat(container) {
    return new Format(this, container);
  }

  /**
   Creates and returns a new footer.
   */
  createFooter() {
    return this.createDiv();
  }

  /**
   Creates the actual toolbar for the toolbar container.
   */
  createDiv(classname) {
    var elt = document.createElement();
    elt.className = classname;
    return elt;
  }

  /**
   Updates the states of the given undo/redo items.
   */
  addSplitHandler(elt, horizontal, dx, onChange) {
    var start = null;
    var initial = null;
    var ignoreClick = true;
    var last = null;
    if (mxClient.IS_POINTER) {
      elt.style.touchAction =;
    }
    var getValue = mxUtils.bind(this, function () {
      var result = parseInt(((horizontal) ? elt.style.left : elt.style.bottom));
      if (!horizontal) {
        result = result + dx - this.footerHeight;
      }
      return result;
    });

    function moveHandler(evt) {
      if (start != null) {
        var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
        onChange(Math.max(, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
        mxEvent.consume(evt);
        if (initial != getValue()) {
          ignoreClick = true;
          last = null;
        }
      }
    }
    ;

    function dropHandler(evt) {
      moveHandler(evt);
      initial = null;
      start = null;
    }
    ;
    mxEvent.addGestureListeners(elt, function (evt) {
      start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      initial = getValue();
      ignoreClick = false;
      mxEvent.consume(evt);
    });
    mxEvent.addListener(elt, , mxUtils.bind(this, function (evt) {
      if (!ignoreClick && this.hsplitClickEnabled) {
        var next = (last != null) ? last - dx :;
        last = getValue();
        onChange(next);
        mxEvent.consume(evt);
      }
    }));
    mxEvent.addGestureListeners(document, null, moveHandler, dropHandler);
    this.destroyFunctions.push(function () {
      mxEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
    });
  }

  /**
   Translates this point by the given vector.
   */
  handleError(resp, title, fn, invokeFnOnClose, notFoundMessage) {
    var e = (resp != null && resp.error != null) ? resp.error : resp;
    if (e != null || title != null) {
      var msg = mxUtils.htmlEntities(mxResources.get());
      var btn = mxResources.get();
      title = (title != null) ? title : mxResources.get();
      if (e != null && e.message != null) {
        msg = mxUtils.htmlEntities(e.message);
      }
      this.showError(title, msg, btn, fn, null, null, null, null, null, null, null, null, (invokeFnOnClose) ? fn : null);
    } else if (fn != null) {
      fn();
    }
  }

  /**
   Translates this point by the given vector.
   */
  showError(title, msg, btn, fn, retry, btn2, fn2, btn3, fn3, w, h, hide, onClose) {
    var dlg = new ErrorDialog(this, title, msg, btn || mxResources.get(), fn, retry, btn2, fn2, hide, btn3, fn3);
    var lines = Math.ceil((msg != null) ? msg.length / :);
    this.showDialog(dlg.container, w ||, h || (+lines *), true, false, onClose);
    dlg.init();
  }

  /**
   Displays a print dialog.
   */
  showDialog(elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick) {
    this.editor.graph.tooltipHandler.hideTooltip();
    if (this.dialogs == null) {
      this.dialogs = [];
    }
    this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick);
    this.dialogs.push(this.dialog);
  }

  /**
   Displays a print dialog.
   */
  hideDialog(cancel, isEsc) {
    if (this.dialogs != null && this.dialogs.length >) {
      var dlg = this.dialogs.pop();
      if (dlg.close(cancel, isEsc) == false) {
        this.dialogs.push(dlg);
        return;
      }
      this.dialog = (this.dialogs.length >) ? this.dialogs[this.dialogs.length -] : null;
      this.editor.fireEvent(new mxEventObject());
      if (this.dialog == null && this.editor.graph.container.style.visibility !=) {
        window.setTimeout(mxUtils.bind(this, function () {
          if (this.editor.graph.isEditing() && this.editor.graph.cellEditor.textarea != null) {
            this.editor.graph.cellEditor.textarea.focus();
          } else {
            mxUtils.clearSelection();
            this.editor.graph.container.focus();
          }
        }));
      }
    }
  }

  /**
   Display a color dialog.
   */
  pickColor(color, apply) {
    var graph = this.editor.graph;
    var selState = graph.cellEditor.saveSelection();
    var h = +((Math.ceil(ColorDialog.prototype.presetColors.length /) + Math.ceil(ColorDialog.prototype.defaultColors.length /)) *);
    var dlg = new ColorDialog(this, color ||, function (color) {
      graph.cellEditor.restoreSelection(selState);
      apply(color);
    }, function () {
      graph.cellEditor.restoreSelection(selState);
    });
    this.showDialog(dlg.container, , h, true, false);
    dlg.init();
  }

  /**
   Adds the label menu items to the given menu and parent.
   */
  openFile() {
    window.openFile = new OpenFile(mxUtils.bind(this, function (cancel) {
      this.hideDialog(cancel);
    }));
    this.showDialog(new OpenDialog(this).container, (Editor.useLocalStorage) ? :, (Editor.useLocalStorage) ? :, true, true, function () {
      window.openFile = null;
    });
  }

  /**
   Extracs the graph model from the given HTML data from a data transfer event.
   */
  extractGraphModelFromHtml(data) {
    var result = null;
    try {
      var idx = data.indexOf();
      if (idx >=) {
        var idx2 = data.lastIndexOf();
        if (idx2 > idx) {
          result = data.substring(idx, idx2 +).replace(,).replace(,).replace(,).replace(,);
        }
      }
    } catch (e) {
    }
    return result;
  }

  /**
   Opens the given files in the editor.
   */
  extractGraphModelFromEvent(evt) {
    var result = null;
    var data = null;
    if (evt != null) {
      var provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData;
      if (provider != null) {
        if (document.documentMode == || document.documentMode ==) {
          data = provider.getData();
        } else {
          data = (mxUtils.indexOf(provider.types) >=) ? provider.getData() : null;
          if (mxUtils.indexOf(provider.types && (data == null || data.length ==)))
          {
            data = provider.getData();
          }
        }
        if (data != null) {
          data = Graph.zapGremlins(mxUtils.trim(data));
          var xml = this.extractGraphModelFromHtml(data);
          if (xml != null) {
            data = xml;
          }
        }
      }
    }
    if (data != null && this.isCompatibleString(data)) {
      result = data;
    }
    return result;
  }

  /**
   Hook for subclassers to return true if event data is a supported format.
   This implementation always returns false.
   */
  isCompatibleString(data) {
    return false;
  }

  /**
   Adds the label menu items to the given menu and parent.
   */
  saveFile(forceDialog) {
    if (!forceDialog && this.editor.filename != null) {
      this.save(this.editor.getOrCreateFilename());
    } else {
      var dlg = new FilenameDialog(this, this.editor.getOrCreateFilename(), mxResources.get(), mxUtils.bind(this, function (name) {
        this.save(name);
      }), null, mxUtils.bind(this, function (name) {
        if (name != null && name.length >) {
          return true;
        }
        mxUtils.confirm(mxResources.get());
        return false;
      }));
      this.showDialog(dlg.container, , , true, true);
      dlg.init();
    }
  }

  /**
   Saves the current graph under the given filename.
   */
  save(name) {
    if (name != null) {
      if (this.editor.graph.isEditing()) {
        this.editor.graph.stopEditing();
      }
      var xml = mxUtils.getXml(this.editor.getGraphXml());
      try {
        if (Editor.useLocalStorage) {
          if (localStorage.getItem(name) != null && !mxUtils.confirm(mxResources.get(, [name]))) {
            return;
          }
          localStorage.setItem(name, xml);
          this.editor.setStatus(mxUtils.htmlEntities(mxResources.get()) + +new Date());
        } else {
          if (xml.length < MAX_REQUEST_SIZE) {
            new mxXmlRequest(SAVE_URL, +encodeURIComponent(name) + +encodeURIComponent(xml)).simulate(document);
          } else {
            mxUtils.alert(mxResources.get());
            mxUtils.popup(xml);
            return;
          }
        }
        this.editor.setModified(false);
        this.editor.setFilename(name);
        this.updateDocumentTitle();
      } catch (e) {
        this.editor.setStatus(mxUtils.htmlEntities(mxResources.get()));
      }
    }
  }

  /**
   Executes the given layout.
   */
  executeLayout(exec, animate, post) {
    var graph = this.editor.graph;
    if (graph.isEnabled()) {
      graph.getModel().beginUpdate();
      try {
        exec();
      } catch (e) {
        throw e;
      } finally {
        if (this.allowAnimation && animate && navigator.userAgent.indexOf() <) {
          var morph = new mxMorphing(graph);
          morph.addListener(mxEvent.DONE, mxUtils.bind(this, function () {
            graph.getModel().endUpdate();
            if (post != null) {
              post();
            }
          }));
          morph.startAnimation();
        } else {
          graph.getModel().endUpdate();
          if (post != null) {
            post();
          }
        }
      }
    }
  }

  /**
   Hides the current menu.
   */
  showImageDialog(title, value, fn, ignoreExisting) {
    var cellEditor = this.editor.graph.cellEditor;
    var selState = cellEditor.saveSelection();
    var newValue = mxUtils.prompt(title, value);
    cellEditor.restoreSelection(selState);
    if (newValue != null && newValue.length >) {
      var img = new Image();
      img.onload = function () {
        fn(newValue, img.width, img.height);
      };
      img.onerror = function () {
        fn(null);
        mxUtils.alert(mxResources.get());
      };
      img.src = newValue;
    } else {
      fn(null);
    }
  }

  /**
   Hides the current menu.
   */
  showLinkDialog(value, btnLabel, fn) {
    var dlg = new LinkDialog(this, value, btnLabel, fn);
    this.showDialog(dlg.container, , , true, true);
    dlg.init();
  }

  /**
   Hides the current menu.
   */
  showDataDialog(cell) {
    if (cell != null) {
      var dlg = new EditDataDialog(this, cell);
      this.showDialog(dlg.container, , , true, false, null, false);
      dlg.init();
    }
  }

  /**
   Hides the current menu.
   */
  showBackgroundImageDialog(apply) {
    apply = (apply != null) ? apply : mxUtils.bind(this, function (image) {
      var change = new ChangePageSetup(this, null, image);
      change.ignoreColor = true;
      this.editor.graph.model.execute(change);
    });
    var newValue = mxUtils.prompt(mxResources.get());
    if (newValue != null && newValue.length >) {
      var img = new Image();
      img.onload = function () {
        apply(new mxImage(newValue, img.width, img.height));
      };
      img.onerror = function () {
        apply(null);
        mxUtils.alert(mxResources.get());
      };
      img.src = newValue;
    } else {
      apply(null);
    }
  }

  /**
   Loads the stylesheet for this graph.
   */
  setBackgroundImage(image) {
    this.editor.graph.setBackgroundImage(image);
    this.editor.graph.view.validateBackgroundImage();
    this.fireEvent(new mxEventObject());
  }

  /**
   Creates the keyboard event handler for the current graph and history.
   */
  confirm(msg, okFn, cancelFn) {
    if (mxUtils.confirm(msg)) {
      if (okFn != null) {
        okFn();
      }
    } else if (cancelFn != null) {
      cancelFn();
    }
  }

  /**
   Creates the keyboard event handler for the current graph and history.
   */
  createOutline(wnd) {
    var outline = new mxOutline(this.editor.graph);
    outline.border =;
    mxEvent.addListener(window, , function () {
      outline.update();
    });
    this.addListener(, function () {
      outline.update();
    });
    return outline;
  }

  altShiftActions = {
: , : , : , : , : , : , : ,
};
/**
 Creates the keyboard event handler for the current graph and history.
 */
createKeyHandler(editor);
{
  var editorUi = this;
  var graph = this.editor.graph;
  var keyHandler = new mxKeyHandler(graph);
  var isEventIgnored = keyHandler.isEventIgnored;
  keyHandler.isEventIgnored = function (evt) {
    return (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != && evt.keyCode != && evt.keyCode != && evt.keyCode != && evt.keyCode !=)) && ((evt.keyCode != && evt.keyCode !=) || !this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) && isEventIgnored.apply(this, arguments);
  };
  keyHandler.isEnabledForEvent = function (evt) {
    return (!mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() && (editorUi.dialogs == null || editorUi.dialogs.length ==));
  };
  keyHandler.isControlDown = function (evt) {
    return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
  };
  var queue = [];
  var thread = null;

  function nudge(keyCode, stepSize, resize) {
    queue.push(function () {
      if (!graph.isSelectionEmpty() && graph.isEnabled()) {
        stepSize = (stepSize != null) ? stepSize :;
        if (resize) {
          graph.getModel().beginUpdate();
          try {
            var cells = graph.getSelectionCells();
            for (var i =; i < cells.length; i++) {
              if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i])) {
                var geo = graph.getCellGeometry(cells[i]);
                if (geo != null) {
                  geo = geo.clone();
                  if (keyCode ==) {
                    geo.width = Math.max(, geo.width - stepSize);
                  } else if (keyCode ==) {
                    geo.height = Math.max(, geo.height - stepSize);
                  } else if (keyCode ==) {
                    geo.width += stepSize;
                  } else if (keyCode ==) {
                    geo.height += stepSize;
                  }
                  graph.getModel().setGeometry(cells[i], geo);
                }
              }
            }
          } finally {
            graph.getModel().endUpdate();
          }
        } else {
          var cell = graph.getSelectionCell();
          var parent = graph.model.getParent(cell);
          var layout = null;
          if (graph.getSelectionCount() == && graph.model.isVertex(cell) && graph.layoutManager != null && !graph.isCellLocked(cell)) {
            layout = graph.layoutManager.getLayout(parent);
          }
          if (layout != null && layout.constructor == mxStackLayout) {
            var index = parent.getIndex(cell);
            if (keyCode == || keyCode ==) {
              graph.model.add(parent, cell, Math.max(, index -));
            } else if (keyCode == || keyCode ==) {
              graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index +));
            }
          } else {
            var dx =;
            var dy =;
            if (keyCode ==) {
              dx = -stepSize;
            } else if (keyCode ==) {
              dy = -stepSize;
            } else if (keyCode ==) {
              dx = stepSize;
            } else if (keyCode ==) {
              dy = stepSize;
            }
            graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
          }
        }
      }
    });
    if (thread != null) {
      window.clearTimeout(thread);
    }
    thread = window.setTimeout(function () {
      if (queue.length >) {
        graph.getModel().beginUpdate();
        try {
          for (var i =; i < queue.length; i++) {
            queue[i]();
          }
          queue = [];
        } finally {
          graph.getModel().endUpdate();
        }
        graph.scrollCellToVisible(graph.getSelectionCell());
      }
    });
  }
  ;
  var directions = {
:
  mxConstants.DIRECTION_WEST,
:
  mxConstants.DIRECTION_NORTH,
:
  mxConstants.DIRECTION_EAST,
:
  mxConstants.DIRECTION_SOUTH,
}
  ;
  var keyHandlerGetFunction = keyHandler.getFunction;
  mxKeyHandler.prototype.getFunction = function (evt) {
    if (graph.isEnabled()) {
      if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
        var action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);
        if (action != null) {
          return action.funct;
        }
      }
      if (evt.keyCode == && mxEvent.isAltDown(evt)) {
        if (mxEvent.isShiftDown(evt)) {
          return function () {
            graph.selectParentCell();
          };
        } else {
          return function () {
            graph.selectChildCell();
          };
        }
      } else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty()) {
        if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
          if (graph.model.isVertex(graph.getSelectionCell())) {
            return function () {
              var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode], graph.defaultEdgeLength, evt, true);
              if (cells != null && cells.length >) {
                if (cells.length == && graph.model.isEdge(cells[])) {
                  graph.setSelectionCell(graph.model.getTerminal(cells[], false));
                } else {
                  graph.setSelectionCell(cells[cells.length -]);
                }
                graph.scrollCellToVisible(graph.getSelectionCell());
                if (editorUi.hoverIcons != null) {
                  editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
                }
              }
            };
          }
        } else {
          if (this.isControlDown(evt)) {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
            };
          } else {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null);
            };
          }
        }
      }
    }
    return keyHandlerGetFunction.apply(this, arguments);
  };
  keyHandler.bindAction = mxUtils.bind(this, function (code, control, key, shift) {
    var action = this.actions.get(key);
    if (action != null) {
      var f = function () {
        if (action.isEnabled()) {
          action.funct();
        }
      };
      if (control) {
        if (shift) {
          keyHandler.bindControlShiftKey(code, f);
        } else {
          keyHandler.bindControlKey(code, f);
        }
      } else {
        if (shift) {
          keyHandler.bindShiftKey(code, f);
        } else {
          keyHandler.bindKey(code, f);
        }
      }
    }
  });
  var ui = this;
  var keyHandlerEscape = keyHandler.escape;
  keyHandler.escape = function (evt) {
    keyHandlerEscape.apply(this, arguments);
  };
  keyHandler.enter = function () {
  };
  keyHandler.bindControlShiftKey(, function () {
    graph.exitGroup();
  });
  keyHandler.bindControlShiftKey(, function () {
    graph.enterGroup();
  });
  keyHandler.bindKey(, function () {
    graph.home();
  });
  keyHandler.bindKey(, function () {
    graph.refresh();
  });
  keyHandler.bindAction(, true);
  keyHandler.bindAction(, true);
  keyHandler.bindAction(, true);
  keyHandler.bindAction(, true, , true);
  keyHandler.bindAction(, false);
  if (!this.editor.chromeless || this.editor.editable) {
    keyHandler.bindControlKey(, function () {
      if (graph.isEnabled()) {
        graph.foldCells(true);
      }
    });
    keyHandler.bindControlKey(, function () {
      if (graph.isEnabled()) {
        graph.foldCells(false);
      }
    });
    keyHandler.bindControlKey(, function () {
      if (graph.isEnabled()) {
        graph.setSelectionCells(graph.duplicateCells(graph.getSelectionCells(), false));
      }
    });
    keyHandler.bindAction(, false);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, false);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindKey(, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    });
    keyHandler.bindKey(, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    });
  }
  if (!mxClient.IS_WIN) {
    keyHandler.bindAction(, true, , true);
  } else {
    keyHandler.bindAction(, true);
  }
  return keyHandler;
}
/**
 Creates the keyboard event handler for the current graph and history.
 */
destroy();
{
  if (this.editor != null) {
    this.editor.destroy();
    this.editor = null;
  }
  if (this.menubar != null) {
    this.menubar.destroy();
    this.menubar = null;
  }
  if (this.toolbar != null) {
    this.toolbar.destroy();
    this.toolbar = null;
  }
  if (this.sidebar != null) {
    this.sidebar.destroy();
    this.sidebar = null;
  }
  if (this.keyHandler != null) {
    this.keyHandler.destroy();
    this.keyHandler = null;
  }
  if (this.keydownHandler != null) {
    mxEvent.removeListener(document, , this.keydownHandler);
    this.keydownHandler = null;
  }
  if (this.keyupHandler != null) {
    mxEvent.removeListener(document, , this.keyupHandler);
    this.keyupHandler = null;
  }
  if (this.resizeHandler != null) {
    mxEvent.removeListener(window, , this.resizeHandler);
    this.resizeHandler = null;
  }
  if (this.gestureHandler != null) {
    mxEvent.removeGestureListeners(document, this.gestureHandler);
    this.gestureHandler = null;
  }
  if (this.orientationChangeHandler != null) {
    mxEvent.removeListener(window, , this.orientationChangeHandler);
    this.orientationChangeHandler = null;
  }
  if (this.scrollHandler != null) {
    mxEvent.removeListener(window, , this.scrollHandler);
    this.scrollHandler = null;
  }
  if (this.destroyFunctions != null) {
    for (var i =; i < this.destroyFunctions.length; i++) {
      this.destroyFunctions[i]();
    }
    this.destroyFunctions = null;
  }
  var c = [this.menubarContainer, this.toolbarContainer, this.sidebarContainer, this.formatContainer, this.diagramContainer, this.footerContainer, this.chromelessToolbar, this.hsplit, this.sidebarFooterContainer, this.layersDialog];
  for (var i =; i < c.length; i++) {
    if (c[i] != null && c[i].parentNode != null) {
      c[i].parentNode.removeChild(c[i]);
    }
  }
}
}

// Extends mxEventSource
mxUtils.extend(EditorUi, mxEventSource);

// 各种参数
/**
 * Global config that specifies if the compact UI elements should be used.
 */
EditorUi.compactUi = true;

/**
 * Specifies the size of the split bar.
 * @type {number}
 */
EditorUi.prototype.splitSize = (mxClient.IS_TOUCH || mxClient.IS_POINTER) ? 12 : 8;

/**
 * Specifies the height of the menubar. Default is 34.
 */
EditorUi.prototype.menubarHeight = 0;

/**
 * Specifies the width of the format panel should be enabled. Default is true.
 */
// 是否默认打开右侧的格式窗
EditorUi.prototype.formatEnabled = false;

/**
 * Specifies the width of the format panel. Default is 240.
 */
EditorUi.prototype.formatWidth = 240;

/**
 * Specifies the height of the toolbar. Default is 38.
 */
// 顶部工具栏的高度
EditorUi.prototype.toolbarHeight = 38;

/**
 * Specifies the height of the footer. Default is 28.
 */
EditorUi.prototype.footerHeight = 0;

/**
 * Specifies the height of the optional sidebarFooterContainer. Default is 34.
 */
EditorUi.prototype.sidebarFooterHeight = 34;

/**
 * Specifies the position of the horizontal split bar. Default is 240 or 118 for
 * screen widths <= 640px.
 * @type {number}
 */
EditorUi.prototype.hsplitPosition = (screen.width <= 640) ? 118 : ((urlParams['sidebar-entries'] != 'large') ? 137 : 240);

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
EditorUi.prototype.allowAnimation = true;

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
EditorUi.prototype.lightboxMaxFitScale = 2;

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
EditorUi.prototype.lightboxVerticalDivider = 4;

/**
 * Specifies if single click on horizontal split should collapse sidebar. Default is false.
 */
EditorUi.prototype.hsplitClickEnabled = false;

/**
 * Installs the listeners to update the action states.
 */
// 对 mxGraph 进行初始化的主要代码
EditorUi.prototype.init = function () {
  this.setPageFormat(new mxRectangle(0, 0, 4681, 3300));

  var graph = this.editor.graph;

  if (!graph.standalone) {
    mxEvent.addListener(graph.container, 'keydown', mxUtils.bind(this, function (evt) {
      this.onKeyDown(evt);
    }));

    mxEvent.addListener(graph.container, 'keypress', mxUtils.bind(this, function (evt) {
      this.onKeyPress(evt);
    }));

    // Updates action states
    this.addUndoListener();
    this.addBeforeUnloadListener();

    graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
      this.updateActionStates();
    }));

    graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
      this.updateActionStates();
    }));

    // Changes action states after change of default parent
    var graphSetDefaultParent = graph.setDefaultParent;
    var ui = this;

    this.editor.graph.setDefaultParent = function () {
      graphSetDefaultParent.apply(this, arguments);
      ui.updateActionStates();
    };

    // Hack to make editLink available in vertex handler
    // 模拟操作的典型代码，actions 中是所有可用的操作，想模拟哪个操作就调用它的 funct
    graph.editLink = ui.actions.get('editLink').funct;

    this.updateActionStates();
    this.initClipboard();
    this.initCanvas();

    if (this.format != null) {
      this.format.init();
    }
  }
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
EditorUi.prototype.onKeyDown = function (evt) {
  var graph = this.editor.graph;

  // Tab selects next cell
  if (evt.which == 9 && graph.isEnabled() && !mxEvent.isAltDown(evt)) {
    if (graph.isEditing()) {
      graph.stopEditing(false);
    } else {
      graph.selectCell(!mxEvent.isShiftDown(evt));
    }

    mxEvent.consume(evt);
  }
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
EditorUi.prototype.onKeyPress = function (evt) {
  var graph = this.editor.graph;

  // KNOWN: Focus does not work if label is empty in quirks mode
  if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
      !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt)) {
    graph.escape();
    graph.startEditing();

    // Workaround for FF where char is lost if cursor is placed before char
    if (mxClient.IS_FF) {
      var ce = graph.cellEditor;
      ce.textarea.innerHTML = String.fromCharCode(evt.which);

      // Moves cursor to end of textarea
      var range = document.createRange();
      range.selectNodeContents(ce.textarea);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
EditorUi.prototype.isImmediateEditingEvent = function (evt) {
  return true;
};

/**
 * Private helper method.
 * @param prefix {string}
 * @param shape {string}
 * @param marker {string}
 * @param fill {string}
 * @returns {string}
 */
EditorUi.prototype.getCssClassForMarker = function (prefix, shape, marker, fill) {
  var result = '';

  if (shape == 'flexArrow') {
    result = (marker != null && marker != mxConstants.NONE) ?
        'geSprite geSprite-' + prefix + 'blocktrans' : 'geSprite geSprite-noarrow';
  } else {
    if (marker == mxConstants.ARROW_CLASSIC) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classic' : 'geSprite geSprite-' + prefix + 'classictrans';
    } else if (marker == mxConstants.ARROW_CLASSIC_THIN) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classicthin' : 'geSprite geSprite-' + prefix + 'classicthintrans';
    } else if (marker == mxConstants.ARROW_OPEN) {
      result = 'geSprite geSprite-' + prefix + 'open';
    } else if (marker == mxConstants.ARROW_OPEN_THIN) {
      result = 'geSprite geSprite-' + prefix + 'openthin';
    } else if (marker == mxConstants.ARROW_BLOCK) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'block' : 'geSprite geSprite-' + prefix + 'blocktrans';
    } else if (marker == mxConstants.ARROW_BLOCK_THIN) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'blockthin' : 'geSprite geSprite-' + prefix + 'blockthintrans';
    } else if (marker == mxConstants.ARROW_OVAL) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'oval' : 'geSprite geSprite-' + prefix + 'ovaltrans';
    } else if (marker == mxConstants.ARROW_DIAMOND) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'diamond' : 'geSprite geSprite-' + prefix + 'diamondtrans';
    } else if (marker == mxConstants.ARROW_DIAMOND_THIN) {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'thindiamond' : 'geSprite geSprite-' + prefix + 'thindiamondtrans';
    } else if (marker == 'openAsync') {
      result = 'geSprite geSprite-' + prefix + 'openasync';
    } else if (marker == 'dash') {
      result = 'geSprite geSprite-' + prefix + 'dash';
    } else if (marker == 'cross') {
      result = 'geSprite geSprite-' + prefix + 'cross';
    } else if (marker == 'async') {
      result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'async' : 'geSprite geSprite-' + prefix + 'asynctrans';
    } else if (marker == 'circle' || marker == 'circlePlus') {
      result = (fill == '1' || marker == 'circle') ? 'geSprite geSprite-' + prefix + 'circle' : 'geSprite geSprite-' + prefix + 'circleplus';
    } else if (marker == 'ERone') {
      result = 'geSprite geSprite-' + prefix + 'erone';
    } else if (marker == 'ERmandOne') {
      result = 'geSprite geSprite-' + prefix + 'eronetoone';
    } else if (marker == 'ERmany') {
      result = 'geSprite geSprite-' + prefix + 'ermany';
    } else if (marker == 'ERoneToMany') {
      result = 'geSprite geSprite-' + prefix + 'eronetomany';
    } else if (marker == 'ERzeroToOne') {
      result = 'geSprite geSprite-' + prefix + 'eroneopt';
    } else if (marker == 'ERzeroToMany') {
      result = 'geSprite geSprite-' + prefix + 'ermanyopt';
    } else {
      result = 'geSprite geSprite-noarrow';
    }
  }

  return result;
};

/**
 * Overridden in Menus.js
 * @returns {Menus}
 */
EditorUi.prototype.createMenus = function () {
  return null;
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.updatePasteActionStates = function () {
  var graph = this.editor.graph;
  var paste = this.actions.get('paste');
  var pasteHere = this.actions.get('pasteHere');

  paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!mxClipboard.isEmpty() &&
      graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
  pasteHere.setEnabled(paste.isEnabled());
};

/**
 * Hook for allowing selection and context menu for certain events.
 * @returns {void}
 */
EditorUi.prototype.initClipboard = function () {
  var ui = this;

  var mxClipboardCut = mxClipboard.cut;
  mxClipboard.cut = function (graph) {
    if (graph.cellEditor.isContentEditing()) {
      document.execCommand('cut', false, null);
    } else {
      mxClipboardCut.apply(this, arguments);
    }

    ui.updatePasteActionStates();
  };

  var mxClipboardCopy = mxClipboard.copy;
  mxClipboard.copy = function (graph) {
    var result = null;

    if (graph.cellEditor.isContentEditing()) {
      document.execCommand('copy', false, null);
    } else {
      result = result || graph.getSelectionCells();
      result = graph.getExportableCells(graph.model.getTopmostCells(result));

      var cloneMap = new Object();
      var lookup = graph.createCellLookup(result);
      var clones = graph.cloneCells(result, null, cloneMap);

      // Uses temporary model to force new IDs to be assigned
      // to avoid having to carry over the mapping from object
      // ID to cell ID to the paste operation
      var model = new mxGraphModel();
      var parent = model.getChildAt(model.getRoot(), 0);

      for (var i = 0; i < clones.length; i++) {
        model.add(parent, clones[i]);
      }

      graph.updateCustomLinks(graph.createCellMapping(cloneMap, lookup), clones);

      mxClipboard.insertCount = 1;
      mxClipboard.setCells(clones);
    }

    ui.updatePasteActionStates();

    return result;
  };

  var mxClipboardPaste = mxClipboard.paste;
  mxClipboard.paste = function (graph) {
    var result = null;

    if (graph.cellEditor.isContentEditing()) {
      document.execCommand('paste', false, null);
    } else {
      result = mxClipboardPaste.apply(this, arguments);
    }

    ui.updatePasteActionStates();

    return result;
  };

  // Overrides cell editor to update paste action state
  var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;

  this.editor.graph.cellEditor.startEditing = function () {
    cellEditorStartEditing.apply(this, arguments);
    ui.updatePasteActionStates();
  };

  var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;

  this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
    cellEditorStopEditing.apply(this, arguments);
    ui.updatePasteActionStates();
  };

  this.updatePasteActionStates();
};

/**
 * Initializes the infinite canvas.
 */
EditorUi.prototype.lazyZoomDelay = 20;

/**
 * Initializes the infinite canvas.
 * @returns {void}
 */
EditorUi.prototype.initCanvas = function () {
  // Initial page layout view, scrollBuffer and timer-based scrolling
  var graph = this.editor.graph;
  graph.timerAutoScroll = true;

  /**
   * Returns the padding for pages in page view with scrollbars.
   */
  graph.getPagePadding = function () {
    return new mxPoint(32, 32);
  };

  // Fits the number of background pages to the graph
  graph.view.getBackgroundPageBounds = function () {
    var layout = this.graph.getPageLayout();
    var page = this.graph.getPageSize();

    return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width),
        this.scale * (this.translate.y + layout.y * page.height),
        this.scale * layout.width * page.width,
        this.scale * layout.height * page.height);
  };

  graph.getPreferredPageSize = function (bounds, width, height) {
    var pages = this.getPageLayout();
    var size = this.getPageSize();

    return new mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
  };

  // Scales pages/graph to fit available size
  var resize = null;
  var ui = this;

  if (this.editor.isChromelessView()) {
    resize = mxUtils.bind(this, function (autoscale, maxScale, cx, cy) {
      if (graph.container != null && !graph.isViewer()) {
        cx = (cx != null) ? cx : 0;
        cy = (cy != null) ? cy : 0;

        var bds = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
        var scroll = mxUtils.hasScrollbars(graph.container);
        var tr = graph.view.translate;
        var s = graph.view.scale;

        // Normalizes the bounds
        var b = mxRectangle.fromRectangle(bds);
        b.x = b.x / s - tr.x;
        b.y = b.y / s - tr.y;
        b.width /= s;
        b.height /= s;

        var st = graph.container.scrollTop;
        var sl = graph.container.scrollLeft;
        var sb = (mxClient.IS_QUIRKS || document.documentMode >= 8) ? 20 : 14;

        if (document.documentMode == 8 || document.documentMode == 9) {
          sb += 3;
        }

        var cw = graph.container.offsetWidth - sb;
        var ch = graph.container.offsetHeight - sb;

        var ns = (autoscale) ? Math.max(0.3, Math.min(maxScale || 1, cw / b.width)) : s;
        var dx = ((cw - ns * b.width) / 2) / ns;
        var dy = (this.lightboxVerticalDivider == 0) ? 0 : ((ch - ns * b.height) / this.lightboxVerticalDivider) / ns;

        if (scroll) {
          dx = Math.max(dx, 0);
          dy = Math.max(dy, 0);
        }

        if (scroll || bds.width < cw || bds.height < ch) {
          graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
          graph.container.scrollTop = st * ns / s;
          graph.container.scrollLeft = sl * ns / s;
        } else if (cx != 0 || cy != 0) {
          var t = graph.view.translate;
          graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
        }
      }
    });

    /**
     * Hack to make function available to subclassers
     * @type {(function(): *)}
     */
    this.chromelessResize = resize;

    /**
     * Hook for subclassers for override
     * @type {(function(): *)}
     */
    this.chromelessWindowResize = mxUtils.bind(this, function () {
      this.chromelessResize(false);
    });

    // Removable resize listener
    var autoscaleResize = mxUtils.bind(this, function () {
      this.chromelessWindowResize(false);
    });

    mxEvent.addListener(window, 'resize', autoscaleResize);

    this.destroyFunctions.push(function () {
      mxEvent.removeListener(window, 'resize', autoscaleResize);
    });

    this.editor.addListener('resetGraphView', mxUtils.bind(this, function () {
      this.chromelessResize(true);
    }));

    this.actions.get('zoomIn').funct = mxUtils.bind(this, function (evt) {
      graph.zoomIn();
      this.chromelessResize(false);
    });
    this.actions.get('zoomOut').funct = mxUtils.bind(this, function (evt) {
      graph.zoomOut();
      this.chromelessResize(false);
    });

    // Creates toolbar for viewer - do not use CSS here
    // as this may be used in a viewer that has no CSS
    if (urlParams['toolbar'] != '0') {
      var toolbarConfig = JSON.parse(decodeURIComponent(urlParams['toolbar-config'] || '{}'));

      /**
       * @type {HTMLDivElement}
       */
      this.chromelessToolbar = document.createElement('div');
      this.chromelessToolbar.style.position = 'fixed';
      this.chromelessToolbar.style.overflow = 'hidden';
      this.chromelessToolbar.style.boxSizing = 'border-box';
      this.chromelessToolbar.style.whiteSpace = 'nowrap';
      this.chromelessToolbar.style.backgroundColor = '#000000';
      this.chromelessToolbar.style.padding = '10px 10px 8px 10px';
      this.chromelessToolbar.style.left = (graph.isViewer()) ? '0' : '50%';

      if (!mxClient.IS_VML) {
        mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'borderRadius', '20px');
        mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transition', 'opacity 600ms ease-in-out');
      }

      var updateChromelessToolbarPosition = mxUtils.bind(this, function () {
        var css = mxUtils.getCurrentStyle(graph.container);

        if (graph.isViewer()) {
          this.chromelessToolbar.style.top = '0';
        } else {
          this.chromelessToolbar.style.bottom = ((css != null) ? parseInt(css['margin-bottom'] || 0) : 0) +
              ((this.tabContainer != null) ? (20 + parseInt(this.tabContainer.style.height)) : 20) + 'px';
        }
      });

      this.editor.addListener('resetGraphView', updateChromelessToolbarPosition);
      updateChromelessToolbarPosition();

      var btnCount = 0;

      var addButton = mxUtils.bind(this, function (fn, imgSrc, tip) {
        btnCount++;

        var a = document.createElement('span');
        a.style.paddingLeft = '8px';
        a.style.paddingRight = '8px';
        a.style.cursor = 'pointer';
        mxEvent.addListener(a, 'click', fn);

        if (tip != null) {
          a.setAttribute('title', tip);
        }

        var img = document.createElement('img');
        img.setAttribute('border', '0');
        img.setAttribute('src', imgSrc);

        a.appendChild(img);
        this.chromelessToolbar.appendChild(a);

        return a;
      });

      if (toolbarConfig.backBtn != null) {
        addButton(mxUtils.bind(this, function (evt) {
          window.location.href = toolbarConfig.backBtn.url;
          mxEvent.consume(evt);
        }), Editor.backLargeImage, mxResources.get('back', null, 'Back'));
      }

      var prevButton = addButton(mxUtils.bind(this, function (evt) {
        this.actions.get('previousPage').funct();
        mxEvent.consume(evt);
      }), Editor.previousLargeImage, mxResources.get('previousPage'));

      var pageInfo = document.createElement('div');
      pageInfo.style.display = 'inline-block';
      pageInfo.style.verticalAlign = 'top';
      pageInfo.style.fontFamily = 'Helvetica,Arial';
      pageInfo.style.marginTop = '8px';
      pageInfo.style.fontSize = '14px';
      pageInfo.style.color = '#ffffff';
      this.chromelessToolbar.appendChild(pageInfo);

      var nextButton = addButton(mxUtils.bind(this, function (evt) {
        this.actions.get('nextPage').funct();
        mxEvent.consume(evt);
      }), Editor.nextLargeImage, mxResources.get('nextPage'));

      var updatePageInfo = mxUtils.bind(this, function () {
        if (this.pages != null && this.pages.length > 1 && this.currentPage != null) {
          pageInfo.innerHTML = '';
          mxUtils.write(pageInfo, (mxUtils.indexOf(this.pages, this.currentPage) + 1) + ' / ' + this.pages.length);
        }
      });

      prevButton.style.paddingLeft = '0px';
      prevButton.style.paddingRight = '4px';
      nextButton.style.paddingLeft = '4px';
      nextButton.style.paddingRight = '0px';

      var updatePageButtons = mxUtils.bind(this, function () {
        if (this.pages != null && this.pages.length > 1 && this.currentPage != null) {
          nextButton.style.display = '';
          prevButton.style.display = '';
          pageInfo.style.display = 'inline-block';
        } else {
          nextButton.style.display = 'none';
          prevButton.style.display = 'none';
          pageInfo.style.display = 'none';
        }

        updatePageInfo();
      });

      this.editor.addListener('resetGraphView', updatePageButtons);
      this.editor.addListener('pageSelected', updatePageInfo);

      addButton(mxUtils.bind(this, function (evt) {
        this.actions.get('zoomOut').funct();
        mxEvent.consume(evt);
      }), Editor.zoomOutLargeImage, mxResources.get('zoomOut') + ' (Alt+Mousewheel)');

      addButton(mxUtils.bind(this, function (evt) {
        this.actions.get('zoomIn').funct();
        mxEvent.consume(evt);
      }), Editor.zoomInLargeImage, mxResources.get('zoomIn') + ' (Alt+Mousewheel)');

      addButton(mxUtils.bind(this, function (evt) {
        if (graph.isLightboxView()) {
          if (graph.view.scale == 1) {
            this.lightboxFit();
          } else {
            graph.zoomTo(1);
          }

          this.chromelessResize(false);
        } else {
          this.chromelessResize(true);
        }

        mxEvent.consume(evt);
      }), Editor.actualSizeLargeImage, mxResources.get('fit'));

      // Changes toolbar opacity on hover
      var fadeThread = null;
      var fadeThread2 = null;

      var fadeOut = mxUtils.bind(this, function (delay) {
        if (fadeThread != null) {
          window.clearTimeout(fadeThread);
          fadeThead = null;
        }

        if (fadeThread2 != null) {
          window.clearTimeout(fadeThread2);
          fadeThead2 = null;
        }

        fadeThread = window.setTimeout(mxUtils.bind(this, function () {
          mxUtils.setOpacity(this.chromelessToolbar, 0);
          fadeThread = null;

          fadeThread2 = window.setTimeout(mxUtils.bind(this, function () {
            this.chromelessToolbar.style.display = 'none';
            fadeThread2 = null;
          }), 600);
        }), delay || 200);
      });

      var fadeIn = mxUtils.bind(this, function (opacity) {
        if (fadeThread != null) {
          window.clearTimeout(fadeThread);
          fadeThead = null;
        }

        if (fadeThread2 != null) {
          window.clearTimeout(fadeThread2);
          fadeThead2 = null;
        }

        this.chromelessToolbar.style.display = '';
        mxUtils.setOpacity(this.chromelessToolbar, opacity || 30);
      });

      if (urlParams['layers'] == '1') {
        /**
         * @type {HTMLElement}
         */
        this.layersDialog = null;

        var layersButton = addButton(mxUtils.bind(this, function (evt) {
          if (this.layersDialog != null) {
            this.layersDialog.parentNode.removeChild(this.layersDialog);
            this.layersDialog = null;
          } else {
            this.layersDialog = graph.createLayersDialog();

            mxEvent.addListener(this.layersDialog, 'mouseleave', mxUtils.bind(this, function () {
              this.layersDialog.parentNode.removeChild(this.layersDialog);
              this.layersDialog = null;
            }));

            var r = layersButton.getBoundingClientRect();

            mxUtils.setPrefixedStyle(this.layersDialog.style, 'borderRadius', '5px');
            this.layersDialog.style.position = 'fixed';
            this.layersDialog.style.fontFamily = 'Helvetica,Arial';
            this.layersDialog.style.backgroundColor = '#000000';
            this.layersDialog.style.width = '160px';
            this.layersDialog.style.padding = '4px 2px 4px 2px';
            this.layersDialog.style.color = '#ffffff';
            mxUtils.setOpacity(this.layersDialog, 70);
            this.layersDialog.style.left = r.left + 'px';
            this.layersDialog.style.bottom = parseInt(this.chromelessToolbar.style.bottom) +
                this.chromelessToolbar.offsetHeight + 4 + 'px';

            // Puts the dialog on top of the container z-index
            var style = mxUtils.getCurrentStyle(this.editor.graph.container);
            this.layersDialog.style.zIndex = style.zIndex;

            document.body.appendChild(this.layersDialog);
          }

          mxEvent.consume(evt);
        }), Editor.layersLargeImage, mxResources.get('layers'));

        // Shows/hides layers button depending on content
        var model = graph.getModel();

        model.addListener(mxEvent.CHANGE, function () {
          layersButton.style.display = (model.getChildCount(model.root) > 1) ? '' : 'none';
        });
      }

      this.addChromelessToolbarItems(addButton);

      if (this.editor.editButtonLink != null || this.editor.editButtonFunc != null) {
        addButton(mxUtils.bind(this, function (evt) {
          if (this.editor.editButtonFunc != null) {
            this.editor.editButtonFunc();
          } else if (this.editor.editButtonLink == '_blank') {
            this.editor.editAsNew(this.getEditBlankXml());
          } else {
            graph.openLink(this.editor.editButtonLink, 'editWindow');
          }

          mxEvent.consume(evt);
        }), Editor.editLargeImage, mxResources.get('edit'));
      }

      if (this.lightboxToolbarActions != null) {
        for (var i = 0; i < this.lightboxToolbarActions.length; i++) {
          var lbAction = this.lightboxToolbarActions[i];
          addButton(lbAction.fn, lbAction.icon, lbAction.tooltip);
        }
      }

      if (toolbarConfig.refreshBtn != null) {
        addButton(mxUtils.bind(this, function (evt) {
          if (toolbarConfig.refreshBtn.url) {
            window.location.href = toolbarConfig.refreshBtn.url;
          } else {
            window.location.reload();
          }

          mxEvent.consume(evt);
        }), Editor.refreshLargeImage, mxResources.get('refresh', null, 'Refresh'));
      }

      if (toolbarConfig.fullscreenBtn != null && window.self !== window.top) {
        addButton(mxUtils.bind(this, function (evt) {
          if (toolbarConfig.fullscreenBtn.url) {
            graph.openLink(toolbarConfig.fullscreenBtn.url);
          } else {
            graph.openLink(window.location.href);
          }

          mxEvent.consume(evt);
        }), Editor.fullscreenLargeImage, mxResources.get('openInNewWindow', null, 'Open in New Window'));
      }

      if ((toolbarConfig.closeBtn && window.self === window.top) ||
          (graph.lightbox && (urlParams['close'] == '1' || this.container != document.body))) {
        addButton(mxUtils.bind(this, function (evt) {
          if (urlParams['close'] == '1' || toolbarConfig.closeBtn) {
            window.close();
          } else {
            this.destroy();
            mxEvent.consume(evt);
          }
        }), Editor.closeLargeImage, mxResources.get('close') + ' (Escape)');
      }

      // Initial state invisible
      this.chromelessToolbar.style.display = 'none';

      if (!graph.isViewer()) {
        mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transform', 'translate(-50%,0)');
      }

      graph.container.appendChild(this.chromelessToolbar);

      mxEvent.addListener(graph.container, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', mxUtils.bind(this, function (evt) {
        if (!mxEvent.isTouchEvent(evt)) {
          if (!mxEvent.isShiftDown(evt)) {
            fadeIn(30);
          }

          fadeOut();
        }
      }));

      mxEvent.addListener(this.chromelessToolbar, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', function (evt) {
        mxEvent.consume(evt);
      });

      mxEvent.addListener(this.chromelessToolbar, 'mouseenter', mxUtils.bind(this, function (evt) {
        if (!mxEvent.isShiftDown(evt)) {
          fadeIn(100);
        } else {
          fadeOut();
        }
      }));

      mxEvent.addListener(this.chromelessToolbar, 'mousemove', mxUtils.bind(this, function (evt) {
        if (!mxEvent.isShiftDown(evt)) {
          fadeIn(100);
        } else {
          fadeOut();
        }

        mxEvent.consume(evt);
      }));

      mxEvent.addListener(this.chromelessToolbar, 'mouseleave', mxUtils.bind(this, function (evt) {
        if (!mxEvent.isTouchEvent(evt)) {
          fadeIn(30);
        }
      }));

      // Shows/hides toolbar for touch devices
      var tol = graph.getTolerance();

      graph.addMouseListener(
          {
            startX: 0,
            startY: 0,
            scrollLeft: 0,
            scrollTop: 0,
            mouseDown: function (sender, me) {
              /**
               * @type {number}
               */
              this.startX = me.getGraphX();
              /**
               * @type {number}
               */
              this.startY = me.getGraphY();
              /**
               * @type {number}
               */
              this.scrollLeft = graph.container.scrollLeft;
              /**
               * @type {number}
               */
              this.scrollTop = graph.container.scrollTop;
            },
            mouseMove: function (sender, me) {
            },
            mouseUp: function (sender, me) {
              if (mxEvent.isTouchEvent(me.getEvent())) {
                if ((Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol &&
                    Math.abs(this.scrollTop - graph.container.scrollTop) < tol) &&
                    (Math.abs(this.startX - me.getGraphX()) < tol &&
                        Math.abs(this.startY - me.getGraphY()) < tol)) {
                  if (parseFloat(ui.chromelessToolbar.style.opacity || 0) > 0) {
                    fadeOut();
                  } else {
                    fadeIn(30);
                  }
                }
              }
            },
          });
    } // end if toolbar

    // Installs handling of highlight and handling links to relative links and anchors
    if (!this.editor.editable) {
      this.addChromelessClickHandler();
    }
  } else if (this.editor.extendCanvas) {
    /**
     * Guesses autoTranslate to avoid another repaint (see below).
     * Works if only the scale of the graph changes or if pages
     * are visible and the visible pages do not change.
     */
    var graphViewValidate = graph.view.validate;
    graph.view.validate = function () {
      if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container)) {
        var pad = this.graph.getPagePadding();
        var size = this.graph.getPageSize();

        // Updating scrollbars here causes flickering in quirks and is not needed
        // if zoom method is always used to set the current scale on the graph.
        var tx = this.translate.x;
        var ty = this.translate.y;
        this.translate.x = pad.x - (this.x0 || 0) * size.width;
        this.translate.y = pad.y - (this.y0 || 0) * size.height;
      }

      graphViewValidate.apply(this, arguments);
    };

    if (!graph.isViewer()) {
      var graphSizeDidChange = graph.sizeDidChange;

      graph.sizeDidChange = function () {
        if (this.container != null && mxUtils.hasScrollbars(this.container)) {
          var pages = this.getPageLayout();
          var pad = this.getPagePadding();
          var size = this.getPageSize();

          // Updates the minimum graph size
          var minw = Math.ceil(2 * pad.x + pages.width * size.width);
          var minh = Math.ceil(2 * pad.y + pages.height * size.height);

          var min = graph.minimumGraphSize;

          // LATER: Fix flicker of scrollbar size in IE quirks mode
          // after delayed call in window.resize event handler
          if (min == null || min.width != minw || min.height != minh) {
            graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
          }

          // Updates auto-translate to include padding and graph size
          var dx = pad.x - pages.x * size.width;
          var dy = pad.y - pages.y * size.height;

          if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
            this.autoTranslate = true;
            this.view.x0 = pages.x;
            this.view.y0 = pages.y;

            // NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
            // BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
            // SHOULD MOVE TRANSLATE/SCALE TO VIEW.
            var tx = graph.view.translate.x;
            var ty = graph.view.translate.y;
            graph.view.setTranslate(dx, dy);

            // LATER: Fix rounding errors for small zoom
            graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
            graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);

            this.autoTranslate = false;

            return;
          }

          graphSizeDidChange.apply(this, arguments);
        } else {
          // Fires event but does not invoke superclass
          this.fireEvent(new mxEventObject(mxEvent.SIZE, 'bounds', this.getGraphBounds()));
        }
      };
    }
  }

  // Accumulates the zoom factor while the rendering is taking place
  // so that not the complete sequence of zoom steps must be painted
  graph.updateZoomTimeout = null;
  graph.cumulativeZoomFactor = 1;

  var cursorPosition = null;

  graph.lazyZoom = function (zoomIn) {
    if (this.updateZoomTimeout != null) {
      window.clearTimeout(this.updateZoomTimeout);
    }

    // Switches to 1% zoom steps below 15%
    // Lower bound depdends on rounding below
    if (zoomIn) {
      if (this.view.scale * this.cumulativeZoomFactor < 0.15) {
        this.cumulativeZoomFactor = (this.view.scale + 0.01) / this.view.scale;
      } else {
        // Uses to 5% zoom steps for better grid rendering in webkit
        // and to avoid rounding errors for zoom steps
        this.cumulativeZoomFactor *= this.zoomFactor;
        this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
      }
    } else {
      if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
        this.cumulativeZoomFactor = (this.view.scale - 0.01) / this.view.scale;
      } else {
        // Uses to 5% zoom steps for better grid rendering in webkit
        // and to avoid rounding errors for zoom steps
        this.cumulativeZoomFactor /= this.zoomFactor;
        this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
      }
    }

    this.cumulativeZoomFactor = Math.max(0.01, Math.min(this.view.scale * this.cumulativeZoomFactor, 160) / this.view.scale);

    this.updateZoomTimeout = window.setTimeout(mxUtils.bind(this, function () {
      var offset = mxUtils.getOffset(graph.container);
      var dx = 0;
      var dy = 0;

      if (cursorPosition != null) {
        dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
        dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
      }

      var prev = this.view.scale;
      this.zoom(this.cumulativeZoomFactor);
      var s = this.view.scale;

      if (s != prev) {
        if (resize != null) {
          ui.chromelessResize(false, null, dx * (this.cumulativeZoomFactor - 1),
              dy * (this.cumulativeZoomFactor - 1));
        }

        if (mxUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0)) {
          graph.container.scrollLeft -= dx * (this.cumulativeZoomFactor - 1);
          graph.container.scrollTop -= dy * (this.cumulativeZoomFactor - 1);
        }
      }

      this.cumulativeZoomFactor = 1;
      this.updateZoomTimeout = null;
    }), this.lazyZoomDelay);
  };

  mxEvent.addMouseWheelListener(mxUtils.bind(this, function (evt, up) {
    // Ctrl+wheel (or pinch on touchpad) is a native browser zoom event is OS X
    // LATER: Add support for zoom via pinch on trackpad for Chrome in OS X
    if ((this.dialogs == null || this.dialogs.length == 0) && graph.isZoomWheelEvent(evt)) {
      var source = mxEvent.getSource(evt);

      while (source != null) {
        if (source == graph.container) {
          cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
          graph.lazyZoom(up);
          mxEvent.consume(evt);

          return false;
        }

        source = source.parentNode;
      }
    }
  }), graph.container);
};

/**
 * Creates a temporary graph instance for rendering off-screen content.
 * @param addButton {function}
 */
EditorUi.prototype.addChromelessToolbarItems = function (addButton) {
  addButton(mxUtils.bind(this, function (evt) {
    this.actions.get('print').funct();
    mxEvent.consume(evt);
  }), Editor.printLargeImage, mxResources.get('print'));
};

/**
 * Creates a temporary graph instance for rendering off-screen content.
 * @param stylesheet {mxStylesheet}
 * @returns {Graph}
 */
EditorUi.prototype.createTemporaryGraph = function (stylesheet) {
  var graph = new Graph(document.createElement('div'), null, null, stylesheet);
  graph.resetViewOnRootChange = false;
  graph.setConnectable(false);
  graph.gridEnabled = false;
  graph.autoScroll = false;
  graph.setTooltips(false);
  graph.setEnabled(false);

  // Container must be in the DOM for correct HTML rendering
  graph.container.style.visibility = 'hidden';
  graph.container.style.position = 'absolute';
  graph.container.style.overflow = 'hidden';
  graph.container.style.height = '1px';
  graph.container.style.width = '1px';

  return graph;
};

/**
 *
 */
EditorUi.prototype.addChromelessClickHandler = function () {
  var hl = urlParams['highlight'];

  // Adds leading # for highlight color code
  if (hl != null && hl.length > 0) {
    hl = '#' + hl;
  }

  this.editor.graph.addClickHandler(hl);
};

/**
 * @param forceHide {boolean}
 */
EditorUi.prototype.toggleFormatPanel = function (forceHide) {
  if (this.format != null) {
    this.formatWidth = (forceHide || this.formatWidth > 0) ? 0 : 240;
    this.formatContainer.style.display = (forceHide || this.formatWidth > 0) ? '' : 'none';
    this.refresh();
    this.format.refresh();
    this.fireEvent(new mxEventObject('formatWidthChanged'));
  }
};

/**
 * Adds support for placeholders in labels.
 * @param maxHeight {number}
 */
EditorUi.prototype.lightboxFit = function (maxHeight) {
  if (this.isDiagramEmpty()) {
    this.editor.graph.view.setScale(1);
  } else {
    var p = urlParams['border'];
    var border = 60;

    if (p != null) {
      border = parseInt(p);
    }

    // LATER: Use initial graph bounds to avoid rounding errors
    this.editor.graph.maxFitScale = this.lightboxMaxFitScale;
    this.editor.graph.fit(border, null, null, null, null, null, maxHeight);
    this.editor.graph.maxFitScale = null;
  }
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
EditorUi.prototype.isDiagramEmpty = function () {
  var model = this.editor.graph.getModel();

  return model.getChildCount(model.root) == 1 && model.getChildCount(model.getChildAt(model.root, 0)) == 0;
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.isSelectionAllowed = function (evt) {
  return mxEvent.getSource(evt).nodeName == 'SELECT' || (mxEvent.getSource(evt).nodeName == 'INPUT' &&
      mxUtils.isAncestorNode(this.formatContainer, mxEvent.getSource(evt)));
};

/**
 * Installs dialog if browser window is closed without saving
 * This must be disabled during save and image export.
 * @returns {void}
 */
EditorUi.prototype.addBeforeUnloadListener = function () {
  // Installs dialog if browser window is closed without saving
  // This must be disabled during save and image export
  window.onbeforeunload = mxUtils.bind(this, function () {
    if (!this.editor.isChromelessView()) {
      return this.onBeforeUnload();
    }
  });
};

/**
 * Sets the onbeforeunload for the application
 * @returns {string|void}
 */
EditorUi.prototype.onBeforeUnload = function () {
  if (this.editor.modified) {
    return mxResources.get('allChangesLost');
  }
};

/**
 * Opens the current diagram via the window.opener if one exists.
 * @returns {void}
 */
EditorUi.prototype.open = function () {
  // Cross-domain window access is not allowed in FF, so if we
  // were opened from another domain then this will fail.
  try {
    if (window.opener != null && window.opener.openFile != null) {
      window.opener.openFile.setConsumer(mxUtils.bind(this, function (xml, filename) {
        try {
          var doc = mxUtils.parseXml(xml);
          this.editor.setGraphXml(doc.documentElement);
          this.editor.setModified(false);
          this.editor.undoManager.clear();

          if (filename != null) {
            this.editor.setFilename(filename);
            this.updateDocumentTitle();
          }

          return;
        } catch (e) {
          mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
        }
      }));
    }
  } catch (e) {
    // ignore
  }

  // Fires as the last step if no file was loaded
  this.editor.graph.view.validate();

  // Required only in special cases where an initial file is opened
  // and the minimumGraphSize changes and CSS must be updated.
  this.editor.graph.sizeDidChange();
  this.editor.fireEvent(new mxEventObject('resetGraphView'));
};

/**
 * Sets the current menu and element.
 * @param menu {Menus}
 * @param elt {HTMLElement}
 */
EditorUi.prototype.setCurrentMenu = function (menu, elt) {
  /**
   * @type {HTMLElement}
   */
  this.currentMenuElt = elt;
  /**
   * @type {Menus}
   */
  this.currentMenu = menu;
};

/**
 * Resets the current menu and element.
 */
EditorUi.prototype.resetCurrentMenu = function () {
  this.currentMenuElt = null;
  this.currentMenu = null;
};

/**
 * Hides and destroys the current menu.
 */
EditorUi.prototype.hideCurrentMenu = function () {
  if (this.currentMenu != null) {
    this.currentMenu.hideMenu();
    this.resetCurrentMenu();
  }
};

/**
 * Updates the document title.
 */
EditorUi.prototype.updateDocumentTitle = function () {
  var title = this.editor.getOrCreateFilename();

  if (this.editor.appName != null) {
    title += ' - ' + this.editor.appName;
  }

  document.title = title;
};

/**
 * Updates the document title.
 * @returns {HoverIcons}
 */
EditorUi.prototype.createHoverIcons = function () {
  return new HoverIcons(this.editor.graph);
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.redo = function () {
  try {
    var graph = this.editor.graph;

    if (graph.isEditing()) {
      document.execCommand('redo', false, null);
    } else {
      this.editor.undoManager.redo();
    }
  } catch (e) {
    // ignore all errors
  }
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.undo = function () {
  try {
    var graph = this.editor.graph;

    if (graph.isEditing()) {
      // Stops editing and executes undo on graph if native undo
      // does not affect current editing value
      var value = graph.cellEditor.textarea.innerHTML;
      document.execCommand('undo', false, null);

      if (value == graph.cellEditor.textarea.innerHTML) {
        graph.stopEditing(true);
        this.editor.undoManager.undo();
      }
    } else {
      this.editor.undoManager.undo();
    }
  } catch (e) {
    // ignore all errors
  }
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.canRedo = function () {
  return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.canUndo = function () {
  return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
};

/**
 *
 */
EditorUi.prototype.getEditBlankXml = function () {
  return mxUtils.getXml(this.editor.getGraphXml());
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.getUrl = function (pathname) {
  var href = (pathname != null) ? pathname : window.location.pathname;
  var parms = (href.indexOf('?') > 0) ? 1 : 0;

  // Removes template URL parameter for new blank diagram
  for (var key in urlParams) {
    if (parms == 0) {
      href += '?';
    } else {
      href += '&';
    }

    href += key + '=' + urlParams[key];
    parms++;
  }

  return href;
};

/**
 * Specifies if the graph has scrollbars.
 * @param value {boolean}
 */
EditorUi.prototype.setScrollbars = function (value) {
  var graph = this.editor.graph;
  var prev = graph.container.style.overflow;
  graph.scrollbars = value;
  this.editor.updateGraphComponents();

  if (prev != graph.container.style.overflow) {
    if (graph.container.style.overflow == 'hidden') {
      var t = graph.view.translate;
      graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
      graph.container.scrollLeft = 0;
      graph.container.scrollTop = 0;
      graph.minimumGraphSize = null;
      graph.sizeDidChange();
    } else {
      var dx = graph.view.translate.x;
      var dy = graph.view.translate.y;

      graph.view.translate.x = 0;
      graph.view.translate.y = 0;
      graph.sizeDidChange();
      graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
      graph.container.scrollTop -= Math.round(dy * graph.view.scale);
    }
  }

  this.fireEvent(new mxEventObject('scrollbarsChanged'));
};

/**
 * Returns true if the graph has scrollbars.
 */
EditorUi.prototype.hasScrollbars = function () {
  return this.editor.graph.scrollbars;
};

/**
 * Resets the state of the scrollbars.
 */
EditorUi.prototype.resetScrollbars = function () {
  var graph = this.editor.graph;

  if (!this.editor.extendCanvas) {
    graph.container.scrollTop = 0;
    graph.container.scrollLeft = 0;

    if (!mxUtils.hasScrollbars(graph.container)) {
      graph.view.setTranslate(0, 0);
    }
  } else if (!this.editor.isChromelessView()) {
    if (mxUtils.hasScrollbars(graph.container)) {
      if (graph.pageVisible) {
        var pad = graph.getPagePadding();
        graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) - 1;
        graph.container.scrollLeft = Math.floor(Math.min(pad.x,
            (graph.container.scrollWidth - graph.container.clientWidth) / 2)) - 1;

        // Scrolls graph to visible area
        var bounds = graph.getGraphBounds();

        if (bounds.width > 0 && bounds.height > 0) {
          if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth * 0.9) {
            graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x - 10);
          }

          if (bounds.y > graph.container.scrollTop + graph.container.clientHeight * 0.9) {
            graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y - 10);
          }
        }
      } else {
        var bounds = graph.getGraphBounds();
        var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
        var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
        graph.container.scrollTop = Math.floor(Math.max(0, bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)));
        graph.container.scrollLeft = Math.floor(Math.max(0, bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)));
      }
    } else {
      // This code is not actively used since the default for scrollbars is always true
      if (graph.pageVisible) {
        var b = graph.view.getBackgroundPageBounds();
        graph.view.setTranslate(Math.floor(Math.max(0, (graph.container.clientWidth - b.width) / 2) - b.x),
            Math.floor(Math.max(0, (graph.container.clientHeight - b.height) / 2) - b.y));
      } else {
        var bounds = graph.getGraphBounds();
        graph.view.setTranslate(Math.floor(Math.max(0, Math.max(0, (graph.container.clientWidth - bounds.width) / 2) - bounds.x)),
            Math.floor(Math.max(0, Math.max(20, (graph.container.clientHeight - bounds.height) / 4)) - bounds.y));
      }
    }
  }
};

/**
 * Loads the stylesheet for this graph.
 * @param value {boolean}
 */
EditorUi.prototype.setPageVisible = function (value) {
  var graph = this.editor.graph;
  var hasScrollbars = mxUtils.hasScrollbars(graph.container);
  var tx = 0;
  var ty = 0;

  if (hasScrollbars) {
    tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
    ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
  }

  graph.pageVisible = value;
  graph.pageBreaksVisible = value;
  graph.preferPageSize = value;
  graph.view.validateBackground();

  // Workaround for possible handle offset
  if (hasScrollbars) {
    var cells = graph.getSelectionCells();
    graph.clearSelection();
    graph.setSelectionCells(cells);
  }

  // Calls updatePageBreaks
  graph.sizeDidChange();

  if (hasScrollbars) {
    graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
    graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
  }

  this.fireEvent(new mxEventObject('pageViewChanged'));
};

/**
 * Change types
 * @class
 * @param ui {EditorUi}
 * @param color {string}
 * @param image {mxImage}
 * @param format {mxRectangle}
 */
export class ChangePageSetup {
  /**
   Change types
   */
  constructor(ui, color, image, format) {
    this.ui = ui;
    this.color = color;
    this.previousColor = color;
    this.image = image;
    this.previousImage = image;
    this.format = format;
    this.previousFormat = format;
    this.ignoreColor = false;
    this.ignoreImage = false;
  }

  /**
   Global config that specifies if the compact UI elements should be used.
   */
  compactUi = true;
  /**
   Specifies the size of the split bar.
   */
  splitSize = (mxClient.IS_TOUCH || mxClient.IS_POINTER) ? :;
  /**
   Specifies the height of the menubar. Default is 34.
   */
  menubarHeight =;
  /**
   Specifies the width of the format panel should be enabled. Default is true.
   */
  formatEnabled = false;
  /**
   Specifies the width of the format panel. Default is 240.
   */
  formatWidth =;
  /**
   Specifies the height of the toolbar. Default is 38.
   */
  toolbarHeight =;
  /**
   Specifies the height of the footer. Default is 28.
   */
  footerHeight =;
  /**
   Specifies the height of the optional sidebarFooterContainer. Default is 34.
   */
  sidebarFooterHeight =;
  /**
   Specifies the position of the horizontal split bar. Default is 240 or 118 for
   screen widths <= 640px.
   */
  hsplitPosition = (screen.width <=) ? : ((urlParams[] !=) ? :);
  /**
   Specifies if animations are allowed in <executeLayout>. Default is true.
   */
  allowAnimation = true;
  /**
   Specifies if animations are allowed in <executeLayout>. Default is true.
   */
  lightboxMaxFitScale =;
  /**
   Specifies if animations are allowed in <executeLayout>. Default is true.
   */
  lightboxVerticalDivider =;
  /**
   Specifies if single click on horizontal split should collapse sidebar. Default is false.
   */
  hsplitClickEnabled = false;

  /**
   Installs the listeners to update the action states.
   */
  init() {
    this.setPageFormat(new mxRectangle(, , ,));
    var graph = this.editor.graph;
    if (!graph.standalone) {
      mxEvent.addListener(graph.container, , mxUtils.bind(this, function (evt) {
        this.onKeyDown(evt);
      }));
      mxEvent.addListener(graph.container, , mxUtils.bind(this, function (evt) {
        this.onKeyPress(evt);
      }));
      this.addUndoListener();
      this.addBeforeUnloadListener();
      graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
        this.updateActionStates();
      }));
      graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
        this.updateActionStates();
      }));
      var graphSetDefaultParent = graph.setDefaultParent;
      var ui = this;
      this.editor.graph.setDefaultParent = function () {
        graphSetDefaultParent.apply(this, arguments);
        ui.updateActionStates();
      };
      graph.editLink = ui.actions.get().funct;
      this.updateActionStates();
      this.initClipboard();
      this.initCanvas();
      if (this.format != null) {
        this.format.init();
      }
    }
  }

  /**
   Returns true if the given event should start editing. This implementation returns true.
   */
  onKeyDown(evt) {
    var graph = this.editor.graph;
    if (evt.which == && graph.isEnabled() && !mxEvent.isAltDown(evt)) {
      if (graph.isEditing()) {
        graph.stopEditing(false);
      } else {
        graph.selectCell(!mxEvent.isShiftDown(evt));
      }
      mxEvent.consume(evt);
    }
  }

  /**
   Returns true if the given event should start editing. This implementation returns true.
   */
  onKeyPress(evt) {
    var graph = this.editor.graph;
    if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== && !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt)) {
      graph.escape();
      graph.startEditing();
      if (mxClient.IS_FF) {
        var ce = graph.cellEditor;
        ce.textarea.innerHTML = String.fromCharCode(evt.which);
        var range = document.createRange();
        range.selectNodeContents(ce.textarea);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  /**
   Returns true if the given event should start editing. This implementation returns true.
   */
  isImmediateEditingEvent(evt) {
    return true;
  }

  /**
   Private helper method.
   */
  getCssClassForMarker(prefix, shape, marker, fill) {
    var result =;
    if (shape ==) {
      result = (marker != null && marker != mxConstants.NONE) ? +prefix + :;
    } else {
      if (marker == mxConstants.ARROW_CLASSIC) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_CLASSIC_THIN) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_OPEN) {
        result = +prefix +;
      } else if (marker == mxConstants.ARROW_OPEN_THIN) {
        result = +prefix +;
      } else if (marker == mxConstants.ARROW_BLOCK) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_BLOCK_THIN) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_OVAL) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_DIAMOND) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == mxConstants.ARROW_DIAMOND_THIN) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = (fill ==) ? +prefix + : +prefix +;
      } else if (marker == || marker ==) {
        result = (fill == || marker ==) ? +prefix + : +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else if (marker ==) {
        result = +prefix +;
      } else {
        result =;
      }
    }
    return result;
  }

  /**
   Overridden in Menus.js
   */
  createMenus() {
    return null;
  }

  /**
   Hook for allowing selection and context menu for certain events.
   */
  updatePasteActionStates() {
    var graph = this.editor.graph;
    var paste = this.actions.get();
    var pasteHere = this.actions.get();
    paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!mxClipboard.isEmpty() && graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
    pasteHere.setEnabled(paste.isEnabled());
  }

  /**
   Hook for allowing selection and context menu for certain events.
   */
  initClipboard() {
    var ui = this;
    var mxClipboardCut = mxClipboard.cut;
    mxClipboard.cut = function (graph) {
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand(, false, null);
      } else {
        mxClipboardCut.apply(this, arguments);
      }
      ui.updatePasteActionStates();
    };
    var mxClipboardCopy = mxClipboard.copy;
    mxClipboard.copy = function (graph) {
      var result = null;
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand(, false, null);
      } else {
        result = result || graph.getSelectionCells();
        result = graph.getExportableCells(graph.model.getTopmostCells(result));
        var cloneMap = new Object();
        var lookup = graph.createCellLookup(result);
        var clones = graph.cloneCells(result, null, cloneMap);
        var model = new mxGraphModel();
        var parent = model.getChildAt(model.getRoot());
        for (var i =; i < clones.length; i++) {
          model.add(parent, clones[i]);
        }
        graph.updateCustomLinks(graph.createCellMapping(cloneMap, lookup), clones);
        mxClipboard.insertCount =;
        mxClipboard.setCells(clones);
      }
      ui.updatePasteActionStates();
      return result;
    };
    var mxClipboardPaste = mxClipboard.paste;
    mxClipboard.paste = function (graph) {
      var result = null;
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand(, false, null);
      } else {
        result = mxClipboardPaste.apply(this, arguments);
      }
      ui.updatePasteActionStates();
      return result;
    };
    var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
    this.editor.graph.cellEditor.startEditing = function () {
      cellEditorStartEditing.apply(this, arguments);
      ui.updatePasteActionStates();
    };
    var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
    this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
      cellEditorStopEditing.apply(this, arguments);
      ui.updatePasteActionStates();
    };
    this.updatePasteActionStates();
  }

  /**
   Initializes the infinite canvas.
   */
  lazyZoomDelay =;

  /**
   Initializes the infinite canvas.
   */
  initCanvas() {
    var graph = this.editor.graph;
    graph.timerAutoScroll = true;
    graph.getPagePadding = function () {
      return new mxPoint(,);
    };
    graph.view.getBackgroundPageBounds = function () {
      var layout = this.graph.getPageLayout();
      var page = this.graph.getPageSize();
      return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width), this.scale * (this.translate.y + layout.y * page.height), this.scale * layout.width * page.width, this.scale * layout.height * page.height);
    };
    graph.getPreferredPageSize = function (bounds, width, height) {
      var pages = this.getPageLayout();
      var size = this.getPageSize();
      return new mxRectangle(, , pages.width * size.width, pages.height * size.height);
    };
    var resize = null;
    var ui = this;
    if (this.editor.isChromelessView()) {
      resize = mxUtils.bind(this, function (autoscale, maxScale, cx, cy) {
        if (graph.container != null && !graph.isViewer()) {
          cx = (cx != null) ? cx :;
          cy = (cy != null) ? cy :;
          var bds = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
          var scroll = mxUtils.hasScrollbars(graph.container);
          var tr = graph.view.translate;
          var s = graph.view.scale;
          var b = mxRectangle.fromRectangle(bds);
          b.x = b.x / s - tr.x;
          b.y = b.y / s - tr.y;
          b.width /= s;
          b.height /= s;
          var st = graph.container.scrollTop;
          var sl = graph.container.scrollLeft;
          var sb = (mxClient.IS_QUIRKS || document.documentMode >=) ? :;
          if (document.documentMode == || document.documentMode ==) {
            sb +=;
          }
          var cw = graph.container.offsetWidth - sb;
          var ch = graph.container.offsetHeight - sb;
          var ns = (autoscale) ? Math.max(, Math.min(maxScale ||, cw / b.width)) : s;
          var dx = ((cw - ns * b.width) /) / ns;
          var dy = (this.lightboxVerticalDivider ==) ? : ((ch - ns * b.height) / this.lightboxVerticalDivider) / ns;
          if (scroll) {
            dx = Math.max(dx);
            dy = Math.max(dy);
          }
          if (scroll || bds.width < cw || bds.height < ch) {
            graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
            graph.container.scrollTop = st * ns / s;
            graph.container.scrollLeft = sl * ns / s;
          } else if (cx != || cy !=) {
            var t = graph.view.translate;
            graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
          }
        }
      });
      this.chromelessResize = resize;
      this.chromelessWindowResize = mxUtils.bind(this, function () {
        this.chromelessResize(false);
      });
      var autoscaleResize = mxUtils.bind(this, function () {
        this.chromelessWindowResize(false);
      });
      mxEvent.addListener(window, , autoscaleResize);
      this.destroyFunctions.push(function () {
        mxEvent.removeListener(window, , autoscaleResize);
      });
      this.editor.addListener(, mxUtils.bind(this, function () {
        this.chromelessResize(true);
      }));
      this.actions.get().funct = mxUtils.bind(this, function (evt) {
        graph.zoomIn();
        this.chromelessResize(false);
      });
      this.actions.get().funct = mxUtils.bind(this, function (evt) {
        graph.zoomOut();
        this.chromelessResize(false);
      });
      if (urlParams[] !=) {
        var toolbarConfig = JSON.parse(decodeURIComponent(urlParams[] ||));
        this.chromelessToolbar = document.createElement();
        this.chromelessToolbar.style.position =;
        this.chromelessToolbar.style.overflow =;
        this.chromelessToolbar.style.boxSizing =;
        this.chromelessToolbar.style.whiteSpace =;
        this.chromelessToolbar.style.backgroundColor =;
        this.chromelessToolbar.style.padding =;
        this.chromelessToolbar.style.left = (graph.isViewer()) ? :;
        if (!mxClient.IS_VML) {
          mxUtils.setPrefixedStyle(this.chromelessToolbar.style ,);
          mxUtils.setPrefixedStyle(this.chromelessToolbar.style ,);
        }
        var updateChromelessToolbarPosition = mxUtils.bind(this, function () {
          var css = mxUtils.getCurrentStyle(graph.container);
          if (graph.isViewer()) {
            this.chromelessToolbar.style.top =;
          } else {
            this.chromelessToolbar.style.bottom = ((css != null) ? parseInt(css[] ||) :) + ((this.tabContainer != null) ? (+parseInt(this.tabContainer.style.height)) :) +;
          }
        });
        this.editor.addListener(, updateChromelessToolbarPosition);
        updateChromelessToolbarPosition();
        var btnCount =;
        var addButton = mxUtils.bind(this, function (fn, imgSrc, tip) {
          btnCount++;
          var a = document.createElement();
          a.style.paddingLeft =;
          a.style.paddingRight =;
          a.style.cursor =;
          mxEvent.addListener(a, , fn);
          if (tip != null) {
            a.setAttribute(, tip);
          }
          var img = document.createElement();
          img.setAttribute(,);
          img.setAttribute(, imgSrc);
          a.appendChild(img);
          this.chromelessToolbar.appendChild(a);
          return a;
        });
        if (toolbarConfig.backBtn != null) {
          addButton(mxUtils.bind(this, function (evt) {
            window.location.href = toolbarConfig.backBtn.url;
            mxEvent.consume(evt);
          }), Editor.backLargeImage, mxResources.get(, null));
        }
        var prevButton = addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.previousLargeImage, mxResources.get());
        var pageInfo = document.createElement();
        pageInfo.style.display =;
        pageInfo.style.verticalAlign =;
        pageInfo.style.fontFamily =;
        pageInfo.style.marginTop =;
        pageInfo.style.fontSize =;
        pageInfo.style.color =;
        this.chromelessToolbar.appendChild(pageInfo);
        var nextButton = addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.nextLargeImage, mxResources.get());
        var updatePageInfo = mxUtils.bind(this, function () {
          if (this.pages != null && this.pages.length > && this.currentPage != null) {
            pageInfo.innerHTML =;
            mxUtils.write(pageInfo, (mxUtils.indexOf(this.pages, this.currentPage) +) + +this.pages.length);
          }
        });
        prevButton.style.paddingLeft =;
        prevButton.style.paddingRight =;
        nextButton.style.paddingLeft =;
        nextButton.style.paddingRight =;
        var updatePageButtons = mxUtils.bind(this, function () {
          if (this.pages != null && this.pages.length > && this.currentPage != null) {
            nextButton.style.display =;
            prevButton.style.display =;
            pageInfo.style.display =;
          } else {
            nextButton.style.display =;
            prevButton.style.display =;
            pageInfo.style.display =;
          }
          updatePageInfo();
        });
        this.editor.addListener(, updatePageButtons);
        this.editor.addListener(, updatePageInfo);
        addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.zoomOutLargeImage, mxResources.get() +);
        addButton(mxUtils.bind(this, function (evt) {
          this.actions.get().funct();
          mxEvent.consume(evt);
        }), Editor.zoomInLargeImage, mxResources.get() +);
        addButton(mxUtils.bind(this, function (evt) {
          if (graph.isLightboxView()) {
            if (graph.view.scale ==) {
              this.lightboxFit();
            } else {
              graph.zoomTo();
            }
            this.chromelessResize(false);
          } else {
            this.chromelessResize(true);
          }
          mxEvent.consume(evt);
        }), Editor.actualSizeLargeImage, mxResources.get());
        var fadeThread = null;
        var fadeThread2 = null;
        var fadeOut = mxUtils.bind(this, function (delay) {
          if (fadeThread != null) {
            window.clearTimeout(fadeThread);
            fadeThead = null;
          }
          if (fadeThread2 != null) {
            window.clearTimeout(fadeThread2);
            fadeThead2 = null;
          }
          fadeThread = window.setTimeout(mxUtils.bind(this, function () {
            mxUtils.setOpacity(this.chromelessToolbar);
            fadeThread = null;
            fadeThread2 = window.setTimeout(mxUtils.bind(this, function () {
              this.chromelessToolbar.style.display =;
              fadeThread2 = null;
            }));
          }), delay ||);
        });
        var fadeIn = mxUtils.bind(this, function (opacity) {
          if (fadeThread != null) {
            window.clearTimeout(fadeThread);
            fadeThead = null;
          }
          if (fadeThread2 != null) {
            window.clearTimeout(fadeThread2);
            fadeThead2 = null;
          }
          this.chromelessToolbar.style.display =;
          mxUtils.setOpacity(this.chromelessToolbar, opacity ||);
        });
        if (urlParams[] ==) {
          this.layersDialog = null;
          var layersButton = addButton(mxUtils.bind(this, function (evt) {
            if (this.layersDialog != null) {
              this.layersDialog.parentNode.removeChild(this.layersDialog);
              this.layersDialog = null;
            } else {
              this.layersDialog = graph.createLayersDialog();
              mxEvent.addListener(this.layersDialog, , mxUtils.bind(this, function () {
                this.layersDialog.parentNode.removeChild(this.layersDialog);
                this.layersDialog = null;
              }));
              var r = layersButton.getBoundingClientRect();
              mxUtils.setPrefixedStyle(this.layersDialog.style ,);
              this.layersDialog.style.position =;
              this.layersDialog.style.fontFamily =;
              this.layersDialog.style.backgroundColor =;
              this.layersDialog.style.width =;
              this.layersDialog.style.padding =;
              this.layersDialog.style.color =;
              mxUtils.setOpacity(this.layersDialog);
              this.layersDialog.style.left = r.left +;
              this.layersDialog.style.bottom = parseInt(this.chromelessToolbar.style.bottom) + this.chromelessToolbar.offsetHeight + +;
              var style = mxUtils.getCurrentStyle(this.editor.graph.container);
              this.layersDialog.style.zIndex = style.zIndex;
              document.body.appendChild(this.layersDialog);
            }
            mxEvent.consume(evt);
          }), Editor.layersLargeImage, mxResources.get());
          var model = graph.getModel();
          model.addListener(mxEvent.CHANGE, function () {
            layersButton.style.display = (model.getChildCount(model.root) >) ? :;
          });
        }
        this.addChromelessToolbarItems(addButton);
        if (this.editor.editButtonLink != null || this.editor.editButtonFunc != null) {
          addButton(mxUtils.bind(this, function (evt) {
            if (this.editor.editButtonFunc != null) {
              this.editor.editButtonFunc();
            } else if (this.editor.editButtonLink ==) {
              this.editor.editAsNew(this.getEditBlankXml());
            } else {
              graph.openLink(this.editor.editButtonLink);
            }
            mxEvent.consume(evt);
          }), Editor.editLargeImage, mxResources.get());
        }
        if (this.lightboxToolbarActions != null) {
          for (var i =; i < this.lightboxToolbarActions.length; i++) {
            var lbAction = this.lightboxToolbarActions[i];
            addButton(lbAction.fn, lbAction.icon, lbAction.tooltip);
          }
        }
        if (toolbarConfig.refreshBtn != null) {
          addButton(mxUtils.bind(this, function (evt) {
            if (toolbarConfig.refreshBtn.url) {
              window.location.href = toolbarConfig.refreshBtn.url;
            } else {
              window.location.reload();
            }
            mxEvent.consume(evt);
          }), Editor.refreshLargeImage, mxResources.get(, null));
        }
        if (toolbarConfig.fullscreenBtn != null && window.self !== window.top) {
          addButton(mxUtils.bind(this, function (evt) {
            if (toolbarConfig.fullscreenBtn.url) {
              graph.openLink(toolbarConfig.fullscreenBtn.url);
            } else {
              graph.openLink(window.location.href);
            }
            mxEvent.consume(evt);
          }), Editor.fullscreenLargeImage, mxResources.get(, null));
        }
        if ((toolbarConfig.closeBtn && window.self === window.top) || (graph.lightbox && (urlParams[] == || this.container != document.body))) {
          addButton(mxUtils.bind(this, function (evt) {
            if (urlParams[] == || toolbarConfig.closeBtn) {
              window.close();
            } else {
              this.destroy();
              mxEvent.consume(evt);
            }
          }), Editor.closeLargeImage, mxResources.get() +);
        }
        this.chromelessToolbar.style.display =;
        if (!graph.isViewer()) {
          mxUtils.setPrefixedStyle(this.chromelessToolbar.style ,);
        }
        graph.container.appendChild(this.chromelessToolbar);
        mxEvent.addListener(graph.container, (mxClient.IS_POINTER) ? :, mxUtils.bind(this, function (evt) {
          if (!mxEvent.isTouchEvent(evt)) {
            if (!mxEvent.isShiftDown(evt)) {
              fadeIn();
            }
            fadeOut();
          }
        }));
        mxEvent.addListener(this.chromelessToolbar, (mxClient.IS_POINTER) ? :, function (evt) {
          mxEvent.consume(evt);
        });
        mxEvent.addListener(this.chromelessToolbar, , mxUtils.bind(this, function (evt) {
          if (!mxEvent.isShiftDown(evt)) {
            fadeIn();
          } else {
            fadeOut();
          }
        }));
        mxEvent.addListener(this.chromelessToolbar, , mxUtils.bind(this, function (evt) {
          if (!mxEvent.isShiftDown(evt)) {
            fadeIn();
          } else {
            fadeOut();
          }
          mxEvent.consume(evt);
        }));
        mxEvent.addListener(this.chromelessToolbar, , mxUtils.bind(this, function (evt) {
          if (!mxEvent.isTouchEvent(evt)) {
            fadeIn();
          }
        }));
        var tol = graph.getTolerance();
        graph.addMouseListener({
          startX:, startY:, scrollLeft:, scrollTop:, mouseDown: function (sender, me) {
            this.startX = me.getGraphX();
            this.startY = me.getGraphY();
            this.scrollLeft = graph.container.scrollLeft;
            this.scrollTop = graph.container.scrollTop;
          }, mouseMove: function (sender, me) {
          }, mouseUp: function (sender, me) {
            if (mxEvent.isTouchEvent(me.getEvent())) {
              if ((Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol && Math.abs(this.scrollTop - graph.container.scrollTop) < tol) && (Math.abs(this.startX - me.getGraphX()) < tol && Math.abs(this.startY - me.getGraphY()) < tol)) {
                if (parseFloat(ui.chromelessToolbar.style.opacity ||) >) {
                  fadeOut();
                } else {
                  fadeIn();
                }
              }
            }
          },
        });
      }
      if (!this.editor.editable) {
        this.addChromelessClickHandler();
      }
    } else if (this.editor.extendCanvas) {
      var graphViewValidate = graph.view.validate;
      graph.view.validate = function () {
        if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container)) {
          var pad = this.graph.getPagePadding();
          var size = this.graph.getPageSize();
          var tx = this.translate.x;
          var ty = this.translate.y;
          this.translate.x = pad.x - (this.x0 ||) * size.width;
          this.translate.y = pad.y - (this.y0 ||) * size.height;
        }
        graphViewValidate.apply(this, arguments);
      };
      if (!graph.isViewer()) {
        var graphSizeDidChange = graph.sizeDidChange;
        graph.sizeDidChange = function () {
          if (this.container != null && mxUtils.hasScrollbars(this.container)) {
            var pages = this.getPageLayout();
            var pad = this.getPagePadding();
            var size = this.getPageSize();
            var minw = Math.ceil( * pad.x + pages.width * size.width;
          )
            ;
            var minh = Math.ceil( * pad.y + pages.height * size.height;
          )
            ;
            var min = graph.minimumGraphSize;
            if (min == null || min.width != minw || min.height != minh) {
              graph.minimumGraphSize = new mxRectangle(, , minw, minh);
            }
            var dx = pad.x - pages.x * size.width;
            var dy = pad.y - pages.y * size.height;
            if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
              this.autoTranslate = true;
              this.view.x0 = pages.x;
              this.view.y0 = pages.y;
              var tx = graph.view.translate.x;
              var ty = graph.view.translate.y;
              graph.view.setTranslate(dx, dy);
              graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
              graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);
              this.autoTranslate = false;
              return;
            }
            graphSizeDidChange.apply(this, arguments);
          } else {
            this.fireEvent(new mxEventObject(mxEvent.SIZE, , this.getGraphBounds()));
          }
        };
      }
    }
    graph.updateZoomTimeout = null;
    graph.cumulativeZoomFactor =;
    var cursorPosition = null;
    graph.lazyZoom = function (zoomIn) {
      if (this.updateZoomTimeout != null) {
        window.clearTimeout(this.updateZoomTimeout);
      }
      if (zoomIn) {
        if (this.view.scale * this.cumulativeZoomFactor <) {
          this.cumulativeZoomFactor = (this.view.scale +) / this.view.scale;
        } else {
          this.cumulativeZoomFactor *= this.zoomFactor;
          this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor *) / / this.view.scale;;
        }
      } else {
        if (this.view.scale * this.cumulativeZoomFactor <=) {
          this.cumulativeZoomFactor = (this.view.scale -) / this.view.scale;
        } else {
          this.cumulativeZoomFactor /= this.zoomFactor;
          this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor *) / / this.view.scale;;
        }
      }
      this.cumulativeZoomFactor = Math.max(, Math.min(this.view.scale * this.cumulativeZoomFactor) / this.view.scale);
      this.updateZoomTimeout = window.setTimeout(mxUtils.bind(this, function () {
        var offset = mxUtils.getOffset(graph.container);
        var dx =;
        var dy =;
        if (cursorPosition != null) {
          dx = graph.container.offsetWidth / -cursorPosition.x + offset.x;
          dy = graph.container.offsetHeight / -cursorPosition.y + offset.y;
        }
        var prev = this.view.scale;
        this.zoom(this.cumulativeZoomFactor);
        var s = this.view.scale;
        if (s != prev) {
          if (resize != null) {
            ui.chromelessResize(false, null, dx * (this.cumulativeZoomFactor -), dy * (this.cumulativeZoomFactor -));
          }
          if (mxUtils.hasScrollbars(graph.container) && (dx != || dy !=)) {
            graph.container.scrollLeft -= dx * (this.cumulativeZoomFactor -);
            graph.container.scrollTop -= dy * (this.cumulativeZoomFactor -);
          }
        }
        this.cumulativeZoomFactor =;
        this.updateZoomTimeout = null;
      }), this.lazyZoomDelay);
    };
    mxEvent.addMouseWheelListener(mxUtils.bind(this, function (evt, up) {
      if ((this.dialogs == null || this.dialogs.length ==) && graph.isZoomWheelEvent(evt)) {
        var source = mxEvent.getSource(evt);
        while (source != null) {
          if (source == graph.container) {
            cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
            graph.lazyZoom(up);
            mxEvent.consume(evt);
            return false;
          }
          source = source.parentNode;
        }
      }
    }), graph.container);
  }

  /**
   Creates a temporary graph instance for rendering off-screen content.
   */
  addChromelessToolbarItems(addButton) {
    addButton(mxUtils.bind(this, function (evt) {
      this.actions.get().funct();
      mxEvent.consume(evt);
    }), Editor.printLargeImage, mxResources.get());
  }

  /**
   Creates a temporary graph instance for rendering off-screen content.
   */
  createTemporaryGraph(stylesheet) {
    var graph = new Graph(document.createElement(), null, null, stylesheet);
    graph.resetViewOnRootChange = false;
    graph.setConnectable(false);
    graph.gridEnabled = false;
    graph.autoScroll = false;
    graph.setTooltips(false);
    graph.setEnabled(false);
    graph.container.style.visibility =;
    graph.container.style.position =;
    graph.container.style.overflow =;
    graph.container.style.height =;
    graph.container.style.width =;
    return graph;
  }

  /**
   undefined
   */
  addChromelessClickHandler() {
    var hl = urlParams[];
    if (hl != null && hl.length >) {
      hl = +hl;
    }
    this.editor.graph.addClickHandler(hl);
  }

  /**
   undefined
   */
  toggleFormatPanel(forceHide) {
    if (this.format != null) {
      this.formatWidth = (forceHide || this.formatWidth >) ? :;
      this.formatContainer.style.display = (forceHide || this.formatWidth >) ? :;
      this.refresh();
      this.format.refresh();
      this.fireEvent(new mxEventObject());
    }
  }

  /**
   Adds support for placeholders in labels.
   */
  lightboxFit(maxHeight) {
    if (this.isDiagramEmpty()) {
      this.editor.graph.view.setScale();
    } else {
      var p = urlParams[];
      var border =;
      if (p != null) {
        border = parseInt(p);
      }
      this.editor.graph.maxFitScale = this.lightboxMaxFitScale;
      this.editor.graph.fit(border, null, null, null, null, null, maxHeight);
      this.editor.graph.maxFitScale = null;
    }
  }

  /**
   Translates this point by the given vector.
   */
  isDiagramEmpty() {
    var model = this.editor.graph.getModel();
    return model.getChildCount(model.root) == && model.getChildCount(model.getChildAt(model.root)) ==;
  }

  /**
   Hook for allowing selection and context menu for certain events.
   */
  isSelectionAllowed(evt) {
    return mxEvent.getSource(evt).nodeName == || (mxEvent.getSource(evt).nodeName == && mxUtils.isAncestorNode(this.formatContainer, mxEvent.getSource(evt)));
  }

  /**
   Installs dialog if browser window is closed without saving
   This must be disabled during save and image export.
   */
  addBeforeUnloadListener() {
    window.onbeforeunload = mxUtils.bind(this, function () {
      if (!this.editor.isChromelessView()) {
        return this.onBeforeUnload();
      }
    });
  }

  /**
   Sets the onbeforeunload for the application
   */
  onBeforeUnload() {
    if (this.editor.modified) {
      return mxResources.get();
    }
  }

  /**
   Opens the current diagram via the window.opener if one exists.
   */
  open() {
    try {
      if (window.opener != null && window.opener.openFile != null) {
        window.opener.openFile.setConsumer(mxUtils.bind(this, function (xml, filename) {
          try {
            var doc = mxUtils.parseXml(xml);
            this.editor.setGraphXml(doc.documentElement);
            this.editor.setModified(false);
            this.editor.undoManager.clear();
            if (filename != null) {
              this.editor.setFilename(filename);
              this.updateDocumentTitle();
            }
            return;
          } catch (e) {
            mxUtils.alert(mxResources.get() + +e.message);
          }
        }));
      }
    } catch (e) {
    }
    this.editor.graph.view.validate();
    this.editor.graph.sizeDidChange();
    this.editor.fireEvent(new mxEventObject());
  }

  /**
   Sets the current menu and element.
   */
  setCurrentMenu(menu, elt) {
    this.currentMenuElt = elt;
    this.currentMenu = menu;
  }

  /**
   Resets the current menu and element.
   */
  resetCurrentMenu() {
    this.currentMenuElt = null;
    this.currentMenu = null;
  }

  /**
   Hides and destroys the current menu.
   */
  hideCurrentMenu() {
    if (this.currentMenu != null) {
      this.currentMenu.hideMenu();
      this.resetCurrentMenu();
    }
  }

  /**
   Updates the document title.
   */
  updateDocumentTitle() {
    var title = this.editor.getOrCreateFilename();
    if (this.editor.appName != null) {
      title += +this.editor.appName;
    }
    document.title = title;
  }

  /**
   Updates the document title.
   */
  createHoverIcons() {
    return new HoverIcons(this.editor.graph);
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  redo() {
    try {
      var graph = this.editor.graph;
      if (graph.isEditing()) {
        document.execCommand(, false, null);
      } else {
        this.editor.undoManager.redo();
      }
    } catch (e) {
    }
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  undo() {
    try {
      var graph = this.editor.graph;
      if (graph.isEditing()) {
        var value = graph.cellEditor.textarea.innerHTML;
        document.execCommand(, false, null);
        if (value == graph.cellEditor.textarea.innerHTML) {
          graph.stopEditing(true);
          this.editor.undoManager.undo();
        }
      } else {
        this.editor.undoManager.undo();
      }
    } catch (e) {
    }
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  canRedo() {
    return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  canUndo() {
    return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
  }

  /**
   undefined
   */
  getEditBlankXml() {
    return mxUtils.getXml(this.editor.getGraphXml());
  }

  /**
   Returns the URL for a copy of this editor with no state.
   */
  getUrl(pathname) {
    var href = (pathname != null) ? pathname : window.location.pathname;
    var parms = (href.indexOf() >) ? :;
    for (var key in urlParams) {
      if (parms ==) {
        href +=;
      } else {
        href +=;
      }
      href += key + +urlParams[key];
      parms++;
    }
    return href;
  }

  /**
   Specifies if the graph has scrollbars.
   */
  setScrollbars(value) {
    var graph = this.editor.graph;
    var prev = graph.container.style.overflow;
    graph.scrollbars = value;
    this.editor.updateGraphComponents();
    if (prev != graph.container.style.overflow) {
      if (graph.container.style.overflow ==) {
        var t = graph.view.translate;
        graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
        graph.container.scrollLeft =;
        graph.container.scrollTop =;
        graph.minimumGraphSize = null;
        graph.sizeDidChange();
      } else {
        var dx = graph.view.translate.x;
        var dy = graph.view.translate.y;
        graph.view.translate.x =;
        graph.view.translate.y =;
        graph.sizeDidChange();
        graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
        graph.container.scrollTop -= Math.round(dy * graph.view.scale);
      }
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Returns true if the graph has scrollbars.
   */
  hasScrollbars() {
    return this.editor.graph.scrollbars;
  }

  /**
   Resets the state of the scrollbars.
   */
  resetScrollbars() {
    var graph = this.editor.graph;
    if (!this.editor.extendCanvas) {
      graph.container.scrollTop =;
      graph.container.scrollLeft =;
      if (!mxUtils.hasScrollbars(graph.container)) {
        graph.view.setTranslate(,);
      }
    } else if (!this.editor.isChromelessView()) {
      if (mxUtils.hasScrollbars(graph.container)) {
        if (graph.pageVisible) {
          var pad = graph.getPagePadding();
          graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) -;
          graph.container.scrollLeft = Math.floor(Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) /)) -;
          var bounds = graph.getGraphBounds();
          if (bounds.width > && bounds.height >) {
            if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth *) {
              graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x -);
            }
            if (bounds.y > graph.container.scrollTop + graph.container.clientHeight *) {
              graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y -);
            }
          }
        } else {
          var bounds = graph.getGraphBounds();
          var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
          var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
          graph.container.scrollTop = Math.floor(Math.max(, bounds.y - Math.max(, (graph.container.clientHeight - height) /)));
          graph.container.scrollLeft = Math.floor(Math.max(, bounds.x - Math.max(, (graph.container.clientWidth - width) /)));
        }
      } else {
        if (graph.pageVisible) {
          var b = graph.view.getBackgroundPageBounds();
          graph.view.setTranslate(Math.floor(Math.max(, (graph.container.clientWidth - b.width) /) - b.x), Math.floor(Math.max(, (graph.container.clientHeight - b.height) /) - b.y));
        } else {
          var bounds = graph.getGraphBounds();
          graph.view.setTranslate(Math.floor(Math.max(, Math.max(, (graph.container.clientWidth - bounds.width) /) - bounds.x)), Math.floor(Math.max(, Math.max(, (graph.container.clientHeight - bounds.height) /)) - bounds.y));
        }
      }
    }
  }

  /**
   Loads the stylesheet for this graph.
   */
  setPageVisible(value) {
    var graph = this.editor.graph;
    var hasScrollbars = mxUtils.hasScrollbars(graph.container);
    var tx =;
    var ty =;
    if (hasScrollbars) {
      tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
      ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
    }
    graph.pageVisible = value;
    graph.pageBreaksVisible = value;
    graph.preferPageSize = value;
    graph.view.validateBackground();
    if (hasScrollbars) {
      var cells = graph.getSelectionCells();
      graph.clearSelection();
      graph.setSelectionCells(cells);
    }
    graph.sizeDidChange();
    if (hasScrollbars) {
      graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
      graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Implementation of the undoable page rename.
   */
  execute() {
    var graph = this.ui.editor.graph;
    if (!this.ignoreColor) {
      this.color = this.previousColor;
      var tmp = graph.background;
      this.ui.setBackgroundColor(this.previousColor);
      this.previousColor = tmp;
    }
    if (!this.ignoreImage) {
      this.image = this.previousImage;
      var tmp = graph.backgroundImage;
      this.ui.setBackgroundImage(this.previousImage);
      this.previousImage = tmp;
    }
    if (this.previousFormat != null) {
      this.format = this.previousFormat;
      var tmp = graph.pageFormat;
      if (this.previousFormat.width != tmp.width || this.previousFormat.height != tmp.height) {
        this.ui.setPageFormat(this.previousFormat);
        this.previousFormat = tmp;
      }
    }
    if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled) {
      this.ui.setFoldingEnabled(this.foldingEnabled);
      this.foldingEnabled = !this.foldingEnabled;
    }
  }

  /**
   Loads the stylesheet for this graph.
   */
  setBackgroundColor(value) {
    this.editor.graph.background = value;
    this.editor.graph.view.validateBackground();
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setFoldingEnabled(value) {
    this.editor.graph.foldingEnabled = value;
    this.editor.graph.view.revalidate();
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setPageFormat(value) {
    this.editor.graph.pageFormat = value;
    if (!this.editor.graph.pageVisible) {
      this.actions.get().funct();
    } else {
      this.editor.graph.view.validateBackground();
      this.editor.graph.sizeDidChange();
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setPageScale(value) {
    this.editor.graph.pageScale = value;
    if (!this.editor.graph.pageVisible) {
      this.actions.get().funct();
    } else {
      this.editor.graph.view.validateBackground();
      this.editor.graph.sizeDidChange();
    }
    this.fireEvent(new mxEventObject());
  }

  /**
   Loads the stylesheet for this graph.
   */
  setGridColor(value) {
    this.editor.graph.view.gridColor = value;
    this.editor.graph.view.validateBackground();
    this.fireEvent(new mxEventObject());
  }

  /**
   Updates the states of the given undo/redo items.
   */
  addUndoListener() {
    var undo = this.actions.get();
    var redo = this.actions.get();
    var undoMgr = this.editor.undoManager;
    var undoListener = mxUtils.bind(this, function () {
      undo.setEnabled(this.canUndo());
      redo.setEnabled(this.canRedo());
    });
    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);
    var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
    this.editor.graph.cellEditor.startEditing = function () {
      cellEditorStartEditing.apply(this, arguments);
      undoListener();
    };
    var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
    this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
      cellEditorStopEditing.apply(this, arguments);
      undoListener();
    };
    undoListener();
  }

  /**
   Updates the states of the given toolbar items based on the selection.
   */
  updateActionStates() {
    var graph = this.editor.graph;
    var selected = !graph.isSelectionEmpty();
    var vertexSelected = false;
    var edgeSelected = false;
    var cells = graph.getSelectionCells();
    if (cells != null) {
      for (var i =; i < cells.length; i++) {
        var cell = cells[i];
        if (graph.getModel().isEdge(cell)) {
          edgeSelected = true;
        }
        if (graph.getModel().isVertex(cell)) {
          vertexSelected = true;
        }
        if (edgeSelected && vertexSelected) {
          break;
        }
      }
    }
    var actions = [, , , , , , , , , , , , , , , , , , , , , , , , , , , ];
    for (var i =; i < actions.length; i++) {
      this.actions.get(actions[i]).setEnabled(selected);
    }
    this.actions.get().setEnabled(graph.getSelectionCount() ==);
    this.actions.get().setEnabled(!graph.isSelectionEmpty());
    this.actions.get().setEnabled(graph.getSelectionCount() ==);
    this.actions.get().setEnabled(!graph.isSelectionEmpty());
    this.actions.get().setEnabled(edgeSelected);
    this.actions.get().setEnabled(vertexSelected);
    this.actions.get().setEnabled(vertexSelected);
    this.actions.get().setEnabled(vertexSelected);
    var oneVertexSelected = vertexSelected && graph.getSelectionCount() ==;
    this.actions.get().setEnabled(graph.getSelectionCount() > || (oneVertexSelected && !graph.isContainer(graph.getSelectionCell())));
    this.actions.get().setEnabled(graph.getSelectionCount() == && (graph.getModel().getChildCount(graph.getSelectionCell()) > || (oneVertexSelected && graph.isContainer(graph.getSelectionCell()))));
    this.actions.get().setEnabled(oneVertexSelected && graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));
    var state = graph.view.getState(graph.getSelectionCell());
    this.menus.get().setEnabled(selected || graph.view.currentRoot != null);
    this.actions.get().setEnabled(vertexSelected && (graph.isContainer(graph.getSelectionCell()) || graph.model.getChildCount(graph.getSelectionCell()) >));
    this.actions.get().setEnabled(graph.view.currentRoot != null);
    this.actions.get().setEnabled(graph.view.currentRoot != null);
    this.actions.get().setEnabled(graph.getSelectionCount() == && graph.isValidRoot(graph.getSelectionCell()));
    var foldable = graph.getSelectionCount() == && graph.isCellFoldable(graph.getSelectionCell());
    this.actions.get().setEnabled(foldable);
    this.actions.get().setEnabled(foldable);
    this.actions.get().setEnabled(graph.getSelectionCount() ==);
    this.actions.get().setEnabled(graph.getSelectionCount() == && graph.getLinkForCell(graph.getSelectionCell()) != null);
    this.actions.get().setEnabled(graph.isEnabled());
    this.actions.get().setEnabled(!this.editor.chromeless || this.editor.editable);
    var unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
    this.menus.get().setEnabled(unlocked);
    this.menus.get().setEnabled(unlocked);
    this.menus.get().setEnabled(unlocked && vertexSelected);
    this.menus.get().setEnabled(unlocked && vertexSelected && graph.getSelectionCount() >);
    this.menus.get().setEnabled(unlocked && vertexSelected && graph.getSelectionCount() >);
    this.actions.get().setEnabled(unlocked);
    this.actions.get().setEnabled(unlocked);
    this.actions.get().setEnabled(unlocked);
    this.actions.get().setEnabled(unlocked);
    this.updatePasteActionStates();
  }

  /**
   Refreshes the viewport.
   */
  refresh(sizeDidChange) {
    sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;
    var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode ==);
    var w = this.container.clientWidth;
    var h = this.container.clientHeight;
    if (this.container == document.body) {
      w = document.body.clientWidth || document.documentElement.clientWidth;
      h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
    }
    var off =;
    if (mxClient.IS_IOS && !window.navigator.standalone) {
      if (window.innerHeight != document.documentElement.clientHeight) {
        off = document.documentElement.clientHeight - window.innerHeight;
        window.scrollTo(,);
      }
    }
    var effHsplitPosition = Math.max(, Math.min(this.hsplitPosition, w - this.splitSize -));
    var tmp =;
    if (this.menubar != null) {
      this.menubarContainer.style.height = this.menubarHeight +;
      tmp += this.menubarHeight;
    }
    if (this.toolbar != null) {
      this.toolbarContainer.style.top = this.menubarHeight +;
      this.toolbarContainer.style.height = this.toolbarHeight +;
      tmp += this.toolbarHeight;
    }
    if (tmp > && !mxClient.IS_QUIRKS) {
      tmp +=;
    }
    var sidebarFooterHeight =;
    if (this.sidebarFooterContainer != null) {
      var bottom = this.footerHeight + off;
      sidebarFooterHeight = Math.max(, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
      this.sidebarFooterContainer.style.width = effHsplitPosition +;
      this.sidebarFooterContainer.style.height = sidebarFooterHeight +;
      this.sidebarFooterContainer.style.bottom = bottom +;
    }
    var fw = (this.format != null) ? this.formatWidth :;
    this.sidebarContainer.style.top = tmp +;
    this.sidebarContainer.style.width = effHsplitPosition +;
    this.formatContainer.style.top = tmp +;
    this.formatContainer.style.width = fw +;
    this.formatContainer.style.display = (this.format != null) ? :;
    this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + :;
    this.diagramContainer.style.top = this.sidebarContainer.style.top;
    this.footerContainer.style.height = this.footerHeight +;
    this.hsplit.style.top = this.sidebarContainer.style.top;
    this.hsplit.style.bottom = (this.footerHeight + off) +;
    this.hsplit.style.left = effHsplitPosition +;
    this.footerContainer.style.display = (this.footerHeight ==) ? :;
    if (this.tabContainer != null) {
      this.tabContainer.style.left = this.diagramContainer.style.left;
    }
    if (quirks) {
      this.menubarContainer.style.width = w +;
      this.toolbarContainer.style.width = this.menubarContainer.style.width;
      var sidebarHeight = Math.max(, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
      this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) +;
      this.formatContainer.style.height = sidebarHeight +;
      this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(, w - effHsplitPosition - this.splitSize - fw) + : w +;
      this.footerContainer.style.width = this.menubarContainer.style.width;
      var diagramHeight = Math.max(, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
      if (this.tabContainer != null) {
        this.tabContainer.style.width = this.diagramContainer.style.width;
        this.tabContainer.style.bottom = (this.footerHeight + off) +;
        diagramHeight -= this.tabContainer.clientHeight;
      }
      this.diagramContainer.style.height = diagramHeight +;
      this.hsplit.style.height = diagramHeight +;
    } else {
      if (this.footerHeight >) {
        this.footerContainer.style.bottom = off +;
      }
      this.diagramContainer.style.right = fw +;
      var th =;
      if (this.tabContainer != null) {
        this.tabContainer.style.bottom = (this.footerHeight + off) +;
        this.tabContainer.style.right = this.diagramContainer.style.right;
        th = this.tabContainer.clientHeight;
      }
      this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) +;
      this.formatContainer.style.bottom = (this.footerHeight + off) +;
      this.diagramContainer.style.bottom = (this.footerHeight + off + th) +;
    }
    if (sizeDidChange) {
      this.editor.graph.sizeDidChange();
    }
  }

  /**
   Creates the required containers.
   */
  createTabContainer() {
    return null;
  }

  /**
   Creates the required containers.
   */
  createDivs() {
    this.menubarContainer = this.createDiv();
    this.toolbarContainer = this.createDiv();
    this.sidebarContainer = this.createDiv();
    this.formatContainer = this.createDiv();
    this.diagramContainer = this.createDiv();
    this.footerContainer = this.createDiv();
    this.hsplit = this.createDiv();
    this.hsplit.setAttribute(, mxResources.get());
    this.menubarContainer.style.top =;
    this.menubarContainer.style.left =;
    this.menubarContainer.style.right =;
    this.toolbarContainer.style.left =;
    this.toolbarContainer.style.right =;
    this.sidebarContainer.style.left =;
    this.formatContainer.style.right =;
    this.formatContainer.style.zIndex =;
    this.diagramContainer.style.right = ((this.format != null) ? this.formatWidth :) +;
    this.footerContainer.style.left =;
    this.footerContainer.style.right =;
    this.footerContainer.style.bottom =;
    this.footerContainer.style.zIndex = mxPopupMenu.prototype.zIndex -;
    this.hsplit.style.width = this.splitSize +;
    this.sidebarFooterContainer = this.createSidebarFooterContainer();
    if (this.sidebarFooterContainer) {
      this.sidebarFooterContainer.style.left =;
    }
    if (!this.editor.chromeless) {
      this.tabContainer = this.createTabContainer();
    } else {
      this.diagramContainer.style.border =;
    }
  }

  /**
   Hook for sidebar footer container. This implementation returns null.
   */
  createSidebarFooterContainer() {
    return null;
  }

  /**
   Creates the required containers.
   */
  createUi() {
    if (this.menubar != null) {
      this.menubarContainer.appendChild(this.menubar.container);
    }
    if (this.menubar != null) {
      this.statusContainer = this.createStatusContainer();
      this.editor.addListener(, mxUtils.bind(this, function () {
        this.setStatusText(this.editor.getStatus());
      }));
      this.setStatusText(this.editor.getStatus());
      this.menubar.container.appendChild(this.statusContainer);
      this.container.appendChild(this.menubarContainer);
    }
    this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);
    if (this.sidebar != null) {
      this.container.appendChild(this.sidebarContainer);
    }
    this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createFormat(this.formatContainer);
    if (this.format != null) {
      this.container.appendChild(this.formatContainer);
    }
    var footer = (this.editor.chromeless) ? null : this.createFooter();
    if (footer != null) {
      this.footerContainer.appendChild(footer);
      this.container.appendChild(this.footerContainer);
    }
    if (this.sidebar != null && this.sidebarFooterContainer) {
      this.container.appendChild(this.sidebarFooterContainer);
    }
    this.container.appendChild(this.diagramContainer);
    if (this.container != null && this.tabContainer != null) {
      this.container.appendChild(this.tabContainer);
    }
    this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv());
    if (this.toolbar != null) {
      this.toolbarContainer.appendChild(this.toolbar.container);
      this.container.appendChild(this.toolbarContainer);
    }
    if (this.sidebar != null) {
      this.container.appendChild(this.hsplit);
      this.addSplitHandler(this.hsplit, true, , mxUtils.bind(this, function (value) {
        this.hsplitPosition = value;
        this.refresh();
      }));
    }
  }

  /**
   Creates a new toolbar for the given container.
   */
  createStatusContainer() {
    var container = document.createElement();
    container.className =;
    if (screen.width <) {
      container.style.maxWidth = Math.max(, screen.width -) +;
      container.style.overflow =;
    }
    return container;
  }

  /**
   Creates a new toolbar for the given container.
   */
  setStatusText(value) {
    this.statusContainer.innerHTML = value;
  }

  /**
   Creates a new toolbar for the given container.
   */
  createToolbar(container) {
    return new Toolbar(this, container);
  }

  /**
   Creates a new sidebar for the given container.
   */
  createSidebar(container) {
    return new Sidebar(this, container);
  }

  /**
   Creates a new sidebar for the given container.
   */
  createFormat(container) {
    return new Format(this, container);
  }

  /**
   Creates and returns a new footer.
   */
  createFooter() {
    return this.createDiv();
  }

  /**
   Creates the actual toolbar for the toolbar container.
   */
  createDiv(classname) {
    var elt = document.createElement();
    elt.className = classname;
    return elt;
  }

  /**
   Updates the states of the given undo/redo items.
   */
  addSplitHandler(elt, horizontal, dx, onChange) {
    var start = null;
    var initial = null;
    var ignoreClick = true;
    var last = null;
    if (mxClient.IS_POINTER) {
      elt.style.touchAction =;
    }
    var getValue = mxUtils.bind(this, function () {
      var result = parseInt(((horizontal) ? elt.style.left : elt.style.bottom));
      if (!horizontal) {
        result = result + dx - this.footerHeight;
      }
      return result;
    });

    function moveHandler(evt) {
      if (start != null) {
        var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
        onChange(Math.max(, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
        mxEvent.consume(evt);
        if (initial != getValue()) {
          ignoreClick = true;
          last = null;
        }
      }
    }
    ;

    function dropHandler(evt) {
      moveHandler(evt);
      initial = null;
      start = null;
    }
    ;
    mxEvent.addGestureListeners(elt, function (evt) {
      start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      initial = getValue();
      ignoreClick = false;
      mxEvent.consume(evt);
    });
    mxEvent.addListener(elt, , mxUtils.bind(this, function (evt) {
      if (!ignoreClick && this.hsplitClickEnabled) {
        var next = (last != null) ? last - dx :;
        last = getValue();
        onChange(next);
        mxEvent.consume(evt);
      }
    }));
    mxEvent.addGestureListeners(document, null, moveHandler, dropHandler);
    this.destroyFunctions.push(function () {
      mxEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
    });
  }

  /**
   Translates this point by the given vector.
   */
  handleError(resp, title, fn, invokeFnOnClose, notFoundMessage) {
    var e = (resp != null && resp.error != null) ? resp.error : resp;
    if (e != null || title != null) {
      var msg = mxUtils.htmlEntities(mxResources.get());
      var btn = mxResources.get();
      title = (title != null) ? title : mxResources.get();
      if (e != null && e.message != null) {
        msg = mxUtils.htmlEntities(e.message);
      }
      this.showError(title, msg, btn, fn, null, null, null, null, null, null, null, null, (invokeFnOnClose) ? fn : null);
    } else if (fn != null) {
      fn();
    }
  }

  /**
   Translates this point by the given vector.
   */
  showError(title, msg, btn, fn, retry, btn2, fn2, btn3, fn3, w, h, hide, onClose) {
    var dlg = new ErrorDialog(this, title, msg, btn || mxResources.get(), fn, retry, btn2, fn2, hide, btn3, fn3);
    var lines = Math.ceil((msg != null) ? msg.length / :);
    this.showDialog(dlg.container, w ||, h || (+lines *), true, false, onClose);
    dlg.init();
  }

  /**
   Displays a print dialog.
   */
  showDialog(elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick) {
    this.editor.graph.tooltipHandler.hideTooltip();
    if (this.dialogs == null) {
      this.dialogs = [];
    }
    this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick);
    this.dialogs.push(this.dialog);
  }

  /**
   Displays a print dialog.
   */
  hideDialog(cancel, isEsc) {
    if (this.dialogs != null && this.dialogs.length >) {
      var dlg = this.dialogs.pop();
      if (dlg.close(cancel, isEsc) == false) {
        this.dialogs.push(dlg);
        return;
      }
      this.dialog = (this.dialogs.length >) ? this.dialogs[this.dialogs.length -] : null;
      this.editor.fireEvent(new mxEventObject());
      if (this.dialog == null && this.editor.graph.container.style.visibility !=) {
        window.setTimeout(mxUtils.bind(this, function () {
          if (this.editor.graph.isEditing() && this.editor.graph.cellEditor.textarea != null) {
            this.editor.graph.cellEditor.textarea.focus();
          } else {
            mxUtils.clearSelection();
            this.editor.graph.container.focus();
          }
        }));
      }
    }
  }

  /**
   Display a color dialog.
   */
  pickColor(color, apply) {
    var graph = this.editor.graph;
    var selState = graph.cellEditor.saveSelection();
    var h = +((Math.ceil(ColorDialog.prototype.presetColors.length /) + Math.ceil(ColorDialog.prototype.defaultColors.length /)) *);
    var dlg = new ColorDialog(this, color ||, function (color) {
      graph.cellEditor.restoreSelection(selState);
      apply(color);
    }, function () {
      graph.cellEditor.restoreSelection(selState);
    });
    this.showDialog(dlg.container, , h, true, false);
    dlg.init();
  }

  /**
   Adds the label menu items to the given menu and parent.
   */
  openFile() {
    window.openFile = new OpenFile(mxUtils.bind(this, function (cancel) {
      this.hideDialog(cancel);
    }));
    this.showDialog(new OpenDialog(this).container, (Editor.useLocalStorage) ? :, (Editor.useLocalStorage) ? :, true, true, function () {
      window.openFile = null;
    });
  }

  /**
   Extracs the graph model from the given HTML data from a data transfer event.
   */
  extractGraphModelFromHtml(data) {
    var result = null;
    try {
      var idx = data.indexOf();
      if (idx >=) {
        var idx2 = data.lastIndexOf();
        if (idx2 > idx) {
          result = data.substring(idx, idx2 +).replace(,).replace(,).replace(,).replace(,);
        }
      }
    } catch (e) {
    }
    return result;
  }

  /**
   Opens the given files in the editor.
   */
  extractGraphModelFromEvent(evt) {
    var result = null;
    var data = null;
    if (evt != null) {
      var provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData;
      if (provider != null) {
        if (document.documentMode == || document.documentMode ==) {
          data = provider.getData();
        } else {
          data = (mxUtils.indexOf(provider.types) >=) ? provider.getData() : null;
          if (mxUtils.indexOf(provider.types && (data == null || data.length ==)))
          {
            data = provider.getData();
          }
        }
        if (data != null) {
          data = Graph.zapGremlins(mxUtils.trim(data));
          var xml = this.extractGraphModelFromHtml(data);
          if (xml != null) {
            data = xml;
          }
        }
      }
    }
    if (data != null && this.isCompatibleString(data)) {
      result = data;
    }
    return result;
  }

  /**
   Hook for subclassers to return true if event data is a supported format.
   This implementation always returns false.
   */
  isCompatibleString(data) {
    return false;
  }

  /**
   Adds the label menu items to the given menu and parent.
   */
  saveFile(forceDialog) {
    if (!forceDialog && this.editor.filename != null) {
      this.save(this.editor.getOrCreateFilename());
    } else {
      var dlg = new FilenameDialog(this, this.editor.getOrCreateFilename(), mxResources.get(), mxUtils.bind(this, function (name) {
        this.save(name);
      }), null, mxUtils.bind(this, function (name) {
        if (name != null && name.length >) {
          return true;
        }
        mxUtils.confirm(mxResources.get());
        return false;
      }));
      this.showDialog(dlg.container, , , true, true);
      dlg.init();
    }
  }

  /**
   Saves the current graph under the given filename.
   */
  save(name) {
    if (name != null) {
      if (this.editor.graph.isEditing()) {
        this.editor.graph.stopEditing();
      }
      var xml = mxUtils.getXml(this.editor.getGraphXml());
      try {
        if (Editor.useLocalStorage) {
          if (localStorage.getItem(name) != null && !mxUtils.confirm(mxResources.get(, [name]))) {
            return;
          }
          localStorage.setItem(name, xml);
          this.editor.setStatus(mxUtils.htmlEntities(mxResources.get()) + +new Date());
        } else {
          if (xml.length < MAX_REQUEST_SIZE) {
            new mxXmlRequest(SAVE_URL, +encodeURIComponent(name) + +encodeURIComponent(xml)).simulate(document);
          } else {
            mxUtils.alert(mxResources.get());
            mxUtils.popup(xml);
            return;
          }
        }
        this.editor.setModified(false);
        this.editor.setFilename(name);
        this.updateDocumentTitle();
      } catch (e) {
        this.editor.setStatus(mxUtils.htmlEntities(mxResources.get()));
      }
    }
  }

  /**
   Executes the given layout.
   */
  executeLayout(exec, animate, post) {
    var graph = this.editor.graph;
    if (graph.isEnabled()) {
      graph.getModel().beginUpdate();
      try {
        exec();
      } catch (e) {
        throw e;
      } finally {
        if (this.allowAnimation && animate && navigator.userAgent.indexOf() <) {
          var morph = new mxMorphing(graph);
          morph.addListener(mxEvent.DONE, mxUtils.bind(this, function () {
            graph.getModel().endUpdate();
            if (post != null) {
              post();
            }
          }));
          morph.startAnimation();
        } else {
          graph.getModel().endUpdate();
          if (post != null) {
            post();
          }
        }
      }
    }
  }

  /**
   Hides the current menu.
   */
  showImageDialog(title, value, fn, ignoreExisting) {
    var cellEditor = this.editor.graph.cellEditor;
    var selState = cellEditor.saveSelection();
    var newValue = mxUtils.prompt(title, value);
    cellEditor.restoreSelection(selState);
    if (newValue != null && newValue.length >) {
      var img = new Image();
      img.onload = function () {
        fn(newValue, img.width, img.height);
      };
      img.onerror = function () {
        fn(null);
        mxUtils.alert(mxResources.get());
      };
      img.src = newValue;
    } else {
      fn(null);
    }
  }

  /**
   Hides the current menu.
   */
  showLinkDialog(value, btnLabel, fn) {
    var dlg = new LinkDialog(this, value, btnLabel, fn);
    this.showDialog(dlg.container, , , true, true);
    dlg.init();
  }

  /**
   Hides the current menu.
   */
  showDataDialog(cell) {
    if (cell != null) {
      var dlg = new EditDataDialog(this, cell);
      this.showDialog(dlg.container, , , true, false, null, false);
      dlg.init();
    }
  }

  /**
   Hides the current menu.
   */
  showBackgroundImageDialog(apply) {
    apply = (apply != null) ? apply : mxUtils.bind(this, function (image) {
      var change = new ChangePageSetup(this, null, image);
      change.ignoreColor = true;
      this.editor.graph.model.execute(change);
    });
    var newValue = mxUtils.prompt(mxResources.get());
    if (newValue != null && newValue.length >) {
      var img = new Image();
      img.onload = function () {
        apply(new mxImage(newValue, img.width, img.height));
      };
      img.onerror = function () {
        apply(null);
        mxUtils.alert(mxResources.get());
      };
      img.src = newValue;
    } else {
      apply(null);
    }
  }

  /**
   Loads the stylesheet for this graph.
   */
  setBackgroundImage(image) {
    this.editor.graph.setBackgroundImage(image);
    this.editor.graph.view.validateBackgroundImage();
    this.fireEvent(new mxEventObject());
  }

  /**
   Creates the keyboard event handler for the current graph and history.
   */
  confirm(msg, okFn, cancelFn) {
    if (mxUtils.confirm(msg)) {
      if (okFn != null) {
        okFn();
      }
    } else if (cancelFn != null) {
      cancelFn();
    }
  }

  /**
   Creates the keyboard event handler for the current graph and history.
   */
  createOutline(wnd) {
    var outline = new mxOutline(this.editor.graph);
    outline.border =;
    mxEvent.addListener(window, , function () {
      outline.update();
    });
    this.addListener(, function () {
      outline.update();
    });
    return outline;
  }

  altShiftActions = {
: , : , : , : , : , : , : ,
};
/**
 Creates the keyboard event handler for the current graph and history.
 */
createKeyHandler(editor);
{
  var editorUi = this;
  var graph = this.editor.graph;
  var keyHandler = new mxKeyHandler(graph);
  var isEventIgnored = keyHandler.isEventIgnored;
  keyHandler.isEventIgnored = function (evt) {
    return (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != && evt.keyCode != && evt.keyCode != && evt.keyCode != && evt.keyCode !=)) && ((evt.keyCode != && evt.keyCode !=) || !this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) && isEventIgnored.apply(this, arguments);
  };
  keyHandler.isEnabledForEvent = function (evt) {
    return (!mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() && (editorUi.dialogs == null || editorUi.dialogs.length ==));
  };
  keyHandler.isControlDown = function (evt) {
    return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
  };
  var queue = [];
  var thread = null;

  function nudge(keyCode, stepSize, resize) {
    queue.push(function () {
      if (!graph.isSelectionEmpty() && graph.isEnabled()) {
        stepSize = (stepSize != null) ? stepSize :;
        if (resize) {
          graph.getModel().beginUpdate();
          try {
            var cells = graph.getSelectionCells();
            for (var i =; i < cells.length; i++) {
              if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i])) {
                var geo = graph.getCellGeometry(cells[i]);
                if (geo != null) {
                  geo = geo.clone();
                  if (keyCode ==) {
                    geo.width = Math.max(, geo.width - stepSize);
                  } else if (keyCode ==) {
                    geo.height = Math.max(, geo.height - stepSize);
                  } else if (keyCode ==) {
                    geo.width += stepSize;
                  } else if (keyCode ==) {
                    geo.height += stepSize;
                  }
                  graph.getModel().setGeometry(cells[i], geo);
                }
              }
            }
          } finally {
            graph.getModel().endUpdate();
          }
        } else {
          var cell = graph.getSelectionCell();
          var parent = graph.model.getParent(cell);
          var layout = null;
          if (graph.getSelectionCount() == && graph.model.isVertex(cell) && graph.layoutManager != null && !graph.isCellLocked(cell)) {
            layout = graph.layoutManager.getLayout(parent);
          }
          if (layout != null && layout.constructor == mxStackLayout) {
            var index = parent.getIndex(cell);
            if (keyCode == || keyCode ==) {
              graph.model.add(parent, cell, Math.max(, index -));
            } else if (keyCode == || keyCode ==) {
              graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index +));
            }
          } else {
            var dx =;
            var dy =;
            if (keyCode ==) {
              dx = -stepSize;
            } else if (keyCode ==) {
              dy = -stepSize;
            } else if (keyCode ==) {
              dx = stepSize;
            } else if (keyCode ==) {
              dy = stepSize;
            }
            graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
          }
        }
      }
    });
    if (thread != null) {
      window.clearTimeout(thread);
    }
    thread = window.setTimeout(function () {
      if (queue.length >) {
        graph.getModel().beginUpdate();
        try {
          for (var i =; i < queue.length; i++) {
            queue[i]();
          }
          queue = [];
        } finally {
          graph.getModel().endUpdate();
        }
        graph.scrollCellToVisible(graph.getSelectionCell());
      }
    });
  }
  ;
  var directions = {
:
  mxConstants.DIRECTION_WEST,
:
  mxConstants.DIRECTION_NORTH,
:
  mxConstants.DIRECTION_EAST,
:
  mxConstants.DIRECTION_SOUTH,
}
  ;
  var keyHandlerGetFunction = keyHandler.getFunction;
  mxKeyHandler.prototype.getFunction = function (evt) {
    if (graph.isEnabled()) {
      if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
        var action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);
        if (action != null) {
          return action.funct;
        }
      }
      if (evt.keyCode == && mxEvent.isAltDown(evt)) {
        if (mxEvent.isShiftDown(evt)) {
          return function () {
            graph.selectParentCell();
          };
        } else {
          return function () {
            graph.selectChildCell();
          };
        }
      } else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty()) {
        if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
          if (graph.model.isVertex(graph.getSelectionCell())) {
            return function () {
              var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode], graph.defaultEdgeLength, evt, true);
              if (cells != null && cells.length >) {
                if (cells.length == && graph.model.isEdge(cells[])) {
                  graph.setSelectionCell(graph.model.getTerminal(cells[], false));
                } else {
                  graph.setSelectionCell(cells[cells.length -]);
                }
                graph.scrollCellToVisible(graph.getSelectionCell());
                if (editorUi.hoverIcons != null) {
                  editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
                }
              }
            };
          }
        } else {
          if (this.isControlDown(evt)) {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
            };
          } else {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null);
            };
          }
        }
      }
    }
    return keyHandlerGetFunction.apply(this, arguments);
  };
  keyHandler.bindAction = mxUtils.bind(this, function (code, control, key, shift) {
    var action = this.actions.get(key);
    if (action != null) {
      var f = function () {
        if (action.isEnabled()) {
          action.funct();
        }
      };
      if (control) {
        if (shift) {
          keyHandler.bindControlShiftKey(code, f);
        } else {
          keyHandler.bindControlKey(code, f);
        }
      } else {
        if (shift) {
          keyHandler.bindShiftKey(code, f);
        } else {
          keyHandler.bindKey(code, f);
        }
      }
    }
  });
  var ui = this;
  var keyHandlerEscape = keyHandler.escape;
  keyHandler.escape = function (evt) {
    keyHandlerEscape.apply(this, arguments);
  };
  keyHandler.enter = function () {
  };
  keyHandler.bindControlShiftKey(, function () {
    graph.exitGroup();
  });
  keyHandler.bindControlShiftKey(, function () {
    graph.enterGroup();
  });
  keyHandler.bindKey(, function () {
    graph.home();
  });
  keyHandler.bindKey(, function () {
    graph.refresh();
  });
  keyHandler.bindAction(, true);
  keyHandler.bindAction(, true);
  keyHandler.bindAction(, true);
  keyHandler.bindAction(, true, , true);
  keyHandler.bindAction(, false);
  if (!this.editor.chromeless || this.editor.editable) {
    keyHandler.bindControlKey(, function () {
      if (graph.isEnabled()) {
        graph.foldCells(true);
      }
    });
    keyHandler.bindControlKey(, function () {
      if (graph.isEnabled()) {
        graph.foldCells(false);
      }
    });
    keyHandler.bindControlKey(, function () {
      if (graph.isEnabled()) {
        graph.setSelectionCells(graph.duplicateCells(graph.getSelectionCells(), false));
      }
    });
    keyHandler.bindAction(, false);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, false);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true, , true);
    keyHandler.bindAction(, true);
    keyHandler.bindAction(, true);
    keyHandler.bindKey(, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    });
    keyHandler.bindKey(, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    });
  }
  if (!mxClient.IS_WIN) {
    keyHandler.bindAction(, true, , true);
  } else {
    keyHandler.bindAction(, true);
  }
  return keyHandler;
}
/**
 Creates the keyboard event handler for the current graph and history.
 */
destroy();
{
  if (this.editor != null) {
    this.editor.destroy();
    this.editor = null;
  }
  if (this.menubar != null) {
    this.menubar.destroy();
    this.menubar = null;
  }
  if (this.toolbar != null) {
    this.toolbar.destroy();
    this.toolbar = null;
  }
  if (this.sidebar != null) {
    this.sidebar.destroy();
    this.sidebar = null;
  }
  if (this.keyHandler != null) {
    this.keyHandler.destroy();
    this.keyHandler = null;
  }
  if (this.keydownHandler != null) {
    mxEvent.removeListener(document, , this.keydownHandler);
    this.keydownHandler = null;
  }
  if (this.keyupHandler != null) {
    mxEvent.removeListener(document, , this.keyupHandler);
    this.keyupHandler = null;
  }
  if (this.resizeHandler != null) {
    mxEvent.removeListener(window, , this.resizeHandler);
    this.resizeHandler = null;
  }
  if (this.gestureHandler != null) {
    mxEvent.removeGestureListeners(document, this.gestureHandler);
    this.gestureHandler = null;
  }
  if (this.orientationChangeHandler != null) {
    mxEvent.removeListener(window, , this.orientationChangeHandler);
    this.orientationChangeHandler = null;
  }
  if (this.scrollHandler != null) {
    mxEvent.removeListener(window, , this.scrollHandler);
    this.scrollHandler = null;
  }
  if (this.destroyFunctions != null) {
    for (var i =; i < this.destroyFunctions.length; i++) {
      this.destroyFunctions[i]();
    }
    this.destroyFunctions = null;
  }
  var c = [this.menubarContainer, this.toolbarContainer, this.sidebarContainer, this.formatContainer, this.diagramContainer, this.footerContainer, this.chromelessToolbar, this.hsplit, this.sidebarFooterContainer, this.layersDialog];
  for (var i =; i < c.length; i++) {
    if (c[i] != null && c[i].parentNode != null) {
      c[i].parentNode.removeChild(c[i]);
    }
  }
}
}

/**
 * Implementation of the undoable page rename.
 */
ChangePageSetup.prototype.execute = function () {
  var graph = this.ui.editor.graph;

  if (!this.ignoreColor) {
    this.color = this.previousColor;
    var tmp = graph.background;
    this.ui.setBackgroundColor(this.previousColor);
    this.previousColor = tmp;
  }

  if (!this.ignoreImage) {
    this.image = this.previousImage;
    var tmp = graph.backgroundImage;
    this.ui.setBackgroundImage(this.previousImage);
    this.previousImage = tmp;
  }

  if (this.previousFormat != null) {
    this.format = this.previousFormat;
    var tmp = graph.pageFormat;

    if (this.previousFormat.width != tmp.width ||
        this.previousFormat.height != tmp.height) {
      this.ui.setPageFormat(this.previousFormat);
      this.previousFormat = tmp;
    }
  }

  if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled) {
    this.ui.setFoldingEnabled(this.foldingEnabled);
    this.foldingEnabled = !this.foldingEnabled;
  }
};

// Registers codec for ChangePageSetup
(function () {
  var codec = new mxObjectCodec(new ChangePageSetup(), ['ui', 'previousColor', 'previousImage', 'previousFormat']);

  codec.afterDecode = function (dec, node, obj) {
    obj.previousColor = obj.color;
    obj.previousImage = obj.image;
    obj.previousFormat = obj.format;

    if (obj.foldingEnabled != null) {
      obj.foldingEnabled = !obj.foldingEnabled;
    }

    return obj;
  };

  mxCodecRegistry.register(codec);
})();

/**
 * Loads the stylesheet for this graph.
 * @param value {string}
 */
EditorUi.prototype.setBackgroundColor = function (value) {
  this.editor.graph.background = value;
  this.editor.graph.view.validateBackground();

  this.fireEvent(new mxEventObject('backgroundColorChanged'));
};

/**
 * Loads the stylesheet for this graph.
 * @param value {boolean}
 */
EditorUi.prototype.setFoldingEnabled = function (value) {
  this.editor.graph.foldingEnabled = value;
  this.editor.graph.view.revalidate();

  this.fireEvent(new mxEventObject('foldingEnabledChanged'));
};

/**
 * Loads the stylesheet for this graph.
 * @param value {mxRectangle}
 */
EditorUi.prototype.setPageFormat = function (value) {
  this.editor.graph.pageFormat = value;

  if (!this.editor.graph.pageVisible) {
    this.actions.get('pageView').funct();
  } else {
    this.editor.graph.view.validateBackground();
    this.editor.graph.sizeDidChange();
  }

  this.fireEvent(new mxEventObject('pageFormatChanged'));
};

/**
 * Loads the stylesheet for this graph.
 * @param value {number}
 */
EditorUi.prototype.setPageScale = function (value) {
  this.editor.graph.pageScale = value;

  if (!this.editor.graph.pageVisible) {
    this.actions.get('pageView').funct();
  } else {
    this.editor.graph.view.validateBackground();
    this.editor.graph.sizeDidChange();
  }

  this.fireEvent(new mxEventObject('pageScaleChanged'));
};

/**
 * Loads the stylesheet for this graph.
 * @param value {string}
 */
EditorUi.prototype.setGridColor = function (value) {
  this.editor.graph.view.gridColor = value;
  this.editor.graph.view.validateBackground();
  this.fireEvent(new mxEventObject('gridColorChanged'));
};

/**
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addUndoListener = function () {
  var undo = this.actions.get('undo');
  var redo = this.actions.get('redo');

  var undoMgr = this.editor.undoManager;

  var undoListener = mxUtils.bind(this, function () {
    undo.setEnabled(this.canUndo());
    redo.setEnabled(this.canRedo());
  });

  undoMgr.addListener(mxEvent.ADD, undoListener);
  undoMgr.addListener(mxEvent.UNDO, undoListener);
  undoMgr.addListener(mxEvent.REDO, undoListener);
  undoMgr.addListener(mxEvent.CLEAR, undoListener);

  // Overrides cell editor to update action states
  var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;

  this.editor.graph.cellEditor.startEditing = function () {
    cellEditorStartEditing.apply(this, arguments);
    undoListener();
  };

  var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;

  this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
    cellEditorStopEditing.apply(this, arguments);
    undoListener();
  };

  // Updates the button states once
  undoListener();
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
EditorUi.prototype.updateActionStates = function () {
  var graph = this.editor.graph;
  var selected = !graph.isSelectionEmpty();
  var vertexSelected = false;
  var edgeSelected = false;

  var cells = graph.getSelectionCells();

  if (cells != null) {
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];

      if (graph.getModel().isEdge(cell)) {
        edgeSelected = true;
      }

      if (graph.getModel().isVertex(cell)) {
        vertexSelected = true;
      }

      if (edgeSelected && vertexSelected) {
        break;
      }
    }
  }

  // Updates action states
  var actions = ['cut', 'copy', 'bold', 'italic', 'underline', 'delete', 'duplicate',
    'editStyle', 'editTooltip', 'editLink', 'backgroundColor', 'borderColor',
    'edit', 'toFront', 'toBack', 'lockUnlock', 'solid', 'dashed', 'pasteSize',
    'dotted', 'fillColor', 'gradientColor', 'shadow', 'fontColor',
    'formattedText', 'rounded', 'toggleRounded', 'sharp', 'strokeColor'];

  for (var i = 0; i < actions.length; i++) {
    this.actions.get(actions[i]).setEnabled(selected);
  }

  this.actions.get('setAsDefaultStyle').setEnabled(graph.getSelectionCount() == 1);
  this.actions.get('clearWaypoints').setEnabled(!graph.isSelectionEmpty());
  this.actions.get('copySize').setEnabled(graph.getSelectionCount() == 1);
  this.actions.get('turn').setEnabled(!graph.isSelectionEmpty());
  this.actions.get('curved').setEnabled(edgeSelected);
  this.actions.get('rotation').setEnabled(vertexSelected);
  this.actions.get('wordWrap').setEnabled(vertexSelected);
  this.actions.get('autosize').setEnabled(vertexSelected);
  var oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
  this.actions.get('group').setEnabled(graph.getSelectionCount() > 1 ||
      (oneVertexSelected && !graph.isContainer(graph.getSelectionCell())));
  this.actions.get('ungroup').setEnabled(graph.getSelectionCount() == 1 &&
      (graph.getModel().getChildCount(graph.getSelectionCell()) > 0 ||
          (oneVertexSelected && graph.isContainer(graph.getSelectionCell()))));
  this.actions.get('removeFromGroup').setEnabled(oneVertexSelected &&
      graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));

  // Updates menu states
  var state = graph.view.getState(graph.getSelectionCell());
  this.menus.get('navigation').setEnabled(selected || graph.view.currentRoot != null);
  this.actions.get('collapsible').setEnabled(vertexSelected &&
      (graph.isContainer(graph.getSelectionCell()) || graph.model.getChildCount(graph.getSelectionCell()) > 0));
  this.actions.get('home').setEnabled(graph.view.currentRoot != null);
  this.actions.get('exitGroup').setEnabled(graph.view.currentRoot != null);
  this.actions.get('enterGroup').setEnabled(graph.getSelectionCount() == 1 && graph.isValidRoot(graph.getSelectionCell()));
  var foldable = graph.getSelectionCount() == 1 && graph.isCellFoldable(graph.getSelectionCell());
  this.actions.get('expand').setEnabled(foldable);
  this.actions.get('collapse').setEnabled(foldable);
  this.actions.get('editLink').setEnabled(graph.getSelectionCount() == 1);
  this.actions.get('openLink').setEnabled(graph.getSelectionCount() == 1 &&
      graph.getLinkForCell(graph.getSelectionCell()) != null);
  this.actions.get('guides').setEnabled(graph.isEnabled());
  this.actions.get('grid').setEnabled(!this.editor.chromeless || this.editor.editable);

  var unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
  this.menus.get('layout').setEnabled(unlocked);
  this.menus.get('insert').setEnabled(unlocked);
  this.menus.get('direction').setEnabled(unlocked && vertexSelected);
  this.menus.get('align').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
  this.menus.get('distribute').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
  this.actions.get('selectVertices').setEnabled(unlocked);
  this.actions.get('selectEdges').setEnabled(unlocked);
  this.actions.get('selectAll').setEnabled(unlocked);
  this.actions.get('selectNone').setEnabled(unlocked);

  this.updatePasteActionStates();
};

/**
 * Refreshes the viewport.
 * @param sizeDidChange {function}
 */
EditorUi.prototype.refresh = function (sizeDidChange) {
  sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;

  var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode == 5);
  var w = this.container.clientWidth;
  var h = this.container.clientHeight;

  if (this.container == document.body) {
    w = document.body.clientWidth || document.documentElement.clientWidth;
    h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
  }

  // Workaround for bug on iOS see
  // http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
  // FIXME: Fix if footer visible
  var off = 0;

  if (mxClient.IS_IOS && !window.navigator.standalone) {
    if (window.innerHeight != document.documentElement.clientHeight) {
      off = document.documentElement.clientHeight - window.innerHeight;
      window.scrollTo(0, 0);
    }
  }

  var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, w - this.splitSize - 20));
  var tmp = 0;

  if (this.menubar != null) {
    this.menubarContainer.style.height = this.menubarHeight + 'px';
    tmp += this.menubarHeight;
  }

  if (this.toolbar != null) {
    this.toolbarContainer.style.top = this.menubarHeight + 'px';
    this.toolbarContainer.style.height = this.toolbarHeight + 'px';
    tmp += this.toolbarHeight;
  }

  if (tmp > 0 && !mxClient.IS_QUIRKS) {
    tmp += 1;
  }

  var sidebarFooterHeight = 0;

  if (this.sidebarFooterContainer != null) {
    var bottom = this.footerHeight + off;
    sidebarFooterHeight = Math.max(0, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
    this.sidebarFooterContainer.style.width = effHsplitPosition + 'px';
    this.sidebarFooterContainer.style.height = sidebarFooterHeight + 'px';
    this.sidebarFooterContainer.style.bottom = bottom + 'px';
  }

  var fw = (this.format != null) ? this.formatWidth : 0;
  this.sidebarContainer.style.top = tmp + 'px';
  this.sidebarContainer.style.width = effHsplitPosition + 'px';
  this.formatContainer.style.top = tmp + 'px';
  this.formatContainer.style.width = fw + 'px';
  this.formatContainer.style.display = (this.format != null) ? '' : 'none';

  this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + 'px' : '0px';
  this.diagramContainer.style.top = this.sidebarContainer.style.top;
  this.footerContainer.style.height = this.footerHeight + 'px';
  this.hsplit.style.top = this.sidebarContainer.style.top;
  this.hsplit.style.bottom = (this.footerHeight + off) + 'px';
  this.hsplit.style.left = effHsplitPosition + 'px';
  this.footerContainer.style.display = (this.footerHeight == 0) ? 'none' : '';

  if (this.tabContainer != null) {
    this.tabContainer.style.left = this.diagramContainer.style.left;
  }

  if (quirks) {
    this.menubarContainer.style.width = w + 'px';
    this.toolbarContainer.style.width = this.menubarContainer.style.width;
    var sidebarHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
    this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) + 'px';
    this.formatContainer.style.height = sidebarHeight + 'px';
    this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(0, w - effHsplitPosition - this.splitSize - fw) + 'px' : w + 'px';
    this.footerContainer.style.width = this.menubarContainer.style.width;
    var diagramHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);

    if (this.tabContainer != null) {
      this.tabContainer.style.width = this.diagramContainer.style.width;
      this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
      diagramHeight -= this.tabContainer.clientHeight;
    }

    this.diagramContainer.style.height = diagramHeight + 'px';
    this.hsplit.style.height = diagramHeight + 'px';
  } else {
    if (this.footerHeight > 0) {
      this.footerContainer.style.bottom = off + 'px';
    }

    this.diagramContainer.style.right = fw + 'px';
    var th = 0;

    if (this.tabContainer != null) {
      this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
      this.tabContainer.style.right = this.diagramContainer.style.right;
      th = this.tabContainer.clientHeight;
    }

    this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) + 'px';
    this.formatContainer.style.bottom = (this.footerHeight + off) + 'px';
    this.diagramContainer.style.bottom = (this.footerHeight + off + th) + 'px';
  }

  if (sizeDidChange) {
    this.editor.graph.sizeDidChange();
  }
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createTabContainer = function () {
  return null;
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createDivs = function () {
  this.menubarContainer = this.createDiv('geMenubarContainer');
  this.toolbarContainer = this.createDiv('geToolbarContainer');
  this.sidebarContainer = this.createDiv('geSidebarContainer');
  this.formatContainer = this.createDiv('geSidebarContainer geFormatContainer');
  this.diagramContainer = this.createDiv('geDiagramContainer');
  this.footerContainer = this.createDiv('geFooterContainer');
  /**
   * @type {HTMLDivElement}
   */
  this.hsplit = this.createDiv('geHsplit');
  this.hsplit.setAttribute('title', mxResources.get('collapseExpand'));

  // Sets static style for containers
  this.menubarContainer.style.top = '0px';
  this.menubarContainer.style.left = '0px';
  this.menubarContainer.style.right = '0px';
  this.toolbarContainer.style.left = '0px';
  this.toolbarContainer.style.right = '0px';
  this.sidebarContainer.style.left = '0px';
  this.formatContainer.style.right = '0px';
  this.formatContainer.style.zIndex = '1';
  this.diagramContainer.style.right = ((this.format != null) ? this.formatWidth : 0) + 'px';
  this.footerContainer.style.left = '0px';
  this.footerContainer.style.right = '0px';
  this.footerContainer.style.bottom = '0px';
  this.footerContainer.style.zIndex = mxPopupMenu.prototype.zIndex - 2;
  this.hsplit.style.width = this.splitSize + 'px';
  this.sidebarFooterContainer = this.createSidebarFooterContainer();

  if (this.sidebarFooterContainer) {
    this.sidebarFooterContainer.style.left = '0px';
  }

  if (!this.editor.chromeless) {
    this.tabContainer = this.createTabContainer();
  } else {
    this.diagramContainer.style.border = 'none';
  }
};

/**
 * Hook for sidebar footer container. This implementation returns null.
 */
EditorUi.prototype.createSidebarFooterContainer = function () {
  return null;
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createUi = function () {
  // Creates menubar

  if (this.menubar != null) {
    this.menubarContainer.appendChild(this.menubar.container);
  }

  // Adds status bar in menubar
  if (this.menubar != null) {
    this.statusContainer = this.createStatusContainer();

    // Connects the status bar to the editor status
    this.editor.addListener('statusChanged', mxUtils.bind(this, function () {
      this.setStatusText(this.editor.getStatus());
    }));

    this.setStatusText(this.editor.getStatus());
    this.menubar.container.appendChild(this.statusContainer);

    // Inserts into DOM
    this.container.appendChild(this.menubarContainer);
  }

  // Creates the sidebar
  /**
   * @type {Sidebar}
   */
  this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);

  if (this.sidebar != null) {
    this.container.appendChild(this.sidebarContainer);
  }

  // Creates the format sidebar
  this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createFormat(this.formatContainer);

  if (this.format != null) {
    this.container.appendChild(this.formatContainer);
  }

  // Creates the footer
  var footer = (this.editor.chromeless) ? null : this.createFooter();

  if (footer != null) {
    this.footerContainer.appendChild(footer);
    this.container.appendChild(this.footerContainer);
  }

  if (this.sidebar != null && this.sidebarFooterContainer) {
    this.container.appendChild(this.sidebarFooterContainer);
  }

  this.container.appendChild(this.diagramContainer);

  if (this.container != null && this.tabContainer != null) {
    this.container.appendChild(this.tabContainer);
  }

  // Creates toolbar
  /**
   * @type {Toolbar}
   */
  this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv('geToolbar'));

  if (this.toolbar != null) {
    this.toolbarContainer.appendChild(this.toolbar.container);
    this.container.appendChild(this.toolbarContainer);
  }

  // HSplit
  if (this.sidebar != null) {
    this.container.appendChild(this.hsplit);

    this.addSplitHandler(this.hsplit, true, 0, mxUtils.bind(this, function (value) {
      this.hsplitPosition = value;
      this.refresh();
    }));
  }
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.createStatusContainer = function () {
  var container = document.createElement('a');
  container.className = 'geItem geStatus';

  if (screen.width < 420) {
    container.style.maxWidth = Math.max(20, screen.width - 320) + 'px';
    container.style.overflow = 'hidden';
  }

  return container;
};

/**
 * Creates a new toolbar for the given container.
 * @param value {string}
 */
EditorUi.prototype.setStatusText = function (value) {
  this.statusContainer.innerHTML = value;
};

/**
 * Creates a new toolbar for the given container.
 * @returns {Toolbar}
 */
EditorUi.prototype.createToolbar = function (container) {
  return new Toolbar(this, container);
};

/**
 * Creates a new sidebar for the given container.
 * @returns {Sidebar}
 */
EditorUi.prototype.createSidebar = function (container) {
  return new Sidebar(this, container);
};

/**
 * Creates a new sidebar for the given container.
 * @returns {Format}
 */
EditorUi.prototype.createFormat = function (container) {
  return new Format(this, container);
};

/**
 * Creates and returns a new footer.
 * @returns {HTMLElement}
 */
EditorUi.prototype.createFooter = function () {
  return this.createDiv('geFooter');
};

/**
 * Creates the actual toolbar for the toolbar container.
 * @returns {HTMLElement}
 */
EditorUi.prototype.createDiv = function (classname) {
  var elt = document.createElement('div');
  elt.className = classname;

  return elt;
};

/**
 * Updates the states of the given undo/redo items.
 * @param elt {HTMLElement}
 * @param horizontal {boolean}
 * @param dx {number}
 * @param onChange {function}
 */
EditorUi.prototype.addSplitHandler = function (elt, horizontal, dx, onChange) {
  var start = null;
  var initial = null;
  var ignoreClick = true;
  var last = null;

  // Disables built-in pan and zoom in IE10 and later
  if (mxClient.IS_POINTER) {
    elt.style.touchAction = 'none';
  }

  var getValue = mxUtils.bind(this, function () {
    var result = parseInt(((horizontal) ? elt.style.left : elt.style.bottom));

    // Takes into account hidden footer
    if (!horizontal) {
      result = result + dx - this.footerHeight;
    }

    return result;
  });

  function moveHandler(evt) {
    if (start != null) {
      var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      onChange(Math.max(0, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
      mxEvent.consume(evt);

      if (initial != getValue()) {
        ignoreClick = true;
        last = null;
      }
    }
  };

  function dropHandler(evt) {
    moveHandler(evt);
    initial = null;
    start = null;
  };

  mxEvent.addGestureListeners(elt, function (evt) {
    start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
    initial = getValue();
    ignoreClick = false;
    mxEvent.consume(evt);
  });

  mxEvent.addListener(elt, 'click', mxUtils.bind(this, function (evt) {
    if (!ignoreClick && this.hsplitClickEnabled) {
      var next = (last != null) ? last - dx : 0;
      last = getValue();
      onChange(next);
      mxEvent.consume(evt);
    }
  }));

  mxEvent.addGestureListeners(document, null, moveHandler, dropHandler);

  this.destroyFunctions.push(function () {
    mxEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
  });
};

/**
 * Translates this point by the given vector.
 *
 * @param resp {Response}
 * @param title {string}
 * @param fn {function}
 * @param invokeFnOnClose {boolean}
 * @param notFoundMessage {string}
 */
EditorUi.prototype.handleError = function (resp, title, fn, invokeFnOnClose, notFoundMessage) {
  var e = (resp != null && resp.error != null) ? resp.error : resp;

  if (e != null || title != null) {
    var msg = mxUtils.htmlEntities(mxResources.get('unknownError'));
    var btn = mxResources.get('ok');
    title = (title != null) ? title : mxResources.get('error');

    if (e != null && e.message != null) {
      msg = mxUtils.htmlEntities(e.message);
    }

    this.showError(title, msg, btn, fn, null, null, null, null, null,
        null, null, null, (invokeFnOnClose) ? fn : null);
  } else if (fn != null) {
    fn();
  }
};

/**
 * Translates this point by the given vector.
 *
 * @param title {string}
 * @param msg {string}
 * @param btn {string}
 * @param fn {function}
 * @param retry {function}
 * @param btn2 {string}
 * @param fn2 {function}
 * @param btn3 {string}
 * @param fn3 {function}
 * @param w {number}
 * @param h {number}
 * @param hide {boolean}
 * @param onClose {function}
 */
EditorUi.prototype.showError = function (title, msg, btn, fn, retry, btn2, fn2, btn3, fn3, w, h, hide, onClose) {
  var dlg = new ErrorDialog(this, title, msg, btn || mxResources.get('ok'),
      fn, retry, btn2, fn2, hide, btn3, fn3);
  var lines = Math.ceil((msg != null) ? msg.length / 50 : 1);
  this.showDialog(dlg.container, w || 340, h || (100 + lines * 20), true, false, onClose);
  dlg.init();
};

/**
 * Displays a print dialog.
 * @param elt {Element}
 * @param w {number}
 * @param h {number}
 * @param modal {boolean}
 * @param closable {boolean}
 * @param onClose {Function}
 * @param noScroll {boolean}
 * @param transparent {boolean}
 * @param onResize {Function}
 * @param ignoreBgClick {boolean}
 */
EditorUi.prototype.showDialog = function (elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick) {
  this.editor.graph.tooltipHandler.hideTooltip();

  if (this.dialogs == null) {
    /**
     * @type {Dialog[]}
     */
    this.dialogs = [];
  }

  this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick);
  this.dialogs.push(this.dialog);
};

/**
 * Displays a print dialog.
 * @param cancel {boolean}
 * @param isEsc {boolean}
 * @returns {void}
 */
EditorUi.prototype.hideDialog = function (cancel, isEsc) {
  if (this.dialogs != null && this.dialogs.length > 0) {
    var dlg = this.dialogs.pop();

    if (dlg.close(cancel, isEsc) == false) {
      //add the dialog back if dialog closing is cancelled
      this.dialogs.push(dlg);
      return;
    }

    this.dialog = (this.dialogs.length > 0) ? this.dialogs[this.dialogs.length - 1] : null;
    this.editor.fireEvent(new mxEventObject('hideDialog'));

    if (this.dialog == null && this.editor.graph.container.style.visibility != 'hidden') {
      window.setTimeout(mxUtils.bind(this, function () {
        if (this.editor.graph.isEditing() && this.editor.graph.cellEditor.textarea != null) {
          this.editor.graph.cellEditor.textarea.focus();
        } else {
          mxUtils.clearSelection();
          this.editor.graph.container.focus();
        }
      }), 0);
    }
  }
};

/**
 * Display a color dialog.
 * @param color {string}
 * @param apply {function}
 */
EditorUi.prototype.pickColor = function (color, apply) {
  var graph = this.editor.graph;
  var selState = graph.cellEditor.saveSelection();
  var h = 226 + ((Math.ceil(ColorDialog.prototype.presetColors.length / 12) +
      Math.ceil(ColorDialog.prototype.defaultColors.length / 12)) * 17);

  var dlg = new ColorDialog(this, color || 'none', function (color) {
    graph.cellEditor.restoreSelection(selState);
    apply(color);
  }, function () {
    graph.cellEditor.restoreSelection(selState);
  });
  this.showDialog(dlg.container, 230, h, true, false);
  dlg.init();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
EditorUi.prototype.openFile = function () {
  // Closes dialog after open
  window.openFile = new OpenFile(mxUtils.bind(this, function (cancel) {
    this.hideDialog(cancel);
  }));

  // Removes openFile if dialog is closed
  this.showDialog(new OpenDialog(this).container, (Editor.useLocalStorage) ? 640 : 320,
      (Editor.useLocalStorage) ? 480 : 220, true, true, function () {
        window.openFile = null;
      });
};

/**
 * Extracs the graph model from the given HTML data from a data transfer event.
 * @param data {string}
 * @returns {string}
 */
EditorUi.prototype.extractGraphModelFromHtml = function (data) {
  var result = null;

  try {
    var idx = data.indexOf('&lt;mxGraphModel ');

    if (idx >= 0) {
      var idx2 = data.lastIndexOf('&lt;/mxGraphModel&gt;');

      if (idx2 > idx) {
        result = data.substring(idx, idx2 + 21).replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\\&quot;/g, '"').replace(/\n/g, '');
      }
    }
  } catch (e) {
    // ignore
  }

  return result;
};

/**
 * Opens the given files in the editor.
 * @param evt {DragEvent}
 * @returns {string}
 */
EditorUi.prototype.extractGraphModelFromEvent = function (evt) {
  var result = null;
  var data = null;

  if (evt != null) {
    var provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData;

    if (provider != null) {
      if (document.documentMode == 10 || document.documentMode == 11) {
        data = provider.getData('Text');
      } else {
        data = (mxUtils.indexOf(provider.types, 'text/html') >= 0) ? provider.getData('text/html') : null;

        if (mxUtils.indexOf(provider.types, 'text/plain' && (data == null || data.length == 0))) {
          data = provider.getData('text/plain');
        }
      }

      if (data != null) {
        data = Graph.zapGremlins(mxUtils.trim(data));

        // Tries parsing as HTML document with embedded XML
        var xml = this.extractGraphModelFromHtml(data);

        if (xml != null) {
          data = xml;
        }
      }
    }
  }

  if (data != null && this.isCompatibleString(data)) {
    result = data;
  }

  return result;
};

/**
 * Hook for subclassers to return true if event data is a supported format.
 * This implementation always returns false.
 * @param data {string}
 */
EditorUi.prototype.isCompatibleString = function (data) {
  return false;
};

/**
 * Adds the label menu items to the given menu and parent.
 * @param forceDialog {boolean}
 * @returns {void}
 */
EditorUi.prototype.saveFile = function (forceDialog) {
  if (!forceDialog && this.editor.filename != null) {
    this.save(this.editor.getOrCreateFilename());
  } else {
    var dlg = new FilenameDialog(this, this.editor.getOrCreateFilename(), mxResources.get('save'), mxUtils.bind(this, function (name) {
      this.save(name);
    }), null, mxUtils.bind(this, function (name) {
      if (name != null && name.length > 0) {
        return true;
      }

      mxUtils.confirm(mxResources.get('invalidName'));

      return false;
    }));
    this.showDialog(dlg.container, 300, 100, true, true);
    dlg.init();
  }
};

/**
 * Saves the current graph under the given filename.
 * @param name {string}
 */
EditorUi.prototype.save = function (name) {
  if (name != null) {
    if (this.editor.graph.isEditing()) {
      this.editor.graph.stopEditing();
    }

    var xml = mxUtils.getXml(this.editor.getGraphXml());

    try {
      if (Editor.useLocalStorage) {
        if (localStorage.getItem(name) != null &&
            !mxUtils.confirm(mxResources.get('replaceIt', [name]))) {
          return;
        }

        localStorage.setItem(name, xml);
        this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('saved')) + ' ' + new Date());
      } else {
        if (xml.length < MAX_REQUEST_SIZE) {
          new mxXmlRequest(SAVE_URL, 'filename=' + encodeURIComponent(name) +
              '&xml=' + encodeURIComponent(xml)).simulate(document, '_blank');
        } else {
          mxUtils.alert(mxResources.get('drawingTooLarge'));
          mxUtils.popup(xml);

          return;
        }
      }

      this.editor.setModified(false);
      this.editor.setFilename(name);
      this.updateDocumentTitle();
    } catch (e) {
      this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('errorSavingFile')));
    }
  }
};

/**
 * Executes the given layout.
 * @param exec {function}
 * @param animate {boolean}
 * @param post {function}
 */
EditorUi.prototype.executeLayout = function (exec, animate, post) {
  var graph = this.editor.graph;

  if (graph.isEnabled()) {
    graph.getModel().beginUpdate();
    try {
      exec();
    } catch (e) {
      throw e;
    } finally {
      // Animates the changes in the graph model except
      // for Camino, where animation is too slow
      if (this.allowAnimation && animate && navigator.userAgent.indexOf('Camino') < 0) {
        // New API for animating graph layout results asynchronously
        var morph = new mxMorphing(graph);
        morph.addListener(mxEvent.DONE, mxUtils.bind(this, function () {
          graph.getModel().endUpdate();

          if (post != null) {
            post();
          }
        }));

        morph.startAnimation();
      } else {
        graph.getModel().endUpdate();

        if (post != null) {
          post();
        }
      }
    }
  }
};

/**
 * Hides the current menu.
 * @param title {string}
 * @param value {string}
 * @param fn {function}
 * @param ignoreExisting {boolean}
 */
EditorUi.prototype.showImageDialog = function (title, value, fn, ignoreExisting) {
  var cellEditor = this.editor.graph.cellEditor;
  var selState = cellEditor.saveSelection();
  var newValue = mxUtils.prompt(title, value);
  cellEditor.restoreSelection(selState);

  if (newValue != null && newValue.length > 0) {
    var img = new Image();

    img.onload = function () {
      fn(newValue, img.width, img.height);
    };
    img.onerror = function () {
      fn(null);
      mxUtils.alert(mxResources.get('fileNotFound'));
    };

    img.src = newValue;
  } else {
    fn(null);
  }
};

/**
 * Hides the current menu.
 * @param value {string}
 * @param btnLabel {string}
 * @param fn {function}
 */
EditorUi.prototype.showLinkDialog = function (value, btnLabel, fn) {
  var dlg = new LinkDialog(this, value, btnLabel, fn);
  this.showDialog(dlg.container, 420, 90, true, true);
  dlg.init();
};

/**
 * Hides the current menu.
 * @param cell {mxCell}
 */
EditorUi.prototype.showDataDialog = function (cell) {
  if (cell != null) {
    var dlg = new EditDataDialog(this, cell);
    this.showDialog(dlg.container, 480, 420, true, false, null, false);
    dlg.init();
  }
};

/**
 * Hides the current menu.
 * @param apply {function}
 */
EditorUi.prototype.showBackgroundImageDialog = function (apply) {
  apply = (apply != null) ? apply : mxUtils.bind(this, function (image) {
    var change = new ChangePageSetup(this, null, image);
    change.ignoreColor = true;

    this.editor.graph.model.execute(change);
  });

  var newValue = mxUtils.prompt(mxResources.get('backgroundImage'), '');

  if (newValue != null && newValue.length > 0) {
    var img = new Image();

    img.onload = function () {
      apply(new mxImage(newValue, img.width, img.height));
    };
    img.onerror = function () {
      apply(null);
      mxUtils.alert(mxResources.get('fileNotFound'));
    };

    img.src = newValue;
  } else {
    apply(null);
  }
};

/**
 * Loads the stylesheet for this graph.
 * @param image {mxImage}
 */
EditorUi.prototype.setBackgroundImage = function (image) {
  this.editor.graph.setBackgroundImage(image);
  this.editor.graph.view.validateBackgroundImage();

  this.fireEvent(new mxEventObject('backgroundImageChanged'));
};

/**
 * Creates the keyboard event handler for the current graph and history.
 * @param msg {string}
 * @param okFn {function}
 * @param cancelFn {function}
 */
EditorUi.prototype.confirm = function (msg, okFn, cancelFn) {
  if (mxUtils.confirm(msg)) {
    if (okFn != null) {
      okFn();
    }
  } else if (cancelFn != null) {
    cancelFn();
  }
};

/**
 * Creates the keyboard event handler for the current graph and history.
 * @param wnd {unknown}
 * @returns {mxOutline}
 */
EditorUi.prototype.createOutline = function (wnd) {
  var outline = new mxOutline(this.editor.graph);
  outline.border = 20;

  mxEvent.addListener(window, 'resize', function () {
    outline.update();
  });

  this.addListener('pageFormatChanged', function () {
    outline.update();
  });

  return outline;
};

// Alt+Shift+Keycode mapping to action
EditorUi.prototype.altShiftActions = {
  67: 'clearWaypoints', // Alt+Shift+C
  65: 'connectionArrows', // Alt+Shift+A
  76: 'editLink', // Alt+Shift+L
  80: 'connectionPoints', // Alt+Shift+P
  84: 'editTooltip', // Alt+Shift+T
  86: 'pasteSize', // Alt+Shift+V
  88: 'copySize', // Alt+Shift+X
};

/**
 * Creates the keyboard event handler for the current graph and history.
 * @param editor {unknown}
 */
EditorUi.prototype.createKeyHandler = function (editor) {
  var editorUi = this;
  var graph = this.editor.graph;
  var keyHandler = new mxKeyHandler(graph);

  var isEventIgnored = keyHandler.isEventIgnored;
  keyHandler.isEventIgnored = function (evt) {
    // Handles undo/redo/ctrl+./,/u via action and allows ctrl+b/i only if editing value is HTML (except for FF and Safari)
    return (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != 90 && evt.keyCode != 89 &&
        evt.keyCode != 188 && evt.keyCode != 190 && evt.keyCode != 85)) && ((evt.keyCode != 66 && evt.keyCode != 73) ||
        !this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) &&
        isEventIgnored.apply(this, arguments);
  };

  // Ignores graph enabled state but not chromeless state
  keyHandler.isEnabledForEvent = function (evt) {
    return (!mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() &&
        (editorUi.dialogs == null || editorUi.dialogs.length == 0));
  };

  // Routes command-key to control-key on Mac
  keyHandler.isControlDown = function (evt) {
    return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
  };

  var queue = [];
  var thread = null;

  // Helper function to move cells with the cursor keys
  function nudge(keyCode, stepSize, resize) {
    queue.push(function () {
      if (!graph.isSelectionEmpty() && graph.isEnabled()) {
        stepSize = (stepSize != null) ? stepSize : 1;

        if (resize) {
          // Resizes all selected vertices
          graph.getModel().beginUpdate();
          try {
            var cells = graph.getSelectionCells();

            for (var i = 0; i < cells.length; i++) {
              if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i])) {
                var geo = graph.getCellGeometry(cells[i]);

                if (geo != null) {
                  geo = geo.clone();

                  if (keyCode == 37) {
                    geo.width = Math.max(0, geo.width - stepSize);
                  } else if (keyCode == 38) {
                    geo.height = Math.max(0, geo.height - stepSize);
                  } else if (keyCode == 39) {
                    geo.width += stepSize;
                  } else if (keyCode == 40) {
                    geo.height += stepSize;
                  }

                  graph.getModel().setGeometry(cells[i], geo);
                }
              }
            }
          } finally {
            graph.getModel().endUpdate();
          }
        } else {
          // Moves vertices up/down in a stack layout
          var cell = graph.getSelectionCell();
          var parent = graph.model.getParent(cell);
          var layout = null;

          if (graph.getSelectionCount() == 1 && graph.model.isVertex(cell) &&
              graph.layoutManager != null && !graph.isCellLocked(cell)) {
            layout = graph.layoutManager.getLayout(parent);
          }

          if (layout != null && layout.constructor == mxStackLayout) {
            var index = parent.getIndex(cell);

            if (keyCode == 37 || keyCode == 38) {
              graph.model.add(parent, cell, Math.max(0, index - 1));
            } else if (keyCode == 39 || keyCode == 40) {
              graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index + 1));
            }
          } else {
            var dx = 0;
            var dy = 0;

            if (keyCode == 37) {
              dx = -stepSize;
            } else if (keyCode == 38) {
              dy = -stepSize;
            } else if (keyCode == 39) {
              dx = stepSize;
            } else if (keyCode == 40) {
              dy = stepSize;
            }

            graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
          }
        }
      }
    });

    if (thread != null) {
      window.clearTimeout(thread);
    }

    thread = window.setTimeout(function () {
      if (queue.length > 0) {
        graph.getModel().beginUpdate();
        try {
          for (var i = 0; i < queue.length; i++) {
            queue[i]();
          }

          queue = [];
        } finally {
          graph.getModel().endUpdate();
        }
        graph.scrollCellToVisible(graph.getSelectionCell());
      }
    }, 200);
  };

  // Overridden to handle special alt+shift+cursor keyboard shortcuts
  var directions = {
    37: mxConstants.DIRECTION_WEST, 38: mxConstants.DIRECTION_NORTH,
    39: mxConstants.DIRECTION_EAST, 40: mxConstants.DIRECTION_SOUTH,
  };

  var keyHandlerGetFunction = keyHandler.getFunction;

  mxKeyHandler.prototype.getFunction = function (evt) {
    if (graph.isEnabled()) {
      // TODO: Add alt modified state in core API, here are some specific cases
      if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
        var action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);

        if (action != null) {
          return action.funct;
        }
      }

      if (evt.keyCode == 9 && mxEvent.isAltDown(evt)) {
        if (mxEvent.isShiftDown(evt)) {
          // Alt+Shift+Tab
          return function () {
            graph.selectParentCell();
          };
        } else {
          // Alt+Tab
          return function () {
            graph.selectChildCell();
          };
        }
      } else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty()) {
        if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
          if (graph.model.isVertex(graph.getSelectionCell())) {
            return function () {
              var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode],
                  graph.defaultEdgeLength, evt, true);

              if (cells != null && cells.length > 0) {
                if (cells.length == 1 && graph.model.isEdge(cells[0])) {
                  graph.setSelectionCell(graph.model.getTerminal(cells[0], false));
                } else {
                  graph.setSelectionCell(cells[cells.length - 1]);
                }

                graph.scrollCellToVisible(graph.getSelectionCell());

                if (editorUi.hoverIcons != null) {
                  editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
                }
              }
            };
          }
        } else {
          // Avoids consuming event if no vertex is selected by returning null below
          // Cursor keys move and resize (ctrl) cells
          if (this.isControlDown(evt)) {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
            };
          } else {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null);
            };
          }
        }
      }
    }

    return keyHandlerGetFunction.apply(this, arguments);
  };

  // Binds keystrokes to actions
  keyHandler.bindAction = mxUtils.bind(this, function (code, control, key, shift) {
    var action = this.actions.get(key);

    if (action != null) {
      var f = function () {
        if (action.isEnabled()) {
          action.funct();
        }
      };

      if (control) {
        if (shift) {
          keyHandler.bindControlShiftKey(code, f);
        } else {
          keyHandler.bindControlKey(code, f);
        }
      } else {
        if (shift) {
          keyHandler.bindShiftKey(code, f);
        } else {
          keyHandler.bindKey(code, f);
        }
      }
    }
  });

  var ui = this;
  var keyHandlerEscape = keyHandler.escape;
  keyHandler.escape = function (evt) {
    keyHandlerEscape.apply(this, arguments);
  };

  // Ignores enter keystroke. Remove this line if you want the
  // enter keystroke to stop editing. N, W, T are reserved.
  keyHandler.enter = function () {
  };

  keyHandler.bindControlShiftKey(36, function () {
    graph.exitGroup();
  }); // Ctrl+Shift+Home
  keyHandler.bindControlShiftKey(35, function () {
    graph.enterGroup();
  }); // Ctrl+Shift+End
  keyHandler.bindKey(36, function () {
    graph.home();
  }); // Home
  keyHandler.bindKey(35, function () {
    graph.refresh();
  }); // End
  keyHandler.bindAction(107, true, 'zoomIn'); // Ctrl+Plus
  keyHandler.bindAction(109, true, 'zoomOut'); // Ctrl+Minus
  keyHandler.bindAction(80, true, 'print'); // Ctrl+P
  keyHandler.bindAction(79, true, 'outline', true); // Ctrl+Shift+O
  keyHandler.bindAction(112, false, 'about'); // F1

  if (!this.editor.chromeless || this.editor.editable) {
    keyHandler.bindControlKey(36, function () {
      if (graph.isEnabled()) {
        graph.foldCells(true);
      }
    }); // Ctrl+Home
    keyHandler.bindControlKey(35, function () {
      if (graph.isEnabled()) {
        graph.foldCells(false);
      }
    }); // Ctrl+End
    keyHandler.bindControlKey(13, function () {
      if (graph.isEnabled()) {
        graph.setSelectionCells(graph.duplicateCells(graph.getSelectionCells(), false));
      }
    }); // Ctrl+Enter
    keyHandler.bindAction(8, false, 'delete'); // Backspace
    keyHandler.bindAction(8, true, 'deleteAll'); // Backspace
    keyHandler.bindAction(46, false, 'delete'); // Delete
    keyHandler.bindAction(46, true, 'deleteAll'); // Ctrl+Delete
    keyHandler.bindAction(72, true, 'resetView'); // Ctrl+H
    keyHandler.bindAction(72, true, 'fitWindow', true); // Ctrl+Shift+H
    keyHandler.bindAction(74, true, 'fitPage'); // Ctrl+J
    keyHandler.bindAction(74, true, 'fitTwoPages', true); // Ctrl+Shift+J
    keyHandler.bindAction(48, true, 'customZoom'); // Ctrl+0
    keyHandler.bindAction(82, true, 'turn'); // Ctrl+R
    keyHandler.bindAction(82, true, 'clearDefaultStyle', true); // Ctrl+Shift+R
    keyHandler.bindAction(83, true, 'save'); // Ctrl+S
    keyHandler.bindAction(83, true, 'saveAs', true); // Ctrl+Shift+S
    keyHandler.bindAction(65, true, 'selectAll'); // Ctrl+A
    keyHandler.bindAction(65, true, 'selectNone', true); // Ctrl+A
    keyHandler.bindAction(73, true, 'selectVertices', true); // Ctrl+Shift+I
    keyHandler.bindAction(69, true, 'selectEdges', true); // Ctrl+Shift+E
    keyHandler.bindAction(69, true, 'editStyle'); // Ctrl+E
    keyHandler.bindAction(66, true, 'bold'); // Ctrl+B
    keyHandler.bindAction(66, true, 'toBack', true); // Ctrl+Shift+B
    keyHandler.bindAction(70, true, 'toFront', true); // Ctrl+Shift+F
    keyHandler.bindAction(68, true, 'duplicate'); // Ctrl+D
    keyHandler.bindAction(68, true, 'setAsDefaultStyle', true); // Ctrl+Shift+D
    keyHandler.bindAction(90, true, 'undo'); // Ctrl+Z
    keyHandler.bindAction(89, true, 'autosize', true); // Ctrl+Shift+Y
    keyHandler.bindAction(88, true, 'cut'); // Ctrl+X
    keyHandler.bindAction(67, true, 'copy'); // Ctrl+C
    keyHandler.bindAction(86, true, 'paste'); // Ctrl+V
    keyHandler.bindAction(71, true, 'group'); // Ctrl+G
    keyHandler.bindAction(77, true, 'editData'); // Ctrl+M
    keyHandler.bindAction(71, true, 'grid', true); // Ctrl+Shift+G
    keyHandler.bindAction(73, true, 'italic'); // Ctrl+I
    keyHandler.bindAction(76, true, 'lockUnlock'); // Ctrl+L
    keyHandler.bindAction(76, true, 'layers', true); // Ctrl+Shift+L
    keyHandler.bindAction(80, true, 'formatPanel', true); // Ctrl+Shift+P
    keyHandler.bindAction(85, true, 'underline'); // Ctrl+U
    keyHandler.bindAction(85, true, 'ungroup', true); // Ctrl+Shift+U
    keyHandler.bindAction(190, true, 'superscript'); // Ctrl+.
    keyHandler.bindAction(188, true, 'subscript'); // Ctrl+,
    keyHandler.bindKey(13, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    }); // Enter
    keyHandler.bindKey(113, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    }); // F2
  }

  if (!mxClient.IS_WIN) {
    keyHandler.bindAction(90, true, 'redo', true); // Ctrl+Shift+Z
  } else {
    keyHandler.bindAction(89, true, 'redo'); // Ctrl+Y
  }

  return keyHandler;
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.destroy = function () {
  if (this.editor != null) {
    this.editor.destroy();
    this.editor = null;
  }

  if (this.menubar != null) {
    this.menubar.destroy();
    /**
     * @type {Menubar}
     */
    this.menubar = null;
  }

  if (this.toolbar != null) {
    this.toolbar.destroy();
    this.toolbar = null;
  }

  if (this.sidebar != null) {
    this.sidebar.destroy();
    this.sidebar = null;
  }

  if (this.keyHandler != null) {
    this.keyHandler.destroy();
    this.keyHandler = null;
  }

  if (this.keydownHandler != null) {
    mxEvent.removeListener(document, 'keydown', this.keydownHandler);
    this.keydownHandler = null;
  }

  if (this.keyupHandler != null) {
    mxEvent.removeListener(document, 'keyup', this.keyupHandler);
    this.keyupHandler = null;
  }

  if (this.resizeHandler != null) {
    mxEvent.removeListener(window, 'resize', this.resizeHandler);
    this.resizeHandler = null;
  }

  if (this.gestureHandler != null) {
    mxEvent.removeGestureListeners(document, this.gestureHandler);
    this.gestureHandler = null;
  }

  if (this.orientationChangeHandler != null) {
    mxEvent.removeListener(window, 'orientationchange', this.orientationChangeHandler);
    this.orientationChangeHandler = null;
  }

  if (this.scrollHandler != null) {
    mxEvent.removeListener(window, 'scroll', this.scrollHandler);
    this.scrollHandler = null;
  }

  if (this.destroyFunctions != null) {
    for (var i = 0; i < this.destroyFunctions.length; i++) {
      this.destroyFunctions[i]();
    }

    this.destroyFunctions = null;
  }

  var c = [this.menubarContainer, this.toolbarContainer, this.sidebarContainer,
    this.formatContainer, this.diagramContainer, this.footerContainer,
    this.chromelessToolbar, this.hsplit, this.sidebarFooterContainer,
    this.layersDialog];

  for (var i = 0; i < c.length; i++) {
    if (c[i] != null && c[i].parentNode != null) {
      c[i].parentNode.removeChild(c[i]);
    }
  }
};
