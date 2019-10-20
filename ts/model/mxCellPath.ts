export let mxCellPath = {
  PATH_SEPARATOR: '.', create(cell) {
    let result = '';
    if (cell != null) {
      let parent = cell.getParent();
      while (parent != null) {
        const index = parent.getIndex(cell);
        result = index + mxCellPath.PATH_SEPARATOR + result;
        cell = parent;
        parent = cell.getParent();
      }
    }
    const n = result.length;
    if (n > 1) {
      result = result.substring(0, n - 1);
    }
    return result;
  }, getParentPath(path) {
    if (path != null) {
      const index = path.lastIndexOf(mxCellPath.PATH_SEPARATOR);
      if (index >= 0) {
        return path.substring(0, index);
      } else if (path.length > 0) {
        return '';
      }
    }
    return null;
  }, resolve(root, path) {
    let parent = root;
    if (path != null) {
      const tokens = path.split(mxCellPath.PATH_SEPARATOR);
      for (let i = 0; i < tokens.length; i++) {
        parent = parent.getChildAt(parseInt(tokens[i]));
      }
    }
    return parent;
  }, compare(p1, p2) {
    const min = Math.min(p1.length, p2.length);
    let comp = 0;
    for (let i = 0; i < min; i++) {
      if (p1[i] != p2[i]) {
        if (p1[i].length == 0 || p2[i].length == 0) {
          comp = (p1[i] == p2[i]) ? 0 : ((p1[i] > p2[i]) ? 1 : -1);
        } else {
          const t1 = parseInt(p1[i]);
          const t2 = parseInt(p2[i]);
          comp = (t1 == t2) ? 0 : ((t1 > t2) ? 1 : -1);
        }
        break;
      }
    }
    if (comp == 0) {
      const t1 = p1.length;
      const t2 = p2.length;
      if (t1 != t2) {
        comp = (t1 > t2) ? 1 : -1;
      }
    }
    return comp;
  },
};
