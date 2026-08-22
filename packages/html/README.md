# @dynamic-forms/html

Accessible native HTML rendering for Dynamic Forms. The package depends on the
headless React contract and contains no MUI, Emotion, or runtime CSS-in-JS.

## Status

The adapter includes native controls, composite and specialized fields, file and
media workflows, structural arrays, declarative layouts, and opt-in theming.

## Install

    pnpm add @dynamic-forms/core @dynamic-forms/react @dynamic-forms/html react react-dom

## Quickstart

    import { FormProvider } from '@dynamic-forms/react';
    import { HtmlForm } from '@dynamic-forms/html';
    import '@dynamic-forms/html/styles.css';

    <FormProvider schema={schema}>
      <HtmlForm
        colorScheme="auto"
        density="standard"
        schema={schema}
        onSubmit={save}
      />
    </FormProvider>

The stylesheet import is optional. Omit it for completely unstyled native markup,
or pass `unstyled` when the stylesheet is present but one form must opt out.

React 18 and 19 are supported. Native controls target WCAG 2.2 AA and evergreen
browsers as defined by ADR 0001.
