/**
 * Class: mxCompositeLayout
 *
 * Allows to compose multiple layouts into a single layout. The master layout
 * is the layout that handles move operations if another layout than the first
 * element in <layouts> should be used. The <master> layout is not executed as
 * the code assumes that it is part of <layouts>.
 *
 * Example:
 * (code)
 * var first = new mxFastOrganicLayout(graph);
 * var second = new mxParallelEdgeLayout(graph);
 * var layout = new mxCompositeLayout(graph, [first, second], first);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxCompositeLayout
 *
 * Constructs a new layout using the given layouts. The graph instance is
 * required for creating the transaction that contains all layouts.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * layouts - Array of <mxGraphLayouts>.
 * master - Optional layout that handles moves. If no layout is given then
 * the first layout of the above array is used to handle moves.
 */
import { mxCell } from '../model/mxCell';
import { mxGraph } from '../view/mxGraph';
import { mxGraphLayout } from './mxGraphLayout';

export class mxCompositeLayout extends mxGraphLayout {
  constructor(graph: mxGraph, layouts: any, master: any) {
    super(graph);
    this.layouts = layouts;
    this.master = master;
  }

  layouts: any;
  master: any;

  /**
   * Function: moveCell
   *
   * Implements <mxGraphLayout.moveCell> by calling move on <master> or the first
   * layout in <layouts>.
   */
  moveCell(cell: mxCell, x: number, y: number): void {
    if (this.master != null) {
      this.master.moveCell.apply(this.master, arguments);
    } else {
      this.layouts[0].moveCell.apply(this.layouts[0], arguments);
    }
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute> by executing all <layouts> in a
   * single transaction.
   */
  execute(parent: any): void {
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      for (let i = 0; i < this.layouts.length; i++) {
        this.layouts[i].execute.apply(this.layouts[i], arguments);
      }
    } finally {
      model.endUpdate();
    }
  }
}
