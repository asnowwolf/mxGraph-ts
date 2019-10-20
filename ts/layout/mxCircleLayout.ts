/**
 * Class: mxCircleLayout
 *
 * Extends <mxGraphLayout> to implement a circluar layout for a given radius.
 * The vertices do not need to be connected for this layout to work and all
 * connections between vertices are not taken into account.
 *
 * Example:
 *
 * (code)
 * var layout = new mxCircleLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxCircleLayout
 *
 * Constructs a new circular layout for the specified radius.
 *
 * Arguments:
 *
 * graph - <mxGraph> that contains the cells.
 * radius - Optional radius as an int. Default is 100.
 */
export class mxCircleLayout {
  radius: any;
  /**
   * Variable: moveCircle
   *
   * Boolean specifying if the circle should be moved to the top,
   * left corner specified by <x0> and <y0>. Default is false.
   */
  moveCircle: boolean;
  /**
   * Variable: x0
   *
   * Integer specifying the left coordinate of the circle.
   * Default is 0.
   */
  x0: number;
  /**
   * Variable: y0
   *
   * Integer specifying the top coordinate of the circle.
   * Default is 0.
   */
  y0: number;
  /**
   * Variable: resetEdges
   *
   * Specifies if all edge points of traversed edges should be removed.
   * Default is true.
   * @example true
   */
  resetEdges: boolean;
  /**
   * Variable: disableEdgeStyle
   *
   * Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
   * modified by the result. Default is true.
   * @example true
   */
  disableEdgeStyle: boolean;

  constructor(graph: any, radius: any) {
    mxGraphLayout.call(this, graph);
    this.radius = (radius != null) ? radius : 100;
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   */
  execute(parent: any): void {
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      let max = 0;
      let top = null;
      let left = null;
      const vertices = [];
      const childCount = model.getChildCount(parent);
      for (let i = 0; i < childCount; i++) {
        const cell = model.getChildAt(parent, i);
        if (!this.isVertexIgnored(cell)) {
          vertices.push(cell);
          const bounds = this.getVertexBounds(cell);
          if (top == null) {
            top = bounds.y;
          } else {
            top = Math.min(top, bounds.y);
          }
          if (left == null) {
            left = bounds.x;
          } else {
            left = Math.min(left, bounds.x);
          }
          max = Math.max(max, Math.max(bounds.width, bounds.height));
        } else if (!this.isEdgeIgnored(cell)) {
          if (this.resetEdges) {
            this.graph.resetEdge(cell);
          }
          if (this.disableEdgeStyle) {
            this.setEdgeStyleEnabled(cell, false);
          }
        }
      }
      const r = this.getRadius(vertices.length, max);
      if (this.moveCircle) {
        left = this.x0;
        top = this.y0;
      }
      this.circle(vertices, r, left, top);
    } finally {
      model.endUpdate();
    }
  }

  /**
   * Function: getRadius
   *
   * Returns the radius to be used for the given vertex count. Max is the maximum
   * width or height of all vertices in the layout.
   */
  getRadius(count: any, max: any): any {
    return Math.max(count * max / Math.PI, this.radius);
  }

  /**
   * Function: circle
   *
   * Executes the circular layout for the specified array
   * of vertices and the given radius. This is called from
   * <execute>.
   */
  circle(vertices: any, r: any, left: number, top: any): void {
    const vertexCount = vertices.length;
    const phi = 2 * Math.PI / vertexCount;
    for (let i = 0; i < vertexCount; i++) {
      if (this.isVertexMovable(vertices[i])) {
        this.setVertexLocation(vertices[i], Math.round(left + r + r * Math.sin(i * phi)), Math.round(top + r + r * Math.cos(i * phi)));
      }
    }
  }
}
