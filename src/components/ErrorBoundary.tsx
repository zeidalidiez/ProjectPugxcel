import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-8 bg-terminal-bg">
          <div className="text-terminal-fail text-2xl font-bold">Something went wrong</div>
          <pre className="text-terminal-text text-xs max-w-lg overflow-auto p-4 rounded border border-terminal-border bg-terminal-surface">
            {this.state.error?.message}
          </pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="px-4 py-2 rounded bg-terminal-accent text-black text-sm">
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
