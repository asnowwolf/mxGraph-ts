/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxDefaultToolbar
 *
 * Toolbar for the editor. This modifies the state of the graph
 * or inserts new cells upon mouse clicks.
 *
 * Example:
 *
 * Create a toolbar with a button to copy the selection into the clipboard,
 * and a combo box with one action to paste the selection from the clipboard
 * into the graph.
 *
 * (code)
 * var toolbar = new mxDefaultToolbar(container, editor);
 * toolbar.addItem('Copy', null, 'copy');
 *
 * var combo = toolbar.addActionCombo('More actions...');
 * toolbar.addActionOption(combo, 'Paste', 'paste');
 * (end)
 *
 * Codec:
 *
 * This class uses the <mxDefaultToolbarCodec> to read configuration
 * data into an existing instance. See <mxDefaultToolbarCodec> for a
 * description of the configuration format.
 *
 * Constructor: mxDefaultToolbar
 *
 * Constructs a new toolbar for the given container and editor. The
 * container and editor may be null if a prototypical instance for a
 * <mxDefaultKeyHandlerCodec> is created.
 *
 * Parameters:
 *
 * container - DOM node that contains the toolbar.
 * editor - Reference to the enclosing <mxEditor>.
 * @class
 */
export class mxDefaultToolbar {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxDefaultToolbar

   Toolbar for the editor. This modifies the state of the graph
   or inserts new cells upon mouse clicks.

   Example:

   Create a toolbar with a button to copy the selection into the clipboard,
   and a combo box with one action to paste the selection from the clipboard
   into the graph.

   (code)
   var toolbar = new mxDefaultToolbar(container, editor);
   toolbar.addItem('Copy', null, 'copy');

   var combo = toolbar.addActionCombo('More actions...');
   toolbar.addActionOption(combo, 'Paste', 'paste');
   (end)

   Codec:

   This class uses the <mxDefaultToolbarCodec> to read configuration
   data into an existing instance. See <mxDefaultToolbarCodec> for a
   description of the configuration format.

   Constructor: mxDefaultToolbar

   Constructs a new toolbar for the given container and editor. The
   container and editor may be null if a prototypical instance for a
   <mxDefaultKeyHandlerCodec> is created.

   Parameters:

   container - DOM node that contains the toolbar.
   editor - Reference to the enclosing <mxEditor>.
   */
  constructor(container, editor) {
    this.editor = editor;
    if (container != null && editor != null) {
      this.init(container);
    }
  }

  /**
   Variable: editor

   Reference to the enclosing <mxEditor>.
   */
  editor = null;
  /**
   Variable: toolbar

   Holds the internal <mxToolbar>.
   */
  toolbar = null;
  /**
   Variable: resetHandler

   Reference to the function used to reset the <toolbar>.
   */
  resetHandler = null;
  /**
   Variable: spacing

   Defines the spacing between existing and new vertices in
   gridSize units when a new vertex is dropped on an existing
   cell. Default is 4 (40 pixels).
   */
  spacing = 4;
  /**
   Variable: connectOnDrop

   Specifies if elements should be connected if new cells are dropped onto
   connectable elements. Default is false.
   */
  connectOnDrop = false;

  /**
   Variable: init

   Constructs the <toolbar> for the given container and installs a listener
   that updates the <mxEditor.insertFunction> on <editor> if an item is
   selected in the toolbar. This assumes that <editor> is not null.

   Parameters:

   container - DOM node that contains the toolbar.
   */
  init(container) {
    if (container != null) {
      this.toolbar = new mxToolbar(container);
      this.toolbar.addListener(mxEvent.SELECT, mxUtils.bind(this, function (sender, evt) {
        var funct = evt.getProperty('function');
        if (funct != null) {
          this.editor.insertFunction = mxUtils.bind(this, function () {
            funct.apply(this, arguments);
            this.toolbar.resetMode();
          });
        } else {
          this.editor.insertFunction = null;
        }
      }));
      this.resetHandler = mxUtils.bind(this, function () {
        if (this.toolbar != null) {
          this.toolbar.resetMode(true);
        }
      });
      this.editor.graph.addListener(mxEvent.DOUBLE_CLICK, this.resetHandler);
      this.editor.addListener(mxEvent.ESCAPE, this.resetHandler);
    }
  }

  /**
   Function: addItem

   Adds a new item that executes the given action in <editor>. The title,
   icon and pressedIcon are used to display the toolbar item.

   Parameters:

   title - String that represents the title (tooltip) for the item.
   icon - URL of the icon to be used for displaying the item.
   action - Name of the action to execute when the item is clicked.
   pressed - Optional URL of the icon for the pressed state.
   */
  addItem(title, icon, action, pressed) {
    var clickHandler = mxUtils.bind(this, function () {
      if (action != null && action.length > 0) {
        this.editor.execute(action);
      }
    });
    return this.toolbar.addItem(title, icon, clickHandler, pressed);
  }

