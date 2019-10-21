/**
 * Class: mxDragSource
 *
 * Wrapper to create a drag source from a DOM element so that the element can
 * be dragged over a graph and dropped into the graph as a new cell.
 *
 * Problem is that in the dropHandler the current preview location is not
 * available, so the preview and the dropHandler must match.
 *
 * Constructor: mxDragSource
 *
 * Constructs a new drag source for the given element.
 */
import { mxCellHighlight } from '../handler/mxCellHighlight';
import { mxClient } from '../mxClient';
import { mxConstants } from './mxConstants';
import { mxEvent } from './mxEvent';
import { mxGuide } from './mxGuide';
import { mxPoint } from './mxPoint';
import { mxRectangle } from './mxRectangle';
import { mxUtils } from './mxUtils';

export class mxDragSource {
  constructor(element: any, dropHandler: Function) {
    this.element = element;
    this.dropHandler = dropHandler;
    mxEvent.addGestureListeners(element, (evt) => {
      this.mouseDown(evt);
    });
    mxEvent.addListener(element, 'dragstart', function (evt) {
      mxEvent.consume(evt);
    });
    this.eventConsumer = function (sender, evt) {
      const evtName = evt.getProperty('eventName');
      const me = evt.getProperty('event');
      if (evtName != mxEvent.MOUSE_DOWN) {
        me.consume();
      }
    };
  }

  element: any;
  dropHandler: Function;
  /**
   * Variable: dragOffset
   *
   * <mxPoint> that specifies the offset of the <dragElement>. Default is null.
   */
  dragOffset: any = null;
  /**
   * Variable: dragElement
   *
   * Holds the DOM node that is used to represent the drag preview. If this is
   * null then the source element will be cloned and used for the drag preview.
   */
  dragElement: any;
  /**
   * Variable: previewElement
   *
   * Optional <mxRectangle> that specifies the unscaled size of the preview.
   */
  previewElement: any;
  /**
   * Variable: enabled
   *
   * Specifies if this drag source is enabled. Default is true.
   * @example true
   */
  enabled: boolean = true;
  /**
   * Variable: currentGraph
   *
   * Reference to the <mxGraph> that is the current drop target.
   */
  currentgraph: mxGraph = true;
  /**
   * Variable: currentDropTarget
   *
   * Holds the current drop target under the mouse.
   */
  currentDropTarget: any;
  /**
   * Variable: currentPoint
   *
   * Holds the current drop location.
   */
  currentPoint: any;
  /**
   * Variable: currentGuide
   *
   * Holds an <mxGuide> for the <currentGraph> if <dragPreview> is not null.
   */
  currentGuide: any;
  /**
   * Variable: currentGuide
   *
   * Holds an <mxGuide> for the <currentGraph> if <dragPreview> is not null.
   */
  currentHighlight: any;
  /**
   * Variable: autoscroll
   *
   * Specifies if the graph should scroll automatically. Default is true.
   * @example true
   */
  autoscroll: boolean = true;
  /**
   * Variable: guidesEnabled
   *
   * Specifies if <mxGuide> should be enabled. Default is true.
   * @example true
   */
  guidesEnabled: boolean = true;
  /**
   * Variable: gridEnabled
   *
   * Specifies if the grid should be allowed. Default is true.
   * @example true
   */
  gridEnabled: boolean = true;
  /**
   * Variable: highlightDropTargets
   *
   * Specifies if drop targets should be highlighted. Default is true.
   * @example true
   */
  highlightDropTargets: boolean = true;
  /**
   * Variable: dragElementZIndex
   *
   * ZIndex for the drag element. Default is 100.
   * @example 100
   */
  dragElementZIndex: number = 100;
  /**
   * Variable: dragElementOpacity
   *
   * Opacity of the drag element in %. Default is 70.
   * @example 70
   */
  dragElementOpacity: number = 70;
  /**
   * Variable: checkEventSource
   *
   * Whether the event source should be checked in <graphContainerEvent>. Default
   * is true.
   * @example true
   */
  checkEventSource: boolean = true;
  mouseMoveHandler: Function;
  mouseUpHandler: Function;
  eventSource: any;

