import { mxConstants } from './mxConstants';
import { mxPoint } from './mxPoint';
import { mxUrlConverter } from './mxUrlConverter';
import { mxUtils } from './mxUtils';

export let dx;
export let dy;
export let scale;
export let alpha;
export let fillAlpha;
export let strokeAlpha;
export let fillColor;
export let gradientFillAlpha;
export let gradientColor;
export let gradientAlpha;
export let gradientDirection;
export let strokeColor;
export let strokeWidth;
export let dashed;
export let dashPattern;
export let fixDash;
export let lineCap;
export let lineJoin;
export let miterLimit;
export let fontColor;
export let fontBackgroundColor;
export let fontBorderColor;
export let fontSize;
export let fontFamily;
export let fontStyle;
export let shadow;
export let shadowColor;
export let shadowAlpha;
export let shadowDx;
export let shadowDy;
export let rotation;
export let rotationCx;
export let rotationCy;

/**
 * Class: mxAbstractCanvas2D
 *
 * Base class for all canvases. A description of the public API is available in <mxXmlCanvas2D>.
 * All color values of <mxConstants.NONE> will be converted to null in the state.
 *
 * Constructor: mxAbstractCanvas2D
 *
 * Constructs a new abstract canvas.
 */
export class mxAbstractCanvas2D {
  /**
   * Variable: converter
   *
   * Holds the <mxUrlConverter> to convert image URLs.
   */
  converter: any;
  /**
   * Variable: state
   *
   * Holds the current state.
   */
  state: any;
  /**
   * Variable: states
   *
   * Stack of states.
   */
  states: any;
  /**
   * Variable: path
   *
   * Holds the current path as an array.
   */
  path: any;
  /**
   * Variable: rotateHtml
   *
   * Switch for rotation of HTML. Default is false.
   * @example true
   */
  rotateHtml: boolean;
  /**
   * Variable: lastX
   *
   * Holds the last x coordinate.
   */
  lastX: number;
  /**
   * Variable: lastY
   *
   * Holds the last y coordinate.
   */
  lastY: number;
  /**
   * Variable: moveOp
   *
   * Contains the string used for moving in paths. Default is 'M'.
   * @example M
   */
  moveOp: string;
  /**
   * Variable: lineOp
   *
   * Contains the string used for moving in paths. Default is 'L'.
   * @example L
   */
  lineOp: string;
  /**
   * Variable: quadOp
   *
   * Contains the string used for quadratic paths. Default is 'Q'.
   * @example Q
   */
  quadOp: string;
  /**
   * Variable: curveOp
   *
   * Contains the string used for bezier curves. Default is 'C'.
   * @example C
   */
  curveOp: string;
  /**
   * Variable: closeOp
   *
   * Holds the operator for closing curves. Default is 'Z'.
   * @example Z
   */
  closeOp: string;
  /**
   * Variable: pointerEvents
   *
   * Boolean value that specifies if events should be handled. Default is false.
   */
  pointerEvents: boolean;

  /**
   * Function: createUrlConverter
   *
   * Create a new <mxUrlConverter> and returns it.
   */
  createUrlConverter(): any {
    return new mxUrlConverter();
  }

  /**
   * Function: reset
   *
   * Resets the state of this canvas.
   */
  reset(): void {
    this.state = this.createState();
    this.states = [];
  }

  /**
   * Function: createState
   *
   * Creates the state of the this canvas.
   */
  createState(): any {
    return {
      dx: 0,
      dy: 0,
      scale: 1,
      alpha: 1,
      fillAlpha: 1,
      strokeAlpha: 1,
      fillColor: null,
      gradientFillAlpha: 1,
      gradientColor: null,
      gradientAlpha: 1,
      gradientDirection: null,
      strokeColor: null,
      strokeWidth: 1,
      dashed: false,
      dashPattern: '3 3',
      fixDash: false,
      lineCap: 'flat',
      lineJoin: 'miter',
      miterLimit: 10,
      fontColor: '#000000',
      fontBackgroundColor: null,
      fontBorderColor: null,
      fontSize: mxConstants.DEFAULT_FONTSIZE,
      fontFamily: mxConstants.DEFAULT_FONTFAMILY,
      fontStyle: 0,
      shadow: false,
      shadowColor: mxConstants.SHADOWCOLOR,
      shadowAlpha: mxConstants.SHADOW_OPACITY,
      shadowDx: mxConstants.SHADOW_OFFSET_X,
      shadowDy: mxConstants.SHADOW_OFFSET_Y,
      rotation: 0,
      rotationCx: 0,
      rotationCy: 0,
    };
  }