  /**
   Function: addSeparator

   Adds a vertical separator using the optional icon.

   Parameters:

   icon - Optional URL of the icon that represents the vertical separator.
   Default is <mxClient.imageBasePath> + '/separator.gif'.
   */
  addSeparator(icon) {
    icon = icon || mxClient.imageBasePath + '/separator.gif';
    this.toolbar.addSeparator(icon);
  }

  /**
   Function: addCombo

   Helper method to invoke <mxToolbar.addCombo> on <toolbar> and return the
   resulting DOM node.
   */
  addCombo() {
    return this.toolbar.addCombo();
  }

  /**
   Function: addActionCombo

   Helper method to invoke <mxToolbar.addActionCombo> on <toolbar> using
   the given title and return the resulting DOM node.

   Parameters:

   title - String that represents the title of the combo.
   */
  addActionCombo(title) {
    return this.toolbar.addActionCombo(title);
  }

  /**
   Function: addActionOption

   Binds the given action to a option with the specified label in the
   given combo. Combo is an object returned from an earlier call to
   <addCombo> or <addActionCombo>.

   Parameters:

   combo - DOM node that represents the combo box.
   title - String that represents the title of the combo.
   action - Name of the action to execute in <editor>.
   */
  addActionOption(combo, title, action) {
    var clickHandler = mxUtils.bind(this, function () {
      this.editor.execute(action);
    });
    this.addOption(combo, title, clickHandler);
  }

  /**
   Function: addOption

   Helper method to invoke <mxToolbar.addOption> on <toolbar> and return
   the resulting DOM node that represents the option.

   Parameters:

   combo - DOM node that represents the combo box.
   title - String that represents the title of the combo.
   value - Object that represents the value of the option.
   */
  addOption(combo, title, value) {
    return this.toolbar.addOption(combo, title, value);
  }

  /**
   Function: addMode

   Creates an item for selecting the given mode in the <editor>'s graph.
   Supported modenames are select, connect and pan.

   Parameters:

   title - String that represents the title of the item.
   icon - URL of the icon that represents the item.
   mode - String that represents the mode name to be used in
   <mxEditor.setMode>.
   pressed - Optional URL of the icon that represents the pressed state.
   funct - Optional JavaScript function that takes the <mxEditor> as the
   first and only argument that is executed after the mode has been
   selected.
   */
  addMode(title, icon, mode, pressed, funct) {
    var clickHandler = mxUtils.bind(this, function () {
      this.editor.setMode(mode);
      if (funct != null) {
        funct(this.editor);
      }
    });
    return this.toolbar.addSwitchMode(title, icon, clickHandler, pressed);
  }

  /**
   Function: addPrototype

   Creates an item for inserting a clone of the specified prototype cell into
   the <editor>'s graph. The ptype may either be a cell or a function that
   returns a cell.

   Parameters:

   title - String that represents the title of the item.
   icon - URL of the icon that represents the item.
   ptype - Function or object that represents the prototype cell. If ptype
   is a function then it is invoked with no arguments to create new
   instances.
   pressed - Optional URL of the icon that represents the pressed state.
   insert - Optional JavaScript function that handles an insert of the new
   cell. This function takes the <mxEditor>, new cell to be inserted, mouse
   event and optional <mxCell> under the mouse pointer as arguments.
   toggle - Optional boolean that specifies if the item can be toggled.
   Default is true.
   */
  addPrototype(title, icon, ptype, pressed, insert, toggle) {
    var factory = mxUtils.bind(this, function () {
      if (typeof (ptype) == 'function') {
        return ptype();
      } else if (ptype != null) {
        return this.editor.graph.cloneCell(ptype);
      }
      return null;
    });
    var clickHandler = mxUtils.bind(this, function (evt, cell) {
      if (typeof (insert) == 'function') {
        insert(this.editor, factory(), evt, cell);
      } else {
        this.drop(factory(), evt, cell);
      }
      this.toolbar.resetMode();
      mxEvent.consume(evt);
    });
    var img = this.toolbar.addMode(title, icon, clickHandler, pressed, null, toggle);
    var dropHandler = function (graph, evt, cell) {
      clickHandler(evt, cell);
    };
    this.installDropHandler(img, dropHandler);
    return img;
  }