  eventConsumer(sender: any, evt: Event): void {
    const evtName = evt.getProperty('eventName');
    const me = evt.getProperty('event');
    if (evtName != mxEvent.MOUSE_DOWN) {
      me.consume();
    }
  }

  /**
   * Function: isEnabled
   *
   * Returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Sets <enabled>.
   */
  setEnabled(value: any): void {
    this.enabled = value;
  }

  /**
   * Function: isGuidesEnabled
   *
   * Returns <guidesEnabled>.
   */
  isGuidesEnabled(): boolean {
    return this.guidesEnabled;
  }

  /**
   * Function: setGuidesEnabled
   *
   * Sets <guidesEnabled>.
   */
  setGuidesEnabled(value: any): void {
    this.guidesEnabled = value;
  }

  /**
   * Function: isGridEnabled
   *
   * Returns <gridEnabled>.
   */
  isGridEnabled(): boolean {
    return this.gridEnabled;
  }

  /**
   * Function: setGridEnabled
   *
   * Sets <gridEnabled>.
   */
  setGridEnabled(value: any): void {
    this.gridEnabled = value;
  }

  /**
   * Function: getGraphForEvent
   *
   * Returns the graph for the given mouse event. This implementation returns
   * null.
   */
  getGraphForEvent(evt: Event): any {
    return null;
  }

  /**
   * Function: getDropTarget
   *
   * Returns the drop target for the given graph and coordinates. This
   * implementation uses <mxGraph.getCellAt>.
   */
  getDropTarget(graph: mxGraph, x: number, y: number, evt: Event): any {
    return graph.getCellAt(x, y);
  }

  /**
   * Function: createDragElement
   *
   * Creates and returns a clone of the <dragElementPrototype> or the <element>
   * if the former is not defined.
   */
  createDragElement(evt: Event): any {
    return this.element.cloneNode(true);
  }

  /**
   * Function: createPreviewElement
   *
   * Creates and returns an element which can be used as a preview in the given
   * graph.
   */
  createPreviewElement(graph: mxGraph): any {
    return null;
  }

  /**
   * Function: isActive
   *
   * Returns true if this drag source is active.
   */
  isActive(): boolean {
    return !!this.mouseMoveHandler;
  }

  /**
   * Function: reset
   *
   * Stops and removes everything and restores the state of the object.
   */
  reset(): void {
    if (!!this.currentGraph) {
      this.dragExit(this.currentGraph);
      this.currentGraph = undefined;
    }
    this.removeDragElement();
    this.removeListeners();
    this.stopDrag();
  }

  /**
   * Function: mouseDown
   *
   * Returns the drop target for the given graph and coordinates. This
   * implementation uses <mxGraph.getCellAt>.
   *
   * To ignore popup menu events for a drag source, this function can be
   * overridden as follows.
   *
   * (code)
   * var mouseDown = dragSource.mouseDown;
   *
   * dragSource.mouseDown = function(evt)
   * {
   *   if (!mxEvent.isPopupTrigger(evt))
   *   {
   *     mouseDown.apply(this, arguments);
   *   }
   * };
   * (end)
   */
  mouseDown(evt: Event): void {
    if (this.enabled && !mxEvent.isConsumed(evt) && !this.mouseMoveHandler) {
      this.startDrag(evt);
      this.mouseMoveHandler = mxUtils.bind(this, this.mouseMove);
      this.mouseUpHandler = mxUtils.bind(this, this.mouseUp);
      mxEvent.addGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
      if (mxClient.IS_TOUCH && !mxEvent.isMouseEvent(evt)) {
        this.eventSource = mxEvent.getSource(evt);
        mxEvent.addGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
      }
    }
  }

  /**
   * Function: startDrag
   *
   * Creates the <dragElement> using <createDragElement>.
   */
  startDrag(evt: Event): void {
    this.dragElement = this.createDragElement(evt);
    this.dragElement.style.position = 'absolute';
    this.dragElement.style.zIndex = this.dragElementZIndex;
    mxUtils.setOpacity(this.dragElement, this.dragElementOpacity);
    if (this.checkEventSource && mxClient.IS_SVG) {
      this.dragElement.style.pointerEvents = 'none';
    }
  }

