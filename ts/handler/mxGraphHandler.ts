/**
 * Class: mxGraphHandler
 *
 * Graph event handler that handles selection. Individual cells are handled
 * separately using <mxVertexHandler> or one of the edge handlers. These
 * handlers are created using <mxGraph.createHandler> in
 * <mxGraphSelectionModel.cellAdded>.
 *
 * To avoid the container to scroll a moved cell into view, set
 * <scrollAfterMove> to false.
 *
 * Constructor: mxGraphHandler
 *
 * Constructs an event handler that creates handles for the
 * selection cells.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 */
import { mxCell } from '../model/mxCell';
import { mxClient } from '../mxClient';
import { mxRectangleShape } from '../shape/mxRectangleShape';
import { mxConstants } from '../util/mxConstants';
import { mxDictionary } from '../util/mxDictionary';
import { mxEvent } from '../util/mxEvent';
import { mxGuide } from '../util/mxGuide';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxCellHighlight } from './mxCellHighlight';

export class mxGraphHandler {
  constructor(graph: mxGraph) {
    this.graph = graph;
    this.graph.addMouseListener(this);
    this.panHandler = mxUtils.bind(this, function () {
      this.updatePreviewShape();
      this.updateHint();
    });
    this.graph.addListener(mxEvent.PAN, this.panHandler);
    this.escapeHandler = mxUtils.bind(this, function (sender, evt) {
      this.reset();
    });
    this.graph.addListener(mxEvent.ESCAPE, this.escapeHandler);
    this.refreshHandler = mxUtils.bind(this, function (sender, evt) {
      if (!!this.first) {
        try {
          this.bounds = this.graph.getView().getBounds(this.cells);
          this.pBounds = this.getPreviewBounds(this.cells);
          this.updatePreviewShape();
        } catch (e) {
          this.reset();
        }
      }
    });
    this.graph.getModel().addListener(mxEvent.CHANGE, this.refreshHandler);
  }

  graph: mxGraph;
  panHandler: Function;
  escapeHandler: Function;
  refreshHandler: Function;
  bounds: any;
  pBounds: any;
  /**
   * Variable: maxCells
   *
   * Defines the maximum number of cells to paint subhandles
   * for. Default is 50 for Firefox and 20 for IE. Set this
   * to 0 if you want an unlimited number of handles to be
   * displayed. This is only recommended if the number of
   * cells in the graph is limited to a small number, eg.
   * 500.
   */
  maxCells: any;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: highlightEnabled
   *
   * Specifies if drop targets under the mouse should be enabled. Default is
   * true.
   * @example true
   */
  highlightEnabled: boolean;
  /**
   * Variable: cloneEnabled
   *
   * Specifies if cloning by control-drag is enabled. Default is true.
   * @example true
   */
  cloneEnabled: boolean;
  /**
   * Variable: moveEnabled
   *
   * Specifies if moving is enabled. Default is true.
   * @example true
   */
  moveEnabled: boolean;
  /**
   * Variable: guidesEnabled
   *
   * Specifies if other cells should be used for snapping the right, center or
   * left side of the current selection. Default is false.
   */
  guidesEnabled: boolean;
  /**
   * Variable: guide
   *
   * Holds the <mxGuide> instance that is used for alignment.
   */
  guide: any;
  /**
   * Variable: currentDx
   *
   * Stores the x-coordinate of the current mouse move.
   */
  currentDx: any;
  /**
   * Variable: currentDy
   *
   * Stores the y-coordinate of the current mouse move.
   */
  currentDy: any;
  /**
   * Variable: updateCursor
   *
   * Specifies if a move cursor should be shown if the mouse is over a movable
   * cell. Default is true.
   * @example true
   */
  updateCursor: boolean;
  /**
   * Variable: selectEnabled
   *
   * Specifies if selecting is enabled. Default is true.
   * @example true
   */
  selectEnabled: boolean;
  /**
   * Variable: removeCellsFromParent
   *
   * Specifies if cells may be moved out of their parents. Default is true.
   * @example true
   */
  removeCellsFromParent: boolean;
  /**
   * Variable: removeEmptyParents
   *
   * If empty parents should be removed from the model after all child cells
   * have been moved out. Default is true.
   */
  removeEmptyParents: boolean;
  /**
   * Variable: connectOnDrop
   *
   * Specifies if drop events are interpreted as new connections if no other
   * drop action is defined. Default is false.
   */
  connectOnDrop: boolean;
  /**
   * Variable: scrollOnMove
   *
   * Specifies if the view should be scrolled so that a moved cell is
   * visible. Default is true.
   * @example true
   */
  scrollOnMove: boolean;
  /**
   * Variable: minimumSize
   *
   * Specifies the minimum number of pixels for the width and height of a
   * selection border. Default is 6.
   * @example 6
   */
  minimumSize: number;
  /**
   * Variable: previewColor
   *
   * Specifies the color of the preview shape. Default is black.
   * @example black
   */
  previewColor: string;
  /**
   * Variable: htmlPreview
   *
   * Specifies if the graph container should be used for preview. If this is used
   * then drop target detection relies entirely on <mxGraph.getCellAt> because
   * the HTML preview does not "let events through". Default is false.
   */
  htmlPreview: boolean;
  /**
   * Variable: shape
   *
   * Reference to the <mxShape> that represents the preview.
   */
  shape: any;
  /**
   * Variable: scaleGrid
   *
   * Specifies if the grid should be scaled. Default is false.
   */
  scaleGrid: boolean;
  /**
   * Variable: rotationEnabled
   *
   * Specifies if the bounding box should allow for rotation. Default is true.
   * @example true
   */
  rotationEnabled: boolean;
  delayedSelection: any;
  cell: mxCell;
  /**
   * @example true
   */
  cellWasClicked: boolean;
  first: any;
  cells: mxCell[];
  highlight: any;
  target: string;
  guides: any;

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
   * Function: isCloneEnabled
   *
   * Returns <cloneEnabled>.
   */
  isCloneEnabled(): boolean {
    return this.cloneEnabled;
  }

