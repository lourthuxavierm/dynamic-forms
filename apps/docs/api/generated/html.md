# @lourthuxavierm/dynamic-forms-html API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Compatibility-only
- Source: TypeScript public exports
- Internal symbols: excluded

Compatibility entry point forwarding the React HTML surface; new applications should import React HTML directly.

Related: [guide](../../integrations/native-html/) · [controls/examples](../../playground/)

## Public exports

This page contains 126 exports. Signatures are regenerated from the package entry point.

### applyMask

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Mask syntax: 0 digit, A letter, and * alphanumeric. Other characters are literals.

```ts
export declare function applyMask(value: string, mask: string): string
```

### createDefaultHtmlRegistry

- Kind: function
- Source: `packages/react-html/dist/registry/defaultRegistry.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function createDefaultHtmlRegistry(overrides?: HtmlFieldRegistryOverrides): HtmlFieldRegistry
```

### createHtmlLayoutRegistry

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function createHtmlLayoutRegistry(overrides?: HtmlLayoutRegistryOverrides): HtmlLayoutRegistry
```

### createHtmlRegistry

- Kind: function
- Source: `packages/react-html/dist/registry/registry.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function createHtmlRegistry(initial?: HtmlFieldRegistryOverrides | readonly HtmlFieldRegistration[]): HtmlFieldRegistry
```

### createHtmlTemporalField

- Kind: function
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function createHtmlTemporalField(kind: TemporalKind, enhance?: HtmlTemporalEnhancer): (props: FieldComponentProps) => import("react").JSX.Element
```

### createLazyHtmlRegistry

- Kind: function
- Source: `packages/react-html/dist/registry/lazyRegistry.d.ts`

Opt-in code-split overrides for costly or uncommon controls.

```ts
export declare function createLazyHtmlRegistry(): HtmlFieldRegistryOverrides
```

### createSafeFileSnapshot

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function createSafeFileSnapshot(files: readonly File[]): Readonly<{ count: number; files: readonly { type: string; size: number; }[]; }>
```

### EXPERIMENTAL_HTML_FIELD_TYPES

- Kind: const
- Source: `packages/react-html/dist/registry/v1.d.ts`

Supported compatibility extensions that are not covered by the v1 stability guarantee.

```ts
export declare const EXPERIMENTAL_HTML_FIELD_TYPES: readonly ["searchable-select", "tree-checkbox"];
```

### ExperimentalHtmlFieldType

- Kind: type
- Source: `packages/react-html/dist/registry/v1.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type ExperimentalHtmlFieldType;
```

### extractMaskValue

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function extractMaskValue(input: string, mask: string): string
```

### formatCurrency

- Kind: function
- Source: `packages/react-html/dist/components/numericFormat.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function formatCurrency(value: number, locale: string, currency: string, precision?: number): string
```

### formatPercentage

- Kind: function
- Source: `packages/react-html/dist/components/numericFormat.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function formatPercentage(value: number, locale: string, precision?: number): string
```

### HTML_ADAPTER_VERSION

- Kind: const
- Source: `packages/react-html/dist/index.d.ts`

Compatibility-package version marker; this does not identify a separate native DOM renderer.

```ts
export declare const HTML_ADAPTER_VERSION: "0.1.0";
```

### HTML_DEFAULT_STYLESHEET

- Kind: const
- Source: `packages/react-html/dist/styles/index.d.ts`

Opt-in stylesheet subpath. Import once from your application entry point.

```ts
export declare const HTML_DEFAULT_STYLESHEET: "@lourthuxavierm/dynamic-forms-react-html/styles.css";
```

### HTML_TOKEN_PREFIX

- Kind: const
- Source: `packages/react-html/dist/styles/index.d.ts`

Stable prefix for default HTML adapter CSS custom properties.

```ts
export declare const HTML_TOKEN_PREFIX: "--df-";
```

### HtmlAccessibilityAttributes

- Kind: interface
- Source: `packages/react-html/dist/accessibility/index.d.ts`

Shared native-control accessibility attributes used by HTML renderers.

```ts
export interface HtmlAccessibilityAttributes;
```

