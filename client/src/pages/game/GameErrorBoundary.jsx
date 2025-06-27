import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  background-color: var(--surface);
  border-radius: 10px;
  margin: 20px 0;
  color: var(--light);
  border: 1px solid var(--secondary);
`;

const ErrorTitle = styled.h3`
  color: var(--secondary);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ErrorMessage = styled.div`
  margin-bottom: 15px;
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {

    console.error('Game component error:', error, errorInfo);
    this.setState({ errorInfo });
    

    if (window.errorReporter) {
      window.errorReporter.captureException(error, { extra: errorInfo });
    }
  }
  
  handleRetry = () => {

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };
  
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>
            <i className="fas fa-exclamation-triangle"></i>
            {this.props.componentName || 'Game'} Component Error
          </ErrorTitle>
          
          <p>Something went wrong with this component. Please try refreshing or resetting the game.</p>
          
          {this.state.error && (
            <ErrorMessage>
              {this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </ErrorMessage>
          )}
          
          <ErrorActions>
            <button className="btn btn-primary" onClick={this.handleRetry}>
              <i className="fas fa-sync"></i> Retry
            </button>
            
            <button className="btn btn-outline" onClick={this.handleReset}>
              <i className="fas fa-power-off"></i> Reset
            </button>
            
            {this.props.children.type && (
              <span style={{ color: 'var(--light-muted)', fontStyle: 'italic', marginLeft: 'auto' }}>
                Component: {this.props.children.type.name || 'Unknown'}
              </span>
            )}
          </ErrorActions>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;