/**
 * Class: mxParallelEdgeLayout
 *
 * Extends <mxGraphLayout> for arranging parallel edges. This layout works
 * on edges for all pairs of vertices where there is more than one edge
 * connecting the latter.
 *
 * Example:
 *
 * (code)
 * var layout = new mxParallelEdgeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * To run the layout for the parallel edges of a changed edge only, the
 * following code can be used.
 *
 * (code)
 * var layout = new mxParallelEdgeLayout(graph);
 *
 * graph.addListener(mxEvent.CELL_CONNECTED, function(sender, evt)
 * {
 *   var model = graph.getModel();
 *   var edge = evt.getProperty('edge');
 *   var src = model.getTerminal(edge, true);
 *   var trg = model.getTerminal(edge, false);
 *
 *   layout.isEdgeIgnored = function(edge2)
 *   {
 *     var src2 = model.getTerminal(edge2, true);
 *     var trg2 = model.getTerminal(edge2, false);
 *
 *     return !(model.isEdge(edge2) && ((src == src2 && trg == trg2) || (src == trg2 && trg == src2)));
 *   };
 *
 *   layout.execute(graph.getDefaultParent());
 * });
 * (end)
 *
 * Constructor: mxCompactTreeLayout
 *
 * Constructs a new fast organic layout for the specified graph.
 */
import { mxObjectIdentity } from '../util/mxObjectIdentity';
import { mxPoint } from '../util/mxPoint';
import { mxGraphLayout } from './mxGraphLayout';

export class mxParallelEdgeLayout extends mxGraphLayout {
  constructor(graph: mxGraph) {
    super(graph);
  }

  /**
   * Variable: spacing
   *
   * Defines the spacing between the parallels. Default is 20.
   * @example 20
   */
  spacing: number = 20;

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   */
  execute(parent: any): void {
    const lookup = this.findParallels(parent);
    this.graph.model.beginUpdate();
    try {
      for (const i in lookup) {
        const parallels = lookup[i];
        if (parallels.length > 1) {
          this.layout(parallels);
        }
      }
    } finally {
      this.graph.model.endUpdate();
    }
  }

  /**
   * Function: findParallels
   *
   * Finds the parallel edges in the given parent.
   */
  findParallels(parent: any): any {
    const model = this.graph.getModel();
    const lookup = [];
    const childCount = model.getChildCount(parent);
    for (let i = 0; i < childCount; i++) {
      const child = model.getChildAt(parent, i);
      if (!this.isEdgeIgnored(child)) {
        const id = this.getEdgeId(child);
        if (!!id) {
          if (!lookup[id]) {
            lookup[id] = [];
          }
          lookup[id].push(child);
        }
      }
    }
    return lookup;
  }

  /**
   * Function: getEdgeId
   *
   * Returns a unique ID for the given edge. The id is independent of the
   * edge direction and is built using the visible terminal of the given
   * edge.
   */
  getEdgeId(edge: any): any {
    const view = this.graph.getView();
    let src = view.getVisibleTerminal(edge, true);
    let trg = view.getVisibleTerminal(edge, false);
    if (!!src && !!trg) {
      src = mxObjectIdentity.get(src);
      trg = mxObjectIdentity.get(trg);
      return (src > trg) ? trg + '-' + src : src + '-' + trg;
    }
    return null;
  }

  /**
   * Function: layout
   *
   * Lays out the parallel edges in the given array.
   */
  layout(parallels: any): void {
    const edge = parallels[0];
    const view = this.graph.getView();
    const model = this.graph.getModel();
    const src = model.getGeometry(view.getVisibleTerminal(edge, true));
    const trg = model.getGeometry(view.getVisibleTerminal(edge, false));
    if (src == trg) {
      let x0 = src.x + src.width + this.spacing;
      const y0 = src.y + src.height / 2;
      for (let i = 0; i < parallels.length; i++) {
        this.route(parallels[i], x0, y0);
        x0 += this.spacing;
      }
    } else if (!!src && !!trg) {
      const scx = src.x + src.width / 2;
      const scy = src.y + src.height / 2;
      const tcx = trg.x + trg.width / 2;
      const tcy = trg.y + trg.height / 2;
      const dx = tcx - scx;
      const dy = tcy - scy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        let x0 = scx + dx / 2;
        let y0 = scy + dy / 2;
        const nx = dy * this.spacing / len;
        const ny = dx * this.spacing / len;
        x0 += nx * (parallels.length - 1) / 2;
        y0 -= ny * (parallels.length - 1) / 2;
        for (let i = 0; i < parallels.length; i++) {
          this.route(parallels[i], x0, y0);
          x0 -= nx;
          y0 += ny;
        }
      }
    }
  }

  /**
   * Function: route
   *
   * Routes the given edge via the given point.
   */
  route(edge: any, x: number, y: number): void {
    if (this.graph.isCellMovable(edge)) {
      this.setEdgePoints(edge, [new mxPoint(x, y)]);
    }
  }
}
