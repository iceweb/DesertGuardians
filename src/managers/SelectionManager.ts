import Phaser from 'phaser';
import type { Tower } from '../objects/Tower';
import type { Creep } from '../objects/Creep';
import type { GoldMine } from '../objects/GoldMine';
import { GameEventBus, GameEventType } from './GameEventBus';

/**
 * Selectable entity types
 */
export const SelectableType = {
  TOWER: 'tower',
  CREEP: 'creep',
  MINE: 'mine',
  GROUND: 'ground',
  NONE: 'none',
} as const;

export type SelectableType = (typeof SelectableType)[keyof typeof SelectableType];

/**
 * Selection state interface
 */
export interface SelectionState {
  type: SelectableType;
  tower: Tower | null;
  creep: Creep | null;
  mine: GoldMine | null;
  position: { x: number; y: number } | null;
}

/**
 * Selection change event data
 */
export interface SelectionChangeEvent {
  previous: SelectionState;
  current: SelectionState;
}

/**
 * Selection change callback type
 */
export type SelectionChangeHandler = (event: SelectionChangeEvent) => void;

/**
 * SelectionManager - Centralizes selection state management
 *
 * Single source of truth for what is currently selected in the game.
 * Emits events when selection changes, allowing UI and other systems
 * to react without direct coupling.
 *
 * Usage:
 * ```
 * const selection = new SelectionManager(scene);
 *
 * selection.onChange((event) => {
 *   if (event.current.type === SelectableType.TOWER) {
 *     showTowerMenu(event.current.tower);
 *   }
 * });
 *
 * selection.selectTower(tower);
 * selection.clearSelection();
 * ```
 */
export class SelectionManager {
  private eventBus: GameEventBus;

  private currentSelection: SelectionState = {
    type: SelectableType.NONE,
    tower: null,
    creep: null,
    mine: null,
    position: null,
  };

