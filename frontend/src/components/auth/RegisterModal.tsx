import { useState } from 'react';
import { useRegister } from '../../hooks/useAuth';
import { Button, Input } from '../ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Building2 } from 'lucide-react';

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export const RegisterModal = ({ open, onOpenChange, onSwitchToLogin }: RegisterModalProps) => {
  const { mutate: register, isPending } = useRegister();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    register(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({ name: '', email: '', password: '' });
        onSwitchToLogin?.();
      },
      onError: (err: Error) => {
        setError(err.message || 'Registration failed. Please try again.');
      },
    });
  };

  const handleSwitchToLogin = () => {
    onOpenChange(false);
    setFormData({ name: '', email: '', password: '' });
    setError('');
    onSwitchToLogin?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Create Account</DialogTitle>
          <DialogDescription className="text-center">
            Join us to start booking rooms
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isPending}
            />
          </div>

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
              placeholder="Choose a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
