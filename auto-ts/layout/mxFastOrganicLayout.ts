/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
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
 * @class
 */
export class mxFastOrganicLayout extends mxGraphLayout {
    /**
     Copyright (c) 2006-2015, JGraph Ltd
     Copyright (c) 2006-2015, Gaudenz Alder
     */
    /**
     Class: mxFastOrganicLayout

     Extends <mxGraphLayout> to implement a fast organic layout algorithm.
     The vertices need to be connected for this layout to work, vertices
     with no connections are ignored.

     Example:

     (code)
     var layout = new mxFastOrganicLayout(graph);
     layout.execute(graph.getDefaultParent());
     (end)

     Constructor: mxCompactTreeLayout

     Constructs a new fast organic layout for the specified graph.
     */
    constructor(graph) {
        mxGraphLayout.call(this, graph);
    }

    /**
     Variable: useInputOrigin

     Specifies if the top left corner of the input cells should be the origin
     of the layout result. Default is true.
     */
    useInputOrigin = true;
    /**
     Variable: resetEdges

     Specifies if all edge points of traversed edges should be removed.
     Default is true.
     */
    resetEdges = true;
    /**
     Variable: disableEdgeStyle

     Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
     modified by the result. Default is true.
     */
    disableEdgeStyle = true;
    /**
     Variable: forceConstant

     The force constant by which the attractive forces are divided and the
     replusive forces are multiple by the square of. The value equates to the
     average radius there is of free space around each node. Default is 50.
     */
    forceConstant = 50;
    /**
     Variable: forceConstantSquared

     Cache of <forceConstant>^2 for performance.
     */
    forceConstantSquared = 0;
    /**
     Variable: minDistanceLimit

     Minimal distance limit. Default is 2. Prevents of
     dividing by zero.
     */
    minDistanceLimit = 2;
    /**
     Variable: minDistanceLimit

     Minimal distance limit. Default is 2. Prevents of
     dividing by zero.
     */
    maxDistanceLimit = 500;
    /**
     Variable: minDistanceLimitSquared

     Cached version of <minDistanceLimit> squared.
     */
    minDistanceLimitSquared = 4;
    /**
     Variable: initialTemp

     Start value of temperature. Default is 200.
     */
    initialTemp = 200;
    /**
     Variable: temperature

     Temperature to limit displacement at later stages of layout.
     */
    temperature = 0;
    /**
     Variable: maxIterations

     Total number of iterations to run the layout though.
     */
    maxIterations = 0;
    /**
     Variable: iteration

     Current iteration count.
     */
    iteration = 0;
    /**
     Variable: allowedToRun

     Boolean flag that specifies if the layout is allowed to run. If this is
     set to false, then the layout exits in the following iteration.
     */
    allowedToRun = true;

    /**
     Function: isVertexIgnored

     Returns a boolean indicating if the given <mxCell> should be ignored as a
     vertex. This returns true if the cell has no connections.

     Parameters:

     vertex - <mxCell> whose ignored state should be returned.
     */
    isVertexIgnored(vertex) {
        return mxGraphLayout.prototype.isVertexIgnored.apply(this, arguments) || this.graph.getConnections(vertex).length == 0;
    }

