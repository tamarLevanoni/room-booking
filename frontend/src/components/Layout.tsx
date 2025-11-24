import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LogOut, Home } from 'lucide-react';

export function Layout() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-blue-600">
              <Home className="w-6 h-6" />
              Room Booking
            </Link>

            <nav className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Room Booking Platform &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
