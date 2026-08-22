import { Alert, Chip, Stack, Typography } from '@mui/material';
import type { PlaygroundRouteDefinition } from '../types/playground';
export default function PlaceholderPage({ route }: { route: PlaygroundRouteDefinition }) { return <Stack spacing={2}><Stack direction="row" spacing={1}><Chip label={route.priority} /><Chip label={route.status} /></Stack><Typography component="h1" variant="h3">{route.title}</Typography><Typography>{route.description}</Typography><Alert severity="info">This route is ready for its owning roadmap section.</Alert></Stack>; }
