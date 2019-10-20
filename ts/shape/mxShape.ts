/**
 * Class: mxShape
 *
 * Base class for all shapes. A shape in mxGraph is a
 * separate implementation for SVG, VML and HTML. Which
 * implementation to use is controlled by the <dialect>
 * property which is assigned from within the <mxCellRenderer>
 * when the shape is created. The dialect must be assigned
 * for a shape, and it does normally depend on the browser and
 * the confiuration of the graph (see <mxGraph> rendering hint).
 *
 * For each supported shape in SVG and VML, a corresponding
 * shape exists in mxGraph, namely for text, image, rectangle,
 * rhombus, ellipse and polyline. The other shapes are a
 * combination of these shapes (eg. label and swimlane)
 * or they consist of one or more (filled) path objects
 * (eg. actor and cylinder). The HTML implementation is
 * optional but may be required for a HTML-only view of
 * the graph.
 *
 * Custom Shapes:
 *
 * To extend from this class, the basic code looks as follows.
 * In the special case where the custom shape consists only of
 * one filled region or one filled region and an additional stroke
 * the <mxActor> and <mxCylinder> should be subclassed,
 * respectively.
 *
 * (code)
 * function CustomShape() { }
 *
 * CustomShape.prototype = new mxShape();
 * CustomShape.prototype.constructor = CustomShape;
 * (end)
 *
 * To register a custom shape in an existing graph instance,
 * one must register the shape under a new name in the graph's
 * cell renderer as follows:
 *
 * (code)
 * mxCellRenderer.registerShape('customShape', CustomShape);
 * (end)
 *
 * The second argument is the name of the constructor.
 *
 * In order to use the shape you can refer to the given name above
 * in a stylesheet. For example, to change the shape for the default
 * vertex style, the following code is used:
 *
 * (code)
 * var style = graph.getStylesheet().getDefaultVertexStyle();
 * style[mxConstants.STYLE_SHAPE] = 'customShape';
 * (end)
 *
 * Constructor: mxShape
 *
 * Constructs a new shape.
 */
export class mxShape {
  stencil: any;
  /**
   * Variable: dialect
   *
   * Holds the dialect in which the shape is to be painted.
   * This can be one of the DIALECT constants in <mxConstants>.
   */
  dialect: any;
  /**
   * Variable: scale
   *
   * Holds the scale in which the shape is being painted.
   * @example 1
   */
  scale: number;
  /**
   * Variable: antiAlias
   *
   * Rendering hint for configuring the canvas.
   * @example true
   */
  antiAlias: boolean;
  /**
   * Variable: minSvgStrokeWidth
   *
   * Minimum stroke width for SVG output.
   * @example 1
   */
  minSvgStrokeWidth: number;
  /**
   * Variable: bounds
   *
   * Holds the <mxRectangle> that specifies the bounds of this shape.
   */
  bounds: any;
  /**
   * Variable: points
   *
   * Holds the array of <mxPoints> that specify the points of this shape.
   */
  points: any;
  /**
   * Variable: node
   *
   * Holds the outermost DOM node that represents this shape.
   */
  node: Node;
  /**
   * Variable: state
   *
   * Optional reference to the corresponding <mxCellState>.
   */
  state: any;
  /**
   * Variable: style
   *
   * Optional reference to the style of the corresponding <mxCellState>.
   */
  style: any;
  /**
   * Variable: boundingBox
   *
   * Contains the bounding box of the shape, that is, the smallest rectangle
   * that includes all pixels of the shape.
   */
  boundingBox: any;
  /**
   * Variable: svgStrokeTolerance
   *
   * Event-tolerance for SVG strokes (in px). Default is 8. This is only passed
   * to the canvas in <createSvgCanvas> if <pointerEvents> is true.
   * @example 8
   */
  svgStrokeTolerance: number;
  /**
   * Variable: pointerEvents
   *
   * Specifies if pointer events should be handled. Default is true.
   * @example true
   */
  pointerEvents: boolean;
  /**
   * Variable: svgPointerEvents
   *
   * Specifies if pointer events should be handled. Default is true.
   * @example all
   */
  svgPointerEvents: string;
  /**
   * Variable: shapePointerEvents
   *
   * Specifies if pointer events outside of shape should be handled. Default
   * is false.
   */
  shapePointerEvents: boolean;
  /**
   * Variable: stencilPointerEvents
   *
   * Specifies if pointer events outside of stencils should be handled. Default
   * is false. Set this to true for backwards compatibility with the 1.x branch.
   */
  stencilPointerEvents: boolean;
  /**
   * Variable: vmlScale
   *
   * Scale for improving the precision of VML rendering. Default is 1.
   * @example 1
   */
  vmlScale: number;
  /**
   * Variable: outline
   *
   * Specifies if the shape should be drawn as an outline. This disables all
   * fill colors and can be used to disable other drawing states that should
   * not be painted for outlines. Default is false. This should be set before
   * calling <apply>.
   */
  outline: boolean;
  /**
   * Variable: visible
   *
   * Specifies if the shape is visible. Default is true.
   * @example true
   */
  visible: boolean;
  /**
   * Variable: useSvgBoundingBox
   *
   * Allows to use the SVG bounding box in SVG. Default is false for performance
   * reasons.
   */
  useSvgBoundingBox: boolean;
  /**
   * @example 1
   */
  strokewidth: number;
  rotation: number;
  /**
   * @example 100
   */
  opacity: number;
  /**
   * @example 100
   */
  fillOpacity: number;
  /**
   * @example 100
   */
  strokeOpacity: number;
  flipH: boolean;
  flipV: boolean;
  oldGradients: any;
  spacing: number;
  fill: any;
  gradient: any;
  gradientDirection: any;
  stroke: any;
  startSize: any;
  endSize: any;
  startArrow: any;
  endArrow: any;
  direction: any;
  isShadow: boolean;
  isDashed: boolean;
  isRounded: boolean;
  glass: any;
  cursor: any;

