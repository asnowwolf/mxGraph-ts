/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxMedianHybridCrossingReduction
 *
 * Sets the horizontal locations of node and edge dummy nodes on each layer.
 * Uses median down and up weighings as well heuristic to straighten edges as
 * far as possible.
 *
 * Constructor: mxMedianHybridCrossingReduction
 *
 * Creates a coordinate assignment.
 *
 * Arguments:
 *
 * intraCellSpacing - the minimum buffer between cells on the same rank
 * interRankCellSpacing - the minimum distance between cells on adjacent ranks
 * orientation - the position of the root node(s) relative to the graph
 * initialX - the leftmost coordinate node placement starts at
 * @class
 */
export class mxMedianHybridCrossingReduction extends mxHierarchicalLayoutStage {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxMedianHybridCrossingReduction

   Sets the horizontal locations of node and edge dummy nodes on each layer.
   Uses median down and up weighings as well heuristic to straighten edges as
   far as possible.

   Constructor: mxMedianHybridCrossingReduction

   Creates a coordinate assignment.

   Arguments:

   intraCellSpacing - the minimum buffer between cells on the same rank
   interRankCellSpacing - the minimum distance between cells on adjacent ranks
   orientation - the position of the root node(s) relative to the graph
   initialX - the leftmost coordinate node placement starts at
   */
  constructor(layout) {
    this.layout = layout;
  }

  /**
   Variable: layout

   Reference to the enclosing <mxHierarchicalLayout>.
   */
  layout = null;
  /**
   Variable: maxIterations

   The maximum number of iterations to perform whilst reducing edge
   crossings. Default is 24.
   */
  maxIterations = 24;
  /**
   Variable: nestedBestRanks

   Stores each rank as a collection of cells in the best order found for
   each layer so far
   */
  nestedBestRanks = null;
  /**
   Variable: currentBestCrossings

   The total number of crossings found in the best configuration so far
   */
  currentBestCrossings = 0;
  /**
   Variable: iterationsWithoutImprovement

   The total number of crossings found in the best configuration so far
   */
  iterationsWithoutImprovement = 0;
  /**
   Variable: maxNoImprovementIterations

   The total number of crossings found in the best configuration so far
   */
  maxNoImprovementIterations = 2;

  /**
   Function: execute

   Performs a vertex ordering within ranks as described by Gansner et al
   1993
   */
  execute(parent) {
    var model = this.layout.getModel();
    this.nestedBestRanks = [];
    for (var i = 0; i < model.ranks.length; i++) {
      this.nestedBestRanks[i] = model.ranks[i].slice();
    }
    var iterationsWithoutImprovement = 0;
    var currentBestCrossings = this.calculateCrossings(model);
    for (var i = 0; i < this.maxIterations && iterationsWithoutImprovement < this.maxNoImprovementIterations; i++) {
      this.weightedMedian(i, model);
      this.transpose(i, model);
      var candidateCrossings = this.calculateCrossings(model);
      if (candidateCrossings < currentBestCrossings) {
        currentBestCrossings = candidateCrossings;
        iterationsWithoutImprovement = 0;
        for (var j = 0; j < this.nestedBestRanks.length; j++) {
          var rank = model.ranks[j];
          for (var k = 0; k < rank.length; k++) {
            var cell = rank[k];
            this.nestedBestRanks[j][cell.getGeneralPurposeVariable(j)] = cell;
          }
        }
      } else {
        iterationsWithoutImprovement++;
        for (var j = 0; j < this.nestedBestRanks.length; j++) {
          var rank = model.ranks[j];
          for (var k = 0; k < rank.length; k++) {
            var cell = rank[k];
            cell.setGeneralPurposeVariable(j, k);
          }
        }
      }
      if (currentBestCrossings == 0) {
        break;
      }
    }
    var ranks = [];
    var rankList = [];
    for (var i = 0; i < model.maxRank + 1; i++) {
      rankList[i] = [];
      ranks[i] = rankList[i];
    }
    for (var i = 0; i < this.nestedBestRanks.length; i++) {
      for (var j = 0; j < this.nestedBestRanks[i].length; j++) {
        rankList[i].push(this.nestedBestRanks[i][j]);
      }
    }
    model.ranks = ranks;
  }

