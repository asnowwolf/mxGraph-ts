/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxLayoutManager
 *
 * Implements a layout manager that runs a given layout after any changes to the graph:
 *
 * Example:
 *
 * (code)
 * var layoutMgr = new mxLayoutManager(graph);
 * layoutMgr.getLayout = function(cell)
 * {
 *   return layout;
 * };
 * (end)
 *
 * Event: mxEvent.LAYOUT_CELLS
 *
 * Fires between begin- and endUpdate after all cells have been layouted in
 * <layoutCells>. The <code>cells</code> property contains all cells that have
 * been passed to <layoutCells>.
 *
 * Constructor: mxLayoutManager
 *
 * Constructs a new automatic layout for the given graph.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing graph.
 * @class
 * @class
 */
export class mxLayoutManager extends mxEventSource {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxLayoutManager

   Implements a layout manager that runs a given layout after any changes to the graph:

   Example:

   (code)
   var layoutMgr = new mxLayoutManager(graph);
   layoutMgr.getLayout = function(cell)
   {
       return layout;
    };
   (end)

   Event: mxEvent.LAYOUT_CELLS

   Fires between begin- and endUpdate after all cells have been layouted in
   <layoutCells>. The <code>cells</code> property contains all cells that have
   been passed to <layoutCells>.

   Constructor: mxLayoutManager

   Constructs a new automatic layout for the given graph.

   Arguments:

   graph - Reference to the enclosing graph.
   */
  constructor(graph) {
    this.undoHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled()) {
        this.beforeUndo(evt.getProperty('edit'));
      }
    });
    this.moveHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled()) {
        this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
      }
    });
    this.setGraph(graph);
  }

  /**
   Variable: graph

   Reference to the enclosing <mxGraph>.
   */
  graph = null;
  /**
   Variable: bubbling

   Specifies if the layout should bubble along
   the cell hierarchy. Default is true.
   */
  bubbling = true;
  /**
   Variable: enabled

   Specifies if event handling is enabled. Default is true.
   */
  enabled = true;
  /**
   Variable: updateHandler

   Holds the function that handles the endUpdate event.
   */
  updateHandler = null;
  /**
   Variable: moveHandler

   Holds the function that handles the move event.
   */
  moveHandler = null;

  /**
   Function: isEnabled

   Returns true if events are handled. This implementation
   returns <enabled>.
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   Function: setEnabled

   Enables or disables event handling. This implementation
   updates <enabled>.

   Parameters:

   enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   Function: isBubbling

   Returns true if a layout should bubble, that is, if the parent layout
   should be executed whenever a cell layout (layout of the children of
   a cell) has been executed. This implementation returns <bubbling>.
   */
  isBubbling() {
    return this.bubbling;
  }

  /**
   Function: setBubbling

   Sets <bubbling>.
   */
  setBubbling(value) {
    this.bubbling = value;
  }

  /**
   Function: getGraph

   Returns the graph that this layout operates on.
   */
  getGraph() {
    return this.graph;
  }

  /**
   Function: setGraph

   Sets the graph that the layouts operate on.
   */
  setGraph(graph) {
    if (this.graph != null) {
      var model = this.graph.getModel();
      model.removeListener(this.undoHandler);
      this.graph.removeListener(this.moveHandler);
    }
    this.graph = graph;
    if (this.graph != null) {
      var model = this.graph.getModel();
      model.addListener(mxEvent.BEFORE_UNDO, this.undoHandler);
      this.graph.addListener(mxEvent.MOVE_CELLS, this.moveHandler);
    }
  }

  /**
   Function: getLayout

   Returns the layout to be executed for the given graph and parent.
   */
  getLayout(parent) {
    return null;
  }

  /**
   Function: beforeUndo

   Called from the undoHandler.

   Parameters:

   cell - Array of <mxCells> that have been moved.
   evt - Mouse event that represents the mousedown.
   */
  beforeUndo(undoableEdit) {
    var cells = this.getCellsForChanges(undoableEdit.changes);
    var model = this.getGraph().getModel();
    var tmp = [];
    for (var i = 0; i < cells.length; i++) {
      tmp = tmp.concat(model.getDescendants(cells[i]));
    }
    cells = tmp;
    if (this.isBubbling()) {
      tmp = model.getParents(cells);
      while (tmp.length > 0) {
        cells = cells.concat(tmp);
        tmp = model.getParents(tmp);
      }
    }
    this.executeLayoutForCells(cells);
  }

  /**
   Function: executeLayout

   Executes the given layout on the given parent.
   */
  executeLayoutForCells(cells) {
    var sorted = mxUtils.sortCells(cells, true);
    sorted = sorted.concat(sorted.slice().reverse());
    this.layoutCells(sorted);
  }

  /**
   Function: cellsMoved

   Called from the moveHandler.

   Parameters:

   cell - Array of <mxCells> that have been moved.
   evt - Mouse event that represents the mousedown.
   */
  cellsMoved(cells, evt) {
    if (cells != null && evt != null) {
      var point = mxUtils.convertPoint(this.getGraph().container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      var model = this.getGraph().getModel();
      for (var i = 0; i < cells.length; i++) {
        var parent = model.getParent(cells[i]);
        if (mxUtils.indexOf(cells, parent) < 0) {
          var layout = this.getLayout(parent);
          if (layout != null) {
            layout.moveCell(cells[i], point.x, point.y);
          }
        }
      }
    }
  }

  /**
   Function: getCellsForEdit

   Returns the cells to be layouted for the given sequence of changes.
   */
  getCellsForChanges(changes) {
    var dict = new mxDictionary();
    var result = [];
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      if (change instanceof mxRootChange) {
        return [];
      } else {
        var cells = this.getCellsForChange(change);
        for (var j = 0; j < cells.length; j++) {
          if (cells[j] != null && !dict.get(cells[j])) {
            dict.put(cells[j], true);
            result.push(cells[j]);
          }
        }
      }
    }
    return result;
  }

  /**
   Function: getCellsForChange

   Executes all layouts which have been scheduled during the
   changes.
   */
  getCellsForChange(change) {
    var model = this.getGraph().getModel();
    if (change instanceof mxChildChange) {
      return [change.child, change.previous, model.getParent(change.child)];
    } else if (change instanceof mxTerminalChange || change instanceof mxGeometryChange) {
      return [change.cell, model.getParent(change.cell)];
    } else if (change instanceof mxVisibleChange || change instanceof mxStyleChange) {
      return [change.cell];
    }
    return [];
  }

  /**
   Function: layoutCells

   Executes all layouts which have been scheduled during the
   changes.
   */
  layoutCells(cells) {
    if (cells.length > 0) {
      var model = this.getGraph().getModel();
      model.beginUpdate();
      try {
        var last = null;
        for (var i = 0; i < cells.length; i++) {
          if (cells[i] != model.getRoot() && cells[i] != last) {
            if (this.executeLayout(this.getLayout(cells[i]), cells[i])) {
              last = cells[i];
            }
          }
        }
        this.fireEvent(new mxEventObject(mxEvent.LAYOUT_CELLS, 'cells', cells));
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   Function: executeLayout

   Executes the given layout on the given parent.
   */
  executeLayout(layout, parent) {
    var result = false;
    if (layout != null && parent != null) {
      layout.execute(parent);
      result = true;
    }
    return result;
  }

  /**
   Function: destroy

   Removes all handlers from the <graph> and deletes the reference to it.
   */
  destroy() {
    this.setGraph(null);
  }
};
