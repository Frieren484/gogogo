export type ServiceCategory = 'all' | 'diagnostics' | 'treatment' | 'care';

export interface ServiceItem {
  id: string;
  number: string;
  category: Exclude<ServiceCategory, 'all'>;
  categoryLabel: string;
  title: string;
  duration: string;
  priceFrom: number;
  description: string;
  included: string[];
  featured?: boolean;
  defaultDoctorName?: string;
}

export type PetType = 'cat' | 'dog' | 'rodent';
export type PetAge = 'junior' | 'adult' | 'senior';

export interface CalculatorPackage {
  id: string;
  title: string;
  subtitle: string;
  basePrice: number;
  duration: string;
  includes: string[];
  defaultDoctorName: string;
}

export type DoctorShiftType = 'day' | 'night';
export type DoctorBrigade = 1 | 2;

export interface DoctorProfile {
  id: string;
  login?: string;
  name: string;
  role: string;
  experienceYears: number;
  operationsCount: string;
  education: string;
  quote: string;
  specialties: string[];
  photoUrl: string;
  fallbackTitle: string;
  accentColor: string;
  brigade: DoctorBrigade;
  shiftType: DoctorShiftType;
  shiftHours: string;
  personalSlots: string[];
  assignedDirections?: string[];
}

export type DoctorItem = DoctorProfile;

export const DUTY_DOCTOR_FALLBACK_SLOTS: string[] = [
  '10:00',
  '11:30',
  '13:00',
  '15:00',
  '17:00',
  '19:00',
  '21:00',
  '23:00',
];

export type DoctorSpecialStatusType =
  | 'sick'
  | 'vacation'
  | 'training'
  | 'replacement'
  | 'working'
  | 'off';

export interface DoctorStatusEvent {
  id: string;
  doctorName: string;
  startDate: string; // YYYY-MM-DD inclusive
  endDate: string; // YYYY-MM-DD inclusive
  type: DoctorSpecialStatusType;
  reasonLabel: string;
  replacementDoctorName?: string;
}

export interface ShiftScheduleConfig {
  anchorDate: string; // YYYY-MM-DD start of 2/2 cycle
  phaseOffset: 0 | 1 | 2 | 3; // allows shifting the 2/2 cycle or switching today's duty brigade
  rotationMode: '2x2' | '2_2' | 'daily'; // '2x2' / '2_2' = 2 days Brigade 1, 2 days Brigade 2; 'daily' = alternates every day
  cycleMode?: '2x2' | '2_2' | 'daily';
  dateBrigadeOverrides: Record<string, DoctorBrigade>; // explicit Admin override for specific YYYY-MM-DD dates
  manualOverrides?: Record<string, DoctorBrigade>;
  doctorStatusEvents?: DoctorStatusEvent[];
}

export function addDaysToIso(baseIso: string, offsetDays: number): string {
  const d = baseIso ? new Date(`${baseIso}T00:00:00`) : new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const BASE_ANCHOR_ISO = new Date().toISOString().split('T')[0];

export const DEFAULT_DOCTOR_STATUS_EVENTS: DoctorStatusEvent[] = [
  {
    id: 'ev-sick-smirnov-1',
    doctorName: 'Смирнов Алексей Викторович',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 2),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 5),
    type: 'sick',
    reasonLabel: 'Больничный лист (ОРВИ)',
    replacementDoctorName: 'Васильев Михаил Юрьевич',
  },
  {
    id: 'ev-training-pavlova-1',
    doctorName: 'Павлова Ирина Николаевна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 6),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 8),
    type: 'training',
    reasonLabel: 'Вет. конгресс эндокринологов ESVE',
    replacementDoctorName: 'Волкова Елена Сергеевна',
  },
  {
    id: 'ev-vacation-sokolova-1',
    doctorName: 'Соколова Анна Павловна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 10),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 16),
    type: 'vacation',
    reasonLabel: 'Плановый отпуск',
    replacementDoctorName: 'Новикова Ольга Дмитриевна',
  },
  {
    id: 'ev-sick-kuznetsov-1',
    doctorName: 'Кузнецов Артём Романович',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 18),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 21),
    type: 'sick',
    reasonLabel: 'Больничный лист',
    replacementDoctorName: 'Морозов Дмитрий Игоревич',
  },
  {
    id: 'ev-training-vasiliev-1',
    doctorName: 'Васильев Михаил Юрьевич',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 24),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 27),
    type: 'training',
    reasonLabel: 'Стажировка по ортопедии AOVET',
    replacementDoctorName: 'Смирнов Алексей Викторович',
  },
  {
    id: 'ev-vacation-morozov-1',
    doctorName: 'Морозов Дмитрий Игоревич',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 31),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 39),
    type: 'vacation',
    reasonLabel: 'Плановый отпуск',
    replacementDoctorName: 'Кузнецов Артём Романович',
  },
  {
    id: 'ev-sick-volkova-1',
    doctorName: 'Волкова Елена Сергеевна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 42),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 45),
    type: 'sick',
    reasonLabel: 'Больничный (ОРВИ)',
    replacementDoctorName: 'Павлова Ирина Николаевна',
  },
  {
    id: 'ev-training-novikova-1',
    doctorName: 'Новикова Ольга Дмитриевна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 49),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 52),
    type: 'training',
    reasonLabel: 'Симпозиум дерматологов ESVD',
    replacementDoctorName: 'Соколова Анна Павловна',
  },
  {
    id: 'ev-vacation-pavlova-2',
    doctorName: 'Павлова Ирина Николаевна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 56),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 65),
    type: 'vacation',
    reasonLabel: 'Плановый отпуск',
    replacementDoctorName: 'Волкова Елена Сергеевна',
  },
  {
    id: 'ev-training-smirnov-2',
    doctorName: 'Смирнов Алексей Викторович',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 69),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 72),
    type: 'training',
    reasonLabel: 'Конференция по эндохирургии',
    replacementDoctorName: 'Васильев Михаил Юрьевич',
  },
  {
    id: 'ev-sick-sokolova-2',
    doctorName: 'Соколова Анна Павловна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 76),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 79),
    type: 'sick',
    reasonLabel: 'Больничный лист',
    replacementDoctorName: 'Новикова Ольга Дмитриевна',
  },
  {
    id: 'ev-vacation-kuznetsov-2',
    doctorName: 'Кузнецов Артём Романович',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 83),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 91),
    type: 'vacation',
    reasonLabel: 'Плановый отпуск',
    replacementDoctorName: 'Морозов Дмитрий Игоревич',
  },
  {
    id: 'ev-sick-vasiliev-2',
    doctorName: 'Васильев Михаил Юрьевич',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 95),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 98),
    type: 'sick',
    reasonLabel: 'Больничный лист',
    replacementDoctorName: 'Смирнов Алексей Викторович',
  },
  {
    id: 'ev-vacation-volkova-2',
    doctorName: 'Волкова Елена Сергеевна',
    startDate: addDaysToIso(BASE_ANCHOR_ISO, 103),
    endDate: addDaysToIso(BASE_ANCHOR_ISO, 112),
    type: 'vacation',
    reasonLabel: 'Плановый отпуск',
    replacementDoctorName: 'Павлова Ирина Николаевна',
  },
];

export const DEFAULT_SHIFT_SCHEDULE_CONFIG: ShiftScheduleConfig = {
  anchorDate: BASE_ANCHOR_ISO,
  phaseOffset: 0,
  rotationMode: '2x2',
  cycleMode: '2x2',
  dateBrigadeOverrides: {},
  manualOverrides: {},
  doctorStatusEvents: DEFAULT_DOCTOR_STATUS_EVENTS,
};

