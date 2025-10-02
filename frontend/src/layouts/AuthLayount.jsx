// src/layouts/AuthLayout.jsx
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AuthLayout = () => {
  const { user, token } = useAuthStore();
  
  // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
  if (user && token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
        <>
          <Outlet />
      </>
  );
};

export default AuthLayout;