### HtmlAccordion

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlAccordion({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlArrayItemsRenderer

- Kind: type
- Source: `packages/react-html/dist/components/structural.d.ts`

Extension point for windowing large collections without coupling the adapter to a virtualization library.

```ts
export type HtmlArrayItemsRenderer;
```

### HtmlArrayItemsRendererProps

- Kind: interface
- Source: `packages/react-html/dist/components/structural.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlArrayItemsRendererProps;
```

### HtmlArrayRenderItem

- Kind: interface
- Source: `packages/react-html/dist/components/structural.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlArrayRenderItem;
```

### HtmlAsyncAutocomplete

- Kind: const
- Source: `packages/react-html/dist/components/composites.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlAsyncAutocomplete: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlAutocomplete

- Kind: const
- Source: `packages/react-html/dist/components/composites.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlAutocomplete: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlCameraCapture

- Kind: const
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlCameraCapture: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlCardSection

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlCardSection({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlCheckbox

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlCheckbox(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlCheckboxGroup

- Kind: function
- Source: `packages/react-html/dist/components/composites.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlCheckboxGroup(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlColorScheme

- Kind: type
- Source: `packages/react-html/dist/styles/index.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlColorScheme;
```

### HtmlCurrencyField

- Kind: const
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlCurrencyField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlDateField

- Kind: const
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlDateField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlDateRangeField

- Kind: const
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlDateRangeField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlDateTimeField

- Kind: const
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlDateTimeField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlDateTimeRangeField

- Kind: const
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlDateTimeRangeField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlDecimalField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlDecimalField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlDensity

- Kind: type
- Source: `packages/react-html/dist/styles/index.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlDensity;
```

### HtmlDocumentPreview

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlDocumentPreview(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlEmailField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlEmailField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlFieldComponent

- Kind: type
- Source: `packages/react-html/dist/components/index.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlFieldComponent;
```

### HtmlFieldErrorBoundary

- Kind: class
- Source: `packages/react-html/dist/components/HtmlFieldErrorBoundary.d.ts`

Public class exported by @lourthuxavierm/dynamic-forms-html.

```ts
export class HtmlFieldErrorBoundary;
```

### HtmlFieldErrorBoundaryProps

- Kind: interface
- Source: `packages/react-html/dist/components/HtmlFieldErrorBoundary.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlFieldErrorBoundaryProps;
```

### HtmlFieldRegistration

- Kind: interface
- Source: `packages/react-html/dist/registry/types.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlFieldRegistration;
```

### HtmlFieldRegistry

- Kind: type
- Source: `packages/react-html/dist/registry/types.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlFieldRegistry;
```

### HtmlFieldRegistryOverrides

- Kind: type
- Source: `packages/react-html/dist/registry/types.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlFieldRegistryOverrides;
```

### HtmlFieldRenderer

- Kind: const
- Source: `packages/react-html/dist/renderer/HtmlFieldRenderer.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlFieldRenderer: import("react").MemoExoticComponent<({ field, registry, arrayItemsRenderer, fallback, onError }: HtmlFieldRendererProps) => import("react").JSX.Element>;
```

### HtmlFieldRendererProps

- Kind: interface
- Source: `packages/react-html/dist/renderer/HtmlFieldRenderer.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlFieldRendererProps;
```

### HtmlFieldsetLayout

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlFieldsetLayout({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlFieldShell

- Kind: function
- Source: `packages/react-html/dist/components/HtmlFieldShell.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlFieldShell({ props, children, hideLabel }: HtmlFieldShellProps): import("react").JSX.Element
```

### HtmlFieldShellProps

- Kind: interface
- Source: `packages/react-html/dist/components/HtmlFieldShell.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlFieldShellProps;
```

### HtmlFileControlConfig

- Kind: interface
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlFileControlConfig;
```

### HtmlFileField

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlFileField(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlFileUpload

- Kind: const
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlFileUpload: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlFileUploadProvider

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlFileUploadProvider({ upload, children }: { upload: HtmlUploadHandler; children: ReactNode; }): import("react").JSX.Element
```

### HtmlForm

- Kind: function
- Source: `packages/react-html/dist/components/HtmlForm.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlForm({ schema: explicitSchema, registry, submitLabel, onSubmit, children, className, arrayItemsRenderer, layout, layoutRegistry, tabsRenderer, unstyled, colorScheme, density, dir, errorSummary }: HtmlFormProps): import("react").JSX.Element
```

### HtmlFormProps

- Kind: interface
- Source: `packages/react-html/dist/components/HtmlForm.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlFormProps;
```

### HtmlGrid

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlGrid({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlHiddenField

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlHiddenField(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlInlineGroup

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlInlineGroup({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlIntegerField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlIntegerField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlLayoutComponent

- Kind: type
- Source: `packages/react-html/dist/components/layout.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlLayoutComponent;
```

### HtmlLayoutComponentProps

- Kind: interface
- Source: `packages/react-html/dist/components/layout.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlLayoutComponentProps;
```

### HtmlLayoutNode

- Kind: interface
- Source: `packages/react-html/dist/components/layout.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlLayoutNode;
```

### HtmlLayoutRegistry

- Kind: type
- Source: `packages/react-html/dist/components/layout.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlLayoutRegistry;
```

### HtmlLayoutRegistryOverrides

- Kind: type
- Source: `packages/react-html/dist/components/layout.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlLayoutRegistryOverrides;
```

### HtmlLayoutRendererProps

- Kind: interface
- Source: `packages/react-html/dist/renderer/HtmlLayoutRenderer.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlLayoutRendererProps;
```

### HtmlLayoutRenderResult

- Kind: interface
- Source: `packages/react-html/dist/renderer/HtmlLayoutRenderer.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlLayoutRenderResult;
```

### HtmlLayoutType

- Kind: type
- Source: `packages/react-html/dist/components/layout.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlLayoutType;
```

### HtmlMaskField

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlMaskField(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlMonthField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlMonthField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlMultiFileUpload

- Kind: const
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlMultiFileUpload: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlMultiSelect

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlMultiSelect(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlNumberField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlNumberField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlOtpField

- Kind: const
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlOtpField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlPasswordField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlPasswordField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlPercentageField

- Kind: const
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlPercentageField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlPhoneField

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlPhoneField(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlPinField

- Kind: const
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlPinField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlRadio

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlRadio(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlRadioGroup

- Kind: const
- Source: `packages/react-html/dist/components/composites.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlRadioGroup: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlRangeSlider

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlRangeSlider(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlRating

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlRating(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlReadOnlySummary

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlReadOnlySummary({ node }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlSearchableSelect

- Kind: const
- Source: `packages/react-html/dist/components/composites.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlSearchableSelect: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlSection

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlSection({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlSelect

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlSelect(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlSignatureField

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlSignatureField(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlSignatureProvider

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlSignatureProvider({ renderSignature, children }: { renderSignature: HtmlSignatureRenderer; children: ReactNode; }): import("react").JSX.Element
```

### HtmlSignatureRenderer

- Kind: type
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlSignatureRenderer;
```

### HtmlSignatureRendererProps

- Kind: interface
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlSignatureRendererProps;
```

### HtmlSlider

- Kind: function
- Source: `packages/react-html/dist/components/specialized.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlSlider(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlStack

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlStack({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlStickyActions

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlStickyActions({ node, children }: HtmlLayoutComponentProps): import("react").JSX.Element
```

### HtmlStructuralField

- Kind: function
- Source: `packages/react-html/dist/components/structural.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlStructuralField(props: HtmlStructuralFieldProps): import("react").JSX.Element
```

### HtmlStructuralFieldProps

- Kind: interface
- Source: `packages/react-html/dist/components/structural.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlStructuralFieldProps;
```

### HtmlSwitch

- Kind: function
- Source: `packages/react-html/dist/components/composites.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlSwitch(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlTabDescriptor

- Kind: interface
- Source: `packages/react-html/dist/components/layout.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlTabDescriptor;
```

### HtmlTabs

- Kind: function
- Source: `packages/react-html/dist/components/layout.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlTabs({ node, children, renderer }: HtmlLayoutComponentProps & { renderer?: HtmlTabsRenderer; }): import("react").JSX.Element
```

### HtmlTabsRenderer

- Kind: type
- Source: `packages/react-html/dist/components/layout.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlTabsRenderer;
```

### HtmlTabsRendererProps

- Kind: interface
- Source: `packages/react-html/dist/components/layout.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlTabsRendererProps;
```

### HtmlTemporalEnhancementContext

- Kind: interface
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlTemporalEnhancementContext;
```

### HtmlTemporalEnhancer

- Kind: type
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlTemporalEnhancer;
```

### HtmlTextarea

- Kind: function
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlTextarea(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlTextField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlTextField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlTimeField

- Kind: const
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlTimeField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlTimeRangeField

- Kind: const
- Source: `packages/react-html/dist/components/temporal.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlTimeRangeField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlToggleButtonGroup

- Kind: function
- Source: `packages/react-html/dist/components/composites.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlToggleButtonGroup(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlTreeCheckbox

- Kind: function
- Source: `packages/react-html/dist/components/composites.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlTreeCheckbox(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlTreeSelect

- Kind: function
- Source: `packages/react-html/dist/components/composites.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function HtmlTreeSelect(props: FieldComponentProps): import("react").JSX.Element
```

### HtmlUploadHandler

- Kind: type
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type HtmlUploadHandler;
```

### HtmlUploadRequest

- Kind: interface
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface HtmlUploadRequest;
```

### HtmlUrlField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Public const exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare const HtmlUrlField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### HtmlYearField

- Kind: const
- Source: `packages/react-html/dist/components/baseline.d.ts`

Stores a numeric Gregorian year and uses native min/max/step constraints.

```ts
export declare const HtmlYearField: (props: FieldComponentProps) => import("react").JSX.Element;
```

### LocaleNumberOptions

- Kind: interface
- Source: `packages/react-html/dist/components/numericFormat.d.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-html.

```ts
export interface LocaleNumberOptions;
```

### mergeHtmlRegistries

- Kind: function
- Source: `packages/react-html/dist/registry/registry.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function mergeHtmlRegistries(...registries: readonly HtmlFieldRegistryOverrides[]): HtmlFieldRegistry
```

### normalizeDateOnly

- Kind: function
- Source: `packages/react-html/dist/components/temporalValues.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function normalizeDateOnly(value: string | Date | undefined | null): string | undefined
```

### normalizeLocalDateTime

- Kind: function
- Source: `packages/react-html/dist/components/temporalValues.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function normalizeLocalDateTime(value: string | Date | undefined | null): string | undefined
```

### normalizeNumericValue

- Kind: function
- Source: `packages/react-html/dist/components/numericFormat.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function normalizeNumericValue(value: number, options?: LocaleNumberOptions): number
```

### normalizeTemporalValue

- Kind: function
- Source: `packages/react-html/dist/components/temporalValues.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function normalizeTemporalValue(kind: TemporalKind, value: string | Date | undefined | null): string | undefined
```

### normalizeTimeOnly

- Kind: function
- Source: `packages/react-html/dist/components/temporalValues.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function normalizeTimeOnly(value: string | undefined | null): string | undefined
```

### parseLocalDateTime

- Kind: function
- Source: `packages/react-html/dist/components/temporalValues.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function parseLocalDateTime(value: string): Date | undefined
```

### parseLocaleNumber

- Kind: function
- Source: `packages/react-html/dist/components/numericFormat.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function parseLocaleNumber(input: string, locale?: string): number | undefined
```

### renderHtmlLayout

- Kind: function
- Source: `packages/react-html/dist/renderer/HtmlLayoutRenderer.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function renderHtmlLayout({ layout, fields, registry, renderField, submitAction, tabsRenderer }: HtmlLayoutRendererProps): HtmlLayoutRenderResult
```

### TemporalKind

- Kind: type
- Source: `packages/react-html/dist/components/temporalValues.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type TemporalKind;
```

### TypedHtmlFieldComponent

- Kind: type
- Source: `packages/react-html/dist/components/index.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type TypedHtmlFieldComponent;
```

### useObjectUrl

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function useObjectUrl(file: File | undefined): string | undefined
```

### V1_HTML_FIELD_TYPES

- Kind: const
- Source: `packages/react-html/dist/registry/v1.d.ts`

The stable Native HTML v1 leaf-control contract. Structural fields are separate.

```ts
export declare const V1_HTML_FIELD_TYPES: readonly ["text", "textarea", "password", "email", "url", "number", "integer", "decimal", "hidden", "select", "multi-select", "autocomplete", "async-autocomplete", "checkbox", "checkbox-group", "radio", "radio-group", "switch", "toggle-button-group", "tree-select", "date", "time", "datetime", "date-range", "time-range", "datetime-range", "month", "year", "currency", "percentage", "slider", "range-slider", "rating", "phone", "otp", "pin", "mask", "file", "multi-file", "camera", "signature", "document-preview"];
```

### V1HtmlFieldType

- Kind: type
- Source: `packages/react-html/dist/registry/v1.d.ts`

Public type exported by @lourthuxavierm/dynamic-forms-html.

```ts
export type V1HtmlFieldType;
```

### validateSelectedFiles

- Kind: function
- Source: `packages/react-html/dist/components/fileMedia.d.ts`

Public function exported by @lourthuxavierm/dynamic-forms-html.

```ts
export declare function validateSelectedFiles(files: readonly File[], config?: HtmlFileControlConfig): string | undefined
```

## Deprecations

No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.

