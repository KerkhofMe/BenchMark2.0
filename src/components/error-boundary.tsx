import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('mcsb-control-statuses');
    localStorage.removeItem('mcsb-control-notes');
    localStorage.removeItem('mcsb-evidence-links');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-lg w-full text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-4">
              The application encountered an unexpected error. This may be caused by corrupted local data.
            </p>
            <details className="text-left mb-6">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">Error details</summary>
              <pre className="mt-2 text-xs text-red-400 bg-slate-900 rounded p-3 overflow-x-auto">
                {this.state.error?.message}
              </pre>
            </details>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                Try again
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Reset storage &amp; reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
