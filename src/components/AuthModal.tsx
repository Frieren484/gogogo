import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AppUserProfile,
  authenticateWithCredentials,
  getRegisteredAccounts,
  PRESET_CLIENTS,
  PRESET_DOCTORS,
  RegisteredAccount,
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
  const [showPassword, setShowPassword] = useState(true);
  const [filledAccountLabel, setFilledAccountLabel] = useState<string | null>(null);

  // Expandable Role Drawers State ("выдвижные вкладки")
  const [openDrawer, setOpenDrawer] = useState<'clients' | 'doctors' | 'admin' | null>('clients');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('+7 ');
  const [regLogin, setRegLogin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPetSpecies, setRegPetSpecies] = useState<'Кошка' | 'Собака' | 'Грызун'>('Кошка');
  const [regPetName, setRegPetName] = useState('');

  const [customRegisteredAccounts, setCustomRegisteredAccounts] = useState<RegisteredAccount[]>(
    () => getRegisteredAccounts()
  );

  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setLoginInput('');
      setPasswordInput('');
      setFilledAccountLabel(null);
      setErrorMessage('');
      setStatusMessage('');
      setCustomRegisteredAccounts(getRegisteredAccounts());
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

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
    }, 380);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(loginInput, passwordInput);
  };

  /**
   * Подставляет логин и пароль выбранного пользователя прямо в поля формы входа
   * (по требованию: "нажимаешь на определённого и подставляется логин и пароль")
   */
  const handleFillCredentials = (login: string, pass: string, label: string) => {
    setErrorMessage('');
    setStatusMessage('');
    setLoginInput(login);
    setPasswordInput(pass);
    setShowPassword(true);
    setFilledAccountLabel(label);
  };

  const handleQuickInstantLogin = (login: string, pass: string, label: string) => {
    setLoginInput(login);
    setPasswordInput(pass);
    setFilledAccountLabel(label);
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

    // Сразу обновляем список зарегистрированных клиентов для выдвижной вкладки «Клиенты»
    setCustomRegisteredAccounts(getRegisteredAccounts());
    onUserChanged(result.user);

    setRegFullName('');
    setRegPhone('+7 ');
    setRegLogin('');
    setRegPassword('');
    setRegPetName('');
    setStatusMessage(
      `Аккаунт «${result.user.displayName}» создан и добавлен в выдвижной список клиентов!`
    );
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

  const totalClientsCount = PRESET_CLIENTS.length + customRegisteredAccounts.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-[540px] rounded-2xl bg-[#FCFBF7] border border-[#CFE2DA] shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-[#EEF5F1] border-b border-[#CFE2DA]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0F2922] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Lock className="w-5 h-5 text-[#5EEAD4]" />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="text-lg font-bold text-[#122B24] tracking-tight leading-snug"
              >
                Вход в личный кабинет
              </h2>
              <p className="text-xs text-[#35524A]">
                Выдвижные списки демо-аккаунтов для клиентов, 8 врачей и администратора
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#35524A] hover:text-[#122B24] hover:bg-[#DCECE5] transition-snappy cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4">
          {/* Optional prompt notification */}
          {authReasonMessage && currentUser.authSource === 'guest' && (
            <div className="mx-6 mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs font-medium text-amber-900">
              {authReasonMessage}
            </div>
          )}

          {/* Active Account Pill if logged in */}
          {currentUser.authSource !== 'guest' && (
            <div className="mx-6 mb-4 rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full border border-[#CFE2DA] object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#122B24] truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[11px] text-[#35524A] truncate">
                    Роль:{' '}
                    {currentUser.role === 'admin'
                      ? 'Администратор CRM'
                      : currentUser.role === 'doctor'
                      ? 'Врач клиники'
                      : 'Клиент клиники'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="py-1 px-2.5 rounded-lg border border-[#CFE2DA] bg-white hover:bg-red-50 text-[11px] font-semibold text-[#35524A] hover:text-red-600 inline-flex items-center gap-1 transition-snappy cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Выйти</span>
              </button>
            </div>
          )}

          {/* Tab switcher: "Вход в аккаунт" | "Регистрация клиента" */}
          <div className="px-6 mb-4">
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#E5EFEA] rounded-xl border border-[#CFE2DA]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#FCFBF7] text-[#122B24] shadow-xs'
                    : 'text-[#35524A] hover:text-[#122B24]'
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
                    ? 'bg-[#FCFBF7] text-[#122B24] shadow-xs'
                    : 'text-[#35524A] hover:text-[#122B24]'
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
            <div className="px-6 pb-6 space-y-4">
              {/* EXPANDABLE DEMO DRAWERS FOR CLIENTS, DOCTORS, AND ADMIN */}
              <div className="rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#122B24]">
                    <KeyRound className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                    <span>Выдвижные списки аккаунтов (нажмите для подстановки):</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#0F766E] bg-[#DCECE5] px-2 py-0.5 rounded-md">
                    Демо-режим
                  </span>
                </div>

                {/* DRAWER 1: CLIENTS (Preset + Newly Registered) */}
                <div className="rounded-xl bg-[#FCFBF7] border border-[#CFE2DA] overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDrawer((prev) => (prev === 'clients' ? null : 'clients'))
                    }
                    className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#F2F7F4] transition-snappy cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0D9488]" />
                      <span className="text-xs font-bold text-[#122B24]">
                        Клиенты клиники ({totalClientsCount})
                      </span>
                      {customRegisteredAccounts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          +{customRegisteredAccounts.length} новорег
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#35524A] transition-transform ${
                        openDrawer === 'clients' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openDrawer === 'clients' && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#CFE2DA]/70 space-y-1.5 max-h-48 overflow-y-auto">
                      <div className="text-[11px] text-[#35524A] mb-1">
                        Нажмите на клиента — его логин и пароль сразу подставятся в поля ниже:
                      </div>

                      {/* Newly registered accounts first so they are immediately accessible */}
                      {customRegisteredAccounts.map((acc) => {
                        const isSelected = loginInput === acc.login;
                        return (
                          <div
                            key={acc.uid}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400/40'
                                : 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleFillCredentials(
                                  acc.login,
                                  acc.password,
                                  `Новорег: ${acc.displayName}`
                                )
                              }
                              className="flex-1 text-left min-w-0 cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                                  Новорег
                                </span>
                                <span className="text-xs font-bold text-[#122B24] truncate">
                                  {acc.displayName}
                                </span>
                                {acc.petName && (
                                  <span className="text-[11px] text-[#35524A] truncate">
                                    · {acc.petSpecies || 'Питомец'} «{acc.petName}»
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-emerald-900 mt-0.5">
                                Логин: <strong>{acc.login}</strong> · Пароль:{' '}
                                <strong>{acc.password}</strong>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInstantLogin(
                                  acc.login,
                                  acc.password,
                                  `Новорег: ${acc.displayName}`
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                              title="Подставить и сразу войти"
                            >
                              Войти →
                            </button>
                          </div>
                        );
                      })}

                      {/* Preset Demo Clients */}
                      {PRESET_CLIENTS.map((client, idx) => {
                        const isSelected = loginInput === client.login;
                        return (
                          <div
                            key={client.login}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-[#E6F4F1] border-[#0D9488] ring-1 ring-[#0D9488]/30'
                                : 'bg-white border-[#CFE2DA] hover:bg-[#F2F7F4]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleFillCredentials(
                                  client.login,
                                  '123',
                                  `Клиент: ${client.displayName}`
                                )
                              }
                              className="flex-1 text-left min-w-0 cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#122B24]">
                                  Клиент {idx + 1}: {client.displayName}
                                </span>
                                <span className="text-[11px] text-[#35524A] truncate">
                                  ({client.petSpecies} «{client.petName}»)
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-[#0F766E] mt-0.5">
                                Логин: <strong>{client.login}</strong> · Пароль:{' '}
                                <strong>123</strong>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInstantLogin(
                                  client.login,
                                  '123',
                                  `Клиент: ${client.displayName}`
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                              title="Подставить и сразу войти"
                            >
                              Войти →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* DRAWER 2: DOCTORS (8 Specialists · Brigade 1 & Brigade 2) */}
                <div className="rounded-xl bg-[#FCFBF7] border border-[#CFE2DA] overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDrawer((prev) => (prev === 'doctors' ? null : 'doctors'))
                    }
                    className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#F2F7F4] transition-snappy cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-[#122B24]">
                        Врачи клиники ({PRESET_DOCTORS.length} специалистов)
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#35524A] transition-transform ${
                        openDrawer === 'doctors' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openDrawer === 'doctors' && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#CFE2DA]/70 space-y-1.5 max-h-56 overflow-y-auto">
                      <div className="text-[11px] text-[#35524A] mb-1">
                        Нажмите на врача для подстановки логина и пароля (пароль всех врачей: 123):
                      </div>

                      {PRESET_DOCTORS.map((doc) => {
                        const isSelected = loginInput === doc.login;
                        return (
                          <div
                            key={doc.doctorId}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400/40'
                                : 'bg-white border-[#CFE2DA] hover:bg-amber-50/40'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleFillCredentials(
                                  doc.login,
                                  '123',
                                  `Врач: ${doc.displayName}`
                                )
                              }
                              className="flex-1 text-left min-w-0 cursor-pointer"
                            >
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-[#122B24] truncate">
                                  {doc.displayName}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    doc.brigade === 1
                                      ? 'bg-[#E6F4F1] text-[#0F766E]'
                                      : 'bg-indigo-50 text-indigo-700'
                                  }`}
                                >
                                  {doc.shiftLabel}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-amber-900 mt-0.5">
                                Логин: <strong>{doc.login}</strong> · Пароль: <strong>123</strong>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInstantLogin(
                                  doc.login,
                                  '123',
                                  `Врач: ${doc.displayName}`
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                            >
                              Войти →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* DRAWER 3: ADMIN CRM (Separate Expandable Tab) */}
                <div className="rounded-xl bg-[#FCFBF7] border border-[#CFE2DA] overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDrawer((prev) => (prev === 'admin' ? null : 'admin'))
                    }
                    className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#F2F7F4] transition-snappy cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-[#122B24]">
                        Администратор CRM (управление клиникой)
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#35524A] transition-transform ${
                        openDrawer === 'admin' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openDrawer === 'admin' && (
                    <div className="px-3 pb-3 pt-1.5 border-t border-[#CFE2DA]/70">
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-300">
                        <button
                          type="button"
                          onClick={() =>
                            handleFillCredentials('1', '1', 'Главный Администратор CRM')
                          }
                          className="flex-1 text-left cursor-pointer"
                        >
                          <div className="text-xs font-bold text-blue-950">
                            Главный Администратор CRM «Лапа Помощи»
                          </div>
                          <div className="text-[11px] font-mono text-blue-800 mt-0.5">
                            Логин: <strong>1</strong> · Пароль: <strong>1</strong> (нажмите для подстановки)
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickInstantLogin('1', '1', 'Главный Администратор CRM')
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                        >
                          Войти →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification when credentials are populated into the form */}
              {filledAccountLabel && (
                <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488]/40 px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-[#122B24]">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                    <span>
                      Подставлены данные: <strong>{filledAccountLabel}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#0F766E]">
                    {loginInput} / {passwordInput}
                  </span>
                </div>
              )}

              {/* Standard Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#122B24] mb-1">
                    Логин
                  </label>
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => {
                      setLoginInput(e.target.value);
                      setFilledAccountLabel(null);
                    }}
                    placeholder="Выберите пользователя выше или введите логин"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] placeholder:text-[#35524A]/60 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#122B24] mb-1">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setFilledAccountLabel(null);
                      }}
                      placeholder="Введите пароль"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] placeholder:text-[#35524A]/60 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#35524A] hover:text-[#122B24] cursor-pointer"
                      title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl border border-[#CFE2DA] bg-[#EEF5F1] hover:bg-[#DCECE5] text-[#122B24] font-semibold text-xs transition-snappy cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition-snappy cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Войти в систему</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TAB 2: CLIENT REGISTRATION */
            <form onSubmit={handleRegisterSubmit} className="px-6 pb-6 space-y-3.5">
              <div className="rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] px-3.5 py-2.5 text-xs text-[#122B24]">
                Создайте профиль владельца питомца. Новый аккаунт сразу появится в выдвижной вкладке{' '}
                <strong>«Клиенты клиники»</strong> для быстрого входа в 1 клик.
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1">
                  ФИО владельца *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Например, Иван Петров"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#122B24] mb-1">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#122B24] mb-1">
                    Логин для входа *
                  </label>
                  <input
                    type="text"
                    required
                    value={regLogin}
                    onChange={(e) => setRegLogin(e.target.value)}
                    placeholder="ivan"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] font-mono focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#122B24] mb-1">
                    Пароль *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Придумайте пароль"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] font-mono focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#122B24] mb-1">
                    Вид питомца *
                  </label>
                  <select
                    value={regPetSpecies}
                    onChange={(e) =>
                      setRegPetSpecies(e.target.value as 'Кошка' | 'Собака' | 'Грызун')
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="Кошка">Кошка</option>
                    <option value="Собака">Собака</option>
                    <option value="Грызун">Грызун</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1">
                  Кличка питомца *
                </label>
                <input
                  type="text"
                  required
                  value={regPetName}
                  onChange={(e) => setRegPetName(e.target.value)}
                  placeholder="Например, Барсик"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="py-2.5 px-4 rounded-xl border border-[#CFE2DA] bg-[#EEF5F1] hover:bg-[#DCECE5] text-[#122B24] font-semibold text-xs transition-snappy cursor-pointer"
                >
                  Вернуться ко входу
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition-snappy cursor-pointer inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Зарегистрироваться и войти</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
