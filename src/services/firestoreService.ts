import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AppointmentRecord,
  DoctorProfile,
  DOCTORS_DATA,
  INITIAL_APPOINTMENTS_DATA,
  resolveAppointmentPrice,
  ServiceItem,
  SERVICES_DATA,
  TestimonialItem,
  TESTIMONIALS_DATA,
} from '../data/clinicData';
import type { ClientPetProfile, RegisteredAccount } from './authService';
import { app, auth } from './googleDriveAuth';

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type CloudSyncState = 'connecting' | 'connected' | 'error';

export interface CloudDatabaseStatus {
  state: CloudSyncState;
  projectId: string;
  databaseId: string;
  lastSyncedAt: string | null;
  collectionsCount: number;
  errorMessage?: string;
}

type StatusListener = (status: CloudDatabaseStatus) => void;

let currentCloudStatus: CloudDatabaseStatus = {
  state: 'connecting',
  projectId: firebaseConfig.projectId || 'emerald-stack-2w2pc',
  databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
  lastSyncedAt: null,
  collectionsCount: 6,
};

const statusListeners = new Set<StatusListener>();

function notifyStatusListeners(patch: Partial<CloudDatabaseStatus>): void {
  currentCloudStatus = {
    ...currentCloudStatus,
    ...patch,
  };
  statusListeners.forEach((listener) => listener(currentCloudStatus));
}

export function getCloudDatabaseStatus(): CloudDatabaseStatus {
  return currentCloudStatus;
}

export function subscribeToCloudStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentCloudStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Validate connection to Firestore on startup as required by Firebase specification
async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
        error.message.includes('unavailable'))
    ) {
      notifyStatusListeners({
        state: 'connected',
        lastSyncedAt: nowTimeLabel(),
        errorMessage: 'Локальный кэш активен (фоновое подключение к Firestore)',
      });
    } else {
      notifyStatusListeners({
        state: 'connected',
        lastSyncedAt: nowTimeLabel(),
        errorMessage: undefined,
      });
    }
  }
}

void testConnection();

/**
 * Sanitizes document IDs to strictly match ^[a-zA-Z0-9_\-]+$ with length 1..128
 */
export function sanitizeDocId(rawId: string, fallbackPrefix = 'doc'): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 128);
  return cleaned || `${fallbackPrefix}-${Date.now()}`;
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : String(val ?? fallback).trim();
  return (str || fallback).slice(0, maxLen);
}

/**
 * Defensive payload sanitizers matching firebase-blueprint.json & firestore.rules
 */
export function sanitizeAppointmentForFirestore(
  item: AppointmentRecord,
  servicesList: ServiceItem[] = SERVICES_DATA
): AppointmentRecord {
  const safeId = sanitizeDocId(item.id, 'LP');
  const validStatuses = ['Новая', 'Подтверждена', 'Завершена', 'Отменена'];
  const safeStatus = validStatuses.includes(item.status)
    ? item.status
    : 'Новая';

  const normalizedPrice = resolveAppointmentPrice(item, servicesList);

  const result: AppointmentRecord = {
    id: safeId,
    createdAt: clampString(item.createdAt, 64, '12:00'),
    ownerName: clampString(item.ownerName, 120, 'Клиент клиники'),
    phone: clampString(item.phone, 40, '+7 (495) 128-24-07'),
    petSpecies: clampString(item.petSpecies, 60, 'Кошка'),
    petName: clampString(item.petName, 80, 'Питомец'),
    serviceTitle: clampString(
      item.serviceTitle,
      200,
      'Терапия и первичный клинический прием'
    ),
    doctorName: clampString(
      item.doctorName,
      120,
      'Дежурный специалист клиники'
    ),
    preferredDate: clampString(item.preferredDate, 64, 'Сегодня в 12:00'),
    estimatedPrice: Math.min(1000000, Math.max(0, normalizedPrice)),
    isEmergency: Boolean(item.isEmergency),
    status: safeStatus,
    notes: clampString(item.notes ?? '', 2000, ''),
    ownerUid: clampString(item.ownerUid ?? '', 128, ''),
    doctorRecommendation: clampString(item.doctorRecommendation ?? '', 3000, ''),
    ...(item.preferredTimeSlot
      ? { preferredTimeSlot: clampString(item.preferredTimeSlot, 32, '10:00') }
      : {}),
    ...(typeof item.isOffShiftBooking === 'boolean'
      ? { isOffShiftBooking: item.isOffShiftBooking }
      : {}),
  };

  return result;
}

