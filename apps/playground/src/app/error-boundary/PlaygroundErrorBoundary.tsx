import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

interface State { error?: Error; }
export interface PlaygroundErrorBoundaryProps extends PropsWithChildren { fallback?: (error: Error, reset: () => void) => ReactNode; }

export class PlaygroundErrorBoundary extends Component<PlaygroundErrorBoundaryProps, State> {
  state: State = {};
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Playground render failure', error, info.componentStack); }
  reset = () => this.setState({ error: undefined });
  render() {
    if (!this.state.error) return this.props.children;
    return this.props.fallback?.(this.state.error, this.reset) ?? <main role="alert"><h1>Demo unavailable</h1><p>{this.state.error.message}</p><button type="button" onClick={this.reset}>Try again</button></main>;
  }
}
