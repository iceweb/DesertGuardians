import Phaser from 'phaser';

/**
 * Input context defines what mode the game is currently in,
 * affecting how input events should be interpreted
 */
export const InputContext = {
  GAMEPLAY: 'gameplay',
  MENU: 'menu',
  TOWER_BUILD: 'tower_build',
  TOWER_UPGRADE: 'tower_upgrade',
  POPUP: 'popup',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
} as const;

export type InputContext = (typeof InputContext)[keyof typeof InputContext];

/**
 * Input action types that can be triggered by various input methods
 */
export const InputAction = {
  // Primary actions
  SELECT: 'select',
  CANCEL: 'cancel',
  CONFIRM: 'confirm',

  // Navigation
  MOVE_UP: 'move_up',
  MOVE_DOWN: 'move_down',
  MOVE_LEFT: 'move_left',
  MOVE_RIGHT: 'move_right',

  // Game actions
  START_WAVE: 'start_wave',
  PAUSE: 'pause',
  SPEED_UP: 'speed_up',
  SPEED_DOWN: 'speed_down',
  SELL_TOWER: 'sell_tower',

  // Tower shortcuts
  BUILD_TOWER: 'build_tower',

  // Debug
  TOGGLE_DEBUG: 'toggle_debug',
} as const;

export type InputAction = (typeof InputAction)[keyof typeof InputAction];

/**
 * Input event data passed to handlers
 */
export interface InputEventData {
  action: InputAction;
  context: InputContext;
  pointer?: Phaser.Input.Pointer;
  key?: Phaser.Input.Keyboard.Key;
  worldX?: number;
  worldY?: number;
  screenX?: number;
  screenY?: number;
  timestamp: number;
}

/**
 * Input handler callback type
 */
export type InputHandler = (event: InputEventData) => boolean | void;

/**
 * Key binding configuration
 */
interface KeyBinding {
  key: string | number;
  action: InputAction;
  contexts: InputContext[];
  shift?: boolean;
  ctrl?: boolean;
}

/**
 * InputSystem - Unified input handling with context awareness
 *
 * Features:
 * - Context-based input handling (different behavior in menus vs gameplay)
 * - Keyboard and pointer input unified
 * - Priority-based handler system
 * - Configurable key bindings
 *
 * Usage:
 * ```
 * const input = new InputSystem(scene);
 * input.setContext(InputContext.GAMEPLAY);
 *
 * input.on(InputAction.SELECT, (event) => {
 *   if (event.context === InputContext.GAMEPLAY) {
 *     // Handle tower placement
 *   }
 * });
 *
 * input.onPointerDown((event) => {
 *   // Raw pointer events when needed
 * });
 * ```
 */
export class InputSystem {
  private scene: Phaser.Scene;
  private currentContext: InputContext = InputContext.GAMEPLAY;
  private contextStack: InputContext[] = [];

  private handlers: Map<InputAction, InputHandler[]> = new Map();
  private pointerDownHandlers: ((
    pointer: Phaser.Input.Pointer,
    worldX: number,
    worldY: number
  ) => void)[] = [];
  private pointerMoveHandlers: ((
    pointer: Phaser.Input.Pointer,
    worldX: number,
    worldY: number
  ) => void)[] = [];

  private keyBindings: KeyBinding[] = [
    { key: 'SPACE', action: InputAction.START_WAVE, contexts: [InputContext.GAMEPLAY] },
    { key: 'P', action: InputAction.PAUSE, contexts: [InputContext.GAMEPLAY, InputContext.PAUSED] },
    {
      key: 'ESC',
      action: InputAction.CANCEL,
      contexts: [InputContext.TOWER_BUILD, InputContext.TOWER_UPGRADE, InputContext.POPUP],
    },
    { key: 'S', action: InputAction.SELL_TOWER, contexts: [InputContext.TOWER_UPGRADE] },
    { key: 'D', action: InputAction.TOGGLE_DEBUG, contexts: [InputContext.GAMEPLAY], shift: true },
    { key: 'ONE', action: InputAction.SPEED_DOWN, contexts: [InputContext.GAMEPLAY] },
    { key: 'TWO', action: InputAction.SPEED_UP, contexts: [InputContext.GAMEPLAY] },
  ];

