/**
 * Copyright (c) 2006-2018, JGraph Ltd
 * Copyright (c) 2006-2018, Gaudenz Alder
 */
/**
 * Class: mxGraphModel
 *
 * Extends <mxEventSource> to implement a graph model. The graph model acts as
 * a wrapper around the cells which are in charge of storing the actual graph
 * datastructure. The model acts as a transactional wrapper with event
 * notification for all changes, whereas the cells contain the atomic
 * operations for updating the actual datastructure.
 *
 * Layers:
 *
 * The cell hierarchy in the model must have a top-level root cell which
 * contains the layers (typically one default layer), which in turn contain the
 * top-level cells of the layers. This means each cell is contained in a layer.
 * If no layers are required, then all new cells should be added to the default
 * layer.
 *
 * Layers are useful for hiding and showing groups of cells, or for placing
 * groups of cells on top of other cells in the display. To identify a layer,
 * the <isLayer> function is used. It returns true if the parent of the given
 * cell is the root of the model.
 *
 * Events:
 *
 * See events section for more details. There is a new set of events for
 * tracking transactional changes as they happen. The events are called
 * startEdit for the initial beginUpdate, executed for each executed change
 * and endEdit for the terminal endUpdate. The executed event contains a
 * property called change which represents the change after execution.
 *
 * Encoding the model:
 *
 * To encode a graph model, use the following code:
 *
 * (code)
 * var enc = new mxCodec();
 * var node = enc.encode(graph.getModel());
 * (end)
 *
 * This will create an XML node that contains all the model information.
 *
 * Encoding and decoding changes:
 *
 * For the encoding of changes, a graph model listener is required that encodes
 * each change from the given array of changes.
 *
 * (code)
 * model.addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var changes = evt.getProperty('edit').changes;
 *   var nodes = [];
 *   var codec = new mxCodec();
 *
 *   for (var i = 0; i < changes.length; i++)
 *   {
 *     nodes.push(codec.encode(changes[i]));
 *   }
 *   // do something with the nodes
 * });
 * (end)
 *
 * For the decoding and execution of changes, the codec needs a lookup function
 * that allows it to resolve cell IDs as follows:
 *
 * (code)
 * var codec = new mxCodec();
 * codec.lookup = function(id)
 * {
 *   return model.getCell(id);
 * }
 * (end)
 *
 * For each encoded change (represented by a node), the following code can be
 * used to carry out the decoding and create a change object.
 *
 * (code)
 * var changes = [];
 * var change = codec.decode(node);
 * change.model = model;
 * change.execute();
 * changes.push(change);
 * (end)
 *
 * The changes can then be dispatched using the model as follows.
 *
 * (code)
 * var edit = new mxUndoableEdit(model, false);
 * edit.changes = changes;
 *
 * edit.notify = function()
 * {
 *   edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
 *   	'edit', edit, 'changes', edit.changes));
 *   edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
 *   	'edit', edit, 'changes', edit.changes));
 * }
 *
 * model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
 * model.fireEvent(new mxEventObject(mxEvent.CHANGE,
 *    'edit', edit, 'changes', changes));
 * (end)
 *
 * Event: mxEvent.CHANGE
 *
 * Fires when an undoable edit is dispatched. The <code>edit</code> property
 * contains the <mxUndoableEdit>. The <code>changes</code> property contains
 * the array of atomic changes inside the undoable edit. The changes property
 * is <strong>deprecated</strong>, please use edit.changes instead.
 *
 * Example:
 *
 * For finding newly inserted cells, the following code can be used:
 *
 * (code)
 * graph.model.addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var changes = evt.getProperty('edit').changes;
 *
 *   for (var i = 0; i < changes.length; i++)
 *   {
 *     var change = changes[i];
 *
 *     if (change instanceof mxChildChange &&
 *       change.change.previous == null)
 *     {
 *       graph.startEditingAtCell(change.child);
 *       break;
 *     }
 *   }
 * });
 * (end)
 *
 *
 * Event: mxEvent.NOTIFY
 *
 * Same as <mxEvent.CHANGE>, this event can be used for classes that need to
 * implement a sync mechanism between this model and, say, a remote model. In
 * such a setup, only local changes should trigger a notify event and all
 * changes should trigger a change event.
 *
 * Event: mxEvent.EXECUTE
 *
 * Fires between begin- and endUpdate and after an atomic change was executed
 * in the model. The <code>change</code> property contains the atomic change
 * that was executed.
 *
 * Event: mxEvent.EXECUTED
 *
 * Fires between START_EDIT and END_EDIT after an atomic change was executed.
 * The <code>change</code> property contains the change that was executed.
 *
 * Event: mxEvent.BEGIN_UPDATE
 *
 * Fires after the <updateLevel> was incremented in <beginUpdate>. This event
 * contains no properties.
 *
 * Event: mxEvent.START_EDIT
 *
 * Fires after the <updateLevel> was changed from 0 to 1. This event
 * contains no properties.
 *
 * Event: mxEvent.END_UPDATE
 *
 * Fires after the <updateLevel> was decreased in <endUpdate> but before any
 * notification or change dispatching. The <code>edit</code> property contains
 * the <currentEdit>.
 *
 * Event: mxEvent.END_EDIT
 *
 * Fires after the <updateLevel> was changed from 1 to 0. This event
 * contains no properties.
 *
 * Event: mxEvent.BEFORE_UNDO
 *
 * Fires before the change is dispatched after the update level has reached 0
 * in <endUpdate>. The <code>edit</code> property contains the <curreneEdit>.
 *
 * Event: mxEvent.UNDO
 *
 * Fires after the change was dispatched in <endUpdate>. The <code>edit</code>
 * property contains the <currentEdit>.
 *
 * Constructor: mxGraphModel
 *
 * Constructs a new graph model. If no root is specified then a new root
 * <mxCell> with a default layer is created.
 *
 * Parameters:
 *
 * root - <mxCell> that represents the root cell.
 * @class
 */
export class mxGraphModel extends mxEventSource {
  /**
   Copyright (c) 2006-2018, JGraph Ltd
   Copyright (c) 2006-2018, Gaudenz Alder
   */
  /**
   Class: mxGraphModel

   Extends <mxEventSource> to implement a graph model. The graph model acts as
   a wrapper around the cells which are in charge of storing the actual graph
   datastructure. The model acts as a transactional wrapper with event
   notification for all changes, whereas the cells contain the atomic
   operations for updating the actual datastructure.

   Layers:

   The cell hierarchy in the model must have a top-level root cell which
   contains the layers (typically one default layer), which in turn contain the
   top-level cells of the layers. This means each cell is contained in a layer.
   If no layers are required, then all new cells should be added to the default
   layer.

   Layers are useful for hiding and showing groups of cells, or for placing
   groups of cells on top of other cells in the display. To identify a layer,
   the <isLayer> function is used. It returns true if the parent of the given
   cell is the root of the model.

   Events:

   See events section for more details. There is a new set of events for
   tracking transactional changes as they happen. The events are called
   startEdit for the initial beginUpdate, executed for each executed change
   and endEdit for the terminal endUpdate. The executed event contains a
   property called change which represents the change after execution.

   Encoding the model:

   To encode a graph model, use the following code:

   (code)
   var enc = new mxCodec();
   var node = enc.encode(graph.getModel());
   (end)

   This will create an XML node that contains all the model information.

   Encoding and decoding changes:

   For the encoding of changes, a graph model listener is required that encodes
   each change from the given array of changes.

   (code)
   model.addListener(mxEvent.CHANGE, function(sender, evt)
   {
       var changes = evt.getProperty('edit').changes;
       var nodes = [];
       var codec = new mxCodec();
    
       for (var i = 0; i < changes.length; i++)
       {
         nodes.push(codec.encode(changes[i]));
       }
       // do something with the nodes
    });
   (end)

   For the decoding and execution of changes, the codec needs a lookup function
   that allows it to resolve cell IDs as follows:

   (code)
   var codec = new mxCodec();
   codec.lookup = function(id)
   {
       return model.getCell(id);
    }
   (end)

   For each encoded change (represented by a node), the following code can be
   used to carry out the decoding and create a change object.

   (code)
   var changes = [];
   var change = codec.decode(node);
   change.model = model;
   change.execute();
   changes.push(change);
   (end)

   The changes can then be dispatched using the model as follows.

   (code)
   var edit = new mxUndoableEdit(model, false);
   edit.changes = changes;

   edit.notify = function()
   {
       edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
        'edit', edit, 'changes', edit.changes));
       edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
        'edit', edit, 'changes', edit.changes));
    }

   model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
   model.fireEvent(new mxEventObject(mxEvent.CHANGE,
   'edit', edit, 'changes', changes));
   (end)

   Event: mxEvent.CHANGE

   Fires when an undoable edit is dispatched. The <code>edit</code> property
   contains the <mxUndoableEdit>. The <code>changes</code> property contains
   the array of atomic changes inside the undoable edit. The changes property
   is <strong>deprecated</strong>, please use edit.changes instead.

   Example:

   For finding newly inserted cells, the following code can be used:

   (code)
   graph.model.addListener(mxEvent.CHANGE, function(sender, evt)
   {
       var changes = evt.getProperty('edit').changes;
    
       for (var i = 0; i < changes.length; i++)
       {
         var change = changes[i];
    
         if (change instanceof mxChildChange &&
           change.change.previous == null)
         {
           graph.startEditingAtCell(change.child);
           break;
         }
       }
    });
   (end)


   Event: mxEvent.NOTIFY

   Same as <mxEvent.CHANGE>, this event can be used for classes that need to
   implement a sync mechanism between this model and, say, a remote model. In
   such a setup, only local changes should trigger a notify event and all
   changes should trigger a change event.

   Event: mxEvent.EXECUTE

   Fires between begin- and endUpdate and after an atomic change was executed
   in the model. The <code>change</code> property contains the atomic change
   that was executed.

   Event: mxEvent.EXECUTED

   Fires between START_EDIT and END_EDIT after an atomic change was executed.
   The <code>change</code> property contains the change that was executed.

   Event: mxEvent.BEGIN_UPDATE

   Fires after the <updateLevel> was incremented in <beginUpdate>. This event
   contains no properties.

   Event: mxEvent.START_EDIT

   Fires after the <updateLevel> was changed from 0 to 1. This event
   contains no properties.

   Event: mxEvent.END_UPDATE

   Fires after the <updateLevel> was decreased in <endUpdate> but before any
   notification or change dispatching. The <code>edit</code> property contains
   the <currentEdit>.

   Event: mxEvent.END_EDIT

   Fires after the <updateLevel> was changed from 1 to 0. This event
   contains no properties.

   Event: mxEvent.BEFORE_UNDO

   Fires before the change is dispatched after the update level has reached 0
   in <endUpdate>. The <code>edit</code> property contains the <curreneEdit>.

   Event: mxEvent.UNDO

   Fires after the change was dispatched in <endUpdate>. The <code>edit</code>
   property contains the <currentEdit>.

   Constructor: mxGraphModel

   Constructs a new graph model. If no root is specified then a new root
   <mxCell> with a default layer is created.

   Parameters:

   root - <mxCell> that represents the root cell.
   */
  constructor(root) {
    this.currentEdit = this.createUndoableEdit();
    if (root != null) {
      this.setRoot(root);
    } else {
      this.clear();
    }
  }

