/**
 * Class: mxOutline
 *
 * Implements an outline (aka overview) for a graph. Set <updateOnPan> to true
 * to enable updates while the source graph is panning.
 *
 * Example:
 *
 * (code)
 * var outline = new mxOutline(graph, div);
 * (end)
 *
 * If an outline is used in an <mxWindow> in IE8 standards mode, the following
 * code makes sure that the shadow filter is not inherited and that any
 * transparent elements in the graph do not show the page background, but the
 * background of the graph container.
 *
 * (code)
 * if (document.documentMode == 8)
 * {
 *   container.style.filter = 'progid:DXImageTransform.Microsoft.alpha(opacity=100)';
 * }
 * (end)
 *
 * To move the graph to the top, left corner the following code can be used.
 *
 * (code)
 * var scale = graph.view.scale;
 * var bounds = graph.getGraphBounds();
 * graph.view.setTranslate(-bounds.x / scale, -bounds.y / scale);
 * (end)
 *
 * To toggle the suspended mode, the following can be used.
 *
 * (code)
 * outline.suspended = !outln.suspended;
 * if (!outline.suspended)
 * {
 *   outline.update(true);
 * }
 * (end)
 *
 * Constructor: mxOutline
 *
 * Constructs a new outline for the specified graph inside the given
 * container.
 *
 * Parameters:
 *
 * source - <mxGraph> to create the outline for.
 * container - DOM node that will contain the outline.
 */
import { mxClient } from '../mxClient';
import { mxImageShape } from '../shape/mxImageShape';
import { mxRectangleShape } from '../shape/mxRectangleShape';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxMouseEvent } from '../util/mxMouseEvent';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxGraph } from './mxGraph';

export class mxOutline {
  constructor(source: any, container: HTMLElement) {
    this.source = source;
    if (!!container) {
      this.init(container);
    }
  }

  source: any;
  /**
   * Function: outline
   *
   * Reference to the <mxGraph> that renders the outline.
   */
  outline: any;
  /**
   * Function: graphRenderHint
   *
   * Renderhint to be used for the outline graph. Default is faster.
   */
  graphRenderHint: any = faster;
  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   * @example true
   */
  enabled: boolean = true;
  /**
   * Variable: showViewport
   *
   * Specifies a viewport rectangle should be shown. Default is true.
   * @example true
   */
  showViewport: boolean = true;
  /**
   * Variable: border
   *
   * Border to be added at the bottom and right. Default is 10.
   * @example 10
   */
  border: number = 10;
  /**
   * Variable: enabled
   *
   * Specifies the size of the sizer handler. Default is 8.
   * @example 8
   */
  sizerSize: number = 8;
  /**
   * Variable: labelsVisible
   *
   * Specifies if labels should be visible in the outline. Default is false.
   */
  labelsVisible: boolean = true;
  /**
   * Variable: updateOnPan
   *
   * Specifies if <update> should be called for <mxEvent.PAN> in the source
   * graph. Default is false.
   */
  updateOnPan: boolean = false;
  /**
   * Variable: sizerImage
   *
   * Optional <mxImage> to be used for the sizer. Default is null.
   */
  sizerImage: any = null;
  /**
   * Variable: minScale
   *
   * Minimum scale to be used. Default is 0.001.
   * @example 0.0001
   */
  minScale: number = 0.0001;
  /**
   * Variable: suspended
   *
   * Optional boolean flag to suspend updates. Default is false. This flag will
   * also suspend repaints of the outline. To toggle this switch, use the
   * following code.
   *
   * (code)
   * nav.suspended = !nav.suspended;
   *
   * if (!nav.suspended)
   * {
   *   nav.update(true);
   * }
   * (end)
   */
  suspended: boolean = 0.001;
  /**
   * Variable: forceVmlHandles
   *
   * Specifies if VML should be used to render the handles in this control. This
   * is true for IE8 standards mode and false for all other browsers and modes.
   * This is a workaround for rendering issues of HTML elements over elements
   * with filters in IE 8 standards mode.
   */
  forceVmlHandles: any;
  updateHandler: Function;
  panHandler: Function;
  refreshHandler: Function;
  bounds: mxRectangle;
  selectionBorder: any;
  sizer: any;
  zoom: any;
  startX: any;
  startY: any;
  /**
   * @example true
   */
  active: boolean = true;
  dx0: any;
  dy0: any;
  index: number;
  mxEvent;
  selectionBorder;
  node;
.
  handler;
.
  this;
.
  sizer = this.createSizer();
,
  forceVmlHandles;
);
  this;
