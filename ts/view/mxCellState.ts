/**
 * Class: mxCellState
 *
 * Represents the current state of a cell in a given <mxGraphView>.
 *
 * For edges, the edge label position is stored in <absoluteOffset>.
 *
 * The size for oversize labels can be retrieved using the boundingBox property
 * of the <text> field as shown below.
 *
 * (code)
 * var bbox = (state.text != null) ? state.text.boundingBox : null;
 * (end)
 *
 * Constructor: mxCellState
 *
 * Constructs a new object that represents the current state of the given
 * cell in the specified view.
 *
 * Parameters:
 *
 * view - <mxGraphView> that contains the state.
 * cell - <mxCell> that this state represents.
 * style - Array of key, value pairs that constitute the style.
 */
export class mxCellState {
  view: any;
  cell: mxCell;
  style: any;
  origin: mxPoint;
  absoluteOffset: mxPoint;
  /**
   * Variable: invalidStyle
   *
   * Specifies if the style is invalid. Default is false.
   */
  invalidStyle: boolean;
  /**
   * Variable: invalid
   *
   * Specifies if the state is invalid. Default is true.
   * @example true
   */
  invalid: boolean;
  /**
   * Variable: absolutePoints
   *
   * Holds an array of <mxPoints> that represent the absolute points of an
   * edge.
   */
  absolutePoints: any;
  /**
   * Variable: visibleSourceState
   *
   * Caches the visible source terminal state.
   */
  visibleSourceState: any;
  /**
   * Variable: visibleTargetState
   *
   * Caches the visible target terminal state.
   */
  visibleTargetState: any;
  /**
   * Variable: terminalDistance
   *
   * Caches the distance between the end points for an edge.
   */
  terminalDistance: number;
  /**
   * Variable: length
   *
   * Caches the length of an edge.
   */
  length: number;
  /**
   * Variable: segments
   *
   * Array of numbers that represent the cached length of each segment of the
   * edge.
   */
  segments: any;
  /**
   * Variable: shape
   *
   * Holds the <mxShape> that represents the cell graphically.
   */
  shape: any;
  /**
   * Variable: text
   *
   * Holds the <mxText> that represents the label of the cell. Thi smay be
   * null if the cell has no label.
   */
  text: string;
  /**
   * Variable: unscaledWidth
   *
   * Holds the unscaled width of the state.
   */
  unscaledWidth: any;
  cellBounds: mxRectangle;
  paintBounds: any;
  boundingBox: any;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(view: any, cell: mxCell, style: any) {
    this.view = view;
    this.cell = cell;
    this.style = (style != null) ? style : {};
    this.origin = new mxPoint();
    this.absoluteOffset = new mxPoint();
  }

  /**
   * Function: getPerimeterBounds
   *
   * Returns the <mxRectangle> that should be used as the perimeter of the
   * cell.
   *
   * Parameters:
   *
   * border - Optional border to be added around the perimeter bounds.
   * bounds - Optional <mxRectangle> to be used as the initial bounds.
   */
  getPerimeterBounds(border: any, bounds: any): any {
    border = border || 0;
    bounds = (bounds != null) ? bounds : new mxRectangle(this.x, this.y, this.width, this.height);
    if (this.shape != null && this.shape.stencil != null && this.shape.stencil.aspect == 'fixed') {
      const aspect = this.shape.stencil.computeAspect(this.style, bounds.x, bounds.y, bounds.width, bounds.height);
      bounds.x = aspect.x;
      bounds.y = aspect.y;
      bounds.width = this.shape.stencil.w0 * aspect.width;
      bounds.height = this.shape.stencil.h0 * aspect.height;
    }
    if (border != 0) {
      bounds.grow(border);
    }
    return bounds;
  }

  /**
   * Function: setAbsoluteTerminalPoint
   *
   * Sets the first or last point in <absolutePoints> depending on isSource.
   *
   * Parameters:
   *
   * point - <mxPoint> that represents the terminal point.
   * isSource - Boolean that specifies if the first or last point should
   * be assigned.
   */
  setAbsoluteTerminalPoint(point: any, isSource: boolean): void {
    if (isSource) {
      if (this.absolutePoints == null) {
        this.absolutePoints = [];
      }
      if (this.absolutePoints.length == 0) {
        this.absolutePoints.push(point);
      } else {
        this.absolutePoints[0] = point;
      }
    } else {
      if (this.absolutePoints == null) {
        this.absolutePoints = [];
        this.absolutePoints.push(null);
        this.absolutePoints.push(point);
      } else if (this.absolutePoints.length == 1) {
        this.absolutePoints.push(point);
      } else {
        this.absolutePoints[this.absolutePoints.length - 1] = point;
      }
    }
  }

