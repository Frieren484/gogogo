import { AppointmentRecord } from '../data/clinicData';
import {
  sanitizeDocId,
  savePetProfileToCloud,
  saveUserAccountToCloud,
} from './firestoreService';

export type UserRole = 'user' | 'doctor' | 'admin';

export interface AppUserProfile {
  uid: string;
  login?: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  authSource: 'credentials' | 'guest';
  doctorId?: string;
  doctorSpecialty?: string;
  phone?: string;
  petName?: string;
  petSpecies?: 'Кошка' | 'Собака' | 'Грызун';
}

export interface RegisteredAccount {
  uid: string;
  login: string;
  password: string;
  displayName: string;
  phone?: string;
  photoURL: string;
  role: 'user';
  createdAt: string;
  petSpecies?: 'Кошка' | 'Собака' | 'Грызун';
  petName?: string;
}

const USER_STORAGE_KEY = 'lapa_pomoshchi_active_user_v3';
const REGISTERED_ACCOUNTS_KEY = 'lapa_pomoshchi_registered_users_v2';
const PET_PROFILES_STORAGE_KEY = 'lapa_pomoshchi_pet_profiles_v1';

export function buildAvatarSvgDataUri(initials: string, bgHex: string): string {
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
  displayName: 'Администратор CRM (Логин: 1)',
  photoURL: buildAvatarSvgDataUri('АД', '#1E40AF'),
  role: 'admin',
  authSource: 'credentials',
};

export interface DoctorAccountConfig {
  doctorId: string;
  login: string;
  displayName: string;
  doctorSpecialty: string;
  photoURL: string;
  lastNameMatch: string;
  brigade: 1 | 2;
  shiftLabel: string;
}

export const PRESET_DOCTORS: DoctorAccountConfig[] = [
  {
    doctorId: 'smirnov',
    login: 'smirnov',
    displayName: 'Смирнов Алексей Викторович',
    doctorSpecialty: 'Главный врач, хирург-ортопед, эндоскопист',
    photoURL:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'смирнов',
    brigade: 1,
    shiftLabel: 'Хирургия и ортопедия',
  },
  {
    doctorId: 'volkova',
    login: 'volkova',
    displayName: 'Волкова Елена Сергеевна',
    doctorSpecialty: 'Ведущий терапевт, ветеринарный кардиолог',
    photoURL:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'волков',
    brigade: 1,
    shiftLabel: 'Терапия и кардиология',
  },
  {
    doctorId: 'morozov',
    login: 'morozov',
    displayName: 'Морозов Дмитрий Игоревич',
    doctorSpecialty: 'Врач УЗ-диагностики, реаниматолог-анестезиолог',
    photoURL:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'морозов',
    brigade: 1,
    shiftLabel: 'УЗИ и реанимация',
  },
  {
    doctorId: 'sokolova',
    login: 'sokolova',
    displayName: 'Соколова Анна Павловна',
    doctorSpecialty: 'Врач-ратолог, ветеринарный стоматолог',
    photoURL:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'соколов',
    brigade: 1,
    shiftLabel: 'Ратология и стоматология',
  },
  {
    doctorId: 'vasiliev',
    login: 'vasiliev',
    displayName: 'Васильев Михаил Юрьевич',
    doctorSpecialty: 'Ведущий хирург-травматолог, нейрохирург',
    photoURL:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'васильев',
    brigade: 2,
    shiftLabel: 'Травматология и нейрохирургия',
  },
  {
    doctorId: 'pavlova',
    login: 'pavlova',
    displayName: 'Павлова Ирина Николаевна',
    doctorSpecialty: 'Врач-терапевт, эндокринолог, иммунолог',
    photoURL:
      'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'павлов',
    brigade: 2,
    shiftLabel: 'Терапия и эндокринология',
  },
  {
    doctorId: 'kuznetsov',
    login: 'kuznetsov',
    displayName: 'Кузнецов Артём Романович',
    doctorSpecialty: 'Заведующий ОРИТ, анестезиолог-реаниматолог',
    photoURL:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'кузнецов',
    brigade: 2,
    shiftLabel: 'Стационар и реанимация ОРИТ',
  },
  {
    doctorId: 'novikova',
    login: 'novikova',
    displayName: 'Новикова Ольга Дмитриевна',
    doctorSpecialty: 'Врач-дерматолог, аллерголог',
    photoURL:
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
    lastNameMatch: 'новиков',
    brigade: 2,
    shiftLabel: 'Дерматология и аллергология',
  },
];

