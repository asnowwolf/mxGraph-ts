/**
 * Class: mxDoubleEllipse
 *
 * Extends <mxShape> to implement a double ellipse shape. This shape is
 * registered under <mxConstants.SHAPE_DOUBLE_ELLIPSE> in <mxCellRenderer>.
 * Use the following override to only fill the inner ellipse in this shape:
 *
 * (code)
 * mxDoubleEllipse.prototype.paintVertexShape = function(c, x, y, w, h)
 * {
 *   c.ellipse(x, y, w, h);
 *   c.stroke();
 *
 *   var inset = mxUtils.getValue(this.style, mxConstants.STYLE_MARGIN, Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5)));
 *   x += inset;
 *   y += inset;
 *   w -= 2 * inset;
 *   h -= 2 * inset;
 *
 *   if (w > 0 && h > 0)
 *   {
 *     c.ellipse(x, y, w, h);
 *   }
 *
 *   c.fillAndStroke();
 * };
 * (end)
 *
 * Constructor: mxDoubleEllipse
 *
 * Constructs a new ellipse shape.
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
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxShape } from './mxShape';

export class mxDoubleEllipse extends mxShape {
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
   * Variable: vmlScale
   *
   * Scale for improving the precision of VML rendering. Default is 10.
   * @example 10
   */
  vmlScale: number = 10;

  /**
   * Function: paintBackground
   *
   * Paints the background.
   */
  paintBackground(c: any, x: number, y: number, w: number, h: number): void {
    c.ellipse(x, y, w, h);
    c.fillAndStroke();
  }

  /**
   * Function: paintForeground
   *
   * Paints the foreground.
   */
  paintForeground(c: any, x: number, y: number, w: number, h: number): void {
    if (!this.outline) {
      const margin = mxUtils.getValue(this.style, mxConstants.STYLE_MARGIN, Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5)));
      x += margin;
      y += margin;
      w -= 2 * margin;
      h -= 2 * margin;
      if (w > 0 && h > 0) {
        c.ellipse(x, y, w, h);
      }
      c.stroke();
    }
  }

  /**
   * Function: getLabelBounds
   *
   * Returns the bounds for the label.
   */
  getLabelBounds(rect: any): any {
    const margin = (mxUtils.getValue(this.style, mxConstants.STYLE_MARGIN, Math.min(3 + this.strokewidth, Math.min(rect.width / 5 / this.scale, rect.height / 5 / this.scale)))) * this.scale;
    return new mxRectangle(rect.x + margin, rect.y + margin, rect.width - 2 * margin, rect.height - 2 * margin);
  }
}
