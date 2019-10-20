/**
 * Class: mxStackLayout
 *
 * Extends <mxGraphLayout> to create a horizontal or vertical stack of the
 * child vertices. The children do not need to be connected for this layout
 * to work.
 *
 * Example:
 *
 * (code)
 * var layout = new mxStackLayout(graph, true);
 * layout.execute(graph.getDefaultParent());
 * (end)
 *
 * Constructor: mxStackLayout
 *
 * Constructs a new stack layout layout for the specified graph,
 * spacing, orientation and offset.
 */
import { mxCell } from '../model/mxCell';
import { mxConstants } from '../util/mxConstants';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxGraphLayout } from './mxGraphLayout';

export class mxStackLayout extends mxGraphLayout {
  constructor(graph: mxGraph, horizontal: any, spacing: any, x0: any, y0: any, border: any) {
    super(graph);
    this.horizontal = (horizontal != null) ? horizontal : true;
    this.spacing = (spacing != null) ? spacing : 0;
    this.x0 = (x0 != null) ? x0 : 0;
    this.y0 = (y0 != null) ? y0 : 0;
    this.border = (border != null) ? border : 0;
  }

  horizontal: any;
  spacing: any;
  x0: any;
  y0: any;
  border: any;
  /**
   * Variable: marginTop
   *
   * Top margin for the child area. Default is 0.
   */
  marginTop: number;
  /**
   * Variable: marginLeft
   *
   * Top margin for the child area. Default is 0.
   */
  marginLeft: number;
  /**
   * Variable: marginRight
   *
   * Top margin for the child area. Default is 0.
   */
  marginRight: number;
  /**
   * Variable: marginBottom
   *
   * Top margin for the child area. Default is 0.
   */
  marginBottom: number;
  /**
   * Variable: keepFirstLocation
   *
   * Boolean indicating if the location of the first cell should be
   * kept, that is, it will not be moved to x0 or y0.
   */
  keepFirstLocation: boolean;
  /**
   * Variable: fill
   *
   * Boolean indicating if dimension should be changed to fill out the parent
   * cell. Default is false.
   */
  fill: boolean;
  /**
   * Variable: resizeParent
   *
   * If the parent should be resized to match the width/height of the
   * stack. Default is false.
   */
  resizeParent: boolean;
  /**
   * Variable: resizeParentMax
   *
   * Use maximum of existing value and new value for resize of parent.
   * Default is false.
   */
  resizeParentMax: boolean;
  /**
   * Variable: resizeLast
   *
   * If the last element should be resized to fill out the parent. Default is
   * false. If <resizeParent> is true then this is ignored.
   */
  resizeLast: boolean;
  /**
   * Variable: wrap
   *
   * Value at which a new column or row should be created. Default is null.
   */
  wrap: any;
  /**
   * Variable: borderCollapse
   *
   * If the strokeWidth should be ignored. Default is true.
   * @example true
   */
  borderCollapse: boolean;
  /**
   * Variable: allowGaps
   *
   * If gaps should be allowed in the stack. Default is false.
   */
  allowGaps: boolean;
  /**
   * Variable: gridSize
   *
   * Grid size for alignment of position and size. Default is 0.
   */
  gridSize: number;

  /**
   * Function: isHorizontal
   *
   * Returns <horizontal>.
   */
  isHorizontal(): boolean {
    return this.horizontal;
  }

  /**
   * Function: moveCell
   *
   * Implements <mxGraphLayout.moveCell>.
   */
  moveCell(cell: mxCell, x: number, y: number): void {
    const model = this.graph.getModel();
    const parent = model.getParent(cell);
    const horizontal = this.isHorizontal();
    if (cell != null && parent != null) {
      let i = 0;
      let last = 0;
      const childCount = model.getChildCount(parent);
      let value = (horizontal) ? x : y;
      const pstate = this.graph.getView().getState(parent);
      if (pstate != null) {
        value -= (horizontal) ? pstate.x : pstate.y;
      }
      value /= this.graph.view.scale;
      for (i = 0; i < childCount; i++) {
        const child = model.getChildAt(parent, i);
        if (child != cell) {
          const bounds = model.getGeometry(child);
          if (bounds != null) {
            const tmp = (horizontal) ? bounds.x + bounds.width / 2 : bounds.y + bounds.height / 2;
            if (last <= value && tmp > value) {
              break;
            }
            last = tmp;
          }
        }
      }
      let idx = parent.getIndex(cell);
      idx = Math.max(0, i - ((i > idx) ? 1 : 0));
      model.add(parent, cell, idx);
    }
  }

