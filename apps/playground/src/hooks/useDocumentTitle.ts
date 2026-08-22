import { useEffect } from 'react';
import { playgroundConfig } from '../config/playground';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${playgroundConfig.name}` : playgroundConfig.name;
  }, [title]);
}