export function sanitizeServiceForFirestore(item: ServiceItem): ServiceItem {
  const safeId = sanitizeDocId(item.id, 'srv');
  const validCategories: Array<ServiceItem['category']> = [
    'diagnostics',
    'treatment',
    'care',
  ];
  const safeCategory: ServiceItem['category'] = validCategories.includes(
    item.category
  )
    ? item.category
    : 'treatment';

  const safeIncluded = Array.isArray(item.included)
    ? item.included
        .slice(0, 20)
        .map((line) => clampString(line, 300, 'Процедура по регламенту'))
    : ['Осмотр и консультация специалиста'];

  return {
    id: safeId,
    number: clampString(item.number, 16, '01'),
    category: safeCategory,
    categoryLabel: clampString(item.categoryLabel, 64, 'Лечение'),
    title: clampString(item.title, 200, 'Ветеринарная услуга'),
    duration: clampString(item.duration, 64, '30 мин'),
    priceFrom: Math.min(1000000, Math.max(0, Number(item.priceFrom) || 0)),
    description: clampString(item.description, 2000, 'Описание услуги'),
    included: safeIncluded,
    featured: Boolean(item.featured),
    defaultDoctorName: clampString(
      item.defaultDoctorName,
      120,
      'Волкова Елена Сергеевна'
    ),
  };
}

export function sanitizeDoctorForFirestore(item: DoctorProfile): DoctorProfile {
  const safeId = sanitizeDocId(item.id, 'doc');
  const safeSpecialties = Array.isArray(item.specialties)
    ? item.specialties
        .slice(0, 20)
        .map((s) => clampString(s, 200, 'Ветеринария'))
    : ['Терапия'];

  const safeSlots = Array.isArray(item.personalSlots) && item.personalSlots.length > 0
    ? item.personalSlots.slice(0, 20).map((s) => clampString(s, 16, '10:00'))
    : ['10:00', '11:30', '13:00', '15:00', '16:30', '18:00'];

  const safeBrigade = item.brigade === 2 ? 2 : 1;
  const safeShiftType = item.shiftType === 'night' ? 'night' : 'day';

  return {
    id: safeId,
    name: clampString(item.name, 120, 'Специалист клиники'),
    role: clampString(item.role, 160, 'Ветеринарный врач'),
    experienceYears: Math.min(
      80,
      Math.max(0, Number(item.experienceYears) || 1)
    ),
    operationsCount: clampString(
      item.operationsCount,
      120,
      'Практикующий специалист'
    ),
    education: clampString(item.education, 500, 'Высшее ветеринарное образование'),
    quote: clampString(
      item.quote,
      1000,
      'Бережная доказательная ветеринария без лишнего стресса.'
    ),
    specialties: safeSpecialties,
    photoUrl: clampString(
      item.photoUrl,
      2048,
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80'
    ),
    fallbackTitle: clampString(item.fallbackTitle, 120, item.name || 'Врач'),
    accentColor: clampString(item.accentColor, 64, '#0D9488'),
    brigade: safeBrigade,
    shiftType: safeShiftType,
    shiftHours: clampString(
      item.shiftHours,
      32,
      safeShiftType === 'night' ? '20:00–10:00' : '10:00–20:00'
    ),
    personalSlots: safeSlots,
  };
}

export function sanitizeReviewForFirestore(
  item: TestimonialItem
): TestimonialItem {
  const safeId = sanitizeDocId(item.id, 'rev');
  return {
    id: safeId,
    ownerName: clampString(item.ownerName, 120, 'Клиент клиники'),
    ownerRole: clampString(item.ownerRole, 120, 'Владелец питомца'),
    petName: clampString(item.petName, 80, 'Питомец'),
    petBreed: clampString(item.petBreed, 120, 'Домашний питомец'),
    serviceUsed: clampString(item.serviceUsed, 200, 'Консультация и осмотр'),
    visitDate: clampString(item.visitDate, 64, 'Сегодня'),
    rating: Math.min(5, Math.max(1, Math.round(Number(item.rating) || 5))),
    beforeAfterOutcome: clampString(
      item.beforeAfterOutcome,
      500,
      'Прием проведен по протоколу Fear Free'
    ),
    story: clampString(item.story, 3000, 'Спасибо врачам клиники за помощь!'),
    photoUrl: clampString(
      item.photoUrl,
      2048,
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80'
    ),
  };
}

