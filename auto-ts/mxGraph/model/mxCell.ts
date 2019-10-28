/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxCell
 *
 * Cells are the elements of the graph model. They represent the state
 * of the groups, vertices and edges in a graph.
 *
 * Custom attributes:
 *
 * For custom attributes we recommend using an XML node as the value of a cell.
 * The following code can be used to create a cell with an XML node as the
 * value:
 *
 * (code)
 * var doc = mxUtils.createXmlDocument();
 * var node = doc.createElement('MyNode')
 * node.setAttribute('label', 'MyLabel');
 * node.setAttribute('attribute1', 'value1');
 * graph.insertVertex(graph.getDefaultParent(), null, node, 40, 40, 80, 30);
 * (end)
 *
 * For the label to work, <mxGraph.convertValueToString> and
 * <mxGraph.cellLabelChanged> should be overridden as follows:
 *
 * (code)
 * graph.convertValueToString = function(cell)
 * {
 *   if (mxUtils.isNode(cell.value))
 *   {
 *     return cell.getAttribute('label', '')
 *   }
 * };
 *
 * var cellLabelChanged = graph.cellLabelChanged;
 * graph.cellLabelChanged = function(cell, newValue, autoSize)
 * {
 *   if (mxUtils.isNode(cell.value))
 *   {
 *     // Clones the value for correct undo/redo
 *     var elt = cell.value.cloneNode(true);
 *     elt.setAttribute('label', newValue);
 *     newValue = elt;
 *   }
 *
 *   cellLabelChanged.apply(this, arguments);
 * };
 * (end)
 *
 * Callback: onInit
 *
 * Called from within the constructor.
 *
 * Constructor: mxCell
 *
 * Constructs a new cell to be used in a graph model.
 * This method invokes <onInit> upon completion.
 *
 * Parameters:
 *
 * value - Optional object that represents the cell value.
 * geometry - Optional <mxGeometry> that specifies the geometry.
 * style - Optional formatted string that defines the style.
 * @class
 */
export class mxCell {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxCell

   Cells are the elements of the graph model. They represent the state
   of the groups, vertices and edges in a graph.

   Custom attributes:

   For custom attributes we recommend using an XML node as the value of a cell.
   The following code can be used to create a cell with an XML node as the
   value:

   (code)
   var doc = mxUtils.createXmlDocument();
   var node = doc.createElement('MyNode')
   node.setAttribute('label', 'MyLabel');
   node.setAttribute('attribute1', 'value1');
   graph.insertVertex(graph.getDefaultParent(), null, node, 40, 40, 80, 30);
   (end)

   For the label to work, <mxGraph.convertValueToString> and
   <mxGraph.cellLabelChanged> should be overridden as follows:

   (code)
   graph.convertValueToString = function(cell)
   {
       if (mxUtils.isNode(cell.value))
       {
         return cell.getAttribute('label', '')
       }
    };

   var cellLabelChanged = graph.cellLabelChanged;
   graph.cellLabelChanged = function(cell, newValue, autoSize)
   {
       if (mxUtils.isNode(cell.value))
       {
         // Clones the value for correct undo/redo
         var elt = cell.value.cloneNode(true);
         elt.setAttribute('label', newValue);
         newValue = elt;
       }
    
       cellLabelChanged.apply(this, arguments);
    };
   (end)

   Callback: onInit

   Called from within the constructor.

   Constructor: mxCell

   Constructs a new cell to be used in a graph model.
   This method invokes <onInit> upon completion.

   Parameters:

   value - Optional object that represents the cell value.
   geometry - Optional <mxGeometry> that specifies the geometry.
   style - Optional formatted string that defines the style.
   */
  constructor(value, geometry, style) {
    this.value = value;
    this.setGeometry(geometry);
    this.setStyle(style);
    if (this.onInit != null) {
      this.onInit();
    }
  }

