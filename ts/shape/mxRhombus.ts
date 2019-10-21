/**
 * Class: mxRhombus
 *
 * Extends <mxShape> to implement a rhombus (aka diamond) shape.
 * This shape is registered under <mxConstants.SHAPE_RHOMBUS>
 * in <mxCellRenderer>.
 *
 * Constructor: mxRhombus
 *
 * Constructs a new rhombus shape.
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
import { mxConstants } from '../util/mxConstants';
import { mxPoint } from '../util/mxPoint';
import { mxUtils } from '../util/mxUtils';
import { mxShape } from './mxShape';

export class mxRhombus extends mxShape {
  constructor(bounds: any, fill: any, stroke: any, strokewidth: any) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (!!strokewidth) ? strokewidth : 1;
  }

  bounds: any;
  fill: any;
  stroke: any;
  strokewidth: any;

  /**
   * Function: isRoundable
   *
   * Adds roundable support.
   */
  isRoundable(): boolean {
    return true;
  }

  /**
   * Function: paintVertexShape
   *
   * Generic painting implementation.
   */
  paintVertexShape(c: any, x: number, y: number, w: number, h: number): void {
    const hw = w / 2;
    const hh = h / 2;
    const arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    c.begin();
    this.addPoints(c, [new mxPoint(x + hw, y), new mxPoint(x + w, y + hh), new mxPoint(x + hw, y + h), new mxPoint(x, y + hh)], this.isRounded, arcSize, true);
    c.fillAndStroke();
  }
}
