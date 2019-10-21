/**
 * Class: mxGraphView
 *
 * Extends <mxEventSource> to implement a view for a graph. This class is in
 * charge of computing the absolute coordinates for the relative child
 * geometries, the points for perimeters and edge styles and keeping them
 * cached in <mxCellStates> for faster retrieval. The states are updated
 * whenever the model or the view state (translate, scale) changes. The scale
 * and translate are honoured in the bounds.
 *
 * Event: mxEvent.UNDO
 *
 * Fires after the root was changed in <setCurrentRoot>. The <code>edit</code>
 * property contains the <mxUndoableEdit> which contains the
 * <mxCurrentRootChange>.
 *
 * Event: mxEvent.SCALE_AND_TRANSLATE
 *
 * Fires after the scale and translate have been changed in <scaleAndTranslate>.
 * The <code>scale</code>, <code>previousScale</code>, <code>translate</code>
 * and <code>previousTranslate</code> properties contain the new and previous
 * scale and translate, respectively.
 *
 * Event: mxEvent.SCALE
 *
 * Fires after the scale was changed in <setScale>. The <code>scale</code> and
 * <code>previousScale</code> properties contain the new and previous scale.
 *
 * Event: mxEvent.TRANSLATE
 *
 * Fires after the translate was changed in <setTranslate>. The
 * <code>translate</code> and <code>previousTranslate</code> properties contain
 * the new and previous value for translate.
 *
 * Event: mxEvent.DOWN and mxEvent.UP
 *
 * Fire if the current root is changed by executing an <mxCurrentRootChange>.
 * The event name depends on the location of the root in the cell hierarchy
 * with respect to the current root. The <code>root</code> and
 * <code>previous</code> properties contain the new and previous root,
 * respectively.
 *
 * Constructor: mxGraphView
 *
 * Constructs a new view for the given <mxGraph>.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 */
import { mxCell } from '../model/mxCell';
import { mxClient } from '../mxClient';
import { mxImageShape } from '../shape/mxImageShape';
import { mxRectangleShape } from '../shape/mxRectangleShape';
import { mxConstants } from '../util/mxConstants';
import { mxDictionary } from '../util/mxDictionary';
import { mxEvent } from '../util/mxEvent';
import { mxEventObject } from '../util/mxEventObject';
import { mxLog } from '../util/mxLog';
import { mxMouseEvent } from '../util/mxMouseEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxResources } from '../util/mxResources';
import { mxUndoableEdit } from '../util/mxUndoableEdit';
import { mxUtils } from '../util/mxUtils';
import { mxCellState } from './mxCellState';
import { mxStyleRegistry } from './mxStyleRegistry';

export class mxGraphView {
  constructor(graph: mxGraph) {
    this.graph = graph;
    this.translate = new mxPoint();
    this.graphBounds = new mxRectangle();
    this.states = new mxDictionary();
  }

  graph: mxGraph;
  translate: mxPoint;
  graphBounds: mxRectangle;
  states: mxDictionary;
  EMPTY_POINT: mxPoint;
  /**
   * Variable: doneResource
   *
   * Specifies the resource key for the status message after a long operation.
   * If the resource for this key does not exist then the value is used as
   * the status message. Default is 'done'.
   */
  doneResource: any = 'done';
  /**
   * Function: updatingDocumentResource
   *
   * Specifies the resource key for the status message while the document is
   * being updated. If the resource for this key does not exist then the
   * value is used as the status message. Default is 'updatingDocument'.
   */
  updatingDocumentResource: any = 'updatingDocument';
  /**
   * Variable: allowEval
   *
   * Specifies if string values in cell styles should be evaluated using
   * <mxUtils.eval>. This will only be used if the string values can't be mapped
   * to objects using <mxStyleRegistry>. Default is false. NOTE: Enabling this
   * switch carries a possible security risk.
   */
  allowEval: boolean = false;
  /**
   * Variable: captureDocumentGesture
   *
   * Specifies if a gesture should be captured when it goes outside of the
   * graph container. Default is true.
   * @example true
   */
  captureDocumentGesture: boolean = true;
  /**
   * Variable: optimizeVmlReflows
   *
   * Specifies if the <canvas> should be hidden while rendering in IE8 standards
   * mode and quirks mode. This will significantly improve rendering performance.
   * Default is true.
   * @example true
   */
  optimizeVmlReflows: boolean = true;
  /**
   * Variable: rendering
   *
   * Specifies if shapes should be created, updated and destroyed using the
   * methods of <mxCellRenderer> in <graph>. Default is true.
   * @example true
   */
  rendering: boolean = true;
  /**
   * Variable: currentRoot
   *
   * <mxCell> that acts as the root of the displayed cell hierarchy.
   */
  currentRoot: any = true;
  /**
   * Variable: scale
   *
   * Specifies the scale. Default is 1 (100%).
   * @example 1
   */
  scale: number = 1;
  /**
   * Variable: updateStyle
   *
   * Specifies if the style should be updated in each validation step. If this
   * is false then the style is only updated if the state is created or if the
   * style of the cell was changed. Default is false.
   */
  updateStyle: boolean = false;
  /**
   * Variable: lastNode
   *
   * During validation, this contains the last DOM node that was processed.
   */
  lastNode: any;
  /**
   * Variable: lastHtmlNode
   *
   * During validation, this contains the last HTML DOM node that was processed.
   */
  lastHtmlNode: any;
  /**
   * Variable: lastForegroundNode
   *
   * During validation, this contains the last edge's DOM node that was processed.
   */
  lastForegroundNode: any;
  /**
   * Variable: lastForegroundHtmlNode
   *
   * During validation, this contains the last edge HTML DOM node that was processed.
   */
  lastForegroundHtmlNode: any;
  placeholder: any;
  textDiv: any;
  backgroundImage: mxImageShape;
  backgroundPageShape: any;
  moveHandler: Function;
  endHandler: Function;
  canvas: any;
  backgroundPane: any;
  drawPane: any;
  overlayPane: any;
  decoratorPane: any;

  /**
   * Function: getGraphBounds
   *
   * Returns <graphBounds>.
   */
  getGraphBounds(): any {
    return this.graphBounds;
  }

  /**
   * Function: setGraphBounds
   *
   * Sets <graphBounds>.
   */
  setGraphBounds(value: any): void {
    this.graphBounds = value;
  }

