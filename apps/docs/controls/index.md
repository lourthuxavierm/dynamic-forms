# Control reference

- Status: Documented React HTML v1 catalogue; Angular HTML baseline linked
- Owner: Renderer maintainers
- Last verified: 2026-08-27
- Applies to: React HTML and Angular HTML 0.1.0

React HTML's `V1_HTML_FIELD_TYPES` tuple remains the source of truth for its 42
stable leaf controls. Object and array are stable structural fields outside that
count.

## Reference groups

| Group | React HTML stable controls | Reference |
| --- | ---: | --- |
| Text and hidden | 6 | [Text controls](./text.md) |
| Numeric | 3 | [Numeric controls](./numeric.md) |
| Selection | 11 | [Selection controls](./selection.md) |
| Date and time | 8 | [Date and time](./date-time.md) |
| Specialized | 9 | [Specialized controls](./specialized.md) |
| File and media | 5 | [File and media](./file-media.md) |
| Structural fields | 2, outside leaf count | [Structural fields](./structural.md) |
| Experimental/deferred | Outside v1 | [Experimental and deferred](./experimental.md) |

The React HTML leaf-control counts total 42.

## Renderer compatibility

| Renderer | Status |
| --- | --- |
| React HTML | 42 stable leaf controls documented by these group pages |
| Angular HTML | [Experimental 15-type baseline](../integrations/angular-html/controls.md) |
| `@dynamic-form-engine/html` | Compatibility forwarding surface for React HTML |
| Standalone Native HTML/DOM | Planned; no renderer exists |

Core accepts custom field strings, so Core schema validity is not proof of
renderer availability. Check the selected renderer's documented inventory.
