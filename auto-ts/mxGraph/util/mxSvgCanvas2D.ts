/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxSvgCanvas2D
 *
 * Extends <mxAbstractCanvas2D> to implement a canvas for SVG. This canvas writes all
 * calls as SVG output to the given SVG root node.
 *
 * (code)
 * var svgDoc = mxUtils.createXmlDocument();
 * var root = (svgDoc.createElementNS != null) ?
 *    svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
 *
 * if (svgDoc.createElementNS == null)
 * {
 *   root.setAttribute('xmlns', mxConstants.NS_SVG);
 *   root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
 * }
 * else
 * {
 *   root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
 * }
 *
 * var bounds = graph.getGraphBounds();
 * root.setAttribute('width', (bounds.x + bounds.width + 4) + 'px');
 * root.setAttribute('height', (bounds.y + bounds.height + 4) + 'px');
 * root.setAttribute('version', '1.1');
 *
 * svgDoc.appendChild(root);
 *
 * var svgCanvas = new mxSvgCanvas2D(root);
 * (end)
 *
 * A description of the public API is available in <mxXmlCanvas2D>.
 *
 * To disable anti-aliasing in the output, use the following code.
 *
 * (code)
 * graph.view.canvas.ownerSVGElement.setAttribute('shape-rendering', 'crispEdges');
 * (end)
 *
 * Or set the respective attribute in the SVG element directly.
 *
 * Constructor: mxSvgCanvas2D
 *
 * Constructs a new SVG canvas.
 *
 * Parameters:
 *
 * root - SVG container for the output.
 * styleEnabled - Optional boolean that specifies if a style section should be
 * added. The style section sets the default font-size, font-family and
 * stroke-miterlimit globally. Default is false.
 * @class
 */
export class mxSvgCanvas2D extends mxAbstractCanvas2D {
  /**
   Copyright (c) 2006-2015, JGraph Ltd
   Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   Class: mxSvgCanvas2D

   Extends <mxAbstractCanvas2D> to implement a canvas for SVG. This canvas writes all
   calls as SVG output to the given SVG root node.

   (code)
   var svgDoc = mxUtils.createXmlDocument();
   var root = (svgDoc.createElementNS != null) ?
   svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');

   if (svgDoc.createElementNS == null)
   {
       root.setAttribute('xmlns', mxConstants.NS_SVG);
       root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
    }
   else
   {
       root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
    }

   var bounds = graph.getGraphBounds();
   root.setAttribute('width', (bounds.x + bounds.width + 4) + 'px');
   root.setAttribute('height', (bounds.y + bounds.height + 4) + 'px');
   root.setAttribute('version', '1.1');

   svgDoc.appendChild(root);

   var svgCanvas = new mxSvgCanvas2D(root);
   (end)

   A description of the public API is available in <mxXmlCanvas2D>.

   To disable anti-aliasing in the output, use the following code.

   (code)
   graph.view.canvas.ownerSVGElement.setAttribute('shape-rendering', 'crispEdges');
   (end)

   Or set the respective attribute in the SVG element directly.

   Constructor: mxSvgCanvas2D

   Constructs a new SVG canvas.

   Parameters:

   root - SVG container for the output.
   styleEnabled - Optional boolean that specifies if a style section should be
   added. The style section sets the default font-size, font-family and
   stroke-miterlimit globally. Default is false.
   */
  constructor(root, styleEnabled) {
    super();
    this.root = root;
    this.gradients = [];
    this.defs = null;
    this.styleEnabled = (styleEnabled != null) ? styleEnabled : false;
    var svg = null;
    if (root.ownerDocument != document) {
      var node = root;
      while (node != null && node.nodeName != 'svg') {
        node = node.parentNode;
      }
      svg = node;
    }
    if (svg != null) {
      var tmp = svg.getElementsByTagName('defs');
      if (tmp.length > 0) {
        this.defs = svg.getElementsByTagName('defs')[0];
      }
      if (this.defs == null) {
        this.defs = this.createElement('defs');
        if (svg.firstChild != null) {
          svg.insertBefore(this.defs, svg.firstChild);
        } else {
          svg.appendChild(this.defs);
        }
      }
      if (this.styleEnabled) {
        this.defs.appendChild(this.createStyle());
      }
    }
  }

  /**
   Variable: path

   Holds the current DOM node.
   */
  node = null;
  /**
   Variable: matchHtmlAlignment

   Specifies if plain text output should match the vertical HTML alignment.
   Defaul is true.
   */
  matchHtmlAlignment = true;
  /**
   Variable: textEnabled

   Specifies if text output should be enabled. Default is true.
   */
  textEnabled = true;
  /**
   Variable: foEnabled

   Specifies if use of foreignObject for HTML markup is allowed. Default is true.
   */
  foEnabled = true;
  /**
   Variable: foAltText

   Specifies the fallback text for unsupported foreignObjects in exported
   documents. Default is '[Object]'. If this is set to null then no fallback
   text is added to the exported document.
   */
  foAltText = '[Object]';
  /**
   Variable: foOffset

   Offset to be used for foreignObjects.
   */
  foOffset = 0;
  /**
   Variable: textOffset

   Offset to be used for text elements.
   */
  textOffset = 0;
  /**
   Variable: imageOffset

   Offset to be used for image elements.
   */
  imageOffset = 0;
  /**
   Variable: strokeTolerance

   Adds transparent paths for strokes.
   */
  strokeTolerance = 0;
  /**
   Variable: minStrokeWidth

   Minimum stroke width for output.
   */
  minStrokeWidth = 1;
  /**
   Variable: refCount

   Local counter for references in SVG export.
   */
  refCount = 0;
  /**
   Variable: blockImagePointerEvents

   Specifies if a transparent rectangle should be added on top of images to absorb
   all pointer events. Default is false. This is only needed in Firefox to disable
   control-clicks on images.
   */
  blockImagePointerEvents = false;
  /**
   Variable: lineHeightCorrection

   Correction factor for <mxConstants.LINE_HEIGHT> in HTML output. Default is 1.
   */
  lineHeightCorrection = 1;
  /**
   Variable: pointerEventsValue

   Default value for active pointer events. Default is all.
   */
  pointerEventsValue = 'all';
  /**
   Variable: fontMetricsPadding

   Padding to be added for text that is not wrapped to account for differences
   in font metrics on different platforms in pixels. Default is 10.
   */
  fontMetricsPadding = 10;
  /**
   Variable: cacheOffsetSize

   Specifies if offsetWidth and offsetHeight should be cached. Default is true.
   This is used to speed up repaint of text in <updateText>.
   */
  cacheOffsetSize = true;

