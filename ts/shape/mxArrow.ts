/**
 * Class: mxArrow
 *
 * Extends <mxShape> to implement an arrow shape. (The shape
 * is used to represent edges, not vertices.)
 * This shape is registered under <mxConstants.SHAPE_ARROW>
 * in <mxCellRenderer>.
 *
 * Constructor: mxArrow
 *
 * Constructs a new arrow shape.
 *
 * Parameters:
 *
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 * arrowWidth - Optional integer that defines the arrow width. Default is
 * <mxConstants.ARROW_WIDTH>. This is stored in <arrowWidth>.
 * spacing - Optional integer that defines the spacing between the arrow shape
 * and its endpoints. Default is <mxConstants.ARROW_SPACING>. This is stored in
 * <spacing>.
 * endSize - Optional integer that defines the size of the arrowhead. Default
 * is <mxConstants.ARROW_SIZE>. This is stored in <endSize>.
 */
import { mxConstants } from '../util/mxConstants';
import { mxShape } from './mxShape';

export class mxArrow extends mxShape {
  constructor(points: any, fill: any, stroke: any, strokewidth: any, arrowWidth: any, spacing: any, endSize: any) {
    super();
    this.points = points;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
    this.arrowWidth = (arrowWidth != null) ? arrowWidth : mxConstants.ARROW_WIDTH;
    this.spacing = (spacing != null) ? spacing : mxConstants.ARROW_SPACING;
    this.endSize = (endSize != null) ? endSize : mxConstants.ARROW_SIZE;
  }

  points: any;
  fill: any;
  stroke: any;
  strokewidth: any;
  arrowWidth: any;
  spacing: any;
  endSize: any;

  /**
   * Function: augmentBoundingBox
   *
   * Augments the bounding box with the edge width and markers.
   */
  augmentBoundingBox(bbox: any): void {
    mxShape.prototype.augmentBoundingBox.apply(this, arguments);
    const w = Math.max(this.arrowWidth, this.endSize);
    bbox.grow((w / 2 + this.strokewidth) * this.scale);
  }

  /**
   * Function: paintEdgeShape
   *
   * Paints the line shape.
   */
  paintEdgeShape(c: any, pts: any): void {
    const spacing = mxConstants.ARROW_SPACING;
    const width = mxConstants.ARROW_WIDTH;
    const arrow = mxConstants.ARROW_SIZE;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    const dx = pe.x - p0.x;
    const dy = pe.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const length = dist - 2 * spacing - arrow;
    const nx = dx / dist;
    const ny = dy / dist;
    const basex = length * nx;
    const basey = length * ny;
    const floorx = width * ny / 3;
    const floory = -width * nx / 3;
    const p0x = p0.x - floorx / 2 + spacing * nx;
    const p0y = p0.y - floory / 2 + spacing * ny;
    const p1x = p0x + floorx;
    const p1y = p0y + floory;
    const p2x = p1x + basex;
    const p2y = p1y + basey;
    const p3x = p2x + floorx;
    const p3y = p2y + floory;
    const p5x = p3x - 3 * floorx;
    const p5y = p3y - 3 * floory;
    c.begin();
    c.moveTo(p0x, p0y);
    c.lineTo(p1x, p1y);
    c.lineTo(p2x, p2y);
    c.lineTo(p3x, p3y);
    c.lineTo(pe.x - spacing * nx, pe.y - spacing * ny);
    c.lineTo(p5x, p5y);
    c.lineTo(p5x + floorx, p5y + floory);
    c.close();
    c.fillAndStroke();
  }
}
