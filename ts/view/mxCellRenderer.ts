/**
 * Class: mxCellRenderer
 *
 * Renders cells into a document object model. The <defaultShapes> is a global
 * map of shapename, constructor pairs that is used in all instances. You can
 * get a list of all available shape names using the following code.
 *
 * In general the cell renderer is in charge of creating, redrawing and
 * destroying the shape and label associated with a cell state, as well as
 * some other graphical objects, namely controls and overlays. The shape
 * hieararchy in the display (ie. the hierarchy in which the DOM nodes
 * appear in the document) does not reflect the cell hierarchy. The shapes
 * are a (flat) sequence of shapes and labels inside the draw pane of the
 * graph view, with some exceptions, namely the HTML labels being placed
 * directly inside the graph container for certain browsers.
 *
 * (code)
 * mxLog.show();
 * for (var i in mxCellRenderer.defaultShapes)
 * {
 *   mxLog.debug(i);
 * }
 * (end)
 *
 * Constructor: mxCellRenderer
 *
 * Constructs a new cell renderer with the following built-in shapes:
 * arrow, rectangle, ellipse, rhombus, image, line, label, cylinder,
 * swimlane, connector, actor and cloud.
 */
import { mxClient } from '../mxClient';
import { mxImageShape } from '../shape/mxImageShape';
import { mxShape } from '../shape/mxShape';
import { mxStencilRegistry } from '../shape/mxStencilRegistry';
import { mxConstants } from '../util/mxConstants';
import { mxDictionary } from '../util/mxDictionary';
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxMouseEvent } from '../util/mxMouseEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';

export class mxCellRenderer {
  /**
   * Variable: defaultEdgeShape
   *
   * Defines the default shape for edges. Default is <mxConnector>.
   */
  defaultEdgeShape: any;
  /**
   * Variable: defaultVertexShape
   *
   * Defines the default shape for vertices. Default is <mxRectangleShape>.
   */
  defaultVertexShape: any;
  /**
   * Variable: defaultTextShape
   *
   * Defines the default shape for labels. Default is <mxText>.
   */
  defaultTextShape: any;
  /**
   * Variable: legacyControlPosition
   *
   * Specifies if the folding icon should ignore the horizontal
   * orientation of a swimlane. Default is true.
   * @example true
   */
  legacyControlPosition: boolean;
  /**
   * Variable: legacySpacing
   *
   * Specifies if spacing and label position should be ignored if overflow is
   * fill or width. Default is true for backwards compatiblity.
   * @example true
   */
  legacySpacing: boolean;
  /**
   * Variable: antiAlias
   *
   * Anti-aliasing option for new shapes. Default is true.
   * @example true
   */
  antiAlias: boolean;
  /**
   * Variable: minSvgStrokeWidth
   *
   * Minimum stroke width for SVG output.
   * @example 1
   */
  minSvgStrokeWidth: number;
  /**
   * Variable: forceControlClickHandler
   *
   * Specifies if the enabled state of the graph should be ignored in the control
   * click handler (to allow folding in disabled graphs). Default is false.
   */
  forceControlClickHandler: boolean;

  /**
   * Function: initializeShape
   *
   * Initializes the shape in the given state by calling its init method with
   * the correct container after configuring it using <configureShape>.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the shape should be initialized.
   */
  initializeShape(state: any): void {
    state.shape.dialect = state.view.graph.dialect;
    this.configureShape(state);
    state.shape.init(state.view.getDrawPane());
  }

  /**
   * Function: createShape
   *
   * Creates and returns the shape for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the shape should be created.
   */
  createShape(state: any): any {
    let shape = undefined;
    if (!!state.style) {
      const stencil = mxStencilRegistry.getStencil(state.style[mxConstants.STYLE_SHAPE]);
      if (!!stencil) {
        shape = new mxShape(stencil);
      } else {
        const ctor = this.getShapeConstructor(state);
        shape = new ctor();
      }
    }
    return shape;
  }

  /**
   * Function: createIndicatorShape
   *
   * Creates the indicator shape for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the indicator shape should be created.
   */
  createIndicatorShape(state: any): void {
    state.shape.indicatorShape = this.getShape(state.view.graph.getIndicatorShape(state));
  }

  /**
   * Function: getShape
   *
   * Returns the shape for the given name from <defaultShapes>.
   */
  getShape(name: string): any {
    return (!!name) ? mxCellRenderer.defaultShapes[name] : null;
  }

  /**
   * Function: getShapeConstructor
   *
   * Returns the constructor to be used for creating the shape.
   */
  getShapeConstructor(state: any): any {
    let ctor = this.getShape(state.style[mxConstants.STYLE_SHAPE]);
    if (!ctor) {
      ctor = (state.view.graph.getModel().isEdge(state.cell)) ? this.defaultEdgeShape : this.defaultVertexShape;
    }
    return ctor;
  }