  /**
   Function: format

   Rounds all numbers to 2 decimal points.
   */
  format(value) {
    return parseFloat(parseFloat(value).toFixed(2));
  }

  /**
   Function: getBaseUrl

   Returns the URL of the page without the hash part. This needs to use href to
   include any search part with no params (ie question mark alone). This is a
   workaround for the fact that window.location.search is empty if there is
   no search string behind the question mark.
   */
  getBaseUrl() {
    var href = window.location.href;
    var hash = href.lastIndexOf('#');
    if (hash > 0) {
      href = href.substring(0, hash);
    }
    return href;
  }

  /**
   Function: reset

   Returns any offsets for rendering pixels.
   */
  reset() {
    mxAbstractCanvas2D.prototype.reset.apply(this, arguments);
    this.gradients = [];
  }

  /**
   Function: createStyle

   Creates the optional style section.
   */
  createStyle(x) {
    var style = this.createElement('style');
    style.setAttribute('type', 'text/css');
    mxUtils.write(style, 'svg{font-family:' + mxConstants.DEFAULT_FONTFAMILY + ';font-size:' + mxConstants.DEFAULT_FONTSIZE + ';fill:none;stroke-miterlimit:10}');
    return style;
  }

  /**
   Function: createElement

   Private helper function to create SVG elements
   */
  createElement(tagName, namespace) {
    if (this.root.ownerDocument.createElementNS != null) {
      return this.root.ownerDocument.createElementNS(namespace || mxConstants.NS_SVG, tagName);
    } else {
      var elt = this.root.ownerDocument.createElement(tagName);
      if (namespace != null) {
        elt.setAttribute('xmlns', namespace);
      }
      return elt;
    }
  }