  /**
   Variable: id

   Holds the Id. Default is null.
   */
  id = null;
  /**
   Variable: value

   Holds the user object. Default is null.
   */
  value = null;
  /**
   Variable: geometry

   Holds the <mxGeometry>. Default is null.
   */
  geometry = null;
  /**
   Variable: style

   Holds the style as a string of the form [(stylename|key=value);]. Default is
   null.
   */
  style = null;
  /**
   Variable: vertex

   Specifies whether the cell is a vertex. Default is false.
   */
  vertex = false;
  /**
   Variable: edge

   Specifies whether the cell is an edge. Default is false.
   */
  edge = false;
  /**
   Variable: connectable

   Specifies whether the cell is connectable. Default is true.
   */
  connectable = true;
  /**
   Variable: visible

   Specifies whether the cell is visible. Default is true.
   */
  visible = true;
  /**
   Variable: collapsed

   Specifies whether the cell is collapsed. Default is false.
   */
  collapsed = false;
  /**
   Variable: parent

   Reference to the parent cell.
   */
  parent = null;
  /**
   Variable: source

   Reference to the source terminal.
   */
  source = null;
  /**
   Variable: target

   Reference to the target terminal.
   */
  target = null;
  /**
   Variable: children

   Holds the child cells.
   */
  children = null;
  /**
   Variable: edges

   Holds the edges.
   */
  edges = null;
  /**
   Variable: mxTransient

   List of members that should not be cloned inside <clone>. This field is
   passed to <mxUtils.clone> and is not made persistent in <mxCellCodec>.
   This is not a convention for all classes, it is only used in this class
   to mark transient fields since transient modifiers are not supported by
   the language.
   */
  mxTransient = ['id', 'value', 'parent', 'source', 'target', 'children', 'edges'];

  /**
   Function: getId

   Returns the Id of the cell as a string.
   */
  getId() {
    return this.id;
  }

  /**
   Function: setId

   Sets the Id of the cell to the given string.
   */
  setId(id) {
    this.id = id;
  }

  /**
   Function: getValue

   Returns the user object of the cell. The user
   object is stored in <value>.
   */
  getValue() {
    return this.value;
  }

  /**
   Function: setValue

   Sets the user object of the cell. The user object
   is stored in <value>.
   */
  setValue(value) {
    this.value = value;
  }

  /**
   Function: valueChanged

   Changes the user object after an in-place edit
   and returns the previous value. This implementation
   replaces the user object with the given value and
   returns the old user object.
   */
  valueChanged(newValue) {
    var previous = this.getValue();
    this.setValue(newValue);
    return previous;
  }

  /**
   Function: getGeometry

   Returns the <mxGeometry> that describes the <geometry>.
   */
  getGeometry() {
    return this.geometry;
  }

  /**
   Function: setGeometry

   Sets the <mxGeometry> to be used as the <geometry>.
   */
  setGeometry(geometry) {
    this.geometry = geometry;
  }

  /**
   Function: getStyle

   Returns a string that describes the <style>.
   */
  getStyle() {
    return this.style;
  }

  /**
   Function: setStyle

   Sets the string to be used as the <style>.
   */
  setStyle(style) {
    this.style = style;
  }

  /**
   Function: isVertex

   Returns true if the cell is a vertex.
   */
  isVertex() {
    return this.vertex != 0;
  }

  /**
   Function: setVertex

   Specifies if the cell is a vertex. This should only be assigned at
   construction of the cell and not be changed during its lifecycle.

   Parameters:

   vertex - Boolean that specifies if the cell is a vertex.
   */
  setVertex(vertex) {
    this.vertex = vertex;
  }

  /**
   Function: isEdge

   Returns true if the cell is an edge.
   */
  isEdge() {
    return this.edge != 0;
  }

  /**
   Function: setEdge

   Specifies if the cell is an edge. This should only be assigned at
   construction of the cell and not be changed during its lifecycle.

   Parameters:

   edge - Boolean that specifies if the cell is an edge.
   */
  setEdge(edge) {
    this.edge = edge;
  }

  /**
   Function: isConnectable

   Returns true if the cell is connectable.
   */
  isConnectable() {
    return this.connectable != 0;
  }