export interface ClientAccountConfig {
  login: string;
  displayName: string;
  phone: string;
  petName: string;
  petSpecies: 'Кошка' | 'Собака' | 'Грызун';
  breedAndAge: string;
  weightKg: string;
  chronicNotes: string;
  lastVaccinationDate: string;
}

export const PRESET_CLIENTS: ClientAccountConfig[] = [
  {
    login: 'alex',
    displayName: 'Александр Громов',
    phone: '+7 (926) 805-71-22',
    petName: 'Марсель',
    petSpecies: 'Кошка',
    breedAndAge: 'Шотландский вислоухий, 9 лет',
    weightKg: '4.8',
    chronicNotes: 'Кардиологический скрининг перед чисткой зубов',
    lastVaccinationDate: '2026-03-10',
  },
  {
    login: 'kate',
    displayName: 'Екатерина Белова',
    phone: '+7 (903) 519-64-11',
    petName: 'Пончик',
    petSpecies: 'Грызун',
    breedAndAge: 'Карликовый кролик, 2 года',
    weightKg: '1.4',
    chronicNotes: 'Контрольный осмотр резцов и щечных зубов',
    lastVaccinationDate: '2026-04-05',
  },
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = window.localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return [];
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
  const current = getRegisteredAccounts();
  const map = new Map<string, RegisteredAccount>();
  for (const acc of current) {
    map.set(acc.login.toLowerCase(), acc);
  }
  for (const acc of accounts) {
    map.set(acc.login.toLowerCase(), acc);
  }
  saveRegisteredAccounts(Array.from(map.values()));
}

export function getStoredUserProfile(): AppUserProfile {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUserProfile;
      if (parsed && parsed.uid) {
        if (parsed.role === 'admin' && parsed.login === '1') {
          return SYSTEM_ADMIN_PROFILE;
        }
        if (parsed.role === 'doctor') {
          const doc = PRESET_DOCTORS.find(
            (d) => d.doctorId === parsed.doctorId || d.login === parsed.login
          );
          if (doc) {
            return {
              uid: `doctor-${doc.doctorId}`,
              login: doc.login,
              displayName: doc.displayName,
              photoURL: doc.photoURL,
              role: 'doctor',
              authSource: 'credentials',
              doctorId: doc.doctorId,
              doctorSpecialty: doc.doctorSpecialty,
            };
          }
        }
        if (parsed.role === 'user') {
          return parsed;
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
 * Фильтрация записей по ролевой модели (RBAC):
 * - Администратор (role === 'admin') видит ВСЕ записи клиники.
 * - Врач (role === 'doctor') видит ТОЛЬКО СВОИ записи (по совпадению фамилии/имени врача).
 * - Клиент (role === 'user') видит ТОЛЬКО записи своих питомцев (по ownerName / ownerUid / phone).
 * - Гость (authSource === 'guest') не видит чужих записей ([]).
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

  if (user.role === 'doctor') {
    const docConfig = PRESET_DOCTORS.find(
      (d) => d.doctorId === user.doctorId || d.login === user.login
    );
    const searchPart = docConfig?.lastNameMatch || user.displayName.split(' ')[0].toLowerCase();

    return appointments.filter((item) => {
      const docName = (item.doctorName || '').toLowerCase();
      return docName.includes(searchPart) || docName.includes(user.displayName.toLowerCase());
    });
  }

  // Client view
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
    const matchesPhone = Boolean(
      user.phone &&
        item.phone &&
        item.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')
    );
    return matchesUid || matchesOwnerName || matchesPhone;
  });
}

/**
 * Проверка логина и пароля:
 * 1. Главный администратор: 1 / 1
 * 2. Врачи: smirnov, volkova, morozov, sokolova (и алиасы volkov, sokolov, kovalev) / 123
 * 3. Клиенты демо: alex / 123, kate / 123
 * 4. Зарегистрированные клиенты из базы/localStorage
 */