  /**
   * Function: setCloneEnabled
   *
   * Sets <cloneEnabled>.
   *
   * Parameters:
   *
   * value - Boolean that specifies the new clone enabled state.
   */
  setCloneEnabled(value: any): void {
    this.cloneEnabled = value;
  }

  /**
   * Function: isMoveEnabled
   *
   * Returns <moveEnabled>.
   */
  isMoveEnabled(): boolean {
    return this.moveEnabled;
  }

  /**
   * Function: setMoveEnabled
   *
   * Sets <moveEnabled>.
   */
  setMoveEnabled(value: any): void {
    this.moveEnabled = value;
  }

  /**
   * Function: isSelectEnabled
   *
   * Returns <selectEnabled>.
   */
  isSelectEnabled(): boolean {
    return this.selectEnabled;
  }

  /**
   * Function: setSelectEnabled
   *
   * Sets <selectEnabled>.
   */
  setSelectEnabled(value: any): void {
    this.selectEnabled = value;
  }

  /**
   * Function: isRemoveCellsFromParent
   *
   * Returns <removeCellsFromParent>.
   */
  isRemoveCellsFromParent(): boolean {
    return this.removeCellsFromParent;
  }

  /**
   * Function: setRemoveCellsFromParent
   *
   * Sets <removeCellsFromParent>.
   */
  setRemoveCellsFromParent(value: any): void {
    this.removeCellsFromParent = value;
  }

  /**
   * Function: getInitialCellForEvent
   *
   * Hook to return initial cell for the given event.
   */
  getInitialCellForEvent(me: any): any {
    return me.getCell();
  }

  /**
   * Function: isDelayedSelection
   *
   * Hook to return true for delayed selections.
   */
  isDelayedSelection(cell: mxCell, me: any): boolean {
    return this.graph.isCellSelected(cell);
  }

  /**
   * Function: consumeMouseEvent
   *
   * Consumes the given mouse event. NOTE: This may be used to enable click
   * events for links in labels on iOS as follows as consuming the initial
   * touchStart disables firing the subsequent click event on the link.
   *
   * <code>
   * mxGraphHandler.prototype.consumeMouseEvent = function(evtName, me)
   * {
   *   var source = mxEvent.getSource(me.getEvent());
   *
   *   if (!mxEvent.isTouchEvent(me.getEvent()) || source.nodeName != 'A')
   *   {
   *     me.consume();
   *   }
   * }
   * </code>
   */
  consumeMouseEvent(evtName: string, me: any): void {
    me.consume();
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by selecing the given cell and creating a handle for
   * it. By consuming the event all subsequent events of the gesture are
   * redirected to this handler.
   */
  mouseDown(sender: any, me: any): void {
    if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled() && me.getState() && !mxEvent.isMultiTouchEvent(me.getEvent())) {
      const cell = this.getInitialCellForEvent(me);
      this.delayedSelection = this.isDelayedSelection(cell, me);
      this.cell = undefined;
      if (this.isSelectEnabled() && !this.delayedSelection) {
        this.graph.selectCellForEvent(cell, me.getEvent());
      }
      if (this.isMoveEnabled()) {
        const model = this.graph.model;
        const geo = model.getGeometry(cell);
        if (this.graph.isCellMovable(cell) && ((!model.isEdge(cell) || this.graph.getSelectionCount() > 1 || (!!geo.points && geo.points.length > 0) || !model.getTerminal(cell, true) || !model.getTerminal(cell, false)) || this.graph.allowDanglingEdges || (this.graph.isCloneEvent(me.getEvent()) && this.graph.isCellsCloneable()))) {
          this.start(cell, me.getX(), me.getY());
        } else if (this.delayedSelection) {
          this.cell = cell;
        }
        this.cellWasClicked = true;
        this.consumeMouseEvent(mxEvent.MOUSE_DOWN, me);
      }
    }
  }

