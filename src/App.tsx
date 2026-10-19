import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Ambulance,
  ArrowRight,
  Calculator,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  FileCheck2,
  HeartHandshake,
  MapPin,
  Menu,
  Microscope,
  Navigation,
  PawPrint,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Star,
  Syringe,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  CALCULATOR_PACKAGES,
  CLINIC_INFO,
  DoctorProfile,
  DOCTORS_DATA,
  FAQ_DATA,
  INITIAL_APPOINTMENTS_DATA,
  PetAge,
  PET_AGE_CONFIG,
  PetType,
  PET_TYPES_CONFIG,
  ServiceCategory,
  ServiceItem,
  SERVICES_DATA,
  TESTIMONIALS_DATA,
} from './data/clinicData';
import { SmartImage } from './components/SmartImage';
import { BookingModal, BookingPrefill } from './components/BookingModal';
import { EmergencyModal } from './components/EmergencyModal';
import { SavedAppointmentsModal } from './components/SavedAppointmentsModal';
import { GoogleDriveSection } from './components/GoogleDriveSection';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import {
  AppUserProfile,
  filterAppointmentsForUser,
  getStoredUserProfile,
  signOutAccount,
} from './services/authService';
import { ensureInitialTestEmailSentToTanks8015 } from './services/emailService';

const STORAGE_KEY = 'lapa_pomoshchi_appointments_v2';
const SERVICES_STORAGE_KEY = 'lapa_pomoshchi_services_v1';
const DOCTORS_STORAGE_KEY = 'lapa_pomoshchi_doctors_v1';

