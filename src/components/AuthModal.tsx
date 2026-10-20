import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import {
  AppUserProfile,
  authenticateWithCredentials,
  signInWithGoogleWithFallback,
  signOutAccount,
} from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserProfile;
  onUserChanged: (user: AppUserProfile) => void;
  initialMode?: 'login' | 'register';
  authReasonMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  authReasonMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google');
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('google');
      setErrorMessage('');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const result = authenticateWithCredentials(loginInput, passwordInput);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    onUserChanged(result.user);
    setLoginInput('');
    setPasswordInput('');
    setStatusMessage(
      'Вход выполнен: активирован режим Главного администратора (Логин: 1). Открываем панель управления...'
    );
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const profile = await signInWithGoogleWithFallback();
      onUserChanged(profile);
      setStatusMessage(`Вход через Google выполнен (${profile.displayName}).`);
      setTimeout(() => {
        onClose();
      }, 450);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLogout = async () => {
    setErrorMessage('');
    const guest = await signOutAccount();
    onUserChanged(guest);
    setStatusMessage('Вы вышли из аккаунта. Текущий режим — Гость.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#F4FAF8] border-b border-[#D1EAE4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-lg font-bold text-[#0F2922]">
                Вход в систему «Лапа Помощи»
              </h3>
              <p className="text-xs text-[#335249]">
                Клиенты входят через Google · Администратор по логину и паролю
              </p>
            </div>
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
          {/* Mandatory Auth Notice when triggered by booking */}
          {authReasonMessage && currentUser.authSource === 'guest' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-medium text-amber-900">
              {authReasonMessage}
            </div>
          )}

          {/* Active Session Summary */}
          <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border border-[#D1EAE4] shrink-0 object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0F2922] truncate">
                    {currentUser.displayName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                      currentUser.role === 'admin'
                        ? 'bg-[#FFF3E6] text-[#EA580C]'
                        : 'bg-[#E6F4F1] text-[#0D9488]'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'Админ' : 'Клиент'}
                  </span>
                </div>
                <div className="text-xs text-[#335249] truncate">
                  {currentUser.authSource === 'guest'
                    ? 'Гостевой режим'
                    : currentUser.role === 'admin'
                      ? 'Служебный доступ администратора'
                      : 'Авторизован через Google'}
                </div>
              </div>
            </div>

            {currentUser.authSource !== 'guest' && (
              <button
                type="button"
                onClick={handleLogout}
                className="py-1.5 px-3 rounded-lg border border-[#D1EAE4] bg-white hover:bg-red-50 text-xs font-semibold text-[#335249] hover:text-red-600 inline-flex items-center gap-1.5 transition-snappy shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            )}
          </div>

          {/* Mode Tabs: Clients (Google) vs Staff (Admin 1/1) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4FAF8] rounded-xl border border-[#D1EAE4]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setErrorMessage('');
                setStatusMessage('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-snappy cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#335249] hover:text-[#0F2922]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Для клиентов (Google)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage('');
                setStatusMessage('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-snappy cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#335249] hover:text-[#0F2922]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Сотрудник / Админ</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 flex items-start gap-2 text-xs font-medium text-red-700">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488] px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-[#0F2922]">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === 'google' ? (
            /* TAB 1: GOOGLE LOGIN FOR ALL REGULAR USERS */
            <div className="space-y-4">
              <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 space-y-2">
                <div className="text-sm font-bold text-[#0F2922]">
                  Быстрый вход для владельцев питомцев
                </div>
                <p className="text-xs text-[#335249] leading-relaxed">
                  Вход клиентов выполняется в один клик через ваш аккаунт{' '}
                  <strong>Google</strong> без паролей и кодов подтверждения. Все ваши записи на прием, именные талоны и электронная медкарта питомца привязываются к вашему профилю.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="w-full py-3.5 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-bold shadow-md inline-flex items-center justify-center gap-2.5 transition-snappy cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {loadingGoogle
                    ? 'Подключение к аккаунту Google...'
                    : 'Войти через Google'}
                </span>
              </button>
            </div>
          ) : (
            /* TAB 2: ADMIN LOGIN BY CREDENTIALS (STRICTLY 1 / 1) */
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="rounded-xl bg-[#FFF3E6] border border-[#FDBA74] px-3.5 py-2.5 text-xs text-[#9A3412]">
                Служебный вход по логину и паролю предназначен <strong>только для главного администратора</strong> клиники (Логин: <strong className="tabular-nums">1</strong>, Пароль: <strong className="tabular-nums">1</strong>).
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Логин администратора *
                </label>
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Введите логин (1)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Пароль *
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введите пароль (1)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-snappy inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Войти в панель администратора</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
