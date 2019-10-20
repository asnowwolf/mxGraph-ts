/**
 * Class: mxFastOrganicLayout
 *
 * Extends <mxGraphLayout> to implement a fast organic layout algorithm.
 * The vertices need to be connected for this layout to work, vertices
 * with no connections are ignored.
 *
 * Example:
 *
 * (code)
 * var layout = new mxFastOrganicLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxCompactTreeLayout
 *
 * Constructs a new fast organic layout for the specified graph.
 */
export class mxFastOrganicLayout {
  /**
   * Variable: useInputOrigin
   *
   * Specifies if the top left corner of the input cells should be the origin
   * of the layout result. Default is true.
   * @example true
   */
  useInputOrigin: boolean;
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
  /**
   * Variable: forceConstant
   *
   * The force constant by which the attractive forces are divided and the
   * replusive forces are multiple by the square of. The value equates to the
   * average radius there is of free space around each node. Default is 50.
   * @example 50
   */
  forceConstant: number;
  /**
   * Variable: forceConstantSquared
   *
   * Cache of <forceConstant>^2 for performance.
   */
  forceConstantSquared: number;
  /**
   * Variable: minDistanceLimit
   *
   * Minimal distance limit. Default is 2. Prevents of
   * dividing by zero.
   * @example 2
   */
  minDistanceLimit: number;
  /**
   * Variable: minDistanceLimit
   *
   * Minimal distance limit. Default is 2. Prevents of
   * dividing by zero.
   * @example 500
   */
  maxDistanceLimit: number;
  /**
   * Variable: minDistanceLimitSquared
   *
   * Cached version of <minDistanceLimit> squared.
   * @example 4
   */
  minDistanceLimitSquared: number;
  /**
   * Variable: initialTemp
   *
   * Start value of temperature. Default is 200.
   * @example 200
   */
  initialTemp: number;
  /**
   * Variable: temperature
   *
   * Temperature to limit displacement at later stages of layout.
   */
  temperature: number;
  /**
   * Variable: maxIterations
   *
   * Total number of iterations to run the layout though.
   */
  maxIterations: number;
  /**
   * Variable: iteration
   *
   * Current iteration count.
   */
  iteration: number;
  /**
   * Variable: vertexArray
   *
   * An array of all vertices to be laid out.
   */
  vertexArray: any;
  /**
   * Variable: dispX
   *
   * An array of locally stored X co-ordinate displacements for the vertices.
   */
  dispX: any;
  /**
   * Variable: dispY
   *
   * An array of locally stored Y co-ordinate displacements for the vertices.
   */
  dispY: any;
  /**
   * Variable: cellLocation
   *
   * An array of locally stored co-ordinate positions for the vertices.
   */
  cellLocation: any;
  /**
   * Variable: radius
   *
   * The approximate radius of each cell, nodes only.
   */
  radius: any;
  /**
   * Variable: radiusSquared
   *
   * The approximate radius squared of each cell, nodes only.
   */
  radiusSquared: any;
  /**
   * Variable: isMoveable
   *
   * Array of booleans representing the movable states of the vertices.
   */
  isMoveable: boolean;
  /**
   * Variable: neighbours
   *
   * Local copy of cell neighbours.
   */
  neighbours: any;
  /**
   * Variable: indices
   *
   * Hashtable from cells to local indices.
   */
  indices: any;
  /**
   * Variable: allowedToRun
   *
   * Boolean flag that specifies if the layout is allowed to run. If this is
   * set to false, then the layout exits in the following iteration.
   * @example true
   */
  allowedToRun: boolean;

