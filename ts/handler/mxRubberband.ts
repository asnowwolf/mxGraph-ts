/**
 * Class: mxRubberband
 *
 * Event handler that selects rectangular regions. This is not built-into
 * <mxGraph>. To enable rubberband selection in a graph, use the following code.
 *
 * Example:
 *
 * (code)
 * var rubberband = new mxRubberband(graph);
 * (end)
 *
 * Constructor: mxRubberband
 *
 * Constructs an event handler that selects rectangular regions in the graph
 * using rubberband selection.
 */
import { mxClient } from '../mxClient';
import { mxEvent } from '../util/mxEvent';
import { mxMouseEvent } from '../util/mxMouseEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';

export class mxRubberband {
  constructor(graph: mxGraph) {
    if (!!graph) {
      this.graph = graph;
      this.graph.addMouseListener(this);
      this.forceRubberbandHandler = mxUtils.bind(this, function (sender, evt) {
        const evtName = evt.getProperty('eventName');
        const me = evt.getProperty('event');
        if (evtName == mxEvent.MOUSE_DOWN && this.isForceRubberbandEvent(me)) {
          const offset = mxUtils.getOffset(this.graph.container);
          const origin = mxUtils.getScrollOrigin(this.graph.container);
          origin.x -= offset.x;
          origin.y -= offset.y;
          this.start(me.getX() + origin.x, me.getY() + origin.y);
          me.consume(false);
        }
      });
      this.graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.forceRubberbandHandler);
      this.panHandler = mxUtils.bind(this, function () {
        this.repaint();
      });
      this.graph.addListener(mxEvent.PAN, this.panHandler);
      this.gestureHandler = mxUtils.bind(this, function (sender, eo) {
        if (!!this.first) {
          this.reset();
        }
      });
      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);
      if (mxClient.IS_IE) {
        mxEvent.addListener(window, 'unload', mxUtils.bind(this, function () {
          this.destroy();
        }));
      }
    }
  }

  graph: mxGraph;
  forceRubberbandHandler: Function;
  panHandler: Function;
  gestureHandler: Function;
  /**
   * Variable: defaultOpacity
   *
   * Specifies the default opacity to be used for the rubberband div. Default
   * is 20.
   * @example 20
   */
  defaultOpacity: number;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: div
   *
   * Holds the DIV element which is currently visible.
   */
  div: HTMLElement;
  /**
   * Variable: sharedDiv
   *
   * Holds the DIV element which is used to display the rubberband.
   */
  sharedDiv: any;
  /**
   * Variable: currentX
   *
   * Holds the value of the x argument in the last call to <update>.
   */
  currentX: number;
  /**
   * Variable: currentY
   *
   * Holds the value of the y argument in the last call to <update>.
   */
  currentY: number;
  /**
   * Variable: fadeOut
   *
   * Optional fade out effect. Default is false.
   */
  fadeOut: boolean;
  first: mxPoint;
  dragHandler: Function;
  dropHandler: Function;
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * @example true
   */
  destroyed: boolean;

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation returns
   * <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation updates
   * <enabled>.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Function: isForceRubberbandEvent
   *
   * Returns true if the given <mxMouseEvent> should start rubberband selection.
   * This implementation returns true if the alt key is pressed.
   */
  isForceRubberbandEvent(me: any): boolean {
    return mxEvent.isAltDown(me.getEvent());
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by initiating a rubberband selection. By consuming the
   * event all subsequent events of the gesture are redirected to this
   * handler.
   */
  mouseDown(sender: any, me: any): void {
    if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled() && !me.getState() && !mxEvent.isMultiTouchEvent(me.getEvent())) {
      const offset = mxUtils.getOffset(this.graph.container);
      const origin = mxUtils.getScrollOrigin(this.graph.container);
      origin.x -= offset.x;
      origin.y -= offset.y;
      this.start(me.getX() + origin.x, me.getY() + origin.y);
      me.consume(false);
    }
  }

  /**
   * Function: start
   *
   * Sets the start point for the rubberband selection.
   */
  start(x: number, y: number): any {
    this.first = new mxPoint(x, y);
    const container = this.graph.container;

    function createMouseEvent(evt) {
      const me = new mxMouseEvent(evt);
      const pt = mxUtils.convertPoint(container, me.getX(), me.getY());
      me.graphX = pt.x;
      me.graphY = pt.y;
      return me;
    }

    this.dragHandler = mxUtils.bind(this, function (evt) {
      this.mouseMove(this.graph, createMouseEvent(evt));
    });
    this.dropHandler = mxUtils.bind(this, function (evt) {
      this.mouseUp(this.graph, createMouseEvent(evt));
    });
    if (mxClient.IS_FF) {
      mxEvent.addGestureListeners(document, null, this.dragHandler, this.dropHandler);
    }
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating therubberband selection.
   */
  mouseMove(sender: any, me: any): void {
    if (!me.isConsumed() && !!this.first) {
      const origin = mxUtils.getScrollOrigin(this.graph.container);
      const offset = mxUtils.getOffset(this.graph.container);
      origin.x -= offset.x;
      origin.y -= offset.y;
      const x = me.getX() + origin.x;
      const y = me.getY() + origin.y;
      const dx = this.first.x - x;
      const dy = this.first.y - y;
      const tol = this.graph.tolerance;
      if (!!this.div || Math.abs(dx) > tol || Math.abs(dy) > tol) {
        if (!this.div) {
          this.div = this.createShape();
        }
        mxUtils.clearSelection();
        this.update(x, y);
        me.consume();
      }
    }
  }

  /**
   * Function: createShape
   *
   * Creates the rubberband selection shape.
   */
  createShape(): any {
    if (!this.sharedDiv) {
      this.sharedDiv = document.createElement('div');
      this.sharedDiv.className = 'mxRubberband';
      mxUtils.setOpacity(this.sharedDiv, this.defaultOpacity);
    }
    this.graph.container.appendChild(this.sharedDiv);
    const result = this.sharedDiv;
    if (mxClient.IS_SVG && (!mxClient.IS_IE || document.documentMode >= 10) && this.fadeOut) {
      this.sharedDiv = undefined;
    }
    return result;
  }

  /**
   * Function: isActive
   *
   * Returns true if this handler is active.
   */
  isActive(sender: any, me: any): boolean {
    return !!this.div && this.div.style.display != 'none';
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by selecting the region of the rubberband using
   * <mxGraph.selectRegion>.
   */
  mouseUp(sender: any, me: any): void {
    const active = this.isActive();
    this.reset();
    if (active) {
      this.execute(me.getEvent());
      me.consume();
    }
  }

  /**
   * Function: execute
   *
   * Resets the state of this handler and selects the current region
   * for the given event.
   */
  execute(evt: Event): void {
    const rect = new mxRectangle(this.x, this.y, this.width, this.height);
    this.graph.selectRegion(rect, evt);
  }

  /**
   * Function: reset
   *
   * Resets the state of the rubberband selection.
   */
  reset(): void {
    if (!!this.div) {
      if (mxClient.IS_SVG && (!mxClient.IS_IE || document.documentMode >= 10) && this.fadeOut) {
        const temp = this.div;
        mxUtils.setPrefixedStyle(temp.style, 'transition', 'all 0.2s linear');
        temp.style.pointerEvents = 'none';
        temp.style.opacity = 0;
        window.setTimeout(function () {
          temp.parentNode.removeChild(temp);
        }, 200);
      } else {
        this.div.parentNode.removeChild(this.div);
      }
    }
    mxEvent.removeGestureListeners(document, null, this.dragHandler, this.dropHandler);
    this.dragHandler = undefined;
    this.dropHandler = undefined;
    this.currentX = 0;
    this.currentY = 0;
    this.first = undefined;
    this.div = undefined;
  }

  /**
   * Function: update
   *
   * Sets <currentX> and <currentY> and calls <repaint>.
   */
  update(x: number, y: number): void {
    this.currentX = x;
    this.currentY = y;
    this.repaint();
  }

  /**
   * Function: repaint
   *
   * Computes the bounding box and updates the style of the <div>.
   */
  repaint(): void {
    if (!!this.div) {
      const x = this.currentX - this.graph.panDx;
      const y = this.currentY - this.graph.panDy;
      this.x = Math.min(this.first.x, x);
      this.y = Math.min(this.first.y, y);
      this.width = Math.max(this.first.x, x) - this.x;
      this.height = Math.max(this.first.y, y) - this.y;
      const dx = (mxClient.IS_VML) ? this.graph.panDx : 0;
      const dy = (mxClient.IS_VML) ? this.graph.panDy : 0;
      this.div.style.left = (this.x + dx) + 'px';
      this.div.style.top = (this.y + dy) + 'px';
      this.div.style.width = Math.max(1, this.width) + 'px';
      this.div.style.height = Math.max(1, this.height) + 'px';
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes. This does
   * normally not need to be called, it is called automatically when the
   * window unloads.
   */
  destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true;
      this.graph.removeMouseListener(this);
      this.graph.removeListener(this.forceRubberbandHandler);
      this.graph.removeListener(this.panHandler);
      this.reset();
      if (!!this.sharedDiv) {
        this.sharedDiv = undefined;
      }
    }
  }
}
