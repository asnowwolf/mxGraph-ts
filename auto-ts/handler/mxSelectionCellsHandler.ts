/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxSelectionCellsHandler
 *
 * An event handler that manages cell handlers and invokes their mouse event
 * processing functions.
 *
 * Group: Events
 *
 * Event: mxEvent.ADD
 *
 * Fires if a cell has been added to the selection. The <code>state</code>
 * property contains the <mxCellState> that has been added.
 *
 * Event: mxEvent.REMOVE
 *
 * Fires if a cell has been remove from the selection. The <code>state</code>
 * property contains the <mxCellState> that has been removed.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * @class
 */
export class mxSelectionCellsHandler extends mxEventSource {
    /**
     Copyright (c) 2006-2015, JGraph Ltd
     Copyright (c) 2006-2015, Gaudenz Alder
     */
    /**
     Class: mxSelectionCellsHandler

     An event handler that manages cell handlers and invokes their mouse event
     processing functions.

     Group: Events

     Event: mxEvent.ADD

     Fires if a cell has been added to the selection. The <code>state</code>
     property contains the <mxCellState> that has been added.

     Event: mxEvent.REMOVE

     Fires if a cell has been remove from the selection. The <code>state</code>
     property contains the <mxCellState> that has been removed.

     Parameters:

     graph - Reference to the enclosing <mxGraph>.
     */
    constructor(graph) {
        mxEventSource.call(this);
        this.graph = graph;
        this.handlers = new mxDictionary();
        this.graph.addMouseListener(this);
        this.refreshHandler = mxUtils.bind(this, function (sender, evt) {
            if (this.isEnabled()) {
                this.refresh();
            }
        });
        this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.refreshHandler);
        this.graph.getModel().addListener(mxEvent.CHANGE, this.refreshHandler);
        this.graph.getView().addListener(mxEvent.SCALE, this.refreshHandler);
        this.graph.getView().addListener(mxEvent.TRANSLATE, this.refreshHandler);
        this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.refreshHandler);
        this.graph.getView().addListener(mxEvent.DOWN, this.refreshHandler);
        this.graph.getView().addListener(mxEvent.UP, this.refreshHandler);
    }

    /**
     Variable: graph

     Reference to the enclosing <mxGraph>.
     */
    graph = null;
    /**
     Variable: enabled

     Specifies if events are handled. Default is true.
     */
    enabled = true;
    /**
     Variable: refreshHandler

     Keeps a reference to an event listener for later removal.
     */
    refreshHandler = null;
    /**
     Variable: maxHandlers

     Defines the maximum number of handlers to paint individually. Default is 100.
     */
    maxHandlers = 100;
    /**
     Variable: handlers

     <mxDictionary> that maps from cells to handlers.
     */
    handlers = null;

    /**
     Function: isEnabled

     Returns <enabled>.
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     Function: setEnabled

     Sets <enabled>.
     */
    setEnabled(value) {
        this.enabled = value;
    }

    /**
     Function: getHandler

     Returns the handler for the given cell.
     */
    getHandler(cell) {
        return this.handlers.get(cell);
    }

    /**
     Function: reset

     Resets all handlers.
     */
    reset() {
        this.handlers.visit(function (key, handler) {
            handler.reset.apply(handler);
        });
    }

    /**
     Function: refresh

     Reloads or updates all handlers.
     */
    refresh() {
        var oldHandlers = this.handlers;
        this.handlers = new mxDictionary();
        var tmp = this.graph.getSelectionCells();
        for (var i = 0; i < tmp.length; i++) {
            var state = this.graph.view.getState(tmp[i]);
            if (state != null) {
                var handler = oldHandlers.remove(tmp[i]);
                if (handler != null) {
                    if (handler.state != state) {
                        handler.destroy();
                        handler = null;
                    } else if (!this.isHandlerActive(handler)) {
                        if (handler.refresh != null) {
                            handler.refresh();
                        }
                        handler.redraw();
                    }
                }
                if (handler == null) {
                    handler = this.graph.createHandler(state);
                    this.fireEvent(new mxEventObject(mxEvent.ADD, 'state', state));
                }
                if (handler != null) {
                    this.handlers.put(tmp[i], handler);
                }
            }
        }
        oldHandlers.visit(mxUtils.bind(this, function (key, handler) {
            this.fireEvent(new mxEventObject(mxEvent.REMOVE, 'state', handler.state));
            handler.destroy();
        }));
    }

    /**
     Function: isHandlerActive

     Returns true if the given handler is active and should not be redrawn.
     */
    isHandlerActive(handler) {
        return handler.index != null;
    }

    /**
     Function: updateHandler

     Updates the handler for the given shape if one exists.
     */
    updateHandler(state) {
        var handler = this.handlers.remove(state.cell);
        if (handler != null) {
            var index = handler.index;
            var x = handler.startX;
            var y = handler.startY;
            handler.destroy();
            handler = this.graph.createHandler(state);
            if (handler != null) {
                this.handlers.put(state.cell, handler);
                if (index != null && x != null && y != null) {
                    handler.start(x, y, index);
                }
            }
        }
    }

    /**
     Function: mouseDown

     Redirects the given event to the handlers.
     */
    mouseDown(sender, me) {
        if (this.graph.isEnabled() && this.isEnabled()) {
            var args = [sender, me];
            this.handlers.visit(function (key, handler) {
                handler.mouseDown.apply(handler, args);
            });
        }
    }

    /**
     Function: mouseMove

     Redirects the given event to the handlers.
     */
    mouseMove(sender, me) {
        if (this.graph.isEnabled() && this.isEnabled()) {
            var args = [sender, me];
            this.handlers.visit(function (key, handler) {
                handler.mouseMove.apply(handler, args);
            });
        }
    }

    /**
     Function: mouseUp

     Redirects the given event to the handlers.
     */
    mouseUp(sender, me) {
        if (this.graph.isEnabled() && this.isEnabled()) {
            var args = [sender, me];
            this.handlers.visit(function (key, handler) {
                handler.mouseUp.apply(handler, args);
            });
        }
    }

    /**
     Function: destroy

     Destroys the handler and all its resources and DOM nodes.
     */
    destroy() {
        this.graph.removeMouseListener(this);
        if (this.refreshHandler != null) {
            this.graph.getSelectionModel().removeListener(this.refreshHandler);
            this.graph.getModel().removeListener(this.refreshHandler);
            this.graph.getView().removeListener(this.refreshHandler);
            this.refreshHandler = null;
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
