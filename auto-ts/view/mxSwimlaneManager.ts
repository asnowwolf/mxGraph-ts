/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxSwimlaneManager
 *
 * Manager for swimlanes and nested swimlanes that sets the size of newly added
 * swimlanes to that of their siblings, and propagates changes to the size of a
 * swimlane to its siblings, if <siblings> is true, and its ancestors, if
 * <bubbling> is true.
 *
 * Constructor: mxSwimlaneManager
 *
 * Constructs a new swimlane manager for the given graph.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing graph.
 * @class
 */
export class mxSwimlaneManager extends mxEventSource {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxSwimlaneManager

   Manager for swimlanes and nested swimlanes that sets the size of newly added
   swimlanes to that of their siblings, and propagates changes to the size of a
   swimlane to its siblings, if <siblings> is true, and its ancestors, if
   <bubbling> is true.

   Constructor: mxSwimlaneManager

   Constructs a new swimlane manager for the given graph.

   Arguments:

   graph - Reference to the enclosing graph.
   */
  constructor(graph, horizontal, addEnabled, resizeEnabled) {
    this.horizontal = (horizontal != null) ? horizontal : true;
    this.addEnabled = (addEnabled != null) ? addEnabled : true;
    this.resizeEnabled = (resizeEnabled != null) ? resizeEnabled : true;
    this.addHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled() && this.isAddEnabled()) {
        this.cellsAdded(evt.getProperty('cells'));
      }
    });
    this.resizeHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.isEnabled() && this.isResizeEnabled()) {
        this.cellsResized(evt.getProperty('cells'));
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
   Variable: enabled

   Specifies if event handling is enabled. Default is true.
   */
  enabled = true;
  /**
   Variable: horizontal

   Specifies the orientation of the swimlanes. Default is true.
   */
  horizontal = true;
  /**
   Variable: addEnabled

   Specifies if newly added cells should be resized to match the size of their
   existing siblings. Default is true.
   */
  addEnabled = true;
  /**
   Variable: resizeEnabled

   Specifies if resizing of swimlanes should be handled. Default is true.
   */
  resizeEnabled = true;
  /**
   Variable: moveHandler

   Holds the function that handles the move event.
   */
  addHandler = null;
  /**
   Variable: moveHandler

   Holds the function that handles the move event.
   */
  resizeHandler = null;

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
  setEnabled(value) {
    this.enabled = value;
  }

  /**
   Function: isHorizontal

   Returns <horizontal>.
   */
  isHorizontal() {
    return this.horizontal;
  }

  /**
   Function: setHorizontal

   Sets <horizontal>.
   */
  setHorizontal(value) {
    this.horizontal = value;
  }

  /**
   Function: isAddEnabled

   Returns <addEnabled>.
   */
  isAddEnabled() {
    return this.addEnabled;
  }

  /**
   Function: setAddEnabled

   Sets <addEnabled>.
   */
  setAddEnabled(value) {
    this.addEnabled = value;
  }

  /**
   Function: isResizeEnabled

   Returns <resizeEnabled>.
   */
  isResizeEnabled() {
    return this.resizeEnabled;
  }

  /**
   Function: setResizeEnabled

   Sets <resizeEnabled>.
   */
  setResizeEnabled(value) {
    this.resizeEnabled = value;
  }

  /**
   Function: getGraph

   Returns the graph that this manager operates on.
   */
  getGraph() {
    return this.graph;
  }

  /**
   Function: setGraph

   Sets the graph that the manager operates on.
   */
  setGraph(graph) {
    if (this.graph != null) {
      this.graph.removeListener(this.addHandler);
      this.graph.removeListener(this.resizeHandler);
    }
    this.graph = graph;
    if (this.graph != null) {
      this.graph.addListener(mxEvent.ADD_CELLS, this.addHandler);
      this.graph.addListener(mxEvent.CELLS_RESIZED, this.resizeHandler);
    }
  }

  /**
   Function: isSwimlaneIgnored

   Returns true if the given swimlane should be ignored.
   */
  isSwimlaneIgnored(swimlane) {
    return !this.getGraph().isSwimlane(swimlane);
  }

  /**
   Function: isCellHorizontal

   Returns true if the given cell is horizontal. If the given cell is not a
   swimlane, then the global orientation is returned.
   */
  isCellHorizontal(cell) {
    if (this.graph.isSwimlane(cell)) {
      var style = this.graph.getCellStyle(cell);
      return mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, 1) == 1;
    }
    return !this.isHorizontal();
  }

  /**
   Function: cellsAdded

   Called if any cells have been added.

   Parameters:

   cell - Array of <mxCells> that have been added.
   */
  cellsAdded(cells) {
    if (cells != null) {
      var model = this.getGraph().getModel();
      model.beginUpdate();
      try {
        for (var i = 0; i < cells.length; i++) {
          if (!this.isSwimlaneIgnored(cells[i])) {
            this.swimlaneAdded(cells[i]);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   Function: swimlaneAdded

   Updates the size of the given swimlane to match that of any existing
   siblings swimlanes.

   Parameters:

   swimlane - <mxCell> that represents the new swimlane.
   */
  swimlaneAdded(swimlane) {
    var model = this.getGraph().getModel();
    var parent = model.getParent(swimlane);
    var childCount = model.getChildCount(parent);
    var geo = null;
    for (var i = 0; i < childCount; i++) {
      var child = model.getChildAt(parent, i);
      if (child != swimlane && !this.isSwimlaneIgnored(child)) {
        geo = model.getGeometry(child);
        if (geo != null) {
          break;
        }
      }
    }
    if (geo != null) {
      var parentHorizontal = (parent != null) ? this.isCellHorizontal(parent) : this.horizontal;
      this.resizeSwimlane(swimlane, geo.width, geo.height, parentHorizontal);
    }
  }

  /**
   Function: cellsResized

   Called if any cells have been resizes. Calls <swimlaneResized> for all
   swimlanes where <isSwimlaneIgnored> returns false.

   Parameters:

   cells - Array of <mxCells> whose size was changed.
   */
  cellsResized(cells) {
    if (cells != null) {
      var model = this.getGraph().getModel();
      model.beginUpdate();
      try {
        for (var i = 0; i < cells.length; i++) {
          if (!this.isSwimlaneIgnored(cells[i])) {
            var geo = model.getGeometry(cells[i]);
            if (geo != null) {
              var size = new mxRectangle(0, 0, geo.width, geo.height);
              var top = cells[i];
              var current = top;
              while (current != null) {
                top = current;
                current = model.getParent(current);
                var tmp = (this.graph.isSwimlane(current)) ? this.graph.getStartSize(current) : new mxRectangle();
                size.width += tmp.width;
                size.height += tmp.height;
              }
              var parentHorizontal = (current != null) ? this.isCellHorizontal(current) : this.horizontal;
              this.resizeSwimlane(top, size.width, size.height, parentHorizontal);
            }
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   Function: resizeSwimlane

   Called from <cellsResized> for all swimlanes that are not ignored to update
   the size of the siblings and the size of the parent swimlanes, recursively,
   if <bubbling> is true.

   Parameters:

   swimlane - <mxCell> whose size has changed.
   */
  resizeSwimlane(swimlane, w, h, parentHorizontal) {
    var model = this.getGraph().getModel();
    model.beginUpdate();
    try {
      var horizontal = this.isCellHorizontal(swimlane);
      if (!this.isSwimlaneIgnored(swimlane)) {
        var geo = model.getGeometry(swimlane);
        if (geo != null) {
          if ((parentHorizontal && geo.height != h) || (!parentHorizontal && geo.width != w)) {
            geo = geo.clone();
            if (parentHorizontal) {
              geo.height = h;
            } else {
              geo.width = w;
            }
            model.setGeometry(swimlane, geo);
          }
        }
      }
      var tmp = (this.graph.isSwimlane(swimlane)) ? this.graph.getStartSize(swimlane) : new mxRectangle();
      w -= tmp.width;
      h -= tmp.height;
      var childCount = model.getChildCount(swimlane);
      for (var i = 0; i < childCount; i++) {
        var child = model.getChildAt(swimlane, i);
        this.resizeSwimlane(child, w, h, horizontal);
      }
    } finally {
      model.endUpdate();
    }
  }

  /**
   Function: destroy

   Removes all handlers from the <graph> and deletes the reference to it.
   */
  destroy() {
    this.setGraph(null);
  }
};
