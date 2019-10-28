/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxGraphHierarchyModel
 *
 * Internal model of a hierarchical graph. This model stores nodes and edges
 * equivalent to the real graph nodes and edges, but also stores the rank of the
 * cells, the order within the ranks and the new candidate locations of cells.
 * The internal model also reverses edge direction were appropriate , ignores
 * self-loop and groups parallels together under one edge object.
 *
 * Constructor: mxGraphHierarchyModel
 *
 * Creates an internal ordered graph model using the vertices passed in. If
 * there are any, leftward edge need to be inverted in the internal model
 *
 * Arguments:
 *
 * graph - the facade describing the graph to be operated on
 * vertices - the vertices for this hierarchy
 * ordered - whether or not the vertices are already ordered
 * deterministic - whether or not this layout should be deterministic on each
 * tightenToSource - whether or not to tighten vertices towards the sources
 * scanRanksFromSinks - Whether rank assignment is from the sinks or sources.
 * usage
 * @class
 */
export class mxGraphHierarchyModel {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxGraphHierarchyModel

   Internal model of a hierarchical graph. This model stores nodes and edges
   equivalent to the real graph nodes and edges, but also stores the rank of the
   cells, the order within the ranks and the new candidate locations of cells.
   The internal model also reverses edge direction were appropriate , ignores
   self-loop and groups parallels together under one edge object.

   Constructor: mxGraphHierarchyModel

   Creates an internal ordered graph model using the vertices passed in. If
   there are any, leftward edge need to be inverted in the internal model

   Arguments:

   graph - the facade describing the graph to be operated on
   vertices - the vertices for this hierarchy
   ordered - whether or not the vertices are already ordered
   deterministic - whether or not this layout should be deterministic on each
   tightenToSource - whether or not to tighten vertices towards the sources
   scanRanksFromSinks - Whether rank assignment is from the sinks or sources.
   usage
   */
  constructor(layout, vertices, roots, parent, tightenToSource) {
    var graph = layout.getGraph();
    this.tightenToSource = tightenToSource;
    this.roots = roots;
    this.parent = parent;
    this.vertexMapper = new mxDictionary();
    this.edgeMapper = new mxDictionary();
    this.maxRank = 0;
    var internalVertices = [];
    if (vertices == null) {
      vertices = this.graph.getChildVertices(parent);
    }
    this.maxRank = this.SOURCESCANSTARTRANK;
    this.createInternalCells(layout, vertices, internalVertices);
    for (var i = 0; i < vertices.length; i++) {
      var edges = internalVertices[i].connectsAsSource;
      for (var j = 0; j < edges.length; j++) {
        var internalEdge = edges[j];
        var realEdges = internalEdge.edges;
        if (realEdges != null && realEdges.length > 0) {
          var realEdge = realEdges[0];
          var targetCell = layout.getVisibleTerminal(realEdge, false);
          var internalTargetCell = this.vertexMapper.get(targetCell);
          if (internalVertices[i] == internalTargetCell) {
            targetCell = layout.getVisibleTerminal(realEdge, true);
            internalTargetCell = this.vertexMapper.get(targetCell);
          }
          if (internalTargetCell != null && internalVertices[i] != internalTargetCell) {
            internalEdge.target = internalTargetCell;
            if (internalTargetCell.connectsAsTarget.length == 0) {
              internalTargetCell.connectsAsTarget = [];
            }
            if (mxUtils.indexOf(internalTargetCell.connectsAsTarget, internalEdge) < 0) {
              internalTargetCell.connectsAsTarget.push(internalEdge);
            }
          }
        }
      }
      internalVertices[i].temp[0] = 1;
    }
  }

  /**
   Variable: maxRank

   Stores the largest rank number allocated
   */
  maxRank = null;
  /**
   Variable: vertexMapper

   Map from graph vertices to internal model nodes.
   */
  vertexMapper = null;
  /**
   Variable: edgeMapper

   Map from graph edges to internal model edges
   */
  edgeMapper = null;
  /**
   Variable: ranks

   Mapping from rank number to actual rank
   */
  ranks = null;
  /**
   Variable: roots

   Store of roots of this hierarchy model, these are real graph cells, not
   internal cells
   */
  roots = null;
  /**
   Variable: parent

   The parent cell whose children are being laid out
   */
  parent = null;
  /**
   Variable: dfsCount

   Count of the number of times the ancestor dfs has been used.
   */
  dfsCount = 0;
  /**
   Variable: SOURCESCANSTARTRANK

   High value to start source layering scan rank value from.
   */
  SOURCESCANSTARTRANK = 100000000;
  /**
   Variable: tightenToSource

   Whether or not to tighten the assigned ranks of vertices up towards
   the source cells.
   */
  tightenToSource = false;

