/**
 * Class: mxLine
 *
 * Extends <mxShape> to implement a horizontal line shape.
 * This shape is registered under <mxConstants.SHAPE_LINE> in
 * <mxCellRenderer>.
 *
 * Constructor: mxLine
 *
 * Constructs a new line shape.
 *
 * Parameters:
 *
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * stroke - String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
import { mxShape } from './mxShape';

export class mxLine extends mxShape {
  constructor(bounds: any, stroke: any, strokewidth: any) {
    super();
    this.bounds = bounds;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
  }

  bounds: any;
  stroke: any;
  strokewidth: any;

  /**
   * Function: paintVertexShape
   *
   * Redirects to redrawPath for subclasses to work.
   */
  paintVertexShape(c: any, x: number, y: number, w: number, h: number): void {
    const mid = y + h / 2;
    c.begin();
    c.moveTo(x, mid);
    c.lineTo(x + w, mid);
    c.stroke();
  }
}
