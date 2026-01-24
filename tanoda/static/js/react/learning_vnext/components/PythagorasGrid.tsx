/**
 * PythagorasGrid Component
 * ========================
 *
 * The Pythagoras table - central knowledge space visualization.
 * MASTER_SPEC: "A teljes mátrix látszik, csak aktív szint cellái aktívak"
 */

import React, { useMemo } from 'react';
import { useLearningStore } from '../store';
import type { CellState, GridCell } from '../types';

// ============================================================================
// CELL COMPONENT
// ============================================================================

interface PythagoraCellProps {
  row: number;
  col: number;
  product: number;
  state: CellState;
  isActive: boolean;
  isHighlighted: boolean;
  attempts: number;
  correct: number;
}

const PythagorasCell: React.FC<PythagoraCellProps> = ({
  row,
  col,
  product,
  state,
  isActive,
  isHighlighted,
  attempts,
  correct,
}) => {
  const getCellClass = () => {
    let classes = ['pythagoras-cell'];

    if (!isActive) {
      classes.push('inactive');
    } else {
      classes.push(`state-${state}`);
    }

    if (isHighlighted) {
      classes.push('highlighted');
    }

    // Add diagonal highlight for squares
    if (row === col) {
      classes.push('diagonal');
    }

    return classes.join(' ');
  };

  const getTooltip = () => {
    if (!isActive) {
      return `${row} × ${col} = ${product} (más szint)`;
    }

    const stateLabels: Record<CellState, string> = {
      unseen: 'Nem látott',
      incorrect_recent: 'Nemrég hibás',
      correct_once: 'Egyszer helyes',
      correct_stable: 'Stabilan helyes',
      mastered: 'Elsajátított',
    };

    return `${row} × ${col} = ${product}\n${stateLabels[state]}\nPróbálkozások: ${attempts}\nHelyes: ${correct}`;
  };

  return (
    <div
      className={getCellClass()}
      title={getTooltip()}
      data-row={row}
      data-col={col}
    >
      <span className="cell-product">{product}</span>
      {isActive && state === 'mastered' && (
        <span className="cell-mastered-badge">★</span>
      )}
    </div>
  );
};

// ============================================================================
// HEADER CELL
// ============================================================================

interface HeaderCellProps {
  value: number;
  type: 'row' | 'col';
  isHighlighted: boolean;
}

const HeaderCell: React.FC<HeaderCellProps> = ({
  value,
  type,
  isHighlighted,
}) => {
  return (
    <div className={`header-cell ${type} ${isHighlighted ? 'highlighted' : ''}`}>
      {value}
    </div>
  );
};

// ============================================================================
// LEGEND
// ============================================================================

const GridLegend: React.FC = () => {
  const states: Array<{ state: CellState; label: string; color: string }> = [
    { state: 'unseen', label: 'Nem látott', color: '#f3f4f6' },
    { state: 'incorrect_recent', label: 'Hibás', color: '#fecaca' },
    { state: 'correct_once', label: 'Egyszer helyes', color: '#fef3c7' },
    { state: 'correct_stable', label: 'Stabil', color: '#bbf7d0' },
    { state: 'mastered', label: 'Elsajátított', color: '#86efac' },
  ];

  return (
    <div className="grid-legend">
      {states.map(({ state, label, color }) => (
        <div key={state} className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: color }}
          />
          <span className="legend-label">{label}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// STATS SUMMARY
// ============================================================================

interface GridStatsProps {
  grid: GridCell[][] | null;
}

const GridStats: React.FC<GridStatsProps> = ({ grid }) => {
  const stats = useMemo(() => {
    if (!grid) return null;

    const allCells = grid.flat();
    const total = allCells.length;
    const mastered = allCells.filter((c) => c.state === 'mastered').length;
    const stable = allCells.filter((c) => c.state === 'correct_stable').length;
    const once = allCells.filter((c) => c.state === 'correct_once').length;
    const incorrect = allCells.filter((c) => c.state === 'incorrect_recent').length;
    const unseen = allCells.filter((c) => c.state === 'unseen').length;

    return {
      total,
      mastered,
      stable,
      once,
      incorrect,
      unseen,
      progress: ((mastered + stable) / total) * 100,
    };
  }, [grid]);

  if (!stats) return null;

  return (
    <div className="grid-stats">
      <div className="stats-progress-bar">
        <div
          className="stats-fill mastered"
          style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
        />
        <div
          className="stats-fill stable"
          style={{ width: `${(stats.stable / stats.total) * 100}%` }}
        />
        <div
          className="stats-fill once"
          style={{ width: `${(stats.once / stats.total) * 100}%` }}
        />
      </div>
      <div className="stats-numbers">
        <span className="stat mastered">{stats.mastered} elsajátított</span>
        <span className="stat stable">{stats.stable} stabil</span>
        <span className="stat unseen">{stats.unseen} hátralévő</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN GRID
// ============================================================================

const PythagorasGrid: React.FC = () => {
  const { pythagoras, currentTask, currentLevel, fetchPythagorasGrid } =
    useLearningStore();

  // Determine highlighted row/col from current task
  const highlightedRow = currentTask?.operand1
    ? Math.abs(currentTask.operand1)
    : null;
  const highlightedCol = currentTask?.operand2
    ? Math.abs(currentTask.operand2)
    : null;

  // Generate grid if not loaded
  const maxOperand = pythagoras?.max_operand || 10;
  const gridData = pythagoras?.grid;

  // Determine which cells are active based on current level
  const levelRange = currentLevel; // Level 1 = 1-2, Level 9 = 1-10, etc.

  const isActiveLevelCell = (row: number, col: number): boolean => {
    // For simplicity, cells up to the level range are active
    return row <= levelRange + 1 && col <= levelRange + 1;
  };

  if (!gridData) {
    return (
      <div className="pythagoras-grid loading">
        <div className="loading-spinner" />
        <p>Pythagoras tábla betöltése...</p>
        <button onClick={() => fetchPythagorasGrid()}>Újratöltés</button>
      </div>
    );
  }

  return (
    <div className="pythagoras-grid-container">
      <h3 className="panel-title">Pythagorasz-tábla</h3>

      <GridLegend />

      <div className="pythagoras-grid">
        {/* Corner cell */}
        <div className="header-cell corner">×</div>

        {/* Column headers */}
        {Array.from({ length: maxOperand }, (_, i) => i + 1).map((col) => (
          <HeaderCell
            key={`col-${col}`}
            value={col}
            type="col"
            isHighlighted={col === highlightedCol}
          />
        ))}

        {/* Grid rows */}
        {gridData.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex + 1}`}>
            {/* Row header */}
            <HeaderCell
              value={rowIndex + 1}
              type="row"
              isHighlighted={rowIndex + 1 === highlightedRow}
            />

            {/* Cells */}
            {row.map((cell) => (
              <PythagorasCell
                key={`cell-${cell.row}-${cell.col}`}
                row={cell.row}
                col={cell.col}
                product={cell.product}
                state={cell.state}
                isActive={isActiveLevelCell(cell.row, cell.col)}
                isHighlighted={
                  cell.row === highlightedRow && cell.col === highlightedCol
                }
                attempts={cell.attempts}
                correct={cell.correct}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <GridStats grid={gridData} />
    </div>
  );
};

export default PythagorasGrid;
export { PythagorasCell, HeaderCell, GridLegend, GridStats };
