/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxGraphHierarchyNode
 *
 * An abstraction of a hierarchical edge for the hierarchy layout
 *
 * Constructor: mxGraphHierarchyNode
 *
 * Constructs an internal node to represent the specified real graph cell
 *
 * Arguments:
 *
 * cell - the real graph cell this node represents
 * @class
 */
export class mxGraphHierarchyNode extends mxGraphAbstractHierarchyCell {
    /**
     Copyright (c) 2006-2015, JGraph Ltd
     Copyright (c) 2006-2015, Gaudenz Alder
     */
    /**
     Class: mxGraphHierarchyNode

     An abstraction of a hierarchical edge for the hierarchy layout

     Constructor: mxGraphHierarchyNode

     Constructs an internal node to represent the specified real graph cell

     Arguments:

     cell - the real graph cell this node represents
     */
    constructor(cell) {
        mxGraphAbstractHierarchyCell.apply(this, arguments);
        this.cell = cell;
        this.id = mxObjectIdentity.get(cell);
        this.connectsAsTarget = [];
        this.connectsAsSource = [];
    }

    /**
     Variable: cell

     The graph cell this object represents.
     */
    cell = null;
    /**
     Variable: id

     The object identity of the wrapped cell
     */
    id = null;
    /**
     Variable: connectsAsTarget

     Collection of hierarchy edges that have this node as a target
     */
    connectsAsTarget = null;
    /**
     Variable: connectsAsSource

     Collection of hierarchy edges that have this node as a source
     */
    connectsAsSource = null;
    /**
     Variable: hashCode

     Assigns a unique hashcode for each node. Used by the model dfs instead
     of copying HashSets
     */
    hashCode = false;

    /**
     Function: getRankValue

     Returns the integer value of the layer that this node resides in
     */
    getRankValue(layer) {
        return this.maxRank;
    }

    /**
     Function: getNextLayerConnectedCells

     Returns the cells this cell connects to on the next layer up
     */
    getNextLayerConnectedCells(layer) {
        if (this.nextLayerConnectedCells == null) {
            this.nextLayerConnectedCells = [];
            this.nextLayerConnectedCells[0] = [];
            for (var i = 0; i < this.connectsAsTarget.length; i++) {
                var edge = this.connectsAsTarget[i];
                if (edge.maxRank == -1 || edge.maxRank == layer + 1) {
                    this.nextLayerConnectedCells[0].push(edge.source);
                } else {
                    this.nextLayerConnectedCells[0].push(edge);
                }
            }
        }
        return this.nextLayerConnectedCells[0];
    }

    /**
     Function: getPreviousLayerConnectedCells

     Returns the cells this cell connects to on the next layer down
     */
    getPreviousLayerConnectedCells(layer) {
        if (this.previousLayerConnectedCells == null) {
            this.previousLayerConnectedCells = [];
            this.previousLayerConnectedCells[0] = [];
            for (var i = 0; i < this.connectsAsSource.length; i++) {
                var edge = this.connectsAsSource[i];
                if (edge.minRank == -1 || edge.minRank == layer - 1) {
                    this.previousLayerConnectedCells[0].push(edge.target);
                } else {
                    this.previousLayerConnectedCells[0].push(edge);
                }
            }
        }
        return this.previousLayerConnectedCells[0];
    }

    /**
     Function: isVertex

     Returns true.
     */
    isVertex() {
        return true;
    }

    /**
     Function: getGeneralPurposeVariable

     Gets the value of temp for the specified layer
     */
    getGeneralPurposeVariable(layer) {
        return this.temp[0];
    }

    /**
     Function: setGeneralPurposeVariable

     Set the value of temp for the specified layer
     */
    setGeneralPurposeVariable(layer, value) {
        this.temp[0] = value;
    }

    /**
     Function: isAncestor
     */
    isAncestor(otherNode) {
        if (otherNode != null && this.hashCode != null && otherNode.hashCode != null && this.hashCode.length < otherNode.hashCode.length) {
            if (this.hashCode == otherNode.hashCode) {
                return true;
            }
            if (this.hashCode == null || this.hashCode == null) {
                return false;
            }
            for (var i = 0; i < this.hashCode.length; i++) {
                if (this.hashCode[i] != otherNode.hashCode[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     Function: getCoreCell

     Gets the core vertex associated with this wrapper
     */
    getCoreCell() {
        return this.cell;
    }
};
