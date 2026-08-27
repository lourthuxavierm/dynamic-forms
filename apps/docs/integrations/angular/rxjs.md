# Angular RxJS events

- Status: Experimental
- Owner: Angular maintainers
- Last verified: 2026-08-27
- Applies to: RxJS 7

`events$` is a cold Observable view over Core value-change, validation,
submission, and reset events. Each subscription registers Core listeners and
unsubscription removes them. `on(type, listener)` remains available when an
Observable pipeline is unnecessary.

Signals and RxJS observe the same Core store; neither is a second state model.
Errors thrown by application stream operators follow normal RxJS behavior and
do not mutate Core.