  /**
   * Function: getParentSize
   *
   * Returns the size for the parent container or the size of the graph
   * container if the parent is a layer or the root of the model.
   */
  getParentSize(parent: any): any {
    const model = this.graph.getModel();
    let pgeo = model.getGeometry(parent);
    if (this.graph.container != null && ((pgeo == null && model.isLayer(parent)) || parent == this.graph.getView().currentRoot)) {
      const width = this.graph.container.offsetWidth - 1;
      const height = this.graph.container.offsetHeight - 1;
      pgeo = new mxRectangle(0, 0, width, height);
    }
    return pgeo;
  }

  /**
   * Function: getLayoutCells
   *
   * Returns the cells to be layouted.
   */
  getLayoutCells(parent: any): any {
    const model = this.graph.getModel();
    const childCount = model.getChildCount(parent);
    const cells = [];
    for (let i = 0; i < childCount; i++) {
      const child = model.getChildAt(parent, i);
      if (!this.isVertexIgnored(child) && this.isVertexMovable(child)) {
        cells.push(child);
      }
    }
    if (this.allowGaps) {
      cells.sort(mxUtils.bind(this, function (c1, c2) {
        const geo1 = this.graph.getCellGeometry(c1);
        const geo2 = this.graph.getCellGeometry(c2);
        return (geo1.y == geo2.y) ? 0 : ((geo1.y > geo2.y > 0) ? 1 : -1);
      }));
    }
    return cells;
  }

