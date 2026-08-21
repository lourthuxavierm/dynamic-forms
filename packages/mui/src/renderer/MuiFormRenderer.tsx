import { Box, FormControl, FormLabel, Stack } from '@mui/material';
import type { FieldSchema, FormSchema } from '@dynamic-forms/core';
import { MuiFieldRenderer } from './MuiFieldRenderer';
import type { MuiFieldRegistry } from '../registry';
import { warnInMuiDevelopment } from '../development';

export type MuiLayoutNode =
  | { kind: 'field'; name: string }
  | { kind: 'stack'; direction?: 'row' | 'column'; spacing?: number; children: readonly MuiLayoutNode[] }
  | { kind: 'grid'; columns?: number; gap?: number; children: readonly MuiLayoutNode[] }
  | { kind: 'group'; label?: string; children: readonly MuiLayoutNode[] };

export interface MuiFormRendererProps {
  schema: FormSchema;
  registry: MuiFieldRegistry;
  layout?: readonly MuiLayoutNode[];
}

/** Schema renderer with an optional MUI-only layout tree. Core stays layout-library neutral. */
export function MuiFormRenderer({ schema, registry, layout }: MuiFormRendererProps) {
  const fields = new Map<string, FieldSchema>(schema.fields.map((field) => [field.name, field]));
  if (!layout) return <>{schema.fields.map((field) => <MuiFieldRenderer key={field.name} field={field} registry={registry} />)}</>;

  const renderNode = (node: MuiLayoutNode, key: string): React.ReactNode => {
    if (node.kind === 'field') {
      const field = fields.get(node.name);
      if (!field) {
        warnInMuiDevelopment(`Layout references unknown field "${node.name}" in form "${schema.id}".`);
        return null;
      }
      return <MuiFieldRenderer key={key} field={field} registry={registry} />;
    }
    const children = node.children.map((child, index) => renderNode(child, `${key}-${index}`));
    if (node.kind === 'stack') return <Stack key={key} direction={node.direction ?? 'column'} spacing={node.spacing ?? 2}>{children}</Stack>;
    if (node.kind === 'grid') return <Box key={key} sx={{ display: 'grid', gridTemplateColumns: `repeat(${node.columns ?? 1}, minmax(0, 1fr))`, gap: node.gap ?? 2 }}>{children}</Box>;
    return <FormControl key={key} component="fieldset" fullWidth><FormLabel component="legend">{node.label}</FormLabel>{children}</FormControl>;
  };

  return <>{layout.map((node, index) => renderNode(node, `layout-${index}`))}</>;
}