  /**
   * Function: configureShape
   *
   * Configures the shape for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the shape should be configured.
   */
  configureShape(state: any): void {
    state.shape.apply(state);
    state.shape.image = state.view.graph.getImage(state);
    state.shape.indicatorColor = state.view.graph.getIndicatorColor(state);
    state.shape.indicatorStrokeColor = state.style[mxConstants.STYLE_INDICATOR_STROKECOLOR];
    state.shape.indicatorGradientColor = state.view.graph.getIndicatorGradientColor(state);
    state.shape.indicatorDirection = state.style[mxConstants.STYLE_INDICATOR_DIRECTION];
    state.shape.indicatorImage = state.view.graph.getIndicatorImage(state);
    this.postConfigureShape(state);
  }

  /**
   * Function: postConfigureShape
   *
   * Replaces any reserved words used for attributes, eg. inherit,
   * indicated or swimlane for colors in the shape for the given state.
   * This implementation resolves these keywords on the fill, stroke
   * and gradient color keys.
   */
  postConfigureShape(state: any): void {
    if (!!state.shape) {
      this.resolveColor(state, 'indicatorColor', mxConstants.STYLE_FILLCOLOR);
      this.resolveColor(state, 'indicatorGradientColor', mxConstants.STYLE_GRADIENTCOLOR);
      this.resolveColor(state, 'fill', mxConstants.STYLE_FILLCOLOR);
      this.resolveColor(state, 'stroke', mxConstants.STYLE_STROKECOLOR);
      this.resolveColor(state, 'gradient', mxConstants.STYLE_GRADIENTCOLOR);
    }
  }

