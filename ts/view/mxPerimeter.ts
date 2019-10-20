import { mxConstants } from '../util/mxConstants';
import { mxPoint } from '../util/mxPoint';
import { mxUtils } from '../util/mxUtils';

export let mxPerimeter = {
  RectanglePerimeter(bounds, vertex, next, orthogonal) {
    const cx = bounds.getCenterX();
    const cy = bounds.getCenterY();
    const dx = next.x - cx;
    const dy = next.y - cy;
    const alpha = Math.atan2(dy, dx);
    const p = new mxPoint(0, 0);
    const pi = Math.PI;
    const pi2 = Math.PI / 2;
    const beta = pi2 - alpha;
    const t = Math.atan2(bounds.height, bounds.width);
    if (alpha < -pi + t || alpha > pi - t) {
      p.x = bounds.x;
      p.y = cy - bounds.width * Math.tan(alpha) / 2;
    } else if (alpha < -t) {
      p.y = bounds.y;
      p.x = cx - bounds.height * Math.tan(beta) / 2;
    } else if (alpha < t) {
      p.x = bounds.x + bounds.width;
      p.y = cy + bounds.width * Math.tan(alpha) / 2;
    } else {
      p.y = bounds.y + bounds.height;
      p.x = cx + bounds.height * Math.tan(beta) / 2;
    }
    if (orthogonal) {
      if (next.x >= bounds.x && next.x <= bounds.x + bounds.width) {
        p.x = next.x;
      } else if (next.y >= bounds.y && next.y <= bounds.y + bounds.height) {
        p.y = next.y;
      }
      if (next.x < bounds.x) {
        p.x = bounds.x;
      } else if (next.x > bounds.x + bounds.width) {
        p.x = bounds.x + bounds.width;
      }
      if (next.y < bounds.y) {
        p.y = bounds.y;
      } else if (next.y > bounds.y + bounds.height) {
        p.y = bounds.y + bounds.height;
      }
    }
    return p;
  }, EllipsePerimeter(bounds, vertex, next, orthogonal) {
    const x = bounds.x;
    const y = bounds.y;
    const a = bounds.width / 2;
    const b = bounds.height / 2;
    const cx = x + a;
    const cy = y + b;
    const px = next.x;
    const py = next.y;
    const dx = parseInt(px - cx);
    const dy = parseInt(py - cy);
    if (dx == 0 && dy != 0) {
      return new mxPoint(cx, cy + b * dy / Math.abs(dy));
    } else if (dx == 0 && dy == 0) {
      return new mxPoint(px, py);
    }
    if (orthogonal) {
      if (py >= y && py <= y + bounds.height) {
        const ty = py - cy;
        let tx = Math.sqrt(a * a * (1 - (ty * ty) / (b * b))) || 0;
        if (px <= x) {
          tx = -tx;
        }
        return new mxPoint(cx + tx, py);
      }
      if (px >= x && px <= x + bounds.width) {
        const tx = px - cx;
        let ty = Math.sqrt(b * b * (1 - (tx * tx) / (a * a))) || 0;
        if (py <= y) {
          ty = -ty;
        }
        return new mxPoint(px, cy + ty);
      }
    }
    const d = dy / dx;
    const h = cy - d * cx;
    const e = a * a * d * d + b * b;
    const f = -2 * cx * e;
    const g = a * a * d * d * cx * cx + b * b * cx * cx - a * a * b * b;
    const det = Math.sqrt(f * f - 4 * e * g);
    const xout1 = (-f + det) / (2 * e);
    const xout2 = (-f - det) / (2 * e);
    const yout1 = d * xout1 + h;
    const yout2 = d * xout2 + h;
    const dist1 = Math.sqrt(Math.pow((xout1 - px), 2) + Math.pow((yout1 - py), 2));
    const dist2 = Math.sqrt(Math.pow((xout2 - px), 2) + Math.pow((yout2 - py), 2));
    let xout = 0;
    let yout = 0;
    if (dist1 < dist2) {
      xout = xout1;
      yout = yout1;
    } else {
      xout = xout2;
      yout = yout2;
    }
    return new mxPoint(xout, yout);
  }, RhombusPerimeter(bounds, vertex, next, orthogonal) {
    const x = bounds.x;
    const y = bounds.y;
    const w = bounds.width;
    const h = bounds.height;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const px = next.x;
    const py = next.y;
    if (cx == px) {
      if (cy > py) {
        return new mxPoint(cx, y);
      } else {
        return new mxPoint(cx, y + h);
      }
    } else if (cy == py) {
      if (cx > px) {
        return new mxPoint(x, cy);
      } else {
        return new mxPoint(x + w, cy);
      }
    }
    let tx = cx;
    let ty = cy;
    if (orthogonal) {
      if (px >= x && px <= x + w) {
        tx = px;
      } else if (py >= y && py <= y + h) {
        ty = py;
      }
    }
    if (px < cx) {
      if (py < cy) {
        return mxUtils.intersection(px, py, tx, ty, cx, y, x, cy);
      } else {
        return mxUtils.intersection(px, py, tx, ty, cx, y + h, x, cy);
      }
    } else if (py < cy) {
      return mxUtils.intersection(px, py, tx, ty, cx, y, x + w, cy);
    } else {
      return mxUtils.intersection(px, py, tx, ty, cx, y + h, x + w, cy);
    }
  }, TrianglePerimeter(bounds, vertex, next, orthogonal) {
    const direction = (vertex != null) ? vertex.style[mxConstants.STYLE_DIRECTION] : null;
    const vertical = direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH;
    const x = bounds.x;
    const y = bounds.y;
    const w = bounds.width;
    const h = bounds.height;
    let cx = x + w / 2;
    let cy = y + h / 2;
    let start = new mxPoint(x, y);
    let corner = new mxPoint(x + w, cy);
    let end = new mxPoint(x, y + h);
    if (direction == mxConstants.DIRECTION_NORTH) {
      start = end;
      corner = new mxPoint(cx, y);
      end = new mxPoint(x + w, y + h);
    } else if (direction == mxConstants.DIRECTION_SOUTH) {
      corner = new mxPoint(cx, y + h);
      end = new mxPoint(x + w, y);
    } else if (direction == mxConstants.DIRECTION_WEST) {
      start = new mxPoint(x + w, y);
      corner = new mxPoint(x, cy);
      end = new mxPoint(x + w, y + h);
    }
    let dx = next.x - cx;
    let dy = next.y - cy;
    const alpha = (vertical) ? Math.atan2(dx, dy) : Math.atan2(dy, dx);
    const t = (vertical) ? Math.atan2(w, h) : Math.atan2(h, w);
    let base = false;
    if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_WEST) {
      base = alpha > -t && alpha < t;
    } else {
      base = alpha < -Math.PI + t || alpha > Math.PI - t;
    }
    let result = null;
    if (base) {
      if (orthogonal && ((vertical && next.x >= start.x && next.x <= end.x) || (!vertical && next.y >= start.y && next.y <= end.y))) {
        if (vertical) {
          result = new mxPoint(next.x, start.y);
        } else {
          result = new mxPoint(start.x, next.y);
        }
      } else {
        if (direction == mxConstants.DIRECTION_NORTH) {
          result = new mxPoint(x + w / 2 + h * Math.tan(alpha) / 2, y + h);
        } else if (direction == mxConstants.DIRECTION_SOUTH) {
          result = new mxPoint(x + w / 2 - h * Math.tan(alpha) / 2, y);
        } else if (direction == mxConstants.DIRECTION_WEST) {
          result = new mxPoint(x + w, y + h / 2 + w * Math.tan(alpha) / 2);
        } else {
          result = new mxPoint(x, y + h / 2 - w * Math.tan(alpha) / 2);
        }
      }
    } else {
      if (orthogonal) {
        const pt = new mxPoint(cx, cy);
        if (next.y >= y && next.y <= y + h) {
          pt.x = (vertical) ? cx : ((direction == mxConstants.DIRECTION_WEST) ? x + w : x);
          pt.y = next.y;
        } else if (next.x >= x && next.x <= x + w) {
          pt.x = next.x;
          pt.y = (!vertical) ? cy : ((direction == mxConstants.DIRECTION_NORTH) ? y + h : y);
        }
        dx = next.x - pt.x;
        dy = next.y - pt.y;
        cx = pt.x;
        cy = pt.y;
      }
      if ((vertical && next.x <= x + w / 2) || (!vertical && next.y <= y + h / 2)) {
        result = mxUtils.intersection(next.x, next.y, cx, cy, start.x, start.y, corner.x, corner.y);
      } else {
        result = mxUtils.intersection(next.x, next.y, cx, cy, corner.x, corner.y, end.x, end.y);
      }
    }
    if (result == null) {
      result = new mxPoint(cx, cy);
    }
    return result;
  }, HexagonPerimeter(bounds, vertex, next, orthogonal) {
    const x = bounds.x;
    const y = bounds.y;
    const w = bounds.width;
    const h = bounds.height;
    const cx = bounds.getCenterX();
    const cy = bounds.getCenterY();
    const px = next.x;
    const py = next.y;
    const dx = px - cx;
    const dy = py - cy;
    const alpha = -Math.atan2(dy, dx);
    const pi = Math.PI;
    const pi2 = Math.PI / 2;
    let result = new mxPoint(cx, cy);
    const direction = (vertex != null) ? mxUtils.getValue(vertex.style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST) : mxConstants.DIRECTION_EAST;
    const vertical = direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH;
    let a = new mxPoint();
    let b = new mxPoint();
    if ((px < x) && (py < y) || (px < x) && (py > y + h) || (px > x + w) && (py < y) || (px > x + w) && (py > y + h)) {
      orthogonal = false;
    }
    if (orthogonal) {
      if (vertical) {
        if (px == cx) {
          if (py <= y) {
            return new mxPoint(cx, y);
          } else if (py >= y + h) {
            return new mxPoint(cx, y + h);
          }
        } else if (px < x) {
          if (py == y + h / 4) {
            return new mxPoint(x, y + h / 4);
          } else if (py == y + 3 * h / 4) {
            return new mxPoint(x, y + 3 * h / 4);
          }
        } else if (px > x + w) {
          if (py == y + h / 4) {
            return new mxPoint(x + w, y + h / 4);
          } else if (py == y + 3 * h / 4) {
            return new mxPoint(x + w, y + 3 * h / 4);
          }
        } else if (px == x) {
          if (py < cy) {
            return new mxPoint(x, y + h / 4);
          } else if (py > cy) {
            return new mxPoint(x, y + 3 * h / 4);
          }
        } else if (px == x + w) {
          if (py < cy) {
            return new mxPoint(x + w, y + h / 4);
          } else if (py > cy) {
            return new mxPoint(x + w, y + 3 * h / 4);
          }
        }
        if (py == y) {
          return new mxPoint(cx, y);
        } else if (py == y + h) {
          return new mxPoint(cx, y + h);
        }
        if (px < cx) {
          if ((py > y + h / 4) && (py < y + 3 * h / 4)) {
            a = new mxPoint(x, y);
            b = new mxPoint(x, y + h);
          } else if (py < y + h / 4) {
            a = new mxPoint(x - Math.floor(0.5 * w), y + Math.floor(0.5 * h));
            b = new mxPoint(x + w, y - Math.floor(0.25 * h));
          } else if (py > y + 3 * h / 4) {
            a = new mxPoint(x - Math.floor(0.5 * w), y + Math.floor(0.5 * h));
            b = new mxPoint(x + w, y + Math.floor(1.25 * h));
          }
        } else if (px > cx) {
          if ((py > y + h / 4) && (py < y + 3 * h / 4)) {
            a = new mxPoint(x + w, y);
            b = new mxPoint(x + w, y + h);
          } else if (py < y + h / 4) {
            a = new mxPoint(x, y - Math.floor(0.25 * h));
            b = new mxPoint(x + Math.floor(1.5 * w), y + Math.floor(0.5 * h));
          } else if (py > y + 3 * h / 4) {
            a = new mxPoint(x + Math.floor(1.5 * w), y + Math.floor(0.5 * h));
            b = new mxPoint(x, y + Math.floor(1.25 * h));
          }
        }
      } else {
        if (py == cy) {
          if (px <= x) {
            return new mxPoint(x, y + h / 2);
          } else if (px >= x + w) {
            return new mxPoint(x + w, y + h / 2);
          }
        } else if (py < y) {
          if (px == x + w / 4) {
            return new mxPoint(x + w / 4, y);
          } else if (px == x + 3 * w / 4) {
            return new mxPoint(x + 3 * w / 4, y);
          }
        } else if (py > y + h) {
          if (px == x + w / 4) {
            return new mxPoint(x + w / 4, y + h);
          } else if (px == x + 3 * w / 4) {
            return new mxPoint(x + 3 * w / 4, y + h);
          }
        } else if (py == y) {
          if (px < cx) {
            return new mxPoint(x + w / 4, y);
          } else if (px > cx) {
            return new mxPoint(x + 3 * w / 4, y);
          }
        } else if (py == y + h) {
          if (px < cx) {
            return new mxPoint(x + w / 4, y + h);
          } else if (py > cy) {
            return new mxPoint(x + 3 * w / 4, y + h);
          }
        }
        if (px == x) {
          return new mxPoint(x, cy);
        } else if (px == x + w) {
          return new mxPoint(x + w, cy);
        }
        if (py < cy) {
          if ((px > x + w / 4) && (px < x + 3 * w / 4)) {
            a = new mxPoint(x, y);
            b = new mxPoint(x + w, y);
          } else if (px < x + w / 4) {
            a = new mxPoint(x - Math.floor(0.25 * w), y + h);
            b = new mxPoint(x + Math.floor(0.5 * w), y - Math.floor(0.5 * h));
          } else if (px > x + 3 * w / 4) {
            a = new mxPoint(x + Math.floor(0.5 * w), y - Math.floor(0.5 * h));
            b = new mxPoint(x + Math.floor(1.25 * w), y + h);
          }
        } else if (py > cy) {
          if ((px > x + w / 4) && (px < x + 3 * w / 4)) {
            a = new mxPoint(x, y + h);
            b = new mxPoint(x + w, y + h);
          } else if (px < x + w / 4) {
            a = new mxPoint(x - Math.floor(0.25 * w), y);
            b = new mxPoint(x + Math.floor(0.5 * w), y + Math.floor(1.5 * h));
          } else if (px > x + 3 * w / 4) {
            a = new mxPoint(x + Math.floor(0.5 * w), y + Math.floor(1.5 * h));
            b = new mxPoint(x + Math.floor(1.25 * w), y);
          }
        }
      }
      let tx = cx;
      let ty = cy;
      if (px >= x && px <= x + w) {
        tx = px;
        if (py < cy) {
          ty = y + h;
        } else {
          ty = y;
        }
      } else if (py >= y && py <= y + h) {
        ty = py;
        if (px < cx) {
          tx = x + w;
        } else {
          tx = x;
        }
      }
      result = mxUtils.intersection(tx, ty, next.x, next.y, a.x, a.y, b.x, b.y);
    } else {
      if (vertical) {
        const beta = Math.atan2(h / 4, w / 2);
        if (alpha == beta) {
          return new mxPoint(x + w, y + Math.floor(0.25 * h));
        } else if (alpha == pi2) {
          return new mxPoint(x + Math.floor(0.5 * w), y);
        } else if (alpha == (pi - beta)) {
          return new mxPoint(x, y + Math.floor(0.25 * h));
        } else if (alpha == -beta) {
          return new mxPoint(x + w, y + Math.floor(0.75 * h));
        } else if (alpha == (-pi2)) {
          return new mxPoint(x + Math.floor(0.5 * w), y + h);
        } else if (alpha == (-pi + beta)) {
          return new mxPoint(x, y + Math.floor(0.75 * h));
        }
        if ((alpha < beta) && (alpha > -beta)) {
          a = new mxPoint(x + w, y);
          b = new mxPoint(x + w, y + h);
        } else if ((alpha > beta) && (alpha < pi2)) {
          a = new mxPoint(x, y - Math.floor(0.25 * h));
          b = new mxPoint(x + Math.floor(1.5 * w), y + Math.floor(0.5 * h));
        } else if ((alpha > pi2) && (alpha < (pi - beta))) {
          a = new mxPoint(x - Math.floor(0.5 * w), y + Math.floor(0.5 * h));
          b = new mxPoint(x + w, y - Math.floor(0.25 * h));
        } else if (((alpha > (pi - beta)) && (alpha <= pi)) || ((alpha < (-pi + beta)) && (alpha >= -pi))) {
          a = new mxPoint(x, y);
          b = new mxPoint(x, y + h);
        } else if ((alpha < -beta) && (alpha > -pi2)) {
          a = new mxPoint(x + Math.floor(1.5 * w), y + Math.floor(0.5 * h));
          b = new mxPoint(x, y + Math.floor(1.25 * h));
        } else if ((alpha < -pi2) && (alpha > (-pi + beta))) {
          a = new mxPoint(x - Math.floor(0.5 * w), y + Math.floor(0.5 * h));
          b = new mxPoint(x + w, y + Math.floor(1.25 * h));
        }
      } else {
        const beta = Math.atan2(h / 2, w / 4);
        if (alpha == beta) {
          return new mxPoint(x + Math.floor(0.75 * w), y);
        } else if (alpha == (pi - beta)) {
          return new mxPoint(x + Math.floor(0.25 * w), y);
        } else if ((alpha == pi) || (alpha == -pi)) {
          return new mxPoint(x, y + Math.floor(0.5 * h));
        } else if (alpha == 0) {
          return new mxPoint(x + w, y + Math.floor(0.5 * h));
        } else if (alpha == -beta) {
          return new mxPoint(x + Math.floor(0.75 * w), y + h);
        } else if (alpha == (-pi + beta)) {
          return new mxPoint(x + Math.floor(0.25 * w), y + h);
        }
        if ((alpha > 0) && (alpha < beta)) {
          a = new mxPoint(x + Math.floor(0.5 * w), y - Math.floor(0.5 * h));
          b = new mxPoint(x + Math.floor(1.25 * w), y + h);
        } else if ((alpha > beta) && (alpha < (pi - beta))) {
          a = new mxPoint(x, y);
          b = new mxPoint(x + w, y);
        } else if ((alpha > (pi - beta)) && (alpha < pi)) {
          a = new mxPoint(x - Math.floor(0.25 * w), y + h);
          b = new mxPoint(x + Math.floor(0.5 * w), y - Math.floor(0.5 * h));
        } else if ((alpha < 0) && (alpha > -beta)) {
          a = new mxPoint(x + Math.floor(0.5 * w), y + Math.floor(1.5 * h));
          b = new mxPoint(x + Math.floor(1.25 * w), y);
        } else if ((alpha < -beta) && (alpha > (-pi + beta))) {
          a = new mxPoint(x, y + h);
          b = new mxPoint(x + w, y + h);
        } else if ((alpha < (-pi + beta)) && (alpha > -pi)) {
          a = new mxPoint(x - Math.floor(0.25 * w), y);
          b = new mxPoint(x + Math.floor(0.5 * w), y + Math.floor(1.5 * h));
        }
      }
      result = mxUtils.intersection(cx, cy, next.x, next.y, a.x, a.y, b.x, b.y);
    }
    if (result == null) {
      return new mxPoint(cx, cy);
    }
    return result;
  },
};
