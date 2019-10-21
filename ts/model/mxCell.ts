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
 */
import { mxConstants } from '../util/mxConstants';
import { mxUtils } from '../util/mxUtils';

export class mxCell {
  constructor(value: any, geometry: any, style: any) {
    this.value = value;
    this.setGeometry(geometry);
    this.setStyle(style);
    if (!!this.onInit) {
      this.onInit();
    }
  }

  value: any;
  /**
   * Variable: id
   *
   * Holds the Id. Default is null.
   */
  id: any;
  /**
   * Variable: geometry
   *
   * Holds the <mxGeometry>. Default is null.
   */
  geometry: any;
  /**
   * Variable: style
   *
   * Holds the style as a string of the form [(stylename|key=value);]. Default is
   * null.
   */
  style: any;
  /**
   * Variable: vertex
   *
   * Specifies whether the cell is a vertex. Default is false.
   */
  vertex: boolean;
  /**
   * Variable: edge
   *
   * Specifies whether the cell is an edge. Default is false.
   */
  edge: boolean;
  /**
   * Variable: connectable
   *
   * Specifies whether the cell is connectable. Default is true.
   * @example true
   */
  connectable: boolean;
  /**
   * Variable: visible
   *
   * Specifies whether the cell is visible. Default is true.
   * @example true
   */
  visible: boolean;
  /**
   * Variable: collapsed
   *
   * Specifies whether the cell is collapsed. Default is false.
   */
  collapsed: boolean;
  /**
   * Variable: parent
   *
   * Reference to the parent cell.
   */
  parent: any;
  /**
   * Variable: source
   *
   * Reference to the source terminal.
   */
  source: any;
  /**
   * Variable: target
   *
   * Reference to the target terminal.
   */
  target: string;
  /**
   * Variable: children
   *
   * Holds the child cells.
   */
  children: any;
  /**
   * Variable: edges
   *
   * Holds the edges.
   */
  edges: any;
  /**
   * Variable: mxTransient
   *
   * List of members that should not be cloned inside <clone>. This field is
   * passed to <mxUtils.clone> and is not made persistent in <mxCellCodec>.
   * This is not a convention for all classes, it is only used in this class
   * to mark transient fields since transient modifiers are not supported by
   * the language.
   */
  mxTransient: string[];

  /**
   * Function: getId
   *
   * Returns the Id of the cell as a string.
   */
  getId(): any {
    return this.id;
  }

  /**
   * Function: setId
   *
   * Sets the Id of the cell to the given string.
   */
  setId(id: any): void {
    this.id = id;
  }

  /**
   * Function: getValue
   *
   * Returns the user object of the cell. The user
   * object is stored in <value>.
   */
  getValue(): any {
    return this.value;
  }

  /**
   * Function: setValue
   *
   * Sets the user object of the cell. The user object
   * is stored in <value>.
   */
  setValue(value: any): void {
    this.value = value;
  }

  /**
   * Function: valueChanged
   *
   * Changes the user object after an in-place edit
   * and returns the previous value. This implementation
   * replaces the user object with the given value and
   * returns the old user object.
   */
  valueChanged(newValue: any): any {
    const previous = this.getValue();
    this.setValue(newValue);
    return previous;
  }

  /**
   * Function: getGeometry
   *
   * Returns the <mxGeometry> that describes the <geometry>.
   */
  getGeometry(): any {
    return this.geometry;
  }

  /**
   * Function: setGeometry
   *
   * Sets the <mxGeometry> to be used as the <geometry>.
   */
  setGeometry(geometry: any): void {
    this.geometry = geometry;
  }

  /**
   * Function: getStyle
   *
   * Returns a string that describes the <style>.
   */
  getStyle(): any {
    return this.style;
  }

  /**
   * Function: setStyle
   *
   * Sets the string to be used as the <style>.
   */
  setStyle(style: any): void {
    this.style = style;
  }

  /**
   * Function: isVertex
   *
   * Returns true if the cell is a vertex.
   */
  isVertex(): boolean {
    return this.vertex != 0;
  }

  /**
   * Function: setVertex
   *
   * Specifies if the cell is a vertex. This should only be assigned at
   * construction of the cell and not be changed during its lifecycle.
   *
   * Parameters:
   *
   * vertex - Boolean that specifies if the cell is a vertex.
   */
  setVertex(vertex: any): void {
    this.vertex = vertex;
  }

  /**
   * Function: isEdge
   *
   * Returns true if the cell is an edge.
   */
  isEdge(): boolean {
    return this.edge != 0;
  }

  /**
   * Function: setEdge
   *
   * Specifies if the cell is an edge. This should only be assigned at
   * construction of the cell and not be changed during its lifecycle.
   *
   * Parameters:
   *
   * edge - Boolean that specifies if the cell is an edge.
   */
  setEdge(edge: any): void {
    this.edge = edge;
  }

