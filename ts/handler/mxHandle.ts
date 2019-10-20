/**
 * Class: mxHandle
 *
 * Implements a single custom handle for vertices.
 *
 * Constructor: mxHandle
 *
 * Constructs a new handle for the given state.
 *
 * Parameters:
 *
 * state - <mxCellState> of the cell to be handled.
 */
import { mxImageShape } from '../shape/mxImageShape';
import { mxRectangleShape } from '../shape/mxRectangleShape';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';

export class mxHandle {
  constructor(state: any, cursor: any, image: any) {
    this.graph = state.view.graph;
    this.state = state;
    this.cursor = (cursor != null) ? cursor : this.cursor;
    this.image = (image != null) ? image : this.image;
    this.init();
  }

  graph: mxGraph;
  state: any;
  cursor: any;
  image: any;
  /**
   * Variable: image
   *
   * Specifies the <mxImage> to be used to render the handle. Default is null.
   */
  ignoreGrid: boolean;
  shape: mxRectangle;

  /**
   * Function: getPosition
   *
   * Hook for subclassers to return the current position of the handle.
   */
  getPosition(bounds: any): void {
  }

  /**
   * Function: setPosition
   *
   * Hooks for subclassers to update the style in the <state>.
   */
  setPosition(bounds: any, pt: any, me: any): void {
  }

  /**
   * Function: execute
   *
   * Hook for subclassers to execute the handle.
   */
  execute(): void {
  }

  /**
   * Function: copyStyle
   *
   * Sets the cell style with the given name to the corresponding value in <state>.
   */
  copyStyle(key: string): void {
    this.graph.setCellStyles(key, this.state.style[key], [this.state.cell]);
  }

  /**
   * Function: processEvent
   *
   * Processes the given <mxMouseEvent> and invokes <setPosition>.
   */
  processEvent(me: any): void {
    const scale = this.graph.view.scale;
    const tr = this.graph.view.translate;
    let pt = new mxPoint(me.getGraphX() / scale - tr.x, me.getGraphY() / scale - tr.y);
    if (this.shape != null && this.shape.bounds != null) {
      pt.x -= this.shape.bounds.width / scale / 4;
      pt.y -= this.shape.bounds.height / scale / 4;
    }
    const alpha1 = -mxUtils.toRadians(this.getRotation());
    const alpha2 = -mxUtils.toRadians(this.getTotalRotation()) - alpha1;
    pt = this.flipPoint(this.rotatePoint(this.snapPoint(this.rotatePoint(pt, alpha1), this.ignoreGrid || !this.graph.isGridEnabledEvent(me.getEvent())), alpha2));
    this.setPosition(this.state.getPaintBounds(), pt, me);
    this.positionChanged();
    this.redraw();
  }

  /**
   * Function: positionChanged
   *
   * Called after <setPosition> has been called in <processEvent>. This repaints
   * the state using <mxCellRenderer>.
   */
  positionChanged(): void {
    if (this.state.text != null) {
      this.state.text.apply(this.state);
    }
    if (this.state.shape != null) {
      this.state.shape.apply(this.state);
    }
    this.graph.cellRenderer.redraw(this.state, true);
  }

  /**
   * Function: getRotation
   *
   * Returns the rotation defined in the style of the cell.
   */
  getRotation(): any {
    if (this.state.shape != null) {
      return this.state.shape.getRotation();
    }
    return 0;
  }

  /**
   * Function: getTotalRotation
   *
   * Returns the rotation from the style and the rotation from the direction of
   * the cell.
   */
  getTotalRotation(): any {
    if (this.state.shape != null) {
      return this.state.shape.getShapeRotation();
    }
    return 0;
  }

  /**
   * Function: init
   *
   * Creates and initializes the shapes required for this handle.
   */
  init(): void {
    const html = this.isHtmlRequired();
    if (this.image != null) {
      this.shape = new mxImageShape(new mxRectangle(0, 0, this.image.width, this.image.height), this.image.src);
      this.shape.preserveImageAspect = false;
    } else {
      this.shape = this.createShape(html);
    }
    this.initShape(html);
  }

