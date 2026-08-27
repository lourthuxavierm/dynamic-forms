# Native HTML complete-example release gate

- Status: Planned; no runnable standalone example exists
- Owner: Future Native HTML and playground maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

There is no honest complete standalone Native HTML example to publish today.
The repository's React HTML examples—even examples importing
`@dynamic-forms/html`—exercise React and are not evidence of direct-DOM support.

## Example required for release

The first complete example must run without `react`, `react-dom`,
`@dynamic-forms/react`, or `@dynamic-forms/react-html`. It must demonstrate:

1. creation from a schema and initial values;
2. text, numeric, selection, temporal, conditional, and nested fields;
3. synchronous and asynchronous validation;
4. value/event inspection, reset, and successful submission;
5. a custom control and stylesheet customization;
6. keyboard and accessible error behavior; and
7. explicit disposal with no retained listeners.

CI must install, build, execute, and browser-test the example. Only after that
evidence exists should this page contain copy-paste application code and a
playground link.