  /**
   Function: calculateCrossings

   Calculates the total number of edge crossing in the current graph.
   Returns the current number of edge crossings in the hierarchy graph
   model in the current candidate layout

   Parameters:

   model - the internal model describing the hierarchy
   */
  calculateCrossings(model) {
    var numRanks = model.ranks.length;
    var totalCrossings = 0;
    for (var i = 1; i < numRanks; i++) {
      totalCrossings += this.calculateRankCrossing(i, model);
    }
    return totalCrossings;
  }

  /**
   Function: calculateRankCrossing

   Calculates the number of edges crossings between the specified rank and
   the rank below it. Returns the number of edges crossings with the rank
   beneath

   Parameters:

   i -  the topmost rank of the pair ( higher rank value )
   model - the internal model describing the hierarchy
   */
  calculateRankCrossing(i, model) {
    var totalCrossings = 0;
    var rank = model.ranks[i];
    var previousRank = model.ranks[i - 1];
    var tmpIndices = [];
    for (var j = 0; j < rank.length; j++) {
      var node = rank[j];
      var rankPosition = node.getGeneralPurposeVariable(i);
      var connectedCells = node.getPreviousLayerConnectedCells(i);
      var nodeIndices = [];
      for (var k = 0; k < connectedCells.length; k++) {
        var connectedNode = connectedCells[k];
        var otherCellRankPosition = connectedNode.getGeneralPurposeVariable(i - 1);
        nodeIndices.push(otherCellRankPosition);
      }
      nodeIndices.sort(function (x, y) {
        return x - y;
      });
      tmpIndices[rankPosition] = nodeIndices;
    }
    var indices = [];
    for (var j = 0; j < tmpIndices.length; j++) {
      indices = indices.concat(tmpIndices[j]);
    }
    var firstIndex = 1;
    while (firstIndex < previousRank.length) {
      firstIndex <<= 1;
    }
    var treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;
    var tree = [];
    for (var j = 0; j < treeSize; ++j) {
      tree[j] = 0;
    }
    for (var j = 0; j < indices.length; j++) {
      var index = indices[j];
      var treeIndex = index + firstIndex;
      ++tree[treeIndex];
      while (treeIndex > 0) {
        if (treeIndex % 2) {
          totalCrossings += tree[treeIndex + 1];
        }
        treeIndex = (treeIndex - 1) >> 1;
        ++tree[treeIndex];
      }
    }
    return totalCrossings;
  }

