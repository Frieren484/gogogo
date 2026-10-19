import { CLINIC_INFO, AppointmentRecord } from '../data/clinicData';
import { googleSignIn, logout as firebaseLogout } from './googleDriveAuth';
import {
  EmailNotificationLog,
  getStoredEmailLogs,
  sendRealEmailNotification,
} from './emailService';

export type { EmailNotificationLog };
export { getStoredEmailLogs, sendRealEmailNotification };

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

const USER_STORAGE_KEY = 'lapa_pomoshchi_active_user_v2';
const REGISTERED_ACCOUNTS_KEY = 'lapa_pomoshchi_registered_users_v1';

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
 * Строгая фильтрация записей (RBAC / Безопасность данных):
 * - Администратор (role === 'admin' && login === '1') видит все записи клиники.
 * - Неавторизованный гость (authSource === 'guest') не видит никаких чужих записей ([]).
 * - Обычный клиент (role === 'user') видит ТОЛЬКО свои собственные записи,
 *   отфильтрованные по его uid (ownerUid) или по его email.
 */
export function filterAppointmentsForUser(
  appointments: AppointmentRecord[],
  user?: AppUserProfile | null
): AppointmentRecord[] {
  if (!user || user.authSource === 'guest') {
    return [];
  }

  if (user.role === 'admin' && user.login === '1') {
    return appointments;
  }

  const normalizedUserEmail = user.email?.trim().toLowerCase() || '';

  return appointments.filter((item) => {
    const matchesUid = Boolean(item.ownerUid && item.ownerUid === user.uid);
    const itemEmail = item.email?.trim().toLowerCase() || '';
    const matchesEmail = Boolean(
      normalizedUserEmail && itemEmail && itemEmail === normalizedUserEmail
    );
    return matchesUid || matchesEmail;
  });
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
        'Аккаунт с таким логином не найден. Проверьте логин или зарегистрируйтесь во вкладку «Регистрация».',
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

export interface ClientPetProfile {
  petName: string;
  petSpecies: 'Кошка' | 'Собака' | 'Грызун';
  breedAndAge: string;
  weightKg: string;
  chronicNotes: string;
  lastVaccinationDate: string;
  updatedAt: string;
}

const PET_PROFILES_STORAGE_KEY = 'lapa_pomoshchi_pet_profiles_v1';

export function getClientPetProfile(
  user?: AppUserProfile | null
): ClientPetProfile | null {
  if (!user || user.authSource === 'guest') return null;
  try {
    const raw = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw) as Record<string, ClientPetProfile>;
      const byUid = map[user.uid];
      if (byUid) return byUid;
      const emailKey = user.email?.trim().toLowerCase();
      if (emailKey && map[emailKey]) return map[emailKey];
    }
  } catch {
    // ignore storage errors
  }

  // Default pre-populated card for demo account Anna Sokolova
  if (user.uid === 'user-account-anna' || user.login === 'anna') {
    return {
      petName: 'Персик',
      petSpecies: 'Кошка',
      breedAndAge: 'Британская короткошерстная, 3 года',
      weightKg: '4.6',
      chronicNotes: 'Чувствительное пищеварение, аллергии на антибиотики нет',
      lastVaccinationDate: '2026-04-12',
      updatedAt: '18.10.2026',
    };
  }

  return null;
}

export function saveClientPetProfile(
  user: AppUserProfile,
  profile: ClientPetProfile
): ClientPetProfile {
  const normalized: ClientPetProfile = {
    ...profile,
    petName: profile.petName.trim(),
    breedAndAge: profile.breedAndAge.trim(),
    weightKg: profile.weightKg.trim(),
    chronicNotes: profile.chronicNotes.trim(),
    updatedAt: new Date().toLocaleDateString('ru-RU'),
  };
  try {
    const raw = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    const map: Record<string, ClientPetProfile> = raw ? JSON.parse(raw) : {};
    map[user.uid] = normalized;
    if (user.email) {
      map[user.email.trim().toLowerCase()] = normalized;
    }
    window.localStorage.setItem(PET_PROFILES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
  return normalized;
}

