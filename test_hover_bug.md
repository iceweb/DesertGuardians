# Hover State Bug Test Case

## Scenario:
1. Build menu is open
2. Player has enough gold (button enabled, pointer is hovering)
3. Hover state active: button shows hover color (0x3a3025)
4. Gold drops below requirement (e.g., another tower built)
5. `update()` calls `updateVisuals(false)`
6. Button redrawn with disabled color (0x1a1510)
7. **BUT**: pointer is still over the button!
8. Phaser doesn't fire 'pointerout' when button becomes disabled
9. **Result**: On next hover, 'pointerover' fires and draws hover state
10. User sees hover state on a disabled button!

## Expected behavior:
When affordability changes from affordable→unaffordable while hovering, the button should either:
- Stay in disabled state even during hover, OR
- Explicitly handle the visual state considering current hover status

## Same issue exists in:
- Build menu (line 525-538, 543-560)
- Upgrade branch buttons (line 1102-1115, 1118-1137)
