/**
 * Class: mxConnectionHandler
 *
 * Graph event handler that creates new connections. Uses <mxTerminalMarker>
 * for finding and highlighting the source and target vertices and
 * <factoryMethod> to create the edge instance. This handler is built-into
 * <mxGraph.connectionHandler> and enabled using <mxGraph.setConnectable>.
 *
 * Example:
 *
 * (code)
 * new mxConnectionHandler(graph, function(source, target, style)
 * {
 *   edge = new mxCell('', new mxGeometry());
 *   edge.setEdge(true);
 *   edge.setStyle(style);
 *   edge.geometry.relative = true;
 *   return edge;
 * });
 * (end)
 *
 * Here is an alternative solution that just sets a specific user object for
 * new edges by overriding <insertEdge>.
 *
 * (code)
 * mxConnectionHandlerInsertEdge = mxConnectionHandler.prototype.insertEdge;
 * mxConnectionHandler.prototype.insertEdge = function(parent, id, value, source, target, style)
 * {
 *   value = 'Test';
 *
 *   return mxConnectionHandlerInsertEdge.apply(this, arguments);
 * };
 * (end)
 *
 * Using images to trigger connections:
 *
 * This handler uses mxTerminalMarker to find the source and target cell for
 * the new connection and creates a new edge using <connect>. The new edge is
 * created using <createEdge> which in turn uses <factoryMethod> or creates a
 * new default edge.
 *
 * The handler uses a "highlight-paradigm" for indicating if a cell is being
 * used as a source or target terminal, as seen in other diagramming products.
 * In order to allow both, moving and connecting cells at the same time,
 * <mxConstants.DEFAULT_HOTSPOT> is used in the handler to determine the hotspot
 * of a cell, that is, the region of the cell which is used to trigger a new
 * connection. The constant is a value between 0 and 1 that specifies the
 * amount of the width and height around the center to be used for the hotspot
 * of a cell and its default value is 0.5. In addition,
 * <mxConstants.MIN_HOTSPOT_SIZE> defines the minimum number of pixels for the
 * width and height of the hotspot.
 *
 * This solution, while standards compliant, may be somewhat confusing because
 * there is no visual indicator for the hotspot and the highlight is seen to
 * switch on and off while the mouse is being moved in and out. Furthermore,
 * this paradigm does not allow to create different connections depending on
 * the highlighted hotspot as there is only one hotspot per cell and it
 * normally does not allow cells to be moved and connected at the same time as
 * there is no clear indication of the connectable area of the cell.
 *
 * To come across these issues, the handle has an additional <createIcons> hook
 * with a default implementation that allows to create one icon to be used to
 * trigger new connections. If this icon is specified, then new connections can
 * only be created if the image is clicked while the cell is being highlighted.
 * The <createIcons> hook may be overridden to create more than one
 * <mxImageShape> for creating new connections, but the default implementation
 * supports one image and is used as follows:
 *
 * In order to display the "connect image" whenever the mouse is over the cell,
 * an DEFAULT_HOTSPOT of 1 should be used:
 *
 * (code)
 * mxConstants.DEFAULT_HOTSPOT = 1;
 * (end)
 *
 * In order to avoid confusion with the highlighting, the highlight color
 * should not be used with a connect image:
 *
 * (code)
 * mxConstants.HIGHLIGHT_COLOR = undefined;
 * (end)
 *
 * To install the image, the connectImage field of the mxConnectionHandler must
 * be assigned a new <mxImage> instance:
 *
 * (code)
 * mxConnectionHandler.prototype.connectImage = new mxImage('images/green-dot.gif', 14, 14);
 * (end)
 *
 * This will use the green-dot.gif with a width and height of 14 pixels as the
 * image to trigger new connections. In createIcons the icon field of the
 * handler will be set in order to remember the icon that has been clicked for
 * creating the new connection. This field will be available under selectedIcon
 * in the connect method, which may be overridden to take the icon that
 * triggered the new connection into account. This is useful if more than one
 * icon may be used to create a connection.
 *
 * Group: Events
 *
 * Event: mxEvent.START
 *
 * Fires when a new connection is being created by the user. The <code>state</code>
 * property contains the state of the source cell.
 *
 * Event: mxEvent.CONNECT
 *
 * Fires between begin- and endUpdate in <connect>. The <code>cell</code>
 * property contains the inserted edge, the <code>event</code> and <code>target</code>
 * properties contain the respective arguments that were passed to <connect> (where
 * target corresponds to the dropTarget argument). Finally, the <code>terminal</code>
 * property corresponds to the target argument in <connect> or the clone of the source
 * terminal if <createTarget> is enabled.
 *
 * Note that the target is the cell under the mouse where the mouse button was released.
 * Depending on the logic in the handler, this doesn't necessarily have to be the target
 * of the inserted edge. To print the source, target or any optional ports IDs that the
 * edge is connected to, the following code can be used. To get more details about the
 * actual connection point, <mxGraph.getConnectionConstraint> can be used. To resolve
 * the port IDs, use <mxGraphModel.getCell>.
 *
 * (code)
 * graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
 * {
 *   var edge = evt.getProperty('cell');
 *   var source = graph.getModel().getTerminal(edge, true);
 *   var target = graph.getModel().getTerminal(edge, false);
 *
 *   var style = graph.getCellStyle(edge);
 *   var sourcePortId = style[mxConstants.STYLE_SOURCE_PORT];
 *   var targetPortId = style[mxConstants.STYLE_TARGET_PORT];
 *
 *   mxLog.show();
 *   mxLog.debug('connect', edge, source.id, target.id, sourcePortId, targetPortId);
 * });
 * (end)
 *
 * Event: mxEvent.RESET
 *
 * Fires when the <reset> method is invoked.
 *
 * Constructor: mxConnectionHandler
 *
 * Constructs an event handler that connects vertices using the specified
 * factory method to create the new edges. Modify
 * <mxConstants.ACTIVE_REGION> to setup the region on a cell which triggers
 * the creation of a new connection or use connect icons as explained
 * above.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * factoryMethod - Optional function to create the edge. The function takes
 * the source and target <mxCell> as the first and second argument and an
 * optional cell style from the preview as the third argument. It returns
 * the <mxCell> that represents the new edge.
 */
import { mxCell } from '../model/mxCell';
import { mxGeometry } from '../model/mxGeometry';
import { mxImageShape } from '../shape/mxImageShape';
import { mxPolyline } from '../shape/mxPolyline';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxEventSource } from '../util/mxEventSource';
import { mxLog } from '../util/mxLog';
import { mxMouseEvent } from '../util/mxMouseEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxGraph } from '../view/mxGraph';
import { mxCellMarker } from './mxCellMarker';
import { mxConstraintHandler } from './mxConstraintHandler';

