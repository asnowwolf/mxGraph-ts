/**
 * Class: mxElbowEdgeHandler
 *
 * Graph event handler that reconnects edges and modifies control points and
 * the edge label location. Uses <mxTerminalMarker> for finding and
 * highlighting new source and target vertices. This handler is automatically
 * created in <mxGraph.createHandler>. It extends <mxEdgeHandler>.
 *
 * Constructor: mxEdgeHandler
 *
 * Constructs an edge handler for the specified <mxCellState>.
 *
 * Parameters:
 *
 * state - <mxCellState> of the cell to be modified.
 */
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxResources } from '../util/mxResources';
import { mxUtils } from '../util/mxUtils';
import { mxEdgeStyle } from '../view/mxEdgeStyle';
import { mxEdgeHandler } from './mxEdgeHandler';

export class mxElbowEdgeHandler extends mxEdgeHandler {
  constructor(state: any) {
    super(state);
  }

  /**
   * Specifies if a double click on the middle handle should call
   * <mxGraph.flipEdge>. Default is true.
   * @example true
   */
  flipEnabled: boolean = true;
  /**
   * Variable: doubleClickOrientationResource
   *
   * Specifies the resource key for the tooltip to be displayed on the single
   * control point for routed edges. If the resource for this key does not
   * exist then the value is used as the error message. Default is
   * 'doubleClickOrientation'.
   */
  doubleClickOrientationResource: any = true;

  /**
   * Function: createBends
   *
   * Overrides <mxEdgeHandler.createBends> to create custom bends.
   */
  createBends(): any {
    const bends = [];
    let bend = this.createHandleShape(0);
    this.initBend(bend);
    bend.setCursor(mxConstants.CURSOR_TERMINAL_HANDLE);
    bends.push(bend);
    bends.push(this.createVirtualBend((evt) => {
      if (!mxEvent.isConsumed(evt) && this.flipEnabled) {
        this.graph.flipEdge(this.state.cell, evt);
        mxEvent.consume(evt);
      }
    }));
    this.points.push(new mxPoint(0, 0));
    bend = this.createHandleShape(2);
    this.initBend(bend);
    bend.setCursor(mxConstants.CURSOR_TERMINAL_HANDLE);
    bends.push(bend);
    return bends;
  }

  /**
   * Function: createVirtualBend
   *
   * Creates a virtual bend that supports double clicking and calls
   * <mxGraph.flipEdge>.
   */
  createVirtualBend(dblClickHandler: Function): any {
    const bend = this.createHandleShape();
    this.initBend(bend, dblClickHandler);
    bend.setCursor(this.getCursorForBend());
    if (!this.graph.isCellBendable(this.state.cell)) {
      bend.node.style.display = 'none';
    }
    return bend;
  }

  /**
   * Function: getCursorForBend
   *
   * Returns the cursor to be used for the bend.
   */
  getCursorForBend(): any {
    return (this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.TopToBottom || this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_TOPTOBOTTOM || ((this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.ElbowConnector || this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_ELBOW) && this.state.style[mxConstants.STYLE_ELBOW] == mxConstants.ELBOW_VERTICAL)) ? 'row-resize' : 'col-resize';
  }

  /**
   * Function: getTooltipForNode
   *
   * Returns the tooltip for the given node.
   */
  getTooltipForNode(node: Node): any {
    let tip = undefined;
    if (!!this.bends && this.bends[1] && (node == this.bends[1].node || node.parentNode == this.bends[1].node)) {
      tip = this.doubleClickOrientationResource;
      tip = mxResources.get(tip) || tip;
    }
    return tip;
  }

  /**
   * Function: convertPoint
   *
   * Converts the given point in-place from screen to unscaled, untranslated
   * graph coordinates and applies the grid.
   *
   * Parameters:
   *
   * point - <mxPoint> to be converted.
   * gridEnabled - Boolean that specifies if the grid should be applied.
   */
  convertPoint(point: any, gridEnabled: any): any {
    const scale = this.graph.getView().getScale();
    const tr = this.graph.getView().getTranslate();
    const origin = this.state.origin;
    if (gridEnabled) {
      point.x = this.graph.snap(point.x);
      point.y = this.graph.snap(point.y);
    }
    point.x = Math.round(point.x / scale - tr.x - origin.x);
    point.y = Math.round(point.y / scale - tr.y - origin.y);
    return point;
  }

  /**
   * Function: redrawInnerBends
   *
   * Updates and redraws the inner bends.
   *
   * Parameters:
   *
   * p0 - <mxPoint> that represents the location of the first point.
   * pe - <mxPoint> that represents the location of the last point.
   */
  redrawInnerBends(p0: any, pe: any): void {
    const g = this.graph.getModel().getGeometry(this.state.cell);
    const pts = this.state.absolutePoints;
    let pt = undefined;
    if (pts.length > 1) {
      p0 = pts[1];
      pe = pts[pts.length - 2];
    } else if (!!g.points && g.points.length > 0) {
      pt = pts[0];
    }
    if (!pt) {
      pt = new mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
    } else {
      pt = new mxPoint(this.graph.getView().scale * (pt.x + this.graph.getView().translate.x + this.state.origin.x), this.graph.getView().scale * (pt.y + this.graph.getView().translate.y + this.state.origin.y));
    }
    const b = this.bends[1].bounds;
    let w = b.width;
    let h = b.height;
    let bounds = new mxRectangle(Math.round(pt.x - w / 2), Math.round(pt.y - h / 2), w, h);
    if (this.manageLabelHandle) {
      this.checkLabelHandle(bounds);
    } else if (!this.handleImage && this.labelShape.visible && mxUtils.intersects(bounds, this.labelShape.bounds)) {
      w = mxConstants.HANDLE_SIZE + 3;
      h = mxConstants.HANDLE_SIZE + 3;
      bounds = new mxRectangle(Math.floor(pt.x - w / 2), Math.floor(pt.y - h / 2), w, h);
    }
    this.bends[1].bounds = bounds;
    this.bends[1].redraw();
    if (this.manageLabelHandle) {
      this.checkLabelHandle(this.bends[1].bounds);
    }
  }
}
