/**
 * Class: mxText
 *
 * Extends <mxShape> to implement a text shape. To change vertical text from
 * bottom to top to top to bottom, the following code can be used:
 *
 * (code)
 * mxText.prototype.verticalTextRotation = 90;
 * (end)
 *
 * Constructor: mxText
 *
 * Constructs a new text shape.
 *
 * Parameters:
 *
 * value - String that represents the text to be displayed. This is stored in
 * <value>.
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * align - Specifies the horizontal alignment. Default is ''. This is stored in
 * <align>.
 * valign - Specifies the vertical alignment. Default is ''. This is stored in
 * <valign>.
 * color - String that specifies the text color. Default is 'black'. This is
 * stored in <color>.
 * family - String that specifies the font family. Default is
 * <mxConstants.DEFAULT_FONTFAMILY>. This is stored in <family>.
 * size - Integer that specifies the font size. Default is
 * <mxConstants.DEFAULT_FONTSIZE>. This is stored in <size>.
 * fontStyle - Specifies the font style. Default is 0. This is stored in
 * <fontStyle>.
 * spacing - Integer that specifies the global spacing. Default is 2. This is
 * stored in <spacing>.
 * spacingTop - Integer that specifies the top spacing. Default is 0. The
 * sum of the spacing and this is stored in <spacingTop>.
 * spacingRight - Integer that specifies the right spacing. Default is 0. The
 * sum of the spacing and this is stored in <spacingRight>.
 * spacingBottom - Integer that specifies the bottom spacing. Default is 0.The
 * sum of the spacing and this is stored in <spacingBottom>.
 * spacingLeft - Integer that specifies the left spacing. Default is 0. The
 * sum of the spacing and this is stored in <spacingLeft>.
 * horizontal - Boolean that specifies if the label is horizontal. Default is
 * true. This is stored in <horizontal>.
 * background - String that specifies the background color. Default is null.
 * This is stored in <background>.
 * border - String that specifies the label border color. Default is null.
 * This is stored in <border>.
 * wrap - Specifies if word-wrapping should be enabled. Default is false.
 * This is stored in <wrap>.
 * clipped - Specifies if the label should be clipped. Default is false.
 * This is stored in <clipped>.
 * overflow - Value of the overflow style. Default is 'visible'.
 */
import { mxClient } from '../mxClient';
import { mxConstants } from '../util/mxConstants';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxVmlCanvas2D } from '../util/mxVmlCanvas2D';
import { mxShape } from './mxShape';

export class mxText extends mxShape {
  constructor(value: any, bounds: any, align: any, valign: any, color: string, family: any, size: any, fontStyle: any, spacing: any, spacingTop: any, spacingRight: any, spacingBottom: any, spacingLeft: any, horizontal: any, background: any, border: any, wrap: any, clipped: any, overflow: any, labelPadding: any, textDirection: any) {
    super();
    this.value = value;
    this.bounds = bounds;
    this.color = (!!color) ? color : 'black';
    this.align = (!!align) ? align : mxConstants.ALIGN_CENTER;
    this.valign = (!!valign) ? valign : mxConstants.ALIGN_MIDDLE;
    this.family = (!!family) ? family : mxConstants.DEFAULT_FONTFAMILY;
    this.size = (!!size) ? size : mxConstants.DEFAULT_FONTSIZE;
    this.fontStyle = (!!fontStyle) ? fontStyle : mxConstants.DEFAULT_FONTSTYLE;
    this.spacing = parseInt(spacing || 2);
    this.spacingTop = this.spacing + parseInt(spacingTop || 0);
    this.spacingRight = this.spacing + parseInt(spacingRight || 0);
    this.spacingBottom = this.spacing + parseInt(spacingBottom || 0);
    this.spacingLeft = this.spacing + parseInt(spacingLeft || 0);
    this.horizontal = (!!horizontal) ? horizontal : true;
    this.background = background;
    this.border = border;
    this.wrap = (!!wrap) ? wrap : false;
    this.clipped = (!!clipped) ? clipped : false;
    this.overflow = (!!overflow) ? overflow : 'visible';
    this.labelPadding = (!!labelPadding) ? labelPadding : 0;
    this.textDirection = textDirection;
    this.rotation = 0;
    this.updateMargin();
  }