  /**
   * Function: setCursor
   *
   * Sets the given cursor on the shape and text shape.
   */
  setCursor(cursor: any): void {
    if (this.shape != null) {
      this.shape.setCursor(cursor);
    }
    if (this.text != null) {
      this.text.setCursor(cursor);
    }
  }

  /**
   * Function: getVisibleTerminal
   *
   * Returns the visible source or target terminal cell.
   *
   * Parameters:
   *
   * source - Boolean that specifies if the source or target cell should be
   * returned.
   */
  getVisibleTerminal(source: any): any {
    const tmp = this.getVisibleTerminalState(source);
    return (tmp != null) ? tmp.cell : null;
  }

  /**
   * Function: getVisibleTerminalState
   *
   * Returns the visible source or target terminal state.
   *
   * Parameters:
   *
   * source - Boolean that specifies if the source or target state should be
   * returned.
   */
  getVisibleTerminalState(source: any): any {
    return (source) ? this.visibleSourceState : this.visibleTargetState;
  }

  /**
   * Function: setVisibleTerminalState
   *
   * Sets the visible source or target terminal state.
   *
   * Parameters:
   *
   * terminalState - <mxCellState> that represents the terminal.
   * source - Boolean that specifies if the source or target state should be set.
   */
  setVisibleTerminalState(terminalState: any, source: any): void {
    if (source) {
      this.visibleSourceState = terminalState;
    } else {
      this.visibleTargetState = terminalState;
    }
  }

  /**
   * Function: getCellBounds
   *
   * Returns the unscaled, untranslated bounds.
   */
  getCellBounds(): any {
    return this.cellBounds;
  }

  /**
   * Function: getPaintBounds
   *
   * Returns the unscaled, untranslated paint bounds. This is the same as
   * <getCellBounds> but with a 90 degree rotation if the shape's
   * isPaintBoundsInverted returns true.
   */
  getPaintBounds(): any {
    return this.paintBounds;
  }

  /**
   * Function: updateCachedBounds
   *
   * Updates the cellBounds and paintBounds.
   */
  updateCachedBounds(): void {
    const tr = this.view.translate;
    const s = this.view.scale;
    this.cellBounds = new mxRectangle(this.x / s - tr.x, this.y / s - tr.y, this.width / s, this.height / s);
    this.paintBounds = mxRectangle.fromRectangle(this.cellBounds);
    if (this.shape != null && this.shape.isPaintBoundsInverted()) {
      this.paintBounds.rotate90();
    }
  }

  /**
   * Destructor: setState
   *
   * Copies all fields from the given state to this state.
   */
  setState(state: any): void {
    this.view = state.view;
    this.cell = state.cell;
    this.style = state.style;
    this.absolutePoints = state.absolutePoints;
    this.origin = state.origin;
    this.absoluteOffset = state.absoluteOffset;
    this.boundingBox = state.boundingBox;
    this.terminalDistance = state.terminalDistance;
    this.segments = state.segments;
    this.length = state.length;
    this.x = state.x;
    this.y = state.y;
    this.width = state.width;
    this.height = state.height;
    this.unscaledWidth = state.unscaledWidth;
  }

  /**
   * Function: clone
   *
   * Returns a clone of this <mxPoint>.
   */
  clone(): boolean {
    const clone = new mxCellState(this.view, this.cell, this.style);
    if (this.absolutePoints != null) {
      clone.absolutePoints = [];
      for (let i = 0; i < this.absolutePoints.length; i++) {
        clone.absolutePoints[i] = this.absolutePoints[i].clone();
      }
    }
    if (this.origin != null) {
      clone.origin = this.origin.clone();
    }
    if (this.absoluteOffset != null) {
      clone.absoluteOffset = this.absoluteOffset.clone();
    }
    if (this.boundingBox != null) {
      clone.boundingBox = this.boundingBox.clone();
    }
    clone.terminalDistance = this.terminalDistance;
    clone.segments = this.segments;
    clone.length = this.length;
    clone.x = this.x;
    clone.y = this.y;
    clone.width = this.width;
    clone.height = this.height;
    clone.unscaledWidth = this.unscaledWidth;
    return clone;
  }

  /**
   * Destructor: destroy
   *
   * Destroys the state and all associated resources.
   */
  destroy(): void {
    this.view.graph.cellRenderer.destroy(this);
  }
}
