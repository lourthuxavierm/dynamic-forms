import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
interface ThemeState { mode: 'light' | 'dark'; toggleMode: () => void; }
const ThemeContext = createContext<ThemeState | null>(null);
export function PlaygroundProviders({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => createTheme({ palette: { mode }, shape: { borderRadius: 10 } }), [mode]);
  const value = useMemo(() => ({ mode, toggleMode: () => setMode((current) => current === 'light' ? 'dark' : 'light') }), [mode]);
  return <ThemeContext.Provider value={value}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></ThemeContext.Provider>;
}
export function usePlaygroundTheme() { const value = useContext(ThemeContext); if (!value) throw new Error('Missing PlaygroundProviders'); return value; }