export interface TestimonialItem {
  id: string;
  ownerName: string;
  ownerRole: string;
  petName: string;
  petBreed: string;
  serviceUsed: string;
  visitDate: string;
  rating: number;
  beforeAfterOutcome: string;
  story: string;
  photoUrl: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface EmergencySymptom {
  id: string;
  label: string;
  severity: 'critical' | 'urgent';
  firstAid: string;
}

export type AppointmentStatus = 'Новая' | 'Подтверждена' | 'Завершена' | 'Отменена';

export interface AppointmentRecord {
  id: string;
  createdAt: string;
  ownerName: string;
  phone: string;
  petSpecies: string;
  petName: string;
  serviceTitle: string;
  doctorName: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  estimatedPrice: number;
  isEmergency?: boolean;
  isAdvanceBooking?: boolean;
  isOffShiftBooking?: boolean;
  status: string;
  notes?: string;
  ownerUid?: string;
  doctorRecommendation?: string;
}

export const CLINIC_INFO = {
  name: 'Лапа Помощи',
  city: 'Москва',
  address: 'ул. Профсоюзная, д. 45 (3 мин. от м. Новые Черёмушки)',
  phoneDisplay: '+7 (495) 128-24-07',
  phoneRaw: '+74951282407',
  emergencyDispatchMinutes: 30,
  schedule: 'Круглосуточно 24/7, без выходных',
  licenseNumber: 'Лицензия Департамента ветеринарии № ЛО-77-01-021849',
  heroPhotoUrl: '/images/clinic/hero-clinic.jpg',
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'therapy',
    number: '01',
    category: 'treatment',
    categoryLabel: 'Лечение',
    title: 'Терапия и первичный клинический прием',
    duration: '45 мин',
    priceFrom: 1800,
    description:
      'Развернутый осмотр терапевта по протоколу Fear Free без стресса для животного: аускультация сердца и легких, термометрия, пальпация, отоскопия и составление персонального плана терапии.',
    included: [
      'Осмотр и сбор анамнеза',
      'Оценка веса, слизистых и лимфоузлов',
      'Назначение схемы лечения без лишних препаратов',
    ],
    featured: true,
    defaultDoctorName: 'Волкова Елена Сергеевна',
  },
  {
    id: 'ultrasound-lab',
    number: '02',
    category: 'diagnostics',
    categoryLabel: 'Диагностика',
    title: 'УЗИ экспертного класса и экспресс-анализы',
    duration: '30 мин',
    priceFrom: 2400,
    description:
      'Ультразвуковое исследование брюшной полости на аппарате Mindray Vetus 8 и собственная лаборатория IDEXX: общий и биохимический анализ крови готовы уже через 15 минут во время приема.',
    included: [
      'УЗИ на датчиках высокого разрешения',
      'Клинический и биохимический профиль крови',
      'Печатный протокол с расшифровкой врача',
    ],
    featured: true,
    defaultDoctorName: 'Морозов Дмитрий Игоревич',
  },
  {
    id: 'surgery',
    number: '03',
    category: 'treatment',
    categoryLabel: 'Лечение',
    title: 'Эндоскопическая хирургия и ортопедия',
    duration: '90 мин',
    priceFrom: 6500,
    description:
      'Плановые и экстренные операции любой сложности с газовым наркозом Севофлуран и кардиомониторингом анестезиолога. Лапароскопическая стерилизация через прокол 5 мм с быстрым восстановлением.',
    included: [
      'Газовая анестезия и контроль ИВЛ',
      'Внутрикожные косметические швы без попон',
      'Пробуждение в теплом кислородном боксе',
    ],
    defaultDoctorName: 'Смирнов Алексей Викторович',
  },
  {
    id: 'vaccination',
    number: '04',
    category: 'care',
    categoryLabel: 'Уход',
    title: 'Комплексная вакцинация и чипирование',
    duration: '25 мин',
    priceFrom: 2200,
    description:
      'Иммунопрофилактика сертифицированными вакцинами (Эурикан, Нобивак, Пуревакс, Биофел) с предварительным клиническим осмотром, регистрацией в международной базе Animal-ID и выдачей ветпаспорта.',
    included: [
      'Предвакцинальный осмотр и термометрия',
      'Введение вакцины с контролем переносимости',
      'Оформление международного паспорта и чипа',
    ],
    defaultDoctorName: 'Павлова Ирина Николаевна',
  },
  {
    id: 'dentistry',
    number: '05',
    category: 'treatment',
    categoryLabel: 'Лечение',
    title: 'Ультразвуковая стоматология и санация',
    duration: '60 мин',
    priceFrom: 4200,
    description:
      'Бережное снятие зубного камня ультразвуковым скалером, полировка эмали фторсодержащими пастами, дентальный рентген корней и атравматичное удаление поврежденных зубов у кошек, собак и коррекция резцов у грызунов.',
    included: [
      'Ультразвуковая чистка всех поверхностей',
      'Шлифовка и реминерализация эмали',
      'Рекомендации по домашней гигиене полости рта',
    ],
    defaultDoctorName: 'Соколова Анна Павловна',
  },
  {
    id: 'cardiology',
    number: '06',
    category: 'diagnostics',
    categoryLabel: 'Диагностика',
    title: 'Кардиологический скрининг (ЭхоКГ + ЭКГ)',
    duration: '40 мин',
    priceFrom: 3100,
    description:
      'Обязательное обследование перед наркозом и для пород группы риска (мейн-куны, британские кошки, доберманы, корги, кавалер-кинг-чарльз-спаниели). Допплерография клапанов и измерение давления.',
    included: [
      'Эхокардиография с цветным допплером',
      'Шестиканальная ЭКГ и тонометрия',
      'Допуск к анестезии и расчет рисков',
    ],
    defaultDoctorName: 'Волкова Елена Сергеевна',
  },
  {
    id: 'grooming',
    number: '07',
    category: 'care',
    categoryLabel: 'Уход',
    title: 'Бережный медицинский груминг и гигиена',
    duration: '75 мин',
    priceFrom: 2600,
    description:
      'Гигиенический комплекс без фиксации и седативных средств: экспресс-линька, мытье гипоаллергенной дерматологической косметикой, стрижка когтей, чистка ушей и параанальных желез под контролем дерматолога.',
    included: [
      'Гипоаллергенное купание и сушка',
      'Стрижка когтей, обработка ушей и глаз',
      'Вычесывание подшерстка и бережная стрижка',
    ],
    defaultDoctorName: 'Новикова Ольга Дмитриевна',
  },
  {
    id: 'icu',
    number: '08',
    category: 'treatment',
    categoryLabel: 'Лечение',
    title: 'Интенсивный стационар и оксигенотерапия 24/7',
    duration: '24 часа',
    priceFrom: 4800,
    description:
      'Раздельные стационары для кошек, собак и мелких грызунов с индивидуальным микроклиматом, инфузоматами для точного введения препаратов, круглосуточным постом врача-реаниматолога и фотоотчетами владельцу.',
    included: [
      'Индивидуальный бокс с подогревом и кислородом',
      'Инфузионная терапия и контроль показателей каждые 2 ч',
      'Видео- и фотоотчеты владельцу в мессенджер',
    ],
    defaultDoctorName: 'Кузнецов Артём Романович',
  },
];

export const PET_TYPES_CONFIG: Record<
  PetType,
  { label: string; subtitle: string; multiplier: number }
> = {
  cat: {
    label: 'Кошка',
    subtitle: 'Все породы и метисы',
    multiplier: 1.0,
  },
  dog: {
    label: 'Собака',
    subtitle: 'От мелких до крупных пород',
    multiplier: 1.25,
  },
  rodent: {
    label: 'Грызун',
    subtitle: 'Кролик, свинка, шиншилла, хомяк',
    multiplier: 0.85,
  },
};

export const PET_AGE_CONFIG: Record<
  PetAge,
  { label: string; subtitle: string; multiplier: number; recommendation: string }
> = {
  junior: {
    label: 'До 1 года',
    subtitle: 'Котята, щенки, молодые зверьки',
    multiplier: 0.9,
    recommendation:
      'Фокус на графике первичных прививок, контроле роста и обработке от паразитов.',
  },
  adult: {
    label: '1–7 лет',
    subtitle: 'Активный взрослый возраст',
    multiplier: 1.0,
    recommendation:
      'Оптимален ежегодный профилактический скрининг крови и УЗИ для раннего выявления скрытых патологий.',
  },
  senior: {
    label: 'Старше 7 лет',
    subtitle: 'Почтенный возраст (гериатрия)',
    multiplier: 1.2,
    recommendation:
      'Включает расширенный почечный и кардиологический контроль, тонометрию и оценку суставов.',
  },
};

export const CALCULATOR_PACKAGES: CalculatorPackage[] = [
  {
    id: 'checkup',
    title: 'Ежегодный комплексный чек-ап «Здоровый питомец»',
    subtitle: 'Полная проверка организма за 1 визит (экономия 25% от прайса)',
    basePrice: 4400,
    duration: '60 минут',
    defaultDoctorName: 'Волкова Елена Сергеевна',
    includes: [
      'Прием ведущего терапевта (или ратолога для грызунов)',
      'Обзорное УЗИ органов брюшной полости',
      'Общий клинический и биохимический анализ крови (14 показателей)',
      'Измерение артериального давления и письменное заключение',
    ],
  },
  {
    id: 'vaccination',
    title: 'Ежегодная вакцинация «Под ключ» с паспортом',
    subtitle: 'Импортная/сертифицированная вакцина + осмотр врача',
    basePrice: 2500,
    duration: '30 минут',
    defaultDoctorName: 'Павлова Ирина Николаевна',
    includes: [
      'Полный клинический осмотр и термометрия перед прививкой',
      'Комплексная вакцина против вирусных инфекций и бешенства',
      'Штамп в международный ветпаспорт и внесение в базу клиники',
    ],
  },
  {
    id: 'preop',
    title: 'Предоперационный кардио- и лабораторный скрининг',
    subtitle: 'Безопасный допуск к анестезии, стерилизации или чистке зубов',
    basePrice: 3800,
    duration: '45 минут',
    defaultDoctorName: 'Кузнецов Артём Романович',
    includes: [
      'Консультация анестезиолога и оценка степени риска ASA',
      'Эхокардиография сердца (ЭхоКГ) на аппарате экспертного класса',
      'Предоперационный профиль крови и коагулограмма за 15 минут',
    ],
  },
  {
    id: 'dental',
    title: 'Стоматологическая санация и защита эмали',
    subtitle: 'Ультразвуковая чистка или коррекция дентальной аркады',
    basePrice: 4600,
    duration: '60 минут',
    defaultDoctorName: 'Соколова Анна Павловна',
    includes: [
      'Осмотр стоматолога и оценка состояния десен и прикуса',
      'Бережное снятие налета и зубного камня (для грызунов — коррекция резцов/щечных зубов)',
      'Полировка эмали и антисептическая обработка десневых карманов',
    ],
  },
  {
    id: 'grooming',
    title: 'Медицинский гигиенический груминг-комплекс',
    subtitle: 'Деликатный уход без стресса под контролем дерматолога',
    basePrice: 2800,
    duration: '75 минут',
    defaultDoctorName: 'Новикова Ольга Дмитриевна',
    includes: [
      'Осмотр кожи и шерсти дерматологом перед процедурой',
      'Бережное вычесывание, гигиена ушей, глаз и аккуратная стрижка когтей',
      'Купание с профессиональной гипоаллергенной косметикой (для кошек и собак)',
    ],
  },
];

