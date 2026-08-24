/** Shared native-control accessibility attributes used by HTML renderers. */
export interface HtmlAccessibilityAttributes {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}
