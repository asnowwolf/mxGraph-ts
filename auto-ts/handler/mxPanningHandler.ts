/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxPanningHandler
 *
 * Event handler that pans and creates popupmenus. To use the left
 * mousebutton for panning without interfering with cell moving and
 * resizing, use <isUseLeftButton> and <isIgnoreCell>. For grid size
 * steps while panning, use <useGrid>. This handler is built-into
 * <mxGraph.panningHandler> and enabled using <mxGraph.setPanning>.
 *
 * Constructor: mxPanningHandler
 *
 * Constructs an event handler that creates a <mxPopupMenu>
 * and pans the graph.
 *
 * Event: mxEvent.PAN_START
 *
 * Fires when the panning handler changes its <active> state to true. The
 * <code>event</code> property contains the corresponding <mxMouseEvent>.
 *
 * Event: mxEvent.PAN
 *
 * Fires while handle is processing events. The <code>event</code> property contains
 * the corresponding <mxMouseEvent>.
 *
 * Event: mxEvent.PAN_END
 *
 * Fires when the panning handler changes its <active> state to false. The
 * <code>event</code> property contains the corresponding <mxMouseEvent>.
 * @class
 */
export class mxPanningHandler extends mxEventSource {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxPanningHandler

   Event handler that pans and creates popupmenus. To use the left
   mousebutton for panning without interfering with cell moving and
   resizing, use <isUseLeftButton> and <isIgnoreCell>. For grid size
   steps while panning, use <useGrid>. This handler is built-into
   <mxGraph.panningHandler> and enabled using <mxGraph.setPanning>.

   Constructor: mxPanningHandler

   Constructs an event handler that creates a <mxPopupMenu>
   and pans the graph.

   Event: mxEvent.PAN_START

   Fires when the panning handler changes its <active> state to true. The
   <code>event</code> property contains the corresponding <mxMouseEvent>.

   Event: mxEvent.PAN

   Fires while handle is processing events. The <code>event</code> property contains
   the corresponding <mxMouseEvent>.

   Event: mxEvent.PAN_END

