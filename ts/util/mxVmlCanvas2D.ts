/**
 * Class: mxVmlCanvas2D
 *
 * Implements a canvas to be used for rendering VML. Here is an example of implementing a
 * fallback for SVG images which are not supported in VML-based browsers.
 *
 * (code)
 * var mxVmlCanvas2DImage = mxVmlCanvas2D.prototype.image;
 * mxVmlCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
 * {
 *   if (src.substring(src.length - 4, src.length) == '.svg')
 *   {
 *     src = 'http://www.jgraph.com/images/mxgraph.gif';
 *   }
 *
 *   mxVmlCanvas2DImage.apply(this, arguments);
 * };
 * (end)
 *
 * To disable anti-aliasing in the output, use the following code.
 *
 * (code)
 * document.createStyleSheet().cssText = mxClient.VML_PREFIX + '\\:*{antialias:false;)}';
 * (end)
 *
 * A description of the public API is available in <mxXmlCanvas2D>. Note that
 * there is a known issue in VML where gradients are painted using the outer
 * bounding box of rotated shapes, not the actual bounds of the shape. See
 * also <text> for plain text label restrictions in shapes for VML.
 */
import { mxClient } from '../mxClient';
import { mxAbstractCanvas2D } from './mxAbstractCanvas2D';
import { mxConstants } from './mxConstants';
import { mxUtils } from './mxUtils';

export class mxVmlCanvas2D {
  /**
   * Variable: root
   *
   * Reference to the container for the SVG content.
   */
  root: any;
  /**
   * Variable: path
   *
   * Holds the current DOM node.
   */
  node: Node;
  /**
   * Variable: textEnabled
   *
   * Specifies if text output should be enabledetB. Default is true.
   * @example true
   */
  textEnabled: boolean;
  /**
   * Variable: moveOp
   *
   * Contains the string used for moving in paths. Default is 'm'.
   * @example m
   */
  moveOp: string;
  /**
   * Variable: lineOp
   *
   * Contains the string used for moving in paths. Default is 'l'.
   * @example l
   */
  lineOp: string;
  /**
   * Variable: curveOp
   *
   * Contains the string used for bezier curves. Default is 'c'.
   * @example c
   */
  curveOp: string;
  /**
   * Variable: closeOp
   *
   * Holds the operator for closing curves. Default is 'x e'.
   * @example x
   */
  closeOp: string;
  /**
   * Variable: rotatedHtmlBackground
   *
   * Background color for rotated HTML. Default is ''. This can be set to eg.
   * white to improve rendering of rotated text in VML for IE9.
   */
  rotatedHtmlBackground: string;
  /**
   * Variable: vmlScale
   *
   * Specifies the scale used to draw VML shapes.
   * @example 1
   */
  vmlScale: number;
  lastX: any;
  lastY: any;

  /**
   * Function: createElement
   *
   * Creates the given element using the document.
   */
  createElement(name: string): any {
    return document.createElement(name);
  }

  /**
   * Function: createVmlElement
   *
   * Creates a new element using <createElement> and prefixes the given name with
   * <mxClient.VML_PREFIX>.
   */
  createVmlElement(name: string): any {
    return this.createElement(mxClient.VML_PREFIX + ':' + name);
  }

  /**
   * Function: addNode
   *
   * Adds the current node to the <root>.
   */
  addNode(filled: any, stroked: any): void {
    const node = this.node;
    const s = this.state;
    if (!!node) {
      if (node.nodeName == 'shape') {
        if (!!this.path && this.path.length > 0) {
          node.path = this.path.join(' ') + ' e';
          node.style.width = this.root.style.width;
          node.style.height = this.root.style.height;
          node.coordsize = parseInt(node.style.width) + ' ' + parseInt(node.style.height);
        } else {
          return;
        }
      }
      node.strokeweight = this.format(Math.max(1, s.strokeWidth * s.scale / this.vmlScale)) + 'px';
      if (s.shadow) {
        this.root.appendChild(this.createShadow(node, filled && !!s.fillColor, stroked && !!s.strokeColor));
      }
      if (stroked && !!s.strokeColor) {
        node.stroked = 'true';
        node.strokecolor = s.strokeColor;
      } else {
        node.stroked = 'false';
      }
      node.appendChild(this.createStroke());
      if (filled && !!s.fillColor) {
        node.appendChild(this.createFill());
      } else if (this.pointerEvents && (node.nodeName != 'shape' || this.path[this.path.length - 1] == this.closeOp)) {
        node.appendChild(this.createTransparentFill());
      } else {
        node.filled = 'false';
      }
      this.root.appendChild(node);
    }
  }

