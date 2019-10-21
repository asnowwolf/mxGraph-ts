/**
 * Class: mxEdgeHandler
 *
 * Graph event handler that reconnects edges and modifies control points and
 * the edge label location. Uses <mxTerminalMarker> for finding and
 * highlighting new source and target vertices. This handler is automatically
 * created in <mxGraph.createHandler> for each selected edge.
 *
 * To enable adding/removing control points, the following code can be used:
 *
 * (code)
 * mxEdgeHandler.prototype.addEnabled = true;
 * mxEdgeHandler.prototype.removeEnabled = true;
 * (end)
 *
 * Note: This experimental feature is not recommended for production use.
 *
 * Constructor: mxEdgeHandler
 *
 * Constructs an edge handler for the specified <mxCellState>.
 *
 * Parameters:
 *
 * state - <mxCellState> of the cell to be handled.
 */
import { mxCell } from '../model/mxCell';
import { mxClient } from '../mxClient';
import { mxImageShape } from '../shape/mxImageShape';
import { mxRectangleShape } from '../shape/mxRectangleShape';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxConnectionConstraint } from '../view/mxConnectionConstraint';
import { mxEdgeStyle } from '../view/mxEdgeStyle';
import { mxCellMarker } from './mxCellMarker';
import { mxConstraintHandler } from './mxConstraintHandler';
import { mxGraphHandler } from './mxGraphHandler';

export class mxEdgeHandler {
  constructor(state: any) {
    if (!!state) {
      this.state = state;
      this.init();
      this.escapeHandler = mxUtils.bind(this, function (sender, evt) {
        const dirty = !!this.index;
        this.reset();
        if (dirty) {
          this.graph.cellRenderer.redraw(this.state, false, state.view.isRendering());
        }
      });
      this.state.view.graph.addListener(mxEvent.ESCAPE, this.escapeHandler);
    }
  }

  state: any;
  escapeHandler: Function;
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph;
  /**
   * Variable: marker
   *
   * Holds the <mxTerminalMarker> which is used for highlighting terminals.
   */
  marker: any;
  /**
   * Variable: constraintHandler
   *
   * Holds the <mxConstraintHandler> used for drawing and highlighting
   * constraints.
   */
  constraintHandler: Function;
  /**
   * Variable: error
   *
   * Holds the current validation error while a connection is being changed.
   */
  error: any;
  /**
   * Variable: shape
   *
   * Holds the <mxShape> that represents the preview edge.
   */
  shape: any;
  /**
   * Variable: bends
   *
   * Holds the <mxShapes> that represent the points.
   */
  bends: any;
  /**
   * Variable: labelShape
   *
   * Holds the <mxShape> that represents the label position.
   */
  labelShape: any;
  /**
   * Variable: cloneEnabled
   *
   * Specifies if cloning by control-drag is enabled. Default is true.
   * @example true
   */
  cloneEnabled: boolean;
  /**
   * Variable: addEnabled
   *
   * Specifies if adding bends by shift-click is enabled. Default is false.
   * Note: This experimental feature is not recommended for production use.
   */
  addEnabled: boolean;
  /**
   * Variable: removeEnabled
   *
   * Specifies if removing bends by shift-click is enabled. Default is false.
   * Note: This experimental feature is not recommended for production use.
   */
  removeEnabled: boolean;
  /**
   * Variable: dblClickRemoveEnabled
   *
   * Specifies if removing bends by double click is enabled. Default is false.
   */
  dblClickRemoveEnabled: boolean;
  /**
   * Variable: mergeRemoveEnabled
   *
   * Specifies if removing bends by dropping them on other bends is enabled.
   * Default is false.
   */
  mergeRemoveEnabled: boolean;
  /**
   * Variable: straightRemoveEnabled
   *
   * Specifies if removing bends by creating straight segments should be enabled.
   * If enabled, this can be overridden by holding down the alt key while moving.
   * Default is false.
   */
  straightRemoveEnabled: boolean;
  /**
   * Variable: virtualBendsEnabled
   *
   * Specifies if virtual bends should be added in the center of each
   * segments. These bends can then be used to add new waypoints.
   * Default is false.
   */
  virtualBendsEnabled: boolean;
  /**
   * Variable: virtualBendOpacity
   *
   * Opacity to be used for virtual bends (see <virtualBendsEnabled>).
   * Default is 20.
   * @example 20
   */
  virtualBendOpacity: number;
  /**
   * Variable: parentHighlightEnabled
   *
   * Specifies if the parent should be highlighted if a child cell is selected.
   * Default is false.
   */
  parentHighlightEnabled: boolean;
  /**
   * Variable: preferHtml
   *
   * Specifies if bends should be added to the graph container. This is updated
   * in <init> based on whether the edge or one of its terminals has an HTML
   * label in the container.
   */
  preferHtml: boolean;
  /**
   * Variable: allowHandleBoundsCheck
   *
   * Specifies if the bounds of handles should be used for hit-detection in IE
   * Default is true.
   * @example true
   */
  allowHandleBoundsCheck: boolean;
  /**
   * Variable: snapToTerminals
   *
   * Specifies if waypoints should snap to the routing centers of terminals.
   * Default is false.
   */
  snapToTerminals: boolean;
  /**
   * Variable: handleImage
   *
   * Optional <mxImage> to be used as handles. Default is null.
   */
  handleImage: any;
  /**
   * Variable: tolerance
   *
   * Optional tolerance for hit-detection in <getHandleForEvent>. Default is 0.
   */
  tolerance: number;
  /**
   * Variable: outlineConnect
   *
   * Specifies if connections to the outline of a highlighted target should be
   * enabled. This will allow to place the connection point along the outline of
   * the highlighted target. Default is false.
   */
  outlineConnect: boolean;
  /**
   * Variable: manageLabelHandle
   *
   * Specifies if the label handle should be moved if it intersects with another
   * handle. Uses <checkLabelHandle> for checking and moving. Default is false.
   */
  manageLabelHandle: boolean;
  points: any[];
  abspoints: any;
  parentHighlight: any;
  virtualBends: any;
  label: mxPoint;
  customHandles: any;
  snapPoint: mxPoint;
  startX: any;
  startY: any;
  isSource: boolean;
  isTarget: boolean;
  isLabel: boolean;
  index: number;
  currentPoint: any;
  /**
   * @example true
   */
  active: boolean;

  /**
   * Function: init
   *
   * Initializes the shapes required for this edge handler.
   */
  init(): void {
    this.graph = this.state.view.graph;
    this.marker = this.createMarker();
    this.constraintHandler = new mxConstraintHandler(this.graph);
    this.points = [];
    this.abspoints = this.getSelectionPoints(this.state);
    this.shape = this.createSelectionShape(this.abspoints);
    this.shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
    this.shape.init(this.graph.getView().getOverlayPane());
    this.shape.pointerEvents = false;
    this.shape.setCursor(mxConstants.CURSOR_MOVABLE_EDGE);
    mxEvent.redirectMouseEvents(this.shape.node, this.graph, this.state);
    this.preferHtml = !!this.state.text && this.state.text.node.parentNode == this.graph.container;
    if (!this.preferHtml) {
      const sourceState = this.state.getVisibleTerminalState(true);
      if (!!sourceState) {
        this.preferHtml = !!sourceState.text && sourceState.text.node.parentNode == this.graph.container;
      }
      if (!this.preferHtml) {
        const targetState = this.state.getVisibleTerminalState(false);
        if (!!targetState) {
          this.preferHtml = !!targetState.text && targetState.text.node.parentNode == this.graph.container;
        }
      }
    }
    if (this.parentHighlightEnabled) {
      const parent = this.graph.model.getParent(this.state.cell);
      if (this.graph.model.isVertex(parent)) {
        const pstate = this.graph.view.getState(parent);
        if (!!pstate) {
          this.parentHighlight = this.createParentHighlightShape(pstate);
          this.parentHighlight.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
          this.parentHighlight.pointerEvents = false;
          this.parentHighlight.rotation = Number(pstate.style[mxConstants.STYLE_ROTATION] || '0');
          this.parentHighlight.init(this.graph.getView().getOverlayPane());
        }
      }
    }
    if (this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells || mxGraphHandler.prototype.maxCells <= 0) {
      this.bends = this.createBends();
      if (this.isVirtualBendsEnabled()) {
        this.virtualBends = this.createVirtualBends();
      }
    }
    this.label = new mxPoint(this.state.absoluteOffset.x, this.state.absoluteOffset.y);
    this.labelShape = this.createLabelHandleShape();
    this.initBend(this.labelShape);
    this.labelShape.setCursor(mxConstants.CURSOR_LABEL_HANDLE);
    this.customHandles = this.createCustomHandles();
    this.redraw();
  }