  /**
   Variable: root

   Holds the root cell, which in turn contains the cells that represent the
   layers of the diagram as child cells. That is, the actual elements of the
   diagram are supposed to live in the third generation of cells and below.
   */
  root = null;
  /**
   Variable: cells

   Maps from Ids to cells.
   */
  cells = null;
  /**
   Variable: maintainEdgeParent

   Specifies if edges should automatically be moved into the nearest common
   ancestor of their terminals. Default is true.
   */
  maintainEdgeParent = true;
  /**
   Variable: ignoreRelativeEdgeParent

   Specifies if relative edge parents should be ignored for finding the nearest
   common ancestors of an edge's terminals. Default is true.
   */
  ignoreRelativeEdgeParent = true;
  /**
   Variable: createIds

   Specifies if the model should automatically create Ids for new cells.
   Default is true.
   */
  createIds = true;
  /**
   Variable: prefix

   Defines the prefix of new Ids. Default is an empty string.
   */
  prefix = '';
  /**
   Variable: postfix

   Defines the postfix of new Ids. Default is an empty string.
   */
  postfix = '';
  /**
   Variable: nextId

   Specifies the next Id to be created. Initial value is 0.
   */
  nextId = 0;
  /**
   Variable: currentEdit

   Holds the changes for the current transaction. If the transaction is
   closed then a new object is created for this variable using
   <createUndoableEdit>.
   */
  currentEdit = null;
  /**
   Variable: updateLevel

   Counter for the depth of nested transactions. Each call to <beginUpdate>
   will increment this number and each call to <endUpdate> will decrement
   it. When the counter reaches 0, the transaction is closed and the
   respective events are fired. Initial value is 0.
   */
  updateLevel = 0;
  /**
   Variable: endingUpdate

   True if the program flow is currently inside endUpdate.
   */
  endingUpdate = false;

  /**
   Function: clear

   Sets a new root using <createRoot>.
   */
  clear() {
    this.setRoot(this.createRoot());
  }

  /**
   Function: isCreateIds

   Returns <createIds>.
   */
  isCreateIds() {
    return this.createIds;
  }

  /**
   Function: setCreateIds

   Sets <createIds>.
   */
  setCreateIds(value) {
    this.createIds = value;
  }

  /**
   Function: createRoot

   Creates a new root cell with a default layer (child 0).
   */
  createRoot() {
    var cell = new mxCell();
    cell.insert(new mxCell());
    return cell;
  }

  /**
   Function: getCell

   Returns the <mxCell> for the specified Id or null if no cell can be
   found for the given Id.

   Parameters:

   id - A string representing the Id of the cell.
   */
  getCell(id) {
    return (this.cells != null) ? this.cells[id] : null;
  }

  /**
   Function: filterCells

   Returns the cells from the given array where the given filter function
   returns true.
   */
  filterCells(cells, filter) {
    var result = null;
    if (cells != null) {
      result = [];
      for (var i = 0; i < cells.length; i++) {
        if (filter(cells[i])) {
          result.push(cells[i]);
        }
      }
    }
    return result;
  }

  /**
   Function: getDescendants

   Returns all descendants of the given cell and the cell itself in an array.

   Parameters:

   parent - <mxCell> whose descendants should be returned.
   */
  getDescendants(parent) {
    return this.filterDescendants(null, parent);
  }

  /**
   Function: filterDescendants

   Visits all cells recursively and applies the specified filter function
   to each cell. If the function returns true then the cell is added
   to the resulting array. The parent and result paramters are optional.
   If parent is not specified then the recursion starts at <root>.

   Example:
   The following example extracts all vertices from a given model:
   (code)
   var filter = function(cell)
   {
        return model.isVertex(cell);
    }
   var vertices = model.filterDescendants(filter);
   (end)

   Parameters:

   filter - JavaScript function that takes an <mxCell> as an argument
   and returns a boolean.
   parent - Optional <mxCell> that is used as the root of the recursion.
   */
  filterDescendants(filter, parent) {
    var result = [];
    parent = parent || this.getRoot();
    if (filter == null || filter(parent)) {
      result.push(parent);
    }
    var childCount = this.getChildCount(parent);
    for (var i = 0; i < childCount; i++) {
      var child = this.getChildAt(parent, i);
      result = result.concat(this.filterDescendants(filter, child));
    }
    return result;
  }

  /**
   Function: getRoot

   Returns the root of the model or the topmost parent of the given cell.

   Parameters:

   cell - Optional <mxCell> that specifies the child.
   */
  getRoot(cell) {
    var root = cell || this.root;
    if (cell != null) {
      while (cell != null) {
        root = cell;
        cell = this.getParent(cell);
      }
    }
    return root;
  }

  /**
   Function: setRoot

   Sets the <root> of the model using <mxRootChange> and adds the change to
   the current transaction. This resets all datastructures in the model and
   is the preferred way of clearing an existing model. Returns the new
   root.

   Example:

   (code)
   var root = new mxCell();
   root.insert(new mxCell());
   model.setRoot(root);
   (end)

   Parameters:

   root - <mxCell> that specifies the new root.
   */
  setRoot(root) {
    this.execute(new mxRootChange(this, root));
    return root;
  }

  /**
   Function: rootChanged

   Inner callback to change the root of the model and update the internal
   datastructures, such as <cells> and <nextId>. Returns the previous root.

   Parameters:

   root - <mxCell> that specifies the new root.
   */
  rootChanged(root) {
    var oldRoot = this.root;
    this.root = root;
    this.nextId = 0;
    this.cells = null;
    this.cellAdded(root);
    return oldRoot;
  }

  /**
   Function: isRoot

   Returns true if the given cell is the root of the model and a non-null
   value.

   Parameters:

   cell - <mxCell> that represents the possible root.
   */
  isRoot(cell) {
    return cell != null && this.root == cell;
  }

  /**
   Function: isLayer

   Returns true if <isRoot> returns true for the parent of the given cell.

   Parameters:

   cell - <mxCell> that represents the possible layer.
   */
  isLayer(cell) {
    return this.isRoot(this.getParent(cell));
  }

  /**
   Function: isAncestor

   Returns true if the given parent is an ancestor of the given child. Note
   returns true if child == parent.

   Parameters:

   parent - <mxCell> that specifies the parent.
   child - <mxCell> that specifies the child.
   */
  isAncestor(parent, child) {
    while (child != null && child != parent) {
      child = this.getParent(child);
    }
    return child == parent;
  }

