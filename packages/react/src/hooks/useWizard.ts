import { useCallback, useMemo, useState } from 'react';

export interface WizardStep { id: string; disabled?: boolean; optional?: boolean; }
export interface UseWizardOptions { initialStep?: number; linear?: boolean; }
export function useWizard(steps: readonly WizardStep[], options: UseWizardOptions = {}) {
  const [activeIndex, setActiveIndex] = useState(() => clamp(options.initialStep ?? 0, steps.length));
  const goTo = useCallback((index: number) => { const next=steps[index]; if (next && !next.disabled) setActiveIndex(index); }, [steps]);
  const next = useCallback(() => { for (let index=activeIndex+1; index<steps.length; index++) if (!steps[index].disabled) { setActiveIndex(index); break; } }, [activeIndex, steps]);
  const previous = useCallback(() => { for (let index=activeIndex-1; index>=0; index--) if (!steps[index].disabled) { setActiveIndex(index); break; } }, [activeIndex, steps]);
  return useMemo(() => ({ steps, activeIndex, activeStep: steps[activeIndex], isFirst: activeIndex <= 0, isLast: activeIndex >= steps.length-1, goTo, next, previous }), [activeIndex, goTo, next, previous, steps]);
}
function clamp(index: number, length: number) { return length ? Math.max(0, Math.min(length - 1, index)) : 0; }