  /**
   * Function: createCustomHandles
   *
   * Returns an array of custom handles. This implementation returns null.
   */
  createCustomHandles(): any {
    return null;
  }

  /**
   * Function: isVirtualBendsEnabled
   *
   * Returns true if virtual bends should be added. This returns true if
   * <virtualBendsEnabled> is true and the current style allows and
   * renders custom waypoints.
   */
  isVirtualBendsEnabled(evt: Event): boolean {
    return this.virtualBendsEnabled && (!this.state.style[mxConstants.STYLE_EDGE] || this.state.style[mxConstants.STYLE_EDGE] == mxConstants.NONE || this.state.style[mxConstants.STYLE_NOEDGESTYLE] == 1) && mxUtils.getValue(this.state.style, mxConstants.STYLE_SHAPE, null) != 'arrow';
  }

  /**
   * Function: isAddPointEvent
   *
   * Returns true if the given event is a trigger to add a new point. This
   * implementation returns true if shift is pressed.
   */
  isAddPointEvent(evt: Event): boolean {
    return mxEvent.isShiftDown(evt);
  }

  /**
   * Function: isRemovePointEvent
   *
   * Returns true if the given event is a trigger to remove a point. This
   * implementation returns true if shift is pressed.
   */
  isRemovePointEvent(evt: Event): boolean {
    return mxEvent.isShiftDown(evt);
  }

  /**
   * Function: getSelectionPoints
   *
   * Returns the list of points that defines the selection stroke.
   */
  getSelectionPoints(state: any): any {
    return state.absolutePoints;
  }

  /**
   * Function: createSelectionShape
   *
   * Creates the shape used to draw the selection border.
   */
  createParentHighlightShape(bounds: any): any {
    const shape = new mxRectangleShape(bounds, null, this.getSelectionColor());
    shape.strokewidth = this.getSelectionStrokeWidth();
    shape.isDashed = this.isSelectionDashed();
    return shape;
  }

  /**
   * Function: createSelectionShape
   *
   * Creates the shape used to draw the selection border.
   */
  createSelectionShape(points: any): any {
    const shape = new this.state.shape.constructor();
    shape.outline = true;
    shape.apply(this.state);
    shape.isDashed = this.isSelectionDashed();
    shape.stroke = this.getSelectionColor();
    shape.isShadow = false;
    return shape;
  }

  /**
   * Function: getSelectionColor
   *
   * Returns <mxConstants.EDGE_SELECTION_COLOR>.
   */
  getSelectionColor(): string {
    return mxConstants.EDGE_SELECTION_COLOR;
  }

  /**
   * Function: getSelectionStrokeWidth
   *
   * Returns <mxConstants.EDGE_SELECTION_STROKEWIDTH>.
   */
  getSelectionStrokeWidth(): any {
    return mxConstants.EDGE_SELECTION_STROKEWIDTH;
  }

  /**
   * Function: isSelectionDashed
   *
   * Returns <mxConstants.EDGE_SELECTION_DASHED>.
   */
  isSelectionDashed(): boolean {
    return mxConstants.EDGE_SELECTION_DASHED;
  }

  /**
   * Function: isConnectableCell
   *
   * Returns true if the given cell is connectable. This is a hook to
   * disable floating connections. This implementation returns true.
   */
  isConnectableCell(cell: mxCell): boolean {
    return true;
  }

  /**
   * Function: getCellAt
   *
   * Creates and returns the <mxCellMarker> used in <marker>.
   */
  getCellAt(x: number, y: number): any {
    return (!this.outlineConnect) ? this.graph.getCellAt(x, y) : null;
  }

