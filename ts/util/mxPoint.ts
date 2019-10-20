/**
 * Class: mxPoint
 *
 * Implements a 2-dimensional vector with double precision coordinates.
 *
 * Constructor: mxPoint
 *
 * Constructs a new point for the optional x and y coordinates. If no
 * coordinates are given, then the default values for <x> and <y> are used.
 */
export class mxPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = (x != null) ? x : 0;
    this.y = (y != null) ? y : 0;
  }

  /**
   * Function: equals
   *
   * Returns true if the given object equals this point.
   */
  equals(obj: any): any {
    return obj != null && obj.x == this.x && obj.y == this.y;
  }

  /**
   * Function: clone
   *
   * Returns a clone of this <mxPoint>.
   */
  clone(): boolean {
    return mxUtils.clone(this);
  }
}
