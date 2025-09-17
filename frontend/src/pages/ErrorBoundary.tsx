import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // log error
  }
  render() {
    if (this.state.hasError) return <div>Something went wrong.</div>;
    return this.props.children;
  }
}