  /**
   * Function: createShape
   *
   * Creates and returns the shape for this handle.
   */
  createShape(html: string): any {
    const bounds = new mxRectangle(0, 0, mxConstants.HANDLE_SIZE, mxConstants.HANDLE_SIZE);
    return new mxRectangleShape(bounds, mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
  }

  /**
   * Function: initShape
   *
   * Initializes <shape> and sets its cursor.
   */
  initShape(html: string): void {
    if (html && this.shape.isHtmlAllowed()) {
      this.shape.dialect = mxConstants.DIALECT_STRICTHTML;
      this.shape.init(this.graph.container);
    } else {
      this.shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
      if (this.cursor != null) {
        this.shape.init(this.graph.getView().getOverlayPane());
      }
    }
    mxEvent.redirectMouseEvents(this.shape.node, this.graph, this.state);
    this.shape.node.style.cursor = this.cursor;
  }

  /**
   * Function: redraw
   *
   * Renders the shape for this handle.
   */
  redraw(): void {
    if (this.shape != null && this.state.shape != null) {
      let pt = this.getPosition(this.state.getPaintBounds());
      if (pt != null) {
        const alpha = mxUtils.toRadians(this.getTotalRotation());
        pt = this.rotatePoint(this.flipPoint(pt), alpha);
        const scale = this.graph.view.scale;
        const tr = this.graph.view.translate;
        this.shape.bounds.x = Math.floor((pt.x + tr.x) * scale - this.shape.bounds.width / 2);
        this.shape.bounds.y = Math.floor((pt.y + tr.y) * scale - this.shape.bounds.height / 2);
        this.shape.redraw();
      }
    }
  }

  /**
   * Function: isHtmlRequired
   *
   * Returns true if this handle should be rendered in HTML. This returns true if
   * the text node is in the graph container.
   */
  isHtmlRequired(): boolean {
    return this.state.text != null && this.state.text.node.parentNode == this.graph.container;
  }

  /**
   * Function: rotatePoint
   *
   * Rotates the point by the given angle.
   */
  rotatePoint(pt: any, alpha: any): any {
    const bounds = this.state.getCellBounds();
    const cx = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
    const cos = Math.cos(alpha);
    const sin = Math.sin(alpha);
    return mxUtils.getRotatedPoint(pt, cos, sin, cx);
  }

  /**
   * Function: flipPoint
   *
   * Flips the given point vertically and/or horizontally.
   */
  flipPoint(pt: any): any {
    if (this.state.shape != null) {
      const bounds = this.state.getCellBounds();
      if (this.state.shape.flipH) {
        pt.x = 2 * bounds.x + bounds.width - pt.x;
      }
      if (this.state.shape.flipV) {
        pt.y = 2 * bounds.y + bounds.height - pt.y;
      }
    }
    return pt;
  }

  /**
   * Function: snapPoint
   *
   * Snaps the given point to the grid if ignore is false. This modifies
   * the given point in-place and also returns it.
   */
  snapPoint(pt: any, ignore: any): any {
    if (!ignore) {
      pt.x = this.graph.snap(pt.x);
      pt.y = this.graph.snap(pt.y);
    }
    return pt;
  }

  /**
   * Function: setVisible
   *
   * Shows or hides this handle.
   */
  setVisible(visible: any): void {
    if (this.shape != null && this.shape.node != null) {
      this.shape.node.style.display = (visible) ? '' : 'none';
    }
  }

  /**
   * Function: reset
   *
   * Resets the state of this handle by setting its visibility to true.
   */
  reset(): void {
    this.setVisible(true);
    this.state.style = this.graph.getCellStyle(this.state.cell);
    this.positionChanged();
  }

  /**
   * Function: destroy
   *
   * Destroys this handle.
   */
  destroy(): void {
    if (this.shape != null) {
      this.shape.destroy();
      this.shape = null;
    }
  }
}