  /**
   * Function: createMarker
   *
   * Creates and returns the <mxCellMarker> used in <marker>.
   */
  createMarker(): any {
    const marker = new mxCellMarker(this.graph);
    const self = this;
    marker.getCell = function (me) {
      let cell = mxCellMarker.prototype.getCell.apply(this, arguments);
      if ((cell == self.state.cell || !cell) && !!self.currentPoint) {
        cell = self.graph.getCellAt(self.currentPoint.x, self.currentPoint.y);
      }
      if (!!cell && !this.graph.isCellConnectable(cell)) {
        const parent = this.graph.getModel().getParent(cell);
        if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent)) {
          cell = parent;
        }
      }
      const model = self.graph.getModel();
      if ((this.graph.isSwimlane(cell) && !!self.currentPoint && this.graph.hitsSwimlaneContent(cell, self.currentPoint.x, self.currentPoint.y)) || (!self.isConnectableCell(cell)) || (cell == self.state.cell || (!!cell && !self.graph.connectableEdges && model.isEdge(cell))) || model.isAncestor(self.state.cell, cell)) {
        cell = undefined;
      }
      if (!this.graph.isCellConnectable(cell)) {
        cell = undefined;
      }
      return cell;
    };
    marker.isValidState = function (state) {
      const model = self.graph.getModel();
      const other = self.graph.view.getTerminalPort(state, self.graph.view.getState(model.getTerminal(self.state.cell, !self.isSource)), !self.isSource);
      const otherCell = (!!other) ? other.cell : null;
      const source = (self.isSource) ? state.cell : otherCell;
      const target = (self.isSource) ? otherCell : state.cell;
      self.error = self.validateConnection(source, target);
      return !self.error;
    };
    return marker;
  }

  /**
   * Function: validateConnection
   *
   * Returns the error message or an empty string if the connection for the
   * given source, target pair is not valid. Otherwise it returns null. This
   * implementation uses <mxGraph.getEdgeValidationError>.
   *
   * Parameters:
   *
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   */
  validateConnection(source: any, target: string): any {
    return this.graph.getEdgeValidationError(this.state.cell, source, target);
  }

  /**
   * Function: createBends
   *
   * Creates and returns the bends used for modifying the edge. This is
   * typically an array of <mxRectangleShapes>.
   */
  createBends(): any {
    const cell = this.state.cell;
    const bends = [];
    for (let i = 0; i < this.abspoints.length; i++) {
      if (this.isHandleVisible(i)) {
        const source = i == 0;
        const target = i == this.abspoints.length - 1;
        const terminal = source || target;
        if (terminal || this.graph.isCellBendable(cell)) {
          (mxUtils.bind(this, function (index) {
            const bend = this.createHandleShape(index);
            this.initBend(bend, mxUtils.bind(this, mxUtils.bind(this, function () {
              if (this.dblClickRemoveEnabled) {
                this.removePoint(this.state, index);
              }
            })));
            if (this.isHandleEnabled(i)) {
              bend.setCursor((terminal) ? mxConstants.CURSOR_TERMINAL_HANDLE : mxConstants.CURSOR_BEND_HANDLE);
            }
            bends.push(bend);
            if (!terminal) {
              this.points.push(new mxPoint(0, 0));
              bend.node.style.visibility = 'hidden';
            }
          }))(i);
        }
      }
    }
    return bends;
  }

  /**
   * Function: createVirtualBends
   *
   * Creates and returns the bends used for modifying the edge. This is
   * typically an array of <mxRectangleShapes>.
   */
  createVirtualBends(): any {
    const cell = this.state.cell;
    const last = this.abspoints[0];
    const bends = [];
    if (this.graph.isCellBendable(cell)) {
      for (let i = 1; i < this.abspoints.length; i++) {
        (mxUtils.bind(this, function (bend) {
          this.initBend(bend);
          bend.setCursor(mxConstants.CURSOR_VIRTUAL_BEND_HANDLE);
          bends.push(bend);
        }))(this.createHandleShape());
      }
    }
    return bends;
  }

  /**
   * Function: isHandleEnabled
   *
   * Creates the shape used to display the given bend.
   */
  isHandleEnabled(index: number): boolean {
    return true;
  }

  /**
   * Function: isHandleVisible
   *
   * Returns true if the handle at the given index is visible.
   */
  isHandleVisible(index: number): boolean {
    const source = this.state.getVisibleTerminalState(true);
    const target = this.state.getVisibleTerminalState(false);
    const geo = this.graph.getCellGeometry(this.state.cell);
    const edgeStyle = (!!geo) ? this.graph.view.getEdgeStyle(this.state, geo.points, source, target) : null;
    return edgeStyle != mxEdgeStyle.EntityRelation || index == 0 || index == this.abspoints.length - 1;
  }

  /**
   * Function: createHandleShape
   *
   * Creates the shape used to display the given bend. Note that the index may be
   * null for special cases, such as when called from
   * <mxElbowEdgeHandler.createVirtualBend>. Only images and rectangles should be
   * returned if support for HTML labels with not foreign objects is required.
   * Index if null for virtual handles.
   */
  createHandleShape(index: number): any {
    if (!!this.handleImage) {
      const shape = new mxImageShape(new mxRectangle(0, 0, this.handleImage.width, this.handleImage.height), this.handleImage.src);
      shape.preserveImageAspect = false;
      return shape;
    } else {
      let s = mxConstants.HANDLE_SIZE;
      if (this.preferHtml) {
        s -= 1;
      }
      return new mxRectangleShape(new mxRectangle(0, 0, s, s), mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
    }
  }

  /**
   * Function: createLabelHandleShape
   *
   * Creates the shape used to display the the label handle.
   */
  createLabelHandleShape(): any {
    if (!!this.labelHandleImage) {
      const shape = new mxImageShape(new mxRectangle(0, 0, this.labelHandleImage.width, this.labelHandleImage.height), this.labelHandleImage.src);
      shape.preserveImageAspect = false;
      return shape;
    } else {
      const s = mxConstants.LABEL_HANDLE_SIZE;
      return new mxRectangleShape(new mxRectangle(0, 0, s, s), mxConstants.LABEL_HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
    }
  }

  /**
   * Function: initBend
   *
   * Helper method to initialize the given bend.
   *
   * Parameters:
   *
   * bend - <mxShape> that represents the bend to be initialized.
   */
  initBend(bend: any, dblClick: any): any {
    if (this.preferHtml) {
      bend.dialect = mxConstants.DIALECT_STRICTHTML;
      bend.init(this.graph.container);
    } else {
      bend.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
      bend.init(this.graph.getView().getOverlayPane());
    }
    mxEvent.redirectMouseEvents(bend.node, this.graph, this.state, null, null, null, dblClick);
    if (mxClient.IS_QUIRKS || document.documentMode == 8) {
      mxEvent.addListener(bend.node, 'dragstart', function (evt) {
        mxEvent.consume(evt);
        return false;
      });
    }
    if (mxClient.IS_TOUCH) {
      bend.node.setAttribute('pointer-events', 'none');
    }
  }

  /**
   * Function: getHandleForEvent
   *
   * Returns the index of the handle for the given event.
   */
  getHandleForEvent(me: any): any {
    const tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 1;
    const hit = (this.allowHandleBoundsCheck && (mxClient.IS_IE || tol > 0)) ? new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
    let minDistSq = undefined;
    let result = undefined;

    function checkShape(shape) {
      if (!!shape && shape.node.style.display != 'none' && shape.node.style.visibility != 'hidden' && (me.isSource(shape) || (!!hit && mxUtils.intersects(shape.bounds, hit)))) {
        const dx = me.getGraphX() - shape.bounds.getCenterX();
        const dy = me.getGraphY() - shape.bounds.getCenterY();
        const tmp = dx * dx + dy * dy;
        if (!minDistSq || tmp <= minDistSq) {
          minDistSq = tmp;
          return true;
        }
      }
      return false;
    }

    if (!!this.customHandles && this.isCustomHandleEvent(me)) {
      for (let i = this.customHandles.length - 1; i >= 0; i--) {
        if (checkShape(this.customHandles[i].shape)) {
          return mxEvent.CUSTOM_HANDLE - i;
        }
      }
    }
    if (me.isSource(this.state.text) || checkShape(this.labelShape)) {
      result = mxEvent.LABEL_HANDLE;
    }
    if (!!this.bends) {
      for (let i = 0; i < this.bends.length; i++) {
        if (checkShape(this.bends[i])) {
          result = i;
        }
      }
    }
    if (!!this.virtualBends && this.isAddVirtualBendEvent(me)) {
      for (let i = 0; i < this.virtualBends.length; i++) {
        if (checkShape(this.virtualBends[i])) {
          result = mxEvent.VIRTUAL_HANDLE - i;
        }
      }
    }
    return result;
  }

  /**
   * Function: isAddVirtualBendEvent
   *
   * Returns true if the given event allows virtual bends to be added. This
   * implementation returns true.
   */
  isAddVirtualBendEvent(me: any): boolean {
    return true;
  }

  /**
   * Function: isCustomHandleEvent
   *
   * Returns true if the given event allows custom handles to be changed. This
   * implementation returns true.
   */
  isCustomHandleEvent(me: any): boolean {
    return true;
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by checking if a special element of the handler
   * was clicked, in which case the index parameter is non-null. The
   * indices may be one of <LABEL_HANDLE> or the number of the respective
   * control point. The source and target points are used for reconnecting
   * the edge.
   */
  mouseDown(sender: any, me: any): void {
    const handle = this.getHandleForEvent(me);
    if (!!this.bends && this.bends[handle]) {
      const b = this.bends[handle].bounds;
      this.snapPoint = new mxPoint(b.getCenterX(), b.getCenterY());
    }
    if (this.addEnabled && !handle && this.isAddPointEvent(me.getEvent())) {
      this.addPoint(this.state, me.getEvent());
      me.consume();
    } else if (!!handle && !me.isConsumed() && this.graph.isEnabled()) {
      if (this.removeEnabled && this.isRemovePointEvent(me.getEvent())) {
        this.removePoint(this.state, handle);
      } else if (handle != mxEvent.LABEL_HANDLE || this.graph.isLabelMovable(me.getCell())) {
        if (handle <= mxEvent.VIRTUAL_HANDLE) {
          mxUtils.setOpacity(this.virtualBends[mxEvent.VIRTUAL_HANDLE - handle].node, 100);
        }
        this.start(me.getX(), me.getY(), handle);
      }
      me.consume();
    }
  }

  /**
   * Function: start
   *
   * Starts the handling of the mouse gesture.
   */
  start(x: number, y: number, index: number): void {
    this.startX = x;
    this.startY = y;
    this.isSource = (!this.bends) ? false : index == 0;
    this.isTarget = (!this.bends) ? false : index == this.bends.length - 1;
    this.isLabel = index == mxEvent.LABEL_HANDLE;
    if (this.isSource || this.isTarget) {
      const cell = this.state.cell;
      const terminal = this.graph.model.getTerminal(cell, this.isSource);
      if ((!terminal && this.graph.isTerminalPointMovable(cell, this.isSource)) || (!!terminal && this.graph.isCellDisconnectable(cell, terminal, this.isSource))) {
        this.index = index;
      }
    } else {
      this.index = index;
    }
    if (this.index <= mxEvent.CUSTOM_HANDLE && this.index > mxEvent.VIRTUAL_HANDLE) {
      if (!!this.customHandles) {
        for (let i = 0; i < this.customHandles.length; i++) {
          if (i != mxEvent.CUSTOM_HANDLE - this.index) {
            this.customHandles[i].setVisible(false);
          }
        }
      }
    }
  }

  /**
   * Function: clonePreviewState
   *
   * Returns a clone of the current preview state for the given point and terminal.
   */
  clonePreviewState(point: any, terminal: any): any {
    return this.state.clone();
  }

  /**
   * Function: getSnapToTerminalTolerance
   *
   * Returns the tolerance for the guides. Default value is
   * gridSize * scale / 2.
   */
  getSnapToTerminalTolerance(): any {
    return this.graph.gridSize * this.graph.view.scale / 2;
  }

  /**
   * Function: updateHint
   *
   * Hook for subclassers do show details while the handler is active.
   */
  updateHint(me: any, point: any): void {
  }

  /**
   * Function: removeHint
   *
   * Hooks for subclassers to hide details when the handler gets inactive.
   */
  removeHint(): void {
  }

  /**
   * Function: roundLength
   *
   * Hook for rounding the unscaled width or height. This uses Math.round.
   */
  roundLength(length: number): any {
    return Math.round(length);
  }

  /**
   * Function: isSnapToTerminalsEvent
   *
   * Returns true if <snapToTerminals> is true and if alt is not pressed.
   */
  isSnapToTerminalsEvent(me: any): boolean {
    return this.snapToTerminals && !mxEvent.isAltDown(me.getEvent());
  }

  /**
   * Function: getPointForEvent
   *
   * Returns the point for the given event.
   */
  getPointForEvent(me: any): any {
    const view = this.graph.getView();
    const scale = view.scale;
    const point = new mxPoint(this.roundLength(me.getGraphX() / scale) * scale, this.roundLength(me.getGraphY() / scale) * scale);
    const tt = this.getSnapToTerminalTolerance();
    let overrideX = false;
    let overrideY = false;
    if (tt > 0 && this.isSnapToTerminalsEvent(me)) {
      function snapToPoint(pt) {
        if (!!pt) {
          const x = pt.x;
          if (Math.abs(point.x - x) < tt) {
            point.x = x;
            overrideX = true;
          }
          const y = pt.y;
          if (Math.abs(point.y - y) < tt) {
            point.y = y;
            overrideY = true;
          }
        }
      }

      function snapToTerminal(terminal) {
        if (!!terminal) {
          snapToPoint.call(this, new mxPoint(view.getRoutingCenterX(terminal), view.getRoutingCenterY(terminal)));
        }
      }

      snapToTerminal.call(this, this.state.getVisibleTerminalState(true));
      snapToTerminal.call(this, this.state.getVisibleTerminalState(false));
      if (!!this.state.absolutePoints) {
        for (let i = 0; i < this.state.absolutePoints.length; i++) {
          snapToPoint.call(this, this.state.absolutePoints[i]);
        }
      }
    }
    if (this.graph.isGridEnabledEvent(me.getEvent())) {
      const tr = view.translate;
      if (!overrideX) {
        point.x = (this.graph.snap(point.x / scale - tr.x) + tr.x) * scale;
      }
      if (!overrideY) {
        point.y = (this.graph.snap(point.y / scale - tr.y) + tr.y) * scale;
      }
    }
    return point;
  }

  /**
   * Function: getPreviewTerminalState
   *
   * Updates the given preview state taking into account the state of the constraint handler.
   */
  getPreviewTerminalState(me: any): any {
    this.constraintHandler.update(me, this.isSource, true, me.isSource(this.marker.highlight.shape) ? null : this.currentPoint);
    if (!!this.constraintHandler.currentFocus && !!this.constraintHandler.currentConstraint) {
      if (!!this.marker.highlight && !!this.marker.highlight.state && this.marker.highlight.state.cell == this.constraintHandler.currentFocus.cell) {
        if (this.marker.highlight.shape.stroke != 'transparent') {
          this.marker.highlight.shape.stroke = 'transparent';
          this.marker.highlight.repaint();
        }
      } else {
        this.marker.markCell(this.constraintHandler.currentFocus.cell, 'transparent');
      }
      const model = this.graph.getModel();
      const other = this.graph.view.getTerminalPort(this.state, this.graph.view.getState(model.getTerminal(this.state.cell, !this.isSource)), !this.isSource);
      const otherCell = (!!other) ? other.cell : null;
      const source = (this.isSource) ? this.constraintHandler.currentFocus.cell : otherCell;
      const target = (this.isSource) ? otherCell : this.constraintHandler.currentFocus.cell;
      this.error = this.validateConnection(source, target);
      let result = undefined;
      if (!this.error) {
        result = this.constraintHandler.currentFocus;
      } else {
        this.constraintHandler.reset();
      }
      return result;
    } else if (!this.graph.isIgnoreTerminalEvent(me.getEvent())) {
      this.marker.process(me);
      const state = this.marker.getValidState();
      if (!!state && this.graph.isCellLocked(state.cell)) {
        this.marker.reset();
      }
      return this.marker.getValidState();
    } else {
      this.marker.reset();
      return null;
    }
  }

  /**
   * Function: getPreviewPoints
   *
   * Updates the given preview state taking into account the state of the constraint handler.
   *
   * Parameters:
   *
   * pt - <mxPoint> that contains the current pointer position.
   * me - Optional <mxMouseEvent> that contains the current event.
   */
  getPreviewPoints(pt: any, me: any): any {
    const geometry = this.graph.getCellGeometry(this.state.cell);
    let points = (!!geometry.points) ? geometry.points.slice() : null;
    const point = new mxPoint(pt.x, pt.y);
    let result = undefined;
    if (!this.isSource && !this.isTarget) {
      this.convertPoint(point, false);
      if (!points) {
        points = [point];
      } else {
        if (this.index <= mxEvent.VIRTUAL_HANDLE) {
          points.splice(mxEvent.VIRTUAL_HANDLE - this.index, 0, point);
        }
        if (!this.isSource && !this.isTarget) {
          for (let i = 0; i < this.bends.length; i++) {
            if (i != this.index) {
              const bend = this.bends[i];
              if (!!bend && mxUtils.contains(bend.bounds, pt.x, pt.y)) {
                if (this.index <= mxEvent.VIRTUAL_HANDLE) {
                  points.splice(mxEvent.VIRTUAL_HANDLE - this.index, 1);
                } else {
                  points.splice(this.index - 1, 1);
                }
                result = points;
              }
            }
          }
          if (!result && this.straightRemoveEnabled && (!me || !mxEvent.isAltDown(me.getEvent()))) {
            const tol = this.graph.tolerance * this.graph.tolerance;
            const abs = this.state.absolutePoints.slice();
            abs[this.index] = pt;
            const src = this.state.getVisibleTerminalState(true);
            if (!!src) {
              const c = this.graph.getConnectionConstraint(this.state, src, true);
              if (!c || !this.graph.getConnectionPoint(src, c)) {
                abs[0] = new mxPoint(src.view.getRoutingCenterX(src), src.view.getRoutingCenterY(src));
              }
            }
            const trg = this.state.getVisibleTerminalState(false);
            if (!!trg) {
              const c = this.graph.getConnectionConstraint(this.state, trg, false);
              if (!c || !this.graph.getConnectionPoint(trg, c)) {
                abs[abs.length - 1] = new mxPoint(trg.view.getRoutingCenterX(trg), trg.view.getRoutingCenterY(trg));
              }
            }

            function checkRemove(idx, tmp) {
              if (idx > 0 && idx < abs.length - 1 && mxUtils.ptSegDistSq(abs[idx - 1].x, abs[idx - 1].y, abs[idx + 1].x, abs[idx + 1].y, tmp.x, tmp.y) < tol) {
                points.splice(idx - 1, 1);
                result = points;
              }
            }

            checkRemove(this.index, pt);
          }
        }
        if (!result && this.index > mxEvent.VIRTUAL_HANDLE) {
          points[this.index - 1] = point;
        }
      }
    } else if (this.graph.resetEdgesOnConnect) {
      points = undefined;
    }
    return (!!result) ? result : points;
  }

  /**
   * Function: isOutlineConnectEvent
   *
   * Returns true if <outlineConnect> is true and the source of the event is the outline shape
   * or shift is pressed.
   */
  isOutlineConnectEvent(me: any): boolean {
    const offset = mxUtils.getOffset(this.graph.container);
    const evt = me.getEvent();
    const clientX = mxEvent.getClientX(evt);
    const clientY = mxEvent.getClientY(evt);
    const doc = document.documentElement;
    const left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    const gridX = this.currentPoint.x - this.graph.container.scrollLeft + offset.x - left;
    const gridY = this.currentPoint.y - this.graph.container.scrollTop + offset.y - top;
    return this.outlineConnect && !mxEvent.isShiftDown(me.getEvent()) && (me.isSource(this.marker.highlight.shape) || (mxEvent.isAltDown(me.getEvent()) && me.getState()) || this.marker.highlight.isHighlightAt(clientX, clientY) || ((gridX != clientX || gridY != clientY) && !me.getState() && this.marker.highlight.isHighlightAt(gridX, gridY)));
  }

  /**
   * Function: updatePreviewState
   *
   * Updates the given preview state taking into account the state of the constraint handler.
   */
  updatePreviewState(edge: any, point: any, terminalState: any, me: any, outline: any): void {
    const sourceState = (this.isSource) ? terminalState : this.state.getVisibleTerminalState(true);
    const targetState = (this.isTarget) ? terminalState : this.state.getVisibleTerminalState(false);
    let sourceConstraint = this.graph.getConnectionConstraint(edge, sourceState, true);
    let targetConstraint = this.graph.getConnectionConstraint(edge, targetState, false);
    let constraint = this.constraintHandler.currentConstraint;
    if (!constraint && outline) {
      if (!!terminalState) {
        if (me.isSource(this.marker.highlight.shape)) {
          point = new mxPoint(me.getGraphX(), me.getGraphY());
        }
        constraint = this.graph.getOutlineConstraint(point, terminalState, me);
        this.constraintHandler.setFocus(me, terminalState, this.isSource);
        this.constraintHandler.currentConstraint = constraint;
        this.constraintHandler.currentPoint = point;
      } else {
        constraint = new mxConnectionConstraint();
      }
    }
    if (this.outlineConnect && !!this.marker.highlight && !!this.marker.highlight.shape) {
      const s = this.graph.view.scale;
      if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus) {
        this.marker.highlight.shape.stroke = (outline) ? mxConstants.OUTLINE_HIGHLIGHT_COLOR : 'transparent';
        this.marker.highlight.shape.strokewidth = mxConstants.OUTLINE_HIGHLIGHT_STROKEWIDTH / s / s;
        this.marker.highlight.repaint();
      } else if (this.marker.hasValidState()) {
        this.marker.highlight.shape.stroke = (this.marker.getValidState() == me.getState()) ? mxConstants.DEFAULT_VALID_COLOR : 'transparent';
        this.marker.highlight.shape.strokewidth = mxConstants.HIGHLIGHT_STROKEWIDTH / s / s;
        this.marker.highlight.repaint();
      }
    }
    if (this.isSource) {
      sourceConstraint = constraint;
    } else if (this.isTarget) {
      targetConstraint = constraint;
    }
    if (this.isSource || this.isTarget) {
      if (!!constraint && !!constraint.point) {
        edge.style[(this.isSource) ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X] = constraint.point.x;
        edge.style[(this.isSource) ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y] = constraint.point.y;
      } else {
        delete edge.style[(this.isSource) ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X];
        delete edge.style[(this.isSource) ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y];
      }
    }
    edge.setVisibleTerminalState(sourceState, true);
    edge.setVisibleTerminalState(targetState, false);
    if (!this.isSource || !!sourceState) {
      edge.view.updateFixedTerminalPoint(edge, sourceState, true, sourceConstraint);
    }
    if (!this.isTarget || !!targetState) {
      edge.view.updateFixedTerminalPoint(edge, targetState, false, targetConstraint);
    }
    if ((this.isSource || this.isTarget) && !terminalState) {
      edge.setAbsoluteTerminalPoint(point, this.isSource);
      if (!this.marker.getMarkedState()) {
        this.error = (this.graph.allowDanglingEdges) ? null : '';
      }
    }
    edge.view.updatePoints(edge, this.points, sourceState, targetState);
    edge.view.updateFloatingTerminalPoints(edge, sourceState, targetState);
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating the preview.
   */
  mouseMove(sender: any, me: any): void {
    if (!!this.index && !!this.marker) {
      this.currentPoint = this.getPointForEvent(me);
      this.error = undefined;
      if (!this.graph.isIgnoreTerminalEvent(me.getEvent()) && mxEvent.isShiftDown(me.getEvent()) && !!this.snapPoint) {
        if (Math.abs(this.snapPoint.x - this.currentPoint.x) < Math.abs(this.snapPoint.y - this.currentPoint.y)) {
          this.currentPoint.x = this.snapPoint.x;
        } else {
          this.currentPoint.y = this.snapPoint.y;
        }
      }
      if (this.index <= mxEvent.CUSTOM_HANDLE && this.index > mxEvent.VIRTUAL_HANDLE) {
        if (!!this.customHandles) {
          this.customHandles[mxEvent.CUSTOM_HANDLE - this.index].processEvent(me);
        }
      } else if (this.isLabel) {
        this.label.x = this.currentPoint.x;
        this.label.y = this.currentPoint.y;
      } else {
        this.points = this.getPreviewPoints(this.currentPoint, me);
        let terminalState = (this.isSource || this.isTarget) ? this.getPreviewTerminalState(me) : null;
        if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus && !!this.constraintHandler.currentPoint) {
          this.currentPoint = this.constraintHandler.currentPoint.clone();
        } else if (this.outlineConnect) {
          const outline = (this.isSource || this.isTarget) ? this.isOutlineConnectEvent(me) : false;
          if (outline) {
            terminalState = this.marker.highlight.state;
          } else if (!!terminalState && terminalState != me.getState() && !!this.marker.highlight.shape) {
            this.marker.highlight.shape.stroke = 'transparent';
            this.marker.highlight.repaint();
            terminalState = undefined;
          }
        }
        if (!!terminalState && this.graph.isCellLocked(terminalState.cell)) {
          terminalState = undefined;
          this.marker.reset();
        }
        const clone = this.clonePreviewState(this.currentPoint, (!!terminalState) ? terminalState.cell : null);
        this.updatePreviewState(clone, this.currentPoint, terminalState, me, outline);
        const color = (!this.error) ? this.marker.validColor : this.marker.invalidColor;
        this.setPreviewColor(color);
        this.abspoints = clone.absolutePoints;
        this.active = true;
      }
      this.updateHint(me, this.currentPoint);
      this.drawPreview();
      mxEvent.consume(me.getEvent());
      me.consume();
    } else if (mxClient.IS_IE && this.getHandleForEvent(me)) {
      me.consume(false);
    }
  }

  /**
   * Function: mouseUp
   *
   * Handles the event to applying the previewed changes on the edge by
   * using <moveLabel>, <connect> or <changePoints>.
   */
  mouseUp(sender: any, me: any): void {
    if (!!this.index && !!this.marker) {
      let edge = this.state.cell;
      const index = this.index;
      this.index = undefined;
      if (me.getX() != this.startX || me.getY() != this.startY) {
        const clone = !this.graph.isIgnoreTerminalEvent(me.getEvent()) && this.graph.isCloneEvent(me.getEvent()) && this.cloneEnabled && this.graph.isCellsCloneable();
        if (!!this.error) {
          if (this.error.length > 0) {
            this.graph.validationAlert(this.error);
          }
        } else if (index <= mxEvent.CUSTOM_HANDLE && index > mxEvent.VIRTUAL_HANDLE) {
          if (!!this.customHandles) {
            const model = this.graph.getModel();
            model.beginUpdate();
            try {
              this.customHandles[mxEvent.CUSTOM_HANDLE - index].execute();
            } finally {
              model.endUpdate();
            }
          }
        } else if (this.isLabel) {
          this.moveLabel(this.state, this.label.x, this.label.y);
        } else if (this.isSource || this.isTarget) {
          let terminal = undefined;
          if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus) {
            terminal = this.constraintHandler.currentFocus.cell;
          }
          if (!terminal && this.marker.hasValidState() && !!this.marker.highlight && !!this.marker.highlight.shape && this.marker.highlight.shape.stroke != 'transparent' && this.marker.highlight.shape.stroke != 'white') {
            terminal = this.marker.validState.cell;
          }
          if (!!terminal) {
            const model = this.graph.getModel();
            const parent = model.getParent(edge);
            model.beginUpdate();
            try {
              if (clone) {
                let geo = model.getGeometry(edge);
                const clone = this.graph.cloneCell(edge);
                model.add(parent, clone, model.getChildCount(parent));
                if (!!geo) {
                  geo = geo.clone();
                  model.setGeometry(clone, geo);
                }
                const other = model.getTerminal(edge, !this.isSource);
                this.graph.connectCell(clone, other, !this.isSource);
                edge = clone;
              }
              edge = this.connect(edge, terminal, this.isSource, clone, me);
            } finally {
              model.endUpdate();
            }
          } else if (this.graph.isAllowDanglingEdges()) {
            const pt = this.abspoints[(this.isSource) ? 0 : this.abspoints.length - 1];
            pt.x = this.roundLength(pt.x / this.graph.view.scale - this.graph.view.translate.x);
            pt.y = this.roundLength(pt.y / this.graph.view.scale - this.graph.view.translate.y);
            const pstate = this.graph.getView().getState(this.graph.getModel().getParent(edge));
            if (!!pstate) {
              pt.x -= pstate.origin.x;
              pt.y -= pstate.origin.y;
            }
            pt.x -= this.graph.panDx / this.graph.view.scale;
            pt.y -= this.graph.panDy / this.graph.view.scale;
            edge = this.changeTerminalPoint(edge, pt, this.isSource, clone);
          }
        } else if (this.active) {
          edge = this.changePoints(edge, this.points, clone);
        } else {
          this.graph.getView().invalidate(this.state.cell);
          this.graph.getView().validate(this.state.cell);
        }
      }
      if (!!this.marker) {
        this.reset();
        if (edge != this.state.cell) {
          this.graph.setSelectionCell(edge);
        }
      }
      me.consume();
    }
  }

  /**
   * Function: reset
   *
   * Resets the state of this handler.
   */
  reset(): void {
    if (this.active) {
      this.refresh();
    }
    this.error = undefined;
    this.index = undefined;
    this.label = undefined;
    this.points = undefined;
    this.snapPoint = undefined;
    this.isLabel = false;
    this.isSource = false;
    this.isTarget = false;
    this.active = false;
    if (this.livePreview && !!this.sizers) {
      for (let i = 0; i < this.sizers.length; i++) {
        if (this.sizers[i]) {
          this.sizers[i].node.style.display = '';
        }
      }
    }
    if (!!this.marker) {
      this.marker.reset();
    }
    if (!!this.constraintHandler) {
      this.constraintHandler.reset();
    }
    if (!!this.customHandles) {
      for (let i = 0; i < this.customHandles.length; i++) {
        this.customHandles[i].reset();
      }
    }
    this.setPreviewColor(mxConstants.EDGE_SELECTION_COLOR);
    this.removeHint();
    this.redraw();
  }

  /**
   * Function: setPreviewColor
   *
   * Sets the color of the preview to the given value.
   */
  setPreviewColor(color: string): void {
    if (!!this.shape) {
      this.shape.stroke = color;
    }
  }

  /**
   * Function: convertPoint
   *
   * Converts the given point in-place from screen to unscaled, untranslated
   * graph coordinates and applies the grid. Returns the given, modified
   * point instance.
   *
   * Parameters:
   *
   * point - <mxPoint> to be converted.
   * gridEnabled - Boolean that specifies if the grid should be applied.
   */
  convertPoint(point: any, gridEnabled: any): any {
    const scale = this.graph.getView().getScale();
    const tr = this.graph.getView().getTranslate();
    if (gridEnabled) {
      point.x = this.graph.snap(point.x);
      point.y = this.graph.snap(point.y);
    }
    point.x = Math.round(point.x / scale - tr.x);
    point.y = Math.round(point.y / scale - tr.y);
    const pstate = this.graph.getView().getState(this.graph.getModel().getParent(this.state.cell));
    if (!!pstate) {
      point.x -= pstate.origin.x;
      point.y -= pstate.origin.y;
    }
    return point;
  }

  /**
   * Function: moveLabel
   *
   * Changes the coordinates for the label of the given edge.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge.
   * x - Integer that specifies the x-coordinate of the new location.
   * y - Integer that specifies the y-coordinate of the new location.
   */
  moveLabel(edgeState: any, x: number, y: number): void {
    const model = this.graph.getModel();
    let geometry = model.getGeometry(edgeState.cell);
    if (!!geometry) {
      const scale = this.graph.getView().scale;
      geometry = geometry.clone();
      if (geometry.relative) {
        let pt = this.graph.getView().getRelativePoint(edgeState, x, y);
        geometry.x = Math.round(pt.x * 10000) / 10000;
        geometry.y = Math.round(pt.y);
        geometry.offset = new mxPoint(0, 0);
        const pt = this.graph.view.getPoint(edgeState, geometry);
        geometry.offset = new mxPoint(Math.round((x - pt.x) / scale), Math.round((y - pt.y) / scale));
      } else {
        const points = edgeState.absolutePoints;
        const p0 = points[0];
        const pe = points[points.length - 1];
        if (!!p0 && !!pe) {
          const cx = p0.x + (pe.x - p0.x) / 2;
          const cy = p0.y + (pe.y - p0.y) / 2;
          geometry.offset = new mxPoint(Math.round((x - cx) / scale), Math.round((y - cy) / scale));
          geometry.x = 0;
          geometry.y = 0;
        }
      }
      model.setGeometry(edgeState.cell, geometry);
    }
  }

  /**
   * Function: connect
   *
   * Changes the terminal or terminal point of the given edge in the graph
   * model.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge to be reconnected.
   * terminal - <mxCell> that represents the new terminal.
   * isSource - Boolean indicating if the new terminal is the source or
   * target terminal.
   * isClone - Boolean indicating if the new connection should be a clone of
   * the old edge.
   * me - <mxMouseEvent> that contains the mouse up event.
   */
  connect(edge: any, terminal: any, isSource: boolean, isClone: boolean, me: any): any {
    const model = this.graph.getModel();
    const parent = model.getParent(edge);
    model.beginUpdate();
    try {
      let constraint = this.constraintHandler.currentConstraint;
      if (!constraint) {
        constraint = new mxConnectionConstraint();
      }
      this.graph.connectCell(edge, terminal, isSource, constraint);
    } finally {
      model.endUpdate();
    }
    return edge;
  }

  /**
   * Function: changeTerminalPoint
   *
   * Changes the terminal point of the given edge.
   */
  changeTerminalPoint(edge: any, point: any, isSource: boolean, clone: boolean): any {
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      if (clone) {
        const parent = model.getParent(edge);
        const terminal = model.getTerminal(edge, !isSource);
        edge = this.graph.cloneCell(edge);
        model.add(parent, edge, model.getChildCount(parent));
        model.setTerminal(edge, terminal, !isSource);
      }
      let geo = model.getGeometry(edge);
      if (!!geo) {
        geo = geo.clone();
        geo.setTerminalPoint(point, isSource);
        model.setGeometry(edge, geo);
        this.graph.connectCell(edge, null, isSource, new mxConnectionConstraint());
      }
    } finally {
      model.endUpdate();
    }
    return edge;
  }

  /**
   * Function: changePoints
   *
   * Changes the control points of the given edge in the graph model.
   */
  changePoints(edge: any, points: any, clone: boolean): any {
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      if (clone) {
        const parent = model.getParent(edge);
        const source = model.getTerminal(edge, true);
        const target = model.getTerminal(edge, false);
        edge = this.graph.cloneCell(edge);
        model.add(parent, edge, model.getChildCount(parent));
        model.setTerminal(edge, source, true);
        model.setTerminal(edge, target, false);
      }
      let geo = model.getGeometry(edge);
      if (!!geo) {
        geo = geo.clone();
        geo.points = points;
        model.setGeometry(edge, geo);
      }
    } finally {
      model.endUpdate();
    }
    return edge;
  }

  /**
   * Function: addPoint
   *
   * Adds a control point for the given state and event.
   */
  addPoint(state: any, evt: Event): void {
    const pt = mxUtils.convertPoint(this.graph.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
    const gridEnabled = this.graph.isGridEnabledEvent(evt);
    this.convertPoint(pt, gridEnabled);
    this.addPointAt(state, pt.x, pt.y);
    mxEvent.consume(evt);
  }

  /**
   * Function: addPointAt
   *
   * Adds a control point at the given point.
   */
  addPointAt(state: any, x: number, y: number): void {
    let geo = this.graph.getCellGeometry(state.cell);
    const pt = new mxPoint(x, y);
    if (!!geo) {
      geo = geo.clone();
      const t = this.graph.view.translate;
      const s = this.graph.view.scale;
      let offset = new mxPoint(t.x * s, t.y * s);
      const parent = this.graph.model.getParent(this.state.cell);
      if (this.graph.model.isVertex(parent)) {
        const pState = this.graph.view.getState(parent);
        offset = new mxPoint(pState.x, pState.y);
      }
      const index = mxUtils.findNearestSegment(state, pt.x * s + offset.x, pt.y * s + offset.y);
      if (!geo.points) {
        geo.points = [pt];
      } else {
        geo.points.splice(index, 0, pt);
      }
      this.graph.getModel().setGeometry(state.cell, geo);
      this.refresh();
      this.redraw();
    }
  }

  /**
   * Function: removePoint
   *
   * Removes the control point at the given index from the given state.
   */
  removePoint(state: any, index: number): void {
    if (index > 0 && index < this.abspoints.length - 1) {
      let geo = this.graph.getCellGeometry(this.state.cell);
      if (!!geo && !!geo.points) {
        geo = geo.clone();
        geo.points.splice(index - 1, 1);
        this.graph.getModel().setGeometry(state.cell, geo);
        this.refresh();
        this.redraw();
      }
    }
  }

  /**
   * Function: getHandleFillColor
   *
   * Returns the fillcolor for the handle at the given index.
   */
  getHandleFillColor(index: number): string {
    const isSource = index == 0;
    const cell = this.state.cell;
    const terminal = this.graph.getModel().getTerminal(cell, isSource);
    let color = mxConstants.HANDLE_FILLCOLOR;
    if ((!!terminal && !this.graph.isCellDisconnectable(cell, terminal, isSource)) || (!terminal && !this.graph.isTerminalPointMovable(cell, isSource))) {
      color = mxConstants.LOCKED_HANDLE_FILLCOLOR;
    } else if (!!terminal && this.graph.isCellDisconnectable(cell, terminal, isSource)) {
      color = mxConstants.CONNECT_HANDLE_FILLCOLOR;
    }
    return color;
  }

  /**
   * Function: redraw
   *
   * Redraws the preview, and the bends- and label control points.
   */
  redraw(): void {
    this.abspoints = this.state.absolutePoints.slice();
    this.redrawHandles();
    const g = this.graph.getModel().getGeometry(this.state.cell);
    const pts = g.points;
    if (!!this.bends && this.bends.length > 0) {
      if (!!pts) {
        if (!this.points) {
          this.points = [];
        }
        for (let i = 1; i < this.bends.length - 1; i++) {
          if (this.bends[i] && this.abspoints[i]) {
            this.points[i - 1] = pts[i - 1];
          }
        }
      }
    }
    this.drawPreview();
  }

  /**
   * Function: redrawHandles
   *
   * Redraws the handles.
   */
  redrawHandles(): void {
    const cell = this.state.cell;
    let b = this.labelShape.bounds;
    this.label = new mxPoint(this.state.absoluteOffset.x, this.state.absoluteOffset.y);
    this.labelShape.bounds = new mxRectangle(Math.round(this.label.x - b.width / 2), Math.round(this.label.y - b.height / 2), b.width, b.height);
    const lab = this.graph.getLabel(cell);
    this.labelShape.visible = (!!lab && lab.length > 0 && this.graph.isLabelMovable(cell));
    if (!!this.bends && this.bends.length > 0) {
      const n = this.abspoints.length - 1;
      const p0 = this.abspoints[0];
      const x0 = p0.x;
      const y0 = p0.y;
      b = this.bends[0].bounds;
      this.bends[0].bounds = new mxRectangle(Math.floor(x0 - b.width / 2), Math.floor(y0 - b.height / 2), b.width, b.height);
      this.bends[0].fill = this.getHandleFillColor(0);
      this.bends[0].redraw();
      if (this.manageLabelHandle) {
        this.checkLabelHandle(this.bends[0].bounds);
      }
      const pe = this.abspoints[n];
      const xn = pe.x;
      const yn = pe.y;
      const bn = this.bends.length - 1;
      b = this.bends[bn].bounds;
      this.bends[bn].bounds = new mxRectangle(Math.floor(xn - b.width / 2), Math.floor(yn - b.height / 2), b.width, b.height);
      this.bends[bn].fill = this.getHandleFillColor(bn);
      this.bends[bn].redraw();
      if (this.manageLabelHandle) {
        this.checkLabelHandle(this.bends[bn].bounds);
      }
      this.redrawInnerBends(p0, pe);
    }
    if (!!this.abspoints && !!this.virtualBends && this.virtualBends.length > 0) {
      let last = this.abspoints[0];
      for (let i = 0; i < this.virtualBends.length; i++) {
        if (this.virtualBends[i] && this.abspoints[i + 1]) {
          const pt = this.abspoints[i + 1];
          const b = this.virtualBends[i];
          const x = last.x + (pt.x - last.x) / 2;
          const y = last.y + (pt.y - last.y) / 2;
          b.bounds = new mxRectangle(Math.floor(x - b.bounds.width / 2), Math.floor(y - b.bounds.height / 2), b.bounds.width, b.bounds.height);
          b.redraw();
          mxUtils.setOpacity(b.node, this.virtualBendOpacity);
          last = pt;
          if (this.manageLabelHandle) {
            this.checkLabelHandle(b.bounds);
          }
        }
      }
    }
    if (!!this.labelShape) {
      this.labelShape.redraw();
    }
    if (!!this.customHandles) {
      for (let i = 0; i < this.customHandles.length; i++) {
        this.customHandles[i].redraw();
      }
    }
  }

  /**
   * Function: hideHandles
   *
   * Shortcut to <hideSizers>.
   */
  setHandlesVisible(visible: any): void {
    if (!!this.bends) {
      for (let i = 0; i < this.bends.length; i++) {
        this.bends[i].node.style.display = (visible) ? '' : 'none';
      }
    }
    if (!!this.virtualBends) {
      for (let i = 0; i < this.virtualBends.length; i++) {
        this.virtualBends[i].node.style.display = (visible) ? '' : 'none';
      }
    }
    if (!!this.labelShape) {
      this.labelShape.node.style.display = (visible) ? '' : 'none';
    }
    if (!!this.customHandles) {
      for (let i = 0; i < this.customHandles.length; i++) {
        this.customHandles[i].setVisible(visible);
      }
    }
  }

  /**
   * Function: redrawInnerBends
   *
   * Updates and redraws the inner bends.
   *
   * Parameters:
   *
   * p0 - <mxPoint> that represents the location of the first point.
   * pe - <mxPoint> that represents the location of the last point.
   */
  redrawInnerBends(p0: any, pe: any): void {
    for (let i = 1; i < this.bends.length - 1; i++) {
      if (this.bends[i]) {
        if (this.abspoints[i]) {
          const x = this.abspoints[i].x;
          const y = this.abspoints[i].y;
          const b = this.bends[i].bounds;
          this.bends[i].node.style.visibility = 'visible';
          this.bends[i].bounds = new mxRectangle(Math.round(x - b.width / 2), Math.round(y - b.height / 2), b.width, b.height);
          if (this.manageLabelHandle) {
            this.checkLabelHandle(this.bends[i].bounds);
          } else if (!this.handleImage && this.labelShape.visible && mxUtils.intersects(this.bends[i].bounds, this.labelShape.bounds)) {
            w = mxConstants.HANDLE_SIZE + 3;
            h = mxConstants.HANDLE_SIZE + 3;
            this.bends[i].bounds = new mxRectangle(Math.round(x - w / 2), Math.round(y - h / 2), w, h);
          }
          this.bends[i].redraw();
        } else {
          this.bends[i].destroy();
          this.bends[i] = undefined;
        }
      }
    }
  }

  /**
   * Function: checkLabelHandle
   *
   * Checks if the label handle intersects the given bounds and moves it if it
   * intersects.
   */
  checkLabelHandle(b: any): void {
    if (!!this.labelShape) {
      const b2 = this.labelShape.bounds;
      if (mxUtils.intersects(b, b2)) {
        if (b.getCenterY() < b2.getCenterY()) {
          b2.y = b.y + b.height;
        } else {
          b2.y = b.y - b2.height;
        }
      }
    }
  }

  /**
   * Function: drawPreview
   *
   * Redraws the preview.
   */
  drawPreview(): void {
    if (this.isLabel) {
      const b = this.labelShape.bounds;
      const bounds = new mxRectangle(Math.round(this.label.x - b.width / 2), Math.round(this.label.y - b.height / 2), b.width, b.height);
      this.labelShape.bounds = bounds;
      this.labelShape.redraw();
    } else if (!!this.shape) {
      this.shape.apply(this.state);
      this.shape.points = this.abspoints;
      this.shape.scale = this.state.view.scale;
      this.shape.isDashed = this.isSelectionDashed();
      this.shape.stroke = this.getSelectionColor();
      this.shape.strokewidth = this.getSelectionStrokeWidth() / this.shape.scale / this.shape.scale;
      this.shape.isShadow = false;
      this.shape.redraw();
    }
    if (!!this.parentHighlight) {
      this.parentHighlight.redraw();
    }
  }

  /**
   * Function: refresh
   *
   * Refreshes the bends of this handler.
   */
  refresh(): void {
    this.abspoints = this.getSelectionPoints(this.state);
    this.points = [];
    if (!!this.shape) {
      this.shape.points = this.abspoints;
    }
    if (!!this.bends) {
      this.destroyBends(this.bends);
      this.bends = this.createBends();
    }
    if (!!this.virtualBends) {
      this.destroyBends(this.virtualBends);
      this.virtualBends = this.createVirtualBends();
    }
    if (!!this.customHandles) {
      this.destroyBends(this.customHandles);
      this.customHandles = this.createCustomHandles();
    }
    if (!!this.labelShape && !!this.labelShape.node && !!this.labelShape.node.parentNode) {
      this.labelShape.node.parentNode.appendChild(this.labelShape.node);
    }
  }

  /**
   * Function: destroyBends
   *
   * Destroys all elements in <bends>.
   */
  destroyBends(bends: any): void {
    if (!!bends) {
      for (let i = 0; i < bends.length; i++) {
        if (bends[i]) {
          bends[i].destroy();
        }
      }
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes. This does
   * normally not need to be called as handlers are destroyed automatically
   * when the corresponding cell is deselected.
   */
  destroy(): void {
    if (!!this.escapeHandler) {
      this.state.view.graph.removeListener(this.escapeHandler);
      this.escapeHandler = undefined;
    }
    if (!!this.marker) {
      this.marker.destroy();
      this.marker = undefined;
    }
    if (!!this.shape) {
      this.shape.destroy();
      this.shape = undefined;
    }
    if (!!this.parentHighlight) {
      this.parentHighlight.destroy();
      this.parentHighlight = undefined;
    }
    if (!!this.labelShape) {
      this.labelShape.destroy();
      this.labelShape = undefined;
    }
    if (!!this.constraintHandler) {
      this.constraintHandler.destroy();
      this.constraintHandler = undefined;
    }
    this.destroyBends(this.virtualBends);
    this.virtualBends = undefined;
    this.destroyBends(this.customHandles);
    this.customHandles = undefined;
    this.destroyBends(this.bends);
    this.bends = undefined;
    this.removeHint();
  }
}