export const DOCTORS_DATA: DoctorProfile[] = [
  // БРИГАДА №1 (2 врача дневной смены 10:00–20:00, 2 врача ночной смены 20:00–10:00)
  {
    id: 'smirnov',
    login: 'smirnov',
    name: 'Смирнов Алексей Викторович',
    role: 'Главный врач, хирург-ортопед, эндоскопист',
    experienceYears: 14,
    operationsCount: '3 400+ операций',
    education: 'МГАВМиБ им. К. И. Скрябина, стажировка в Ветеринарном центре Цюриха',
    quote:
      'В нашей операционной действуют те же стандарты стерильности и анестезиологического мониторинга, что и в лучших гуманных клиниках. Мы боремся за качество жизни каждого пациента.',
    specialties: ['Остеосинтез и TPLO', 'Лапароскопия', 'Торакальная хирургия'],
    photoUrl: '/images/doctors/smirnov.jpg',
    fallbackTitle: 'А. В. Смирнов · Главврач, хирург',
    accentColor: '#0D9488',
    brigade: 1,
    shiftType: 'day',
    shiftHours: '10:00–20:00',
    personalSlots: ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],
    assignedDirections: ['Эндоскопическая хирургия и ортопедия'],
  },
  {
    id: 'volkova',
    login: 'volkova',
    name: 'Волкова Елена Сергеевна',
    role: 'Ведущий терапевт, ветеринарный кардиолог',
    experienceYears: 11,
    operationsCount: '6 800+ пациентов',
    education: 'СПбГУВМ, член Кардиологического ветеринарного общества',
    quote:
      'Животные не могут сказать, где именно болит, но их сердце, дыхание и анализы рассказывают всё. Моя задача — поставить точный диагноз без лишних назначений и стресса.',
    specialties: ['ЭхоКГ и Холтер', 'Доказательная терапия', 'Ведение пожилых животных'],
    photoUrl: '/images/doctors/volkova.jpg',
    fallbackTitle: 'Е. С. Волкова · Кардиолог, терапевт',
    accentColor: '#0F766E',
    brigade: 1,
    shiftType: 'day',
    shiftHours: '10:00–20:00',
    personalSlots: ['10:00', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30'],
    assignedDirections: [
      'Терапия и первичный клинический прием',
      'Кардиологический скрининг (ЭхоКГ + ЭКГ)',
      'Комплексный чек-ап «Здоровый питомец»',
    ],
  },
  {
    id: 'morozov',
    login: 'morozov',
    name: 'Морозов Дмитрий Игоревич',
    role: 'Врач УЗ-диагностики, реаниматолог-анестезиолог',
    experienceYears: 9,
    operationsCount: '5 100+ УЗИ-исследований',
    education: 'РГАУ-МСХА им. К. А. Тимирязева, школа вет. анестезиологии VASTA',
    quote:
      'В экстренной ситуации решают первые 20 минут. Поэтому наша лаборатория и УЗИ работают круглосуточно — мы ставим диагноз прямо у порога реанимационного зала.',
    specialties: ['FAST-протокол УЗИ', 'Интенсивная терапия', 'Ингаляционный наркоз'],
    photoUrl: '/images/doctors/morozov.jpg',
    fallbackTitle: 'Д. И. Морозов · УЗИ и реанимация',
    accentColor: '#115E59',
    brigade: 1,
    shiftType: 'night',
    shiftHours: '20:00–10:00',
    personalSlots: ['20:00', '21:30', '23:00', '01:00', '03:00', '05:00', '07:00', '08:30'],
    assignedDirections: ['УЗИ экспертного класса и экспресс-анализы', 'Экстренный триаж 24/7'],
  },
  {
    id: 'sokolova',
    login: 'sokolova',
    name: 'Соколова Анна Павловна',
    role: 'Врач-ратолог (специалист по грызунам), стоматолог',
    experienceYears: 8,
    operationsCount: '2 900+ мелких пациентов',
    education:
      'МГАВМиБ им. К. И. Скрябина, узкая специализация по медицине грызунов и зайцеобразных',
    quote:
      'Кролики, морские свинки и шиншиллы требуют совершенно иной фармакологии и ювелирной стоматологии. У нас для них оборудован отдельный тихий кабинет без запаха хищников.',
    specialties: ['Медицина кроликов и грызунов', 'Дентальная коррекция', 'Микрохирургия'],
    photoUrl: '/images/doctors/sokolova.jpg',
    fallbackTitle: 'А. П. Соколова · Ратолог, стоматолог',
    accentColor: '#0D9488',
    brigade: 1,
    shiftType: 'night',
    shiftHours: '20:00–10:00',
    personalSlots: ['20:00', '21:00', '22:30', '00:00', '02:00', '04:00', '06:30', '08:30'],
    assignedDirections: [
      'Ультразвуковая стоматология и санация',
      'Стоматологическая санация и защита эмали',
    ],
  },

  // БРИГАДА №2 (4 новых специалиста: 2 врача дневной смены 10:00–20:00, 2 врача ночной смены 20:00–10:00)
  {
    id: 'vasiliev',
    login: 'vasiliev',
    name: 'Васильев Михаил Юрьевич',
    role: 'Ведущий хирург-травматолог, нейрохирург',
    experienceYears: 12,
    operationsCount: '2 850+ операций',
    education: 'МГАВМиБ им. К. И. Скрябина, стажировка по ортопедии AOVET (Германия)',
    quote:
      'Современная травматология позволяет поднять на лапы пациента даже после сложнейших переломов. Мы используем титановые пластины и малоинвазивный остеосинтез.',
    specialties: ['Остеосинтез AOVET', 'Нейрохирургия позвоночника', 'Артроскопия суставов'],
    photoUrl: '/images/doctors/vasiliev.jpg',
    fallbackTitle: 'М. Ю. Васильев · Травматолог, хирург',
    accentColor: '#0D9488',
    brigade: 2,
    shiftType: 'day',
    shiftHours: '10:00–20:00',
    personalSlots: ['10:00', '11:30', '13:00', '15:00', '16:30', '18:00', '19:15'],
    assignedDirections: ['Травматология и ортопедия'],
  },
  {
    id: 'pavlova',
    login: 'pavlova',
    name: 'Павлова Ирина Николаевна',
    role: 'Врач-терапевт, эндокринолог, иммунолог',
    experienceYears: 10,
    operationsCount: '5 400+ приемов',
    education: 'СПбГУВМ, Европейская школа ветеринарной эндокринологии ESVE',
    quote:
      'Грамотная вакцинация и ранняя диагностика гормональных нарушений продлевают активную жизнь питомца на годы. Главное — индивидуальный подход к каждой породе.',
    specialties: ['Вакцинопрофилактика', 'Эндокринология и диабет', 'Гастроэнтерология'],
    photoUrl: '/images/doctors/pavlova.jpg',
    fallbackTitle: 'И. Н. Павлова · Терапевт, эндокринолог',
    accentColor: '#0F766E',
    brigade: 2,
    shiftType: 'day',
    shiftHours: '10:00–20:00',
    personalSlots: ['10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:00'],
    assignedDirections: [
      'Комплексная вакцинация и чипирование',
      'Ежегодная вакцинация «Под ключ» с паспортом',
    ],
  },
  {
    id: 'kuznetsov',
    login: 'kuznetsov',
    name: 'Кузнецов Артём Романович',
    role: 'Заведующий ОРИТ, анестезиолог-реаниматолог',
    experienceYears: 9,
    operationsCount: '4 200+ анестезий и реанимаций',
    education: 'РГАУ-МСХА им. К. А. Тимирязева, сертификация RECOVER по сердечно-легочной реанимации',
    quote:
      'Ночной стационар и реанимация — это место, где мониторинг не прекращается ни на секунду. Мы контролируем дыхание, давление и боль у каждого тяжелого пациента 24/7.',
    specialties: ['Круглосуточный стационар ОРИТ', 'Оксигенотерапия', 'Кардиоанестезия'],
    photoUrl: '/images/doctors/kuznetsov.jpg',
    fallbackTitle: 'А. Р. Кузнецов · Реаниматолог ОРИТ',
    accentColor: '#115E59',
    brigade: 2,
    shiftType: 'night',
    shiftHours: '20:00–10:00',
    personalSlots: ['20:00', '21:30', '23:00', '00:30', '02:30', '04:30', '06:30', '08:30'],
    assignedDirections: [
      'Интенсивный стационар и оксигенотерапия 24/7',
      'Предоперационный кардио- и лабораторный скрининг',
    ],
  },
  {
    id: 'novikova',
    login: 'novikova',
    name: 'Новикова Ольга Дмитриевна',
    role: 'Врач-дерматолог, аллерголог, специалист по уходу',
    experienceYears: 7,
    operationsCount: '3 100+ дерматологических пациентов',
    education: 'МГАВМиБ им. К. И. Скрябина, член Европейского общества вет. дерматологии ESVD',
    quote:
      'Здоровая кожа и шерсть — зеркало иммунитета. Мы проводим цитологию прямо на приеме и подбираем бережный медицинский уход без гормонов там, где можно обойтись деликатной терапией.',
    specialties: ['Цитология кожи и отиты', 'Аллергология', 'Медицинский груминг без стресса'],
    photoUrl: '/images/doctors/novikova.jpg',
    fallbackTitle: 'О. Д. Новикова · Дерматолог, аллерголог',
    accentColor: '#0D9488',
    brigade: 2,
    shiftType: 'night',
    shiftHours: '20:00–10:00',
    personalSlots: ['20:30', '22:00', '23:30', '01:30', '03:30', '05:30', '07:30', '09:00'],
    assignedDirections: [
      'Бережный медицинский груминг и гигиена',
      'Медицинский гигиенический груминг-комплекс',
    ],
  },
];

