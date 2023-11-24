import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const AuthRoute = ({ children }) => {
  const isAuthenticated = !!Cookies.get('accessToken');

  return isAuthenticated ? <>{children}</> : <Navigate to="/login-signup" />
};
