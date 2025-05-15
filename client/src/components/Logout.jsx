import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return logout;
};

const Logout = () => {
  const logout = useLogout();

  useEffect(() => {
    logout();
  }, [logout]);

  return null;
};

export default Logout;