/**
 * Class: mxCellMarker
 *
 * A helper class to process mouse locations and highlight cells.
 *
 * Helper class to highlight cells. To add a cell marker to an existing graph
 * for highlighting all cells, the following code is used:
 *
 * (code)
 * var marker = new mxCellMarker(graph);
 * graph.addMouseListener({
 *   mouseDown: function() {},
 *   mouseMove: function(sender, me)
 *   {
 *     marker.process(me);
 *   },
 *   mouseUp: function() {}
 * });
 * (end)
 *
 * Event: mxEvent.MARK
 *
 * Fires after a cell has been marked or unmarked. The <code>state</code>
 * property contains the marked <mxCellState> or null if no state is marked.
 *
 * Constructor: mxCellMarker
 *
 * Constructs a new cell marker.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * validColor - Optional marker color for valid states. Default is
 * <mxConstants.DEFAULT_VALID_COLOR>.
 * invalidColor - Optional marker color for invalid states. Default is
 * <mxConstants.DEFAULT_INVALID_COLOR>.
 * hotspot - Portion of the width and hight where a state intersects a
 * given coordinate pair. A value of 0 means always highlight. Default is
 * <mxConstants.DEFAULT_HOTSPOT>.
 */
import { mxCell } from '../model/mxCell';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxEventSource } from '../util/mxEventSource';
import { mxUtils } from '../util/mxUtils';
import { mxCellHighlight } from './mxCellHighlight';

export class mxCellMarker extends mxEventSource {
  constructor(graph: mxGraph, validColor: string = mxConstants.DEFAULT_VALID_COLOR, invalidColor: string = mxConstants.DEFAULT_INVALID_COLOR, hotspot: number = mxConstants.DEFAULT_HOTSPOT) {
    super(graph);
    if (!!graph) {
      this.graph = graph;
      this.highlight = new mxCellHighlight(graph);
    }
  }

  graph: mxGraph;
  validColor: string;
  invalidColor: string;
  hotspot: any;
  highlight: mxCellHighlight;
  /**
   * Variable: enabled
   *
   * Specifies if the marker is enabled. Default is true.
   * @example true
   */
  enabled: boolean = true;
  /**
   * Variable: hotspotEnabled
   *
   * Specifies if the hotspot is enabled. Default is false.
   */
  hotspotEnabled: boolean = true;
  /**
   * Variable: currentColor
   *
   * Holds the current marker color.
   */
  currentColor: string;
  /**
   * Variable: validState
   *
   * Holds the marked <mxCellState> if it is valid.
   */
  validState: any;
  /**
   * Variable: markedState
   *
   * Holds the marked <mxCellState>.
   */
  markedState: any;

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
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setHotspot
   *
   * Sets the <hotspot>.
   */
  setHotspot(hotspot: any): void {
    this.hotspot = hotspot;
  }

  /**
   * Function: getHotspot
   *
   * Returns the <hotspot>.
   */
  getHotspot(): any {
    return this.hotspot;
  }

  /**
   * Function: setHotspotEnabled
   *
   * Specifies whether the hotspot should be used in <intersects>.
   */
  setHotspotEnabled(enabled: boolean): void {
    this.hotspotEnabled = enabled;
  }

  /**
   * Function: isHotspotEnabled
   *
   * Returns true if hotspot is used in <intersects>.
   */
  isHotspotEnabled(): boolean {
    return this.hotspotEnabled;
  }

  /**
   * Function: hasValidState
   *
   * Returns true if <validState> is not null.
   */
  hasValidState(): boolean {
    return !!this.validState;
  }

  /**
   * Function: getValidState
   *
   * Returns the <validState>.
   */
  getValidState(): any {
    return this.validState;
  }

  /**
   * Function: getMarkedState
   *
   * Returns the <markedState>.
   */
  getMarkedState(): any {
    return this.markedState;
  }

  /**
   * Function: reset
   *
   * Resets the state of the cell marker.
   */
  reset(): void {
    this.validState = undefined;
    if (!!this.markedState) {
      this.markedState = undefined;
      this.unmark();
    }
  }

