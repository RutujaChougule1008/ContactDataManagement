
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('token');

  // Function to check if the token is expired
  const isTokenExpired = (token) => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= exp * 1000;
    } catch (e) {
      return true;
    }
  };

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token'); // Clear invalid token
    alert('Your session has expired. Please log in again.');
    return <Navigate to="/" />;
  }

  return element;
};

export default PrivateRoute;


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const PrivateRoute = ({ element }) => {
//   const isAuthenticated = !!localStorage.getItem('token'); // Check for the token

//   return isAuthenticated ? element : <Navigate to="/" />;
// };

// export default PrivateRoute;