.
  sizer;

  /**
   * Function: createGraph
   *
   * Creates the <mxGraph> used in the outline.
   */
  createGraph(container: HTMLElement): any {
    const graph = new mxGraph(container, this.source.getModel(), this.graphRenderHint, this.source.getStylesheet());
    graph.foldingEnabled = false;
    graph.autoScroll = false;
    return graph;
  }

.
  /**
   * Function: init
   *
   * Initializes the outline inside the given container.
   */
  init(container: HTMLElement): void {
    this.outline = this.createGraph(container);
    const outlineGraphModelChanged = this.outline.graphModelChanged;
    this.outline.graphModelChanged = (changes) => {
      if (!this.suspended && !!this.outline) {
        outlineGraphModelChanged.apply(this.outline, arguments);
      }
    };
    if (mxClient.IS_SVG) {
      const node = this.outline.getView().getCanvas().parentNode;
      node.setAttribute('shape-rendering', 'optimizeSpeed');
      node.setAttribute('image-rendering', 'optimizeSpeed');
    }
    this.outline.labelsVisible = this.labelsVisible;
    this.outline.setEnabled(false);
    this.updateHandler = (sender, evt) => {
      if (!this.suspended && !this.active) {
        this.update();
      }
    };
    this.source.getModel().addListener(mxEvent.CHANGE, this.updateHandler);
    this.outline.addMouseListener(this);
    const view = this.source.getView();
    view.addListener(mxEvent.SCALE, this.updateHandler);
    view.addListener(mxEvent.TRANSLATE, this.updateHandler);
    view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.updateHandler);
    view.addListener(mxEvent.DOWN, this.updateHandler);
    view.addListener(mxEvent.UP, this.updateHandler);
    mxEvent.addListener(this.source.container, 'scroll', this.updateHandler);
    this.panHandler = (sender) => {
      if (this.updateOnPan) {
        this.updateHandler.apply(this, arguments);
      }
    };
    this.source.addListener(mxEvent.PAN, this.panHandler);
    this.refreshHandler = (sender) => {
      this.outline.setStylesheet(this.source.getStylesheet());
      this.outline.refresh();
    };
    this.source.addListener(mxEvent.REFRESH, this.refreshHandler);
    this.bounds = new mxRectangle(0, 0, 0, 0);
    this.selectionBorder = new mxRectangleShape(this.bounds, null, mxConstants.OUTLINE_COLOR, mxConstants.OUTLINE_STROKEWIDTH);
    this.selectionBorder.dialect = this.outline.dialect;
    if (this.forceVmlHandles) {
      this.selectionBorder.isHtmlAllowed = function () {
        return false;
      };
    }
    this.selectionBorder.init(this.outline.getView().getOverlayPane());
    const handler = (evt) => {
      const t = mxEvent.getSource(evt);
      const redirect = mxUtils.bind(this, function (evt) {
        this.outline.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
      };
      const redirect2 = (evt) => {
        mxEvent.removeGestureListeners(t, null, redirect, redirect2);
        this.outline.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
      };
      mxEvent.addGestureListeners(t, null, redirect, redirect2);
      this.outline.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
    };
  )
  ;

) {

  addGestureListeners(this

.

  if(this

.
  isHtmlAllowed = function () {
        return false;
      };
    }
    this.sizer.init(this.outline.getView().getOverlayPane());
    if (this.enabled) {
      this.sizer.node.style.cursor = 'nwse-resize';
    }
    mxEvent.addGestureListeners(this.sizer.node, handler);
    this.selectionBorder.node.style.display = (this.showViewport) ? '' : 'none';
    this.sizer.node.style.display = this.selectionBorder.node.style.display;
    this.selectionBorder.node.style.cursor = 'move';
    this.update(false);
  }

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled();
:
boolean;
{
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   *
   * Parameters:
   *
   * value - Boolean that specifies the new enabled state.
   */
  setEnabled(value;
:
any;
):
void {
    this.enabled = value;
  }

  /**
   * Function: setZoomEnabled
   *
   * Enables or disables the zoom handling by showing or hiding the respective
   * handle.
   *
   * Parameters:
   *
   * value - Boolean that specifies the new enabled state.
   */
  setZoomEnabled(value;
:
any;
):
void {
    this.sizer.node.style.visibility = (value) ? 'visible' : 'hidden';
  }

  /**
   * Function: refresh
   *
   * Invokes <update> and revalidate the outline. This method is deprecated.
   */
  refresh();
:
void {
    this.update(true);
  }

  /**
   * Function: createSizer
   *
   * Creates the shape used as the sizer.
   */
  createSizer();
:
any;
{
    if (!!this.sizerImage) {
      const sizer = new mxImageShape(new mxRectangle(0, 0, this.sizerImage.width, this.sizerImage.height), this.sizerImage.src);
      sizer.dialect = this.outline.dialect;
      return sizer;
    } else {
      const sizer = new mxRectangleShape(new mxRectangle(0, 0, this.sizerSize, this.sizerSize), mxConstants.OUTLINE_HANDLE_FILLCOLOR, mxConstants.OUTLINE_HANDLE_STROKECOLOR);
      sizer.dialect = this.outline.dialect;
      return sizer;
    }
  }

  /**
   * Function: getSourceContainerSize
   *
   * Returns the size of the source container.
   */
  getSourceContainerSize();
:
any;
{
    return new mxRectangle(0, 0, this.source.container.scrollWidth, this.source.container.scrollHeight);
  }

  /**
   * Function: getOutlineOffset
   *
   * Returns the offset for drawing the outline graph.
   */
  getOutlineOffset(scale;
:
any;
):
any;
{
    return null;
  }

  /**
   * Function: getOutlineOffset
   *
   * Returns the offset for drawing the outline graph.
   */
  getSourceGraphBounds();
:
any;
{
    return this.source.getGraphBounds();
  }

  /**
   * Function: update
   *
   * Updates the outline.
   */
  update(revalidate;
:
any;
):
void {
  if(!!;
this.source && !!this.source.container && !!this.outline && !!this.outline.container;
)
{
      const sourceScale = this.source.view.scale;
      const scaledGraphBounds = this.getSourceGraphBounds();
      const unscaledGraphBounds = new mxRectangle(scaledGraphBounds.x / sourceScale + this.source.panDx, scaledGraphBounds.y / sourceScale + this.source.panDy, scaledGraphBounds.width / sourceScale, scaledGraphBounds.height / sourceScale);
      const unscaledFinderBounds = new mxRectangle(0, 0, this.source.container.clientWidth / sourceScale, this.source.container.clientHeight / sourceScale);
      const union = unscaledGraphBounds.clone();
      union.add(unscaledFinderBounds);
      const size = this.getSourceContainerSize();
      const completeWidth = Math.max(size.width / sourceScale, union.width);
      const completeHeight = Math.max(size.height / sourceScale, union.height);
      const availableWidth = Math.max(0, this.outline.container.clientWidth - this.border);
      const availableHeight = Math.max(0, this.outline.container.clientHeight - this.border);
      const outlineScale = Math.min(availableWidth / completeWidth, availableHeight / completeHeight);
      let scale = (isNaN(outlineScale)) ? this.minScale : Math.max(this.minScale, outlineScale);
      if (scale > 0) {
        if (this.outline.getView().scale != scale) {
          this.outline.getView().scale = scale;
          revalidate = true;
        }
        const navView = this.outline.getView();
        if (navView.currentRoot != this.source.getView().currentRoot) {
          navView.setCurrentRoot(this.source.getView().currentRoot);
        }
        const t = this.source.view.translate;
        let tx = t.x + this.source.panDx;
        let ty = t.y + this.source.panDy;
        const off = this.getOutlineOffset(scale);
        if (!!off) {
          tx += off.x;
          ty += off.y;
        }
        if (unscaledGraphBounds.x < 0) {
          tx = tx - unscaledGraphBounds.x;
        }
        if (unscaledGraphBounds.y < 0) {
          ty = ty - unscaledGraphBounds.y;
        }
        if (navView.translate.x != tx || navView.translate.y != ty) {
          navView.translate.x = tx;
          navView.translate.y = ty;
          revalidate = true;
        }
        const t2 = navView.translate;
        scale = this.source.getView().scale;
        const scale2 = scale / navView.scale;
        const scale3 = 1 / navView.scale;
        const container = this.source.container;
        this.bounds = new mxRectangle((t2.x - t.x - this.source.panDx) / scale3, (t2.y - t.y - this.source.panDy) / scale3, (container.clientWidth / scale2), (container.clientHeight / scale2));
        this.bounds.x += this.source.container.scrollLeft * navView.scale / scale;
        this.bounds.y += this.source.container.scrollTop * navView.scale / scale;
        let b = this.selectionBorder.bounds;
        if (b.x != this.bounds.x || b.y != this.bounds.y || b.width != this.bounds.width || b.height != this.bounds.height) {
          this.selectionBorder.bounds = this.bounds;
          this.selectionBorder.redraw();
        }
        const b = this.sizer.bounds;
        const b2 = new mxRectangle(this.bounds.x + this.bounds.width - b.width / 2, this.bounds.y + this.bounds.height - b.height / 2, b.width, b.height);
        if (b.x != b2.x || b.y != b2.y || b.width != b2.width || b.height != b2.height) {
          this.sizer.bounds = b2;
          if (this.sizer.node.style.visibility != 'hidden') {
            this.sizer.redraw();
          }
        }
        if (revalidate) {
          this.outline.view.revalidate();
        }
      }
    }
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by starting a translation or zoom.
   */
  mouseDown(sender;
:
any, me;
:
any;
):
void {
  if(this.enabled && this.showViewport;
)
{
      const tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.source.tolerance : 0;
      const hit = (this.source.allowHandleBoundsCheck && (mxClient.IS_IE || tol > 0)) ? new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
      this.zoom = me.isSource(this.sizer) || (!!hit && mxUtils.intersects(shape.bounds, hit));
      this.startX = me.getX();
      this.startY = me.getY();
      this.active = true;
      if (this.source.useScrollbarsForPanning && mxUtils.hasScrollbars(this.source.container)) {
        this.dx0 = this.source.container.scrollLeft;
        this.dy0 = this.source.container.scrollTop;
      } else {
        this.dx0 = 0;
        this.dy0 = 0;
      }
    }
    me.consume();
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by previewing the viewrect in <graph> and updating the
   * rectangle that represents the viewrect in the outline.
   */
  mouseMove(sender;
:
any, me;
:
any;
):
void {
  if(this.active;
)
{
      this.selectionBorder.node.style.display = (this.showViewport) ? '' : 'none';
      this.sizer.node.style.display = this.selectionBorder.node.style.display;
      const delta = this.getTranslateForEvent(me);
      let dx = delta.x;
      let dy = delta.y;
      let bounds = undefined;
      if (!this.zoom) {
        const scale = this.outline.getView().scale;
        bounds = new mxRectangle(this.bounds.x + dx, this.bounds.y + dy, this.bounds.width, this.bounds.height);
        this.selectionBorder.bounds = bounds;
        this.selectionBorder.redraw();
        dx /= scale;
        dx *= this.source.getView().scale;
        dy /= scale;
        dy *= this.source.getView().scale;
        this.source.panGraph(-dx - this.dx0, -dy - this.dy0);
      } else {
        const container = this.source.container;
        const viewRatio = container.clientWidth / container.clientHeight;
        dy = dx / viewRatio;
        bounds = new mxRectangle(this.bounds.x, this.bounds.y, Math.max(1, this.bounds.width + dx), Math.max(1, this.bounds.height + dy));
        this.selectionBorder.bounds = bounds;
        this.selectionBorder.redraw();
      }
      const b = this.sizer.bounds;
      this.sizer.bounds = new mxRectangle(bounds.x + bounds.width - b.width / 2, bounds.y + bounds.height - b.height / 2, b.width, b.height);
      if (this.sizer.node.style.visibility != 'hidden') {
        this.sizer.redraw();
      }
      me.consume();
    }
  }

  /**
   * Function: getTranslateForEvent
   *
   * Gets the translate for the given mouse event. Here is an example to limit
   * the outline to stay within positive coordinates:
   *
   * (code)
   * outline.getTranslateForEvent = function(me)
   * {
   *   var pt = new mxPoint(me.getX() - this.startX, me.getY() - this.startY);
   *
   *   if (!this.zoom)
   *   {
   *     var tr = this.source.view.translate;
   *     pt.x = Math.max(tr.x * this.outline.view.scale, pt.x);
   *     pt.y = Math.max(tr.y * this.outline.view.scale, pt.y);
   *   }
   *
   *   return pt;
   * };
   * (end)
   */
  getTranslateForEvent(me;
:
any;
):
any;
{
    return new mxPoint(me.getX() - this.startX, me.getY() - this.startY);
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by applying the translation or zoom to <graph>.
   */
  mouseUp(sender;
:
any, me;
:
any;
):
void {
  if(this.active;
)
{
      const delta = this.getTranslateForEvent(me);
      let dx = delta.x;
      let dy = delta.y;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        if (!this.zoom) {
          if (!this.source.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.source.container)) {
            this.source.panGraph(0, 0);
            dx /= this.outline.getView().scale;
            dy /= this.outline.getView().scale;
            const t = this.source.getView().translate;
            this.source.getView().setTranslate(t.x - dx, t.y - dy);
          }
        } else {
          const w = this.selectionBorder.bounds.width;
          const scale = this.source.getView().scale;
          this.source.zoomTo(Math.max(this.minScale, scale - (dx * scale) / w), false);
        }
        this.update();
        me.consume();
      }
      this.index = undefined;
      this.active = false;
    }
  }

  /**
   * Function: destroy
   *
   * Destroy this outline and removes all listeners from <source>.
   */
  destroy();
:
void {
  if(!!;
this.source;
)
{
      this.source.removeListener(this.panHandler);
      this.source.removeListener(this.refreshHandler);
      this.source.getModel().removeListener(this.updateHandler);
      this.source.getView().removeListener(this.updateHandler);
      mxEvent.removeListener(this.source.container, 'scroll', this.updateHandler);
      this.source = undefined;
    }
    if (!!this.outline) {
      this.outline.removeMouseListener(this);
      this.outline.destroy();
      this.outline = undefined;
    }
    if (!!this.selectionBorder) {
      this.selectionBorder.destroy();
      this.selectionBorder = undefined;
    }
    if (!!this.sizer) {
      this.sizer.destroy();
      this.sizer = undefined;
    }
  }
}