  /**
   Function: contains

   Returns true if the model contains the given <mxCell>.

   Parameters:

   cell - <mxCell> that specifies the cell.
   */
  contains(cell) {
    return this.isAncestor(this.root, cell);
  }

  /**
   Function: getParent

   Returns the parent of the given cell.

   Parameters:

   cell - <mxCell> whose parent should be returned.
   */
  getParent(cell) {
    return (cell != null) ? cell.getParent() : null;
  }

  /**
   Function: add

   Adds the specified child to the parent at the given index using
   <mxChildChange> and adds the change to the current transaction. If no
   index is specified then the child is appended to the parent's array of
   children. Returns the inserted child.

   Parameters:

   parent - <mxCell> that specifies the parent to contain the child.
   child - <mxCell> that specifies the child to be inserted.
   index - Optional integer that specifies the index of the child.
   */
  add(parent, child, index) {
    if (child != parent && parent != null && child != null) {
      if (index == null) {
        index = this.getChildCount(parent);
      }
      var parentChanged = parent != this.getParent(child);
      this.execute(new mxChildChange(this, parent, child, index));
      if (this.maintainEdgeParent && parentChanged) {
        this.updateEdgeParents(child);
      }
    }
    return child;
  }

  /**
   Function: cellAdded

   Inner callback to update <cells> when a cell has been added. This
   implementation resolves collisions by creating new Ids. To change the
   ID of a cell after it was inserted into the model, use the following
   code:

   (code
   delete model.cells[cell.getId()];
   cell.setId(newId);
   model.cells[cell.getId()] = cell;
   (end)

   If the change of the ID should be part of the command history, then the
   cell should be removed from the model and a clone with the new ID should
   be reinserted into the model instead.

   Parameters:

   cell - <mxCell> that specifies the cell that has been added.
   */
  cellAdded(cell) {
    if (cell != null) {
      if (cell.getId() == null && this.createIds) {
        cell.setId(this.createId(cell));
      }
      if (cell.getId() != null) {
        var collision = this.getCell(cell.getId());
        if (collision != cell) {
          while (collision != null) {
            cell.setId(this.createId(cell));
            collision = this.getCell(cell.getId());
          }
          if (this.cells == null) {
            this.cells = new Object();
          }
          this.cells[cell.getId()] = cell;
        }
      }
      if (mxUtils.isNumeric(cell.getId())) {
        this.nextId = Math.max(this.nextId, cell.getId());
      }
      var childCount = this.getChildCount(cell);
      for (var i = 0; i < childCount; i++) {
        this.cellAdded(this.getChildAt(cell, i));
      }
    }
  }

  /**
   Function: createId

   Hook method to create an Id for the specified cell. This implementation
   concatenates <prefix>, id and <postfix> to create the Id and increments
   <nextId>. The cell is ignored by this implementation, but can be used in
   overridden methods to prefix the Ids with eg. the cell type.

   Parameters:

   cell - <mxCell> to create the Id for.
   */
  createId(cell) {
    var id = this.nextId;
    this.nextId++;
    return this.prefix + id + this.postfix;
  }

