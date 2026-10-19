import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  UserPlus,
  X,
} from 'lucide-react';
import {
  AppUserProfile,
  authenticateWithCredentials,
  registerUserAccount,
  signInWithGoogleWithFallback,
  signOutAccount,
} from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserProfile;
  onUserChanged: (user: AppUserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [loginValue, setLoginValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setLoginValue('');
      setPasswordValue('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (activeTab === 'login') {
      const result = authenticateWithCredentials(loginValue, passwordValue);
      if (result.ok === false) {
        setErrorMessage(result.error);
        return;
      }

      onUserChanged(result.user);
      onClose();
      if (result.user.role === 'admin') {
        window.setTimeout(() => {
          document.getElementById('admin-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      const result = registerUserAccount(loginValue, passwordValue);
      if (result.ok === false) {
        setErrorMessage(result.error);
        return;
      }

      onUserChanged(result.user);
      setSuccessMessage(
        `Аккаунт «${result.user.login}» успешно зарегистрирован! Вы вошли с правами Пользователя (Клиента).`
      );
      setLoginValue('');
      setPasswordValue('');
      window.setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoadingGoogle(true);
    try {
      const profile = await signInWithGoogleWithFallback();
      onUserChanged(profile);
      onClose();
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSignOut = async () => {
    const guest = await signOutAccount();
    onUserChanged(guest);
    setLoginValue('');
    setPasswordValue('');
    setErrorMessage('');
    setSuccessMessage('Вы вышли из учетной записи.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#F4FAF8] border-b border-[#D1EAE4]">
          <div>
            <h3 id="auth-modal-title" className="text-lg font-bold text-[#0F2922]">
              {activeTab === 'login' ? 'Вход в систему' : 'Регистрация аккаунта'}
            </h3>
            <p className="text-xs text-[#335249]">
              {activeTab === 'login'
                ? 'Войдите по существующему логину и паролю или через Google'
                : 'Создание клиентского профиля (без доступа к админ-панели)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#335249] hover:text-[#0F2922] hover:bg-[#E6F4F1] transition-snappy cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Session Banner */}
          <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-[#D1EAE4] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F2922] truncate">
                  {currentUser.displayName}
                </div>
                <div className="text-[11px] text-[#335249] truncate">
                  Роль:{' '}
                  <strong
                    className={
                      currentUser.role === 'admin' ? 'text-[#F97316]' : 'text-[#0D9488]'
                    }
                  >
                    {currentUser.role === 'admin'
                      ? 'Администратор'
                      : 'Пользователь (Клиент)'}
                  </strong>
                </div>
              </div>
            </div>

            {currentUser.authSource !== 'guest' && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#E6F4F1] border border-[#D1EAE4] text-xs font-semibold text-[#0F2922] transition-snappy shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#335249]" />
                <span>Выйти</span>
              </button>
            )}
          </div>

          {/* Mode Switcher Tabs: Вход / Регистрация */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4FAF8] rounded-xl border border-[#D1EAE4]">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-snappy cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#335249] hover:text-[#0F2922]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Вход по данным</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-snappy cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#335249] hover:text-[#0F2922]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Регистрация</span>
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMessage && (
            <div className="rounded-xl bg-[#FFF7ED] border border-[#F97316]/40 p-3.5 flex items-start gap-2.5 text-xs text-[#9A3412]">
              <AlertCircle className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488]/40 p-3.5 flex items-start gap-2.5 text-xs text-[#0F2922]">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Minimal Login / Registration Form (Login + Password) */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-login-input"
                className="block text-xs font-bold text-[#0F2922] mb-1.5"
              >
                Логин
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#335249] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-login-input"
                  type="text"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  placeholder={
                    activeTab === 'login'
                      ? 'Введите логин (например: anna или 1)'
                      : 'Придумайте логин клиента'
                  }
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] text-sm text-[#0F2922] placeholder:text-[#335249]/60 focus:outline-none focus:border-[#0D9488] focus:bg-white transition-snappy"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password-input"
                className="block text-xs font-bold text-[#0F2922] mb-1.5"
              >
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#335249] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password-input"
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder={
                    activeTab === 'login' ? 'Введите пароль' : 'Придумайте пароль'
                  }
                  autoComplete={
                    activeTab === 'login' ? 'current-password' : 'new-password'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] text-sm text-[#0F2922] placeholder:text-[#335249]/60 focus:outline-none focus:border-[#0D9488] focus:bg-white transition-snappy"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm transition-snappy cursor-pointer"
            >
              {activeTab === 'login'
                ? 'Войти по логину и паролю'
                : 'Зарегистрироваться как Клиент'}
            </button>
          </form>

          {/* Google Sign-In (Client Only) on Login Tab */}
          {activeTab === 'login' && (
            <div className="pt-4 border-t border-[#D1EAE4] space-y-3">
              <div className="text-xs font-semibold text-[#335249] text-center">
                Или быстрый вход для клиентов через Google
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className="gsi-material-button w-full! justify-center!"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoadingGoogle
                      ? 'Вход через Google...'
                      : 'Войти через Google (Клиент)'}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Security & Role Isolation Notice */}
          <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] px-4 py-3 flex items-start gap-2.5 text-xs text-[#335249]">
            <ShieldAlert className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
            <div className="space-y-1">
              {activeTab === 'register' ? (
                <span>
                  Все новые аккаунты регистрируются строго с правами{' '}
                  <strong className="text-[#0F2922]">Пользователя (Клиента)</strong> и не
                  могут войти в систему администратора.
                </span>
              ) : (
                <span>
                  Для входа в систему <strong className="text-[#0F2922]">Администратора</strong>{' '}
                  используйте защищенные данные: логин <code className="font-bold">1</code>, пароль{' '}
                  <code className="font-bold">1</code>. Обычные пользователи не имеют доступа к Админ-панели.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
