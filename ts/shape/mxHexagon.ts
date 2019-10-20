/**
 * Class: mxHexagon
 *
 * Implementation of the hexagon shape.
 *
 * Constructor: mxHexagon
 *
 * Constructs a new hexagon shape.
 */
import { mxConstants } from '../util/mxConstants';
import { mxPoint } from '../util/mxPoint';
import { mxUtils } from '../util/mxUtils';

export class mxHexagon {
  /**
   * Function: redrawPath
   *
   * Draws the path for this shape.
   */
  redrawPath(c: any, x: number, y: number, w: number, h: number): void {
    const arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    this.addPoints(c, [new mxPoint(0.25 * w, 0), new mxPoint(0.75 * w, 0), new mxPoint(w, 0.5 * h), new mxPoint(0.75 * w, h), new mxPoint(0.25 * w, h), new mxPoint(0, 0.5 * h)], this.isRounded, arcSize, true);
  }
}