export default function App() {
  // User Profile & RBAC Role State
  const [currentUser, setCurrentUser] = useState<AppUserProfile>(() =>
    getStoredUserProfile()
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Navigation & Modals State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | null>(null);
  const [pendingBookingForAuth, setPendingBookingForAuth] = useState<{
    pending: boolean;
    prefill: BookingPrefill | null;
  }>({ pending: false, prefill: null });
  const [pendingSavedModalForAuth, setPendingSavedModalForAuth] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string>('');

  // Appointments persisted in localStorage (pre-populated with 6 realistic records if empty)
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_APPOINTMENTS_DATA;
  });

  // Editable Services persisted in localStorage
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(SERVICES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return SERVICES_DATA;
  });

  // Editable Doctors persisted in localStorage
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => {
    try {
      const raw = window.localStorage.getItem(DOCTORS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DOCTORS_DATA;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {
      // ignore
    }
  }, [appointments]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    } catch {
      // ignore
    }
  }, [services]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
    } catch {
      // ignore
    }
  }, [doctors]);

  const showToastNotice = (message: string) => {
    setToastNotice(message);
    window.setTimeout(() => {
      setToastNotice((current) => (current === message ? '' : current));
    }, 6000);
  };

  // Автоматическая тестовая отправка письма с почты клиники на tanks8015@gmail.com при запуске
  useEffect(() => {
    void ensureInitialTestEmailSentToTanks8015().then((result) => {
      if (result) {
        showToastNotice(result.toastMessage);
      }
    });
  }, []);

  // Строгая RBAC-фильтрация записей для текущего пользователя
  const userVisibleAppointments = useMemo(
    () => filterAppointmentsForUser(appointments, currentUser),
    [appointments, currentUser]
  );

  const openAuthModal = (
    mode: 'login' | 'register',
    keepPendingActions = false
  ) => {
    if (!keepPendingActions) {
      setPendingBookingForAuth({ pending: false, prefill: null });
      setPendingSavedModalForAuth(false);
    }
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleUserChanged = (nextUser: AppUserProfile) => {
    setCurrentUser(nextUser);
    if (nextUser.authSource !== 'guest') {
      if (pendingBookingForAuth.pending) {
        const savedPrefill = pendingBookingForAuth.prefill;
        setPendingBookingForAuth({ pending: false, prefill: null });
        setBookingPrefill(savedPrefill);
        setBookingModalOpen(true);
      } else if (pendingSavedModalForAuth) {
        setPendingSavedModalForAuth(false);
        setSavedModalOpen(true);
      }
    }
  };

  const handleLogoutClick = async () => {
    const guest = await signOutAccount();
    setCurrentUser(guest);
    setPendingBookingForAuth({ pending: false, prefill: null });
    setPendingSavedModalForAuth(false);
  };

  const openSavedAppointments = () => {
    setMobileMenuOpen(false);
    if (currentUser.authSource === 'guest') {
      setPendingSavedModalForAuth(true);
      openAuthModal('login', true);
      return;
    }
    setSavedModalOpen(true);
  };

  // Services Filter State
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((service) => service.category === activeCategory);
  }, [activeCategory, services]);

  // Interactive Calculator State
  const [calcPetType, setCalcPetType] = useState<PetType>('cat');
  const [calcPetAge, setCalcPetAge] = useState<PetAge>('adult');
  const [calcPackageId, setCalcPackageId] = useState<string>(CALCULATOR_PACKAGES[0].id);
  const [calcHomeVisit, setCalcHomeVisit] = useState<boolean>(false);
  const [calcExpressLab, setCalcExpressLab] = useState<boolean>(false);

  const selectedPackage = useMemo(
    () =>
      CALCULATOR_PACKAGES.find((pkg) => pkg.id === calcPackageId) ||
      CALCULATOR_PACKAGES[0],
    [calcPackageId]
  );

  const calculationBreakdown = useMemo(() => {
    const petMultiplier = PET_TYPES_CONFIG[calcPetType].multiplier;
    const ageMultiplier = PET_AGE_CONFIG[calcPetAge].multiplier;
    const adjustedPackagePrice = Math.round(
      (selectedPackage.basePrice * petMultiplier * ageMultiplier) / 50
    ) * 50;
    const homeVisitCost = calcHomeVisit ? 1500 : 0;
    const expressLabCost = calcExpressLab ? 600 : 0;
    const total = adjustedPackagePrice + homeVisitCost + expressLabCost;

    return {
      adjustedPackagePrice,
      homeVisitCost,
      expressLabCost,
      total,
    };
  }, [calcPetType, calcPetAge, selectedPackage, calcHomeVisit, calcExpressLab]);

  // FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_DATA[0].id);

  // Interactive Map Route Tab State
  const [mapRouteMode, setMapRouteMode] = useState<'metro' | 'car' | 'emergency'>('metro');

  // Handlers
  const openGeneralBooking = (prefill?: BookingPrefill) => {
    setMobileMenuOpen(false);
    if (currentUser.authSource === 'guest') {
      setPendingBookingForAuth({ pending: true, prefill: prefill || null });
      openAuthModal('register', true);
      return;
    }
    setBookingPrefill(prefill || null);
    setBookingModalOpen(true);
  };

  const handleBookingCreated = (newRecord: AppointmentRecord) => {
    setAppointments((prev) => [newRecord, ...prev]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBookFromCalculator = () => {
    const addons: string[] = [];
    if (calcHomeVisit) addons.push('Выезд на дом');
    if (calcExpressLab) addons.push('Экспресс-лаборатория CITO');
    const addonSuffix = addons.length > 0 ? ` (${addons.join(', ')})` : '';

    openGeneralBooking({
      petType: calcPetType,
      serviceTitle: `${selectedPackage.title}${addonSuffix}`,
      estimatedPrice: calculationBreakdown.total,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F2922]">
      {/* Sticky Header: Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D1EAE4]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 lg:px-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-xl font-extrabold tracking-tight text-[#0F2922] hover:text-[#0D9488] transition-snappy whitespace-nowrap shrink-0"
          >
            Лапа Помощи
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#335249]"
          >
            <a
              href="#services"
              className="hover:text-[#0F2922] hover:underline underline-offset-4 transition-snappy whitespace-nowrap shrink-0"
            >
              Услуги и цены
            </a>
            <a
              href="#calculator"
              className="hover:text-[#0F2922] hover:underline underline-offset-4 transition-snappy whitespace-nowrap shrink-0"
            >
              Калькулятор
            </a>
            <a
              href="#doctors"
              className="hover:text-[#0F2922] hover:underline underline-offset-4 transition-snappy whitespace-nowrap shrink-0"
            >
              Врачи
            </a>
            <a
              href="#reviews"
              className="hover:text-[#0F2922] hover:underline underline-offset-4 transition-snappy whitespace-nowrap shrink-0"
            >
              Отзывы
            </a>
            <a
              href="#contacts"
              className="hover:text-[#0F2922] hover:underline underline-offset-4 transition-snappy whitespace-nowrap shrink-0"
            >
              Контакты
            </a>
          </nav>

          {/* Zone 3: 1 primary action (+ mobile menu trigger on small screens) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openGeneralBooking()}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-xl transition-snappy whitespace-nowrap shrink-0 cursor-pointer"
            >
              Записаться на прием
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Открыть меню навигации"
              className="md:hidden w-10 h-10 rounded-xl border border-[#D1EAE4] flex items-center justify-center text-[#0F2922] hover:bg-[#F4FAF8] transition-snappy shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D1EAE4] bg-white px-6 py-4 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2.5 text-sm font-medium text-[#0F2922]">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Услуги и цены
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Калькулятор стоимости
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
                Отзывы владельцев
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Частые вопросы
              </a>
              <a
                href="#contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0D9488]"
              >
                Контакты и схема проезда
              </a>
            </div>
            <div className="pt-3 border-t border-[#D1EAE4] flex flex-wrap items-center justify-between gap-2 text-xs text-[#335249]">
              <a
                href={`tel:${CLINIC_INFO.phoneRaw}`}
                className="font-bold text-[#0F2922] tabular-nums"
              >
                {CLINIC_INFO.phoneDisplay} (24/7)
              </a>
              <button
                type="button"
                onClick={openSavedAppointments}
                className="font-semibold text-[#0D9488] underline underline-offset-4"
              >
                Мои заявки ({userVisibleAppointments.length})
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-[#F4FAF8] to-white pt-6 pb-16 lg:pb-24 border-b border-[#D1EAE4]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Clinic 24/7 Bar & User Profile / RBAC Demo Switcher & Saved Bookings */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#D1EAE4] text-xs sm:text-sm text-[#335249]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-[#0D9488]">Работаем 24/7 без выходных</span>
                <span aria-hidden="true">·</span>
                <span>Москва, ул. Профсоюзная, д. 45 (м. Новые Черёмушки)</span>
                <span aria-hidden="true">·</span>
                <a
                  href={`tel:${CLINIC_INFO.phoneRaw}`}
                  className="font-bold text-[#0F2922] hover:text-[#0D9488] transition-snappy tabular-nums whitespace-nowrap"
                >
                  {CLINIC_INFO.phoneDisplay}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* User Profile / Login & Registration Triggers */}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-2 py-1 pl-1.5 pr-3 rounded-xl bg-white hover:bg-[#E6F4F1] border border-[#D1EAE4] text-[#0F2922] font-semibold text-xs transition-snappy whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>
                    {currentUser.authSource === 'guest'
                      ? 'Войти в аккаунт'
                      : currentUser.displayName}
                  </span>
                </button>

                {currentUser.authSource === 'guest' ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-[#E6F4F1] border border-[#D1EAE4] text-[#0D9488] font-bold text-xs transition-snappy whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Регистрация</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-[#E6F4F1] border border-[#D1EAE4] text-[#335249] hover:text-[#0F2922] font-semibold text-xs transition-snappy whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Выйти</span>
                  </button>
                )}

                {currentUser.role === 'admin' && currentUser.login === '1' && (
                  <a
                    href="#admin-panel"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs transition-snappy whitespace-nowrap shrink-0"
                  >
                    <span>Админ-панель</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={openSavedAppointments}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#E6F4F1] hover:bg-[#D1EAE4] text-[#0F2922] font-semibold text-xs transition-snappy whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Мои заявки ({userVisibleAppointments.length})</span>
                </button>
              </div>
            </div>

            {/* 2-Column Hero Split with items-stretch balance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Value Proposition & Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between py-2">
                <div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0D9488] mb-4">
                    <span>Ветеринарный госпиталь доказательной медицины</span>
                    <span aria-hidden="true">·</span>
                    <span>Кошки, собаки и мелкие грызуны</span>
                  </div>

                  <h1
                    className="font-extrabold text-[#0F2922] tracking-tight leading-[1.12] mb-6"
                    style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
                  >
                    Бережная забота и точная диагностика для ваших питомцев 24/7
                  </h1>

                  <p className="text-base sm:text-lg text-[#335249] leading-relaxed max-w-2xl mb-8">
                    Принимаем планово и экстренно без очередей. Проводим УЗИ экспертного класса и анализы крови за 15 минут в собственной лаборатории, лечим по международным протоколам Fear Free без боли и лишних назначений.
                  </p>

                  {/* Primary & Emergency Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 mb-10">
                    <button
                      type="button"
                      onClick={() => openGeneralBooking()}
                      className="py-4 px-7 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm sm:text-base shadow-md transition-snappy inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Записаться онлайн</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmergencyModalOpen(true)}
                      className="py-4 px-6 rounded-2xl bg-white hover:bg-[#F4FAF8] text-[#0F2922] border border-[#D1EAE4] font-semibold text-sm sm:text-base transition-snappy inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Ambulance className="w-5 h-5 text-[#F97316]" />
                      <span>Экстренный вызов (чек-лист)</span>
                    </button>
                  </div>
                </div>

                {/* Quantitative Trust Proof Footer inside Left Column */}
                <div className="pt-6 border-t border-[#D1EAE4] grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tabular-nums">
                      15 мин
                    </div>
                    <div className="text-xs text-[#335249] mt-1">
                      готовность анализов крови и ПЦР в своей лаборатории
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tabular-nums">
                      18 400+
                    </div>
                    <div className="text-xs text-[#335249] mt-1">
                      здоровых питомцев за 12 лет работы клиники в Москве
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0D9488] tabular-nums">
                      99.4%
                    </div>
                    <div className="text-xs text-[#335249] mt-1">
                      успешных плановых операций с газовым наркозом
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Impact Pet Photo filling height */}
              <div className="lg:col-span-5 flex">
                <div className="relative w-full rounded-2xl overflow-hidden border border-[#D1EAE4] bg-[#E6F4F1] shadow-lg flex flex-col justify-end min-h-[360px] lg:min-h-full">
                  <SmartImage
                    src={CLINIC_INFO.heroPhotoUrl}
                    alt="Счастливый золотистый ретривер на осмотре у ветеринарного врача в клинике Лапа Помощи"
                    variant="hero"
                    label="Ветеринарный центр «Лапа Помощи»"
                    sublabel="Осмотр по стандарту Fear Free без стресса"
                    className="w-full h-full object-cover lg:absolute lg:inset-0"
                  />
                  <div className="relative z-10 bg-gradient-to-t from-[#0F2922]/90 via-[#0F2922]/55 to-transparent p-6 pt-16 text-white">
                    <div className="text-xs font-medium text-[#B8E1D8] mb-1">
                      Прием без клеток и пугающих запахов
                    </div>
                    <p className="text-sm sm:text-base font-semibold leading-snug">
                      Раздельные зоны ожидания для собак, кошек и мелких грызунов с феромонами спокойствия Feliway и Adaptil
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Advantage Strip below Hero Split */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl bg-white border border-[#D1EAE4] p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2922] mb-1">
                    Выезд на дом за 30 минут
                  </h2>
                  <p className="text-xs text-[#335249] leading-relaxed">
                    Круглосуточные бригады с портативным УЗИ, ЭКГ и кислородным боксом по всей Москве.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#D1EAE4] p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2922] mb-1">
                    Собственная лаборатория
                  </h2>
                  <p className="text-xs text-[#335249] leading-relaxed">
                    Анализаторы IDEXX (США): клинический и биохимический анализ крови за 15 минут.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#D1EAE4] p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2922] mb-1">
                    Стационар интенсивной терапии
                  </h2>
                  <p className="text-xs text-[#335249] leading-relaxed">
                    Индивидуальные кислородные боксы с подогревом пола и постом реаниматолога 24/7.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#D1EAE4] p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2922] mb-1">
                    Фиксированная смета до лечения
                  </h2>
                  <p className="text-xs text-[#335249] leading-relaxed">
                    Никаких скрытых доплат: согласуем план диагностики и точную стоимость заранее.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Dashboard Section (Rendered strictly when authenticated with login: 1, password: 1) */}
        {currentUser.role === 'admin' && currentUser.login === '1' && (
          <AdminDashboard
            appointments={appointments}
            onUpdateAppointments={setAppointments}
            services={services}
            onUpdateServices={setServices}
            doctors={doctors}
            onUpdateDoctors={setDoctors}
            onShowToast={showToastNotice}
          />
        )}

        {/* Services & Prices Section with Interactive Filter */}
        <section id="services" className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <div className="text-xs font-semibold text-[#0D9488] mb-2">
                  Прозрачный прейскурант клиники · Все расходные материалы включены
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2922] tracking-tight">
                  Услуги и цены
                </h2>
              </div>

              {/* Interactive Filter Tabs (Segmented Control) */}
              <div
                role="tablist"
                aria-label="Фильтр категорий услуг"
                className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F4FAF8] border border-[#D1EAE4] rounded-xl self-start"
              >
                {(
                  [
                    { id: 'all', label: 'Все направления' },
                    { id: 'diagnostics', label: 'Диагностика' },
                    { id: 'treatment', label: 'Лечение и хирургия' },
                    { id: 'care', label: 'Уход и профилактика' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-snappy whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#0D9488] text-white shadow-xs'
                          : 'text-[#335249] hover:text-[#0F2922]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl bg-white border border-[#D1EAE4] hover:border-[#0D9488] p-6 flex flex-col justify-between transition-snappy hover:shadow-md"
                >
                  <div>
                    {/* Unboxed clean metadata header */}
                    <div className="flex items-center justify-between gap-2 text-xs text-[#335249] mb-3 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#0D9488]">{service.number}.</span>
                        <span>{service.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F2922] leading-snug mb-3">
                      {service.title}
                    </h3>

                    <p className="text-xs text-[#335249] leading-relaxed mb-5">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6 border-t border-[#D1EAE4] pt-4">
                      {service.included.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-[#0F2922]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#D1EAE4] flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-[#335249]">Стоимость</div>
                      <div className="text-lg font-extrabold text-[#0F2922] tabular-nums">
                        от {service.priceFrom.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openGeneralBooking({
                          serviceTitle: service.title,
                          estimatedPrice: service.priceFrom,
                        })
                      }
                      className="px-4 py-2.5 rounded-xl bg-[#E6F4F1] hover:bg-[#0D9488] text-[#0F2922] hover:text-white text-xs font-bold transition-snappy whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Записаться
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Cost & Check-up Calculator Section */}
        <section
          id="calculator"
          className="py-16 lg:py-24 bg-[#F4FAF8] border-y border-[#D1EAE4]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <div className="text-xs font-semibold text-[#0D9488] mb-2">
                Точный онлайн-расчет за 30 секунд · Мгновенная передача в запись
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2922] tracking-tight mb-3">
                Интерактивный калькулятор чек-апа и услуг
              </h2>
              <p className="text-sm sm:text-base text-[#335249]">
                Выберите вид питомца, возраст и нужную программу обследования. Скрипт сразу рассчитает стоимость с учетом расходных материалов и позволит записаться в один клик.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Controls */}
              <div className="lg:col-span-7 rounded-2xl bg-white border border-[#D1EAE4] p-6 sm:p-8 space-y-7">
                {/* Step 1: Pet Type */}
                <div>
                  <label className="block text-sm font-bold text-[#0F2922] mb-3">
                    1. Выберите вид вашего питомца
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(PET_TYPES_CONFIG) as PetType[]).map((petKey) => {
                      const pet = PET_TYPES_CONFIG[petKey];
                      const active = calcPetType === petKey;
                      return (
                        <button
                          key={petKey}
                          type="button"
                          onClick={() => setCalcPetType(petKey)}
                          className={`p-4 rounded-xl border text-left transition-snappy cursor-pointer ${
                            active
                              ? 'bg-[#E6F4F1] border-[#0D9488] text-[#0F2922]'
                              : 'bg-white border-[#D1EAE4] text-[#335249] hover:bg-[#F4FAF8]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-[#0F2922]">
                              {pet.label}
                            </span>
                            <PawPrint
                              className={`w-4 h-4 ${
                                active ? 'text-[#0D9488]' : 'text-[#335249]'
                              }`}
                            />
                          </div>
                          <div className="text-xs text-[#335249]">{pet.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Pet Age */}
                <div>
                  <label className="block text-sm font-bold text-[#0F2922] mb-3">
                    2. Возраст питомца
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(PET_AGE_CONFIG) as PetAge[]).map((ageKey) => {
                      const age = PET_AGE_CONFIG[ageKey];
                      const active = calcPetAge === ageKey;
                      return (
                        <button
                          key={ageKey}
                          type="button"
                          onClick={() => setCalcPetAge(ageKey)}
                          className={`p-4 rounded-xl border text-left transition-snappy cursor-pointer ${
                            active
                              ? 'bg-[#E6F4F1] border-[#0D9488] text-[#0F2922]'
                              : 'bg-white border-[#D1EAE4] text-[#335249] hover:bg-[#F4FAF8]'
                          }`}
                        >
                          <div className="text-sm font-bold text-[#0F2922] mb-1 tabular-nums">
                            {age.label}
                          </div>
                          <div className="text-xs text-[#335249]">{age.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 text-xs text-[#335249]">
                    <strong className="text-[#0F2922]">Рекомендация врача: </strong>
                    {PET_AGE_CONFIG[calcPetAge].recommendation}
                  </p>
                </div>

                {/* Step 3: Select Program */}
                <div>
                  <label className="block text-sm font-bold text-[#0F2922] mb-3">
                    3. Выберите программу чек-апа или процедуру
                  </label>
                  <div className="space-y-2.5">
                    {CALCULATOR_PACKAGES.map((pkg) => {
                      const active = calcPackageId === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setCalcPackageId(pkg.id)}
                          className={`w-full p-4 rounded-xl border text-left transition-snappy flex items-center justify-between gap-4 cursor-pointer ${
                            active
                              ? 'bg-[#E6F4F1] border-[#0D9488] text-[#0F2922]'
                              : 'bg-white border-[#D1EAE4] text-[#335249] hover:bg-[#F4FAF8]'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold text-[#0F2922]">
                              {pkg.title}
                            </div>
                            <div className="text-xs text-[#335249] mt-0.5">
                              {pkg.subtitle} · Длительность {pkg.duration}
                            </div>
                          </div>
                          <div className="text-sm font-extrabold text-[#0D9488] tabular-nums whitespace-nowrap shrink-0">
                            база {pkg.basePrice.toLocaleString('ru-RU')} ₽
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Additional Options */}
                <div>
                  <label className="block text-sm font-bold text-[#0F2922] mb-3">
                    4. Дополнительные опции (по желанию)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCalcHomeVisit((prev) => !prev)}
                      className={`p-3.5 rounded-xl border text-left transition-snappy flex items-center justify-between gap-3 cursor-pointer ${
                        calcHomeVisit
                          ? 'bg-[#E6F4F1] border-[#0D9488] text-[#0F2922]'
                          : 'bg-white border-[#D1EAE4] text-[#335249] hover:bg-[#F4FAF8]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#0F2922]">
                        Выезд врача на дом по Москве
                      </div>
                      <span className="text-xs font-bold text-[#0D9488] tabular-nums whitespace-nowrap">
                        +1 500 ₽
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcExpressLab((prev) => !prev)}
                      className={`p-3.5 rounded-xl border text-left transition-snappy flex items-center justify-between gap-3 cursor-pointer ${
                        calcExpressLab
                          ? 'bg-[#E6F4F1] border-[#0D9488] text-[#0F2922]'
                          : 'bg-white border-[#D1EAE4] text-[#335249] hover:bg-[#F4FAF8]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#0F2922]">
                        Экспресс-анализы CITO (за 15 мин)
                      </div>
                      <span className="text-xs font-bold text-[#0D9488] tabular-nums whitespace-nowrap">
                        +600 ₽
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Calculation Summary Card */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#D1EAE4] p-6 sm:p-8 shadow-md">
                <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-[#D1EAE4]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0F2922]">
                        Итоговая смета программы
                      </h3>
                      <p className="text-xs text-[#335249]">
                        {PET_TYPES_CONFIG[calcPetType].label} · Возраст:{' '}
                        {PET_AGE_CONFIG[calcPetAge].label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs font-semibold text-[#335249] mb-2">
                    Что входит в выбранный комплекс «{selectedPackage.title}»:
                  </div>
                  <ul className="space-y-2.5 bg-[#F4FAF8] rounded-xl p-4 border border-[#D1EAE4]">
                    {selectedPackage.includes.map((inc) => (
                      <li
                        key={inc}
                        className="flex items-start gap-2.5 text-xs text-[#0F2922]"
                      >
                        <Check className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm pb-5 mb-5 border-b border-[#D1EAE4] tabular-nums">
                  <div className="flex justify-between text-[#335249]">
                    <span>Стоимость пакета (с учетом вида и возраста):</span>
                    <span className="font-semibold text-[#0F2922]">
                      {calculationBreakdown.adjustedPackagePrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  {calcHomeVisit && (
                    <div className="flex justify-between text-[#335249]">
                      <span>Выезд врача с оборудованием на дом:</span>
                      <span className="font-semibold text-[#0F2922]">1 500 ₽</span>
                    </div>
                  )}
                  {calcExpressLab && (
                    <div className="flex justify-between text-[#335249]">
                      <span>Срочная диагностика CITO (15 минут):</span>
                      <span className="font-semibold text-[#0F2922]">600 ₽</span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-4 mb-6">
                  <div>
                    <div className="text-xs text-[#335249]">Ориентировочная сумма к оплате</div>
                    <div className="text-[11px] text-[#0D9488] font-medium">
                      Все расходные материалы включены
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0F2922] tabular-nums">
                    {calculationBreakdown.total.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBookFromCalculator}
                  className="w-full py-4 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm sm:text-base shadow-md transition-snappy flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Записаться по этому расчету</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-[#335249] mt-3">
                  Параметры расчета автоматически подставятся в форму записи
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Drive Cloud Medical Card Integration (Visible strictly to Administrator) */}
        {currentUser.role === 'admin' && currentUser.login === '1' && (
          <GoogleDriveSection
            appointments={appointments}
            calculatorSummaryText={`Питомец: ${PET_TYPES_CONFIG[calcPetType].label} (${PET_AGE_CONFIG[calcPetAge].label})\nПрограмма: ${selectedPackage.title}\nИтоговая расчетная стоимость: ${calculationBreakdown.total.toLocaleString('ru-RU')} ₽`}
            userRole={currentUser.role}
            onGoogleLoginSuccess={handleUserChanged}
          />
        )}

        {/* Doctors Team Section */}
        <section id="doctors" className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-semibold text-[#0D9488] mb-2">
                  Узкопрофильные врачи · Постоянное повышение квалификации
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2922] tracking-tight">
                  Команда специалистов «Лапа Помощи»
                </h2>
              </div>
              <p className="text-sm text-[#335249] max-w-md">
                Каждый пациент попадает к профильному специалисту: от хирурга-эндоскописта и кардиолога до ратолога по мелким грызунам.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.map((doctor) => (
                <article
                  key={doctor.id}
                  className="rounded-2xl bg-white border border-[#D1EAE4] overflow-hidden flex flex-col justify-between transition-snappy hover:shadow-md"
                >
                  <div>
                    <div className="aspect-4/3 w-full bg-[#E6F4F1] overflow-hidden border-b border-[#D1EAE4]">
                      <SmartImage
                        src={doctor.photoUrl}
                        alt={doctor.name}
                        variant="doctor"
                        label={doctor.name}
                        sublabel={doctor.role}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="p-5">
                      {/* Unboxed metadata with middle dot separator */}
                      <div className="flex items-center gap-1.5 text-xs text-[#0D9488] font-semibold mb-1.5 tabular-nums">
                        <span>Стаж {doctor.experienceYears} лет</span>
                        <span aria-hidden="true">·</span>
                        <span>{doctor.operationsCount}</span>
                      </div>

                      <h3 className="text-base font-bold text-[#0F2922] mb-1">
                        {doctor.name}
                      </h3>
                      <p className="text-xs font-medium text-[#335249] mb-3">
                        {doctor.role}
                      </p>

                      <p className="text-[11px] text-[#335249] mb-3">
                        {doctor.education}
                      </p>

                      {/* Doctor Quote in subtle surface container (no thick left border) */}
                      <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-3.5 text-xs text-[#0F2922] leading-relaxed mb-4">
                        «{doctor.quote}»
                      </div>

                      <div className="text-[11px] text-[#335249]">
                        <span className="font-semibold text-[#0F2922]">Профиль: </span>
                        {doctor.specialties.join(' · ')}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() =>
                        openGeneralBooking({
                          doctorName: doctor.name,
                        })
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-[#E6F4F1] hover:bg-[#0D9488] text-[#0F2922] hover:text-white text-xs font-bold transition-snappy whitespace-nowrap cursor-pointer"
                    >
                      Записаться к врачу
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section (Claim-to-Proof Adjacency) */}
        <section
          id="reviews"
          className="py-16 lg:py-24 bg-[#F4FAF8] border-y border-[#D1EAE4]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-semibold text-[#0D9488] mb-2">
                  Реальные истории спасения и лечения · Рейтинг 4.9 на Яндекс Картах
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2922] tracking-tight">
                  Отзывы владельцев и истории пациентов
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openGeneralBooking()}
                className="py-3 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs sm:text-sm font-semibold transition-snappy whitespace-nowrap self-start md:self-auto cursor-pointer"
              >
                Записаться на консультацию
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS_DATA.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl bg-white border border-[#D1EAE4] p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Pet Avatar + Owner + Rating */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#D1EAE4] bg-[#E6F4F1] shrink-0">
                          <SmartImage
                            src={item.photoUrl}
                            alt={`${item.petName} — ${item.petBreed}`}
                            variant="pet"
                            label={item.petName}
                            sublabel={item.petBreed}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#0F2922]">
                            {item.ownerName}
                          </h3>
                          <div className="text-xs text-[#335249]">{item.ownerRole}</div>
                          <div className="text-xs font-semibold text-[#0D9488] mt-0.5">
                            Пациент: {item.petName} ({item.petBreed})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#0F2922] shrink-0 tabular-nums">
                        <div className="flex items-center text-[#F97316]" aria-hidden="true">
                          {[...Array(item.rating)].map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-1">5.0</span>
                      </div>
                    </div>

                    {/* Concrete Outcome Summary */}
                    <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] px-4 py-2.5 mb-4 text-xs font-semibold text-[#0F2922]">
                      Результат: {item.beforeAfterOutcome}
                    </div>

                    <p className="text-sm text-[#335249] leading-relaxed mb-5">
                      «{item.story}»
                    </p>
                  </div>

                  {/* Unboxed bottom metadata */}
                  <div className="pt-4 border-t border-[#D1EAE4] flex flex-wrap items-center gap-2 text-xs text-[#335249]">
                    <span className="font-medium text-[#0F2922]">{item.serviceUsed}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.visitDate}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section id="faq" className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4">
                <div className="text-xs font-semibold text-[#0D9488] mb-2">
                  Памятка заботливому владельцу
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tracking-tight mb-4">
                  Частые вопросы перед визитом в клинику
                </h2>
                <p className="text-sm text-[#335249] leading-relaxed mb-6">
                  Собрали подробные ответы наших врачей о подготовке к анализам, работе круглосуточного стационара и правилах выезда на дом.
                </p>

                <div className="rounded-2xl bg-[#F4FAF8] border border-[#D1EAE4] p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <HeartHandshake className="w-5 h-5 text-[#0D9488]" />
                    <h3 className="text-sm font-bold text-[#0F2922]">
                      Нужна консультация дежурного врача?
                    </h3>
                  </div>
                  <p className="text-xs text-[#335249] leading-relaxed mb-4">
                    Позвоните нам или оставьте заявку — подскажем, нужна ли голодная диета и как бережно довезти питомца.
                  </p>
                  <button
                    type="button"
                    onClick={() => openGeneralBooking()}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-snappy whitespace-nowrap cursor-pointer"
                  >
                    Задать вопрос и записаться
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-3">
                {FAQ_DATA.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-[#D1EAE4] bg-white overflow-hidden transition-snappy"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                        aria-expanded={isOpen}
                        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#F4FAF8] transition-snappy cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#0D9488] mb-1">
                            {faq.category}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-[#0F2922]">
                            {faq.question}
                          </div>
                        </div>
                        <div
                          className={`w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0 transition-transform duration-150 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pt-2 text-sm text-[#335249] leading-relaxed border-t border-[#D1EAE4] bg-[#F4FAF8]/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Contacts & Stylized Interactive Map Section */}
        <section
          id="contacts"
          className="py-16 lg:py-24 bg-[#F4FAF8] border-t border-[#D1EAE4]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Contact Details Card */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#D1EAE4] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#0D9488] mb-2">
                    Круглосуточный прием и парковка у входа
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tracking-tight mb-6">
                    Контакты и схема проезда
                  </h2>

                  <div className="space-y-5 text-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#335249]">Адрес клиники в Москве</div>
                        <div className="font-bold text-[#0F2922] mt-0.5">
                          {CLINIC_INFO.address}
                        </div>
                        <div className="text-xs text-[#335249] mt-0.5">
                          Отдельный вход с первого этажа, пандус и бесплатная парковка со шлагбаумом для пациентов
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#335249]">
                          Круглосуточный телефон и вызов на дом
                        </div>
                        <a
                          href={`tel:${CLINIC_INFO.phoneRaw}`}
                          className="text-lg font-extrabold text-[#0F2922] hover:text-[#0D9488] tabular-nums block mt-0.5"
                        >
                          {CLINIC_INFO.phoneDisplay}
                        </a>
                        <div className="text-xs text-[#335249]">
                          Дежурный администратор отвечает за 15 секунд
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#335249]">Режим работы</div>
                        <div className="font-bold text-[#0F2922] mt-0.5">
                          {CLINIC_INFO.schedule}
                        </div>
                        <div className="text-xs text-[#335249] mt-0.5">
                          Ночной прием без наценок по предварительной записи
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#D1EAE4] flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => openGeneralBooking()}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm transition-snappy whitespace-nowrap cursor-pointer"
                  >
                    Записаться на визит
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmergencyModalOpen(true)}
                    className="py-3.5 px-4 rounded-xl bg-[#E6F4F1] hover:bg-[#D1EAE4] text-[#0F2922] font-semibold text-xs sm:text-sm transition-snappy whitespace-nowrap cursor-pointer"
                  >
                    Вызвать врача на дом
                  </button>
                </div>
              </div>

              {/* Right Interactive Stylized Map Card */}
              <div className="lg:col-span-7 rounded-2xl bg-white border border-[#D1EAE4] p-6 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0F2922]">
                      Интерактивная карта маршрута (ЮЗАО, м. Новые Черёмушки)
                    </h3>
                    <p className="text-xs text-[#335249]">
                      Выберите способ прибытия, чтобы посмотреть ориентиры и подъезд
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 p-1 bg-[#F4FAF8] border border-[#D1EAE4] rounded-xl">
                    {(
                      [
                        { id: 'metro', label: 'Пешком от метро' },
                        { id: 'car', label: 'На автомобиле' },
                        { id: 'emergency', label: 'Вход в реанимацию' },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setMapRouteMode(mode.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-snappy whitespace-nowrap cursor-pointer ${
                          mapRouteMode === mode.id
                            ? 'bg-[#0D9488] text-white'
                            : 'text-[#335249] hover:text-[#0F2922]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stylized Vector Map of Profsoyuznaya St & Clinic */}
                <div className="relative rounded-xl overflow-hidden border border-[#D1EAE4] bg-[#E6F4F1] aspect-16/9 w-full">
                  <svg
                    viewBox="0 0 800 450"
                    className="w-full h-full object-cover"
                    role="img"
                    aria-label="Схема проезда к ветеринарной клинике Лапа Помощи на улице Профсоюзная, 45"
                  >
                    <rect width="800" height="450" fill="#E6F4F1" />
                    {/* Park zones & city blocks */}
                    <rect x="40" y="30" width="240" height="150" rx="16" fill="#D1EAE4" />
                    <rect x="340" y="30" width="420" height="140" rx="16" fill="#FFFFFF" fillOpacity="0.7" />
                    <rect x="40" y="250" width="230" height="160" rx="16" fill="#FFFFFF" fillOpacity="0.7" />
                    <rect x="350" y="250" width="410" height="160" rx="16" fill="#D1EAE4" />

                    {/* Roads: Profsoyuznaya Street & Garibaldi Street */}
                    <path d="M0 215 H800" stroke="#FFFFFF" strokeWidth="42" />
                    <path d="M310 0 V450" stroke="#FFFFFF" strokeWidth="36" />
                    <path
                      d="M0 215 H800"
                      stroke="#99C7BC"
                      strokeWidth="2"
                      strokeDasharray="10 10"
                    />
                    <text
                      x="540"
                      y="220"
                      fontFamily="Manrope, sans-serif"
                      fontSize="13"
                      fontWeight="700"
                      fill="#335249"
                    >
                      УЛ. ПРОФСОЮЗНАЯ
                    </text>

                    {/* Metro Station Marker (Novye Cheryomushki) */}
                    <g transform="translate(150, 215)">
                      <circle cx="0" cy="0" r="22" fill="#F97316" stroke="#FFFFFF" strokeWidth="4" />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fontFamily="Manrope, sans-serif"
                        fontSize="15"
                        fontWeight="800"
                        fill="#FFFFFF"
                      >
                        М
                      </text>
                      <rect
                        x="-85"
                        y="28"
                        width="170"
                        height="26"
                        rx="8"
                        fill="#0F2922"
                      />
                      <text
                        x="0"
                        y="45"
                        textAnchor="middle"
                        fontFamily="Manrope, sans-serif"
                        fontSize="11"
                        fontWeight="700"
                        fill="#FFFFFF"
                      >
                        м. Новые Черёмушки (Выход 2)
                      </text>
                    </g>

                    {/* Highlighted Route Path based on selected mode */}
                    {mapRouteMode === 'metro' && (
                      <path
                        d="M172 215 H310 V120 H470"
                        fill="none"
                        stroke="#0D9488"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="10 8"
                      />
                    )}
                    {mapRouteMode === 'car' && (
                      <path
                        d="M780 215 H520 V140"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    )}
                    {mapRouteMode === 'emergency' && (
                      <path
                        d="M310 430 V105 H470"
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Clinic Building Pin */}
                    <g transform="translate(510, 105)">
                      <rect
                        x="-95"
                        y="-45"
                        width="190"
                        height="90"
                        rx="18"
                        fill="#0D9488"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                      />
                      <text
                        x="0"
                        y="-12"
                        textAnchor="middle"
                        fontFamily="Manrope, sans-serif"
                        fontSize="15"
                        fontWeight="800"
                        fill="#FFFFFF"
                      >
                        «ЛАПА ПОМОЩИ» 24/7
                      </text>
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fontFamily="Manrope, sans-serif"
                        fontSize="12"
                        fontWeight="600"
                        fill="#E6F4F1"
                      >
                        ул. Профсоюзная, д. 45
                      </text>
                      <text
                        x="0"
                        y="28"
                        textAnchor="middle"
                        fontFamily="Manrope, sans-serif"
                        fontSize="11"
                        fontWeight="500"
                        fill="#FFFFFF"
                      >
                        Парковка P1 · Вход с 1 этажа
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Route Instructions Footer */}
                <div className="mt-4 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex items-center justify-between gap-4 text-xs text-[#0F2922]">
                  <div className="flex items-center gap-2.5">
                    <Navigation className="w-4 h-4 text-[#0D9488] shrink-0" />
                    <span>
                      {mapRouteMode === 'metro' &&
                        'Пешком 3 минуты (240 м): выход №2 из м. Новые Черёмушки, прямо вдоль ул. Профсоюзная до дома 45 с мятной вывеской «Лапа Помощи».'}
                      {mapRouteMode === 'car' &&
                        'На автомобиле: съезд с дублера ул. Профсоюзная к шлагбауму клиники. Позвоните за 2 минуты до приезда — администратор откроет бесплатную парковку у крыльца.'}
                      {mapRouteMode === 'emergency' &&
                        'Экстренный вход: отдельный боковой подъезд без ступенек со стороны двора прямо в приемно-реанимационное отделение (каталка у входа).'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Commercial Footer */}
      <footer className="bg-[#0F2922] text-white py-12 border-t border-[#1C453A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/15">
            <div className="md:col-span-2">
              <div className="text-xl font-extrabold tracking-tight text-white mb-2">
                Лапа Помощи
              </div>
              <p className="text-xs text-[#B8E1D8] max-w-md leading-relaxed mb-4">
                Круглосуточный ветеринарный центр полного цикла в Москве. Доказательная медицина, собственная экспресс-лаборатория, бережная хирургия и стационар 24/7.
              </p>
              <div className="text-xs text-[#B8E1D8] tabular-nums">
                {CLINIC_INFO.licenseNumber}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-white mb-3">Навигация по разделам</div>
              <ul className="space-y-2 text-xs text-[#B8E1D8]">
                <li>
                  <a href="#services" className="hover:text-white transition-snappy">
                    Услуги и цены
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-white transition-snappy">
                    Онлайн-калькулятор чек-апа
                  </a>
                </li>
                <li>
                  <a href="#doctors" className="hover:text-white transition-snappy">
                    Команда врачей
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-white transition-snappy">
                    Отзывы владельцев
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-snappy">
                    Вопросы и подготовка к приему
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-white mb-3">Круглосуточная связь</div>
              <div className="space-y-2 text-xs text-[#B8E1D8]">
                <div className="font-bold text-white text-sm tabular-nums">
                  {CLINIC_INFO.phoneDisplay}
                </div>
                <div>{CLINIC_INFO.address}</div>
                <div>Почта: {CLINIC_INFO.email}</div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openGeneralBooking()}
                    className="text-xs font-semibold text-[#F97316] hover:underline underline-offset-4 cursor-pointer"
                  >
                    Записаться онлайн
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={openSavedAppointments}
                    className="text-xs font-semibold text-[#B8E1D8] hover:text-white cursor-pointer tabular-nums"
                  >
                    Мои заявки ({userVisibleAppointments.length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8E1D8]">
            <div>
              © {new Date().getFullYear()} Ветеринарная клиника «Лапа Помощи» (Москва). Все права защищены.
            </div>
            <div>Прием ведется круглосуточно 24/7</div>
          </div>
        </div>
      </footer>

      {/* Global EmailJS Toast Notification */}
      {toastNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md rounded-2xl bg-[#0F2922] text-white border border-[#0D9488] shadow-2xl px-4 py-3.5 flex items-start gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="text-xs leading-relaxed flex-1">
            <div className="font-bold text-[#2DD4BF] mb-0.5">
              Почтовый сервис EmailJS
            </div>
            <div>{toastNotice}</div>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice('')}
            aria-label="Закрыть уведомление"
            className="text-[#B8E1D8] hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingBookingForAuth({ pending: false, prefill: null });
          setPendingSavedModalForAuth(false);
        }}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
        initialMode={authModalMode}
        authReasonMessage={
          pendingBookingForAuth.pending
            ? 'Для оформления записи на прием необходимо войти в аккаунт или зарегистрироваться. После входа форма записи откроется автоматически.'
            : pendingSavedModalForAuth
              ? 'Войдите в свой аккаунт или зарегистрируйтесь, чтобы просматривать свои личные записи на прием.'
              : undefined
        }
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        prefill={bookingPrefill}
        onBookingCreated={handleBookingCreated}
        servicesList={services}
        doctorsList={doctors}
        currentUser={currentUser}
        existingAppointments={appointments}
        onShowToast={showToastNotice}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onRequestEmergencyDispatch={() => {
          setEmergencyModalOpen(false);
          openGeneralBooking({
            serviceTitle: 'Экстренный выезд бригады на дом (за 30 минут)',
            isEmergency: true,
          });
        }}
      />

      <SavedAppointmentsModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        appointments={userVisibleAppointments}
        currentUser={currentUser}
        onCancelAppointment={handleCancelAppointment}
        onNewAppointment={() => openGeneralBooking()}
        onShowToast={showToastNotice}
      />
    </div>
  );
}