  private changeHandlers: SelectionChangeHandler[] = [];
  private selectionGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, useEventBus: boolean = true) {
    this.eventBus = useEventBus ? GameEventBus.getInstance() : ({} as GameEventBus);

    // Create selection indicator graphics
    this.selectionGraphics = scene.add.graphics();
    this.selectionGraphics.setDepth(100);
  }

  /**
   * Get the current selection state
   */
  getSelection(): Readonly<SelectionState> {
    return this.currentSelection;
  }

  /**
   * Get the currently selected tower (convenience method)
   */
  getSelectedTower(): Tower | null {
    return this.currentSelection.tower;
  }

  /**
   * Get the currently selected creep (convenience method)
   */
  getSelectedCreep(): Creep | null {
    return this.currentSelection.creep;
  }

  /**
   * Check if anything is selected
   */
  hasSelection(): boolean {
    return this.currentSelection.type !== SelectableType.NONE;
  }

  /**
   * Check if a specific tower is selected
   */
  isTowerSelected(tower: Tower): boolean {
    return this.currentSelection.tower === tower;
  }

  /**
   * Select a tower
   */
  selectTower(tower: Tower): void {
    const previous = { ...this.currentSelection };

    // If same tower, don't re-select
    if (this.currentSelection.tower === tower) {
      return;
    }

    // Clear previous selection first
    if (this.currentSelection.tower) {
      this.emitDeselected(this.currentSelection.tower);
    }

    this.currentSelection = {
      type: SelectableType.TOWER,
      tower,
      creep: null,
      mine: null,
      position: { x: tower.x, y: tower.y },
    };

    this.updateSelectionIndicator();
    this.emitChange(previous);
    this.emitTowerSelected(tower);
  }

  /**
   * Select a creep
   */
  selectCreep(creep: Creep): void {
    const previous = { ...this.currentSelection };

    if (this.currentSelection.creep === creep) {
      return;
    }

    // Clear previous tower selection
    if (this.currentSelection.tower) {
      this.emitDeselected(this.currentSelection.tower);
    }

    this.currentSelection = {
      type: SelectableType.CREEP,
      tower: null,
      creep,
      mine: null,
      position: { x: creep.x, y: creep.y },
    };

    this.updateSelectionIndicator();
    this.emitChange(previous);
  }

  /**
   * Select a gold mine
   */
  selectMine(mine: GoldMine): void {
    const previous = { ...this.currentSelection };

    if (this.currentSelection.mine === mine) {
      return;
    }

    if (this.currentSelection.tower) {
      this.emitDeselected(this.currentSelection.tower);
    }

    this.currentSelection = {
      type: SelectableType.MINE,
      tower: null,
      creep: null,
      mine,
      position: { x: mine.x, y: mine.y },
    };

    this.updateSelectionIndicator();
    this.emitChange(previous);
  }

  /**
   * Select a ground position (for tower building)
   */
  selectGround(x: number, y: number): void {
    const previous = { ...this.currentSelection };

    if (this.currentSelection.tower) {
      this.emitDeselected(this.currentSelection.tower);
    }

    this.currentSelection = {
      type: SelectableType.GROUND,
      tower: null,
      creep: null,
      mine: null,
      position: { x, y },
    };

    this.updateSelectionIndicator();
    this.emitChange(previous);
  }

  /**
   * Clear the current selection
   */
  clearSelection(): void {
    if (this.currentSelection.type === SelectableType.NONE) {
      return;
    }

    const previous = { ...this.currentSelection };

    if (this.currentSelection.tower) {
      this.emitDeselected(this.currentSelection.tower);
    }

    this.currentSelection = {
      type: SelectableType.NONE,
      tower: null,
      creep: null,
      mine: null,
      position: null,
    };

    this.updateSelectionIndicator();
    this.emitChange(previous);
  }

  /**
   * Register a selection change handler
   */
  onChange(handler: SelectionChangeHandler): this {
    this.changeHandlers.push(handler);
    return this;
  }

  /**
   * Remove a selection change handler
   */
  offChange(handler: SelectionChangeHandler): this {
    const index = this.changeHandlers.indexOf(handler);
    if (index > -1) {
      this.changeHandlers.splice(index, 1);
    }
    return this;
  }

  /**
   * Update the visual selection indicator
   */
  private updateSelectionIndicator(): void {
    if (!this.selectionGraphics) return;

    this.selectionGraphics.clear();

    if (this.currentSelection.type === SelectableType.NONE) {
      return;
    }

    const pos = this.currentSelection.position;
    if (!pos) return;

    // Draw selection ring
    if (this.currentSelection.type === SelectableType.TOWER && this.currentSelection.tower) {
      const tower = this.currentSelection.tower;
      const config = tower.getConfig();

      // Range indicator
      this.selectionGraphics.lineStyle(2, 0xffffff, 0.3);
      this.selectionGraphics.strokeCircle(pos.x, pos.y, config.stats.range);

      // Selection ring
      this.selectionGraphics.lineStyle(3, 0xffd700, 0.8);
      this.selectionGraphics.strokeCircle(pos.x, pos.y, 30);
    } else if (this.currentSelection.type === SelectableType.CREEP) {
      this.selectionGraphics.lineStyle(2, 0xff6666, 0.8);
      this.selectionGraphics.strokeCircle(pos.x, pos.y, 25);
    } else if (this.currentSelection.type === SelectableType.MINE) {
      this.selectionGraphics.lineStyle(2, 0xffcc00, 0.8);
      this.selectionGraphics.strokeCircle(pos.x, pos.y, 35);
    } else if (this.currentSelection.type === SelectableType.GROUND) {
      this.selectionGraphics.lineStyle(2, 0x00ff00, 0.6);
      this.selectionGraphics.strokeCircle(pos.x, pos.y, 25);
    }
  }

  /**
   * Update selection indicator position (for moving targets like creeps)
   */
  update(): void {
    if (this.currentSelection.type === SelectableType.CREEP && this.currentSelection.creep) {
      const creep = this.currentSelection.creep;
      if (!creep.active) {
        // Creep died, clear selection
        this.clearSelection();
      } else {
        this.currentSelection.position = { x: creep.x, y: creep.y };
        this.updateSelectionIndicator();
      }
    }
  }

  /**
   * Emit change event to handlers
   */
  private emitChange(previous: SelectionState): void {
    const event: SelectionChangeEvent = {
      previous,
      current: { ...this.currentSelection },
    };

    this.changeHandlers.forEach((handler) => handler(event));
  }

  /**
   * Emit tower selected event to event bus
   */
  private emitTowerSelected(tower: Tower): void {
    if (this.eventBus.emit) {
      this.eventBus.emit(GameEventType.TOWER_SELECTED, { tower });
    }
  }

  /**
   * Emit tower deselected event to event bus
   */
  private emitDeselected(tower: Tower | null): void {
    if (this.eventBus.emit) {
      this.eventBus.emit(GameEventType.TOWER_DESELECTED, { tower });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.changeHandlers = [];
    this.selectionGraphics?.destroy();
    this.selectionGraphics = null;
  }
}