  /**
   Function: updateEdgeParents

   Updates the parent for all edges that are connected to cell or one of
   its descendants using <updateEdgeParent>.
   */
  updateEdgeParents(cell, root) {
    root = root || this.getRoot(cell);
    var childCount = this.getChildCount(cell);
    for (var i = 0; i < childCount; i++) {
      var child = this.getChildAt(cell, i);
      this.updateEdgeParents(child, root);
    }
    var edgeCount = this.getEdgeCount(cell);
    var edges = [];
    for (var i = 0; i < edgeCount; i++) {
      edges.push(this.getEdgeAt(cell, i));
    }
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (this.isAncestor(root, edge)) {
        this.updateEdgeParent(edge, root);
      }
    }
  }

  /**
   Function: updateEdgeParent

   Inner callback to update the parent of the specified <mxCell> to the
   nearest-common-ancestor of its two terminals.

   Parameters:

   edge - <mxCell> that specifies the edge.
   root - <mxCell> that represents the current root of the model.
   */
  updateEdgeParent(edge, root) {
    var source = this.getTerminal(edge, true);
    var target = this.getTerminal(edge, false);
    var cell = null;
    while (source != null && !this.isEdge(source) && source.geometry != null && source.geometry.relative) {
      source = this.getParent(source);
    }
    while (target != null && this.ignoreRelativeEdgeParent && !this.isEdge(target) && target.geometry != null && target.geometry.relative) {
      target = this.getParent(target);
    }
    if (this.isAncestor(root, source) && this.isAncestor(root, target)) {
      if (source == target) {
        cell = this.getParent(source);
      } else {
        cell = this.getNearestCommonAncestor(source, target);
      }
      if (cell != null && (this.getParent(cell) != this.root || this.isAncestor(cell, edge)) && this.getParent(edge) != cell) {
        var geo = this.getGeometry(edge);
        if (geo != null) {
          var origin1 = this.getOrigin(this.getParent(edge));
          var origin2 = this.getOrigin(cell);
          var dx = origin2.x - origin1.x;
          var dy = origin2.y - origin1.y;
          geo = geo.clone();
          geo.translate(-dx, -dy);
          this.setGeometry(edge, geo);
        }
        this.add(cell, edge, this.getChildCount(cell));
      }
    }
  }

  /**
   Function: getOrigin

   Returns the absolute, accumulated origin for the children inside the
   given parent as an <mxPoint>.
   */
  getOrigin(cell) {
    var result = null;
    if (cell != null) {
      result = this.getOrigin(this.getParent(cell));
      if (!this.isEdge(cell)) {
        var geo = this.getGeometry(cell);
        if (geo != null) {
          result.x += geo.x;
          result.y += geo.y;
        }
      }
    } else {
      result = new mxPoint();
    }
    return result;
  }

  /**
   Function: getNearestCommonAncestor

   Returns the nearest common ancestor for the specified cells.

   Parameters:

   cell1 - <mxCell> that specifies the first cell in the tree.
   cell2 - <mxCell> that specifies the second cell in the tree.
   */
  getNearestCommonAncestor(cell1, cell2) {
    if (cell1 != null && cell2 != null) {
      var path = mxCellPath.create(cell2);
      if (path != null && path.length > 0) {
        var cell = cell1;
        var current = mxCellPath.create(cell);
        if (path.length < current.length) {
          cell = cell2;
          var tmp = current;
          current = path;
          path = tmp;
        }
        while (cell != null) {
          var parent = this.getParent(cell);
          if (path.indexOf(current + mxCellPath.PATH_SEPARATOR) == 0 && parent != null) {
            return cell;
          }
          current = mxCellPath.getParentPath(current);
          cell = parent;
        }
      }
    }
    return null;
  }

  /**
   Function: remove

   Removes the specified cell from the model using <mxChildChange> and adds
   the change to the current transaction. This operation will remove the
   cell and all of its children from the model. Returns the removed cell.

   Parameters:

   cell - <mxCell> that should be removed.
   */
  remove(cell) {
    if (cell == this.root) {
      this.setRoot(null);
    } else if (this.getParent(cell) != null) {
      this.execute(new mxChildChange(this, null, cell));
    }
    return cell;
  }

  /**
   Function: cellRemoved

   Inner callback to update <cells> when a cell has been removed.

   Parameters:

   cell - <mxCell> that specifies the cell that has been removed.
   */
  cellRemoved(cell) {
    if (cell != null && this.cells != null) {
      var childCount = this.getChildCount(cell);
      for (var i = childCount - 1; i >= 0; i--) {
        this.cellRemoved(this.getChildAt(cell, i));
      }
      if (this.cells != null && cell.getId() != null) {
        delete this.cells[cell.getId()];
      }
    }
  }

  /**
   Function: parentForCellChanged

   Inner callback to update the parent of a cell using <mxCell.insert>
   on the parent and return the previous parent.

   Parameters:

   cell - <mxCell> to update the parent for.
   parent - <mxCell> that specifies the new parent of the cell.
   index - Optional integer that defines the index of the child
   in the parent's child array.
   */
  parentForCellChanged(cell, parent, index) {
    var previous = this.getParent(cell);
    if (parent != null) {
      if (parent != previous || previous.getIndex(cell) != index) {
        parent.insert(cell, index);
      }
    } else if (previous != null) {
      var oldIndex = previous.getIndex(cell);
      previous.remove(oldIndex);
    }
    var par = this.contains(parent);
    var pre = this.contains(previous);
    if (par && !pre) {
      this.cellAdded(cell);
    } else if (pre && !par) {
      this.cellRemoved(cell);
    }
    return previous;
  }

  /**
   Function: getChildCount

   Returns the number of children in the given cell.

   Parameters:

   cell - <mxCell> whose number of children should be returned.
   */
  getChildCount(cell) {
    return (cell != null) ? cell.getChildCount() : 0;
  }

  /**
   Function: getChildAt

   Returns the child of the given <mxCell> at the given index.

   Parameters:

   cell - <mxCell> that represents the parent.
   index - Integer that specifies the index of the child to be returned.
   */
  getChildAt(cell, index) {
    return (cell != null) ? cell.getChildAt(index) : null;
  }

  /**
   Function: getChildren

   Returns all children of the given <mxCell> as an array of <mxCells>. The
   return value should be only be read.

   Parameters:

   cell - <mxCell> the represents the parent.
   */
  getChildren(cell) {
    return (cell != null) ? cell.children : null;
  }

  /**
   Function: getChildVertices

   Returns the child vertices of the given parent.

   Parameters:

   cell - <mxCell> whose child vertices should be returned.
   */
  getChildVertices(parent) {
    return this.getChildCells(parent, true, false);
  }

  /**
   Function: getChildEdges

   Returns the child edges of the given parent.

   Parameters:

   cell - <mxCell> whose child edges should be returned.
   */
  getChildEdges(parent) {
    return this.getChildCells(parent, false, true);
  }

  /**
   Function: getChildCells

   Returns the children of the given cell that are vertices and/or edges
   depending on the arguments.

   Parameters:

   cell - <mxCell> the represents the parent.
   vertices - Boolean indicating if child vertices should be returned.
   Default is false.
   edges - Boolean indicating if child edges should be returned.
   Default is false.
   */
  getChildCells(parent, vertices, edges) {
    vertices = (vertices != null) ? vertices : false;
    edges = (edges != null) ? edges : false;
    var childCount = this.getChildCount(parent);
    var result = [];
    for (var i = 0; i < childCount; i++) {
      var child = this.getChildAt(parent, i);
      if ((!edges && !vertices) || (edges && this.isEdge(child)) || (vertices && this.isVertex(child))) {
        result.push(child);
      }
    }
    return result;
  }

  /**
   Function: getTerminal

   Returns the source or target <mxCell> of the given edge depending on the
   value of the boolean parameter.

   Parameters:

   edge - <mxCell> that specifies the edge.
   isSource - Boolean indicating which end of the edge should be returned.
   */
  getTerminal(edge, isSource) {
    return (edge != null) ? edge.getTerminal(isSource) : null;
  }

  /**
   Function: setTerminal

   Sets the source or target terminal of the given <mxCell> using
   <mxTerminalChange> and adds the change to the current transaction.
   This implementation updates the parent of the edge using <updateEdgeParent>
   if required.

   Parameters:

   edge - <mxCell> that specifies the edge.
   terminal - <mxCell> that specifies the new terminal.
   isSource - Boolean indicating if the terminal is the new source or
   target terminal of the edge.
   */
  setTerminal(edge, terminal, isSource) {
    var terminalChanged = terminal != this.getTerminal(edge, isSource);
    this.execute(new mxTerminalChange(this, edge, terminal, isSource));
    if (this.maintainEdgeParent && terminalChanged) {
      this.updateEdgeParent(edge, this.getRoot());
    }
    return terminal;
  }

  /**
   Function: setTerminals

   Sets the source and target <mxCell> of the given <mxCell> in a single
   transaction using <setTerminal> for each end of the edge.

   Parameters:

   edge - <mxCell> that specifies the edge.
   source - <mxCell> that specifies the new source terminal.
   target - <mxCell> that specifies the new target terminal.
   */
  setTerminals(edge, source, target) {
    this.beginUpdate();
    try {
      this.setTerminal(edge, source, true);
      this.setTerminal(edge, target, false);
    } finally {
      this.endUpdate();
    }
  }

  /**
   Function: terminalForCellChanged

   Inner helper function to update the terminal of the edge using
   <mxCell.insertEdge> and return the previous terminal.

   Parameters:

   edge - <mxCell> that specifies the edge to be updated.
   terminal - <mxCell> that specifies the new terminal.
   isSource - Boolean indicating if the terminal is the new source or
   target terminal of the edge.
   */
  terminalForCellChanged(edge, terminal, isSource) {
    var previous = this.getTerminal(edge, isSource);
    if (terminal != null) {
      terminal.insertEdge(edge, isSource);
    } else if (previous != null) {
      previous.removeEdge(edge, isSource);
    }
    return previous;
  }

  /**
   Function: getEdgeCount

   Returns the number of distinct edges connected to the given cell.

   Parameters:

   cell - <mxCell> that represents the vertex.
   */
  getEdgeCount(cell) {
    return (cell != null) ? cell.getEdgeCount() : 0;
  }

  /**
   Function: getEdgeAt

   Returns the edge of cell at the given index.

   Parameters:

   cell - <mxCell> that specifies the vertex.
   index - Integer that specifies the index of the edge
   to return.
   */
  getEdgeAt(cell, index) {
    return (cell != null) ? cell.getEdgeAt(index) : null;
  }

  /**
   Function: getDirectedEdgeCount

   Returns the number of incoming or outgoing edges, ignoring the given
   edge.

   Parameters:

   cell - <mxCell> whose edge count should be returned.
   outgoing - Boolean that specifies if the number of outgoing or
   incoming edges should be returned.
   ignoredEdge - <mxCell> that represents an edge to be ignored.
   */
  getDirectedEdgeCount(cell, outgoing, ignoredEdge) {
    var count = 0;
    var edgeCount = this.getEdgeCount(cell);
    for (var i = 0; i < edgeCount; i++) {
      var edge = this.getEdgeAt(cell, i);
      if (edge != ignoredEdge && this.getTerminal(edge, outgoing) == cell) {
        count++;
      }
    }
    return count;
  }

  /**
   Function: getConnections

   Returns all edges of the given cell without loops.

   Parameters:

   cell - <mxCell> whose edges should be returned.
   */
  getConnections(cell) {
    return this.getEdges(cell, true, true, false);
  }

  /**
   Function: getIncomingEdges

   Returns the incoming edges of the given cell without loops.

   Parameters:

   cell - <mxCell> whose incoming edges should be returned.
   */
  getIncomingEdges(cell) {
    return this.getEdges(cell, true, false, false);
  }

  /**
   Function: getOutgoingEdges

   Returns the outgoing edges of the given cell without loops.

   Parameters:

   cell - <mxCell> whose outgoing edges should be returned.
   */
  getOutgoingEdges(cell) {
    return this.getEdges(cell, false, true, false);
  }

  /**
   Function: getEdges

   Returns all distinct edges connected to this cell as a new array of
   <mxCells>. If at least one of incoming or outgoing is true, then loops
   are ignored, otherwise if both are false, then all edges connected to
   the given cell are returned including loops.

   Parameters:

   cell - <mxCell> that specifies the cell.
   incoming - Optional boolean that specifies if incoming edges should be
   returned. Default is true.
   outgoing - Optional boolean that specifies if outgoing edges should be
   returned. Default is true.
   includeLoops - Optional boolean that specifies if loops should be returned.
   Default is true.
   */
  getEdges(cell, incoming, outgoing, includeLoops) {
    incoming = (incoming != null) ? incoming : true;
    outgoing = (outgoing != null) ? outgoing : true;
    includeLoops = (includeLoops != null) ? includeLoops : true;
    var edgeCount = this.getEdgeCount(cell);
    var result = [];
    for (var i = 0; i < edgeCount; i++) {
      var edge = this.getEdgeAt(cell, i);
      var source = this.getTerminal(edge, true);
      var target = this.getTerminal(edge, false);
      if ((includeLoops && source == target) || ((source != target) && ((incoming && target == cell) || (outgoing && source == cell)))) {
        result.push(edge);
      }
    }
    return result;
  }

  /**
   Function: getEdgesBetween

   Returns all edges between the given source and target pair. If directed
   is true, then only edges from the source to the target are returned,
   otherwise, all edges between the two cells are returned.

   Parameters:

   source - <mxCell> that defines the source terminal of the edge to be
   returned.
   target - <mxCell> that defines the target terminal of the edge to be
   returned.
   directed - Optional boolean that specifies if the direction of the
   edge should be taken into account. Default is false.
   */
  getEdgesBetween(source, target, directed) {
    directed = (directed != null) ? directed : false;
    var tmp1 = this.getEdgeCount(source);
    var tmp2 = this.getEdgeCount(target);
    var terminal = source;
    var edgeCount = tmp1;
    if (tmp2 < tmp1) {
      edgeCount = tmp2;
      terminal = target;
    }
    var result = [];
    for (var i = 0; i < edgeCount; i++) {
      var edge = this.getEdgeAt(terminal, i);
      var src = this.getTerminal(edge, true);
      var trg = this.getTerminal(edge, false);
      var directedMatch = (src == source) && (trg == target);
      var oppositeMatch = (trg == source) && (src == target);
      if (directedMatch || (!directed && oppositeMatch)) {
        result.push(edge);
      }
    }
    return result;
  }

  /**
   Function: getOpposites

   Returns all opposite vertices wrt terminal for the given edges, only
   returning sources and/or targets as specified. The result is returned
   as an array of <mxCells>.

   Parameters:

   edges - Array of <mxCells> that contain the edges to be examined.
   terminal - <mxCell> that specifies the known end of the edges.
   sources - Boolean that specifies if source terminals should be contained
   in the result. Default is true.
   targets - Boolean that specifies if target terminals should be contained
   in the result. Default is true.
   */
  getOpposites(edges, terminal, sources, targets) {
    sources = (sources != null) ? sources : true;
    targets = (targets != null) ? targets : true;
    var terminals = [];
    if (edges != null) {
      for (var i = 0; i < edges.length; i++) {
        var source = this.getTerminal(edges[i], true);
        var target = this.getTerminal(edges[i], false);
        if (source == terminal && target != null && target != terminal && targets) {
          terminals.push(target);
        } else if (target == terminal && source != null && source != terminal && sources) {
          terminals.push(source);
        }
      }
    }
    return terminals;
  }

  /**
   Function: getTopmostCells

   Returns the topmost cells of the hierarchy in an array that contains no
   descendants for each <mxCell> that it contains. Duplicates should be
   removed in the cells array to improve performance.

   Parameters:

   cells - Array of <mxCells> whose topmost ancestors should be returned.
   */
  getTopmostCells(cells) {
    var dict = new mxDictionary();
    var tmp = [];
    for (var i = 0; i < cells.length; i++) {
      dict.put(cells[i], true);
    }
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var topmost = true;
      var parent = this.getParent(cell);
      while (parent != null) {
        if (dict.get(parent)) {
          topmost = false;
          break;
        }
        parent = this.getParent(parent);
      }
      if (topmost) {
        tmp.push(cell);
      }
    }
    return tmp;
  }

  /**
   Function: isVertex

   Returns true if the given cell is a vertex.

   Parameters:

   cell - <mxCell> that represents the possible vertex.
   */
  isVertex(cell) {
    return (cell != null) ? cell.isVertex() : false;
  }

  /**
   Function: isEdge

   Returns true if the given cell is an edge.

   Parameters:

   cell - <mxCell> that represents the possible edge.
   */
  isEdge(cell) {
    return (cell != null) ? cell.isEdge() : false;
  }

  /**
   Function: isConnectable

   Returns true if the given <mxCell> is connectable. If <edgesConnectable>
   is false, then this function returns false for all edges else it returns
   the return value of <mxCell.isConnectable>.

   Parameters:

   cell - <mxCell> whose connectable state should be returned.
   */
  isConnectable(cell) {
    return (cell != null) ? cell.isConnectable() : false;
  }

  /**
   Function: getValue

   Returns the user object of the given <mxCell> using <mxCell.getValue>.

   Parameters:

   cell - <mxCell> whose user object should be returned.
   */
  getValue(cell) {
    return (cell != null) ? cell.getValue() : null;
  }

  /**
   Function: setValue

   Sets the user object of then given <mxCell> using <mxValueChange>
   and adds the change to the current transaction.

   Parameters:

   cell - <mxCell> whose user object should be changed.
   value - Object that defines the new user object.
   */
  setValue(cell, value) {
    this.execute(new mxValueChange(this, cell, value));
    return value;
  }

  /**
   Function: valueForCellChanged

   Inner callback to update the user object of the given <mxCell>
   using <mxCell.valueChanged> and return the previous value,
   that is, the return value of <mxCell.valueChanged>.

   To change a specific attribute in an XML node, the following code can be
   used.

   (code)
   graph.getModel().valueForCellChanged = function(cell, value)
   {
       var previous = cell.value.getAttribute('label');
       cell.value.setAttribute('label', value);
    
       return previous;
    };
   (end)
   */
  valueForCellChanged(cell, value) {
    return cell.valueChanged(value);
  }

  /**
   Function: getGeometry

   Returns the <mxGeometry> of the given <mxCell>.

   Parameters:

   cell - <mxCell> whose geometry should be returned.
   */
  getGeometry(cell) {
    return (cell != null) ? cell.getGeometry() : null;
  }

  /**
   Function: setGeometry

   Sets the <mxGeometry> of the given <mxCell>. The actual update
   of the cell is carried out in <geometryForCellChanged>. The
   <mxGeometryChange> action is used to encapsulate the change.

   Parameters:

   cell - <mxCell> whose geometry should be changed.
   geometry - <mxGeometry> that defines the new geometry.
   */
  setGeometry(cell, geometry) {
    if (geometry != this.getGeometry(cell)) {
      this.execute(new mxGeometryChange(this, cell, geometry));
    }
    return geometry;
  }

  /**
   Function: geometryForCellChanged

   Inner callback to update the <mxGeometry> of the given <mxCell> using
   <mxCell.setGeometry> and return the previous <mxGeometry>.
   */
  geometryForCellChanged(cell, geometry) {
    var previous = this.getGeometry(cell);
    cell.setGeometry(geometry);
    return previous;
  }

  /**
   Function: getStyle

   Returns the style of the given <mxCell>.

   Parameters:

   cell - <mxCell> whose style should be returned.
   */
  getStyle(cell) {
    return (cell != null) ? cell.getStyle() : null;
  }

  /**
   Function: setStyle

   Sets the style of the given <mxCell> using <mxStyleChange> and
   adds the change to the current transaction.

   Parameters:

   cell - <mxCell> whose style should be changed.
   style - String of the form [stylename;|key=value;] to specify
   the new cell style.
   */
  setStyle(cell, style) {
    if (style != this.getStyle(cell)) {
      this.execute(new mxStyleChange(this, cell, style));
    }
    return style;
  }

  /**
   Function: styleForCellChanged

   Inner callback to update the style of the given <mxCell>
   using <mxCell.setStyle> and return the previous style.

   Parameters:

   cell - <mxCell> that specifies the cell to be updated.
   style - String of the form [stylename;|key=value;] to specify
   the new cell style.
   */
  styleForCellChanged(cell, style) {
    var previous = this.getStyle(cell);
    cell.setStyle(style);
    return previous;
  }

  /**
   Function: isCollapsed

   Returns true if the given <mxCell> is collapsed.

   Parameters:

   cell - <mxCell> whose collapsed state should be returned.
   */
  isCollapsed(cell) {
    return (cell != null) ? cell.isCollapsed() : false;
  }

  /**
   Function: setCollapsed

   Sets the collapsed state of the given <mxCell> using <mxCollapseChange>
   and adds the change to the current transaction.

   Parameters:

   cell - <mxCell> whose collapsed state should be changed.
   collapsed - Boolean that specifies the new collpased state.
   */
  setCollapsed(cell, collapsed) {
    if (collapsed != this.isCollapsed(cell)) {
      this.execute(new mxCollapseChange(this, cell, collapsed));
    }
    return collapsed;
  }

  /**
   Function: collapsedStateForCellChanged

   Inner callback to update the collapsed state of the
   given <mxCell> using <mxCell.setCollapsed> and return
   the previous collapsed state.

   Parameters:

   cell - <mxCell> that specifies the cell to be updated.
   collapsed - Boolean that specifies the new collpased state.
   */
  collapsedStateForCellChanged(cell, collapsed) {
    var previous = this.isCollapsed(cell);
    cell.setCollapsed(collapsed);
    return previous;
  }

  /**
   Function: isVisible

   Returns true if the given <mxCell> is visible.

   Parameters:

   cell - <mxCell> whose visible state should be returned.
   */
  isVisible(cell) {
    return (cell != null) ? cell.isVisible() : false;
  }

  /**
   Function: setVisible

   Sets the visible state of the given <mxCell> using <mxVisibleChange> and
   adds the change to the current transaction.

   Parameters:

   cell - <mxCell> whose visible state should be changed.
   visible - Boolean that specifies the new visible state.
   */
  setVisible(cell, visible) {
    if (visible != this.isVisible(cell)) {
      this.execute(new mxVisibleChange(this, cell, visible));
    }
    return visible;
  }

  /**
   Function: visibleStateForCellChanged

   Inner callback to update the visible state of the
   given <mxCell> using <mxCell.setCollapsed> and return
   the previous visible state.

   Parameters:

   cell - <mxCell> that specifies the cell to be updated.
   visible - Boolean that specifies the new visible state.
   */
  visibleStateForCellChanged(cell, visible) {
    var previous = this.isVisible(cell);
    cell.setVisible(visible);
    return previous;
  }

  /**
   Function: execute

   Executes the given edit and fires events if required. The edit object
   requires an execute function which is invoked. The edit is added to the
   <currentEdit> between <beginUpdate> and <endUpdate> calls, so that
   events will be fired if this execute is an individual transaction, that
   is, if no previous <beginUpdate> calls have been made without calling
   <endUpdate>. This implementation fires an <execute> event before
   executing the given change.

   Parameters:

   change - Object that described the change.
   */
  execute(change) {
    change.execute();
    this.beginUpdate();
    this.currentEdit.add(change);
    this.fireEvent(new mxEventObject(mxEvent.EXECUTE, 'change', change));
    this.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
    this.endUpdate();
  }

  /**
   Function: beginUpdate

   Increments the <updateLevel> by one. The event notification
   is queued until <updateLevel> reaches 0 by use of
   <endUpdate>.

   All changes on <mxGraphModel> are transactional,
   that is, they are executed in a single undoable change
   on the model (without transaction isolation).
   Therefore, if you want to combine any
   number of changes into a single undoable change,
   you should group any two or more API calls that
   modify the graph model between <beginUpdate>
   and <endUpdate> calls as shown here:

   (code)
   var model = graph.getModel();
   var parent = graph.getDefaultParent();
   var index = model.getChildCount(parent);
   model.beginUpdate();
   try
   {
       model.add(parent, v1, index);
       model.add(parent, v2, index+1);
    }
   finally
   {
       model.endUpdate();
    }
   (end)

   Of course there is a shortcut for appending a
   sequence of cells into the default parent:

   (code)
   graph.addCells([v1, v2]).
   (end)
   */
  beginUpdate() {
    this.updateLevel++;
    this.fireEvent(new mxEventObject(mxEvent.BEGIN_UPDATE));
    if (this.updateLevel == 1) {
      this.fireEvent(new mxEventObject(mxEvent.START_EDIT));
    }
  }

  /**
   Function: endUpdate

   Decrements the <updateLevel> by one and fires an <undo>
   event if the <updateLevel> reaches 0. This function
   indirectly fires a <change> event by invoking the notify
   function on the <currentEdit> und then creates a new
   <currentEdit> using <createUndoableEdit>.

   The <undo> event is fired only once per edit, whereas
   the <change> event is fired whenever the notify
   function is invoked, that is, on undo and redo of
   the edit.
   */
  endUpdate() {
    this.updateLevel--;
    if (this.updateLevel == 0) {
      this.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }
    if (!this.endingUpdate) {
      this.endingUpdate = this.updateLevel == 0;
      this.fireEvent(new mxEventObject(mxEvent.END_UPDATE, 'edit', this.currentEdit));
      try {
        if (this.endingUpdate && !this.currentEdit.isEmpty()) {
          this.fireEvent(new mxEventObject(mxEvent.BEFORE_UNDO, 'edit', this.currentEdit));
          var tmp = this.currentEdit;
          this.currentEdit = this.createUndoableEdit();
          tmp.notify();
          this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', tmp));
        }
      } finally {
        this.endingUpdate = false;
      }
    }
  }

  /**
   Function: createUndoableEdit

   Creates a new <mxUndoableEdit> that implements the
   notify function to fire a <change> and <notify> event
   through the <mxUndoableEdit>'s source.

   Parameters:

   significant - Optional boolean that specifies if the edit to be created is
   significant. Default is true.
   */
  createUndoableEdit(significant) {
    var edit = new mxUndoableEdit(this, (significant != null) ? significant : true);
    edit.notify = function () {
      edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE, 'edit', edit, 'changes', edit.changes));
      edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY, 'edit', edit, 'changes', edit.changes));
    };
    return edit;
  }

  /**
   Function: mergeChildren

   Merges the children of the given cell into the given target cell inside
   this model. All cells are cloned unless there is a corresponding cell in
   the model with the same id, in which case the source cell is ignored and
   all edges are connected to the corresponding cell in this model. Edges
   are considered to have no identity and are always cloned unless the
   cloneAllEdges flag is set to false, in which case edges with the same
   id in the target model are reconnected to reflect the terminals of the
   source edges.
   */
  mergeChildren(from, to, cloneAllEdges) {
    cloneAllEdges = (cloneAllEdges != null) ? cloneAllEdges : true;
    this.beginUpdate();
    try {
      var mapping = new Object();
      this.mergeChildrenImpl(from, to, cloneAllEdges, mapping);
      for (var key in mapping) {
        var cell = mapping[key];
        var terminal = this.getTerminal(cell, true);
        if (terminal != null) {
          terminal = mapping[mxCellPath.create(terminal)];
          this.setTerminal(cell, terminal, true);
        }
        terminal = this.getTerminal(cell, false);
        if (terminal != null) {
          terminal = mapping[mxCellPath.create(terminal)];
          this.setTerminal(cell, terminal, false);
        }
      }
    } finally {
      this.endUpdate();
    }
  }

  /**
   Function: mergeChildren

   Clones the children of the source cell into the given target cell in
   this model and adds an entry to the mapping that maps from the source
   cell to the target cell with the same id or the clone of the source cell
   that was inserted into this model.
   */
  mergeChildrenImpl(from, to, cloneAllEdges, mapping) {
    this.beginUpdate();
    try {
      var childCount = from.getChildCount();
      for (var i = 0; i < childCount; i++) {
        var cell = from.getChildAt(i);
        if (typeof (cell.getId) == 'function') {
          var id = cell.getId();
          var target = (id != null && (!this.isEdge(cell) || !cloneAllEdges)) ? this.getCell(id) : null;
          if (target == null) {
            var clone = cell.clone();
            clone.setId(id);
            clone.setTerminal(cell.getTerminal(true), true);
            clone.setTerminal(cell.getTerminal(false), false);
            target = to.insert(clone);
            this.cellAdded(target);
          }
          mapping[mxCellPath.create(cell)] = target;
          this.mergeChildrenImpl(cell, target, cloneAllEdges, mapping);
        }
      }
    } finally {
      this.endUpdate();
    }
  }

  /**
   Function: getParents

   Returns an array that represents the set (no duplicates) of all parents
   for the given array of cells.

   Parameters:

   cells - Array of cells whose parents should be returned.
   */
  getParents(cells) {
    var parents = [];
    if (cells != null) {
      var dict = new mxDictionary();
      for (var i = 0; i < cells.length; i++) {
        var parent = this.getParent(cells[i]);
        if (parent != null && !dict.get(parent)) {
          dict.put(parent, true);
          parents.push(parent);
        }
      }
    }
    return parents;
  }

  /**
   Function: cloneCell

   Returns a deep clone of the given <mxCell> (including
   the children) which is created using <cloneCells>.

   Parameters:

   cell - <mxCell> to be cloned.
   */
  cloneCell(cell) {
    if (cell != null) {
      return this.cloneCells([cell], true)[0];
    }
    return null;
  }

  /**
   Function: cloneCells

   Returns an array of clones for the given array of <mxCells>.
   Depending on the value of includeChildren, a deep clone is created for
   each cell. Connections are restored based if the corresponding
   cell is contained in the passed in array.

   Parameters:

   cells - Array of <mxCell> to be cloned.
   includeChildren - Boolean indicating if the cells should be cloned
   with all descendants.
   mapping - Optional mapping for existing clones.
   */
  cloneCells(cells, includeChildren, mapping) {
    mapping = (mapping != null) ? mapping : new Object();
    var clones = [];
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] != null) {
        clones.push(this.cloneCellImpl(cells[i], mapping, includeChildren));
      } else {
        clones.push(null);
      }
    }
    for (var i = 0; i < clones.length; i++) {
      if (clones[i] != null) {
        this.restoreClone(clones[i], cells[i], mapping);
      }
    }
    return clones;
  }

  /**
   Function: cloneCellImpl

   Inner helper method for cloning cells recursively.
   */
  cloneCellImpl(cell, mapping, includeChildren) {
    var ident = mxObjectIdentity.get(cell);
    var clone = mapping[ident];
    if (clone == null) {
      clone = this.cellCloned(cell);
      mapping[ident] = clone;
      if (includeChildren) {
        var childCount = this.getChildCount(cell);
        for (var i = 0; i < childCount; i++) {
          var cloneChild = this.cloneCellImpl(this.getChildAt(cell, i), mapping, true);
          clone.insert(cloneChild);
        }
      }
    }
    return clone;
  }

  /**
   Function: cellCloned

   Hook for cloning the cell. This returns cell.clone() or
   any possible exceptions.
   */
  cellCloned(cell) {
    return cell.clone();
  }

  /**
   Function: restoreClone

   Inner helper method for restoring the connections in
   a network of cloned cells.
   */
  restoreClone(clone, cell, mapping) {
    var source = this.getTerminal(cell, true);
    if (source != null) {
      var tmp = mapping[mxObjectIdentity.get(source)];
      if (tmp != null) {
        tmp.insertEdge(clone, true);
      }
    }
    var target = this.getTerminal(cell, false);
    if (target != null) {
      var tmp = mapping[mxObjectIdentity.get(target)];
      if (tmp != null) {
        tmp.insertEdge(clone, false);
      }
    }
    var childCount = this.getChildCount(clone);
    for (var i = 0; i < childCount; i++) {
      this.restoreClone(this.getChildAt(clone, i), this.getChildAt(cell, i), mapping);
    }
  }

  /**
   Function: execute

   Carries out a change of the root using
   <mxGraphModel.rootChanged>.
   */
  execute() {
    this.root = this.previous;
    this.previous = this.model.rootChanged(this.previous);
  }

  /**
   Function: execute

   Changes the parent of <child> using
   <mxGraphModel.parentForCellChanged> and
   removes or restores the cell's
   connections.
   */
  execute() {
    if (this.child != null) {
      var tmp = this.model.getParent(this.child);
      var tmp2 = (tmp != null) ? tmp.getIndex(this.child) : 0;
      if (this.previous == null) {
        this.connect(this.child, false);
      }
      tmp = this.model.parentForCellChanged(this.child, this.previous, this.previousIndex);
      if (this.previous != null) {
        this.connect(this.child, true);
      }
      this.parent = this.previous;
      this.previous = tmp;
      this.index = this.previousIndex;
      this.previousIndex = tmp2;
    }
  }

  /**
   Function: disconnect

   Disconnects the given cell recursively from its
   terminals and stores the previous terminal in the
   cell's terminals.
   */
  connect(cell, isConnect) {
    isConnect = (isConnect != null) ? isConnect : true;
    var source = cell.getTerminal(true);
    var target = cell.getTerminal(false);
    if (source != null) {
      if (isConnect) {
        this.model.terminalForCellChanged(cell, source, true);
      } else {
        this.model.terminalForCellChanged(cell, null, true);
      }
    }
    if (target != null) {
      if (isConnect) {
        this.model.terminalForCellChanged(cell, target, false);
      } else {
        this.model.terminalForCellChanged(cell, null, false);
      }
    }
    cell.setTerminal(source, true);
    cell.setTerminal(target, false);
    var childCount = this.model.getChildCount(cell);
    for (var i = 0; i < childCount; i++) {
      this.connect(this.model.getChildAt(cell, i), isConnect);
    }
  }

  /**
   Function: execute

   Changes the terminal of <cell> to <previous> using
   <mxGraphModel.terminalForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.terminal = this.previous;
      this.previous = this.model.terminalForCellChanged(this.cell, this.previous, this.source);
    }
  }

  /**
   Function: execute

   Changes the value of <cell> to <previous> using
   <mxGraphModel.valueForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.value = this.previous;
      this.previous = this.model.valueForCellChanged(this.cell, this.previous);
    }
  }

  /**
   Function: execute

   Changes the style of <cell> to <previous> using
   <mxGraphModel.styleForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.style = this.previous;
      this.previous = this.model.styleForCellChanged(this.cell, this.previous);
    }
  }

  /**
   Function: execute

   Changes the geometry of <cell> ro <previous> using
   <mxGraphModel.geometryForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.geometry = this.previous;
      this.previous = this.model.geometryForCellChanged(this.cell, this.previous);
    }
  }

  /**
   Function: execute

   Changes the collapsed state of <cell> to <previous> using
   <mxGraphModel.collapsedStateForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.collapsed = this.previous;
      this.previous = this.model.collapsedStateForCellChanged(this.cell, this.previous);
    }
  }

  /**
   Function: execute

   Changes the visible state of <cell> to <previous> using
   <mxGraphModel.visibleStateForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.visible = this.previous;
      this.previous = this.model.visibleStateForCellChanged(this.cell, this.previous);
    }
  }

  /**
   Function: execute

   Changes the attribute of the cell's user object by
   using <mxCell.setAttribute>.
   */
  execute() {
    if (this.cell != null) {
      var tmp = this.cell.getAttribute(this.attribute);
      if (this.previous == null) {
        this.cell.value.removeAttribute(this.attribute);
      } else {
        this.cell.setAttribute(this.attribute, this.previous);
      }
      this.previous = tmp;
    }
  }
};isible(cell);
{
  return (cell != null) ? cell.isVisible() : false;
}
/**
 Function: setVisible

 Sets the visible state of the given <mxCell> using <mxVisibleChange> and
 adds the change to the current transaction.

 Parameters:

 cell - <mxCell> whose visible state should be changed.
 visible - Boolean that specifies the new visible state.
 */