    /**
     Function: execute

     Implements <mxGraphLayout.execute>. This operates on all children of the
     given parent where <isVertexIgnored> returns false.
     */
    execute(parent) {
        var model = this.graph.getModel();
        this.vertexArray = [];
        var cells = this.graph.getChildVertices(parent);
        for (var i = 0; i < cells.length; i++) {
            if (!this.isVertexIgnored(cells[i])) {
                this.vertexArray.push(cells[i]);
            }
        }
        var initialBounds = (this.useInputOrigin) ? this.graph.getBoundingBoxFromGeometry(this.vertexArray) : null;
        var n = this.vertexArray.length;
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
        for (var i = 0; i < this.vertexArray.length; i++) {
            var vertex = this.vertexArray[i];
            this.cellLocation[i] = [];
            var id = mxObjectIdentity.get(vertex);
            this.indices[id] = i;
            var bounds = this.getVertexBounds(vertex);
            var width = bounds.width;
            var height = bounds.height;
            var x = bounds.x;
            var y = bounds.y;
            this.cellLocation[i][0] = x + width / 2;
            this.cellLocation[i][1] = y + height / 2;
            this.radius[i] = Math.min(width, height);
            this.radiusSquared[i] = this.radius[i] * this.radius[i];
        }
        model.beginUpdate();
        try {
            for (var i = 0; i < n; i++) {
                this.dispX[i] = 0;
                this.dispY[i] = 0;
                this.isMoveable[i] = this.isVertexMovable(this.vertexArray[i]);
                var edges = this.graph.getConnections(this.vertexArray[i], parent);
                var cells = this.graph.getOpposites(edges, this.vertexArray[i]);
                this.neighbours[i] = [];
                for (var j = 0; j < cells.length; j++) {
                    if (this.resetEdges) {
                        this.graph.resetEdge(edges[j]);
                    }
                    if (this.disableEdgeStyle) {
                        this.setEdgeStyleEnabled(edges[j], false);
                    }
                    var id = mxObjectIdentity.get(cells[j]);
                    var index = this.indices[id];
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
            var minx = null;
            var miny = null;
            for (var i = 0; i < this.vertexArray.length; i++) {
                var vertex = this.vertexArray[i];
                if (this.isVertexMovable(vertex)) {
                    var bounds = this.getVertexBounds(vertex);
                    if (bounds != null) {
                        this.cellLocation[i][0] -= bounds.width / 2;
                        this.cellLocation[i][1] -= bounds.height / 2;
                        var x = this.graph.snap(Math.round(this.cellLocation[i][0]));
                        var y = this.graph.snap(Math.round(this.cellLocation[i][1]));
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
            var dx = -(minx || 0) + 1;
            var dy = -(miny || 0) + 1;
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
     Function: calcPositions

     Takes the displacements calculated for each cell and applies them to the
     local cache of cell positions. Limits the displacement to the current
     temperature.
     */
    calcPositions() {
        for (var index = 0; index < this.vertexArray.length; index++) {
            if (this.isMoveable[index]) {
                var deltaLength = Math.sqrt(this.dispX[index] * this.dispX[index] + this.dispY[index] * this.dispY[index]);
                if (deltaLength < 0.001) {
                    deltaLength = 0.001;
                }
                var newXDisp = this.dispX[index] / deltaLength * Math.min(deltaLength, this.temperature);
                var newYDisp = this.dispY[index] / deltaLength * Math.min(deltaLength, this.temperature);
                this.dispX[index] = 0;
                this.dispY[index] = 0;
                this.cellLocation[index][0] += newXDisp;
                this.cellLocation[index][1] += newYDisp;
            }
        }
    }

    /**
     Function: calcAttraction

     Calculates the attractive forces between all laid out nodes linked by
     edges
     */
    calcAttraction() {
        for (var i = 0; i < this.vertexArray.length; i++) {
            for (var k = 0; k < this.neighbours[i].length; k++) {
                var j = this.neighbours[i][k];
                if (i != j && this.isMoveable[i] && this.isMoveable[j]) {
                    var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
                    var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];
                    var deltaLengthSquared = xDelta * xDelta + yDelta * yDelta - this.radiusSquared[i] - this.radiusSquared[j];
                    if (deltaLengthSquared < this.minDistanceLimitSquared) {
                        deltaLengthSquared = this.minDistanceLimitSquared;
                    }
                    var deltaLength = Math.sqrt(deltaLengthSquared);
                    var force = (deltaLengthSquared) / this.forceConstant;
                    var displacementX = (xDelta / deltaLength) * force;
                    var displacementY = (yDelta / deltaLength) * force;
                    this.dispX[i] -= displacementX;
                    this.dispY[i] -= displacementY;
                    this.dispX[j] += displacementX;
                    this.dispY[j] += displacementY;
                }
            }
        }
    }

    /**
     Function: calcRepulsion

     Calculates the repulsive forces between all laid out nodes
     */
    calcRepulsion() {
        var vertexCount = this.vertexArray.length;
        for (var i = 0; i < vertexCount; i++) {
            for (var j = i; j < vertexCount; j++) {
                if (!this.allowedToRun) {
                    return;
                }
                if (j != i && this.isMoveable[i] && this.isMoveable[j]) {
                    var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
                    var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];
                    if (xDelta == 0) {
                        xDelta = 0.01 + Math.random();
                    }
                    if (yDelta == 0) {
                        yDelta = 0.01 + Math.random();
                    }
                    var deltaLength = Math.sqrt((xDelta * xDelta) + (yDelta * yDelta));
                    var deltaLengthWithRadius = deltaLength - this.radius[i] - this.radius[j];
                    if (deltaLengthWithRadius > this.maxDistanceLimit) {
                        continue;
                    }
                    if (deltaLengthWithRadius < this.minDistanceLimit) {
                        deltaLengthWithRadius = this.minDistanceLimit;
                    }
                    var force = this.forceConstantSquared / deltaLengthWithRadius;
                    var displacementX = (xDelta / deltaLength) * force;
                    var displacementY = (yDelta / deltaLength) * force;
                    this.dispX[i] += displacementX;
                    this.dispY[i] += displacementY;
                    this.dispX[j] -= displacementX;
                    this.dispY[j] -= displacementY;
                }
            }
        }
    }

    /**
     Function: reduceTemperature

     Reduces the temperature of the layout from an initial setting in a linear
     fashion to zero.
     */
    reduceTemperature() {
        this.temperature = this.initialTemp * (1 - this.iteration / this.maxIterations);
    }
};
able: dispX
*
* An;
array;
of;
locally;
stored;
X;
co - ordinate;
displacements;
for the vertices.
* /
mxFastOrganicLayout.prototype.dispX;

/**
 * Variable: dispY
 *
 * An array of locally stored Y co-ordinate displacements for the vertices.
 */
mxFastOrganicLayout.prototype.dispY;

/**
 * Variable: cellLocation
 *
 * An array of locally stored co-ordinate positions for the vertices.
 */
mxFastOrganicLayout.prototype.cellLocation;

/**
 * Variable: radius
 *
 * The approximate radius of each cell, nodes only.
 */
mxFastOrganicLayout.prototype.radius;

/**
 * Variable: radiusSquared
 *
 * The approximate radius squared of each cell, nodes only.
 */
mxFastOrganicLayout.prototype.radiusSquared;

/**
 * Variable: isMoveable
 *
 * Array of booleans representing the movable states of the vertices.
 */
mxFastOrganicLayout.prototype.isMoveable;

/**
 * Variable: neighbours
 *
 * Local copy of cell neighbours.
 */
mxFastOrganicLayout.prototype.neighbours;

/**
 * Variable: indices
 *
 * Hashtable from cells to local indices.
 */
mxFastOrganicLayout.prototype.indices;
;
;
;
;
;
;
;
