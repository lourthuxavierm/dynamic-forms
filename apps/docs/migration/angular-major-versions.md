# Migrating Angular major versions

Angular and Angular HTML are currently Experimental. Consult the
[Angular compatibility policy](../project/angular-compatibility) before upgrading.

## Upgrade checks

1. Upgrade with Angular's official tooling and keep framework packages aligned.
2. Confirm Dynamic Forms peer dependencies and compilation mode.
3. Test providers, signals, RxJS teardown, Reactive Forms synchronization, and
   ControlValueAccessor behavior.
4. Run zoneless and SSR/hydration coverage when those modes are used.
5. Verify focus restoration and accessible validation after template changes.

No undocumented Angular-major compatibility is implied. A major is supported
only when the compatibility page and CI matrix name it.
