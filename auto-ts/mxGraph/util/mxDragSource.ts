/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
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
 * @class
 */
export class mxDragSource {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxDragSource

   Wrapper to create a drag source from a DOM element so that the element can
   be dragged over a graph and dropped into the graph as a new cell.

   Problem is that in the dropHandler the current preview location is not
   available, so the preview and the dropHandler must match.

   Constructor: mxDragSource

   Constructs a new drag source for the given element.
   */
  constructor(element, dropHandler) {
    this.element = element;
    this.dropHandler = dropHandler;
    mxEvent.addGestureListeners(element, mxUtils.bind(this, function (evt) {
      this.mouseDown(evt);
    }));
    mxEvent.addListener(element, 'dragstart', function (evt) {
      mxEvent.consume(evt);
    });
    this.eventConsumer = function (sender, evt) {
      var evtName = evt.getProperty('eventName');
      var me = evt.getProperty('event');
      if (evtName != mxEvent.MOUSE_DOWN) {
        me.consume();
      }
    };
  }

  /**
   Variable: element

   Reference to the DOM node which was made draggable.
   */
  element = null;
  /**
   Variable: dropHandler

   Holds the DOM node that is used to represent the drag preview. If this is
   null then the source element will be cloned and used for the drag preview.
   */
  dropHandler = null;
  /**
   Variable: dragOffset

   <mxPoint> that specifies the offset of the <dragElement>. Default is null.
   */
  dragOffset = null;
  /**
   Variable: dragElement

   Holds the DOM node that is used to represent the drag preview. If this is
   null then the source element will be cloned and used for the drag preview.
   */
  dragElement = null;
  /**
   Variable: previewElement

   Optional <mxRectangle> that specifies the unscaled size of the preview.
   */
  previewElement = null;
  /**
   Variable: enabled

   Specifies if this drag source is enabled. Default is true.
   */
  enabled = true;
  /**
   Variable: currentGraph

   Reference to the <mxGraph> that is the current drop target.
   */
  currentGraph = null;
  /**
   Variable: currentDropTarget

   Holds the current drop target under the mouse.
   */
  currentDropTarget = null;
  /**
   Variable: currentPoint

   Holds the current drop location.
   */
  currentPoint = null;
  /**
   Variable: currentGuide

   Holds an <mxGuide> for the <currentGraph> if <dragPreview> is not null.
   */
  currentGuide = null;
  /**
   Variable: currentGuide

   Holds an <mxGuide> for the <currentGraph> if <dragPreview> is not null.
   */
  currentHighlight = null;
  /**
   Variable: autoscroll

   Specifies if the graph should scroll automatically. Default is true.
   */
  autoscroll = true;
  /**
   Variable: guidesEnabled

   Specifies if <mxGuide> should be enabled. Default is true.
   */
  guidesEnabled = true;
  /**
   Variable: gridEnabled

   Specifies if the grid should be allowed. Default is true.
   */
  gridEnabled = true;
  /**
   Variable: highlightDropTargets

   Specifies if drop targets should be highlighted. Default is true.
   */
  highlightDropTargets = true;
  /**
   Variable: dragElementZIndex

   ZIndex for the drag element. Default is 100.
   */
  dragElementZIndex = 100;
  /**
   Variable: dragElementOpacity

   Opacity of the drag element in %. Default is 70.
   */
  dragElementOpacity = 70;
  /**
   Variable: checkEventSource

   Whether the event source should be checked in <graphContainerEvent>. Default
   is true.
   */
  checkEventSource = true;

  /**
   Function: isEnabled

   Returns <enabled>.
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   Function: setEnabled

   Sets <enabled>.
   */
  setEnabled(value) {
    this.enabled = value;
  }

  /**
   Function: isGuidesEnabled

   Returns <guidesEnabled>.
   */
  isGuidesEnabled() {
    return this.guidesEnabled;
  }

