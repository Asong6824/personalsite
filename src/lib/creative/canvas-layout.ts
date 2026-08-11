export const CREATIVE_CANVAS_ROWS = 4;
export const CREATIVE_CANVAS_MIN_COLUMNS = 15;
export const CREATIVE_CANVAS_COLUMN_STEP = 5;

export type CreativeCanvasTone = "light" | "dark" | "accent" | "image" | "neutral";

export interface CreativeCanvasSize {
  columns: number;
  rows: number;
}

export interface CreativeCanvasAnchor {
  column: number;
  row: number;
}

export interface CreativeCanvasLayoutItem {
  id: string;
  sizes: CreativeCanvasSize[];
  tone?: CreativeCanvasTone;
  priority?: number;
  order?: number;
  anchor?: CreativeCanvasAnchor;
}

export interface CreativeCanvasPlacement extends CreativeCanvasSize {
  id: string;
  column: number;
  row: number;
  tone: CreativeCanvasTone;
}

export interface CreativeCanvasLayoutOptions {
  rows?: number;
  minColumns?: number;
  columnStep?: number;
  seed?: string;
  fillEmpty?: boolean;
  fillerIdPrefix?: string;
}

export interface CreativeCanvasLayout {
  rows: number;
  columns: number;
  placements: CreativeCanvasPlacement[];
  byId: Record<string, CreativeCanvasPlacement>;
}

interface Candidate extends CreativeCanvasPlacement {
  score: number;
}

