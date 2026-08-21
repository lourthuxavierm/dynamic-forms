import { Box, Skeleton } from '@mui/material';

export interface MuiFieldLoadingProps {
  label?: string;
}

/** Accessible, theme-aware placeholder used while a field is resolving its UI or data. */
export function MuiFieldLoading({ label = 'Loading field' }: MuiFieldLoadingProps) {
  return (
    <Box role="status" aria-live="polite" aria-label={label} sx={{ width: '100%' }}>
      <Skeleton variant="text" width="35%" />
      <Skeleton variant="rounded" height={40} />
    </Box>
  );
}
