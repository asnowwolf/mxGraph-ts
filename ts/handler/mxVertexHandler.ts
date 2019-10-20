/**
 * Class: mxVertexHandler
 *
 * Event handler for resizing cells. This handler is automatically created in
 * <mxGraph.createHandler>.
 *
 * Constructor: mxVertexHandler
 *
 * Constructs an event handler that allows to resize vertices
 * and groups.
 *
 * Parameters:
 *
 * state - <mxCellState> of the cell to be resized.
 */
export class mxVertexHandler {
  state: any;
  escapeHandler: Function;
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: any;
  /**
   * Variable: singleSizer
   *
   * Specifies if only one sizer handle at the bottom, right corner should be
   * used. Default is false.
   */
  singleSizer: boolean;
  /**
   * Variable: index
   *
   * Holds the index of the current handle.
   */
  index: number;
  /**
   * Variable: allowHandleBoundsCheck
   *
   * Specifies if the bounds of handles should be used for hit-detection in IE or
   * if <tolerance> > 0. Default is true.
   * @example true
   */
  allowHandleBoundsCheck: boolean;
  /**
   * Variable: handleImage
   *
   * Optional <mxImage> to be used as handles. Default is null.
   */
  handleImage: any;
  /**
   * Variable: tolerance
   *
   * Optional tolerance for hit-detection in <getHandleForEvent>. Default is 0.
   */
  tolerance: number;
  /**
   * Variable: rotationEnabled
   *
   * Specifies if a rotation handle should be visible. Default is false.
   */
  rotationEnabled: boolean;
  /**
   * Variable: parentHighlightEnabled
   *
   * Specifies if the parent should be highlighted if a child cell is selected.
   * Default is false.
   */
  parentHighlightEnabled: boolean;
  /**
   * Variable: rotationRaster
   *
   * Specifies if rotation steps should be "rasterized" depening on the distance
   * to the handle. Default is true.
   * @example true
   */
  rotationRaster: boolean;
  /**
   * Variable: rotationCursor
   *
   * Specifies the cursor for the rotation handle. Default is 'crosshair'.
   * @example crosshair
   */
  rotationCursor: string;
  /**
   * Variable: livePreview
   *
   * Specifies if resize should change the cell in-place. This is an experimental
   * feature for non-touch devices. Default is false.
   */
  livePreview: boolean;
  /**
   * Variable: manageSizers
   *
   * Specifies if sizers should be hidden and spaced if the vertex is small.
   * Default is false.
   */
  manageSizers: boolean;
  /**
   * Variable: constrainGroupByChildren
   *
   * Specifies if the size of groups should be constrained by the children.
   * Default is false.
   */
  constrainGroupByChildren: boolean;
  /**
   * Variable: rotationHandleVSpacing
   *
   * Vertical spacing for rotation icon. Default is -16.
   */
  rotationHandleVSpacing: number;
  /**
   * Variable: horizontalOffset
   *
   * The horizontal offset for the handles. This is updated in <redrawHandles>
   * if <manageSizers> is true and the sizers are offset horizontally.
   */
  horizontalOffset: number;
  /**
   * Variable: verticalOffset
   *
   * The horizontal offset for the handles. This is updated in <redrawHandles>
   * if <manageSizers> is true and the sizers are offset vertically.
   */
  verticalOffset: number;
  selectionBounds: any;
  bounds: mxRectangle;
  selectionBorder: any;
  sizers: any[];
  labelShape: any;
  rotationShape: any;
  customHandles: any;
  minBounds: any;
  x0: any;
  y0: any;
  /**
   * @example true
   */
  inTolerance: boolean;
  childOffsetX: number;
  childOffsetY: number;
  startX: any;
  startY: any;
  parentState: any;
  preview: any;
  edgeHandlers: any[];
  currentAlpha: any;
  unscaledBounds: any;
  parentHighlight: any;

  constructor(state: any) {
    if (state != null) {
      this.state = state;
      this.init();
      this.escapeHandler = mxUtils.bind(this, function (sender, evt) {
        if (this.livePreview && this.index != null) {
          this.state.view.graph.cellRenderer.redraw(this.state, true);
          this.state.view.invalidate(this.state.cell);
          this.state.invalid = false;
          this.state.view.validate();
        }
        this.reset();
      });
      this.state.view.graph.addListener(mxEvent.ESCAPE, this.escapeHandler);
    }
  }

  /**
   * Function: init
   *
   * Initializes the shapes required for this vertex handler.
   */
  init(): void {
    this.graph = this.state.view.graph;
    this.selectionBounds = this.getSelectionBounds(this.state);
    this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
    this.selectionBorder = this.createSelectionShape(this.bounds);
    this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    this.selectionBorder.pointerEvents = false;
    this.selectionBorder.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
    this.selectionBorder.init(this.graph.getView().getOverlayPane());
    mxEvent.redirectMouseEvents(this.selectionBorder.node, this.graph, this.state);
    if (this.graph.isCellMovable(this.state.cell)) {
      this.selectionBorder.setCursor(mxConstants.CURSOR_MOVABLE_VERTEX);
    }
    if (mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells) {
      const resizable = this.graph.isCellResizable(this.state.cell);
      this.sizers = [];
      if (resizable || (this.graph.isLabelMovable(this.state.cell) && this.state.width >= 2 && this.state.height >= 2)) {
        let i = 0;
        if (resizable) {
          if (!this.singleSizer) {
            this.sizers.push(this.createSizer('nw-resize', i++));
            this.sizers.push(this.createSizer('n-resize', i++));
            this.sizers.push(this.createSizer('ne-resize', i++));
            this.sizers.push(this.createSizer('w-resize', i++));
            this.sizers.push(this.createSizer('e-resize', i++));
            this.sizers.push(this.createSizer('sw-resize', i++));
            this.sizers.push(this.createSizer('s-resize', i++));
          }
          this.sizers.push(this.createSizer('se-resize', i++));
        }
        const geo = this.graph.model.getGeometry(this.state.cell);
        if (geo != null && !geo.relative && !this.graph.isSwimlane(this.state.cell) && this.graph.isLabelMovable(this.state.cell)) {
          this.labelShape = this.createSizer(mxConstants.CURSOR_LABEL_HANDLE, mxEvent.LABEL_HANDLE, mxConstants.LABEL_HANDLE_SIZE, mxConstants.LABEL_HANDLE_FILLCOLOR);
          this.sizers.push(this.labelShape);
        }
      } else if (this.graph.isCellMovable(this.state.cell) && !this.graph.isCellResizable(this.state.cell) && this.state.width < 2 && this.state.height < 2) {
        this.labelShape = this.createSizer(mxConstants.CURSOR_MOVABLE_VERTEX, mxEvent.LABEL_HANDLE, null, mxConstants.LABEL_HANDLE_FILLCOLOR);
        this.sizers.push(this.labelShape);
      }
    }
    if (this.isRotationHandleVisible()) {
      this.rotationShape = this.createSizer(this.rotationCursor, mxEvent.ROTATION_HANDLE, mxConstants.HANDLE_SIZE + 3, mxConstants.HANDLE_FILLCOLOR);
      this.sizers.push(this.rotationShape);
    }
    this.customHandles = this.createCustomHandles();
    this.redraw();
    if (this.constrainGroupByChildren) {
      this.updateMinBounds();
    }
  }

