/**
 * Class: mxCylinder
 *
 * Extends <mxShape> to implement an cylinder shape. If a
 * custom shape with one filled area and an overlay path is
 * needed, then this shape's <redrawPath> should be overridden.
 * This shape is registered under <mxConstants.SHAPE_CYLINDER>
 * in <mxCellRenderer>.
 *
 * Constructor: mxCylinder
 *
 * Constructs a new cylinder shape.
 *
 * Parameters:
 *
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
export class mxCylinder {
  bounds: any;
  fill: any;
  stroke: any;
  strokewidth: any;
  /**
   * Variable: maxHeight
   *
   * Defines the maximum height of the top and bottom part
   * of the cylinder shape.
   * @example 40
   */
  maxHeight: number;
  /**
   * Variable: svgStrokeTolerance
   *
   * Sets stroke tolerance to 0 for SVG.
   */
  svgStrokeTolerance: number;

  constructor(bounds: any, fill: any, stroke: any, strokewidth: any) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
  }

  /**
   * Function: paintVertexShape
   *
   * Redirects to redrawPath for subclasses to work.
   */
  paintVertexShape(c: any, x: number, y: number, w: number, h: number): void {
    c.translate(x, y);
    c.begin();
    this.redrawPath(c, x, y, w, h, false);
    c.fillAndStroke();
    if (!this.outline || this.style == null || mxUtils.getValue(this.style, mxConstants.STYLE_BACKGROUND_OUTLINE, 0) == 0) {
      c.setShadow(false);
      c.begin();
      this.redrawPath(c, x, y, w, h, true);
      c.stroke();
    }
  }

  /**
   * Function: redrawPath
   *
   * Draws the path for this shape.
   */
  getCylinderSize(x: number, y: number, w: number, h: number): any {
    return Math.min(this.maxHeight, Math.round(h / 5));
  }

  /**
   * Function: redrawPath
   *
   * Draws the path for this shape.
   */
  redrawPath(c: any, x: number, y: number, w: number, h: number, isForeground: boolean): void {
    const dy = this.getCylinderSize(x, y, w, h);
    if ((isForeground && this.fill != null) || (!isForeground && this.fill == null)) {
      c.moveTo(0, dy);
      c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
      if (!isForeground) {
        c.stroke();
        c.begin();
      }
    }
    if (!isForeground) {
      c.moveTo(0, dy);
      c.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
      c.lineTo(w, h - dy);
      c.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
      c.close();
    }
  }
}