  /**
   * Function: createTransparentFill
   *
   * Creates a transparent fill.
   */
  createTransparentFill(): any {
    const fill = this.createVmlElement('fill');
    fill.src = mxClient.imageBasePath + '/transparent.gif';
    fill.type = 'tile';
    return fill;
  }

  /**
   * Function: createFill
   *
   * Creates a fill for the current state.
   */
  createFill(): any {
    const s = this.state;
    const fill = this.createVmlElement('fill');
    fill.color = s.fillColor;
    if (!!s.gradientColor) {
      fill.type = 'gradient';
      fill.method = 'none';
      fill.color2 = s.gradientColor;
      let angle = 180 - s.rotation;
      if (s.gradientDirection == mxConstants.DIRECTION_WEST) {
        angle -= 90 + ((this.root.style.flip == 'x') ? 180 : 0);
      } else if (s.gradientDirection == mxConstants.DIRECTION_EAST) {
        angle += 90 + ((this.root.style.flip == 'x') ? 180 : 0);
      } else if (s.gradientDirection == mxConstants.DIRECTION_NORTH) {
        angle -= 180 + ((this.root.style.flip == 'y') ? -180 : 0);
      } else {
        angle += ((this.root.style.flip == 'y') ? -180 : 0);
      }
      if (this.root.style.flip == 'x' || this.root.style.flip == 'y') {
        angle *= -1;
      }
      fill.angle = mxUtils.mod(angle, 360);
      fill.opacity = (s.alpha * s.gradientFillAlpha * 100) + '%';
      fill.setAttribute(mxClient.OFFICE_PREFIX + ':opacity2', (s.alpha * s.gradientAlpha * 100) + '%');
    } else if (s.alpha < 1 || s.fillAlpha < 1) {
      fill.opacity = (s.alpha * s.fillAlpha * 100) + '%';
    }
    return fill;
  }

  /**
   * Function: createStroke
   *
   * Creates a fill for the current state.
   */
  createStroke(): any {
    const s = this.state;
    const stroke = this.createVmlElement('stroke');
    stroke.endcap = s.lineCap || 'flat';
    stroke.joinstyle = s.lineJoin || 'miter';
    stroke.miterlimit = s.miterLimit || '10';
    if (s.alpha < 1 || s.strokeAlpha < 1) {
      stroke.opacity = (s.alpha * s.strokeAlpha * 100) + '%';
    }
    if (s.dashed) {
      stroke.dashstyle = this.getVmlDashStyle();
    }
    return stroke;
  }

  /**
   * Function: getVmlDashPattern
   *
   * Returns a VML dash pattern for the current dashPattern.
   * See http://msdn.microsoft.com/en-us/library/bb264085(v=vs.85).aspx
   */
  getVmlDashStyle(): any {
    let result = 'dash';
    if (typeof (this.state.dashPattern) === 'string') {
      const tok = this.state.dashPattern.split(' ');
      if (tok.length > 0 && tok[0] == 1) {
        result = '0 2';
      }
    }
    return result;
  }

  /**
   * Function: createShadow
   *
   * Creates a shadow for the given node.
   */
  createShadow(node: Node, filled: any, stroked: any): any {
    const s = this.state;
    const rad = -s.rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    let dx = s.shadowDx * s.scale;
    let dy = s.shadowDy * s.scale;
    if (this.root.style.flip == 'x') {
      dx *= -1;
    } else if (this.root.style.flip == 'y') {
      dy *= -1;
    }
    const shadow = node.cloneNode(true);
    shadow.style.marginLeft = Math.round(dx * cos - dy * sin) + 'px';
    shadow.style.marginTop = Math.round(dx * sin + dy * cos) + 'px';
    if (document.documentMode == 8) {
      shadow.strokeweight = node.strokeweight;
      if (node.nodeName == 'shape') {
        shadow.path = this.path.join(' ') + ' e';
        shadow.style.width = this.root.style.width;
        shadow.style.height = this.root.style.height;
        shadow.coordsize = parseInt(node.style.width) + ' ' + parseInt(node.style.height);
      }
    }
    if (stroked) {
      shadow.strokecolor = s.shadowColor;
      shadow.appendChild(this.createShadowStroke());
    } else {
      shadow.stroked = 'false';
    }
    if (filled) {
      shadow.appendChild(this.createShadowFill());
    } else {
      shadow.filled = 'false';
    }
    return shadow;
  }

