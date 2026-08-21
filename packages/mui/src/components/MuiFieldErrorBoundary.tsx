import { Alert } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { warnInMuiDevelopment } from '../development';

interface Props { fieldName: string; children: ReactNode; }
interface State { error?: Error; }

/** Isolates a failing custom control without taking down the whole form. */
export class MuiFieldErrorBoundary extends Component<Props, State> {
  state: State = {};
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    warnInMuiDevelopment(`Field "${this.props.fieldName}" failed to render: ${error.message}`);
    if (info.componentStack) warnInMuiDevelopment(info.componentStack);
  }
  render(): ReactNode {
    if (this.state.error) return <Alert severity="error" role="alert">Unable to render field “{this.props.fieldName}”.</Alert>;
    return this.props.children;
  }
}