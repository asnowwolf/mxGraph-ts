/**
 * Class: mxLayoutManager
 *
 * Implements a layout manager that runs a given layout after any changes to the graph:
 *
 * Example:
 *
 * (code)
 * var layoutMgr = new mxLayoutManager(graph);
 * layoutMgr.getLayout = function(cell)
 * {
 *   return layout;
 * };
 * (end)
 *
 * Event: mxEvent.LAYOUT_CELLS
 *
 * Fires between begin- and endUpdate after all cells have been layouted in
 * <layoutCells>. The <code>cells</code> property contains all cells that have
 * been passed to <layoutCells>.
 *
 * Constructor: mxLayoutManager
 *
 * Constructs a new automatic layout for the given graph.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing graph.
 */
import { mxCell } from '../model/mxCell';
import {
  mxChildChange,
  mxGeometryChange,
  mxRootChange,
  mxStyleChange,
  mxTerminalChange,
  mxVisibleChange,
} from '../model/mxGraphModel';
import { mxDictionary } from '../util/mxDictionary';
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxUtils } from '../util/mxUtils';

export class mxLayoutManager {
  constructor(graph: mxGraph) {
    this.undoHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled()) {
        this.beforeUndo(evt.getProperty('edit'));
      }
    });
    this.moveHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled()) {
        this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
      }
    });
    this.setGraph(graph);
  }

  undoHandler: Function;
  moveHandler: Function;
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph;
  /**
   * Variable: bubbling
   *
   * Specifies if the layout should bubble along
   * the cell hierarchy. Default is true.
   * @example true
   */
  bubbling: boolean;
  /**
   * Variable: enabled
   *
   * Specifies if event handling is enabled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: updateHandler
   *
   * Holds the function that handles the endUpdate event.
   */
  updateHandler: Function;

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
   * Function: isBubbling
   *
   * Returns true if a layout should bubble, that is, if the parent layout
   * should be executed whenever a cell layout (layout of the children of
   * a cell) has been executed. This implementation returns <bubbling>.
   */
  isBubbling(): boolean {
    return this.bubbling;
  }

  /**
   * Function: setBubbling
   *
   * Sets <bubbling>.
   */
  setBubbling(value: any): void {
    this.bubbling = value;
  }

  /**
   * Function: getGraph
   *
   * Returns the graph that this layout operates on.
   */
  getGraph(): any {
    return this.graph;
  }

  /**
   * Function: setGraph
   *
   * Sets the graph that the layouts operate on.
   */
  setGraph(graph: mxGraph): void {
    if (this.graph != null) {
      const model = this.graph.getModel();
      model.removeListener(this.undoHandler);
      this.graph.removeListener(this.moveHandler);
    }
    this.graph = graph;
    if (this.graph != null) {
      const model = this.graph.getModel();
      model.addListener(mxEvent.BEFORE_UNDO, this.undoHandler);
      this.graph.addListener(mxEvent.MOVE_CELLS, this.moveHandler);
    }
  }

  /**
   * Function: getLayout
   *
   * Returns the layout to be executed for the given graph and parent.
   */
  getLayout(parent: any): any {
    return null;
  }

  /**
   * Function: beforeUndo
   *
   * Called from the undoHandler.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been moved.
   * evt - Mouse event that represents the mousedown.
   */
  beforeUndo(undoableEdit: any): void {
    let cells = this.getCellsForChanges(undoableEdit.changes);
    const model = this.getGraph().getModel();
    let tmp = [];
    for (let i = 0; i < cells.length; i++) {
      tmp = tmp.concat(model.getDescendants(cells[i]));
    }
    cells = tmp;
    if (this.isBubbling()) {
      tmp = model.getParents(cells);
      while (tmp.length > 0) {
        cells = cells.concat(tmp);
        tmp = model.getParents(tmp);
      }
    }
    this.executeLayoutForCells(cells);
  }

  /**
   * Function: executeLayout
   *
   * Executes the given layout on the given parent.
   */
  executeLayoutForCells(cells: mxCell[]): void {
    let sorted = mxUtils.sortCells(cells, true);
    sorted = sorted.concat(sorted.slice().reverse());
    this.layoutCells(sorted);
  }

  /**
   * Function: cellsMoved
   *
   * Called from the moveHandler.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been moved.
   * evt - Mouse event that represents the mousedown.
   */
  cellsMoved(cells: mxCell[], evt: Event): void {
    if (cells != null && evt != null) {
      const point = mxUtils.convertPoint(this.getGraph().container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      const model = this.getGraph().getModel();
      for (let i = 0; i < cells.length; i++) {
        const parent = model.getParent(cells[i]);
        if (mxUtils.indexOf(cells, parent) < 0) {
          const layout = this.getLayout(parent);
          if (layout != null) {
            layout.moveCell(cells[i], point.x, point.y);
          }
        }
      }
    }
  }

  /**
   * Function: getCellsForEdit
   *
   * Returns the cells to be layouted for the given sequence of changes.
   */
  getCellsForChanges(changes: any): any {
    const dict = new mxDictionary();
    const result = [];
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      if (change instanceof mxRootChange) {
        return [];
      } else {
        const cells = this.getCellsForChange(change);
        for (let j = 0; j < cells.length; j++) {
          if (cells[j] != null && !dict.get(cells[j])) {
            dict.put(cells[j], true);
            result.push(cells[j]);
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: getCellsForChange
   *
   * Executes all layouts which have been scheduled during the
   * changes.
   */
  getCellsForChange(change: any): any {
    const model = this.getGraph().getModel();
    if (change instanceof mxChildChange) {
      return [change.child, change.previous, model.getParent(change.child)];
    } else if (change instanceof mxTerminalChange || change instanceof mxGeometryChange) {
      return [change.cell, model.getParent(change.cell)];
    } else if (change instanceof mxVisibleChange || change instanceof mxStyleChange) {
      return [change.cell];
    }
    return [];
  }

  /**
   * Function: layoutCells
   *
   * Executes all layouts which have been scheduled during the
   * changes.
   */
  layoutCells(cells: mxCell[]): void {
    if (cells.length > 0) {
      const model = this.getGraph().getModel();
      model.beginUpdate();
      try {
        let last = null;
        for (let i = 0; i < cells.length; i++) {
          if (cells[i] != model.getRoot() && cells[i] != last) {
            if (this.executeLayout(this.getLayout(cells[i]), cells[i])) {
              last = cells[i];
            }
          }
        }
        this.fireEvent(new mxEventObject(mxEvent.LAYOUT_CELLS, 'cells', cells));
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: executeLayout
   *
   * Executes the given layout on the given parent.
   */
  executeLayout(layout: any, parent: any): any {
    let result = false;
    if (layout != null && parent != null) {
      layout.execute(parent);
      result = true;
    }
    return result;
  }

  /**
   * Function: destroy
   *
   * Removes all handlers from the <graph> and deletes the reference to it.
   */
  destroy(): void {
    this.setGraph(null);
  }
}