  /**
   * Function: format
   *
   * Rounds all numbers to integers.
   */
  format(value: any): string {
    return Math.round(parseFloat(value));
  }

  /**
   * Function: addOp
   *
   * Adds the given operation to the path.
   */
  addOp(): void {
    if (this.path != null) {
      this.path.push(arguments[0]);
      if (arguments.length > 2) {
        const s = this.state;
        for (let i = 2; i < arguments.length; i += 2) {
          this.lastX = arguments[i - 1];
          this.lastY = arguments[i];
          this.path.push(this.format((this.lastX + s.dx) * s.scale));
          this.path.push(this.format((this.lastY + s.dy) * s.scale));
        }
      }
    }
  }

  /**
   * Function: rotatePoint
   *
   * Rotates the given point and returns the result as an <mxPoint>.
   */
  rotatePoint(x: number, y: number, theta: any, cx: any, cy: any): any {
    const rad = theta * (Math.PI / 180);
    return mxUtils.getRotatedPoint(new mxPoint(x, y), Math.cos(rad), Math.sin(rad), new mxPoint(cx, cy));
  }

  /**
   * Function: save
   *
   * Saves the current state.
   */
  save(): void {
    this.states.push(this.state);
    this.state = mxUtils.clone(this.state);
  }

  /**
   * Function: restore
   *
   * Restores the current state.
   */
  restore(): void {
    if (this.states.length > 0) {
      this.state = this.states.pop();
    }
  }

  /**
   * Function: setLink
   *
   * Sets the current link. Hook for subclassers.
   */
  setLink(link: string): void {
  }

  /**
   * Function: scale
   *
   * Scales the current state.
   */
  scale(value: any): void {
    this.state.scale *= value;
    this.state.strokeWidth *= value;
  }

  /**
   * Function: translate
   *
   * Translates the current state.
   */
  translate(dx: number, dy: number): void {
    this.state.dx += dx;
    this.state.dy += dy;
  }

  /**
   * Function: rotate
   *
   * Rotates the current state.
   */
  rotate(theta: any, flipH: any, flipV: any, cx: any, cy: any): void {
  }

  /**
   * Function: setAlpha
   *
   * Sets the current alpha.
   */
  setAlpha(value: any): void {
    this.state.alpha = value;
  }

  /**
   * Function: setFillAlpha
   *
   * Sets the current solid fill alpha.
   */
  setFillAlpha(value: any): void {
    this.state.fillAlpha = value;
  }

  /**
   * Function: setStrokeAlpha
   *
   * Sets the current stroke alpha.
   */
  setStrokeAlpha(value: any): void {
    this.state.strokeAlpha = value;
  }

  /**
   * Function: setFillColor
   *
   * Sets the current fill color.
   */
  setFillColor(value: any): void {
    if (value == mxConstants.NONE) {
      value = null;
    }
    this.state.fillColor = value;
    this.state.gradientColor = null;
  }

  /**
   * Function: setGradient
   *
   * Sets the current gradient.
   */
  setGradient(color1: any, color2: any, x: number, y: number, w: number, h: number, direction: any, alpha1: any, alpha2: any): void {
    const s = this.state;
    s.fillColor = color1;
    s.gradientFillAlpha = (alpha1 != null) ? alpha1 : 1;
    s.gradientColor = color2;
    s.gradientAlpha = (alpha2 != null) ? alpha2 : 1;
    s.gradientDirection = direction;
  }

  /**
   * Function: setStrokeColor
   *
   * Sets the current stroke color.
   */
  setStrokeColor(value: any): void {
    if (value == mxConstants.NONE) {
      value = null;
    }
    this.state.strokeColor = value;
  }

  /**
   * Function: setStrokeWidth
   *
   * Sets the current stroke width.
   */
  setStrokeWidth(value: any): void {
    this.state.strokeWidth = value;
  }

  /**
   * Function: setDashed
   *
   * Enables or disables dashed lines.
   */
  setDashed(value: any, fixDash: any): void {
    this.state.dashed = value;
    this.state.fixDash = fixDash;
  }

  /**
   * Function: setDashPattern
   *
   * Sets the current dash pattern.
   */
  setDashPattern(value: any): void {
    this.state.dashPattern = value;
  }

  /**
   * Function: setLineCap
   *
   * Sets the current line cap.
   */
  setLineCap(value: any): void {
    this.state.lineCap = value;
  }

