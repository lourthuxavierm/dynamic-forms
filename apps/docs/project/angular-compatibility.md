# Angular compatibility policy

- Status: Experimental tested baseline
- Owner: Angular maintainers and release engineering
- Last verified: 2026-08-27
- Applies to: Angular and Angular HTML 0.1.0

## Tested baseline

| Dependency | Tested version | Published peer policy |
| --- | --- | --- |
| Angular Core/Common/Forms | 22.1.3 | `^22.0.0` |
| TypeScript | 6.0.2 | Angular toolchain requirement `>=6.0 <6.1` |
| RxJS | 7.8.2 | `^7.4.0` for the headless adapter |
| Node.js | 24.15.0 | Angular 22.1 engine policy applies |
| Zone.js | Not installed | Zoneless browser path tested |

Only this exact combination has repository evidence. The peer ranges allow
compatible Angular 22 releases, but the oldest/newest minor matrix is not yet
certified. Angular 21 and earlier are unsupported by the current manifests.

## Implemented modes

- Package typecheck, ESM/CJS/declaration build, and unit tests.
- Zoneless Angular browser application and production build.
- Headless signals, events, DI lifecycle, validation/submission, and whole-form CVA.
- Experimental Angular HTML baseline controls.

## Uncertified modes

- Zone.js compatibility matrix.
- Angular SSR, hydration, and transfer cache.
- Full ControlValueAccessor and Reactive Forms conformance.
- Named browser/version matrix and assistive-technology certification.
- Multi-minor and multi-major Angular CI.

Dropping an Angular major or changing TypeScript/RxJS minimums requires release
notes and migration guidance. The integration remains Experimental until the
uncertified matrix is addressed.
