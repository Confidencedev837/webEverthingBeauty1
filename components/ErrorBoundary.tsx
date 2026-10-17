import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-brand-surface dark:bg-[#0D0D0D]">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#161616] border border-brand-interactive/30 shadow-[0_10px_40px_rgba(108,53,166,0.15)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertCircle className="w-8 h-8 text-brand-interactive" />
            </div>

            <h2 className="text-2xl font-serif font-black text-[#1A1A1A] dark:text-white mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-[#6C757D] dark:text-[#A0A0A0] mb-6 leading-relaxed">
              We encountered an unexpected issue while rendering this page. You can refresh or return to explore our services.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-brand-surface dark:bg-[#1F1F1F] rounded-xl text-left border border-[#E2E8F0] dark:border-[#2C2C2C] max-h-24 overflow-y-auto">
                <span className="text-[11px] font-mono text-brand-interactive font-bold block break-words">
                  {this.state.error.message}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 bg-brand-interactive text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-interactive/25 hover:bg-brand-interactive/90 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-[#202020] text-[#1A1A1A] dark:text-white rounded-xl text-xs font-bold border border-[#E2E8F0] dark:border-[#333] hover:border-brand-interactive transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
