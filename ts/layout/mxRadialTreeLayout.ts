/**
 * Class: mxRadialTreeLayout
 *
 * Extends <mxGraphLayout> to implement a radial tree algorithm. This
 * layout is suitable for graphs that have no cycles (trees). Vertices that are
 * not connected to the tree will be ignored by this layout.
 *
 * Example:
 *
 * (code)
 * var layout = new mxRadialTreeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxRadialTreeLayout
 *
 * Constructs a new radial tree layout for the specified graph
 */
export class mxRadialTreeLayout {
  /**
   * Variable: angleOffset
   *
   * The initial offset to compute the angle position.
   * @example 0.5
   */
  angleOffset: number;
  /**
   * Variable: rootx
   *
   * The X co-ordinate of the root cell
   */
  rootx: number;
  /**
   * Variable: rooty
   *
   * The Y co-ordinate of the root cell
   */
  rooty: number;
  /**
   * Variable: levelDistance
   *
   * Holds the levelDistance. Default is 120.
   * @example 120
   */
  levelDistance: number;
  /**
   * Variable: nodeDistance
   *
   * Holds the nodeDistance. Default is 10.
   * @example 10
   */
  nodeDistance: number;
  /**
   * Variable: autoRadius
   *
   * Specifies if the radios should be computed automatically
   */
  autoRadius: boolean;
  /**
   * Variable: sortEdges
   *
   * Specifies if edges should be sorted according to the order of their
   * opposite terminal cell in the model.
   */
  sortEdges: boolean;
  /**
   * Variable: rowMinX
   *
   * Array of leftmost x coordinate of each row
   */
  rowMinX: any[];
  /**
   * Variable: rowMaxX
   *
   * Array of rightmost x coordinate of each row
   */
  rowMaxX: any[];
  /**
   * Variable: rowMinCenX
   *
   * Array of x coordinate of leftmost vertex of each row
   */
  rowMinCenX: any[];
  /**
   * Variable: rowMaxCenX
   *
   * Array of x coordinate of rightmost vertex of each row
   */
  rowMaxCenX: any[];
  /**
   * Variable: rowRadi
   *
   * Array of y deltas of each row behind root vertex, also the radius in the tree
   */
  rowRadi: any[];
  /**
   * Variable: row
   *
   * Array of vertices on each row
   */
  row: any[];
  parent: any;
  useBoundingBox: boolean;
  edgeRouting: boolean;
  centerX: any;
  centerY: any;

  constructor(graph: any) {
    mxCompactTreeLayout.call(this, graph, false);
  }

