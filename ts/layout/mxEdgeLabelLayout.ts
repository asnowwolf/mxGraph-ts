/**
 * Class: mxEdgeLabelLayout
 *
 * Extends <mxGraphLayout> to implement an edge label layout. This layout
 * makes use of cell states, which means the graph must be validated in
 * a graph view (so that the label bounds are available) before this layout
 * can be executed.
 *
 * Example:
 *
 * (code)
 * var layout = new mxEdgeLabelLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxEdgeLabelLayout
 *
 * Constructs a new edge label layout.
 *
 * Arguments:
 *
 * graph - <mxGraph> that contains the cells.
 */
import { mxPoint } from '../util/mxPoint';
import { mxUtils } from '../util/mxUtils';
import { mxGraphLayout } from './mxGraphLayout';

export class mxEdgeLabelLayout extends mxGraphLayout {
  constructor(graph: mxGraph, radius: any) {
    super(graph);
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   */
  execute(parent: any): void {
    const view = this.graph.view;
    const model = this.graph.getModel();
    const edges = [];
    const vertices = [];
    const childCount = model.getChildCount(parent);
    for (let i = 0; i < childCount; i++) {
      const cell = model.getChildAt(parent, i);
      const state = view.getState(cell);
      if (state != null) {
        if (!this.isVertexIgnored(cell)) {
          vertices.push(state);
        } else if (!this.isEdgeIgnored(cell)) {
          edges.push(state);
        }
      }
    }
    this.placeLabels(vertices, edges);
  }

  /**
   * Function: placeLabels
   *
   * Places the labels of the given edges.
   */
  placeLabels(v: any, e: any): void {
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      for (let i = 0; i < e.length; i++) {
        const edge = e[i];
        if (edge != null && edge.text != null && edge.text.boundingBox != null) {
          for (let j = 0; j < v.length; j++) {
            const vertex = v[j];
            if (vertex != null) {
              this.avoid(edge, vertex);
            }
          }
        }
      }
    } finally {
      model.endUpdate();
    }
  }

  /**
   * Function: avoid
   *
   * Places the labels of the given edges.
   */
  avoid(edge: any, vertex: any): void {
    const model = this.graph.getModel();
    const labRect = edge.text.boundingBox;
    if (mxUtils.intersects(labRect, vertex)) {
      const dy1 = -labRect.y - labRect.height + vertex.y;
      const dy2 = -labRect.y + vertex.y + vertex.height;
      let dy = (Math.abs(dy1) < Math.abs(dy2)) ? dy1 : dy2;
      const dx1 = -labRect.x - labRect.width + vertex.x;
      const dx2 = -labRect.x + vertex.x + vertex.width;
      let dx = (Math.abs(dx1) < Math.abs(dx2)) ? dx1 : dx2;
      if (Math.abs(dx) < Math.abs(dy)) {
        dy = 0;
      } else {
        dx = 0;
      }
      let g = model.getGeometry(edge.cell);
      if (g != null) {
        g = g.clone();
        if (g.offset != null) {
          g.offset.x += dx;
          g.offset.y += dy;
        } else {
          g.offset = new mxPoint(dx, dy);
        }
        model.setGeometry(edge.cell, g);
      }
    }
  }
}
