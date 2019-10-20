/**
 * Class: mxRectangle
 *
 * Extends <mxPoint> to implement a 2-dimensional rectangle with double
 * precision coordinates.
 *
 * Constructor: mxRectangle
 *
 * Constructs a new rectangle for the optional parameters. If no parameters
 * are given then the respective default values are used.
 */
export class mxRectangle {
  /**
   * Function: fromRectangle
   *
   * Returns a new <mxRectangle> which is a copy of the given rectangle.
   */
  static fromRectangle(rect: any): any {
    return new mxRectangle(rect.x, rect.y, rect.width, rect.height);
  }

  width: number;
  height: number;
  x: number;
  y: number;

  constructor(x: number, y: number, width: number, height: number) {
    mxPoint.call(this, x, y);
    this.width = (width != null) ? width : 0;
    this.height = (height != null) ? height : 0;
  }

  /**
   * Function: setRect
   *
   * Sets this rectangle to the specified values
   */
  setRect(x: number, y: number, w: number, h: number): void {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  /**
   * Function: getCenterX
   *
   * Returns the x-coordinate of the center point.
   */
  getCenterX(): any {
    return this.x + this.width / 2;
  }

  /**
   * Function: getCenterY
   *
   * Returns the y-coordinate of the center point.
   */
  getCenterY(): any {
    return this.y + this.height / 2;
  }

  /**
   * Function: add
   *
   * Adds the given rectangle to this rectangle.
   */
  add(rect: any): void {
    if (rect != null) {
      const minX = Math.min(this.x, rect.x);
      const minY = Math.min(this.y, rect.y);
      const maxX = Math.max(this.x + this.width, rect.x + rect.width);
      const maxY = Math.max(this.y + this.height, rect.y + rect.height);
      this.x = minX;
      this.y = minY;
      this.width = maxX - minX;
      this.height = maxY - minY;
    }
  }

  /**
   * Function: intersect
   *
   * Changes this rectangle to where it overlaps with the given rectangle.
   */
  intersect(rect: any): void {
    if (rect != null) {
      const r1 = this.x + this.width;
      const r2 = rect.x + rect.width;
      const b1 = this.y + this.height;
      const b2 = rect.y + rect.height;
      this.x = Math.max(this.x, rect.x);
      this.y = Math.max(this.y, rect.y);
      this.width = Math.min(r1, r2) - this.x;
      this.height = Math.min(b1, b2) - this.y;
    }
  }

  /**
   * Function: grow
   *
   * Grows the rectangle by the given amount, that is, this method subtracts
   * the given amount from the x- and y-coordinates and adds twice the amount
   * to the width and height.
   */
  grow(amount: any): void {
    this.x -= amount;
    this.y -= amount;
    this.width += 2 * amount;
    this.height += 2 * amount;
  }

  /**
   * Function: getPoint
   *
   * Returns the top, left corner as a new <mxPoint>.
   */
  getPoint(): any {
    return new mxPoint(this.x, this.y);
  }

  /**
   * Function: rotate90
   *
   * Rotates this rectangle by 90 degree around its center point.
   */
  rotate90(): void {
    const t = (this.width - this.height) / 2;
    this.x += t;
    this.y -= t;
    const tmp = this.width;
    this.width = this.height;
    this.height = tmp;
  }

  /**
   * Function: equals
   *
   * Returns true if the given object equals this rectangle.
   */
  equals(obj: any): any {
    return obj != null && obj.x == this.x && obj.y == this.y && obj.width == this.width && obj.height == this.height;
  }
}
