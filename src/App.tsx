import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  HeartHandshake,
  LogIn,
  MapPin,
  Menu,
  MessageSquarePlus,
  Navigation,
  PawPrint,
  Phone,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  AppointmentStatus,
  CALCULATOR_PACKAGES,
  CLINIC_INFO,
  createRandomClientAppointments,
  DoctorProfile,
  DOCTORS_DATA,
  EMERGENCY_SYMPTOMS,
  FAQ_DATA,
  getReviewSpeciesCategory,
  INITIAL_APPOINTMENTS_DATA,
  PET_AGE_CONFIG,
  PET_TYPES_CONFIG,
  PetAge,
  PetType,
  resolveAppointmentPrice,
  resolveServicePriceByTitle,
  ReviewSpeciesFilter,
  ServiceCategory,
  ServiceItem,
  SERVICES_DATA,
  TestimonialItem,
  TESTIMONIALS_DATA,
} from './data/clinicData';
import { BookingModal, BookingPrefill } from './components/BookingModal';
import { EmergencyModal } from './components/EmergencyModal';
import { SavedAppointmentsModal } from './components/SavedAppointmentsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AuthModal } from './components/AuthModal';
import {
  AppUserProfile,
  filterAppointmentsForUser,
  getClientPetProfile,
  getRegisteredAccounts,
  getStoredUserProfile,
  saveUserProfile,
  syncPetProfilesFromCloud,
  syncRegisteredAccountsFromCloud,
} from './services/authService';
import {
  forceSyncAllCollectionsToCloud,
  startClinicFirestoreSync,
  syncAppointmentsToCloud,
  syncDoctorsToCloud,
  syncReviewsToCloud,
  syncServicesToCloud,
} from './services/firestoreService';

const STORAGE_KEY = 'lapa_pomoshchi_appointments_v6';
const REVIEWS_STORAGE_KEY = 'lapa_pomoshchi_reviews_v3';
const SERVICES_STORAGE_KEY = 'lapa_pomoshchi_services_v2';
const DOCTORS_STORAGE_KEY = 'lapa_pomoshchi_doctors_v2';

const HERO_STATS = [
  {
    value: '24/7',
    label: 'Стационар и хирургия',
    detail: 'Дежурная реанимационная бригада без выходных',
  },
  {
    value: '15 мин',
    label: 'Экспресс-анализы',
    detail: 'Собственная лаборатория IDEXX прямо во время приема',
  },
  {
    value: '99.4%',
    label: 'Успешных операций',
    detail: 'Газовый наркоз Севофлуран и кардиомониторинг',
  },
  {
    value: '30 мин',
    label: 'Выезд по Москве',
    detail: 'Оборудованный ветмобиль с УЗИ и ЭКГ',
  },
];

const TRUST_BADGES = [
  {
    title: 'Прием без стресса (Fear Free)',
    description:
      'Раздельные зоны ожидания и стационары для кошек, собак и мелких грызунов без пересечения запахов.',
  },
  {
    title: 'Прозрачная смета до начала лечения',
    description:
      'Никаких скрытых манипуляций: фиксированные чек-апы и согласование каждого шага по прайс-листу.',
  },
  {
    title: 'Узкопрофильные специалисты',
    description:
      'В штате работают хирург-эндоскопист, кардиолог, реаниматолог и профильный ратолог по грызунам.',
  },
  {
    title: 'Безопасная газовая анестезия',
    description:
      'Предоперационное ЭхоКГ сердца и индивидуальный анестезиолог на каждой процедуре.',
  },
];

