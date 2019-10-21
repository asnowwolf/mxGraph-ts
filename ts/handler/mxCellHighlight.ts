/**
 * Class: mxCellHighlight
 *
 * A helper class to highlight cells. Here is an example for a given cell.
 *
 * (code)
 * var highlight = new mxCellHighlight(graph, '#ff0000', 2);
 * highlight.highlight(graph.view.getState(cell)));
 * (end)
 *
 * Constructor: mxCellHighlight
 *
 * Constructs a cell highlight.
 */
import { mxClient } from '../mxClient';
import { mxConstants } from '../util/mxConstants';
import { mxEvent } from '../util/mxEvent';
import { mxRectangle } from '../util/mxRectangle';
import { mxGraph } from '../view/mxGraph';

export class mxCellHighlight {
  constructor(graph: mxGraph, highlightColor: string = mxConstants.DEFAULT_VALID_COLOR, strokeWidth: number = mxConstants.HIGHLIGHT_STROKEWIDTH, dashed: boolean = false) {
    if (!!graph) {
      this.graph = graph;
      this.opacity = mxConstants.HIGHLIGHT_OPACITY;
      this.repaintHandler = () => {
        if (!!this.state) {
          const tmp = this.graph.view.getState(this.state.cell);
          if (!tmp) {
            this.hide();
          } else {
            this.state = tmp;
            this.repaint();
          }
        }
      };
      this.graph.getView().addListener(mxEvent.SCALE, this.repaintHandler);
      this.graph.getView().addListener(mxEvent.TRANSLATE, this.repaintHandler);
      this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.repaintHandler);
      this.graph.getModel().addListener(mxEvent.CHANGE, this.repaintHandler);
      this.resetHandler = () => {
        this.hide();
      };
      this.graph.getView().addListener(mxEvent.DOWN, this.resetHandler);
      this.graph.getView().addListener(mxEvent.UP, this.resetHandler);
    }
  }

  graph: mxGraph;
  highlightColor: string;
  strokeWidth: any;
  dashed: any;
  opacity: any;
  repaintHandler: Function;
  state: any;
  resetHandler: Function;
  /**
   * Variable: keepOnTop
   *
   * Specifies if the highlights should appear on top of everything
   * else in the overlay pane. Default is false.
   */
  keepOnTop: boolean;
  /**
   * Variable: spacing
   *
   * Specifies the spacing between the highlight for vertices and the vertex.
   * Default is 2.
   * @example 2
   */
  spacing: number;
  shape: any;

  /**
   * Function: setHighlightColor
   *
   * Sets the color of the rectangle used to highlight drop targets.
   *
   * Parameters:
   *
   * color - String that represents the new highlight color.
   */
  setHighlightColor(color: string): void {
    this.highlightColor = color;
    if (!!this.shape) {
      this.shape.stroke = color;
    }
  }

  /**
   * Function: drawHighlight
   *
   * Creates and returns the highlight shape for the given state.
   */
  drawHighlight(): void {
    this.shape = this.createShape();
    this.repaint();
    if (!this.keepOnTop && this.shape.node.parentNode.firstChild != this.shape.node) {
      this.shape.node.parentNode.insertBefore(this.shape.node, this.shape.node.parentNode.firstChild);
    }
  }

  /**
   * Function: createShape
   *
   * Creates and returns the highlight shape for the given state.
   */
  createShape(): any {
    const shape = this.graph.cellRenderer.createShape(this.state);
    shape.svgStrokeTolerance = this.graph.tolerance;
    shape.points = this.state.absolutePoints;
    shape.apply(this.state);
    shape.stroke = this.highlightColor;
    shape.opacity = this.opacity;
    shape.isDashed = this.dashed;
    shape.isShadow = false;
    shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    shape.init(this.graph.getView().getOverlayPane());
    mxEvent.redirectMouseEvents(shape.node, this.graph, this.state);
    if (this.graph.dialect != mxConstants.DIALECT_SVG) {
      shape.pointerEvents = false;
    } else {
      shape.svgPointerEvents = 'stroke';
    }
    return shape;
  }

  /**
   * Function: repaint
   *
   * Updates the highlight after a change of the model or view.
   */
  getStrokeWidth(state: any): any {
    return this.strokeWidth;
  }

  /**
   * Function: repaint
   *
   * Updates the highlight after a change of the model or view.
   */
  repaint(): void {
    if (!!this.state && !!this.shape) {
      this.shape.scale = this.state.view.scale;
      if (this.graph.model.isEdge(this.state.cell)) {
        this.shape.strokewidth = this.getStrokeWidth();
        this.shape.points = this.state.absolutePoints;
        this.shape.outline = false;
      } else {
        this.shape.bounds = new mxRectangle(this.state.x - this.spacing, this.state.y - this.spacing, this.state.width + 2 * this.spacing, this.state.height + 2 * this.spacing);
        this.shape.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
        this.shape.strokewidth = this.getStrokeWidth() / this.state.view.scale;
        this.shape.outline = true;
      }
      if (!!this.state.shape) {
        this.shape.setCursor(this.state.shape.getCursor());
      }
      if (mxClient.IS_QUIRKS || document.documentMode == 8) {
        if (this.shape.stroke == 'transparent') {
          this.shape.stroke = 'white';
          this.shape.opacity = 1;
        } else {
          this.shape.opacity = this.opacity;
        }
      }
      this.shape.redraw();
    }
  }

  /**
   * Function: hide
   *
   * Resets the state of the cell marker.
   */
  hide(): void {
    this.highlight(null);
  }

  /**
   * Function: mark
   *
   * Marks the <markedState> and fires a <mark> event.
   */
  highlight(state: any): void {
    if (this.state != state) {
      if (!!this.shape) {
        this.shape.destroy();
        this.shape = undefined;
      }
      this.state = state;
      if (!!this.state) {
        this.drawHighlight();
      }
    }
  }

  /**
   * Function: isHighlightAt
   *
   * Returns true if this highlight is at the given position.
   */
  isHighlightAt(x: number, y: number): boolean {
    let hit = false;
    if (!!this.shape && !!document.elementFromPoint && !mxClient.IS_QUIRKS) {
      let elt = document.elementFromPoint(x, y);
      while (!!elt) {
        if (elt == this.shape.node) {
          hit = true;
          break;
        }
        elt = elt.parentNode;
      }
    }
    return hit;
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.getView().removeListener(this.resetHandler);
    this.graph.getView().removeListener(this.repaintHandler);
    this.graph.getModel().removeListener(this.repaintHandler);
    if (!!this.shape) {
      this.shape.destroy();
      this.shape = undefined;
    }
  }
}