  /**
   Function: transpose

   Takes each possible adjacent cell pair on each rank and checks if
   swapping them around reduces the number of crossing

   Parameters:

   mainLoopIteration - the iteration number of the main loop
   model - the internal model describing the hierarchy
   */
  transpose(mainLoopIteration, model) {
    var improved = true;
    var count = 0;
    var maxCount = 10;
    while (improved && count++ < maxCount) {
      var nudge = mainLoopIteration % 2 == 1 && count % 2 == 1;
      improved = false;
      for (var i = 0; i < model.ranks.length; i++) {
        var rank = model.ranks[i];
        var orderedCells = [];
        for (var j = 0; j < rank.length; j++) {
          var cell = rank[j];
          var tempRank = cell.getGeneralPurposeVariable(i);
          if (tempRank < 0) {
            tempRank = j;
          }
          orderedCells[tempRank] = cell;
        }
        var leftCellAboveConnections = null;
        var leftCellBelowConnections = null;
        var rightCellAboveConnections = null;
        var rightCellBelowConnections = null;
        var leftAbovePositions = null;
        var leftBelowPositions = null;
        var rightAbovePositions = null;
        var rightBelowPositions = null;
        var leftCell = null;
        var rightCell = null;
        for (var j = 0; j < (rank.length - 1); j++) {
          if (j == 0) {
            leftCell = orderedCells[j];
            leftCellAboveConnections = leftCell.getNextLayerConnectedCells(i);
            leftCellBelowConnections = leftCell.getPreviousLayerConnectedCells(i);
            leftAbovePositions = [];
            leftBelowPositions = [];
            for (var k = 0; k < leftCellAboveConnections.length; k++) {
              leftAbovePositions[k] = leftCellAboveConnections[k].getGeneralPurposeVariable(i + 1);
            }
            for (var k = 0; k < leftCellBelowConnections.length; k++) {
              leftBelowPositions[k] = leftCellBelowConnections[k].getGeneralPurposeVariable(i - 1);
            }
          } else {
            leftCellAboveConnections = rightCellAboveConnections;
            leftCellBelowConnections = rightCellBelowConnections;
            leftAbovePositions = rightAbovePositions;
            leftBelowPositions = rightBelowPositions;
            leftCell = rightCell;
          }
          rightCell = orderedCells[j + 1];
          rightCellAboveConnections = rightCell.getNextLayerConnectedCells(i);
          rightCellBelowConnections = rightCell.getPreviousLayerConnectedCells(i);
          rightAbovePositions = [];
          rightBelowPositions = [];
          for (var k = 0; k < rightCellAboveConnections.length; k++) {
            rightAbovePositions[k] = rightCellAboveConnections[k].getGeneralPurposeVariable(i + 1);
          }
          for (var k = 0; k < rightCellBelowConnections.length; k++) {
            rightBelowPositions[k] = rightCellBelowConnections[k].getGeneralPurposeVariable(i - 1);
          }
          var totalCurrentCrossings = 0;
          var totalSwitchedCrossings = 0;
          for (var k = 0; k < leftAbovePositions.length; k++) {
            for (var ik = 0; ik < rightAbovePositions.length; ik++) {
              if (leftAbovePositions[k] > rightAbovePositions[ik]) {
                totalCurrentCrossings++;
              }
              if (leftAbovePositions[k] < rightAbovePositions[ik]) {
                totalSwitchedCrossings++;
              }
            }
          }
          for (var k = 0; k < leftBelowPositions.length; k++) {
            for (var ik = 0; ik < rightBelowPositions.length; ik++) {
              if (leftBelowPositions[k] > rightBelowPositions[ik]) {
                totalCurrentCrossings++;
              }
              if (leftBelowPositions[k] < rightBelowPositions[ik]) {
                totalSwitchedCrossings++;
              }
            }
          }
          if ((totalSwitchedCrossings < totalCurrentCrossings) || (totalSwitchedCrossings == totalCurrentCrossings && nudge)) {
            var temp = leftCell.getGeneralPurposeVariable(i);
            leftCell.setGeneralPurposeVariable(i, rightCell.getGeneralPurposeVariable(i));
            rightCell.setGeneralPurposeVariable(i, temp);
            rightCellAboveConnections = leftCellAboveConnections;
            rightCellBelowConnections = leftCellBelowConnections;
            rightAbovePositions = leftAbovePositions;
            rightBelowPositions = leftBelowPositions;
            rightCell = leftCell;
            if (!nudge) {
              improved = true;
            }
          }
        }
      }
    }
  }

  /**
   Function: weightedMedian

   Sweeps up or down the layout attempting to minimise the median placement
   of connected cells on adjacent ranks

   Parameters:

   iteration - the iteration number of the main loop
   model - the internal model describing the hierarchy
   */
  weightedMedian(iteration, model) {
    var downwardSweep = (iteration % 2 == 0);
    if (downwardSweep) {
      for (var j = model.maxRank - 1; j >= 0; j--) {
        this.medianRank(j, downwardSweep);
      }
    } else {
      for (var j = 1; j < model.maxRank; j++) {
        this.medianRank(j, downwardSweep);
      }
    }
  }

