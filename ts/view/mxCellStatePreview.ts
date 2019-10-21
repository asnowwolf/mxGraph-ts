/**
 * Class: mxCellStatePreview
 *
 * Implements a live preview for moving cells.
 *
 * Constructor: mxCellStatePreview
 *
 * Constructs a move preview for the given graph.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 */
import { mxDictionary } from '../util/mxDictionary';
import { mxPoint } from '../util/mxPoint';
import { mxUtils } from '../util/mxUtils';

export class mxCellStatePreview {
  constructor(graph: mxGraph) {
    this.deltas = new mxDictionary();
    this.graph = graph;
  }

  deltas: mxDictionary;
  graph: mxGraph;
  /**
   * Variable: count
   *
   * Contains the number of entries in the map.
   */
  count: number;

  /**
   * Function: isEmpty
   *
   * Returns true if this contains no entries.
   */
  isEmpty(): boolean {
    return this.count == 0;
  }

  /**
   * Function: moveState
   */
  moveState(state: any, dx: number, dy: number, add: any, includeEdges: any): any {
    add = (!!add) ? add : true;
    includeEdges = (!!includeEdges) ? includeEdges : true;
    let delta = this.deltas.get(state.cell);
    if (!delta) {
      delta = { point: new mxPoint(dx, dy), state };
      this.deltas.put(state.cell, delta);
      this.count++;
    } else if (add) {
      delta.point.x += dx;
      delta.point.y += dy;
    } else {
      delta.point.x = dx;
      delta.point.y = dy;
    }
    if (includeEdges) {
      this.addEdges(state);
    }
    return delta.point;
  }

  /**
   * Function: show
   */
  show(visitor: any): void {
    this.deltas.visit(mxUtils.bind(this, function (key, delta) {
      this.translateState(delta.state, delta.point.x, delta.point.y);
    }));
    this.deltas.visit(mxUtils.bind(this, function (key, delta) {
      this.revalidateState(delta.state, delta.point.x, delta.point.y, visitor);
    }));
  }

  /**
   * Function: translateState
   */
  translateState(state: any, dx: number, dy: number): void {
    if (!!state) {
      const model = this.graph.getModel();
      if (model.isVertex(state.cell)) {
        state.view.updateCellState(state);
        const geo = model.getGeometry(state.cell);
        if ((dx != 0 || dy != 0) && !!geo && (!geo.relative || this.deltas.get(state.cell))) {
          state.x += dx;
          state.y += dy;
        }
      }
      const childCount = model.getChildCount(state.cell);
      for (let i = 0; i < childCount; i++) {
        this.translateState(state.view.getState(model.getChildAt(state.cell, i)), dx, dy);
      }
    }
  }

  /**
   * Function: revalidateState
   */
  revalidateState(state: any, dx: number, dy: number, visitor: any): void {
    if (!!state) {
      const model = this.graph.getModel();
      if (model.isEdge(state.cell)) {
        state.view.updateCellState(state);
      }
      const geo = this.graph.getCellGeometry(state.cell);
      const pState = state.view.getState(model.getParent(state.cell));
      if ((dx != 0 || dy != 0) && !!geo && geo.relative && model.isVertex(state.cell) && (!pState || model.isVertex(pState.cell) || this.deltas.get(state.cell))) {
        state.x += dx;
        state.y += dy;
      }
      this.graph.cellRenderer.redraw(state);
      if (!!visitor) {
        visitor(state);
      }
      const childCount = model.getChildCount(state.cell);
      for (let i = 0; i < childCount; i++) {
        this.revalidateState(this.graph.view.getState(model.getChildAt(state.cell, i)), dx, dy, visitor);
      }
    }
  }

  /**
   * Function: addEdges
   */
  addEdges(state: any): void {
    const model = this.graph.getModel();
    const edgeCount = model.getEdgeCount(state.cell);
    for (let i = 0; i < edgeCount; i++) {
      const s = state.view.getState(model.getEdgeAt(state.cell, i));
      if (!!s) {
        this.moveState(s, 0, 0);
      }
    }
  }
}
