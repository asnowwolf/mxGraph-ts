/**
 * Class: mxTriangle
 *
 * Implementation of the triangle shape.
 *
 * Constructor: mxTriangle
 *
 * Constructs a new triangle shape.
 */
export class mxTriangle {
  /**
   * Function: isRoundable
   *
   * Adds roundable support.
   */
  isRoundable(): boolean {
    return true;
  }

  /**
   * Function: redrawPath
   *
   * Draws the path for this shape.
   */
  redrawPath(c: any, x: number, y: number, w: number, h: number): void {
    const arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0.5 * h), new mxPoint(0, h)], this.isRounded, arcSize, true);
  }
}
