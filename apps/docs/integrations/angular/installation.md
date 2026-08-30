# Angular installation

- Status: Experimental
- Owner: Angular maintainers
- Last verified: 2026-08-27
- Applies to: Angular 22

```sh
pnpm add @dynamic-form-engine/core @dynamic-form-engine/angular @angular/core @angular/forms rxjs
```

The tested baseline uses Angular 22.1.3, TypeScript 6.0.2, and RxJS 7.8.2.
Angular 22's compiler requires TypeScript 6.0; do not allow a floating TypeScript
major in Angular application toolchains.

For browser-native controls, also install
`@dynamic-form-engine/angular-html` and `@angular/common`.