  /**
   * Function: process
   *
   * Processes the given event and cell and marks the state returned by
   * <getState> with the color returned by <getMarkerColor>. If the
   * markerColor is not null, then the state is stored in <markedState>. If
   * <isValidState> returns true, then the state is stored in <validState>
   * regardless of the marker color. The state is returned regardless of the
   * marker color and valid state.
   */
  process(me: any): any {
    let state = undefined;
    if (this.isEnabled()) {
      state = this.getState(me);
      this.setCurrentState(state, me);
    }
    return state;
  }

  /**
   * Function: setCurrentState
   *
   * Sets and marks the current valid state.
   */
  setCurrentState(state: any, me: any, color: string): void {
    const isValid = (!!state) ? this.isValidState(state) : false;
    color = (!!color) ? color : this.getMarkerColor(me.getEvent(), state, isValid);
    if (isValid) {
      this.validState = state;
    } else {
      this.validState = undefined;
    }
    if (state != this.markedState || color != this.currentColor) {
      this.currentColor = color;
      if (!!state && !!this.currentColor) {
        this.markedState = state;
        this.mark();
      } else if (!!this.markedState) {
        this.markedState = undefined;
        this.unmark();
      }
    }
  }

  /**
   * Function: markCell
   *
   * Marks the given cell using the given color, or <validColor> if no color is specified.
   */
  markCell(cell: mxCell, color: string): void {
    const state = this.graph.getView().getState(cell);
    if (!!state) {
      this.currentColor = (!!color) ? color : this.validColor;
      this.markedState = state;
      this.mark();
    }
  }

  /**
   * Function: mark
   *
   * Marks the <markedState> and fires a <mark> event.
   */
  mark(): void {
    this.highlight.setHighlightColor(this.currentColor);
    this.highlight.highlight(this.markedState);
    this.fireEvent(new mxEventObject(mxEvent.MARK, 'state', this.markedState));
  }

  /**
   * Function: unmark
   *
   * Hides the marker and fires a <mark> event.
   */
  unmark(): void {
    this.mark();
  }

  /**
   * Function: isValidState
   *
   * Returns true if the given <mxCellState> is a valid state. If this
   * returns true, then the state is stored in <validState>. The return value
   * of this method is used as the argument for <getMarkerColor>.
   */
  isValidState(state: any): boolean {
    return true;
  }

  /**
   * Function: getMarkerColor
   *
   * Returns the valid- or invalidColor depending on the value of isValid.
   * The given <mxCellState> is ignored by this implementation.
   */
  getMarkerColor(evt: Event, state: any, isValid: boolean): string {
    return (isValid) ? this.validColor : this.invalidColor;
  }

  /**
   * Function: getState
   *
   * Uses <getCell>, <getStateToMark> and <intersects> to return the
   * <mxCellState> for the given <mxMouseEvent>.
   */
  getState(me: any): any {
    const view = this.graph.getView();
    const cell = this.getCell(me);
    const state = this.getStateToMark(view.getState(cell));
    return (!!state && this.intersects(state, me)) ? state : null;
  }

  /**
   * Function: getCell
   *
   * Returns the <mxCell> for the given event and cell. This returns the
   * given cell.
   */
  getCell(me: any): any {
    return me.getCell();
  }

  /**
   * Function: getStateToMark
   *
   * Returns the <mxCellState> to be marked for the given <mxCellState> under
   * the mouse. This returns the given state.
   */
  getStateToMark(state: any): any {
    return state;
  }

  /**
   * Function: intersects
   *
   * Returns true if the given coordinate pair intersects the given state.
   * This returns true if the <hotspot> is 0 or the coordinates are inside
   * the hotspot for the given cell state.
   */
  intersects(state: any, me: any): any {
    if (this.hotspotEnabled) {
      return mxUtils.intersectsHotspot(state, me.getGraphX(), me.getGraphY(), this.hotspot, mxConstants.MIN_HOTSPOT_SIZE, mxConstants.MAX_HOTSPOT_SIZE);
    }
    return true;
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.getView().removeListener(this.resetHandler);
    this.graph.getModel().removeListener(this.resetHandler);
    this.highlight.destroy();
  }
}