  /**
   * Function: checkPlaceholderStyles
   *
   * Resolves special keywords 'inherit', 'indicated' and 'swimlane' and sets
   * the respective color on the shape.
   */
  checkPlaceholderStyles(state: any): any {
    if (!!state.style) {
      const values = ['inherit', 'swimlane', 'indicated'];
      const styles = [mxConstants.STYLE_FILLCOLOR, mxConstants.STYLE_STROKECOLOR, mxConstants.STYLE_GRADIENTCOLOR];
      for (let i = 0; i < styles.length; i++) {
        if (mxUtils.indexOf(values, state.style[styles[i]]) >= 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Function: resolveColor
   *
   * Resolves special keywords 'inherit', 'indicated' and 'swimlane' and sets
   * the respective color on the shape.
   */
  resolveColor(state: any, field: any, key: string): void {
    const value = state.shape[field];
    const graph = state.view.graph;
    let referenced = undefined;
    if (value == 'inherit') {
      referenced = graph.model.getParent(state.cell);
    } else if (value == 'swimlane') {
      state.shape[field] = (key == mxConstants.STYLE_STROKECOLOR) ? '#000000' : '#ffffff';
      if (graph.model.getTerminal(state.cell, false)) {
        referenced = graph.model.getTerminal(state.cell, false);
      } else {
        referenced = state.cell;
      }
      referenced = graph.getSwimlane(referenced);
      key = graph.swimlaneIndicatorColorAttribute;
    } else if (value == 'indicated') {
      state.shape[field] = state.shape.indicatorColor;
    }
    if (!!referenced) {
      const rstate = graph.getView().getState(referenced);
      state.shape[field] = undefined;
      if (!!rstate) {
        if (!!rstate.shape && field != 'indicatorColor') {
          state.shape[field] = rstate.shape[field];
        } else {
          state.shape[field] = rstate.style[key];
        }
      }
    }
  }

  /**
   * Function: getLabelValue
   *
   * Returns the value to be used for the label.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the label should be created.
   */
  getLabelValue(state: any): any {
    return state.view.graph.getLabel(state.cell);
  }

  /**
   * Function: createLabel
   *
   * Creates the label for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the label should be created.
   */
  createLabel(state: any, value: any): any {
    const graph = state.view.graph;
    const isEdge = graph.getModel().isEdge(state.cell);
    if (state.style[mxConstants.STYLE_FONTSIZE] > 0 || !state.style[mxConstants.STYLE_FONTSIZE]) {
      const isForceHtml = (graph.isHtmlLabel(state.cell) || (!!value && mxUtils.isNode(value)));
      state.text = new this.defaultTextShape(value, new mxRectangle(), (state.style[mxConstants.STYLE_ALIGN] || mxConstants.ALIGN_CENTER), graph.getVerticalAlign(state), state.style[mxConstants.STYLE_FONTCOLOR], state.style[mxConstants.STYLE_FONTFAMILY], state.style[mxConstants.STYLE_FONTSIZE], state.style[mxConstants.STYLE_FONTSTYLE], state.style[mxConstants.STYLE_SPACING], state.style[mxConstants.STYLE_SPACING_TOP], state.style[mxConstants.STYLE_SPACING_RIGHT], state.style[mxConstants.STYLE_SPACING_BOTTOM], state.style[mxConstants.STYLE_SPACING_LEFT], state.style[mxConstants.STYLE_HORIZONTAL], state.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR], state.style[mxConstants.STYLE_LABEL_BORDERCOLOR], graph.isWrapping(state.cell) && graph.isHtmlLabel(state.cell), graph.isLabelClipped(state.cell), state.style[mxConstants.STYLE_OVERFLOW], state.style[mxConstants.STYLE_LABEL_PADDING], mxUtils.getValue(state.style, mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION));
      state.text.opacity = mxUtils.getValue(state.style, mxConstants.STYLE_TEXT_OPACITY, 100);
      state.text.dialect = (isForceHtml) ? mxConstants.DIALECT_STRICTHTML : state.view.graph.dialect;
      state.text.style = state.style;
      state.text.state = state;
      this.initializeLabel(state, state.text);
      let forceGetCell = false;
      const getState = function (evt) {
        let result = state;
        if (mxClient.IS_TOUCH || forceGetCell) {
          const x = mxEvent.getClientX(evt);
          const y = mxEvent.getClientY(evt);
          const pt = mxUtils.convertPoint(graph.container, x, y);
          result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
        }
        return result;
      };
      mxEvent.addGestureListeners(state.text.node, (evt) => {
        if (this.isLabelEvent(state, evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
          forceGetCell = graph.dialect != mxConstants.DIALECT_SVG && mxEvent.getSource(evt).nodeName == 'IMG';
        }
      }, mxUtils.bind(this, function (evt) {
        if (this.isLabelEvent(state, evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
        }
      }), (evt) => {
        if (this.isLabelEvent(state, evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
          forceGetCell = false;
        }
      });
      if (graph.nativeDblClickEnabled) {
        mxEvent.addListener(state.text.node, 'dblclick', (evt) => {
          if (this.isLabelEvent(state, evt)) {
            graph.dblClick(evt, state.cell);
            mxEvent.consume(evt);
          }
        });
      }
    }
  }

  /**
   * Function: initializeLabel
   *
   * Initiailzes the label with a suitable container.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label should be initialized.
   */
  initializeLabel(state: any, shape: any): void {
    if (mxClient.IS_SVG && mxClient.NO_FO && shape.dialect != mxConstants.DIALECT_SVG) {
      shape.init(state.view.graph.container);
    } else {
      shape.init(state.view.getDrawPane());
    }
  }

  /**
   * Function: createCellOverlays
   *
   * Creates the actual shape for showing the overlay for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the overlay should be created.
   */
  createCellOverlays(state: any): void {
    const graph = state.view.graph;
    const overlays = graph.getCellOverlays(state.cell);
    let dict = undefined;
    if (!!overlays) {
      dict = new mxDictionary();
      for (let i = 0; i < overlays.length; i++) {
        const shape = (!!state.overlays) ? state.overlays.remove(overlays[i]) : null;
        if (!shape) {
          const tmp = new mxImageShape(new mxRectangle(), overlays[i].image.src);
          tmp.dialect = state.view.graph.dialect;
          tmp.preserveImageAspect = false;
          tmp.overlay = overlays[i];
          this.initializeOverlay(state, tmp);
          this.installCellOverlayListeners(state, overlays[i], tmp);
          if (overlays[i].cursor) {
            tmp.node.style.cursor = overlays[i].cursor;
          }
          dict.put(overlays[i], tmp);
        } else {
          dict.put(overlays[i], shape);
        }
      }
    }
    if (!!state.overlays) {
      state.overlays.visit(function (id, shape) {
        shape.destroy();
      });
    }
    state.overlays = dict;
  }

  /**
   * Function: initializeOverlay
   *
   * Initializes the given overlay.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the overlay should be created.
   * overlay - <mxImageShape> that represents the overlay.
   */
  initializeOverlay(state: any, overlay: any): void {
    overlay.init(state.view.getOverlayPane());
  }

  /**
   * Function: installOverlayListeners
   *
   * Installs the listeners for the given <mxCellState>, <mxCellOverlay> and
   * <mxShape> that represents the overlay.
   */
  installCellOverlayListeners(state: any, overlay: any, shape: any): void {
    const graph = state.view.graph;
    mxEvent.addListener(shape.node, 'click', function (evt) {
      if (graph.isEditing()) {
        graph.stopEditing(!graph.isInvokesStopCellEditing());
      }
      overlay.fireEvent(new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', state.cell));
    });
    mxEvent.addGestureListeners(shape.node, function (evt) {
      mxEvent.consume(evt);
    }, function (evt) {
      graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, state));
    });
    if (mxClient.IS_TOUCH) {
      mxEvent.addListener(shape.node, 'touchend', function (evt) {
        overlay.fireEvent(new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', state.cell));
      });
    }
  }

  /**
   * Function: createControl
   *
   * Creates the control for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the control should be created.
   */
  createControl(state: any): void {
    const graph = state.view.graph;
    const image = graph.getFoldingImage(state);
    if (graph.foldingEnabled && !!image) {
      if (!state.control) {
        const b = new mxRectangle(0, 0, image.width, image.height);
        state.control = new mxImageShape(b, image.src);
        state.control.preserveImageAspect = false;
        state.control.dialect = graph.dialect;
        this.initControl(state, state.control, true, this.createControlClickHandler(state));
      }
    } else if (!!state.control) {
      state.control.destroy();
      state.control = undefined;
    }
  }

  /**
   * Function: createControlClickHandler
   *
   * Hook for creating the click handler for the folding icon.
   *
   * Parameters:
   *
   * state - <mxCellState> whose control click handler should be returned.
   */
  createControlClickHandler(state: any): Function {
    const graph = state.view.graph;
    return (evt) => {
      if (this.forceControlClickHandler || graph.isEnabled()) {
        const collapse = !graph.isCellCollapsed(state.cell);
        graph.foldCells(collapse, false, [state.cell], null, evt);
        mxEvent.consume(evt);
      }
    };
  }

  /**
   * Function: initControl
   *
   * Initializes the given control and returns the corresponding DOM node.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the control should be initialized.
   * control - <mxShape> to be initialized.
   * handleEvents - Boolean indicating if mousedown and mousemove should fire events via the graph.
   * clickHandler - Optional function to implement clicks on the control.
   */
  initControl(state: any, control: any, handleEvents: any, clickHandler: Function): any {
    const graph = state.view.graph;
    const isForceHtml = graph.isHtmlLabel(state.cell) && mxClient.NO_FO && graph.dialect == mxConstants.DIALECT_SVG;
    if (isForceHtml) {
      control.dialect = mxConstants.DIALECT_PREFERHTML;
      control.init(graph.container);
      control.node.style.zIndex = 1;
    } else {
      control.init(state.view.getOverlayPane());
    }
    const node = control.innerNode || control.node;
    if (!!clickHandler && !mxClient.IS_IOS) {
      if (graph.isEnabled()) {
        node.style.cursor = 'pointer';
      }
      mxEvent.addListener(node, 'click', clickHandler);
    }
    if (handleEvents) {
      let first = undefined;
      mxEvent.addGestureListeners(node, function (evt) {
        first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
        graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
        mxEvent.consume(evt);
      }, function (evt) {
        graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, state));
      }, function (evt) {
        graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, state));
        mxEvent.consume(evt);
      });
      if (!!clickHandler && mxClient.IS_IOS) {
        node.addEventListener('touchend', function (evt) {
          if (!!first) {
            const tol = graph.tolerance;
            if (Math.abs(first.x - mxEvent.getClientX(evt)) < tol && Math.abs(first.y - mxEvent.getClientY(evt)) < tol) {
              clickHandler.call(clickHandler, evt);
              mxEvent.consume(evt);
            }
          }
        }, true);
      }
    }
    return node;
  }

  /**
   * Function: isShapeEvent
   *
   * Returns true if the event is for the shape of the given state. This
   * implementation always returns true.
   *
   * Parameters:
   *
   * state - <mxCellState> whose shape fired the event.
   * evt - Mouse event which was fired.
   */
  isShapeEvent(state: any, evt: Event): boolean {
    return true;
  }

  /**
   * Function: isLabelEvent
   *
   * Returns true if the event is for the label of the given state. This
   * implementation always returns true.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label fired the event.
   * evt - Mouse event which was fired.
   */
  isLabelEvent(state: any, evt: Event): boolean {
    return true;
  }

  /**
   * Function: installListeners
   *
   * Installs the event listeners for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the event listeners should be isntalled.
   */
  installListeners(state: any): any {
    const graph = state.view.graph;
    const getState = function (evt) {
      let result = state;
      if ((graph.dialect != mxConstants.DIALECT_SVG && mxEvent.getSource(evt).nodeName == 'IMG') || mxClient.IS_TOUCH) {
        const x = mxEvent.getClientX(evt);
        const y = mxEvent.getClientY(evt);
        const pt = mxUtils.convertPoint(graph.container, x, y);
        result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
      }
      return result;
    };
    mxEvent.addGestureListeners(state.shape.node, (evt) => {
      if (this.isShapeEvent(state, evt)) {
        graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
      }
    }, mxUtils.bind(this, function (evt) {
      if (this.isShapeEvent(state, evt)) {
        graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
      }
    }), (evt) => {
      if (this.isShapeEvent(state, evt)) {
        graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
      }
    });
    if (graph.nativeDblClickEnabled) {
      mxEvent.addListener(state.shape.node, 'dblclick', (evt) => {
        if (this.isShapeEvent(state, evt)) {
          graph.dblClick(evt, state.cell);
          mxEvent.consume(evt);
        }
      });
    }
  }

  /**
   * Function: redrawLabel
   *
   * Redraws the label for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label should be redrawn.
   */
  redrawLabel(state: any, forced: any): void {
    const graph = state.view.graph;
    const value = this.getLabelValue(state);
    const wrapping = graph.isWrapping(state.cell);
    const clipping = graph.isLabelClipped(state.cell);
    const isForceHtml = (state.view.graph.isHtmlLabel(state.cell) || (!!value && mxUtils.isNode(value)));
    const dialect = (isForceHtml) ? mxConstants.DIALECT_STRICTHTML : state.view.graph.dialect;
    const overflow = state.style[mxConstants.STYLE_OVERFLOW] || 'visible';
    if (!!state.text && (state.text.wrap != wrapping || state.text.clipped != clipping || state.text.overflow != overflow || state.text.dialect != dialect)) {
      state.text.destroy();
      state.text = undefined;
    }
    if (!state.text && !!value && (mxUtils.isNode(value) || value.length > 0)) {
      this.createLabel(state, value);
    } else if (!!state.text && (!value || value.length == 0)) {
      state.text.destroy();
      state.text = undefined;
    }
    if (!!state.text) {
      if (forced) {
        if (!!state.text.lastValue && this.isTextShapeInvalid(state, state.text)) {
          state.text.lastValue = undefined;
        }
        state.text.resetStyles();
        state.text.apply(state);
        state.text.valign = graph.getVerticalAlign(state);
      }
      const bounds = this.getLabelBounds(state);
      const nextScale = this.getTextScale(state);
      if (forced || state.text.value != value || state.text.isWrapping != wrapping || state.text.overflow != overflow || state.text.isClipping != clipping || state.text.scale != nextScale || state.text.dialect != dialect || !state.text.bounds.equals(bounds)) {
        if (state.text.bounds.width != 0 && !!state.unscaledWidth && Math.round((state.text.bounds.width / state.text.scale * nextScale) - bounds.width) != 0) {
          state.unscaledWidth = undefined;
        }
        state.text.dialect = dialect;
        state.text.value = value;
        state.text.bounds = bounds;
        state.text.scale = nextScale;
        state.text.wrap = wrapping;
        state.text.clipped = clipping;
        state.text.overflow = overflow;
        const vis = state.text.node.style.visibility;
        this.redrawLabelShape(state.text);
        state.text.node.style.visibility = vis;
      }
    }
  }

  /**
   * Function: isTextShapeInvalid
   *
   * Returns true if the style for the text shape has changed.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label should be checked.
   * shape - <mxText> shape to be checked.
   */
  isTextShapeInvalid(state: any, shape: any): boolean {
    function check(property, stylename, defaultValue) {
      let result = false;
      if (stylename == 'spacingTop' || stylename == 'spacingRight' || stylename == 'spacingBottom' || stylename == 'spacingLeft') {
        result = parseFloat(shape[property]) - parseFloat(shape.spacing) != (state.style[stylename] || defaultValue);
      } else {
        result = shape[property] != (state.style[stylename] || defaultValue);
      }
      return result;
    }

    return check('fontStyle', mxConstants.STYLE_FONTSTYLE, mxConstants.DEFAULT_FONTSTYLE) || check('family', mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY) || check('size', mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE) || check('color', mxConstants.STYLE_FONTCOLOR, 'black') || check('align', mxConstants.STYLE_ALIGN, '') || check('valign', mxConstants.STYLE_VERTICAL_ALIGN, '') || check('spacing', mxConstants.STYLE_SPACING, 2) || check('spacingTop', mxConstants.STYLE_SPACING_TOP, 0) || check('spacingRight', mxConstants.STYLE_SPACING_RIGHT, 0) || check('spacingBottom', mxConstants.STYLE_SPACING_BOTTOM, 0) || check('spacingLeft', mxConstants.STYLE_SPACING_LEFT, 0) || check('horizontal', mxConstants.STYLE_HORIZONTAL, true) || check('background', mxConstants.STYLE_LABEL_BACKGROUNDCOLOR) || check('border', mxConstants.STYLE_LABEL_BORDERCOLOR) || check('opacity', mxConstants.STYLE_TEXT_OPACITY, 100) || check('textDirection', mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION);
  }

  /**
   * Function: redrawLabelShape
   *
   * Called to invoked redraw on the given text shape.
   *
   * Parameters:
   *
   * shape - <mxText> shape to be redrawn.
   */
  redrawLabelShape(shape: any): void {
    shape.redraw();
  }

  /**
   * Function: getTextScale
   *
   * Returns the scaling used for the label of the given state
   *
   * Parameters:
   *
   * state - <mxCellState> whose label scale should be returned.
   */
  getTextScale(state: any): any {
    return state.view.scale;
  }

  /**
   * Function: getLabelBounds
   *
   * Returns the bounds to be used to draw the label of the given state.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label bounds should be returned.
   */
  getLabelBounds(state: any): any {
    const graph = state.view.graph;
    const scale = state.view.scale;
    const isEdge = graph.getModel().isEdge(state.cell);
    let bounds = new mxRectangle(state.absoluteOffset.x, state.absoluteOffset.y);
    if (isEdge) {
      const spacing = state.text.getSpacing();
      bounds.x += spacing.x * scale;
      bounds.y += spacing.y * scale;
      const geo = graph.getCellGeometry(state.cell);
      if (!!geo) {
        bounds.width = Math.max(0, geo.width * scale);
        bounds.height = Math.max(0, geo.height * scale);
      }
    } else {
      if (state.text.isPaintBoundsInverted()) {
        const tmp = bounds.x;
        bounds.x = bounds.y;
        bounds.y = tmp;
      }
      bounds.x += state.x;
      bounds.y += state.y;
      bounds.width = Math.max(1, state.width);
      bounds.height = Math.max(1, state.height);
      const sc = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
      if (sc != mxConstants.NONE && sc != '') {
        const s = parseFloat(mxUtils.getValue(state.style, mxConstants.STYLE_STROKEWIDTH, 1)) * scale;
        const dx = 1 + Math.floor((s - 1) / 2);
        const dh = Math.floor(s + 1);
        bounds.x += dx;
        bounds.y += dx;
        bounds.width -= dh;
        bounds.height -= dh;
      }
    }
    if (state.text.isPaintBoundsInverted()) {
      const t = (state.width - state.height) / 2;
      bounds.x += t;
      bounds.y -= t;
      const tmp = bounds.width;
      bounds.width = bounds.height;
      bounds.height = tmp;
    }
    if (!!state.shape) {
      const hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
      const vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
      if (hpos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_MIDDLE) {
        bounds = state.shape.getLabelBounds(bounds);
      }
    }
    const lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
    if (!!lw) {
      bounds.width = parseFloat(lw) * scale;
    }
    if (!isEdge) {
      this.rotateLabelBounds(state, bounds);
    }
    return bounds;
  }

  /**
   * Function: rotateLabelBounds
   *
   * Adds the shape rotation to the given label bounds and
   * applies the alignment and offsets.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label bounds should be rotated.
   * bounds - <mxRectangle> the rectangle to be rotated.
   */
  rotateLabelBounds(state: any, bounds: any): void {
    bounds.y -= state.text.margin.y * bounds.height;
    bounds.x -= state.text.margin.x * bounds.width;
    if (!this.legacySpacing || (state.style[mxConstants.STYLE_OVERFLOW] != 'fill' && state.style[mxConstants.STYLE_OVERFLOW] != 'width')) {
      const s = state.view.scale;
      const spacing = state.text.getSpacing();
      bounds.x += spacing.x * s;
      bounds.y += spacing.y * s;
      const hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
      const vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
      const lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
      bounds.width = Math.max(0, bounds.width - ((hpos == mxConstants.ALIGN_CENTER && !lw) ? (state.text.spacingLeft * s + state.text.spacingRight * s) : 0));
      bounds.height = Math.max(0, bounds.height - ((vpos == mxConstants.ALIGN_MIDDLE) ? (state.text.spacingTop * s + state.text.spacingBottom * s) : 0));
    }
    const theta = state.text.getTextRotation();
    if (theta != 0 && !!state && state.view.graph.model.isVertex(state.cell)) {
      const cx = state.getCenterX();
      const cy = state.getCenterY();
      if (bounds.x != cx || bounds.y != cy) {
        const rad = theta * (Math.PI / 180);
        pt = mxUtils.getRotatedPoint(new mxPoint(bounds.x, bounds.y), Math.cos(rad), Math.sin(rad), new mxPoint(cx, cy));
        bounds.x = pt.x;
        bounds.y = pt.y;
      }
    }
  }

  /**
   * Function: redrawCellOverlays
   *
   * Redraws the overlays for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> whose overlays should be redrawn.
   */
  redrawCellOverlays(state: any, forced: any): void {
    this.createCellOverlays(state);
    if (!!state.overlays) {
      const rot = mxUtils.mod(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0), 90);
      const rad = mxUtils.toRadians(rot);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      state.overlays.visit(function (id, shape) {
        const bounds = shape.overlay.getBounds(state);
        if (!state.view.graph.getModel().isEdge(state.cell)) {
          if (!!state.shape && rot != 0) {
            let cx = bounds.getCenterX();
            let cy = bounds.getCenterY();
            const point = mxUtils.getRotatedPoint(new mxPoint(cx, cy), cos, sin, new mxPoint(state.getCenterX(), state.getCenterY()));
            cx = point.x;
            cy = point.y;
            bounds.x = Math.round(cx - bounds.width / 2);
            bounds.y = Math.round(cy - bounds.height / 2);
          }
        }
        if (forced || !shape.bounds || shape.scale != state.view.scale || !shape.bounds.equals(bounds)) {
          shape.bounds = bounds;
          shape.scale = state.view.scale;
          shape.redraw();
        }
      });
    }
  }

  /**
   * Function: redrawControl
   *
   * Redraws the control for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> whose control should be redrawn.
   */
  redrawControl(state: any, forced: any): void {
    const image = state.view.graph.getFoldingImage(state);
    if (!!state.control && !!image) {
      const bounds = this.getControlBounds(state, image.width, image.height);
      const r = (this.legacyControlPosition) ? mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0) : state.shape.getTextRotation();
      const s = state.view.scale;
      if (forced || state.control.scale != s || !state.control.bounds.equals(bounds) || state.control.rotation != r) {
        state.control.rotation = r;
        state.control.bounds = bounds;
        state.control.scale = s;
        state.control.redraw();
      }
    }
  }

