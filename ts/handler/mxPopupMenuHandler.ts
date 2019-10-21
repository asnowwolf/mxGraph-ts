/**
 * Class: mxPopupMenuHandler
 *
 * Event handler that creates popupmenus.
 *
 * Constructor: mxPopupMenuHandler
 *
 * Constructs an event handler that creates a <mxPopupMenu>.
 */
import { mxEvent } from '../util/mxEvent';
import { mxPopupMenu } from '../util/mxPopupMenu';
import { mxUtils } from '../util/mxUtils';

export class mxPopupMenuHandler {
  constructor(graph: mxGraph, factoryMethod: any) {
    if (!!graph) {
      this.graph = graph;
      this.factoryMethod = factoryMethod;
      this.graph.addMouseListener(this);
      this.gestureHandler = mxUtils.bind(this, function (sender, eo) {
        this.inTolerance = false;
      });
      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);
      this.init();
    }
  }

  graph: mxGraph;
  factoryMethod: any;
  gestureHandler: Function;
  inTolerance: boolean;
  /**
   * Variable: selectOnPopup
   *
   * Specifies if cells should be selected if a popupmenu is displayed for
   * them. Default is true.
   * @example true
   */
  selectOnPopup: boolean;
  /**
   * Variable: clearSelectionOnBackground
   *
   * Specifies if cells should be deselected if a popupmenu is displayed for
   * the diagram background. Default is true.
   * @example true
   */
  clearSelectionOnBackground: boolean;
  /**
   * Variable: triggerX
   *
   * X-coordinate of the mouse down event.
   */
  triggerX: any;
  /**
   * Variable: triggerY
   *
   * Y-coordinate of the mouse down event.
   */
  triggerY: any;
  /**
   * Variable: screenX
   *
   * Screen X-coordinate of the mouse down event.
   */
  screenX: any;
  /**
   * Variable: screenY
   *
   * Screen Y-coordinate of the mouse down event.
   */
  screenY: any;
  popupTrigger: any;

  /**
   * Function: init
   *
   * Initializes the shapes required for this vertex handler.
   */
  init(): void {
    mxPopupMenu.prototype.init.apply(this);
    mxEvent.addGestureListeners(this.div, mxUtils.bind(this, function (evt) {
      this.graph.tooltipHandler.hide();
    }));
  }

  /**
   * Function: isSelectOnPopup
   *
   * Hook for returning if a cell should be selected for a given <mxMouseEvent>.
   * This implementation returns <selectOnPopup>.
   */
  isSelectOnPopup(me: any): boolean {
    return this.selectOnPopup;
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by initiating the panning. By consuming the event all
   * subsequent events of the gesture are redirected to this handler.
   */
  mouseDown(sender: any, me: any): void {
    if (this.isEnabled() && !mxEvent.isMultiTouchEvent(me.getEvent())) {
      this.hideMenu();
      this.triggerX = me.getGraphX();
      this.triggerY = me.getGraphY();
      this.screenX = mxEvent.getMainEvent(me.getEvent()).screenX;
      this.screenY = mxEvent.getMainEvent(me.getEvent()).screenY;
      this.popupTrigger = this.isPopupTrigger(me);
      this.inTolerance = true;
    }
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating the panning on the graph.
   */
  mouseMove(sender: any, me: any): void {
    if (this.inTolerance && !!this.screenX && !!this.screenY) {
      if (Math.abs(mxEvent.getMainEvent(me.getEvent()).screenX - this.screenX) > this.graph.tolerance || Math.abs(mxEvent.getMainEvent(me.getEvent()).screenY - this.screenY) > this.graph.tolerance) {
        this.inTolerance = false;
      }
    }
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by setting the translation on the view or showing the
   * popupmenu.
   */
  mouseUp(sender: any, me: any): void {
    if (this.popupTrigger && this.inTolerance && !!this.triggerX && !!this.triggerY) {
      const cell = this.getCellForPopupEvent(me);
      if (this.graph.isEnabled() && this.isSelectOnPopup(me) && !!cell && !this.graph.isCellSelected(cell)) {
        this.graph.setSelectionCell(cell);
      } else if (this.clearSelectionOnBackground && !cell) {
        this.graph.clearSelection();
      }
      this.graph.tooltipHandler.hide();
      const origin = mxUtils.getScrollOrigin();
      this.popup(me.getX() + origin.x + 1, me.getY() + origin.y + 1, cell, me.getEvent());
      me.consume();
    }
    this.popupTrigger = false;
    this.inTolerance = false;
  }

  /**
   * Function: getCellForPopupEvent
   *
   * Hook to return the cell for the mouse up popup trigger handling.
   */
  getCellForPopupEvent(me: any): any {
    return me.getCell();
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.gestureHandler);
    mxPopupMenu.prototype.destroy.apply(this);
  }
}
