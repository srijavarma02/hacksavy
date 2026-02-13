import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          padding: '20px',
          margin: '20px',
          color: '#ccd6f6'
        }}>
          <h2 style={{ color: '#ff6b6b' }}>⚠️ Component Error</h2>
          <p>{this.props.componentName} failed to render</p>
          <pre style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '10px',
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid #00d4ff',
              color: '#00d4ff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
