/**
 * Class: mxImageShape
 *
 * Extends <mxShape> to implement an image shape. This shape is registered
 * under <mxConstants.SHAPE_IMAGE> in <mxCellRenderer>.
 *
 * Constructor: mxImageShape
 *
 * Constructs a new image shape.
 *
 * Parameters:
 *
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * image - String that specifies the URL of the image. This is stored in
 * <image>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 0. This is stored in <strokewidth>.
 */
import { mxClient } from '../mxClient';
import { mxConstants } from '../util/mxConstants';
import { mxUtils } from '../util/mxUtils';
import { mxRectangleShape } from './mxRectangleShape';
import { mxShape } from './mxShape';

export class mxImageShape extends mxShape {
  constructor(bounds: any, image: any, fill: any, stroke: any, strokewidth: any) {
    super();
    this.bounds = bounds;
    this.image = image;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (!!strokewidth) ? strokewidth : 1;
    this.shadow = false;
  }

  bounds: any;
  image: any;
  fill: any;
  stroke: any;
  strokewidth: any;
  shadow: boolean;
  /**
   * Variable: preserveImageAspect
   *
   * Switch to preserve image aspect. Default is true.
   * @example true
   */
  preserveImageAspect: boolean = true;
  gradient: any;
  flipH: any;
  flipV: any;

  /**
   * Function: getSvgScreenOffset
   *
   * Disables offset in IE9 for crisper image output.
   */
  getSvgScreenOffset(): any {
    return 0;
  }

  /**
   * Function: apply
   *
   * Overrides <mxShape.apply> to replace the fill and stroke colors with the
   * respective values from <mxConstants.STYLE_IMAGE_BACKGROUND> and
   * <mxConstants.STYLE_IMAGE_BORDER>.
   *
   * Applies the style of the given <mxCellState> to the shape. This
   * implementation assigns the following styles to local fields:
   *
   * - <mxConstants.STYLE_IMAGE_BACKGROUND> => fill
   * - <mxConstants.STYLE_IMAGE_BORDER> => stroke
   *
   * Parameters:
   *
   * state - <mxCellState> of the corresponding cell.
   */
  apply(state: any): void {
    mxShape.prototype.apply.apply(this, arguments);
    this.fill = undefined;
    this.stroke = undefined;
    this.gradient = undefined;
    if (!!this.style) {
      this.preserveImageAspect = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_ASPECT, 1) == 1;
      this.flipH = this.flipH || mxUtils.getValue(this.style, 'imageFlipH', 0) == 1;
      this.flipV = this.flipV || mxUtils.getValue(this.style, 'imageFlipV', 0) == 1;
    }
  }

  /**
   * Function: isHtmlAllowed
   *
   * Returns true if HTML is allowed for this shape. This implementation always
   * returns false.
   */
  isHtmlAllowed(): boolean {
    return !this.preserveImageAspect;
  }

  /**
   * Function: createHtml
   *
   * Creates and returns the HTML DOM node(s) to represent
   * this shape. This implementation falls back to <createVml>
   * so that the HTML creation is optional.
   */
  createHtml(): any {
    const node = document.createElement('div');
    node.style.position = 'absolute';
    return node;
  }

  /**
   * Function: isRoundable
   *
   * Disables inherited roundable support.
   */
  isRoundable(c: any, x: number, y: number, w: number, h: number): boolean {
    return false;
  }

  /**
   * Function: paintVertexShape
   *
   * Generic background painting implementation.
   */
  paintVertexShape(c: any, x: number, y: number, w: number, h: number): void {
    if (!!this.image) {
      const fill = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BACKGROUND, null);
      let stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER, null);
      if (!!fill) {
        c.setFillColor(fill);
        c.setStrokeColor(stroke);
        c.rect(x, y, w, h);
        c.fillAndStroke();
      }
      c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
      const stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER, null);
      if (!!stroke) {
        c.setShadow(false);
        c.setStrokeColor(stroke);
        c.rect(x, y, w, h);
        c.stroke();
      }
    } else {
      mxRectangleShape.prototype.paintBackground.apply(this, arguments);
    }
  }

  /**
   * Function: redraw
   *
   * Overrides <mxShape.redraw> to preserve the aspect ratio of images.
   */
  redrawHtmlShape(): void {
    this.node.style.left = Math.round(this.bounds.x) + 'px';
    this.node.style.top = Math.round(this.bounds.y) + 'px';
    this.node.style.width = Math.max(0, Math.round(this.bounds.width)) + 'px';
    this.node.style.height = Math.max(0, Math.round(this.bounds.height)) + 'px';
    this.node.innerHTML = '';
    if (!!this.image) {
      const fill = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BACKGROUND, '');
      const stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER, '');
      this.node.style.backgroundColor = fill;
      this.node.style.borderColor = stroke;
      const useVml = mxClient.IS_IE6 || ((!document.documentMode || document.documentMode <= 8) && this.rotation != 0);
      const img = document.createElement((useVml) ? mxClient.VML_PREFIX + ':image' : 'img');
      img.setAttribute('border', '0');
      img.style.position = 'absolute';
      img.src = this.image;
      let filter = (this.opacity < 100) ? 'alpha(opacity=' + this.opacity + ')' : '';
      this.node.style.filter = filter;
      if (this.flipH && this.flipV) {
        filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)';
      } else if (this.flipH) {
        filter += 'progid:DXImageTransform.Microsoft.BasicImage(mirror=1)';
      } else if (this.flipV) {
        filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)';
      }
      if (img.style.filter != filter) {
        img.style.filter = filter;
      }
      if (img.nodeName == 'image') {
        img.style.rotation = this.rotation;
      } else if (this.rotation != 0) {
        mxUtils.setPrefixedStyle(img.style, 'transform', 'rotate(' + this.rotation + 'deg)');
      } else {
        mxUtils.setPrefixedStyle(img.style, 'transform', '');
      }
      img.style.width = this.node.style.width;
      img.style.height = this.node.style.height;
      this.node.style.backgroundImage = '';
      this.node.appendChild(img);
    } else {
      this.setTransparentBackgroundImage(this.node);
    }
  }
}