setVisible(cell, visible);
{
  if (visible != this.isVisible(cell)) {
    this.execute(new mxVisibleChange(this, cell, visible));
  }
  return visible;
}
/**
 Function: visibleStateForCellChanged

 Inner callback to update the visible state of the
 given <mxCell> using <mxCell.setCollapsed> and return
 the previous visible state.

 Parameters:

 cell - <mxCell> that specifies the cell to be updated.
 visible - Boolean that specifies the new visible state.
 */
visibleStateForCellChanged(cell, visible);
{
  var previous = this.isVisible(cell);
  cell.setVisible(visible);
  return previous;
}
/**
 Function: execute

 Executes the given edit and fires events if required. The edit object
 requires an execute function which is invoked. The edit is added to the
 <currentEdit> between <beginUpdate> and <endUpdate> calls, so that
 events will be fired if this execute is an individual transaction, that
 is, if no previous <beginUpdate> calls have been made without calling
 <endUpdate>. This implementation fires an <execute> event before
 executing the given change.

 Parameters:

 change - Object that described the change.
 */
execute(change);
{
  change.execute();
  this.beginUpdate();
  this.currentEdit.add(change);
  this.fireEvent(new mxEventObject(mxEvent.EXECUTE, 'change', change));
  this.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
  this.endUpdate();
}
/**
 Function: beginUpdate

 Increments the <updateLevel> by one. The event notification
 is queued until <updateLevel> reaches 0 by use of
 <endUpdate>.

 All changes on <mxGraphModel> are transactional,
 that is, they are executed in a single undoable change
 on the model (without transaction isolation).
 Therefore, if you want to combine any
 number of changes into a single undoable change,
 you should group any two or more API calls that
 modify the graph model between <beginUpdate>
 and <endUpdate> calls as shown here:

 (code)
 var model = graph.getModel();
 var parent = graph.getDefaultParent();
 var index = model.getChildCount(parent);
 model.beginUpdate();
 try
 {
       model.add(parent, v1, index);
       model.add(parent, v2, index+1);
    }
 finally
 {
       model.endUpdate();
    }
 (end)

 Of course there is a shortcut for appending a
 sequence of cells into the default parent:

 (code)
 graph.addCells([v1, v2]).
 (end)
 */