  /**
   * Function: stopDrag
   *
   * Invokes <removeDragElement>.
   */
  stopDrag(): void {
    this.removeDragElement();
  }

  /**
   * Function: removeDragElement
   *
   * Removes and destroys the <dragElement>.
   */
  removeDragElement(): void {
    if (!!this.dragElement) {
      if (!!this.dragElement.parentNode) {
        this.dragElement.parentNode.removeChild(this.dragElement);
      }
      this.dragElement = undefined;
    }
  }

  /**
   * Function: getElementForEvent
   *
   * Returns the topmost element under the given event.
   */
  getElementForEvent(evt: Event): any {
    return ((mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt)) ? document.elementFromPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt)) : mxEvent.getSource(evt));
  }

  /**
   * Function: graphContainsEvent
   *
   * Returns true if the given graph contains the given event.
   */
  graphContainsEvent(graph: mxGraph, evt: Event): any {
    const x = mxEvent.getClientX(evt);
    const y = mxEvent.getClientY(evt);
    const offset = mxUtils.getOffset(graph.container);
    const origin = mxUtils.getScrollOrigin();
    let elt = this.getElementForEvent(evt);
    if (this.checkEventSource) {
      while (!!elt && elt != graph.container) {
        elt = elt.parentNode;
      }
    }
    return !!elt && x >= offset.x - origin.x && y >= offset.y - origin.y && x <= offset.x - origin.x + graph.container.offsetWidth && y <= offset.y - origin.y + graph.container.offsetHeight;
  }

  /**
   * Function: mouseMove
   *
   * Gets the graph for the given event using <getGraphForEvent>, updates the
   * <currentGraph>, calling <dragEnter> and <dragExit> on the new and old graph,
   * respectively, and invokes <dragOver> if <currentGraph> is not null.
   */
  mouseMove(evt: Event): void {
    let graph = this.getGraphForEvent(evt);
    if (!!graph && !this.graphContainsEvent(graph, evt)) {
      graph = undefined;
    }
    if (graph != this.currentGraph) {
      if (!!this.currentGraph) {
        this.dragExit(this.currentGraph, evt);
      }
      this.currentGraph = graph;
      if (!!this.currentGraph) {
        this.dragEnter(this.currentGraph, evt);
      }
    }
    if (!!this.currentGraph) {
      this.dragOver(this.currentGraph, evt);
    }
    if (!!this.dragElement && (!this.previewElement || this.previewElement.style.visibility != 'visible')) {
      let x = mxEvent.getClientX(evt);
      let y = mxEvent.getClientY(evt);
      if (!this.dragElement.parentNode) {
        document.body.appendChild(this.dragElement);
      }
      this.dragElement.style.visibility = 'visible';
      if (!!this.dragOffset) {
        x += this.dragOffset.x;
        y += this.dragOffset.y;
      }
      const offset = mxUtils.getDocumentScrollOrigin(document);
      this.dragElement.style.left = (x + offset.x) + 'px';
      this.dragElement.style.top = (y + offset.y) + 'px';
    } else if (!!this.dragElement) {
      this.dragElement.style.visibility = 'hidden';
    }
    mxEvent.consume(evt);
  }

  /**
   * Function: mouseUp
   *
   * Processes the mouse up event and invokes <drop>, <dragExit> and <stopDrag>
   * as required.
   */
  mouseUp(evt: Event): void {
    if (!!this.currentGraph) {
      if (!!this.currentPoint && (!this.previewElement || this.previewElement.style.visibility != 'hidden')) {
        const scale = this.currentGraph.view.scale;
        const tr = this.currentGraph.view.translate;
        const x = this.currentPoint.x / scale - tr.x;
        const y = this.currentPoint.y / scale - tr.y;
        this.drop(this.currentGraph, evt, this.currentDropTarget, x, y);
      }
      this.dragExit(this.currentGraph);
      this.currentGraph = undefined;
    }
    this.stopDrag();
    this.removeListeners();
    mxEvent.consume(evt);
  }

  /**
   * Function: removeListeners
   *
   * Actives the given graph as a drop target.
   */
  removeListeners(): void {
    if (!!this.eventSource) {
      mxEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
      this.eventSource = undefined;
    }
    mxEvent.removeGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
    this.mouseMoveHandler = undefined;
    this.mouseUpHandler = undefined;
  }

  /**
   * Function: dragEnter
   *
   * Actives the given graph as a drop target.
   */
  dragEnter(graph: mxGraph, evt: Event): void {
    graph.isMouseDown = true;
    graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
    this.previewElement = this.createPreviewElement(graph);
    if (!!this.previewElement && this.checkEventSource && mxClient.IS_SVG) {
      this.previewElement.style.pointerEvents = 'none';
    }
    if (this.isGuidesEnabled() && !!this.previewElement) {
      this.currentGuide = new mxGuide(graph, graph.graphHandler.getGuideStates());
    }
    if (this.highlightDropTargets) {
      this.currentHighlight = new mxCellHighlight(graph, mxConstants.DROP_TARGET_COLOR);
    }
    graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.eventConsumer);
  }

  /**
   * Function: dragExit
   *
   * Deactivates the given graph as a drop target.
   */
  dragExit(graph: mxGraph, evt: Event): void {
    this.currentDropTarget = undefined;
    this.currentPoint = undefined;
    graph.isMouseDown = false;
    graph.removeListener(this.eventConsumer);
    if (!!this.previewElement) {
      if (!!this.previewElement.parentNode) {
        this.previewElement.parentNode.removeChild(this.previewElement);
      }
      this.previewElement = undefined;
    }
    if (!!this.currentGuide) {
      this.currentGuide.destroy();
      this.currentGuide = undefined;
    }
    if (!!this.currentHighlight) {
      this.currentHighlight.destroy();
      this.currentHighlight = undefined;
    }
  }

  /**
   * Function: dragOver
   *
   * Implements autoscroll, updates the <currentPoint>, highlights any drop
   * targets and updates the preview.
   */
  dragOver(graph: mxGraph, evt: Event): void {
    const offset = mxUtils.getOffset(graph.container);
    const origin = mxUtils.getScrollOrigin(graph.container);
    let x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
    let y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;
    if (graph.autoScroll && (!this.autoscroll || this.autoscroll)) {
      graph.scrollPointToVisible(x, y, graph.autoExtend);
    }
    if (!!this.currentHighlight && graph.isDropEnabled()) {
      this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
      const state = graph.getView().getState(this.currentDropTarget);
      this.currentHighlight.highlight(state);
    }
    if (!!this.previewElement) {
      if (!this.previewElement.parentNode) {
        graph.container.appendChild(this.previewElement);
        this.previewElement.style.zIndex = '3';
        this.previewElement.style.position = 'absolute';
      }
      const gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
      let hideGuide = true;
      if (!!this.currentGuide && this.currentGuide.isEnabledForEvent(evt)) {
        const w = parseInt(this.previewElement.style.width);
        const h = parseInt(this.previewElement.style.height);
        const bounds = new mxRectangle(0, 0, w, h);
        let delta = new mxPoint(x, y);
        delta = this.currentGuide.move(bounds, delta, gridEnabled, true);
        hideGuide = false;
        x = delta.x;
        y = delta.y;
      } else if (gridEnabled) {
        const scale = graph.view.scale;
        const tr = graph.view.translate;
        const off = graph.gridSize / 2;
        x = (graph.snap(x / scale - tr.x - off) + tr.x) * scale;
        y = (graph.snap(y / scale - tr.y - off) + tr.y) * scale;
      }
      if (!!this.currentGuide && hideGuide) {
        this.currentGuide.hide();
      }
      if (!!this.previewOffset) {
        x += this.previewOffset.x;
        y += this.previewOffset.y;
      }
      this.previewElement.style.left = Math.round(x) + 'px';
      this.previewElement.style.top = Math.round(y) + 'px';
      this.previewElement.style.visibility = 'visible';
    }
    this.currentPoint = new mxPoint(x, y);
  }

  /**
   * Function: drop
   *
   * Returns the drop target for the given graph and coordinates. This
   * implementation uses <mxGraph.getCellAt>.
   */
  drop(graph: mxGraph, evt: Event, dropTarget: any, x: number, y: number): void {
    this.dropHandler.apply(this, arguments);
    if (graph.container.style.visibility != 'hidden') {
      graph.container.focus();
    }
  }
}
