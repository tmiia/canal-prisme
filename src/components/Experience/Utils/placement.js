/**
 * Grid-based placement system for gallery layers.
 * Creates a grid where ~65% of cells are usable (center excluded),
 * and supports cross-layer exclusion so layers don't overlap.
 */
export default class GridPlacement {
  /**
   * @param {{width: number, height: number}} viewport
   * @param {Object} [options]
   * @param {number} [options.cols=6]
   * @param {number} [options.rows=4]
   * @param {number} [options.centerExclusionRadius=0.45]
   * @param {number} [options.availabilityRatio=0.65]
   */
  constructor(viewport, options = {}) {
    this.cols = options.cols || 6;
    this.rows = options.rows || 4;
    this.vpW = viewport.width;
    this.vpH = viewport.height;
    this.cellW = this.vpW / this.cols;
    this.cellH = this.vpH / this.rows;

    const centerExclusion = options.centerExclusionRadius ?? 0.45;
    const availabilityRatio = options.availabilityRatio ?? 0.65;

    const centerCol = (this.cols - 1) / 2;
    const centerRow = (this.rows - 1) / 2;

    const nonCenterCells = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const dx = (c - centerCol) / Math.max(centerCol, 1);
        const dy = (r - centerRow) / Math.max(centerRow, 1);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < centerExclusion) continue;

        nonCenterCells.push({ col: c, row: r, index: r * this.cols + c });
      }
    }

    const targetCount = Math.round(this.cols * this.rows * availabilityRatio);
    const shuffled = _shuffle([...nonCenterCells]);
    this.availableCells = shuffled.slice(
      0,
      Math.min(targetCount, nonCenterCells.length),
    );
  }

  /**
   * Pick `count` cells not in `occupiedSet`. Resets pool if exhausted.
   * Returns world-centered coordinates with small jitter for organic feel.
   * @param {number} count
   * @param {Set<number>} occupiedSet
   * @returns {Array<{x: number, y: number, cellIndex: number}>}
   */
  assignCells(count, occupiedSet) {
    let pool = this.availableCells.filter((c) => !occupiedSet.has(c.index));

    if (pool.length < count) {
      pool = [...this.availableCells];
    }

    const selected = _shuffle([...pool]).slice(0, count);

    return selected.map((cell) => {
      const x = (cell.col + 0.5) * this.cellW - this.vpW / 2;
      const y = -((cell.row + 0.5) * this.cellH - this.vpH / 2);

      const jitterX = (Math.random() - 0.5) * this.cellW * 0.25;
      const jitterY = (Math.random() - 0.5) * this.cellH * 0.25;

      return {
        x: x + jitterX,
        y: y + jitterY,
        cellIndex: cell.index,
      };
    });
  }
}

function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
