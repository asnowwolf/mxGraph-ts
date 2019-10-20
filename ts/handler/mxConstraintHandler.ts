/**
 * Class: mxConstraintHandler
 *
 * Handles constraints on connection targets. This class is in charge of
 * showing fixed points when the mouse is over a vertex and handles constraints
 * to establish new connections.
 *
 * Constructor: mxConstraintHandler
 *
 * Constructs an new constraint handler.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * factoryMethod - Optional function to create the edge. The function takes
 * the source and target <mxCell> as the first and second argument and
 * returns the <mxCell> that represents the new edge.
 */
export class mxConstraintHandler {
  graph: any;
  resetHandler: Function;
  /**
   * Variable: pointImage
   *
   * <mxImage> to be used as the image for fixed connection points.
   */
  pointImage: mxImage;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean;
  /**
   * Variable: highlightColor
   *
   * Specifies the color for the highlight. Default is <mxConstants.DEFAULT_VALID_COLOR>.
   */
  highlightColor: string;
  focusIcons: any;
  focusHighlight: any;
  currentConstraint: any;
  currentFocusArea: any;
  currentPoint: any;
  currentFocus: any;
  focusPoints: any;
  mouseleaveHandler: Function;
  constraints: any;

  constructor(graph: any) {
    this.graph = graph;
    this.resetHandler = mxUtils.bind(this, function (sender, evt) {
      if (this.currentFocus != null && this.graph.view.getState(this.currentFocus.cell) == null) {
        this.reset();
      } else {
        this.redraw();
      }
    });
    this.graph.model.addListener(mxEvent.CHANGE, this.resetHandler);
    this.graph.view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.resetHandler);
    this.graph.view.addListener(mxEvent.TRANSLATE, this.resetHandler);
    this.graph.view.addListener(mxEvent.SCALE, this.resetHandler);
    this.graph.addListener(mxEvent.ROOT, this.resetHandler);
  }

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   *
   * Parameters:
   *
   * enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Function: reset
   *
   * Resets the state of this handler.
   */
  reset(): void {
    if (this.focusIcons != null) {
      for (let i = 0; i < this.focusIcons.length; i++) {
        this.focusIcons[i].destroy();
      }
      this.focusIcons = null;
    }
    if (this.focusHighlight != null) {
      this.focusHighlight.destroy();
      this.focusHighlight = null;
    }
    this.currentConstraint = null;
    this.currentFocusArea = null;
    this.currentPoint = null;
    this.currentFocus = null;
    this.focusPoints = null;
  }

  /**
   * Function: getTolerance
   *
   * Returns the tolerance to be used for intersecting connection points. This
   * implementation returns <mxGraph.tolerance>.
   *
   * Parameters:
   *
   * me - <mxMouseEvent> whose tolerance should be returned.
   */
  getTolerance(me: any): any {
    return this.graph.getTolerance();
  }

  /**
   * Function: getImageForConstraint
   *
   * Returns the tolerance to be used for intersecting connection points.
   */
  getImageForConstraint(state: any, constraint: any, point: any): any {
    return this.pointImage;
  }

  /**
   * Function: isEventIgnored
   *
   * Returns true if the given <mxMouseEvent> should be ignored in <update>. This
   * implementation always returns false.
   */
  isEventIgnored(me: any, source: any): boolean {
    return false;
  }

  /**
   * Function: isStateIgnored
   *
   * Returns true if the given state should be ignored. This always returns false.
   */
  isStateIgnored(state: any, source: any): boolean {
    return false;
  }

  /**
   * Function: destroyIcons
   *
   * Destroys the <focusIcons> if they exist.
   */
  destroyIcons(): void {
    if (this.focusIcons != null) {
      for (let i = 0; i < this.focusIcons.length; i++) {
        this.focusIcons[i].destroy();
      }
      this.focusIcons = null;
      this.focusPoints = null;
    }
  }

  /**
   * Function: destroyFocusHighlight
   *
   * Destroys the <focusHighlight> if one exists.
   */
  destroyFocusHighlight(): void {
    if (this.focusHighlight != null) {
      this.focusHighlight.destroy();
      this.focusHighlight = null;
    }
  }

  /**
   * Function: isKeepFocusEvent
   *
   * Returns true if the current focused state should not be changed for the given event.
   * This returns true if shift and alt are pressed.
   */
  isKeepFocusEvent(me: any): boolean {
    return mxEvent.isShiftDown(me.getEvent());
  }

  /**
   * Function: getCellForEvent
   *
   * Returns the cell for the given event.
   */
  getCellForEvent(me: any, point: any): any {
    let cell = me.getCell();
    if (cell == null && point != null && (me.getGraphX() != point.x || me.getGraphY() != point.y)) {
      cell = this.graph.getCellAt(point.x, point.y);
    }
    if (cell != null && !this.graph.isCellConnectable(cell)) {
      const parent = this.graph.getModel().getParent(cell);
      if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent)) {
        cell = parent;
      }
    }
    return (this.graph.isCellLocked(cell)) ? null : cell;
  }

  /**
   * Function: update
   *
   * Updates the state of this handler based on the given <mxMouseEvent>.
   * Source is a boolean indicating if the cell is a source or target.
   */
  update(me: any, source: any, existingEdge: any, point: any): any {
    if (this.isEnabled() && !this.isEventIgnored(me)) {
      if (this.mouseleaveHandler == null && this.graph.container != null) {
        this.mouseleaveHandler = mxUtils.bind(this, function () {
          this.reset();
        });
        mxEvent.addListener(this.graph.container, 'mouseleave', this.resetHandler);
      }
      const tol = this.getTolerance(me);
      const x = (point != null) ? point.x : me.getGraphX();
      const y = (point != null) ? point.y : me.getGraphY();
      const grid = new mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);
      const mouse = new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol);
      const state = this.graph.view.getState(this.getCellForEvent(me, point));
      if (!this.isKeepFocusEvent(me) && (this.currentFocusArea == null || this.currentFocus == null || (state != null) || !this.graph.getModel().isVertex(this.currentFocus.cell) || !mxUtils.intersects(this.currentFocusArea, mouse)) && (state != this.currentFocus)) {
        this.currentFocusArea = null;
        this.currentFocus = null;
        this.setFocus(me, state, source);
      }
      this.currentConstraint = null;
      this.currentPoint = null;
      let minDistSq = null;
      if (this.focusIcons != null && this.constraints != null && (state == null || this.currentFocus == state)) {
        const cx = mouse.getCenterX();
        const cy = mouse.getCenterY();
        for (let i = 0; i < this.focusIcons.length; i++) {
          const dx = cx - this.focusIcons[i].bounds.getCenterX();
          const dy = cy - this.focusIcons[i].bounds.getCenterY();
          const tmp = dx * dx + dy * dy;
          if ((this.intersects(this.focusIcons[i], mouse, source, existingEdge) || (point != null && this.intersects(this.focusIcons[i], grid, source, existingEdge))) && (minDistSq == null || tmp < minDistSq)) {
            this.currentConstraint = this.constraints[i];
            this.currentPoint = this.focusPoints[i];
            minDistSq = tmp;
            const tmp = this.focusIcons[i].bounds.clone();
            tmp.grow(mxConstants.HIGHLIGHT_SIZE + 1);
            tmp.width -= 1;
            tmp.height -= 1;
            if (this.focusHighlight == null) {
              const hl = this.createHighlightShape();
              hl.dialect = (this.graph.dialect == mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_SVG : mxConstants.DIALECT_VML;
              hl.pointerEvents = false;
              hl.init(this.graph.getView().getOverlayPane());
              this.focusHighlight = hl;
              const getState = mxUtils.bind(this, function () {
                return (this.currentFocus != null) ? this.currentFocus : state;
              });
              mxEvent.redirectMouseEvents(hl.node, this.graph, getState);
            }
            this.focusHighlight.bounds = tmp;
            this.focusHighlight.redraw();
          }
        }
      }
      if (this.currentConstraint == null) {
        this.destroyFocusHighlight();
      }
    } else {
      this.currentConstraint = null;
      this.currentFocus = null;
      this.currentPoint = null;
    }
  }

  /**
   * Function: redraw
   *
   * Transfers the focus to the given state as a source or target terminal. If
   * the handler is not enabled then the outline is painted, but the constraints
   * are ignored.
   */
  redraw(): void {
    if (this.currentFocus != null && this.constraints != null && this.focusIcons != null) {
      const state = this.graph.view.getState(this.currentFocus.cell);
      this.currentFocus = state;
      this.currentFocusArea = new mxRectangle(state.x, state.y, state.width, state.height);
      for (let i = 0; i < this.constraints.length; i++) {
        const cp = this.graph.getConnectionPoint(state, this.constraints[i]);
        const img = this.getImageForConstraint(state, this.constraints[i], cp);
        const bounds = new mxRectangle(Math.round(cp.x - img.width / 2), Math.round(cp.y - img.height / 2), img.width, img.height);
        this.focusIcons[i].bounds = bounds;
        this.focusIcons[i].redraw();
        this.currentFocusArea.add(this.focusIcons[i].bounds);
        this.focusPoints[i] = cp;
      }
    }
  }

  /**
   * Function: setFocus
   *
   * Transfers the focus to the given state as a source or target terminal. If
   * the handler is not enabled then the outline is painted, but the constraints
   * are ignored.
   */
  setFocus(me: any, state: any, source: any): any {
    this.constraints = (state != null && !this.isStateIgnored(state, source) && this.graph.isCellConnectable(state.cell)) ? ((this.isEnabled()) ? (this.graph.getAllConnectionConstraints(state, source) || []) : []) : null;
    if (this.constraints != null) {
      this.currentFocus = state;
      this.currentFocusArea = new mxRectangle(state.x, state.y, state.width, state.height);
      if (this.focusIcons != null) {
        for (let i = 0; i < this.focusIcons.length; i++) {
          this.focusIcons[i].destroy();
        }
        this.focusIcons = null;
        this.focusPoints = null;
      }
      this.focusPoints = [];
      this.focusIcons = [];
      for (let i = 0; i < this.constraints.length; i++) {
        const cp = this.graph.getConnectionPoint(state, this.constraints[i]);
        const img = this.getImageForConstraint(state, this.constraints[i], cp);
        const src = img.src;
        const bounds = new mxRectangle(Math.round(cp.x - img.width / 2), Math.round(cp.y - img.height / 2), img.width, img.height);
        const icon = new mxImageShape(bounds, src);
        icon.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
        icon.preserveImageAspect = false;
        icon.init(this.graph.getView().getDecoratorPane());
        if (mxClient.IS_QUIRKS || document.documentMode == 8) {
          mxEvent.addListener(icon.node, 'dragstart', function (evt) {
            mxEvent.consume(evt);
            return false;
          });
        }
        if (icon.node.previousSibling != null) {
          icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
        }
        const getState = mxUtils.bind(this, function () {
          return (this.currentFocus != null) ? this.currentFocus : state;
        });
        icon.redraw();
        mxEvent.redirectMouseEvents(icon.node, this.graph, getState);
        this.currentFocusArea.add(icon.bounds);
        this.focusIcons.push(icon);
        this.focusPoints.push(cp);
      }
      this.currentFocusArea.grow(this.getTolerance(me));
    } else {
      this.destroyIcons();
      this.destroyFocusHighlight();
    }
  }

  /**
   * Function: createHighlightShape
   *
   * Create the shape used to paint the highlight.
   *
   * Returns true if the given icon intersects the given point.
   */
  createHighlightShape(): any {
    const hl = new mxRectangleShape(null, this.highlightColor, this.highlightColor, mxConstants.HIGHLIGHT_STROKEWIDTH);
    hl.opacity = mxConstants.HIGHLIGHT_OPACITY;
    return hl;
  }

  /**
   * Function: intersects
   *
   * Returns true if the given icon intersects the given rectangle.
   */
  intersects(icon: any, mouse: any, source: any, existingEdge: any): any {
    return mxUtils.intersects(icon.bounds, mouse);
  }

  /**
   * Function: destroy
   *
   * Destroy this handler.
   */
  destroy(): void {
    this.reset();
    if (this.resetHandler != null) {
      this.graph.model.removeListener(this.resetHandler);
      this.graph.view.removeListener(this.resetHandler);
      this.graph.removeListener(this.resetHandler);
      this.resetHandler = null;
    }
    if (this.mouseleaveHandler != null && this.graph.container != null) {
      mxEvent.removeListener(this.graph.container, 'mouseleave', this.mouseleaveHandler);
      this.mouseleaveHandler = null;
    }
  }
}
