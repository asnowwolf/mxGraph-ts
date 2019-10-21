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
 */
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxUtils } from '../util/mxUtils';

export class mxPanningHandler {
  constructor(graph: mxGraph) {
    if (!!graph) {
      this.graph = graph;
      this.graph.addMouseListener(this);
      this.forcePanningHandler = (sender, evt) => {
        const evtName = evt.getProperty('eventName');
        const me = evt.getProperty('event');
        if (evtName == mxEvent.MOUSE_DOWN && this.isForcePanningEvent(me)) {
          this.start(me);
          this.active = true;
          this.fireEvent(new mxEventObject(mxEvent.PAN_START, 'event', me));
          me.consume();
        }
      };
      this.graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.forcePanningHandler);
      this.gestureHandler = (sender, eo) => {
        if (this.isPinchEnabled()) {
          const evt = eo.getProperty('event');
          if (!mxEvent.isConsumed(evt) && evt.type == 'gesturestart') {
            this.initialScale = this.graph.view.scale;
            if (!this.active && !!this.mouseDownEvent) {
              this.start(this.mouseDownEvent);
              this.mouseDownEvent = undefined;
            }
          } else if (evt.type == 'gestureend' && !!this.initialScale) {
            this.initialScale = undefined;
          }
          if (!!this.initialScale) {
            let value = Math.round(this.initialScale * evt.scale * 100) / 100;
            if (!!this.minScale) {
              value = Math.max(this.minScale, value);
            }
            if (!!this.maxScale) {
              value = Math.min(this.maxScale, value);
            }
            if (this.graph.view.scale != value) {
              this.graph.zoomTo(value);
              mxEvent.consume(evt);
            }
          }
        }
      };
      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);
      this.mouseUpListener = () => {
        if (this.active) {
          this.reset();
        }
      };
      mxEvent.addListener(document, 'mouseup', this.mouseUpListener);
    }
  }

  graph: mxGraph;
  forcePanningHandler: Function;
  /**
   * @example true
   */
  active: boolean;
  gestureHandler: Function;
  initialScale: any;
  mouseDownEvent: any;
  mouseUpListener: Function;
  /**
   * Variable: useLeftButtonForPanning
   *
   * Specifies if panning should be active for the left mouse button.
   * Setting this to true may conflict with <mxRubberband>. Default is false.
   */
  useLeftButtonForPanning: boolean;
  /**
   * Variable: usePopupTrigger
   *
   * Specifies if <mxEvent.isPopupTrigger> should also be used for panning.
   * @example true
   */
  usePopupTrigger: boolean;
  /**
   * Variable: ignoreCell
   *
   * Specifies if panning should be active even if there is a cell under the
   * mousepointer. Default is false.
   */
  ignoreCell: boolean;
  /**
   * Variable: previewEnabled
   *
   * Specifies if the panning should be previewed. Default is true.
   * @example true
   */
  previewEnabled: boolean;
  /**
   * Variable: useGrid
   *
   * Specifies if the panning steps should be aligned to the grid size.
   * Default is false.
   */
  useGrid: boolean;
  /**
   * Variable: panningEnabled
   *
   * Specifies if panning should be enabled. Default is true.
   * @example true
   */
  panningEnabled: boolean;
  /**
   * Variable: pinchEnabled
   *
   * Specifies if pinch gestures should be handled as zoom. Default is true.
   * @example true
   */
  pinchEnabled: boolean;
  /**
   * Variable: maxScale
   *
   * Specifies the maximum scale. Default is 8.
   * @example 8
   */
  maxScale: number;
  /**
   * Variable: minScale
   *
   * Specifies the minimum scale. Default is 0.01.
   * @example 0.01
   */
  minScale: number;
  /**
   * Variable: dx
   *
   * Holds the current horizontal offset.
   */
  dx: number;
  /**
   * Variable: dy
   *
   * Holds the current vertical offset.
   */
  dy: number;
  /**
   * Variable: startX
   *
   * Holds the x-coordinate of the start point.
   */
  startX: number;
  /**
   * Variable: startY
   *
   * Holds the y-coordinate of the start point.
   */
  startY: number;
  dx0: string;
  dy0: string;
  /**
   * @example true
   */
  panningTrigger: boolean;

  /**
   * Function: isActive
   *
   * Returns true if the handler is currently active.
   */
  isActive(): boolean {
    return this.active || !!this.initialScale;
  }

  /**
   * Function: isPanningEnabled
   *
   * Returns <panningEnabled>.
   */
  isPanningEnabled(): boolean {
    return this.panningEnabled;
  }

  /**
   * Function: setPanningEnabled
   *
   * Sets <panningEnabled>.
   */
  setPanningEnabled(value: any): void {
    this.panningEnabled = value;
  }

  /**
   * Function: isPinchEnabled
   *
   * Returns <pinchEnabled>.
   */
  isPinchEnabled(): boolean {
    return this.pinchEnabled;
  }

  /**
   * Function: setPinchEnabled
   *
   * Sets <pinchEnabled>.
   */
  setPinchEnabled(value: any): void {
    this.pinchEnabled = value;
  }

  /**
   * Function: isPanningTrigger
   *
   * Returns true if the given event is a panning trigger for the optional
   * given cell. This returns true if control-shift is pressed or if
   * <usePopupTrigger> is true and the event is a popup trigger.
   */
  isPanningTrigger(me: any): boolean {
    const evt = me.getEvent();
    return (this.useLeftButtonForPanning && !me.getState() && mxEvent.isLeftMouseButton(evt)) || (mxEvent.isControlDown(evt) && mxEvent.isShiftDown(evt)) || (this.usePopupTrigger && mxEvent.isPopupTrigger(evt));
  }

  /**
   * Function: isForcePanningEvent
   *
   * Returns true if the given <mxMouseEvent> should start panning. This
   * implementation always returns true if <ignoreCell> is true or for
   * multi touch events.
   */
  isForcePanningEvent(me: any): boolean {
    return this.ignoreCell || mxEvent.isMultiTouchEvent(me.getEvent());
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by initiating the panning. By consuming the event all
   * subsequent events of the gesture are redirected to this handler.
   */
  mouseDown(sender: any, me: any): void {
    this.mouseDownEvent = me;
    if (!me.isConsumed() && this.isPanningEnabled() && !this.active && this.isPanningTrigger(me)) {
      this.start(me);
      this.consumePanningTrigger(me);
    }
  }

  /**
   * Function: start
   *
   * Starts panning at the given event.
   */
  start(me: any): void {
    this.dx0 = -this.graph.container.scrollLeft;
    this.dy0 = -this.graph.container.scrollTop;
    this.startX = me.getX();
    this.startY = me.getY();
    this.dx = undefined;
    this.dy = undefined;
    this.panningTrigger = true;
  }

  /**
   * Function: consumePanningTrigger
   *
   * Consumes the given <mxMouseEvent> if it was a panning trigger in
   * <mouseDown>. The default is to invoke <mxMouseEvent.consume>. Note that this
   * will block any further event processing. If you haven't disabled built-in
   * context menus and require immediate selection of the cell on mouseDown in
   * Safari and/or on the Mac, then use the following code:
   *
   * (code)
   * mxPanningHandler.prototype.consumePanningTrigger = function(me)
   * {
   *   if (me.evt.preventDefault)
   *   {
   *     me.evt.preventDefault();
   *   }
   *
   *   // Stops event processing in IE
   *   me.evt.returnValue = false;
   *
   *   // Sets local consumed state
   *   if (!mxClient.IS_SF && !mxClient.IS_MAC)
   *   {
   *     me.consumed = true;
   *   }
   * };
   * (end)
   */
  consumePanningTrigger(me: any): void {
    me.consume();
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating the panning on the graph.
   */
  mouseMove(sender: any, me: any): void {
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
      const tmp = this.active;
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
   * Function: mouseUp
   *
   * Handles the event by setting the translation on the view or showing the
   * popupmenu.
   */
  mouseUp(sender: any, me: any): void {
    if (this.active) {
      if (!!this.dx && !!this.dy) {
        if (!this.graph.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.graph.container)) {
          const scale = this.graph.getView().scale;
          const t = this.graph.getView().translate;
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
   * Function: mouseUp
   *
   * Handles the event by setting the translation on the view or showing the
   * popupmenu.
   */
  reset(): void {
    this.panningTrigger = false;
    this.mouseDownEvent = undefined;
    this.active = false;
    this.dx = undefined;
    this.dy = undefined;
  }

  /**
   * Function: panGraph
   *
   * Pans <graph> by the given amount.
   */
  panGraph(dx: number, dy: number): void {
    this.graph.getView().setTranslate(dx, dy);
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.forcePanningHandler);
    this.graph.removeListener(this.gestureHandler);
    mxEvent.removeListener(document, 'mouseup', this.mouseUpListener);
  }
}
