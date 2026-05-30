'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Save crash report to localStorage
    try {
      const crashes = JSON.parse(localStorage.getItem('chronos_crashes') ?? '[]')
      crashes.unshift({ error: error.message, stack: error.stack, timestamp: Date.now() })
      localStorage.setItem('chronos_crashes', JSON.stringify(crashes.slice(0, 10)))
    } catch {}
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))] p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-[rgb(var(--text-muted))] text-sm mb-2">
              Chronos encountered an unexpected error. Your data is safe.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl p-3 text-left overflow-auto mb-4 max-h-32 text-red-600">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
