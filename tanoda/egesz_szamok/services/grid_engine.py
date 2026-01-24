"""
Grid Engine Service
===================

IMPLEMENTATION PROMPT specification:
- Deterministic state transitions only
- No randomness
- No UI logic

Manages Pythagoras grid cell state transitions.
"""

from typing import Optional
from django.db import transaction

from ..models import GridCellState, LevelDefinition, CellState


class GridEngine:
    """
    Deterministic grid state management.

    PROMPT REQUIREMENT: Pure business logic, no randomness, no UI coupling.
    """

    @classmethod
    @transaction.atomic
    def update_cell_from_attempt(
        cls,
        user,
        level: LevelDefinition,
        epoch: int,
        cell_key: str,
        is_correct: bool
    ) -> GridCellState:
        """
        Update a single cell based on attempt result.

        PROMPT REQUIREMENT: Deterministic state transitions.

        Args:
            user: User object
            level: LevelDefinition object
            epoch: Current epoch
            cell_key: Cell identifier (e.g. "6x7")
            is_correct: Whether the attempt was correct

        Returns:
            Updated GridCellState
        """
        cell = GridCellState.get_or_create_cell(
            user=user,
            level=level,
            epoch=epoch,
            cell_key=cell_key
        )

        cell.update_from_attempt(is_correct)
        return cell

    @classmethod
    def get_cell_state(
        cls,
        user,
        level: LevelDefinition,
        epoch: int,
        cell_key: str
    ) -> CellState:
        """Get the current state of a cell"""
        try:
            cell = GridCellState.objects.get(
                user=user,
                level=level,
                epoch=epoch,
                cell_key=cell_key
            )
            return cell.state
        except GridCellState.DoesNotExist:
            return CellState.UNSEEN

    @classmethod
    def get_grid_for_level(
        cls,
        user,
        level: LevelDefinition,
        epoch: int
    ) -> dict:
        """
        Get full grid state for a level.

        Returns:
            Dict with cell_key -> state mapping
        """
        cells = GridCellState.objects.filter(
            user=user,
            level=level,
            epoch=epoch
        )

        grid_state = {}
        for cell in cells:
            grid_state[cell.cell_key] = {
                'state': cell.state,
                'correct_count': cell.correct_count,
                'incorrect_count': cell.incorrect_count,
                'attempts': cell.attempts,
                'consecutive_correct': cell.consecutive_correct,
            }

        # Fill in unseen cells from level definition
        for cell_key in level.cell_keys:
            if cell_key not in grid_state:
                grid_state[cell_key] = {
                    'state': CellState.UNSEEN,
                    'correct_count': 0,
                    'incorrect_count': 0,
                    'attempts': 0,
                    'consecutive_correct': 0,
                }

        return grid_state

    @classmethod
    def get_weak_cells(
        cls,
        user,
        level: LevelDefinition,
        epoch: int
    ) -> list[str]:
        """
        Get list of weak cell keys for targeted practice.

        PROMPT REQUIREMENT: Deterministic selection (no randomness).

        Returns cells that are:
        - UNSEEN
        - INCORRECT_RECENT
        - Have low correct_count
        """
        weak_states = [CellState.UNSEEN, CellState.INCORRECT_RECENT]

        weak_cells = list(GridCellState.objects.filter(
            user=user,
            level=level,
            epoch=epoch,
            state__in=weak_states
        ).values_list('cell_key', flat=True))

        return weak_cells

    @classmethod
    def get_grid_statistics(
        cls,
        user,
        level: LevelDefinition,
        epoch: int
    ) -> dict:
        """Get statistics about grid mastery"""
        cells = GridCellState.objects.filter(
            user=user,
            level=level,
            epoch=epoch
        )

        total_cells = len(level.cell_keys)
        mastered = cells.filter(state=CellState.MASTERED).count()
        stable = cells.filter(state=CellState.CORRECT_STABLE).count()
        once = cells.filter(state=CellState.CORRECT_ONCE).count()
        incorrect = cells.filter(state=CellState.INCORRECT_RECENT).count()
        unseen = total_cells - cells.count()

        return {
            'total_cells': total_cells,
            'mastered': mastered,
            'stable': stable,
            'once': once,
            'incorrect': incorrect,
            'unseen': unseen,
            'progress_percentage': ((mastered + stable) / total_cells * 100) if total_cells > 0 else 0,
        }
