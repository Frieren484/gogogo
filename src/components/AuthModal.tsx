import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  ShieldAlert,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  AppUserProfile,
  authenticateWithCredentials,
  getRegisteredAccounts,
  registerNewClientAccount,
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
  initialMode = 'login',
  authReasonMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('+7 ');
  const [regLogin, setRegLogin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPetSpecies, setRegPetSpecies] = useState<'Кошка' | 'Собака' | 'Грызун'>('Кошка');
  const [regPetName, setRegPetName] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setLoginInput('');
      setPasswordInput('');
      setErrorMessage('');
      setStatusMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const customRegisteredAccounts = getRegisteredAccounts();

  const performLogin = (login: string, pass: string) => {
    setErrorMessage('');
    setStatusMessage('');

    const result = authenticateWithCredentials(login, pass);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    onUserChanged(result.user);
    const roleTitle =
      result.user.role === 'admin'
        ? 'Администратор CRM'
        : result.user.role === 'doctor'
        ? `Врач (${result.user.displayName})`
        : `Клиент (${result.user.displayName})`;

    setStatusMessage(`Вход выполнен успешно: ${roleTitle}`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(loginInput, passwordInput);
  };

  const handleQuickLogin = (login: string, pass: string) => {
    setLoginInput(login);
    setPasswordInput(pass);
    performLogin(login, pass);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const result = registerNewClientAccount({
      fullName: regFullName,
      login: regLogin,
      password: regPassword,
      phone: regPhone,
      petSpecies: regPetSpecies,
      petName: regPetName,
    });

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    onUserChanged(result.user);
    setRegFullName('');
    setRegPhone('+7 ');
    setRegLogin('');
    setRegPassword('');
    setRegPetName('');
    setStatusMessage(`Аккаунт ${result.user.displayName} успешно создан!`);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleLogout = async () => {
    setErrorMessage('');
    const guest = await signOutAccount();
    onUserChanged(guest);
    setStatusMessage('Вы вышли из учетной записи.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-[490px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="text-lg font-bold text-slate-900 tracking-tight leading-snug"
              >
                Вход в личный кабинет
              </h2>
              <p className="text-xs text-slate-500">
                Для клиентов и персонала клиники
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-snappy cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional prompt notification */}
        {authReasonMessage && currentUser.authSource === 'guest' && (
          <div className="mx-6 mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs font-medium text-amber-900">
            {authReasonMessage}
          </div>
        )}

        {/* Active Account Pill if logged in */}
        {currentUser.authSource !== 'guest' && (
          <div className="mx-6 mb-4 rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.displayName}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Роль: {currentUser.role === 'admin' ? 'Администратор CRM' : currentUser.role === 'doctor' ? 'Врач клиники' : 'Клиент'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-[11px] font-semibold text-slate-600 hover:text-red-600 inline-flex items-center gap-1 transition-snappy cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Выйти</span>
            </button>
          </div>
        )}

        {/* Tab switcher: "Вход в аккаунт" | "Регистрация клиента" */}
        <div className="px-6 mb-5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#EEF2F6] rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Вход в аккаунт
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Регистрация клиента
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="mx-6 mb-4 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 flex items-start gap-2 text-xs font-medium text-red-700">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="mx-6 mb-4 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* TAB 1: LOGIN ACCORDING TO USER'S SCREENSHOT */
          <div className="px-6 pb-6 space-y-4">
            {/* Quick Login Role Box */}
            <div className="rounded-xl bg-[#F0F6FF]/70 border border-[#BFDBFE] p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A]">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Быстрый вход для проверки ролей:</span>
              </div>

              {/* Group 1: Clients & Admin */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-[#475569]">
                  Клиенты и Администратор:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('alex', '123')}
                    className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono hover:bg-blue-50/60 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    Клиент 1: alex / 123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('kate', '123')}
                    className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono hover:bg-blue-50/60 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    Клиент 2: kate / 123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('1', '1')}
                    className="bg-white border border-blue-400 text-blue-700 font-bold rounded-lg px-2.5 py-1.5 text-xs font-mono hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    Админ CRM: 1 / 1
                  </button>
                  {customRegisteredAccounts.slice(0, 3).map((acc) => (
                    <button
                      key={acc.uid}
                      type="button"
                      onClick={() => handleQuickLogin(acc.login, acc.password)}
                      className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg px-2.5 py-1.5 text-xs font-mono hover:bg-emerald-100 transition-all cursor-pointer"
                      title={`Новорег: ${acc.displayName} (${acc.petSpecies || 'Питомец'} «${acc.petName || ''}»)`}
                    >
                      Новорег: {acc.login} / {acc.password}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#BFDBFE]/60 pt-2 space-y-1.5">
                <div className="text-[11px] font-medium text-[#475569]">
                  Врачи (видят только свои заявки, без удаления):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('smirnov', '123')}
                    className="bg-[#FEFCE8] border border-[#FDE047] text-[#713F12] rounded-lg px-2.5 py-1.5 text-[11px] font-mono hover:bg-[#FEF08A] text-left transition-all cursor-pointer truncate"
                  >
                    Алексей Смирнов: smirnov / 123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('volkova', '123')}
                    className="bg-[#FEFCE8] border border-[#FDE047] text-[#713F12] rounded-lg px-2.5 py-1.5 text-[11px] font-mono hover:bg-[#FEF08A] text-left transition-all cursor-pointer truncate"
                  >
                    Елена Волкова: volkova / 123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('morozov', '123')}
                    className="bg-[#FEFCE8] border border-[#FDE047] text-[#713F12] rounded-lg px-2.5 py-1.5 text-[11px] font-mono hover:bg-[#FEF08A] text-left transition-all cursor-pointer truncate"
                  >
                    Дмитрий Морозов: morozov / 123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('sokolova', '123')}
                    className="bg-[#FEFCE8] border border-[#FDE047] text-[#713F12] rounded-lg px-2.5 py-1.5 text-[11px] font-mono hover:bg-[#FEF08A] text-left transition-all cursor-pointer truncate"
                  >
                    Анна Соколова: sokolova / 123
                  </button>
                </div>
              </div>
            </div>

            {/* Standard Credentials Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Логин
                </label>
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Логин клиента или 1 для администратора"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 font-semibold text-xs transition-snappy cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-snappy cursor-pointer"
                >
                  Войти в систему
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* TAB 2: CLIENT REGISTRATION */
          <form onSubmit={handleRegisterSubmit} className="px-6 pb-6 space-y-3.5">
            <div className="rounded-xl bg-teal-50 border border-teal-200 px-3.5 py-2 text-xs text-teal-800">
              Создайте профиль владельца питомца для онлайн-записи и доступа к истории приемов.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                ФИО владельца *
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Например, Иван Петров"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Логин для входа *
                </label>
                <input
                  type="text"
                  required
                  value={regLogin}
                  onChange={(e) => setRegLogin(e.target.value)}
                  placeholder="ivan"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Пароль *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Придумайте пароль"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Вид питомца *
                </label>
                <select
                  value={regPetSpecies}
                  onChange={(e) =>
                    setRegPetSpecies(e.target.value as 'Кошка' | 'Собака' | 'Грызун')
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Кошка">Кошка</option>
                  <option value="Собака">Собака</option>
                  <option value="Грызун">Грызун</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Кличка питомца *
              </label>
              <input
                type="text"
                required
                value={regPetName}
                onChange={(e) => setRegPetName(e.target.value)}
                placeholder="Например, Барсик"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 font-semibold text-xs transition-snappy cursor-pointer"
              >
                Вернуться ко входу
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-snappy cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Зарегистрироваться и войти</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
