import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoginModal, RegisterModal } from '../auth';
import { useAuthStore } from '../../stores/authStore';

export const Layout = () => {
  const {
    loginModalOpen,
    registerModalOpen,
    closeLoginModal,
    closeRegisterModal,
    openLoginModal,
    openRegisterModal,
  } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <LoginModal
        open={loginModalOpen}
        onOpenChange={closeLoginModal}
        onSwitchToRegister={openRegisterModal}
      />

      <RegisterModal
        open={registerModalOpen}
        onOpenChange={closeRegisterModal}
        onSwitchToLogin={openLoginModal}
      />
    </div>
  );
};