  /**
   * Function: isVertexIgnored
   *
   * Returns a boolean indicating if the given <mxCell> should be ignored as a
   * vertex. This returns true if the cell has no connections.
   *
   * Parameters:
   *
   * vertex - <mxCell> whose ignored state should be returned.
   */
  isVertexIgnored(vertex: any): boolean {
    return mxGraphLayout.prototype.isVertexIgnored.apply(this, arguments) || this.graph.getConnections(vertex).length == 0;
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   *
   * If the parent has any connected edges, then it is used as the root of
   * the tree. Else, <mxGraph.findTreeRoots> will be used to find a suitable
   * root node within the set of children of the given parent.
   *
   * Parameters:
   *
   * parent - <mxCell> whose children should be laid out.
   * root - Optional <mxCell> that will be used as the root of the tree.
   */
  execute(parent: any, root: any): void {
    this.parent = parent;
    this.useBoundingBox = false;
    this.edgeRouting = false;
    mxCompactTreeLayout.prototype.execute.apply(this, arguments);
    let bounds = null;
    const rootBounds = this.getVertexBounds(this.root);
    this.centerX = rootBounds.x + rootBounds.width / 2;
    this.centerY = rootBounds.y + rootBounds.height / 2;
    for (const vertex in this.visited) {
      const vertexBounds = this.getVertexBounds(this.visited[vertex]);
      bounds = (bounds != null) ? bounds : vertexBounds.clone();
      bounds.add(vertexBounds);
    }
    this.calcRowDims([this.node], 0);
    let maxLeftGrad = 0;
    let maxRightGrad = 0;
    for (let i = 0; i < this.row.length; i++) {
      const leftGrad = (this.centerX - this.rowMinX[i] - this.nodeDistance) / this.rowRadi[i];
      const rightGrad = (this.rowMaxX[i] - this.centerX - this.nodeDistance) / this.rowRadi[i];
      maxLeftGrad = Math.max(maxLeftGrad, leftGrad);
      maxRightGrad = Math.max(maxRightGrad, rightGrad);
    }
    for (let i = 0; i < this.row.length; i++) {
      const xLeftLimit = this.centerX - this.nodeDistance - maxLeftGrad * this.rowRadi[i];
      const xRightLimit = this.centerX + this.nodeDistance + maxRightGrad * this.rowRadi[i];
      const fullWidth = xRightLimit - xLeftLimit;
      for (let j = 0; j < this.row[i].length; j++) {
        const row = this.row[i];
        const node = row[j];
        const vertexBounds = this.getVertexBounds(node.cell);
        const xProportion = (vertexBounds.x + vertexBounds.width / 2 - xLeftLimit) / (fullWidth);
        const theta = 2 * Math.PI * xProportion;
        node.theta = theta;
      }
    }
    for (let i = this.row.length - 2; i >= 0; i--) {
      const row = this.row[i];
      for (let j = 0; j < row.length; j++) {
        const node = row[j];
        let child = node.child;
        let counter = 0;
        let totalTheta = 0;
        while (child != null) {
          totalTheta += child.theta;
          counter++;
          child = child.next;
        }
        if (counter > 0) {
          const averTheta = totalTheta / counter;
          if (averTheta > node.theta && j < row.length - 1) {
            const nextTheta = row[j + 1].theta;
            node.theta = Math.min(averTheta, nextTheta - Math.PI / 10);
          } else if (averTheta < node.theta && j > 0) {
            const lastTheta = row[j - 1].theta;
            node.theta = Math.max(averTheta, lastTheta + Math.PI / 10);
          }
        }
      }
    }
    for (let i = 0; i < this.row.length; i++) {
      for (let j = 0; j < this.row[i].length; j++) {
        const row = this.row[i];
        const node = row[j];
        const vertexBounds = this.getVertexBounds(node.cell);
        this.setVertexLocation(node.cell, this.centerX - vertexBounds.width / 2 + this.rowRadi[i] * Math.cos(node.theta), this.centerY - vertexBounds.height / 2 + this.rowRadi[i] * Math.sin(node.theta));
      }
    }
  }

  /**
   * Function: calcRowDims
   *
   * Recursive function to calculate the dimensions of each row
   *
   * Parameters:
   *
   * row - Array of internal nodes, the children of which are to be processed.
   * rowNum - Integer indicating which row is being processed.
   */
  calcRowDims(row: any, rowNum: any): void {
    if (row == null || row.length == 0) {
      return;
    }
    this.rowMinX[rowNum] = this.centerX;
    this.rowMaxX[rowNum] = this.centerX;
    this.rowMinCenX[rowNum] = this.centerX;
    this.rowMaxCenX[rowNum] = this.centerX;
    this.row[rowNum] = [];
    let rowHasChildren = false;
    for (let i = 0; i < row.length; i++) {
      let child = row[i] != null ? row[i].child : null;
      while (child != null) {
        const cell = child.cell;
        const vertexBounds = this.getVertexBounds(cell);
        this.rowMinX[rowNum] = Math.min(vertexBounds.x, this.rowMinX[rowNum]);
        this.rowMaxX[rowNum] = Math.max(vertexBounds.x + vertexBounds.width, this.rowMaxX[rowNum]);
        this.rowMinCenX[rowNum] = Math.min(vertexBounds.x + vertexBounds.width / 2, this.rowMinCenX[rowNum]);
        this.rowMaxCenX[rowNum] = Math.max(vertexBounds.x + vertexBounds.width / 2, this.rowMaxCenX[rowNum]);
        this.rowRadi[rowNum] = vertexBounds.y - this.getVertexBounds(this.root).y;
        if (child.child != null) {
          rowHasChildren = true;
        }
        this.row[rowNum].push(child);
        child = child.next;
      }
    }
    if (rowHasChildren) {
      this.calcRowDims(this.row[rowNum], rowNum + 1);
    }
  }
}
