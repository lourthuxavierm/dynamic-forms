# @dynamic-forms/html

Accessible native HTML rendering for Dynamic Forms. The package depends on the
headless React contract and contains no MUI, Emotion, or runtime CSS-in-JS.

## Status

The immutable registry, field renderer, form integration, diagnostics, and
field-level error recovery are available. Native controls arrive in Phase 4.

## Install

    pnpm add @dynamic-forms/core @dynamic-forms/react @dynamic-forms/html react react-dom

## Quickstart with a custom control

    import { FormProvider, type FieldComponentProps } from '@dynamic-forms/react';
    import { HtmlForm } from '@dynamic-forms/html';

    function TextControl(props: FieldComponentProps<string>) {
      return <input
        id={props.accessibility.id}
        name={props.name}
        value={props.value ?? ''}
        onChange={(event) => props.setValue(event.target.value)}
      />;
    }

    <FormProvider schema={schema}>
      <HtmlForm schema={schema} registry={{ text: TextControl }} onSubmit={save} />
    </FormProvider>

React 18 and 19 are supported. Native controls target WCAG 2.2 AA and evergreen
browsers as defined by ADR 0001.
