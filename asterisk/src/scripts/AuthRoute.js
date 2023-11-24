import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

export const AuthRoute = ({ children }) => {
  const isAuthenticated = !!Cookies.get('accessToken');

  return isAuthenticated ? <><Outlet /></> : <Navigate to="/login-signup" />
};