  /**
   Function: getAlternateContent

   Returns the alternate content for the given foreignObject.
   */
  createAlternateContent(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation) {
    if (this.foAltText != null) {
      var s = this.state;
      var alt = this.createElement('text');
      alt.setAttribute('x', Math.round(w / 2));
      alt.setAttribute('y', Math.round((h + s.fontSize) / 2));
      alt.setAttribute('fill', s.fontColor || 'black');
      alt.setAttribute('text-anchor', 'middle');
      alt.setAttribute('font-size', s.fontSize + 'px');
      alt.setAttribute('font-family', s.fontFamily);
      if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
        alt.setAttribute('font-weight', 'bold');
      }
      if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
        alt.setAttribute('font-style', 'italic');
      }
      if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
        alt.setAttribute('text-decoration', 'underline');
      }
      mxUtils.write(alt, this.foAltText);
      return alt;
    } else {
      return null;
    }
  }

  /**
   Function: createGradientId

   Private helper function to create SVG elements
   */
  createGradientId(start, end, alpha1, alpha2, direction) {
    if (start.charAt(0) == '#') {
      start = start.substring(1);
    }
    if (end.charAt(0) == '#') {
      end = end.substring(1);
    }
    start = start.toLowerCase() + '-' + alpha1;
    end = end.toLowerCase() + '-' + alpha2;
    var dir = null;
    if (direction == null || direction == mxConstants.DIRECTION_SOUTH) {
      dir = 's';
    } else if (direction == mxConstants.DIRECTION_EAST) {
      dir = 'e';
    } else {
      var tmp = start;
      start = end;
      end = tmp;
      if (direction == mxConstants.DIRECTION_NORTH) {
        dir = 's';
      } else if (direction == mxConstants.DIRECTION_WEST) {
        dir = 'e';
      }
    }
    return 'mx-gradient-' + start + '-' + end + '-' + dir;
  }

  /**
   Function: getSvgGradient

   Private helper function to create SVG elements
   */
  getSvgGradient(start, end, alpha1, alpha2, direction) {
    var id = this.createGradientId(start, end, alpha1, alpha2, direction);
    var gradient = this.gradients[id];
    if (gradient == null) {
      var svg = this.root.ownerSVGElement;
      var counter = 0;
      var tmpId = id + '-' + counter;
      if (svg != null) {
        gradient = svg.ownerDocument.getElementById(tmpId);
        while (gradient != null && gradient.ownerSVGElement != svg) {
          tmpId = id + '-' + counter++;
          gradient = svg.ownerDocument.getElementById(tmpId);
        }
      } else {
        tmpId = 'id' + (++this.refCount);
      }
      if (gradient == null) {
        gradient = this.createSvgGradient(start, end, alpha1, alpha2, direction);
        gradient.setAttribute('id', tmpId);
        if (this.defs != null) {
          this.defs.appendChild(gradient);
        } else {
          svg.appendChild(gradient);
        }
      }
      this.gradients[id] = gradient;
    }
    return gradient.getAttribute('id');
  }

  /**
   Function: createSvgGradient

   Creates the given SVG gradient.
   */
  createSvgGradient(start, end, alpha1, alpha2, direction) {
    var gradient = this.createElement('linearGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '0%');
    if (direction == null || direction == mxConstants.DIRECTION_SOUTH) {
      gradient.setAttribute('y2', '100%');
    } else if (direction == mxConstants.DIRECTION_EAST) {
      gradient.setAttribute('x2', '100%');
    } else if (direction == mxConstants.DIRECTION_NORTH) {
      gradient.setAttribute('y1', '100%');
    } else if (direction == mxConstants.DIRECTION_WEST) {
      gradient.setAttribute('x1', '100%');
    }
    var op = (alpha1 < 1) ? ';stop-opacity:' + alpha1 : '';
    var stop = this.createElement('stop');
    stop.setAttribute('offset', '0%');
    stop.setAttribute('style', 'stop-color:' + start + op);
    gradient.appendChild(stop);
    op = (alpha2 < 1) ? ';stop-opacity:' + alpha2 : '';
    stop = this.createElement('stop');
    stop.setAttribute('offset', '100%');
    stop.setAttribute('style', 'stop-color:' + end + op);
    gradient.appendChild(stop);
    return gradient;
  }

  /**
   Function: addNode

   Private helper function to create SVG elements
   */
  addNode(filled, stroked) {
    var node = this.node;
    var s = this.state;
    if (node != null) {
      if (node.nodeName == 'path') {
        if (this.path != null && this.path.length > 0) {
          node.setAttribute('d', this.path.join(' '));
        } else {
          return;
        }
      }
      if (filled && s.fillColor != null) {
        this.updateFill();
      } else if (!this.styleEnabled) {
        if (node.nodeName == 'ellipse' && mxClient.IS_FF) {
          node.setAttribute('fill', 'transparent');
        } else {
          node.setAttribute('fill', 'none');
        }
        filled = false;
      }
      if (stroked && s.strokeColor != null) {
        this.updateStroke();
      } else if (!this.styleEnabled) {
        node.setAttribute('stroke', 'none');
      }
      if (s.transform != null && s.transform.length > 0) {
        node.setAttribute('transform', s.transform);
      }
      if (s.shadow) {
        this.root.appendChild(this.createShadow(node));
      }
      if (this.strokeTolerance > 0 && !filled) {
        this.root.appendChild(this.createTolerance(node));
      }
      if (this.pointerEvents) {
        node.setAttribute('pointer-events', this.pointerEventsValue);
      } else if (!this.pointerEvents && this.originalRoot == null) {
        node.setAttribute('pointer-events', 'none');
      }
      if ((node.nodeName != 'rect' && node.nodeName != 'path' && node.nodeName != 'ellipse') || (node.getAttribute('fill') != 'none' && node.getAttribute('fill') != 'transparent') || node.getAttribute('stroke') != 'none' || node.getAttribute('pointer-events') != 'none') {
        this.root.appendChild(node);
      }
      this.node = null;
    }
  }

  /**
   Function: updateFill

   Transfers the stroke attributes from <state> to <node>.
   */
  updateFill() {
    var s = this.state;
    if (s.alpha < 1 || s.fillAlpha < 1) {
      this.node.setAttribute('fill-opacity', s.alpha * s.fillAlpha);
    }
    if (s.fillColor != null) {
      if (s.gradientColor != null) {
        var id = this.getSvgGradient(String(s.fillColor), String(s.gradientColor), s.gradientFillAlpha, s.gradientAlpha, s.gradientDirection);
        if (!mxClient.IS_CHROMEAPP && !mxClient.IS_IE && !mxClient.IS_IE11 && !mxClient.IS_EDGE && this.root.ownerDocument == document) {
          var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
          this.node.setAttribute('fill', 'url(' + base + '#' + id + ')');
        } else {
          this.node.setAttribute('fill', 'url(#' + id + ')');
        }
      } else {
        this.node.setAttribute('fill', String(s.fillColor).toLowerCase());
      }
    }
  }

  /**
   Function: getCurrentStrokeWidth

   Returns the current stroke width (>= 1), ie. max(1, this.format(this.state.strokeWidth * this.state.scale)).
   */
  getCurrentStrokeWidth() {
    return Math.max(this.minStrokeWidth, Math.max(0.01, this.format(this.state.strokeWidth * this.state.scale)));
  }

  /**
   Function: updateStroke

   Transfers the stroke attributes from <state> to <node>.
   */
  updateStroke() {
    var s = this.state;
    this.node.setAttribute('stroke', String(s.strokeColor).toLowerCase());
    if (s.alpha < 1 || s.strokeAlpha < 1) {
      this.node.setAttribute('stroke-opacity', s.alpha * s.strokeAlpha);
    }
    var sw = this.getCurrentStrokeWidth();
    if (sw != 1) {
      this.node.setAttribute('stroke-width', sw);
    }
    if (this.node.nodeName == 'path') {
      this.updateStrokeAttributes();
    }
    if (s.dashed) {
      this.node.setAttribute('stroke-dasharray', this.createDashPattern(((s.fixDash) ? 1 : s.strokeWidth) * s.scale));
    }
  }

  /**
   Function: updateStrokeAttributes

   Transfers the stroke attributes from <state> to <node>.
   */
  updateStrokeAttributes() {
    var s = this.state;
    if (s.lineJoin != null && s.lineJoin != 'miter') {
      this.node.setAttribute('stroke-linejoin', s.lineJoin);
    }
    if (s.lineCap != null) {
      var value = s.lineCap;
      if (value == 'flat') {
        value = 'butt';
      }
      if (value != 'butt') {
        this.node.setAttribute('stroke-linecap', value);
      }
    }
    if (s.miterLimit != null && (!this.styleEnabled || s.miterLimit != 10)) {
      this.node.setAttribute('stroke-miterlimit', s.miterLimit);
    }
  }

  /**
   Function: createDashPattern

   Creates the SVG dash pattern for the given state.
   */
  createDashPattern(scale) {
    var pat = [];
    if (typeof (this.state.dashPattern) === 'string') {
      var dash = this.state.dashPattern.split(' ');
      if (dash.length > 0) {
        for (var i = 0; i < dash.length; i++) {
          pat[i] = Number(dash[i]) * scale;
        }
      }
    }
    return pat.join(' ');
  }

  /**
   Function: createTolerance

   Creates a hit detection tolerance shape for the given node.
   */
  createTolerance(node) {
    var tol = node.cloneNode(true);
    var sw = parseFloat(tol.getAttribute('stroke-width') || 1) + this.strokeTolerance;
    tol.setAttribute('pointer-events', 'stroke');
    tol.setAttribute('visibility', 'hidden');
    tol.removeAttribute('stroke-dasharray');
    tol.setAttribute('stroke-width', sw);
    tol.setAttribute('fill', 'none');
    tol.setAttribute('stroke', (mxClient.IS_OT) ? 'none' : 'white');
    return tol;
  }

  /**
   Function: createShadow

   Creates a shadow for the given node.
   */
  createShadow(node) {
    var shadow = node.cloneNode(true);
    var s = this.state;
    if (shadow.getAttribute('fill') != 'none' && (!mxClient.IS_FF || shadow.getAttribute('fill') != 'transparent')) {
      shadow.setAttribute('fill', s.shadowColor);
    }
    if (shadow.getAttribute('stroke') != 'none') {
      shadow.setAttribute('stroke', s.shadowColor);
    }
    shadow.setAttribute('transform', 'translate(' + this.format(s.shadowDx * s.scale) + ',' + this.format(s.shadowDy * s.scale) + ')' + (s.transform || ''));
    shadow.setAttribute('opacity', s.shadowAlpha);
    return shadow;
  }

  /**
   Function: setLink

   Experimental implementation for hyperlinks.
   */
  setLink(link) {
    if (link == null) {
      this.root = this.originalRoot;
    } else {
      this.originalRoot = this.root;
      var node = this.createElement('a');
      if (node.setAttributeNS == null || (this.root.ownerDocument != document && document.documentMode == null)) {
        node.setAttribute('xlink:href', link);
      } else {
        node.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', link);
      }
      this.root.appendChild(node);
      this.root = node;
    }
  }

  /**
   Function: rotate

   Sets the rotation of the canvas. Note that rotation cannot be concatenated.
   */
  rotate(theta, flipH, flipV, cx, cy) {
    if (theta != 0 || flipH || flipV) {
      var s = this.state;
      cx += s.dx;
      cy += s.dy;
      cx *= s.scale;
      cy *= s.scale;
      s.transform = s.transform || '';
      if (flipH && flipV) {
        theta += 180;
      } else if (flipH != flipV) {
        var tx = (flipH) ? cx : 0;
        var sx = (flipH) ? -1 : 1;
        var ty = (flipV) ? cy : 0;
        var sy = (flipV) ? -1 : 1;
        s.transform += 'translate(' + this.format(tx) + ',' + this.format(ty) + ')' + 'scale(' + this.format(sx) + ',' + this.format(sy) + ')' + 'translate(' + this.format(-tx) + ',' + this.format(-ty) + ')';
      }
      if (flipH ? !flipV : flipV) {
        theta *= -1;
      }
      if (theta != 0) {
        s.transform += 'rotate(' + this.format(theta) + ',' + this.format(cx) + ',' + this.format(cy) + ')';
      }
      s.rotation = s.rotation + theta;
      s.rotationCx = cx;
      s.rotationCy = cy;
    }
  }

  /**
   Function: begin

   Extends superclass to create path.
   */
  begin() {
    mxAbstractCanvas2D.prototype.begin.apply(this, arguments);
    this.node = this.createElement('path');
  }

  /**
   Function: rect

   Private helper function to create SVG elements
   */
  rect(x, y, w, h) {
    var s = this.state;
    var n = this.createElement('rect');
    n.setAttribute('x', this.format((x + s.dx) * s.scale));
    n.setAttribute('y', this.format((y + s.dy) * s.scale));
    n.setAttribute('width', this.format(w * s.scale));
    n.setAttribute('height', this.format(h * s.scale));
    this.node = n;
  }

  /**
   Function: roundrect

   Private helper function to create SVG elements
   */
  roundrect(x, y, w, h, dx, dy) {
    this.rect(x, y, w, h);
    if (dx > 0) {
      this.node.setAttribute('rx', this.format(dx * this.state.scale));
    }
    if (dy > 0) {
      this.node.setAttribute('ry', this.format(dy * this.state.scale));
    }
  }

  /**
   Function: ellipse

   Private helper function to create SVG elements
   */
  ellipse(x, y, w, h) {
    var s = this.state;
    var n = this.createElement('ellipse');
    n.setAttribute('cx', this.format((x + w / 2 + s.dx) * s.scale));
    n.setAttribute('cy', this.format((y + h / 2 + s.dy) * s.scale));
    n.setAttribute('rx', w / 2 * s.scale);
    n.setAttribute('ry', h / 2 * s.scale);
    this.node = n;
  }

  /**
   Function: image

   Private helper function to create SVG elements
   */
  image(x, y, w, h, src, aspect, flipH, flipV) {
    src = this.converter.convert(src);
    aspect = (aspect != null) ? aspect : true;
    flipH = (flipH != null) ? flipH : false;
    flipV = (flipV != null) ? flipV : false;
    var s = this.state;
    x += s.dx;
    y += s.dy;
    var node = this.createElement('image');
    node.setAttribute('x', this.format(x * s.scale) + this.imageOffset);
    node.setAttribute('y', this.format(y * s.scale) + this.imageOffset);
    node.setAttribute('width', this.format(w * s.scale));
    node.setAttribute('height', this.format(h * s.scale));
    if (node.setAttributeNS == null) {
      node.setAttribute('xlink:href', src);
    } else {
      node.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', src);
    }
    if (!aspect) {
      node.setAttribute('preserveAspectRatio', 'none');
    }
    if (s.alpha < 1 || s.fillAlpha < 1) {
      node.setAttribute('opacity', s.alpha * s.fillAlpha);
    }
    var tr = this.state.transform || '';
    if (flipH || flipV) {
      var sx = 1;
      var sy = 1;
      var dx = 0;
      var dy = 0;
      if (flipH) {
        sx = -1;
        dx = -w - 2 * x;
      }
      if (flipV) {
        sy = -1;
        dy = -h - 2 * y;
      }
      tr += 'scale(' + sx + ',' + sy + ')translate(' + (dx * s.scale) + ',' + (dy * s.scale) + ')';
    }
    if (tr.length > 0) {
      node.setAttribute('transform', tr);
    }
    if (!this.pointerEvents) {
      node.setAttribute('pointer-events', 'none');
    }
    this.root.appendChild(node);
    if (this.blockImagePointerEvents) {
      node.setAttribute('style', 'pointer-events:none');
      node = this.createElement('rect');
      node.setAttribute('visibility', 'hidden');
      node.setAttribute('pointer-events', 'fill');
      node.setAttribute('x', this.format(x * s.scale));
      node.setAttribute('y', this.format(y * s.scale));
      node.setAttribute('width', this.format(w * s.scale));
      node.setAttribute('height', this.format(h * s.scale));
      this.root.appendChild(node);
    }
  }

  /**
   Function: convertHtml

   Converts the given HTML string to XHTML.
   */
  convertHtml(val) {
    if (this.useDomParser) {
      var doc = new DOMParser().parseFromString(val, 'text/html');
      if (doc != null) {
        val = new XMLSerializer().serializeToString(doc.body);
        if (val.substring(0, 5) == '<body') {
          val = val.substring(val.indexOf('>', 5) + 1);
        }
        if (val.substring(val.length - 7, val.length) == '</body>') {
          val = val.substring(0, val.length - 7);
        }
      }
    } else if (document.implementation != null && document.implementation.createDocument != null) {
      var xd = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
      var xb = xd.createElement('body');
      xd.documentElement.appendChild(xb);
      var div = document.createElement('div');
      div.innerHTML = val;
      var child = div.firstChild;
      while (child != null) {
        var next = child.nextSibling;
        xb.appendChild(xd.adoptNode(child));
        child = next;
      }
      return xb.innerHTML;
    } else {
      var ta = document.createElement('textarea');
      ta.innerHTML = val.replace(/&amp;/g, '&amp;amp;').replace(/&#60;/g, '&amp;lt;').replace(/&#62;/g, '&amp;gt;').replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      val = ta.value.replace(/&/g, '&amp;').replace(/&amp;lt;/g, '&lt;').replace(/&amp;gt;/g, '&gt;').replace(/&amp;amp;/g, '&amp;').replace(/<br>/g, '<br />').replace(/<hr>/g, '<hr />').replace(/(<img[^>]+)>/gm, '$1 />');
    }
    return val;
  }

  /**
   Function: createDiv

   Private helper function to create SVG elements
   */
  createDiv(str, align, valign, style, overflow, whiteSpace) {
    var s = this.state;
    var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (s.fontSize * mxConstants.LINE_HEIGHT) + 'px' : (mxConstants.LINE_HEIGHT * this.lineHeightCorrection);
    style = 'display:inline-block;font-size:' + s.fontSize + 'px;font-family:' + s.fontFamily + ';color:' + s.fontColor + ';line-height:' + lh + ';' + style;
    if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      style += 'font-weight:bold;';
    }
    if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      style += 'font-style:italic;';
    }
    if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      style += 'text-decoration:underline;';
    }
    if (align == mxConstants.ALIGN_CENTER) {
      style += 'text-align:center;';
    } else if (align == mxConstants.ALIGN_RIGHT) {
      style += 'text-align:right;';
    } else {
      style += 'text-align:left;';
    }
    var css = '';
    if (s.fontBackgroundColor != null) {
      css += 'background-color:' + mxUtils.htmlEntities(s.fontBackgroundColor) + ';';
    }
    if (s.fontBorderColor != null) {
      css += 'border:1px solid ' + mxUtils.htmlEntities(s.fontBorderColor) + ';';
    }
    var val = str;
    if (!mxUtils.isNode(val)) {
      val = this.convertHtml(val);
      if (overflow != 'fill' && overflow != 'width') {
        if (whiteSpace != null) {
          css += 'white-space:' + whiteSpace + ';';
        }
        val = '<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;' + css + '">' + val + '</div>';
      } else {
        style += css;
      }
    }
    if (!mxClient.IS_IE && document.createElementNS) {
      var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      div.setAttribute('style', style);
      if (mxUtils.isNode(val)) {
        if (this.root.ownerDocument != document) {
          div.appendChild(val.cloneNode(true));
        } else {
          div.appendChild(val);
        }
      } else {
        div.innerHTML = val;
      }
      return div;
    } else {
      if (mxUtils.isNode(val) && this.root.ownerDocument != document) {
        val = val.outerHTML;
      }
      return mxUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml" style="' + style + '">' + val + '</div>').documentElement;
    }
  }

  /**
   Invalidates the cached offset size for the given node.
   */
  invalidateCachedOffsetSize(node) {
    delete node.firstChild.mxCachedOffsetWidth;
    delete node.firstChild.mxCachedFinalOffsetWidth;
    delete node.firstChild.mxCachedFinalOffsetHeight;
  }

  /**
   Updates existing DOM nodes for text rendering. LATER: Merge common parts with text function below.
   */
  updateText(x, y, w, h, align, valign, wrap, overflow, clip, rotation, node) {
    if (node != null && node.firstChild != null && node.firstChild.firstChild != null && node.firstChild.firstChild.firstChild != null) {
      var group = node.firstChild;
      var fo = group.firstChild;
      var div = fo.firstChild;
      rotation = (rotation != null) ? rotation : 0;
      var s = this.state;
      x += s.dx;
      y += s.dy;
      if (clip) {
        div.style.maxHeight = Math.round(h) + 'px';
        div.style.maxWidth = Math.round(w) + 'px';
      } else if (overflow == 'fill') {
        div.style.width = Math.round(w + 1) + 'px';
        div.style.height = Math.round(h + 1) + 'px';
      } else if (overflow == 'width') {
        div.style.width = Math.round(w + 1) + 'px';
        if (h > 0) {
          div.style.maxHeight = Math.round(h) + 'px';
        }
      }
      if (wrap && w > 0) {
        div.style.width = Math.round(w + 1) + 'px';
      }
      var ow = 0;
      var oh = 0;
      var padX = 0;
      var padY = 2;
      var sizeDiv = div;
      if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV') {
        sizeDiv = sizeDiv.firstChild;
      }
      var tmp = (group.mxCachedOffsetWidth != null) ? group.mxCachedOffsetWidth : sizeDiv.offsetWidth;
      ow = tmp + padX;
      if (wrap && overflow != 'fill') {
        if (clip) {
          ow = Math.min(ow, w);
        }
        div.style.width = Math.round(ow + 1) + 'px';
      }
      ow = (group.mxCachedFinalOffsetWidth != null) ? group.mxCachedFinalOffsetWidth : sizeDiv.offsetWidth;
      oh = (group.mxCachedFinalOffsetHeight != null) ? group.mxCachedFinalOffsetHeight : sizeDiv.offsetHeight;
      if (this.cacheOffsetSize) {
        group.mxCachedOffsetWidth = tmp;
        group.mxCachedFinalOffsetWidth = ow;
        group.mxCachedFinalOffsetHeight = oh;
      }
      ow += padX;
      oh -= 2;
      if (clip) {
        oh = Math.min(oh, h);
        ow = Math.min(ow, w);
      }
      if (overflow == 'width') {
        h = oh;
      } else if (overflow != 'fill') {
        w = ow;
        h = oh;
      }
      var dx = 0;
      var dy = 0;
      if (align == mxConstants.ALIGN_CENTER) {
        dx -= w / 2;
      } else if (align == mxConstants.ALIGN_RIGHT) {
        dx -= w;
      }
      x += dx;
      if (valign == mxConstants.ALIGN_MIDDLE) {
        dy -= h / 2;
      } else if (valign == mxConstants.ALIGN_BOTTOM) {
        dy -= h;
      }
      if (overflow != 'fill' && mxClient.IS_FF && mxClient.IS_WIN) {
        dy -= 2;
      }
      y += dy;
      var tr = (s.scale != 1) ? 'scale(' + s.scale + ')' : '';
      if (s.rotation != 0 && this.rotateHtml) {
        tr += 'rotate(' + (s.rotation) + ',' + (w / 2) + ',' + (h / 2) + ')';
        var pt = this.rotatePoint((x + w / 2) * s.scale, (y + h / 2) * s.scale, s.rotation, s.rotationCx, s.rotationCy);
        x = pt.x - w * s.scale / 2;
        y = pt.y - h * s.scale / 2;
      } else {
        x *= s.scale;
        y *= s.scale;
      }
      if (rotation != 0) {
        tr += 'rotate(' + (rotation) + ',' + (-dx) + ',' + (-dy) + ')';
      }
      group.setAttribute('transform', 'translate(' + Math.round(x) + ',' + Math.round(y) + ')' + tr);
      fo.setAttribute('width', Math.round(Math.max(1, w)));
      fo.setAttribute('height', Math.round(Math.max(1, h)));
    }
  }

  /**
   Function: text

   Paints the given text. Possible values for format are empty string for plain
   text and html for HTML markup. Note that HTML markup is only supported if
   foreignObject is supported and <foEnabled> is true. (This means IE9 and later
   does currently not support HTML text as part of shapes.)
   */
  text(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir) {
    if (this.textEnabled && str != null) {
      rotation = (rotation != null) ? rotation : 0;
      var s = this.state;
      x += s.dx;
      y += s.dy;
      if (this.foEnabled && format == 'html') {
        var style = 'vertical-align:top;';
        if (clip) {
          style += 'overflow:hidden;max-height:' + Math.round(h) + 'px;max-width:' + Math.round(w) + 'px;';
        } else if (overflow == 'fill') {
          style += 'width:' + Math.round(w + 1) + 'px;height:' + Math.round(h + 1) + 'px;overflow:hidden;';
        } else if (overflow == 'width') {
          style += 'width:' + Math.round(w + 1) + 'px;';
          if (h > 0) {
            style += 'max-height:' + Math.round(h) + 'px;overflow:hidden;';
          }
        }
        if (wrap && w > 0) {
          style += 'width:' + Math.round(w + 1) + 'px;white-space:normal;word-wrap:' + mxConstants.WORD_WRAP + ';';
        } else {
          style += 'white-space:nowrap;';
        }
        var group = this.createElement('g');
        if (s.alpha < 1) {
          group.setAttribute('opacity', s.alpha);
        }
        var fo = this.createElement('foreignObject');
        fo.setAttribute('style', 'overflow:visible;');
        fo.setAttribute('pointer-events', 'all');
        var div = this.createDiv(str, align, valign, style, overflow, (wrap && w > 0) ? 'normal' : null);
        if (div == null) {
          return;
        } else if (dir != null) {
          div.setAttribute('dir', dir);
        }
        group.appendChild(fo);
        this.root.appendChild(group);
        var ow = 0;
        var oh = 0;
        var padX = 2;
        var padY = 2;
        if (mxClient.IS_IE && (document.documentMode == 9 || !mxClient.IS_SVG)) {
          var clone = document.createElement('div');
          clone.style.cssText = div.getAttribute('style');
          clone.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
          clone.style.position = 'absolute';
          clone.style.visibility = 'hidden';
          var div2 = document.createElement('div');
          div2.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
          div2.style.wordWrap = mxConstants.WORD_WRAP;
          div2.innerHTML = (mxUtils.isNode(str)) ? str.outerHTML : str;
          clone.appendChild(div2);
          document.body.appendChild(clone);
          if (document.documentMode != 8 && document.documentMode != 9 && s.fontBorderColor != null) {
            padX += 2;
            padY += 2;
          }
          if (wrap && w > 0) {
            var tmp = div2.offsetWidth;
            padDx = 0;
            if (!clip && wrap && w > 0 && this.root.ownerDocument != document && overflow != 'fill') {
              var ws = clone.style.whiteSpace;
              div2.style.whiteSpace = 'nowrap';
              if (tmp < div2.offsetWidth) {
                clone.style.whiteSpace = ws;
              }
            }
            if (clip) {
              tmp = Math.min(tmp, w);
            }
            clone.style.width = tmp + 'px';
            ow = div2.offsetWidth + padX + padDx;
            oh = div2.offsetHeight + padY;
            clone.style.display = 'inline-block';
            clone.style.position = '';
            clone.style.visibility = '';
            clone.style.width = ow + 'px';
            div.setAttribute('style', clone.style.cssText);
          } else {
            ow = div2.offsetWidth + padX;
            oh = div2.offsetHeight + padY;
          }
          clone.parentNode.removeChild(clone);
          fo.appendChild(div);
        } else {
          if (this.root.ownerDocument != document) {
            div.style.visibility = 'hidden';
            document.body.appendChild(div);
          } else {
            fo.appendChild(div);
          }
          var sizeDiv = div;
          if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV') {
            sizeDiv = sizeDiv.firstChild;
            if (wrap && div.style.wordWrap == 'break-word') {
              sizeDiv.style.width = '100%';
            }
          }
          var tmp = sizeDiv.offsetWidth;
          if (tmp == 0 && div.parentNode == fo) {
            div.style.visibility = 'hidden';
            document.body.appendChild(div);
            tmp = sizeDiv.offsetWidth;
          }
          if (this.cacheOffsetSize) {
            group.mxCachedOffsetWidth = tmp;
          }
          if (!clip && wrap && w > 0 && this.root.ownerDocument != document && overflow != 'fill' && overflow != 'width') {
            var ws = div.style.whiteSpace;
            div.style.whiteSpace = 'nowrap';
            if (tmp < sizeDiv.offsetWidth) {
              div.style.whiteSpace = ws;
            }
          }
          ow = tmp + padX - 1;
          if (wrap && overflow != 'fill' && overflow != 'width') {
            if (clip) {
              ow = Math.min(ow, w);
            }
            div.style.width = ow + 'px';
          }
          ow = sizeDiv.offsetWidth;
          oh = sizeDiv.offsetHeight;
          if (this.cacheOffsetSize) {
            group.mxCachedFinalOffsetWidth = ow;
            group.mxCachedFinalOffsetHeight = oh;
          }
          oh -= padY;
          if (div.parentNode != fo) {
            fo.appendChild(div);
            div.style.visibility = '';
          }
        }
        if (clip) {
          oh = Math.min(oh, h);
          ow = Math.min(ow, w);
        }
        if (overflow == 'width') {
          h = oh;
        } else if (overflow != 'fill') {
          w = ow;
          h = oh;
        }
        if (s.alpha < 1) {
          group.setAttribute('opacity', s.alpha);
        }
        var dx = 0;
        var dy = 0;
        if (align == mxConstants.ALIGN_CENTER) {
          dx -= w / 2;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          dx -= w;
        }
        x += dx;
        if (valign == mxConstants.ALIGN_MIDDLE) {
          dy -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          dy -= h;
        }
        if (overflow != 'fill' && mxClient.IS_FF && mxClient.IS_WIN) {
          dy -= 2;
        }
        y += dy;
        var tr = (s.scale != 1) ? 'scale(' + s.scale + ')' : '';
        if (s.rotation != 0 && this.rotateHtml) {
          tr += 'rotate(' + (s.rotation) + ',' + (w / 2) + ',' + (h / 2) + ')';
          var pt = this.rotatePoint((x + w / 2) * s.scale, (y + h / 2) * s.scale, s.rotation, s.rotationCx, s.rotationCy);
          x = pt.x - w * s.scale / 2;
          y = pt.y - h * s.scale / 2;
        } else {
          x *= s.scale;
          y *= s.scale;
        }
        if (rotation != 0) {
          tr += 'rotate(' + (rotation) + ',' + (-dx) + ',' + (-dy) + ')';
        }
        group.setAttribute('transform', 'translate(' + (Math.round(x) + this.foOffset) + ',' + (Math.round(y) + this.foOffset) + ')' + tr);
        fo.setAttribute('width', Math.round(Math.max(1, w)));
        fo.setAttribute('height', Math.round(Math.max(1, h)));
        if (this.root.ownerDocument != document) {
          var alt = this.createAlternateContent(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation);
          if (alt != null) {
            fo.setAttribute('requiredFeatures', 'http://www.w3.org/TR/SVG11/feature#Extensibility');
            var sw = this.createElement('switch');
            sw.appendChild(fo);
            sw.appendChild(alt);
            group.appendChild(sw);
          }
        }
      } else {
        this.plainText(x, y, w, h, str, align, valign, wrap, overflow, clip, rotation, dir);
      }
    }
  }

  /**
   Function: createClip

   Creates a clip for the given coordinates.
   */
  createClip(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    var id = 'mx-clip-' + x + '-' + y + '-' + w + '-' + h;
    var counter = 0;
    var tmp = id + '-' + counter;
    while (document.getElementById(tmp) != null) {
      tmp = id + '-' + (++counter);
    }
    clip = this.createElement('clipPath');
    clip.setAttribute('id', tmp);
    var rect = this.createElement('rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    clip.appendChild(rect);
    return clip;
  }

  /**
   Function: text

   Paints the given text. Possible values for format are empty string for
   plain text and html for HTML markup.
   */
  plainText(x, y, w, h, str, align, valign, wrap, overflow, clip, rotation, dir) {
    rotation = (rotation != null) ? rotation : 0;
    var s = this.state;
    var size = s.fontSize;
    var node = this.createElement('g');
    var tr = s.transform || '';
    this.updateFont(node);
    if (rotation != 0) {
      tr += 'rotate(' + rotation + ',' + this.format(x * s.scale) + ',' + this.format(y * s.scale) + ')';
    }
    if (dir != null) {
      node.setAttribute('direction', dir);
    }
    if (clip && w > 0 && h > 0) {
      var cx = x;
      var cy = y;
      if (align == mxConstants.ALIGN_CENTER) {
        cx -= w / 2;
      } else if (align == mxConstants.ALIGN_RIGHT) {
        cx -= w;
      }
      if (overflow != 'fill') {
        if (valign == mxConstants.ALIGN_MIDDLE) {
          cy -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          cy -= h;
        }
      }
      var c = this.createClip(cx * s.scale - 2, cy * s.scale - 2, w * s.scale + 4, h * s.scale + 4);
      if (this.defs != null) {
        this.defs.appendChild(c);
      } else {
        this.root.appendChild(c);
      }
      if (!mxClient.IS_CHROMEAPP && !mxClient.IS_IE && !mxClient.IS_IE11 && !mxClient.IS_EDGE && this.root.ownerDocument == document) {
        var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
        node.setAttribute('clip-path', 'url(' + base + '#' + c.getAttribute('id') + ')');
      } else {
        node.setAttribute('clip-path', 'url(#' + c.getAttribute('id') + ')');
      }
    }
    var anchor = (align == mxConstants.ALIGN_RIGHT) ? 'end' : (align == mxConstants.ALIGN_CENTER) ? 'middle' : 'start';
    if (anchor != 'start') {
      node.setAttribute('text-anchor', anchor);
    }
    if (!this.styleEnabled || size != mxConstants.DEFAULT_FONTSIZE) {
      node.setAttribute('font-size', (size * s.scale) + 'px');
    }
    if (tr.length > 0) {
      node.setAttribute('transform', tr);
    }
    if (s.alpha < 1) {
      node.setAttribute('opacity', s.alpha);
    }
    var lines = str.split('\n');
    var lh = Math.round(size * mxConstants.LINE_HEIGHT);
    var textHeight = size + (lines.length - 1) * lh;
    var cy = y + size - 1;
    if (valign == mxConstants.ALIGN_MIDDLE) {
      if (overflow == 'fill') {
        cy -= h / 2;
      } else {
        var dy = ((this.matchHtmlAlignment && clip && h > 0) ? Math.min(textHeight, h) : textHeight) / 2;
        cy -= dy + 1;
      }
    } else if (valign == mxConstants.ALIGN_BOTTOM) {
      if (overflow == 'fill') {
        cy -= h;
      } else {
        var dy = (this.matchHtmlAlignment && clip && h > 0) ? Math.min(textHeight, h) : textHeight;
        cy -= dy + 2;
      }
    }
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > 0 && mxUtils.trim(lines[i]).length > 0) {
        var text = this.createElement('text');
        text.setAttribute('x', this.format(x * s.scale) + this.textOffset);
        text.setAttribute('y', this.format(cy * s.scale) + this.textOffset);
        mxUtils.write(text, lines[i]);
        node.appendChild(text);
      }
      cy += lh;
    }
    this.root.appendChild(node);
    this.addTextBackground(node, str, x, y, w, (overflow == 'fill') ? h : textHeight, align, valign, overflow);
  }

  /**
   Function: updateFont

   Updates the text properties for the given node. (NOTE: For this to work in
   IE, the given node must be a text or tspan element.)
   */
  updateFont(node) {
    var s = this.state;
    node.setAttribute('fill', s.fontColor);
    if (!this.styleEnabled || s.fontFamily != mxConstants.DEFAULT_FONTFAMILY) {
      node.setAttribute('font-family', s.fontFamily);
    }
    if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      node.setAttribute('font-weight', 'bold');
    }
    if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      node.setAttribute('font-style', 'italic');
    }
    if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      node.setAttribute('text-decoration', 'underline');
    }
  }

  /**
   Function: addTextBackground

   Background color and border
   */
  addTextBackground(node, str, x, y, w, h, align, valign, overflow) {
    var s = this.state;
    if (s.fontBackgroundColor != null || s.fontBorderColor != null) {
      var bbox = null;
      if (overflow == 'fill' || overflow == 'width') {
        if (align == mxConstants.ALIGN_CENTER) {
          x -= w / 2;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          x -= w;
        }
        if (valign == mxConstants.ALIGN_MIDDLE) {
          y -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          y -= h;
        }
        bbox = new mxRectangle((x + 1) * s.scale, y * s.scale, (w - 2) * s.scale, (h + 2) * s.scale);
      } else if (node.getBBox != null && this.root.ownerDocument == document) {
        try {
          bbox = node.getBBox();
          var ie = mxClient.IS_IE && mxClient.IS_SVG;
          bbox = new mxRectangle(bbox.x, bbox.y + ((ie) ? 0 : 1), bbox.width, bbox.height + ((ie) ? 1 : 0));
        } catch (e) {
        }
      } else {
        var div = document.createElement('div');
        div.style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (s.fontSize * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
        div.style.fontSize = s.fontSize + 'px';
        div.style.fontFamily = s.fontFamily;
        div.style.whiteSpace = 'nowrap';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
        div.style.zoom = '1';
        if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
          div.style.fontWeight = 'bold';
        }
        if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
          div.style.fontStyle = 'italic';
        }
        str = mxUtils.htmlEntities(str, false);
        div.innerHTML = str.replace(/\n/g, '<br/>');
        document.body.appendChild(div);
        var w = div.offsetWidth;
        var h = div.offsetHeight;
        div.parentNode.removeChild(div);
        if (align == mxConstants.ALIGN_CENTER) {
          x -= w / 2;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          x -= w;
        }
        if (valign == mxConstants.ALIGN_MIDDLE) {
          y -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          y -= h;
        }
        bbox = new mxRectangle((x + 1) * s.scale, (y + 2) * s.scale, w * s.scale, (h + 1) * s.scale);
      }
      if (bbox != null) {
        var n = this.createElement('rect');
        n.setAttribute('fill', s.fontBackgroundColor || 'none');
        n.setAttribute('stroke', s.fontBorderColor || 'none');
        n.setAttribute('x', Math.floor(bbox.x - 1));
        n.setAttribute('y', Math.floor(bbox.y - 1));
        n.setAttribute('width', Math.ceil(bbox.width + 2));
        n.setAttribute('height', Math.ceil(bbox.height));
        var sw = (s.fontBorderColor != null) ? Math.max(1, this.format(s.scale)) : 0;
        n.setAttribute('stroke-width', sw);
        if (this.root.ownerDocument == document && mxUtils.mod(sw, 2) == 1) {
          n.setAttribute('transform', 'translate(0.5, 0.5)');
        }
        node.insertBefore(n, node.firstChild);
      }
    }
  }

  /**
   Function: stroke

   Paints the outline of the current path.
   */
  stroke() {
    this.addNode(false, true);
  }

  /**
   Function: fill

   Fills the current path.
   */
  fill() {
    this.addNode(true, false);
  }

  /**
   Function: fillAndStroke

   Fills and paints the outline of the current path.
   */
  fillAndStroke() {
    this.addNode(true, true);
  }
};
;

/**
 * Capability check for DOM parser.
 */
(function () {
  mxSvgCanvas2D.prototype.useDomParser = !mxClient.IS_IE && typeof DOMParser === 'function' && typeof XMLSerializer === 'function';

  if (mxSvgCanvas2D.prototype.useDomParser) {
    // Checks using a generic test text if the parsing actually works. This is a workaround
    // for older browsers where the capability check returns true but the parsing fails.
    try {
      var doc = new DOMParser().parseFromString('test text', 'text/html');
      mxSvgCanvas2D.prototype.useDomParser = doc != null;
    } catch (e) {
      mxSvgCanvas2D.prototype.useDomParser = false;
    }
  }
})();
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
