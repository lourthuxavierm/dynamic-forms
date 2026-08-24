import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface HtmlFieldErrorBoundaryProps {
  fieldName: string;
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, fieldName: string) => ReactNode);
  onError?: (error: Error, info: ErrorInfo, fieldName: string) => void;
}
interface State { error?: Error; }

export class HtmlFieldErrorBoundary extends Component<HtmlFieldErrorBoundaryProps, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info, this.props.fieldName);
  }

  componentDidUpdate(previous: HtmlFieldErrorBoundaryProps): void {
    if (previous.fieldName !== this.props.fieldName && this.state.error) this.setState({ error: undefined });
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (typeof this.props.fallback === 'function') return this.props.fallback(error, this.props.fieldName);
    if (this.props.fallback !== undefined) return this.props.fallback;
    return <div role="alert" data-dynamic-forms-field-error={this.props.fieldName}>Unable to render this field.</div>;
  }
}