beginUpdate();
{
  this.updateLevel++;
  this.fireEvent(new mxEventObject(mxEvent.BEGIN_UPDATE));
  if (this.updateLevel == 1) {
    this.fireEvent(new mxEventObject(mxEvent.START_EDIT));
  }
}
/**
 Function: endUpdate

 Decrements the <updateLevel> by one and fires an <undo>
 event if the <updateLevel> reaches 0. This function
 indirectly fires a <change> event by invoking the notify
 function on the <currentEdit> und then creates a new
 <currentEdit> using <createUndoableEdit>.

 The <undo> event is fired only once per edit, whereas
 the <change> event is fired whenever the notify
 function is invoked, that is, on undo and redo of
 the edit.
 */
endUpdate();
{
  this.updateLevel--;
  if (this.updateLevel == 0) {
    this.fireEvent(new mxEventObject(mxEvent.END_EDIT));
  }
  if (!this.endingUpdate) {
    this.endingUpdate = this.updateLevel == 0;
    this.fireEvent(new mxEventObject(mxEvent.END_UPDATE, 'edit', this.currentEdit));
    try {
      if (this.endingUpdate && !this.currentEdit.isEmpty()) {
        this.fireEvent(new mxEventObject(mxEvent.BEFORE_UNDO, 'edit', this.currentEdit));
        var tmp = this.currentEdit;
        this.currentEdit = this.createUndoableEdit();
        tmp.notify();
        this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', tmp));
      }
    } finally {
      this.endingUpdate = false;
    }
  }
}
/**
 Function: createUndoableEdit

 Creates a new <mxUndoableEdit> that implements the
 notify function to fire a <change> and <notify> event
 through the <mxUndoableEdit>'s source.

 Parameters:

 significant - Optional boolean that specifies if the edit to be created is
 significant. Default is true.
 */