  /**
   * Function: getControlBounds
   *
   * Returns the bounds to be used to draw the control (folding icon) of the
   * given state.
   */
  getControlBounds(state: any, w: number, h: number): any {
    if (!!state.control) {
      const s = state.view.scale;
      let cx = state.getCenterX();
      let cy = state.getCenterY();
      if (!state.view.graph.getModel().isEdge(state.cell)) {
        cx = state.x + w * s;
        cy = state.y + h * s;
        if (!!state.shape) {
          let rot = state.shape.getShapeRotation();
          if (this.legacyControlPosition) {
            rot = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0);
          } else {
            if (state.shape.isPaintBoundsInverted()) {
              const t = (state.width - state.height) / 2;
              cx += t;
              cy -= t;
            }
          }
          if (rot != 0) {
            const rad = mxUtils.toRadians(rot);
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const point = mxUtils.getRotatedPoint(new mxPoint(cx, cy), cos, sin, new mxPoint(state.getCenterX(), state.getCenterY()));
            cx = point.x;
            cy = point.y;
          }
        }
      }
      return (state.view.graph.getModel().isEdge(state.cell)) ? new mxRectangle(Math.round(cx - w / 2 * s), Math.round(cy - h / 2 * s), Math.round(w * s), Math.round(h * s)) : new mxRectangle(Math.round(cx - w / 2 * s), Math.round(cy - h / 2 * s), Math.round(w * s), Math.round(h * s));
    }
    return null;
  }

  /**
   * Function: insertStateAfter
   *
   * Inserts the given array of <mxShapes> after the given nodes in the DOM.
   *
   * Parameters:
   *
   * shapes - Array of <mxShapes> to be inserted.
   * node - Node in <drawPane> after which the shapes should be inserted.
   * htmlNode - Node in the graph container after which the shapes should be inserted that
   * will not go into the <drawPane> (eg. HTML labels without foreignObjects).
   */
  insertStateAfter(state: any, node: Node, htmlNode: any): any {
    const shapes = this.getShapesForState(state);
    for (let i = 0; i < shapes.length; i++) {
      if (shapes[i] && shapes[i].node) {
        const html = shapes[i].node.parentNode != state.view.getDrawPane() && shapes[i].node.parentNode != state.view.getOverlayPane();
        const temp = (html) ? htmlNode : node;
        if (!!temp && temp.nextSibling != shapes[i].node) {
          if (!temp.nextSibling) {
            temp.parentNode.appendChild(shapes[i].node);
          } else {
            temp.parentNode.insertBefore(shapes[i].node, temp.nextSibling);
          }
        } else if (!temp) {
          if (shapes[i].node.parentNode == state.view.graph.container) {
            let canvas = state.view.canvas;
            while (!!canvas && canvas.parentNode != state.view.graph.container) {
              canvas = canvas.parentNode;
            }
            if (!!canvas && !!canvas.nextSibling) {
              if (canvas.nextSibling != shapes[i].node) {
                shapes[i].node.parentNode.insertBefore(shapes[i].node, canvas.nextSibling);
              }
            } else {
              shapes[i].node.parentNode.appendChild(shapes[i].node);
            }
          } else if (shapes[i].node.parentNode.firstChild && shapes[i].node.parentNode.firstChild != shapes[i].node) {
            shapes[i].node.parentNode.insertBefore(shapes[i].node, shapes[i].node.parentNode.firstChild);
          }
        }
        if (html) {
          htmlNode = shapes[i].node;
        } else {
          node = shapes[i].node;
        }
      }
    }
    return [node, htmlNode];
  }

  /**
   * Function: getShapesForState
   *
   * Returns the <mxShapes> for the given cell state in the order in which they should
   * appear in the DOM.
   *
   * Parameters:
   *
   * state - <mxCellState> whose shapes should be returned.
   */
  getShapesForState(state: any): any {
    return [state.shape, state.text, state.control];
  }

  /**
   * Function: redraw
   *
   * Updates the bounds or points and scale of the shapes for the given cell
   * state. This is called in mxGraphView.validatePoints as the last step of
   * updating all cells.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the shapes should be updated.
   * force - Optional boolean that specifies if the cell should be reconfiured
   * and redrawn without any additional checks.
   * rendering - Optional boolean that specifies if the cell should actually
   * be drawn into the DOM. If this is false then redraw and/or reconfigure
   * will not be called on the shape.
   */
  redraw(state: any, force: any, rendering: any): void {
    const shapeChanged = this.redrawShape(state, force, rendering);
    if (!!state.shape && (!rendering || rendering)) {
      this.redrawLabel(state, shapeChanged);
      this.redrawCellOverlays(state, shapeChanged);
      this.redrawControl(state, shapeChanged);
    }
  }

  /**
   * Function: redrawShape
   *
   * Redraws the shape for the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> whose label should be redrawn.
   */
  redrawShape(state: any, force: any, rendering: any): any {
    const model = state.view.graph.model;
    let shapeChanged = false;
    if (!!state.shape && !!state.shape.style && !!state.style && state.shape.style[mxConstants.STYLE_SHAPE] != state.style[mxConstants.STYLE_SHAPE]) {
      state.shape.destroy();
      state.shape = undefined;
    }
    if (!state.shape && !!state.view.graph.container && state.cell != state.view.currentRoot && (model.isVertex(state.cell) || model.isEdge(state.cell))) {
      state.shape = this.createShape(state);
      if (!!state.shape) {
        state.shape.minSvgStrokeWidth = this.minSvgStrokeWidth;
        state.shape.antiAlias = this.antiAlias;
        this.createIndicatorShape(state);
        this.initializeShape(state);
        this.createCellOverlays(state);
        this.installListeners(state);
        state.view.graph.selectionCellsHandler.updateHandler(state);
      }
    } else if (!force && !!state.shape && (!mxUtils.equalEntries(state.shape.style, state.style) || this.checkPlaceholderStyles(state))) {
      state.shape.resetStyles();
      this.configureShape(state);
      state.view.graph.selectionCellsHandler.updateHandler(state);
      force = true;
    }
    if (!!state.shape) {
      this.createControl(state);
      if (force || this.isShapeInvalid(state, state.shape)) {
        if (!!state.absolutePoints) {
          state.shape.points = state.absolutePoints.slice();
          state.shape.bounds = undefined;
        } else {
          state.shape.points = undefined;
          state.shape.bounds = new mxRectangle(state.x, state.y, state.width, state.height);
        }
        state.shape.scale = state.view.scale;
        if (!rendering || rendering) {
          this.doRedrawShape(state);
        } else {
          state.shape.updateBoundingBox();
        }
        shapeChanged = true;
      }
    }
    return shapeChanged;
  }

  /**
   * Function: doRedrawShape
   *
   * Invokes redraw on the shape of the given state.
   */
  doRedrawShape(state: any): void {
    state.shape.redraw();
  }

  /**
   * Function: isShapeInvalid
   *
   * Returns true if the given shape must be repainted.
   */
  isShapeInvalid(state: any, shape: any): boolean {
    return !shape.bounds || shape.scale != state.view.scale || (!state.absolutePoints && !shape.bounds.equals(state)) || (!!state.absolutePoints && !mxUtils.equalPoints(shape.points, state.absolutePoints));
  }

  /**
   * Function: destroy
   *
   * Destroys the shapes associated with the given cell state.
   *
   * Parameters:
   *
   * state - <mxCellState> for which the shapes should be destroyed.
   */
  destroy(state: any): void {
    if (!!state.shape) {
      if (!!state.text) {
        state.text.destroy();
        state.text = undefined;
      }
      if (!!state.overlays) {
        state.overlays.visit(function (id, shape) {
          shape.destroy();
        });
        state.overlays = undefined;
      }
      if (!!state.control) {
        state.control.destroy();
        state.control = undefined;
      }
      state.shape.destroy();
      state.shape = undefined;
    }
  }

  /**
   * Variable: defaultShapes
   *
   * Static array that contains the globally registered shapes which are
   * known to all instances of this class. For adding new shapes you should
   * use the static <mxCellRenderer.registerShape> function.
   */
  static defaultShapes: Object;

  /**
   * Function: registerShape
   *
   * Registers the given constructor under the specified key in this instance
   * of the renderer.
   *
   * Example:
   *
   * (code)
   * mxCellRenderer.registerShape(mxConstants.SHAPE_RECTANGLE, mxRectangleShape);
   * (end)
   *
   * Parameters:
   *
   * key - String representing the shape name.
   * shape - Constructor of the <mxShape> subclass.
   */
  static registerShape(key: string, shape: any): void {
    mxCellRenderer.defaultShapes[key] = shape;
  }
}
