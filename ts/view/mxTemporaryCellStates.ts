/**
 * Class: mxTemporaryCellStates
 *
 * Creates a temporary set of cell states.
 */
import { mxCell } from '../model/mxCell';
import { mxDictionary } from '../util/mxDictionary';
import { mxRectangle } from '../util/mxRectangle';

export class mxTemporaryCellStates {
  constructor(view: any, scale: any, cells: mxCell[], isCellVisibleFn: Function, getLinkForCellState: any) {
    scale = (scale != null) ? scale : 1;
    this.view = view;
    this.oldValidateCellState = view.validateCellState;
    this.oldBounds = view.getGraphBounds();
    this.oldStates = view.getStates();
    this.oldScale = view.getScale();
    this.oldDoRedrawShape = view.graph.cellRenderer.doRedrawShape;
    const self = this;
    if (getLinkForCellState != null) {
      view.graph.cellRenderer.doRedrawShape = function (state) {
        const oldPaint = state.shape.paint;
        state.shape.paint = function (c) {
          const link = getLinkForCellState(state);
          if (link != null) {
            c.setLink(link);
          }
          oldPaint.apply(this, arguments);
          if (link != null) {
            c.setLink(null);
          }
        };
        self.oldDoRedrawShape.apply(view.graph.cellRenderer, arguments);
        state.shape.paint = oldPaint;
      };
    }
    view.validateCellState = function (cell, resurse) {
      if (cell == null || isCellVisibleFn == null || isCellVisibleFn(cell)) {
        return self.oldValidateCellState.apply(view, arguments);
      }
      return null;
    };
    view.setStates(new mxDictionary());
    view.setScale(scale);
    if (cells != null) {
      view.resetValidationState();
      let bbox = null;
      for (let i = 0; i < cells.length; i++) {
        const bounds = view.getBoundingBox(view.validateCellState(view.validateCell(cells[i])));
        if (bbox == null) {
          bbox = bounds;
        } else {
          bbox.add(bounds);
        }
      }
      view.setGraphBounds(bbox || new mxRectangle());
    }
  }

  view: any;
  oldValidateCellState: any;
  oldBounds: any;
  oldStates: any;
  oldScale: any;
  oldDoRedrawShape: any;

  /**
   * Function: destroy
   *
   * Returns the top, left corner as a new <mxPoint>.
   */
  destroy(): void {
    this.view.setScale(this.oldScale);
    this.view.setStates(this.oldStates);
    this.view.setGraphBounds(this.oldBounds);
    this.view.validateCellState = this.oldValidateCellState;
    this.view.graph.cellRenderer.doRedrawShape = this.oldDoRedrawShape;
  }
}