   Fires when the panning handler changes its <active> state to false. The
   <code>event</code> property contains the corresponding <mxMouseEvent>.
   */
  constructor(graph) {
    if (graph != null) {
      this.graph = graph;
      this.graph.addMouseListener(this);
      this.forcePanningHandler = mxUtils.bind(this, function (sender, evt) {
        var evtName = evt.getProperty('eventName');
        var me = evt.getProperty('event');
        if (evtName == mxEvent.MOUSE_DOWN && this.isForcePanningEvent(me)) {
          this.start(me);
          this.active = true;
          this.fireEvent(new mxEventObject(mxEvent.PAN_START, 'event', me));
          me.consume();
        }
      });
      this.graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.forcePanningHandler);
      this.gestureHandler = mxUtils.bind(this, function (sender, eo) {
        if (this.isPinchEnabled()) {
          var evt = eo.getProperty('event');
          if (!mxEvent.isConsumed(evt) && evt.type == 'gesturestart') {
            this.initialScale = this.graph.view.scale;
            if (!this.active && this.mouseDownEvent != null) {
              this.start(this.mouseDownEvent);
              this.mouseDownEvent = null;
            }
          } else if (evt.type == 'gestureend' && this.initialScale != null) {
            this.initialScale = null;
          }
          if (this.initialScale != null) {
            var value = Math.round(this.initialScale * evt.scale * 100) / 100;
            if (this.minScale != null) {
              value = Math.max(this.minScale, value);
            }
            if (this.maxScale != null) {
              value = Math.min(this.maxScale, value);
            }
            if (this.graph.view.scale != value) {
              this.graph.zoomTo(value);
              mxEvent.consume(evt);
            }
          }
        }
      });
      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);
      this.mouseUpListener = mxUtils.bind(this, function () {
        if (this.active) {
          this.reset();
        }
      });
      mxEvent.addListener(document, 'mouseup', this.mouseUpListener);
    }
  }

  /**
   Variable: graph

   Reference to the enclosing <mxGraph>.
   */
  graph = null;
  /**
   Variable: useLeftButtonForPanning

   Specifies if panning should be active for the left mouse button.
   Setting this to true may conflict with <mxRubberband>. Default is false.
   */
  useLeftButtonForPanning = false;
  /**
   Variable: usePopupTrigger

   Specifies if <mxEvent.isPopupTrigger> should also be used for panning.
   */
  usePopupTrigger = true;
  /**
   Variable: ignoreCell

   Specifies if panning should be active even if there is a cell under the
   mousepointer. Default is false.
   */
  ignoreCell = false;
  /**
   Variable: previewEnabled

   Specifies if the panning should be previewed. Default is true.
   */
  previewEnabled = true;
  /**
   Variable: useGrid

   Specifies if the panning steps should be aligned to the grid size.
   Default is false.
   */
  useGrid = false;
  /**
   Variable: panningEnabled

   Specifies if panning should be enabled. Default is true.
   */
  panningEnabled = true;
  /**
   Variable: pinchEnabled

   Specifies if pinch gestures should be handled as zoom. Default is true.
   */
  pinchEnabled = true;
  /**
   Variable: maxScale

   Specifies the maximum scale. Default is 8.
   */
  maxScale = 8;
  /**
   Variable: minScale

   Specifies the minimum scale. Default is 0.01.
   */
  minScale = 0.01;
  /**
   Variable: dx

   Holds the current horizontal offset.
   */
  dx = null;
  /**
   Variable: dy

   Holds the current vertical offset.
   */
  dy = null;
  /**
   Variable: startX

   Holds the x-coordinate of the start point.
   */
  startX = 0;
  /**
   Variable: startY

   Holds the y-coordinate of the start point.
   */
  startY = 0;

  /**
   Function: isActive

   Returns true if the handler is currently active.
   */
  isActive() {
    return this.active || this.initialScale != null;
  }

  /**
   Function: isPanningEnabled

   Returns <panningEnabled>.
   */
  isPanningEnabled() {
    return this.panningEnabled;
  }

  /**
   Function: setPanningEnabled

   Sets <panningEnabled>.
   */
  setPanningEnabled(value) {
    this.panningEnabled = value;
  }

  /**
   Function: isPinchEnabled

   Returns <pinchEnabled>.
   */
  isPinchEnabled() {
    return this.pinchEnabled;
  }

  /**
   Function: setPinchEnabled

   Sets <pinchEnabled>.
   */
  setPinchEnabled(value) {
    this.pinchEnabled = value;
  }

  /**
   Function: isPanningTrigger

   Returns true if the given event is a panning trigger for the optional
   given cell. This returns true if control-shift is pressed or if
   <usePopupTrigger> is true and the event is a popup trigger.
   */
  isPanningTrigger(me) {
    var evt = me.getEvent();
    return (this.useLeftButtonForPanning && me.getState() == null && mxEvent.isLeftMouseButton(evt)) || (mxEvent.isControlDown(evt) && mxEvent.isShiftDown(evt)) || (this.usePopupTrigger && mxEvent.isPopupTrigger(evt));
  }

  /**
   Function: isForcePanningEvent

   Returns true if the given <mxMouseEvent> should start panning. This
   implementation always returns true if <ignoreCell> is true or for
   multi touch events.
   */
  isForcePanningEvent(me) {
    return this.ignoreCell || mxEvent.isMultiTouchEvent(me.getEvent());
  }

  /**
   Function: mouseDown

   Handles the event by initiating the panning. By consuming the event all
   subsequent events of the gesture are redirected to this handler.
   */
  mouseDown(sender, me) {
    this.mouseDownEvent = me;
    if (!me.isConsumed() && this.isPanningEnabled() && !this.active && this.isPanningTrigger(me)) {
      this.start(me);
      this.consumePanningTrigger(me);
    }
  }

  /**
   Function: start

   Starts panning at the given event.
   */
  start(me) {
    this.dx0 = -this.graph.container.scrollLeft;
    this.dy0 = -this.graph.container.scrollTop;
    this.startX = me.getX();
    this.startY = me.getY();
    this.dx = null;
    this.dy = null;
    this.panningTrigger = true;
  }

  /**
   Function: consumePanningTrigger

   Consumes the given <mxMouseEvent> if it was a panning trigger in
   <mouseDown>. The default is to invoke <mxMouseEvent.consume>. Note that this
   will block any further event processing. If you haven't disabled built-in
   context menus and require immediate selection of the cell on mouseDown in
   Safari and/or on the Mac, then use the following code:

   (code)
   mxPanningHandler.prototype.consumePanningTrigger = function(me)
   {
       if (me.evt.preventDefault)
       {
         me.evt.preventDefault();
       }
    
       // Stops event processing in IE
       me.evt.returnValue = false;
    
       // Sets local consumed state
       if (!mxClient.IS_SF && !mxClient.IS_MAC)
       {
         me.consumed = true;
       }
    };
   (end)
   */
  consumePanningTrigger(me) {
    me.consume();
  }

  /**
   Function: mouseMove

   Handles the event by updating the panning on the graph.
   */
  mouseMove(sender, me) {
    this.dx = me.getX() - this.startX;
    this.dy = me.getY() - this.startY;
    if (this.active) {
      if (this.previewEnabled) {
        if (this.useGrid) {
          this.dx = this.graph.snap(this.dx);
          this.dy = this.graph.snap(this.dy);
        }
        this.graph.panGraph(this.dx + this.dx0, this.dy + this.dy0);
      }
      this.fireEvent(new mxEventObject(mxEvent.PAN, 'event', me));
    } else if (this.panningTrigger) {
      var tmp = this.active;
      this.active = Math.abs(this.dx) > this.graph.tolerance || Math.abs(this.dy) > this.graph.tolerance;
      if (!tmp && this.active) {
        this.fireEvent(new mxEventObject(mxEvent.PAN_START, 'event', me));
      }
    }
    if (this.active || this.panningTrigger) {
      me.consume();
    }
  }

  /**
   Function: mouseUp

   Handles the event by setting the translation on the view or showing the
   popupmenu.
   */
  mouseUp(sender, me) {
    if (this.active) {
      if (this.dx != null && this.dy != null) {
        if (!this.graph.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.graph.container)) {
          var scale = this.graph.getView().scale;
          var t = this.graph.getView().translate;
          this.graph.panGraph(0, 0);
          this.panGraph(t.x + this.dx / scale, t.y + this.dy / scale);
        }
        me.consume();
      }
      this.fireEvent(new mxEventObject(mxEvent.PAN_END, 'event', me));
    }
    this.reset();
  }

  /**
   Function: mouseUp

   Handles the event by setting the translation on the view or showing the
   popupmenu.
   */
  reset() {
    this.panningTrigger = false;
    this.mouseDownEvent = null;
    this.active = false;
    this.dx = null;
    this.dy = null;
  }

  /**
   Function: panGraph

   Pans <graph> by the given amount.
   */
  panGraph(dx, dy) {
    this.graph.getView().setTranslate(dx, dy);
  }

  /**
   Function: destroy

   Destroys the handler and all its resources and DOM nodes.
   */
  destroy() {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.forcePanningHandler);
    this.graph.removeListener(this.gestureHandler);
    mxEvent.removeListener(document, 'mouseup', this.mouseUpListener);
  }
};
