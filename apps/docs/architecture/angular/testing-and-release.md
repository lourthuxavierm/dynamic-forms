# Angular testing and release gates

- Status: Proposed
- Owner: Future Angular, quality, and release maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

No Angular capability can move beyond Planned until implementation evidence
exists.

| Gate | Required evidence |
| --- | --- |
| Boundaries | Core has no Angular imports; headless adapter has no HTML renderer dependency |
| APIs | Public export tests and API extraction for every advertised symbol |
| Runtime | Shared Core contract suites plus Angular lifecycle and cleanup tests |
| Signals | Focused updates, stable commands, no duplicate state ownership |
| RxJS | Ordering, lazy subscription, error behavior, and teardown |
| Forms | CVA conformance and loop-safe `FormGroup` bridge tests |
| Rendering | Controls, structures, layouts, lazy loading, errors, focus |
| SSR | Server render and hydration without mismatches or duplicate requests |
| Compatibility | Declared Angular/TypeScript/RxJS/browser matrix |
| Accessibility | Automated checks and manual keyboard/screen-reader evidence |
| Example | Clean install, build, test, SSR, and runnable playground |

The first prerelease must keep APIs Experimental. Stable documentation requires
reviewed migration and deprecation policies plus all applicable release gates.
