/**
 * Class: mxPartitionLayout
 *
 * Extends <mxGraphLayout> for partitioning the parent cell vertically or
 * horizontally by filling the complete area with the child cells. A horizontal
 * layout partitions the height of the given parent whereas a a non-horizontal
 * layout partitions the width. If the parent is a layer (that is, a child of
 * the root node), then the current graph size is partitioned. The children do
 * not need to be connected for this layout to work.
 *
 * Example:
 *
 * (code)
 * var layout = new mxPartitionLayout(graph, true, 10, 20);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxPartitionLayout
 *
 * Constructs a new stack layout layout for the specified graph,
 * spacing, orientation and offset.
 */
import { mxCell } from '../model/mxCell';
import { mxRectangle } from '../util/mxRectangle';
import { mxGraphLayout } from './mxGraphLayout';

export class mxPartitionLayout extends mxGraphLayout {
  constructor(graph: mxGraph, horizontal: any, spacing: any, border: any) {
    super(graph);
    this.horizontal = (horizontal != null) ? horizontal : true;
    this.spacing = spacing || 0;
    this.border = border || 0;
  }

  horizontal: any;
  spacing: any;
  border: any;
  /**
   * Variable: resizeVertices
   *
   * Boolean that specifies if vertices should be resized. Default is true.
   * @example true
   */
  resizeVertices: boolean;

  /**
   * Function: isHorizontal
   *
   * Returns <horizontal>.
   */
  isHorizontal(): boolean {
    return this.horizontal;
  }

  /**
   * Function: moveCell
   *
   * Implements <mxGraphLayout.moveCell>.
   */
  moveCell(cell: mxCell, x: number, y: number): void {
    const model = this.graph.getModel();
    const parent = model.getParent(cell);
    if (cell != null && parent != null) {
      let i = 0;
      let last = 0;
      const childCount = model.getChildCount(parent);
      for (i = 0; i < childCount; i++) {
        const child = model.getChildAt(parent, i);
        const bounds = this.getVertexBounds(child);
        if (bounds != null) {
          const tmp = bounds.x + bounds.width / 2;
          if (last < x && tmp > x) {
            break;
          }
          last = tmp;
        }
      }
      let idx = parent.getIndex(cell);
      idx = Math.max(0, i - ((i > idx) ? 1 : 0));
      model.add(parent, cell, idx);
    }
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>. All children where <isVertexIgnored>
   * returns false and <isVertexMovable> returns true are modified.
   */
  execute(parent: any): void {
    const horizontal = this.isHorizontal();
    const model = this.graph.getModel();
    let pgeo = model.getGeometry(parent);
    if (this.graph.container != null && ((pgeo == null && model.isLayer(parent)) || parent == this.graph.getView().currentRoot)) {
      const width = this.graph.container.offsetWidth - 1;
      const height = this.graph.container.offsetHeight - 1;
      pgeo = new mxRectangle(0, 0, width, height);
    }
    if (pgeo != null) {
      const children = [];
      const childCount = model.getChildCount(parent);
      for (let i = 0; i < childCount; i++) {
        const child = model.getChildAt(parent, i);
        if (!this.isVertexIgnored(child) && this.isVertexMovable(child)) {
          children.push(child);
        }
      }
      const n = children.length;
      if (n > 0) {
        let x0 = this.border;
        let y0 = this.border;
        let other = (horizontal) ? pgeo.height : pgeo.width;
        other -= 2 * this.border;
        const size = (this.graph.isSwimlane(parent)) ? this.graph.getStartSize(parent) : new mxRectangle();
        other -= (horizontal) ? size.height : size.width;
        x0 = x0 + size.width;
        y0 = y0 + size.height;
        const tmp = this.border + (n - 1) * this.spacing;
        const value = (horizontal) ? ((pgeo.width - x0 - tmp) / n) : ((pgeo.height - y0 - tmp) / n);
        if (value > 0) {
          model.beginUpdate();
          try {
            for (let i = 0; i < n; i++) {
              const child = children[i];
              let geo = model.getGeometry(child);
              if (geo != null) {
                geo = geo.clone();
                geo.x = x0;
                geo.y = y0;
                if (horizontal) {
                  if (this.resizeVertices) {
                    geo.width = value;
                    geo.height = other;
                  }
                  x0 += value + this.spacing;
                } else {
                  if (this.resizeVertices) {
                    geo.height = value;
                    geo.width = other;
                  }
                  y0 += value + this.spacing;
                }
                model.setGeometry(child, geo);
              }
            }
          } finally {
            model.endUpdate();
          }
        }
      }
    }
  }
}