  /**
   Function: createInternalCells

   Creates all edges in the internal model

   Parameters:

   layout - Reference to the <mxHierarchicalLayout> algorithm.
   vertices - Array of <mxCells> that represent the vertices whom are to
   have an internal representation created.
   internalVertices - The array of <mxGraphHierarchyNodes> to have their
   information filled in using the real vertices.
   */
  createInternalCells(layout, vertices, internalVertices) {
    var graph = layout.getGraph();
    for (var i = 0; i < vertices.length; i++) {
      internalVertices[i] = new mxGraphHierarchyNode(vertices[i]);
      this.vertexMapper.put(vertices[i], internalVertices[i]);
      var conns = layout.getEdges(vertices[i]);
      internalVertices[i].connectsAsSource = [];
      for (var j = 0; j < conns.length; j++) {
        var cell = layout.getVisibleTerminal(conns[j], false);
        if (cell != vertices[i] && layout.graph.model.isVertex(cell) && !layout.isVertexIgnored(cell)) {
          var undirectedEdges = layout.getEdgesBetween(vertices[i], cell, false);
          var directedEdges = layout.getEdgesBetween(vertices[i], cell, true);
          if (undirectedEdges != null && undirectedEdges.length > 0 && this.edgeMapper.get(undirectedEdges[0]) == null && directedEdges.length * 2 >= undirectedEdges.length) {
            var internalEdge = new mxGraphHierarchyEdge(undirectedEdges);
            for (var k = 0; k < undirectedEdges.length; k++) {
              var edge = undirectedEdges[k];
              this.edgeMapper.put(edge, internalEdge);
              graph.resetEdge(edge);
              if (layout.disableEdgeStyle) {
                layout.setEdgeStyleEnabled(edge, false);
                layout.setOrthogonalEdge(edge, true);
              }
            }
            internalEdge.source = internalVertices[i];
            if (mxUtils.indexOf(internalVertices[i].connectsAsSource, internalEdge) < 0) {
              internalVertices[i].connectsAsSource.push(internalEdge);
            }
          }
        }
      }
      internalVertices[i].temp[0] = 0;
    }
  }

  /**
   Function: initialRank

   Basic determination of minimum layer ranking by working from from sources
   or sinks and working through each node in the relevant edge direction.
   Starting at the sinks is basically a longest path layering algorithm.
   */
  initialRank() {
    var startNodes = [];
    if (this.roots != null) {
      for (var i = 0; i < this.roots.length; i++) {
        var internalNode = this.vertexMapper.get(this.roots[i]);
        if (internalNode != null) {
          startNodes.push(internalNode);
        }
      }
    }
    var internalNodes = this.vertexMapper.getValues();
    for (var i = 0; i < internalNodes.length; i++) {
      internalNodes[i].temp[0] = -1;
    }
    var startNodesCopy = startNodes.slice();
    while (startNodes.length > 0) {
      var internalNode = startNodes[0];
      var layerDeterminingEdges;
      var edgesToBeMarked;
      layerDeterminingEdges = internalNode.connectsAsTarget;
      edgesToBeMarked = internalNode.connectsAsSource;
      var allEdgesScanned = true;
      var minimumLayer = this.SOURCESCANSTARTRANK;
      for (var i = 0; i < layerDeterminingEdges.length; i++) {
        var internalEdge = layerDeterminingEdges[i];
        if (internalEdge.temp[0] == 5270620) {
          var otherNode = internalEdge.source;
          minimumLayer = Math.min(minimumLayer, otherNode.temp[0] - 1);
        } else {
          allEdgesScanned = false;
          break;
        }
      }
      if (allEdgesScanned) {
        internalNode.temp[0] = minimumLayer;
        this.maxRank = Math.min(this.maxRank, minimumLayer);
        if (edgesToBeMarked != null) {
          for (var i = 0; i < edgesToBeMarked.length; i++) {
            var internalEdge = edgesToBeMarked[i];
            internalEdge.temp[0] = 5270620;
            var otherNode = internalEdge.target;
            if (otherNode.temp[0] == -1) {
              startNodes.push(otherNode);
              otherNode.temp[0] = -2;
            }
          }
        }
        startNodes.shift();
      } else {
        var removedCell = startNodes.shift();
        startNodes.push(internalNode);
        if (removedCell == internalNode && startNodes.length == 1) {
          break;
        }
      }
    }
    for (var i = 0; i < internalNodes.length; i++) {
      internalNodes[i].temp[0] -= this.maxRank;
    }
    for (var i = 0; i < startNodesCopy.length; i++) {
      var internalNode = startNodesCopy[i];
      var currentMaxLayer = 0;
      var layerDeterminingEdges = internalNode.connectsAsSource;
      for (var j = 0; j < layerDeterminingEdges.length; j++) {
        var internalEdge = layerDeterminingEdges[j];
        var otherNode = internalEdge.target;
        internalNode.temp[0] = Math.max(currentMaxLayer, otherNode.temp[0] + 1);
        currentMaxLayer = internalNode.temp[0];
      }
    }
    this.maxRank = this.SOURCESCANSTARTRANK - this.maxRank;
  }