  /**
   * Function: snap
   *
   * Snaps the given value to the grid size.
   */
  snap(value: any): any {
    if (this.gridSize != null && this.gridSize > 0) {
      value = Math.max(value, this.gridSize);
      if (value / this.gridSize > 1) {
        const mod = value % this.gridSize;
        value += mod > this.gridSize / 2 ? (this.gridSize - mod) : -mod;
      }
    }
    return value;
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   *
   * Only children where <isVertexIgnored> returns false are taken into
   * account.
   */
  execute(parent: any): void {
    if (parent != null) {
      const pgeo = this.getParentSize(parent);
      const horizontal = this.isHorizontal();
      const model = this.graph.getModel();
      let fillValue = null;
      if (pgeo != null) {
        fillValue = (horizontal) ? pgeo.height - this.marginTop - this.marginBottom : pgeo.width - this.marginLeft - this.marginRight;
      }
      fillValue -= 2 * this.border;
      let x0 = this.x0 + this.border + this.marginLeft;
      let y0 = this.y0 + this.border + this.marginTop;
      if (this.graph.isSwimlane(parent)) {
        const style = this.graph.getCellStyle(parent);
        let start = mxUtils.getNumber(style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE);
        const horz = mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true) == 1;
        if (pgeo != null) {
          if (horz) {
            start = Math.min(start, pgeo.height);
          } else {
            start = Math.min(start, pgeo.width);
          }
        }
        if (horizontal == horz) {
          fillValue -= start;
        }
        if (horz) {
          y0 += start;
        } else {
          x0 += start;
        }
      }
      model.beginUpdate();
      try {
        let tmp = 0;
        let last = null;
        let lastValue = 0;
        let lastChild = null;
        const cells = this.getLayoutCells(parent);
        for (let i = 0; i < cells.length; i++) {
          const child = cells[i];
          let geo = model.getGeometry(child);
          if (geo != null) {
            geo = geo.clone();
            if (this.wrap != null && last != null) {
              if ((horizontal && last.x + last.width + geo.width + 2 * this.spacing > this.wrap) || (!horizontal && last.y + last.height + geo.height + 2 * this.spacing > this.wrap)) {
                last = null;
                if (horizontal) {
                  y0 += tmp + this.spacing;
                } else {
                  x0 += tmp + this.spacing;
                }
                tmp = 0;
              }
            }
            tmp = Math.max(tmp, (horizontal) ? geo.height : geo.width);
            let sw = 0;
            if (!this.borderCollapse) {
              const childStyle = this.graph.getCellStyle(child);
              sw = mxUtils.getNumber(childStyle, mxConstants.STYLE_STROKEWIDTH, 1);
            }
            if (last != null) {
              const temp = lastValue + this.spacing + Math.floor(sw / 2);
              if (horizontal) {
                geo.x = this.snap(((this.allowGaps) ? Math.max(temp, geo.x) : temp) - this.marginLeft) + this.marginLeft;
              } else {
                geo.y = this.snap(((this.allowGaps) ? Math.max(temp, geo.y) : temp) - this.marginTop) + this.marginTop;
              }
            } else if (!this.keepFirstLocation) {
              if (horizontal) {
                geo.x = (this.allowGaps && geo.x > x0) ? Math.max(this.snap(geo.x - this.marginLeft) + this.marginLeft, x0) : x0;
              } else {
                geo.y = (this.allowGaps && geo.y > y0) ? Math.max(this.snap(geo.y - this.marginTop) + this.marginTop, y0) : y0;
              }
            }
            if (horizontal) {
              geo.y = y0;
            } else {
              geo.x = x0;
            }
            if (this.fill && fillValue != null) {
              if (horizontal) {
                geo.height = fillValue;
              } else {
                geo.width = fillValue;
              }
            }
            if (horizontal) {
              geo.width = this.snap(geo.width);
            } else {
              geo.height = this.snap(geo.height);
            }
            this.setChildGeometry(child, geo);
            lastChild = child;
            last = geo;
            if (horizontal) {
              lastValue = last.x + last.width + Math.floor(sw / 2);
            } else {
              lastValue = last.y + last.height + Math.floor(sw / 2);
            }
          }
        }
        if (this.resizeParent && pgeo != null && last != null && !this.graph.isCellCollapsed(parent)) {
          this.updateParentGeometry(parent, pgeo, last);
        } else if (this.resizeLast && pgeo != null && last != null && lastChild != null) {
          if (horizontal) {
            last.width = pgeo.width - last.x - this.spacing - this.marginRight - this.marginLeft;
          } else {
            last.height = pgeo.height - last.y - this.spacing - this.marginBottom;
          }
          this.setChildGeometry(lastChild, last);
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   *
   * Only children where <isVertexIgnored> returns false are taken into
   * account.
   */
  setChildGeometry(child: any, geo: any): void {
    const geo2 = this.graph.getCellGeometry(child);
    if (geo2 == null || geo.x != geo2.x || geo.y != geo2.y || geo.width != geo2.width || geo.height != geo2.height) {
      this.graph.getModel().setGeometry(child, geo);
    }
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   *
   * Only children where <isVertexIgnored> returns false are taken into
   * account.
   */
  updateParentGeometry(parent: any, pgeo: any, last: any): void {
    const horizontal = this.isHorizontal();
    const model = this.graph.getModel();
    const pgeo2 = pgeo.clone();
    if (horizontal) {
      const tmp = last.x + last.width + this.marginRight + this.border;
      if (this.resizeParentMax) {
        pgeo2.width = Math.max(pgeo2.width, tmp);
      } else {
        pgeo2.width = tmp;
      }
    } else {
      const tmp = last.y + last.height + this.marginBottom + this.border;
      if (this.resizeParentMax) {
        pgeo2.height = Math.max(pgeo2.height, tmp);
      } else {
        pgeo2.height = tmp;
      }
    }
    if (pgeo.x != pgeo2.x || pgeo.y != pgeo2.y || pgeo.width != pgeo2.width || pgeo.height != pgeo2.height) {
      model.setGeometry(parent, pgeo2);
    }
  }
}
