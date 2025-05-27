import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosConfig';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const router = useRouter();

  useEffect(() => {
    axios.get('/check-auth')
      .then(res => setIsAuth(res.data.authenticated))
      .catch(() => setIsAuth(false));
  }, []);

 useEffect(() => {
    if (isAuth === false) {
      router.replace('/');
    }
}, [isAuth, router]);


  if (isAuth === null) return <div>Checking session...</div>;
  if (isAuth === false) return null; // Already redirected

  return children;
};

export default ProtectedRoute;
