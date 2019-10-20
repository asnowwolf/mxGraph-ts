/**
 * Class: mxSwimlane
 *
 * Extends <mxShape> to implement a swimlane shape. This shape is registered
 * under <mxConstants.SHAPE_SWIMLANE> in <mxCellRenderer>. Use the
 * <mxConstants.STYLE_STYLE_STARTSIZE> to define the size of the title
 * region, <mxConstants.STYLE_SWIMLANE_FILLCOLOR> for the content area fill,
 * <mxConstants.STYLE_SEPARATORCOLOR> to draw an additional vertical separator
 * and <mxConstants.STYLE_SWIMLANE_LINE> to hide the line between the title
 * region and the content area. The <mxConstants.STYLE_HORIZONTAL> affects
 * the orientation of this shape, not only its label.
 *
 * Constructor: mxSwimlane
 *
 * Constructs a new swimlane shape.
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

export class mxSwimlane extends mxShape {
  constructor(bounds: any, fill: any, stroke: any, strokewidth: any) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
  }

  bounds: any;
  fill: any;
  stroke: any;
  strokewidth: any;
  /**
   * Variable: imageSize
   *
   * Default imagewidth and imageheight if an image but no imagewidth
   * and imageheight are defined in the style. Value is 16.
   * @example 16
   */
  imageSize: number;

  /**
   * Function: isRoundable
   *
   * Adds roundable support.
   */
  isRoundable(c: any, x: number, y: number, w: number, h: number): boolean {
    return true;
  }

  /**
   * Function: getGradientBounds
   *
   * Returns the bounding box for the gradient box for this shape.
   */
  getTitleSize(): any {
    return Math.max(0, mxUtils.getValue(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
  }

  /**
   * Function: getGradientBounds
   *
   * Returns the bounding box for the gradient box for this shape.
   */
  getLabelBounds(rect: any): any {
    const start = this.getTitleSize();
    const bounds = new mxRectangle(rect.x, rect.y, rect.width, rect.height);
    const horizontal = this.isHorizontal();
    const flipH = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPH, 0) == 1;
    const flipV = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPV, 0) == 1;
    const shapeVertical = (this.direction == mxConstants.DIRECTION_NORTH || this.direction == mxConstants.DIRECTION_SOUTH);
    const realHorizontal = horizontal == !shapeVertical;
    const realFlipH = !realHorizontal && flipH != (this.direction == mxConstants.DIRECTION_SOUTH || this.direction == mxConstants.DIRECTION_WEST);
    const realFlipV = realHorizontal && flipV != (this.direction == mxConstants.DIRECTION_SOUTH || this.direction == mxConstants.DIRECTION_WEST);
    if (!shapeVertical) {
      const tmp = Math.min(bounds.height, start * this.scale);
      if (realFlipH || realFlipV) {
        bounds.y += bounds.height - tmp;
      }
      bounds.height = tmp;
    } else {
      const tmp = Math.min(bounds.width, start * this.scale);
      if (realFlipH || realFlipV) {
        bounds.x += bounds.width - tmp;
      }
      bounds.width = tmp;
    }
    return bounds;
  }

  /**
   * Function: getGradientBounds
   *
   * Returns the bounding box for the gradient box for this shape.
   */
  getGradientBounds(c: any, x: number, y: number, w: number, h: number): any {
    let start = this.getTitleSize();
    if (this.isHorizontal()) {
      start = Math.min(start, h);
      return new mxRectangle(x, y, w, start);
    } else {
      start = Math.min(start, w);
      return new mxRectangle(x, y, start, h);
    }
  }

  /**
   * Function: getArcSize
   *
   * Returns the arcsize for the swimlane.
   */
  getArcSize(w: number, h: number, start: any): any {
    const f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
    return start * f * 3;
  }

  /**
   * Function: paintVertexShape
   *
   * Paints the swimlane vertex shape.
   */
  isHorizontal(): boolean {
    return mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, 1) == 1;
  }

  /**
   * Function: paintVertexShape
   *
   * Paints the swimlane vertex shape.
   */
  paintVertexShape(c: any, x: number, y: number, w: number, h: number): void {
    let start = this.getTitleSize();
    const fill = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_FILLCOLOR, mxConstants.NONE);
    const swimlaneLine = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_LINE, 1) == 1;
    let r = 0;
    if (this.isHorizontal()) {
      start = Math.min(start, h);
    } else {
      start = Math.min(start, w);
    }
    c.translate(x, y);
    if (!this.isRounded) {
      this.paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine);
    } else {
      r = this.getArcSize(w, h, start);
      r = Math.min(((this.isHorizontal()) ? h : w) - start, Math.min(start, r));
      this.paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine);
    }
    const sep = mxUtils.getValue(this.style, mxConstants.STYLE_SEPARATORCOLOR, mxConstants.NONE);
    this.paintSeparator(c, x, y, w, h, start, sep);
    if (this.image != null) {
      const bounds = this.getImageBounds(x, y, w, h);
      c.image(bounds.x - x, bounds.y - y, bounds.width, bounds.height, this.image, false, false, false);
    }
    if (this.glass) {
      c.setShadow(false);
      this.paintGlassEffect(c, 0, 0, w, start, r);
    }
  }

  /**
   * Function: paintSwimlane
   *
   * Paints the swimlane vertex shape.
   */
  paintSwimlane(c: any, x: number, y: number, w: number, h: number, start: any, fill: any, swimlaneLine: any): void {
    c.begin();
    if (this.isHorizontal()) {
      c.moveTo(0, start);
      c.lineTo(0, 0);
      c.lineTo(w, 0);
      c.lineTo(w, start);
      c.fillAndStroke();
      if (start < h) {
        if (fill == mxConstants.NONE) {
          c.pointerEvents = false;
        } else {
          c.setFillColor(fill);
        }
        c.begin();
        c.moveTo(0, start);
        c.lineTo(0, h);
        c.lineTo(w, h);
        c.lineTo(w, start);
        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    } else {
      c.moveTo(start, 0);
      c.lineTo(0, 0);
      c.lineTo(0, h);
      c.lineTo(start, h);
      c.fillAndStroke();
      if (start < w) {
        if (fill == mxConstants.NONE) {
          c.pointerEvents = false;
        } else {
          c.setFillColor(fill);
        }
        c.begin();
        c.moveTo(start, 0);
        c.lineTo(w, 0);
        c.lineTo(w, h);
        c.lineTo(start, h);
        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    }
    if (swimlaneLine) {
      this.paintDivider(c, x, y, w, h, start, fill == mxConstants.NONE);
    }
  }

  /**
   * Function: paintRoundedSwimlane
   *
   * Paints the swimlane vertex shape.
   */
  paintRoundedSwimlane(c: any, x: number, y: number, w: number, h: number, start: any, r: any, fill: any, swimlaneLine: any): void {
    c.begin();
    if (this.isHorizontal()) {
      c.moveTo(w, start);
      c.lineTo(w, r);
      c.quadTo(w, 0, w - Math.min(w / 2, r), 0);
      c.lineTo(Math.min(w / 2, r), 0);
      c.quadTo(0, 0, 0, r);
      c.lineTo(0, start);
      c.fillAndStroke();
      if (start < h) {
        if (fill == mxConstants.NONE) {
          c.pointerEvents = false;
        } else {
          c.setFillColor(fill);
        }
        c.begin();
        c.moveTo(0, start);
        c.lineTo(0, h - r);
        c.quadTo(0, h, Math.min(w / 2, r), h);
        c.lineTo(w - Math.min(w / 2, r), h);
        c.quadTo(w, h, w, h - r);
        c.lineTo(w, start);
        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    } else {
      c.moveTo(start, 0);
      c.lineTo(r, 0);
      c.quadTo(0, 0, 0, Math.min(h / 2, r));
      c.lineTo(0, h - Math.min(h / 2, r));
      c.quadTo(0, h, r, h);
      c.lineTo(start, h);
      c.fillAndStroke();
      if (start < w) {
        if (fill == mxConstants.NONE) {
          c.pointerEvents = false;
        } else {
          c.setFillColor(fill);
        }
        c.begin();
        c.moveTo(start, h);
        c.lineTo(w - r, h);
        c.quadTo(w, h, w, h - Math.min(h / 2, r));
        c.lineTo(w, Math.min(h / 2, r));
        c.quadTo(w, 0, w - r, 0);
        c.lineTo(start, 0);
        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    }
    if (swimlaneLine) {
      this.paintDivider(c, x, y, w, h, start, fill == mxConstants.NONE);
    }
  }

  /**
   * Function: paintDivider
   *
   * Paints the divider between swimlane title and content area.
   */
  paintDivider(c: any, x: number, y: number, w: number, h: number, start: any, shadow: any): void {
    if (!shadow) {
      c.setShadow(false);
    }
    c.begin();
    if (this.isHorizontal()) {
      c.moveTo(0, start);
      c.lineTo(w, start);
    } else {
      c.moveTo(start, 0);
      c.lineTo(start, h);
    }
    c.stroke();
  }

  /**
   * Function: paintSeparator
   *
   * Paints the vertical or horizontal separator line between swimlanes.
   */
  paintSeparator(c: any, x: number, y: number, w: number, h: number, start: any, color: string): void {
    if (color != mxConstants.NONE) {
      c.setStrokeColor(color);
      c.setDashed(true);
      c.begin();
      if (this.isHorizontal()) {
        c.moveTo(w, start);
        c.lineTo(w, h);
      } else {
        c.moveTo(start, 0);
        c.lineTo(w, 0);
      }
      c.stroke();
      c.setDashed(false);
    }
  }

  /**
   * Function: getImageBounds
   *
   * Paints the swimlane vertex shape.
   */
  getImageBounds(x: number, y: number, w: number, h: number): any {
    if (this.isHorizontal()) {
      return new mxRectangle(x + w - this.imageSize, y, this.imageSize, this.imageSize);
    } else {
      return new mxRectangle(x, y, this.imageSize, this.imageSize);
    }
  }
}
