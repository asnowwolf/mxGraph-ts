import { mxConstants } from '../util/mxConstants';
import { mxPoint } from '../util/mxPoint';
import { mxRectangle } from '../util/mxRectangle';
import { mxUtils } from '../util/mxUtils';
import { mxCellState } from './mxCellState';

export let mxEdgeStyle = {
  EntityRelation(state, source, target, points, result) {
    const view = state.view;
    const graph = view.graph;
    const segment = mxUtils.getValue(state.style, mxConstants.STYLE_SEGMENT, mxConstants.ENTITY_SEGMENT) * view.scale;
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    let isSourceLeft = false;
    if (!!p0) {
      source = new mxCellState();
      source.x = p0.x;
      source.y = p0.y;
    } else if (!!source) {
      const constraint = mxUtils.getPortConstraints(source, state, true, mxConstants.DIRECTION_MASK_NONE);
      if (constraint != mxConstants.DIRECTION_MASK_NONE && constraint != mxConstants.DIRECTION_MASK_WEST + mxConstants.DIRECTION_MASK_EAST) {
        isSourceLeft = constraint == mxConstants.DIRECTION_MASK_WEST;
      } else {
        const sourceGeometry = graph.getCellGeometry(source.cell);
        if (sourceGeometry.relative) {
          isSourceLeft = sourceGeometry.x <= 0.5;
        } else if (!!target) {
          isSourceLeft = target.x + target.width < source.x;
        }
      }
    } else {
      return;
    }
    let isTargetLeft = true;
    if (!!pe) {
      target = new mxCellState();
      target.x = pe.x;
      target.y = pe.y;
    } else if (!!target) {
      const constraint = mxUtils.getPortConstraints(target, state, false, mxConstants.DIRECTION_MASK_NONE);
      if (constraint != mxConstants.DIRECTION_MASK_NONE && constraint != mxConstants.DIRECTION_MASK_WEST + mxConstants.DIRECTION_MASK_EAST) {
        isTargetLeft = constraint == mxConstants.DIRECTION_MASK_WEST;
      } else {
        const targetGeometry = graph.getCellGeometry(target.cell);
        if (targetGeometry.relative) {
          isTargetLeft = targetGeometry.x <= 0.5;
        } else if (!!source) {
          isTargetLeft = source.x + source.width < target.x;
        }
      }
    }
    if (!!source && !!target) {
      const x0 = (isSourceLeft) ? source.x : source.x + source.width;
      const y0 = view.getRoutingCenterY(source);
      const xe = (isTargetLeft) ? target.x : target.x + target.width;
      const ye = view.getRoutingCenterY(target);
      const seg = segment;
      let dx = (isSourceLeft) ? -seg : seg;
      const dep = new mxPoint(x0 + dx, y0);
      dx = (isTargetLeft) ? -seg : seg;
      const arr = new mxPoint(xe + dx, ye);
      if (isSourceLeft == isTargetLeft) {
        const x = (isSourceLeft) ? Math.min(x0, xe) - segment : Math.max(x0, xe) + segment;
        result.push(new mxPoint(x, y0));
        result.push(new mxPoint(x, ye));
      } else if ((dep.x < arr.x) == isSourceLeft) {
        const midY = y0 + (ye - y0) / 2;
        result.push(dep);
        result.push(new mxPoint(dep.x, midY));
        result.push(new mxPoint(arr.x, midY));
        result.push(arr);
      } else {
        result.push(dep);
        result.push(arr);
      }
    }
  },
  Loop(state, source, target, points, result) {
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    if (!!p0 && !!pe) {
      if (!!points && points.length > 0) {
        for (let i = 0; i < points.length; i++) {
          let pt = points[i];
          pt = state.view.transformControlPoint(state, pt);
          result.push(new mxPoint(pt.x, pt.y));
        }
      }
      return;
    }
    if (!!source) {
      const view = state.view;
      const graph = view.graph;
      let pt = (!!points && points.length > 0) ? points[0] : null;
      if (!!pt) {
        pt = view.transformControlPoint(state, pt);
        if (mxUtils.contains(source, pt.x, pt.y)) {
          pt = undefined;
        }
      }
      let x = 0;
      let dx = 0;
      let y = 0;
      let dy = 0;
      const seg = mxUtils.getValue(state.style, mxConstants.STYLE_SEGMENT, graph.gridSize) * view.scale;
      const dir = mxUtils.getValue(state.style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_WEST);
      if (dir == mxConstants.DIRECTION_NORTH || dir == mxConstants.DIRECTION_SOUTH) {
        x = view.getRoutingCenterX(source);
        dx = seg;
      } else {
        y = view.getRoutingCenterY(source);
        dy = seg;
      }
      if (!pt || pt.x < source.x || pt.x > source.x + source.width) {
        if (!!pt) {
          x = pt.x;
          dy = Math.max(Math.abs(y - pt.y), dy);
        } else {
          if (dir == mxConstants.DIRECTION_NORTH) {
            y = source.y - 2 * dx;
          } else if (dir == mxConstants.DIRECTION_SOUTH) {
            y = source.y + source.height + 2 * dx;
          } else if (dir == mxConstants.DIRECTION_EAST) {
            x = source.x - 2 * dy;
          } else {
            x = source.x + source.width + 2 * dy;
          }
        }
      } else if (!!pt) {
        x = view.getRoutingCenterX(source);
        dx = Math.max(Math.abs(x - pt.x), dy);
        y = pt.y;
        dy = 0;
      }
      result.push(new mxPoint(x - dx, y - dy));
      result.push(new mxPoint(x + dx, y + dy));
    }
  },
  ElbowConnector(state, source, target, points, result) {
    let pt = (!!points && points.length > 0) ? points[0] : null;
    let vertical = false;
    let horizontal = false;
    if (!!source && !!target) {
      if (!!pt) {
        const left = Math.min(source.x, target.x);
        const right = Math.max(source.x + source.width, target.x + target.width);
        const top = Math.min(source.y, target.y);
        const bottom = Math.max(source.y + source.height, target.y + target.height);
        pt = state.view.transformControlPoint(state, pt);
        vertical = pt.y < top || pt.y > bottom;
        horizontal = pt.x < left || pt.x > right;
      } else {
        const left = Math.max(source.x, target.x);
        const right = Math.min(source.x + source.width, target.x + target.width);
        vertical = left == right;
        if (!vertical) {
          const top = Math.max(source.y, target.y);
          const bottom = Math.min(source.y + source.height, target.y + target.height);
          horizontal = top == bottom;
        }
      }
    }
    if (!horizontal && (vertical || state.style[mxConstants.STYLE_ELBOW] == mxConstants.ELBOW_VERTICAL)) {
      mxEdgeStyle.TopToBottom(state, source, target, points, result);
    } else {
      mxEdgeStyle.SideToSide(state, source, target, points, result);
    }
  },
  SideToSide(state, source, target, points, result) {
    const view = state.view;
    let pt = (!!points && points.length > 0) ? points[0] : null;
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    if (!!pt) {
      pt = view.transformControlPoint(state, pt);
    }
    if (!!p0) {
      source = new mxCellState();
      source.x = p0.x;
      source.y = p0.y;
    }
    if (!!pe) {
      target = new mxCellState();
      target.x = pe.x;
      target.y = pe.y;
    }
    if (!!source && !!target) {
      const l = Math.max(source.x, target.x);
      const r = Math.min(source.x + source.width, target.x + target.width);
      const x = (!!pt) ? pt.x : Math.round(r + (l - r) / 2);
      let y1 = view.getRoutingCenterY(source);
      let y2 = view.getRoutingCenterY(target);
      if (!!pt) {
        if (pt.y >= source.y && pt.y <= source.y + source.height) {
          y1 = pt.y;
        }
        if (pt.y >= target.y && pt.y <= target.y + target.height) {
          y2 = pt.y;
        }
      }
      if (!mxUtils.contains(target, x, y1) && !mxUtils.contains(source, x, y1)) {
        result.push(new mxPoint(x, y1));
      }
      if (!mxUtils.contains(target, x, y2) && !mxUtils.contains(source, x, y2)) {
        result.push(new mxPoint(x, y2));
      }
      if (result.length == 1) {
        if (!!pt) {
          if (!mxUtils.contains(target, x, pt.y) && !mxUtils.contains(source, x, pt.y)) {
            result.push(new mxPoint(x, pt.y));
          }
        } else {
          const t = Math.max(source.y, target.y);
          const b = Math.min(source.y + source.height, target.y + target.height);
          result.push(new mxPoint(x, t + (b - t) / 2));
        }
      }
    }
  },
  TopToBottom(state, source, target, points, result) {
    const view = state.view;
    let pt = (!!points && points.length > 0) ? points[0] : null;
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    if (!!pt) {
      pt = view.transformControlPoint(state, pt);
    }
    if (!!p0) {
      source = new mxCellState();
      source.x = p0.x;
      source.y = p0.y;
    }
    if (!!pe) {
      target = new mxCellState();
      target.x = pe.x;
      target.y = pe.y;
    }
    if (!!source && !!target) {
      const t = Math.max(source.y, target.y);
      const b = Math.min(source.y + source.height, target.y + target.height);
      let x = view.getRoutingCenterX(source);
      if (!!pt && pt.x >= source.x && pt.x <= source.x + source.width) {
        x = pt.x;
      }
      const y = (!!pt) ? pt.y : Math.round(b + (t - b) / 2);
      if (!mxUtils.contains(target, x, y) && !mxUtils.contains(source, x, y)) {
        result.push(new mxPoint(x, y));
      }
      if (!!pt && pt.x >= target.x && pt.x <= target.x + target.width) {
        x = pt.x;
      } else {
        x = view.getRoutingCenterX(target);
      }
      if (!mxUtils.contains(target, x, y) && !mxUtils.contains(source, x, y)) {
        result.push(new mxPoint(x, y));
      }
      if (result.length == 1) {
        if (!!pt && result.length == 1) {
          if (!mxUtils.contains(target, pt.x, y) && !mxUtils.contains(source, pt.x, y)) {
            result.push(new mxPoint(pt.x, y));
          }
        } else {
          const l = Math.max(source.x, target.x);
          const r = Math.min(source.x + source.width, target.x + target.width);
          result.push(new mxPoint(l + (r - l) / 2, y));
        }
      }
    }
  },
  SegmentConnector(state, source, target, hints, result) {
    const pts = state.absolutePoints;
    const tol = Math.max(1, state.view.scale);
    let lastPushed = (result.length > 0) ? result[0] : null;
    let horizontal = true;
    let hint = undefined;

    function pushPoint(pt) {
      if (!lastPushed || Math.abs(lastPushed.x - pt.x) >= tol || Math.abs(lastPushed.y - pt.y) >= tol) {
        result.push(pt);
        lastPushed = pt;
      }
      return lastPushed;
    }

    let pt = pts[0];
    if (!pt && !!source) {
      pt = new mxPoint(state.view.getRoutingCenterX(source), state.view.getRoutingCenterY(source));
    } else if (!!pt) {
      pt = pt.clone();
    }
    pt.x = Math.round(pt.x);
    pt.y = Math.round(pt.y);
    const lastInx = pts.length - 1;
    if (!!hints && hints.length > 0) {
      const newHints = [];
      for (let i = 0; i < hints.length; i++) {
        const tmp = state.view.transformControlPoint(state, hints[i]);
        if (!!tmp) {
          tmp.x = Math.round(tmp.x);
          tmp.y = Math.round(tmp.y);
          newHints.push(tmp);
        }
      }
      if (newHints.length == 0) {
        return;
      }
      hints = newHints;
      if (!!pt && hints[0]) {
        if (Math.abs(hints[0].x - pt.x) < tol) {
          hints[0].x = pt.x;
        }
        if (Math.abs(hints[0].y - pt.y) < tol) {
          hints[0].y = pt.y;
        }
      }
      const pe = pts[lastInx];
      if (!!pe && hints[hints.length - 1]) {
        if (Math.abs(hints[hints.length - 1].x - pe.x) < tol) {
          hints[hints.length - 1].x = pe.x;
        }
        if (Math.abs(hints[hints.length - 1].y - pe.y) < tol) {
          hints[hints.length - 1].y = pe.y;
        }
      }
      hint = hints[0];
      let currentTerm = source;
      let currentPt = pts[0];
      let hozChan = false;
      let vertChan = false;
      let currentHint = hint;
      if (!!currentPt) {
        currentPt.x = Math.round(currentPt.x);
        currentPt.y = Math.round(currentPt.y);
        currentTerm = undefined;
      }
      for (let i = 0; i < 2; i++) {
        const fixedVertAlign = !!currentPt && currentPt.x == currentHint.x;
        const fixedHozAlign = !!currentPt && currentPt.y == currentHint.y;
        const inHozChan = !!currentTerm && (currentHint.y >= currentTerm.y && currentHint.y <= currentTerm.y + currentTerm.height);
        const inVertChan = !!currentTerm && (currentHint.x >= currentTerm.x && currentHint.x <= currentTerm.x + currentTerm.width);
        hozChan = fixedHozAlign || (!currentPt && inHozChan);
        vertChan = fixedVertAlign || (!currentPt && inVertChan);
        if (i == 0 && ((hozChan && vertChan) || (fixedVertAlign && fixedHozAlign))) {
        } else {
          if (!!currentPt && (!fixedHozAlign && !fixedVertAlign) && (inHozChan || inVertChan)) {
            horizontal = inHozChan ? false : true;
            break;
          }
          if (vertChan || hozChan) {
            horizontal = hozChan;
            if (i == 1) {
              horizontal = hints.length % 2 == 0 ? hozChan : vertChan;
            }
            break;
          }
        }
        currentTerm = target;
        currentPt = pts[lastInx];
        if (!!currentPt) {
          currentPt.x = Math.round(currentPt.x);
          currentPt.y = Math.round(currentPt.y);
          currentTerm = undefined;
        }
        currentHint = hints[hints.length - 1];
        if (fixedVertAlign && fixedHozAlign) {
          hints = hints.slice(1);
        }
      }
      if (horizontal && ((pts[0] && pts[0].y != hint.y) || (!pts[0] && !!source && (hint.y < source.y || hint.y > source.y + source.height)))) {
        pushPoint(new mxPoint(pt.x, hint.y));
      } else if (!horizontal && ((pts[0] && pts[0].x != hint.x) || (!pts[0] && !!source && (hint.x < source.x || hint.x > source.x + source.width)))) {
        pushPoint(new mxPoint(hint.x, pt.y));
      }
      if (horizontal) {
        pt.y = hint.y;
      } else {
        pt.x = hint.x;
      }
      for (let i = 0; i < hints.length; i++) {
        horizontal = !horizontal;
        hint = hints[i];
        if (horizontal) {
          pt.y = hint.y;
        } else {
          pt.x = hint.x;
        }
        pushPoint(pt.clone());
      }
    } else {
      hint = pt;
      horizontal = true;
    }
    pt = pts[lastInx];
    if (!pt && !!target) {
      pt = new mxPoint(state.view.getRoutingCenterX(target), state.view.getRoutingCenterY(target));
    }
    if (!!pt) {
      pt.x = Math.round(pt.x);
      pt.y = Math.round(pt.y);
      if (!!hint) {
        if (horizontal && ((pts[lastInx] && pts[lastInx].y != hint.y) || (!pts[lastInx] && !!target && (hint.y < target.y || hint.y > target.y + target.height)))) {
          pushPoint(new mxPoint(pt.x, hint.y));
        } else if (!horizontal && ((pts[lastInx] && pts[lastInx].x != hint.x) || (!pts[lastInx] && !!target && (hint.x < target.x || hint.x > target.x + target.width)))) {
          pushPoint(new mxPoint(hint.x, pt.y));
        }
      }
    }
    if (!pts[0] && !!source) {
      while (result.length > 1 && result[1] && mxUtils.contains(source, result[1].x, result[1].y)) {
        result.splice(1, 1);
      }
    }
    if (!pts[lastInx] && !!target) {
      while (result.length > 1 && result[result.length - 1] && mxUtils.contains(target, result[result.length - 1].x, result[result.length - 1].y)) {
        result.splice(result.length - 1, 1);
      }
    }
    if (!!pe && result[result.length - 1] && Math.abs(pe.x - result[result.length - 1].x) <= tol && Math.abs(pe.y - result[result.length - 1].y) <= tol) {
      result.splice(result.length - 1, 1);
      if (result[result.length - 1]) {
        if (Math.abs(result[result.length - 1].x - pe.x) < tol) {
          result[result.length - 1].x = pe.x;
        }
        if (Math.abs(result[result.length - 1].y - pe.y) < tol) {
          result[result.length - 1].y = pe.y;
        }
      }
    }
  },
  orthBuffer: 10,
  orthPointsFallback: true,
  dirVectors: [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 0]],
  wayPoints1: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  routePatterns: [
    [[513, 2308, 2081, 2562], [513, 1090, 514, 2184, 2114, 2561], [513, 1090, 514, 2564, 2184, 2562], [513, 2308, 2561, 1090, 514, 2568, 2308]], [[514, 1057, 513, 2308, 2081, 2562], [514, 2184, 2114, 2561], [514, 2184, 2562, 1057, 513, 2564, 2184], [514, 1057, 513, 2568, 2308, 2561]], [[1090, 514, 1057, 513, 2308, 2081, 2562], [2114, 2561], [1090, 2562, 1057, 513, 2564, 2184], [1090, 514, 1057, 513, 2308, 2561, 2568]], [[2081, 2562], [1057, 513, 1090, 514, 2184, 2114, 2561], [1057, 513, 1090, 514, 2184, 2562, 2564], [1057, 2561, 1090, 514, 2568, 2308]],
  ],
  inlineRoutePatterns: [
    [null, [2114, 2568], null, null], [null, [514, 2081, 2114, 2568], null, null], [null, [2114, 2561], null, null], [[2081, 2562], [1057, 2114, 2568], [2184, 2562], null],
  ],
  vertexSeperations: [],
  limits: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  LEFT_MASK: 32,
  TOP_MASK: 64,
  RIGHT_MASK: 128,
  BOTTOM_MASK: 256,
  LEFT: 1,
  TOP: 2,
  RIGHT: 4,
  BOTTOM: 8,
  SIDE_MASK: 480,
  CENTER_MASK: 512,
  SOURCE_MASK: 1024,
  TARGET_MASK: 2048,
  VERTEX_MASK: 3072,
  getJettySize(state, source, target, points, isSource) {
    let value = mxUtils.getValue(state.style, (isSource) ? mxConstants.STYLE_SOURCE_JETTY_SIZE : mxConstants.STYLE_TARGET_JETTY_SIZE, mxUtils.getValue(state.style, mxConstants.STYLE_JETTY_SIZE, mxEdgeStyle.orthBuffer));
    if (value == 'auto') {
      const type = mxUtils.getValue(state.style, (isSource) ? mxConstants.STYLE_STARTARROW : mxConstants.STYLE_ENDARROW, mxConstants.NONE);
      if (type != mxConstants.NONE) {
        const size = mxUtils.getNumber(state.style, (isSource) ? mxConstants.STYLE_STARTSIZE : mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE);
        value = Math.max(2, Math.ceil((size + mxEdgeStyle.orthBuffer) / mxEdgeStyle.orthBuffer)) * mxEdgeStyle.orthBuffer;
      } else {
        value = 2 * mxEdgeStyle.orthBuffer;
      }
    }
    return value;
  },
  OrthConnector(state, source, target, points, result) {
    const graph = state.view.graph;
    const sourceEdge = !source ? false : graph.getModel().isEdge(source.cell);
    const targetEdge = !target ? false : graph.getModel().isEdge(target.cell);
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];
    let sourceX = !!source ? source.x : p0.x;
    let sourceY = !!source ? source.y : p0.y;
    let sourceWidth = !!source ? source.width : 0;
    let sourceHeight = !!source ? source.height : 0;
    let targetX = !!target ? target.x : pe.x;
    let targetY = !!target ? target.y : pe.y;
    let targetWidth = !!target ? target.width : 0;
    let targetHeight = !!target ? target.height : 0;
    let scaledSourceBuffer = state.view.scale * mxEdgeStyle.getJettySize(state, source, target, points, true);
    let scaledTargetBuffer = state.view.scale * mxEdgeStyle.getJettySize(state, source, target, points, false);
    if (!!source && target == source) {
      scaledTargetBuffer = Math.max(scaledSourceBuffer, scaledTargetBuffer);
      scaledSourceBuffer = scaledTargetBuffer;
    }
    const totalBuffer = scaledTargetBuffer + scaledSourceBuffer;
    let tooShort = false;
    if (!!p0 && !!pe) {
      const dx = pe.x - p0.x;
      const dy = pe.y - p0.y;
      tooShort = dx * dx + dy * dy < totalBuffer * totalBuffer;
    }
    if (tooShort || (mxEdgeStyle.orthPointsFallback && (!!points && points.length > 0)) || sourceEdge || targetEdge) {
      mxEdgeStyle.SegmentConnector(state, source, target, points, result);
      return;
    }
    const portConstraint = [mxConstants.DIRECTION_MASK_ALL, mxConstants.DIRECTION_MASK_ALL];
    let rotation = 0;
    if (!!source) {
      portConstraint[0] = mxUtils.getPortConstraints(source, state, true, mxConstants.DIRECTION_MASK_ALL);
      rotation = mxUtils.getValue(source.style, mxConstants.STYLE_ROTATION, 0);
      if (rotation != 0) {
        const newRect = mxUtils.getBoundingBox(new mxRectangle(sourceX, sourceY, sourceWidth, sourceHeight), rotation);
        sourceX = newRect.x;
        sourceY = newRect.y;
        sourceWidth = newRect.width;
        sourceHeight = newRect.height;
      }
    }
    if (!!target) {
      portConstraint[1] = mxUtils.getPortConstraints(target, state, false, mxConstants.DIRECTION_MASK_ALL);
      rotation = mxUtils.getValue(target.style, mxConstants.STYLE_ROTATION, 0);
      if (rotation != 0) {
        const newRect = mxUtils.getBoundingBox(new mxRectangle(targetX, targetY, targetWidth, targetHeight), rotation);
        targetX = newRect.x;
        targetY = newRect.y;
        targetWidth = newRect.width;
        targetHeight = newRect.height;
      }
    }
    sourceX = Math.round(sourceX * 10) / 10;
    sourceY = Math.round(sourceY * 10) / 10;
    sourceWidth = Math.round(sourceWidth * 10) / 10;
    sourceHeight = Math.round(sourceHeight * 10) / 10;
    targetX = Math.round(targetX * 10) / 10;
    targetY = Math.round(targetY * 10) / 10;
    targetWidth = Math.round(targetWidth * 10) / 10;
    targetHeight = Math.round(targetHeight * 10) / 10;
    const dir = [0, 0];
    const geo = [[sourceX, sourceY, sourceWidth, sourceHeight], [targetX, targetY, targetWidth, targetHeight]];
    const buffer = [scaledSourceBuffer, scaledTargetBuffer];
    for (let i = 0; i < 2; i++) {
      mxEdgeStyle.limits[i][1] = geo[i][0] - buffer[i];
      mxEdgeStyle.limits[i][2] = geo[i][1] - buffer[i];
      mxEdgeStyle.limits[i][4] = geo[i][0] + geo[i][2] + buffer[i];
      mxEdgeStyle.limits[i][8] = geo[i][1] + geo[i][3] + buffer[i];
    }
    const sourceCenX = geo[0][0] + geo[0][2] / 2;
    const sourceCenY = geo[0][1] + geo[0][3] / 2;
    const targetCenX = geo[1][0] + geo[1][2] / 2;
    const targetCenY = geo[1][1] + geo[1][3] / 2;
    const dx = sourceCenX - targetCenX;
    const dy = sourceCenY - targetCenY;
    let quad = 0;
    if (dx < 0) {
      if (dy < 0) {
        quad = 2;
      } else {
        quad = 1;
      }
    } else {
      if (dy <= 0) {
        quad = 3;
        if (dx == 0) {
          quad = 2;
        }
      }
    }
    let currentTerm = undefined;
    if (!!source) {
      currentTerm = p0;
    }
    const constraint = [[0.5, 0.5], [0.5, 0.5]];
    for (let i = 0; i < 2; i++) {
      if (!!currentTerm) {
        constraint[i][0] = (currentTerm.x - geo[i][0]) / geo[i][2];
        if (Math.abs(currentTerm.x - geo[i][0]) <= 1) {
          dir[i] = mxConstants.DIRECTION_MASK_WEST;
        } else if (Math.abs(currentTerm.x - geo[i][0] - geo[i][2]) <= 1) {
          dir[i] = mxConstants.DIRECTION_MASK_EAST;
        }
        constraint[i][1] = (currentTerm.y - geo[i][1]) / geo[i][3];
        if (Math.abs(currentTerm.y - geo[i][1]) <= 1) {
          dir[i] = mxConstants.DIRECTION_MASK_NORTH;
        } else if (Math.abs(currentTerm.y - geo[i][1] - geo[i][3]) <= 1) {
          dir[i] = mxConstants.DIRECTION_MASK_SOUTH;
        }
      }
      currentTerm = undefined;
      if (!!target) {
        currentTerm = pe;
      }
    }
    const sourceTopDist = geo[0][1] - (geo[1][1] + geo[1][3]);
    const sourceLeftDist = geo[0][0] - (geo[1][0] + geo[1][2]);
    const sourceBottomDist = geo[1][1] - (geo[0][1] + geo[0][3]);
    const sourceRightDist = geo[1][0] - (geo[0][0] + geo[0][2]);
    mxEdgeStyle.vertexSeperations[1] = Math.max(sourceLeftDist - totalBuffer, 0);
    mxEdgeStyle.vertexSeperations[2] = Math.max(sourceTopDist - totalBuffer, 0);
    mxEdgeStyle.vertexSeperations[4] = Math.max(sourceBottomDist - totalBuffer, 0);
    mxEdgeStyle.vertexSeperations[3] = Math.max(sourceRightDist - totalBuffer, 0);
    const dirPref = [];
    const horPref = [];
    const vertPref = [];
    horPref[0] = (sourceLeftDist >= sourceRightDist) ? mxConstants.DIRECTION_MASK_WEST : mxConstants.DIRECTION_MASK_EAST;
    vertPref[0] = (sourceTopDist >= sourceBottomDist) ? mxConstants.DIRECTION_MASK_NORTH : mxConstants.DIRECTION_MASK_SOUTH;
    horPref[1] = mxUtils.reversePortConstraints(horPref[0]);
    vertPref[1] = mxUtils.reversePortConstraints(vertPref[0]);
    const preferredHorizDist = sourceLeftDist >= sourceRightDist ? sourceLeftDist : sourceRightDist;
    const preferredVertDist = sourceTopDist >= sourceBottomDist ? sourceTopDist : sourceBottomDist;
    const prefOrdering = [[0, 0], [0, 0]];
    let preferredOrderSet = false;
    for (let i = 0; i < 2; i++) {
      if (dir[i] != 0) {
        continue;
      }
      if ((horPref[i] & portConstraint[i]) == 0) {
        horPref[i] = mxUtils.reversePortConstraints(horPref[i]);
      }
      if ((vertPref[i] & portConstraint[i]) == 0) {
        vertPref[i] = mxUtils.reversePortConstraints(vertPref[i]);
      }
      prefOrdering[i][0] = vertPref[i];
      prefOrdering[i][1] = horPref[i];
    }
    if (preferredVertDist > 0 && preferredHorizDist > 0) {
      if (((horPref[0] & portConstraint[0]) > 0) && ((vertPref[1] & portConstraint[1]) > 0)) {
        prefOrdering[0][0] = horPref[0];
        prefOrdering[0][1] = vertPref[0];
        prefOrdering[1][0] = vertPref[1];
        prefOrdering[1][1] = horPref[1];
        preferredOrderSet = true;
      } else if (((vertPref[0] & portConstraint[0]) > 0) && ((horPref[1] & portConstraint[1]) > 0)) {
        prefOrdering[0][0] = vertPref[0];
        prefOrdering[0][1] = horPref[0];
        prefOrdering[1][0] = horPref[1];
        prefOrdering[1][1] = vertPref[1];
        preferredOrderSet = true;
      }
    }
    if (preferredVertDist > 0 && !preferredOrderSet) {
      prefOrdering[0][0] = vertPref[0];
      prefOrdering[0][1] = horPref[0];
      prefOrdering[1][0] = vertPref[1];
      prefOrdering[1][1] = horPref[1];
      preferredOrderSet = true;
    }
    if (preferredHorizDist > 0 && !preferredOrderSet) {
      prefOrdering[0][0] = horPref[0];
      prefOrdering[0][1] = vertPref[0];
      prefOrdering[1][0] = horPref[1];
      prefOrdering[1][1] = vertPref[1];
      preferredOrderSet = true;
    }
    for (let i = 0; i < 2; i++) {
      if (dir[i] != 0) {
        continue;
      }
      if ((prefOrdering[i][0] & portConstraint[i]) == 0) {
        prefOrdering[i][0] = prefOrdering[i][1];
      }
      dirPref[i] = prefOrdering[i][0] & portConstraint[i];
      dirPref[i] |= (prefOrdering[i][1] & portConstraint[i]) << 8;
      dirPref[i] |= (prefOrdering[1 - i][i] & portConstraint[i]) << 16;
      dirPref[i] |= (prefOrdering[1 - i][1 - i] & portConstraint[i]) << 24;
      if ((dirPref[i] & 15) == 0) {
        dirPref[i] = dirPref[i] << 8;
      }
      if ((dirPref[i] & 3840) == 0) {
        dirPref[i] = (dirPref[i] & 15) | dirPref[i] >> 8;
      }
      if ((dirPref[i] & 983040) == 0) {
        dirPref[i] = (dirPref[i] & 65535) | ((dirPref[i] & 251658240) >> 8);
      }
      dir[i] = dirPref[i] & 15;
      if (portConstraint[i] == mxConstants.DIRECTION_MASK_WEST || portConstraint[i] == mxConstants.DIRECTION_MASK_NORTH || portConstraint[i] == mxConstants.DIRECTION_MASK_EAST || portConstraint[i] == mxConstants.DIRECTION_MASK_SOUTH) {
        dir[i] = portConstraint[i];
      }
    }
    let sourceIndex = dir[0] == mxConstants.DIRECTION_MASK_EAST ? 3 : dir[0];
    let targetIndex = dir[1] == mxConstants.DIRECTION_MASK_EAST ? 3 : dir[1];
    sourceIndex -= quad;
    targetIndex -= quad;
    if (sourceIndex < 1) {
      sourceIndex += 4;
    }
    if (targetIndex < 1) {
      targetIndex += 4;
    }
    const routePattern = mxEdgeStyle.routePatterns[sourceIndex - 1][targetIndex - 1];
    mxEdgeStyle.wayPoints1[0][0] = geo[0][0];
    mxEdgeStyle.wayPoints1[0][1] = geo[0][1];
    switch (dir[0]) {
      case mxConstants.DIRECTION_MASK_WEST:
        mxEdgeStyle.wayPoints1[0][0] -= scaledSourceBuffer;
        mxEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
        break;
      case mxConstants.DIRECTION_MASK_SOUTH:
        mxEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
        mxEdgeStyle.wayPoints1[0][1] += geo[0][3] + scaledSourceBuffer;
        break;
      case mxConstants.DIRECTION_MASK_EAST:
        mxEdgeStyle.wayPoints1[0][0] += geo[0][2] + scaledSourceBuffer;
        mxEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
        break;
      case mxConstants.DIRECTION_MASK_NORTH:
        mxEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
        mxEdgeStyle.wayPoints1[0][1] -= scaledSourceBuffer;
        break;
    }
    let currentIndex = 0;
    let lastOrientation = (dir[0] & (mxConstants.DIRECTION_MASK_EAST | mxConstants.DIRECTION_MASK_WEST)) > 0 ? 0 : 1;
    const initialOrientation = lastOrientation;
    let currentOrientation = 0;
    for (let i = 0; i < routePattern.length; i++) {
      const nextDirection = routePattern[i] & 15;
      let directionIndex = nextDirection == mxConstants.DIRECTION_MASK_EAST ? 3 : nextDirection;
      directionIndex += quad;
      if (directionIndex > 4) {
        directionIndex -= 4;
      }
      const direction = mxEdgeStyle.dirVectors[directionIndex - 1];
      currentOrientation = (directionIndex % 2 > 0) ? 0 : 1;
      if (currentOrientation != lastOrientation) {
        currentIndex++;
        mxEdgeStyle.wayPoints1[currentIndex][0] = mxEdgeStyle.wayPoints1[currentIndex - 1][0];
        mxEdgeStyle.wayPoints1[currentIndex][1] = mxEdgeStyle.wayPoints1[currentIndex - 1][1];
      }
      const tar = (routePattern[i] & mxEdgeStyle.TARGET_MASK) > 0;
      const sou = (routePattern[i] & mxEdgeStyle.SOURCE_MASK) > 0;
      let side = (routePattern[i] & mxEdgeStyle.SIDE_MASK) >> 5;
      side = side << quad;
      if (side > 15) {
        side = side >> 4;
      }
      const center = (routePattern[i] & mxEdgeStyle.CENTER_MASK) > 0;
      if ((sou || tar) && side < 9) {
        let limit = 0;
        const souTar = sou ? 0 : 1;
        if (center && currentOrientation == 0) {
          limit = geo[souTar][0] + constraint[souTar][0] * geo[souTar][2];
        } else if (center) {
          limit = geo[souTar][1] + constraint[souTar][1] * geo[souTar][3];
        } else {
          limit = mxEdgeStyle.limits[souTar][side];
        }
        if (currentOrientation == 0) {
          const lastX = mxEdgeStyle.wayPoints1[currentIndex][0];
          const deltaX = (limit - lastX) * direction[0];
          if (deltaX > 0) {
            mxEdgeStyle.wayPoints1[currentIndex][0] += direction[0] * deltaX;
          }
        } else {
          const lastY = mxEdgeStyle.wayPoints1[currentIndex][1];
          const deltaY = (limit - lastY) * direction[1];
          if (deltaY > 0) {
            mxEdgeStyle.wayPoints1[currentIndex][1] += direction[1] * deltaY;
          }
        }
      } else if (center) {
        mxEdgeStyle.wayPoints1[currentIndex][0] += direction[0] * Math.abs(mxEdgeStyle.vertexSeperations[directionIndex] / 2);
        mxEdgeStyle.wayPoints1[currentIndex][1] += direction[1] * Math.abs(mxEdgeStyle.vertexSeperations[directionIndex] / 2);
      }
      if (currentIndex > 0 && mxEdgeStyle.wayPoints1[currentIndex][currentOrientation] == mxEdgeStyle.wayPoints1[currentIndex - 1][currentOrientation]) {
        currentIndex--;
      } else {
        lastOrientation = currentOrientation;
      }
    }
    for (let i = 0; i <= currentIndex; i++) {
      if (i == currentIndex) {
        const targetOrientation = (dir[1] & (mxConstants.DIRECTION_MASK_EAST | mxConstants.DIRECTION_MASK_WEST)) > 0 ? 0 : 1;
        const sameOrient = targetOrientation == initialOrientation ? 0 : 1;
        if (sameOrient != (currentIndex + 1) % 2) {
          break;
        }
      }
      result.push(new mxPoint(Math.round(mxEdgeStyle.wayPoints1[i][0]), Math.round(mxEdgeStyle.wayPoints1[i][1])));
    }
    let index = 1;
    while (index < result.length) {
      if (!result[index - 1] || !result[index] || result[index - 1].x != result[index].x || result[index - 1].y != result[index].y) {
        index++;
      } else {
        result.splice(index, 1);
      }
    }
  },
  getRoutePattern(dir, quad, dx, dy) {
    let sourceIndex = dir[0] == mxConstants.DIRECTION_MASK_EAST ? 3 : dir[0];
    let targetIndex = dir[1] == mxConstants.DIRECTION_MASK_EAST ? 3 : dir[1];
    sourceIndex -= quad;
    targetIndex -= quad;
    if (sourceIndex < 1) {
      sourceIndex += 4;
    }
    if (targetIndex < 1) {
      targetIndex += 4;
    }
    let result = routePatterns[sourceIndex - 1][targetIndex - 1];
    if (dx == 0 || dy == 0) {
      if (inlineRoutePatterns[sourceIndex - 1][targetIndex - 1]) {
        result = inlineRoutePatterns[sourceIndex - 1][targetIndex - 1];
      }
    }
    return result;
  },
};