  /**
   * Function: isRotationHandleVisible
   *
   * Returns true if the rotation handle should be showing.
   */
  isRotationHandleVisible(): boolean {
    return this.graph.isEnabled() && this.rotationEnabled && this.graph.isCellRotatable(this.state.cell) && (mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells) && this.state.width >= 2 && this.state.height >= 2;
  }

  /**
   * Function: isConstrainedEvent
   *
   * Returns true if the aspect ratio if the cell should be maintained.
   */
  isConstrainedEvent(me: any): boolean {
    return mxEvent.isShiftDown(me.getEvent()) || this.state.style[mxConstants.STYLE_ASPECT] == 'fixed';
  }

  /**
   * Function: isCenteredEvent
   *
   * Returns true if the center of the vertex should be maintained during the resize.
   */
  isCenteredEvent(state: any, me: any): boolean {
    return false;
  }

  /**
   * Function: createCustomHandles
   *
   * Returns an array of custom handles. This implementation returns null.
   */
  createCustomHandles(): any {
    return null;
  }

  /**
   * Function: updateMinBounds
   *
   * Initializes the shapes required for this vertex handler.
   */
  updateMinBounds(): void {
    const children = this.graph.getChildCells(this.state.cell);
    if (children.length > 0) {
      this.minBounds = this.graph.view.getBounds(children);
      if (this.minBounds != null) {
        const s = this.state.view.scale;
        const t = this.state.view.translate;
        this.minBounds.x -= this.state.x;
        this.minBounds.y -= this.state.y;
        this.minBounds.x /= s;
        this.minBounds.y /= s;
        this.minBounds.width /= s;
        this.minBounds.height /= s;
        this.x0 = this.state.x / s - t.x;
        this.y0 = this.state.y / s - t.y;
      }
    }
  }

  /**
   * Function: getSelectionBounds
   *
   * Returns the mxRectangle that defines the bounds of the selection
   * border.
   */
  getSelectionBounds(state: any): any {
    return new mxRectangle(Math.round(state.x), Math.round(state.y), Math.round(state.width), Math.round(state.height));
  }

  /**
   * Function: createParentHighlightShape
   *
   * Creates the shape used to draw the selection border.
   */
  createParentHighlightShape(bounds: any): any {
    return this.createSelectionShape(bounds);
  }

  /**
   * Function: createSelectionShape
   *
   * Creates the shape used to draw the selection border.
   */
  createSelectionShape(bounds: any): any {
    const shape = new mxRectangleShape(bounds, null, this.getSelectionColor());
    shape.strokewidth = this.getSelectionStrokeWidth();
    shape.isDashed = this.isSelectionDashed();
    return shape;
  }

  /**
   * Function: getSelectionColor
   *
   * Returns <mxConstants.VERTEX_SELECTION_COLOR>.
   */
  getSelectionColor(): string {
    return mxConstants.VERTEX_SELECTION_COLOR;
  }

  /**
   * Function: getSelectionStrokeWidth
   *
   * Returns <mxConstants.VERTEX_SELECTION_STROKEWIDTH>.
   */
  getSelectionStrokeWidth(): any {
    return mxConstants.VERTEX_SELECTION_STROKEWIDTH;
  }

  /**
   * Function: isSelectionDashed
   *
   * Returns <mxConstants.VERTEX_SELECTION_DASHED>.
   */
  isSelectionDashed(): boolean {
    return mxConstants.VERTEX_SELECTION_DASHED;
  }

  /**
   * Function: createSizer
   *
   * Creates a sizer handle for the specified cursor and index and returns
   * the new <mxRectangleShape> that represents the handle.
   */
  createSizer(cursor: any, index: number, size: any, fillColor: string): any {
    size = size || mxConstants.HANDLE_SIZE;
    const bounds = new mxRectangle(0, 0, size, size);
    const sizer = this.createSizerShape(bounds, index, fillColor);
    if (sizer.isHtmlAllowed() && this.state.text != null && this.state.text.node.parentNode == this.graph.container) {
      sizer.bounds.height -= 1;
      sizer.bounds.width -= 1;
      sizer.dialect = mxConstants.DIALECT_STRICTHTML;
      sizer.init(this.graph.container);
    } else {
      sizer.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
      sizer.init(this.graph.getView().getOverlayPane());
    }
    mxEvent.redirectMouseEvents(sizer.node, this.graph, this.state);
    if (this.graph.isEnabled()) {
      sizer.setCursor(cursor);
    }
    if (!this.isSizerVisible(index)) {
      sizer.visible = false;
    }
    return sizer;
  }

  /**
   * Function: isSizerVisible
   *
   * Returns true if the sizer for the given index is visible.
   * This returns true for all given indices.
   */
  isSizerVisible(index: number): boolean {
    return true;
  }