export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-Based Auth Session State
  const [currentUser, setCurrentUser] = useState<AppUserProfile>(() =>
    getStoredUserProfile()
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authReasonMessage, setAuthReasonMessage] = useState<string | undefined>(
    undefined
  );

  // Admin CRM Modal State
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  // Doctor Personal Cabinet State
  const [doctorDashboardOpen, setDoctorDashboardOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Editable Dynamic Services Catalog
  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    try {
      const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SERVICES_DATA;
  });

  // Editable Dynamic Doctors Roster
  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>(() => {
    try {
      const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DOCTORS_DATA;
  });

  // Services filter & search state
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [serviceSearch, setServiceSearch] = useState('');

  // Calculator state
  const [calcPetType, setCalcPetType] = useState<PetType>('dog');
  const [calcPetAge, setCalcPetAge] = useState<PetAge>('adult');
  const [calcPackageId, setCalcPackageId] = useState<string>(
    CALCULATOR_PACKAGES[0].id
  );
  const [calcHomeVisit, setCalcHomeVisit] = useState(false);
  const [calcExpressLab, setCalcExpressLab] = useState(false);

  // First aid & FAQ tabs state
  const [activeSymptomId, setActiveSymptomId] = useState<string>(
    EMERGENCY_SYMPTOMS[0].id
  );
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_DATA[0].id);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | null>(
    null
  );
  const [pendingBookingAfterAuth, setPendingBookingAfterAuth] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [savedAppointmentsModalOpen, setSavedAppointmentsModalOpen] =
    useState(false);

  // Quick inline hero callback bar state
  const [quickPhone, setQuickPhone] = useState('');
  const [quickPetType, setQuickPetType] = useState('Собака');
  const [quickSentBanner, setQuickSentBanner] = useState<string | null>(null);

  // Persistent Appointments State (with guaranteed numeric prices synced to catalog)
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppointmentRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            estimatedPrice: resolveAppointmentPrice(item, SERVICES_DATA),
          }));
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_APPOINTMENTS_DATA.map((item) => ({
      ...item,
      estimatedPrice: resolveAppointmentPrice(item, SERVICES_DATA),
    }));
  });

  // Persistent Reviews State + Add Review Modal State
  const [reviews, setReviews] = useState<TestimonialItem[]>(() => {
    try {
      const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TestimonialItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((r) => r.id));
          const missingDefaults = TESTIMONIALS_DATA.filter(
            (def) => !existingIds.has(def.id)
          );
          return [...parsed, ...missingDefaults];
        }
      }
    } catch {
      // ignore
    }
    return TESTIMONIALS_DATA;
  });

  const [reviewSpeciesFilter, setReviewSpeciesFilter] =
    useState<ReviewSpeciesFilter>('all');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [newReviewOwner, setNewReviewOwner] = useState('');
  const [newReviewPetName, setNewReviewPetName] = useState('');
  const [newReviewPetBreed, setNewReviewPetBreed] = useState('');
  const [newReviewService, setNewReviewService] = useState(
    SERVICES_DATA[0].title
  );
  const [newReviewOutcome, setNewReviewOutcome] = useState('');
  const [newReviewStory, setNewReviewStory] = useState('');

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {
      // ignore storage errors
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesList));
    } catch {
      // ignore
    }
  }, [servicesList]);

  useEffect(() => {
    try {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctorsList));
    } catch {
      // ignore
    }
  }, [doctorsList]);

  // Real-Time Firestore Cloud Synchronization
  useEffect(() => {
    const unsubscribe = startClinicFirestoreSync({
      getInitialAppointments: () => appointments,
      getInitialServices: () => servicesList,
      getInitialDoctors: () => doctorsList,
      getInitialReviews: () => reviews,
      getInitialUsers: () => getRegisteredAccounts(),
      onAppointmentsUpdate: (cloudAppointments) => {
        setAppointments(
          cloudAppointments.map((item) => ({
            ...item,
            estimatedPrice: resolveAppointmentPrice(item, servicesList),
          }))
        );
      },
      onServicesUpdate: (cloudServices) => {
        setServicesList(cloudServices);
      },
      onDoctorsUpdate: (cloudDoctors) => {
        setDoctorsList(cloudDoctors);
      },
      onReviewsUpdate: (cloudReviews) => {
        setReviews(cloudReviews);
      },
      onUsersUpdate: (cloudUsers) => {
        syncRegisteredAccountsFromCloud(cloudUsers);
      },
      onPetProfilesUpdate: (profilesMap) => {
        syncPetProfilesFromCloud(profilesMap);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered services
  const filteredServices = useMemo(() => {
    return servicesList.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' || service.category === activeCategory;
      const query = serviceSearch.trim().toLowerCase();
      const matchesQuery =
        !query ||
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.included.some((item) => item.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [servicesList, activeCategory, serviceSearch]);

  // Calculator totals
  const calculatorSummary = useMemo(() => {
    const petConfig = PET_TYPES_CONFIG[calcPetType];
    const ageConfig = PET_AGE_CONFIG[calcPetAge];
    const selectedPkg =
      CALCULATOR_PACKAGES.find((p) => p.id === calcPackageId) ||
      CALCULATOR_PACKAGES[0];

    const baseAdjusted =
      Math.round(
        (selectedPkg.basePrice * petConfig.multiplier * ageConfig.multiplier) /
          50
      ) * 50;
    const homeAddon = calcHomeVisit ? 1500 : 0;
    const expressAddon = calcExpressLab ? 600 : 0;
    const finalTotal = baseAdjusted + homeAddon + expressAddon;

    const fullServiceTitle = [
      selectedPkg.title,
      calcHomeVisit ? 'Выезд на дом' : '',
      calcExpressLab ? 'Экспресс-лаборатория CITO' : '',
    ]
      .filter(Boolean)
      .join(' + ');

    return {
      petConfig,
      ageConfig,
      selectedPkg,
      baseAdjusted,
      homeAddon,
      expressAddon,
      finalTotal,
      fullServiceTitle,
    };
  }, [calcPetType, calcPetAge, calcPackageId, calcHomeVisit, calcExpressLab]);

  // Auth Handlers
  const handleUserChanged = (user: AppUserProfile) => {
    setCurrentUser(user);
    saveUserProfile(user);

    // Закрываем открытые ролевые панели предыдущей сессии при смене пользователя или выходе
    setAdminDashboardOpen(false);
    setDoctorDashboardOpen(false);
    setSavedAppointmentsModalOpen(false);

    if (user.authSource === 'guest') {
      setPendingBookingAfterAuth(false);
      return;
    }

    // Если гость нажимал «Записаться» (с услугой, врачом или сметой), сразу открываем форму записи с сохраненным выбором
    if (pendingBookingAfterAuth) {
      setPendingBookingAfterAuth(false);
      setBookingModalOpen(true);
      return;
    }

    if (user.role === 'admin' && user.login === '1') {
      setAdminDashboardOpen(true);
    } else if (user.role === 'doctor') {
      setDoctorDashboardOpen(true);
    } else if (user.role === 'user') {
      setSavedAppointmentsModalOpen(true);
    }
  };

  // Open booking modal with context
  const openBookingWithContext = (options?: BookingPrefill) => {
    setBookingPrefill(options || null);
    if (currentUser.authSource === 'guest') {
      setPendingBookingAfterAuth(true);
      const selectedContextLabel =
        options?.serviceTitle || options?.doctorName || '';
      setAuthReasonMessage(
        selectedContextLabel
          ? `Вы выбрали: «${selectedContextLabel}». Войдите или зарегистрируйтесь — окно записи откроется сразу с вашим выбором.`
          : 'Для оформления онлайн-записи на прием войдите в личный кабинет или зарегистрируйтесь.'
      );
      setAuthModalOpen(true);
      return;
    }
    setPendingBookingAfterAuth(false);
    setBookingModalOpen(true);
  };

  const handleBookingCreated = (newRecord: AppointmentRecord) => {
    const resolvedOwnerUid =
      newRecord.ownerUid ||
      (currentUser.authSource !== 'guest' && currentUser.role === 'user'
        ? currentUser.uid
        : undefined);

    const normalized: AppointmentRecord = {
      ...newRecord,
      estimatedPrice: resolveAppointmentPrice(newRecord, servicesList),
      ownerUid: resolvedOwnerUid,
    };

    setAppointments((prev) => {
      const next = [normalized, ...prev];
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleCreateManualAdminAppointment = (
    data: Omit<AppointmentRecord, 'id' | 'createdAt'>
  ) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const numericPrice =
      typeof data.estimatedPrice === 'number' &&
      !Number.isNaN(data.estimatedPrice) &&
      data.estimatedPrice > 0
        ? Math.round(data.estimatedPrice)
        : resolveServicePriceByTitle(
            data.serviceTitle,
            data.petSpecies,
            servicesList
          );

    const newRecord: AppointmentRecord = {
      ...data,
      estimatedPrice: numericPrice,
      id: `LP-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: formattedTime,
    };

    setAppointments((prev) => {
      const next = [newRecord, ...prev];
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleGenerateRandomAppointments = (count = 3): AppointmentRecord[] => {
    const generated = createRandomClientAppointments(
      count,
      servicesList,
      doctorsList
    );
    setAppointments((prev) => {
      const next = [...generated, ...prev];
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
    return generated;
  };

  const handleQuickCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const digits = quickPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      showToast('Пожалуйста, укажите корректный номер телефона (10–11 цифр).');
      return;
    }

    const isClientLoggedIn =
      currentUser.authSource !== 'guest' && currentUser.role === 'user';

    const defaultServiceTitle =
      servicesList[0]?.title || 'Терапия и первичный клинический прием';
    const created: AppointmentRecord = {
      id: `LP-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ownerName: isClientLoggedIn
        ? currentUser.displayName
        : 'Экспресс-обращение с сайта',
      phone: quickPhone.trim(),
      petSpecies: quickPetType,
      petName:
        (isClientLoggedIn && currentUser.petName) || 'Уточняется по телефону',
      serviceTitle: defaultServiceTitle,
      doctorName:
        quickPetType === 'Грызун'
          ? 'Соколова Анна Павловна'
          : 'Дежурный специалист клиники',
      preferredDate: 'Сегодня, ближайшее окно',
      estimatedPrice: resolveServicePriceByTitle(
        defaultServiceTitle,
        quickPetType,
        servicesList
      ),
      isEmergency: false,
      status: 'Новая',
      notes: 'Быстрая запись в 1 клик с первого экрана (перезвонить за 10 минут)',
      ownerUid: isClientLoggedIn ? currentUser.uid : undefined,
    };

    handleBookingCreated(created);
    setQuickPhone('');
    const confirmMsg = `Заявка №${created.id} принята! Дежурный регистратор свяжется с вами по номеру ${created.phone} в течение 10 минут.`;
    setQuickSentBanner(confirmMsg);
    showToast(confirmMsg);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Отменена',
              estimatedPrice: resolveAppointmentPrice(item, servicesList),
            }
          : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((item) => item.id !== id);
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              estimatedPrice: resolveAppointmentPrice(item, servicesList),
            }
          : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleUpdateAppointmentPrice = (id: string, price: number) => {
    const cleanPrice = Math.max(0, Math.round(Number(price) || 0));
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, estimatedPrice: cleanPrice } : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleSyncAllAppointmentPrices = (): number => {
    let updatedCount = 0;
    setAppointments((prev) => {
      const next = prev.map((item) => {
        const syncedPrice = resolveAppointmentPrice(item, servicesList, true);
        if (Number(item.estimatedPrice) !== syncedPrice) {
          updatedCount += 1;
          return {
            ...item,
            estimatedPrice: syncedPrice,
          };
        }
        return item;
      });
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
    return updatedCount;
  };

  const handleRescheduleAppointment = (id: string, newDate: string) => {
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              preferredDate: newDate,
              status: item.status === 'Отменена' ? 'Новая' : item.status,
              estimatedPrice: resolveAppointmentPrice(item, servicesList),
            }
          : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleUpdateAppointmentDoctor = (id: string, doctorName: string) => {
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              doctorName,
              estimatedPrice: resolveAppointmentPrice(item, servicesList),
            }
          : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleUpdateAppointmentNotes = (id: string, notes: string) => {
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              notes,
              estimatedPrice: resolveAppointmentPrice(item, servicesList),
            }
          : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleUpdateAppointmentRecommendation = (
    id: string,
    doctorRecommendation: string
  ) => {
    setAppointments((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              doctorRecommendation,
              estimatedPrice: resolveAppointmentPrice(item, servicesList),
            }
          : item
      );
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  // Admin Service CRUD (automatically synchronizes prices of matching appointments)
  const handleSaveService = (service: ServiceItem) => {
    const cleanService: ServiceItem = {
      ...service,
      priceFrom: Math.max(0, Math.round(Number(service.priceFrom) || 0)),
    };

    const previousService = servicesList.find((s) => s.id === cleanService.id);

    setServicesList((prev) => {
      const exists = prev.some((s) => s.id === cleanService.id);
      const next = exists
        ? prev.map((s) => (s.id === cleanService.id ? cleanService : s))
        : [...prev, cleanService];
      void syncServicesToCloud(next, prev);
      return next;
    });

    setAppointments((prev) => {
      const next = prev.map((appt) => {
        const matchesPreviousTitle =
          previousService &&
          appt.serviceTitle.trim().toLowerCase() ===
            previousService.title.trim().toLowerCase();
        const matchesNewTitle =
          appt.serviceTitle.trim().toLowerCase() ===
          cleanService.title.trim().toLowerCase();

        if (matchesPreviousTitle || matchesNewTitle) {
          return {
            ...appt,
            serviceTitle: cleanService.title,
            estimatedPrice: cleanService.priceFrom,
          };
        }
        return appt;
      });
      void syncAppointmentsToCloud(next, prev, servicesList);
      return next;
    });
  };

  const handleDeleteService = (id: string) => {
    setServicesList((prev) => {
      const next = prev.filter((s) => s.id !== id);
      void syncServicesToCloud(next, prev);
      return next;
    });
  };

  // Admin Doctor CRUD
  const handleSaveDoctor = (doctor: DoctorProfile) => {
    setDoctorsList((prev) => {
      const exists = prev.some((d) => d.id === doctor.id);
      const next = exists
        ? prev.map((d) => (d.id === doctor.id ? doctor : d))
        : [...prev, doctor];
      void syncDoctorsToCloud(next, prev);
      return next;
    });
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctorsList((prev) => {
      const next = prev.filter((d) => d.id !== id);
      void syncDoctorsToCloud(next, prev);
      return next;
    });
  };

  // Admin Review Moderation
  const handleDeleteReview = (id: string) => {
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== id);
      void syncReviewsToCloud(next, prev);
      return next;
    });
  };

  // Reset all demo data to factory defaults
  const handleResetDemoData = () => {
    const cleanInitial = INITIAL_APPOINTMENTS_DATA.map((item) => ({
      ...item,
      estimatedPrice: resolveAppointmentPrice(item, SERVICES_DATA),
    }));
    setAppointments(cleanInitial);
    setServicesList(SERVICES_DATA);
    setDoctorsList(DOCTORS_DATA);
    setReviews(TESTIMONIALS_DATA);

    void forceSyncAllCollectionsToCloud({
      appointments: cleanInitial,
      services: SERVICES_DATA,
      doctors: DOCTORS_DATA,
      reviews: TESTIMONIALS_DATA,
    });
  };

  const openReviewFormWithPrefill = (record?: AppointmentRecord) => {
    if (currentUser.authSource === 'guest') {
      setAuthReasonMessage(
        'Для публикации отзыва войдите в личный кабинет или зарегистрируйтесь.'
      );
      setAuthModalOpen(true);
      return;
    }
    const petCard = getClientPetProfile(currentUser);
    setNewReviewOwner(
      record?.ownerName ||
        currentUser.displayName.replace(/\s*\(.*?\)\s*/g, '').trim()
    );
    setNewReviewPetName(
      record?.petName || petCard?.petName || currentUser.petName || ''
    );
    setNewReviewPetBreed(
      petCard?.breedAndAge ||
        record?.petSpecies ||
        currentUser.petSpecies ||
        ''
    );
    if (record?.serviceTitle) {
      setNewReviewService(record.serviceTitle);
    }
    setReviewFormOpen(true);
    setTimeout(() => {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.authSource === 'guest') {
      setAuthReasonMessage(
        'Чтобы оставить отзыв о визите, пожалуйста, войдите в личный кабинет или зарегистрируйтесь.'
      );
      setAuthModalOpen(true);
      return;
    }

    if (
      !newReviewOwner.trim() ||
      !newReviewPetName.trim() ||
      !newReviewStory.trim()
    ) {
      return;
    }

    const breedLower = `${newReviewPetBreed} ${currentUser.petSpecies || ''}`.toLowerCase();
    const reviewPhoto =
      breedLower.includes('собак') ||
      breedLower.includes('корги') ||
      breedLower.includes('терьер') ||
      breedLower.includes('шпиц')
        ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80'
        : breedLower.includes('грызун') ||
          breedLower.includes('кролик') ||
          breedLower.includes('шиншилл') ||
          breedLower.includes('свинк')
        ? 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80';

    const createdReview: TestimonialItem = {
      id: `rev-${Date.now()}`,
      ownerName: newReviewOwner.trim(),
      ownerRole: `Владелец питомца ${newReviewPetName.trim()}`,
      petName: newReviewPetName.trim(),
      petBreed:
        newReviewPetBreed.trim() ||
        currentUser.petSpecies ||
        'Домашний питомец',
      serviceUsed: newReviewService,
      visitDate: new Date().toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      }),
      rating: 5,
      beforeAfterOutcome:
        newReviewOutcome.trim() ||
        'Успешный прием, бережная диагностика и понятный план лечения.',
      story: newReviewStory.trim(),
      photoUrl: reviewPhoto,
    };

    setReviews((prev) => {
      const next = [createdReview, ...prev];
      void syncReviewsToCloud(next);
      return next;
    });
    setNewReviewOwner('');
    setNewReviewPetName('');
    setNewReviewPetBreed('');
    setNewReviewOutcome('');
    setNewReviewStory('');
    setReviewFormOpen(false);
    showToast('Спасибо! Ваша история выздоровления опубликована на сайте.');
  };

  const userVisibleAppointments = useMemo(
    () => filterAppointmentsForUser(appointments, currentUser),
    [appointments, currentUser]
  );

  const activeAppointmentsCount = userVisibleAppointments.filter(
    (a) => a.status !== 'Отменена'
  ).length;

  const activeSymptom =
    EMERGENCY_SYMPTOMS.find((s) => s.id === activeSymptomId) ??
    EMERGENCY_SYMPTOMS[0];

  const reviewSpeciesCounts = useMemo(() => {
    const counts = {
      all: reviews.length,
      dogs: 0,
      cats: 0,
      exotic: 0,
    };
    reviews.forEach((rev) => {
      const cat = getReviewSpeciesCategory(rev);
      counts[cat] += 1;
    });
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (reviewSpeciesFilter === 'all') return reviews;
    return reviews.filter(
      (rev) => getReviewSpeciesCategory(rev) === reviewSpeciesFilter
    );
  }, [reviews, reviewSpeciesFilter]);

  const isUserAdmin =
    currentUser.role === 'admin' && currentUser.login === '1';
  const isUserDoctor = currentUser.role === 'doctor';

  const doctorAppointmentsCount = useMemo(() => {
    if (!isUserDoctor) return 0;
    return filterAppointmentsForUser(appointments, currentUser).filter(
      (a) => a.status !== 'Отменена'
    ).length;
  }, [appointments, currentUser, isUserDoctor]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4FAF8] text-[#0F2922] selection:bg-[#0D9488] selection:text-white">
      {/* Top Emergency & Address Bar */}
      <div className="bg-[#0F2922] text-white/90 text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="inline-flex items-center gap-2 font-medium text-[#5EEAD4]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              {CLINIC_INFO.schedule}
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-white/80">
              <MapPin className="w-3.5 h-3.5 text-[#5EEAD4]" />
              {CLINIC_INFO.address}
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {isUserAdmin && (
              <button
                type="button"
                onClick={() => setAdminDashboardOpen(true)}
                className="inline-flex items-center gap-1.5 text-[#5EEAD4] hover:text-white font-bold transition-snappy cursor-pointer bg-white/10 px-2.5 py-1 rounded-md"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Админ-панель ({appointments.length})</span>
              </button>
            )}

            {isUserDoctor && (
              <button
                type="button"
                onClick={() => setDoctorDashboardOpen(true)}
                className="inline-flex items-center gap-1.5 text-amber-300 hover:text-white font-bold transition-snappy cursor-pointer bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-md"
              >
                <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                <span>Кабинет врача ({doctorAppointmentsCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[#FDBA74] hover:text-white font-semibold transition-snappy cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
              <span>
                Экстренный триаж: выезд за {CLINIC_INFO.emergencyDispatchMinutes} мин
              </span>
            </button>
            <a
              href={`tel:${CLINIC_INFO.phoneRaw}`}
              className="hidden sm:inline-flex items-center gap-1.5 font-bold text-white hover:text-[#5EEAD4] tabular-nums transition-snappy"
            >
              <Phone className="w-3.5 h-3.5 text-[#5EEAD4]" />
              {CLINIC_INFO.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="bg-[#0D9488] text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between gap-3">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sticky Main Header */}
      <header className="sticky top-0 z-40 bg-[#F4FAF8]/95 backdrop-blur-md border-b border-[#D1EAE4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shadow-sm group-hover:bg-[#0F766E] transition-snappy">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-none text-[#0F2922] tracking-tight">
                {CLINIC_INFO.name}
              </div>
              <div className="text-xs text-[#335249] mt-1 font-medium">
                Ветеринарный центр · {CLINIC_INFO.city}
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-[#335249]">
            <a
              href="#services"
              className="hover:text-[#0D9488] transition-snappy whitespace-nowrap"
            >
              Услуги и цены
            </a>
            <a
              href="#calculator"
              className="hover:text-[#0D9488] transition-snappy whitespace-nowrap"
            >
              Калькулятор чек-апа
            </a>
            <a
              href="#doctors"
              className="hover:text-[#0D9488] transition-snappy whitespace-nowrap"
            >
              Врачи ({doctorsList.length})
            </a>
            <a
              href="#reviews"
              className="hover:text-[#0D9488] transition-snappy whitespace-nowrap"
            >
              Истории пациентов ({reviews.length})
            </a>
            <a
              href="#contacts"
              className="hover:text-[#0D9488] transition-snappy whitespace-nowrap"
            >
              Контакты
            </a>
          </nav>

          {/* Actions & Role Auth Controls */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPendingBookingAfterAuth(false);
                setAuthReasonMessage(undefined);
                setAuthModalOpen(true);
              }}
              className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-snappy whitespace-nowrap cursor-pointer ${
                isUserAdmin
                  ? 'bg-[#0F2922] text-white border-[#0F2922] hover:bg-[#1E3F36]'
                  : currentUser.authSource !== 'guest'
                  ? 'bg-[#E6F4F1] text-[#0F2922] border-[#0D9488]/40 hover:bg-[#D1EAE4]'
                  : 'bg-white text-[#0F2922] border-[#D1EAE4] hover:border-[#0D9488]'
              }`}
              title="Управление аккаунтом и правами доступа"
            >
              {currentUser.authSource !== 'guest' ? (
                <>
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="max-w-[110px] truncate">
                    {currentUser.displayName}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isUserAdmin
                        ? 'bg-[#0D9488] text-white'
                        : isUserDoctor
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#0D9488]/15 text-[#0D9488]'
                    }`}
                  >
                    {isUserAdmin ? 'Админ' : isUserDoctor ? 'Врач' : 'Клиент'}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#0D9488]" />
                  <span>Войти</span>
                </>
              )}
            </button>

            {isUserAdmin && (
              <button
                type="button"
                onClick={() => setAdminDashboardOpen(true)}
                className="py-2.5 px-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-snappy whitespace-nowrap cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Управление</span>
              </button>
            )}

            {isUserDoctor && (
              <button
                type="button"
                onClick={() => setDoctorDashboardOpen(true)}
                className="py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-snappy whitespace-nowrap cursor-pointer shadow-xs"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Кабинет врача ({doctorAppointmentsCount})</span>
              </button>
            )}

            {!isUserDoctor && (
              <button
                type="button"
                onClick={() => setSavedAppointmentsModalOpen(true)}
                className="py-2.5 px-3.5 rounded-xl bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-xs font-bold text-[#0F2922] inline-flex items-center gap-2 transition-snappy whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#0D9488]" />
                <span>Кабинет</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#E6F4F1] text-[#0D9488] font-extrabold tabular-nums">
                  {activeAppointmentsCount}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => openBookingWithContext()}
              className="py-2.5 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-sm hover:shadow transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Записаться на прием</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="p-2.5 rounded-xl bg-white border border-[#D1EAE4] text-[#0F2922] inline-flex items-center gap-1 text-xs font-bold"
              aria-label="Аккаунт"
            >
              <UserCheck className="w-4 h-4 text-[#0D9488]" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (isUserDoctor) {
                  setDoctorDashboardOpen(true);
                } else {
                  setSavedAppointmentsModalOpen(true);
                }
              }}
              className="p-2.5 rounded-xl bg-white border border-[#D1EAE4] text-[#0F2922] inline-flex items-center gap-1.5 text-xs font-bold"
              aria-label={isUserDoctor ? 'Кабинет врача' : 'Мои записи'}
            >
              {isUserDoctor ? (
                <>
                  <Stethoscope className="w-4 h-4 text-amber-600" />
                  <span className="tabular-nums">{doctorAppointmentsCount}</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-[#0D9488]" />
                  <span className="tabular-nums">{activeAppointmentsCount}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2.5 rounded-xl bg-white border border-[#D1EAE4] text-[#0F2922]"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#D1EAE4] px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-[#0F2922]">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Услуги и прайс-лист
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Калькулятор чек-апа
              </a>
              <a
                href="#doctors"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Команда врачей
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Истории выздоровления ({reviews.length})
              </a>
              <a
                href="#contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Маршрут и контакты
              </a>
            </div>

            <div className="pt-3 border-t border-[#D1EAE4] flex flex-col sm:flex-row gap-3">
              {isUserAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAdminDashboardOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F2922] text-white font-bold text-sm inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#5EEAD4]" />
                  <span>Открыть Админ-панель</span>
                </button>
              )}
              {isUserDoctor && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setDoctorDashboardOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm inline-flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-white" />
                  <span>Кабинет врача ({doctorAppointmentsCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingWithContext();
                }}
                className="w-full py-3 px-5 rounded-xl bg-[#F97316] text-white font-bold text-sm text-center"
              >
                Записаться на прием
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEmergencyModalOpen(true);
                }}
                className="w-full py-3 px-5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-sm text-center"
              >
                Экстренная помощь 24/7
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Role Status Bar if logged in */}
      {currentUser.authSource !== 'guest' && (
        <div className="bg-[#E6F4F1] border-b border-[#D1EAE4] px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#0F2922]">
              <UserCheck className="w-4 h-4 text-[#0D9488]" />
              <span>
                Вы вошли как: <strong>{currentUser.displayName}</strong> · Роль:{' '}
                <span className="font-bold text-[#0D9488]">
                  {isUserAdmin
                    ? 'Главный администратор CRM (Логин: 1)'
                    : isUserDoctor
                    ? `Врач клиники (${currentUser.doctorSpecialty || 'Специалист'})`
                    : `Клиент клиники${
                        currentUser.petName
                          ? ` · Питомец: ${currentUser.petSpecies || ''} «${currentUser.petName}»`
                          : ''
                      }`}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              {isUserAdmin && (
                <button
                  type="button"
                  onClick={() => setAdminDashboardOpen(true)}
                  className="font-bold text-[#0D9488] hover:underline cursor-pointer"
                >
                  Открыть панель управления клиникой →
                </button>
              )}
              {isUserDoctor && (
                <button
                  type="button"
                  onClick={() => setDoctorDashboardOpen(true)}
                  className="font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Открыть кабинет врача ({doctorAppointmentsCount}) →
                </button>
              )}
              {!isUserAdmin && !isUserDoctor && (
                <button
                  type="button"
                  onClick={() => setSavedAppointmentsModalOpen(true)}
                  className="font-bold text-[#0D9488] hover:underline cursor-pointer"
                >
                  Мои заявки и медкарта питомца ({activeAppointmentsCount}) →
                </button>
              )}
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="font-semibold text-[#335249] hover:text-[#0F2922] cursor-pointer"
              >
                Сменить аккаунт
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#D1EAE4]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#E6F4F1] border border-[#0D9488]/25 text-[#0F766E] text-xs font-bold tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                  <span>ДОКАЗАТЕЛЬНАЯ ВЕТЕРИНАРИЯ БЕЗ СТРЕССА · МОСКВА</span>
                </div>

                <h1
                  className="font-extrabold text-[#0F2922] tracking-tight leading-[1.08]"
                  style={{ fontSize: 'clamp(2.15rem, 3.8vw + 0.5rem, 3.6rem)' }}
                >
                  Бережная медицина для тех, кто доверяет вам свою жизнь
                </h1>

                <p className="text-base sm:text-lg text-[#335249] leading-relaxed max-w-[62ch]">
                  Круглосуточный ветеринарный госпиталь ({CLINIC_INFO.address}). Собственная экспресс-лаборатория за 15 минут, безопасный газовый наркоз Севофлуран и раздельные зоны ожидания для кошек, собак и грызунов.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => openBookingWithContext()}
                    className="py-4 px-7 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-base shadow-md hover:shadow-lg transition-snappy inline-flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>Записаться на прием онлайн</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmergencyModalOpen(true)}
                    className="py-4 px-6 rounded-xl bg-white hover:bg-[#E6F4F1] text-[#0F2922] border-2 border-[#0D9488] font-bold text-base transition-snappy inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-[#0D9488]" />
                    <span>Экстренный вызов 24/7</span>
                  </button>
                </div>

                {/* Inline Express Callback Bar */}
                <div className="rounded-2xl bg-white border border-[#D1EAE4] p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                      Экспресс-запись дежурному врачу (перезвоним за 10 минут)
                    </span>
                    <span className="text-xs font-semibold text-[#335249] hidden sm:inline">
                      Без очередей
                    </span>
                  </div>

                  {quickSentBanner ? (
                    <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488] p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0F2922]">
                        <CheckCircle2 className="w-5 h-5 text-[#0D9488] shrink-0" />
                        <span>{quickSentBanner}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuickSentBanner(null)}
                        className="text-xs font-bold text-[#0D9488] hover:underline shrink-0"
                      >
                        Новая заявка
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleQuickCallbackSubmit}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5"
                    >
                      <div className="sm:col-span-4">
                        <label htmlFor="quick-pet" className="sr-only">
                          Кто ваш питомец
                        </label>
                        <select
                          id="quick-pet"
                          value={quickPetType}
                          onChange={(e) => setQuickPetType(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] text-sm font-semibold text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                        >
                          <option value="Собака">Питомец: Собака</option>
                          <option value="Кошка">Питомец: Кошка</option>
                          <option value="Грызун">Питомец: Грызун</option>
                        </select>
                      </div>

                      <div className="sm:col-span-5">
                        <label htmlFor="quick-phone" className="sr-only">
                          Ваш телефон
                        </label>
                        <input
                          id="quick-phone"
                          type="tel"
                          required
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full h-11 px-3.5 rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] text-sm text-[#0F2922] placeholder:text-[#335249]/50 focus:outline-none focus:border-[#0D9488] tabular-nums"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          className="w-full h-11 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm transition-snappy whitespace-nowrap cursor-pointer"
                        >
                          Жду звонка
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {HERO_STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-white/80 border border-[#D1EAE4] p-3.5"
                    >
                      <div className="text-xl sm:text-2xl font-extrabold text-[#0D9488] tabular-nums">
                        {stat.value}
                      </div>
                      <div className="text-xs font-bold text-[#0F2922] mt-0.5">
                        {stat.label}
                      </div>
                      <div className="text-[11px] text-[#335249] mt-0.5 leading-tight">
                        {stat.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#D1EAE4] bg-[#E6F4F1] shadow-xl">
                  <img
                    src={CLINIC_INFO.heroPhotoUrl}
                    alt="Главный ветеринарный врач клиники Лапа Помощи осматривает питомца в светлом кабинете"
                    className="w-full h-[420px] sm:h-[500px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2922]/85 via-[#0F2922]/20 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#0F2922]/80 backdrop-blur-md text-white text-xs font-semibold inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#5EEAD4]" />
                      Стандарт Fear Free (прием без страха)
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white/95 text-[#0F2922] text-xs font-extrabold tabular-nums shadow-xs">
                      ★ 4.9 · 1 420+ отзывов
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 backdrop-blur-md p-4 border border-[#D1EAE4] shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                          Дежурная бригада сегодня
                        </div>
                        <div className="text-sm font-extrabold text-[#0F2922] mt-0.5">
                          Алексей Смирнов · Елена Волкова · Дмитрий Морозов
                        </div>
                        <div className="text-xs text-[#335249] mt-1">
                          Готовы к плановому осмотру, УЗИ, ЭхоКГ и экстренной хирургии
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openBookingWithContext({
                            serviceTitle: servicesList[0]?.title,
                            estimatedPrice: servicesList[0]?.priceFrom,
                          })
                        }
                        className="shrink-0 py-2 px-3 rounded-lg bg-[#E6F4F1] hover:bg-[#0D9488] text-[#0F766E] hover:text-white text-xs font-bold transition-snappy cursor-pointer"
                      >
                        К врачу →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & CLINICAL STANDARDS STRIP */}
        <section className="py-12 bg-white border-b border-[#D1EAE4]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge.title}
                  className="rounded-2xl bg-[#F4FAF8] border border-[#D1EAE4] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center mb-3.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-[#0F2922] mb-1.5">
                      {badge.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#335249] leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES & TRANSPARENT PRICE CATALOG */}
        <section
          id="services"
          className="py-16 lg:py-24 border-b border-[#D1EAE4]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-2">
                  Прозрачный прайс-лист без скрытых доплат
                </div>
                <h2
                  className="font-extrabold text-[#0F2922] tracking-tight"
                  style={{ fontSize: 'clamp(1.75rem, 2.6vw + 0.4rem, 2.5rem)' }}
                >
                  Услуги и диагностические программы
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={() => setAdminDashboardOpen(true)}
                    className="py-2.5 px-4 rounded-xl bg-[#0F2922] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#5EEAD4]" />
                    <span>Редактировать прайс (Админ)</span>
                  </button>
                )}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#335249] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Найти УЗИ, вакцинацию, ЭхоКГ..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D1EAE4] text-sm text-[#0F2922] placeholder:text-[#335249]/60 focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              {(
                [
                  { id: 'all', label: `Все направления (${servicesList.length})` },
                  { id: 'diagnostics', label: 'Диагностика и анализы' },
                  { id: 'treatment', label: 'Хирургия и терапия' },
                  { id: 'care', label: 'Вакцинация и уход' },
                ] as { id: ServiceCategory; label: string }[]
              ).map((tab) => {
                const active = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-snappy cursor-pointer ${
                      active
                        ? 'bg-[#0D9488] text-white shadow-xs'
                        : 'bg-white text-[#335249] border border-[#D1EAE4] hover:border-[#0D9488] hover:text-[#0F2922]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {filteredServices.length === 0 ? (
              <div className="rounded-2xl bg-white border border-[#D1EAE4] p-10 text-center">
                <p className="text-base font-bold text-[#0F2922] mb-2">
                  По вашему запросу «{serviceSearch}» услуг не найдено
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setServiceSearch('');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-[#0D9488] text-white text-xs font-bold cursor-pointer"
                >
                  Показать все услуги
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-2xl bg-white border p-6 flex flex-col justify-between transition-snappy hover:-translate-y-0.5 hover:shadow-md ${
                      service.featured
                        ? 'border-[#0D9488] ring-1 ring-[#0D9488]/20'
                        : 'border-[#D1EAE4]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D9488]">
                          {service.number} / {service.categoryLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#335249] bg-[#F4FAF8] px-2.5 py-1 rounded-md border border-[#D1EAE4]">
                          <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                          {service.duration}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[#0F2922] mb-2 leading-snug">
                        {service.title}
                      </h3>

                      <p className="text-sm text-[#335249] leading-relaxed mb-4">
                        {service.description}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-[#D1EAE4] mb-6">
                        <div className="text-xs font-bold text-[#0F2922] mb-2">
                          Включено в стоимость:
                        </div>
                        {service.included.map((inc) => (
                          <div
                            key={inc}
                            className="flex items-start gap-2 text-xs text-[#335249]"
                          >
                            <Check className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#D1EAE4] flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold text-[#335249]">
                          Фиксированный тариф
                        </div>
                        <div className="text-xl font-extrabold text-[#0F2922] tabular-nums">
                          от {service.priceFrom.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openBookingWithContext({
                            serviceTitle: service.title,
                            estimatedPrice: service.priceFrom,
                          })
                        }
                        className="py-2.5 px-4 rounded-xl bg-[#E6F4F1] hover:bg-[#0D9488] text-[#0F2922] hover:text-white font-bold text-xs sm:text-sm transition-snappy whitespace-nowrap cursor-pointer"
                      >
                        Выбрать услугу
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* INTERACTIVE CHECKUP & VACCINATION COST CALCULATOR */}
        <section
          id="calculator"
          className="py-16 lg:py-24 bg-white border-b border-[#D1EAE4]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-2">
                <Calculator className="w-4 h-4" />
                <span>Интерактивный конструктор визита</span>
              </div>
              <h2
                className="font-extrabold text-[#0F2922] tracking-tight"
                style={{ fontSize: 'clamp(1.75rem, 2.6vw + 0.4rem, 2.5rem)' }}
              >
                Рассчитайте стоимость комплексного чек-апа за 30 секунд
              </h2>
              <p className="text-sm sm:text-base text-[#335249] mt-2">
                Выберите вид и возраст питомца, отметьте программу и зафиксируйте смету при онлайн-записи.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                {/* Step 1: Species */}
                <div className="rounded-2xl bg-[#F4FAF8] border border-[#D1EAE4] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-3">
                    Шаг 1 · Кто ваш питомец?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(PET_TYPES_CONFIG) as PetType[]).map((key) => {
                      const sp = PET_TYPES_CONFIG[key];
                      const active = calcPetType === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCalcPetType(key)}
                          className={`p-4 rounded-xl border text-left transition-snappy cursor-pointer ${
                            active
                              ? 'bg-white border-2 border-[#0D9488] shadow-xs'
                              : 'bg-white/60 border-[#D1EAE4] hover:bg-white'
                          }`}
                        >
                          <div className="text-sm font-bold text-[#0F2922]">
                            {sp.label}
                          </div>
                          <div className="text-xs text-[#335249] mt-0.5">
                            {sp.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Age Group */}
                <div className="rounded-2xl bg-[#F4FAF8] border border-[#D1EAE4] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-3">
                    Шаг 2 · Возрастная группа
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(PET_AGE_CONFIG) as PetAge[]).map((key) => {
                      const age = PET_AGE_CONFIG[key];
                      const active = calcPetAge === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCalcPetAge(key)}
                          className={`p-4 rounded-xl border text-left transition-snappy cursor-pointer ${
                            active
                              ? 'bg-white border-2 border-[#0D9488] shadow-xs'
                              : 'bg-white/60 border-[#D1EAE4] hover:bg-white'
                          }`}
                        >
                          <div className="text-sm font-bold text-[#0F2922]">
                            {age.label}
                          </div>
                          <p className="text-xs text-[#335249] mt-1 leading-relaxed">
                            {age.recommendation}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Packages */}
                <div className="rounded-2xl bg-[#F4FAF8] border border-[#D1EAE4] p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-3">
                    Шаг 3 · Выберите комплексную программу
                  </div>
                  <div className="space-y-2.5">
                    {CALCULATOR_PACKAGES.map((pkg) => {
                      const checked = calcPackageId === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setCalcPackageId(pkg.id)}
                          className={`w-full p-4 rounded-xl border text-left transition-snappy cursor-pointer flex items-center justify-between gap-4 ${
                            checked
                              ? 'bg-white border-2 border-[#0D9488]'
                              : 'bg-white/60 border-[#D1EAE4] hover:bg-white'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold text-[#0F2922]">
                              {pkg.title}
                            </div>
                            <div className="text-xs text-[#335249] mt-0.5">
                              {pkg.subtitle} · {pkg.duration}
                            </div>
                          </div>
                          <div className="text-sm font-extrabold text-[#0F2922] tabular-nums whitespace-nowrap">
                            от {pkg.basePrice.toLocaleString('ru-RU')} ₽
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#D1EAE4]">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#D1EAE4] text-xs font-bold text-[#0F2922] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcHomeVisit}
                        onChange={(e) => setCalcHomeVisit(e.target.checked)}
                        className="accent-[#0D9488]"
                      />
                      <span>Выезд врача на дом (+1 500 ₽)</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#D1EAE4] text-xs font-bold text-[#0F2922] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcExpressLab}
                        onChange={(e) => setCalcExpressLab(e.target.checked)}
                        className="accent-[#0D9488]"
                      />
                      <span>Экспресс-лаборатория CITO (+600 ₽)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Live Receipt Summary */}
              <div className="lg:col-span-5 lg:sticky lg:top-28">
                <div className="rounded-2xl bg-[#0F2922] text-white p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/15">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#5EEAD4]">
                        Предварительная смета
                      </div>
                      <h3 className="text-xl font-extrabold mt-0.5">
                        Персональный план чек-апа
                      </h3>
                    </div>
                    <Stethoscope className="w-7 h-7 text-[#5EEAD4]" />
                  </div>

                  <div className="py-5 space-y-3 border-b border-white/15 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/75">Пациент:</span>
                      <span className="font-bold text-right">
                        {calculatorSummary.petConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/75">Возрастная группа:</span>
                      <span className="font-bold text-right">
                        {calculatorSummary.ageConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/75">Программа:</span>
                      <span className="font-bold text-right max-w-[200px] truncate">
                        {calculatorSummary.selectedPkg.title}
                      </span>
                    </div>

                    <div className="pt-2 space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#5EEAD4]">
                        Что включено в программу:
                      </div>
                      {calculatorSummary.selectedPkg.includes.map((inc) => (
                        <div key={inc} className="text-xs text-white/85">
                          • {inc}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="py-5 flex items-baseline justify-between gap-4">
                    <div>
                      <div className="text-xs text-white/70">Итоговая стоимость</div>
                      <div className="text-[11px] text-[#5EEAD4]">
                        Все расходные материалы включены
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-white tabular-nums">
                      {calculatorSummary.finalTotal.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openBookingWithContext({
                        petType: calcPetType,
                        serviceTitle: calculatorSummary.fullServiceTitle,
                        estimatedPrice: calculatorSummary.finalTotal,
                      })
                    }
                    className="w-full py-4 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm sm:text-base transition-snappy inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Записаться с этой сметой</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DOCTORS & SPECIALISTS SECTION */}
        <section id="doctors" className="py-16 lg:py-24 border-b border-[#D1EAE4]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-2">
                  Узкопрофильная экспертиза · Стаж от 8 до 14 лет
                </div>
                <h2
                  className="font-extrabold text-[#0F2922] tracking-tight"
                  style={{ fontSize: 'clamp(1.75rem, 2.6vw + 0.4rem, 2.5rem)' }}
                >
                  Ведущие ветеринарные врачи клиники
                </h2>
              </div>
              <p className="text-sm text-[#335249] max-w-md">
                Каждый специалист регулярно проходит повышение квалификации и работает по международным протоколам WSAVA и ESVS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctorsList.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl bg-white border border-[#D1EAE4] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-snappy"
                >
                  <div>
                    <div className="relative h-64 bg-[#E6F4F1] overflow-hidden">
                      <img
                        src={doc.photoUrl}
                        alt={`${doc.name} — ${doc.role}`}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-lg bg-[#0F2922]/85 backdrop-blur-xs text-white text-xs font-bold tabular-nums">
                        Стаж {doc.experienceYears} лет
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="text-xs font-bold text-[#0D9488] uppercase tracking-wider mb-1">
                        {doc.role}
                      </div>
                      <h3 className="text-lg font-extrabold text-[#0F2922] mb-2">
                        {doc.name}
                      </h3>

                      <div className="text-xs font-semibold text-[#335249] bg-[#F4FAF8] border border-[#D1EAE4] rounded-lg px-3 py-2 mb-3">
                        Практика: <strong className="text-[#0F2922]">{doc.operationsCount}</strong>
                      </div>

                      <p className="text-xs text-[#335249] mb-3 leading-relaxed">
                        <strong className="text-[#0F2922]">Образование:</strong>{' '}
                        {doc.education}
                      </p>

                      <blockquote className="text-xs italic text-[#0F2922] border-l-2 border-[#0D9488] pl-3 py-1 mb-4 bg-[#F4FAF8]/60 rounded-r-lg">
                        «{doc.quote}»
                      </blockquote>

                      <div className="flex flex-wrap gap-1.5">
                        {doc.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#E6F4F1] text-[#0F766E]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[#D1EAE4]">
                    <button
                      type="button"
                      onClick={() =>
                        openBookingWithContext({
                          doctorName: doc.name,
                        })
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition-snappy cursor-pointer"
                    >
                      Записаться к врачу
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PATIENT STORIES & VERIFIED REVIEWS */}
        <section
          id="reviews"
          className="py-16 lg:py-24 bg-white border-b border-[#D1EAE4]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-2">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Истории выздоровления и отзывы владельцев</span>
                </div>
                <h2
                  className="font-extrabold text-[#0F2922] tracking-tight"
                  style={{ fontSize: 'clamp(1.75rem, 2.6vw + 0.4rem, 2.5rem)' }}
                >
                  Реальные клинические случаи наших пациентов
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] text-xs font-bold text-[#0F2922] tabular-nums">
                  Рейтинг клиники: <span className="text-[#0D9488]">4.9 / 5.0</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (reviewFormOpen) {
                      setReviewFormOpen(false);
                    } else {
                      openReviewFormWithPrefill();
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-2 transition-snappy cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Оставить отзыв о визите</span>
                </button>
              </div>
            </div>

            {reviewFormOpen && (
              <form
                onSubmit={handleAddReviewSubmit}
                className="mb-12 rounded-2xl bg-[#F4FAF8] border-2 border-[#0D9488] p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-[#0F2922]">
                    Поделитесь историей лечения вашего питомца
                  </h3>
                  <button
                    type="button"
                    onClick={() => setReviewFormOpen(false)}
                    className="text-xs font-semibold text-[#335249] hover:text-[#0F2922]"
                  >
                    Закрыть
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2922] mb-1">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewOwner}
                      onChange={(e) => setNewReviewOwner(e.target.value)}
                      placeholder="Например, Ольга К."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F2922] mb-1">
                      Кличка питомца *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewPetName}
                      onChange={(e) => setNewReviewPetName(e.target.value)}
                      placeholder="Например, Персик"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F2922] mb-1">
                      Порода и возраст
                    </label>
                    <input
                      type="text"
                      value={newReviewPetBreed}
                      onChange={(e) => setNewReviewPetBreed(e.target.value)}
                      placeholder="Вельш-корги, 3 года"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2922] mb-1">
                      Какую услугу проходили
                    </label>
                    <select
                      value={newReviewService}
                      onChange={(e) => setNewReviewService(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white focus:outline-none focus:border-[#0D9488]"
                    >
                      {servicesList.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F2922] mb-1">
                      Краткий результат (До → После)
                    </label>
                    <input
                      type="text"
                      value={newReviewOutcome}
                      onChange={(e) => setNewReviewOutcome(e.target.value)}
                      placeholder="Например: Провели УЗИ и сняли острую боль за 1 визит"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2922] mb-1">
                    Ваш отзыв о работе врача и клиники *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newReviewStory}
                    onChange={(e) => setNewReviewStory(e.target.value)}
                    placeholder="Расскажите, как прошел прием..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold cursor-pointer"
                  >
                    Опубликовать историю
                  </button>
                </div>
              </form>
            )}

            {/* Species Segmented Filter Bar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D1EAE4]">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    {
                      id: 'all' as ReviewSpeciesFilter,
                      label: 'Все истории',
                      count: reviewSpeciesCounts.all,
                    },
                    {
                      id: 'dogs' as ReviewSpeciesFilter,
                      label: 'Собаки',
                      count: reviewSpeciesCounts.dogs,
                    },
                    {
                      id: 'cats' as ReviewSpeciesFilter,
                      label: 'Кошки',
                      count: reviewSpeciesCounts.cats,
                    },
                    {
                      id: 'exotic' as ReviewSpeciesFilter,
                      label: 'Кролики и грызуны',
                      count: reviewSpeciesCounts.exotic,
                    },
                  ] as const
                ).map((tab) => {
                  const isActive = reviewSpeciesFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReviewSpeciesFilter(tab.id)}
                      className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-snappy inline-flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#0D9488] text-white shadow-xs'
                          : 'bg-[#F4FAF8] text-[#335249] border border-[#D1EAE4] hover:border-[#0D9488] hover:text-[#0F2922]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#E6F4F1] text-[#0D9488]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-[#335249] font-medium tabular-nums">
                Показано клинических историй:{' '}
                <strong className="text-[#0F2922]">{filteredReviews.length}</strong> из{' '}
                {reviews.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl bg-white border border-[#D1EAE4] p-6 flex flex-col justify-between shadow-xs hover:border-[#0D9488]/50 transition-snappy"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={rev.photoUrl}
                          alt={rev.petName}
                          className="w-12 h-12 rounded-xl object-cover border border-[#D1EAE4] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-[#0F2922] truncate">
                            {rev.ownerName}
                          </div>
                          <div className="text-xs font-semibold text-[#0D9488] truncate">
                            {rev.petName} · {rev.petBreed}
                          </div>
                          {rev.ownerRole && (
                            <div className="text-[11px] text-[#335249] truncate">
                              {rev.ownerRole}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-[#F59E0B] shrink-0">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-3.5 h-3.5 fill-[#F59E0B]"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-3 p-3 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] text-xs font-semibold text-[#0F766E]">
                      Итог лечения: {rev.beforeAfterOutcome}
                    </div>

                    <p className="text-xs sm:text-sm text-[#335249] leading-relaxed mb-4">
                      «{rev.story}»
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D1EAE4] flex items-center justify-between gap-2 text-[11px] text-[#335249]">
                    <span className="font-semibold text-[#0D9488] truncate max-w-[72%]">
                      {rev.serviceUsed}
                    </span>
                    <span className="tabular-nums shrink-0">{rev.visitDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FIRST AID SYMPTOMS & FAQ */}
        <section className="py-16 lg:py-24 border-b border-[#D1EAE4]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1.5">
                    Памятка экстренной помощи до приезда в клинику
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tracking-tight">
                    Экстренные симптомы и первая помощь
                  </h2>
                </div>

                <div className="space-y-2">
                  {EMERGENCY_SYMPTOMS.map((symptom) => {
                    const active = symptom.id === activeSymptomId;
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => setActiveSymptomId(symptom.id)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-bold transition-snappy cursor-pointer ${
                          active
                            ? 'bg-[#0F2922] text-white border-[#0F2922]'
                            : 'bg-white border-[#D1EAE4] text-[#0F2922] hover:bg-[#E6F4F1]/50'
                        }`}
                      >
                        {symptom.label}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-white border border-[#D1EAE4] p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
                      {activeSymptom.severity === 'critical'
                        ? 'Критическое состояние · Срочно в реанимацию'
                        : 'Требуется осмотр в ближайшие часы'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEmergencyModalOpen(true)}
                      className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer"
                    >
                      Вызвать бригаду →
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-[#335249] leading-relaxed">
                    <strong className="text-[#0F2922]">Инструкция врача:</strong>{' '}
                    {activeSymptom.firstAid}
                  </p>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1.5">
                    Ответы главного врача
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tracking-tight">
                    Частые вопросы перед визитом
                  </h2>
                </div>

                <div className="space-y-3">
                  {FAQ_DATA.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl bg-white border border-[#D1EAE4] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                          className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                        >
                          <span className="text-sm font-bold text-[#0F2922]">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#0D9488] shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-xs sm:text-sm text-[#335249] leading-relaxed border-t border-[#D1EAE4]/60 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION, DIRECTIONS & CONTACTS SECTION */}
        <section id="contacts" className="py-16 lg:py-24 bg-[#F4FAF8]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#D1EAE4] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1">
                      Круглосуточный прием · {CLINIC_INFO.city}
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0F2922]">
                      Как добраться в клинику «{CLINIC_INFO.name}»
                    </h2>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#0F2922]">
                          {CLINIC_INFO.address}
                        </div>
                        <div className="text-xs text-[#335249]">
                          Собственная бесплатная парковка для клиентов у входа
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
                      <div>
                        <a
                          href={`tel:${CLINIC_INFO.phoneRaw}`}
                          className="font-extrabold text-base text-[#0F2922] hover:text-[#0D9488] tabular-nums"
                        >
                          {CLINIC_INFO.phoneDisplay}
                        </a>
                        <div className="text-xs text-[#335249]">
                          Многоканальный телефон и дежурный реаниматолог 24/7
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#0F2922]">
                          {CLINIC_INFO.schedule}
                        </div>
                        <div className="text-xs text-[#335249]">
                          {CLINIC_INFO.licenseNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#D1EAE4] flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => openBookingWithContext()}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm text-center cursor-pointer"
                  >
                    Записаться на визит
                  </button>
                  <a
                    href={`https://yandex.ru/maps/?text=${encodeURIComponent(
                      `${CLINIC_INFO.city}, ${CLINIC_INFO.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-[#E6F4F1] hover:bg-[#D1EAE4] text-[#0F2922] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4 text-[#0D9488]" />
                    <span>Яндекс.Навигатор</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl bg-[#0F2922] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-[#5EEAD4] text-xs font-bold">
                    Схема проезда и отдельный вход для экстренных пациентов
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold">
                    Удобный подъезд и встреча тяжелых пациентов у автомобиля
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                    Для крупных собак и экстренных пациентов у входа дежурит санитар с каталкой. Позвоните за 3 минуты до подъезда — мы откроем шлагбаум и встретим вас.
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                  <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                    <div className="text-xs font-bold text-[#5EEAD4] mb-1">
                      На автомобиле
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      Свободный заезд с ул. Профсоюзная. Выделенная парковка 6 мест прямо перед входом в клинику.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                    <div className="text-xs font-bold text-[#5EEAD4] mb-1">
                      От метро Новые Черёмушки
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      3 минуты пешком от выхода №2 по освещенному бульвару без ступенек и переходов.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                    <div className="text-xs font-bold text-[#FDBA74] mb-1">
                      Инфекционный бокс
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      Отдельный изолированный бокс с торца здания для невакцинированных животных с температурой.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15 text-xs text-white/75">
                  <span>{CLINIC_INFO.address}</span>
                  <span className="font-semibold text-[#5EEAD4]">
                    Круглосуточный стационар · Без перерывов и выходных
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0F2922] text-white/80 py-10 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] text-white flex items-center justify-center">
              <PawPrint className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">
                Ветеринарная клиника «{CLINIC_INFO.name}»
              </div>
              <div className="text-white/60">
                {CLINIC_INFO.licenseNumber} · {CLINIC_INFO.address}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="text-[#5EEAD4] hover:underline font-semibold cursor-pointer"
            >
              {currentUser.authSource !== 'guest'
                ? `Аккаунт: ${currentUser.displayName}`
                : 'Вход для клиентов и сотрудников'}
            </button>
            <span>© {new Date().getFullYear()} «Лапа Помощи». Все права защищены.</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        prefill={bookingPrefill}
        onBookingCreated={handleBookingCreated}
        servicesList={servicesList}
        doctorsList={doctorsList}
        currentUser={currentUser}
        existingAppointments={appointments}
        onShowToast={showToast}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onRequestEmergencyDispatch={() => {
          setEmergencyModalOpen(false);
          openBookingWithContext({
            serviceTitle: 'Экстренный выезд бригады на дом (за 30 минут)',
            doctorName: 'Морозов Дмитрий Игоревич',
            estimatedPrice: 3500,
            isEmergency: true,
          });
        }}
      />

      <SavedAppointmentsModal
        isOpen={savedAppointmentsModalOpen}
        onClose={() => setSavedAppointmentsModalOpen(false)}
        appointments={appointments}
        allAppointments={appointments}
        servicesList={servicesList}
        currentUser={currentUser}
        onCancelAppointment={handleCancelAppointment}
        onRescheduleAppointment={handleRescheduleAppointment}
        onDeleteCancelledAppointment={handleDeleteAppointment}
        onOpenReviewForAppointment={(record) => openReviewFormWithPrefill(record)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
        onNewAppointment={() => {
          setSavedAppointmentsModalOpen(false);
          openBookingWithContext();
        }}
        onShowToast={showToast}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
        authReasonMessage={authReasonMessage}
      />

      {isUserAdmin && (
        <AdminDashboard
          isOpen={adminDashboardOpen}
          onClose={() => setAdminDashboardOpen(false)}
          appointments={appointments}
          services={servicesList}
          doctors={doctorsList}
          reviews={reviews}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onUpdateAppointmentNotes={handleUpdateAppointmentNotes}
          onUpdateAppointmentRecommendation={handleUpdateAppointmentRecommendation}
          onUpdateAppointmentPrice={handleUpdateAppointmentPrice}
          onUpdateAppointmentDoctor={handleUpdateAppointmentDoctor}
          onUpdateAppointmentDate={handleRescheduleAppointment}
          onSyncAllAppointmentPrices={handleSyncAllAppointmentPrices}
          onDeleteAppointment={handleDeleteAppointment}
          onCreateManualAppointment={handleCreateManualAdminAppointment}
          onGenerateRandomAppointments={handleGenerateRandomAppointments}
          onSaveService={handleSaveService}
          onDeleteService={handleDeleteService}
          onSaveDoctor={handleSaveDoctor}
          onDeleteDoctor={handleDeleteDoctor}
          onDeleteReview={handleDeleteReview}
          onResetDemoData={handleResetDemoData}
        />
      )}

      {isUserDoctor && (
        <DoctorDashboard
          isOpen={doctorDashboardOpen}
          onClose={() => setDoctorDashboardOpen(false)}
          currentUser={currentUser}
          appointments={appointments}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onUpdateAppointmentNotes={handleUpdateAppointmentNotes}
          onUpdateAppointmentRecommendation={handleUpdateAppointmentRecommendation}
          onClaimAppointment={handleUpdateAppointmentDoctor}
          servicesList={servicesList}
        />
      )}
    </div>
  );
}

export default App;