  /**
   * Function: getGuideStates
   *
   * Creates an array of cell states which should be used as guides.
   */
  getGuideStates(): any {
    const parent = this.graph.getDefaultParent();
    const model = this.graph.getModel();
    const filter = mxUtils.bind(this, function (cell) {
      return this.graph.view.getState(cell) && model.isVertex(cell) && model.getGeometry(cell) && !model.getGeometry(cell).relative;
    });
    return this.graph.view.getCellStates(model.filterDescendants(filter, parent));
  }

  /**
   * Function: getCells
   *
   * Returns the cells to be modified by this handler. This implementation
   * returns all selection cells that are movable, or the given initial cell if
   * the given cell is not selected and movable. This handles the case of moving
   * unselectable or unselected cells.
   *
   * Parameters:
   *
   * initialCell - <mxCell> that triggered this handler.
   */
  getCells(initialCell: any): any {
    if (!this.delayedSelection && this.graph.isCellMovable(initialCell)) {
      return [initialCell];
    } else {
      return this.graph.getMovableCells(this.graph.getSelectionCells());
    }
  }

  /**
   * Function: getPreviewBounds
   *
   * Returns the <mxRectangle> used as the preview bounds for
   * moving the given cells.
   */
  getPreviewBounds(cells: mxCell[]): any {
    const bounds = this.getBoundingBox(cells);
    if (!!bounds) {
      bounds.width = Math.max(0, bounds.width - 1);
      bounds.height = Math.max(0, bounds.height - 1);
      if (bounds.width < this.minimumSize) {
        const dx = this.minimumSize - bounds.width;
        bounds.x -= dx / 2;
        bounds.width = this.minimumSize;
      } else {
        bounds.x = Math.round(bounds.x);
        bounds.width = Math.ceil(bounds.width);
      }
      const tr = this.graph.view.translate;
      const s = this.graph.view.scale;
      if (bounds.height < this.minimumSize) {
        const dy = this.minimumSize - bounds.height;
        bounds.y -= dy / 2;
        bounds.height = this.minimumSize;
      } else {
        bounds.y = Math.round(bounds.y);
        bounds.height = Math.ceil(bounds.height);
      }
    }
    return bounds;
  }

