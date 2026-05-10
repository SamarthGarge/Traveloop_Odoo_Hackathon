import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Navbar from './Navbar';
import { useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useStore();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (!isLoggedIn && !isAuthPage) {
      navigate('/login');
    }
  }, [isLoggedIn, isAuthPage, navigate]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen midnight-gradient">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
