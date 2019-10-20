/**
 * Class: mxArrowConnector
 *
 * Extends <mxShape> to implement an new rounded arrow shape with support for
 * waypoints and double arrows. (The shape is used to represent edges, not
 * vertices.) This shape is registered under <mxConstants.SHAPE_ARROW_CONNECTOR>
 * in <mxCellRenderer>.
 *
 * Constructor: mxArrowConnector
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
import { mxUtils } from '../util/mxUtils';
import { mxShape } from './mxShape';

export class mxArrowConnector extends mxShape {
  constructor(points: any, fill: any, stroke: any, strokewidth: any, arrowWidth: any, spacing: any, endSize: any) {
    super();
    this.points = points;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
    this.arrowWidth = (arrowWidth != null) ? arrowWidth : mxConstants.ARROW_WIDTH;
    this.arrowSpacing = (spacing != null) ? spacing : mxConstants.ARROW_SPACING;
    this.startSize = mxConstants.ARROW_SIZE / 5;
    this.endSize = mxConstants.ARROW_SIZE / 5;
  }

  points: any;
  fill: any;
  stroke: any;
  strokewidth: any;
  arrowWidth: any;
  arrowSpacing: any;
  startSize: any;
  endSize: any;
  /**
   * Variable: useSvgBoundingBox
   *
   * Allows to use the SVG bounding box in SVG. Default is false for performance
   * reasons.
   * @example true
   */
  useSvgBoundingBox: boolean;

  /**
   * Variable: resetStyles
   *
   * Overrides mxShape to reset spacing.
   */
  resetStyles(): void {
    mxShape.prototype.resetStyles.apply(this, arguments);
    this.arrowSpacing = mxConstants.ARROW_SPACING;
  }

  /**
   * Overrides apply to get smooth transition from default start- and endsize.
   */
  apply(state: any): void {
    mxShape.prototype.apply.apply(this, arguments);
    if (this.style != null) {
      this.startSize = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.ARROW_SIZE / 5) * 3;
      this.endSize = mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, mxConstants.ARROW_SIZE / 5) * 3;
    }
  }

  /**
   * Function: augmentBoundingBox
   *
   * Augments the bounding box with the edge width and markers.
   */
  augmentBoundingBox(bbox: any): void {
    mxShape.prototype.augmentBoundingBox.apply(this, arguments);
    let w = this.getEdgeWidth();
    if (this.isMarkerStart()) {
      w = Math.max(w, this.getStartArrowWidth());
    }
    if (this.isMarkerEnd()) {
      w = Math.max(w, this.getEndArrowWidth());
    }
    bbox.grow((w / 2 + this.strokewidth) * this.scale);
  }

  /**
   * Function: paintEdgeShape
   *
   * Paints the line shape.
   */
  paintEdgeShape(c: any, pts: any): void {
    let strokeWidth = this.strokewidth;
    if (this.outline) {
      strokeWidth = Math.max(1, mxUtils.getNumber(this.style, mxConstants.STYLE_STROKEWIDTH, this.strokewidth));
    }
    const startWidth = this.getStartArrowWidth() + strokeWidth;
    const endWidth = this.getEndArrowWidth() + strokeWidth;
    const edgeWidth = this.outline ? this.getEdgeWidth() + strokeWidth : this.getEdgeWidth();
    const openEnded = this.isOpenEnded();
    const markerStart = this.isMarkerStart();
    const markerEnd = this.isMarkerEnd();
    const spacing = (openEnded) ? 0 : this.arrowSpacing + strokeWidth / 2;
    const startSize = this.startSize + strokeWidth;
    const endSize = this.endSize + strokeWidth;
    const isRounded = this.isArrowRounded();
    const pe = pts[pts.length - 1];
    let i0 = 1;
    while (i0 < pts.length - 1 && pts[i0].x == pts[0].x && pts[i0].y == pts[0].y) {
      i0++;
    }
    const dx = pts[i0].x - pts[0].x;
    const dy = pts[i0].y - pts[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist == 0) {
      return;
    }
    let nx = dx / dist;
    let nx2, nx1 = nx;
    let ny = dy / dist;
    let ny2, ny1 = ny;
    let orthx = edgeWidth * ny;
    let orthy = -edgeWidth * nx;
    const fns = [];
    if (isRounded) {
      c.setLineJoin('round');
    } else if (pts.length > 2) {
      c.setMiterLimit(1.42);
    }
    c.begin();
    const startNx = nx;
    const startNy = ny;
    if (markerStart && !openEnded) {
      this.paintMarker(c, pts[0].x, pts[0].y, nx, ny, startSize, startWidth, edgeWidth, spacing, true);
    } else {
      const outStartX = pts[0].x + orthx / 2 + spacing * nx;
      const outStartY = pts[0].y + orthy / 2 + spacing * ny;
      const inEndX = pts[0].x - orthx / 2 + spacing * nx;
      const inEndY = pts[0].y - orthy / 2 + spacing * ny;
      if (openEnded) {
        c.moveTo(outStartX, outStartY);
        fns.push(function () {
          c.lineTo(inEndX, inEndY);
        });
      } else {
        c.moveTo(inEndX, inEndY);
        c.lineTo(outStartX, outStartY);
      }
    }
    let dx1 = 0;
    let dy1 = 0;
    let dist1 = 0;
    for (let i = 0; i < pts.length - 2; i++) {
      const pos = mxUtils.relativeCcw(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, pts[i + 2].x, pts[i + 2].y);
      dx1 = pts[i + 2].x - pts[i + 1].x;
      dy1 = pts[i + 2].y - pts[i + 1].y;
      dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      if (dist1 != 0) {
        nx1 = dx1 / dist1;
        ny1 = dy1 / dist1;
        const tmp1 = nx * nx1 + ny * ny1;
        tmp = Math.max(Math.sqrt((tmp1 + 1) / 2), 0.04);
        nx2 = (nx + nx1);
        ny2 = (ny + ny1);
        const dist2 = Math.sqrt(nx2 * nx2 + ny2 * ny2);
        if (dist2 != 0) {
          nx2 = nx2 / dist2;
          ny2 = ny2 / dist2;
          const strokeWidthFactor = Math.max(tmp, Math.min(this.strokewidth / 200 + 0.04, 0.35));
          const angleFactor = (pos != 0 && isRounded) ? Math.max(0.1, strokeWidthFactor) : Math.max(tmp, 0.06);
          const outX = pts[i + 1].x + ny2 * edgeWidth / 2 / angleFactor;
          const outY = pts[i + 1].y - nx2 * edgeWidth / 2 / angleFactor;
          const inX = pts[i + 1].x - ny2 * edgeWidth / 2 / angleFactor;
          const inY = pts[i + 1].y + nx2 * edgeWidth / 2 / angleFactor;
          if (pos == 0 || !isRounded) {
            c.lineTo(outX, outY);
            (function (x, y) {
              fns.push(function () {
                c.lineTo(x, y);
              });
            })(inX, inY);
          } else if (pos == -1) {
            const c1x = inX + ny * edgeWidth;
            const c1y = inY - nx * edgeWidth;
            const c2x = inX + ny1 * edgeWidth;
            const c2y = inY - nx1 * edgeWidth;
            c.lineTo(c1x, c1y);
            c.quadTo(outX, outY, c2x, c2y);
            (function (x, y) {
              fns.push(function () {
                c.lineTo(x, y);
              });
            })(inX, inY);
          } else {
            c.lineTo(outX, outY);
            (function (x, y) {
              const c1x = outX - ny * edgeWidth;
              const c1y = outY + nx * edgeWidth;
              const c2x = outX - ny1 * edgeWidth;
              const c2y = outY + nx1 * edgeWidth;
              fns.push(function () {
                c.quadTo(x, y, c1x, c1y);
              });
              fns.push(function () {
                c.lineTo(c2x, c2y);
              });
            })(inX, inY);
          }
          nx = nx1;
          ny = ny1;
        }
      }
    }
    orthx = edgeWidth * ny1;
    orthy = -edgeWidth * nx1;
    if (markerEnd && !openEnded) {
      this.paintMarker(c, pe.x, pe.y, -nx, -ny, endSize, endWidth, edgeWidth, spacing, false);
    } else {
      c.lineTo(pe.x - spacing * nx1 + orthx / 2, pe.y - spacing * ny1 + orthy / 2);
      const inStartX = pe.x - spacing * nx1 - orthx / 2;
      const inStartY = pe.y - spacing * ny1 - orthy / 2;
      if (!openEnded) {
        c.lineTo(inStartX, inStartY);
      } else {
        c.moveTo(inStartX, inStartY);
        fns.splice(0, 0, function () {
          c.moveTo(inStartX, inStartY);
        });
      }
    }
    for (let i = fns.length - 1; i >= 0; i--) {
      fns[i]();
    }
    if (openEnded) {
      c.end();
      c.stroke();
    } else {
      c.close();
      c.fillAndStroke();
    }
    c.setShadow(false);
    c.setMiterLimit(4);
    if (isRounded) {
      c.setLineJoin('flat');
    }
    if (pts.length > 2) {
      c.setMiterLimit(4);
      if (markerStart && !openEnded) {
        c.begin();
        this.paintMarker(c, pts[0].x, pts[0].y, startNx, startNy, startSize, startWidth, edgeWidth, spacing, true);
        c.stroke();
        c.end();
      }
      if (markerEnd && !openEnded) {
        c.begin();
        this.paintMarker(c, pe.x, pe.y, -nx, -ny, endSize, endWidth, edgeWidth, spacing, true);
        c.stroke();
        c.end();
      }
    }
  }

  /**
   * Function: paintEdgeShape
   *
   * Paints the line shape.
   */
  paintMarker(c: any, ptX: any, ptY: any, nx: any, ny: any, size: any, arrowWidth: any, edgeWidth: any, spacing: any, initialMove: any): void {
    const widthArrowRatio = edgeWidth / arrowWidth;
    const orthx = edgeWidth * ny / 2;
    const orthy = -edgeWidth * nx / 2;
    const spaceX = (spacing + size) * nx;
    const spaceY = (spacing + size) * ny;
    if (initialMove) {
      c.moveTo(ptX - orthx + spaceX, ptY - orthy + spaceY);
    } else {
      c.lineTo(ptX - orthx + spaceX, ptY - orthy + spaceY);
    }
    c.lineTo(ptX - orthx / widthArrowRatio + spaceX, ptY - orthy / widthArrowRatio + spaceY);
    c.lineTo(ptX + spacing * nx, ptY + spacing * ny);
    c.lineTo(ptX + orthx / widthArrowRatio + spaceX, ptY + orthy / widthArrowRatio + spaceY);
    c.lineTo(ptX + orthx + spaceX, ptY + orthy + spaceY);
  }

  /**
   * Function: isArrowRounded
   *
   * Returns wether the arrow is rounded
   */
  isArrowRounded(): boolean {
    return this.isRounded;
  }

  /**
   * Function: getStartArrowWidth
   *
   * Returns the width of the start arrow
   */
  getStartArrowWidth(): any {
    return mxConstants.ARROW_WIDTH;
  }

  /**
   * Function: getEndArrowWidth
   *
   * Returns the width of the end arrow
   */
  getEndArrowWidth(): any {
    return mxConstants.ARROW_WIDTH;
  }

  /**
   * Function: getEdgeWidth
   *
   * Returns the width of the body of the edge
   */
  getEdgeWidth(): any {
    return mxConstants.ARROW_WIDTH / 3;
  }

  /**
   * Function: isOpenEnded
   *
   * Returns whether the ends of the shape are drawn
   */
  isOpenEnded(): boolean {
    return false;
  }

  /**
   * Function: isMarkerStart
   *
   * Returns whether the start marker is drawn
   */
  isMarkerStart(): boolean {
    return (mxUtils.getValue(this.style, mxConstants.STYLE_STARTARROW, mxConstants.NONE) != mxConstants.NONE);
  }

  /**
   * Function: isMarkerEnd
   *
   * Returns whether the end marker is drawn
   */
  isMarkerEnd(): boolean {
    return (mxUtils.getValue(this.style, mxConstants.STYLE_ENDARROW, mxConstants.NONE) != mxConstants.NONE);
  }
}
