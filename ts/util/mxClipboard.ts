import { mxCell } from '../model/mxCell';
import { mxGraph } from '../view/mxGraph';

export class MxClipboard {
  STEPSIZE: number = 10;
  insertCount: number = 1;
  cells: mxCell[] = [];

  setCells(cells) {
    mxClipboard.cells = cells;
  }

  getCells() {
    return mxClipboard.cells;
  }

  isEmpty() {
    return !mxClipboard.getCells();
  }

  cut(graph: mxGraph, cells: mxCell[] = []) {
    cells = mxClipboard.copy(graph, cells);
    mxClipboard.insertCount = 0;
    mxClipboard.removeCells(graph, cells);
    return cells;
  }

  removeCells(graph: mxGraph, cells: mxCell[] = []) {
    graph.removeCells(cells);
  }

  copy(graph: mxGraph, cells: mxCell[] = []) {
    cells = cells || graph.getSelectionCells();
    const result = graph.getExportableCells(graph.model.getTopmostCells(cells));
    mxClipboard.insertCount = 1;
    mxClipboard.setCells(graph.cloneCells(result));
    return result;
  }

  paste(graph: mxGraph) {
    let cells: mxCell[] = [];
    if (!mxClipboard.isEmpty()) {
      cells = graph.getImportableCells(mxClipboard.getCells());
      const delta = mxClipboard.insertCount * mxClipboard.STEPSIZE;
      const parent = graph.getDefaultParent();
      cells = graph.importCells(cells, delta, delta, parent);
      mxClipboard.insertCount++;
      graph.setSelectionCells(cells);
    }
    return cells;
  }
}

export let mxClipboard = new MxClipboard();