export function authenticateWithCredentials(
  loginInput: string,
  passwordInput: string
): { ok: true; user: AppUserProfile } | { ok: false; error: string } {
  const cleanLogin = loginInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanLogin || !cleanPassword) {
    return { ok: false, error: 'Пожалуйста, введите логин и пароль.' };
  }

  // 1. Главный администратор
  if (cleanLogin === '1') {
    if (cleanPassword === '1') {
      saveUserProfile(SYSTEM_ADMIN_PROFILE);
      return { ok: true, user: SYSTEM_ADMIN_PROFILE };
    }
    return { ok: false, error: 'Неверный пароль для администратора (Логин: 1, Пароль: 1).' };
  }

  // 2. Врачи (пароль 123)
  // Маппинг алиасов (для удобства ввода из макета: volkov->volkova, sokolov->sokolova, kovalev->smirnov)
  let matchedDoctorId = cleanLogin;
  if (cleanLogin === 'volkov') matchedDoctorId = 'volkova';
  if (cleanLogin === 'sokolov') matchedDoctorId = 'sokolova';
  if (cleanLogin === 'kovalev') matchedDoctorId = 'smirnov';

  const doctorConfig = PRESET_DOCTORS.find((d) => d.doctorId === matchedDoctorId || d.login === cleanLogin);
  if (doctorConfig) {
    if (cleanPassword === '123') {
      const doctorUser: AppUserProfile = {
        uid: `doctor-${doctorConfig.doctorId}`,
        login: doctorConfig.login,
        displayName: doctorConfig.displayName,
        photoURL: doctorConfig.photoURL,
        role: 'doctor',
        authSource: 'credentials',
        doctorId: doctorConfig.doctorId,
        doctorSpecialty: doctorConfig.doctorSpecialty,
      };
      saveUserProfile(doctorUser);
      return { ok: true, user: doctorUser };
    }
    return { ok: false, error: `Неверный пароль для врача ${doctorConfig.displayName} (Пароль: 123).` };
  }

  // 3. Предустановленные клиенты: alex / 123, kate / 123
  const presetClient = PRESET_CLIENTS.find((c) => c.login === cleanLogin);
  if (presetClient) {
    if (cleanPassword === '123') {
      const initials = presetClient.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const clientUser: AppUserProfile = {
        uid: `client-${presetClient.login}`,
        login: presetClient.login,
        displayName: presetClient.displayName,
        phone: presetClient.phone,
        photoURL: buildAvatarSvgDataUri(initials, '#0D9488'),
        role: 'user',
        authSource: 'credentials',
        petName: presetClient.petName,
        petSpecies: presetClient.petSpecies,
      };
      saveUserProfile(clientUser);
      return { ok: true, user: clientUser };
    }
    return { ok: false, error: `Неверный пароль для клиента ${presetClient.displayName} (Пароль: 123).` };
  }

  // 4. Зарегистрированные клиенты
  const registeredAccounts = getRegisteredAccounts();
  const foundAccount = registeredAccounts.find(
    (acc) => acc.login.toLowerCase() === cleanLogin
  );

  if (foundAccount) {
    if (foundAccount.password === cleanPassword) {
      const initials = foundAccount.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const clientUser: AppUserProfile = {
        uid: foundAccount.uid,
        login: foundAccount.login,
        displayName: foundAccount.displayName,
        phone: foundAccount.phone,
        photoURL: foundAccount.photoURL || buildAvatarSvgDataUri(initials || 'КЛ', '#0D9488'),
        role: 'user',
        authSource: 'credentials',
        petName: foundAccount.petName,
        petSpecies: foundAccount.petSpecies,
      };
      saveUserProfile(clientUser);
      return { ok: true, user: clientUser };
    }
    return { ok: false, error: 'Неверный пароль для зарегистрированного аккаунта.' };
  }

  return {
    ok: false,
    error: 'Аккаунт с таким логином не найден. Воспользуйтесь быстрым входом или зарегистрируйтесь.',
  };
}

/**
 * Регистрация нового клиента
 */
