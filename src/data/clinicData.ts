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
}

export interface DoctorProfile {
  id: string;
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
}

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
  estimatedPrice: number;
  isEmergency?: boolean;
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
  schedule: 'Круглосуточно 24/7, без выходных и праздников',
  licenseNumber: 'Лицензия Департамента ветеринарии № ЛО-77-01-021849',
  heroPhotoUrl:
    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1400&q=85',
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
    recommendation: 'Фокус на графике первичных прививок, контроле роста и обработке от паразитов.',
  },
  adult: {
    label: '1–7 лет',
    subtitle: 'Активный взрослый возраст',
    multiplier: 1.0,
    recommendation: 'Оптимален ежегодный профилактический скрининг крови и УЗИ для раннего выявления скрытых патологий.',
  },
  senior: {
    label: 'Старше 7 лет',
    subtitle: 'Почтенный возраст (гериатрия)',
    multiplier: 1.2,
    recommendation: 'Включает расширенный почечный и кардиологический контроль, тонометрию и оценку суставов.',
  },
};

export const CALCULATOR_PACKAGES: CalculatorPackage[] = [
  {
    id: 'checkup',
    title: 'Ежегодный комплексный чек-ап «Здоровый питомец»',
    subtitle: 'Полная проверка организма за 1 визит (экономия 25% от прайса)',
    basePrice: 4400,
    duration: '60 минут',
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
    includes: [
      'Осмотр кожи и шерсти дерматологом перед процедурой',
      'Бережное вычесывание, гигиена ушей, глаз и аккуратная стрижка когтей',
      'Купание с профессиональной гипоаллергенной косметикой (для кошек и собак)',
    ],
  },
];

