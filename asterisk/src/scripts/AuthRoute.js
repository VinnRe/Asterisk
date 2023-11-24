import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRoute = ({ element: Element, ...rest }) => {
  const isAuthenticated = !!Cookies.get('accessToken');

  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/login-signup" replace />}
    />
  );
};

export default AuthRoute;