  /**
   Function: medianRank

   Attempts to minimise the median placement of connected cells on this rank
   and one of the adjacent ranks

   Parameters:

   rankValue - the layer number of this rank
   downwardSweep - whether or not this is a downward sweep through the graph
   */
  medianRank(rankValue, downwardSweep) {
    var numCellsForRank = this.nestedBestRanks[rankValue].length;
    var medianValues = [];
    var reservedPositions = [];
    for (var i = 0; i < numCellsForRank; i++) {
      var cell = this.nestedBestRanks[rankValue][i];
      var sorterEntry = new MedianCellSorter();
      sorterEntry.cell = cell;
      var nextLevelConnectedCells;
      if (downwardSweep) {
        nextLevelConnectedCells = cell.getNextLayerConnectedCells(rankValue);
      } else {
        nextLevelConnectedCells = cell.getPreviousLayerConnectedCells(rankValue);
      }
      var nextRankValue;
      if (downwardSweep) {
        nextRankValue = rankValue + 1;
      } else {
        nextRankValue = rankValue - 1;
      }
      if (nextLevelConnectedCells != null && nextLevelConnectedCells.length != 0) {
        sorterEntry.medianValue = this.medianValue(nextLevelConnectedCells, nextRankValue);
        medianValues.push(sorterEntry);
      } else {
        reservedPositions[cell.getGeneralPurposeVariable(rankValue)] = true;
      }
    }
    medianValues.sort(MedianCellSorter.prototype.compare);
    for (var i = 0; i < numCellsForRank; i++) {
      if (reservedPositions[i] == null) {
        var cell = medianValues.shift().cell;
        cell.setGeneralPurposeVariable(rankValue, i);
      }
    }
  }

  /**
   Function: medianValue

   Calculates the median rank order positioning for the specified cell using
   the connected cells on the specified rank. Returns the median rank
   ordering value of the connected cells

   Parameters:

   connectedCells - the cells on the specified rank connected to the
   specified cell
   rankValue - the rank that the connected cell lie upon
   */
  medianValue(connectedCells, rankValue) {
    var medianValues = [];
    var arrayCount = 0;
    for (var i = 0; i < connectedCells.length; i++) {
      var cell = connectedCells[i];
      medianValues[arrayCount++] = cell.getGeneralPurposeVariable(rankValue);
    }
    medianValues.sort(function (a, b) {
      return a - b;
    });
    if (arrayCount % 2 == 1) {
      return medianValues[Math.floor(arrayCount / 2)];
    } else if (arrayCount == 2) {
      return ((medianValues[0] + medianValues[1]) / 2);
    } else {
      var medianPoint = arrayCount / 2;
      var leftMedian = medianValues[medianPoint - 1] - medianValues[0];
      var rightMedian = medianValues[arrayCount - 1] - medianValues[medianPoint];
      return (medianValues[medianPoint - 1] * rightMedian + medianValues[medianPoint] * leftMedian) / (leftMedian + rightMedian);
    }
  }

  /**
   Variable: medianValue

   The weighted value of the cell stored.
   */
  medianValue = 0;
  /**
   Variable: cell

   The cell whose median value is being calculated
   */
  cell = false;

  /**
   Function: compare

   Compares two MedianCellSorters.
   */
  compare(a, b) {
    if (a != null && b != null) {
      if (b.medianValue > a.medianValue) {
        return -1;
      } else if (b.medianValue < a.medianValue) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
};edianValues[medianPoint - 1] - medianValues[0];
var rightMedian = medianValues[arrayCount - 1] - medianValues[medianPoint];
return (medianValues[medianPoint - 1] * rightMedian + medianValues[medianPoint] * leftMedian) / (leftMedian + rightMedian);
}
}
/**
 Variable: medianValue

 The weighted value of the cell stored.
 */
medianValue = 0;
/**
 Variable: cell

 The cell whose median value is being calculated
 */
cell = false;
/**
 Function: compare

 Compares two MedianCellSorters.
 */
compare(a, b);
{
  if (a != null && b != null) {
    if (b.medianValue > a.medianValue) {
      return -1;
    } else if (b.medianValue < a.medianValue) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
};