  /**
   * Function: createShadowFill
   *
   * Creates the fill for the shadow.
   */
  createShadowFill(): any {
    const fill = this.createVmlElement('fill');
    fill.color = this.state.shadowColor;
    fill.opacity = (this.state.alpha * this.state.shadowAlpha * 100) + '%';
    return fill;
  }

  /**
   * Function: createShadowStroke
   *
   * Creates the stroke for the shadow.
   */
  createShadowStroke(): any {
    const stroke = this.createStroke();
    stroke.opacity = (this.state.alpha * this.state.shadowAlpha * 100) + '%';
    return stroke;
  }

  /**
   * Function: rotate
   *
   * Sets the rotation of the canvas. Note that rotation cannot be concatenated.
   */
  rotate(theta: any, flipH: any, flipV: any, cx: any, cy: any): void {
    if (flipH && flipV) {
      theta += 180;
    } else if (flipH) {
      this.root.style.flip = 'x';
    } else if (flipV) {
      this.root.style.flip = 'y';
    }
    if (flipH ? !flipV : flipV) {
      theta *= -1;
    }
    this.root.style.rotation = theta;
    this.state.rotation = this.state.rotation + theta;
    this.state.rotationCx = cx;
    this.state.rotationCy = cy;
  }

  /**
   * Function: begin
   *
   * Extends superclass to create path.
   */
  begin(): void {
    mxAbstractCanvas2D.prototype.begin.apply(this, arguments);
    this.node = this.createVmlElement('shape');
    this.node.style.position = 'absolute';
  }

  /**
   * Function: quadTo
   *
   * Replaces quadratic curve with bezier curve in VML.
   */
  quadTo(x1: any, y1: any, x2: any, y2: any): void {
    const s = this.state;
    const cpx0 = (this.lastX + s.dx) * s.scale;
    const cpy0 = (this.lastY + s.dy) * s.scale;
    const qpx1 = (x1 + s.dx) * s.scale;
    const qpy1 = (y1 + s.dy) * s.scale;
    const cpx3 = (x2 + s.dx) * s.scale;
    const cpy3 = (y2 + s.dy) * s.scale;
    const cpx1 = cpx0 + 2 / 3 * (qpx1 - cpx0);
    const cpy1 = cpy0 + 2 / 3 * (qpy1 - cpy0);
    const cpx2 = cpx3 + 2 / 3 * (qpx1 - cpx3);
    const cpy2 = cpy3 + 2 / 3 * (qpy1 - cpy3);
    this.path.push('c ' + this.format(cpx1) + ' ' + this.format(cpy1) + ' ' + this.format(cpx2) + ' ' + this.format(cpy2) + ' ' + this.format(cpx3) + ' ' + this.format(cpy3));
    this.lastX = (cpx3 / s.scale) - s.dx;
    this.lastY = (cpy3 / s.scale) - s.dy;
  }

  /**
   * Function: createRect
   *
   * Sets the glass gradient.
   */
  createRect(nodeName: string, x: number, y: number, w: number, h: number): any {
    const s = this.state;
    const n = this.createVmlElement(nodeName);
    n.style.position = 'absolute';
    n.style.left = this.format((x + s.dx) * s.scale) + 'px';
    n.style.top = this.format((y + s.dy) * s.scale) + 'px';
    n.style.width = this.format(w * s.scale) + 'px';
    n.style.height = this.format(h * s.scale) + 'px';
    return n;
  }

  /**
   * Function: rect
   *
   * Sets the current path to a rectangle.
   */
  rect(x: number, y: number, w: number, h: number): void {
    this.node = this.createRect('rect', x, y, w, h);
  }

  /**
   * Function: roundrect
   *
   * Sets the current path to a rounded rectangle.
   */
  roundrect(x: number, y: number, w: number, h: number, dx: number, dy: number): void {
    this.node = this.createRect('roundrect', x, y, w, h);
    this.node.setAttribute('arcsize', Math.max(dx * 100 / w, dy * 100 / h) + '%');
  }

  /**
   * Function: ellipse
   *
   * Sets the current path to an ellipse.
   */
  ellipse(x: number, y: number, w: number, h: number): void {
    this.node = this.createRect('oval', x, y, w, h);
  }