  /**
   * Function: createSizerShape
   *
   * Creates the shape used for the sizer handle for the specified bounds an
   * index. Only images and rectangles should be returned if support for HTML
   * labels with not foreign objects is required.
   */
  createSizerShape(bounds: any, index: number, fillColor: string): any {
    if (this.handleImage != null) {
      bounds = new mxRectangle(bounds.x, bounds.y, this.handleImage.width, this.handleImage.height);
      const shape = new mxImageShape(bounds, this.handleImage.src);
      shape.preserveImageAspect = false;
      return shape;
    } else if (index == mxEvent.ROTATION_HANDLE) {
      return new mxEllipse(bounds, fillColor || mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
    } else {
      return new mxRectangleShape(bounds, fillColor || mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
    }
  }

  /**
   * Function: createBounds
   *
   * Helper method to create an <mxRectangle> around the given centerpoint
   * with a width and height of 2*s or 6, if no s is given.
   */
  moveSizerTo(shape: any, x: number, y: number): void {
    if (shape != null) {
      shape.bounds.x = Math.floor(x - shape.bounds.width / 2);
      shape.bounds.y = Math.floor(y - shape.bounds.height / 2);
      if (shape.node != null && shape.node.style.display != 'none') {
        shape.redraw();
      }
    }
  }

  /**
   * Function: getHandleForEvent
   *
   * Returns the index of the handle for the given event. This returns the index
   * of the sizer from where the event originated or <mxEvent.LABEL_INDEX>.
   */
  getHandleForEvent(me: any): any {
    const tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 1;
    const hit = (this.allowHandleBoundsCheck && (mxClient.IS_IE || tol > 0)) ? new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;

    function checkShape(shape) {
      return shape != null && (me.isSource(shape) || (hit != null && mxUtils.intersects(shape.bounds, hit) && shape.node.style.display != 'none' && shape.node.style.visibility != 'hidden'));
    }

    if (this.customHandles != null && this.isCustomHandleEvent(me)) {
      for (let i = this.customHandles.length - 1; i >= 0; i--) {
        if (checkShape(this.customHandles[i].shape)) {
          return mxEvent.CUSTOM_HANDLE - i;
        }
      }
    }
    if (checkShape(this.rotationShape)) {
      return mxEvent.ROTATION_HANDLE;
    } else if (checkShape(this.labelShape)) {
      return mxEvent.LABEL_HANDLE;
    }
    if (this.sizers != null) {
      for (let i = 0; i < this.sizers.length; i++) {
        if (checkShape(this.sizers[i])) {
          return i;
        }
      }
    }
    return null;
  }

  /**
   * Function: isCustomHandleEvent
   *
   * Returns true if the given event allows custom handles to be changed. This
   * implementation returns true.
   */
  isCustomHandleEvent(me: any): boolean {
    return true;
  }

  /**
   * Function: mouseDown
   *
   * Handles the event if a handle has been clicked. By consuming the
   * event all subsequent events of the gesture are redirected to this
   * handler.
   */
  mouseDown(sender: any, me: any): void {
    const tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 0;
    if (!me.isConsumed() && this.graph.isEnabled() && (tol > 0 || me.getState() == this.state)) {
      const handle = this.getHandleForEvent(me);
      if (handle != null) {
        this.start(me.getGraphX(), me.getGraphY(), handle);
        me.consume();
      }
    }
  }

  /**
   * Function: isLivePreviewBorder
   *
   * Called if <livePreview> is enabled to check if a border should be painted.
   * This implementation returns true if the shape is transparent.
   */
  isLivePreviewBorder(): boolean {
    return this.state.shape != null && this.state.shape.fill == null && this.state.shape.stroke == null;
  }

  /**
   * Function: start
   *
   * Starts the handling of the mouse gesture.
   */
  start(x: number, y: number, index: number): void {
    if (this.selectionBorder != null) {
      this.inTolerance = true;
      this.childOffsetX = 0;
      this.childOffsetY = 0;
      this.index = index;
      this.startX = x;
      this.startY = y;
      const model = this.state.view.graph.model;
      const parent = model.getParent(this.state.cell);
      if (this.state.view.currentRoot != parent && (model.isVertex(parent) || model.isEdge(parent))) {
        this.parentState = this.state.view.graph.view.getState(parent);
      }
      this.selectionBorder.node.style.display = (index == mxEvent.ROTATION_HANDLE) ? 'inline' : 'none';
      if (!this.livePreview || this.isLivePreviewBorder()) {
        this.preview = this.createSelectionShape(this.bounds);
        if (!(mxClient.IS_SVG && Number(this.state.style[mxConstants.STYLE_ROTATION] || '0') != 0) && this.state.text != null && this.state.text.node.parentNode == this.graph.container) {
          this.preview.dialect = mxConstants.DIALECT_STRICTHTML;
          this.preview.init(this.graph.container);
        } else {
          this.preview.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
          this.preview.init(this.graph.view.getOverlayPane());
        }
      }
      if (this.livePreview) {
        this.hideSizers();
        if (index == mxEvent.ROTATION_HANDLE) {
          this.rotationShape.node.style.display = '';
        } else if (index == mxEvent.LABEL_HANDLE) {
          this.labelShape.node.style.display = '';
        } else if (this.sizers != null && this.sizers[index] != null) {
          this.sizers[index].node.style.display = '';
        } else if (index <= mxEvent.CUSTOM_HANDLE && this.customHandles != null) {
          this.customHandles[mxEvent.CUSTOM_HANDLE - index].setVisible(true);
        }
        const edges = this.graph.getEdges(this.state.cell);
        this.edgeHandlers = [];
        for (let i = 0; i < edges.length; i++) {
          const handler = this.graph.selectionCellsHandler.getHandler(edges[i]);
          if (handler != null) {
            this.edgeHandlers.push(handler);
          }
        }
      }
    }
  }

  /**
   * Function: hideHandles
   *
   * Shortcut to <hideSizers>.
   */
  setHandlesVisible(visible: any): void {
    if (this.sizers != null) {
      for (let i = 0; i < this.sizers.length; i++) {
        this.sizers[i].node.style.display = (visible) ? '' : 'none';
      }
    }
    if (this.customHandles != null) {
      for (let i = 0; i < this.customHandles.length; i++) {
        this.customHandles[i].setVisible(visible);
      }
    }
  }

  /**
   * Function: hideSizers
   *
   * Hides all sizers except.
   *
   * Starts the handling of the mouse gesture.
   */
  hideSizers(): void {
    this.setHandlesVisible(false);
  }

  /**
   * Function: checkTolerance
   *
   * Checks if the coordinates for the given event are within the
   * <mxGraph.tolerance>. If the event is a mouse event then the tolerance is
   * ignored.
   */
  checkTolerance(me: any): void {
    if (this.inTolerance && this.startX != null && this.startY != null) {
      if (mxEvent.isMouseEvent(me.getEvent()) || Math.abs(me.getGraphX() - this.startX) > this.graph.tolerance || Math.abs(me.getGraphY() - this.startY) > this.graph.tolerance) {
        this.inTolerance = false;
      }
    }
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
   * Function: roundAngle
   *
   * Hook for rounding the angle. This uses Math.round.
   */
  roundAngle(angle: any): any {
    return Math.round(angle * 10) / 10;
  }

  /**
   * Function: roundLength
   *
   * Hook for rounding the unscaled width or height. This uses Math.round.
   */
  roundLength(length: number): any {
    return Math.round(length);
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating the preview.
   */
  mouseMove(sender: any, me: any): void {
    if (!me.isConsumed() && this.index != null) {
      this.checkTolerance(me);
      if (!this.inTolerance) {
        if (this.index <= mxEvent.CUSTOM_HANDLE) {
          if (this.customHandles != null) {
            this.customHandles[mxEvent.CUSTOM_HANDLE - this.index].processEvent(me);
            this.customHandles[mxEvent.CUSTOM_HANDLE - this.index].active = true;
          }
        } else if (this.index == mxEvent.LABEL_HANDLE) {
          this.moveLabel(me);
        } else if (this.index == mxEvent.ROTATION_HANDLE) {
          this.rotateVertex(me);
        } else {
          this.resizeVertex(me);
        }
        this.updateHint(me);
      }
      me.consume();
    } else if (!this.graph.isMouseDown && this.getHandleForEvent(me) != null) {
      me.consume(false);
    }
  }

  /**
   * Function: rotateVertex
   *
   * Rotates the vertex.
   */
  moveLabel(me: any): void {
    const point = new mxPoint(me.getGraphX(), me.getGraphY());
    const tr = this.graph.view.translate;
    const scale = this.graph.view.scale;
    if (this.graph.isGridEnabledEvent(me.getEvent())) {
      point.x = (this.graph.snap(point.x / scale - tr.x) + tr.x) * scale;
      point.y = (this.graph.snap(point.y / scale - tr.y) + tr.y) * scale;
    }
    const index = (this.rotationShape != null) ? this.sizers.length - 2 : this.sizers.length - 1;
    this.moveSizerTo(this.sizers[index], point.x, point.y);
  }

  /**
   * Function: rotateVertex
   *
   * Rotates the vertex.
   */
  rotateVertex(me: any): void {
    const point = new mxPoint(me.getGraphX(), me.getGraphY());
    const dx = this.state.x + this.state.width / 2 - point.x;
    const dy = this.state.y + this.state.height / 2 - point.y;
    this.currentAlpha = (dx != 0) ? Math.atan(dy / dx) * 180 / Math.PI + 90 : ((dy < 0) ? 180 : 0);
    if (dx > 0) {
      this.currentAlpha -= 180;
    }
    if (this.rotationRaster && this.graph.isGridEnabledEvent(me.getEvent())) {
      const dx = point.x - this.state.getCenterX();
      const dy = point.y - this.state.getCenterY();
      const dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - 20) * 3;
      const raster = Math.max(1, 5 * Math.min(3, Math.max(0, Math.round(80 / Math.abs(dist)))));
      this.currentAlpha = Math.round(this.currentAlpha / raster) * raster;
    } else {
      this.currentAlpha = this.roundAngle(this.currentAlpha);
    }
    this.selectionBorder.rotation = this.currentAlpha;
    this.selectionBorder.redraw();
    if (this.livePreview) {
      this.redrawHandles();
    }
  }

  /**
   * Function: rotateVertex
   *
   * Rotates the vertex.
   */
  resizeVertex(me: any): void {
    const ct = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
    const alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
    const point = new mxPoint(me.getGraphX(), me.getGraphY());
    const tr = this.graph.view.translate;
    const scale = this.graph.view.scale;
    let cos = Math.cos(-alpha);
    let sin = Math.sin(-alpha);
    let dx = point.x - this.startX;
    let dy = point.y - this.startY;
    const tx = cos * dx - sin * dy;
    const ty = sin * dx + cos * dy;
    dx = tx;
    dy = ty;
    const geo = this.graph.getCellGeometry(this.state.cell);
    this.unscaledBounds = this.union(geo, dx / scale, dy / scale, this.index, this.graph.isGridEnabledEvent(me.getEvent()), 1, new mxPoint(0, 0), this.isConstrainedEvent(me), this.isCenteredEvent(this.state, me));
    if (!geo.relative) {
      let max = this.graph.getMaximumGraphBounds();
      if (max != null && this.parentState != null) {
        max = mxRectangle.fromRectangle(max);
        max.x -= (this.parentState.x - tr.x * scale) / scale;
        max.y -= (this.parentState.y - tr.y * scale) / scale;
      }
      if (this.graph.isConstrainChild(this.state.cell)) {
        let tmp = this.graph.getCellContainmentArea(this.state.cell);
        if (tmp != null) {
          const overlap = this.graph.getOverlap(this.state.cell);
          if (overlap > 0) {
            tmp = mxRectangle.fromRectangle(tmp);
            tmp.x -= tmp.width * overlap;
            tmp.y -= tmp.height * overlap;
            tmp.width += 2 * tmp.width * overlap;
            tmp.height += 2 * tmp.height * overlap;
          }
          if (max == null) {
            max = tmp;
          } else {
            max = mxRectangle.fromRectangle(max);
            max.intersect(tmp);
          }
        }
      }
      if (max != null) {
        if (this.unscaledBounds.x < max.x) {
          this.unscaledBounds.width -= max.x - this.unscaledBounds.x;
          this.unscaledBounds.x = max.x;
        }
        if (this.unscaledBounds.y < max.y) {
          this.unscaledBounds.height -= max.y - this.unscaledBounds.y;
          this.unscaledBounds.y = max.y;
        }
        if (this.unscaledBounds.x + this.unscaledBounds.width > max.x + max.width) {
          this.unscaledBounds.width -= this.unscaledBounds.x + this.unscaledBounds.width - max.x - max.width;
        }
        if (this.unscaledBounds.y + this.unscaledBounds.height > max.y + max.height) {
          this.unscaledBounds.height -= this.unscaledBounds.y + this.unscaledBounds.height - max.y - max.height;
        }
      }
    }
    this.bounds = new mxRectangle(((this.parentState != null) ? this.parentState.x : tr.x * scale) + (this.unscaledBounds.x) * scale, ((this.parentState != null) ? this.parentState.y : tr.y * scale) + (this.unscaledBounds.y) * scale, this.unscaledBounds.width * scale, this.unscaledBounds.height * scale);
    if (geo.relative && this.parentState != null) {
      this.bounds.x += this.state.x - this.parentState.x;
      this.bounds.y += this.state.y - this.parentState.y;
    }
    cos = Math.cos(alpha);
    sin = Math.sin(alpha);
    const c2 = new mxPoint(this.bounds.getCenterX(), this.bounds.getCenterY());
    let dx = c2.x - ct.x;
    let dy = c2.y - ct.y;
    const dx2 = cos * dx - sin * dy;
    const dy2 = sin * dx + cos * dy;
    const dx3 = dx2 - dx;
    const dy3 = dy2 - dy;
    const dx4 = this.bounds.x - this.state.x;
    const dy4 = this.bounds.y - this.state.y;
    const dx5 = cos * dx4 - sin * dy4;
    const dy5 = sin * dx4 + cos * dy4;
    this.bounds.x += dx3;
    this.bounds.y += dy3;
    this.unscaledBounds.x = this.roundLength(this.unscaledBounds.x + dx3 / scale);
    this.unscaledBounds.y = this.roundLength(this.unscaledBounds.y + dy3 / scale);
    this.unscaledBounds.width = this.roundLength(this.unscaledBounds.width);
    this.unscaledBounds.height = this.roundLength(this.unscaledBounds.height);
    if (!this.graph.isCellCollapsed(this.state.cell) && (dx3 != 0 || dy3 != 0)) {
      this.childOffsetX = this.state.x - this.bounds.x + dx5;
      this.childOffsetY = this.state.y - this.bounds.y + dy5;
    } else {
      this.childOffsetX = 0;
      this.childOffsetY = 0;
    }
    if (this.livePreview) {
      this.updateLivePreview(me);
    }
    if (this.preview != null) {
      this.drawPreview();
    }
  }

  /**
   * Function: updateLivePreview
   *
   * Repaints the live preview.
   */
  updateLivePreview(me: any): void {
    const scale = this.graph.view.scale;
    const tr = this.graph.view.translate;
    const tempState = this.state.clone();
    this.state.x = this.bounds.x;
    this.state.y = this.bounds.y;
    this.state.origin = new mxPoint(this.state.x / scale - tr.x, this.state.y / scale - tr.y);
    this.state.width = this.bounds.width;
    this.state.height = this.bounds.height;
    this.state.unscaledWidth = null;
    let off = this.state.absoluteOffset;
    off = new mxPoint(off.x, off.y);
    this.state.absoluteOffset.x = 0;
    this.state.absoluteOffset.y = 0;
    const geo = this.graph.getCellGeometry(this.state.cell);
    if (geo != null) {
      const offset = geo.offset || this.EMPTY_POINT;
      if (offset != null && !geo.relative) {
        this.state.absoluteOffset.x = this.state.view.scale * offset.x;
        this.state.absoluteOffset.y = this.state.view.scale * offset.y;
      }
      this.state.view.updateVertexLabelOffset(this.state);
    }
    this.state.view.graph.cellRenderer.redraw(this.state, true);
    this.state.view.invalidate(this.state.cell);
    this.state.invalid = false;
    this.state.view.validate();
    this.redrawHandles();
    this.state.setState(tempState);
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by applying the changes to the geometry.
   */
  mouseUp(sender: any, me: any): void {
    if (this.index != null && this.state != null) {
      const point = new mxPoint(me.getGraphX(), me.getGraphY());
      const index = this.index;
      this.index = null;
      this.graph.getModel().beginUpdate();
      try {
        if (index <= mxEvent.CUSTOM_HANDLE) {
          if (this.customHandles != null) {
            this.customHandles[mxEvent.CUSTOM_HANDLE - index].active = false;
            this.customHandles[mxEvent.CUSTOM_HANDLE - index].execute();
          }
        } else if (index == mxEvent.ROTATION_HANDLE) {
          if (this.currentAlpha != null) {
            const delta = this.currentAlpha - (this.state.style[mxConstants.STYLE_ROTATION] || 0);
            if (delta != 0) {
              this.rotateCell(this.state.cell, delta);
            }
          } else {
            this.rotateClick();
          }
        } else {
          const gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
          const alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
          const cos = Math.cos(-alpha);
          const sin = Math.sin(-alpha);
          let dx = point.x - this.startX;
          let dy = point.y - this.startY;
          const tx = cos * dx - sin * dy;
          const ty = sin * dx + cos * dy;
          dx = tx;
          dy = ty;
          const s = this.graph.view.scale;
          const recurse = this.isRecursiveResize(this.state, me);
          this.resizeCell(this.state.cell, this.roundLength(dx / s), this.roundLength(dy / s), index, gridEnabled, this.isConstrainedEvent(me), recurse);
        }
      } finally {
        this.graph.getModel().endUpdate();
      }
      me.consume();
      this.reset();
    }
  }

  /**
   * Function: rotateCell
   *
   * Rotates the given cell to the given rotation.
   */
  isRecursiveResize(state: any, me: any): boolean {
    return this.graph.isRecursiveResize(this.state);
  }

  /**
   * Function: rotateClick
   *
   * Hook for subclassers to implement a single click on the rotation handle.
   * This code is executed as part of the model transaction. This implementation
   * is empty.
   */
  rotateClick(): void {
  }

  /**
   * Function: rotateCell
   *
   * Rotates the given cell and its children by the given angle in degrees.
   *
   * Parameters:
   *
   * cell - <mxCell> to be rotated.
   * angle - Angle in degrees.
   */
  rotateCell(cell: mxCell, angle: any, parent: any): void {
    if (angle != 0) {
      const model = this.graph.getModel();
      if (model.isVertex(cell) || model.isEdge(cell)) {
        if (!model.isEdge(cell)) {
          const state = this.graph.view.getState(cell);
          const style = (state != null) ? state.style : this.graph.getCellStyle(cell);
          if (style != null) {
            const total = (style[mxConstants.STYLE_ROTATION] || 0) + angle;
            this.graph.setCellStyles(mxConstants.STYLE_ROTATION, total, [cell]);
          }
        }
        let geo = this.graph.getCellGeometry(cell);
        if (geo != null) {
          const pgeo = this.graph.getCellGeometry(parent);
          if (pgeo != null && !model.isEdge(parent)) {
            geo = geo.clone();
            geo.rotate(angle, new mxPoint(pgeo.width / 2, pgeo.height / 2));
            model.setGeometry(cell, geo);
          }
          if ((model.isVertex(cell) && !geo.relative) || model.isEdge(cell)) {
            const childCount = model.getChildCount(cell);
            for (let i = 0; i < childCount; i++) {
              this.rotateCell(model.getChildAt(cell, i), angle, cell);
            }
          }
        }
      }
    }
  }

  /**
   * Function: reset
   *
   * Resets the state of this handler.
   */
  reset(): void {
    if (this.sizers != null && this.index != null && this.sizers[this.index] != null && this.sizers[this.index].node.style.display == 'none') {
      this.sizers[this.index].node.style.display = '';
    }
    this.currentAlpha = null;
    this.inTolerance = null;
    this.index = null;
    if (this.preview != null) {
      this.preview.destroy();
      this.preview = null;
    }
    if (this.livePreview && this.sizers != null) {
      for (let i = 0; i < this.sizers.length; i++) {
        if (this.sizers[i] != null) {
          this.sizers[i].node.style.display = '';
        }
      }
    }
    if (this.customHandles != null) {
      for (let i = 0; i < this.customHandles.length; i++) {
        if (this.customHandles[i].active) {
          this.customHandles[i].active = false;
          this.customHandles[i].reset();
        } else {
          this.customHandles[i].setVisible(true);
        }
      }
    }
    if (this.selectionBorder != null) {
      this.selectionBorder.node.style.display = 'inline';
      this.selectionBounds = this.getSelectionBounds(this.state);
      this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
      this.drawPreview();
    }
    this.removeHint();
    this.redrawHandles();
    this.edgeHandlers = null;
    this.unscaledBounds = null;
  }

  /**
   * Function: resizeCell
   *
   * Uses the given vector to change the bounds of the given cell
   * in the graph using <mxGraph.resizeCell>.
   */
  resizeCell(cell: mxCell, dx: number, dy: number, index: number, gridEnabled: any, constrained: any, recurse: any): void {
    let geo = this.graph.model.getGeometry(cell);
    if (geo != null) {
      if (index == mxEvent.LABEL_HANDLE) {
        const scale = this.graph.view.scale;
        dx = Math.round((this.labelShape.bounds.getCenterX() - this.startX) / scale);
        dy = Math.round((this.labelShape.bounds.getCenterY() - this.startY) / scale);
        geo = geo.clone();
        if (geo.offset == null) {
          geo.offset = new mxPoint(dx, dy);
        } else {
          geo.offset.x += dx;
          geo.offset.y += dy;
        }
        this.graph.model.setGeometry(cell, geo);
      } else if (this.unscaledBounds != null) {
        const scale = this.graph.view.scale;
        if (this.childOffsetX != 0 || this.childOffsetY != 0) {
          this.moveChildren(cell, Math.round(this.childOffsetX / scale), Math.round(this.childOffsetY / scale));
        }
        this.graph.resizeCell(cell, this.unscaledBounds, recurse);
      }
    }
  }

  /**
   * Function: moveChildren
   *
   * Moves the children of the given cell by the given vector.
   */
  moveChildren(cell: mxCell, dx: number, dy: number): void {
    const model = this.graph.getModel();
    const childCount = model.getChildCount(cell);
    for (let i = 0; i < childCount; i++) {
      const child = model.getChildAt(cell, i);
      let geo = this.graph.getCellGeometry(child);
      if (geo != null) {
        geo = geo.clone();
        geo.translate(dx, dy);
        model.setGeometry(child, geo);
      }
    }
  }

  /**
   * Function: union
   *
   * Returns the union of the given bounds and location for the specified
   * handle index.
   *
   * To override this to limit the size of vertex via a minWidth/-Height style,
   * the following code can be used.
   *
   * (code)
   * var vertexHandlerUnion = mxVertexHandler.prototype.union;
   * mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
   * {
   *   var result = vertexHandlerUnion.apply(this, arguments);
   *
   *   result.width = Math.max(result.width, mxUtils.getNumber(this.state.style, 'minWidth', 0));
   *   result.height = Math.max(result.height, mxUtils.getNumber(this.state.style, 'minHeight', 0));
   *
   *   return result;
   * };
   * (end)
   *
   * The minWidth/-Height style can then be used as follows:
   *
   * (code)
   * graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'minWidth=100;minHeight=100;');
   * (end)
   *
   * To override this to update the height for a wrapped text if the width of a vertex is
   * changed, the following can be used.
   *
   * (code)
   * var mxVertexHandlerUnion = mxVertexHandler.prototype.union;
   * mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
   * {
   *   var result = mxVertexHandlerUnion.apply(this, arguments);
   *   var s = this.state;
   *
   *   if (this.graph.isHtmlLabel(s.cell) && (index == 3 || index == 4) &&
   *       s.text != null && s.style[mxConstants.STYLE_WHITE_SPACE] == 'wrap')
   *   {
   *     var label = this.graph.getLabel(s.cell);
   *     var fontSize = mxUtils.getNumber(s.style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE);
   *     var ww = result.width / s.view.scale - s.text.spacingRight - s.text.spacingLeft
   *
   *     result.height = mxUtils.getSizeForString(label, fontSize, s.style[mxConstants.STYLE_FONTFAMILY], ww).height;
   *   }
   *
   *   return result;
   * };
   * (end)
   */
  union(bounds: any, dx: number, dy: number, index: number, gridEnabled: any, scale: any, tr: any, constrained: any, centered: any): any {
    if (this.singleSizer) {
      let x = bounds.x + bounds.width + dx;
      let y = bounds.y + bounds.height + dy;
      if (gridEnabled) {
        x = this.graph.snap(x / scale) * scale;
        y = this.graph.snap(y / scale) * scale;
      }
      const rect = new mxRectangle(bounds.x, bounds.y, 0, 0);
      rect.add(new mxRectangle(x, y, 0, 0));
      return rect;
    } else {
      const w0 = bounds.width;
      const h0 = bounds.height;
      let left = bounds.x - tr.x * scale;
      let right = left + w0;
      let top = bounds.y - tr.y * scale;
      let bottom = top + h0;
      const cx = left + w0 / 2;
      const cy = top + h0 / 2;
      if (index > 4) {
        bottom = bottom + dy;
        if (gridEnabled) {
          bottom = this.graph.snap(bottom / scale) * scale;
        }
      } else if (index < 3) {
        top = top + dy;
        if (gridEnabled) {
          top = this.graph.snap(top / scale) * scale;
        }
      }
      if (index == 0 || index == 3 || index == 5) {
        left += dx;
        if (gridEnabled) {
          left = this.graph.snap(left / scale) * scale;
        }
      } else if (index == 2 || index == 4 || index == 7) {
        right += dx;
        if (gridEnabled) {
          right = this.graph.snap(right / scale) * scale;
        }
      }
      let width = right - left;
      let height = bottom - top;
      if (constrained) {
        const geo = this.graph.getCellGeometry(this.state.cell);
        if (geo != null) {
          const aspect = geo.width / geo.height;
          if (index == 1 || index == 2 || index == 7 || index == 6) {
            width = height * aspect;
          } else {
            height = width / aspect;
          }
          if (index == 0) {
            left = right - width;
            top = bottom - height;
          }
        }
      }
      if (centered) {
        width += (width - w0);
        height += (height - h0);
        const cdx = cx - (left + width / 2);
        const cdy = cy - (top + height / 2);
        left += cdx;
        top += cdy;
        right += cdx;
        bottom += cdy;
      }
      if (width < 0) {
        left += width;
        width = Math.abs(width);
      }
      if (height < 0) {
        top += height;
        height = Math.abs(height);
      }
      const result = new mxRectangle(left + tr.x * scale, top + tr.y * scale, width, height);
      if (this.minBounds != null) {
        result.width = Math.max(result.width, this.minBounds.x * scale + this.minBounds.width * scale + Math.max(0, this.x0 * scale - result.x));
        result.height = Math.max(result.height, this.minBounds.y * scale + this.minBounds.height * scale + Math.max(0, this.y0 * scale - result.y));
      }
      return result;
    }
  }

  /**
   * Function: redraw
   *
   * Redraws the handles and the preview.
   */
  redraw(): void {
    this.selectionBounds = this.getSelectionBounds(this.state);
    this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
    this.redrawHandles();
    this.drawPreview();
  }

  /**
   * Returns the padding to be used for drawing handles for the current <bounds>.
   */
  getHandlePadding(): any {
    const result = new mxPoint(0, 0);
    let tol = this.tolerance;
    if (this.sizers != null && this.sizers.length > 0 && this.sizers[0] != null && (this.bounds.width < 2 * this.sizers[0].bounds.width + 2 * tol || this.bounds.height < 2 * this.sizers[0].bounds.height + 2 * tol)) {
      tol /= 2;
      result.x = this.sizers[0].bounds.width + tol;
      result.y = this.sizers[0].bounds.height + tol;
    }
    return result;
  }

  /**
   * Function: redrawHandles
   *
   * Redraws the handles. To hide certain handles the following code can be used.
   *
   * (code)
   * mxVertexHandler.prototype.redrawHandles = function()
   * {
   *   mxVertexHandlerRedrawHandles.apply(this, arguments);
   *
   *   if (this.sizers != null && this.sizers.length > 7)
   *   {
   *     this.sizers[1].node.style.display = 'none';
   *     this.sizers[6].node.style.display = 'none';
   *   }
   * };
   * (end)
   */
  redrawHandles(): void {
    const tol = this.tolerance;
    this.horizontalOffset = 0;
    this.verticalOffset = 0;
    let s = this.bounds;
    if (this.sizers != null && this.sizers.length > 0 && this.sizers[0] != null) {
      if (this.index == null && this.manageSizers && this.sizers.length >= 8) {
        const padding = this.getHandlePadding();
        this.horizontalOffset = padding.x;
        this.verticalOffset = padding.y;
        if (this.horizontalOffset != 0 || this.verticalOffset != 0) {
          s = new mxRectangle(s.x, s.y, s.width, s.height);
          s.x -= this.horizontalOffset / 2;
          s.width += this.horizontalOffset;
          s.y -= this.verticalOffset / 2;
          s.height += this.verticalOffset;
        }
        if (this.sizers.length >= 8) {
          if ((s.width < 2 * this.sizers[0].bounds.width + 2 * tol) || (s.height < 2 * this.sizers[0].bounds.height + 2 * tol)) {
            this.sizers[0].node.style.display = 'none';
            this.sizers[2].node.style.display = 'none';
            this.sizers[5].node.style.display = 'none';
            this.sizers[7].node.style.display = 'none';
          } else {
            this.sizers[0].node.style.display = '';
            this.sizers[2].node.style.display = '';
            this.sizers[5].node.style.display = '';
            this.sizers[7].node.style.display = '';
          }
        }
      }
      const r = s.x + s.width;
      const b = s.y + s.height;
      if (this.singleSizer) {
        this.moveSizerTo(this.sizers[0], r, b);
      } else {
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        if (this.sizers.length >= 8) {
          const crs = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize'];
          const alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
          const cos = Math.cos(alpha);
          const sin = Math.sin(alpha);
          const da = Math.round(alpha * 4 / Math.PI);
          const ct = new mxPoint(s.getCenterX(), s.getCenterY());
          let pt = mxUtils.getRotatedPoint(new mxPoint(s.x, s.y), cos, sin, ct);
          this.moveSizerTo(this.sizers[0], pt.x, pt.y);
          this.sizers[0].setCursor(crs[mxUtils.mod(0 + da, crs.length)]);
          pt.x = cx;
          pt.y = s.y;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[1], pt.x, pt.y);
          this.sizers[1].setCursor(crs[mxUtils.mod(1 + da, crs.length)]);
          pt.x = r;
          pt.y = s.y;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[2], pt.x, pt.y);
          this.sizers[2].setCursor(crs[mxUtils.mod(2 + da, crs.length)]);
          pt.x = s.x;
          pt.y = cy;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[3], pt.x, pt.y);
          this.sizers[3].setCursor(crs[mxUtils.mod(7 + da, crs.length)]);
          pt.x = r;
          pt.y = cy;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[4], pt.x, pt.y);
          this.sizers[4].setCursor(crs[mxUtils.mod(3 + da, crs.length)]);
          pt.x = s.x;
          pt.y = b;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[5], pt.x, pt.y);
          this.sizers[5].setCursor(crs[mxUtils.mod(6 + da, crs.length)]);
          pt.x = cx;
          pt.y = b;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[6], pt.x, pt.y);
          this.sizers[6].setCursor(crs[mxUtils.mod(5 + da, crs.length)]);
          pt.x = r;
          pt.y = b;
          pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
          this.moveSizerTo(this.sizers[7], pt.x, pt.y);
          this.sizers[7].setCursor(crs[mxUtils.mod(4 + da, crs.length)]);
          this.moveSizerTo(this.sizers[8], cx + this.state.absoluteOffset.x, cy + this.state.absoluteOffset.y);
        } else if (this.state.width >= 2 && this.state.height >= 2) {
          this.moveSizerTo(this.sizers[0], cx + this.state.absoluteOffset.x, cy + this.state.absoluteOffset.y);
        } else {
          this.moveSizerTo(this.sizers[0], this.state.x, this.state.y);
        }
      }
    }
    if (this.rotationShape != null) {
      const alpha = mxUtils.toRadians((this.currentAlpha != null) ? this.currentAlpha : this.state.style[mxConstants.STYLE_ROTATION] || '0');
      const cos = Math.cos(alpha);
      const sin = Math.sin(alpha);
      const ct = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
      const pt = mxUtils.getRotatedPoint(this.getRotationHandlePosition(), cos, sin, ct);
      if (this.rotationShape.node != null) {
        this.moveSizerTo(this.rotationShape, pt.x, pt.y);
        this.rotationShape.node.style.visibility = (this.state.view.graph.isEditing()) ? 'hidden' : '';
      }
    }
    if (this.selectionBorder != null) {
      this.selectionBorder.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
    }
    if (this.edgeHandlers != null) {
      for (let i = 0; i < this.edgeHandlers.length; i++) {
        this.edgeHandlers[i].redraw();
      }
    }
    if (this.customHandles != null) {
      for (let i = 0; i < this.customHandles.length; i++) {
        const temp = this.customHandles[i].shape.node.style.display;
        this.customHandles[i].redraw();
        this.customHandles[i].shape.node.style.display = temp;
        this.customHandles[i].shape.node.style.visibility = (this.graph.isEditing()) ? 'hidden' : '';
      }
    }
    this.updateParentHighlight();
  }

  /**
   * Function: getRotationHandlePosition
   *
   * Returns an <mxPoint> that defines the rotation handle position.
   */
  getRotationHandlePosition(): any {
    return new mxPoint(this.bounds.x + this.bounds.width / 2, this.bounds.y + this.rotationHandleVSpacing);
  }

  /**
   * Function: updateParentHighlight
   *
   * Updates the highlight of the parent if <parentHighlightEnabled> is true.
   */
  updateParentHighlight(): void {
    if (this.selectionBorder != null) {
      if (this.parentHighlight != null) {
        const parent = this.graph.model.getParent(this.state.cell);
        if (this.graph.model.isVertex(parent)) {
          const pstate = this.graph.view.getState(parent);
          const b = this.parentHighlight.bounds;
          if (pstate != null && (b.x != pstate.x || b.y != pstate.y || b.width != pstate.width || b.height != pstate.height)) {
            this.parentHighlight.bounds = pstate;
            this.parentHighlight.redraw();
          }
        } else {
          this.parentHighlight.destroy();
          this.parentHighlight = null;
        }
      } else if (this.parentHighlightEnabled) {
        const parent = this.graph.model.getParent(this.state.cell);
        if (this.graph.model.isVertex(parent)) {
          const pstate = this.graph.view.getState(parent);
          if (pstate != null) {
            this.parentHighlight = this.createParentHighlightShape(pstate);
            this.parentHighlight.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
            this.parentHighlight.pointerEvents = false;
            this.parentHighlight.rotation = Number(pstate.style[mxConstants.STYLE_ROTATION] || '0');
            this.parentHighlight.init(this.graph.getView().getOverlayPane());
          }
        }
      }
    }
  }

  /**
   * Function: drawPreview
   *
   * Redraws the preview.
   */
  drawPreview(): void {
    if (this.preview != null) {
      this.preview.bounds = this.bounds;
      if (this.preview.node.parentNode == this.graph.container) {
        this.preview.bounds.width = Math.max(0, this.preview.bounds.width - 1);
        this.preview.bounds.height = Math.max(0, this.preview.bounds.height - 1);
      }
      this.preview.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
      this.preview.redraw();
    }
    this.selectionBorder.bounds = this.bounds;
    this.selectionBorder.redraw();
    if (this.parentHighlight != null) {
      this.parentHighlight.redraw();
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    if (this.escapeHandler != null) {
      this.state.view.graph.removeListener(this.escapeHandler);
      this.escapeHandler = null;
    }
    if (this.preview != null) {
      this.preview.destroy();
      this.preview = null;
    }
    if (this.parentHighlight != null) {
      this.parentHighlight.destroy();
      this.parentHighlight = null;
    }
    if (this.selectionBorder != null) {
      this.selectionBorder.destroy();
      this.selectionBorder = null;
    }
    this.labelShape = null;
    this.removeHint();
    if (this.sizers != null) {
      for (let i = 0; i < this.sizers.length; i++) {
        this.sizers[i].destroy();
      }
      this.sizers = null;
    }
    if (this.customHandles != null) {
      for (let i = 0; i < this.customHandles.length; i++) {
        this.customHandles[i].destroy();
      }
      this.customHandles = null;
    }
  }
}
