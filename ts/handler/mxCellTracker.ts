/**
 * Class: mxCellTracker
 *
 * Event handler that highlights cells. Inherits from <mxCellMarker>.
 *
 * Example:
 *
 * (code)
 * new mxCellTracker(graph, '#00FF00');
 * (end)
 *
 * For detecting dragEnter, dragOver and dragLeave on cells, the following
 * code can be used:
 *
 * (code)
 * graph.addMouseListener(
 * {
 *   cell: null,
 *   mouseDown: function(sender, me) { },
 *   mouseMove: function(sender, me)
 *   {
 *     var tmp = me.getCell();
 *
 *     if (tmp != this.cell)
 *     {
 *       if (!!this.cell)
 *       {
 *         this.dragLeave(me.getEvent(), this.cell);
 *       }
 *
 *       this.cell = tmp;
 *
 *       if (!!this.cell)
 *       {
 *         this.dragEnter(me.getEvent(), this.cell);
 *       }
 *     }
 *
 *     if (!!this.cell)
 *     {
 *       this.dragOver(me.getEvent(), this.cell);
 *     }
 *   },
 *   mouseUp: function(sender, me) { },
 *   dragEnter: function(evt, cell)
 *   {
 *     mxLog.debug('dragEnter', cell.value);
 *   },
 *   dragOver: function(evt, cell)
 *   {
 *     mxLog.debug('dragOver', cell.value);
 *   },
 *   dragLeave: function(evt, cell)
 *   {
 *     mxLog.debug('dragLeave', cell.value);
 *   }
 * });
 * (end)
 *
 * Constructor: mxCellTracker
 *
 * Constructs an event handler that highlights cells.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * color - Color of the highlight. Default is blue.
 * funct - Optional JavaScript function that is used to override
 * <mxCellMarker.getCell>.
 */
import { mxClient } from '../mxClient';
import { mxEvent } from '../util/mxEvent';
import { mxCellMarker } from './mxCellMarker';

export class mxCellTracker extends mxCellMarker {
  constructor(graph: mxGraph, color: string, funct: Function) {
    super(graph, color);
    this.graph.addMouseListener(this);
    if (!!funct) {
      this.getCell = funct;
    }
    if (mxClient.IS_IE) {
      mxEvent.addListener(window, 'unload', () => {
        this.destroy();
      });
    }
  }

  getCell: any;
  /**
   * @example true
   */
  destroyed: boolean = true;

  /**
   * Function: mouseDown
   *
   * Ignores the event. The event is not consumed.
   */
  mouseDown(sender: any, me: any): void {
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by highlighting the cell under the mousepointer if it
   * is over the hotspot region of the cell.
   */
  mouseMove(sender: any, me: any): void {
    if (this.isEnabled()) {
      this.process(me);
    }
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by reseting the highlight.
   */
  mouseUp(sender: any, me: any): void {
  }

  /**
   * Function: destroy
   *
   * Destroys the object and all its resources and DOM nodes. This doesn't
   * normally need to be called. It is called automatically when the window
   * unloads.
   */
  destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true;
      this.graph.removeMouseListener(this);
      mxCellMarker.prototype.destroy.apply(this);
    }
  }
}
