/**
 * Class: mxMouseEvent
 *
 * Base class for all mouse events in mxGraph. A listener for this event should
 * implement the following methods:
 *
 * (code)
 * graph.addMouseListener(
 * {
 *   mouseDown: function(sender, evt)
 *   {
 *     mxLog.debug('mouseDown');
 *   },
 *   mouseMove: function(sender, evt)
 *   {
 *     mxLog.debug('mouseMove');
 *   },
 *   mouseUp: function(sender, evt)
 *   {
 *     mxLog.debug('mouseUp');
 *   }
 * });
 * (end)
 *
 * Constructor: mxMouseEvent
 *
 * Constructs a new event object for the given arguments.
 *
 * Parameters:
 *
 * evt - Native mouse event.
 * state - Optional <mxCellState> under the mouse.
 */
import { mxClient } from '../mxClient';
import { mxEvent } from './mxEvent';
import { mxUtils } from './mxUtils';

export class mxMouseEvent {
  constructor(evt: Event, state: any) {
    this.evt = evt;
    this.state = state;
    this.sourceState = state;
  }

  evt: Event;
  state: any;
  sourceState: any;
  /**
   * Variable: consumed
   *
   * Holds the consumed state of this event.
   */
  consumed: boolean;
  /**
   * Variable: graphX
   *
   * Holds the x-coordinate of the event in the graph. This value is set in
   * <mxGraph.fireMouseEvent>.
   */
  graphX: any;
  /**
   * Variable: graphY
   *
   * Holds the y-coordinate of the event in the graph. This value is set in
   * <mxGraph.fireMouseEvent>.
   */
  graphY: any;

  /**
   * Function: getEvent
   *
   * Returns <evt>.
   */
  getEvent(): any {
    return this.evt;
  }

  /**
   * Function: getSource
   *
   * Returns the target DOM element using <mxEvent.getSource> for <evt>.
   */
  getSource(): any {
    return mxEvent.getSource(this.evt);
  }

  /**
   * Function: isSource
   *
   * Returns true if the given <mxShape> is the source of <evt>.
   */
  isSource(shape: any): boolean {
    if (!!shape) {
      return mxUtils.isAncestorNode(shape.node, this.getSource());
    }
    return false;
  }

  /**
   * Function: getX
   *
   * Returns <evt.clientX>.
   */
  getX(): any {
    return mxEvent.getClientX(this.getEvent());
  }

  /**
   * Function: getY
   *
   * Returns <evt.clientY>.
   */
  getY(): any {
    return mxEvent.getClientY(this.getEvent());
  }

  /**
   * Function: getGraphX
   *
   * Returns <graphX>.
   */
  getGraphX(): any {
    return this.graphX;
  }

  /**
   * Function: getGraphY
   *
   * Returns <graphY>.
   */
  getGraphY(): any {
    return this.graphY;
  }

  /**
   * Function: getState
   *
   * Returns <state>.
   */
  getState(): any {
    return this.state;
  }

  /**
   * Function: getCell
   *
   * Returns the <mxCell> in <state> is not null.
   */
  getCell(): any {
    const state = this.getState();
    if (!!state) {
      return state.cell;
    }
    return null;
  }

  /**
   * Function: isPopupTrigger
   *
   * Returns true if the event is a popup trigger.
   */
  isPopupTrigger(): boolean {
    return mxEvent.isPopupTrigger(this.getEvent());
  }

  /**
   * Function: isConsumed
   *
   * Returns <consumed>.
   */
  isConsumed(): boolean {
    return this.consumed;
  }

  /**
   * Function: consume
   *
   * Sets <consumed> to true and invokes preventDefault on the native event
   * if such a method is defined. This is used mainly to avoid the cursor from
   * being changed to a text cursor in Webkit. You can use the preventDefault
   * flag to disable this functionality.
   *
   * Parameters:
   *
   * preventDefault - Specifies if the native event should be canceled. Default
   * is true.
   */
  consume(preventDefault: any): void {
    preventDefault = (!!preventDefault) ? preventDefault : mxEvent.isMouseEvent(this.evt);
    if (preventDefault && this.evt.preventDefault) {
      this.evt.preventDefault();
    }
    if (mxClient.IS_IE) {
      this.evt.returnValue = true;
    }
    this.consumed = true;
  }
}
