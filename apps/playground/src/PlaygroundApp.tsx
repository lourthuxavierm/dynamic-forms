import { lazy, Suspense, useMemo, useState } from 'react';
import { Alert, AppBar, Box, Button, Chip, CircularProgress, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, Stack, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { PlaygroundErrorBoundary } from './app/error-boundary/PlaygroundErrorBoundary';
import { navigationGroups } from './app/navigation/navigation';
import { PlaygroundProviders, usePlaygroundTheme } from './app/providers/PlaygroundProviders';
import { resolveRoute } from './app/router/resolveRoute';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { usePlaygroundLocation } from './hooks/usePlaygroundLocation';
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const BasicForm = lazy(() => import('./pages/BasicForm/BasicForm'));
const Fields = lazy(() => import('./pages/Fields/Fields'));
const Validation = lazy(() => import('./pages/Validation/Validation'));
const Quickstart = lazy(() => import('./examples/QuickstartExample').then((module) => ({ default: module.QuickstartExample })));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const drawerWidth = 300;
function Shell() {
  const theme = useTheme(); const permanent = useMediaQuery(theme.breakpoints.up('lg')); const { mode, toggleMode } = usePlaygroundTheme();
  const [drawerOpen, setDrawerOpen] = useState(false); const [search, setSearch] = useState(''); const [viewport, setViewport] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const { pathname, navigate } = usePlaygroundLocation(); const route = useMemo(() => resolveRoute(pathname), [pathname]); useDocumentTitle(route?.title ?? 'Not found');
  const query = search.trim().toLowerCase(); const widths = { desktop: '100%', tablet: 768, mobile: 390 } as const;
  const nav = <><Toolbar><Typography variant="h6">Dynamic Forms</Typography></Toolbar><Divider />{navigationGroups.map(({ group, items }) => { const visible = items.filter((item) => !query || `${item.title} ${item.description}`.toLowerCase().includes(query)); return visible.length ? <List key={group} subheader={<Typography component="div" variant="overline" sx={{ px: 2, pt: 1 }}>{group}</Typography>}>{visible.map((item) => <ListItemButton key={item.id} selected={pathname === item.path} onClick={() => { navigate(item.path); setDrawerOpen(false); }}><ListItemText primary={item.title} secondary={item.description} /><Chip size="small" label={item.status} /></ListItemButton>)}</List> : null; })}</>;
  const page = route?.id === 'dashboard' ? <Dashboard /> : route?.id === 'basic-form' ? <BasicForm /> : route?.id === 'fields' ? <Fields /> : route?.id === 'validation' ? <Validation /> : route ? <PlaceholderPage route={route} /> : <Stack spacing={2}><Typography component="h1" variant="h3">Page not found</Typography><Alert severity="warning">No route matches {pathname}.</Alert><Button onClick={() => navigate('/')}>Return to dashboard</Button></Stack>;
  return <Box sx={{ display: 'flex', minHeight: '100vh' }}><Drawer variant={permanent ? 'permanent' : 'temporary'} open={permanent || drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>{nav}</Drawer><Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, ml: permanent ? `${drawerWidth}px` : 0 }}><AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}><Toolbar sx={{ gap: 2 }}><IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>☰</IconButton><Box sx={{ minWidth: 150 }}><Typography variant="caption" color="text.secondary">Playground / {route?.title ?? 'Not found'}</Typography><Typography variant="h6">{route?.title ?? 'Not found'}</Typography></Box><TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search demos" size="small" inputProps={{ 'aria-label': 'Search demos' }} sx={{ flex: 1, maxWidth: 360 }} /><Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' } }}>{(['desktop','tablet','mobile'] as const).map((item) => <Button key={item} size="small" variant={viewport === item ? 'contained' : 'text'} onClick={() => setViewport(item)}>{item}</Button>)}</Stack><IconButton aria-label="Toggle color theme" onClick={toggleMode}>{mode === 'light' ? '◐' : '◑'}</IconButton><Button href="/docs/" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Docs</Button><Button href="https://github.com/lourthuxavierm/dynamic-forms" target="_blank" rel="noreferrer" sx={{ display: { xs: 'none', xl: 'inline-flex' } }}>Repository</Button></Toolbar></AppBar><Box component="main" sx={{ p: { xs: 2, md: 3 }, overflow: 'auto' }}><Box sx={{ width: widths[viewport], maxWidth: '100%', mx: 'auto', transition: 'width 180ms ease' }}><PlaygroundErrorBoundary><Suspense fallback={<Stack alignItems="center" sx={{ p: 6 }}><CircularProgress aria-label="Loading demo" /></Stack>}>{page}</Suspense></PlaygroundErrorBoundary></Box></Box></Box></Box>;
}
export default function PlaygroundApp() {
  const quickstart = new URLSearchParams(window.location.search).get('example') === 'quickstart';
  return <PlaygroundProviders>{quickstart ? <Suspense fallback={<CircularProgress aria-label="Loading demo" />}><Quickstart /></Suspense> : <Shell />}</PlaygroundProviders>;
}
