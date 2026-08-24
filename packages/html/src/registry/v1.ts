/** The stable Native HTML v1 leaf-control contract. Structural fields are separate. */
export const V1_HTML_FIELD_TYPES = [
  'text', 'textarea', 'password', 'email', 'url', 'number', 'integer', 'decimal', 'hidden',
  'select', 'multi-select', 'autocomplete', 'async-autocomplete', 'checkbox',
  'checkbox-group', 'radio', 'radio-group', 'switch', 'toggle-button-group', 'tree-select',
  'date', 'time', 'datetime', 'date-range', 'time-range', 'datetime-range', 'month', 'year',
  'currency', 'percentage', 'slider', 'range-slider', 'rating', 'phone', 'otp', 'pin', 'mask',
  'file', 'multi-file', 'camera', 'signature', 'document-preview',
] as const;

export type V1HtmlFieldType = (typeof V1_HTML_FIELD_TYPES)[number];

/** Supported compatibility extensions that are not covered by the v1 stability guarantee. */
export const EXPERIMENTAL_HTML_FIELD_TYPES = ['searchable-select', 'tree-checkbox'] as const;
export type ExperimentalHtmlFieldType = (typeof EXPERIMENTAL_HTML_FIELD_TYPES)[number];
