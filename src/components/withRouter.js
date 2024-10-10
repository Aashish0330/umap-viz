import React from 'react';
import { useNavigate } from 'react-router-dom';

// Create a withRouter HOC that injects the navigate function into class components
export function withRouter(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}