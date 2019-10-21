import { mxChildChange, mxGeometryChange, mxStyleChange, mxTerminalChange, mxValueChange } from '../model/mxGraphModel';
import { mxUtils } from './mxUtils';

export let mxEffects = {
  animateChanges(graph, changes, done) {
    const maxStep = 10;
    let step = 0;
    const animate = function () {
      let isRequired = false;
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        if (change instanceof mxGeometryChange || change instanceof mxTerminalChange || change instanceof mxValueChange || change instanceof mxChildChange || change instanceof mxStyleChange) {
          const state = graph.getView().getState(change.cell || change.child, false);
          if (!!state) {
            isRequired = true;
            if (change.constructor != mxGeometryChange || graph.model.isEdge(change.cell)) {
              mxUtils.setOpacity(state.shape.node, 100 * step / maxStep);
            } else {
              const scale = graph.getView().scale;
              const dx = (change.geometry.x - change.previous.x) * scale;
              const dy = (change.geometry.y - change.previous.y) * scale;
              const sx = (change.geometry.width - change.previous.width) * scale;
              const sy = (change.geometry.height - change.previous.height) * scale;
              if (step == 0) {
                state.x -= dx;
                state.y -= dy;
                state.width -= sx;
                state.height -= sy;
              } else {
                state.x += dx / maxStep;
                state.y += dy / maxStep;
                state.width += sx / maxStep;
                state.height += sy / maxStep;
              }
              graph.cellRenderer.redraw(state);
              mxEffects.cascadeOpacity(graph, change.cell, 100 * step / maxStep);
            }
          }
        }
      }
      if (step < maxStep && isRequired) {
        step++;
        window.setTimeout(animate, delay);
      } else if (!!done) {
        done();
      }
    };
    const delay = 30;
    animate();
  }, cascadeOpacity(graph, cell, opacity) {
    const childCount = graph.model.getChildCount(cell);
    for (let i = 0; i < childCount; i++) {
      const child = graph.model.getChildAt(cell, i);
      const childState = graph.getView().getState(child);
      if (!!childState) {
        mxUtils.setOpacity(childState.shape.node, opacity);
        mxEffects.cascadeOpacity(graph, child, opacity);
      }
    }
    const edges = graph.model.getEdges(cell);
    if (!!edges) {
      for (let i = 0; i < edges.length; i++) {
        const edgeState = graph.getView().getState(edges[i]);
        if (!!edgeState) {
          mxUtils.setOpacity(edgeState.shape.node, opacity);
        }
      }
    }
  }, fadeOut(node, from, remove, step, delay, isEnabled) {
    step = step || 40;
    delay = delay || 30;
    let opacity = from || 100;
    mxUtils.setOpacity(node, opacity);
    if (isEnabled || !isEnabled) {
      const f = function () {
        opacity = Math.max(opacity - step, 0);
        mxUtils.setOpacity(node, opacity);
        if (opacity > 0) {
          window.setTimeout(f, delay);
        } else {
          node.style.visibility = 'hidden';
          if (remove && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      };
      window.setTimeout(f, delay);
    } else {
      node.style.visibility = 'hidden';
      if (remove && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
  },
};