/**
 * Вычисляет разницу в календарных днях между двумя датами YYYY-MM-DD
 */
export function diffDaysBetweenDates(anchorDateStr: string, targetDateStr: string): number {
  const [ay, am, ad] = anchorDateStr.split('-').map(Number);
  const [ty, tm, td] = targetDateStr.split('-').map(Number);
  if (!ay || !am || !ad || !ty || !tm || !td) return 0;
  const utcAnchor = Date.UTC(ay, am - 1, ad);
  const utcTarget = Date.UTC(ty, tm - 1, td);
  return Math.round((utcTarget - utcAnchor) / 86400000);
}

/**
 * Определяет, какая дежурная бригада (1 или 2) работает в указанную дату YYYY-MM-DD.
 * По умолчанию используется график 2 через 2 (2 дня Бригада №1, 2 дня Бригада №2),
 * либо посуточное чередование, плюс учитываются ручные переопределения администратора.
 */
export function getDutyBrigadeForDate(
  dateStr: string,
  config: ShiftScheduleConfig = DEFAULT_SHIFT_SCHEDULE_CONFIG
): DoctorBrigade {
  if (!dateStr) return 1;
  const override =
    config.dateBrigadeOverrides?.[dateStr] ?? config.manualOverrides?.[dateStr];
  if (override === 1 || override === 2) {
    return override;
  }

  const diff = diffDaysBetweenDates(config.anchorDate || '2026-10-26', dateStr);
  const mode = config.cycleMode || config.rotationMode || '2x2';
  if (mode === 'daily') {
    const mod2 = (((diff + (config.phaseOffset || 0)) % 2) + 2) % 2;
    return mod2 === 0 ? 1 : 2;
  }

  // Стандартный график 2 через 2: дни 0, 1 -> Бригада 1; дни 2, 3 -> Бригада 2
  const mod4 = (((diff + (config.phaseOffset || 0)) % 4) + 4) % 4;
  return mod4 < 2 ? 1 : 2;
}

/**
 * Возвращает актуальный список событий (больничные, отпуска, обучение, подмены)
 */
export function getActiveDoctorStatusEvents(
  config: ShiftScheduleConfig = DEFAULT_SHIFT_SCHEDULE_CONFIG
): DoctorStatusEvent[] {
  if (Array.isArray(config.doctorStatusEvents)) {
    return config.doctorStatusEvents;
  }
  return DEFAULT_DOCTOR_STATUS_EVENTS;
}

export type DoctorCellShiftState =
  | 'working'
  | 'replacement'
  | 'off'
  | 'sick'
  | 'vacation'
  | 'training';

/**
 * Возвращает статус смены конкретного врача на выбранную дату YYYY-MM-DD с учетом:
 * - графика 2/2 (дневная 10:00–20:00 или ночная 20:00–10:00)
 * - больничных листов (sick), отпусков (vacation), конференций/обучения (training)
 * - автоматического выхода на замену (replacement) за заболевшего или отсутствующего коллегу из другой бригады
 */
export function getDoctorShiftForDate(
  doctor: DoctorProfile | undefined,
  dateStr: string,
  config: ShiftScheduleConfig = DEFAULT_SHIFT_SCHEDULE_CONFIG
): {
  isWorkingOnDate: boolean;
  isWorking: boolean;
  isWorkingToday: boolean;
  isAbsent: boolean;
  isReplacement: boolean;
  cellState: DoctorCellShiftState;
  specialReason?: string;
  replacementDoctorName?: string;
  replacingForDoctorName?: string;
  statusText: string;
  dutyBrigade: DoctorBrigade;
  doctorBrigade: DoctorBrigade;
  shiftType: DoctorShiftType;
  shiftHours: string;
  personalSlots: string[];
} {
  const dutyBrigade = getDutyBrigadeForDate(dateStr, config);
  if (!doctor) {
    return {
      isWorkingOnDate: true,
      isWorking: true,
      isWorkingToday: true,
      isAbsent: false,
      isReplacement: false,
      cellState: 'working',
      statusText: `Дежурит Бригада №${dutyBrigade} (круглосуточно 10:00–20:00 и 20:00–10:00)`,
      dutyBrigade,
      doctorBrigade: dutyBrigade,
      shiftType: 'day',
      shiftHours: '10:00–20:00 / 20:00–10:00',
      personalSlots: DUTY_DOCTOR_FALLBACK_SLOTS,
    };
  }

  const docBrigade: DoctorBrigade = doctor.brigade === 2 ? 2 : 1;
  const shiftType: DoctorShiftType = doctor.shiftType === 'night' ? 'night' : 'day';
  const shiftHours =
    doctor.shiftHours || (shiftType === 'day' ? '10:00–20:00' : '20:00–10:00');
  const personalSlots =
    Array.isArray(doctor.personalSlots) && doctor.personalSlots.length > 0
      ? doctor.personalSlots
      : shiftType === 'day'
      ? ['10:00', '11:30', '13:00', '15:00', '16:30', '18:00', '19:00']
      : ['20:00', '21:30', '23:00', '01:00', '03:00', '06:00', '08:30'];

  const events = getActiveDoctorStatusEvents(config);

  // 1. Проверяем личное событие врача (больничный, отпуск, обучение, ручная замена или отгул)
  const ownEvent = events.find(
    (ev) =>
      ev.doctorName === doctor.name &&
      dateStr >= ev.startDate &&
      dateStr <= ev.endDate
  );

  if (ownEvent) {
    if (
      ownEvent.type === 'sick' ||
      ownEvent.type === 'vacation' ||
      ownEvent.type === 'training'
    ) {
      const prefix =
        ownEvent.type === 'sick'
          ? 'Больничный'
          : ownEvent.type === 'vacation'
          ? 'В отпуске'
          : 'На обучении';
      const repInfo = ownEvent.replacementDoctorName
        ? ` · На смене заменяет: ${ownEvent.replacementDoctorName}`
        : '';
      return {
        isWorkingOnDate: false,
        isWorking: false,
        isWorkingToday: false,
        isAbsent: true,
        isReplacement: false,
        cellState: ownEvent.type,
        specialReason: ownEvent.reasonLabel,
        replacementDoctorName: ownEvent.replacementDoctorName,
        statusText: `${prefix} (${ownEvent.reasonLabel})${repInfo}`,
        dutyBrigade,
        doctorBrigade: docBrigade,
        shiftType,
        shiftHours,
        personalSlots,
      };
    }

    if (ownEvent.type === 'replacement' || ownEvent.type === 'working') {
      return {
        isWorkingOnDate: true,
        isWorking: true,
        isWorkingToday: true,
        isAbsent: false,
        isReplacement: true,
        cellState: 'replacement',
        specialReason: ownEvent.reasonLabel || 'Выход на замену',
        statusText: `На смене по замене (${shiftHours}) · ${ownEvent.reasonLabel}`,
        dutyBrigade,
        doctorBrigade: docBrigade,
        shiftType,
        shiftHours,
        personalSlots,
      };
    }

    if (ownEvent.type === 'off') {
      return {
        isWorkingOnDate: false,
        isWorking: false,
        isWorkingToday: false,
        isAbsent: false,
        isReplacement: false,
        cellState: 'off',
        specialReason: ownEvent.reasonLabel || 'Отгул',
        statusText: `Выходной / отгул (${ownEvent.reasonLabel}) · запись по предварительной брони`,
        dutyBrigade,
        doctorBrigade: docBrigade,
        shiftType,
        shiftHours,
        personalSlots,
      };
    }
  }

  // 2. Проверяем, не выходит ли этот врач сегодня на замену за заболевшего/отсутствующего коллегу из дежурной бригады
  const isNormallyWorking = docBrigade === dutyBrigade;
  if (!isNormallyWorking) {
    const coveredColleagueEvent = events.find(
      (ev) =>
        (ev.type === 'sick' || ev.type === 'vacation' || ev.type === 'training') &&
        ev.replacementDoctorName === doctor.name &&
        dateStr >= ev.startDate &&
        dateStr <= ev.endDate
    );

    if (coveredColleagueEvent) {
      const colleagueSurname = coveredColleagueEvent.doctorName.split(' ')[0];
      return {
        isWorkingOnDate: true,
        isWorking: true,
        isWorkingToday: true,
        isAbsent: false,
        isReplacement: true,
        cellState: 'replacement',
        specialReason: `Подмена за врача ${colleagueSurname} (${coveredColleagueEvent.reasonLabel})`,
        replacingForDoctorName: coveredColleagueEvent.doctorName,
        statusText: `Вышел на замену (${shiftHours}) вместо врача ${coveredColleagueEvent.doctorName}`,
        dutyBrigade,
        doctorBrigade: docBrigade,
        shiftType,
        shiftHours,
        personalSlots,
      };
    }
  }

  const statusText = isNormallyWorking
    ? `На смене (${shiftType === 'night' ? 'ночная' : 'дневная'} ${shiftHours})`
    : `Выходной по графику 2/2 · запись по предварительной брони (${shiftHours})`;

  return {
    isWorkingOnDate: isNormallyWorking,
    isWorking: isNormallyWorking,
    isWorkingToday: isNormallyWorking,
    isAbsent: false,
    isReplacement: false,
    cellState: isNormallyWorking ? 'working' : 'off',
    statusText,
    dutyBrigade,
    doctorBrigade: docBrigade,
    shiftType,
    shiftHours,
    personalSlots,
  };
}

