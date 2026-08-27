# Phase 3 new-user foundation status

- Status: Implemented and verified
- Owner: Documentation maintainers with Core, React, and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: Repository version 0.1.0

## Delivered journey

1. Introduction
2. Choose an integration
3. Installation
4. Create the first schema
5. Render the first form
6. Add validation
7. Handle submission
8. Select next steps

## Contract corrections

- React HTML is identified as the current React-rendered browser-native UI path.
- Standalone Native HTML/DOM, Angular, and Angular HTML remain Planned and do
  not receive speculative installation commands.
- Normal HTML form submission is documented on `HtmlForm.onSubmit`.
- `FormProvider.onSubmit` is reserved for the provider's programmatic
  `submit()` path under the current public contract.
- Client validation is explicitly separated from server validation and
  authorization.

## Verification evidence

- The new-user pages compile 5 additional verified TypeScript/TSX snippets,
  bringing the documentation total to 11.
- Documentation verification passes for 41 Markdown pages.
- The production VitePress build passes.
- The platform verifier passes.
- Ten Chromium navigation, interaction, responsive, and visual tests pass.
- Browser tests verify the eight-step journey and corrected submission guidance.

## Remaining repository constraints

The broad Markdown ignore rule and the inability to patch pre-existing tracked
configuration files still prevent normal Git visibility and live sidebar wiring
for new pages in this session.
