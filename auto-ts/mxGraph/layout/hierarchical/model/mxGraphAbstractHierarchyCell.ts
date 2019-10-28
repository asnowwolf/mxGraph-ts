/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxGraphAbstractHierarchyCell
 *
 * An abstraction of an internal hierarchy node or edge
 *
 * Constructor: mxGraphAbstractHierarchyCell
 *
 * Constructs a new hierarchical layout algorithm.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * deterministic - Optional boolean that specifies if this layout should be
 * deterministic. Default is true.
 * @class
 */
export class mxGraphAbstractHierarchyCell {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxGraphAbstractHierarchyCell

   An abstraction of an internal hierarchy node or edge

   Constructor: mxGraphAbstractHierarchyCell

   Constructs a new hierarchical layout algorithm.

   Arguments:

   graph - Reference to the enclosing <mxGraph>.
   deterministic - Optional boolean that specifies if this layout should be
   deterministic. Default is true.
   */
  constructor() {
    this.x = [];
    this.y = [];
    this.temp = [];
  }

  /**
   Variable: maxRank

   The maximum rank this cell occupies. Default is -1.
   */
  maxRank = -1;
  /**
   Variable: minRank

   The minimum rank this cell occupies. Default is -1.
   */
  minRank = -1;
  /**
   Variable: x

   The x position of this cell for each layer it occupies
   */
  x = null;
  /**
   Variable: y

   The y position of this cell for each layer it occupies
   */
  y = null;
  /**
   Variable: width

   The width of this cell
   */
  width = 0;
  /**
   Variable: height

   The height of this cell
   */
  height = 0;
  /**
   Variable: nextLayerConnectedCells

   A cached version of the cells this cell connects to on the next layer up
   */
  nextLayerConnectedCells = null;
  /**
   Variable: previousLayerConnectedCells

   A cached version of the cells this cell connects to on the next layer down
   */
  previousLayerConnectedCells = null;
  /**
   Variable: temp

   Temporary variable for general use. Generally, try to avoid
   carrying information between stages. Currently, the longest
   path layering sets temp to the rank position in fixRanks()
   and the crossing reduction uses this. This meant temp couldn't
   be used for hashing the nodes in the model dfs and so hashCode
   was created
   */
  temp = null;

  /**
   Function: getNextLayerConnectedCells

   Returns the cells this cell connects to on the next layer up
   */
  getNextLayerConnectedCells(layer) {
    return null;
  }

  /**
   Function: getPreviousLayerConnectedCells

   Returns the cells this cell connects to on the next layer down
   */
  getPreviousLayerConnectedCells(layer) {
    return null;
  }

  /**
   Function: isEdge

   Returns whether or not this cell is an edge
   */
  isEdge() {
    return false;
  }

  /**
   Function: isVertex

   Returns whether or not this cell is a node
   */
  isVertex() {
    return false;
  }

  /**
   Function: getGeneralPurposeVariable

   Gets the value of temp for the specified layer
   */
  getGeneralPurposeVariable(layer) {
    return null;
  }

  /**
   Function: setGeneralPurposeVariable

   Set the value of temp for the specified layer
   */
  setGeneralPurposeVariable(layer, value) {
    return null;
  }

  /**
   Function: setX

   Set the value of x for the specified layer
   */
  setX(layer, value) {
    if (this.isVertex()) {
      this.x[0] = value;
    } else if (this.isEdge()) {
      this.x[layer - this.minRank - 1] = value;
    }
  }

  /**
   Function: getX

   Gets the value of x on the specified layer
   */
  getX(layer) {
    if (this.isVertex()) {
      return this.x[0];
    } else if (this.isEdge()) {
      return this.x[layer - this.minRank - 1];
    }
    return 0;
  }

  /**
   Function: setY

   Set the value of y for the specified layer
   */
  setY(layer, value) {
    if (this.isVertex()) {
      this.y[0] = value;
    } else if (this.isEdge()) {
      this.y[layer - this.minRank - 1] = value;
    }
  }
};
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
