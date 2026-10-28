import { AppointmentRecord } from '../data/clinicData';
import {
  deleteUserAccountFromCloud,
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
const MULTI_PET_PROFILES_STORAGE_KEY = 'lapa_pomoshchi_multi_pets_v1';
const DELETED_ACCOUNTS_KEY = 'lapa_pomoshchi_deleted_logins_v1';

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
    photoURL: '/images/doctors/smirnov.jpg',
    lastNameMatch: 'смирнов',
    brigade: 1,
    shiftLabel: 'Хирургия и ортопедия',
  },
  {
    doctorId: 'volkova',
    login: 'volkova',
    displayName: 'Волкова Елена Сергеевна',
    doctorSpecialty: 'Ведущий терапевт, ветеринарный кардиолог',
    photoURL: '/images/doctors/volkova.jpg',
    lastNameMatch: 'волков',
    brigade: 1,
    shiftLabel: 'Терапия и кардиология',
  },
  {
    doctorId: 'morozov',
    login: 'morozov',
    displayName: 'Морозов Дмитрий Игоревич',
    doctorSpecialty: 'Врач УЗ-диагностики, реаниматолог-анестезиолог',
    photoURL: '/images/doctors/morozov.jpg',
    lastNameMatch: 'морозов',
    brigade: 1,
    shiftLabel: 'УЗИ и реанимация',
  },
  {
    doctorId: 'sokolova',
    login: 'sokolova',
    displayName: 'Соколова Анна Павловна',
    doctorSpecialty: 'Врач-ратолог, ветеринарный стоматолог',
    photoURL: '/images/doctors/sokolova.jpg',
    lastNameMatch: 'соколов',
    brigade: 1,
    shiftLabel: 'Ратология и стоматология',
  },
  {
    doctorId: 'vasiliev',
    login: 'vasiliev',
    displayName: 'Васильев Михаил Юрьевич',
    doctorSpecialty: 'Ведущий хирург-травматолог, нейрохирург',
    photoURL: '/images/doctors/vasiliev.jpg',
    lastNameMatch: 'васильев',
    brigade: 2,
    shiftLabel: 'Травматология и нейрохирургия',
  },
  {
    doctorId: 'pavlova',
    login: 'pavlova',
    displayName: 'Павлова Ирина Николаевна',
    doctorSpecialty: 'Врач-терапевт, эндокринолог, иммунолог',
    photoURL: '/images/doctors/pavlova.jpg',
    lastNameMatch: 'павлов',
    brigade: 2,
    shiftLabel: 'Терапия и эндокринология',
  },
  {
    doctorId: 'kuznetsov',
    login: 'kuznetsov',
    displayName: 'Кузнецов Артём Романович',
    doctorSpecialty: 'Заведующий ОРИТ, анестезиолог-реаниматолог',
    photoURL: '/images/doctors/kuznetsov.jpg',
    lastNameMatch: 'кузнецов',
    brigade: 2,
    shiftLabel: 'Стационар и реанимация ОРИТ',
  },
  {
    doctorId: 'novikova',
    login: 'novikova',
    displayName: 'Новикова Ольга Дмитриевна',
    doctorSpecialty: 'Врач-дерматолог, аллерголог',
    photoURL: '/images/doctors/novikova.jpg',
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

export function getDeletedAccountLogins(): string[] {
  try {
    const raw = window.localStorage.getItem(DELETED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).toLowerCase());
      }
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

function saveDeletedAccountLogins(logins: string[]): void {
  try {
    const unique = Array.from(new Set(logins.map((l) => l.toLowerCase())));
    window.localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify(unique));
  } catch {
    // ignore storage errors
  }
}

export function getActivePresetClients(): ClientAccountConfig[] {
  const deleted = new Set(getDeletedAccountLogins());
  return PRESET_CLIENTS.filter((c) => !deleted.has(c.login.toLowerCase()));
}