  private keyObjects: Map<string, Phaser.Input.Keyboard.Key> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboardInput();
    this.setupPointerInput();
  }

  /**
   * Set up keyboard bindings
   */
  private setupKeyboardInput(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    // Create key objects for all bindings
    const uniqueKeys = new Set(this.keyBindings.map((b) => b.key));
    uniqueKeys.forEach((key) => {
      const keyCode =
        typeof key === 'string'
          ? Phaser.Input.Keyboard.KeyCodes[key as keyof typeof Phaser.Input.Keyboard.KeyCodes]
          : key;

      if (keyCode !== undefined) {
        const keyObj = keyboard.addKey(keyCode);
        this.keyObjects.set(String(key), keyObj);

        keyObj.on('down', () => this.handleKeyDown(String(key)));
      }
    });
  }

  /**
   * Set up pointer input handling
   */
  private setupPointerInput(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Dispatch to raw handlers first
      this.pointerDownHandlers.forEach((handler) => {
        handler(pointer, pointer.worldX, pointer.worldY);
      });

      // Then dispatch as action
      if (pointer.leftButtonDown()) {
        this.dispatchAction(InputAction.SELECT, {
          pointer,
          worldX: pointer.worldX,
          worldY: pointer.worldY,
          screenX: pointer.x,
          screenY: pointer.y,
        });
      } else if (pointer.rightButtonDown()) {
        this.dispatchAction(InputAction.CANCEL, {
          pointer,
          worldX: pointer.worldX,
          worldY: pointer.worldY,
          screenX: pointer.x,
          screenY: pointer.y,
        });
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerMoveHandlers.forEach((handler) => {
        handler(pointer, pointer.worldX, pointer.worldY);
      });
    });
  }

  /**
   * Handle key down event
   */
  private handleKeyDown(keyName: string): void {
    const binding = this.keyBindings.find((b) => {
      if (String(b.key) !== keyName) return false;
      if (!b.contexts.includes(this.currentContext)) return false;

      // Check modifiers
      const keyboard = this.scene.input.keyboard;
      if (b.shift && !keyboard?.checkDown(keyboard.addKey('SHIFT'))) return false;
      if (b.ctrl && !keyboard?.checkDown(keyboard.addKey('CTRL'))) return false;

      return true;
    });

    if (binding) {
      const keyObj = this.keyObjects.get(keyName);
      this.dispatchAction(binding.action, { key: keyObj });
    }
  }

  /**
   * Dispatch an action to registered handlers
   */
  private dispatchAction(
    action: InputAction,
    extra: Partial<Omit<InputEventData, 'action' | 'context' | 'timestamp'>> = {}
  ): void {
    const event: InputEventData = {
      action,
      context: this.currentContext,
      timestamp: Date.now(),
      ...extra,
    };

    const handlers = this.handlers.get(action) || [];
    for (const handler of handlers) {
      const result = handler(event);
      if (result === true) {
        // Handler consumed the event
        break;
      }
    }
  }

  /**
   * Get the current input context
   */
  getContext(): InputContext {
    return this.currentContext;
  }

  /**
   * Set the current input context
   */
  setContext(context: InputContext): void {
    this.currentContext = context;
  }

  /**
   * Push a new context onto the stack (for nested menus/popups)
   */
  pushContext(context: InputContext): void {
    this.contextStack.push(this.currentContext);
    this.currentContext = context;
  }

  /**
   * Pop the context stack and restore the previous context
   */
  popContext(): InputContext {
    const previous = this.currentContext;
    this.currentContext = this.contextStack.pop() || InputContext.GAMEPLAY;
    return previous;
  }

  /**
   * Register an action handler
   */
  on(action: InputAction, handler: InputHandler): this {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, []);
    }
    this.handlers.get(action)!.push(handler);
    return this;
  }

  /**
   * Remove an action handler
   */
  off(action: InputAction, handler: InputHandler): this {
    const handlers = this.handlers.get(action);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
    return this;
  }

  /**
   * Register a raw pointer down handler
   */
  onPointerDown(
    handler: (pointer: Phaser.Input.Pointer, worldX: number, worldY: number) => void
  ): this {
    this.pointerDownHandlers.push(handler);
    return this;
  }

  /**
   * Register a raw pointer move handler
   */
  onPointerMove(
    handler: (pointer: Phaser.Input.Pointer, worldX: number, worldY: number) => void
  ): this {
    this.pointerMoveHandlers.push(handler);
    return this;
  }

  /**
   * Check if a specific key is currently held down
   */
  isKeyDown(keyName: string): boolean {
    const keyObj = this.keyObjects.get(keyName);
    return keyObj?.isDown ?? false;
  }

  /**
   * Add a custom key binding
   */
  addKeyBinding(binding: KeyBinding): void {
    this.keyBindings.push(binding);

    // Create the key object if needed
    if (!this.keyObjects.has(String(binding.key))) {
      const keyboard = this.scene.input.keyboard;
      if (keyboard) {
        const keyCode =
          typeof binding.key === 'string'
            ? Phaser.Input.Keyboard.KeyCodes[
                binding.key as keyof typeof Phaser.Input.Keyboard.KeyCodes
              ]
            : binding.key;

        if (keyCode !== undefined) {
          const keyObj = keyboard.addKey(keyCode);
          this.keyObjects.set(String(binding.key), keyObj);
          keyObj.on('down', () => this.handleKeyDown(String(binding.key)));
        }
      }
    }
  }

  /**
   * Remove all handlers
   */
  removeAllHandlers(): void {
    this.handlers.clear();
    this.pointerDownHandlers = [];
    this.pointerMoveHandlers = [];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.removeAllHandlers();
    this.keyObjects.forEach((key) => key.destroy());
    this.keyObjects.clear();
  }
}
