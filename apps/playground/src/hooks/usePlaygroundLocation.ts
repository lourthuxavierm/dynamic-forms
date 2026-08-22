import { useEffect, useState } from 'react';
export function usePlaygroundLocation() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  useEffect(() => { const update = () => setPathname(window.location.pathname); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
  const navigate = (path: string) => { if (path === pathname) return; window.history.pushState(null, '', path); setPathname(path); };
  return { pathname, navigate };
}