  /**
   * Function: getBoundingBox
   *
   * Returns the union of the <mxCellStates> for the given array of <mxCells>.
   * For vertices, this method uses the bounding box of the corresponding shape
   * if one exists. The bounding box of the corresponding text label and all
   * controls and overlays are ignored. See also: <mxGraphView.getBounds> and
   * <mxGraph.getBoundingBox>.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounding box should be returned.
   */
  getBoundingBox(cells: mxCell[]): any {
    let result = undefined;
    if (!!cells && cells.length > 0) {
      const model = this.graph.getModel();
      for (let i = 0; i < cells.length; i++) {
        if (model.isVertex(cells[i]) || model.isEdge(cells[i])) {
          const state = this.graph.view.getState(cells[i]);
          if (!!state) {
            let bbox = state;
            if (model.isVertex(cells[i]) && !!state.shape && !!state.shape.boundingBox) {
              bbox = state.shape.boundingBox;
            }
            if (!result) {
              result = mxRectangle.fromRectangle(bbox);
            } else {
              result.add(bbox);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: createPreviewShape
   *
   * Creates the shape used to draw the preview for the given bounds.
   */
  createPreviewShape(bounds: any): any {
    const shape = new mxRectangleShape(bounds, null, this.previewColor);
    shape.isDashed = true;
    if (this.htmlPreview) {
      shape.dialect = mxConstants.DIALECT_STRICTHTML;
      shape.init(this.graph.container);
    } else {
      shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
      shape.init(this.graph.getView().getOverlayPane());
      shape.pointerEvents = false;
      if (mxClient.IS_IOS) {
        shape.getSvgScreenOffset = function () {
          return 0;
        };
      }
    }
    return shape;
  }

  /**
   * Function: start
   *
   * Starts the handling of the mouse gesture.
   */
  start(cell: mxCell, x: number, y: number): void {
    this.cell = cell;
    this.first = mxUtils.convertPoint(this.graph.container, x, y);
    this.cells = this.getCells(this.cell);
    this.bounds = this.graph.getView().getBounds(this.cells);
    this.pBounds = this.getPreviewBounds(this.cells);
    if (this.guidesEnabled) {
      this.guide = new mxGuide(this.graph, this.getGuideStates());
    }
  }

  /**
   * Function: useGuidesForEvent
   *
   * Returns true if the guides should be used for the given <mxMouseEvent>.
   * This implementation returns <mxGuide.isEnabledForEvent>.
   */
  useGuidesForEvent(me: any): any {
    return (!!this.guide) ? this.guide.isEnabledForEvent(me.getEvent()) : true;
  }

  /**
   * Function: snap
   *
   * Snaps the given vector to the grid and returns the given mxPoint instance.
   */
  snap(vector: any): any {
    const scale = (this.scaleGrid) ? this.graph.view.scale : 1;
    vector.x = this.graph.snap(vector.x / scale) * scale;
    vector.y = this.graph.snap(vector.y / scale) * scale;
    return vector;
  }

  /**
   * Function: getDelta
   *
   * Returns an <mxPoint> that represents the vector for moving the cells
   * for the given <mxMouseEvent>.
   */
  getDelta(me: any): any {
    const point = mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
    const s = this.graph.view.scale;
    return new mxPoint(this.roundLength((point.x - this.first.x) / s) * s, this.roundLength((point.y - this.first.y) / s) * s);
  }

  /**
   * Function: updateHint
   *
   * Hook for subclassers do show details while the handler is active.
   */
  updateHint(me: any): void {
  }

  /**
   * Function: removeHint
   *
   * Hooks for subclassers to hide details when the handler gets inactive.
   */
  removeHint(): void {
  }

  /**
   * Function: roundLength
   *
   * Hook for rounding the unscaled vector. This uses Math.round.
   */
  roundLength(length: number): any {
    return Math.round(length * 2) / 2;
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by highlighting possible drop targets and updating the
   * preview.
   */
  mouseMove(sender: any, me: any): void {
    const graph = this.graph;
    if (!me.isConsumed() && graph.isMouseDown && !!this.cell && !!this.first && !!this.bounds) {
      if (mxEvent.isMultiTouchEvent(me.getEvent())) {
        this.reset();
        return;
      }
      let delta = this.getDelta(me);
      let dx = delta.x;
      let dy = delta.y;
      const tol = graph.tolerance;
      if (!!this.shape || Math.abs(dx) > tol || Math.abs(dy) > tol) {
        if (!this.highlight) {
          this.highlight = new mxCellHighlight(this.graph, mxConstants.DROP_TARGET_COLOR, 3);
        }
        if (!this.shape) {
          this.shape = this.createPreviewShape(this.bounds);
        }
        const clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
        const gridEnabled = graph.isGridEnabledEvent(me.getEvent());
        let hideGuide = true;
        if (!!this.guide && this.useGuidesForEvent(me)) {
          delta = this.guide.move(this.bounds, new mxPoint(dx, dy), gridEnabled, clone);
          hideGuide = false;
          dx = delta.x;
          dy = delta.y;
        } else if (gridEnabled) {
          const trx = graph.getView().translate;
          const scale = graph.getView().scale;
          const tx = this.bounds.x - (graph.snap(this.bounds.x / scale - trx.x) + trx.x) * scale;
          const ty = this.bounds.y - (graph.snap(this.bounds.y / scale - trx.y) + trx.y) * scale;
          const v = this.snap(new mxPoint(dx, dy));
          dx = v.x - tx;
          dy = v.y - ty;
        }
        if (!!this.guide && hideGuide) {
          this.guide.hide();
        }
        if (graph.isConstrainedEvent(me.getEvent())) {
          if (Math.abs(dx) > Math.abs(dy)) {
            dy = 0;
          } else {
            dx = 0;
          }
        }
        this.currentDx = dx;
        this.currentDy = dy;
        this.updatePreviewShape();
        let target = undefined;
        const cell = me.getCell();
        if (graph.isDropEnabled() && this.highlightEnabled) {
          target = graph.getDropTarget(this.cells, me.getEvent(), cell, clone);
        }
        let state = graph.getView().getState(target);
        let highlight = false;
        if (!!state && (graph.model.getParent(this.cell) != target || clone)) {
          if (this.target != target) {
            this.target = target;
            this.setHighlightColor(mxConstants.DROP_TARGET_COLOR);
          }
          highlight = true;
        } else {
          this.target = undefined;
          if (this.connectOnDrop && !!cell && this.cells.length == 1 && graph.getModel().isVertex(cell) && graph.isCellConnectable(cell)) {
            state = graph.getView().getState(cell);
            if (!!state) {
              const error = graph.getEdgeValidationError(null, this.cell, cell);
              const color = (!error) ? mxConstants.VALID_COLOR : mxConstants.INVALID_CONNECT_TARGET_COLOR;
              this.setHighlightColor(color);
              highlight = true;
            }
          }
        }
        if (!!state && highlight) {
          this.highlight.highlight(state);
        } else {
          this.highlight.hide();
        }
      }
      this.updateHint(me);
      this.consumeMouseEvent(mxEvent.MOUSE_MOVE, me);
      mxEvent.consume(me.getEvent());
    } else if ((this.isMoveEnabled() || this.isCloneEnabled()) && this.updateCursor && !me.isConsumed() && (me.getState() || !!me.sourceState) && !graph.isMouseDown) {
      let cursor = graph.getCursorForMouseEvent(me);
      if (!cursor && graph.isEnabled() && graph.isCellMovable(me.getCell())) {
        if (graph.getModel().isEdge(me.getCell())) {
          cursor = mxConstants.CURSOR_MOVABLE_EDGE;
        } else {
          cursor = mxConstants.CURSOR_MOVABLE_VERTEX;
        }
      }
      if (!!cursor && !!me.sourceState) {
        me.sourceState.setCursor(cursor);
      }
    }
  }

  /**
   * Function: updatePreviewShape
   *
   * Updates the bounds of the preview shape.
   */
  updatePreviewShape(): void {
    if (!!this.shape) {
      this.shape.bounds = new mxRectangle(Math.round(this.pBounds.x + this.currentDx - this.graph.panDx), Math.round(this.pBounds.y + this.currentDy - this.graph.panDy), this.pBounds.width, this.pBounds.height);
      this.shape.redraw();
    }
  }

  /**
   * Function: setHighlightColor
   *
   * Sets the color of the rectangle used to highlight drop targets.
   *
   * Parameters:
   *
   * color - String that represents the new highlight color.
   */
  setHighlightColor(color: string): void {
    if (!!this.highlight) {
      this.highlight.setHighlightColor(color);
    }
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by applying the changes to the selection cells.
   */
  mouseUp(sender: any, me: any): void {
    if (!me.isConsumed()) {
      const graph = this.graph;
      if (!!this.cell && !!this.first && !!this.shape && !!this.currentDx && !!this.currentDy) {
        const cell = me.getCell();
        if (this.connectOnDrop && !this.target && !!cell && graph.getModel().isVertex(cell) && graph.isCellConnectable(cell) && graph.isEdgeValid(null, this.cell, cell)) {
          graph.connectionHandler.connect(this.cell, cell, me.getEvent());
        } else {
          const clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
          const scale = graph.getView().scale;
          const dx = this.roundLength(this.currentDx / scale);
          const dy = this.roundLength(this.currentDy / scale);
          const target = this.target;
          if (graph.isSplitEnabled() && graph.isSplitTarget(target, this.cells, me.getEvent())) {
            graph.splitEdge(target, this.cells, null, dx, dy);
          } else {
            this.moveCells(this.cells, dx, dy, clone, this.target, me.getEvent());
          }
        }
      } else if (this.isSelectEnabled() && this.delayedSelection && !!this.cell) {
        this.selectDelayed(me);
      }
    }
    if (this.cellWasClicked) {
      this.consumeMouseEvent(mxEvent.MOUSE_UP, me);
    }
    this.reset();
  }

  /**
   * Function: selectDelayed
   *
   * Implements the delayed selection for the given mouse event.
   */
  selectDelayed(me: any): void {
    if (!this.graph.isCellSelected(this.cell) || !this.graph.popupMenuHandler.isPopupTrigger(me)) {
      this.graph.selectCellForEvent(this.cell, me.getEvent());
    }
  }

  /**
   * Function: reset
   *
   * Resets the state of this handler.
   */
  reset(): void {
    this.destroyShapes();
    this.removeHint();
    this.cellWasClicked = false;
    this.delayedSelection = false;
    this.currentDx = undefined;
    this.currentDy = undefined;
    this.guides = undefined;
    this.first = undefined;
    this.cell = undefined;
    this.target = undefined;
  }

  /**
   * Function: shouldRemoveCellsFromParent
   *
   * Returns true if the given cells should be removed from the parent for the specified
   * mousereleased event.
   */
  shouldRemoveCellsFromParent(parent: any, cells: mxCell[], evt: Event): any {
    if (this.graph.getModel().isVertex(parent)) {
      const pState = this.graph.getView().getState(parent);
      if (!!pState) {
        let pt = mxUtils.convertPoint(this.graph.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
        const alpha = mxUtils.toRadians(mxUtils.getValue(pState.style, mxConstants.STYLE_ROTATION) || 0);
        if (alpha != 0) {
          const cos = Math.cos(-alpha);
          const sin = Math.sin(-alpha);
          const cx = new mxPoint(pState.getCenterX(), pState.getCenterY());
          pt = mxUtils.getRotatedPoint(pt, cos, sin, cx);
        }
        return !mxUtils.contains(pState, pt.x, pt.y);
      }
    }
    return false;
  }

  /**
   * Function: moveCells
   *
   * Moves the given cells by the specified amount.
   */
  moveCells(cells: mxCell[], dx: number, dy: number, clone: boolean, target: string, evt: Event): void {
    if (clone) {
      cells = this.graph.getCloneableCells(cells);
    }
    const parent = this.graph.getModel().getParent(this.cell);
    if (!target && this.isRemoveCellsFromParent() && this.shouldRemoveCellsFromParent(parent, cells, evt)) {
      target = this.graph.getDefaultParent();
    }
    clone = clone && !this.graph.isCellLocked(target || this.graph.getDefaultParent());
    this.graph.getModel().beginUpdate();
    try {
      const parents = [];
      if (!clone && !!target && this.removeEmptyParents) {
        const dict = new mxDictionary();
        for (let i = 0; i < cells.length; i++) {
          dict.put(cells[i], true);
        }
        for (let i = 0; i < cells.length; i++) {
          const par = this.graph.model.getParent(cells[i]);
          if (!!par && !dict.get(par)) {
            dict.put(par, true);
            parents.push(par);
          }
        }
      }
      cells = this.graph.moveCells(cells, dx - this.graph.panDx / this.graph.view.scale, dy - this.graph.panDy / this.graph.view.scale, clone, target, evt);
      const temp = [];
      for (let i = 0; i < parents.length; i++) {
        if (this.shouldRemoveParent(parents[i])) {
          temp.push(parents[i]);
        }
      }
      this.graph.removeCells(temp, false);
    } finally {
      this.graph.getModel().endUpdate();
    }
    if (clone) {
      this.graph.setSelectionCells(cells);
    }
    if (this.isSelectEnabled() && this.scrollOnMove) {
      this.graph.scrollCellToVisible(cells[0]);
    }
  }

  /**
   * Function: moveCells
   *
   * Moves the given cells by the specified amount.
   */
  shouldRemoveParent(parent: any): any {
    const state = this.graph.view.getState(parent);
    if (!!state && (this.graph.model.isEdge(state.cell) || this.graph.model.isVertex(state.cell)) && this.graph.isCellDeletable(state.cell) && this.graph.model.getChildCount(state.cell) == 0) {
      const stroke = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
      const fill = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
      return stroke == mxConstants.NONE && fill == mxConstants.NONE;
    }
    return false;
  }

  /**
   * Function: destroyShapes
   *
   * Destroy the preview and highlight shapes.
   */
  destroyShapes(): void {
    if (!!this.shape) {
      this.shape.destroy();
      this.shape = undefined;
    }
    if (!!this.guide) {
      this.guide.destroy();
      this.guide = undefined;
    }
    if (!!this.highlight) {
      this.highlight.destroy();
      this.highlight = undefined;
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.panHandler);
    if (!!this.escapeHandler) {
      this.graph.removeListener(this.escapeHandler);
      this.escapeHandler = undefined;
    }
    if (!!this.refreshHandler) {
      this.graph.getModel().removeListener(this.refreshHandler);
      this.refreshHandler = undefined;
    }
    this.destroyShapes();
    this.removeHint();
  }
}
