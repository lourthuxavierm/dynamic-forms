import { lazy, type ComponentType } from 'react';
import type { FieldComponentProps } from '@lourthuxavierm/dynamic-forms-react';
import type { HtmlFieldRegistryOverrides } from './types';

function lazyField(load: () => Promise<Record<string, unknown>>, name: string) {
  return lazy(async () => ({ default: (await load())[name] as ComponentType<FieldComponentProps> }));
}
const loadComposites = () => import('../components/composites');
const loadSpecialized = () => import('../components/specialized');
const loadTemporal = () => import('../components/temporal');
const loadMedia = () => import('../components/fileMedia');

/** Opt-in code-split overrides for costly or uncommon controls. */
export function createLazyHtmlRegistry(): HtmlFieldRegistryOverrides {
  return Object.freeze({
    autocomplete: lazyField(loadComposites, 'HtmlAutocomplete'),
    'async-autocomplete': lazyField(loadComposites, 'HtmlAsyncAutocomplete'),
    'searchable-select': lazyField(loadComposites, 'HtmlSearchableSelect'),
    'tree-select': lazyField(loadComposites, 'HtmlTreeSelect'),
    'tree-checkbox': lazyField(loadComposites, 'HtmlTreeCheckbox'),
    'toggle-button-group': lazyField(loadComposites, 'HtmlToggleButtonGroup'),
    'date-range': lazyField(loadTemporal, 'HtmlDateRangeField'),
    'time-range': lazyField(loadTemporal, 'HtmlTimeRangeField'),
    'datetime-range': lazyField(loadTemporal, 'HtmlDateTimeRangeField'),
    'range-slider': lazyField(loadSpecialized, 'HtmlRangeSlider'),
    file: lazyField(loadMedia, 'HtmlFileUpload'),
    'multi-file': lazyField(loadMedia, 'HtmlMultiFileUpload'),
    camera: lazyField(loadMedia, 'HtmlCameraCapture'),
    'document-preview': lazyField(loadMedia, 'HtmlDocumentPreview'),
    signature: lazyField(loadMedia, 'HtmlSignatureField'),
  });
}