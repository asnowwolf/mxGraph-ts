/**
 * Class: mxConnectionConstraint
 *
 * Defines an object that contains the constraints about how to connect one
 * side of an edge to its terminal.
 *
 * Constructor: mxConnectionConstraint
 *
 * Constructs a new connection constraint for the given point and boolean
 * arguments.
 *
 * Parameters:
 *
 * point - Optional <mxPoint> that specifies the fixed location of the point
 * in relative coordinates. Default is null.
 * perimeter - Optional boolean that specifies if the fixed point should be
 * projected onto the perimeter of the terminal. Default is true.
 */
export class mxConnectionConstraint {
  constructor(point: any, perimeter: any, name: string, dx: number, dy: number) {
    this.point = point;
    this.perimeter = (perimeter != null) ? perimeter : true;
    this.name = name;
    this.dx = dx ? dx : 0;
    this.dy = dy ? dy : 0;
  }

  point: any;
  perimeter: any;
  name: string;
  dx: number;
  dy: number;
}