  /**
   Function: setConnectable

   Sets the connectable state.

   Parameters:

   connectable - Boolean that specifies the new connectable state.
   */
  setConnectable(connectable) {
    this.connectable = connectable;
  }

  /**
   Function: isVisible

   Returns true if the cell is visibile.
   */
  isVisible() {
    return this.visible != 0;
  }

  /**
   Function: setVisible

   Specifies if the cell is visible.

   Parameters:

   visible - Boolean that specifies the new visible state.
   */
  setVisible(visible) {
    this.visible = visible;
  }

  /**
   Function: isCollapsed

   Returns true if the cell is collapsed.
   */
  isCollapsed() {
    return this.collapsed != 0;
  }

  /**
   Function: setCollapsed

   Sets the collapsed state.

   Parameters:

   collapsed - Boolean that specifies the new collapsed state.
   */
  setCollapsed(collapsed) {
    this.collapsed = collapsed;
  }

  /**
   Function: getParent

   Returns the cell's parent.
   */
  getParent() {
    return this.parent;
  }

  /**
   Function: setParent

   Sets the parent cell.

   Parameters:

   parent - <mxCell> that represents the new parent.
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   Function: getTerminal

   Returns the source or target terminal.

   Parameters:

   source - Boolean that specifies if the source terminal should be
   returned.
   */
  getTerminal(source) {
    return (source) ? this.source : this.target;
  }

  /**
   Function: setTerminal

   Sets the source or target terminal and returns the new terminal.

   Parameters:

   terminal - <mxCell> that represents the new source or target terminal.
   isSource - Boolean that specifies if the source or target terminal
   should be set.
   */
  setTerminal(terminal, isSource) {
    if (isSource) {
      this.source = terminal;
    } else {
      this.target = terminal;
    }
    return terminal;
  }

  /**
   Function: getChildCount

   Returns the number of child cells.
   */
  getChildCount() {
    return (this.children == null) ? 0 : this.children.length;
  }

  /**
   Function: getIndex

   Returns the index of the specified child in the child array.

   Parameters:

   child - Child whose index should be returned.
   */
  getIndex(child) {
    return mxUtils.indexOf(this.children, child);
  }

  /**
   Function: getChildAt

   Returns the child at the specified index.

   Parameters:

   index - Integer that specifies the child to be returned.
   */
  getChildAt(index) {
    return (this.children == null) ? null : this.children[index];
  }

  /**
   Function: insert

   Inserts the specified child into the child array at the specified index
   and updates the parent reference of the child. If not childIndex is
   specified then the child is appended to the child array. Returns the
   inserted child.

   Parameters:

   child - <mxCell> to be inserted or appended to the child array.
   index - Optional integer that specifies the index at which the child
   should be inserted into the child array.
   */
  insert(child, index) {
    if (child != null) {
      if (index == null) {
        index = this.getChildCount();
        if (child.getParent() == this) {
          index--;
        }
      }
      child.removeFromParent();
      child.setParent(this);
      if (this.children == null) {
        this.children = [];
        this.children.push(child);
      } else {
        this.children.splice(index, 0, child);
      }
    }
    return child;
  }

  /**
   Function: remove

   Removes the child at the specified index from the child array and
   returns the child that was removed. Will remove the parent reference of
   the child.

   Parameters:

   index - Integer that specifies the index of the child to be
   removed.
   */
  remove(index) {
    var child = null;
    if (this.children != null && index >= 0) {
      child = this.getChildAt(index);
      if (child != null) {
        this.children.splice(index, 1);
        child.setParent(null);
      }
    }
    return child;
  }

  /**
   Function: removeFromParent

   Removes the cell from its parent.
   */
  removeFromParent() {
    if (this.parent != null) {
      var index = this.parent.getIndex(this);
      this.parent.remove(index);
    }
  }

  /**
   Function: getEdgeCount

   Returns the number of edges in the edge array.
   */
  getEdgeCount() {
    return (this.edges == null) ? 0 : this.edges.length;
  }