  constructor(stencil: any) {
    this.stencil = stencil;
    this.initStyles();
  }

  /**
   * Function: init
   *
   * Initializes the shape by creaing the DOM node using <create>
   * and adding it into the given container.
   *
   * Parameters:
   *
   * container - DOM node that will contain the shape.
   */
  init(container: HTMLElement): void {
    if (this.node == null) {
      this.node = this.create(container);
      if (container != null) {
        container.appendChild(this.node);
      }
    }
  }

  /**
   * Function: initStyles
   *
   * Sets the styles to their default values.
   */
  initStyles(container: HTMLElement): void {
    this.strokewidth = 1;
    this.rotation = 0;
    this.opacity = 100;
    this.fillOpacity = 100;
    this.strokeOpacity = 100;
    this.flipH = false;
    this.flipV = false;
  }

  /**
   * Function: isParseVml
   *
   * Specifies if any VML should be added via insertAdjacentHtml to the DOM. This
   * is only needed in IE8 and only if the shape contains VML markup. This method
   * returns true.
   */
  isParseVml(): boolean {
    return true;
  }

  /**
   * Function: isHtmlAllowed
   *
   * Returns true if HTML is allowed for this shape. This implementation always
   * returns false.
   */
  isHtmlAllowed(): boolean {
    return false;
  }

  /**
   * Function: getSvgScreenOffset
   *
   * Returns 0, or 0.5 if <strokewidth> % 2 == 1.
   */
  getSvgScreenOffset(): any {
    const sw = this.stencil && this.stencil.strokewidth != 'inherit' ? Number(this.stencil.strokewidth) : this.strokewidth;
    return (mxUtils.mod(Math.max(1, Math.round(sw * this.scale)), 2) == 1) ? 0.5 : 0;
  }

  /**
   * Function: create
   *
   * Creates and returns the DOM node(s) for the shape in
   * the given container. This implementation invokes
   * <createSvg>, <createHtml> or <createVml> depending
   * on the <dialect> and style settings.
   *
   * Parameters:
   *
   * container - DOM node that will contain the shape.
   */
  create(container: HTMLElement): any {
    let node = null;
    if (container != null && container.ownerSVGElement != null) {
      node = this.createSvg(container);
    } else if (document.documentMode == 8 || !mxClient.IS_VML || (this.dialect != mxConstants.DIALECT_VML && this.isHtmlAllowed())) {
      node = this.createHtml(container);
    } else {
      node = this.createVml(container);
    }
    return node;
  }

  /**
   * Function: createSvg
   *
   * Creates and returns the SVG node(s) to represent this shape.
   */
  createSvg(): any {
    return document.createElementNS(mxConstants.NS_SVG, 'g');
  }