createUndoableEdit(significant);
{
  var edit = new mxUndoableEdit(this, (significant != null) ? significant : true);
  edit.notify = function () {
    edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE, 'edit', edit, 'changes', edit.changes));
    edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY, 'edit', edit, 'changes', edit.changes));
  };
  return edit;
}
/**
 Function: mergeChildren

 Merges the children of the given cell into the given target cell inside
 this model. All cells are cloned unless there is a corresponding cell in
 the model with the same id, in which case the source cell is ignored and
 all edges are connected to the corresponding cell in this model. Edges
 are considered to have no identity and are always cloned unless the
 cloneAllEdges flag is set to false, in which case edges with the same
 id in the target model are reconnected to reflect the terminals of the
 source edges.
 */
mergeChildren(from, to, cloneAllEdges);
{
  cloneAllEdges = (cloneAllEdges != null) ? cloneAllEdges : true;
  this.beginUpdate();
  try {
    var mapping = new Object();
    this.mergeChildrenImpl(from, to, cloneAllEdges, mapping);
    for (var key in mapping) {
      var cell = mapping[key];
      var terminal = this.getTerminal(cell, true);
      if (terminal != null) {
        terminal = mapping[mxCellPath.create(terminal)];
        this.setTerminal(cell, terminal, true);
      }
      terminal = this.getTerminal(cell, false);
      if (terminal != null) {
        terminal = mapping[mxCellPath.create(terminal)];
        this.setTerminal(cell, terminal, false);
      }
    }
  } finally {
    this.endUpdate();
  }
}
/**
 Function: mergeChildren

 Clones the children of the source cell into the given target cell in
 this model and adds an entry to the mapping that maps from the source
 cell to the target cell with the same id or the clone of the source cell
 that was inserted into this model.
 */
