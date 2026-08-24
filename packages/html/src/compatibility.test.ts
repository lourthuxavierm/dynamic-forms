import { describe, expect, it } from 'vitest';
import * as canonical from '@dynamic-forms/react-html';
import * as canonicalBaseline from '@dynamic-forms/react-html/controls/baseline';
import * as canonicalComposites from '@dynamic-forms/react-html/controls/composites';
import * as canonicalCore from '@dynamic-forms/react-html/core';
import * as canonicalMedia from '@dynamic-forms/react-html/controls/media';
import * as canonicalSpecialized from '@dynamic-forms/react-html/controls/specialized';
import * as canonicalTemporal from '@dynamic-forms/react-html/controls/temporal';
import * as canonicalText from '@dynamic-forms/react-html/controls/text';
import * as compatibility from './index';
import * as compatibilityBaseline from './entries/baseline';
import * as compatibilityComposites from './entries/composites';
import * as compatibilityCore from './entries/core';
import * as compatibilityMedia from './entries/media';
import * as compatibilitySpecialized from './entries/specialized';
import * as compatibilityTemporal from './entries/temporal';
import * as compatibilityText from './entries/text';

const forwardedEntries = [
  [compatibility, canonical],
  [compatibilityCore, canonicalCore],
  [compatibilityBaseline, canonicalBaseline],
  [compatibilityText, canonicalText],
  [compatibilityComposites, canonicalComposites],
  [compatibilitySpecialized, canonicalSpecialized],
  [compatibilityTemporal, canonicalTemporal],
  [compatibilityMedia, canonicalMedia],
] as const;

describe('@dynamic-forms/html compatibility package', () => {
  it('forwards every runtime entry without wrapping exports', () => {
    for (const [legacyEntry, canonicalEntry] of forwardedEntries) {
      expect(Object.keys(legacyEntry).sort()).toEqual(Object.keys(canonicalEntry).sort());
      for (const exportName of Object.keys(canonicalEntry)) {
        expect(Reflect.get(legacyEntry, exportName)).toBe(Reflect.get(canonicalEntry, exportName));
      }
    }
  });
});