  /**
   Function: getEdgeIndex

   Returns the index of the specified edge in <edges>.

   Parameters:

   edge - <mxCell> whose index in <edges> should be returned.
   */
  getEdgeIndex(edge) {
    return mxUtils.indexOf(this.edges, edge);
  }

  /**
   Function: getEdgeAt

   Returns the edge at the specified index in <edges>.

   Parameters:

   index - Integer that specifies the index of the edge to be returned.
   */
  getEdgeAt(index) {
    return (this.edges == null) ? null : this.edges[index];
  }

  /**
   Function: insertEdge

   Inserts the specified edge into the edge array and returns the edge.
   Will update the respective terminal reference of the edge.

   Parameters:

   edge - <mxCell> to be inserted into the edge array.
   isOutgoing - Boolean that specifies if the edge is outgoing.
   */
  insertEdge(edge, isOutgoing) {
    if (edge != null) {
      edge.removeFromTerminal(isOutgoing);
      edge.setTerminal(this, isOutgoing);
      if (this.edges == null || edge.getTerminal(!isOutgoing) != this || mxUtils.indexOf(this.edges, edge) < 0) {
        if (this.edges == null) {
          this.edges = [];
        }
        this.edges.push(edge);
      }
    }
    return edge;
  }

  /**
   Function: removeEdge

   Removes the specified edge from the edge array and returns the edge.
   Will remove the respective terminal reference from the edge.

   Parameters:

   edge - <mxCell> to be removed from the edge array.
   isOutgoing - Boolean that specifies if the edge is outgoing.
   */
  removeEdge(edge, isOutgoing) {
    if (edge != null) {
      if (edge.getTerminal(!isOutgoing) != this && this.edges != null) {
        var index = this.getEdgeIndex(edge);
        if (index >= 0) {
          this.edges.splice(index, 1);
        }
      }
      edge.setTerminal(null, isOutgoing);
    }
    return edge;
  }

  /**
   Function: removeFromTerminal

   Removes the edge from its source or target terminal.

   Parameters:

   isSource - Boolean that specifies if the edge should be removed from its
   source or target terminal.
   */
  removeFromTerminal(isSource) {
    var terminal = this.getTerminal(isSource);
    if (terminal != null) {
      terminal.removeEdge(this, isSource);
    }
  }

  /**
   Function: hasAttribute

   Returns true if the user object is an XML node that contains the given
   attribute.

   Parameters:

   name - Name of the attribute.
   */
  hasAttribute(name) {
    var userObject = this.getValue();
    return (userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT && userObject.hasAttribute) ? userObject.hasAttribute(name) : userObject.getAttribute(name) != null;
  }

  /**
   Function: getAttribute

   Returns the specified attribute from the user object if it is an XML
   node.

   Parameters:

   name - Name of the attribute whose value should be returned.
   defaultValue - Optional default value to use if the attribute has no
   value.
   */
  getAttribute(name, defaultValue) {
    var userObject = this.getValue();
    var val = (userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT) ? userObject.getAttribute(name) : null;
    return val || defaultValue;
  }

  /**
   Function: setAttribute

   Sets the specified attribute on the user object if it is an XML node.

   Parameters:

   name - Name of the attribute whose value should be set.
   value - New value of the attribute.
   */
  setAttribute(name, value) {
    var userObject = this.getValue();
    if (userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT) {
      userObject.setAttribute(name, value);
    }
  }

  /**
   Function: clone

   Returns a clone of the cell. Uses <cloneValue> to clone
   the user object. All fields in <mxTransient> are ignored
   during the cloning.
   */
  clone() {
    var clone = mxUtils.clone(this, this.mxTransient);
    clone.setValue(this.cloneValue());
    return clone;
  }

  /**
   Function: cloneValue

   Returns a clone of the cell's user object.
   */
  cloneValue() {
    var value = this.getValue();
    if (value != null) {
      if (typeof (value.clone) == 'function') {
        value = value.clone();
      } else if (!isNaN(value.nodeType)) {
        value = value.cloneNode(true);
      }
    }
    return value;
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
;
