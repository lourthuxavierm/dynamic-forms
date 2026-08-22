import { useCallback, useMemo, useState } from 'react';

export interface UseSectionOptions { defaultExpanded?: boolean; disabled?: boolean; }
export function useSection(id: string, options: UseSectionOptions = {}) {
  const [expanded, setExpanded] = useState(options.defaultExpanded ?? true);
  const expand = useCallback(() => { if (!options.disabled) setExpanded(true); }, [options.disabled]);
  const collapse = useCallback(() => { if (!options.disabled) setExpanded(false); }, [options.disabled]);
  const toggle = useCallback(() => { if (!options.disabled) setExpanded((value) => !value); }, [options.disabled]);
  return useMemo(() => ({ id, expanded, disabled: options.disabled ?? false, expand, collapse, toggle }), [collapse, expand, expanded, id, options.disabled, toggle]);
}