  value: any;
  bounds: any;
  color: string;
  align: any;
  valign: any;
  family: any;
  size: any;
  fontStyle: any;
  spacing: any;
  spacingTop: any;
  spacingRight: any;
  spacingBottom: any;
  spacingLeft: any;
  horizontal: any;
  background: any;
  border: any;
  wrap: any;
  clipped: any;
  overflow: any;
  labelPadding: any;
  textDirection: any;
  rotation: number;
  /**
   * Variable: baseSpacingTop
   *
   * Specifies the spacing to be added to the top spacing. Default is 0. Use the
   * value 5 here to get the same label positions as in mxGraph 1.x.
   */
  baseSpacingTop: number = '';
  /**
   * Variable: baseSpacingBottom
   *
   * Specifies the spacing to be added to the bottom spacing. Default is 0. Use the
   * value 1 here to get the same label positions as in mxGraph 1.x.
   */
  baseSpacingBottom: number = 0;
  /**
   * Variable: baseSpacingLeft
   *
   * Specifies the spacing to be added to the left spacing. Default is 0.
   */
  baseSpacingLeft: number = 0;
  /**
   * Variable: baseSpacingRight
   *
   * Specifies the spacing to be added to the right spacing. Default is 0.
   */
  baseSpacingRight: number = 0;
  /**
   * Variable: replaceLinefeeds
   *
   * Specifies if linefeeds in HTML labels should be replaced with BR tags.
   * Default is true.
   * @example true
   */
  replaceLinefeeds: boolean = true;
  /**
   * Variable: verticalTextRotation
   *
   * Rotation for vertical text. Default is -90 (bottom to top).
   */
  verticalTextRotation: number = true;
  /**
   * Variable: ignoreClippedStringSize
   *
   * Specifies if the string size should be measured in <updateBoundingBox> if
   * the label is clipped and the label position is center and middle. If this is
   * true, then the bounding box will be set to <bounds>. Default is true.
   * <ignoreStringSize> has precedence over this switch.
   * @example true
   */
  ignoreClippedStringSize: boolean = true;
  /**
   * Variable: ignoreStringSize
   *
   * Specifies if the actual string size should be measured. If disabled the
   * boundingBox will not ignore the actual size of the string, otherwise
   * <bounds> will be used instead. Default is false.
   */
  ignoreStringSize: boolean = true;
  /**
   * Variable: textWidthPadding
   *
   * Specifies the padding to be added to the text width for the bounding box.
   * This is needed to make sure no clipping is applied to borders. Default is 4
   * for IE 8 standards mode and 3 for all others.
   */
  textWidthPadding: any;
  /**
   * Variable: lastValue
   *
   * Contains the last rendered text value. Used for caching.
   */
  lastValue: any;
  /**
   * Variable: cacheEnabled
   *
   * Specifies if caching for HTML labels should be enabled. Default is true.
   * @example true
   */
  cacheEnabled: boolean = true;
  lastUnscaledWidth: any;
  opacity: any;
  flipV: any;
  flipH: any;
  boundingBox: any;
  offsetWidth: any;
  offsetHeight: any;
  unrotatedBoundingBox: any;
  margin: any;

  /**
   * Function: isParseVml
   *
   * Text shapes do not contain VML markup and do not need to be parsed. This
   * method returns false to speed up rendering in IE8.
   */
  isParseVml(): boolean {
    return false;
  }

  /**
   * Function: isHtmlAllowed
   *
   * Returns true if HTML is allowed for this shape. This implementation returns
   * true if the browser is not in IE8 standards mode.
   */
  isHtmlAllowed(): boolean {
    return document.documentMode != 8 || mxClient.IS_EM;
  }

  /**
   * Function: getSvgScreenOffset
   *
   * Disables offset in IE9 for crisper image output.
   */
  getSvgScreenOffset(): any {
    return 0;
  }

