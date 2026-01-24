"""
Task Generator Service
======================

Module-parameterized task generation.
MASTER_SPEC: "a learning engine nem modul-specifikus, hanem modul-paraméterezett"
"""

import random
from typing import Optional
from dataclasses import dataclass
from enum import Enum

from ..models_vnext import LearningModule, GridCellState, CellState


@dataclass
class Task:
    """A learning task"""
    module: str
    level: int
    operand1: int
    operand2: int
    correct_answer: int
    operation: str = 'multiply'
    hint: Optional[str] = None


class TaskGenerator:
    """
    Generate tasks based on module, level, and user progress.
    Uses adaptive difficulty based on grid cell states.
    """

    # Level definitions for multiplication (szorzo ranges)
    MULTIPLICATION_LEVELS = {
        1: {'range': (1, 2), 'description': '1-2 szorzótábla'},
        2: {'range': (1, 3), 'description': '1-3 szorzótábla'},
        3: {'range': (1, 4), 'description': '1-4 szorzótábla'},
        4: {'range': (1, 5), 'description': '1-5 szorzótábla'},
        5: {'range': (1, 6), 'description': '1-6 szorzótábla'},
        6: {'range': (1, 7), 'description': '1-7 szorzótábla'},
        7: {'range': (1, 8), 'description': '1-8 szorzótábla'},
        8: {'range': (1, 9), 'description': '1-9 szorzótábla'},
        9: {'range': (1, 10), 'description': '1-10 szorzótábla'},
        10: {'range': (1, 10), 'description': 'Haladó: negatív számok', 'include_negative': True},
    }

    @classmethod
    def for_module(cls, module: str, level: int, epoch: int, user=None) -> Task:
        """
        Generate a task for the given module and level.

        Args:
            module: Learning module (multiplication, division, etc.)
            level: Difficulty level (1-10)
            epoch: Current epoch for the level
            user: Optional user for adaptive difficulty

        Returns:
            Task object with the generated problem
        """
        if module == LearningModule.MULTIPLICATION:
            return cls._generate_multiplication_task(level, epoch, user)
        elif module == LearningModule.DIVISION:
            return cls._generate_division_task(level, epoch, user)
        else:
            # Default to multiplication
            return cls._generate_multiplication_task(level, epoch, user)

    @classmethod
    def _generate_multiplication_task(cls, level: int, epoch: int, user=None) -> Task:
        """Generate a multiplication task for the given level"""
        level_config = cls.MULTIPLICATION_LEVELS.get(level, cls.MULTIPLICATION_LEVELS[1])
        min_val, max_val = level_config['range']
        include_negative = level_config.get('include_negative', False)

        # Get weak points if user is provided
        weak_cells = []
        if user:
            weak_cells = cls._get_weak_cells(user, LearningModule.MULTIPLICATION, level, epoch)

        # 30% chance to practice weak points if available
        if weak_cells and random.random() < 0.3:
            cell = random.choice(weak_cells)
            operand1 = cell['row']
            operand2 = cell['col']
        else:
            operand1 = random.randint(min_val, max_val)
            operand2 = random.randint(min_val, max_val)

        # Apply negative numbers for level 10
        if include_negative and random.random() < 0.5:
            if random.random() < 0.5:
                operand1 = -operand1
            else:
                operand2 = -operand2

        correct_answer = operand1 * operand2

        return Task(
            module=LearningModule.MULTIPLICATION,
            level=level,
            operand1=operand1,
            operand2=operand2,
            correct_answer=correct_answer,
            operation='multiply',
            hint=cls._generate_multiplication_hint(operand1, operand2)
        )

    @classmethod
    def _generate_division_task(cls, level: int, epoch: int, user=None) -> Task:
        """Generate a division task (inverse of multiplication)"""
        # Generate a multiplication first, then convert to division
        mult_task = cls._generate_multiplication_task(level, epoch, user)

        # result / operand2 = operand1
        dividend = mult_task.correct_answer
        divisor = mult_task.operand2 if mult_task.operand2 != 0 else 1
        quotient = mult_task.operand1

        return Task(
            module=LearningModule.DIVISION,
            level=level,
            operand1=dividend,
            operand2=divisor,
            correct_answer=quotient,
            operation='divide'
        )

    @classmethod
    def _get_weak_cells(cls, user, module: str, level: int, epoch: int) -> list:
        """Get cells where user has struggled"""
        weak_states = [CellState.INCORRECT_RECENT, CellState.UNSEEN]

        weak_cells = GridCellState.objects.filter(
            user=user,
            module=module,
            level=level,
            epoch=epoch,
            state__in=weak_states
        ).values('row', 'col')

        return list(weak_cells)

    @classmethod
    def _generate_multiplication_hint(cls, operand1: int, operand2: int) -> str:
        """Generate a pedagogical hint for multiplication"""
        abs1, abs2 = abs(operand1), abs(operand2)

        # Simple hints based on special cases
        if abs1 == 1:
            return f"Bármit 1-gyel szorozva az eredeti számot kapjuk"
        if abs2 == 1:
            return f"Bármit 1-gyel szorozva az eredeti számot kapjuk"
        if abs1 == 10:
            return f"10-zel szorzáskor csak egy 0-t teszünk a szám végére"
        if abs2 == 10:
            return f"10-zel szorzáskor csak egy 0-t teszünk a szám végére"
        if abs1 == 2:
            return f"2-vel szorzás = a szám megduplázása: {abs2} + {abs2}"
        if abs2 == 2:
            return f"2-vel szorzás = a szám megduplázása: {abs1} + {abs1}"
        if abs1 == 5:
            return f"5-tel szorzáskor: ha páros a szám, felezd és tégy 0-t a végére"
        if abs2 == 5:
            return f"5-tel szorzáskor: ha páros a szám, felezd és tégy 0-t a végére"
        if abs1 == 9:
            return f"9-cel szorzás: 10×{abs2} - {abs2} = {10*abs2} - {abs2}"
        if abs2 == 9:
            return f"9-cel szorzás: 10×{abs1} - {abs1} = {10*abs1} - {abs1}"

        return f"{abs1} × {abs2} = {abs1} hozzáadása {abs2}-szer"

    @classmethod
    def get_level_info(cls, module: str, level: int) -> dict:
        """Get information about a level"""
        if module == LearningModule.MULTIPLICATION:
            level_config = cls.MULTIPLICATION_LEVELS.get(level, cls.MULTIPLICATION_LEVELS[1])
            min_val, max_val = level_config['range']
            return {
                'level': level,
                'description': level_config['description'],
                'min_operand': min_val,
                'max_operand': max_val,
                'total_cells': max_val * max_val,
                'includes_negative': level_config.get('include_negative', False)
            }
        return {'level': level, 'description': f'Szint {level}'}

    @classmethod
    def get_all_levels(cls, module: str) -> list:
        """Get all level definitions for a module"""
        if module == LearningModule.MULTIPLICATION:
            return [cls.get_level_info(module, i) for i in range(1, 11)]
        return []
