# Native HTML accessibility

- Status: Planned; not yet verified for a standalone renderer
- Owner: Accessibility reviewer and future Native HTML maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

Browser-native elements provide useful semantics, but they do not make an
unimplemented renderer accessible. No accessibility conformance claim applies
to a standalone Native HTML renderer today.

## Release requirements

- Every control has an accessible name and programmatic description.
- Errors and required state are associated and announced appropriately.
- Keyboard, focus order, focus restoration, and invalid-submit focus are tested.
- Composite controls implement the relevant WAI-ARIA interaction pattern.
- Dynamic conditions and asynchronous state changes have deliberate announcements.
- Zoom, reflow, forced colors, reduced motion, and screen-reader workflows are tested.
- Automated checks are supplemented by keyboard and assistive-technology review.

The target and supported conformance scope must be stated at release time; this
page does not claim WCAG conformance for code that does not exist.