export const DOCTORS_DATA: DoctorProfile[] = [
  {
    id: 'smirnov',
    name: 'Смирнов Алексей Викторович',
    role: 'Главный врач, хирург-ортопед, эндоскопист',
    experienceYears: 14,
    operationsCount: '3 400+ операций',
    education: 'МГАВМиБ им. К. И. Скрябина, стажировка в Ветеринарном центре Цюриха',
    quote:
      'В нашей операционной действуют те же стандарты стерильности и анестезиологического мониторинга, что и в лучших гуманных клиниках. Мы боремся за качество жизни каждого пациента.',
    specialties: ['Остеосинтез и TPLO', 'Лапароскопия', 'Торакальная хирургия'],
    photoUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
    fallbackTitle: 'А. В. Смирнов · Главврач, хирург',
    accentColor: '#0D9488',
  },
  {
    id: 'volkova',
    name: 'Волкова Елена Сергеевна',
    role: 'Ведущий терапевт, ветеринарный кардиолог',
    experienceYears: 11,
    operationsCount: '6 800+ пациентов',
    education: 'СПбГУВМ, член Кардиологического ветеринарного общества',
    quote:
      'Животные не могут сказать, где именно болит, но их сердце, дыхание и анализы рассказывают всё. Моя задача — поставить точный диагноз без лишних назначений и стресса.',
    specialties: ['ЭхоКГ и Холтер', 'Доказательная терапия', 'Ведение пожилых животных'],
    photoUrl:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80',
    fallbackTitle: 'Е. С. Волкова · Кардиолог, терапевт',
    accentColor: '#0F766E',
  },
  {
    id: 'morozov',
    name: 'Морозов Дмитрий Игоревич',
    role: 'Врач УЗ-диагностики, реаниматолог-анестезиолог',
    experienceYears: 9,
    operationsCount: '5 100+ УЗИ-исследований',
    education: 'РГАУ-МСХА им. К. А. Тимирязева, школа вет. анестезиологии VASTA',
    quote:
      'В экстренной ситуации решают первые 20 минут. Поэтому наша лаборатория и УЗИ работают круглосуточно — мы ставим диагноз прямо у порога реанимационного зала.',
    specialties: ['FAST-протокол УЗИ', 'Интенсивная терапия', 'Ингаляционный наркоз'],
    photoUrl:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
    fallbackTitle: 'Д. И. Морозов · УЗИ и реанимация',
    accentColor: '#115E59',
  },
  {
    id: 'sokolova',
    name: 'Соколова Анна Павловна',
    role: 'Врач-ратолог (специалист по грызунам), стоматолог',
    experienceYears: 8,
    operationsCount: '2 900+ мелких пациентов',
    education: 'МГАВМиБ им. К. И. Скрябина, узкая специализация по медицине грызунов и зайцеобразных',
    quote:
      'Кролики, морские свинки и шиншиллы требуют совершенно иной фармакологии и ювелирной стоматологии. У нас для них оборудован отдельный тихий кабинет без запаха хищников.',
    specialties: ['Медицина кроликов и грызунов', 'Дентальная коррекция', 'Микрохирургия'],
    photoUrl:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    fallbackTitle: 'А. П. Соколова · Ратолог, стоматолог',
    accentColor: '#0D9488',
  },
];

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
    photoUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1513360382564-850120167725?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
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
      'Тедди внезапно начал поджимать заднюю лапку на прогулке. Алексей Викторович провел ортопедические тесты и рентген — оказался вывих пателлы 3-й степени. Операция прошла блестяще: мультимодальное обезболивание сработало так мягко, что песик даже не скулил. Уже через три недели после операции Тедди уверенно опирается на лапу.',
    photoUrl:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
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
    photoUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
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
      'На даче под Москвой Джекки укусила гадюка в морду — отек рос буквально на глазах, собака начала задыхаться. Вызвали экстренную бригаду «Лапы Помощи»: ветмобиль с реаниматологом приехал через 24 минуты! Прямо в машине поставили капельницу, ввели препараты и доставили в стационар под круглосуточный мониторинг. Вы спасли нашего члена семьи!',
    photoUrl:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
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
    category: 'Стационар 24/7',
    question: 'Есть ли в клинике круглосуточный стационар и можно ли навещать питомца?',
    answer:
      'Да, в «Лапе Помощи» работает круглосуточный стационар интенсивной терапии с отдельными блоками для кошек, собак и мелких грызунов (без пересечения запахов и звуков). Каждый бокс оснащен подогревом пола, подачей кислорода и инфузоматами. Навещать питомца можно ежедневно с 11:00 до 21:00, а каждые 6 часов лечащий врач отправляет вам фото- и видеоотчет в мессенджер.',
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
    // Если услуга точно совпадает с базовой позицией прайса (не калькулятор с возрастным коэффициентом),
    // возвращаем актуальную цену из прайс-листа, чтобы исключить расхождения
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
    preferredDate: '2026-10-19 в 11:00',
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
    preferredDate: '2026-10-19 в 13:00',
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
    preferredDate: '2026-10-19 в 15:00',
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
    preferredDate: '2026-10-18 в 17:00',
    estimatedPrice: 6500,
    isEmergency: false,
    status: 'Завершена',
    notes: 'Вельш-корги, плановая лапароскопия прошла успешно, выписана домой.',
    doctorRecommendation:
      'Операция прошла штатно, швы внутрикожные саморассасывающиеся. Рекомендовано: защитная попона 7 дней, обработка хлоргексидином 1 раз в день, контрольный осмотр через 10 суток.',
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
    preferredDate: '2026-10-19 в 19:00',
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
    preferredDate: '2026-10-20 в 11:00',
    estimatedPrice: 2200,
    isEmergency: false,
    status: 'Отменена',
    notes: 'Владелец попросил перенести визит на следующую неделю из-за командировки.',
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
    preferredDate: '2026-10-20 в 13:00',
    estimatedPrice: 2400,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Немецкая овчарка, 5 лет. Контрольное УЗИ брюшной полости и биохимия крови.',
  },
  {
    id: 'LP-849455',
    createdAt: '19:40',
    ownerName: 'Виктория Орлова',
    phone: '+7 (916) 774-59-03',
    petSpecies: 'Кошка',
    petName: 'Мята',
    serviceTitle: 'Терапия и первичный клинический прием',
    doctorName: 'Волкова Елена Сергеевна',
    preferredDate: '2026-10-20 в 15:00',
    estimatedPrice: 1800,
    isEmergency: false,
    status: 'Новая',
    notes: 'Абиссинская кошка, 2 года. Профилактический осмотр перед дачным сезоном.',
  },
  {
    id: 'LP-849489',
    createdAt: '20:15',
    ownerName: 'Павел Кузнецов',
    phone: '+7 (905) 618-44-72',
    petSpecies: 'Грызун',
    petName: 'Шустрик',
    serviceTitle: 'Комплексная вакцинация и чипирование',
    doctorName: 'Соколова Анна Павловна',
    preferredDate: '2026-10-20 в 17:00',
    estimatedPrice: 2200,
    isEmergency: false,
    status: 'Подтверждена',
    notes: 'Декоративный кролик, 1 год. Плановая вакцинация и оформление паспорта.',
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
 * Генерирует новую реалистичную тестовую заявку от случайного клиента с синхронизированной ценой из прайса.
 */
export function createRandomClientAppointment(
  servicesList: ServiceItem[] = SERVICES_DATA,
  doctorsList: DoctorProfile[] = DOCTORS_DATA,
  indexSeed = Math.floor(Math.random() * 1000)
): AppointmentRecord {
  const client = RANDOM_CLIENTS_POOL[indexSeed % RANDOM_CLIENTS_POOL.length];
  const service =
    servicesList[indexSeed % Math.max(1, servicesList.length)] || SERVICES_DATA[0];
  const doctor =
    client.petSpecies === 'Грызун'
      ? doctorsList.find((d) => d.name.includes('Соколова')) ||
        doctorsList[indexSeed % Math.max(1, doctorsList.length)] ||
        DOCTORS_DATA[0]
      : doctorsList[indexSeed % Math.max(1, doctorsList.length)] || DOCTORS_DATA[0];

  const slots = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
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