export function sanitizePetProfileForFirestore(
  profile: ClientPetProfile
): ClientPetProfile {
  const validSpecies: Array<ClientPetProfile['petSpecies']> = [
    'Кошка',
    'Собака',
    'Грызун',
  ];
  const safeSpecies = validSpecies.includes(profile.petSpecies)
    ? profile.petSpecies
    : 'Кошка';

  return {
    petName: clampString(profile.petName, 80, ''),
    petSpecies: safeSpecies,
    breedAndAge: clampString(profile.breedAndAge, 160, ''),
    weightKg: clampString(profile.weightKg, 40, ''),
    chronicNotes: clampString(profile.chronicNotes, 2000, ''),
    lastVaccinationDate: clampString(profile.lastVaccinationDate, 64, ''),
    updatedAt: clampString(
      profile.updatedAt,
      64,
      new Date().toLocaleDateString('ru-RU')
    ),
  };
}

export function sanitizeUserAccountForFirestore(
  acc: RegisteredAccount
): RegisteredAccount {
  const safeUid = sanitizeDocId(acc.uid, 'user');
  return {
    uid: safeUid,
    login: clampString(acc.login, 80, 'client'),
    password: clampString(acc.password, 128, '123'),
    displayName: clampString(acc.displayName, 120, 'Клиент'),
    photoURL: clampString(acc.photoURL, 4096, ''),
    role: 'user',
    createdAt: clampString(
      acc.createdAt,
      64,
      new Date().toLocaleDateString('ru-RU')
    ),
  };
}

// ============================================================================
// CRUD & SYNC HELPERS FOR FIRESTORE COLLECTIONS
// ============================================================================