export function getActivePresetDoctors(): DoctorAccountConfig[] {
  const deleted = new Set(getDeletedAccountLogins());
  return PRESET_DOCTORS.filter(
    (d) =>
      !deleted.has(d.login.toLowerCase()) &&
      !deleted.has(d.doctorId.toLowerCase())
  );
}

export function restoreAllDeletedAccounts(): void {
  try {
    window.localStorage.removeItem(DELETED_ACCOUNTS_KEY);
  } catch {
    // ignore storage errors
  }
}

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const deleted = new Set(getDeletedAccountLogins());
    const raw = window.localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (acc: RegisteredAccount) =>
            acc && acc.login && !deleted.has(acc.login.toLowerCase())
        );
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
  const deleted = new Set(getDeletedAccountLogins());
  const current = getRegisteredAccounts();
  const map = new Map<string, RegisteredAccount>();
  for (const acc of current) {
    if (!deleted.has(acc.login.toLowerCase())) {
      map.set(acc.login.toLowerCase(), acc);
    }
  }
  for (const acc of accounts) {
    if (acc && acc.login && !deleted.has(acc.login.toLowerCase())) {
      map.set(acc.login.toLowerCase(), acc);
    }
  }
  saveRegisteredAccounts(Array.from(map.values()));
}

export function getStoredUserProfile(): AppUserProfile {
  try {
    const deleted = new Set(getDeletedAccountLogins());
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUserProfile;
      if (parsed && parsed.uid) {
        if (parsed.login && deleted.has(parsed.login.toLowerCase())) {
          return GUEST_USER_PROFILE;
        }
        if (parsed.role === 'admin' && parsed.login === '1') {
          return SYSTEM_ADMIN_PROFILE;
        }
        if (parsed.role === 'doctor') {
          const doc = getActivePresetDoctors().find(
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
          return GUEST_USER_PROFILE;
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

  let matchedDoctorId = cleanLogin;
  if (cleanLogin === 'volkov') matchedDoctorId = 'volkova';
  if (cleanLogin === 'sokolov') matchedDoctorId = 'sokolova';
  if (cleanLogin === 'kovalev') matchedDoctorId = 'smirnov';

  const deletedLogins = new Set(getDeletedAccountLogins());
  if (deletedLogins.has(cleanLogin) || deletedLogins.has(matchedDoctorId)) {
    return {
      ok: false,
      error: `Учетная запись «${cleanLogin}» была удалена. Вход невозможен.`,
    };
  }

  // 2. Врачи (пароль 123)
  const doctorConfig = getActivePresetDoctors().find(
    (d) => d.doctorId === matchedDoctorId || d.login === cleanLogin
  );
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
  const presetClient = getActivePresetClients().find((c) => c.login === cleanLogin);
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
    getActivePresetDoctors().some((d) => d.login === cleanLogin) ||
    getActivePresetClients().some((c) => c.login === cleanLogin) ||
    ['volkov', 'sokolov', 'kovalev'].includes(cleanLogin)
  ) {
    return { ok: false, error: 'Этот логин уже занят служебной учетной записью. Выберите другой логин.' };
  }

  const existing = getRegisteredAccounts();
  if (existing.some((acc) => acc.login.toLowerCase() === cleanLogin)) {
    return { ok: false, error: 'Пользователь с таким логином уже существует.' };
  }

  // Если этот логин ранее был удален, убираем его из черного списка удаленных
  const currentDeleted = getDeletedAccountLogins();
  if (currentDeleted.includes(cleanLogin)) {
    saveDeletedAccountLogins(currentDeleted.filter((l) => l !== cleanLogin));
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

/**
 * Удаление учетной записи с проверкой ролевой модели (RBAC):
 * - Пользователь (role === 'user') может удалить ТОЛЬКО свой собственный аккаунт.
 * - Врач (role === 'doctor') НЕ МОЖЕТ удалять аккаунты (ни свой, ни чужие).
 * - Администратор (role === 'admin') может удалить ЛЮБОЙ аккаунт клиента или врача.
 */
export function deleteAccountWithRoleCheck(
  actor: AppUserProfile,
  target: {
    uid?: string;
    login: string;
    role: 'user' | 'doctor' | 'admin';
    displayName: string;
  }
):
  | {
      ok: true;
      message: string;
      signedOutCurrentUser: boolean;
      nextActiveUser: AppUserProfile;
    }
  | { ok: false; error: string } {
  const cleanTargetLogin = (target.login || '').trim().toLowerCase();

  if (!actor || actor.authSource === 'guest') {
    return {
      ok: false,
      error: 'Гостевой пользователь не может удалять аккаунты. Войдите в систему.',
    };
  }

  // Правило 1: Врачи НЕ могут удалять аккаунты (ни свой, ни чужой)
  if (actor.role === 'doctor') {
    return {
      ok: false,
      error:
        'Врачам клиники запрещено удалять свою или чужую учетную запись. Управление аккаунтами персонала доступно только Главному администратору.',
    };
  }

  // Защита главного администратора
  if (target.role === 'admin' || cleanTargetLogin === '1') {
    return {
      ok: false,
      error: 'Системная учетная запись Главного администратора защищена от удаления.',
    };
  }

  // Правило 2: Обычный пользователь может удалить ТОЛЬКО свой собственный аккаунт
  if (actor.role === 'user') {
    const actorLogin = (actor.login || '').trim().toLowerCase();
    const isSelf =
      target.role === 'user' &&
      ((cleanTargetLogin && cleanTargetLogin === actorLogin) ||
        (Boolean(target.uid) && target.uid === actor.uid));

    if (!isSelf) {
      return {
        ok: false,
        error: 'Вы можете удалить только свой собственный аккаунт клиента.',
      };
    }
  }

  // Правило 3: Администратор может удалить любой аккаунт (клиента или врача)
  // Выполняем удаление из хранилищ
  const existingRegistered = getRegisteredAccounts();
  const matchedRegistered = existingRegistered.find(
    (acc) =>
      acc.login.toLowerCase() === cleanTargetLogin ||
      (target.uid && acc.uid === target.uid)
  );

  const remainingRegistered = existingRegistered.filter(
    (acc) =>
      acc.login.toLowerCase() !== cleanTargetLogin &&
      (!target.uid || acc.uid !== target.uid)
  );
  saveRegisteredAccounts(remainingRegistered);

  // Добавляем логин в список удаленных (чтобы демо-аккаунты alex/kate/врачи тоже удалялись)
  if (cleanTargetLogin) {
    const deletedList = getDeletedAccountLogins();
    saveDeletedAccountLogins([...deletedList, cleanTargetLogin]);
  }

  // Удаляем медкарты питомцев из localStorage
  const targetUid = matchedRegistered?.uid || target.uid || `client-${cleanTargetLogin}`;
  try {
    const rawPets = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    if (rawPets) {
      const map = JSON.parse(rawPets) as Record<string, ClientPetProfile>;
      delete map[targetUid];
      delete map[sanitizeDocId(targetUid, 'pet')];
      window.localStorage.setItem(PET_PROFILES_STORAGE_KEY, JSON.stringify(map));
    }
    const rawMultiPets = window.localStorage.getItem(MULTI_PET_PROFILES_STORAGE_KEY);
    if (rawMultiPets) {
      const multiMap = JSON.parse(rawMultiPets) as Record<string, ClientPetProfile[]>;
      delete multiMap[targetUid];
      delete multiMap[sanitizeDocId(targetUid, 'pet')];
      window.localStorage.setItem(
        MULTI_PET_PROFILES_STORAGE_KEY,
        JSON.stringify(multiMap)
      );
    }
  } catch {
    // ignore storage errors
  }

  // Удаляем из облака Firestore
  if (targetUid) {
    void deleteUserAccountFromCloud(targetUid).catch(() => {});
  }

  // Проверяем, нужно ли разлогинить текущего пользователя
  const activeProfile = getStoredUserProfile();
  const isDeletingActiveUser =
    activeProfile.authSource !== 'guest' &&
    ((cleanTargetLogin &&
      (activeProfile.login || '').toLowerCase() === cleanTargetLogin) ||
      (Boolean(target.uid) && activeProfile.uid === target.uid));

  if (isDeletingActiveUser || actor.role === 'user') {
    saveUserProfile(GUEST_USER_PROFILE);
    return {
      ok: true,
      message: `Аккаунт «${target.displayName}» (логин: ${target.login}) успешно удален. Вы переведены в гостевой режим.`,
      signedOutCurrentUser: true,
      nextActiveUser: GUEST_USER_PROFILE,
    };
  }

  return {
    ok: true,
    message: `Учетная запись «${target.displayName}» (логин: ${target.login}, роль: ${
      target.role === 'doctor' ? 'Врач' : 'Клиент'
    }) удалена администратором.`,
    signedOutCurrentUser: false,
    nextActiveUser: actor,
  };
}

export async function signOutAccount(): Promise<AppUserProfile> {
  saveUserProfile(GUEST_USER_PROFILE);
  return GUEST_USER_PROFILE;
}

export interface ClientPetProfile {
  id?: string;
  petName: string;
  petSpecies: 'Кошка' | 'Собака' | 'Грызун';
  breedAndAge: string;
  weightKg: string;
  chronicNotes: string;
  lastVaccinationDate: string;
  updatedAt: string;
}

function normalizePetCardFields(pet: ClientPetProfile, fallbackId: string): ClientPetProfile {
  return {
    ...pet,
    id: pet.id || fallbackId,
    petName: (pet.petName || '').trim(),
    petSpecies: pet.petSpecies || 'Кошка',
    breedAndAge:
      pet.breedAndAge === '—' ||
      pet.breedAndAge?.endsWith(', возраст не указан')
        ? ''
        : (pet.breedAndAge || '').trim(),
    weightKg: pet.weightKg === '—' ? '' : (pet.weightKg || '').trim(),
    chronicNotes:
      pet.chronicNotes === 'Новый пациент клиники' ||
      pet.chronicNotes === 'Профиль заведен при регистрации'
        ? ''
        : (pet.chronicNotes || '').trim(),
    lastVaccinationDate:
      pet.lastVaccinationDate === '—' ? '' : (pet.lastVaccinationDate || '').trim(),
    updatedAt: pet.updatedAt || new Date().toLocaleDateString('ru-RU'),
  };
}

/**
 * Возвращает список всех питомцев клиента (поддержка нескольких питомцев в одном аккаунте).
 */
export function getClientPetProfiles(
  user?: AppUserProfile | null
): ClientPetProfile[] {
  if (!user || user.authSource === 'guest') return [];

  try {
    const rawMulti = window.localStorage.getItem(MULTI_PET_PROFILES_STORAGE_KEY);
    if (rawMulti) {
      const multiMap = JSON.parse(rawMulti) as Record<string, ClientPetProfile[]>;
      const storedList =
        multiMap[user.uid] || multiMap[sanitizeDocId(user.uid, 'pet')];
      if (Array.isArray(storedList) && storedList.length > 0) {
        return storedList.map((pet, idx) =>
          normalizePetCardFields(pet, `pet-${user.uid}-${idx + 1}`)
        );
      }
    }
  } catch {
    // ignore storage errors
  }

  // Проверяем одиночное хранилище для обратной совместимости
  let legacySingle: ClientPetProfile | null = null;
  try {
    const raw = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw) as Record<string, ClientPetProfile>;
      const byUid = map[user.uid] || map[sanitizeDocId(user.uid, 'pet')];
      if (byUid && byUid.petName) {
        legacySingle = normalizePetCardFields(byUid, `pet-${user.uid}-1`);
      }
    }
  } catch {
    // ignore storage errors
  }

  // Преднастроенные профили нескольких питомцев для демо-клиентов
  if (user.login === 'alex' || user.uid === 'client-alex') {
    const primaryAlex: ClientPetProfile = legacySingle || {
      id: 'pet-alex-1',
      petName: 'Марсель',
      petSpecies: 'Кошка',
      breedAndAge: 'Шотландский вислоухий, 9 лет',
      weightKg: '4.8',
      chronicNotes: 'Кардиологический скрининг перед плановой чисткой зубов',
      lastVaccinationDate: '2026-03-10',
      updatedAt: '19.10.2026',
    };
    const secondAlex: ClientPetProfile = {
      id: 'pet-alex-2',
      petName: 'Арчи',
      petSpecies: 'Собака',
      breedAndAge: 'Золотистый ретривер, 4 года',
      weightKg: '31.5',
      chronicNotes: 'Плановая вакцинация и обработка от клещей',
      lastVaccinationDate: '2026-05-14',
      updatedAt: '19.10.2026',
    };
    return primaryAlex.petName.toLowerCase() === 'арчи'
      ? [primaryAlex]
      : [primaryAlex, secondAlex];
  }

  if (user.login === 'kate' || user.uid === 'client-kate') {
    const primaryKate: ClientPetProfile = legacySingle || {
      id: 'pet-kate-1',
      petName: 'Пончик',
      petSpecies: 'Грызун',
      breedAndAge: 'Карликовый кролик, 2 года',
      weightKg: '1.4',
      chronicNotes: 'Контрольный осмотр резцов и щечных зубов',
      lastVaccinationDate: '2026-04-05',
      updatedAt: '19.10.2026',
    };
    const secondKate: ClientPetProfile = {
      id: 'pet-kate-2',
      petName: 'Буся',
      petSpecies: 'Кошка',
      breedAndAge: 'Мейн-кун, 3 года',
      weightKg: '6.2',
      chronicNotes: 'Плановый биохимический чек-ап, чувствительное пищеварение',
      lastVaccinationDate: '2026-02-20',
      updatedAt: '19.10.2026',
    };
    return primaryKate.petName.toLowerCase() === 'буся'
      ? [primaryKate]
      : [primaryKate, secondKate];
  }

  if (legacySingle) {
    return [legacySingle];
  }

  if (user.petName) {
    return [
      {
        id: `pet-${user.uid}-1`,
        petName: user.petName,
        petSpecies: user.petSpecies || 'Кошка',
        breedAndAge: '',
        weightKg: '',
        chronicNotes: '',
        lastVaccinationDate: '',
        updatedAt: new Date().toLocaleDateString('ru-RU'),
      },
    ];
  }

  return [];
}

export function getClientPetProfile(
  user?: AppUserProfile | null
): ClientPetProfile | null {
  const list = getClientPetProfiles(user);
  return list[0] || null;
}

function syncPrimaryPetToUserAndLegacyStorage(
  user: AppUserProfile,
  petsList: ClientPetProfile[]
): void {
  const primary = petsList[0];
  try {
    // Сохраняем весь список в MULTI_PET_PROFILES_STORAGE_KEY
    const rawMulti = window.localStorage.getItem(MULTI_PET_PROFILES_STORAGE_KEY);
    const multiMap: Record<string, ClientPetProfile[]> = rawMulti
      ? JSON.parse(rawMulti)
      : {};
    multiMap[user.uid] = petsList;
    multiMap[sanitizeDocId(user.uid, 'pet')] = petsList;
    window.localStorage.setItem(
      MULTI_PET_PROFILES_STORAGE_KEY,
      JSON.stringify(multiMap)
    );

    // Синхронизируем основного (первого) питомца в одиночное хранилище и профиль
    if (primary) {
      const rawSingle = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
      const singleMap: Record<string, ClientPetProfile> = rawSingle
        ? JSON.parse(rawSingle)
        : {};
      singleMap[user.uid] = primary;
      singleMap[sanitizeDocId(user.uid, 'pet')] = primary;
      window.localStorage.setItem(
        PET_PROFILES_STORAGE_KEY,
        JSON.stringify(singleMap)
      );

      if (user.role === 'user' && primary.petName) {
        const updatedUser: AppUserProfile = {
          ...user,
          petName: primary.petName,
          petSpecies: primary.petSpecies,
        };
        saveUserProfile(updatedUser);

        const accounts = getRegisteredAccounts();
        const idx = accounts.findIndex((a) => a.uid === user.uid);
        if (idx !== -1) {
          accounts[idx] = {
            ...accounts[idx],
            petName: primary.petName,
            petSpecies: primary.petSpecies,
          };
          saveRegisteredAccounts(accounts);
        }
      }
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Добавляет нового питомца или обновляет карточку существующего питомца у клиента.
 */
export function upsertClientPetProfile(
  user: AppUserProfile,
  profile: ClientPetProfile
): { pets: ClientPetProfile[]; savedPet: ClientPetProfile } {
  const existingPets = getClientPetProfiles(user);
  const targetId =
    profile.id ||
    `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const normalized: ClientPetProfile = {
    id: targetId,
    petName: profile.petName.trim(),
    petSpecies: profile.petSpecies || 'Кошка',
    breedAndAge: profile.breedAndAge.trim(),
    weightKg: profile.weightKg.trim(),
    chronicNotes: profile.chronicNotes.trim(),
    lastVaccinationDate: (profile.lastVaccinationDate || '').trim(),
    updatedAt: new Date().toLocaleDateString('ru-RU'),
  };

  const existingIndex = existingPets.findIndex(
    (p) =>
      (profile.id && p.id === profile.id) ||
      (!profile.id &&
        p.petName.trim().toLowerCase() === normalized.petName.toLowerCase())
  );

  let nextPets: ClientPetProfile[];
  if (existingIndex !== -1) {
    nextPets = [...existingPets];
    nextPets[existingIndex] = {
      ...normalized,
      id: existingPets[existingIndex].id || targetId,
    };
  } else {
    nextPets = [...existingPets, normalized];
  }

  const finalSaved =
    existingIndex !== -1 ? nextPets[existingIndex] : normalized;

  syncPrimaryPetToUserAndLegacyStorage(user, nextPets);

  // Синхронизируем с облаком Firestore (как основной профиль и индивидуальный документ питомца)
  if (nextPets[0]) {
    void savePetProfileToCloud(user.uid, nextPets[0]).catch(() => {});
  }
  void savePetProfileToCloud(`${user.uid}_${finalSaved.id}`, finalSaved).catch(
    () => {}
  );

  return { pets: nextPets, savedPet: finalSaved };
}

/**
 * Удаляет карточку питомца по ID из списка питомцев клиента.
 */
export function deleteClientPetProfile(
  user: AppUserProfile,
  petId: string
): ClientPetProfile[] {
  const existingPets = getClientPetProfiles(user);
  const nextPets = existingPets.filter((p) => p.id !== petId);

  syncPrimaryPetToUserAndLegacyStorage(user, nextPets);

  if (nextPets[0]) {
    void savePetProfileToCloud(user.uid, nextPets[0]).catch(() => {});
  }

  return nextPets;
}

export function saveClientPetProfile(
  user: AppUserProfile,
  profile: ClientPetProfile
): ClientPetProfile {
  const existingPets = getClientPetProfiles(user);
  const targetId = profile.id || existingPets[0]?.id || `pet-${user.uid}-1`;
  const { savedPet } = upsertClientPetProfile(user, {
    ...profile,
    id: targetId,
  });
  return savedPet;
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
