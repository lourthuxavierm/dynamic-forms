export interface CustomerOnboardingValues { name: string; company: string; country: string; state: string; city: string; taxId: string; }
export interface LoanApplicationValues { amount: number; deposit: number; applicants: string[]; reviewerRole: 'officer' | 'senior'; }
export interface AdminConfigurationValues { locale: string; session: number; role: 'admin' | 'editor' | 'viewer'; token: string; }

export const onboardingStates: Record<string, readonly string[]> = { IN: ['Tamil Nadu', 'Karnataka'], US: ['California', 'New York'] };
export const onboardingCities: Record<string, readonly string[]> = { 'Tamil Nadu': ['Chennai'], Karnataka: ['Bengaluru'], California: ['San Francisco'], 'New York': ['New York City'] };
export const customerOnboardingInitialValues: CustomerOnboardingValues = { name: '', company: '', country: 'IN', state: '', city: '', taxId: '' };
export const loanApplicationInitialValues: LoanApplicationValues = { amount: 500000, deposit: 100000, applicants: ['Primary applicant'], reviewerRole: 'officer' };
export const adminConfigurationInitialValues: AdminConfigurationValues = { locale: 'en-IN', session: 30, role: 'editor', token: 'secret-token' };
export const calculateFinancedAmount = ({ amount, deposit }: Pick<LoanApplicationValues, 'amount' | 'deposit'>): number => amount - deposit;
export const requiresSeniorApproval = (financedAmount: number, threshold = 300000): boolean => financedAmount > threshold;
export const redactAdminConfiguration = (values: AdminConfigurationValues): AdminConfigurationValues => ({ ...values, token: '[REDACTED]' });
