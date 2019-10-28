/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxSwimlaneOrdering
 *
 * An implementation of the first stage of the Sugiyama layout. Straightforward
 * longest path calculation of layer assignment
 *
 * Constructor: mxSwimlaneOrdering
 *
 * Creates a cycle remover for the given internal model.
 * @class
 */
export class mxSwimlaneOrdering extends mxHierarchicalLayoutStage {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxSwimlaneOrdering

   An implementation of the first stage of the Sugiyama layout. Straightforward
   longest path calculation of layer assignment

   Constructor: mxSwimlaneOrdering

   Creates a cycle remover for the given internal model.
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
   Function: execute

   Takes the graph detail and configuration information within the facade
   and creates the resulting laid out graph within that facade for further
   use.
   */
  execute(parent) {
    var model = this.layout.getModel();
    var seenNodes = new Object();
    var unseenNodes = mxUtils.clone(model.vertexMapper, null, true);
    var rootsArray = null;
    if (model.roots != null) {
      var modelRoots = model.roots;
      rootsArray = [];
      for (var i = 0; i < modelRoots.length; i++) {
        var nodeId = mxCellPath.create(modelRoots[i]);
        rootsArray[i] = model.vertexMapper.get(modelRoots[i]);
      }
    }
    model.visit(function (parent, node, connectingEdge, layer, seen) {
      var isAncestor = parent != null && parent.swimlaneIndex == node.swimlaneIndex && node.isAncestor(parent);
      var reversedOverSwimlane = parent != null && connectingEdge != null && parent.swimlaneIndex < node.swimlaneIndex && connectingEdge.source == node;
      if (isAncestor) {
        connectingEdge.invert();
        mxUtils.remove(connectingEdge, parent.connectsAsSource);
        node.connectsAsSource.push(connectingEdge);
        parent.connectsAsTarget.push(connectingEdge);
        mxUtils.remove(connectingEdge, node.connectsAsTarget);
      } else if (reversedOverSwimlane) {
        connectingEdge.invert();
        mxUtils.remove(connectingEdge, parent.connectsAsTarget);
        node.connectsAsTarget.push(connectingEdge);
        parent.connectsAsSource.push(connectingEdge);
        mxUtils.remove(connectingEdge, node.connectsAsSource);
      }
      var cellId = mxCellPath.create(node.cell);
      seenNodes[cellId] = node;
      delete unseenNodes[cellId];
    }, rootsArray, true, null);
  }
};