/**
 * Возвращает список ближайших рабочих дат (YYYY-MM-DD) для выбранного врача по графику 2/2
 * (пропуская дни больничного, отпуска и обучения, но включая дни подмены)
 */
export function getNextWorkingDatesForDoctor(
  doctor: DoctorProfile | undefined,
  fromDateStr: string,
  count = 4,
  config: ShiftScheduleConfig = DEFAULT_SHIFT_SCHEDULE_CONFIG
): string[] {
  const result: string[] = [];
  const baseDate = fromDateStr ? new Date(`${fromDateStr}T00:00:00`) : new Date();
  for (let i = 0; i < 45 && result.length < count; i++) {
    const d = new Date(baseDate.getTime() + i * 86400000);
    const iso = d.toISOString().split('T')[0];
    const status = getDoctorShiftForDate(doctor, iso, config);
    if (status.isWorkingOnDate && !status.isAbsent) {
      result.push(iso);
    }
  }
  return result;
}

/**
 * Определяет закрепленного профильного врача для выбранной услуги или программы чек-апа
 */
export function resolveDefaultDoctorForService(
  serviceTitle: string,
  servicesList: ServiceItem[] = SERVICES_DATA,
  doctorsList: DoctorProfile[] = DOCTORS_DATA
): string {
  const clean = (serviceTitle || '').trim().toLowerCase();
  if (!clean) return doctorsList[0]?.name || 'Волкова Елена Сергеевна';

  // 1. Точное или частичное совпадение с услугой из прайс-листа
  const matchedService =
    servicesList.find((s) => s.title.trim().toLowerCase() === clean) ||
    servicesList.find(
      (s) =>
        clean.includes(s.title.trim().toLowerCase()) ||
        s.title.trim().toLowerCase().includes(clean)
    );

  if (matchedService?.defaultDoctorName) {
    const exists = doctorsList.some((d) => d.name === matchedService.defaultDoctorName);
    if (exists) return matchedService.defaultDoctorName;
  }

  // 2. Совпадение с комплексной программой калькулятора
  const matchedPkg = CALCULATOR_PACKAGES.find(
    (p) =>
      clean === p.title.toLowerCase() ||
      clean.startsWith(p.title.toLowerCase()) ||
      clean.includes(p.title.toLowerCase())
  );
  if (matchedPkg?.defaultDoctorName) {
    const exists = doctorsList.some((d) => d.name === matchedPkg.defaultDoctorName);
    if (exists) return matchedPkg.defaultDoctorName;
  }

  // 3. Экстренный выезд
  if (clean.includes('экстренн') || clean.includes('триаж')) {
    return 'Морозов Дмитрий Игоревич';
  }

  return doctorsList[0]?.name || 'Волкова Елена Сергеевна';
}

export type ReviewSpeciesFilter = 'all' | 'dogs' | 'cats' | 'exotic';