mergeChildrenImpl(from, to, cloneAllEdges, mapping);
{
  this.beginUpdate();
  try {
    var childCount = from.getChildCount();
    for (var i = 0; i < childCount; i++) {
      var cell = from.getChildAt(i);
      if (typeof (cell.getId) == 'function') {
        var id = cell.getId();
        var target = (id != null && (!this.isEdge(cell) || !cloneAllEdges)) ? this.getCell(id) : null;
        if (target == null) {
          var clone = cell.clone();
          clone.setId(id);
          clone.setTerminal(cell.getTerminal(true), true);
          clone.setTerminal(cell.getTerminal(false), false);
          target = to.insert(clone);
          this.cellAdded(target);
        }
        mapping[mxCellPath.create(cell)] = target;
        this.mergeChildrenImpl(cell, target, cloneAllEdges, mapping);
      }
    }
  } finally {
    this.endUpdate();
  }
}
/**
 Function: getParents

 Returns an array that represents the set (no duplicates) of all parents
 for the given array of cells.

 Parameters:

 cells - Array of cells whose parents should be returned.
 */
getParents(cells);
{
  var parents = [];
  if (cells != null) {
    var dict = new mxDictionary();
    for (var i = 0; i < cells.length; i++) {
      var parent = this.getParent(cells[i]);
      if (parent != null && !dict.get(parent)) {
        dict.put(parent, true);
        parents.push(parent);
      }
    }
  }
  return parents;
}
/**
 Function: cloneCell

 Returns a deep clone of the given <mxCell> (including
 the children) which is created using <cloneCells>.

 Parameters:

 cell - <mxCell> to be cloned.
 */
cloneCell(cell);
{
  if (cell != null) {
    return this.cloneCells([cell], true)[0];
  }
  return null;
}
/**
 Function: cloneCells

 Returns an array of clones for the given array of <mxCells>.
 Depending on the value of includeChildren, a deep clone is created for
 each cell. Connections are restored based if the corresponding
 cell is contained in the passed in array.

 Parameters:

 cells - Array of <mxCell> to be cloned.
 includeChildren - Boolean indicating if the cells should be cloned
 with all descendants.
 mapping - Optional mapping for existing clones.
 */
cloneCells(cells, includeChildren, mapping);
{
  mapping = (mapping != null) ? mapping : new Object();
  var clones = [];
  for (var i = 0; i < cells.length; i++) {
    if (cells[i] != null) {
      clones.push(this.cloneCellImpl(cells[i], mapping, includeChildren));
    } else {
      clones.push(null);
    }
  }
  for (var i = 0; i < clones.length; i++) {
    if (clones[i] != null) {
      this.restoreClone(clones[i], cells[i], mapping);
    }
  }
  return clones;
}
/**
 Function: cloneCellImpl

 Inner helper method for cloning cells recursively.
 */
cloneCellImpl(cell, mapping, includeChildren);
{
  var ident = mxObjectIdentity.get(cell);
  var clone = mapping[ident];
  if (clone == null) {
    clone = this.cellCloned(cell);
    mapping[ident] = clone;
    if (includeChildren) {
      var childCount = this.getChildCount(cell);
      for (var i = 0; i < childCount; i++) {
        var cloneChild = this.cloneCellImpl(this.getChildAt(cell, i), mapping, true);
        clone.insert(cloneChild);
      }
    }
  }
  return clone;
}
/**
 Function: cellCloned

 Hook for cloning the cell. This returns cell.clone() or
 any possible exceptions.
 */
cellCloned(cell);
{
  return cell.clone();
}
/**
 Function: restoreClone

 Inner helper method for restoring the connections in
 a network of cloned cells.
 */
restoreClone(clone, cell, mapping);
{
  var source = this.getTerminal(cell, true);
  if (source != null) {
    var tmp = mapping[mxObjectIdentity.get(source)];
    if (tmp != null) {
      tmp.insertEdge(clone, true);
    }
  }
  var target = this.getTerminal(cell, false);
  if (target != null) {
    var tmp = mapping[mxObjectIdentity.get(target)];
    if (tmp != null) {
      tmp.insertEdge(clone, false);
    }
  }
  var childCount = this.getChildCount(clone);
  for (var i = 0; i < childCount; i++) {
    this.restoreClone(this.getChildAt(clone, i), this.getChildAt(cell, i), mapping);
  }
}
/**
 Function: execute

 Carries out a change of the root using
 <mxGraphModel.rootChanged>.
 */
execute();
{
  this.root = this.previous;
  this.previous = this.model.rootChanged(this.previous);
}
/**
 Function: execute

 Changes the parent of <child> using
 <mxGraphModel.parentForCellChanged> and
 removes or restores the cell's
 connections.
 */
execute();
{
  if (this.child != null) {
    var tmp = this.model.getParent(this.child);
    var tmp2 = (tmp != null) ? tmp.getIndex(this.child) : 0;
    if (this.previous == null) {
      this.connect(this.child, false);
    }
    tmp = this.model.parentForCellChanged(this.child, this.previous, this.previousIndex);
    if (this.previous != null) {
      this.connect(this.child, true);
    }
    this.parent = this.previous;
    this.previous = tmp;
    this.index = this.previousIndex;
    this.previousIndex = tmp2;
  }
}
/**
 Function: disconnect

 Disconnects the given cell recursively from its
 terminals and stores the previous terminal in the
 cell's terminals.
 */
connect(cell, isConnect);
{
  isConnect = (isConnect != null) ? isConnect : true;
  var source = cell.getTerminal(true);
  var target = cell.getTerminal(false);
  if (source != null) {
    if (isConnect) {
      this.model.terminalForCellChanged(cell, source, true);
    } else {
      this.model.terminalForCellChanged(cell, null, true);
    }
  }
  if (target != null) {
    if (isConnect) {
      this.model.terminalForCellChanged(cell, target, false);
    } else {
      this.model.terminalForCellChanged(cell, null, false);
    }
  }
  cell.setTerminal(source, true);
  cell.setTerminal(target, false);
  var childCount = this.model.getChildCount(cell);
  for (var i = 0; i < childCount; i++) {
    this.connect(this.model.getChildAt(cell, i), isConnect);
  }
}
/**
 Function: execute

 Changes the terminal of <cell> to <previous> using
 <mxGraphModel.terminalForCellChanged>.
 */
execute();
{
  if (this.cell != null) {
    this.terminal = this.previous;
    this.previous = this.model.terminalForCellChanged(this.cell, this.previous, this.source);
  }
}
/**
 Function: execute

 Changes the value of <cell> to <previous> using
 <mxGraphModel.valueForCellChanged>.
 */
execute();
{
  if (this.cell != null) {
    this.value = this.previous;
    this.previous = this.model.valueForCellChanged(this.cell, this.previous);
  }
}
/**
 Function: execute

 Changes the style of <cell> to <previous> using
 <mxGraphModel.styleForCellChanged>.
 */
execute();
{
  if (this.cell != null) {
    this.style = this.previous;
    this.previous = this.model.styleForCellChanged(this.cell, this.previous);
  }
}
/**
 Function: execute

 Changes the geometry of <cell> ro <previous> using
 <mxGraphModel.geometryForCellChanged>.
 */
execute();
{
  if (this.cell != null) {
    this.geometry = this.previous;
    this.previous = this.model.geometryForCellChanged(this.cell, this.previous);
  }
}
/**
 Function: execute

 Changes the collapsed state of <cell> to <previous> using
 <mxGraphModel.collapsedStateForCellChanged>.
 */
execute();
{
  if (this.cell != null) {
    this.collapsed = this.previous;
    this.previous = this.model.collapsedStateForCellChanged(this.cell, this.previous);
  }
}
/**
 Function: execute

 Changes the visible state of <cell> to <previous> using
 <mxGraphModel.visibleStateForCellChanged>.
 */
execute();
{
  if (this.cell != null) {
    this.visible = this.previous;
    this.previous = this.model.visibleStateForCellChanged(this.cell, this.previous);
  }
}
/**
 Function: execute

 Changes the attribute of the cell's user object by
 using <mxCell.setAttribute>.
 */
execute();
{
  if (this.cell != null) {
    var tmp = this.cell.getAttribute(this.attribute);
    if (this.previous == null) {
      this.cell.value.removeAttribute(this.attribute);
    } else {
      this.cell.setAttribute(this.attribute, this.previous);
    }
    this.previous = tmp;
  }
}
};
