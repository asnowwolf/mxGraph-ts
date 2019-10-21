export let mxClipboard = {
  STEPSIZE: 10, insertCount: 1, cells: null, setCells(cells) {
    mxClipboard.cells = cells;
  }, getCells() {
    return mxClipboard.cells;
  }, isEmpty() {
    return !mxClipboard.getCells();
  }, cut(graph, cells) {
    cells = mxClipboard.copy(graph, cells);
    mxClipboard.insertCount = 0;
    mxClipboard.removeCells(graph, cells);
    return cells;
  }, removeCells(graph, cells) {
    graph.removeCells(cells);
  }, copy(graph, cells) {
    cells = cells || graph.getSelectionCells();
    const result = graph.getExportableCells(graph.model.getTopmostCells(cells));
    mxClipboard.insertCount = 1;
    mxClipboard.setCells(graph.cloneCells(result));
    return result;
  }, paste(graph) {
    let cells = undefined;
    if (!mxClipboard.isEmpty()) {
      cells = graph.getImportableCells(mxClipboard.getCells());
      const delta = mxClipboard.insertCount * mxClipboard.STEPSIZE;
      const parent = graph.getDefaultParent();
      cells = graph.importCells(cells, delta, delta, parent);
      mxClipboard.insertCount++;
      graph.setSelectionCells(cells);
    }
    return cells;
  },
};
