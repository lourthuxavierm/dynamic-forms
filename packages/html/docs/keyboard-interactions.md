# Composite control keyboard interactions

These contracts apply to the default HTML adapter controls. Native browser
behavior is retained whenever it provides equivalent semantics.

## Checkbox and radio groups

- Tab enters and leaves the group.
- Space toggles a checkbox.
- Arrow keys move between native radio buttons; Space selects.
- Disabled options are omitted from interaction.

## Switch

- Tab focuses the switch.
- Space toggles it.
- Read-only switches remain focusable but do not change.

## Autocomplete, async autocomplete, and searchable select

- Down Arrow opens the list and moves to the next option.
- Up Arrow opens the list and moves to the previous option.
- Home and End move to the first and last filtered option.
- Enter selects the active option.
- Escape closes the list without changing the value.
- Typing filters local options or updates the debounced async search.
- Tab leaves the combobox and marks the field touched.

The input uses the ARIA combobox pattern with aria-controls,
aria-activedescendant, aria-expanded, a listbox, and option selection state.

## Tree select

Tree select progressively enhances a native select. Tab, Arrow keys, Home, End,
and type-ahead use browser-native behavior. Visual indentation communicates
hierarchy without replacing the platform selection model.

## Tree checkbox

- Tab moves through each visible native checkbox.
- Space toggles the focused node.
- Nested groups expose group names to assistive technology.
- Selecting a parent does not implicitly select descendants.

## Toggle-button group

- Tab visits each enabled button.
- Enter or Space activates the focused button.
- aria-pressed exposes single or multiple selection state.