export function getReviewSpeciesCategory(
  review: TestimonialItem
): Exclude<ReviewSpeciesFilter, 'all'> {
  const text = `${review.petBreed} ${review.petName} ${review.serviceUsed} ${review.story}`.toLowerCase();

  if (
    text.includes('кролик') ||
    text.includes('свинк') ||
    text.includes('шиншилл') ||
    text.includes('хомяк') ||
    text.includes('крыс') ||
    text.includes('дегу') ||
    text.includes('грызун') ||
    text.includes('ратолог') ||
    text.includes('экзот') ||
    text.includes('хорек') ||
    text.includes('птиц') ||
    text.includes('попуга')
  ) {
    return 'exotic';
  }

  if (
    text.includes('кот') ||
    text.includes('кошк') ||
    text.includes('мейн-кун') ||
    text.includes('вислоух') ||
    text.includes('бенгал') ||
    text.includes('абиссин') ||
    text.includes('сфинкс') ||
    text.includes('британ') ||
    text.includes('котенок')
  ) {
    return 'cats';
  }

  return 'dogs';
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 't1',
    ownerName: 'Марина Ковалева',
    ownerRole: 'Архитектор, район Черемушки (Москва)',
    petName: 'Ричард',
    petBreed: 'Золотистый ретривер, 4 года',
    serviceUsed: 'Экстренная эндоскопия в 02:30 ночи',
    visitDate: 'Сентябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Извлечение инородного предмета без полостной операции за 35 минут',
    story:
      'На вечерней прогулке Ричард проглотил резиновый мячик, к двум часам ночи началась неукротимая рвота. Приехали в «Лапу Помощи» без звонка — дежурная бригада Дмитрия Морозова и Алексея Смирнова приняла нас за 2 минуты. Сделали УЗИ, ввели в бережный газовый наркоз и достали мяч эндоскопом без единого разреза! Уже утром Ричард вилял хвостом и просил завтрак.',
    photoUrl: '/images/pets/t1.jpg',
  },
  {
    id: 't2',
    ownerName: 'Александр и Дарья Громовы',
    ownerRole: 'IT-руководитель, м. Калужская (Москва)',
    petName: 'Марсель',
    petBreed: 'Шотландский вислоухий кот, 9 лет',
    serviceUsed: 'Кардио-скрининг ЭхоКГ + стоматологическая санация',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Безопасная чистка зубов возрастному коту с контролем сердца',
    story:
      'Очень боялись делать наркоз 9-летнему вислоухому коту из-за породных рисков по сердцу. Елена Сергеевна Волкова сначала провела детальную ЭхоКГ, подобрала поддерживающую схему, а на процедуре присутствовал отдельный анестезиолог. Зубки идеально белые, воспаление десен ушло, а Марсель вернулся к любимому корму в тот же вечер.',
    photoUrl: '/images/pets/t2.jpg',
  },
  {
    id: 't3',
    ownerName: 'Екатерина Белова',
    ownerRole: 'Преподаватель МГУ, м. Университет (Москва)',
    petName: 'Пончик',
    petBreed: 'Карликовый кролик, 2.5 года',
    serviceUsed: 'Прием ратолога + коррекция дентальной аркады',
    visitDate: 'Август 2026',
    rating: 5,
    beforeAfterOutcome: 'Восстановление аппетита и прикуса у кролика за 1 день',
    story:
      'Найти в Москве настоящего ратолога, который умеет работать с газовым наркозом у кроликов — огромная редкость. Когда Пончик резко перестал есть сено, Анна Павловна Соколова сразу обнаружила крючки на задних зубах, бережно провела подпиливание бором и расписала диету. Огромное спасибо за отдельный тихий бокс, где малыш совсем не боялся.',
    photoUrl: '/images/pets/t3.jpg',
  },
  {
    id: 't4',
    ownerName: 'Игорь Савельев',
    ownerRole: 'Предприниматель, м. Профсоюзная (Москва)',
    petName: 'Луна',
    petBreed: 'Вельш-корги пемброк, 1 год',
    serviceUsed: 'Лапароскопическая стерилизация + стационар',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Прокол 5 мм без попоны, выписка вечером того же дня',
    story:
      'Делали Луне лапароскопическую стерилизацию. Никаких огромных разрезов и перевязок — всего микроскопический косметический шов. Пока Луна просыпалась в дневном стационаре, врачи дважды присылали нам в Telegram видео и показатели температуры. Цена до рубля совпала с тем, что мы заранее посчитали в калькуляторе на сайте.',
    photoUrl: '/images/pets/t4.jpg',
  },
  {
    id: 't5',
    ownerName: 'Денис и Алина Морозовы',
    ownerRole: 'Дизайнер интерьеров, м. Новые Черёмушки (Москва)',
    petName: 'Бруно',
    petBreed: 'Французский бульдог, 3 года',
    serviceUsed: 'Эндоскопическая коррекция БЦС + кислородный бокс',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Свободное дыхание без храпа и одышки в жаркую погоду',
    story:
      'Бруно тяжело дышал даже после короткой прогулки, летом дважды случались приступы гипоксии. Главврач Алексей Викторович Смирнов провел малоинвазивную пластику ноздрей и мягкого нёба под газовым наркозом. Уже на второй день пес впервые за три года спал совершенно бесшумно и теперь спокойно бегает в парке наравне с другими собаками.',
    photoUrl: '/images/pets/t5.jpg',
  },
  {
    id: 't6',
    ownerName: 'Светлана Романова',
    ownerRole: 'Финансовый аудитор, м. Академическая (Москва)',
    petName: 'Тайсон',
    petBreed: 'Мейн-кун, 6 лет',
    serviceUsed: 'УЗИ брюшной полости + интенсивная терапия в стационаре',
    visitDate: 'Сентябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Купирование острой задержки мочи и полное восстановление почек',
    story:
      'Вечером заметили, что наш 9-килограммовый мейн-кун Тайсон подолгу сидит в лотке и плачет. Примчались в клинику к полуночи: Дмитрий Игоревич Морозов за 10 минут сделал FAST-УЗИ, экспресс-биохимию крови и под мягкой седацией снял обструкцию. Двое суток в кошачьем стационаре с инфузоматами спасли коту почки — сейчас анализы в полной норме.',
    photoUrl: '/images/pets/t6.jpg',
  },
  {
    id: 't7',
    ownerName: 'Виктория Лебедева',
    ownerRole: 'Врач-педиатр, Ленинский проспект (Москва)',
    petName: 'Оливия',
    petBreed: 'Бенгальская кошка, 2 года',
    serviceUsed: 'Эндоскопическая гастроскопия + рентген с контрастом',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Извлечение силиконовой ленты из желудка без разреза брюшной стенки',
    story:
      'Как врач я сразу оценила уровень оснащения клиники: у Оливии началась рвота после игры с детской игрушкой. На УЗИ увидели инородную ленту в желудке. Вместо травматичной гастротомии со швами хирурги аккуратно достали предмет гибким эндоскопом через пищевод. Через 4 часа мы уже забрали активную кошку домой без воротника и уколов.',
    photoUrl: '/images/pets/t7.jpg',
  },
  {
    id: 't8',
    ownerName: 'Павел и Ксения Орловы',
    ownerRole: 'Инженер-проектировщик, м. Беляево (Москва)',
    petName: 'Персик',
    petBreed: 'Морская свинка породы скинни, 1.8 года',
    serviceUsed: 'Прием ратолога + небулайзерная терапия в теплом боксе',
    visitDate: 'Сентябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Вылечили двустороннюю пневмонию у морской свинки за 7 дней',
    story:
      'В двух обычных ветклиниках нам прямо сказали, что грызунов не лечат, а Персик тяжело дышал и терял вес. В «Лапе Помощи» ратолог Анна Павловна Соколова сделала цифровой микро-рентген легких, поместила малыша в кислородный бокс с подогревом и подобрала безопасные для свинок антибиотики. Персик снова свистит при виде огурца и набрал свои 950 граммов!',
    photoUrl: '/images/pets/t8.jpg',
  },
  {
    id: 't9',
    ownerName: 'Наталья Ветрова',
    ownerRole: 'Юрист, район Обручевский (Москва)',
    petName: 'Тедди',
    petBreed: 'Немецкий померанский шпиц, 5 лет',
    serviceUsed: 'Ортопедическая операция на коленном суставе + реабилитация',
    visitDate: 'Август 2026',
    rating: 5,
    beforeAfterOutcome: 'Устранение медиального вывиха коленной чашечки, бегает на всех 4 лапах',
    story:
      'Тедди внезапно начал поджимать заднюю лапку на прогулке. Михаил Юрьевич Васильев и Алексей Викторович провели ортопедические тесты и рентген — оказался вывих пателлы 3-й степени. Операция прошла блестяще: мультимодальное обезболивание сработало так мягко, что песик даже не скулил. Уже через три недели после операции Тедди уверенно опирается на лапу.',
    photoUrl: '/images/pets/t9.jpg',
  },
  {
    id: 't10',
    ownerName: 'Михаил Захаров',
    ownerRole: 'Пилот гражданской авиации, м. Тропарёво (Москва)',
    petName: 'Симба',
    petBreed: 'Абиссинская кошка, 12 лет',
    serviceUsed: 'Гериатрический чек-ап + контроль артериального давления',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Ранняя диагностика гипертиреоза и стабилизация веса у кота 12 лет',
    story:
      'Симба сильно похудел при повышенном аппетите, а в силу возраста мы переживали за сердце и почки. Записались на комплексный возрастной чек-ап к Елене Сергеевне Волковой. За 40 минут в одном кабинете взяли кровь на гормоны Т4, сделали УЗИ, ЭхоКГ и измерили давление тонометром PetMAP. Назначили таблетки — за месяц вес вырос на 600 г, шерсть снова блестит!',
    photoUrl: '/images/pets/t10.jpg',
  },
  {
    id: 't11',
    ownerName: 'Артем и Юлия Сорокины',
    ownerRole: 'Маркетолог, м. Воронцовская (Москва)',
    petName: 'Джекки',
    petBreed: 'Джек-рассел-терьер, 2 года',
    serviceUsed: 'Экстренный выезд ветмобиля на дом + антидотная терапия',
    visitDate: 'Сентябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Прибытие бригады за 24 минуты при остром отравлении и спасение жизни',
    story:
      'На даче под Москвой Джекки укусила гадюка в морду — отек рос буквально на глазах, собака начала задыхаться. Вызвали экстренную бригаду «Лапы Помощи»: ветмобиль с реаниматологом Артёмом Кузнецовым приехал через 24 минуты! Прямо в машине поставили капельницу, ввели препараты и доставили в стационар под круглосуточный мониторинг. Вы спасли нашего члена семьи!',
    photoUrl: '/images/pets/t11.jpg',
  },
];

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Диагностика',
    question: 'Как правильно подготовить питомца к сдаче анализа крови и УЗИ брюшной полости?',
    answer:
      'Для получения точных биохимических показателей и хорошей визуализации на УЗИ рекомендуется голодная диета в течение 8–10 часов для взрослых собак и кошек (для щенков и котят — не более 4 часов). Чистую питьевую воду убирать не нужно. Важно: грызунам (кроликам, морским свинкам, шиншиллам) голодная диета строго противопоказана — кормите их в обычном режиме вплоть до визита.',
  },
  {
    id: 'faq-2',
    category: 'Прием узких специалистов',
    question: 'Как выбрать нужного профильного врача для моего питомца?',
    answer:
      'За каждым направлением диагностики, терапии, хирургии и комплексного чек-апа в нашей клинике закреплен профильный ведущий специалист. При оформлении онлайн-записи система автоматически предложит вам профильного врача по вашей проблеме, но вы всегда можете выбрать любого другого специалиста клиники и удобное свободное окно времени.',
  },
  {
    id: 'faq-3',
    category: 'Документы и визит',
    question: 'Какие документы нужно взять с собой на первый прием или вакцинацию?',
    answer:
      'Возьмите с собой паспорт владельца (для оформления договора медицинского обслуживания) и ветеринарный паспорт питомца, если он уже заведен. Если вы переходите к нам из другой клиники, возьмите прошлые выписки, результаты анализов или снимки — они помогут врачу увидеть динамику и не назначать повторные исследования.',
  },
  {
    id: 'faq-4',
    category: 'Анестезия и хирургия',
    question: 'Насколько безопасен наркоз для пожилых животных и пород группы риска?',
    answer:
      'Перед любой седацией мы проводим обязательный кардиологический скрининг (ЭхоКГ) и экспресс-анализ крови. В операционной мы используем современный ингаляционный (газовый) наркоз Севофлуран и мультимодальную анальгезию. На протяжении всей операции рядом с пациентом находится выделенный врач-анестезиолог, контролирующий ЭКГ, сатурацию, капнографию и давление.',
  },
  {
    id: 'faq-5',
    category: 'Выезд на дом',
    question: 'Как быстро приезжает выездная ветеринарная служба по Москве и что врач может сделать дома?',
    answer:
      'При экстренном вызове в пределах ЮЗАО и смежных округов Москвы дежурная бригада прибывает за 25–30 минут (по всей Москве — до 45 минут). Врач приезжает с портативным аппаратом УЗИ, ЭКГ, кислородным концентратором, набором для реанимации, забора анализов и вакцинации. Если требуется операция, бригада бережно транспортирует пациента в клинику на оборудованном ветеринарном автомобиле.',
  },
  {
    id: 'faq-6',
    category: 'Оплата и цены',
    question: 'Изменится ли стоимость лечения по сравнению с расчетом в онлайн-калькуляторе?',
    answer:
      'Мы придерживаемся принципа прозрачной сметы: все комплексные программы чек-апа и вакцинации имеют фиксированную стоимость, которую вы видите в калькуляторе. Если в ходе осмотра потребуются дополнительные процедуры, врач сначала согласует с вами письменный план диагностики с точной суммой по прайсу и только после вашего согласия приступит к манипуляциям.',
  },
];