  /**
   * Function: isConnectable
   *
   * Returns true if the cell is connectable.
   */
  isConnectable(): boolean {
    return this.connectable != 0;
  }

  /**
   * Function: setConnectable
   *
   * Sets the connectable state.
   *
   * Parameters:
   *
   * connectable - Boolean that specifies the new connectable state.
   */
  setConnectable(connectable: boolean): void {
    this.connectable = connectable;
  }

  /**
   * Function: isVisible
   *
   * Returns true if the cell is visibile.
   */
  isVisible(): boolean {
    return this.visible != 0;
  }

  /**
   * Function: setVisible
   *
   * Specifies if the cell is visible.
   *
   * Parameters:
   *
   * visible - Boolean that specifies the new visible state.
   */
  setVisible(visible: any): void {
    this.visible = visible;
  }

  /**
   * Function: isCollapsed
   *
   * Returns true if the cell is collapsed.
   */
  isCollapsed(): boolean {
    return this.collapsed != 0;
  }

  /**
   * Function: setCollapsed
   *
   * Sets the collapsed state.
   *
   * Parameters:
   *
   * collapsed - Boolean that specifies the new collapsed state.
   */
  setCollapsed(collapsed: any): void {
    this.collapsed = collapsed;
  }

  /**
   * Function: getParent
   *
   * Returns the cell's parent.
   */
  getParent(): any {
    return this.parent;
  }

  /**
   * Function: setParent
   *
   * Sets the parent cell.
   *
   * Parameters:
   *
   * parent - <mxCell> that represents the new parent.
   */
  setParent(parent: any): void {
    this.parent = parent;
  }

  /**
   * Function: getTerminal
   *
   * Returns the source or target terminal.
   *
   * Parameters:
   *
   * source - Boolean that specifies if the source terminal should be
   * returned.
   */
  getTerminal(source: any): any {
    return (source) ? this.source : this.target;
  }

  /**
   * Function: setTerminal
   *
   * Sets the source or target terminal and returns the new terminal.
   *
   * Parameters:
   *
   * terminal - <mxCell> that represents the new source or target terminal.
   * isSource - Boolean that specifies if the source or target terminal
   * should be set.
   */
  setTerminal(terminal: any, isSource: boolean): any {
    if (isSource) {
      this.source = terminal;
    } else {
      this.target = terminal;
    }
    return terminal;
  }

  /**
   * Function: getChildCount
   *
   * Returns the number of child cells.
   */
  getChildCount(): any {
    return (!this.children) ? 0 : this.children.length;
  }

  /**
   * Function: getIndex
   *
   * Returns the index of the specified child in the child array.
   *
   * Parameters:
   *
   * child - Child whose index should be returned.
   */
  getIndex(child: any): any {
    return mxUtils.indexOf(this.children, child);
  }

  /**
   * Function: getChildAt
   *
   * Returns the child at the specified index.
   *
   * Parameters:
   *
   * index - Integer that specifies the child to be returned.
   */
  getChildAt(index: number): any {
    return (!this.children) ? null : this.children[index];
  }

  /**
   * Function: insert
   *
   * Inserts the specified child into the child array at the specified index
   * and updates the parent reference of the child. If not childIndex is
   * specified then the child is appended to the child array. Returns the
   * inserted child.
   *
   * Parameters:
   *
   * child - <mxCell> to be inserted or appended to the child array.
   * index - Optional integer that specifies the index at which the child
   * should be inserted into the child array.
   */
  insert(child: any, index: number): any {
    if (!!child) {
      if (!index) {
        index = this.getChildCount();
        if (child.getParent() == this) {
          index--;
        }
      }
      child.removeFromParent();
      child.setParent(this);
      if (!this.children) {
        this.children = [];
        this.children.push(child);
      } else {
        this.children.splice(index, 0, child);
      }
    }
    return child;
  }

  /**
   * Function: remove
   *
   * Removes the child at the specified index from the child array and
   * returns the child that was removed. Will remove the parent reference of
   * the child.
   *
   * Parameters:
   *
   * index - Integer that specifies the index of the child to be
   * removed.
   */
  remove(index: number): any {
    let child = undefined;
    if (!!this.children && index >= 0) {
      child = this.getChildAt(index);
      if (!!child) {
        this.children.splice(index, 1);
        child.setParent(null);
      }
    }
    return child;
  }

  /**
   * Function: removeFromParent
   *
   * Removes the cell from its parent.
   */
  removeFromParent(): void {
    if (!!this.parent) {
      const index = this.parent.getIndex(this);
      this.parent.remove(index);
    }
  }

  /**
   * Function: getEdgeCount
   *
   * Returns the number of edges in the edge array.
   */
  getEdgeCount(): any {
    return (!this.edges) ? 0 : this.edges.length;
  }