export class mxConnectionHandler extends mxEventSource {
  constructor(graph: mxGraph, factoryMethod: any) {
    super();
    if (!!graph) {
      this.graph = graph;
      this.factoryMethod = factoryMethod;
      this.init();
      this.escapeHandler = (sender, evt) => {
        this.reset();
      };
      this.graph.addListener(mxEvent.ESCAPE, this.escapeHandler);
    }
  }

  graph: mxGraph;
  factoryMethod: any;
  escapeHandler: Function;
  /**
   * Variable: moveIconFront
   *
   * Specifies if icons should be displayed inside the graph container instead
   * of the overlay pane. This is used for HTML labels on vertices which hide
   * the connect icon. This has precendence over <moveIconBack> when set
   * to true. Default is false.
   */
  moveIconFront: boolean = false;
  /**
   * Variable: moveIconBack
   *
   * Specifies if icons should be moved to the back of the overlay pane. This can
   * be set to true if the icons of the connection handler conflict with other
   * handles, such as the vertex label move handle. Default is false.
   */
  moveIconBack: boolean = false;
  /**
   * Variable: connectImage
   *
   * <mxImage> that is used to trigger the creation of a new connection. This
   * is used in <createIcons>. Default is null.
   */
  connectImage: any = null;
  /**
   * Variable: targetConnectImage
   *
   * Specifies if the connect icon should be centered on the target state
   * while connections are being previewed. Default is false.
   */
  targetConnectImage: boolean = false;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean = true;
  /**
   * Variable: select
   *
   * Specifies if new edges should be selected. Default is true.
   * @example true
   */
  select: boolean = true;
  /**
   * Variable: createTarget
   *
   * Specifies if <createTargetVertex> should be called if no target was under the
   * mouse for the new connection. Setting this to true means the connection
   * will be drawn as valid if no target is under the mouse, and
   * <createTargetVertex> will be called before the connection is created between
   * the source cell and the newly created vertex in <createTargetVertex>, which
   * can be overridden to create a new target. Default is false.
   */
  createTarget: boolean = true;
  /**
   * Variable: marker
   *
   * Holds the <mxTerminalMarker> used for finding source and target cells.
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
   * Holds the current validation error while connections are being created.
   */
  error: any;
  /**
   * Variable: waypointsEnabled
   *
   * Specifies if single clicks should add waypoints on the new edge. Default is
   * false.
   */
  waypointsEnabled: boolean;
  /**
   * Variable: ignoreMouseDown
   *
   * Specifies if the connection handler should ignore the state of the mouse
   * button when highlighting the source. Default is false, that is, the
   * handler only highlights the source if no button is being pressed.
   */
  ignoreMouseDown: boolean = false;
  /**
   * Variable: first
   *
   * Holds the <mxPoint> where the mouseDown took place while the handler is
   * active.
   */
  first: any;
  /**
   * Variable: connectIconOffset
   *
   * Holds the offset for connect icons during connection preview.
   * Default is mxPoint(0, <mxConstants.TOOLTIP_VERTICAL_OFFSET>).
   * Note that placing the icon under the mouse pointer with an
   * offset of (0,0) will affect hit detection.
   */
  connectIconOffset: mxPoint;
  /**
   * Variable: edgeState
   *
   * Optional <mxCellState> that represents the preview edge while the
   * handler is active. This is created in <createEdgeState>.
   */
  edgeState: any;
  /**
   * Variable: changeHandler
   *
   * Holds the change event listener for later removal.
   */
  changeHandler: Function;
  /**
   * Variable: drillHandler
   *
   * Holds the drill event listener for later removal.
   */
  drillHandler: Function;
  /**
   * Variable: mouseDownCounter
   *
   * Counts the number of mouseDown events since the start. The initial mouse
   * down event counts as 1.
   */
  mouseDownCounter: number;
  /**
   * Variable: movePreviewAway
   *
   * Switch to enable moving the preview away from the mousepointer. This is required in browsers
   * where the preview cannot be made transparent to events and if the built-in hit detection on
   * the HTML elements in the page should be used. Default is the value of <mxClient.IS_VML>.
   */
  movePreviewAway: any;
  /**
   * Variable: outlineConnect
   *
   * Specifies if connections to the outline of a highlighted target should be
   * enabled. This will allow to place the connection point along the outline of
   * the highlighted target. Default is false.
   */
  outlineConnect: boolean = false;
  /**
   * Variable: livePreview
   *
   * Specifies if the actual shape of the edge state should be used for the preview.
   * Default is false. (Ignored if no edge state is created in <createEdgeState>.)
   */
  livePreview: boolean = false;
  /**
   * Variable: cursor
   *
   * Specifies the cursor to be used while the handler is active. Default is null.
   */
  cursor: any = null;
  /**
   * Variable: insertBeforeSource
   *
   * Specifies if new edges should be inserted before the source vertex in the
   * cell hierarchy. Default is false for backwards compatibility.
   */
  insertBeforeSource: boolean;
  iconState: any;
  previous: any;
  icon: any;
  icons: any;
  selectedIcon: any;
  sourceConstraint: any;
  waypoints: any;
  shape: any;
  currentState: any;
  currentPoint: any;
  originalPoint: any;

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   *
   * Parameters:
   *
   * enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Function: isInsertBefore
   *
   * Returns <insertBeforeSource> for non-loops and false for loops.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge to be inserted.
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   * evt - Mousedown event of the connect gesture.
   * dropTarget - <mxCell> that represents the cell under the mouse when it was
   * released.
   */
  isInsertBefore(edge: any, source: any, target: string, evt: Event, dropTarget: any): boolean {
    return this.insertBeforeSource && source != target;
  }

  /**
   * Function: isCreateTarget
   *
   * Returns <createTarget>.
   *
   * Parameters:
   *
   * evt - Current active native pointer event.
   */
  isCreateTarget(evt: Event): boolean {
    return this.createTarget;
  }

  /**
   * Function: setCreateTarget
   *
   * Sets <createTarget>.
   */
  setCreateTarget(value: any): void {
    this.createTarget = value;
  }

  /**
   * Function: createShape
   *
   * Creates the preview shape for new connections.
   */
  createShape(): any {
    const shape = (this.livePreview && !!this.edgeState) ? this.graph.cellRenderer.createShape(this.edgeState) : new mxPolyline([], mxConstants.INVALID_COLOR);
    shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    shape.scale = this.graph.view.scale;
    shape.pointerEvents = false;
    shape.isDashed = true;
    shape.init(this.graph.getView().getOverlayPane());
    mxEvent.redirectMouseEvents(shape.node, this.graph, null);
    return shape;
  }