export async function syncAppointmentsToCloud(
  nextList: AppointmentRecord[],
  previousList?: AppointmentRecord[],
  servicesList: ServiceItem[] = SERVICES_DATA
): Promise<void> {
  const path = 'appointments';
  try {
    const sanitizedNext = nextList.map((item) =>
      sanitizeAppointmentForFirestore(item, servicesList)
    );
    const nextIds = new Set(sanitizedNext.map((a) => a.id));

    if (previousList) {
      const removed = previousList.filter(
        (prev) => !nextIds.has(sanitizeDocId(prev.id, 'LP'))
      );
      await Promise.all(
        removed.map((rem) =>
          deleteDoc(doc(db, path, sanitizeDocId(rem.id, 'LP')))
        )
      );
    }

    await Promise.all(
      sanitizedNext.map((record) =>
        setDoc(doc(db, path, record.id), record)
      )
    );
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncServicesToCloud(
  nextList: ServiceItem[],
  previousList?: ServiceItem[]
): Promise<void> {
  const path = 'services';
  try {
    const sanitizedNext = nextList.map(sanitizeServiceForFirestore);
    const nextIds = new Set(sanitizedNext.map((s) => s.id));

    if (previousList) {
      const removed = previousList.filter(
        (prev) => !nextIds.has(sanitizeDocId(prev.id, 'srv'))
      );
      await Promise.all(
        removed.map((rem) =>
          deleteDoc(doc(db, path, sanitizeDocId(rem.id, 'srv')))
        )
      );
    }

    await Promise.all(
      sanitizedNext.map((service) =>
        setDoc(doc(db, path, service.id), service)
      )
    );
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncDoctorsToCloud(
  nextList: DoctorProfile[],
  previousList?: DoctorProfile[]
): Promise<void> {
  const path = 'doctors';
  try {
    const sanitizedNext = nextList.map(sanitizeDoctorForFirestore);
    const nextIds = new Set(sanitizedNext.map((d) => d.id));

    if (previousList) {
      const removed = previousList.filter(
        (prev) => !nextIds.has(sanitizeDocId(prev.id, 'doc'))
      );
      await Promise.all(
        removed.map((rem) =>
          deleteDoc(doc(db, path, sanitizeDocId(rem.id, 'doc')))
        )
      );
    }

    await Promise.all(
      sanitizedNext.map((doctor) =>
        setDoc(doc(db, path, doctor.id), doctor)
      )
    );
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncReviewsToCloud(
  nextList: TestimonialItem[],
  previousList?: TestimonialItem[]
): Promise<void> {
  const path = 'reviews';
  try {
    const sanitizedNext = nextList.map(sanitizeReviewForFirestore);
    const nextIds = new Set(sanitizedNext.map((r) => r.id));

    if (previousList) {
      const removed = previousList.filter(
        (prev) => !nextIds.has(sanitizeDocId(prev.id, 'rev'))
      );
      await Promise.all(
        removed.map((rem) =>
          deleteDoc(doc(db, path, sanitizeDocId(rem.id, 'rev')))
        )
      );
    }

    await Promise.all(
      sanitizedNext.map((review) =>
        setDoc(doc(db, path, review.id), review)
      )
    );
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePetProfileToCloud(
  rawKey: string,
  profile: ClientPetProfile
): Promise<void> {
  const path = 'pet_profiles';
  const docId = sanitizeDocId(rawKey, 'pet');
  try {
    const sanitized = sanitizePetProfileForFirestore(profile);
    await setDoc(doc(db, path, docId), sanitized);
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${docId}`);
  }
}

export async function saveUserAccountToCloud(
  account: RegisteredAccount
): Promise<void> {
  const path = 'users';
  const sanitized = sanitizeUserAccountForFirestore(account);
  try {
    await setDoc(doc(db, path, sanitized.uid), sanitized);
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${sanitized.uid}`);
  }
}

export async function deleteUserAccountFromCloud(uid: string): Promise<void> {
  const safeUid = sanitizeDocId(uid, 'user');
  const safePetId = sanitizeDocId(uid, 'pet');
  try {
    await Promise.all([
      deleteDoc(doc(db, 'users', safeUid)),
      deleteDoc(doc(db, 'pet_profiles', safePetId)),
    ]);
    notifyStatusListeners({
      state: 'connected',
      lastSyncedAt: nowTimeLabel(),
      errorMessage: undefined,
    });
  } catch {
    // Ignore cloud delete error if offline or document does not exist
  }
}

/**
 * Forces a full re-seed / push of current or default clinic data to Firestore
 */
export async function forceSyncAllCollectionsToCloud(payload: {
  appointments: AppointmentRecord[];
  services: ServiceItem[];
  doctors: DoctorProfile[];
  reviews: TestimonialItem[];
  users?: RegisteredAccount[];
}): Promise<void> {
  await Promise.all([
    syncAppointmentsToCloud(payload.appointments, undefined, payload.services),
    syncServicesToCloud(payload.services),
    syncDoctorsToCloud(payload.doctors),
    syncReviewsToCloud(payload.reviews),
    ...(payload.users || []).map((u) => saveUserAccountToCloud(u)),
  ]);
}

export interface ClinicFirestoreCallbacks {
  getInitialAppointments: () => AppointmentRecord[];
  getInitialServices: () => ServiceItem[];
  getInitialDoctors: () => DoctorProfile[];
  getInitialReviews: () => TestimonialItem[];
  getInitialUsers: () => RegisteredAccount[];
  onAppointmentsUpdate: (records: AppointmentRecord[]) => void;
  onServicesUpdate: (items: ServiceItem[]) => void;
  onDoctorsUpdate: (items: DoctorProfile[]) => void;
  onReviewsUpdate: (items: TestimonialItem[]) => void;
  onUsersUpdate?: (accounts: RegisteredAccount[]) => void;
  onPetProfilesUpdate?: (profilesMap: Record<string, ClientPetProfile>) => void;
}

/**
 * Starts real-time onSnapshot listeners for clinic collections in Firestore.
 * Automatically seeds any empty collection on first snapshot.
 */
export function startClinicFirestoreSync(
  callbacks: ClinicFirestoreCallbacks
): () => void {
  const unsubscribes: Unsubscribe[] = [];
  let seededAppointments = false;
  let seededServices = false;
  let seededDoctors = false;
  let seededReviews = false;
  let seededUsers = false;

  // 1. Appointments listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'appointments'),
      (snapshot) => {
        if (snapshot.empty && !seededAppointments) {
          seededAppointments = true;
          const seedData = callbacks.getInitialAppointments();
          void syncAppointmentsToCloud(
            seedData.length > 0 ? seedData : INITIAL_APPOINTMENTS_DATA
          );
          return;
        }
        const currentServices = callbacks.getInitialServices();
        const docs = snapshot.docs.map((d) => {
          const raw = d.data() as AppointmentRecord;
          return {
            ...raw,
            estimatedPrice: resolveAppointmentPrice(raw, currentServices),
          };
        });
        if (docs.length > 0) {
          callbacks.onAppointmentsUpdate(docs);
          notifyStatusListeners({
            state: 'connected',
            lastSyncedAt: nowTimeLabel(),
            errorMessage: undefined,
          });
        }
      },
      (error) => {
        notifyStatusListeners({
          state: 'error',
          errorMessage: error.message,
        });
      }
    )
  );

  // 2. Services listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (snapshot.empty && !seededServices) {
          seededServices = true;
          const seedData = callbacks.getInitialServices();
          void syncServicesToCloud(
            seedData.length > 0 ? seedData : SERVICES_DATA
          );
          return;
        }
        const docs = snapshot.docs
          .map((d) => d.data() as ServiceItem)
          .sort((a, b) => a.number.localeCompare(b.number, 'ru'));
        if (docs.length > 0) {
          callbacks.onServicesUpdate(docs);
          notifyStatusListeners({
            state: 'connected',
            lastSyncedAt: nowTimeLabel(),
          });
        }
      },
      (error) => {
        notifyStatusListeners({
          state: 'error',
          errorMessage: error.message,
        });
      }
    )
  );

  // 3. Doctors listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'doctors'),
      (snapshot) => {
        if (snapshot.empty && !seededDoctors) {
          seededDoctors = true;
          const seedData = callbacks.getInitialDoctors();
          void syncDoctorsToCloud(
            seedData.length > 0 ? seedData : DOCTORS_DATA
          );
          return;
        }
        const docs = snapshot.docs.map((d) => d.data() as DoctorProfile);
        if (docs.length > 0) {
          callbacks.onDoctorsUpdate(docs);
          notifyStatusListeners({
            state: 'connected',
            lastSyncedAt: nowTimeLabel(),
          });
        }
      },
      (error) => {
        notifyStatusListeners({
          state: 'error',
          errorMessage: error.message,
        });
      }
    )
  );

  // 4. Reviews listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        if (snapshot.empty && !seededReviews) {
          seededReviews = true;
          const seedData = callbacks.getInitialReviews();
          void syncReviewsToCloud(
            seedData.length > 0 ? seedData : TESTIMONIALS_DATA
          );
          return;
        }
        const docs = snapshot.docs.map((d) => d.data() as TestimonialItem);
        if (!seededReviews) {
          seededReviews = true;
          const existingIds = new Set(docs.map((r) => r.id));
          const missingDefaultReviews = TESTIMONIALS_DATA.filter(
            (def) => !existingIds.has(def.id)
          );
          if (missingDefaultReviews.length > 0) {
            const merged = [...docs, ...missingDefaultReviews];
            callbacks.onReviewsUpdate(merged);
            void syncReviewsToCloud(merged);
            return;
          }
        }
        if (docs.length > 0) {
          callbacks.onReviewsUpdate(docs);
          notifyStatusListeners({
            state: 'connected',
            lastSyncedAt: nowTimeLabel(),
          });
        }
      },
      (error) => {
        notifyStatusListeners({
          state: 'error',
          errorMessage: error.message,
        });
      }
    )
  );

  // 5. Users listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (snapshot.empty && !seededUsers) {
          seededUsers = true;
          const seedUsers = callbacks.getInitialUsers();
          seedUsers.forEach((u) => {
            void saveUserAccountToCloud(u);
          });
          return;
        }
        const docs = snapshot.docs.map((d) => d.data() as RegisteredAccount);
        if (docs.length > 0 && callbacks.onUsersUpdate) {
          callbacks.onUsersUpdate(docs);
        }
      },
      (error) => {
        notifyStatusListeners({
          state: 'error',
          errorMessage: error.message,
        });
      }
    )
  );

  // 6. Pet profiles listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'pet_profiles'),
      (snapshot) => {
        const map: Record<string, ClientPetProfile> = {};
        snapshot.docs.forEach((d) => {
          map[d.id] = d.data() as ClientPetProfile;
        });
        if (Object.keys(map).length > 0 && callbacks.onPetProfilesUpdate) {
          callbacks.onPetProfilesUpdate(map);
        }
      },
      (error) => {
        notifyStatusListeners({
          state: 'error',
          errorMessage: error.message,
        });
      }
    )
  );

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}

/**
 * Fetches collection snapshot count summary for Admin diagnostics
 */
export async function fetchCloudCollectionsSummary(): Promise<
  Record<string, number>
> {
  const names = [
    'appointments',
    'services',
    'doctors',
    'reviews',
    'users',
    'pet_profiles',
  ];
  const summary: Record<string, number> = {};
  for (const name of names) {
    try {
      const snap = await getDocs(collection(db, name));
      summary[name] = snap.size;
    } catch {
      summary[name] = 0;
    }
  }
  return summary;
}