  constructor(graph: any) {
    mxGraphLayout.call(this, graph);
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
   * Implements <mxGraphLayout.execute>. This operates on all children of the
   * given parent where <isVertexIgnored> returns false.
   */
  execute(parent: any): void {
    const model = this.graph.getModel();
    this.vertexArray = [];
    const cells = this.graph.getChildVertices(parent);
    for (let i = 0; i < cells.length; i++) {
      if (!this.isVertexIgnored(cells[i])) {
        this.vertexArray.push(cells[i]);
      }
    }
    const initialBounds = (this.useInputOrigin) ? this.graph.getBoundingBoxFromGeometry(this.vertexArray) : null;
    const n = this.vertexArray.length;
    this.indices = [];
    this.dispX = [];
    this.dispY = [];
    this.cellLocation = [];
    this.isMoveable = [];
    this.neighbours = [];
    this.radius = [];
    this.radiusSquared = [];
    if (this.forceConstant < 0.001) {
      this.forceConstant = 0.001;
    }
    this.forceConstantSquared = this.forceConstant * this.forceConstant;
    for (let i = 0; i < this.vertexArray.length; i++) {
      const vertex = this.vertexArray[i];
      this.cellLocation[i] = [];
      const id = mxObjectIdentity.get(vertex);
      this.indices[id] = i;
      const bounds = this.getVertexBounds(vertex);
      const width = bounds.width;
      const height = bounds.height;
      const x = bounds.x;
      const y = bounds.y;
      this.cellLocation[i][0] = x + width / 2;
      this.cellLocation[i][1] = y + height / 2;
      this.radius[i] = Math.min(width, height);
      this.radiusSquared[i] = this.radius[i] * this.radius[i];
    }
    model.beginUpdate();
    try {
      for (let i = 0; i < n; i++) {
        this.dispX[i] = 0;
        this.dispY[i] = 0;
        this.isMoveable[i] = this.isVertexMovable(this.vertexArray[i]);
        const edges = this.graph.getConnections(this.vertexArray[i], parent);
        const cells = this.graph.getOpposites(edges, this.vertexArray[i]);
        this.neighbours[i] = [];
        for (let j = 0; j < cells.length; j++) {
          if (this.resetEdges) {
            this.graph.resetEdge(edges[j]);
          }
          if (this.disableEdgeStyle) {
            this.setEdgeStyleEnabled(edges[j], false);
          }
          const id = mxObjectIdentity.get(cells[j]);
          const index = this.indices[id];
          if (index != null) {
            this.neighbours[i][j] = index;
          } else {
            this.neighbours[i][j] = i;
          }
        }
      }
      this.temperature = this.initialTemp;
      if (this.maxIterations == 0) {
        this.maxIterations = 20 * Math.sqrt(n);
      }
      for (this.iteration = 0; this.iteration < this.maxIterations; this.iteration++) {
        if (!this.allowedToRun) {
          return;
        }
        this.calcRepulsion();
        this.calcAttraction();
        this.calcPositions();
        this.reduceTemperature();
      }
      let minx = null;
      let miny = null;
      for (let i = 0; i < this.vertexArray.length; i++) {
        const vertex = this.vertexArray[i];
        if (this.isVertexMovable(vertex)) {
          const bounds = this.getVertexBounds(vertex);
          if (bounds != null) {
            this.cellLocation[i][0] -= bounds.width / 2;
            this.cellLocation[i][1] -= bounds.height / 2;
            const x = this.graph.snap(Math.round(this.cellLocation[i][0]));
            const y = this.graph.snap(Math.round(this.cellLocation[i][1]));
            this.setVertexLocation(vertex, x, y);
            if (minx == null) {
              minx = x;
            } else {
              minx = Math.min(minx, x);
            }
            if (miny == null) {
              miny = y;
            } else {
              miny = Math.min(miny, y);
            }
          }
        }
      }
      let dx = -(minx || 0) + 1;
      let dy = -(miny || 0) + 1;
      if (initialBounds != null) {
        dx += initialBounds.x;
        dy += initialBounds.y;
      }
      this.graph.moveCells(this.vertexArray, dx, dy);
    } finally {
      model.endUpdate();
    }
  }

  /**
   * Function: calcPositions
   *
   * Takes the displacements calculated for each cell and applies them to the
   * local cache of cell positions. Limits the displacement to the current
   * temperature.
   */
  calcPositions(): void {
    for (let index = 0; index < this.vertexArray.length; index++) {
      if (this.isMoveable[index]) {
        let deltaLength = Math.sqrt(this.dispX[index] * this.dispX[index] + this.dispY[index] * this.dispY[index]);
        if (deltaLength < 0.001) {
          deltaLength = 0.001;
        }
        const newXDisp = this.dispX[index] / deltaLength * Math.min(deltaLength, this.temperature);
        const newYDisp = this.dispY[index] / deltaLength * Math.min(deltaLength, this.temperature);
        this.dispX[index] = 0;
        this.dispY[index] = 0;
        this.cellLocation[index][0] += newXDisp;
        this.cellLocation[index][1] += newYDisp;
      }
    }
  }

  /**
   * Function: calcAttraction
   *
   * Calculates the attractive forces between all laid out nodes linked by
   * edges
   */
  calcAttraction(): void {
    for (let i = 0; i < this.vertexArray.length; i++) {
      for (let k = 0; k < this.neighbours[i].length; k++) {
        const j = this.neighbours[i][k];
        if (i != j && this.isMoveable[i] && this.isMoveable[j]) {
          const xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
          const yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];
          let deltaLengthSquared = xDelta * xDelta + yDelta * yDelta - this.radiusSquared[i] - this.radiusSquared[j];
          if (deltaLengthSquared < this.minDistanceLimitSquared) {
            deltaLengthSquared = this.minDistanceLimitSquared;
          }
          const deltaLength = Math.sqrt(deltaLengthSquared);
          const force = (deltaLengthSquared) / this.forceConstant;
          const displacementX = (xDelta / deltaLength) * force;
          const displacementY = (yDelta / deltaLength) * force;
          this.dispX[i] -= displacementX;
          this.dispY[i] -= displacementY;
          this.dispX[j] += displacementX;
          this.dispY[j] += displacementY;
        }
      }
    }
  }

  /**
   * Function: calcRepulsion
   *
   * Calculates the repulsive forces between all laid out nodes
   */
  calcRepulsion(): void {
    const vertexCount = this.vertexArray.length;
    for (let i = 0; i < vertexCount; i++) {
      for (let j = i; j < vertexCount; j++) {
        if (!this.allowedToRun) {
          return;
        }
        if (j != i && this.isMoveable[i] && this.isMoveable[j]) {
          let xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
          let yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];
          if (xDelta == 0) {
            xDelta = 0.01 + Math.random();
          }
          if (yDelta == 0) {
            yDelta = 0.01 + Math.random();
          }
          const deltaLength = Math.sqrt((xDelta * xDelta) + (yDelta * yDelta));
          let deltaLengthWithRadius = deltaLength - this.radius[i] - this.radius[j];
          if (deltaLengthWithRadius > this.maxDistanceLimit) {
            continue;
          }
          if (deltaLengthWithRadius < this.minDistanceLimit) {
            deltaLengthWithRadius = this.minDistanceLimit;
          }
          const force = this.forceConstantSquared / deltaLengthWithRadius;
          const displacementX = (xDelta / deltaLength) * force;
          const displacementY = (yDelta / deltaLength) * force;
          this.dispX[i] += displacementX;
          this.dispY[i] += displacementY;
          this.dispX[j] -= displacementX;
          this.dispY[j] -= displacementY;
        }
      }
    }
  }

  /**
   * Function: reduceTemperature
   *
   * Reduces the temperature of the layout from an initial setting in a linear
   * fashion to zero.
   */
  reduceTemperature(): void {
    this.temperature = this.initialTemp * (1 - this.iteration / this.maxIterations);
  }
}
