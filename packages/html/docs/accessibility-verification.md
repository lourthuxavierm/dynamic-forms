# Accessibility verification

The native adapter targets WCAG 2.2 AA. Automated axe checks run against representative baseline, composite, structural, and layout markup. Automation complements rather than replaces keyboard and assistive-technology testing.

## Keyboard-only walkthrough

Run each release candidate without a pointer:

1. Tab forward and backward through every control; verify order follows the schema and layout.
2. Confirm every focusable element has a visible focus indicator in light, dark, and forced-colors modes.
3. Submit an invalid form; verify focus moves to the first invalid field and the error summary links focus each field.
4. Exercise comboboxes with Arrow Up/Down, Home, End, Enter, Escape, and Tab.
5. Exercise tabs with Left/Right, Home, and End in both LTR and RTL.
6. Add, remove, duplicate, and reorder array rows; verify focus is not lost unexpectedly.
7. Verify read-only controls remain focusable while disabled controls are skipped.

## Zoom and reflow

Test browser zoom at 200% and 400% at a 1280 CSS-pixel viewport, plus a 320 CSS-pixel viewport:

- no two-dimensional page scrolling for ordinary form content;
- labels, descriptions, errors, and actions do not overlap or clip;
- grid columns collapse to a single column;
- sticky actions do not obscure the focused control;
- combobox listboxes and error summaries remain readable;
- focus indicators remain fully visible.

## NVDA manual check

Use the latest stable NVDA with Firefox and Chrome on Windows:

1. Navigate in focus mode and confirm label, role, value, required, description, and invalid state announcements.
2. Confirm fieldset legends prefix grouped checkbox/radio controls.
3. Submit invalid data and confirm the summary and field error are announced once each.
4. Verify combobox expanded/collapsed state, active option, selection, loading, empty, and failure messages.
5. Verify read-only and disabled states are announced distinctly.

Record browser, NVDA version, schema fixture, result, and issue link in the release evidence.

## VoiceOver manual check

Use the latest stable VoiceOver with Safari on macOS and iOS:

1. Navigate with Control+Option+Arrow and Tab; confirm logical order and accessible names.
2. Verify Rotor form-control and heading lists contain the expected entries.
3. Confirm descriptions, required state, errors, and live loading messages.
4. Exercise native date/time, file, disclosure, tab, and combobox controls.
5. Repeat representative flows at 200%/400% zoom and with increased text size.

Record OS, Safari, VoiceOver version, device, result, and issue link in the release evidence.

## Localization and RTL

Repeat keyboard and screen-reader checks with long translated labels, localized validation messages, and `dir="rtl"`. Direction changes visual and arrow-key behavior but never reverses DOM or screen-reader reading order.