  /**
   * Function: image
   *
   * Paints an image.
   */
  image(x: number, y: number, w: number, h: number, src: any, aspect: any, flipH: any, flipV: any): void {
    let node = undefined;
    if (!aspect) {
      node = this.createRect('image', x, y, w, h);
      node.src = src;
    } else {
      node = this.createRect('rect', x, y, w, h);
      node.stroked = 'false';
      const fill = this.createVmlElement('fill');
      fill.aspect = (aspect) ? 'atmost' : 'ignore';
      fill.rotate = 'true';
      fill.type = 'frame';
      fill.src = src;
      node.appendChild(fill);
    }
    if (flipH && flipV) {
      node.style.rotation = '180';
    } else if (flipH) {
      node.style.flip = 'x';
    } else if (flipV) {
      node.style.flip = 'y';
    }
    if (this.state.alpha < 1 || this.state.fillAlpha < 1) {
      node.style.filter += 'alpha(opacity=' + (this.state.alpha * this.state.fillAlpha * 100) + ')';
    }
    this.root.appendChild(node);
  }

  /**
   * Function: createText
   *
   * Creates the innermost element that contains the HTML text.
   */
  createDiv(str: string, align: any, valign: any, overflow: any): any {
    const div = this.createElement('div');
    const state = this.state;
    let css = '';
    if (!!state.fontBackgroundColor) {
      css += 'background-color:' + mxUtils.htmlEntities(state.fontBackgroundColor) + ';';
    }
    if (!!state.fontBorderColor) {
      css += 'border:1px solid ' + mxUtils.htmlEntities(state.fontBorderColor) + ';';
    }
    if (mxUtils.isNode(str)) {
      div.appendChild(str);
    } else {
      if (overflow != 'fill' && overflow != 'width') {
        const div2 = this.createElement('div');
        div2.style.cssText = css;
        div2.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
        div2.style.zoom = '1';
        div2.style.textDecoration = 'inherit';
        div2.innerHTML = str;
        div.appendChild(div2);
      } else {
        div.style.cssText = css;
        div.innerHTML = str;
      }
    }
    const style = div.style;
    style.fontSize = (state.fontSize / this.vmlScale) + 'px';
    style.fontFamily = state.fontFamily;
    style.color = state.fontColor;
    style.verticalAlign = 'top';
    style.textAlign = align || 'left';
    style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (state.fontSize * mxConstants.LINE_HEIGHT / this.vmlScale) + 'px' : mxConstants.LINE_HEIGHT;
    if ((state.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      style.fontWeight = 'bold';
    }
    if ((state.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      style.fontStyle = 'italic';
    }
    if ((state.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      style.textDecoration = 'underline';
    }
    return div;
  }

  /**
   * Function: text
   *
   * Paints the given text. Possible values for format are empty string for plain
   * text and html for HTML markup. Clipping, text background and border are not
   * supported for plain text in VML.
   */
  text(x: number, y: number, w: number, h: number, str: string, align: any, valign: any, wrap: any, format: string, overflow: any, clip: any, rotation: any, dir: any): void {
    if (this.textEnabled && !!str) {
      const s = this.state;
      if (format == 'html') {
        if (!!s.rotation) {
          const pt = this.rotatePoint(x, y, s.rotation, s.rotationCx, s.rotationCy);
          x = pt.x;
          y = pt.y;
        }
        if (document.documentMode == 8 && !mxClient.IS_EM) {
          x += s.dx;
          y += s.dy;
          if (overflow != 'fill' && valign == mxConstants.ALIGN_TOP) {
            y -= 1;
          }
        } else {
          x *= s.scale;
          y *= s.scale;
        }
        const abs = (document.documentMode == 8 && !mxClient.IS_EM) ? this.createVmlElement('group') : this.createElement('div');
        abs.style.position = 'absolute';
        abs.style.display = 'inline';
        abs.style.left = this.format(x) + 'px';
        abs.style.top = this.format(y) + 'px';
        abs.style.zoom = s.scale;
        const box = this.createElement('div');
        box.style.position = 'relative';
        box.style.display = 'inline';
        const margin = mxUtils.getAlignmentAsPoint(align, valign);
        const dx = margin.x;
        const dy = margin.y;
        const div = this.createDiv(str, align, valign, overflow);
        const inner = this.createElement('div');
        if (!!dir) {
          div.setAttribute('dir', dir);
        }
        if (wrap && w > 0) {
          if (!clip) {
            div.style.width = Math.round(w) + 'px';
          }
          div.style.wordWrap = mxConstants.WORD_WRAP;
          div.style.whiteSpace = 'normal';
          if (div.style.wordWrap == 'break-word') {
            const tmp = div;
            if (!!tmp.firstChild && tmp.firstChild.nodeName == 'DIV') {
              tmp.firstChild.style.width = '100%';
            }
          }
        } else {
          div.style.whiteSpace = 'nowrap';
        }
        const rot = s.rotation + (rotation || 0);
        if (this.rotateHtml && rot != 0) {
          inner.style.display = 'inline';
          inner.style.zoom = '1';
          inner.appendChild(div);
          if (document.documentMode == 8 && !mxClient.IS_EM && this.root.nodeName != 'DIV') {
            box.appendChild(inner);
            abs.appendChild(box);
          } else {
            abs.appendChild(inner);
          }
        } else if (document.documentMode == 8 && !mxClient.IS_EM) {
          box.appendChild(div);
          abs.appendChild(box);
        } else {
          div.style.display = 'inline';
          abs.appendChild(div);
        }
        if (this.root.nodeName != 'DIV') {
          const rect = this.createVmlElement('rect');
          rect.stroked = 'false';
          rect.filled = 'false';
          rect.appendChild(abs);
          this.root.appendChild(rect);
        } else {
          this.root.appendChild(abs);
        }
        if (clip) {
          div.style.overflow = 'hidden';
          div.style.width = Math.round(w) + 'px';
          if (!mxClient.IS_QUIRKS) {
            div.style.maxHeight = Math.round(h) + 'px';
          }
        } else if (overflow == 'fill') {
          div.style.overflow = 'hidden';
          div.style.width = (Math.max(0, w) + 1) + 'px';
          div.style.height = (Math.max(0, h) + 1) + 'px';
        } else if (overflow == 'width') {
          div.style.overflow = 'hidden';
          div.style.width = (Math.max(0, w) + 1) + 'px';
          div.style.maxHeight = (Math.max(0, h) + 1) + 'px';
        }
        if (this.rotateHtml && rot != 0) {
          let rad = rot * (Math.PI / 180);
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
          const sin = Math.sin(rad);
          if (document.documentMode == 8 && !mxClient.IS_EM) {
            div.style.display = 'inline-block';
            inner.style.display = 'inline-block';
            box.style.display = 'inline-block';
          }
          div.style.visibility = 'hidden';
          div.style.position = 'absolute';
          document.body.appendChild(div);
          let sizeDiv = div;
          if (!!sizeDiv.firstChild && sizeDiv.firstChild.nodeName == 'DIV') {
            sizeDiv = sizeDiv.firstChild;
          }
          const tmp = sizeDiv.offsetWidth + 3;
          let oh = sizeDiv.offsetHeight;
          if (clip) {
            w = Math.min(w, tmp);
            oh = Math.min(oh, h);
          } else {
            w = tmp;
          }
          if (wrap) {
            div.style.width = w + 'px';
          }
          if (mxClient.IS_QUIRKS && (clip || overflow == 'width') && oh > h) {
            oh = h;
            div.style.height = oh + 'px';
          }
          h = oh;
          const top_fix = (h - h * cos + w * -sin) / 2 - real_sin * w * (dx + 0.5) + real_cos * h * (dy + 0.5);
          const left_fix = (w - w * cos + h * -sin) / 2 + real_cos * w * (dx + 0.5) + real_sin * h * (dy + 0.5);
          if (abs.nodeName == 'group' && this.root.nodeName == 'DIV') {
            const pos = this.createElement('div');
            pos.style.display = 'inline-block';
            pos.style.position = 'absolute';
            pos.style.left = this.format(x + (left_fix - w / 2) * s.scale) + 'px';
            pos.style.top = this.format(y + (top_fix - h / 2) * s.scale) + 'px';
            abs.parentNode.appendChild(pos);
            pos.appendChild(abs);
          } else {
            const sc = (document.documentMode == 8 && !mxClient.IS_EM) ? 1 : s.scale;
            abs.style.left = this.format(x + (left_fix - w / 2) * sc) + 'px';
            abs.style.top = this.format(y + (top_fix - h / 2) * sc) + 'px';
          }
          inner.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=' + real_cos + ', M12=' + real_sin + ', M21=' + (-real_sin) + ', M22=' + real_cos + ', sizingMethod=\'auto expand\')';
          inner.style.backgroundColor = this.rotatedHtmlBackground;
          if (this.state.alpha < 1) {
            inner.style.filter += 'alpha(opacity=' + (this.state.alpha * 100) + ')';
          }
          inner.appendChild(div);
          div.style.position = '';
          div.style.visibility = '';
        } else if (document.documentMode != 8 || mxClient.IS_EM) {
          div.style.verticalAlign = 'top';
          if (this.state.alpha < 1) {
            abs.style.filter = 'alpha(opacity=' + (this.state.alpha * 100) + ')';
          }
          const divParent = div.parentNode;
          div.style.visibility = 'hidden';
          document.body.appendChild(div);
          w = div.offsetWidth;
          let oh = div.offsetHeight;
          if (mxClient.IS_QUIRKS && clip && oh > h) {
            oh = h;
            div.style.height = oh + 'px';
          }
          h = oh;
          div.style.visibility = '';
          divParent.appendChild(div);
          abs.style.left = this.format(x + w * dx * this.state.scale) + 'px';
          abs.style.top = this.format(y + h * dy * this.state.scale) + 'px';
        } else {
          if (this.state.alpha < 1) {
            div.style.filter = 'alpha(opacity=' + (this.state.alpha * 100) + ')';
          }
          box.style.left = (dx * 100) + '%';
          box.style.top = (dy * 100) + '%';
        }
      } else {
        this.plainText(x, y, w, h, mxUtils.htmlEntities(str, false), align, valign, wrap, format, overflow, clip, rotation, dir);
      }
    }
  }

  /**
   * Function: plainText
   *
   * Paints the outline of the current path.
   */
  plainText(x: number, y: number, w: number, h: number, str: string, align: any, valign: any, wrap: any, format: string, overflow: any, clip: any, rotation: any, dir: any): void {
    const s = this.state;
    x = (x + s.dx) * s.scale;
    y = (y + s.dy) * s.scale;
    const node = this.createVmlElement('shape');
    node.style.width = '1px';
    node.style.height = '1px';
    node.stroked = 'false';
    const fill = this.createVmlElement('fill');
    fill.color = s.fontColor;
    fill.opacity = (s.alpha * 100) + '%';
    node.appendChild(fill);
    const path = this.createVmlElement('path');
    path.textpathok = 'true';
    path.v = 'm ' + this.format(0) + ' ' + this.format(0) + ' l ' + this.format(1) + ' ' + this.format(0);
    node.appendChild(path);
    const tp = this.createVmlElement('textpath');
    tp.style.cssText = 'v-text-align:' + align;
    tp.style.align = align;
    tp.style.fontFamily = s.fontFamily;
    tp.string = str;
    tp.on = 'true';
    const size = s.fontSize * s.scale / this.vmlScale;
    tp.style.fontSize = size + 'px';
    if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      tp.style.fontWeight = 'bold';
    }
    if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      tp.style.fontStyle = 'italic';
    }
    if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      tp.style.textDecoration = 'underline';
    }
    const lines = str.split('\n');
    const textHeight = size + (lines.length - 1) * size * mxConstants.LINE_HEIGHT;
    let dx = 0;
    let dy = 0;
    if (valign == mxConstants.ALIGN_BOTTOM) {
      dy = -textHeight / 2;
    } else if (valign != mxConstants.ALIGN_MIDDLE) {
      dy = textHeight / 2;
    }
    if (!!rotation) {
      node.style.rotation = rotation;
      const rad = rotation * (Math.PI / 180);
      dx = Math.sin(rad) * dy;
      dy = Math.cos(rad) * dy;
    }
    node.appendChild(tp);
    node.style.left = this.format(x - dx) + 'px';
    node.style.top = this.format(y + dy) + 'px';
    this.root.appendChild(node);
  }

  /**
   * Function: stroke
   *
   * Paints the outline of the current path.
   */
  stroke(): void {
    this.addNode(false, true);
  }

  /**
   * Function: fill
   *
   * Fills the current path.
   */
  fill(): void {
    this.addNode(true, false);
  }

  /**
   * Function: fillAndStroke
   *
   * Fills and paints the outline of the current path.
   */
  fillAndStroke(): void {
    this.addNode(true, true);
  }
}
