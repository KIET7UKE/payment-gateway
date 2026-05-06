'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 rounded-full bg-red-50 p-4 text-red-500">
            <AlertTriangle size={48} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Something went wrong</h2>
          <p className="mb-8 text-gray-500">
            An unexpected error occurred. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-black active:scale-95"
          >
            <RefreshCw size={18} />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
