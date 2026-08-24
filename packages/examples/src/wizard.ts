export interface WizardValues extends Record<string, unknown> { fullName: string; email: string; accountType: 'personal' | 'business'; companyName: string; notifications: boolean; }
export interface WizardStep { id: 'personal' | 'company' | 'preferences' | 'review'; label: string; }
export const wizardInitialValues: WizardValues = { fullName: '', email: '', accountType: 'personal', companyName: '', notifications: true };
export const wizardSteps: WizardStep[] = [{ id: 'personal', label: 'Personal details' }, { id: 'company', label: 'Company' }, { id: 'preferences', label: 'Preferences' }, { id: 'review', label: 'Review' }];
export const getActiveWizardSteps = (values: WizardValues) => wizardSteps.filter((step) => step.id !== 'company' || values.accountType === 'business');
export const validateWizardStep = (step: WizardStep['id'], values: WizardValues): Record<string, string> => { const errors: Record<string, string> = {}; if (step === 'personal') { if (!values.fullName.trim()) errors.fullName = 'Full name is required'; if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'A valid email is required'; } if (step === 'company' && !values.companyName.trim()) errors.companyName = 'Company name is required'; return errors; };
export const wizardDraftKey = 'dynamic-forms-playground-wizard-draft-v1';
