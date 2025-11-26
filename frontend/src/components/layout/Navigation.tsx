import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';
import { LogOut, User } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, openLoginModal, openRegisterModal } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isAuthenticated) {
    return (
      <nav className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user?.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={openLoginModal}
      >
        Login
      </Button>
      <Button
        size="sm"
        onClick={openRegisterModal}
      >
        Register
      </Button>
    </nav>
  );
};
