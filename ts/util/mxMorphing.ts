/**
 * Class: mxMorphing
 *
 * Implements animation for morphing cells. Here is an example of
 * using this class for animating the result of a layout algorithm:
 *
 * (code)
 * graph.getModel().beginUpdate();
 * try
 * {
 *   var circleLayout = new mxCircleLayout(graph);
 *   circleLayout.execute(graph.getDefaultParent());
 * }
 * finally
 * {
 *   var morph = new mxMorphing(graph);
 *   morph.addListener(mxEvent.DONE, function()
 *   {
 *     graph.getModel().endUpdate();
 *   });
 *
 *   morph.startAnimation();
 * }
 * (end)
 *
 * Constructor: mxMorphing
 *
 * Constructs an animation.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 * steps - Optional number of steps in the morphing animation. Default is 6.
 * ease - Optional easing constant for the animation. Default is 1.5.
 * delay - Optional delay between the animation steps. Passed to <mxAnimation>.
 */
import { mxCell } from '../model/mxCell';
import { mxCellStatePreview } from '../view/mxCellStatePreview';
import { mxAnimation } from './mxAnimation';
import { mxPoint } from './mxPoint';

export class mxMorphing extends mxAnimation {
  constructor(graph: mxGraph, steps: any, ease: any, delay: any) {
    super(delay);
    this.graph = graph;
    this.steps = (!!steps) ? steps : 6;
    this.ease = (!!ease) ? ease : 1.5;
  }

  graph: mxGraph;
  steps: any;
  ease: any;
  /**
   * Variable: step
   *
   * Contains the current step.
   */
  step: number;
  /**
   * Variable: cells
   *
   * Optional array of cells to be animated. If this is not specified
   * then all cells are checked and animated if they have been moved
   * in the current transaction.
   */
  cells: mxCell[];

  /**
   * Function: updateAnimation
   *
   * Animation step.
   */
  updateAnimation(): void {
    mxAnimation.prototype.updateAnimation.apply(this, arguments);
    const move = new mxCellStatePreview(this.graph);
    if (!!this.cells) {
      for (let i = 0; i < this.cells.length; i++) {
        this.animateCell(this.cells[i], move, false);
      }
    } else {
      this.animateCell(this.graph.getModel().getRoot(), move, true);
    }
    this.show(move);
    if (move.isEmpty() || this.step++ >= this.steps) {
      this.stopAnimation();
    }
  }

  /**
   * Function: show
   *
   * Shows the changes in the given <mxCellStatePreview>.
   */
  show(move: any): void {
    move.show();
  }

  /**
   * Function: animateCell
   *
   * Animates the given cell state using <mxCellStatePreview.moveState>.
   */
  animateCell(cell: mxCell, move: any, recurse: any): void {
    const state = this.graph.getView().getState(cell);
    let delta = undefined;
    if (!!state) {
      delta = this.getDelta(state);
      if (this.graph.getModel().isVertex(cell) && (delta.x != 0 || delta.y != 0)) {
        const translate = this.graph.view.getTranslate();
        const scale = this.graph.view.getScale();
        delta.x += translate.x * scale;
        delta.y += translate.y * scale;
        move.moveState(state, -delta.x / this.ease, -delta.y / this.ease);
      }
    }
    if (recurse && !this.stopRecursion(state, delta)) {
      const childCount = this.graph.getModel().getChildCount(cell);
      for (let i = 0; i < childCount; i++) {
        this.animateCell(this.graph.getModel().getChildAt(cell, i), move, recurse);
      }
    }
  }

  /**
   * Function: stopRecursion
   *
   * Returns true if the animation should not recursively find more
   * deltas for children if the given parent state has been animated.
   */
  stopRecursion(state: any, delta: any): any {
    return !!delta && (delta.x != 0 || delta.y != 0);
  }

  /**
   * Function: getDelta
   *
   * Returns the vector between the current rendered state and the future
   * location of the state after the display will be updated.
   */
  getDelta(state: any): any {
    const origin = this.getOriginForCell(state.cell);
    const translate = this.graph.getView().getTranslate();
    const scale = this.graph.getView().getScale();
    const x = state.x / scale - translate.x;
    const y = state.y / scale - translate.y;
    return new mxPoint((origin.x - x) * scale, (origin.y - y) * scale);
  }

  /**
   * Function: getOriginForCell
   *
   * Returns the top, left corner of the given cell. TODO: Improve performance
   * by using caching inside this method as the result per cell never changes
   * during the lifecycle of this object.
   */
  getOriginForCell(cell: mxCell): any {
    let result = undefined;
    if (!!cell) {
      const parent = this.graph.getModel().getParent(cell);
      const geo = this.graph.getCellGeometry(cell);
      result = this.getOriginForCell(parent);
      if (!!geo) {
        if (geo.relative) {
          const pgeo = this.graph.getCellGeometry(parent);
          if (!!pgeo) {
            result.x += geo.x * pgeo.width;
            result.y += geo.y * pgeo.height;
          }
        } else {
          result.x += geo.x;
          result.y += geo.y;
        }
      }
    }
    if (!result) {
      const t = this.graph.view.getTranslate();
      result = new mxPoint(-t.x, -t.y);
    }
    return result;
  }
}