  /**
   Function: fixRanks

   Fixes the layer assignments to the values stored in the nodes. Also needs
   to create dummy nodes for edges that cross layers.
   */
  fixRanks() {
    var rankList = [];
    this.ranks = [];
    for (var i = 0; i < this.maxRank + 1; i++) {
      rankList[i] = [];
      this.ranks[i] = rankList[i];
    }
    var rootsArray = null;
    if (this.roots != null) {
      var oldRootsArray = this.roots;
      rootsArray = [];
      for (var i = 0; i < oldRootsArray.length; i++) {
        var cell = oldRootsArray[i];
        var internalNode = this.vertexMapper.get(cell);
        rootsArray[i] = internalNode;
      }
    }
    this.visit(function (parent, node, edge, layer, seen) {
      if (seen == 0 && node.maxRank < 0 && node.minRank < 0) {
        rankList[node.temp[0]].push(node);
        node.maxRank = node.temp[0];
        node.minRank = node.temp[0];
        node.temp[0] = rankList[node.maxRank].length - 1;
      }
      if (parent != null && edge != null) {
        var parentToCellRankDifference = parent.maxRank - node.maxRank;
        if (parentToCellRankDifference > 1) {
          edge.maxRank = parent.maxRank;
          edge.minRank = node.maxRank;
          edge.temp = [];
          edge.x = [];
          edge.y = [];
          for (var i = edge.minRank + 1; i < edge.maxRank; i++) {
            rankList[i].push(edge);
            edge.setGeneralPurposeVariable(i, rankList[i].length - 1);
          }
        }
      }
    }, rootsArray, false, null);
  }

  /**
   Function: visit

   A depth first search through the internal heirarchy model.

   Parameters:

   visitor - The visitor function pattern to be called for each node.
   trackAncestors - Whether or not the search is to keep track all nodes
   directly above this one in the search path.
   */
  visit(visitor, dfsRoots, trackAncestors, seenNodes) {
    if (dfsRoots != null) {
      for (var i = 0; i < dfsRoots.length; i++) {
        var internalNode = dfsRoots[i];
        if (internalNode != null) {
          if (seenNodes == null) {
            seenNodes = new Object();
          }
          if (trackAncestors) {
            internalNode.hashCode = [];
            internalNode.hashCode[0] = this.dfsCount;
            internalNode.hashCode[1] = i;
            this.extendedDfs(null, internalNode, null, visitor, seenNodes, internalNode.hashCode, i, 0);
          } else {
            this.dfs(null, internalNode, null, visitor, seenNodes, 0);
          }
        }
      }
      this.dfsCount++;
    }
  }

  /**
   Function: dfs

   Performs a depth first search on the internal hierarchy model

   Parameters:

   parent - the parent internal node of the current internal node
   root - the current internal node
   connectingEdge - the internal edge connecting the internal node and the parent
   internal node, if any
   visitor - the visitor pattern to be called for each node
   seen - a set of all nodes seen by this dfs a set of all of the
   ancestor node of the current node
   layer - the layer on the dfs tree ( not the same as the model ranks )
   */
  dfs(parent, root, connectingEdge, visitor, seen, layer) {
    if (root != null) {
      var rootId = root.id;
      if (seen[rootId] == null) {
        seen[rootId] = root;
        visitor(parent, root, connectingEdge, layer, 0);
        var outgoingEdges = root.connectsAsSource.slice();
        for (var i = 0; i < outgoingEdges.length; i++) {
          var internalEdge = outgoingEdges[i];
          var targetNode = internalEdge.target;
          this.dfs(root, targetNode, internalEdge, visitor, seen, layer + 1);
        }
      } else {
        visitor(parent, root, connectingEdge, layer, 1);
      }
    }
  }

  /**
   Function: extendedDfs

   Performs a depth first search on the internal hierarchy model. This dfs
   extends the default version by keeping track of cells ancestors, but it
   should be only used when necessary because of it can be computationally
   intensive for deep searches.

   Parameters:

   parent - the parent internal node of the current internal node
   root - the current internal node
   connectingEdge - the internal edge connecting the internal node and the parent
   internal node, if any
   visitor - the visitor pattern to be called for each node
   seen - a set of all nodes seen by this dfs
   ancestors - the parent hash code
   childHash - the new hash code for this node
   layer - the layer on the dfs tree ( not the same as the model ranks )
   */
  extendedDfs(parent, root, connectingEdge, visitor, seen, ancestors, childHash, layer) {
    if (root != null) {
      if (parent != null) {
        if (root.hashCode == null || root.hashCode[0] != parent.hashCode[0]) {
          var hashCodeLength = parent.hashCode.length + 1;
          root.hashCode = parent.hashCode.slice();
          root.hashCode[hashCodeLength - 1] = childHash;
        }
      }
      var rootId = root.id;
      if (seen[rootId] == null) {
        seen[rootId] = root;
        visitor(parent, root, connectingEdge, layer, 0);
        var outgoingEdges = root.connectsAsSource.slice();
        for (var i = 0; i < outgoingEdges.length; i++) {
          var internalEdge = outgoingEdges[i];
          var targetNode = internalEdge.target;
          this.extendedDfs(root, targetNode, internalEdge, visitor, seen, root.hashCode, i, layer + 1);
        }
      } else {
        visitor(parent, root, connectingEdge, layer, 1);
      }
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