  /**
   * Function: createVml
   *
   * Creates and returns the VML node to represent this shape.
   */
  createVml(): any {
    const node = document.createElement(mxClient.VML_PREFIX + ':group');
    node.style.position = 'absolute';
    return node;
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
   * Function: reconfigure
   *
   * Reconfigures this shape. This will update the colors etc in
   * addition to the bounds or points.
   */
  reconfigure(): void {
    this.redraw();
  }

  /**
   * Function: redraw
   *
   * Creates and returns the SVG node(s) to represent this shape.
   */
  redraw(): void {
    this.updateBoundsFromPoints();
    if (this.visible && this.checkBounds()) {
      this.node.style.visibility = 'visible';
      this.clear();
      if (this.node.nodeName == 'DIV' && (this.isHtmlAllowed() || !mxClient.IS_VML)) {
        this.redrawHtmlShape();
      } else {
        this.redrawShape();
      }
      this.updateBoundingBox();
    } else {
      this.node.style.visibility = 'hidden';
      this.boundingBox = null;
    }
  }

  /**
   * Function: clear
   *
   * Removes all child nodes and resets all CSS.
   */
  clear(): void {
    if (this.node.ownerSVGElement != null) {
      while (this.node.lastChild != null) {
        this.node.removeChild(this.node.lastChild);
      }
    } else {
      this.node.style.cssText = 'position:absolute;' + ((this.cursor != null) ? ('cursor:' + this.cursor + ';') : '');
      this.node.innerHTML = '';
    }
  }

  /**
   * Function: updateBoundsFromPoints
   *
   * Updates the bounds based on the points.
   */
  updateBoundsFromPoints(): void {
    const pts = this.points;
    if (pts != null && pts.length > 0 && pts[0] != null) {
      this.bounds = new mxRectangle(Number(pts[0].x), Number(pts[0].y), 1, 1);
      for (let i = 1; i < this.points.length; i++) {
        if (pts[i] != null) {
          this.bounds.add(new mxRectangle(Number(pts[i].x), Number(pts[i].y), 1, 1));
        }
      }
    }
  }

  /**
   * Function: getLabelBounds
   *
   * Returns the <mxRectangle> for the label bounds of this shape, based on the
   * given scaled and translated bounds of the shape. This method should not
   * change the rectangle in-place. This implementation returns the given rect.
   */
  getLabelBounds(rect: any): any {
    const d = mxUtils.getValue(this.style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST);
    let bounds = rect;
    if (d != mxConstants.DIRECTION_SOUTH && d != mxConstants.DIRECTION_NORTH && this.state != null && this.state.text != null && this.state.text.isPaintBoundsInverted()) {
      bounds = bounds.clone();
      const tmp = bounds.width;
      bounds.width = bounds.height;
      bounds.height = tmp;
    }
    const m = this.getLabelMargins(bounds);
    if (m != null) {
      let flipH = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPH, false) == '1';
      let flipV = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPV, false) == '1';
      if (this.state != null && this.state.text != null && this.state.text.isPaintBoundsInverted()) {
        let tmp = m.x;
        m.x = m.height;
        m.height = m.width;
        m.width = m.y;
        m.y = tmp;
        tmp = flipH;
        flipH = flipV;
        flipV = tmp;
      }
      return mxUtils.getDirectedBounds(rect, m, this.style, flipH, flipV);
    }
    return rect;
  }

  /**
   * Function: getLabelMargins
   *
   * Returns the scaled top, left, bottom and right margin to be used for
   * computing the label bounds as an <mxRectangle>, where the bottom and right
   * margin are defined in the width and height of the rectangle, respectively.
   */
  getLabelMargins(rect: any): any {
    return null;
  }

  /**
   * Function: checkBounds
   *
   * Returns true if the bounds are not null and all of its variables are numeric.
   */
  checkBounds(): any {
    return (!isNaN(this.scale) && isFinite(this.scale) && this.scale > 0 && this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) && !isNaN(this.bounds.width) && !isNaN(this.bounds.height) && this.bounds.width > 0 && this.bounds.height > 0);
  }

  /**
   * Function: createVmlGroup
   *
   * Returns the temporary element used for rendering in IE8 standards mode.
   */
  createVmlGroup(): any {
    const node = document.createElement(mxClient.VML_PREFIX + ':group');
    node.style.position = 'absolute';
    node.style.width = this.node.style.width;
    node.style.height = this.node.style.height;
    return node;
  }

  /**
   * Function: redrawShape
   *
   * Updates the SVG or VML shape.
   */
  redrawShape(): void {
    const canvas = this.createCanvas();
    if (canvas != null) {
      canvas.pointerEvents = this.pointerEvents;
      this.paint(canvas);
      if (this.node != canvas.root) {
        this.node.insertAdjacentHTML('beforeend', canvas.root.outerHTML);
      }
      if (this.node.nodeName == 'DIV' && document.documentMode == 8) {
        this.node.style.filter = '';
        mxUtils.addTransparentBackgroundFilter(this.node);
      }
      this.destroyCanvas(canvas);
    }
  }

  /**
   * Function: createCanvas
   *
   * Creates a new canvas for drawing this shape. May return null.
   */
  createCanvas(): any {
    let canvas = null;
    if (this.node.ownerSVGElement != null) {
      canvas = this.createSvgCanvas();
    } else if (mxClient.IS_VML) {
      this.updateVmlContainer();
      canvas = this.createVmlCanvas();
    }
    if (canvas != null && this.outline) {
      canvas.setStrokeWidth(this.strokewidth);
      canvas.setStrokeColor(this.stroke);
      if (this.isDashed != null) {
        canvas.setDashed(this.isDashed);
      }
      canvas.setStrokeWidth = function () {
      };
      canvas.setStrokeColor = function () {
      };
      canvas.setFillColor = function () {
      };
      canvas.setGradient = function () {
      };
      canvas.setDashed = function () {
      };
      canvas.text = function () {
      };
    }
    return canvas;
  }

  /**
   * Function: createSvgCanvas
   *
   * Creates and returns an <mxSvgCanvas2D> for rendering this shape.
   */
  createSvgCanvas(): any {
    const canvas = new mxSvgCanvas2D(this.node, false);
    canvas.strokeTolerance = (this.pointerEvents) ? this.svgStrokeTolerance : 0;
    canvas.pointerEventsValue = this.svgPointerEvents;
    canvas.blockImagePointerEvents = mxClient.IS_FF;
    const off = this.getSvgScreenOffset();
    if (off != 0) {
      this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
    } else {
      this.node.removeAttribute('transform');
    }
    canvas.minStrokeWidth = this.minSvgStrokeWidth;
    if (!this.antiAlias) {
      canvas.format = function (value) {
        return Math.round(parseFloat(value));
      };
    }
    return canvas;
  }

  /**
   * Function: createVmlCanvas
   *
   * Creates and returns an <mxVmlCanvas2D> for rendering this shape.
   */
  createVmlCanvas(): any {
    const node = (document.documentMode == 8 && this.isParseVml()) ? this.createVmlGroup() : this.node;
    const canvas = new mxVmlCanvas2D(node, false);
    if (node.tagUrn != '') {
      const w = Math.max(1, Math.round(this.bounds.width));
      const h = Math.max(1, Math.round(this.bounds.height));
      node.coordsize = (w * this.vmlScale) + ',' + (h * this.vmlScale);
      canvas.scale(this.vmlScale);
      canvas.vmlScale = this.vmlScale;
    }
    const s = this.scale;
    canvas.translate(-Math.round(this.bounds.x / s), -Math.round(this.bounds.y / s));
    return canvas;
  }

  /**
   * Function: updateVmlContainer
   *
   * Updates the bounds of the VML container.
   */
  updateVmlContainer(): void {
    this.node.style.left = Math.round(this.bounds.x) + 'px';
    this.node.style.top = Math.round(this.bounds.y) + 'px';
    const w = Math.max(1, Math.round(this.bounds.width));
    const h = Math.max(1, Math.round(this.bounds.height));
    this.node.style.width = w + 'px';
    this.node.style.height = h + 'px';
    this.node.style.overflow = 'visible';
  }

  /**
   * Function: redrawHtml
   *
   * Allow optimization by replacing VML with HTML.
   */
  redrawHtmlShape(): void {
    this.updateHtmlBounds(this.node);
    this.updateHtmlFilters(this.node);
    this.updateHtmlColors(this.node);
  }

  /**
   * Function: updateHtmlFilters
   *
   * Allow optimization by replacing VML with HTML.
   */
  updateHtmlFilters(node: Node): void {
    let f = '';
    if (this.opacity < 100) {
      f += 'alpha(opacity=' + (this.opacity) + ')';
    }
    if (this.isShadow) {
      f += 'progid:DXImageTransform.Microsoft.dropShadow (' + 'OffX=\'' + Math.round(mxConstants.SHADOW_OFFSET_X * this.scale) + '\', ' + 'OffY=\'' + Math.round(mxConstants.SHADOW_OFFSET_Y * this.scale) + '\', ' + 'Color=\'' + mxConstants.VML_SHADOWCOLOR + '\')';
    }
    if (this.fill != null && this.fill != mxConstants.NONE && this.gradient && this.gradient != mxConstants.NONE) {
      let start = this.fill;
      let end = this.gradient;
      let type = '0';
      const lookup = { east: 0, south: 1, west: 2, north: 3 };
      let dir = (this.direction != null) ? lookup[this.direction] : 0;
      if (this.gradientDirection != null) {
        dir = mxUtils.mod(dir + lookup[this.gradientDirection] - 1, 4);
      }
      if (dir == 1) {
        type = '1';
        const tmp = start;
        start = end;
        end = tmp;
      } else if (dir == 2) {
        const tmp = start;
        start = end;
        end = tmp;
      } else if (dir == 3) {
        type = '1';
      }
      f += 'progid:DXImageTransform.Microsoft.gradient(' + 'startColorStr=\'' + start + '\', endColorStr=\'' + end + '\', gradientType=\'' + type + '\')';
    }
    node.style.filter = f;
  }

  /**
   * Function: mixedModeHtml
   *
   * Allow optimization by replacing VML with HTML.
   */
  updateHtmlColors(node: Node): void {
    let color = this.stroke;
    if (color != null && color != mxConstants.NONE) {
      node.style.borderColor = color;
      if (this.isDashed) {
        node.style.borderStyle = 'dashed';
      } else if (this.strokewidth > 0) {
        node.style.borderStyle = 'solid';
      }
      node.style.borderWidth = Math.max(1, Math.ceil(this.strokewidth * this.scale)) + 'px';
    } else {
      node.style.borderWidth = '0px';
    }
    color = (this.outline) ? null : this.fill;
    if (color != null && color != mxConstants.NONE) {
      node.style.backgroundColor = color;
      node.style.backgroundImage = 'none';
    } else if (this.pointerEvents) {
      node.style.backgroundColor = 'transparent';
    } else if (document.documentMode == 8) {
      mxUtils.addTransparentBackgroundFilter(node);
    } else {
      this.setTransparentBackgroundImage(node);
    }
  }

  /**
   * Function: mixedModeHtml
   *
   * Allow optimization by replacing VML with HTML.
   */
  updateHtmlBounds(node: Node): void {
    let sw = (document.documentMode >= 9) ? 0 : Math.ceil(this.strokewidth * this.scale);
    node.style.borderWidth = Math.max(1, sw) + 'px';
    node.style.overflow = 'hidden';
    node.style.left = Math.round(this.bounds.x - sw / 2) + 'px';
    node.style.top = Math.round(this.bounds.y - sw / 2) + 'px';
    if (document.compatMode == 'CSS1Compat') {
      sw = -sw;
    }
    node.style.width = Math.round(Math.max(0, this.bounds.width + sw)) + 'px';
    node.style.height = Math.round(Math.max(0, this.bounds.height + sw)) + 'px';
  }

  /**
   * Function: destroyCanvas
   *
   * Destroys the given canvas which was used for drawing. This implementation
   * increments the reference counts on all shared gradients used in the canvas.
   */
  destroyCanvas(canvas: any): void {
    if (canvas instanceof mxSvgCanvas2D) {
      for (const key in canvas.gradients) {
        const gradient = canvas.gradients[key];
        if (gradient != null) {
          gradient.mxRefCount = (gradient.mxRefCount || 0) + 1;
        }
      }
      this.releaseSvgGradients(this.oldGradients);
      this.oldGradients = canvas.gradients;
    }
  }

  /**
   * Function: paint
   *
   * Generic rendering code.
   */
  paint(c: any): void {
    let strokeDrawn = false;
    if (c != null && this.outline) {
      const stroke = c.stroke;
      c.stroke = function () {
        strokeDrawn = true;
        stroke.apply(this, arguments);
      };
      const fillAndStroke = c.fillAndStroke;
      c.fillAndStroke = function () {
        strokeDrawn = true;
        fillAndStroke.apply(this, arguments);
      };
    }
    const s = this.scale;
    let x = this.bounds.x / s;
    let y = this.bounds.y / s;
    let w = this.bounds.width / s;
    let h = this.bounds.height / s;
    if (this.isPaintBoundsInverted()) {
      const t = (w - h) / 2;
      x += t;
      y -= t;
      const tmp = w;
      w = h;
      h = tmp;
    }
    this.updateTransform(c, x, y, w, h);
    this.configureCanvas(c, x, y, w, h);
    let bg = null;
    if ((this.stencil == null && this.points == null && this.shapePointerEvents) || (this.stencil != null && this.stencilPointerEvents)) {
      const bb = this.createBoundingBox();
      if (this.dialect == mxConstants.DIALECT_SVG) {
        bg = this.createTransparentSvgRectangle(bb.x, bb.y, bb.width, bb.height);
        this.node.appendChild(bg);
      } else {
        const rect = c.createRect('rect', bb.x / s, bb.y / s, bb.width / s, bb.height / s);
        rect.appendChild(c.createTransparentFill());
        rect.stroked = 'false';
        c.root.appendChild(rect);
      }
    }
    if (this.stencil != null) {
      this.stencil.drawShape(c, this, x, y, w, h);
    } else {
      c.setStrokeWidth(this.strokewidth);
      if (this.points != null) {
        const pts = [];
        for (let i = 0; i < this.points.length; i++) {
          if (this.points[i] != null) {
            pts.push(new mxPoint(this.points[i].x / s, this.points[i].y / s));
          }
        }
        this.paintEdgeShape(c, pts);
      } else {
        this.paintVertexShape(c, x, y, w, h);
      }
    }
    if (bg != null && c.state != null && c.state.transform != null) {
      bg.setAttribute('transform', c.state.transform);
    }
    if (c != null && this.outline && !strokeDrawn) {
      c.rect(x, y, w, h);
      c.stroke();
    }
  }

  /**
   * Function: configureCanvas
   *
   * Sets the state of the canvas for drawing the shape.
   */
  configureCanvas(c: any, x: number, y: number, w: number, h: number): void {
    let dash = null;
    if (this.style != null) {
      dash = this.style['dashPattern'];
    }
    c.setAlpha(this.opacity / 100);
    c.setFillAlpha(this.fillOpacity / 100);
    c.setStrokeAlpha(this.strokeOpacity / 100);
    if (this.isShadow != null) {
      c.setShadow(this.isShadow);
    }
    if (this.isDashed != null) {
      c.setDashed(this.isDashed, (this.style != null) ? mxUtils.getValue(this.style, mxConstants.STYLE_FIX_DASH, false) == 1 : false);
    }
    if (dash != null) {
      c.setDashPattern(dash);
    }
    if (this.fill != null && this.fill != mxConstants.NONE && this.gradient && this.gradient != mxConstants.NONE) {
      const b = this.getGradientBounds(c, x, y, w, h);
      c.setGradient(this.fill, this.gradient, b.x, b.y, b.width, b.height, this.gradientDirection);
    } else {
      c.setFillColor(this.fill);
    }
    c.setStrokeColor(this.stroke);
  }

  /**
   * Function: getGradientBounds
   *
   * Returns the bounding box for the gradient box for this shape.
   */
  getGradientBounds(c: any, x: number, y: number, w: number, h: number): any {
    return new mxRectangle(x, y, w, h);
  }

  /**
   * Function: updateTransform
   *
   * Sets the scale and rotation on the given canvas.
   */
  updateTransform(c: any, x: number, y: number, w: number, h: number): void {
    c.scale(this.scale);
    c.rotate(this.getShapeRotation(), this.flipH, this.flipV, x + w / 2, y + h / 2);
  }

  /**
   * Function: paintVertexShape
   *
   * Paints the vertex shape.
   */
  paintVertexShape(c: any, x: number, y: number, w: number, h: number): void {
    this.paintBackground(c, x, y, w, h);
    if (!this.outline || this.style == null || mxUtils.getValue(this.style, mxConstants.STYLE_BACKGROUND_OUTLINE, 0) == 0) {
      c.setShadow(false);
      this.paintForeground(c, x, y, w, h);
    }
  }

  /**
   * Function: paintBackground
   *
   * Hook for subclassers. This implementation is empty.
   */
  paintBackground(c: any, x: number, y: number, w: number, h: number): void {
  }

  /**
   * Function: paintForeground
   *
   * Hook for subclassers. This implementation is empty.
   */
  paintForeground(c: any, x: number, y: number, w: number, h: number): void {
  }

  /**
   * Function: paintEdgeShape
   *
   * Hook for subclassers. This implementation is empty.
   */
  paintEdgeShape(c: any, pts: any): void {
  }

  /**
   * Function: getArcSize
   *
   * Returns the arc size for the given dimension.
   */
  getArcSize(w: number, h: number): any {
    let r = 0;
    if (mxUtils.getValue(this.style, mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1') {
      r = Math.min(w / 2, Math.min(h / 2, mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2));
    } else {
      const f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
      r = Math.min(w * f, h * f);
    }
    return r;
  }

  /**
   * Function: paintGlassEffect
   *
   * Paints the glass gradient effect.
   */
  paintGlassEffect(c: any, x: number, y: number, w: number, h: number, arc: any): void {
    const sw = Math.ceil(this.strokewidth / 2);
    const size = 0.4;
    c.setGradient('#ffffff', '#ffffff', x, y, w, h * 0.6, 'south', 0.9, 0.1);
    c.begin();
    arc += 2 * sw;
    if (this.isRounded) {
      c.moveTo(x - sw + arc, y - sw);
      c.quadTo(x - sw, y - sw, x - sw, y - sw + arc);
      c.lineTo(x - sw, y + h * size);
      c.quadTo(x + w * 0.5, y + h * 0.7, x + w + sw, y + h * size);
      c.lineTo(x + w + sw, y - sw + arc);
      c.quadTo(x + w + sw, y - sw, x + w + sw - arc, y - sw);
    } else {
      c.moveTo(x - sw, y - sw);
      c.lineTo(x - sw, y + h * size);
      c.quadTo(x + w * 0.5, y + h * 0.7, x + w + sw, y + h * size);
      c.lineTo(x + w + sw, y - sw);
    }
    c.close();
    c.fill();
  }

  /**
   * Function: addPoints
   *
   * Paints the given points with rounded corners.
   */
  addPoints(c: any, pts: any, rounded: any, arcSize: any, close: any, exclude: any, initialMove: any): void {
    if (pts != null && pts.length > 0) {
      initialMove = (initialMove != null) ? initialMove : true;
      const pe = pts[pts.length - 1];
      if (close && rounded) {
        pts = pts.slice();
        const p0 = pts[0];
        const wp = new mxPoint(pe.x + (p0.x - pe.x) / 2, pe.y + (p0.y - pe.y) / 2);
        pts.splice(0, 0, wp);
      }
      let pt = pts[0];
      let i = 1;
      if (initialMove) {
        c.moveTo(pt.x, pt.y);
      } else {
        c.lineTo(pt.x, pt.y);
      }
      while (i < ((close) ? pts.length : pts.length - 1)) {
        let tmp = pts[mxUtils.mod(i, pts.length)];
        let dx = pt.x - tmp.x;
        let dy = pt.y - tmp.y;
        if (rounded && (dx != 0 || dy != 0) && (exclude == null || mxUtils.indexOf(exclude, i - 1) < 0)) {
          let dist = Math.sqrt(dx * dx + dy * dy);
          const nx1 = dx * Math.min(arcSize, dist / 2) / dist;
          const ny1 = dy * Math.min(arcSize, dist / 2) / dist;
          const x1 = tmp.x + nx1;
          const y1 = tmp.y + ny1;
          c.lineTo(x1, y1);
          let next = pts[mxUtils.mod(i + 1, pts.length)];
          while (i < pts.length - 2 && Math.round(next.x - tmp.x) == 0 && Math.round(next.y - tmp.y) == 0) {
            next = pts[mxUtils.mod(i + 2, pts.length)];
            i++;
          }
          dx = next.x - tmp.x;
          dy = next.y - tmp.y;
          dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const nx2 = dx * Math.min(arcSize, dist / 2) / dist;
          const ny2 = dy * Math.min(arcSize, dist / 2) / dist;
          const x2 = tmp.x + nx2;
          const y2 = tmp.y + ny2;
          c.quadTo(tmp.x, tmp.y, x2, y2);
          tmp = new mxPoint(x2, y2);
        } else {
          c.lineTo(tmp.x, tmp.y);
        }
        pt = tmp;
        i++;
      }
      if (close) {
        c.close();
      } else {
        c.lineTo(pe.x, pe.y);
      }
    }
  }

  /**
   * Function: resetStyles
   *
   * Resets all styles.
   */
  resetStyles(): void {
    this.initStyles();
    this.spacing = 0;
    delete this.fill;
    delete this.gradient;
    delete this.gradientDirection;
    delete this.stroke;
    delete this.startSize;
    delete this.endSize;
    delete this.startArrow;
    delete this.endArrow;
    delete this.direction;
    delete this.isShadow;
    delete this.isDashed;
    delete this.isRounded;
    delete this.glass;
  }

  /**
   * Function: apply
   *
   * Applies the style of the given <mxCellState> to the shape. This
   * implementation assigns the following styles to local fields:
   *
   * - <mxConstants.STYLE_FILLCOLOR> => fill
   * - <mxConstants.STYLE_GRADIENTCOLOR> => gradient
   * - <mxConstants.STYLE_GRADIENT_DIRECTION> => gradientDirection
   * - <mxConstants.STYLE_OPACITY> => opacity
   * - <mxConstants.STYLE_FILL_OPACITY> => fillOpacity
   * - <mxConstants.STYLE_STROKE_OPACITY> => strokeOpacity
   * - <mxConstants.STYLE_STROKECOLOR> => stroke
   * - <mxConstants.STYLE_STROKEWIDTH> => strokewidth
   * - <mxConstants.STYLE_SHADOW> => isShadow
   * - <mxConstants.STYLE_DASHED> => isDashed
   * - <mxConstants.STYLE_SPACING> => spacing
   * - <mxConstants.STYLE_STARTSIZE> => startSize
   * - <mxConstants.STYLE_ENDSIZE> => endSize
   * - <mxConstants.STYLE_ROUNDED> => isRounded
   * - <mxConstants.STYLE_STARTARROW> => startArrow
   * - <mxConstants.STYLE_ENDARROW> => endArrow
   * - <mxConstants.STYLE_ROTATION> => rotation
   * - <mxConstants.STYLE_DIRECTION> => direction
   * - <mxConstants.STYLE_GLASS> => glass
   *
   * This keeps a reference to the <style>. If you need to keep a reference to
   * the cell, you can override this method and store a local reference to
   * state.cell or the <mxCellState> itself. If <outline> should be true, make
   * sure to set it before calling this method.
   *
   * Parameters:
   *
   * state - <mxCellState> of the corresponding cell.
   */
  apply(state: any): void {
    this.state = state;
    this.style = state.style;
    if (this.style != null) {
      this.fill = mxUtils.getValue(this.style, mxConstants.STYLE_FILLCOLOR, this.fill);
      this.gradient = mxUtils.getValue(this.style, mxConstants.STYLE_GRADIENTCOLOR, this.gradient);
      this.gradientDirection = mxUtils.getValue(this.style, mxConstants.STYLE_GRADIENT_DIRECTION, this.gradientDirection);
      this.opacity = mxUtils.getValue(this.style, mxConstants.STYLE_OPACITY, this.opacity);
      this.fillOpacity = mxUtils.getValue(this.style, mxConstants.STYLE_FILL_OPACITY, this.fillOpacity);
      this.strokeOpacity = mxUtils.getValue(this.style, mxConstants.STYLE_STROKE_OPACITY, this.strokeOpacity);
      this.stroke = mxUtils.getValue(this.style, mxConstants.STYLE_STROKECOLOR, this.stroke);
      this.strokewidth = mxUtils.getNumber(this.style, mxConstants.STYLE_STROKEWIDTH, this.strokewidth);
      this.spacing = mxUtils.getValue(this.style, mxConstants.STYLE_SPACING, this.spacing);
      this.startSize = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, this.startSize);
      this.endSize = mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, this.endSize);
      this.startArrow = mxUtils.getValue(this.style, mxConstants.STYLE_STARTARROW, this.startArrow);
      this.endArrow = mxUtils.getValue(this.style, mxConstants.STYLE_ENDARROW, this.endArrow);
      this.rotation = mxUtils.getValue(this.style, mxConstants.STYLE_ROTATION, this.rotation);
      this.direction = mxUtils.getValue(this.style, mxConstants.STYLE_DIRECTION, this.direction);
      this.flipH = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPH, 0) == 1;
      this.flipV = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPV, 0) == 1;
      if (this.stencil != null) {
        this.flipH = mxUtils.getValue(this.style, 'stencilFlipH', 0) == 1 || this.flipH;
        this.flipV = mxUtils.getValue(this.style, 'stencilFlipV', 0) == 1 || this.flipV;
      }
      if (this.direction == mxConstants.DIRECTION_NORTH || this.direction == mxConstants.DIRECTION_SOUTH) {
        const tmp = this.flipH;
        this.flipH = this.flipV;
        this.flipV = tmp;
      }
      this.isShadow = mxUtils.getValue(this.style, mxConstants.STYLE_SHADOW, this.isShadow) == 1;
      this.isDashed = mxUtils.getValue(this.style, mxConstants.STYLE_DASHED, this.isDashed) == 1;
      this.isRounded = mxUtils.getValue(this.style, mxConstants.STYLE_ROUNDED, this.isRounded) == 1;
      this.glass = mxUtils.getValue(this.style, mxConstants.STYLE_GLASS, this.glass) == 1;
      if (this.fill == mxConstants.NONE) {
        this.fill = null;
      }
      if (this.gradient == mxConstants.NONE) {
        this.gradient = null;
      }
      if (this.stroke == mxConstants.NONE) {
        this.stroke = null;
      }
    }
  }

  /**
   * Function: setCursor
   *
   * Sets the cursor on the given shape.
   *
   * Parameters:
   *
   * cursor - The cursor to be used.
   */
  setCursor(cursor: any): void {
    if (cursor == null) {
      cursor = '';
    }
    this.cursor = cursor;
    if (this.node != null) {
      this.node.style.cursor = cursor;
    }
  }

  /**
   * Function: getCursor
   *
   * Returns the current cursor.
   */
  getCursor(): any {
    return this.cursor;
  }

  /**
   * Function: isRoundable
   *
   * Hook for subclassers.
   */
  isRoundable(): boolean {
    return false;
  }

  /**
   * Function: updateBoundingBox
   *
   * Updates the <boundingBox> for this shape using <createBoundingBox> and
   * <augmentBoundingBox> and stores the result in <boundingBox>.
   */
  updateBoundingBox(): void {
    if (this.useSvgBoundingBox && this.node != null && this.node.ownerSVGElement != null) {
      try {
        const b = this.node.getBBox();
        if (b.width > 0 && b.height > 0) {
          this.boundingBox = new mxRectangle(b.x, b.y, b.width, b.height);
          this.boundingBox.grow(this.strokewidth * this.scale / 2);
          return;
        }
      } catch (e) {
      }
    }
    if (this.bounds != null) {
      let bbox = this.createBoundingBox();
      if (bbox != null) {
        this.augmentBoundingBox(bbox);
        const rot = this.getShapeRotation();
        if (rot != 0) {
          bbox = mxUtils.getBoundingBox(bbox, rot);
        }
      }
      this.boundingBox = bbox;
    }
  }

  /**
   * Function: createBoundingBox
   *
   * Returns a new rectangle that represents the bounding box of the bare shape
   * with no shadows or strokewidths.
   */
  createBoundingBox(): any {
    const bb = this.bounds.clone();
    if ((this.stencil != null && (this.direction == mxConstants.DIRECTION_NORTH || this.direction == mxConstants.DIRECTION_SOUTH)) || this.isPaintBoundsInverted()) {
      bb.rotate90();
    }
    return bb;
  }

  /**
   * Function: augmentBoundingBox
   *
   * Augments the bounding box with the strokewidth and shadow offsets.
   */
  augmentBoundingBox(bbox: any): void {
    if (this.isShadow) {
      bbox.width += Math.ceil(mxConstants.SHADOW_OFFSET_X * this.scale);
      bbox.height += Math.ceil(mxConstants.SHADOW_OFFSET_Y * this.scale);
    }
    bbox.grow(this.strokewidth * this.scale / 2);
  }

  /**
   * Function: isPaintBoundsInverted
   *
   * Returns true if the bounds should be inverted.
   */
  isPaintBoundsInverted(): boolean {
    return this.stencil == null && (this.direction == mxConstants.DIRECTION_NORTH || this.direction == mxConstants.DIRECTION_SOUTH);
  }

  /**
   * Function: getRotation
   *
   * Returns the rotation from the style.
   */
  getRotation(): any {
    return (this.rotation != null) ? this.rotation : 0;
  }

  /**
   * Function: getTextRotation
   *
   * Returns the rotation for the text label.
   */
  getTextRotation(): any {
    let rot = this.getRotation();
    if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, 1) != 1) {
      rot += mxText.prototype.verticalTextRotation;
    }
    return rot;
  }

  /**
   * Function: getShapeRotation
   *
   * Returns the actual rotation of the shape.
   */
  getShapeRotation(): any {
    let rot = this.getRotation();
    if (this.direction != null) {
      if (this.direction == mxConstants.DIRECTION_NORTH) {
        rot += 270;
      } else if (this.direction == mxConstants.DIRECTION_WEST) {
        rot += 180;
      } else if (this.direction == mxConstants.DIRECTION_SOUTH) {
        rot += 90;
      }
    }
    return rot;
  }

  /**
   * Function: createTransparentSvgRectangle
   *
   * Adds a transparent rectangle that catches all events.
   */
  createTransparentSvgRectangle(x: number, y: number, w: number, h: number): any {
    const rect = document.createElementNS(mxConstants.NS_SVG, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'none');
    rect.setAttribute('pointer-events', 'all');
    return rect;
  }

  /**
   * Function: setTransparentBackgroundImage
   *
   * Sets a transparent background CSS style to catch all events.
   *
   * Paints the line shape.
   */
  setTransparentBackgroundImage(node: Node): void {
    node.style.backgroundImage = 'url(\'' + mxClient.imageBasePath + '/transparent.gif\')';
  }

  /**
   * Function: releaseSvgGradients
   *
   * Paints the line shape.
   */
  releaseSvgGradients(grads: any): void {
    if (grads != null) {
      for (const key in grads) {
        const gradient = grads[key];
        if (gradient != null) {
          gradient.mxRefCount = (gradient.mxRefCount || 0) - 1;
          if (gradient.mxRefCount == 0 && gradient.parentNode != null) {
            gradient.parentNode.removeChild(gradient);
          }
        }
      }
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the shape by removing it from the DOM and releasing the DOM
   * node associated with the shape using <mxEvent.release>.
   */
  destroy(): void {
    if (this.node != null) {
      mxEvent.release(this.node);
      if (this.node.parentNode != null) {
        this.node.parentNode.removeChild(this.node);
      }
      this.node = null;
    }
    this.releaseSvgGradients(this.oldGradients);
    this.oldGradients = null;
  }
}