export const EMERGENCY_SYMPTOMS: EmergencySymptom[] = [
  {
    id: 'breathing',
    label: 'Тяжелое дыхание открытым ртом, синюшность или бледность языка',
    severity: 'critical',
    firstAid:
      'Обеспечьте приток свежего прохладного воздуха, снимите ошейник/шлейку, не прижимайте питомца силой и минимизируйте любые нагрузки.',
  },
  {
    id: 'foreign-body',
    label: 'Проглотил инородный предмет, кость, нитку или химическое вещество',
    severity: 'critical',
    firstAid:
      'НЕ вызывайте рвоту самостоятельно и не тяните за торчащую нитку/дождик. Сфотографируйте упаковку вещества и немедленно везите на эндоскопию.',
  },
  {
    id: 'trauma',
    label: 'Автотравма, падение с высоты, глубокое кровотечение или перелом',
    severity: 'critical',
    firstAid:
      'Аккуратно переместите питомца на твердую ровную поверхность (коробку, плотную доску), при кровотечении наложите давящую стерильную салфетку.',
  },
  {
    id: 'urination',
    label: 'Частые безуспешные позывы в лоток, крик при попытке мочеиспускания',
    severity: 'critical',
    firstAid:
      'Острая задержка мочи угрожает жизни в течение 12–24 часов. Не давайте мочегонные препараты и не давите на живот — требуется катетеризация.',
  },
  {
    id: 'gi-rodent',
    label: 'Отказ от еды и воды более 8 часов (для кроликов и грызунов — более 4 часов)',
    severity: 'urgent',
    firstAid:
      'Измерьте температуру (норма у собак и кошек 37.5–39.0 °C), предложите воду из шприца без иглы и запишитесь на срочное УЗИ.',
  },
  {
    id: 'seizures',
    label: 'Судороги, потеря ориентации, наклон головы или нарушение координации',
    severity: 'critical',
    firstAid:
      'Уберите твердые предметы вокруг животного, приглушите яркий свет, не разжимайте челюсти руками и по возможности запишите приступ на видео для невролога.',
  },
];

export type PetStoryReview = TestimonialItem;

/**
 * Единая функция расчета стоимости услуги по актуальному прайс-листу и программам калькулятора.
 * Учитывает вид животного для пакетных программ калькулятора и дополнительные опции.
 */
export function resolveServicePriceByTitle(
  serviceTitle: string,
  petSpeciesOrServices?: string | ServiceItem[],
  maybeServicesList: ServiceItem[] = SERVICES_DATA
): number {
  const petSpecies =
    typeof petSpeciesOrServices === 'string' ? petSpeciesOrServices : undefined;
  const servicesList = Array.isArray(petSpeciesOrServices)
    ? petSpeciesOrServices
    : maybeServicesList;

  const cleanTitle = (serviceTitle || '').trim();
  if (!cleanTitle) return servicesList[0]?.priceFrom || 1800;

  // 1. Точное совпадение с услугой из прайс-листа
  const matchedService = servicesList.find(
    (s) => s.title.trim().toLowerCase() === cleanTitle.toLowerCase()
  );
  if (matchedService) {
    return Math.max(0, Math.round(Number(matchedService.priceFrom) || 0));
  }

  // 2. Частичное вхождение названия услуги из прайс-листа
  const partialService = servicesList.find(
    (s) =>
      cleanTitle.toLowerCase().includes(s.title.trim().toLowerCase()) ||
      s.title.trim().toLowerCase().includes(cleanTitle.toLowerCase())
  );
  if (partialService) {
    return Math.max(0, Math.round(Number(partialService.priceFrom) || 0));
  }

  // 3. Совпадение с пакетной программой калькулятора (включая суффиксы доп. опций)
  const matchedPkg = CALCULATOR_PACKAGES.find(
    (p) =>
      cleanTitle.toLowerCase() === p.title.toLowerCase() ||
      cleanTitle.toLowerCase().startsWith(p.title.toLowerCase())
  );
  if (matchedPkg) {
    const speciesMultiplier =
      petSpecies === 'Собака' ? 1.25 : petSpecies === 'Грызун' ? 0.85 : 1.0;
    const baseAdjusted =
      Math.round((matchedPkg.basePrice * speciesMultiplier) / 50) * 50;
    const homeVisitAddon = cleanTitle.includes('Выезд на дом') ? 1500 : 0;
    const expressLabAddon = cleanTitle.includes('Экспресс-лаборатория CITO')
      ? 600
      : 0;
    return baseAdjusted + homeVisitAddon + expressLabAddon;
  }

  // 4. Экстренный выезд бригады на дом
  if (cleanTitle.toLowerCase().includes('экстренный выезд')) {
    return 3500;
  }

  return servicesList[0]?.priceFrom || 1800;
}

/**
 * Гарантирует строго числовую стоимость записи и синхронизирует её с прайс-листом,
 * если цена не задана или услуга входит в прайс-лист.
 */
export function resolveAppointmentPrice(
  record: Partial<AppointmentRecord>,
  servicesList: ServiceItem[] = SERVICES_DATA,
  forceCatalogSync = false
): number {
  const catalogPrice = resolveServicePriceByTitle(
    record.serviceTitle || '',
    record.petSpecies,
    servicesList
  );

  if (forceCatalogSync) {
    return catalogPrice;
  }

  const rawPrice = Number(record.estimatedPrice);
  if (Number.isFinite(rawPrice) && rawPrice > 0) {
    const directService = servicesList.find(
      (s) =>
        s.title.trim().toLowerCase() ===
        (record.serviceTitle || '').trim().toLowerCase()
    );
    if (directService) {
      return Math.max(0, Math.round(Number(directService.priceFrom) || 0));
    }
    return Math.round(rawPrice);
  }

  return catalogPrice;
}

const TODAY_ISO = new Date().toISOString().split('T')[0];
const TOMORROW_ISO = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const DAY_AFTER_ISO = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