  /**
   * Function: getEdgeIndex
   *
   * Returns the index of the specified edge in <edges>.
   *
   * Parameters:
   *
   * edge - <mxCell> whose index in <edges> should be returned.
   */
  getEdgeIndex(edge: any): any {
    return mxUtils.indexOf(this.edges, edge);
  }

  /**
   * Function: getEdgeAt
   *
   * Returns the edge at the specified index in <edges>.
   *
   * Parameters:
   *
   * index - Integer that specifies the index of the edge to be returned.
   */
  getEdgeAt(index: number): any {
    return (!this.edges) ? null : this.edges[index];
  }

  /**
   * Function: insertEdge
   *
   * Inserts the specified edge into the edge array and returns the edge.
   * Will update the respective terminal reference of the edge.
   *
   * Parameters:
   *
   * edge - <mxCell> to be inserted into the edge array.
   * isOutgoing - Boolean that specifies if the edge is outgoing.
   */
  insertEdge(edge: any, isOutgoing: boolean): any {
    if (!!edge) {
      edge.removeFromTerminal(isOutgoing);
      edge.setTerminal(this, isOutgoing);
      if (!this.edges || edge.getTerminal(!isOutgoing) != this || mxUtils.indexOf(this.edges, edge) < 0) {
        if (!this.edges) {
          this.edges = [];
        }
        this.edges.push(edge);
      }
    }
    return edge;
  }

  /**
   * Function: removeEdge
   *
   * Removes the specified edge from the edge array and returns the edge.
   * Will remove the respective terminal reference from the edge.
   *
   * Parameters:
   *
   * edge - <mxCell> to be removed from the edge array.
   * isOutgoing - Boolean that specifies if the edge is outgoing.
   */
  removeEdge(edge: any, isOutgoing: boolean): any {
    if (!!edge) {
      if (edge.getTerminal(!isOutgoing) != this && !!this.edges) {
        const index = this.getEdgeIndex(edge);
        if (index >= 0) {
          this.edges.splice(index, 1);
        }
      }
      edge.setTerminal(null, isOutgoing);
    }
    return edge;
  }

  /**
   * Function: removeFromTerminal
   *
   * Removes the edge from its source or target terminal.
   *
   * Parameters:
   *
   * isSource - Boolean that specifies if the edge should be removed from its
   * source or target terminal.
   */
  removeFromTerminal(isSource: boolean): void {
    const terminal = this.getTerminal(isSource);
    if (!!terminal) {
      terminal.removeEdge(this, isSource);
    }
  }

  /**
   * Function: hasAttribute
   *
   * Returns true if the user object is an XML node that contains the given
   * attribute.
   *
   * Parameters:
   *
   * name - Name of the attribute.
   */
  hasAttribute(name: string): boolean {
    const userObject = this.getValue();
    return (!!userObject && userObject.nodeType == mxConstants.NODETYPE_ELEMENT && userObject.hasAttribute) ? userObject.hasAttribute(name) : userObject.getAttribute(name);
  }

  /**
   * Function: getAttribute
   *
   * Returns the specified attribute from the user object if it is an XML
   * node.
   *
   * Parameters:
   *
   * name - Name of the attribute whose value should be returned.
   * defaultValue - Optional default value to use if the attribute has no
   * value.
   */
  getAttribute(name: string, defaultValue: any): any {
    const userObject = this.getValue();
    const val = (!!userObject && userObject.nodeType == mxConstants.NODETYPE_ELEMENT) ? userObject.getAttribute(name) : null;
    return val || defaultValue;
  }

  /**
   * Function: setAttribute
   *
   * Sets the specified attribute on the user object if it is an XML node.
   *
   * Parameters:
   *
   * name - Name of the attribute whose value should be set.
   * value - New value of the attribute.
   */
  setAttribute(name: string, value: any): void {
    const userObject = this.getValue();
    if (!!userObject && userObject.nodeType == mxConstants.NODETYPE_ELEMENT) {
      userObject.setAttribute(name, value);
    }
  }

  /**
   * Function: clone
   *
   * Returns a clone of the cell. Uses <cloneValue> to clone
   * the user object. All fields in <mxTransient> are ignored
   * during the cloning.
   */
  clone(): boolean {
    const clone = mxUtils.clone(this, this.mxTransient);
    clone.setValue(this.cloneValue());
    return clone;
  }

  /**
   * Function: cloneValue
   *
   * Returns a clone of the cell's user object.
   */
  cloneValue(): any {
    let value = this.getValue();
    if (!!value) {
      if (typeof (value.clone) == 'function') {
        value = value.clone();
      } else if (!isNaN(value.nodeType)) {
        value = value.cloneNode(true);
      }
    }
    return value;
  }
}