  /**
   * Function: setLineJoin
   *
   * Sets the current line join.
   */
  setLineJoin(value: any): void {
    this.state.lineJoin = value;
  }

  /**
   * Function: setMiterLimit
   *
   * Sets the current miter limit.
   */
  setMiterLimit(value: any): void {
    this.state.miterLimit = value;
  }

  /**
   * Function: setFontColor
   *
   * Sets the current font color.
   */
  setFontColor(value: any): void {
    if (value == mxConstants.NONE) {
      value = null;
    }
    this.state.fontColor = value;
  }

  /**
   * Function: setFontColor
   *
   * Sets the current font color.
   */
  setFontBackgroundColor(value: any): void {
    if (value == mxConstants.NONE) {
      value = null;
    }
    this.state.fontBackgroundColor = value;
  }

  /**
   * Function: setFontColor
   *
   * Sets the current font color.
   */
  setFontBorderColor(value: any): void {
    if (value == mxConstants.NONE) {
      value = null;
    }
    this.state.fontBorderColor = value;
  }

  /**
   * Function: setFontSize
   *
   * Sets the current font size.
   */
  setFontSize(value: any): void {
    this.state.fontSize = parseFloat(value);
  }

  /**
   * Function: setFontFamily
   *
   * Sets the current font family.
   */
  setFontFamily(value: any): void {
    this.state.fontFamily = value;
  }

  /**
   * Function: setFontStyle
   *
   * Sets the current font style.
   */
  setFontStyle(value: any): void {
    if (value == null) {
      value = 0;
    }
    this.state.fontStyle = value;
  }

  /**
   * Function: setShadow
   *
   * Enables or disables and configures the current shadow.
   */
  setShadow(enabled: boolean): void {
    this.state.shadow = enabled;
  }

  /**
   * Function: setShadowColor
   *
   * Enables or disables and configures the current shadow.
   */
  setShadowColor(value: any): void {
    if (value == mxConstants.NONE) {
      value = null;
    }
    this.state.shadowColor = value;
  }

  /**
   * Function: setShadowAlpha
   *
   * Enables or disables and configures the current shadow.
   */
  setShadowAlpha(value: any): void {
    this.state.shadowAlpha = value;
  }

  /**
   * Function: setShadowOffset
   *
   * Enables or disables and configures the current shadow.
   */
  setShadowOffset(dx: number, dy: number): void {
    this.state.shadowDx = dx;
    this.state.shadowDy = dy;
  }

  /**
   * Function: begin
   *
   * Starts a new path.
   */
  begin(): void {
    this.lastX = 0;
    this.lastY = 0;
    this.path = [];
  }

  /**
   * Function: moveTo
   *
   *  Moves the current path the given coordinates.
   */
  moveTo(x: number, y: number): void {
    this.addOp(this.moveOp, x, y);
  }

  /**
   * Function: lineTo
   *
   * Draws a line to the given coordinates. Uses moveTo with the op argument.
   */
  lineTo(x: number, y: number): void {
    this.addOp(this.lineOp, x, y);
  }

  /**
   * Function: quadTo
   *
   * Adds a quadratic curve to the current path.
   */
  quadTo(x1: any, y1: any, x2: any, y2: any): void {
    this.addOp(this.quadOp, x1, y1, x2, y2);
  }

  /**
   * Function: curveTo
   *
   * Adds a bezier curve to the current path.
   */
  curveTo(x1: any, y1: any, x2: any, y2: any, x3: any, y3: any): void {
    this.addOp(this.curveOp, x1, y1, x2, y2, x3, y3);
  }

  /**
   * Function: arcTo
   *
   * Adds the given arc to the current path. This is a synthetic operation that
   * is broken down into curves.
   */
  arcTo(rx: any, ry: any, angle: any, largeArcFlag: any, sweepFlag: any, x: number, y: number): void {
    const curves = mxUtils.arcToCurves(this.lastX, this.lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y);
    if (curves != null) {
      for (let i = 0; i < curves.length; i += 6) {
        this.curveTo(curves[i], curves[i + 1], curves[i + 2], curves[i + 3], curves[i + 4], curves[i + 5]);
      }
    }
  }

  /**
   * Function: close
   *
   * Closes the current path.
   */
  close(x1: any, y1: any, x2: any, y2: any, x3: any, y3: any): void {
    this.addOp(this.closeOp);
  }

  /**
   * Function: end
   *
   * Empty implementation for backwards compatibility. This will be removed.
   */
  end(): void {
  }
}