  /**
   Function: drop

   Handles a drop from a toolbar item to the graph. The given vertex
   represents the new cell to be inserted. This invokes <insert> or
   <connect> depending on the given target cell.

   Parameters:

   vertex - <mxCell> to be inserted.
   evt - Mouse event that represents the drop.
   target - Optional <mxCell> that represents the drop target.
   */
  drop(vertex, evt, target) {
    var graph = this.editor.graph;
    var model = graph.getModel();
    if (target == null || model.isEdge(target) || !this.connectOnDrop || !graph.isCellConnectable(target)) {
      while (target != null && !graph.isValidDropTarget(target, [vertex], evt)) {
        target = model.getParent(target);
      }
      this.insert(vertex, evt, target);
    } else {
      this.connect(vertex, evt, target);
    }
  }

  /**
   Function: insert

   Handles a drop by inserting the given vertex into the given parent cell
   or the default parent if no parent is specified.

   Parameters:

   vertex - <mxCell> to be inserted.
   evt - Mouse event that represents the drop.
   parent - Optional <mxCell> that represents the parent.
   */
  insert(vertex, evt, target) {
    var graph = this.editor.graph;
    if (graph.canImportCell(vertex)) {
      var x = mxEvent.getClientX(evt);
      var y = mxEvent.getClientY(evt);
      var pt = mxUtils.convertPoint(graph.container, x, y);
      if (graph.isSplitEnabled() && graph.isSplitTarget(target, [vertex], evt)) {
        return graph.splitEdge(target, [vertex], null, pt.x, pt.y);
      } else {
        return this.editor.addVertex(target, vertex, pt.x, pt.y);
      }
    }
    return null;
  }

  /**
   Function: connect

   Handles a drop by connecting the given vertex to the given source cell.

   vertex - <mxCell> to be inserted.
   evt - Mouse event that represents the drop.
   source - Optional <mxCell> that represents the source terminal.
   */
  connect(vertex, evt, source) {
    var graph = this.editor.graph;
    var model = graph.getModel();
    if (source != null && graph.isCellConnectable(vertex) && graph.isEdgeValid(null, source, vertex)) {
      var edge = null;
      model.beginUpdate();
      try {
        var geo = model.getGeometry(source);
        var g = model.getGeometry(vertex).clone();
        g.x = geo.x + (geo.width - g.width) / 2;
        g.y = geo.y + (geo.height - g.height) / 2;
        var step = this.spacing * graph.gridSize;
        var dist = model.getDirectedEdgeCount(source, true) * 20;
        if (this.editor.horizontalFlow) {
          g.x += (g.width + geo.width) / 2 + step + dist;
        } else {
          g.y += (g.height + geo.height) / 2 + step + dist;
        }
        vertex.setGeometry(g);
        var parent = model.getParent(source);
        graph.addCell(vertex, parent);
        graph.constrainChild(vertex);
        edge = this.editor.createEdge(source, vertex);
        if (model.getGeometry(edge) == null) {
          var edgeGeometry = new mxGeometry();
          edgeGeometry.relative = true;
          model.setGeometry(edge, edgeGeometry);
        }
        graph.addEdge(edge, parent, source, vertex);
      } finally {
        model.endUpdate();
      }
      graph.setSelectionCells([vertex, edge]);
      graph.scrollCellToVisible(vertex);
    }
  }

  /**
   Function: installDropHandler

   Makes the given img draggable using the given function for handling a
   drop event.

   Parameters:

   img - DOM node that represents the image.
   dropHandler - Function that handles a drop of the image.
   */
  installDropHandler(img, dropHandler) {
    var sprite = document.createElement('img');
    sprite.setAttribute('src', img.getAttribute('src'));
    var loader = mxUtils.bind(this, function (evt) {
      sprite.style.width = (2 * img.offsetWidth) + 'px';
      sprite.style.height = (2 * img.offsetHeight) + 'px';
      mxUtils.makeDraggable(img, this.editor.graph, dropHandler, sprite);
      mxEvent.removeListener(sprite, 'load', loader);
    });
    if (mxClient.IS_IE) {
      loader();
    } else {
      mxEvent.addListener(sprite, 'load', loader);
    }
  }

  /**
   Function: destroy

   Destroys the <toolbar> associated with this object and removes all
   installed listeners. This does normally not need to be called, the
   <toolbar> is destroyed automatically when the window unloads (in IE) by
   <mxEditor>.
   */
  destroy() {
    if (this.resetHandler != null) {
      this.editor.graph.removeListener('dblclick', this.resetHandler);
      this.editor.removeListener('escape', this.resetHandler);
      this.resetHandler = null;
    }
    if (this.toolbar != null) {
      this.toolbar.destroy();
      this.toolbar = null;
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
;
