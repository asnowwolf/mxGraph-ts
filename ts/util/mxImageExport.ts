/**
 * Class: mxImageExport
 *
 * Creates a new image export instance to be used with an export canvas. Here
 * is an example that uses this class to create an image via a backend using
 * <mxXmlExportCanvas>.
 *
 * (code)
 * var xmlDoc = mxUtils.createXmlDocument();
 * var root = xmlDoc.createElement('output');
 * xmlDoc.appendChild(root);
 *
 * var xmlCanvas = new mxXmlCanvas2D(root);
 * var imgExport = new mxImageExport();
 * imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
 *
 * var bounds = graph.getGraphBounds();
 * var w = Math.ceil(bounds.x + bounds.width);
 * var h = Math.ceil(bounds.y + bounds.height);
 *
 * var xml = mxUtils.getXml(root);
 * new mxXmlRequest('export', 'format=png&w=' + w +
 *    '&h=' + h + '&bg=#F9F7ED&xml=' + encodeURIComponent(xml))
 *    .simulate(document, '_blank');
 * (end)
 *
 * Constructor: mxImageExport
 *
 * Constructs a new image export.
 */
import { mxShape } from '../shape/mxShape';
import { mxUtils } from './mxUtils';

export class mxImageExport {
  /**
   * Variable: includeOverlays
   *
   * Specifies if overlays should be included in the export. Default is false.
   */
  includeOverlays: boolean;

  /**
   * Function: drawState
   *
   * Draws the given state and all its descendants to the given canvas.
   */
  drawState(state: any, canvas: any): void {
    if (!!state) {
      this.visitStatesRecursive(state, canvas, mxUtils.bind(this, function () {
        this.drawCellState.apply(this, arguments);
      }));
      if (this.includeOverlays) {
        this.visitStatesRecursive(state, canvas, mxUtils.bind(this, function () {
          this.drawOverlays.apply(this, arguments);
        }));
      }
    }
  }

  /**
   * Function: drawState
   *
   * Draws the given state and all its descendants to the given canvas.
   */
  visitStatesRecursive(state: any, canvas: any, visitor: any): void {
    if (!!state) {
      visitor(state, canvas);
      const graph = state.view.graph;
      const childCount = graph.model.getChildCount(state.cell);
      for (let i = 0; i < childCount; i++) {
        const childState = graph.view.getState(graph.model.getChildAt(state.cell, i));
        this.visitStatesRecursive(childState, canvas, visitor);
      }
    }
  }

  /**
   * Function: getLinkForCellState
   *
   * Returns the link for the given cell state and canvas. This returns null.
   */
  getLinkForCellState(state: any, canvas: any): any {
    return null;
  }

  /**
   * Function: drawCellState
   *
   * Draws the given state to the given canvas.
   */
  drawCellState(state: any, canvas: any): void {
    const link = this.getLinkForCellState(state, canvas);
    if (!!link) {
      canvas.setLink(link);
    }
    this.drawShape(state, canvas);
    this.drawText(state, canvas);
    if (!!link) {
      canvas.setLink(null);
    }
  }

  /**
   * Function: drawShape
   *
   * Draws the shape of the given state.
   */
  drawShape(state: any, canvas: any): void {
    if (state.shape instanceof mxShape && state.shape.checkBounds()) {
      canvas.save();
      state.shape.paint(canvas);
      canvas.restore();
    }
  }

  /**
   * Function: drawText
   *
   * Draws the text of the given state.
   */
  drawText(state: any, canvas: any): void {
    if (!!state.text && state.text.checkBounds()) {
      canvas.save();
      state.text.paint(canvas);
      canvas.restore();
    }
  }

  /**
   * Function: drawOverlays
   *
   * Draws the overlays for the given state. This is called if <includeOverlays>
   * is true.
   */
  drawOverlays(state: any, canvas: any): void {
    if (!!state.overlays) {
      state.overlays.visit(function (id, shape) {
        if (shape instanceof mxShape) {
          shape.paint(canvas);
        }
      });
    }
  }
}