  /**
   Function: setGuidesEnabled

   Sets <guidesEnabled>.
   */
  setGuidesEnabled(value) {
    this.guidesEnabled = value;
  }

  /**
   Function: isGridEnabled

   Returns <gridEnabled>.
   */
  isGridEnabled() {
    return this.gridEnabled;
  }

  /**
   Function: setGridEnabled

   Sets <gridEnabled>.
   */
  setGridEnabled(value) {
    this.gridEnabled = value;
  }

  /**
   Function: getGraphForEvent

   Returns the graph for the given mouse event. This implementation returns
   null.
   */
  getGraphForEvent(evt) {
    return null;
  }

  /**
   Function: getDropTarget

   Returns the drop target for the given graph and coordinates. This
   implementation uses <mxGraph.getCellAt>.
   */
  getDropTarget(graph, x, y, evt) {
    return graph.getCellAt(x, y);
  }

  /**
   Function: createDragElement

   Creates and returns a clone of the <dragElementPrototype> or the <element>
   if the former is not defined.
   */
  createDragElement(evt) {
    return this.element.cloneNode(true);
  }

  /**
   Function: createPreviewElement

   Creates and returns an element which can be used as a preview in the given
   graph.
   */
  createPreviewElement(graph) {
    return null;
  }

  /**
   Function: isActive

   Returns true if this drag source is active.
   */
  isActive() {
    return this.mouseMoveHandler != null;
  }

  /**
   Function: reset

   Stops and removes everything and restores the state of the object.
   */
  reset() {
    if (this.currentGraph != null) {
      this.dragExit(this.currentGraph);
      this.currentGraph = null;
    }
    this.removeDragElement();
    this.removeListeners();
    this.stopDrag();
  }

