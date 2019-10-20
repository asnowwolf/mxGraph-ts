/**
 * Class: mxSwimlaneManager
 *
 * Manager for swimlanes and nested swimlanes that sets the size of newly added
 * swimlanes to that of their siblings, and propagates changes to the size of a
 * swimlane to its siblings, if <siblings> is true, and its ancestors, if
 * <bubbling> is true.
 *
 * Constructor: mxSwimlaneManager
 *
 * Constructs a new swimlane manager for the given graph.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing graph.
 */
import { mxCell } from '../model/mxCell';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';

export class mxSwimlaneManager {
  constructor(graph: mxGraph, horizontal: any, addEnabled: any, resizeEnabled: any) {
    this.horizontal = (horizontal != null) ? horizontal : true;
    this.addEnabled = (addEnabled != null) ? addEnabled : true;
    this.resizeEnabled = (resizeEnabled != null) ? resizeEnabled : true;
    this.addHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled() && this.isAddEnabled()) {
        this.cellsAdded(evt.getProperty('cells'));
      }
    });
    this.resizeHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled() && this.isResizeEnabled()) {
        this.cellsResized(evt.getProperty('cells'));
      }
    });
    this.setGraph(graph);
  }

  horizontal: any;
  addEnabled: any;
  resizeEnabled: any;
  addHandler: Function;
  resizeHandler: Function;
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph;
  /**
   * Variable: enabled
   *
   * Specifies if event handling is enabled. Default is true.
   * @example true
   */
  enabled: boolean;

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
  setEnabled(value: any): void {
    this.enabled = value;
  }

  /**
   * Function: isHorizontal
   *
   * Returns <horizontal>.
   */
  isHorizontal(): boolean {
    return this.horizontal;
  }

  /**
   * Function: setHorizontal
   *
   * Sets <horizontal>.
   */
  setHorizontal(value: any): void {
    this.horizontal = value;
  }

  /**
   * Function: isAddEnabled
   *
   * Returns <addEnabled>.
   */
  isAddEnabled(): boolean {
    return this.addEnabled;
  }

  /**
   * Function: setAddEnabled
   *
   * Sets <addEnabled>.
   */
  setAddEnabled(value: any): void {
    this.addEnabled = value;
  }

  /**
   * Function: isResizeEnabled
   *
   * Returns <resizeEnabled>.
   */
  isResizeEnabled(): boolean {
    return this.resizeEnabled;
  }

  /**
   * Function: setResizeEnabled
   *
   * Sets <resizeEnabled>.
   */
  setResizeEnabled(value: any): void {
    this.resizeEnabled = value;
  }

  /**
   * Function: getGraph
   *
   * Returns the graph that this manager operates on.
   */
  getGraph(): any {
    return this.graph;
  }

  /**
   * Function: setGraph
   *
   * Sets the graph that the manager operates on.
   */
  setGraph(graph: mxGraph): void {
    if (this.graph != null) {
      this.graph.removeListener(this.addHandler);
      this.graph.removeListener(this.resizeHandler);
    }
    this.graph = graph;
    if (this.graph != null) {
      this.graph.addListener(mxEvent.ADD_CELLS, this.addHandler);
      this.graph.addListener(mxEvent.CELLS_RESIZED, this.resizeHandler);
    }
  }

  /**
   * Function: isSwimlaneIgnored
   *
   * Returns true if the given swimlane should be ignored.
   */
  isSwimlaneIgnored(swimlane: any): boolean {
    return !this.getGraph().isSwimlane(swimlane);
  }

  /**
   * Function: isCellHorizontal
   *
   * Returns true if the given cell is horizontal. If the given cell is not a
   * swimlane, then the global orientation is returned.
   */
  isCellHorizontal(cell: mxCell): boolean {
    if (this.graph.isSwimlane(cell)) {
      const style = this.graph.getCellStyle(cell);
      return mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, 1) == 1;
    }
    return !this.isHorizontal();
  }

  /**
   * Function: cellsAdded
   *
   * Called if any cells have been added.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been added.
   */
  cellsAdded(cells: mxCell[]): void {
    if (cells != null) {
      const model = this.getGraph().getModel();
      model.beginUpdate();
      try {
        for (let i = 0; i < cells.length; i++) {
          if (!this.isSwimlaneIgnored(cells[i])) {
            this.swimlaneAdded(cells[i]);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: swimlaneAdded
   *
   * Updates the size of the given swimlane to match that of any existing
   * siblings swimlanes.
   *
   * Parameters:
   *
   * swimlane - <mxCell> that represents the new swimlane.
   */
  swimlaneAdded(swimlane: any): void {
    const model = this.getGraph().getModel();
    const parent = model.getParent(swimlane);
    const childCount = model.getChildCount(parent);
    let geo = null;
    for (let i = 0; i < childCount; i++) {
      const child = model.getChildAt(parent, i);
      if (child != swimlane && !this.isSwimlaneIgnored(child)) {
        geo = model.getGeometry(child);
        if (geo != null) {
          break;
        }
      }
    }
    if (geo != null) {
      const parentHorizontal = (parent != null) ? this.isCellHorizontal(parent) : this.horizontal;
      this.resizeSwimlane(swimlane, geo.width, geo.height, parentHorizontal);
    }
  }

  /**
   * Function: cellsResized
   *
   * Called if any cells have been resizes. Calls <swimlaneResized> for all
   * swimlanes where <isSwimlaneIgnored> returns false.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose size was changed.
   */
  cellsResized(cells: mxCell[]): void {
    if (cells != null) {
      const model = this.getGraph().getModel();
      model.beginUpdate();
      try {
        for (let i = 0; i < cells.length; i++) {
          if (!this.isSwimlaneIgnored(cells[i])) {
            const geo = model.getGeometry(cells[i]);
            if (geo != null) {
              const size = new mxRectangle(0, 0, geo.width, geo.height);
              let top = cells[i];
              let current = top;
              while (current != null) {
                top = current;
                current = model.getParent(current);
                const tmp = (this.graph.isSwimlane(current)) ? this.graph.getStartSize(current) : new mxRectangle();
                size.width += tmp.width;
                size.height += tmp.height;
              }
              const parentHorizontal = (current != null) ? this.isCellHorizontal(current) : this.horizontal;
              this.resizeSwimlane(top, size.width, size.height, parentHorizontal);
            }
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: resizeSwimlane
   *
   * Called from <cellsResized> for all swimlanes that are not ignored to update
   * the size of the siblings and the size of the parent swimlanes, recursively,
   * if <bubbling> is true.
   *
   * Parameters:
   *
   * swimlane - <mxCell> whose size has changed.
   */
  resizeSwimlane(swimlane: any, w: number, h: number, parentHorizontal: any): void {
    const model = this.getGraph().getModel();
    model.beginUpdate();
    try {
      const horizontal = this.isCellHorizontal(swimlane);
      if (!this.isSwimlaneIgnored(swimlane)) {
        let geo = model.getGeometry(swimlane);
        if (geo != null) {
          if ((parentHorizontal && geo.height != h) || (!parentHorizontal && geo.width != w)) {
            geo = geo.clone();
            if (parentHorizontal) {
              geo.height = h;
            } else {
              geo.width = w;
            }
            model.setGeometry(swimlane, geo);
          }
        }
      }
      const tmp = (this.graph.isSwimlane(swimlane)) ? this.graph.getStartSize(swimlane) : new mxRectangle();
      w -= tmp.width;
      h -= tmp.height;
      const childCount = model.getChildCount(swimlane);
      for (let i = 0; i < childCount; i++) {
        const child = model.getChildAt(swimlane, i);
        this.resizeSwimlane(child, w, h, horizontal);
      }
    } finally {
      model.endUpdate();
    }
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
