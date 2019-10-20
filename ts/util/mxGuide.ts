/**
 * Class: mxGuide
 *
 * Implements the alignment of selection cells to other cells in the graph.
 *
 * Constructor: mxGuide
 *
 * Constructs a new guide object.
 */
import { mxPolyline } from '../shape/mxPolyline';
import { mxConstants } from './mxConstants';
import { mxPoint } from './mxPoint';

export class mxGuide {
  constructor(graph: mxGraph, states: any) {
    this.graph = graph;
    this.setStates(states);
  }

  graph: mxGraph;
  /**
   * Variable: states
   *
   * Contains the <mxCellStates> that are used for alignment.
   */
  states: any;
  /**
   * Variable: horizontal
   *
   * Specifies if horizontal guides are enabled. Default is true.
   * @example true
   */
  horizontal: boolean;
  /**
   * Variable: vertical
   *
   * Specifies if vertical guides are enabled. Default is true.
   * @example true
   */
  vertical: boolean;
  /**
   * Variable: vertical
   *
   * Holds the <mxShape> for the horizontal guide.
   */
  guideX: any;
  /**
   * Variable: vertical
   *
   * Holds the <mxShape> for the vertical guide.
   */
  guideY: any;
  /**
   * Variable: rounded
   *
   * Specifies if rounded coordinates should be used. Default is false.
   */
  rounded: boolean;

  /**
   * Function: setStates
   *
   * Sets the <mxCellStates> that should be used for alignment.
   */
  setStates(states: any): void {
    this.states = states;
  }

  /**
   * Function: isEnabledForEvent
   *
   * Returns true if the guide should be enabled for the given native event. This
   * implementation always returns true.
   */
  isEnabledForEvent(evt: Event): boolean {
    return true;
  }

  /**
   * Function: getGuideTolerance
   *
   * Returns the tolerance for the guides. Default value is gridSize / 2.
   */
  getGuideTolerance(): any {
    return this.graph.gridSize / 2;
  }

  /**
   * Function: createGuideShape
   *
   * Returns the mxShape to be used for painting the respective guide. This
   * implementation returns a new, dashed and crisp <mxPolyline> using
   * <mxConstants.GUIDE_COLOR> and <mxConstants.GUIDE_STROKEWIDTH> as the format.
   *
   * Parameters:
   *
   * horizontal - Boolean that specifies which guide should be created.
   */
  createGuideShape(horizontal: any): any {
    const guide = new mxPolyline([], mxConstants.GUIDE_COLOR, mxConstants.GUIDE_STROKEWIDTH);
    guide.isDashed = true;
    return guide;
  }

