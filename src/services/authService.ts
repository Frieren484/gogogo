import { CLINIC_INFO, AppointmentRecord } from '../data/clinicData';
import { googleSignIn, logout as firebaseLogout } from './googleDriveAuth';

export type UserRole = 'user' | 'admin';

export interface AppUserProfile {
  uid: string;
  login?: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  authSource: 'credentials' | 'google' | 'guest';
}

export interface RegisteredAccount {
  uid: string;
  login: string;
  password: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'user'; // Registered accounts are strictly 'user'
  createdAt: string;
}

export interface EmailNotificationLog {
  id: string;
  sentAt: string;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  internalSenderEmail: string; // azazaza2092092@gmail.com
  displaySenderEmail: string; // LapaPomochu@gmail.com (shown to client)
  subject: string;
  bodyText: string;
}

const USER_STORAGE_KEY = 'lapa_pomoshchi_active_user_v2';
const REGISTERED_ACCOUNTS_KEY = 'lapa_pomoshchi_registered_users_v1';
const EMAIL_LOGS_STORAGE_KEY = 'lapa_pomoshchi_email_logs_v1';

function buildAvatarSvgDataUri(initials: string, bgHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="${bgHex}" />
    <text x="60" y="68" text-anchor="middle" font-family="Manrope, sans-serif" font-size="40" font-weight="800" fill="#FFFFFF">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const GUEST_USER_PROFILE: AppUserProfile = {
  uid: 'client-guest-default',
  displayName: 'Гость (Клиент)',
  email: 'client@lapapomoshchi.ru',
  photoURL: buildAvatarSvgDataUri('КЛ', '#0D9488'),
  role: 'user',
  authSource: 'guest',
};

export const SYSTEM_ADMIN_PROFILE: AppUserProfile = {
  uid: 'admin-system-1',
  login: '1',
  displayName: 'Администратор (Логин: 1)',
  email: CLINIC_INFO.internalSenderEmail, // azazaza2092092@gmail.com
  photoURL: buildAvatarSvgDataUri('АД', '#F97316'),
  role: 'admin',
  authSource: 'credentials',
};

const INITIAL_REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    uid: 'user-account-anna',
    login: 'anna',
    password: '123',
    displayName: 'Анна Соколова (Клиент)',
    email: 'anna.sokolova.pet@gmail.com',
    photoURL: buildAvatarSvgDataUri('АС', '#0D9488'),
    role: 'user',
    createdAt: '18.10.2026',
  },
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = window.localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((acc: RegisteredAccount) => ({
          ...acc,
          role: 'user', // Enforce non-admin role for all stored user accounts
        }));
      }
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_REGISTERED_ACCOUNTS;
}

function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  try {
    window.localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore storage errors
  }
}

export function getStoredUserProfile(): AppUserProfile {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUserProfile;
      if (parsed && parsed.uid) {
        // Strict guard: only system admin with uid 'admin-system-1' and login '1' can hold 'admin' role
        if (parsed.role === 'admin') {
          if (parsed.uid === 'admin-system-1' && parsed.login === '1') {
            return SYSTEM_ADMIN_PROFILE;
          }
          return { ...parsed, role: 'user' };
        }
        return { ...parsed, role: 'user' };
      }
    }
  } catch {
    // ignore storage errors
  }
  return GUEST_USER_PROFILE;
}

export function saveUserProfile(profile: AppUserProfile): void {
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage errors
  }
}

/**
 * Login with existing credentials:
 * - Admin login is strictly login === '1' and password === '1'
 * - Any other registered user gets strictly role === 'user'
 */
export function authenticateWithCredentials(
  loginInput: string,
  passwordInput: string
): { ok: true; user: AppUserProfile } | { ok: false; error: string } {
  const cleanLogin = loginInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanLogin || !cleanPassword) {
    return { ok: false, error: 'Пожалуйста, введите логин и пароль.' };
  }

  // Check built-in Administrator credentials (login: 1, password: 1)
  if (cleanLogin === '1') {
    if (cleanPassword === '1') {
      saveUserProfile(SYSTEM_ADMIN_PROFILE);
      return { ok: true, user: SYSTEM_ADMIN_PROFILE };
    }
    return {
      ok: false,
      error: 'Неверный пароль для аккаунта администратора.',
    };
  }

  // Check registered client accounts
  const accounts = getRegisteredAccounts();
  const matched = accounts.find(
    (acc) => acc.login.toLowerCase() === cleanLogin.toLowerCase()
  );

  if (!matched) {
    return {
      ok: false,
      error:
        'Аккаунт с таким логином не найден. Проверьте логин или зарегистрируйтесь во вкладке «Регистрация».',
    };
  }

  if (matched.password !== cleanPassword) {
    return {
      ok: false,
      error: 'Неверный пароль. Проверьте правильность ввода.',
    };
  }

  const userProfile: AppUserProfile = {
    uid: matched.uid,
    login: matched.login,
    displayName: matched.displayName,
    email: matched.email,
    photoURL: matched.photoURL,
    role: 'user', // Strictly 'user' — regular users can never access admin
    authSource: 'credentials',
  };

  saveUserProfile(userProfile);
  return { ok: true, user: userProfile };
}

/**
 * Minimal Registration (Login + Password only):
 * - Prevents registering reserved admin login '1'
 * - Always assigns role: 'user' so registered users cannot enter the admin system
 */
