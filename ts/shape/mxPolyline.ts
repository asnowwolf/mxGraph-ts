/**
 * Class: mxPolyline
 *
 * Extends <mxShape> to implement a polyline (a line with multiple points).
 * This shape is registered under <mxConstants.SHAPE_POLYLINE> in
 * <mxCellRenderer>.
 *
 * Constructor: mxPolyline
 *
 * Constructs a new polyline shape.
 *
 * Parameters:
 *
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * stroke - String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
import { mxConstants } from '../util/mxConstants';
import { mxUtils } from '../util/mxUtils';
import { mxShape } from './mxShape';

export class mxPolyline extends mxShape {
  constructor(points: any, stroke: any, strokewidth: any) {
    super();
    this.points = points;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
  }

  points: any;
  stroke: any;
  strokewidth: any;

  /**
   * Function: getRotation
   *
   * Returns 0.
   */
  getRotation(): any {
    return 0;
  }

  /**
   * Function: getShapeRotation
   *
   * Returns 0.
   */
  getShapeRotation(): any {
    return 0;
  }

  /**
   * Function: isPaintBoundsInverted
   *
   * Returns false.
   */
  isPaintBoundsInverted(): boolean {
    return false;
  }

  /**
   * Function: paintEdgeShape
   *
   * Paints the line shape.
   */
  paintEdgeShape(c: any, pts: any): void {
    const prev = c.pointerEventsValue;
    c.pointerEventsValue = 'stroke';
    if (this.style == null || this.style[mxConstants.STYLE_CURVED] != 1) {
      this.paintLine(c, pts, this.isRounded);
    } else {
      this.paintCurvedLine(c, pts);
    }
    c.pointerEventsValue = prev;
  }

  /**
   * Function: paintLine
   *
   * Paints the line shape.
   */
  paintLine(c: any, pts: any, rounded: any): void {
    const arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    c.begin();
    this.addPoints(c, pts, rounded, arcSize, false);
    c.stroke();
  }

  /**
   * Function: paintLine
   *
   * Paints the line shape.
   */
  paintCurvedLine(c: any, pts: any): void {
    c.begin();
    const pt = pts[0];
    const n = pts.length;
    c.moveTo(pt.x, pt.y);
    for (let i = 1; i < n - 2; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const ix = (p0.x + p1.x) / 2;
      const iy = (p0.y + p1.y) / 2;
      c.quadTo(p0.x, p0.y, ix, iy);
    }
    const p0 = pts[n - 2];
    const p1 = pts[n - 1];
    c.quadTo(p0.x, p0.y, p1.x, p1.y);
    c.stroke();
  }
}
