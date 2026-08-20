# Dynamic Forms

Schema-driven, framework-agnostic dynamic forms for modern web applications.

Dynamic Forms is an open-source form engine designed to separate **form logic**, **framework integration**, and **UI rendering**.

Define a form once using JSON or TypeScript and render it using React, Material UI, or future framework adapters.

---

## ✨ Why Dynamic Forms?

Building large enterprise forms manually often leads to:

- duplicated form logic
- duplicated validation
- complicated conditional fields
- difficult field dependencies
- inconsistent UI behavior
- unnecessary React re-renders
- tightly coupled form components
- difficult reuse across applications

Dynamic Forms solves these problems by separating the form engine from the UI.

```text
                    Form Schema
                         │
                         ▼
              ┌────────────────────┐
              │ @dynamic-forms/core│
              │                    │
              │ Schema              │
              │ Store               │
              │ Registry            │
              │ Validation          │
              │ Conditions         │
              │ Dependencies       │
              │ Data Sources       │
              │ Events             │
              └─────────┬──────────┘
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
      @dynamic-forms/react     Future adapters
             │                 Angular / Vue / etc.
             ▼
      @dynamic-forms/mui
             │
             ▼
        Material UI
```