export const INITIAL_APPOINTMENTS_DATA: AppointmentRecord[] = [
  {
    id: 'LP-849102',
    createdAt: '09:15',
    ownerName: 'Марина Ковалева',
    phone: '+7 (916) 442-18-90',
    petSpecies: 'Собака',
    petName: 'Ричард',
    serviceTitle: 'Ежегодный комплексный чек-ап «Здоровый питомец»',
    doctorName: 'Волкова Елена Сергеевна',
    preferredDate: `${TODAY_ISO} в 11:00`,
    estimatedPrice: 5500,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Золотистый ретривер, 4 года. Голодная диета соблюдена, нужен забор биохимии.',
    doctorRecommendation:
      'Подтвержден плановый чек-ап. Пожалуйста, сохраняйте голодную диету 8 часов перед забором венозной крови, воду можно давать без ограничений.',
  },
  {
    id: 'LP-849135',
    createdAt: '10:40',
    ownerName: 'Александр Громов',
    phone: '+7 (926) 805-71-22',
    petSpecies: 'Кошка',
    petName: 'Марсель',
    serviceTitle: 'Кардиологический скрининг (ЭхоКГ + ЭКГ)',
    doctorName: 'Волкова Елена Сергеевна',
    preferredDate: `${TOMORROW_ISO} в 14:00`,
    estimatedPrice: 3100,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Шотландский вислоухий, 9 лет. Скрининг перед плановой чисткой зубов.',
  },
  {
    id: 'LP-849208',
    createdAt: '12:05',
    ownerName: 'Екатерина Белова',
    phone: '+7 (903) 519-64-11',
    petSpecies: 'Грызун',
    petName: 'Пончик',
    serviceTitle: 'Ультразвуковая стоматология и санация',
    doctorName: 'Соколова Анна Павловна',
    preferredDate: `${TOMORROW_ISO} в 21:00`,
    estimatedPrice: 4200,
    isEmergency: false,
    status: 'Новая',
    notes: 'Карликовый кролик, контрольный осмотр резцов и щечных зубов.',
  },
  {
    id: 'LP-849274',
    createdAt: '14:22',
    ownerName: 'Игорь Савельев',
    phone: '+7 (985) 730-19-45',
    petSpecies: 'Собака',
    petName: 'Луна',
    serviceTitle: 'Эндоскопическая хирургия и ортопедия',
    doctorName: 'Смирнов Алексей Викторович',
    preferredDate: `${TODAY_ISO} в 13:00`,
    estimatedPrice: 6500,
    isEmergency: false,
    status: 'Завершена',
    notes: 'Вельш-корги, плановая лапароскопия прошла успешно, выписана домой.',
    doctorRecommendation:
      'Операция прошла штатно, швы внутрикожные саморассасывающиеся. Рекомендовано: защитная попона 7 дней, обработка хлоргексидином 1 раз в день, контрольный осмотр через 10 суток.',
  },
  {
    id: 'LP-849288',
    createdAt: '15:10',
    ownerName: 'Максим Терехов',
    phone: '+7 (916) 320-41-88',
    petSpecies: 'Собака',
    petName: 'Барон',
    serviceTitle: 'Эндоскопическая хирургия и ортопедия',
    doctorName: 'Смирнов Алексей Викторович',
    preferredDate: `${TOMORROW_ISO} в 11:30`,
    estimatedPrice: 6500,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Немецкий дог, хромота на правую тазовую конечность. Требуется ортопедический осмотр и рентген.',
  },
  {
    id: 'LP-849319',
    createdAt: '16:50',
    ownerName: 'Ольга Романова',
    phone: '+7 (915) 288-03-67',
    petSpecies: 'Кошка',
    petName: 'Симба',
    serviceTitle: 'Экстренный выезд бригады на дом (за 30 минут)',
    doctorName: 'Морозов Дмитрий Игоревич',
    preferredDate: `${TODAY_ISO} в 21:30`,
    estimatedPrice: 3500,
    isEmergency: true,
    status: 'Новая',
    notes: 'Отказ от корма со вчерашнего вечера, нужен экспресс-анализ крови и УЗИ.',
  },
  {
    id: 'LP-849390',
    createdAt: '18:10',
    ownerName: 'Денис Морозов',
    phone: '+7 (964) 612-90-08',
    petSpecies: 'Собака',
    petName: 'Бруно',
    serviceTitle: 'Комплексная вакцинация и чипирование',
    doctorName: 'Дежурный специалист клиники',
    preferredDate: `${TOMORROW_ISO} в 12:00`,
    estimatedPrice: 2200,
    isEmergency: false,
    status: 'Новая',
    notes: 'Плановая вакцинация и чипирование. Ожидает назначения дежурного врача.',
  },
  {
    id: 'LP-849412',
    createdAt: '19:05',
    ownerName: 'Артём Соколов',
    phone: '+7 (925) 341-82-19',
    petSpecies: 'Собака',
    petName: 'Рекс',
    serviceTitle: 'УЗИ экспертного класса и экспресс-анализы',
    doctorName: 'Морозов Дмитрий Игоревич',
    preferredDate: `${TOMORROW_ISO} в 20:00`,
    estimatedPrice: 2400,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Немецкая овчарка, 5 лет. Контрольное УЗИ брюшной полости и биохимия крови.',
  },
  {
    id: 'LP-849501',
    createdAt: '19:30',
    ownerName: 'Наталья Ветрова',
    phone: '+7 (916) 509-12-44',
    petSpecies: 'Собака',
    petName: 'Тедди',
    serviceTitle: 'Эндоскопическая хирургия и ортопедия',
    doctorName: 'Васильев Михаил Юрьевич',
    preferredDate: `${DAY_AFTER_ISO} в 11:30`,
    estimatedPrice: 6500,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Померанский шпиц, контрольный осмотр у хирурга-травматолога.',
  },
  {
    id: 'LP-849518',
    createdAt: '19:55',
    ownerName: 'Виктория Орлова',
    phone: '+7 (916) 774-59-03',
    petSpecies: 'Кошка',
    petName: 'Мята',
    serviceTitle: 'Комплексная вакцинация и чипирование',
    doctorName: 'Павлова Ирина Николаевна',
    preferredDate: `${DAY_AFTER_ISO} в 12:00`,
    estimatedPrice: 2200,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Абиссинская кошка, 2 года. Ежегодная вакцинация с паспортом.',
  },
  {
    id: 'LP-849534',
    createdAt: '20:20',
    ownerName: 'Сергей Воронцов',
    phone: '+7 (985) 239-61-07',
    petSpecies: 'Собака',
    petName: 'Тайсон',
    serviceTitle: 'Интенсивный стационар и оксигенотерапия 24/7',
    doctorName: 'Кузнецов Артём Романович',
    preferredDate: `${DAY_AFTER_ISO} в 21:30`,
    estimatedPrice: 4800,
    isEmergency: true,
    status: 'Подтверждена',
    notes: 'Лабрадор, 6 лет. Мониторинг в стационаре интенсивной терапии ОРИТ.',
  },
  {
    id: 'LP-849560',
    createdAt: '20:45',
    ownerName: 'Алина Дорофеева',
    phone: '+7 (915) 840-29-51',
    petSpecies: 'Кошка',
    petName: 'Оливия',
    serviceTitle: 'Бережный медицинский груминг и гигиена',
    doctorName: 'Новикова Ольга Дмитриевна',
    preferredDate: `${DAY_AFTER_ISO} в 20:30`,
    estimatedPrice: 2600,
    isEmergency: false,
    status: 'Новая',
    notes: 'Мейн-кун, 4 года. Медицинский груминг и осмотр кожи дерматологом.',
  },
];

const RANDOM_CLIENTS_POOL: Array<{
  ownerName: string;
  phone: string;
  petSpecies: 'Кошка' | 'Собака' | 'Грызун';
  petName: string;
  notes: string;
}> = [
  {
    ownerName: 'Наталья Веденеева',
    phone: '+7 (916) 902-45-18',
    petSpecies: 'Кошка',
    petName: 'Бусинка',
    notes: 'Британская кошка, 3 года. Плановый осмотр и консультация по рациону.',
  },
  {
    ownerName: 'Максим Лебедев',
    phone: '+7 (926) 418-73-90',
    petSpecies: 'Собака',
    petName: 'Чарли',
    notes: 'Французский бульдог, 2 года. Проверка сердца и общий анализ крови.',
  },
  {
    ownerName: 'Светлана Миронова',
    phone: '+7 (903) 755-12-64',
    petSpecies: 'Грызун',
    petName: 'Орешек',
    notes: 'Морская свинка, 1.5 года. Осмотр ратолога и коррекция коготков.',
  },
  {
    ownerName: 'Сергей Воронцов',
    phone: '+7 (985) 239-61-07',
    petSpecies: 'Собака',
    petName: 'Тайсон',
    notes: 'Лабрадор, 6 лет. УЗИ брюшной полости натощак.',
  },
  {
    ownerName: 'Алина Дорофеева',
    phone: '+7 (915) 840-29-51',
    petSpecies: 'Кошка',
    petName: 'Оливия',
    notes: 'Мейн-кун, 4 года. Кардиологический скрининг ЭхоКГ.',
  },
  {
    ownerName: 'Роман Захаров',
    phone: '+7 (964) 511-38-22',
    petSpecies: 'Кошка',
    petName: 'Тигра',
    notes: 'Домашняя кошка, 5 лет. Ежегодная вакцинация с отметкой в ветпаспорте.',
  },
];

/**
 * Генерирует новую реалистичную тестовую заявку от случайного клиента с синхронизированной ценой из прайса
 * и учетом индивидуальных слотов выбранного врача.
 */
export function createRandomClientAppointment(
  servicesList: ServiceItem[] = SERVICES_DATA,
  doctorsList: DoctorProfile[] = DOCTORS_DATA,
  indexSeed = Math.floor(Math.random() * 1000)
): AppointmentRecord {
  const client = RANDOM_CLIENTS_POOL[indexSeed % RANDOM_CLIENTS_POOL.length];
  const service =
    servicesList[indexSeed % Math.max(1, servicesList.length)] || SERVICES_DATA[0];

  const defaultDocName = resolveDefaultDoctorForService(
    service.title,
    servicesList,
    doctorsList
  );
  const doctor =
    client.petSpecies === 'Грызун'
      ? doctorsList.find((d) => d.name.includes('Соколова')) ||
        doctorsList[indexSeed % Math.max(1, doctorsList.length)] ||
        DOCTORS_DATA[0]
      : doctorsList.find((d) => d.name === defaultDocName) ||
        doctorsList[indexSeed % Math.max(1, doctorsList.length)] ||
        DOCTORS_DATA[0];

  const slots =
    doctor.personalSlots && doctor.personalSlots.length > 0
      ? doctor.personalSlots
      : ['10:00', '11:30', '13:00', '15:00', '17:00', '19:00'];
  const slot = slots[indexSeed % slots.length];
  const futureDate = new Date(Date.now() + ((indexSeed % 5) + 1) * 86400000)
    .toISOString()
    .split('T')[0];

  return {
    id: `LP-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    ownerName: client.ownerName,
    phone: client.phone,
    petSpecies: client.petSpecies,
    petName: client.petName,
    serviceTitle: service.title,
    doctorName: doctor.name,
    preferredDate: `${futureDate} в ${slot}`,
    estimatedPrice: resolveServicePriceByTitle(
      service.title,
      client.petSpecies,
      servicesList
    ),
    isEmergency: false,
    status: indexSeed % 2 === 0 ? 'Подтверждена' : 'Новая',
    notes: client.notes,
  };
}

/**
 * Генерирует пакет тестовых заявок от случайных клиентов.
 */
export function createRandomClientAppointments(
  count = 3,
  servicesList: ServiceItem[] = SERVICES_DATA,
  doctorsList: DoctorProfile[] = DOCTORS_DATA
): AppointmentRecord[] {
  const baseSeed = Math.floor(Math.random() * 100);
  return Array.from({ length: count }, (_, idx) =>
    createRandomClientAppointment(servicesList, doctorsList, baseSeed + idx)
  );
}
