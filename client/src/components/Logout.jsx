import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true
});

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Toast.fire({
      icon: 'success',
      title: 'Has cerrado sesión correctamente.'
    });
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1500);
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