  /**
   Function: mouseDown

   Returns the drop target for the given graph and coordinates. This
   implementation uses <mxGraph.getCellAt>.

   To ignore popup menu events for a drag source, this function can be
   overridden as follows.

   (code)
   var mouseDown = dragSource.mouseDown;

   dragSource.mouseDown = function(evt)
   {
       if (!mxEvent.isPopupTrigger(evt))
       {
         mouseDown.apply(this, arguments);
       }
    };
   (end)
   */
  mouseDown(evt) {
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
   Function: startDrag

   Creates the <dragElement> using <createDragElement>.
   */
  startDrag(evt) {
    this.dragElement = this.createDragElement(evt);
    this.dragElement.style.position = 'absolute';
    this.dragElement.style.zIndex = this.dragElementZIndex;
    mxUtils.setOpacity(this.dragElement, this.dragElementOpacity);
    if (this.checkEventSource && mxClient.IS_SVG) {
      this.dragElement.style.pointerEvents = 'none';
    }
  }

  /**
   Function: stopDrag

   Invokes <removeDragElement>.
   */
  stopDrag() {
    this.removeDragElement();
  }

  /**
   Function: removeDragElement

   Removes and destroys the <dragElement>.
   */
  removeDragElement() {
    if (this.dragElement != null) {
      if (this.dragElement.parentNode != null) {
        this.dragElement.parentNode.removeChild(this.dragElement);
      }
      this.dragElement = null;
    }
  }

  /**
   Function: getElementForEvent

   Returns the topmost element under the given event.
   */
  getElementForEvent(evt) {
    return ((mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt)) ? document.elementFromPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt)) : mxEvent.getSource(evt));
  }

  /**
   Function: graphContainsEvent

   Returns true if the given graph contains the given event.
   */
  graphContainsEvent(graph, evt) {
    var x = mxEvent.getClientX(evt);
    var y = mxEvent.getClientY(evt);
    var offset = mxUtils.getOffset(graph.container);
    var origin = mxUtils.getScrollOrigin();
    var elt = this.getElementForEvent(evt);
    if (this.checkEventSource) {
      while (elt != null && elt != graph.container) {
        elt = elt.parentNode;
      }
    }
    return elt != null && x >= offset.x - origin.x && y >= offset.y - origin.y && x <= offset.x - origin.x + graph.container.offsetWidth && y <= offset.y - origin.y + graph.container.offsetHeight;
  }

  /**
   Function: mouseMove

   Gets the graph for the given event using <getGraphForEvent>, updates the
   <currentGraph>, calling <dragEnter> and <dragExit> on the new and old graph,
   respectively, and invokes <dragOver> if <currentGraph> is not null.
   */
  mouseMove(evt) {
    var graph = this.getGraphForEvent(evt);
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
      var x = mxEvent.getClientX(evt);
      var y = mxEvent.getClientY(evt);
      if (this.dragElement.parentNode == null) {
        document.body.appendChild(this.dragElement);
      }
      this.dragElement.style.visibility = 'visible';
      if (this.dragOffset != null) {
        x += this.dragOffset.x;
        y += this.dragOffset.y;
      }
      var offset = mxUtils.getDocumentScrollOrigin(document);
      this.dragElement.style.left = (x + offset.x) + 'px';
      this.dragElement.style.top = (y + offset.y) + 'px';
    } else if (this.dragElement != null) {
      this.dragElement.style.visibility = 'hidden';
    }
    mxEvent.consume(evt);
  }

  /**
   Function: mouseUp

   Processes the mouse up event and invokes <drop>, <dragExit> and <stopDrag>
   as required.
   */
  mouseUp(evt) {
    if (this.currentGraph != null) {
      if (this.currentPoint != null && (this.previewElement == null || this.previewElement.style.visibility != 'hidden')) {
        var scale = this.currentGraph.view.scale;
        var tr = this.currentGraph.view.translate;
        var x = this.currentPoint.x / scale - tr.x;
        var y = this.currentPoint.y / scale - tr.y;
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
   Function: removeListeners

   Actives the given graph as a drop target.
   */
  removeListeners() {
    if (this.eventSource != null) {
      mxEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
      this.eventSource = null;
    }
    mxEvent.removeGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
  }

  /**
   Function: dragEnter

   Actives the given graph as a drop target.
   */
  dragEnter(graph, evt) {
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
   Function: dragExit

   Deactivates the given graph as a drop target.
   */
  dragExit(graph, evt) {
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
   Function: dragOver

   Implements autoscroll, updates the <currentPoint>, highlights any drop
   targets and updates the preview.
   */
  dragOver(graph, evt) {
    var offset = mxUtils.getOffset(graph.container);
    var origin = mxUtils.getScrollOrigin(graph.container);
    var x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
    var y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;
    if (graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
      graph.scrollPointToVisible(x, y, graph.autoExtend);
    }
    if (this.currentHighlight != null && graph.isDropEnabled()) {
      this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
      var state = graph.getView().getState(this.currentDropTarget);
      this.currentHighlight.highlight(state);
    }
    if (this.previewElement != null) {
      if (this.previewElement.parentNode == null) {
        graph.container.appendChild(this.previewElement);
        this.previewElement.style.zIndex = '3';
        this.previewElement.style.position = 'absolute';
      }
      var gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
      var hideGuide = true;
      if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
        var w = parseInt(this.previewElement.style.width);
        var h = parseInt(this.previewElement.style.height);
        var bounds = new mxRectangle(0, 0, w, h);
        var delta = new mxPoint(x, y);
        delta = this.currentGuide.move(bounds, delta, gridEnabled, true);
        hideGuide = false;
        x = delta.x;
        y = delta.y;
      } else if (gridEnabled) {
        var scale = graph.view.scale;
        var tr = graph.view.translate;
        var off = graph.gridSize / 2;
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
   Function: drop

   Returns the drop target for the given graph and coordinates. This
   implementation uses <mxGraph.getCellAt>.
   */
  drop(graph, evt, dropTarget, x, y) {
    this.dropHandler.apply(this, arguments);
    if (graph.container.style.visibility != 'hidden') {
      graph.container.focus();
    }
  }
};
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