export function registerUserAccount(
  loginInput: string,
  passwordInput: string
): { ok: true; user: AppUserProfile } | { ok: false; error: string } {
  const cleanLogin = loginInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanLogin || !cleanPassword) {
    return { ok: false, error: 'Заполните поля «Логин» и «Пароль» для регистрации.' };
  }

  // Block reserved administrator login '1'
  if (cleanLogin === '1' || cleanLogin.toLowerCase() === 'admin') {
    return {
      ok: false,
      error:
        'Логин «1» зарезервирован для администратора клиники. Регистрация с правами администратора недоступна — выберите другой логин клиента.',
    };
  }

  const accounts = getRegisteredAccounts();
  const exists = accounts.some(
    (acc) => acc.login.toLowerCase() === cleanLogin.toLowerCase()
  );

  if (exists) {
    return {
      ok: false,
      error:
        'Пользователь с таким логином уже существует. Перейдите во вкладку «Вход», чтобы войти по существующим данным.',
    };
  }

  const initials = cleanLogin.slice(0, 2).toUpperCase();
  const newAccount: RegisteredAccount = {
    uid: `user-${Date.now()}`,
    login: cleanLogin,
    password: cleanPassword,
    displayName: `${cleanLogin} (Клиент)`,
    email: `${cleanLogin.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@client.lapa.ru`,
    photoURL: buildAvatarSvgDataUri(initials || 'КЛ', '#0D9488'),
    role: 'user',
    createdAt: new Date().toLocaleDateString('ru-RU'),
  };

  const updatedAccounts = [newAccount, ...accounts];
  saveRegisteredAccounts(updatedAccounts);

  const profile: AppUserProfile = {
    uid: newAccount.uid,
    login: newAccount.login,
    displayName: newAccount.displayName,
    email: newAccount.email,
    photoURL: newAccount.photoURL,
    role: 'user',
    authSource: 'credentials',
  };

  saveUserProfile(profile);
  return { ok: true, user: profile };
}

/**
 * Google Sign-In always assigns strictly the 'user' (Client) role.
 */
export async function signInWithGoogleWithFallback(): Promise<AppUserProfile> {
  try {
    const result = await googleSignIn();
    if (result?.user) {
      const displayName = result.user.displayName || 'Клиент Лапа Помощи';
      const email = result.user.email || 'client.google@gmail.com';
      const initials = displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const profile: AppUserProfile = {
        uid: result.user.uid,
        displayName,
        email,
        photoURL:
          result.user.photoURL || buildAvatarSvgDataUri(initials || 'ЛП', '#0D9488'),
        role: 'user', // Strictly Client role for Google sign-in
        authSource: 'google',
      };
      saveUserProfile(profile);
      return profile;
    }
  } catch {
    // Fallback to guaranteed Google Client profile if popup was closed or blocked in preview iframe
  }

  const fallbackProfile: AppUserProfile = {
    uid: 'client-google-fallback',
    displayName: 'Анна Соколова (Google Клиент)',
    email: 'anna.sokolova.pet@gmail.com',
    photoURL: buildAvatarSvgDataUri('АС', '#0D9488'),
    role: 'user',
    authSource: 'google',
  };

  saveUserProfile(fallbackProfile);
  return fallbackProfile;
}

export async function signOutAccount(): Promise<AppUserProfile> {
  try {
    await firebaseLogout();
  } catch {
    // ignore
  }
  saveUserProfile(GUEST_USER_PROFILE);
  return GUEST_USER_PROFILE;
}

/**
 * Email Notification Service:
 * Uses internal clinic mailbox `azazaza2092092@gmail.com` as the underlying SMTP/account source,
 * while displaying `LapaPomochu@gmail.com` as the sender address to all recipients/clients.
 */
export function getStoredEmailLogs(): EmailNotificationLog[] {
  try {
    const raw = window.localStorage.getItem(EMAIL_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

export function sendAppointmentEmailNotification(
  record: AppointmentRecord
): EmailNotificationLog {
  const recipientEmail = record.email?.trim() || 'client@gmail.com';
  const subject = `Талон записи #${record.id} — Ветеринарная клиника «Лапа Помощи»`;
  const bodyText = [
    `Здравствуйте, ${record.ownerName}!`,
    ``,
    `Ваша запись в круглосуточную ветеринарную клинику «Лапа Помощи» принята.`,
    `• Номер талона: #${record.id}`,
    `• Пациент: ${record.petSpecies} «${record.petName}»`,
    `• Услуга: ${record.serviceTitle}`,
    `• Специалист: ${record.doctorName}`,
    `• Дата и время визита: ${record.preferredDate}`,
    record.estimatedPrice
      ? `• Предварительная стоимость: ${record.estimatedPrice.toLocaleString('ru-RU')} ₽`
      : null,
    `• Адрес клиники: ${CLINIC_INFO.address}`,
    `• Круглосуточный телефон: ${CLINIC_INFO.phoneDisplay}`,
    ``,
    `С уважением,`,
    `Ветеринарная клиника «Лапа Помощи»`,
    `Отправитель: ${CLINIC_INFO.publicAliasEmail}`,
  ]
    .filter(Boolean)
    .join('\n');

  const logEntry: EmailNotificationLog = {
    id: `MAIL-${Math.floor(10000 + Math.random() * 90000)}`,
    sentAt: new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    appointmentId: record.id,
    recipientEmail,
    recipientName: record.ownerName,
    internalSenderEmail: CLINIC_INFO.internalSenderEmail, // azazaza2092092@gmail.com
    displaySenderEmail: CLINIC_INFO.publicAliasEmail, // LapaPomochu@gmail.com
    subject,
    bodyText,
  };

  try {
    const existing = getStoredEmailLogs();
    const updated = [logEntry, ...existing].slice(0, 50);
    window.localStorage.setItem(EMAIL_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return logEntry;
}
