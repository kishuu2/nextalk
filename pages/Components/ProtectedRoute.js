import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../axiosConfig';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    axios.get('/check-auth')
      .then(res => setIsAuth(res.data.authenticated))
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <div>Checking session...</div>;
  if (!isAuth) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