function roundUp(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

export function stableCreativeHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rowMask(row: number, rowSpan: number) {
  return ((1 << rowSpan) - 1) << row;
}

function canPlace(
  occupancy: number[],
  rows: number,
  column: number,
  row: number,
  size: CreativeCanvasSize,
) {
  if (column < 0 || row < 0 || row + size.rows > rows) {
    return false;
  }

  const mask = rowMask(row, size.rows);
  for (let offset = 0; offset < size.columns; offset += 1) {
    if ((occupancy[column + offset] ?? 0) & mask) {
      return false;
    }
  }
  return true;
}

function occupy(occupancy: number[], placement: CreativeCanvasPlacement) {
  const mask = rowMask(placement.row, placement.rows);
  for (let offset = 0; offset < placement.columns; offset += 1) {
    const column = placement.column + offset;
    occupancy[column] = (occupancy[column] ?? 0) | mask;
  }
}

function sharesEdge(a: CreativeCanvasPlacement, b: CreativeCanvasPlacement) {
  const aRight = a.column + a.columns;
  const bRight = b.column + b.columns;
  const aBottom = a.row + a.rows;
  const bBottom = b.row + b.rows;
  const verticalOverlap = Math.min(aBottom, bBottom) - Math.max(a.row, b.row);
  const horizontalOverlap = Math.min(aRight, bRight) - Math.max(a.column, b.column);

  return (
    ((aRight === b.column || bRight === a.column) && verticalOverlap > 0) ||
    ((aBottom === b.row || bBottom === a.row) && horizontalOverlap > 0)
  );
}

function alignmentCount(candidate: CreativeCanvasPlacement, placed: CreativeCanvasPlacement[]) {
  const candidateRight = candidate.column + candidate.columns;
  const candidateBottom = candidate.row + candidate.rows;

  return placed.reduce((count, placement) => {
    const placementRight = placement.column + placement.columns;
    const placementBottom = placement.row + placement.rows;
    return count
      + Number(candidate.column === placement.column)
      + Number(candidateRight === placementRight)
      + Number(candidate.row === placement.row)
      + Number(candidateBottom === placementBottom);
  }, 0);
}

function holePenalty(
  occupancy: number[],
  rows: number,
  candidate: CreativeCanvasPlacement,
) {
  const simulated = occupancy.slice();
  occupy(simulated, candidate);
  const lastColumn = candidate.column + candidate.columns;
  let holes = 0;

  for (let column = 0; column < lastColumn; column += 1) {
    const mask = simulated[column] ?? 0;
    for (let row = 0; row < rows; row += 1) {
      if ((mask & (1 << row)) !== 0) {
        continue;
      }

      const aboveFilled = row === 0 || (mask & (1 << (row - 1))) !== 0;
      const belowFilled = row === rows - 1 || (mask & (1 << (row + 1))) !== 0;
      const leftFilled = column === 0 || ((simulated[column - 1] ?? 0) & (1 << row)) !== 0;
      const rightFilled = ((simulated[column + 1] ?? 0) & (1 << row)) !== 0;

      if (aboveFilled && belowFilled && leftFilled && rightFilled) {
        holes += 1;
      }
    }
  }

  return holes;
}

function candidateScore(
  item: CreativeCanvasLayoutItem,
  candidate: CreativeCanvasPlacement,
  occupancy: number[],
  placed: CreativeCanvasPlacement[],
  rows: number,
  currentColumns: number,
  sizeIndex: number,
  seed: string,
) {
  const candidateRight = candidate.column + candidate.columns;
  const extension = Math.max(0, candidateRight - currentColumns);
  const anchorDistance = item.anchor
    ? Math.abs(candidate.column - item.anchor.column) + Math.abs(candidate.row - item.anchor.row)
    : 0;
  const adjacent = placed.filter((placement) => sharesEdge(candidate, placement));
  const sameTone = adjacent.filter((placement) => placement.tone === candidate.tone).length;
  const sameSize = adjacent.filter(
    (placement) => placement.columns === candidate.columns && placement.rows === candidate.rows,
  ).length;
  const preferredRow = stableCreativeHash(`${seed}:${item.id}:row`) % Math.max(1, rows - candidate.rows + 1);
  const jitter = (stableCreativeHash(
    `${seed}:${item.id}:${candidate.column}:${candidate.row}:${candidate.columns}:${candidate.rows}`,
  ) % 1000) / 10000;

  return (
    anchorDistance * 40
    + extension * 12
    + candidate.column * 0.35
    + Math.abs(candidate.row - preferredRow) * 1.4
    + sameTone * 7
    + sameSize * 4
    + holePenalty(occupancy, rows, candidate) * 9
    + sizeIndex * 0.75
    - alignmentCount(candidate, placed) * 1.5
    + jitter
  );
}

function normalizeSizes(sizes: CreativeCanvasSize[], rows: number) {
  const seen = new Set<string>();
  return sizes.filter((size) => {
    const key = `${size.columns}x${size.rows}`;
    if (
      seen.has(key)
      || size.columns < 1
      || size.rows < 1
      || size.rows > rows
    ) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

interface DenseShape extends CreativeCanvasSize {
  key: string;
  count: number;
}

interface DenseSlot extends CreativeCanvasSize {
  key: string;
  column: number;
  row: number;
}

function release(occupancy: number[], placement: CreativeCanvasPlacement) {
  const mask = rowMask(placement.row, placement.rows);
  for (let offset = 0; offset < placement.columns; offset += 1) {
    const column = placement.column + offset;
    occupancy[column] = (occupancy[column] ?? 0) & ~mask;
  }
}

function firstEmptyCell(occupancy: number[], rows: number, columns: number) {
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      if (((occupancy[column] ?? 0) & (1 << row)) === 0) {
        return { column, row };
      }
    }
  }
  return null;
}

function solveDenseSlots(
  occupancy: number[],
  shapes: DenseShape[],
  rows: number,
  columns: number,
) {
  const slots: DenseSlot[] = [];
  const failed = new Set<string>();
  let visitedStates = 0;
  const maxStates = 250_000;

  const search = (): boolean => {
    visitedStates += 1;
    if (visitedStates > maxStates) return false;

    const empty = firstEmptyCell(occupancy, rows, columns);
    if (!empty) return shapes.every((shape) => shape.count === 0);

    const stateKey = `${occupancy.join(",")}|${shapes.map((shape) => shape.count).join(",")}`;
    if (failed.has(stateKey)) return false;

    for (const shape of shapes) {
      if (shape.count === 0 || !canPlace(occupancy, rows, empty.column, empty.row, shape)) {
        continue;
      }

      const placement: CreativeCanvasPlacement = {
        id: shape.key,
        column: empty.column,
        row: empty.row,
        columns: shape.columns,
        rows: shape.rows,
        tone: "neutral",
      };
      shape.count -= 1;
      occupy(occupancy, placement);
      slots.push({ ...placement, key: shape.key });

      if (search()) return true;

      slots.pop();
      release(occupancy, placement);
      shape.count += 1;
    }

    failed.add(stateKey);
    return false;
  };

  return search() ? slots : null;
}

function createDenseAtomicLayout(
  items: Array<CreativeCanvasLayoutItem & { sizes: CreativeCanvasSize[] }>,
  rows: number,
  minColumns: number,
  columnStep: number,
  fillerIdPrefix: string,
): CreativeCanvasLayout | null {
  if (!items.every((item) => item.sizes.length === 1)) return null;

  const totalArea = items.reduce(
    (total, item) => total + item.sizes[0].columns * item.sizes[0].rows,
    0,
  );

  for (
    let columns = Math.max(minColumns, roundUp(Math.ceil(totalArea / rows), columnStep));
    columns <= Math.max(minColumns, roundUp(Math.ceil(totalArea / rows), columnStep)) + columnStep * 4;
    columns += columnStep
  ) {
    const occupancy: number[] = [];
    const anchored: CreativeCanvasPlacement[] = [];
    let anchorsValid = true;

    for (const item of items.filter((candidate) => candidate.anchor)) {
      const size = item.sizes[0];
      if (
        item.anchor!.column + size.columns > columns
        || !canPlace(occupancy, rows, item.anchor!.column, item.anchor!.row, size)
      ) {
        anchorsValid = false;
        break;
      }
      const placement: CreativeCanvasPlacement = {
        id: item.id,
        column: item.anchor!.column,
        row: item.anchor!.row,
        columns: size.columns,
        rows: size.rows,
        tone: item.tone ?? "neutral",
      };
      occupy(occupancy, placement);
      anchored.push(placement);
    }

    if (!anchorsValid) continue;

    const unanchored = items.filter((item) => !item.anchor);
    const itemQueues = new Map<string, typeof unanchored>();
    for (const item of unanchored) {
      const size = item.sizes[0];
      const key = `${size.columns}x${size.rows}`;
      itemQueues.set(key, [...(itemQueues.get(key) ?? []), item]);
    }

    const fillerCount = columns * rows - totalArea;
    const shapes = Array.from(itemQueues.entries())
      .map(([key, queue]): DenseShape => ({
        key,
        columns: queue[0].sizes[0].columns,
        rows: queue[0].sizes[0].rows,
        count: queue.length,
      }));
    if (fillerCount > 0) {
      const unitShape = shapes.find((shape) => shape.key === "1x1");
      if (unitShape) unitShape.count += fillerCount;
      else shapes.push({ key: "1x1", columns: 1, rows: 1, count: fillerCount });
    }
    shapes.sort((left, right) => right.columns * right.rows - left.columns * left.rows);

    const slots = solveDenseSlots(occupancy, shapes, rows, columns);
    if (!slots) continue;

    const generated: CreativeCanvasPlacement[] = [];
    let fillerIndex = 0;
    for (const slot of slots) {
      const queue = itemQueues.get(slot.key);
      const item = queue?.shift();
      generated.push({
        id: item?.id ?? `${fillerIdPrefix}-${fillerIndex++}`,
        column: slot.column,
        row: slot.row,
        columns: slot.columns,
        rows: slot.rows,
        tone: item?.tone ?? "neutral",
      });
    }

    const packed = [...anchored, ...generated];
    const contentPlacements = items
      .map((item) => packed.find((placement) => placement.id === item.id))
      .filter((placement): placement is CreativeCanvasPlacement => Boolean(placement));
    const fillerPlacements = packed.filter((placement) => placement.id.startsWith(`${fillerIdPrefix}-`));
    const placements = [...contentPlacements, ...fillerPlacements];
    const byId = Object.fromEntries(placements.map((placement) => [placement.id, placement]));
    return { rows, columns, placements, byId };
  }

  return null;
}

export function createCreativeCanvasLayout(
  items: CreativeCanvasLayoutItem[],
  options: CreativeCanvasLayoutOptions = {},
): CreativeCanvasLayout {
  const rows = options.rows ?? CREATIVE_CANVAS_ROWS;
  const minColumns = options.minColumns ?? CREATIVE_CANVAS_MIN_COLUMNS;
  const columnStep = options.columnStep ?? CREATIVE_CANVAS_COLUMN_STEP;
  const seed = options.seed ?? "creative-canvas-v1";
  const fillEmpty = options.fillEmpty ?? false;
  const fillerIdPrefix = options.fillerIdPrefix ?? "unit";
  const occupancy: number[] = [];
  const placed: CreativeCanvasPlacement[] = [];
  let currentColumns = minColumns;

  const normalizedItems = items
    .map((item) => ({ ...item, sizes: normalizeSizes(item.sizes, rows) }))
    .filter((item) => item.sizes.length > 0)
    .sort((a, b) => {
      const anchorOrder = Number(Boolean(b.anchor)) - Number(Boolean(a.anchor));
      if (anchorOrder !== 0) return anchorOrder;
      const aArea = Math.max(...a.sizes.map((size) => size.columns * size.rows));
      const bArea = Math.max(...b.sizes.map((size) => size.columns * size.rows));
      if (aArea !== bArea) return bArea - aArea;
      const priorityOrder = (b.priority ?? 0) - (a.priority ?? 0);
      if (priorityOrder !== 0) return priorityOrder;
      const explicitOrder = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
      if (explicitOrder !== 0) return explicitOrder;
      return stableCreativeHash(`${seed}:${a.id}`) - stableCreativeHash(`${seed}:${b.id}`);
    });

  if (fillEmpty) {
    const denseLayout = createDenseAtomicLayout(
      normalizedItems,
      rows,
      minColumns,
      columnStep,
      fillerIdPrefix,
    );
    if (denseLayout) return denseLayout;
  }

  for (const item of normalizedItems) {
    const tone = item.tone ?? "neutral";
    let best: Candidate | null = null;

    if (item.anchor) {
      for (const [sizeIndex, size] of item.sizes.entries()) {
        if (!canPlace(occupancy, rows, item.anchor!.column, item.anchor!.row, size)) {
          continue;
        }
        const placement: CreativeCanvasPlacement = {
          id: item.id,
          column: item.anchor!.column,
          row: item.anchor!.row,
          columns: size.columns,
          rows: size.rows,
          tone,
        };
        const anchoredCandidate: Candidate = {
          ...placement,
          score: candidateScore(
            item,
            placement,
            occupancy,
            placed,
            rows,
            currentColumns,
            sizeIndex,
            seed,
          ) - 1000,
        };
        if (!best || anchoredCandidate.score < best.score) {
          best = anchoredCandidate;
        }
      }
    }

    let searchColumns = Math.max(
      currentColumns + columnStep,
      item.anchor ? item.anchor.column + Math.max(...item.sizes.map((size) => size.columns)) : 0,
    );

    while (!best) {
      for (const [sizeIndex, size] of item.sizes.entries()) {
        for (let column = 0; column <= searchColumns - size.columns; column += 1) {
          for (let row = 0; row <= rows - size.rows; row += 1) {
            if (!canPlace(occupancy, rows, column, row, size)) {
              continue;
            }
            const placement: CreativeCanvasPlacement = {
              id: item.id,
              column,
              row,
              columns: size.columns,
              rows: size.rows,
              tone,
            };
            const score = candidateScore(
              item,
              placement,
              occupancy,
              placed,
              rows,
              currentColumns,
              sizeIndex,
              seed,
            );
            if (!best || score < best.score) {
              best = { ...placement, score };
            }
          }
        }
      }

      if (!best) {
        searchColumns += columnStep;
      }
    }

    const placement: CreativeCanvasPlacement = {
      id: best.id,
      column: best.column,
      row: best.row,
      columns: best.columns,
      rows: best.rows,
      tone: best.tone,
    };
    occupy(occupancy, placement);
    placed.push(placement);
    currentColumns = Math.max(
      minColumns,
      roundUp(placement.column + placement.columns, columnStep),
    );
  }

  const usedColumns = placed.reduce(
    (maximum, placement) => Math.max(maximum, placement.column + placement.columns),
    0,
  );
  const columns = Math.max(minColumns, roundUp(usedColumns, columnStep));
  const contentPlacements = items
    .map((item) => placed.find((placement) => placement.id === item.id))
    .filter((placement): placement is CreativeCanvasPlacement => Boolean(placement));
  const fillerPlacements: CreativeCanvasPlacement[] = [];

  if (fillEmpty) {
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        if ((occupancy[column] ?? 0) & (1 << row)) continue;
        const filler: CreativeCanvasPlacement = {
          id: `${fillerIdPrefix}-${column}-${row}`,
          column,
          row,
          columns: 1,
          rows: 1,
          tone: "neutral",
        };
        occupy(occupancy, filler);
        fillerPlacements.push(filler);
      }
    }
  }

  const placements = [...contentPlacements, ...fillerPlacements];
  const byId = Object.fromEntries(placements.map((placement) => [placement.id, placement]));

  return { rows, columns, placements, byId };
}

export function creativePlacementsOverlap(
  a: CreativeCanvasPlacement,
  b: CreativeCanvasPlacement,
) {
  return !(
    a.column + a.columns <= b.column
    || b.column + b.columns <= a.column
    || a.row + a.rows <= b.row
    || b.row + b.rows <= a.row
  );
}
