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
import { mxUtils } from './mxUtils';

export class mxPoint {
  constructor(x: number, y: number) {
    this.x = (!!x) ? x : 0;
    this.y = (!!y) ? y : 0;
  }

  x: number;
  y: number;

  /**
   * Function: equals
   *
   * Returns true if the given object equals this point.
   */
  equals(obj: any): any {
    return !!obj && obj.x == this.x && obj.y == this.y;
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
