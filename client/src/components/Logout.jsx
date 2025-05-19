import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await Swal.fire({
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      confirmButtonColor: '#3085d6',
      timer: 1500,
      showConfirmButton: false
    });
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