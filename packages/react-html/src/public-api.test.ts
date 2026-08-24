import { describe, expect, it } from 'vitest';
import { HTML_ADAPTER_VERSION, HTML_TOKEN_PREFIX } from './index';
describe('@dynamic-forms/react-html scaffold', () => {
  it('exposes stable metadata without design-system runtime dependencies', () => {
    expect(HTML_ADAPTER_VERSION).toBe('0.1.0');
    expect(HTML_TOKEN_PREFIX).toBe('--df-');
  });
});
