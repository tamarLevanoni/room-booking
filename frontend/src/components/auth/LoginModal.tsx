import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
import { Button, Input } from '../ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Building2 } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal = ({ open, onOpenChange, onSwitchToRegister }: LoginModalProps) => {
  const { mutate: login, isPending } = useLogin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    login(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({ email: '', password: '' });
      },
      onError: (err: Error) => {
        setError(err.message || 'Login failed. Please try again.');
      },
    });
  };

  const handleSwitchToRegister = () => {
    onOpenChange(false);
    setFormData({ email: '', password: '' });
    setError('');
    onSwitchToRegister?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {onSwitchToRegister && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create one now
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