export function registerNewClientAccount(data: {
  fullName: string;
  login: string;
  password: string;
  phone: string;
  petSpecies: 'Кошка' | 'Собака' | 'Грызун';
  petName: string;
}): { ok: true; user: AppUserProfile } | { ok: false; error: string } {
  const cleanFullName = data.fullName.trim();
  const cleanLogin = data.login.trim().toLowerCase();
  const cleanPassword = data.password.trim();
  const cleanPhone = data.phone.trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '');
  const cleanPetName = data.petName.trim();

  if (!cleanFullName || !cleanLogin || !cleanPassword || !cleanPhone || !cleanPetName) {
    return { ok: false, error: 'Пожалуйста, заполните все обязательные поля регистрации.' };
  }

  if (phoneDigits.length < 10) {
    return {
      ok: false,
      error: 'Пожалуйста, введите корректный номер телефона (не менее 10 цифр).',
    };
  }

  if (
    cleanLogin === '1' ||
    PRESET_DOCTORS.some((d) => d.login === cleanLogin) ||
    PRESET_CLIENTS.some((c) => c.login === cleanLogin) ||
    ['volkov', 'sokolov', 'kovalev'].includes(cleanLogin)
  ) {
    return { ok: false, error: 'Этот логин уже занят служебной учетной записью. Выберите другой логин.' };
  }

  const existing = getRegisteredAccounts();
  if (existing.some((acc) => acc.login.toLowerCase() === cleanLogin)) {
    return { ok: false, error: 'Пользователь с таким логином уже существует.' };
  }

  const initials = cleanFullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const uid = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const avatar = buildAvatarSvgDataUri(initials || 'КЛ', '#0D9488');

  const newAccount: RegisteredAccount = {
    uid,
    login: cleanLogin,
    password: cleanPassword,
    displayName: cleanFullName,
    phone: cleanPhone,
    photoURL: avatar,
    role: 'user',
    createdAt: new Date().toLocaleDateString('ru-RU'),
    petSpecies: data.petSpecies,
    petName: cleanPetName,
  };

  saveRegisteredAccounts([newAccount, ...existing]);
  void saveUserAccountToCloud(newAccount).catch(() => {});

  const newProfile: AppUserProfile = {
    uid,
    login: cleanLogin,
    displayName: cleanFullName,
    phone: cleanPhone,
    photoURL: avatar,
    role: 'user',
    authSource: 'credentials',
    petName: cleanPetName,
    petSpecies: data.petSpecies,
  };

  // Create initial pet profile with clean fields ready for editing
  saveClientPetProfile(newProfile, {
    petName: cleanPetName,
    petSpecies: data.petSpecies,
    breedAndAge: '',
    weightKg: '',
    chronicNotes: '',
    lastVaccinationDate: '',
    updatedAt: new Date().toLocaleDateString('ru-RU'),
  });

  saveUserProfile(newProfile);
  return { ok: true, user: newProfile };
}

export async function signOutAccount(): Promise<AppUserProfile> {
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

export function getClientPetProfile(
  user?: AppUserProfile | null
): ClientPetProfile | null {
  if (!user || user.authSource === 'guest') return null;

  try {
    const raw = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw) as Record<string, ClientPetProfile>;
      const byUid = map[user.uid] || map[sanitizeDocId(user.uid, 'pet')];
      if (byUid) {
        return {
          ...byUid,
          breedAndAge:
            byUid.breedAndAge === '—' ||
            byUid.breedAndAge?.endsWith(', возраст не указан')
              ? ''
              : byUid.breedAndAge,
          weightKg: byUid.weightKg === '—' ? '' : byUid.weightKg,
          chronicNotes:
            byUid.chronicNotes === 'Новый пациент клиники' ||
            byUid.chronicNotes === 'Профиль заведен при регистрации'
              ? ''
              : byUid.chronicNotes,
          lastVaccinationDate:
            byUid.lastVaccinationDate === '—' ? '' : byUid.lastVaccinationDate,
        };
      }
    }
  } catch {
    // ignore storage errors
  }

  // Pre-configured pet profiles for demo clients
  if (user.login === 'alex' || user.uid === 'client-alex') {
    return {
      petName: 'Марсель',
      petSpecies: 'Кошка',
      breedAndAge: 'Шотландский вислоухий, 9 лет',
      weightKg: '4.8',
      chronicNotes: 'Кардиологический скрининг перед плановой чисткой зубов',
      lastVaccinationDate: '2026-03-10',
      updatedAt: '19.10.2026',
    };
  }

  if (user.login === 'kate' || user.uid === 'client-kate') {
    return {
      petName: 'Пончик',
      petSpecies: 'Грызун',
      breedAndAge: 'Карликовый кролик, 2 года',
      weightKg: '1.4',
      chronicNotes: 'Контрольный осмотр резцов и щечных зубов',
      lastVaccinationDate: '2026-04-05',
      updatedAt: '19.10.2026',
    };
  }

  if (user.petName) {
    return {
      petName: user.petName,
      petSpecies: user.petSpecies || 'Кошка',
      breedAndAge: '',
      weightKg: '',
      chronicNotes: '',
      lastVaccinationDate: '',
      updatedAt: new Date().toLocaleDateString('ru-RU'),
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

    // Sync updated petName and petSpecies to active user profile and registered accounts if applicable
    if (user.role === 'user' && normalized.petName) {
      const updatedUser: AppUserProfile = {
        ...user,
        petName: normalized.petName,
        petSpecies: normalized.petSpecies,
      };
      saveUserProfile(updatedUser);

      const accounts = getRegisteredAccounts();
      const idx = accounts.findIndex((a) => a.uid === user.uid);
      if (idx !== -1) {
        accounts[idx] = {
          ...accounts[idx],
          petName: normalized.petName,
          petSpecies: normalized.petSpecies,
        };
        saveRegisteredAccounts(accounts);
      }
    }
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
