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
export class mxDragSource {
  element: any;
  dropHandler: Function;
  /**
   * Variable: dragOffset
   *
   * <mxPoint> that specifies the offset of the <dragElement>. Default is null.
   */
  dragOffset: any;
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
  enabled: boolean;
  /**
   * Variable: currentGraph
   *
   * Reference to the <mxGraph> that is the current drop target.
   */
  currentGraph: any;
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
  autoscroll: boolean;
  /**
   * Variable: guidesEnabled
   *
   * Specifies if <mxGuide> should be enabled. Default is true.
   * @example true
   */
  guidesEnabled: boolean;
  /**
   * Variable: gridEnabled
   *
   * Specifies if the grid should be allowed. Default is true.
   * @example true
   */
  gridEnabled: boolean;
  /**
   * Variable: highlightDropTargets
   *
   * Specifies if drop targets should be highlighted. Default is true.
   * @example true
   */
  highlightDropTargets: boolean;
  /**
   * Variable: dragElementZIndex
   *
   * ZIndex for the drag element. Default is 100.
   * @example 100
   */
  dragElementZIndex: number;
  /**
   * Variable: dragElementOpacity
   *
   * Opacity of the drag element in %. Default is 70.
   * @example 70
   */
  dragElementOpacity: number;
  /**
   * Variable: checkEventSource
   *
   * Whether the event source should be checked in <graphContainerEvent>. Default
   * is true.
   * @example true
   */
  checkEventSource: boolean;
  mouseMoveHandler: Function;
  mouseUpHandler: Function;
  eventSource: any;

  constructor(element: any, dropHandler: Function) {
    this.element = element;
    this.dropHandler = dropHandler;
    mxEvent.addGestureListeners(element, mxUtils.bind(this, function (evt) {
      this.mouseDown(evt);
    }));
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
  getDropTarget(graph: any, x: number, y: number, evt: Event): any {
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
  createPreviewElement(graph: any): any {
    return null;
  }

  /**
   * Function: isActive
   *
   * Returns true if this drag source is active.
   */
  isActive(): boolean {
    return this.mouseMoveHandler != null;
  }

  /**
   * Function: reset
   *
   * Stops and removes everything and restores the state of the object.
   */
  reset(): void {
    if (this.currentGraph != null) {
      this.dragExit(this.currentGraph);
      this.currentGraph = null;
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
    if (this.enabled && !mxEvent.isConsumed(evt) && this.mouseMoveHandler == null) {
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
    if (this.dragElement != null) {
      if (this.dragElement.parentNode != null) {
        this.dragElement.parentNode.removeChild(this.dragElement);
      }
      this.dragElement = null;
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
  graphContainsEvent(graph: any, evt: Event): any {
    const x = mxEvent.getClientX(evt);
    const y = mxEvent.getClientY(evt);
    const offset = mxUtils.getOffset(graph.container);
    const origin = mxUtils.getScrollOrigin();
    let elt = this.getElementForEvent(evt);
    if (this.checkEventSource) {
      while (elt != null && elt != graph.container) {
        elt = elt.parentNode;
      }
    }
    return elt != null && x >= offset.x - origin.x && y >= offset.y - origin.y && x <= offset.x - origin.x + graph.container.offsetWidth && y <= offset.y - origin.y + graph.container.offsetHeight;
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
    if (graph != null && !this.graphContainsEvent(graph, evt)) {
      graph = null;
    }
    if (graph != this.currentGraph) {
      if (this.currentGraph != null) {
        this.dragExit(this.currentGraph, evt);
      }
      this.currentGraph = graph;
      if (this.currentGraph != null) {
        this.dragEnter(this.currentGraph, evt);
      }
    }
    if (this.currentGraph != null) {
      this.dragOver(this.currentGraph, evt);
    }
    if (this.dragElement != null && (this.previewElement == null || this.previewElement.style.visibility != 'visible')) {
      let x = mxEvent.getClientX(evt);
      let y = mxEvent.getClientY(evt);
      if (this.dragElement.parentNode == null) {
        document.body.appendChild(this.dragElement);
      }
      this.dragElement.style.visibility = 'visible';
      if (this.dragOffset != null) {
        x += this.dragOffset.x;
        y += this.dragOffset.y;
      }
      const offset = mxUtils.getDocumentScrollOrigin(document);
      this.dragElement.style.left = (x + offset.x) + 'px';
      this.dragElement.style.top = (y + offset.y) + 'px';
    } else if (this.dragElement != null) {
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
    if (this.currentGraph != null) {
      if (this.currentPoint != null && (this.previewElement == null || this.previewElement.style.visibility != 'hidden')) {
        const scale = this.currentGraph.view.scale;
        const tr = this.currentGraph.view.translate;
        const x = this.currentPoint.x / scale - tr.x;
        const y = this.currentPoint.y / scale - tr.y;
        this.drop(this.currentGraph, evt, this.currentDropTarget, x, y);
      }
      this.dragExit(this.currentGraph);
      this.currentGraph = null;
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
    if (this.eventSource != null) {
      mxEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
      this.eventSource = null;
    }
    mxEvent.removeGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
  }

  /**
   * Function: dragEnter
   *
   * Actives the given graph as a drop target.
   */
  dragEnter(graph: any, evt: Event): void {
    graph.isMouseDown = true;
    graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
    this.previewElement = this.createPreviewElement(graph);
    if (this.previewElement != null && this.checkEventSource && mxClient.IS_SVG) {
      this.previewElement.style.pointerEvents = 'none';
    }
    if (this.isGuidesEnabled() && this.previewElement != null) {
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
  dragExit(graph: any, evt: Event): void {
    this.currentDropTarget = null;
    this.currentPoint = null;
    graph.isMouseDown = false;
    graph.removeListener(this.eventConsumer);
    if (this.previewElement != null) {
      if (this.previewElement.parentNode != null) {
        this.previewElement.parentNode.removeChild(this.previewElement);
      }
      this.previewElement = null;
    }
    if (this.currentGuide != null) {
      this.currentGuide.destroy();
      this.currentGuide = null;
    }
    if (this.currentHighlight != null) {
      this.currentHighlight.destroy();
      this.currentHighlight = null;
    }
  }

  /**
   * Function: dragOver
   *
   * Implements autoscroll, updates the <currentPoint>, highlights any drop
   * targets and updates the preview.
   */
  dragOver(graph: any, evt: Event): void {
    const offset = mxUtils.getOffset(graph.container);
    const origin = mxUtils.getScrollOrigin(graph.container);
    let x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
    let y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;
    if (graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
      graph.scrollPointToVisible(x, y, graph.autoExtend);
    }
    if (this.currentHighlight != null && graph.isDropEnabled()) {
      this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
      const state = graph.getView().getState(this.currentDropTarget);
      this.currentHighlight.highlight(state);
    }
    if (this.previewElement != null) {
      if (this.previewElement.parentNode == null) {
        graph.container.appendChild(this.previewElement);
        this.previewElement.style.zIndex = '3';
        this.previewElement.style.position = 'absolute';
      }
      const gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
      let hideGuide = true;
      if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
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
      if (this.currentGuide != null && hideGuide) {
        this.currentGuide.hide();
      }
      if (this.previewOffset != null) {
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
  drop(graph: any, evt: Event, dropTarget: any, x: number, y: number): void {
    this.dropHandler.apply(this, arguments);
    if (graph.container.style.visibility != 'hidden') {
      graph.container.focus();
    }
  }
}
