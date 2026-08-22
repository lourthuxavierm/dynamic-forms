/** Stable prefix for default HTML adapter CSS custom properties. */
export const HTML_TOKEN_PREFIX = '--df-' as const;
/** Opt-in stylesheet subpath. Import once from your application entry point. */
export const HTML_DEFAULT_STYLESHEET = '@dynamic-forms/html/styles.css' as const;

export type HtmlColorScheme = 'light' | 'dark' | 'auto';
export type HtmlDensity = 'compact' | 'standard' | 'comfortable';
