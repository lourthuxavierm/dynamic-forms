import { useState } from 'react';
import type { FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { MuiForm } from '@dynamic-forms/mui';
import { Alert, Box, Paper, Typography } from '@mui/material';
export interface QuickstartValues extends Record<string, unknown> {
  fullName: string;
  email: string;
  role: string;
}
export const quickstartSchema: FormSchema = {
  id: 'quickstart-contact',
  version: '1.0.0',
  fields: [
    { name: 'fullName', type: 'text', label: 'Full name', placeholder: 'Ada Lovelace', validation: { required: true, minLength: 2 } },
    {
      name: 'email',
      type: 'email',
      label: 'Work email',
      placeholder: 'ada@example.com',
      validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Developer', value: 'developer' },
        { label: 'Designer', value: 'designer' },
        { label: 'Product manager', value: 'product-manager' },
      ],
      validation: { required: true },
    },
  ],
};
const initialValues: QuickstartValues = { fullName: '', email: '', role: '' };
export function QuickstartExample() {
  const [submitted, setSubmitted] = useState<QuickstartValues | null>(null);
  return (
    <Box component="main" sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography component="h1" variant="h4" gutterBottom>Create your profile</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>This form is rendered from a typed schema.</Typography>
        <FormProvider<QuickstartValues>
          schema={quickstartSchema}
          defaultValues={initialValues}
          validationMode="onBlur"
        >
          <MuiForm
            schema={quickstartSchema}
            submitLabel="Create profile"
            onSubmit={(values) => setSubmitted(values as QuickstartValues)}
          />
        </FormProvider>
        {submitted && (
          <Alert severity="success" sx={{ mt: 3 }} data-testid="submission-result">
            Profile created for {submitted.fullName} ({submitted.email}).
          </Alert>
        )}
      </Paper>
    </Box>
  );
}