  /**
   * Function: init
   *
   * Initializes the shapes required for this connection handler. This should
   * be invoked if <mxGraph.container> is assigned after the connection
   * handler has been created.
   */
  init(): void {
    this.graph.addMouseListener(this);
    this.marker = this.createMarker();
    this.constraintHandler = new mxConstraintHandler(this.graph);
    this.changeHandler = (sender) => {
      if (!!this.iconState) {
        this.iconState = this.graph.getView().getState(this.iconState.cell);
      }
      if (!!this.iconState) {
        this.redrawIcons(this.icons, this.iconState);
        this.constraintHandler.reset();
      } else if (!!this.previous && !this.graph.view.getState(this.previous.cell)) {
        this.reset();
      }
    };
    this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
    this.graph.getView().addListener(mxEvent.SCALE, this.changeHandler);
    this.graph.getView().addListener(mxEvent.TRANSLATE, this.changeHandler);
    this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.changeHandler);
    this.drillHandler = (sender) => {
      this.reset();
    };
    this.graph.addListener(mxEvent.START_EDITING, this.drillHandler);
    this.graph.getView().addListener(mxEvent.DOWN, this.drillHandler);
    this.graph.getView().addListener(mxEvent.UP, this.drillHandler);
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
   * Function: createMarker
   *
   * Creates and returns the <mxCellMarker> used in <marker>.
   */
  createMarker(): any {
    const marker = new mxCellMarker(this.graph);
    marker.hotspotEnabled = true;
    marker.getCell = (me) => {
      let cell = mxCellMarker.prototype.getCell.apply(marker, arguments);
      this.error = undefined;
      if (!cell && !!this.currentPoint) {
        cell = this.graph.getCellAt(this.currentPoint.x, this.currentPoint.y);
      }
      if (!!cell && !this.graph.isCellConnectable(cell)) {
        const parent = this.graph.getModel().getParent(cell);
        if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent)) {
          cell = parent;
        }
      }
      if ((this.graph.isSwimlane(cell) && !!this.currentPoint && this.graph.hitsSwimlaneContent(cell, this.currentPoint.x, this.currentPoint.y)) || !this.isConnectableCell(cell)) {
        cell = undefined;
      }
      if (!!cell) {
        if (this.isConnecting()) {
          if (!!this.previous) {
            this.error = this.validateConnection(this.previous.cell, cell);
            if (!!this.error && this.error.length == 0) {
              cell = undefined;
              if (this.isCreateTarget(me.getEvent())) {
                this.error = undefined;
              }
            }
          }
        } else if (!this.isValidSource(cell, me)) {
          cell = undefined;
        }
      } else if (this.isConnecting() && !this.isCreateTarget(me.getEvent()) && !this.graph.allowDanglingEdges) {
        this.error = '';
      }
      return cell;
    };
    marker.isValidState = (state) => {
      if (this.isConnecting()) {
        return !this.error;
      } else {
        return mxCellMarker.prototype.isValidState.apply(marker, arguments);
      }
    };
    marker.getMarkerColor = (evt, state, isValid) => {
      return (!this.connectImage || this.isConnecting()) ? mxCellMarker.prototype.getMarkerColor.apply(marker, arguments) : null;
    };
    marker.intersects = (state, evt) => {
      if (!!this.connectImage || this.isConnecting()) {
        return true;
      }
      return mxCellMarker.prototype.intersects.apply(marker, arguments);
    };
    return marker;
  }

  /**
   * Function: start
   *
   * Starts a new connection for the given state and coordinates.
   */
  start(state: any, x: number, y: number, edgeState: any): void {
    this.previous = state;
    this.first = new mxPoint(x, y);
    this.edgeState = (!!edgeState) ? edgeState : this.createEdgeState(null);
    this.marker.currentColor = this.marker.validColor;
    this.marker.markedState = state;
    this.marker.mark();
    this.fireEvent(new mxEventObject(mxEvent.START, 'state', this.previous));
  }

  /**
   * Function: isConnecting
   *
   * Returns true if the source terminal has been clicked and a new
   * connection is currently being previewed.
   */
  isConnecting(): boolean {
    return !!this.first && !!this.shape;
  }

  /**
   * Function: isValidSource
   *
   * Returns <mxGraph.isValidSource> for the given source terminal.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the source terminal.
   * me - <mxMouseEvent> that is associated with this call.
   */
  isValidSource(cell: mxCell, me: any): boolean {
    return this.graph.isValidSource(cell);
  }

  /**
   * Function: isValidTarget
   *
   * Returns true. The call to <mxGraph.isValidTarget> is implicit by calling
   * <mxGraph.getEdgeValidationError> in <validateConnection>. This is an
   * additional hook for disabling certain targets in this specific handler.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the target terminal.
   */
  isValidTarget(cell: mxCell): boolean {
    return true;
  }

  /**
   * Function: validateConnection
   *
   * Returns the error message or an empty string if the connection for the
   * given source target pair is not valid. Otherwise it returns null. This
   * implementation uses <mxGraph.getEdgeValidationError>.
   *
   * Parameters:
   *
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   */
  validateConnection(source: any, target: string): any {
    if (!this.isValidTarget(target)) {
      return '';
    }
    return this.graph.getEdgeValidationError(null, source, target);
  }

  /**
   * Function: getConnectImage
   *
   * Hook to return the <mxImage> used for the connection icon of the given
   * <mxCellState>. This implementation returns <connectImage>.
   *
   * Parameters:
   *
   * state - <mxCellState> whose connect image should be returned.
   */
  getConnectImage(state: any): any {
    return this.connectImage;
  }

  /**
   * Function: isMoveIconToFrontForState
   *
   * Returns true if the state has a HTML label in the graph's container, otherwise
   * it returns <moveIconFront>.
   *
   * Parameters:
   *
   * state - <mxCellState> whose connect icons should be returned.
   */
  isMoveIconToFrontForState(state: any): boolean {
    if (!!state.text && state.text.node.parentNode == this.graph.container) {
      return true;
    }
    return this.moveIconFront;
  }

  /**
   * Function: createIcons
   *
   * Creates the array <mxImageShapes> that represent the connect icons for
   * the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> whose connect icons should be returned.
   */
  createIcons(state: any): any {
    const image = this.getConnectImage(state);
    if (!!image && !!state) {
      this.iconState = state;
      const icons = [];
      const bounds = new mxRectangle(0, 0, image.width, image.height);
      const icon = new mxImageShape(bounds, image.src, null, null, 0);
      icon.preserveImageAspect = false;
      if (this.isMoveIconToFrontForState(state)) {
        icon.dialect = mxConstants.DIALECT_STRICTHTML;
        icon.init(this.graph.container);
      } else {
        icon.dialect = (this.graph.dialect == mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_SVG : mxConstants.DIALECT_VML;
        icon.init(this.graph.getView().getOverlayPane());
        if (this.moveIconBack && !!icon.node.previousSibling) {
          icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
        }
      }
      icon.node.style.cursor = mxConstants.CURSOR_CONNECT;
      const getState = () => {
        return (!!this.currentState) ? this.currentState : state;
      };
      const mouseDown = (evt) => {
        if (!mxEvent.isConsumed(evt)) {
          this.icon = icon;
          this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, getState()));
        }
      };
      mxEvent.redirectMouseEvents(icon.node, this.graph, getState, mouseDown);
      icons.push(icon);
      this.redrawIcons(icons, this.iconState);
      return icons;
    }
    return null;
  }

  /**
   * Function: redrawIcons
   *
   * Redraws the given array of <mxImageShapes>.
   *
   * Parameters:
   *
   * icons - Optional array of <mxImageShapes> to be redrawn.
   */
  redrawIcons(icons: any, state: any): void {
    if (!!icons && icons[0] && !!state) {
      const pos = this.getIconPosition(icons[0], state);
      icons[0].bounds.x = pos.x;
      icons[0].bounds.y = pos.y;
      icons[0].redraw();
    }
  }

  /**
   * Function: redrawIcons
   *
   * Redraws the given array of <mxImageShapes>.
   *
   * Parameters:
   *
   * icons - Optional array of <mxImageShapes> to be redrawn.
   */
  getIconPosition(icon: any, state: any): any {
    const scale = this.graph.getView().scale;
    let cx = state.getCenterX();
    let cy = state.getCenterY();
    if (this.graph.isSwimlane(state.cell)) {
      const size = this.graph.getStartSize(state.cell);
      cx = (size.width != 0) ? state.x + size.width * scale / 2 : cx;
      cy = (size.height != 0) ? state.y + size.height * scale / 2 : cy;
      const alpha = mxUtils.toRadians(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0);
      if (alpha != 0) {
        const cos = Math.cos(alpha);
        const sin = Math.sin(alpha);
        const ct = new mxPoint(state.getCenterX(), state.getCenterY());
        const pt = mxUtils.getRotatedPoint(new mxPoint(cx, cy), cos, sin, ct);
        cx = pt.x;
        cy = pt.y;
      }
    }
    return new mxPoint(cx - icon.bounds.width / 2, cy - icon.bounds.height / 2);
  }

  /**
   * Function: destroyIcons
   *
   * Destroys the connect icons and resets the respective state.
   */
  destroyIcons(): void {
    if (!!this.icons) {
      for (let i = 0; i < this.icons.length; i++) {
        this.icons[i].destroy();
      }
      this.icons = undefined;
      this.icon = undefined;
      this.selectedIcon = undefined;
      this.iconState = undefined;
    }
  }

  /**
   * Function: isStartEvent
   *
   * Returns true if the given mouse down event should start this handler. The
   * This implementation returns true if the event does not force marquee
   * selection, and the currentConstraint and currentFocus of the
   * <constraintHandler> are not null, or <previous> and <error> are not null and
   * <icons> is null or <icons> and <icon> are not null.
   */
  isStartEvent(me: any): boolean {
    return ((!!this.constraintHandler.currentFocus && !!this.constraintHandler.currentConstraint) || (!!this.previous && !this.error && (!this.icons || (!!this.icons && !!this.icon))));
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by initiating a new connection.
   */
  mouseDown(sender: any, me: any): void {
    this.mouseDownCounter++;
    if (this.isEnabled() && this.graph.isEnabled() && !me.isConsumed() && !this.isConnecting() && this.isStartEvent(me)) {
      if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus && !!this.constraintHandler.currentPoint) {
        this.sourceConstraint = this.constraintHandler.currentConstraint;
        this.previous = this.constraintHandler.currentFocus;
        this.first = this.constraintHandler.currentPoint.clone();
      } else {
        this.first = new mxPoint(me.getGraphX(), me.getGraphY());
      }
      this.edgeState = this.createEdgeState(me);
      this.mouseDownCounter = 1;
      if (this.waypointsEnabled && !this.shape) {
        this.waypoints = undefined;
        this.shape = this.createShape();
        if (!!this.edgeState) {
          this.shape.apply(this.edgeState);
        }
      }
      if (!this.previous && !!this.edgeState) {
        const pt = this.graph.getPointForEvent(me.getEvent());
        this.edgeState.cell.geometry.setTerminalPoint(pt, true);
      }
      this.fireEvent(new mxEventObject(mxEvent.START, 'state', this.previous));
      me.consume();
    }
    this.selectedIcon = this.icon;
    this.icon = undefined;
  }

  /**
   * Function: isImmediateConnectSource
   *
   * Returns true if a tap on the given source state should immediately start
   * connecting. This implementation returns true if the state is not movable
   * in the graph.
   */
  isImmediateConnectSource(state: any): boolean {
    return !this.graph.isCellMovable(state.cell);
  }

  /**
   * Function: createEdgeState
   *
   * Hook to return an <mxCellState> which may be used during the preview.
   * This implementation returns null.
   *
   * Use the following code to create a preview for an existing edge style:
   *
   * (code)
   * graph.connectionHandler.createEdgeState = function(me)
   * {
   *   var edge = graph.createEdge(null, null, null, null, null, 'edgeStyle=elbowEdgeStyle');
   *
   *   return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
   * };
   * (end)
   */
  createEdgeState(me: any): any {
    return null;
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
   * Function: updateCurrentState
   *
   * Updates the current state for a given mouse move event by using
   * the <marker>.
   */
  updateCurrentState(me: any, point: any): void {
    this.constraintHandler.update(me, !this.first, false, (!this.first || me.isSource(this.marker.highlight.shape)) ? null : point);
    if (!!this.constraintHandler.currentFocus && !!this.constraintHandler.currentConstraint) {
      if (!!this.marker.highlight && !!this.marker.highlight.state && this.marker.highlight.state.cell == this.constraintHandler.currentFocus.cell) {
        if (this.marker.highlight.shape.stroke != 'transparent') {
          this.marker.highlight.shape.stroke = 'transparent';
          this.marker.highlight.repaint();
        }
      } else {
        this.marker.markCell(this.constraintHandler.currentFocus.cell, 'transparent');
      }
      if (!!this.previous) {
        this.error = this.validateConnection(this.previous.cell, this.constraintHandler.currentFocus.cell);
        if (!this.error) {
          this.currentState = this.constraintHandler.currentFocus;
        } else {
          this.constraintHandler.reset();
        }
      }
    } else {
      if (this.graph.isIgnoreTerminalEvent(me.getEvent())) {
        this.marker.reset();
        this.currentState = undefined;
      } else {
        this.marker.process(me);
        this.currentState = this.marker.getValidState();
        if (!!this.currentState && !this.isCellEnabled(this.currentState.cell)) {
          this.currentState = undefined;
        }
      }
      const outline = this.isOutlineConnectEvent(me);
      if (!!this.currentState && outline) {
        if (me.isSource(this.marker.highlight.shape)) {
          point = new mxPoint(me.getGraphX(), me.getGraphY());
        }
        const constraint = this.graph.getOutlineConstraint(point, this.currentState, me);
        this.constraintHandler.setFocus(me, this.currentState, false);
        this.constraintHandler.currentConstraint = constraint;
        this.constraintHandler.currentPoint = point;
      }
      if (this.outlineConnect) {
        if (!!this.marker.highlight && !!this.marker.highlight.shape) {
          const s = this.graph.view.scale;
          if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus) {
            this.marker.highlight.shape.stroke = mxConstants.OUTLINE_HIGHLIGHT_COLOR;
            this.marker.highlight.shape.strokewidth = mxConstants.OUTLINE_HIGHLIGHT_STROKEWIDTH / s / s;
            this.marker.highlight.repaint();
          } else if (this.marker.hasValidState()) {
            if (this.marker.getValidState() != me.getState()) {
              this.marker.highlight.shape.stroke = 'transparent';
              this.currentState = undefined;
            } else {
              this.marker.highlight.shape.stroke = mxConstants.DEFAULT_VALID_COLOR;
            }
            this.marker.highlight.shape.strokewidth = mxConstants.HIGHLIGHT_STROKEWIDTH / s / s;
            this.marker.highlight.repaint();
          }
        }
      }
    }
  }

  /**
   * Function: isCellEnabled
   *
   * Returns true if the given cell does not allow new connections to be created.
   */
  isCellEnabled(cell: mxCell): boolean {
    return true;
  }

  /**
   * Function: convertWaypoint
   *
   * Converts the given point from screen coordinates to model coordinates.
   */
  convertWaypoint(point: any): void {
    const scale = this.graph.getView().getScale();
    const tr = this.graph.getView().getTranslate();
    point.x = point.x / scale - tr.x;
    point.y = point.y / scale - tr.y;
  }

  /**
   * Function: snapToPreview
   *
   * Called to snap the given point to the current preview. This snaps to the
   * first point of the preview if alt is not pressed.
   */
  snapToPreview(me: any, point: any): void {
    if (!mxEvent.isAltDown(me.getEvent()) && !!this.previous) {
      const tol = this.graph.gridSize * this.graph.view.scale / 2;
      const tmp = (!!this.sourceConstraint) ? this.first : new mxPoint(this.previous.getCenterX(), this.previous.getCenterY());
      if (Math.abs(tmp.x - me.getGraphX()) < tol) {
        point.x = tmp.x;
      }
      if (Math.abs(tmp.y - me.getGraphY()) < tol) {
        point.y = tmp.y;
      }
    }
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating the preview edge or by highlighting
   * a possible source or target terminal.
   */
  mouseMove(sender: any, me: any): void {
    if (!me.isConsumed() && (this.ignoreMouseDown || !!this.first || !this.graph.isMouseDown)) {
      if (!this.isEnabled() && !!this.currentState) {
        this.destroyIcons();
        this.currentState = undefined;
      }
      const view = this.graph.getView();
      const scale = view.scale;
      const tr = view.translate;
      let point = new mxPoint(me.getGraphX(), me.getGraphY());
      this.error = undefined;
      if (this.graph.isGridEnabledEvent(me.getEvent())) {
        point = new mxPoint((this.graph.snap(point.x / scale - tr.x) + tr.x) * scale, (this.graph.snap(point.y / scale - tr.y) + tr.y) * scale);
      }
      this.snapToPreview(me, point);
      this.currentPoint = point;
      if ((!!this.first || (this.isEnabled() && this.graph.isEnabled())) && (!!this.shape || !this.first || Math.abs(me.getGraphX() - this.first.x) > this.graph.tolerance || Math.abs(me.getGraphY() - this.first.y) > this.graph.tolerance)) {
        this.updateCurrentState(me, point);
      }
      if (!!this.first) {
        let constraint = undefined;
        let current = point;
        if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus && !!this.constraintHandler.currentPoint) {
          constraint = this.constraintHandler.currentConstraint;
          current = this.constraintHandler.currentPoint.clone();
        } else if (!!this.previous && !this.graph.isIgnoreTerminalEvent(me.getEvent()) && mxEvent.isShiftDown(me.getEvent())) {
          if (Math.abs(this.previous.getCenterX() - point.x) < Math.abs(this.previous.getCenterY() - point.y)) {
            point.x = this.previous.getCenterX();
          } else {
            point.y = this.previous.getCenterY();
          }
        }
        let pt2 = this.first;
        if (!!this.selectedIcon) {
          const w = this.selectedIcon.bounds.width;
          const h = this.selectedIcon.bounds.height;
          if (!!this.currentState && this.targetConnectImage) {
            const pos = this.getIconPosition(this.selectedIcon, this.currentState);
            this.selectedIcon.bounds.x = pos.x;
            this.selectedIcon.bounds.y = pos.y;
          } else {
            const bounds = new mxRectangle(me.getGraphX() + this.connectIconOffset.x, me.getGraphY() + this.connectIconOffset.y, w, h);
            this.selectedIcon.bounds = bounds;
          }
          this.selectedIcon.redraw();
        }
        if (!!this.edgeState) {
          this.updateEdgeState(current, constraint);
          current = this.edgeState.absolutePoints[this.edgeState.absolutePoints.length - 1];
          pt2 = this.edgeState.absolutePoints[0];
        } else {
          if (!!this.currentState) {
            if (!this.constraintHandler.currentConstraint) {
              const tmp = this.getTargetPerimeterPoint(this.currentState, me);
              if (!!tmp) {
                current = tmp;
              }
            }
          }
          if (!this.sourceConstraint && !!this.previous) {
            const next = (!!this.waypoints && this.waypoints.length > 0) ? this.waypoints[0] : current;
            const tmp = this.getSourcePerimeterPoint(this.previous, next, me);
            if (!!tmp) {
              pt2 = tmp;
            }
          }
        }
        if (!this.currentState && this.movePreviewAway) {
          let tmp = pt2;
          if (!!this.edgeState && this.edgeState.absolutePoints.length >= 2) {
            const tmp2 = this.edgeState.absolutePoints[this.edgeState.absolutePoints.length - 2];
            if (!!tmp2) {
              tmp = tmp2;
            }
          }
          const dx = current.x - tmp.x;
          const dy = current.y - tmp.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len == 0) {
            return;
          }
          this.originalPoint = current.clone();
          current.x -= dx * 4 / len;
          current.y -= dy * 4 / len;
        } else {
          this.originalPoint = undefined;
        }
        if (!this.shape) {
          const dx = Math.abs(me.getGraphX() - this.first.x);
          const dy = Math.abs(me.getGraphY() - this.first.y);
          if (dx > this.graph.tolerance || dy > this.graph.tolerance) {
            this.shape = this.createShape();
            if (!!this.edgeState) {
              this.shape.apply(this.edgeState);
            }
            this.updateCurrentState(me, point);
          }
        }
        if (!!this.shape) {
          if (!!this.edgeState) {
            this.shape.points = this.edgeState.absolutePoints;
          } else {
            let pts = [pt2];
            if (!!this.waypoints) {
              pts = pts.concat(this.waypoints);
            }
            pts.push(current);
            this.shape.points = pts;
          }
          this.drawPreview();
        }
        if (!!this.cursor) {
          this.graph.container.style.cursor = this.cursor;
        }
        mxEvent.consume(me.getEvent());
        me.consume();
      } else if (!this.isEnabled() || !this.graph.isEnabled()) {
        this.constraintHandler.reset();
      } else if (this.previous != this.currentState && !this.edgeState) {
        this.destroyIcons();
        if (!!this.currentState && !this.error && !this.constraintHandler.currentConstraint) {
          this.icons = this.createIcons(this.currentState);
          if (!this.icons) {
            this.currentState.setCursor(mxConstants.CURSOR_CONNECT);
            me.consume();
          }
        }
        this.previous = this.currentState;
      } else if (this.previous == this.currentState && !!this.currentState && !this.icons && !this.graph.isMouseDown) {
        me.consume();
      }
      if (!this.graph.isMouseDown && !!this.currentState && !!this.icons) {
        let hitsIcon = false;
        const target = me.getSource();
        for (let i = 0; i < this.icons.length && !hitsIcon; i++) {
          hitsIcon = target == this.icons[i].node || target.parentNode == this.icons[i].node;
        }
        if (!hitsIcon) {
          this.updateIcons(this.currentState, this.icons, me);
        }
      }
    } else {
      this.constraintHandler.reset();
    }
  }

  /**
   * Function: updateEdgeState
   *
   * Updates <edgeState>.
   */
  updateEdgeState(current: any, constraint: any): void {
    if (!!this.sourceConstraint && !!this.sourceConstraint.point) {
      this.edgeState.style[mxConstants.STYLE_EXIT_X] = this.sourceConstraint.point.x;
      this.edgeState.style[mxConstants.STYLE_EXIT_Y] = this.sourceConstraint.point.y;
    }
    if (!!constraint && !!constraint.point) {
      this.edgeState.style[mxConstants.STYLE_ENTRY_X] = constraint.point.x;
      this.edgeState.style[mxConstants.STYLE_ENTRY_Y] = constraint.point.y;
    } else {
      delete this.edgeState.style[mxConstants.STYLE_ENTRY_X];
      delete this.edgeState.style[mxConstants.STYLE_ENTRY_Y];
    }
    this.edgeState.absolutePoints = [null, (!!this.currentState) ? null : current];
    this.graph.view.updateFixedTerminalPoint(this.edgeState, this.previous, true, this.sourceConstraint);
    if (!!this.currentState) {
      if (!constraint) {
        constraint = this.graph.getConnectionConstraint(this.edgeState, this.previous, false);
      }
      this.edgeState.setAbsoluteTerminalPoint(null, false);
      this.graph.view.updateFixedTerminalPoint(this.edgeState, this.currentState, false, constraint);
    }
    let realPoints = undefined;
    if (!!this.waypoints) {
      realPoints = [];
      for (let i = 0; i < this.waypoints.length; i++) {
        const pt = this.waypoints[i].clone();
        this.convertWaypoint(pt);
        realPoints[i] = pt;
      }
    }
    this.graph.view.updatePoints(this.edgeState, realPoints, this.previous, this.currentState);
    this.graph.view.updateFloatingTerminalPoints(this.edgeState, this.previous, this.currentState);
  }

  /**
   * Function: getTargetPerimeterPoint
   *
   * Returns the perimeter point for the given target state.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the target cell state.
   * me - <mxMouseEvent> that represents the mouse move.
   */
  getTargetPerimeterPoint(state: any, me: any): any {
    let result = undefined;
    const view = state.view;
    const targetPerimeter = view.getPerimeterFunction(state);
    if (!!targetPerimeter) {
      const next = (!!this.waypoints && this.waypoints.length > 0) ? this.waypoints[this.waypoints.length - 1] : new mxPoint(this.previous.getCenterX(), this.previous.getCenterY());
      const tmp = targetPerimeter(view.getPerimeterBounds(state), this.edgeState, next, false);
      if (!!tmp) {
        result = tmp;
      }
    } else {
      result = new mxPoint(state.getCenterX(), state.getCenterY());
    }
    return result;
  }

  /**
   * Function: getSourcePerimeterPoint
   *
   * Hook to update the icon position(s) based on a mouseOver event. This is
   * an empty implementation.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the target cell state.
   * next - <mxPoint> that represents the next point along the previewed edge.
   * me - <mxMouseEvent> that represents the mouse move.
   */
  getSourcePerimeterPoint(state: any, next: any, me: any): any {
    let result = undefined;
    const view = state.view;
    const sourcePerimeter = view.getPerimeterFunction(state);
    const c = new mxPoint(state.getCenterX(), state.getCenterY());
    if (!!sourcePerimeter) {
      const theta = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0);
      const rad = -theta * (Math.PI / 180);
      if (theta != 0) {
        next = mxUtils.getRotatedPoint(new mxPoint(next.x, next.y), Math.cos(rad), Math.sin(rad), c);
      }
      let tmp = sourcePerimeter(view.getPerimeterBounds(state), state, next, false);
      if (!!tmp) {
        if (theta != 0) {
          tmp = mxUtils.getRotatedPoint(new mxPoint(tmp.x, tmp.y), Math.cos(-rad), Math.sin(-rad), c);
        }
        result = tmp;
      }
    } else {
      result = c;
    }
    return result;
  }

  /**
   * Function: updateIcons
   *
   * Hook to update the icon position(s) based on a mouseOver event. This is
   * an empty implementation.
   *
   * Parameters:
   *
   * state - <mxCellState> under the mouse.
   * icons - Array of currently displayed icons.
   * me - <mxMouseEvent> that contains the mouse event.
   */
  updateIcons(state: any, icons: any, me: any): void {
  }

  /**
   * Function: isStopEvent
   *
   * Returns true if the given mouse up event should stop this handler. The
   * connection will be created if <error> is null. Note that this is only
   * called if <waypointsEnabled> is true. This implemtation returns true
   * if there is a cell state in the given event.
   */
  isStopEvent(me: any): boolean {
    return !!me.getState();
  }

  /**
   * Function: addWaypoint
   *
   * Adds the waypoint for the given event to <waypoints>.
   */
  addWaypointForEvent(me: any): void {
    const point = mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
    const dx = Math.abs(point.x - this.first.x);
    const dy = Math.abs(point.y - this.first.y);
    const addPoint = !!this.waypoints || (this.mouseDownCounter > 1 && (dx > this.graph.tolerance || dy > this.graph.tolerance));
    if (addPoint) {
      if (!this.waypoints) {
        this.waypoints = [];
      }
      const scale = this.graph.view.scale;
      const point = new mxPoint(this.graph.snap(me.getGraphX() / scale) * scale, this.graph.snap(me.getGraphY() / scale) * scale);
      this.waypoints.push(point);
    }
  }

  /**
   * Function: checkConstraints
   *
   * Returns true if the connection for the given constraints is valid. This
   * implementation returns true if the constraints are not pointing to the
   * same fixed connection point.
   */
  checkConstraints(c1: any, c2: any): any {
    return (!c1 || !c2 || !c1.point || !c2.point || !c1.point.equals(c2.point) || c1.dx != c2.dx || c1.dy != c2.dy || c1.perimeter != c2.perimeter);
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by inserting the new connection.
   */
  mouseUp(sender: any, me: any): void {
    if (!me.isConsumed() && this.isConnecting()) {
      if (this.waypointsEnabled && !this.isStopEvent(me)) {
        this.addWaypointForEvent(me);
        me.consume();
        return;
      }
      const c1 = this.sourceConstraint;
      const c2 = this.constraintHandler.currentConstraint;
      const source = (!!this.previous) ? this.previous.cell : null;
      let target = undefined;
      if (!!this.constraintHandler.currentConstraint && !!this.constraintHandler.currentFocus) {
        target = this.constraintHandler.currentFocus.cell;
      }
      if (!target && !!this.currentState) {
        target = this.currentState.cell;
      }
      if (!this.error && (!source || !target || source != target || this.checkConstraints(c1, c2))) {
        this.connect(source, target, me.getEvent(), me.getCell());
      } else {
        if (!!this.previous && !!this.marker.validState && this.previous.cell == this.marker.validState.cell) {
          this.graph.selectCellForEvent(this.marker.source, me.getEvent());
        }
        if (!!this.error && this.error.length > 0) {
          this.graph.validationAlert(this.error);
        }
      }
      this.destroyIcons();
      me.consume();
    }
    if (!!this.first) {
      this.reset();
    }
  }

  /**
   * Function: reset
   *
   * Resets the state of this handler.
   */
  reset(): void {
    if (!!this.shape) {
      this.shape.destroy();
      this.shape = undefined;
    }
    if (!!this.cursor && !!this.graph.container) {
      this.graph.container.style.cursor = '';
    }
    this.destroyIcons();
    this.marker.reset();
    this.constraintHandler.reset();
    this.originalPoint = undefined;
    this.currentPoint = undefined;
    this.edgeState = undefined;
    this.previous = undefined;
    this.error = undefined;
    this.sourceConstraint = undefined;
    this.mouseDownCounter = 0;
    this.first = undefined;
    this.fireEvent(new mxEventObject(mxEvent.RESET));
  }

  /**
   * Function: drawPreview
   *
   * Redraws the preview edge using the color and width returned by
   * <getEdgeColor> and <getEdgeWidth>.
   */
  drawPreview(): void {
    this.updatePreview(!this.error);
    this.shape.redraw();
  }

  /**
   * Function: getEdgeColor
   *
   * Returns the color used to draw the preview edge. This returns green if
   * there is no edge validation error and red otherwise.
   *
   * Parameters:
   *
   * valid - Boolean indicating if the color for a valid edge should be
   * returned.
   */
  updatePreview(valid: any): void {
    this.shape.strokewidth = this.getEdgeWidth(valid);
    this.shape.stroke = this.getEdgeColor(valid);
  }

  /**
   * Function: getEdgeColor
   *
   * Returns the color used to draw the preview edge. This returns green if
   * there is no edge validation error and red otherwise.
   *
   * Parameters:
   *
   * valid - Boolean indicating if the color for a valid edge should be
   * returned.
   */
  getEdgeColor(valid: any): string {
    return (valid) ? mxConstants.VALID_COLOR : mxConstants.INVALID_COLOR;
  }

  /**
   * Function: getEdgeWidth
   *
   * Returns the width used to draw the preview edge. This returns 3 if
   * there is no edge validation error and 1 otherwise.
   *
   * Parameters:
   *
   * valid - Boolean indicating if the width for a valid edge should be
   * returned.
   */
  getEdgeWidth(valid: any): any {
    return (valid) ? 3 : 1;
  }

  /**
   * Function: connect
   *
   * Connects the given source and target using a new edge. This
   * implementation uses <createEdge> to create the edge.
   *
   * Parameters:
   *
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   * evt - Mousedown event of the connect gesture.
   * dropTarget - <mxCell> that represents the cell under the mouse when it was
   * released.
   */
  connect(source: any, target: string, evt: Event, dropTarget: any): void {
    if (!!target || this.isCreateTarget(evt) || this.graph.allowDanglingEdges) {
      const model = this.graph.getModel();
      let terminalInserted = false;
      let edge = undefined;
      model.beginUpdate();
      try {
        if (!!source && !target && !this.graph.isIgnoreTerminalEvent(evt) && this.isCreateTarget(evt)) {
          target = this.createTargetVertex(evt, source);
          if (!!target) {
            dropTarget = this.graph.getDropTarget([target], evt, dropTarget);
            terminalInserted = true;
            if (!dropTarget || !this.graph.getModel().isEdge(dropTarget)) {
              const pstate = this.graph.getView().getState(dropTarget);
              if (!!pstate) {
                const tmp = model.getGeometry(target);
                tmp.x -= pstate.origin.x;
                tmp.y -= pstate.origin.y;
              }
            } else {
              dropTarget = this.graph.getDefaultParent();
            }
            this.graph.addCell(target, dropTarget);
          }
        }
        let parent = this.graph.getDefaultParent();
        if (!!source && !!target && model.getParent(source) == model.getParent(target) && model.getParent(model.getParent(source)) != model.getRoot()) {
          parent = model.getParent(source);
          if ((!!source.geometry && source.geometry.relative) && (!!target.geometry && target.geometry.relative)) {
            parent = model.getParent(parent);
          }
        }
        let value = undefined;
        let style = undefined;
        if (!!this.edgeState) {
          value = this.edgeState.cell.value;
          style = this.edgeState.cell.style;
        }
        edge = this.insertEdge(parent, null, value, source, target, style);
        if (!!edge) {
          this.graph.setConnectionConstraint(edge, source, true, this.sourceConstraint);
          this.graph.setConnectionConstraint(edge, target, false, this.constraintHandler.currentConstraint);
          if (!!this.edgeState) {
            model.setGeometry(edge, this.edgeState.cell.geometry);
          }
          const parent = model.getParent(source);
          if (this.isInsertBefore(edge, source, target, evt, dropTarget)) {
            const index = undefined;
            let tmp = source;
            while (!!tmp.parent && !!tmp.geometry && tmp.geometry.relative && tmp.parent != edge.parent) {
              tmp = this.graph.model.getParent(tmp);
            }
            if (!!tmp && !!tmp.parent && tmp.parent == edge.parent) {
              model.add(parent, edge, tmp.parent.getIndex(tmp));
            }
          }
          let geo = model.getGeometry(edge);
          if (!geo) {
            geo = new mxGeometry();
            geo.relative = true;
            model.setGeometry(edge, geo);
          }
          if (!!this.waypoints && this.waypoints.length > 0) {
            const s = this.graph.view.scale;
            const tr = this.graph.view.translate;
            geo.points = [];
            for (let i = 0; i < this.waypoints.length; i++) {
              const pt = this.waypoints[i];
              geo.points.push(new mxPoint(pt.x / s - tr.x, pt.y / s - tr.y));
            }
          }
          if (!target) {
            const t = this.graph.view.translate;
            const s = this.graph.view.scale;
            const pt = (!!this.originalPoint) ? new mxPoint(this.originalPoint.x / s - t.x, this.originalPoint.y / s - t.y) : new mxPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
            pt.x -= this.graph.panDx / this.graph.view.scale;
            pt.y -= this.graph.panDy / this.graph.view.scale;
            geo.setTerminalPoint(pt, false);
          }
          this.fireEvent(new mxEventObject(mxEvent.CONNECT, 'cell', edge, 'terminal', target, 'event', evt, 'target', dropTarget, 'terminalInserted', terminalInserted));
        }
      } catch (e) {
        mxLog.show();
        mxLog.debug(e.message);
      } finally {
        model.endUpdate();
      }
      if (this.select) {
        this.selectCells(edge, (terminalInserted) ? target : null);
      }
    }
  }

  /**
   * Function: selectCells
   *
   * Selects the given edge after adding a new connection. The target argument
   * contains the target vertex if one has been inserted.
   */
  selectCells(edge: any, target: string): void {
    this.graph.setSelectionCell(edge);
  }

  /**
   * Function: insertEdge
   *
   * Creates, inserts and returns the new edge for the given parameters. This
   * implementation does only use <createEdge> if <factoryMethod> is defined,
   * otherwise <mxGraph.insertEdge> will be used.
   */
  insertEdge(parent: any, id: any, value: any, source: any, target: string, style: any): any {
    if (!this.factoryMethod) {
      return this.graph.insertEdge(parent, id, value, source, target, style);
    } else {
      let edge = this.createEdge(value, source, target, style);
      edge = this.graph.addEdge(edge, parent, source, target);
      return edge;
    }
  }

  /**
   * Function: createTargetVertex
   *
   * Hook method for creating new vertices on the fly if no target was
   * under the mouse. This is only called if <createTarget> is true and
   * returns null.
   *
   * Parameters:
   *
   * evt - Mousedown event of the connect gesture.
   * source - <mxCell> that represents the source terminal.
   */
  createTargetVertex(evt: Event, source: any): any {
    let geo = this.graph.getCellGeometry(source);
    while (!!geo && geo.relative) {
      source = this.graph.getModel().getParent(source);
      geo = this.graph.getCellGeometry(source);
    }
    const clone = this.graph.cloneCell(source);
    let geo = this.graph.getModel().getGeometry(clone);
    if (!!geo) {
      const t = this.graph.view.translate;
      const s = this.graph.view.scale;
      const point = new mxPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
      geo.x = Math.round(point.x - geo.width / 2 - this.graph.panDx / s);
      geo.y = Math.round(point.y - geo.height / 2 - this.graph.panDy / s);
      const tol = this.getAlignmentTolerance();
      if (tol > 0) {
        const sourceState = this.graph.view.getState(source);
        if (!!sourceState) {
          const x = sourceState.x / s - t.x;
          const y = sourceState.y / s - t.y;
          if (Math.abs(x - geo.x) <= tol) {
            geo.x = Math.round(x);
          }
          if (Math.abs(y - geo.y) <= tol) {
            geo.y = Math.round(y);
          }
        }
      }
    }
    return clone;
  }

  /**
   * Function: getAlignmentTolerance
   *
   * Returns the tolerance for aligning new targets to sources. This returns the grid size / 2.
   */
  getAlignmentTolerance(evt: Event): any {
    return (this.graph.isGridEnabled()) ? this.graph.gridSize / 2 : this.graph.tolerance;
  }

  /**
   * Function: createEdge
   *
   * Creates and returns a new edge using <factoryMethod> if one exists. If
   * no factory method is defined, then a new default edge is returned. The
   * source and target arguments are informal, the actual connection is
   * setup later by the caller of this function.
   *
   * Parameters:
   *
   * value - Value to be used for creating the edge.
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   * style - Optional style from the preview edge.
   */
  createEdge(value: any, source: any, target: string, style: any): any {
    let edge = undefined;
    if (!!this.factoryMethod) {
      edge = this.factoryMethod(source, target, style);
    }
    if (!edge) {
      edge = new mxCell(value || '');
      edge.setEdge(true);
      edge.setStyle(style);
      const geo = new mxGeometry();
      geo.relative = true;
      edge.setGeometry(geo);
    }
    return edge;
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes. This should be
   * called on all instances. It is called automatically for the built-in
   * instance created for each <mxGraph>.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);
    if (!!this.shape) {
      this.shape.destroy();
      this.shape = undefined;
    }
    if (!!this.marker) {
      this.marker.destroy();
      this.marker = undefined;
    }
    if (!!this.constraintHandler) {
      this.constraintHandler.destroy();
      this.constraintHandler = undefined;
    }
    if (!!this.changeHandler) {
      this.graph.getModel().removeListener(this.changeHandler);
      this.graph.getView().removeListener(this.changeHandler);
      this.changeHandler = undefined;
    }
    if (!!this.drillHandler) {
      this.graph.removeListener(this.drillHandler);
      this.graph.getView().removeListener(this.drillHandler);
      this.drillHandler = undefined;
    }
    if (!!this.escapeHandler) {
      this.graph.removeListener(this.escapeHandler);
      this.escapeHandler = undefined;
    }
  }
}
