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
 */
export class mxSelectionCellsHandler {
  graph: any;
  handlers: mxDictionary;
  refreshHandler: Function;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: maxHandlers
   *
   * Defines the maximum number of handlers to paint individually. Default is 100.
   * @example 100
   */
  maxHandlers: number;

  constructor(graph: any) {
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
   * Function: isEnabled
   *
   * Returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Sets <enabled>.
   */
  setEnabled(value: any): void {
    this.enabled = value;
  }

  /**
   * Function: getHandler
   *
   * Returns the handler for the given cell.
   */
  getHandler(cell: mxCell): Function {
    return this.handlers.get(cell);
  }

  /**
   * Function: reset
   *
   * Resets all handlers.
   */
  reset(): void {
    this.handlers.visit(function (key, handler) {
      handler.reset.apply(handler);
    });
  }

  /**
   * Function: refresh
   *
   * Reloads or updates all handlers.
   */
  refresh(): void {
    const oldHandlers = this.handlers;
    this.handlers = new mxDictionary();
    const tmp = this.graph.getSelectionCells();
    for (let i = 0; i < tmp.length; i++) {
      const state = this.graph.view.getState(tmp[i]);
      if (state != null) {
        let handler = oldHandlers.remove(tmp[i]);
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
   * Function: isHandlerActive
   *
   * Returns true if the given handler is active and should not be redrawn.
   */
  isHandlerActive(handler: Function): boolean {
    return handler.index != null;
  }

  /**
   * Function: updateHandler
   *
   * Updates the handler for the given shape if one exists.
   */
  updateHandler(state: any): void {
    let handler = this.handlers.remove(state.cell);
    if (handler != null) {
      const index = handler.index;
      const x = handler.startX;
      const y = handler.startY;
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
   * Function: mouseDown
   *
   * Redirects the given event to the handlers.
   */
  mouseDown(sender: any, me: any): void {
    if (this.graph.isEnabled() && this.isEnabled()) {
      const args = [sender, me];
      this.handlers.visit(function (key, handler) {
        handler.mouseDown.apply(handler, args);
      });
    }
  }

  /**
   * Function: mouseMove
   *
   * Redirects the given event to the handlers.
   */
  mouseMove(sender: any, me: any): void {
    if (this.graph.isEnabled() && this.isEnabled()) {
      const args = [sender, me];
      this.handlers.visit(function (key, handler) {
        handler.mouseMove.apply(handler, args);
      });
    }
  }

  /**
   * Function: mouseUp
   *
   * Redirects the given event to the handlers.
   */
  mouseUp(sender: any, me: any): void {
    if (this.graph.isEnabled() && this.isEnabled()) {
      const args = [sender, me];
      this.handlers.visit(function (key, handler) {
        handler.mouseUp.apply(handler, args);
      });
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);
    if (this.refreshHandler != null) {
      this.graph.getSelectionModel().removeListener(this.refreshHandler);
      this.graph.getModel().removeListener(this.refreshHandler);
      this.graph.getView().removeListener(this.refreshHandler);
      this.refreshHandler = null;
    }
  }
}
