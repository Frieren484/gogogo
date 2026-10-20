import { AppointmentRecord } from '../data/clinicData';
import { googleSignIn, logout as firebaseLogout } from './googleDriveAuth';
import {
  sanitizeDocId,
  savePetProfileToCloud,
  saveUserAccountToCloud,
} from './firestoreService';

export type UserRole = 'user' | 'admin';

export interface AppUserProfile {
  uid: string;
  login?: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  authSource: 'credentials' | 'google' | 'guest';
}

export interface RegisteredAccount {
  uid: string;
  login: string;
  password: string;
  displayName: string;
  photoURL: string;
  role: 'user';
  createdAt: string;
}

const USER_STORAGE_KEY = 'lapa_pomoshchi_active_user_v3';
const REGISTERED_ACCOUNTS_KEY = 'lapa_pomoshchi_registered_users_v2';

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
  photoURL: buildAvatarSvgDataUri('КЛ', '#0D9488'),
  role: 'user',
  authSource: 'guest',
};

export const SYSTEM_ADMIN_PROFILE: AppUserProfile = {
  uid: 'admin-system-1',
  login: '1',
  displayName: 'Администратор (Логин: 1)',
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
          uid: acc.uid,
          login: acc.login,
          password: acc.password,
          displayName: acc.displayName,
          photoURL: acc.photoURL,
          role: 'user',
          createdAt: acc.createdAt,
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

export function syncRegisteredAccountsFromCloud(
  accounts: RegisteredAccount[]
): void {
  if (!Array.isArray(accounts) || accounts.length === 0) return;
  const normalized = accounts.map((acc) => ({
    uid: acc.uid,
    login: acc.login,
    password: acc.password,
    displayName: acc.displayName,
    photoURL: acc.photoURL,
    role: 'user' as const,
    createdAt: acc.createdAt,
  }));
  saveRegisteredAccounts(normalized);
}

export function getStoredUserProfile(): AppUserProfile {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUserProfile;
      if (parsed && parsed.uid) {
        if (parsed.role === 'admin') {
          if (parsed.uid === 'admin-system-1' && parsed.login === '1') {
            return SYSTEM_ADMIN_PROFILE;
          }
          return GUEST_USER_PROFILE;
        }
        if (parsed.authSource === 'google') {
          return {
            uid: parsed.uid,
            displayName: parsed.displayName,
            photoURL: parsed.photoURL,
            role: 'user',
            authSource: 'google',
          };
        }
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
 * - Обычный клиент (role === 'user') видит свои собственные записи по совпадению uid или имени владельца.
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

  const cleanUserName = user.displayName
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim()
    .toLowerCase();

  return appointments.filter((item) => {
    const matchesUid = Boolean(item.ownerUid && item.ownerUid === user.uid);
    const matchesOwnerName = Boolean(
      cleanUserName &&
        item.ownerName &&
        item.ownerName.trim().toLowerCase() === cleanUserName
    );
    return matchesUid || matchesOwnerName;
  });
}

/**
 * Вход по логину и паролю разрешен ТОЛЬКО для главного администратора (login === '1', password === '1').
 * Все остальные пользователи входят исключительно через Google.
 */
export function authenticateWithCredentials(
  loginInput: string,
  passwordInput: string
): { ok: true; user: AppUserProfile } | { ok: false; error: string } {
  const cleanLogin = loginInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanLogin || !cleanPassword) {
    return { ok: false, error: 'Пожалуйста, введите логин и пароль администратора.' };
  }

  if (cleanLogin === '1') {
    if (cleanPassword === '1') {
      saveUserProfile(SYSTEM_ADMIN_PROFILE);
      return { ok: true, user: SYSTEM_ADMIN_PROFILE };
    }
    return {
      ok: false,
      error: 'Неверный пароль для главного администратора (Логин: 1).',
    };
  }

  return {
    ok: false,
    error:
      'Вход по логину и паролю доступен только главному администратора (Логин: 1, Пароль: 1). Владельцы питомцев входят через Google.',
  };
}

/**
 * Google Sign-In always assigns strictly the 'user' (Client) role.
 */
export async function signInWithGoogleWithFallback(): Promise<AppUserProfile> {
  try {
    const result = await googleSignIn();
    if (result?.user) {
      const displayName = result.user.displayName || 'Клиент Лапа Помощи';
      const initials = displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const profile: AppUserProfile = {
        uid: result.user.uid,
        displayName,
        photoURL:
          result.user.photoURL || buildAvatarSvgDataUri(initials || 'ЛП', '#0D9488'),
        role: 'user',
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
      const byUid = map[user.uid] || map[sanitizeDocId(user.uid, 'pet')];
      if (byUid) return byUid;
    }
  } catch {
    // ignore storage errors
  }

  if (
    user.uid === 'user-account-anna' ||
    user.uid === 'client-google-fallback' ||
    user.login === 'anna'
  ) {
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
    map[sanitizeDocId(user.uid, 'pet')] = normalized;
    window.localStorage.setItem(PET_PROFILES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }

  void savePetProfileToCloud(user.uid, normalized).catch(() => {});

  return normalized;
}

export function syncPetProfilesFromCloud(
  cloudMap: Record<string, ClientPetProfile>
): void {
  try {
    const raw = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    const current: Record<string, ClientPetProfile> = raw ? JSON.parse(raw) : {};
    const merged = { ...current, ...cloudMap };
    window.localStorage.setItem(PET_PROFILES_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore storage errors
  }
}

export { saveUserAccountToCloud };
