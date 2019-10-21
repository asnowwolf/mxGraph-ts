/**
 * Class: mxLabel
 *
 * Extends <mxShape> to implement an image shape with a label.
 * This shape is registered under <mxConstants.SHAPE_LABEL> in
 * <mxCellRenderer>.
 *
 * Constructor: mxLabel
 *
 * Constructs a new label shape.
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
import { mxRectangleShape } from './mxRectangleShape';
import { mxShape } from './mxShape';

export class mxLabel extends mxRectangleShape {
  constructor(bounds: any, fill: any, stroke: any, strokewidth: any) {
    super(bounds, fill, stroke, strokewidth);
  }

  /**
   * Variable: imageSize
   *
   * Default width and height for the image. Default is
   * <mxConstants.DEFAULT_IMAGESIZE>.
   */
  imageSize: any;
  /**
   * Variable: spacing
   *
   * Default value for image spacing. Default is 2.
   * @example 2
   */
  spacing: number;
  /**
   * Variable: indicatorSize
   *
   * Default width and height for the indicicator. Default is 10.
   * @example 10
   */
  indicatorSize: number;
  /**
   * Variable: indicatorSpacing
   *
   * Default spacing between image and indicator. Default is 2.
   * @example 2
   */
  indicatorSpacing: number;
  indicator: this;

  /**
   * Function: init
   *
   * Initializes the shape and the <indicator>.
   */
  init(container: HTMLElement): void {
    mxShape.prototype.init.apply(this, arguments);
    if (!!this.indicatorShape) {
      this.indicator = new this.indicatorShape();
      this.indicator.dialect = this.dialect;
      this.indicator.init(this.node);
    }
  }

  /**
   * Function: redraw
   *
   * Reconfigures this shape. This will update the colors of the indicator
   * and reconfigure it if required.
   */
  redraw(): void {
    if (!!this.indicator) {
      this.indicator.fill = this.indicatorColor;
      this.indicator.stroke = this.indicatorStrokeColor;
      this.indicator.gradient = this.indicatorGradientColor;
      this.indicator.direction = this.indicatorDirection;
    }
    mxShape.prototype.redraw.apply(this, arguments);
  }

  /**
   * Function: isHtmlAllowed
   *
   * Returns true for non-rounded, non-rotated shapes with no glass gradient and
   * no indicator shape.
   */
  isHtmlAllowed(): boolean {
    return mxRectangleShape.prototype.isHtmlAllowed.apply(this, arguments) && !this.indicatorColor && !this.indicatorShape;
  }

  /**
   * Function: paintForeground
   *
   * Generic background painting implementation.
   */
  paintForeground(c: any, x: number, y: number, w: number, h: number): void {
    this.paintImage(c, x, y, w, h);
    this.paintIndicator(c, x, y, w, h);
    mxRectangleShape.prototype.paintForeground.apply(this, arguments);
  }

  /**
   * Function: paintImage
   *
   * Generic background painting implementation.
   */
  paintImage(c: any, x: number, y: number, w: number, h: number): void {
    if (!!this.image) {
      const bounds = this.getImageBounds(x, y, w, h);
      c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.image, false, false, false);
    }
  }

  /**
   * Function: getImageBounds
   *
   * Generic background painting implementation.
   */
  getImageBounds(x: number, y: number, w: number, h: number): any {
    const align = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_ALIGN, mxConstants.ALIGN_LEFT);
    const valign = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
    const width = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_WIDTH, mxConstants.DEFAULT_IMAGESIZE);
    const height = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_HEIGHT, mxConstants.DEFAULT_IMAGESIZE);
    const spacing = mxUtils.getNumber(this.style, mxConstants.STYLE_SPACING, this.spacing) + 5;
    if (align == mxConstants.ALIGN_CENTER) {
      x += (w - width) / 2;
    } else if (align == mxConstants.ALIGN_RIGHT) {
      x += w - width - spacing;
    } else {
      x += spacing;
    }
    if (valign == mxConstants.ALIGN_TOP) {
      y += spacing;
    } else if (valign == mxConstants.ALIGN_BOTTOM) {
      y += h - height - spacing;
    } else {
      y += (h - height) / 2;
    }
    return new mxRectangle(x, y, width, height);
  }

  /**
   * Function: paintIndicator
   *
   * Generic background painting implementation.
   */
  paintIndicator(c: any, x: number, y: number, w: number, h: number): void {
    if (!!this.indicator) {
      this.indicator.bounds = this.getIndicatorBounds(x, y, w, h);
      this.indicator.paint(c);
    } else if (!!this.indicatorImage) {
      const bounds = this.getIndicatorBounds(x, y, w, h);
      c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.indicatorImage, false, false, false);
    }
  }

  /**
   * Function: getIndicatorBounds
   *
   * Generic background painting implementation.
   */
  getIndicatorBounds(x: number, y: number, w: number, h: number): any {
    const align = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_ALIGN, mxConstants.ALIGN_LEFT);
    const valign = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
    const width = mxUtils.getNumber(this.style, mxConstants.STYLE_INDICATOR_WIDTH, this.indicatorSize);
    const height = mxUtils.getNumber(this.style, mxConstants.STYLE_INDICATOR_HEIGHT, this.indicatorSize);
    const spacing = this.spacing + 5;
    if (align == mxConstants.ALIGN_RIGHT) {
      x += w - width - spacing;
    } else if (align == mxConstants.ALIGN_CENTER) {
      x += (w - width) / 2;
    } else {
      x += spacing;
    }
    if (valign == mxConstants.ALIGN_BOTTOM) {
      y += h - height - spacing;
    } else if (valign == mxConstants.ALIGN_TOP) {
      y += spacing;
    } else {
      y += (h - height) / 2;
    }
    return new mxRectangle(x, y, width, height);
  }

  /**
   * Function: redrawHtmlShape
   *
   * Generic background painting implementation.
   */
  redrawHtmlShape(): void {
    mxRectangleShape.prototype.redrawHtmlShape.apply(this, arguments);
    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.lastChild);
    }
    if (!!this.image) {
      const node = document.createElement('img');
      node.style.position = 'relative';
      node.setAttribute('border', '0');
      const bounds = this.getImageBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
      bounds.x -= this.bounds.x;
      bounds.y -= this.bounds.y;
      node.style.left = Math.round(bounds.x) + 'px';
      node.style.top = Math.round(bounds.y) + 'px';
      node.style.width = Math.round(bounds.width) + 'px';
      node.style.height = Math.round(bounds.height) + 'px';
      node.src = this.image;
      this.node.appendChild(node);
    }
  }
}