  /**
   * Function: getBounds
   *
   * Returns the union of all <mxCellStates> for the given array of <mxCells>.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounds should be returned.
   */
  getBounds(cells: mxCell[]): any {
    let result = undefined;
    if (!!cells && cells.length > 0) {
      const model = this.graph.getModel();
      for (let i = 0; i < cells.length; i++) {
        if (model.isVertex(cells[i]) || model.isEdge(cells[i])) {
          const state = this.getState(cells[i]);
          if (!!state) {
            if (!result) {
              result = mxRectangle.fromRectangle(state);
            } else {
              result.add(state);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: setCurrentRoot
   *
   * Sets and returns the current root and fires an <undo> event before
   * calling <mxGraph.sizeDidChange>.
   *
   * Parameters:
   *
   * root - <mxCell> that specifies the root of the displayed cell hierarchy.
   */
  setCurrentRoot(root: any): any {
    if (this.currentRoot != root) {
      const change = new mxCurrentRootChange(this, root);
      change.execute();
      const edit = new mxUndoableEdit(this, true);
      edit.add(change);
      this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
      this.graph.sizeDidChange();
    }
    return root;
  }

  /**
   * Function: scaleAndTranslate
   *
   * Sets the scale and translation and fires a <scale> and <translate> event
   * before calling <revalidate> followed by <mxGraph.sizeDidChange>.
   *
   * Parameters:
   *
   * scale - Decimal value that specifies the new scale (1 is 100%).
   * dx - X-coordinate of the translation.
   * dy - Y-coordinate of the translation.
   */
  scaleAndTranslate(scale: any, dx: number, dy: number): void {
    const previousScale = this.scale;
    const previousTranslate = new mxPoint(this.translate.x, this.translate.y);
    if (this.scale != scale || this.translate.x != dx || this.translate.y != dy) {
      this.scale = scale;
      this.translate.x = dx;
      this.translate.y = dy;
      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }
    this.fireEvent(new mxEventObject(mxEvent.SCALE_AND_TRANSLATE, 'scale', scale, 'previousScale', previousScale, 'translate', this.translate, 'previousTranslate', previousTranslate));
  }

  /**
   * Function: getScale
   *
   * Returns the <scale>.
   */
  getScale(): any {
    return this.scale;
  }

  /**
   * Function: setScale
   *
   * Sets the scale and fires a <scale> event before calling <revalidate> followed
   * by <mxGraph.sizeDidChange>.
   *
   * Parameters:
   *
   * value - Decimal value that specifies the new scale (1 is 100%).
   */
  setScale(value: any): void {
    const previousScale = this.scale;
    if (this.scale != value) {
      this.scale = value;
      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }
    this.fireEvent(new mxEventObject(mxEvent.SCALE, 'scale', value, 'previousScale', previousScale));
  }

  /**
   * Function: getTranslate
   *
   * Returns the <translate>.
   */
  getTranslate(): any {
    return this.translate;
  }

  /**
   * Function: setTranslate
   *
   * Sets the translation and fires a <translate> event before calling
   * <revalidate> followed by <mxGraph.sizeDidChange>. The translation is the
   * negative of the origin.
   *
   * Parameters:
   *
   * dx - X-coordinate of the translation.
   * dy - Y-coordinate of the translation.
   */
  setTranslate(dx: number, dy: number): void {
    const previousTranslate = new mxPoint(this.translate.x, this.translate.y);
    if (this.translate.x != dx || this.translate.y != dy) {
      this.translate.x = dx;
      this.translate.y = dy;
      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }
    this.fireEvent(new mxEventObject(mxEvent.TRANSLATE, 'translate', this.translate, 'previousTranslate', previousTranslate));
  }

  /**
   * Function: viewStateChanged
   *
   * Invoked after <scale> and/or <translate> has changed.
   */
  viewStateChanged(): void {
    this.revalidate();
    this.graph.sizeDidChange();
  }

  /**
   * Function: refresh
   *
   * Clears the view if <currentRoot> is not null and revalidates.
   */
  refresh(): void {
    if (!!this.currentRoot) {
      this.clear();
    }
    this.revalidate();
  }

  /**
   * Function: revalidate
   *
   * Revalidates the complete view with all cell states.
   */
  revalidate(): void {
    this.invalidate();
    this.validate();
  }

  /**
   * Function: clear
   *
   * Removes the state of the given cell and all descendants if the given
   * cell is not the current root.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> for which the state should be removed. Default
   * is the root of the model.
   * force - Boolean indicating if the current root should be ignored for
   * recursion.
   */
  clear(cell: mxCell, force: any, recurse: any): void {
    const model = this.graph.getModel();
    cell = cell || model.getRoot();
    force = (!!force) ? force : false;
    recurse = (!!recurse) ? recurse : true;
    this.removeState(cell);
    if (recurse && (force || cell != this.currentRoot)) {
      const childCount = model.getChildCount(cell);
      for (let i = 0; i < childCount; i++) {
        this.clear(model.getChildAt(cell, i), force);
      }
    } else {
      this.invalidate(cell);
    }
  }

  /**
   * Function: invalidate
   *
   * Invalidates the state of the given cell, all its descendants and
   * connected edges.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> to be invalidated. Default is the root of the
   * model.
   */
  invalidate(cell: mxCell, recurse: any, includeEdges: any): void {
    const model = this.graph.getModel();
    cell = cell || model.getRoot();
    recurse = (!!recurse) ? recurse : true;
    includeEdges = (!!includeEdges) ? includeEdges : true;
    const state = this.getState(cell);
    if (!!state) {
      state.invalid = true;
    }
    if (!cell.invalidating) {
      cell.invalidating = true;
      if (recurse) {
        const childCount = model.getChildCount(cell);
        for (let i = 0; i < childCount; i++) {
          const child = model.getChildAt(cell, i);
          this.invalidate(child, recurse, includeEdges);
        }
      }
      if (includeEdges) {
        const edgeCount = model.getEdgeCount(cell);
        for (let i = 0; i < edgeCount; i++) {
          this.invalidate(model.getEdgeAt(cell, i), recurse, includeEdges);
        }
      }
      delete cell.invalidating;
    }
  }

  /**
   * Function: validate
   *
   * Calls <validateCell> and <validateCellState> and updates the <graphBounds>
   * using <getBoundingBox>. Finally the background is validated using
   * <validateBackground>.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> to be used as the root of the validation.
   * Default is <currentRoot> or the root of the model.
   */
  validate(cell: mxCell): void {
    const t0 = mxLog.enter('mxGraphView.validate');
    window.status = mxResources.get(this.updatingDocumentResource) || this.updatingDocumentResource;
    this.resetValidationState();
    let prevDisplay = undefined;
    if (this.optimizeVmlReflows && !!this.canvas && !this.textDiv && ((document.documentMode == 8 && !mxClient.IS_EM) || mxClient.IS_QUIRKS)) {
      this.placeholder = document.createElement('div');
      this.placeholder.style.position = 'absolute';
      this.placeholder.style.width = this.canvas.clientWidth + 'px';
      this.placeholder.style.height = this.canvas.clientHeight + 'px';
      this.canvas.parentNode.appendChild(this.placeholder);
      prevDisplay = this.drawPane.style.display;
      this.canvas.style.display = 'none';
      this.textDiv = document.createElement('div');
      this.textDiv.style.position = 'absolute';
      this.textDiv.style.whiteSpace = 'nowrap';
      this.textDiv.style.visibility = 'hidden';
      this.textDiv.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
      this.textDiv.style.zoom = '1';
      document.body.appendChild(this.textDiv);
    }
    const graphBounds = this.getBoundingBox(this.validateCellState(this.validateCell(cell || ((!!this.currentRoot) ? this.currentRoot : this.graph.getModel().getRoot()))));
    this.setGraphBounds((!!graphBounds) ? graphBounds : this.getEmptyBounds());
    this.validateBackground();
    if (!!prevDisplay) {
      this.canvas.style.display = prevDisplay;
      this.textDiv.parentNode.removeChild(this.textDiv);
      if (!!this.placeholder) {
        this.placeholder.parentNode.removeChild(this.placeholder);
      }
      this.textDiv = undefined;
    }
    this.resetValidationState();
    window.status = mxResources.get(this.doneResource) || this.doneResource;
    mxLog.leave('mxGraphView.validate', t0);
  }

  /**
   * Function: getEmptyBounds
   *
   * Returns the bounds for an empty graph. This returns a rectangle at
   * <translate> with the size of 0 x 0.
   */
  getEmptyBounds(): any {
    return new mxRectangle(this.translate.x * this.scale, this.translate.y * this.scale);
  }

  /**
   * Function: getBoundingBox
   *
   * Returns the bounding box of the shape and the label for the given
   * <mxCellState> and its children if recurse is true.
   *
   * Parameters:
   *
   * state - <mxCellState> whose bounding box should be returned.
   * recurse - Optional boolean indicating if the children should be included.
   * Default is true.
   */
  getBoundingBox(state: any, recurse: any): any {
    recurse = (!!recurse) ? recurse : true;
    let bbox = undefined;
    if (!!state) {
      if (!!state.shape && !!state.shape.boundingBox) {
        bbox = state.shape.boundingBox.clone();
      }
      if (!!state.text && !!state.text.boundingBox) {
        if (!!bbox) {
          bbox.add(state.text.boundingBox);
        } else {
          bbox = state.text.boundingBox.clone();
        }
      }
      if (recurse) {
        const model = this.graph.getModel();
        const childCount = model.getChildCount(state.cell);
        for (let i = 0; i < childCount; i++) {
          const bounds = this.getBoundingBox(this.getState(model.getChildAt(state.cell, i)));
          if (!!bounds) {
            if (!bbox) {
              bbox = bounds;
            } else {
              bbox.add(bounds);
            }
          }
        }
      }
    }
    return bbox;
  }

  /**
   * Function: createBackgroundPageShape
   *
   * Creates and returns the shape used as the background page.
   *
   * Parameters:
   *
   * bounds - <mxRectangle> that represents the bounds of the shape.
   */
  createBackgroundPageShape(bounds: any): any {
    return new mxRectangleShape(bounds, 'white', 'black');
  }

  /**
   * Function: validateBackground
   *
   * Calls <validateBackgroundImage> and <validateBackgroundPage>.
   */
  validateBackground(): void {
    this.validateBackgroundImage();
    this.validateBackgroundPage();
  }

  /**
   * Function: validateBackgroundImage
   *
   * Validates the background image.
   */
  validateBackgroundImage(): void {
    const bg = this.graph.getBackgroundImage();
    if (!!bg) {
      if (!this.backgroundImage || this.backgroundImage.image != bg.src) {
        if (!!this.backgroundImage) {
          this.backgroundImage.destroy();
        }
        const bounds = new mxRectangle(0, 0, 1, 1);
        this.backgroundImage = new mxImageShape(bounds, bg.src);
        this.backgroundImage.dialect = this.graph.dialect;
        this.backgroundImage.init(this.backgroundPane);
        this.backgroundImage.redraw();
        if (document.documentMode == 8 && !mxClient.IS_EM) {
          mxEvent.addGestureListeners(this.backgroundImage.node, (evt) => {
            this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
          }, mxUtils.bind(this, function (evt) {
            this.graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
          }), (evt) => {
            this.graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
          });
        }
      }
      this.redrawBackgroundImage(this.backgroundImage, bg);
    } else if (!!this.backgroundImage) {
      this.backgroundImage.destroy();
      this.backgroundImage = undefined;
    }
  }

  /**
   * Function: validateBackgroundPage
   *
   * Validates the background page.
   */
  validateBackgroundPage(): void {
    if (this.graph.pageVisible) {
      const bounds = this.getBackgroundPageBounds();
      if (!this.backgroundPageShape) {
        this.backgroundPageShape = this.createBackgroundPageShape(bounds);
        this.backgroundPageShape.scale = this.scale;
        this.backgroundPageShape.isShadow = true;
        this.backgroundPageShape.dialect = this.graph.dialect;
        this.backgroundPageShape.init(this.backgroundPane);
        this.backgroundPageShape.redraw();
        if (this.graph.nativeDblClickEnabled) {
          mxEvent.addListener(this.backgroundPageShape.node, 'dblclick', (evt) => {
            this.graph.dblClick(evt);
          });
        }
        mxEvent.addGestureListeners(this.backgroundPageShape.node, (evt) => {
          this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
        }, mxUtils.bind(this, function (evt) {
          if (!!this.graph.tooltipHandler && this.graph.tooltipHandler.isHideOnHover()) {
            this.graph.tooltipHandler.hide();
          }
          if (this.graph.isMouseDown && !mxEvent.isConsumed(evt)) {
            this.graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
          }
        }), (evt) => {
          this.graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
        });
      } else {
        this.backgroundPageShape.scale = this.scale;
        this.backgroundPageShape.bounds = bounds;
        this.backgroundPageShape.redraw();
      }
    } else if (!!this.backgroundPageShape) {
      this.backgroundPageShape.destroy();
      this.backgroundPageShape = undefined;
    }
  }

  /**
   * Function: getBackgroundPageBounds
   *
   * Returns the bounds for the background page.
   */
  getBackgroundPageBounds(): any {
    const fmt = this.graph.pageFormat;
    const ps = this.scale * this.graph.pageScale;
    const bounds = new mxRectangle(this.scale * this.translate.x, this.scale * this.translate.y, fmt.width * ps, fmt.height * ps);
    return bounds;
  }

  /**
   * Function: redrawBackgroundImage
   *
   * Updates the bounds and redraws the background image.
   *
   * Example:
   *
   * If the background image should not be scaled, this can be replaced with
   * the following.
   *
   * (code)
   * mxGraphView.prototype.redrawBackground = function(backgroundImage, bg)
   * {
   *   backgroundImage.bounds.x = this.translate.x;
   *   backgroundImage.bounds.y = this.translate.y;
   *   backgroundImage.bounds.width = bg.width;
   *   backgroundImage.bounds.height = bg.height;
   *
   *   backgroundImage.redraw();
   * };
   * (end)
   *
   * Parameters:
   *
   * backgroundImage - <mxImageShape> that represents the background image.
   * bg - <mxImage> that specifies the image and its dimensions.
   */
  redrawBackgroundImage(backgroundImage: any, bg: string): void {
    backgroundImage.scale = this.scale;
    backgroundImage.bounds.x = this.scale * this.translate.x;
    backgroundImage.bounds.y = this.scale * this.translate.y;
    backgroundImage.bounds.width = this.scale * bg.width;
    backgroundImage.bounds.height = this.scale * bg.height;
    backgroundImage.redraw();
  }

  /**
   * Function: validateCell
   *
   * Recursively creates the cell state for the given cell if visible is true and
   * the given cell is visible. If the cell is not visible but the state exists
   * then it is removed using <removeState>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose <mxCellState> should be created.
   * visible - Optional boolean indicating if the cell should be visible. Default
   * is true.
   */
  validateCell(cell: mxCell, visible: any): any {
    visible = (!!visible) ? visible : true;
    if (!!cell) {
      visible = visible && this.graph.isCellVisible(cell);
      const state = this.getState(cell, visible);
      if (!!state && !visible) {
        this.removeState(cell);
      } else {
        const model = this.graph.getModel();
        const childCount = model.getChildCount(cell);
        for (let i = 0; i < childCount; i++) {
          this.validateCell(model.getChildAt(cell, i), visible && (!this.isCellCollapsed(cell) || cell == this.currentRoot));
        }
      }
    }
    return cell;
  }

  /**
   * Function: validateCellState
   *
   * Validates and repaints the <mxCellState> for the given <mxCell>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose <mxCellState> should be validated.
   * recurse - Optional boolean indicating if the children of the cell should be
   * validated. Default is true.
   */
  validateCellState(cell: mxCell, recurse: any): any {
    recurse = (!!recurse) ? recurse : true;
    let state = undefined;
    if (!!cell) {
      state = this.getState(cell);
      if (!!state) {
        const model = this.graph.getModel();
        if (state.invalid) {
          state.invalid = false;
          if (!state.style || state.invalidStyle) {
            state.style = this.graph.getCellStyle(state.cell);
            state.invalidStyle = false;
          }
          if (cell != this.currentRoot) {
            this.validateCellState(model.getParent(cell), false);
          }
          state.setVisibleTerminalState(this.validateCellState(this.getVisibleTerminal(cell, true), false), true);
          state.setVisibleTerminalState(this.validateCellState(this.getVisibleTerminal(cell, false), false), false);
          this.updateCellState(state);
          if (cell != this.currentRoot && !state.invalid) {
            this.graph.cellRenderer.redraw(state, false, this.isRendering());
            state.updateCachedBounds();
          }
        }
        if (recurse && !state.invalid) {
          if (!!state.shape) {
            this.stateValidated(state);
          }
          const childCount = model.getChildCount(cell);
          for (let i = 0; i < childCount; i++) {
            this.validateCellState(model.getChildAt(cell, i));
          }
        }
      }
    }
    return state;
  }

  /**
   * Function: updateCellState
   *
   * Updates the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> to be updated.
   */
  updateCellState(state: any): void {
    state.absoluteOffset.x = 0;
    state.absoluteOffset.y = 0;
    state.origin.x = 0;
    state.origin.y = 0;
    state.length = 0;
    if (state.cell != this.currentRoot) {
      const model = this.graph.getModel();
      const pState = this.getState(model.getParent(state.cell));
      if (!!pState && pState.cell != this.currentRoot) {
        state.origin.x += pState.origin.x;
        state.origin.y += pState.origin.y;
      }
      let offset = this.graph.getChildOffsetForCell(state.cell);
      if (!!offset) {
        state.origin.x += offset.x;
        state.origin.y += offset.y;
      }
      const geo = this.graph.getCellGeometry(state.cell);
      if (!!geo) {
        if (!model.isEdge(state.cell)) {
          offset = geo.offset || this.EMPTY_POINT;
          if (geo.relative && !!pState) {
            if (model.isEdge(pState.cell)) {
              const origin = this.getPoint(pState, geo);
              if (!!origin) {
                state.origin.x += (origin.x / this.scale) - pState.origin.x - this.translate.x;
                state.origin.y += (origin.y / this.scale) - pState.origin.y - this.translate.y;
              }
            } else {
              state.origin.x += geo.x * pState.width / this.scale + offset.x;
              state.origin.y += geo.y * pState.height / this.scale + offset.y;
            }
          } else {
            state.absoluteOffset.x = this.scale * offset.x;
            state.absoluteOffset.y = this.scale * offset.y;
            state.origin.x += geo.x;
            state.origin.y += geo.y;
          }
        }
        state.x = this.scale * (this.translate.x + state.origin.x);
        state.y = this.scale * (this.translate.y + state.origin.y);
        state.width = this.scale * geo.width;
        state.unscaledWidth = geo.width;
        state.height = this.scale * geo.height;
        if (model.isVertex(state.cell)) {
          this.updateVertexState(state, geo);
        }
        if (model.isEdge(state.cell)) {
          this.updateEdgeState(state, geo);
        }
      }
    }
    state.updateCachedBounds();
  }

  /**
   * Function: isCellCollapsed
   *
   * Returns true if the children of the given cell should not be visible in the
   * view. This implementation uses <mxGraph.isCellVisible> but it can be
   * overidden to use a separate condition.
   */
  isCellCollapsed(cell: mxCell): boolean {
    return this.graph.isCellCollapsed(cell);
  }

  /**
   * Function: updateVertexState
   *
   * Validates the given cell state.
   */
  updateVertexState(state: any, geo: any): void {
    const model = this.graph.getModel();
    const pState = this.getState(model.getParent(state.cell));
    if (geo.relative && !!pState && !model.isEdge(pState.cell)) {
      const alpha = mxUtils.toRadians(pState.style[mxConstants.STYLE_ROTATION] || '0');
      if (alpha != 0) {
        const cos = Math.cos(alpha);
        const sin = Math.sin(alpha);
        const ct = new mxPoint(state.getCenterX(), state.getCenterY());
        const cx = new mxPoint(pState.getCenterX(), pState.getCenterY());
        const pt = mxUtils.getRotatedPoint(ct, cos, sin, cx);
        state.x = pt.x - state.width / 2;
        state.y = pt.y - state.height / 2;
      }
    }
    this.updateVertexLabelOffset(state);
  }

  /**
   * Function: updateEdgeState
   *
   * Validates the given cell state.
   */
  updateEdgeState(state: any, geo: any): void {
    const source = state.getVisibleTerminalState(true);
    const target = state.getVisibleTerminalState(false);
    if ((this.graph.model.getTerminal(state.cell, true) && !source) || (!source && !geo.getTerminalPoint(true)) || (this.graph.model.getTerminal(state.cell, false) && !target) || (!target && !geo.getTerminalPoint(false))) {
      this.clear(state.cell, true);
    } else {
      this.updateFixedTerminalPoints(state, source, target);
      this.updatePoints(state, geo.points, source, target);
      this.updateFloatingTerminalPoints(state, source, target);
      const pts = state.absolutePoints;
      if (state.cell != this.currentRoot && (!pts || pts.length < 2 || !pts[0] || !pts[pts.length - 1])) {
        this.clear(state.cell, true);
      } else {
        this.updateEdgeBounds(state);
        this.updateEdgeLabelOffset(state);
      }
    }
  }

  /**
   * Function: updateVertexLabelOffset
   *
   * Updates the absoluteOffset of the given vertex cell state. This takes
   * into account the label position styles.
   *
   * Parameters:
   *
   * state - <mxCellState> whose absolute offset should be updated.
   */
  updateVertexLabelOffset(state: any): void {
    const h = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
    if (h == mxConstants.ALIGN_LEFT) {
      let lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
      if (!!lw) {
        lw *= this.scale;
      } else {
        lw = state.width;
      }
      state.absoluteOffset.x -= lw;
    } else if (h == mxConstants.ALIGN_RIGHT) {
      state.absoluteOffset.x += state.width;
    } else if (h == mxConstants.ALIGN_CENTER) {
      const lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
      if (!!lw) {
        const align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
        let dx = 0;
        if (align == mxConstants.ALIGN_CENTER) {
          dx = 0.5;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          dx = 1;
        }
        if (dx != 0) {
          state.absoluteOffset.x -= (lw * this.scale - state.width) * dx;
        }
      }
    }
    const v = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
    if (v == mxConstants.ALIGN_TOP) {
      state.absoluteOffset.y -= state.height;
    } else if (v == mxConstants.ALIGN_BOTTOM) {
      state.absoluteOffset.y += state.height;
    }
  }

  /**
   * Function: resetValidationState
   *
   * Resets the current validation state.
   */
  resetValidationState(): void {
    this.lastNode = undefined;
    this.lastHtmlNode = undefined;
    this.lastForegroundNode = undefined;
    this.lastForegroundHtmlNode = undefined;
  }

  /**
   * Function: stateValidated
   *
   * Invoked when a state has been processed in <validatePoints>. This is used
   * to update the order of the DOM nodes of the shape.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the cell state.
   */
  stateValidated(state: any): void {
    const fg = (this.graph.getModel().isEdge(state.cell) && this.graph.keepEdgesInForeground) || (this.graph.getModel().isVertex(state.cell) && this.graph.keepEdgesInBackground);
    const htmlNode = (fg) ? this.lastForegroundHtmlNode || this.lastHtmlNode : this.lastHtmlNode;
    const node = (fg) ? this.lastForegroundNode || this.lastNode : this.lastNode;
    const result = this.graph.cellRenderer.insertStateAfter(state, node, htmlNode);
    if (fg) {
      this.lastForegroundHtmlNode = result[1];
      this.lastForegroundNode = result[0];
    } else {
      this.lastHtmlNode = result[1];
      this.lastNode = result[0];
    }
  }

  /**
   * Function: updateFixedTerminalPoints
   *
   * Sets the initial absolute terminal points in the given state before the edge
   * style is computed.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose initial terminal points should be updated.
   * source - <mxCellState> which represents the source terminal.
   * target - <mxCellState> which represents the target terminal.
   */
  updateFixedTerminalPoints(edge: any, source: any, target: string): void {
    this.updateFixedTerminalPoint(edge, source, true, this.graph.getConnectionConstraint(edge, source, true));
    this.updateFixedTerminalPoint(edge, target, false, this.graph.getConnectionConstraint(edge, target, false));
  }

  /**
   * Function: updateFixedTerminalPoint
   *
   * Sets the fixed source or target terminal point on the given edge.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be updated.
   * terminal - <mxCellState> which represents the actual terminal.
   * source - Boolean that specifies if the terminal is the source.
   * constraint - <mxConnectionConstraint> that specifies the connection.
   */
  updateFixedTerminalPoint(edge: any, terminal: any, source: any, constraint: any): void {
    edge.setAbsoluteTerminalPoint(this.getFixedTerminalPoint(edge, terminal, source, constraint), source);
  }

  /**
   * Function: getFixedTerminalPoint
   *
   * Returns the fixed source or target terminal point for the given edge.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be returned.
   * terminal - <mxCellState> which represents the actual terminal.
   * source - Boolean that specifies if the terminal is the source.
   * constraint - <mxConnectionConstraint> that specifies the connection.
   */
  getFixedTerminalPoint(edge: any, terminal: any, source: any, constraint: any): any {
    let pt = undefined;
    if (!!constraint) {
      pt = this.graph.getConnectionPoint(terminal, constraint, this.graph.isOrthogonal(edge));
    }
    if (!pt && !terminal) {
      const s = this.scale;
      const tr = this.translate;
      const orig = edge.origin;
      const geo = this.graph.getCellGeometry(edge.cell);
      pt = geo.getTerminalPoint(source);
      if (!!pt) {
        pt = new mxPoint(s * (tr.x + pt.x + orig.x), s * (tr.y + pt.y + orig.y));
      }
    }
    return pt;
  }

  /**
   * Function: updateBoundsFromStencil
   *
   * Updates the bounds of the given cell state to reflect the bounds of the stencil
   * if it has a fixed aspect and returns the previous bounds as an <mxRectangle> if
   * the bounds have been modified or null otherwise.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose bounds should be updated.
   */
  updateBoundsFromStencil(state: any): any {
    let previous = undefined;
    if (!!state && !!state.shape && !!state.shape.stencil && state.shape.stencil.aspect == 'fixed') {
      previous = mxRectangle.fromRectangle(state);
      const asp = state.shape.stencil.computeAspect(state.style, state.x, state.y, state.width, state.height);
      state.setRect(asp.x, asp.y, state.shape.stencil.w0 * asp.width, state.shape.stencil.h0 * asp.height);
    }
    return previous;
  }

  /**
   * Function: updatePoints
   *
   * Updates the absolute points in the given state using the specified array
   * of <mxPoints> as the relative points.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose absolute points should be updated.
   * points - Array of <mxPoints> that constitute the relative points.
   * source - <mxCellState> that represents the source terminal.
   * target - <mxCellState> that represents the target terminal.
   */
  updatePoints(edge: any, points: any, source: any, target: string): void {
    if (!!edge) {
      const pts = [];
      pts.push(edge.absolutePoints[0]);
      const edgeStyle = this.getEdgeStyle(edge, points, source, target);
      if (!!edgeStyle) {
        const src = this.getTerminalPort(edge, source, true);
        const trg = this.getTerminalPort(edge, target, false);
        const srcBounds = this.updateBoundsFromStencil(src);
        const trgBounds = this.updateBoundsFromStencil(trg);
        edgeStyle(edge, src, trg, points, pts);
        if (!!srcBounds) {
          src.setRect(srcBounds.x, srcBounds.y, srcBounds.width, srcBounds.height);
        }
        if (!!trgBounds) {
          trg.setRect(trgBounds.x, trgBounds.y, trgBounds.width, trgBounds.height);
        }
      } else if (!!points) {
        for (let i = 0; i < points.length; i++) {
          if (points[i]) {
            const pt = mxUtils.clone(points[i]);
            pts.push(this.transformControlPoint(edge, pt));
          }
        }
      }
      const tmp = edge.absolutePoints;
      pts.push(tmp[tmp.length - 1]);
      edge.absolutePoints = pts;
    }
  }

  /**
   * Function: transformControlPoint
   *
   * Transforms the given control point to an absolute point.
   */
  transformControlPoint(state: any, pt: any): any {
    if (!!state && !!pt) {
      const orig = state.origin;
      return new mxPoint(this.scale * (pt.x + this.translate.x + orig.x), this.scale * (pt.y + this.translate.y + orig.y));
    }
    return null;
  }

  /**
   * Function: isLoopStyleEnabled
   *
   * Returns true if the given edge should be routed with <mxGraph.defaultLoopStyle>
   * or the <mxConstants.STYLE_LOOP> defined for the given edge. This implementation
   * returns true if the given edge is a loop and does not have connections constraints
   * associated.
   */
  isLoopStyleEnabled(edge: any, points: any, source: any, target: string): boolean {
    const sc = this.graph.getConnectionConstraint(edge, source, true);
    const tc = this.graph.getConnectionConstraint(edge, target, false);
    if ((!points || points.length < 2) && (!mxUtils.getValue(edge.style, mxConstants.STYLE_ORTHOGONAL_LOOP, false) || ((!sc || !sc.point) && (!tc || !tc.point)))) {
      return !!source && source == target;
    }
    return false;
  }

  /**
   * Function: getEdgeStyle
   *
   * Returns the edge style function to be used to render the given edge state.
   */
  getEdgeStyle(edge: any, points: any, source: any, target: string): any {
    let edgeStyle = this.isLoopStyleEnabled(edge, points, source, target) ? mxUtils.getValue(edge.style, mxConstants.STYLE_LOOP, this.graph.defaultLoopStyle) : (!mxUtils.getValue(edge.style, mxConstants.STYLE_NOEDGESTYLE, false) ? edge.style[mxConstants.STYLE_EDGE] : null);
    if (typeof (edgeStyle) == 'string') {
      let tmp = mxStyleRegistry.getValue(edgeStyle);
      if (!tmp && this.isAllowEval()) {
        tmp = mxUtils.eval(edgeStyle);
      }
      edgeStyle = tmp;
    }
    if (typeof (edgeStyle) == 'function') {
      return edgeStyle;
    }
    return null;
  }

  /**
   * Function: updateFloatingTerminalPoints
   *
   * Updates the terminal points in the given state after the edge style was
   * computed for the edge.
   *
   * Parameters:
   *
   * state - <mxCellState> whose terminal points should be updated.
   * source - <mxCellState> that represents the source terminal.
   * target - <mxCellState> that represents the target terminal.
   */
  updateFloatingTerminalPoints(state: any, source: any, target: string): void {
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    if (!pe && !!target) {
      this.updateFloatingTerminalPoint(state, target, source, false);
    }
    if (!p0 && !!source) {
      this.updateFloatingTerminalPoint(state, source, target, true);
    }
  }

  /**
   * Function: updateFloatingTerminalPoint
   *
   * Updates the absolute terminal point in the given state for the given
   * start and end state, where start is the source if source is true.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be updated.
   * start - <mxCellState> for the terminal on "this" side of the edge.
   * end - <mxCellState> for the terminal on the other side of the edge.
   * source - Boolean indicating if start is the source terminal state.
   */
  updateFloatingTerminalPoint(edge: any, start: any, end: any, source: any): void {
    edge.setAbsoluteTerminalPoint(this.getFloatingTerminalPoint(edge, start, end, source), source);
  }

  /**
   * Function: getFloatingTerminalPoint
   *
   * Returns the floating terminal point for the given edge, start and end
   * state, where start is the source if source is true.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be returned.
   * start - <mxCellState> for the terminal on "this" side of the edge.
   * end - <mxCellState> for the terminal on the other side of the edge.
   * source - Boolean indicating if start is the source terminal state.
   */
  getFloatingTerminalPoint(edge: any, start: any, end: any, source: any): any {
    start = this.getTerminalPort(edge, start, source);
    let next = this.getNextPoint(edge, end, source);
    const orth = this.graph.isOrthogonal(edge);
    const alpha = mxUtils.toRadians(Number(start.style[mxConstants.STYLE_ROTATION] || '0'));
    const center = new mxPoint(start.getCenterX(), start.getCenterY());
    if (alpha != 0) {
      const cos = Math.cos(-alpha);
      const sin = Math.sin(-alpha);
      next = mxUtils.getRotatedPoint(next, cos, sin, center);
    }
    let border = parseFloat(edge.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
    border += parseFloat(edge.style[(source) ? mxConstants.STYLE_SOURCE_PERIMETER_SPACING : mxConstants.STYLE_TARGET_PERIMETER_SPACING] || 0);
    let pt = this.getPerimeterPoint(start, next, alpha == 0 && orth, border);
    if (alpha != 0) {
      const cos = Math.cos(alpha);
      const sin = Math.sin(alpha);
      pt = mxUtils.getRotatedPoint(pt, cos, sin, center);
    }
    return pt;
  }

  /**
   * Function: getTerminalPort
   *
   * Returns an <mxCellState> that represents the source or target terminal or
   * port for the given edge.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the state of the edge.
   * terminal - <mxCellState> that represents the terminal.
   * source - Boolean indicating if the given terminal is the source terminal.
   */
  getTerminalPort(state: any, terminal: any, source: any): any {
    const key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
    const id = mxUtils.getValue(state.style, key);
    if (!!id) {
      const tmp = this.getState(this.graph.getModel().getCell(id));
      if (!!tmp) {
        terminal = tmp;
      }
    }
    return terminal;
  }

  /**
   * Function: getPerimeterPoint
   *
   * Returns an <mxPoint> that defines the location of the intersection point between
   * the perimeter and the line between the center of the shape and the given point.
   *
   * Parameters:
   *
   * terminal - <mxCellState> for the source or target terminal.
   * next - <mxPoint> that lies outside of the given terminal.
   * orthogonal - Boolean that specifies if the orthogonal projection onto
   * the perimeter should be returned. If this is false then the intersection
   * of the perimeter and the line between the next and the center point is
   * returned.
   * border - Optional border between the perimeter and the shape.
   */
  getPerimeterPoint(terminal: any, next: any, orthogonal: any, border: any): any {
    let point = undefined;
    if (!!terminal) {
      const perimeter = this.getPerimeterFunction(terminal);
      if (!!perimeter && !!next) {
        const bounds = this.getPerimeterBounds(terminal, border);
        if (bounds.width > 0 || bounds.height > 0) {
          point = new mxPoint(next.x, next.y);
          let flipH = false;
          let flipV = false;
          if (this.graph.model.isVertex(terminal.cell)) {
            flipH = mxUtils.getValue(terminal.style, mxConstants.STYLE_FLIPH, 0) == 1;
            flipV = mxUtils.getValue(terminal.style, mxConstants.STYLE_FLIPV, 0) == 1;
            if (!!terminal.shape && !!terminal.shape.stencil) {
              flipH = (mxUtils.getValue(terminal.style, 'stencilFlipH', 0) == 1) || flipH;
              flipV = (mxUtils.getValue(terminal.style, 'stencilFlipV', 0) == 1) || flipV;
            }
            if (flipH) {
              point.x = 2 * bounds.getCenterX() - point.x;
            }
            if (flipV) {
              point.y = 2 * bounds.getCenterY() - point.y;
            }
          }
          point = perimeter(bounds, terminal, point, orthogonal);
          if (!!point) {
            if (flipH) {
              point.x = 2 * bounds.getCenterX() - point.x;
            }
            if (flipV) {
              point.y = 2 * bounds.getCenterY() - point.y;
            }
          }
        }
      }
      if (!point) {
        point = this.getPoint(terminal);
      }
    }
    return point;
  }

  /**
   * Function: getRoutingCenterX
   *
   * Returns the x-coordinate of the center point for automatic routing.
   */
  getRoutingCenterX(state: any): any {
    const f = (!!state.style) ? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_X]) || 0 : 0;
    return state.getCenterX() + f * state.width;
  }

  /**
   * Function: getRoutingCenterY
   *
   * Returns the y-coordinate of the center point for automatic routing.
   */
  getRoutingCenterY(state: any): any {
    const f = (!!state.style) ? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_Y]) || 0 : 0;
    return state.getCenterY() + f * state.height;
  }

  /**
   * Function: getPerimeterBounds
   *
   * Returns the perimeter bounds for the given terminal, edge pair as an
   * <mxRectangle>.
   *
   * If you have a model where each terminal has a relative child that should
   * act as the graphical endpoint for a connection from/to the terminal, then
   * this method can be replaced as follows:
   *
   * (code)
   * var oldGetPerimeterBounds = mxGraphView.prototype.getPerimeterBounds;
   * mxGraphView.prototype.getPerimeterBounds = function(terminal, edge, isSource)
   * {
   *   var model = this.graph.getModel();
   *   var childCount = model.getChildCount(terminal.cell);
   *
   *   if (childCount > 0)
   *   {
   *     var child = model.getChildAt(terminal.cell, 0);
   *     var geo = model.getGeometry(child);
   *
   *     if (!!geo &&
   *         geo.relative)
   *     {
   *       var state = this.getState(child);
   *
   *       if (!!state)
   *       {
   *         terminal = state;
   *       }
   *     }
   *   }
   *
   *   return oldGetPerimeterBounds.apply(this, arguments);
   * };
   * (end)
   *
   * Parameters:
   *
   * terminal - <mxCellState> that represents the terminal.
   * border - Number that adds a border between the shape and the perimeter.
   */
  getPerimeterBounds(terminal: any, border: any): any {
    border = (!!border) ? border : 0;
    if (!!terminal) {
      border += parseFloat(terminal.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
    }
    return terminal.getPerimeterBounds(border * this.scale);
  }

  /**
   * Function: getPerimeterFunction
   *
   * Returns the perimeter function for the given state.
   */
  getPerimeterFunction(state: any): any {
    let perimeter = state.style[mxConstants.STYLE_PERIMETER];
    if (typeof (perimeter) == 'string') {
      let tmp = mxStyleRegistry.getValue(perimeter);
      if (!tmp && this.isAllowEval()) {
        tmp = mxUtils.eval(perimeter);
      }
      perimeter = tmp;
    }
    if (typeof (perimeter) == 'function') {
      return perimeter;
    }
    return null;
  }

  /**
   * Function: getNextPoint
   *
   * Returns the nearest point in the list of absolute points or the center
   * of the opposite terminal.
   *
   * Parameters:
   *
   * edge - <mxCellState> that represents the edge.
   * opposite - <mxCellState> that represents the opposite terminal.
   * source - Boolean indicating if the next point for the source or target
   * should be returned.
   */
  getNextPoint(edge: any, opposite: any, source: any): any {
    const pts = edge.absolutePoints;
    let point = undefined;
    if (!!pts && pts.length >= 2) {
      const count = pts.length;
      point = pts[(source) ? Math.min(1, count - 1) : Math.max(0, count - 2)];
    }
    if (!point && !!opposite) {
      point = new mxPoint(opposite.getCenterX(), opposite.getCenterY());
    }
    return point;
  }

  /**
   * Function: getVisibleTerminal
   *
   * Returns the nearest ancestor terminal that is visible. The edge appears
   * to be connected to this terminal on the display. The result of this method
   * is cached in <mxCellState.getVisibleTerminalState>.
   *
   * Parameters:
   *
   * edge - <mxCell> whose visible terminal should be returned.
   * source - Boolean that specifies if the source or target terminal
   * should be returned.
   */
  getVisibleTerminal(edge: any, source: any): any {
    const model = this.graph.getModel();
    let result = model.getTerminal(edge, source);
    let best = result;
    while (!!result && result != this.currentRoot) {
      if (!this.graph.isCellVisible(best) || this.isCellCollapsed(result)) {
        best = result;
      }
      result = model.getParent(result);
    }
    if (!!best && (!model.contains(best) || model.getParent(best) == model.getRoot() || best == this.currentRoot)) {
      best = undefined;
    }
    return best;
  }

  /**
   * Function: updateEdgeBounds
   *
   * Updates the given state using the bounding box of t
   * he absolute points.
   * Also updates <mxCellState.terminalDistance>, <mxCellState.length> and
   * <mxCellState.segments>.
   *
   * Parameters:
   *
   * state - <mxCellState> whose bounds should be updated.
   */
  updateEdgeBounds(state: any): void {
    const points = state.absolutePoints;
    const p0 = points[0];
    const pe = points[points.length - 1];
    if (p0.x != pe.x || p0.y != pe.y) {
      const dx = pe.x - p0.x;
      const dy = pe.y - p0.y;
      state.terminalDistance = Math.sqrt(dx * dx + dy * dy);
    } else {
      state.terminalDistance = 0;
    }
    let length = 0;
    const segments = [];
    let pt = p0;
    if (!!pt) {
      let minX = pt.x;
      let minY = pt.y;
      let maxX = minX;
      let maxY = minY;
      for (let i = 1; i < points.length; i++) {
        const tmp = points[i];
        if (!!tmp) {
          const dx = pt.x - tmp.x;
          const dy = pt.y - tmp.y;
          const segment = Math.sqrt(dx * dx + dy * dy);
          segments.push(segment);
          length += segment;
          pt = tmp;
          minX = Math.min(pt.x, minX);
          minY = Math.min(pt.y, minY);
          maxX = Math.max(pt.x, maxX);
          maxY = Math.max(pt.y, maxY);
        }
      }
      state.length = length;
      state.segments = segments;
      const markerSize = 1;
      state.x = minX;
      state.y = minY;
      state.width = Math.max(markerSize, maxX - minX);
      state.height = Math.max(markerSize, maxY - minY);
    }
  }

  /**
   * Function: getPoint
   *
   * Returns the absolute point on the edge for the given relative
   * <mxGeometry> as an <mxPoint>. The edge is represented by the given
   * <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the state of the parent edge.
   * geometry - <mxGeometry> that represents the relative location.
   */
  getPoint(state: any, geometry: any): any {
    let x = state.getCenterX();
    let y = state.getCenterY();
    if (!!state.segments && (!geometry || geometry.relative)) {
      const gx = (!!geometry) ? geometry.x / 2 : 0;
      const pointCount = state.absolutePoints.length;
      const dist = Math.round((gx + 0.5) * state.length);
      let segment = state.segments[0];
      let length = 0;
      let index = 1;
      while (dist >= Math.round(length + segment) && index < pointCount - 1) {
        length += segment;
        segment = state.segments[index++];
      }
      const factor = (segment == 0) ? 0 : (dist - length) / segment;
      const p0 = state.absolutePoints[index - 1];
      const pe = state.absolutePoints[index];
      if (!!p0 && !!pe) {
        let gy = 0;
        let offsetX = 0;
        let offsetY = 0;
        if (!!geometry) {
          gy = geometry.y;
          const offset = geometry.offset;
          if (!!offset) {
            offsetX = offset.x;
            offsetY = offset.y;
          }
        }
        const dx = pe.x - p0.x;
        const dy = pe.y - p0.y;
        const nx = (segment == 0) ? 0 : dy / segment;
        const ny = (segment == 0) ? 0 : dx / segment;
        x = p0.x + dx * factor + (nx * gy + offsetX) * this.scale;
        y = p0.y + dy * factor - (ny * gy - offsetY) * this.scale;
      }
    } else if (!!geometry) {
      const offset = geometry.offset;
      if (!!offset) {
        x += offset.x;
        y += offset.y;
      }
    }
    return new mxPoint(x, y);
  }

  /**
   * Function: getRelativePoint
   *
   * Gets the relative point that describes the given, absolute label
   * position for the given edge state.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the state of the parent edge.
   * x - Specifies the x-coordinate of the absolute label location.
   * y - Specifies the y-coordinate of the absolute label location.
   */
  getRelativePoint(edgeState: any, x: number, y: number): any {
    const model = this.graph.getModel();
    const geometry = model.getGeometry(edgeState.cell);
    if (!!geometry) {
      const pointCount = edgeState.absolutePoints.length;
      if (geometry.relative && pointCount > 1) {
        const totalLength = edgeState.length;
        const segments = edgeState.segments;
        let p0 = edgeState.absolutePoints[0];
        let pe = edgeState.absolutePoints[1];
        let minDist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
        let index = 0;
        let tmp = 0;
        let length = 0;
        for (let i = 2; i < pointCount; i++) {
          tmp += segments[i - 2];
          pe = edgeState.absolutePoints[i];
          const dist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
          if (dist <= minDist) {
            minDist = dist;
            index = i - 1;
            length = tmp;
          }
          p0 = pe;
        }
        const seg = segments[index];
        p0 = edgeState.absolutePoints[index];
        pe = edgeState.absolutePoints[index + 1];
        const x2 = p0.x;
        const y2 = p0.y;
        const x1 = pe.x;
        const y1 = pe.y;
        let px = x;
        let py = y;
        const xSegment = x2 - x1;
        const ySegment = y2 - y1;
        px -= x1;
        py -= y1;
        let projlenSq = 0;
        px = xSegment - px;
        py = ySegment - py;
        const dotprod = px * xSegment + py * ySegment;
        if (dotprod <= 0) {
          projlenSq = 0;
        } else {
          projlenSq = dotprod * dotprod / (xSegment * xSegment + ySegment * ySegment);
        }
        let projlen = Math.sqrt(projlenSq);
        if (projlen > seg) {
          projlen = seg;
        }
        let yDistance = Math.sqrt(mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y));
        const direction = mxUtils.relativeCcw(p0.x, p0.y, pe.x, pe.y, x, y);
        if (direction == -1) {
          yDistance = -yDistance;
        }
        return new mxPoint(((totalLength / 2 - length - projlen) / totalLength) * -2, yDistance / this.scale);
      }
    }
    return new mxPoint();
  }

  /**
   * Function: updateEdgeLabelOffset
   *
   * Updates <mxCellState.absoluteOffset> for the given state. The absolute
   * offset is normally used for the position of the edge label. Is is
   * calculated from the geometry as an absolute offset from the center
   * between the two endpoints if the geometry is absolute, or as the
   * relative distance between the center along the line and the absolute
   * orthogonal distance if the geometry is relative.
   *
   * Parameters:
   *
   * state - <mxCellState> whose absolute offset should be updated.
   */
  updateEdgeLabelOffset(state: any): void {
    const points = state.absolutePoints;
    state.absoluteOffset.x = state.getCenterX();
    state.absoluteOffset.y = state.getCenterY();
    if (!!points && points.length > 0 && !!state.segments) {
      const geometry = this.graph.getCellGeometry(state.cell);
      if (geometry.relative) {
        const offset = this.getPoint(state, geometry);
        if (!!offset) {
          state.absoluteOffset = offset;
        }
      } else {
        const p0 = points[0];
        const pe = points[points.length - 1];
        if (!!p0 && !!pe) {
          const dx = pe.x - p0.x;
          const dy = pe.y - p0.y;
          let x0 = 0;
          let y0 = 0;
          const off = geometry.offset;
          if (!!off) {
            x0 = off.x;
            y0 = off.y;
          }
          const x = p0.x + dx / 2 + x0 * this.scale;
          const y = p0.y + dy / 2 + y0 * this.scale;
          state.absoluteOffset.x = x;
          state.absoluteOffset.y = y;
        }
      }
    }
  }

  /**
   * Function: getState
   *
   * Returns the <mxCellState> for the given cell. If create is true, then
   * the state is created if it does not yet exist.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the <mxCellState> should be returned.
   * create - Optional boolean indicating if a new state should be created
   * if it does not yet exist. Default is false.
   */
  getState(cell: mxCell, create: any): any {
    create = create || false;
    let state = undefined;
    if (!!cell) {
      state = this.states.get(cell);
      if (create && (!state || this.updateStyle) && this.graph.isCellVisible(cell)) {
        if (!state) {
          state = this.createState(cell);
          this.states.put(cell, state);
        } else {
          state.style = this.graph.getCellStyle(cell);
        }
      }
    }
    return state;
  }

  /**
   * Function: isRendering
   *
   * Returns <rendering>.
   */
  isRendering(): boolean {
    return this.rendering;
  }

  /**
   * Function: setRendering
   *
   * Sets <rendering>.
   */
  setRendering(value: any): void {
    this.rendering = value;
  }

  /**
   * Function: isAllowEval
   *
   * Returns <allowEval>.
   */
  isAllowEval(): boolean {
    return this.allowEval;
  }

  /**
   * Function: setAllowEval
   *
   * Sets <allowEval>.
   */
  setAllowEval(value: any): void {
    this.allowEval = value;
  }

  /**
   * Function: getStates
   *
   * Returns <states>.
   */
  getStates(): any {
    return this.states;
  }

  /**
   * Function: setStates
   *
   * Sets <states>.
   */
  setStates(value: any): void {
    this.states = value;
  }

  /**
   * Function: getCellStates
   *
   * Returns the <mxCellStates> for the given array of <mxCells>. The array
   * contains all states that are not null, that is, the returned array may
   * have less elements than the given array. If no argument is given, then
   * this returns <states>.
   */
  getCellStates(cells: mxCell[]): any {
    if (!cells) {
      return this.states;
    } else {
      const result = [];
      for (let i = 0; i < cells.length; i++) {
        const state = this.getState(cells[i]);
        if (!!state) {
          result.push(state);
        }
      }
      return result;
    }
  }

  /**
   * Function: removeState
   *
   * Removes and returns the <mxCellState> for the given cell.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the <mxCellState> should be removed.
   */
  removeState(cell: mxCell): any {
    let state = undefined;
    if (!!cell) {
      state = this.states.remove(cell);
      if (!!state) {
        this.graph.cellRenderer.destroy(state);
        state.invalid = true;
        state.destroy();
      }
    }
    return state;
  }

  /**
   * Function: createState
   *
   * Creates and returns an <mxCellState> for the given cell and initializes
   * it using <mxCellRenderer.initialize>.
   *
   * Parameters:
   *
   * cell - <mxCell> for which a new <mxCellState> should be created.
   */
  createState(cell: mxCell): any {
    return new mxCellState(this, cell, this.graph.getCellStyle(cell));
  }

  /**
   * Function: getCanvas
   *
   * Returns the DOM node that contains the background-, draw- and
   * overlay- and decoratorpanes.
   */
  getCanvas(): any {
    return this.canvas;
  }

  /**
   * Function: getBackgroundPane
   *
   * Returns the DOM node that represents the background layer.
   */
  getBackgroundPane(): any {
    return this.backgroundPane;
  }

  /**
   * Function: getDrawPane
   *
   * Returns the DOM node that represents the main drawing layer.
   */
  getDrawPane(): any {
    return this.drawPane;
  }

  /**
   * Function: getOverlayPane
   *
   * Returns the DOM node that represents the layer above the drawing layer.
   */
  getOverlayPane(): any {
    return this.overlayPane;
  }

  /**
   * Function: getDecoratorPane
   *
   * Returns the DOM node that represents the topmost drawing layer.
   */
  getDecoratorPane(): any {
    return this.decoratorPane;
  }

  /**
   * Function: isContainerEvent
   *
   * Returns true if the event origin is one of the drawing panes or
   * containers of the view.
   */
  isContainerEvent(evt: Event): boolean {
    const source = mxEvent.getSource(evt);
    return (source == this.graph.container || source.parentNode == this.backgroundPane || (!!source.parentNode && source.parentNode.parentNode == this.backgroundPane) || source == this.canvas.parentNode || source == this.canvas || source == this.backgroundPane || source == this.drawPane || source == this.overlayPane || source == this.decoratorPane);
  }

  /**
   * Function: isScrollEvent
   *
   * Returns true if the event origin is one of the scrollbars of the
   * container in IE. Such events are ignored.
   */
  isScrollEvent(evt: Event): boolean {
    const offset = mxUtils.getOffset(this.graph.container);
    const pt = new mxPoint(evt.clientX - offset.x, evt.clientY - offset.y);
    const outWidth = this.graph.container.offsetWidth;
    const inWidth = this.graph.container.clientWidth;
    if (outWidth > inWidth && pt.x > inWidth + 2 && pt.x <= outWidth) {
      return true;
    }
    const outHeight = this.graph.container.offsetHeight;
    const inHeight = this.graph.container.clientHeight;
    if (outHeight > inHeight && pt.y > inHeight + 2 && pt.y <= outHeight) {
      return true;
    }
    return false;
  }

  /**
   * Function: init
   *
   * Initializes the graph event dispatch loop for the specified container
   * and invokes <create> to create the required DOM nodes for the display.
   */
  init(): void {
    this.installListeners();
    const graph = this.graph;
    if (graph.dialect == mxConstants.DIALECT_SVG) {
      this.createSvg();
    } else if (graph.dialect == mxConstants.DIALECT_VML) {
      this.createVml();
    } else {
      this.createHtml();
    }
  }

  /**
   * Function: installListeners
   *
   * Installs the required listeners in the container.
   */
  installListeners(): any {
    const graph = this.graph;
    const container = graph.container;
    if (!!container) {
      if (mxClient.IS_TOUCH) {
        mxEvent.addListener(container, 'gesturestart', (evt) => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
        mxEvent.addListener(container, 'gesturechange', (evt) => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
        mxEvent.addListener(container, 'gestureend', (evt) => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
      }
      mxEvent.addGestureListeners(container, (evt) => {
        if (this.isContainerEvent(evt) && ((!mxClient.IS_IE && !mxClient.IS_IE11 && !mxClient.IS_GC && !mxClient.IS_OP && !mxClient.IS_SF) || !this.isScrollEvent(evt))) {
          graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
        }
      }, mxUtils.bind(this, function (evt) {
        if (this.isContainerEvent(evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
        }
      }), (evt) => {
        if (this.isContainerEvent(evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
        }
      });
      mxEvent.addListener(container, 'dblclick', (evt) => {
        if (this.isContainerEvent(evt)) {
          graph.dblClick(evt);
        }
      });
      const getState = function (evt) {
        let state = undefined;
        if (mxClient.IS_TOUCH) {
          const x = mxEvent.getClientX(evt);
          const y = mxEvent.getClientY(evt);
          const pt = mxUtils.convertPoint(container, x, y);
          state = graph.view.getState(graph.getCellAt(pt.x, pt.y));
        }
        return state;
      };
      graph.addMouseListener({
        mouseDown(sender, me) {
          graph.popupMenuHandler.hideMenu();
        }, mouseMove() {
        }, mouseUp() {
        },
      });
      this.moveHandler = (evt) => {
        if (!!graph.tooltipHandler && graph.tooltipHandler.isHideOnHover()) {
          graph.tooltipHandler.hide();
        }
        if (this.captureDocumentGesture && graph.isMouseDown && !!graph.container && !this.isContainerEvent(evt) && graph.container.style.display != 'none' && graph.container.style.visibility != 'hidden' && !mxEvent.isConsumed(evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
        }
      };
      this.endHandler = (evt) => {
        if (this.captureDocumentGesture && graph.isMouseDown && !!graph.container && !this.isContainerEvent(evt) && graph.container.style.display != 'none' && graph.container.style.visibility != 'hidden') {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
        }
      };
      mxEvent.addGestureListeners(document, null, this.moveHandler, this.endHandler);
    }
  }

  /**
   * Function: create
   *
   * Creates the DOM nodes for the HTML display.
   */
  createHtml(): void {
    const container = this.graph.container;
    if (!!container) {
      this.canvas = this.createHtmlPane('100%', '100%');
      this.canvas.style.overflow = 'hidden';
      this.backgroundPane = this.createHtmlPane('1px', '1px');
      this.drawPane = this.createHtmlPane('1px', '1px');
      this.overlayPane = this.createHtmlPane('1px', '1px');
      this.decoratorPane = this.createHtmlPane('1px', '1px');
      this.canvas.appendChild(this.backgroundPane);
      this.canvas.appendChild(this.drawPane);
      this.canvas.appendChild(this.overlayPane);
      this.canvas.appendChild(this.decoratorPane);
      container.appendChild(this.canvas);
      this.updateContainerStyle(container);
      if (mxClient.IS_QUIRKS) {
        const onResize = (evt) => {
          const bounds = this.getGraphBounds();
          const width = bounds.x + bounds.width + this.graph.border;
          const height = bounds.y + bounds.height + this.graph.border;
          this.updateHtmlCanvasSize(width, height);
        };
        mxEvent.addListener(window, 'resize', onResize);
      }
    }
  }

  /**
   * Function: updateHtmlCanvasSize
   *
   * Updates the size of the HTML canvas.
   */
  updateHtmlCanvasSize(width: number, height: number): void {
    if (!!this.graph.container) {
      const ow = this.graph.container.offsetWidth;
      const oh = this.graph.container.offsetHeight;
      if (ow < width) {
        this.canvas.style.width = width + 'px';
      } else {
        this.canvas.style.width = '100%';
      }
      if (oh < height) {
        this.canvas.style.height = height + 'px';
      } else {
        this.canvas.style.height = '100%';
      }
    }
  }

  /**
   * Function: createHtmlPane
   *
   * Creates and returns a drawing pane in HTML (DIV).
   */
  createHtmlPane(width: number, height: number): any {
    const pane = document.createElement('DIV');
    if (!!width && !!height) {
      pane.style.position = 'absolute';
      pane.style.left = '0px';
      pane.style.top = '0px';
      pane.style.width = width;
      pane.style.height = height;
    } else {
      pane.style.position = 'relative';
    }
    return pane;
  }

  /**
   * Function: create
   *
   * Creates the DOM nodes for the VML display.
   */
  createVml(): void {
    const container = this.graph.container;
    if (!!container) {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      this.canvas = this.createVmlPane(width, height);
      this.canvas.style.overflow = 'hidden';
      this.backgroundPane = this.createVmlPane(width, height);
      this.drawPane = this.createVmlPane(width, height);
      this.overlayPane = this.createVmlPane(width, height);
      this.decoratorPane = this.createVmlPane(width, height);
      this.canvas.appendChild(this.backgroundPane);
      this.canvas.appendChild(this.drawPane);
      this.canvas.appendChild(this.overlayPane);
      this.canvas.appendChild(this.decoratorPane);
      container.appendChild(this.canvas);
    }
  }

  /**
   * Function: createVmlPane
   *
   * Creates a drawing pane in VML (group).
   */
  createVmlPane(width: number, height: number): any {
    const pane = document.createElement(mxClient.VML_PREFIX + ':group');
    pane.style.position = 'absolute';
    pane.style.left = '0px';
    pane.style.top = '0px';
    pane.style.width = width + 'px';
    pane.style.height = height + 'px';
    pane.setAttribute('coordsize', width + ',' + height);
    pane.setAttribute('coordorigin', '0,0');
    return pane;
  }

  /**
   * Function: create
   *
   * Creates and returns the DOM nodes for the SVG display.
   */
  createSvg(): void {
    const container = this.graph.container;
    this.canvas = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.backgroundPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.backgroundPane);
    this.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.drawPane);
    this.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.overlayPane);
    this.decoratorPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.decoratorPane);
    const root = document.createElementNS(mxConstants.NS_SVG, 'svg');
    root.style.left = '0px';
    root.style.top = '0px';
    root.style.width = '100%';
    root.style.height = '100%';
    root.style.display = 'block';
    root.appendChild(this.canvas);
    if (mxClient.IS_IE || mxClient.IS_IE11) {
      root.style.overflow = 'hidden';
    }
    if (!!container) {
      container.appendChild(root);
      this.updateContainerStyle(container);
    }
  }

  /**
   * Function: updateContainerStyle
   *
   * Updates the style of the container after installing the SVG DOM elements.
   */
  updateContainerStyle(container: HTMLElement): void {
    const style = mxUtils.getCurrentStyle(container);
    if (!!style && style.position == 'static') {
      container.style.position = 'relative';
    }
    if (mxClient.IS_POINTER) {
      container.style.touchAction = 'none';
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the view and all its resources.
   */
  destroy(): void {
    let root = (!!this.canvas) ? this.canvas.ownerSVGElement : null;
    if (!root) {
      root = this.canvas;
    }
    if (!!root && !!root.parentNode) {
      this.clear(this.currentRoot, true);
      mxEvent.removeGestureListeners(document, null, this.moveHandler, this.endHandler);
      mxEvent.release(this.graph.container);
      root.parentNode.removeChild(root);
      this.moveHandler = undefined;
      this.endHandler = undefined;
      this.canvas = undefined;
      this.backgroundPane = undefined;
      this.drawPane = undefined;
      this.overlayPane = undefined;
      this.decoratorPane = undefined;
    }
  }
}

/**
 * Class: mxCurrentRootChange
 *
 * Action to change the current root in a view.
 *
 * Constructor: mxCurrentRootChange
 *
 * Constructs a change of the current root in the given view.
 */
export class mxCurrentRootChange {
  constructor(view: any, root: any) {
    this.view = view;
    this.root = root;
    this.previous = root;
    this.isUp = !root;
    if (!this.isUp) {
      let tmp = this.view.currentRoot;
      const model = this.view.graph.getModel();
      while (!!tmp) {
        if (tmp == root) {
          this.isUp = true;
          break;
        }
        tmp = model.getParent(tmp);
      }
    }
  }

  view: any;
  root: any;
  previous: any;
  isUp: boolean;

  /**
   * Function: execute
   *
   * Changes the current root of the view.
   */
  execute(): void {
    const tmp = this.view.currentRoot;
    this.view.currentRoot = this.previous;
    this.previous = tmp;
    const translate = this.view.graph.getTranslateForRoot(this.view.currentRoot);
    if (!!translate) {
      this.view.translate = new mxPoint(-translate.x, -translate.y);
    }
    if (this.isUp) {
      this.view.clear(this.view.currentRoot, true);
      this.view.validate();
    } else {
      this.view.refresh();
    }
    const name = (this.isUp) ? mxEvent.UP : mxEvent.DOWN;
    this.view.fireEvent(new mxEventObject(name, 'root', this.view.currentRoot, 'previous', this.previous));
    this.isUp = !this.isUp;
  }
}