  /**
   * Function: move
   *
   * Moves the <bounds> by the given <mxPoint> and returnt the snapped point.
   */
  move(bounds: any, delta: any, gridEnabled: any, clone: boolean): any {
    if (this.states != null && (this.horizontal || this.vertical) && bounds != null && delta != null) {
      const trx = this.graph.getView().translate;
      const scale = this.graph.getView().scale;
      let dx = delta.x;
      let dy = delta.y;
      let overrideX = false;
      let stateX = null;
      let valueX = null;
      let overrideY = false;
      let stateY = null;
      let valueY = null;
      const tt = this.getGuideTolerance();
      let ttX = tt;
      let ttY = tt;
      const b = bounds.clone();
      b.x += delta.x;
      b.y += delta.y;
      const left = b.x;
      const right = b.x + b.width;
      const center = b.getCenterX();
      const top = b.y;
      const bottom = b.y + b.height;
      const middle = b.getCenterY();

      function snapX(x, state) {
        x += this.graph.panDx;
        let override = false;
        if (Math.abs(x - center) < ttX) {
          dx = x - bounds.getCenterX();
          ttX = Math.abs(x - center);
          override = true;
        } else if (Math.abs(x - left) < ttX) {
          dx = x - bounds.x;
          ttX = Math.abs(x - left);
          override = true;
        } else if (Math.abs(x - right) < ttX) {
          dx = x - bounds.x - bounds.width;
          ttX = Math.abs(x - right);
          override = true;
        }
        if (override) {
          stateX = state;
          valueX = Math.round(x - this.graph.panDx);
          if (this.guideX == null) {
            this.guideX = this.createGuideShape(true);
            this.guideX.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
            this.guideX.pointerEvents = false;
            this.guideX.init(this.graph.getView().getOverlayPane());
          }
        }
        overrideX = overrideX || override;
      }

      function snapY(y, state) {
        y += this.graph.panDy;
        let override = false;
        if (Math.abs(y - middle) < ttY) {
          dy = y - bounds.getCenterY();
          ttY = Math.abs(y - middle);
          override = true;
        } else if (Math.abs(y - top) < ttY) {
          dy = y - bounds.y;
          ttY = Math.abs(y - top);
          override = true;
        } else if (Math.abs(y - bottom) < ttY) {
          dy = y - bounds.y - bounds.height;
          ttY = Math.abs(y - bottom);
          override = true;
        }
        if (override) {
          stateY = state;
          valueY = Math.round(y - this.graph.panDy);
          if (this.guideY == null) {
            this.guideY = this.createGuideShape(false);
            this.guideY.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
            this.guideY.pointerEvents = false;
            this.guideY.init(this.graph.getView().getOverlayPane());
          }
        }
        overrideY = overrideY || override;
      }

      for (let i = 0; i < this.states.length; i++) {
        const state = this.states[i];
        if (state != null) {
          if (this.horizontal) {
            snapX.call(this, state.getCenterX(), state);
            snapX.call(this, state.x, state);
            snapX.call(this, state.x + state.width, state);
          }
          if (this.vertical) {
            snapY.call(this, state.getCenterY(), state);
            snapY.call(this, state.y, state);
            snapY.call(this, state.y + state.height, state);
          }
        }
      }
      if (gridEnabled) {
        if (!overrideX) {
          const tx = bounds.x - (this.graph.snap(bounds.x / scale - trx.x) + trx.x) * scale;
          dx = this.graph.snap(dx / scale) * scale - tx;
        }
        if (!overrideY) {
          const ty = bounds.y - (this.graph.snap(bounds.y / scale - trx.y) + trx.y) * scale;
          dy = this.graph.snap(dy / scale) * scale - ty;
        }
      }
      const c = this.graph.container;
      if (!overrideX && this.guideX != null) {
        this.guideX.node.style.visibility = 'hidden';
      } else if (this.guideX != null) {
        if (stateX != null && bounds != null) {
          minY = Math.min(bounds.y + dy - this.graph.panDy, stateX.y);
          maxY = Math.max(bounds.y + bounds.height + dy - this.graph.panDy, stateX.y + stateX.height);
        }
        if (minY != null && maxY != null) {
          this.guideX.points = [new mxPoint(valueX, minY), new mxPoint(valueX, maxY)];
        } else {
          this.guideX.points = [new mxPoint(valueX, -this.graph.panDy), new mxPoint(valueX, c.scrollHeight - 3 - this.graph.panDy)];
        }
        this.guideX.stroke = this.getGuideColor(stateX, true);
        this.guideX.node.style.visibility = 'visible';
        this.guideX.redraw();
      }
      if (!overrideY && this.guideY != null) {
        this.guideY.node.style.visibility = 'hidden';
      } else if (this.guideY != null) {
        if (stateY != null && bounds != null) {
          minX = Math.min(bounds.x + dx - this.graph.panDx, stateY.x);
          maxX = Math.max(bounds.x + bounds.width + dx - this.graph.panDx, stateY.x + stateY.width);
        }
        if (minX != null && maxX != null) {
          this.guideY.points = [new mxPoint(minX, valueY), new mxPoint(maxX, valueY)];
        } else {
          this.guideY.points = [new mxPoint(-this.graph.panDx, valueY), new mxPoint(c.scrollWidth - 3 - this.graph.panDx, valueY)];
        }
        this.guideY.stroke = this.getGuideColor(stateY, false);
        this.guideY.node.style.visibility = 'visible';
        this.guideY.redraw();
      }
      delta = this.getDelta(bounds, stateX, dx, stateY, dy);
    }
    return delta;
  }

  /**
   * Function: hide
   *
   * Hides all current guides.
   */
  getDelta(bounds: any, stateX: any, dx: number, stateY: any, dy: number): any {
    if (this.rounded || (stateX != null && stateX.cell == null)) {
      dx = Math.floor(bounds.x + dx) - bounds.x;
    }
    if (this.rounded || (stateY != null && stateY.cell == null)) {
      dy = Math.floor(bounds.y + dy) - bounds.y;
    }
    return new mxPoint(dx, dy);
  }

  /**
   * Function: hide
   *
   * Hides all current guides.
   */
  getGuideColor(state: any, horizontal: any): string {
    return mxConstants.GUIDE_COLOR;
  }

  /**
   * Function: hide
   *
   * Hides all current guides.
   */
  hide(): void {
    this.setVisible(false);
  }

  /**
   * Function: setVisible
   *
   * Shows or hides the current guides.
   */
  setVisible(visible: any): void {
    if (this.guideX != null) {
      this.guideX.node.style.visibility = (visible) ? 'visible' : 'hidden';
    }
    if (this.guideY != null) {
      this.guideY.node.style.visibility = (visible) ? 'visible' : 'hidden';
    }
  }

  /**
   * Function: destroy
   *
   * Destroys all resources that this object uses.
   */
  destroy(): void {
    if (this.guideX != null) {
      this.guideX.destroy();
      this.guideX = null;
    }
    if (this.guideY != null) {
      this.guideY.destroy();
      this.guideY = null;
    }
  }
}