  /**
   * Function: checkBounds
   *
   * Returns true if the bounds are not null and all of its variables are numeric.
   */
  checkBounds(): any {
    return (!isNaN(this.scale) && isFinite(this.scale) && this.scale > 0 && !!this.bounds && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) && !isNaN(this.bounds.width) && !isNaN(this.bounds.height));
  }

  /**
   * Function: paint
   *
   * Generic rendering code.
   */
  paint(c: any, update: any): void {
    const s = this.scale;
    const x = this.bounds.x / s;
    const y = this.bounds.y / s;
    const w = this.bounds.width / s;
    const h = this.bounds.height / s;
    this.updateTransform(c, x, y, w, h);
    this.configureCanvas(c, x, y, w, h);
    const unscaledWidth = (!!this.state) ? this.state.unscaledWidth : null;
    if (update) {
      if (!!this.node.firstChild && (!unscaledWidth || this.lastUnscaledWidth != unscaledWidth)) {
        c.invalidateCachedOffsetSize(this.node);
      }
      c.updateText(x, y, w, h, this.align, this.valign, this.wrap, this.overflow, this.clipped, this.getTextRotation(), this.node);
    } else {
      const realHtml = mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML;
      const fmt = (realHtml || c instanceof mxVmlCanvas2D) ? 'html' : '';
      let val = this.value;
      if (!realHtml && fmt == 'html') {
        val = mxUtils.htmlEntities(val, false);
      }
      if (fmt == 'html' && !mxUtils.isNode(this.value)) {
        val = mxUtils.replaceTrailingNewlines(val, '<div><br></div>');
      }
      val = (!mxUtils.isNode(this.value) && this.replaceLinefeeds && fmt == 'html') ? val.replace(/\n/g, '<br/>') : val;
      let dir = this.textDirection;
      if (dir == mxConstants.TEXT_DIRECTION_AUTO && !realHtml) {
        dir = this.getAutoDirection();
      }
      if (dir != mxConstants.TEXT_DIRECTION_LTR && dir != mxConstants.TEXT_DIRECTION_RTL) {
        dir = undefined;
      }
      c.text(x, y, w, h, val, this.align, this.valign, this.wrap, fmt, this.overflow, this.clipped, this.getTextRotation(), dir);
    }
    this.lastUnscaledWidth = unscaledWidth;
  }

  /**
   * Function: redraw
   *
   * Renders the text using the given DOM nodes.
   */
  redraw(): void {
    if (this.visible && this.checkBounds() && this.cacheEnabled && this.lastValue == this.value && (mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML)) {
      if (this.node.nodeName == 'DIV' && (this.isHtmlAllowed() || !mxClient.IS_VML)) {
        this.updateSize(this.node, (!this.state || !this.state.view.textDiv));
        if (mxClient.IS_IE && (!document.documentMode || document.documentMode <= 8)) {
          this.updateHtmlFilter();
        } else {
          this.updateHtmlTransform();
        }
        this.updateBoundingBox();
      } else {
        const canvas = this.createCanvas();
        if (!!canvas && !!canvas.updateText && !!canvas.invalidateCachedOffsetSize) {
          this.paint(canvas, true);
          this.destroyCanvas(canvas);
          this.updateBoundingBox();
        } else {
          mxShape.prototype.redraw.apply(this, arguments);
        }
      }
    } else {
      mxShape.prototype.redraw.apply(this, arguments);
      if (mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML) {
        this.lastValue = this.value;
      } else {
        this.lastValue = undefined;
      }
    }
  }

  /**
   * Function: resetStyles
   *
   * Resets all styles.
   */
  resetStyles(): void {
    mxShape.prototype.resetStyles.apply(this, arguments);
    this.color = 'black';
    this.align = mxConstants.ALIGN_CENTER;
    this.valign = mxConstants.ALIGN_MIDDLE;
    this.family = mxConstants.DEFAULT_FONTFAMILY;
    this.size = mxConstants.DEFAULT_FONTSIZE;
    this.fontStyle = mxConstants.DEFAULT_FONTSTYLE;
    this.spacing = 2;
    this.spacingTop = 2;
    this.spacingRight = 2;
    this.spacingBottom = 2;
    this.spacingLeft = 2;
    this.horizontal = true;
    delete this.background;
    delete this.border;
    this.textDirection = mxConstants.DEFAULT_TEXT_DIRECTION;
    delete this.margin;
  }

  /**
   * Function: apply
   *
   * Extends mxShape to update the text styles.
   *
   * Parameters:
   *
   * state - <mxCellState> of the corresponding cell.
   */
  apply(state: any): void {
    const old = this.spacing;
    mxShape.prototype.apply.apply(this, arguments);
    if (!!this.style) {
      this.fontStyle = mxUtils.getValue(this.style, mxConstants.STYLE_FONTSTYLE, this.fontStyle);
      this.family = mxUtils.getValue(this.style, mxConstants.STYLE_FONTFAMILY, this.family);
      this.size = mxUtils.getValue(this.style, mxConstants.STYLE_FONTSIZE, this.size);
      this.color = mxUtils.getValue(this.style, mxConstants.STYLE_FONTCOLOR, this.color);
      this.align = mxUtils.getValue(this.style, mxConstants.STYLE_ALIGN, this.align);
      this.valign = mxUtils.getValue(this.style, mxConstants.STYLE_VERTICAL_ALIGN, this.valign);
      this.spacing = parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING, this.spacing));
      this.spacingTop = parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_TOP, this.spacingTop - old)) + this.spacing;
      this.spacingRight = parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_RIGHT, this.spacingRight - old)) + this.spacing;
      this.spacingBottom = parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_BOTTOM, this.spacingBottom - old)) + this.spacing;
      this.spacingLeft = parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_LEFT, this.spacingLeft - old)) + this.spacing;
      this.horizontal = mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, this.horizontal);
      this.background = mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, this.background);
      this.border = mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_BORDERCOLOR, this.border);
      this.textDirection = mxUtils.getValue(this.style, mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION);
      this.opacity = mxUtils.getValue(this.style, mxConstants.STYLE_TEXT_OPACITY, 100);
      this.updateMargin();
    }
    this.flipV = undefined;
    this.flipH = undefined;
  }

  /**
   * Function: getAutoDirection
   *
   * Used to determine the automatic text direction. Returns
   * <mxConstants.TEXT_DIRECTION_LTR> or <mxConstants.TEXT_DIRECTION_RTL>
   * depending on the contents of <value>. This is not invoked for HTML, wrapped
   * content or if <value> is a DOM node.
   */
  getAutoDirection(): any {
    const tmp = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(this.value);
    return (!!tmp && tmp.length > 0 && tmp[0] > 'z') ? mxConstants.TEXT_DIRECTION_RTL : mxConstants.TEXT_DIRECTION_LTR;
  }

  /**
   * Function: updateBoundingBox
   *
   * Updates the <boundingBox> for this shape using the given node and position.
   */
  updateBoundingBox(): void {
    let node = this.node;
    this.boundingBox = this.bounds.clone();
    const rot = this.getTextRotation();
    const h = (!!this.style) ? mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER) : null;
    const v = (!!this.style) ? mxUtils.getValue(this.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE) : null;
    if (!this.ignoreStringSize && !!node && this.overflow != 'fill' && (!this.clipped || !this.ignoreClippedStringSize || h != mxConstants.ALIGN_CENTER || v != mxConstants.ALIGN_MIDDLE)) {
      let ow = undefined;
      let oh = undefined;
      if (!!node.ownerSVGElement) {
        if (!!node.firstChild && !!node.firstChild.firstChild && node.firstChild.firstChild.nodeName == 'foreignObject') {
          node = node.firstChild.firstChild;
          ow = parseInt(node.getAttribute('width')) * this.scale;
          oh = parseInt(node.getAttribute('height')) * this.scale;
        } else {
          try {
            const b = node.getBBox();
            if (typeof (this.value) == 'string' && mxUtils.trim(this.value) == 0) {
              this.boundingBox = undefined;
            } else if (b.width == 0 && b.height == 0) {
              this.boundingBox = undefined;
            } else {
              this.boundingBox = new mxRectangle(b.x, b.y, b.width, b.height);
            }
            return;
          } catch (e) {
          }
        }
      } else {
        const td = (!!this.state) ? this.state.view.textDiv : null;
        if (!!this.offsetWidth && !!this.offsetHeight) {
          ow = this.offsetWidth * this.scale;
          oh = this.offsetHeight * this.scale;
        } else {
          if (!!td) {
            this.updateFont(td);
            this.updateSize(td, false);
            this.updateInnerHtml(td);
            node = td;
          }
          let sizeDiv = node;
          if (document.documentMode == 8 && !mxClient.IS_EM) {
            const w = Math.round(this.bounds.width / this.scale);
            if (this.wrap && w > 0) {
              node.style.wordWrap = mxConstants.WORD_WRAP;
              node.style.whiteSpace = 'normal';
              if (node.style.wordWrap != 'break-word') {
                let divs = sizeDiv.getElementsByTagName('div');
                if (divs.length > 0) {
                  sizeDiv = divs[divs.length - 1];
                }
                ow = sizeDiv.offsetWidth + 2;
                divs = this.node.getElementsByTagName('div');
                if (this.clipped) {
                  ow = Math.min(w, ow);
                }
                if (divs.length > 1) {
                  divs[divs.length - 2].style.width = ow + 'px';
                }
              }
            } else {
              node.style.whiteSpace = 'nowrap';
            }
          } else if (!!sizeDiv.firstChild && sizeDiv.firstChild.nodeName == 'DIV') {
            sizeDiv = sizeDiv.firstChild;
          }
          this.offsetWidth = sizeDiv.offsetWidth + this.textWidthPadding;
          this.offsetHeight = sizeDiv.offsetHeight;
          ow = this.offsetWidth * this.scale;
          oh = this.offsetHeight * this.scale;
        }
      }
      if (!!ow && !!oh) {
        this.boundingBox = new mxRectangle(this.bounds.x, this.bounds.y, ow, oh);
      }
    }
    if (!!this.boundingBox) {
      if (rot != 0) {
        const bbox = mxUtils.getBoundingBox(new mxRectangle(this.margin.x * this.boundingBox.width, this.margin.y * this.boundingBox.height, this.boundingBox.width, this.boundingBox.height), rot, new mxPoint(0, 0));
        this.unrotatedBoundingBox = mxRectangle.fromRectangle(this.boundingBox);
        this.unrotatedBoundingBox.x += this.margin.x * this.unrotatedBoundingBox.width;
        this.unrotatedBoundingBox.y += this.margin.y * this.unrotatedBoundingBox.height;
        this.boundingBox.x += bbox.x;
        this.boundingBox.y += bbox.y;
        this.boundingBox.width = bbox.width;
        this.boundingBox.height = bbox.height;
      } else {
        this.boundingBox.x += this.margin.x * this.boundingBox.width;
        this.boundingBox.y += this.margin.y * this.boundingBox.height;
        this.unrotatedBoundingBox = undefined;
      }
    }
  }

  /**
   * Function: getShapeRotation
   *
   * Returns 0 to avoid using rotation in the canvas via updateTransform.
   */
  getShapeRotation(): any {
    return 0;
  }

  /**
   * Function: getTextRotation
   *
   * Returns the rotation for the text label of the corresponding shape.
   */
  getTextRotation(): any {
    return (!!this.state && !!this.state.shape) ? this.state.shape.getTextRotation() : 0;
  }

  /**
   * Function: isPaintBoundsInverted
   *
   * Inverts the bounds if <mxShape.isBoundsInverted> returns true or if the
   * horizontal style is false.
   */
  isPaintBoundsInverted(): boolean {
    return !this.horizontal && !!this.state && this.state.view.graph.model.isVertex(this.state.cell);
  }

  /**
   * Function: configureCanvas
   *
   * Sets the state of the canvas for drawing the shape.
   */
  configureCanvas(c: any, x: number, y: number, w: number, h: number): void {
    mxShape.prototype.configureCanvas.apply(this, arguments);
    c.setFontColor(this.color);
    c.setFontBackgroundColor(this.background);
    c.setFontBorderColor(this.border);
    c.setFontFamily(this.family);
    c.setFontSize(this.size);
    c.setFontStyle(this.fontStyle);
  }

  /**
   * Function: updateVmlContainer
   *
   * Sets the width and height of the container to 1px.
   */
  updateVmlContainer(): void {
    this.node.style.left = Math.round(this.bounds.x) + 'px';
    this.node.style.top = Math.round(this.bounds.y) + 'px';
    this.node.style.width = '1px';
    this.node.style.height = '1px';
    this.node.style.overflow = 'visible';
  }

  /**
   * Function: redrawHtmlShape
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  redrawHtmlShape(): void {
    const style = this.node.style;
    style.whiteSpace = 'normal';
    style.overflow = '';
    style.width = '';
    style.height = '';
    this.updateValue();
    this.updateFont(this.node);
    this.updateSize(this.node, (!this.state || !this.state.view.textDiv));
    this.offsetWidth = undefined;
    this.offsetHeight = undefined;
    if (mxClient.IS_IE && (!document.documentMode || document.documentMode <= 8)) {
      this.updateHtmlFilter();
    } else {
      this.updateHtmlTransform();
    }
  }

  /**
   * Function: updateHtmlTransform
   *
   * Returns the spacing as an <mxPoint>.
   */
  updateHtmlTransform(): void {
    const theta = this.getTextRotation();
    const style = this.node.style;
    const dx = this.margin.x;
    const dy = this.margin.y;
    if (theta != 0) {
      mxUtils.setPrefixedStyle(style, 'transformOrigin', (-dx * 100) + '%' + ' ' + (-dy * 100) + '%');
      mxUtils.setPrefixedStyle(style, 'transform', 'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)' + 'scale(' + this.scale + ') rotate(' + theta + 'deg)');
    } else {
      mxUtils.setPrefixedStyle(style, 'transformOrigin', '0% 0%');
      mxUtils.setPrefixedStyle(style, 'transform', 'scale(' + this.scale + ')' + 'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)');
    }
    style.left = Math.round(this.bounds.x - Math.ceil(dx * ((this.overflow != 'fill' && this.overflow != 'width') ? 3 : 1))) + 'px';
    style.top = Math.round(this.bounds.y - dy * ((this.overflow != 'fill') ? 3 : 1)) + 'px';
    if (this.opacity < 100) {
      style.opacity = this.opacity / 100;
    } else {
      style.opacity = '';
    }
  }

  /**
   * Function: setInnerHtml
   *
   * Sets the inner HTML of the given element to the <value>.
   */
  updateInnerHtml(elt: HTMLElement): void {
    if (mxUtils.isNode(this.value)) {
      elt.innerHTML = this.value.outerHTML;
    } else {
      let val = this.value;
      if (this.dialect != mxConstants.DIALECT_STRICTHTML) {
        val = mxUtils.htmlEntities(val, false);
      }
      val = mxUtils.replaceTrailingNewlines(val, '<div>&nbsp;</div>');
      val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
      val = '<div style="display:inline-block;_display:inline;">' + val + '</div>';
      elt.innerHTML = val;
    }
  }

  /**
   * Function: updateHtmlFilter
   *
   * Rotated text rendering quality is bad for IE9 quirks/IE8 standards
   */
  updateHtmlFilter(): void {
    const style = this.node.style;
    const dx = this.margin.x;
    let dy = this.margin.y;
    const s = this.scale;
    mxUtils.setOpacity(this.node, this.opacity);
    let ow = 0;
    let oh = 0;
    const td = (!!this.state) ? this.state.view.textDiv : null;
    let sizeDiv = this.node;
    if (!!td) {
      td.style.overflow = '';
      td.style.height = '';
      td.style.width = '';
      this.updateFont(td);
      this.updateSize(td, false);
      this.updateInnerHtml(td);
      const w = Math.round(this.bounds.width / this.scale);
      if (this.wrap && w > 0) {
        td.style.whiteSpace = 'normal';
        td.style.wordWrap = mxConstants.WORD_WRAP;
        ow = w;
        if (this.clipped) {
          ow = Math.min(ow, this.bounds.width);
        }
        td.style.width = ow + 'px';
      } else {
        td.style.whiteSpace = 'nowrap';
      }
      sizeDiv = td;
      if (!!sizeDiv.firstChild && sizeDiv.firstChild.nodeName == 'DIV') {
        sizeDiv = sizeDiv.firstChild;
        if (this.wrap && td.style.wordWrap == 'break-word') {
          sizeDiv.style.width = '100%';
        }
      }
      if (!this.clipped && this.wrap && w > 0) {
        ow = sizeDiv.offsetWidth + this.textWidthPadding;
        td.style.width = ow + 'px';
      }
      oh = sizeDiv.offsetHeight + 2;
      if (mxClient.IS_QUIRKS && !!this.border && this.border != mxConstants.NONE) {
        oh += 3;
      }
    } else if (!!sizeDiv.firstChild && sizeDiv.firstChild.nodeName == 'DIV') {
      sizeDiv = sizeDiv.firstChild;
      oh = sizeDiv.offsetHeight;
    }
    ow = sizeDiv.offsetWidth + this.textWidthPadding;
    if (this.clipped) {
      oh = Math.min(oh, this.bounds.height);
    }
    let w = this.bounds.width / s;
    let h = this.bounds.height / s;
    if (this.overflow == 'fill') {
      oh = h;
      ow = w;
    } else if (this.overflow == 'width') {
      oh = sizeDiv.scrollHeight;
      ow = w;
    }
    this.offsetWidth = ow;
    this.offsetHeight = oh;
    if (mxClient.IS_QUIRKS && (this.clipped || (this.overflow == 'width' && h > 0))) {
      h = Math.min(h, oh);
      style.height = Math.round(h) + 'px';
    } else {
      h = oh;
    }
    if (this.overflow != 'fill' && this.overflow != 'width') {
      if (this.clipped) {
        ow = Math.min(w, ow);
      }
      w = ow;
      if ((mxClient.IS_QUIRKS && this.clipped) || this.wrap) {
        style.width = Math.round(w) + 'px';
      }
    }
    h *= s;
    w *= s;
    let rad = this.getTextRotation() * (Math.PI / 180);
    const real_cos = parseFloat(parseFloat(Math.cos(rad)).toFixed(8));
    const real_sin = parseFloat(parseFloat(Math.sin(-rad)).toFixed(8));
    rad %= 2 * Math.PI;
    if (rad < 0) {
      rad += 2 * Math.PI;
    }
    rad %= Math.PI;
    if (rad > Math.PI / 2) {
      rad = Math.PI - rad;
    }
    const cos = Math.cos(rad);
    const sin = Math.sin(-rad);
    const tx = w * -(dx + 0.5);
    const ty = h * -(dy + 0.5);
    const top_fix = (h - h * cos + w * sin) / 2 + real_sin * tx - real_cos * ty;
    const left_fix = (w - w * cos + h * sin) / 2 - real_cos * tx - real_sin * ty;
    if (rad != 0) {
      const f = 'progid:DXImageTransform.Microsoft.Matrix(M11=' + real_cos + ', M12=' + real_sin + ', M21=' + (-real_sin) + ', M22=' + real_cos + ', sizingMethod=\'auto expand\')';
      if (!!style.filter && style.filter.length > 0) {
        style.filter += ' ' + f;
      } else {
        style.filter = f;
      }
    }
    let dy = 0;
    if (this.overflow != 'fill' && mxClient.IS_QUIRKS) {
      if (this.valign == mxConstants.ALIGN_TOP) {
        dy -= 1;
      } else if (this.valign == mxConstants.ALIGN_BOTTOM) {
        dy += 2;
      } else {
        dy += 1;
      }
    }
    style.zoom = s;
    style.left = Math.round(this.bounds.x + left_fix - w / 2) + 'px';
    style.top = Math.round(this.bounds.y + top_fix - h / 2 + dy) + 'px';
  }

  /**
   * Function: updateValue
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  updateValue(): void {
    if (mxUtils.isNode(this.value)) {
      this.node.innerHTML = '';
      this.node.appendChild(this.value);
    } else {
      let val = this.value;
      if (this.dialect != mxConstants.DIALECT_STRICTHTML) {
        val = mxUtils.htmlEntities(val, false);
      }
      val = mxUtils.replaceTrailingNewlines(val, '<div><br></div>');
      val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
      const bg = (!!this.background && this.background != mxConstants.NONE) ? this.background : null;
      const bd = (!!this.border && this.border != mxConstants.NONE) ? this.border : null;
      if (this.overflow == 'fill' || this.overflow == 'width') {
        if (!!bg) {
          this.node.style.backgroundColor = bg;
        }
        if (!!bd) {
          this.node.style.border = '1px solid ' + bd;
        }
      } else {
        let css = '';
        if (!!bg) {
          css += 'background-color:' + mxUtils.htmlEntities(bg) + ';';
        }
        if (!!bd) {
          css += 'border:1px solid ' + mxUtils.htmlEntities(bd) + ';';
        }
        const lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (this.size * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
        val = '<div style="zoom:1;' + css + 'display:inline-block;_display:inline;text-decoration:inherit;' + 'padding-bottom:1px;padding-right:1px;line-height:' + lh + '">' + val + '</div>';
      }
      this.node.innerHTML = val;
      const divs = this.node.getElementsByTagName('div');
      if (divs.length > 0) {
        let dir = this.textDirection;
        if (dir == mxConstants.TEXT_DIRECTION_AUTO && this.dialect != mxConstants.DIALECT_STRICTHTML) {
          dir = this.getAutoDirection();
        }
        if (dir == mxConstants.TEXT_DIRECTION_LTR || dir == mxConstants.TEXT_DIRECTION_RTL) {
          divs[divs.length - 1].setAttribute('dir', dir);
        } else {
          divs[divs.length - 1].removeAttribute('dir');
        }
      }
    }
  }

  /**
   * Function: updateFont
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  updateFont(node: Node): void {
    const style = node.style;
    style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (this.size * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
    style.fontSize = this.size + 'px';
    style.fontFamily = this.family;
    style.verticalAlign = 'top';
    style.color = this.color;
    if ((this.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      style.fontWeight = 'bold';
    } else {
      style.fontWeight = '';
    }
    if ((this.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      style.fontStyle = 'italic';
    } else {
      style.fontStyle = '';
    }
    if ((this.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      style.textDecoration = 'underline';
    } else {
      style.textDecoration = '';
    }
    if (this.align == mxConstants.ALIGN_CENTER) {
      style.textAlign = 'center';
    } else if (this.align == mxConstants.ALIGN_RIGHT) {
      style.textAlign = 'right';
    } else {
      style.textAlign = 'left';
    }
  }

  /**
   * Function: updateSize
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  updateSize(node: Node, enableWrap: any): void {
    const w = Math.max(0, Math.round(this.bounds.width / this.scale));
    const h = Math.max(0, Math.round(this.bounds.height / this.scale));
    const style = node.style;
    if (this.clipped) {
      style.overflow = 'hidden';
      if (!mxClient.IS_QUIRKS) {
        style.maxHeight = h + 'px';
        style.maxWidth = w + 'px';
      } else {
        style.width = w + 'px';
      }
    } else if (this.overflow == 'fill') {
      style.width = (w + 1) + 'px';
      style.height = (h + 1) + 'px';
      style.overflow = 'hidden';
    } else if (this.overflow == 'width') {
      style.width = (w + 1) + 'px';
      style.maxHeight = (h + 1) + 'px';
      style.overflow = 'hidden';
    }
    if (this.wrap && w > 0) {
      style.wordWrap = mxConstants.WORD_WRAP;
      style.whiteSpace = 'normal';
      style.width = w + 'px';
      if (enableWrap && this.overflow != 'fill' && this.overflow != 'width') {
        let sizeDiv = node;
        if (!!sizeDiv.firstChild && sizeDiv.firstChild.nodeName == 'DIV') {
          sizeDiv = sizeDiv.firstChild;
          if (node.style.wordWrap == 'break-word') {
            sizeDiv.style.width = '100%';
          }
        }
        let tmp = sizeDiv.offsetWidth;
        if (tmp == 0) {
          const prev = node.parentNode;
          node.style.visibility = 'hidden';
          document.body.appendChild(node);
          tmp = sizeDiv.offsetWidth;
          node.style.visibility = '';
          prev.appendChild(node);
        }
        tmp += 3;
        if (this.clipped) {
          tmp = Math.min(tmp, w);
        }
        style.width = tmp + 'px';
      }
    } else {
      style.whiteSpace = 'nowrap';
    }
  }

  /**
   * Function: getMargin
   *
   * Returns the spacing as an <mxPoint>.
   */
  updateMargin(): void {
    this.margin = mxUtils.getAlignmentAsPoint(this.align, this.valign);
  }

  /**
   * Function: getSpacing
   *
   * Returns the spacing as an <mxPoint>.
   */
  getSpacing(): any {
    let dx = 0;
    let dy = 0;
    if (this.align == mxConstants.ALIGN_CENTER) {
      dx = (this.spacingLeft - this.spacingRight) / 2;
    } else if (this.align == mxConstants.ALIGN_RIGHT) {
      dx = -this.spacingRight - this.baseSpacingRight;
    } else {
      dx = this.spacingLeft + this.baseSpacingLeft;
    }
    if (this.valign == mxConstants.ALIGN_MIDDLE) {
      dy = (this.spacingTop - this.spacingBottom) / 2;
    } else if (this.valign == mxConstants.ALIGN_BOTTOM) {
      dy = -this.spacingBottom - this.baseSpacingBottom;

    } else {
      dy = this.spacingTop + this.baseSpacingTop;
    }
    return new mxPoint(dx, dy);
  }
}
