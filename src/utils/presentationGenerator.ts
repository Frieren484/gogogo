import PptxGenJS from 'pptxgenjs';

export interface PresentationMetadata {
  institution: string;
  mdkLine: string;
  projectTitle: string;
  studentGenderLabel: 'Подготовил студент' | 'Подготовила студентка';
  groupName: string;
  studentName: string;
  teacherName: string;
  cityAndYear: string;
  techStackMode: 'academic' | 'modern';
}

export const DEFAULT_PRESENTATION_METADATA: PresentationMetadata = {
  institution:
    'Государственное автономное профессиональное образовательное учреждение Саратовской области «Балашовский техникум механизации сельского хозяйства»',
  mdkLine:
    'МДК 02.02. ИНСТРУМЕНТАЛЬНЫЕ СРЕДСТВА РАЗРАБОТКИ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ',
  projectTitle:
    'Разработка информационного веб-сайта ветеринарной клиники «Лапа Помощи» для взаимодействия с клиентами',
  studentGenderLabel: 'Подготовил студент',
  groupName: 'ИП-41',
  studentName: 'Кривошеев К.Д.',
  teacherName: 'Сухова Л.Г.',
  cityAndYear: 'Балашов 2026г.',
  techStackMode: 'academic',
};

export interface SlidePreviewItem {
  number: number;
  title: string;
  subtitle: string;
  bullets: string[];
  speakerNotes: string;
}

export function getSlidePreviewsForMedical10(
  meta: PresentationMetadata
): SlidePreviewItem[] {
  const stackItems =
    meta.techStackMode === 'academic'
      ? [
          'HTML / TypeScript (JS) — логика работы сайта, интерактивный калькулятор, ролевая авторизация и личные кабинеты.',
          'CSS (Tailwind CSS) — адаптивный дизайн в спокойной медицинской гамме, вёрстка карточек врачей, услуг и модальных окон.',
          'База данных (Firestore / MySQL) — хранение заявок на приём, расписания врачей, прайс-листа, медкарты питомца и отзывов.',
        ]
      : [
          'React 19 + TypeScript — компонентная архитектура, ролевая модель (Клиент, Врач, Администратор) и проверка свободных слотов.',
          'Tailwind CSS — современная адаптивная вёрстка, медицинская цветовая палитра и удобный пользовательский интерфейс.',
          'Firebase Firestore — облачная база данных реального времени для хранения записей, штата врачей, прайс-листа и отзывов.',
        ];

  return [
    {
      number: 1,
      title: 'Титульный лист',
      subtitle: meta.projectTitle,
      bullets: [
        meta.institution,
        meta.mdkLine,
        `${meta.studentGenderLabel} группы ${meta.groupName}: ${meta.studentName}`,
        `Преподаватель: ${meta.teacherName} · ${meta.cityAndYear}`,
      ],
      speakerNotes:
        'Здравствуйте, уважаемая комиссия! Представляю вашему вниманию курсовой проект на тему: «Разработка информационного веб-сайта ветеринарной клиники "Лапа Помощи" для взаимодействия с клиентами».',
    },
    {
      number: 2,
      title: 'Цель и задачи',
      subtitle:
        'Цель: Создание информационного веб-сайта ветеринарной клиники «Лапа Помощи» для удобного взаимодействия с владельцами домашних животных.',
      bullets: [
        'Определение структуры и функциональности веб-сайта ветеринарной клиники.',
        'Разработка дизайна пользовательского интерфейса и сценариев онлайн-записи.',
        'Реализация ролевой модели (Клиент, Врач, Администратор) и личных кабинетов.',
        'Создание базы данных с информацией об услугах, специалистах и заявках.',
      ],
      speakerNotes:
        'Основная цель работы — создание веб-сайта для автоматизации записи пациентов и взаимодействия ветеринарной клиники с владельцами питомцев. Для достижения цели были поставлены задачи по проектированию структуры, разработке интерфейса, настройке базы данных и разделению прав доступа.',
    },
    {
      number: 3,
      title: '01. Актуальность',
      subtitle: 'Раздел 01 — Обоснование актуальности разработки',
      bullets: [
        'Переход ветеринарных центров на круглосуточную онлайн-запись без очередей.',
        'Необходимость прозрачного расчёта стоимости услуг и выбора узкого специалиста.',
      ],
      speakerNotes:
        'Перейдём к актуальности темы курсового проекта.',
    },
    {
      number: 4,
      title: 'Актуальность темы курсового проекта',
      subtitle: 'Почему веб-платформа необходима современной клинике',
      bullets: [
        'Актуальность темы курсового проекта обусловлена тем, что владельцам домашних животных необходим быстрый круглосуточный доступ к записи на приём, выбору профильного ветеринарного врача и расчёту стоимости лечения.',
        'Веб-сайт устраняет живые очереди, исключает двойную запись на одно и то же время и обеспечивает прямое взаимодействие клиента, лечащего врача и регистратуры.',
      ],
      speakerNotes:
        'Актуальность обусловлена тем, что традиционная запись по телефону часто приводит к очередям и накладкам в расписании врачей. Разработанный веб-сайт позволяет клиенту в любое время суток записаться к нужному узкому специалисту, видеть только свободные часы приёма и вести электронную медкарту питомца.',
    },
    {
      number: 5,
      title: 'Анализ предметной области',
      subtitle: 'Ветеринарный центр «Лапа Помощи» (круглосуточный приём 24/7)',
      bullets: [
        'Ветеринарная клиника «Лапа Помощи» — современный центр доказательной ветеринарной медицины, оказывающий помощь собакам, кошкам и мелким грызунам по стандарту приёма без стресса (Fear Free).',
        'В клинике работают 8 профильных специалистов (терапия, кардиология, эндоскопическая хирургия, УЗИ, ратология, реанимация). За каждым направлением и комплексной программой чек-апа закреплён ведущий врач.',
      ],
      speakerNotes:
        'При анализе предметной области были изучены бизнес-процессы ветеринарной клиники «Лапа Помощи». В центре работают 8 узкопрофильных специалистов. Каждое направление лечения и диагностики закреплено за профильным врачом, а при записи система автоматически учитывает занятые окна времени.',
    },
    {
      number: 6,
      title: 'Выбор средств разработки',
      subtitle: 'Инструментальные средства и технологии создания веб-сайта',
      bullets: stackItems,
      speakerNotes:
        'Для реализации проекта были выбраны современные и надёжные средства веб-разработки, обеспечивающие высокую скорость работы интерфейса, адаптивную вёрстку на любых устройствах и надёжное хранение данных о записях, услугах и пациентах.',
    },
    {
      number: 7,
      title: 'Перейдём к показу сайта',
      subtitle: 'Архитектура интерфейса и ролевая модель системы',
      bullets: [
        'Публичная часть: каталог услуг с поиском, интерактивный калькулятор чек-апа, карточки 8 врачей, памятка первой помощи и отзывы.',
        'Три личных кабинета с быстрым демо-входом: Кабинет клиента, Кабинет врача и CRM-панель Администратора.',
      ],
      speakerNotes:
        'Теперь перейдём к демонстрации разработанного веб-сайта и его основных модулей.',
    },
    {
      number: 8,
      title: 'Результат работы',
      subtitle: 'Реализованный функционал веб-сайта «Лапа Помощи»',
      bullets: [
        'Показ основной информации об услугах, ценах и врачах клиники',
        'Онлайн-запись к врачу с блокировкой занятых часов и скачиванием талона',
        'Интерактивный калькулятор стоимости комплексного чек-апа питомца',
        'Личный кабинет клиента с электронной медкартой питомца и переносом визита',
        'Личный кабинет врача с рекомендациями пациенту и внутренним графиком смен',
        'Админ-панель CRM: управление прайсом, врачами, сменами 2/2 и отзывами',
      ],
      speakerNotes:
        'В результате работы создана полнофункциональная система: реализована онлайн-запись с проверкой занятого времени врача, интерактивный калькулятор чек-апа, именной талон с памяткой подготовки, а также отдельные кабинеты для клиента, врача и администратора клиники.',
    },
    {
      number: 9,
      title: 'Будущие планы',
      subtitle: 'Перспективы дальнейшего развития проекта',
      bullets: [
        'Добавление онлайн-консультаций с ветеринарным врачом по видеосвязи',
        'Интеграция автоматических уведомлений владельцам в Telegram и по SMS',
        'Прикрепление PDF-результатов анализов крови и снимков УЗИ в медкарту',
        'Мобильное приложение для владельцев питомцев и выездных бригад',
      ],
      speakerNotes:
        'В будущем планируется расширить платформу за счёт видеоконсультаций с дежурным ветеринаром, автоматических напоминаний о вакцинации в мессенджерах и загрузки результатов лабораторных анализов напрямую в личный кабинет клиента.',
    },
    {
      number: 10,
      title: 'Спасибо за внимание',
      subtitle: 'Готов ответить на ваши вопросы',
      bullets: [
        'Веб-сайт ветеринарной клиники «Лапа Помощи»',
        `${meta.studentGenderLabel} группы ${meta.groupName}: ${meta.studentName}`,
      ],
      speakerNotes:
        'Доклад окончен. Спасибо за внимание! Буду рад ответить на ваши вопросы.',
    },
  ];
}

/**
 * Вспомогательная функция отрисовки медицинского декора (как во втором примере PDF:
 * нежно-мятный фон, медицинские крестики "+" и аккуратные технические линии)
 */
function addMedicalSlideBackground(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  variant: 'title' | 'content' | 'end' = 'content'
) {
  slide.background = { color: 'EDF7F5' };

  // Мягкая светлая подложка справа внизу для эффекта легкого градиента
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.5,
    y: 2.2,
    w: 5.5,
    h: 3.425,
    fill: { color: 'F6FBFA', transparency: 35 },
    line: { color: 'F6FBFA', transparency: 100 },
  });

  // Функция рисования медицинского плюса (+) из двух прямоугольников
  const drawMedicalCross = (
    cx: number,
    cy: number,
    size: number,
    thickness: number,
    color = 'C3EBE2'
  ) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: cx - size / 2,
      y: cy - thickness / 2,
      w: size,
      h: thickness,
      fill: { color },
      line: { color, transparency: 100 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: cx - thickness / 2,
      y: cy - size / 2,
      w: thickness,
      h: size,
      fill: { color },
      line: { color, transparency: 100 },
    });
  };

  if (variant === 'title') {
    drawMedicalCross(1.15, 0.85, 0.72, 0.24, 'BDE8DF');
    drawMedicalCross(0.65, 0.35, 0.44, 0.14, 'D4F1EB');
    drawMedicalCross(0.48, 2.95, 0.35, 0.11, 'C3EBE2');
    drawMedicalCross(9.35, 4.75, 0.85, 0.28, 'BDE8DF');
  } else if (variant === 'end') {
    drawMedicalCross(9.3, 0.55, 0.85, 0.28, 'BDE8DF');
    drawMedicalCross(3.15, 4.2, 0.9, 0.3, 'CFEFEA');
  } else {
    drawMedicalCross(9.35, 0.48, 0.58, 0.18, 'C3EBE2');
    drawMedicalCross(9.65, 0.95, 0.32, 0.1, 'D6F2EC');
    drawMedicalCross(0.45, 0.95, 0.34, 0.11, 'D6F2EC');
    drawMedicalCross(8.85, 4.95, 0.54, 0.17, 'BDE8DF');
  }

  // Декоративные тонкие линии со станцией-точкой (как на примере Самойловской РБ)
  slide.addShape(pptx.ShapeType.line, {
    x: 0,
    y: 4.95,
    w: 2.6,
    h: 0,
    line: { color: '89C4E1', width: 1.2 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 2.55,
    y: 4.89,
    w: 0.12,
    h: 0.12,
    fill: { color: '89C4E1' },
    line: { color: '89C4E1' },
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 7.2,
    y: 0.65,
    w: 2.8,
    h: 0,
    line: { color: '89C4E1', width: 1.2 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 7.12,
    y: 0.59,
    w: 0.12,
    h: 0.12,
    fill: { color: '89C4E1' },
    line: { color: '89C4E1' },
  });
}

/**
 * ГЕНЕРАТОР №1: 10 слайдов в медицинском стиле (по образцу №2 — Самойловская РБ)
 */
export async function downloadMedical10PresentationPptx(
  meta: PresentationMetadata = DEFAULT_PRESENTATION_METADATA,
  fileName = 'Prezentaciya_Kursovoy_Lapa_Pomoshchi_10_slaydov.pptx'
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.author = meta.studentName;
  pptx.company = meta.institution;
  pptx.subject = 'Курсовой проект МДК 02.02';
  pptx.title = meta.projectTitle;

  const DARK_TEAL = '235357';
  const MED_TEAL = '137A7F';
  const MINT_BOX = '93E5D6';
  const CARD_BG = 'FFFFFF';
  const CARD_BORDER = 'BCE3DC';

  // =========================================================================
  // СЛАЙД 1: ТИТУЛЬНЫЙ ЛИСТ
  // =========================================================================
  const slide1 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide1, 'title');

  slide1.addText(meta.institution, {
    x: 0.8,
    y: 0.25,
    w: 8.4,
    h: 0.75,
    fontFace: 'Georgia',
    fontSize: 13.5,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });

  slide1.addText(
    `Курсовой проект на тему: ${meta.projectTitle}`,
    {
      x: 0.9,
      y: 1.75,
      w: 8.2,
      h: 1.45,
      fontFace: 'Georgia',
      fontSize: 23,
      bold: true,
      color: DARK_TEAL,
      align: 'center',
      valign: 'middle',
    }
  );

  slide1.addText(
    `${meta.studentGenderLabel}\nгруппы ${meta.groupName}\n${meta.studentName}\nПреподаватель:\n${meta.teacherName}`,
    {
      x: 6.7,
      y: 3.75,
      w: 2.9,
      h: 1.45,
      fontFace: 'Georgia',
      fontSize: 13.5,
      bold: true,
      color: DARK_TEAL,
      align: 'left',
      valign: 'top',
    }
  );

  slide1.addText(meta.cityAndYear, {
    x: 3.5,
    y: 5.1,
    w: 3.0,
    h: 0.35,
    fontFace: 'Georgia',
    fontSize: 13.5,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
  });

  // =========================================================================
  // СЛАЙД 2: ЦЕЛЬ И ЗАДАЧИ
  // =========================================================================
  const slide2 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide2, 'content');

  slide2.addText('Цель и задачи', {
    x: 1.0,
    y: 0.45,
    w: 8.0,
    h: 0.65,
    fontFace: 'Georgia',
    fontSize: 30,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
  });

  slide2.addText(
    [
      {
        text: 'Цель:\n',
        options: { bold: true, fontSize: 17, color: MED_TEAL },
      },
      {
        text: 'Создание информационного веб-сайта организации работы ветеринарной клиники «Лапа Помощи» для взаимодействия с владельцами домашних животных и автоматизации онлайн-записи.\n\n',
        options: { fontSize: 15.5, color: MED_TEAL },
      },
      {
        text: 'Задачи:\n',
        options: { bold: true, fontSize: 17, color: MED_TEAL },
      },
      {
        text: '• Определение структуры и функциональности веб-сайта ветеринарного центра.\n',
        options: { fontSize: 15, color: MED_TEAL },
      },
      {
        text: '• Разработка дизайна пользовательского интерфейса и калькулятора услуг.\n',
        options: { fontSize: 15, color: MED_TEAL },
      },
      {
        text: '• Реализация ролевой модели (Клиент, Врач, Администратор) и личных кабинетов.\n',
        options: { fontSize: 15, color: MED_TEAL },
      },
      {
        text: '• Создание базы данных с информацией об услугах, специалистах и записях на приём.',
        options: { fontSize: 15, color: MED_TEAL },
      },
    ],
    {
      x: 1.05,
      y: 1.3,
      w: 8.1,
      h: 3.7,
      fontFace: 'Georgia',
      valign: 'top',
      lineSpacingMultiple: 1.2,
    }
  );

  // =========================================================================
  // СЛАЙД 3: 01. АКТУАЛЬНОСТЬ (Разделительный слайд как на стр. 3 образца)
  // =========================================================================
  const slide3 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide3, 'content');

  // Правая иллюстративная карточка ветеринарной медицины
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 5.35,
    y: 0.75,
    w: 3.75,
    h: 4.15,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1.5 },
  });

  slide3.addShape(pptx.ShapeType.ellipse, {
    x: 6.3,
    y: 1.25,
    w: 1.85,
    h: 1.85,
    fill: { color: 'E3F6F2' },
    line: { color: '137A7F', width: 2 },
  });

  slide3.addText('24/7\nВЕТЦЕНТР', {
    x: 6.3,
    y: 1.65,
    w: 1.85,
    h: 1.05,
    fontFace: 'Arial',
    fontSize: 18,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });

  slide3.addText(
    'Ветеринарная клиника\n«Лапа Помощи»\n\n• 8 узких специалистов\n• Приём без стресса (Fear Free)\n• Онлайн-запись и триаж 24/7',
    {
      x: 5.55,
      y: 3.25,
      w: 3.35,
      h: 1.45,
      fontFace: 'Georgia',
      fontSize: 12.5,
      color: DARK_TEAL,
      align: 'center',
      valign: 'top',
    }
  );

  // Плашка "01." как в образце
  slide3.addShape(pptx.ShapeType.rect, {
    x: 4.55,
    y: 1.1,
    w: 1.25,
    h: 0.78,
    fill: { color: MINT_BOX },
    line: { color: MINT_BOX },
  });

  slide3.addText('01.', {
    x: 4.55,
    y: 1.1,
    w: 1.25,
    h: 0.78,
    fontFace: 'Arial',
    fontSize: 26,
    bold: true,
    color: '123538',
    align: 'center',
    valign: 'middle',
  });

  slide3.addText('Актуальность', {
    x: 0.55,
    y: 2.75,
    w: 4.6,
    h: 0.9,
    fontFace: 'Georgia',
    fontSize: 36,
    bold: true,
    color: DARK_TEAL,
    align: 'left',
  });

  // =========================================================================
  // СЛАЙД 4: АКТУАЛЬНОСТЬ ТЕМЫ КУРСОВОГО ПРОЕКТА
  // =========================================================================
  const slide4 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide4, 'content');

  // 3 карточки слева (как коллаж на слайде 4 образца)
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: 0.65,
    w: 1.95,
    h: 2.0,
    rectRadius: 0.12,
    fill: { color: 'FFFFFF' },
    line: { color: CARD_BORDER, width: 1.5 },
  });
  slide4.addText(
    'Экспресс-\nдиагностика\n\nСобственная лаборатория CITO и УЗИ экспертного класса за 15 минут',
    {
      x: 0.85,
      y: 0.8,
      w: 1.75,
      h: 1.7,
      fontFace: 'Georgia',
      fontSize: 11,
      color: DARK_TEAL,
      align: 'center',
      valign: 'middle',
    }
  );

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 2.9,
    y: 0.65,
    w: 1.95,
    h: 2.0,
    rectRadius: 0.12,
    fill: { color: 'FFFFFF' },
    line: { color: CARD_BORDER, width: 1.5 },
  });
  slide4.addText(
    'Онлайн-запись\nк врачу 24/7\n\nВыбор профильного специалиста и защита от пересечения слотов',
    {
      x: 3.0,
      y: 0.8,
      w: 1.75,
      h: 1.7,
      fontFace: 'Georgia',
      fontSize: 11,
      color: DARK_TEAL,
      align: 'center',
      valign: 'middle',
    }
  );

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: 2.85,
    w: 4.1,
    h: 2.0,
    rectRadius: 0.12,
    fill: { color: 'FFFFFF' },
    line: { color: CARD_BORDER, width: 1.5 },
  });
  slide4.addText(
    'Стационар и раздельные зоны ожидания (Fear Free)\n\nИндивидуальные боксы для кошек, собак и мелких грызунов, круглосуточный мониторинг ОРИТ и электронная медкарта питомца в личном кабинете владельца.',
    {
      x: 0.95,
      y: 3.05,
      w: 3.7,
      h: 1.6,
      fontFace: 'Georgia',
      fontSize: 11.5,
      color: DARK_TEAL,
      align: 'center',
      valign: 'middle',
    }
  );

  // Текст актуальности справа (как на стр. 4 образца)
  slide4.addText(
    'Актуальность темы курсового проекта обусловлена тем, что современным владельцам домашних животных необходим круглосуточный интерактивный сервис для записи на приём без очередей.\n\nРазработанный веб-сайт ветеринарной клиники «Лапа Помощи» обеспечивает прозрачный расчёт стоимости чек-апа, автоматический подбор узкого специалиста по направлению и единую цифровую среду для клиентов, врачей и администратора.',
    {
      x: 5.2,
      y: 1.25,
      w: 4.15,
      h: 3.4,
      fontFace: 'Georgia',
      fontSize: 14.5,
      color: MED_TEAL,
      align: 'justify',
      valign: 'top',
      lineSpacingMultiple: 1.18,
    }
  );

  // =========================================================================
  // СЛАЙД 5: АНАЛИЗ ПРЕДМЕТНОЙ ОБЛАСТИ
  // =========================================================================
  const slide5 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide5, 'content');

  slide5.addText('Анализ предметной области', {
    x: 0.8,
    y: 0.5,
    w: 8.4,
    h: 0.65,
    fontFace: 'Georgia',
    fontSize: 28,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
  });

  slide5.addText(
    'В современном цифровом обществе наличие специализированного онлайн-представительства является ключевым инструментом для обеспечения доступности и прозрачности ветеринарных услуг.\n\nВетеринарная клиника «Лапа Помощи» оказывает круглосуточную помощь кошкам, собакам и грызунам по 8 направлениям (терапия, кардиология, хирургия, УЗИ, стоматология, вакцинация, груминг и стационар). Разработанная веб-платформа связывает каталог услуг, профильных врачей, индивидуальные окна приёма и электронные талоны в единую информационную систему.',
    {
      x: 0.8,
      y: 1.35,
      w: 6.1,
      h: 3.55,
      fontFace: 'Georgia',
      fontSize: 14.5,
      color: MED_TEAL,
      align: 'justify',
      valign: 'top',
      lineSpacingMultiple: 1.18,
    }
  );

  // 2 бирюзовых квадрата справа как на стр. 5 образца
  slide5.addShape(pptx.ShapeType.rect, {
    x: 7.35,
    y: 2.1,
    w: 1.75,
    h: 1.05,
    fill: { color: MINT_BOX },
    line: { color: CARD_BORDER },
  });
  slide5.addText('8 врачей\nузкого профиля', {
    x: 7.35,
    y: 2.1,
    w: 1.75,
    h: 1.05,
    fontFace: 'Georgia',
    fontSize: 13,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });

  slide5.addShape(pptx.ShapeType.rect, {
    x: 7.35,
    y: 3.4,
    w: 1.75,
    h: 1.05,
    fill: { color: MINT_BOX },
    line: { color: CARD_BORDER },
  });
  slide5.addText('Триаж 24/7\nВыезд за 30 мин', {
    x: 7.35,
    y: 3.4,
    w: 1.75,
    h: 1.05,
    fontFace: 'Georgia',
    fontSize: 13,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });

  // =========================================================================
  // СЛАЙД 6: ВЫБОР СРЕДСТВ РАЗРАБОТКИ (3 блока как на стр. 6 образца)
  // =========================================================================
  const slide6 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide6, 'content');

  slide6.addText('Выбор средств разработки', {
    x: 0.8,
    y: 0.5,
    w: 8.4,
    h: 0.65,
    fontFace: 'Georgia',
    fontSize: 28,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
  });

  const col1Title =
    meta.techStackMode === 'academic' ? 'JS / TypeScript' : 'React + TS';
  const col1Desc =
    'клиентская и серверная логика. Обрабатывает запись на приём, калькулятор чек-апа и ролевую авторизацию.';

  const col2Title =
    meta.techStackMode === 'academic' ? 'CSS3' : 'Tailwind CSS';
  const col2Desc =
    'язык стилей. Отвечает за медицинский дизайн, модульную вёрстку и адаптивность под любые экраны.';

  const col3Title =
    meta.techStackMode === 'academic' ? 'MySQL / Cloud DB' : 'Firestore DB';
  const col3Desc =
    'система управления базой данных. Надёжно хранит услуги, расписание врачей, пользователей и заявки.';

  // Левая колонка
  slide6.addShape(pptx.ShapeType.rect, {
    x: 1.65,
    y: 1.45,
    w: 0.72,
    h: 0.72,
    fill: { color: MINT_BOX },
    line: { color: CARD_BORDER },
  });
  slide6.addText('</>', {
    x: 1.65,
    y: 1.45,
    w: 0.72,
    h: 0.72,
    fontFace: 'Consolas',
    fontSize: 18,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });
  slide6.addText(col1Title, {
    x: 0.7,
    y: 2.3,
    w: 2.6,
    h: 0.4,
    fontFace: 'Arial',
    fontSize: 18,
    bold: true,
    color: MED_TEAL,
    align: 'center',
  });
  slide6.addText(col1Desc, {
    x: 0.65,
    y: 2.75,
    w: 2.7,
    h: 1.3,
    fontFace: 'Georgia',
    fontSize: 12.5,
    color: MED_TEAL,
    align: 'center',
    valign: 'top',
  });

  // Центральная колонка (чуть ниже, точно как на стр. 6 образца)
  slide6.addShape(pptx.ShapeType.rect, {
    x: 4.64,
    y: 2.25,
    w: 0.72,
    h: 0.72,
    fill: { color: MINT_BOX },
    line: { color: CARD_BORDER },
  });
  slide6.addText('{ }', {
    x: 4.64,
    y: 2.25,
    w: 0.72,
    h: 0.72,
    fontFace: 'Consolas',
    fontSize: 18,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });
  slide6.addText(col2Title, {
    x: 3.7,
    y: 3.1,
    w: 2.6,
    h: 0.4,
    fontFace: 'Arial',
    fontSize: 18,
    bold: true,
    color: MED_TEAL,
    align: 'center',
  });
  slide6.addText(col2Desc, {
    x: 3.65,
    y: 3.55,
    w: 2.7,
    h: 1.3,
    fontFace: 'Georgia',
    fontSize: 12.5,
    color: MED_TEAL,
    align: 'center',
    valign: 'top',
  });

  // Правая колонка
  slide6.addShape(pptx.ShapeType.rect, {
    x: 7.65,
    y: 1.45,
    w: 0.72,
    h: 0.72,
    fill: { color: MINT_BOX },
    line: { color: CARD_BORDER },
  });
  slide6.addText('DB', {
    x: 7.65,
    y: 1.45,
    w: 0.72,
    h: 0.72,
    fontFace: 'Consolas',
    fontSize: 18,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
    valign: 'middle',
  });
  slide6.addText(col3Title, {
    x: 6.7,
    y: 2.3,
    w: 2.6,
    h: 0.4,
    fontFace: 'Arial',
    fontSize: 18,
    bold: true,
    color: MED_TEAL,
    align: 'center',
  });
  slide6.addText(col3Desc, {
    x: 6.65,
    y: 2.75,
    w: 2.7,
    h: 1.3,
    fontFace: 'Georgia',
    fontSize: 12.5,
    color: MED_TEAL,
    align: 'center',
    valign: 'top',
  });

  // =========================================================================
  // СЛАЙД 7: ПЕРЕЙДЁМ К ПОКАЗУ САЙТА (с наглядным макетом интерфейса)
  // =========================================================================
  const slide7 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide7, 'content');

  slide7.addText('Перейдём к показу сайта', {
    x: 0.8,
    y: 0.45,
    w: 8.4,
    h: 0.65,
    fontFace: 'Georgia',
    fontSize: 28,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
  });

  // Окно браузера (визуальная схема главного экрана сайта «Лапа Помощи»)
  slide7.addShape(pptx.ShapeType.roundRect, {
    x: 1.35,
    y: 1.25,
    w: 7.3,
    h: 3.75,
    rectRadius: 0.1,
    fill: { color: 'FFFFFF' },
    line: { color: '0D9488', width: 1.5 },
  });

  // Верхняя темно-изумрудная полоса шапки сайта
  slide7.addShape(pptx.ShapeType.rect, {
    x: 1.35,
    y: 1.25,
    w: 7.3,
    h: 0.48,
    fill: { color: '0F2922' },
    line: { color: '0F2922' },
  });
  slide7.addText(
    'Лапа Помощи · Ветеринарный центр 24/7      Услуги и цены   Калькулятор   Врачи (8)   Отзывы   [Записаться на прием]',
    {
      x: 1.5,
      y: 1.25,
      w: 7.0,
      h: 0.48,
      fontFace: 'Arial',
      fontSize: 9.5,
      bold: true,
      color: 'FFFFFF',
      valign: 'middle',
    }
  );

  // Левая часть Hero-блока внутри макета
  slide7.addText(
    'Бережная медицина для тех, кто доверяет вам свою жизнь\n\n• Круглосуточный госпиталь (УЗИ, ЭхоКГ, эндоскопия)\n• Индивидуальные окна записи к каждому врачу\n• Интерактивный калькулятор чек-апа за 30 секунд',
    {
      x: 1.65,
      y: 1.9,
      w: 4.15,
      h: 1.75,
      fontFace: 'Georgia',
      fontSize: 11,
      bold: true,
      color: '132A23',
      valign: 'top',
    }
  );

  // 3 карточки ролей внизу макета
  const roleCards = [
    {
      title: 'Кабинет Клиента',
      desc: 'Медкарта питомца, талон приёма (.txt), перенос визита',
      x: 1.65,
      color: 'E6F4F1',
    },
    {
      title: 'Кабинет Врача',
      desc: 'Приём пациентов, выписка рекомендаций, график смен',
      x: 3.95,
      color: 'FEF3C7',
    },
    {
      title: 'Админ-панель CRM',
      desc: 'Управление заявками, прайсом, врачами и графиком 2/2',
      x: 6.25,
      color: 'DBEAFE',
    },
  ];

  roleCards.forEach((rc) => {
    slide7.addShape(pptx.ShapeType.roundRect, {
      x: rc.x,
      y: 3.75,
      w: 2.15,
      h: 1.0,
      rectRadius: 0.08,
      fill: { color: rc.color },
      line: { color: CARD_BORDER },
    });
    slide7.addText(`${rc.title}\n${rc.desc}`, {
      x: rc.x + 0.08,
      y: 3.83,
      w: 1.99,
      h: 0.84,
      fontFace: 'Georgia',
      fontSize: 9.5,
      color: '132A23',
      align: 'center',
      valign: 'middle',
    });
  });

  // Правая карточка в макете
  slide7.addShape(pptx.ShapeType.roundRect, {
    x: 6.0,
    y: 1.9,
    w: 2.4,
    h: 1.65,
    rectRadius: 0.08,
    fill: { color: 'EAF2EE' },
    line: { color: '0D9488' },
  });
  slide7.addText(
    'Стандарт Fear Free\nРейтинг 4.9 / 5.0\n\nТерапия · Кардиология\nХирургия · УЗИ · Ратология',
    {
      x: 6.08,
      y: 2.0,
      w: 2.24,
      h: 1.45,
      fontFace: 'Georgia',
      fontSize: 10,
      bold: true,
      color: '0F766E',
      align: 'center',
      valign: 'middle',
    }
  );

  // =========================================================================
  // СЛАЙД 8: РЕЗУЛЬТАТ РАБОТЫ (шахматное расположение как на стр. 8 образца)
  // =========================================================================
  const slide8 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide8, 'content');

  slide8.addText('Результат работы', {
    x: 0.8,
    y: 0.45,
    w: 8.4,
    h: 0.65,
    fontFace: 'Georgia',
    fontSize: 28,
    bold: true,
    color: DARK_TEAL,
    align: 'center',
  });

  // Левый столбец (3 пункта)
  slide8.addText('Показ информации об услугах, ценах и 8 врачах клиники', {
    x: 0.75,
    y: 1.35,
    w: 4.5,
    h: 0.55,
    fontFace: 'Georgia',
    fontSize: 15,
    color: MED_TEAL,
  });

  slide8.addText('Онлайн-запись к врачу с защитой от занятых слотов и талоном', {
    x: 0.75,
    y: 2.55,
    w: 4.5,
    h: 0.55,
    fontFace: 'Georgia',
    fontSize: 15,
    color: MED_TEAL,
  });

  slide8.addText('Интерактивный калькулятор чек-апа и медкарта питомца', {
    x: 0.75,
    y: 3.75,
    w: 4.5,
    h: 0.55,
    fontFace: 'Georgia',
    fontSize: 15,
    color: MED_TEAL,
  });

  // Правый столбец со смещением по вертикали (как на слайде 8 примера)
  slide8.addText('Реализация ролевого входа (Клиент, Врач, Администратор)', {
    x: 4.75,
    y: 1.95,
    w: 4.65,
    h: 0.55,
    fontFace: 'Georgia',
    fontSize: 15,
    color: MED_TEAL,
  });

  slide8.addText('Управление заявками, прайс-листом и сменами с админ-панели', {
    x: 4.75,
    y: 3.15,
    w: 4.65,
    h: 0.55,
    fontFace: 'Georgia',
    fontSize: 15,
    color: MED_TEAL,
  });

  slide8.addText('Публикация отзывов клиентов и выписка рекомендаций врачом', {
    x: 4.75,
    y: 4.3,
    w: 4.65,
    h: 0.55,
    fontFace: 'Georgia',
    fontSize: 15,
    color: MED_TEAL,
  });

  // =========================================================================
  // СЛАЙД 9: БУДУЩИЕ ПЛАНЫ
  // =========================================================================
  const slide9 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide9, 'content');

  slide9.addText('Будущие планы', {
    x: 0.8,
    y: 0.45,
    w: 8.4,
    h: 0.65,
    fontFace: 'Arial',
    fontSize: 28,
    bold: true,
    color: MED_TEAL,
    align: 'center',
  });

  slide9.addText(
    [
      {
        text: '•   Улучшение функционала личного кабинета и истории болезни питомца\n\n',
        options: { fontSize: 16.5, color: MED_TEAL },
      },
      {
        text: '•   Добавление онлайн-консультаций с дежурным ветеринаром по видеосвязи\n\n',
        options: { fontSize: 16.5, color: MED_TEAL },
      },
      {
        text: '•   Автоматическая загрузка PDF-протоколов УЗИ и биохимии крови\n\n',
        options: { fontSize: 16.5, color: MED_TEAL },
      },
      {
        text: '•   Отправка уведомлений и напоминаний о вакцинации на почту и в Telegram',
        options: { fontSize: 16.5, color: MED_TEAL },
      },
    ],
    {
      x: 0.9,
      y: 1.55,
      w: 8.3,
      h: 3.3,
      fontFace: 'Georgia',
      valign: 'top',
    }
  );

  // =========================================================================
  // СЛАЙД 10: СПАСИБО ЗА ВНИМАНИЕ
  // =========================================================================
  const slide10 = pptx.addSlide();
  addMedicalSlideBackground(pptx, slide10, 'end');

  slide10.addText('Спасибо за внимание', {
    x: 1.0,
    y: 2.15,
    w: 8.0,
    h: 1.1,
    fontFace: 'Georgia',
    fontSize: 38,
    color: MED_TEAL,
    align: 'center',
    valign: 'middle',
  });

  await pptx.writeFile({
    fileName,
  });
}

/**
 * ГЕНЕРАТОР №2: 6 слайдов в классическом стиле с нумерованными задачами 1–5 (по образцу №1 — LADA)
 */
export async function downloadClassic6PresentationPptx(
  meta: PresentationMetadata = DEFAULT_PRESENTATION_METADATA,
  fileName = 'Prezentaciya_Kursovoy_Lapa_Pomoshchi_6_slaydov.pptx'
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = meta.studentName;
  pptx.company = meta.institution;
  pptx.subject = meta.mdkLine;
  pptx.title = meta.projectTitle;

  const addStripedCyanBackground = (slide: PptxGenJS.Slide) => {
    const bands = [
      '96F7FC',
      'A8F8FC',
      'B8F9FD',
      'C9FAFD',
      'D8FBFD',
      'E5FCFE',
      'F1FDFE',
      'FFFFFF',
    ];
    const bandH = 5.625 / bands.length;
    bands.forEach((col, idx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: idx * bandH,
        w: 10,
        h: bandH + 0.02,
        fill: { color: col },
        line: { color: col, transparency: 100 },
      });
    });
  };

  // СЛАЙД 1: ТИТУЛЬНЫЙ
  const s1 = pptx.addSlide();
  addStripedCyanBackground(s1);

  s1.addText(
    'ГОСУДАРСТВЕННОЕ АВТОНОМНОЕ ПРОФЕССИОНАЛЬНОЕ\nУЧРЕЖДЕНИЕ САРАТОВСКОЙ ОБЛАСТИ\n«Балашовский техникум механизации сельского\nхозяйства»',
    {
      x: 0.8,
      y: 0.25,
      w: 8.4,
      h: 1.1,
      fontFace: 'Courier New',
      fontSize: 13.5,
      bold: true,
      color: '000000',
      align: 'center',
    }
  );

  s1.addText(
    `КУРСОВОЙ ПРОЕКТ\n${meta.mdkLine} НА\nТЕМУ:\nСоздание веб-сайта ветеринарной клиники\n«Лапа Помощи»`,
    {
      x: 0.8,
      y: 1.95,
      w: 8.4,
      h: 1.55,
      fontFace: 'Courier New',
      fontSize: 14.5,
      bold: true,
      color: '000000',
      align: 'center',
    }
  );

  s1.addText(
    `Подготовил\nстудент группы ${meta.groupName}\n${meta.studentName}\nПреподаватель:\n${meta.teacherName}`,
    {
      x: 6.9,
      y: 3.7,
      w: 2.8,
      h: 1.35,
      fontFace: 'Courier New',
      fontSize: 12.5,
      bold: true,
      color: '000000',
      align: 'left',
    }
  );

  s1.addText(meta.cityAndYear, {
    x: 3.5,
    y: 5.15,
    w: 3.0,
    h: 0.35,
    fontFace: 'Courier New',
    fontSize: 13,
    bold: true,
    color: '000000',
    align: 'center',
  });

  // СЛАЙД 2: АНАЛИЗ ПРЕДМЕТНОЙ ОБЛАСТИ
  const s2 = pptx.addSlide();
  addStripedCyanBackground(s2);

  s2.addText('Анализ предметной\nобласти', {
    x: 1.5,
    y: 0.2,
    w: 7.0,
    h: 0.85,
    fontFace: 'Courier New',
    fontSize: 22,
    bold: true,
    color: '000000',
    align: 'center',
  });

  s2.addText(
    'Ветеринарная клиника «Лапа Помощи» –\nсовременный круглосуточный ветеринарный\nцентр, специализирующийся на диагностике,\nтерапии, хирургии и вакцинации собак,\nкошек и мелких грызунов.\n\nОсновная цель клиники – предоставление\nдоказательной ветеринарной помощи без\nстресса (Fear Free), удобной онлайн-записи\nк узким специалистам и ведение электронной\nмедкарты каждого пациента.',
    {
      x: 0.7,
      y: 1.15,
      w: 5.1,
      h: 4.1,
      fontFace: 'Courier New',
      fontSize: 13.5,
      color: '000000',
      valign: 'top',
    }
  );

  s2.addShape(pptx.ShapeType.ellipse, {
    x: 5.95,
    y: 1.0,
    w: 3.55,
    h: 3.55,
    fill: { color: 'FFFFFF' },
    line: { color: '0F2922', width: 2 },
  });
  s2.addText('ЛАПА\nПОМОЩИ\n\nВетеринарный\nцентр 24/7', {
    x: 6.2,
    y: 1.65,
    w: 3.05,
    h: 2.25,
    fontFace: 'Courier New',
    fontSize: 20,
    bold: true,
    color: '0F766E',
    align: 'center',
    valign: 'middle',
  });

  // СЛАЙД 3: ВЫБОР И АНАЛИЗ СРЕДСТВ ДЛЯ СОЗДАНИЯ САЙТА
  const s3 = pptx.addSlide();
  addStripedCyanBackground(s3);

  s3.addText('Выбор и анализ средств\nдля создания сайта', {
    x: 1.5,
    y: 0.35,
    w: 7.0,
    h: 0.85,
    fontFace: 'Courier New',
    fontSize: 21,
    bold: true,
    color: '000000',
    align: 'center',
  });

  const cards =
    meta.techStackMode === 'academic'
      ? [
          { top: '</>', bottom: 'HTML5', color: 'E34F26' },
          { top: '{ }', bottom: 'CSS3', color: '1572B6' },
          { top: 'JS / TS', bottom: '</>', color: 'D97706' },
          { top: 'DB', bottom: 'Firestore / SQL', color: '0D9488' },
        ]
      : [
          { top: 'JSX', bottom: 'React 19', color: '0284C7' },
          { top: '{ }', bottom: 'Tailwind CSS', color: '0D9488' },
          { top: 'TS', bottom: 'TypeScript', color: '2563EB' },
          { top: 'DB', bottom: 'Firestore', color: 'EA580C' },
        ];

  cards.forEach((c, idx) => {
    const xPos = 0.85 + idx * 2.22;
    s3.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 2.0,
      w: 1.65,
      h: 2.05,
      rectRadius: 0.1,
      fill: { color: '2D2D2D' },
      line: { color: '111111', width: 1.5 },
    });
    s3.addText(c.top, {
      x: xPos,
      y: 2.25,
      w: 1.65,
      h: 0.65,
      fontFace: 'Consolas',
      fontSize: 22,
      bold: true,
      color: c.color,
      align: 'center',
    });
    s3.addText(c.bottom, {
      x: xPos,
      y: 3.05,
      w: 1.65,
      h: 0.65,
      fontFace: 'Arial',
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });
  });

  // СЛАЙД 4: ЦЕЛЬ И ЗАДАЧИ (с синими квадратами 1–5 как на стр. 4 образца LADA)
  const s4 = pptx.addSlide();
  addStripedCyanBackground(s4);

  s4.addText('Цель курсового проекта: разработка\nсайта «Лапа Помощи»', {
    x: 1.2,
    y: 0.2,
    w: 7.6,
    h: 0.85,
    fontFace: 'Courier New',
    fontSize: 19,
    bold: true,
    color: '000000',
    align: 'center',
  });

  const tasks5 = [
    'Разработать структуру и архитектуру веб-платформы ветеринарной клиники;',
    'Спроектировать пользовательский интерфейс, каталог услуг и калькулятор чек-апа;',
    'Реализовать веб-платформу с учётом ролевой модели (администратор, врач, клиент);',
    'Обеспечить функционал личного кабинета клиента: онлайн-запись, медкарта питомца, талон приёма и перенос визита;',
    'Провести тестирование и оптимизацию платформы для корректной работы на различных устройствах.',
  ];

  tasks5.forEach((tText, idx) => {
    const yPos = 1.18 + idx * 0.84;
    s4.addShape(pptx.ShapeType.roundRect, {
      x: 2.75,
      y: yPos,
      w: 0.62,
      h: 0.62,
      rectRadius: 0.1,
      fill: { color: '0EA5E9' },
      line: { color: '0284C7', width: 1 },
    });
    s4.addText(String(idx + 1), {
      x: 2.75,
      y: yPos,
      w: 0.62,
      h: 0.62,
      fontFace: 'Courier New',
      fontSize: 18,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    s4.addText(tText, {
      x: 3.55,
      y: yPos - 0.04,
      w: 5.85,
      h: 0.72,
      fontFace: 'Courier New',
      fontSize: 11.5,
      color: '000000',
      valign: 'middle',
    });
  });

  // СЛАЙД 5: ДЕМОНСТРАЦИЯ САЙТА
  const s5 = pptx.addSlide();
  addStripedCyanBackground(s5);

  s5.addText('Демонстрация сайта', {
    x: 1.0,
    y: 2.25,
    w: 8.0,
    h: 1.0,
    fontFace: 'Courier New',
    fontSize: 28,
    bold: true,
    color: '000000',
    align: 'center',
    valign: 'middle',
  });

  // СЛАЙД 6: СПАСИБО ЗА ВНИМАНИЕ!
  const s6 = pptx.addSlide();
  addStripedCyanBackground(s6);

  s6.addText('СПАСИБО ЗА ВНИМАНИЕ!', {
    x: 1.0,
    y: 2.25,
    w: 8.0,
    h: 1.0,
    fontFace: 'Courier New',
    fontSize: 28,
    bold: true,
    color: '000000',
    align: 'center',
    valign: 'middle',
  });

  await pptx.writeFile({
    fileName,
  });
}

/**
 * ГЕНЕРАТОР №3: 9 слайдов точь-в-точь по образцу Prezentaciya_FRAG.pdf
 * (Тёмный современный стиль, карточки с неоновым акцентом, 01–06 разделы, БТМСХ ИП-41, Сухова Л.Г.)
 */
export async function downloadFrag9PresentationPptx(
  meta: PresentationMetadata = {
    ...DEFAULT_PRESENTATION_METADATA,
    studentName: 'Кривошеев К.Д.',
    groupName: 'ИП-41',
    teacherName: 'Сухова Л.Г.',
    cityAndYear: 'Балашов, 2026',
  },
  fileName = 'Prezentaciya_Lapa_Pomoshchi_FRAG_9_slaydov.pptx'
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.author = meta.studentName;
  pptx.company = meta.institution;
  pptx.subject = 'КУРСОВОЙ ПРОЕКТ · МДК 02.02';
  pptx.title = 'Веб-сайт ветеринарной клиники Лапа Помощи';

  const BG_DARK = '121212';
  const CARD_BG = '1B1B1B';
  const CARD_BORDER = '2C2C2C';
  const LIME = 'C8F542';
  const PURPLE = 'B9A6F8';
  const WHITE = 'FFFFFF';
  const GREY_TEXT = '9E9E9E';
  const MUTED_TEXT = '6E6E6E';

  const addDarkHeaderAndFooter = (
    slide: PptxGenJS.Slide,
    sectionEyebrow: string,
    heading: string,
    pageNum: number
  ) => {
    slide.background = { color: BG_DARK };

    slide.addText(sectionEyebrow, {
      x: 0.45,
      y: 0.28,
      w: 8.5,
      h: 0.25,
      fontFace: 'Courier New',
      fontSize: 10,
      bold: true,
      color: LIME,
      charSpacing: 2.5,
    });

    slide.addText(heading, {
      x: 0.45,
      y: 0.56,
      w: 9.0,
      h: 0.55,
      fontFace: 'Arial',
      fontSize: 25,
      bold: true,
      color: WHITE,
    });

    slide.addText('ЛАПА ПОМОЩИ / VET CLINIC · КУРСОВОЙ ПРОЕКТ', {
      x: 0.45,
      y: 5.2,
      w: 6.5,
      h: 0.25,
      fontFace: 'Courier New',
      fontSize: 8.5,
      color: MUTED_TEXT,
    });

    slide.addText(String(pageNum), {
      x: 8.8,
      y: 5.2,
      w: 0.75,
      h: 0.25,
      fontFace: 'Courier New',
      fontSize: 9,
      color: MUTED_TEXT,
      align: 'right',
    });
  };

  const addRoundEmblem = (
    slide: PptxGenJS.Slide,
    cx: number,
    cy: number,
    diameter: number
  ) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - diameter / 2,
      y: cy - diameter / 2,
      w: diameter,
      h: diameter,
      fill: { color: '141414' },
      line: { color: '262626', width: 1.5 },
    });

    const innerD = diameter * 0.9;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - innerD / 2,
      y: cy - innerD / 2,
      w: innerD,
      h: innerD,
      fill: { color: '141414' },
      line: { color: '2F2F2F', width: 1 },
    });

    const isLarge = diameter > 2.2;
    slide.addText(
      [
        {
          text: 'ЛАПА ',
          options: {
            fontSize: isLarge ? 30 : 20,
            bold: true,
            color: WHITE,
            fontFace: 'Arial',
          },
        },
        {
          text: '*',
          options: {
            fontSize: isLarge ? 34 : 22,
            bold: true,
            color: LIME,
            fontFace: 'Courier New',
          },
        },
      ],
      {
        x: cx - innerD / 2,
        y: cy - (isLarge ? 0.58 : 0.4),
        w: innerD,
        h: isLarge ? 0.55 : 0.38,
        align: 'center',
        valign: 'middle',
      }
    );

    slide.addText('ПОМОЩИ · 24/7', {
      x: cx - innerD / 2,
      y: cy + (isLarge ? 0.04 : 0.02),
      w: innerD,
      h: 0.28,
      fontFace: 'Arial',
      fontSize: isLarge ? 11.5 : 8.5,
      bold: true,
      color: LIME,
      align: 'center',
    });

    slide.addText('МОСКВА · 24/7 · 8 ВРАЧЕЙ', {
      x: cx - innerD / 2,
      y: cy + (isLarge ? 0.32 : 0.24),
      w: innerD,
      h: 0.24,
      fontFace: 'Arial',
      fontSize: isLarge ? 8 : 6.5,
      color: GREY_TEXT,
      align: 'center',
    });
  };

  // =========================================================================
  // СЛАЙД 1: ТИТУЛЬНЫЙ ЛИСТ (1-в-1 как в FRAG)
  // =========================================================================
  const s1 = pptx.addSlide();
  s1.background = { color: BG_DARK };

  s1.addText(
    'ГАПОУ СО «Балашовский техникум механизации сельского хозяйства»',
    {
      x: 0.45,
      y: 0.38,
      w: 7.5,
      h: 0.3,
      fontFace: 'Arial',
      fontSize: 10.5,
      color: GREY_TEXT,
    }
  );

  s1.addText('КУРСОВОЙ ПРОЕКТ · МДК 02.02', {
    x: 0.45,
    y: 1.02,
    w: 5.5,
    h: 0.28,
    fontFace: 'Courier New',
    fontSize: 10.5,
    bold: true,
    color: LIME,
    charSpacing: 2.5,
  });

  s1.addText('Веб-сайт ветеринарной\nклиники', {
    x: 0.45,
    y: 1.35,
    w: 5.5,
    h: 1.0,
    fontFace: 'Arial',
    fontSize: 31,
    bold: true,
    color: WHITE,
    lineSpacingMultiple: 1.05,
  });

  s1.addText('Лапа Помощи / Vet Clinic', {
    x: 0.45,
    y: 2.38,
    w: 5.6,
    h: 0.55,
    fontFace: 'Arial',
    fontSize: 30,
    bold: true,
    color: LIME,
  });

  s1.addText(
    'Онлайн-запись к профильным врачам, личный кабинет\nвладельца питомца, кабинет врача и панель администратора',
    {
      x: 0.45,
      y: 2.98,
      w: 5.4,
      h: 0.65,
      fontFace: 'Arial',
      fontSize: 12.5,
      color: GREY_TEXT,
      lineSpacingMultiple: 1.2,
    }
  );

  s1.addText('Выполнил', {
    x: 0.45,
    y: 4.12,
    w: 2.2,
    h: 0.22,
    fontFace: 'Arial',
    fontSize: 9.5,
    color: GREY_TEXT,
  });
  s1.addText(`${meta.studentName}, гр. ${meta.groupName}`, {
    x: 0.45,
    y: 4.34,
    w: 2.5,
    h: 0.3,
    fontFace: 'Arial',
    fontSize: 13,
    bold: true,
    color: WHITE,
  });

  s1.addText('Преподаватель', {
    x: 3.0,
    y: 4.12,
    w: 2.2,
    h: 0.22,
    fontFace: 'Arial',
    fontSize: 9.5,
    color: GREY_TEXT,
  });
  s1.addText(meta.teacherName, {
    x: 3.0,
    y: 4.34,
    w: 2.2,
    h: 0.3,
    fontFace: 'Arial',
    fontSize: 13,
    bold: true,
    color: WHITE,
  });

  s1.addText('Балашов, 2026', {
    x: 0.45,
    y: 5.1,
    w: 2.5,
    h: 0.25,
    fontFace: 'Courier New',
    fontSize: 9.5,
    color: MUTED_TEXT,
  });

  addRoundEmblem(s1, 7.65, 2.55, 2.75);

  s1.addText('МОСКВА  ·  24/7  ·  8 ВРАЧЕЙ', {
    x: 6.0,
    y: 4.25,
    w: 3.3,
    h: 0.28,
    fontFace: 'Courier New',
    fontSize: 10,
    bold: true,
    color: LIME,
    align: 'center',
    charSpacing: 2,
  });

  // =========================================================================
  // СЛАЙД 2: 01 / ПРЕДМЕТНАЯ ОБЛАСТЬ (Анализ предметной области)
  // =========================================================================
  const s2 = pptx.addSlide();
  addDarkHeaderAndFooter(
    s2,
    '01 / ПРЕДМЕТНАЯ ОБЛАСТЬ',
    'Анализ предметной области',
    2
  );

  s2.addText(
    [
      {
        text: 'Лапа Помощи',
        options: { bold: true, color: LIME },
      },
      {
        text: ' — круглосуточный ветеринарный центр в Москве: 8 узких специалистов, собственная экспресс-лаборатория, хирургия и стационар.',
        options: { color: WHITE },
      },
    ],
    {
      x: 0.45,
      y: 1.25,
      w: 4.55,
      h: 0.85,
      fontFace: 'Arial',
      fontSize: 13,
      valign: 'top',
    }
  );

  s2.addText('Проблема', {
    x: 0.45,
    y: 2.18,
    w: 4.55,
    h: 0.3,
    fontFace: 'Arial',
    fontSize: 13.5,
    bold: true,
    color: WHITE,
  });
  s2.addText(
    'Запись по телефону и в мессенджерах приводит к живым очередям, накладкам в расписании врачей и потере клиентов, которым нужна помощь ночью.',
    {
      x: 0.45,
      y: 2.5,
      w: 4.55,
      h: 0.85,
      fontFace: 'Arial',
      fontSize: 11.5,
      color: GREY_TEXT,
      valign: 'top',
    }
  );

  s2.addText('Решение', {
    x: 0.45,
    y: 3.45,
    w: 4.55,
    h: 0.3,
    fontFace: 'Arial',
    fontSize: 13.5,
    bold: true,
    color: WHITE,
  });
  s2.addText(
    'Сайт с онлайн-записью по свободным слотам, калькулятором чек-апа, кабинетом врача и панелью администратора.',
    {
      x: 0.45,
      y: 3.77,
      w: 4.55,
      h: 0.7,
      fontFace: 'Arial',
      fontSize: 11.5,
      color: GREY_TEXT,
      valign: 'top',
    }
  );

  const s2Stats = [
    {
      x: 5.25,
      y: 1.22,
      val: '8',
      color: LIME,
      desc: 'узкопрофильных ветеринарных врачей',
    },
    {
      x: 7.47,
      y: 1.22,
      val: '24/7',
      color: LIME,
      desc: 'клиника и стационар открыты круглосуточно',
    },
    {
      x: 5.25,
      y: 3.05,
      val: '1 500 ₽',
      color: LIME,
      desc: 'Первичный приём · осмотр и консультация',
    },
    {
      x: 7.47,
      y: 3.05,
      val: '30 мин',
      color: PURPLE,
      desc: 'Экстренный выезд · ветмобиль с УЗИ и ЭКГ',
    },
  ];

  s2Stats.forEach((st) => {
    s2.addShape(pptx.ShapeType.roundRect, {
      x: st.x,
      y: st.y,
      w: 2.08,
      h: 1.68,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    s2.addText(st.val, {
      x: st.x + 0.18,
      y: st.y + 0.25,
      w: 1.72,
      h: 0.55,
      fontFace: 'Arial',
      fontSize: 27,
      bold: true,
      color: st.color,
    });
    s2.addText(st.desc, {
      x: st.x + 0.18,
      y: st.y + 0.92,
      w: 1.72,
      h: 0.55,
      fontFace: 'Arial',
      fontSize: 10,
      color: GREY_TEXT,
      valign: 'top',
    });
  });

  // =========================================================================
  // СЛАЙД 3: 02 / ОБОСНОВАНИЕ (Зачем клинике собственный сайт)
  // =========================================================================
  const s3 = pptx.addSlide();
  addDarkHeaderAndFooter(
    s3,
    '02 / ОБОСНОВАНИЕ',
    'Зачем клинике собственный сайт',
    3
  );

  const s3Columns = [
    {
      title: 'ДЛЯ ВЛАДЕЛЬЦЕВ',
      accent: LIME,
      items: [
        'Запись на приём в любое время суток без звонка',
        'Видно свободные окна врача и цену заранее',
        'Медкарта питомца и талон закреплены в кабинете',
      ],
    },
    {
      title: 'ДЛЯ ВРАЧА И АДМИНА',
      accent: LIME,
      items: [
        'Расписание приёмов и смен в реальном времени',
        'Запись пациента без брони в один клик',
        'Меньше звонков и ошибок при записи',
      ],
    },
    {
      title: 'ДЛЯ КЛИНИКИ',
      accent: PURPLE,
      items: [
        'Новые клиенты и обращения из интернета',
        'Статистика выручки по направлениям и врачам',
        'Современный имидж ветеринарного центра',
      ],
    },
  ];

  s3Columns.forEach((col, cIdx) => {
    const xPos = 0.45 + cIdx * 3.11;
    s3.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.22,
      w: 2.88,
      h: 3.65,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    s3.addText(col.title, {
      x: xPos + 0.22,
      y: 1.48,
      w: 2.44,
      h: 0.26,
      fontFace: 'Courier New',
      fontSize: 10,
      bold: true,
      color: col.accent,
      charSpacing: 1.5,
    });

    col.items.forEach((itemText, iIdx) => {
      const yItem = 2.0 + iIdx * 0.92;
      s3.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.22,
        y: yItem,
        w: 0.38,
        h: 0.32,
        rectRadius: 0.06,
        fill: { color: col.accent },
        line: { color: col.accent, width: 0 },
      });
      s3.addText(`0${iIdx + 1}`, {
        x: xPos + 0.22,
        y: yItem,
        w: 0.38,
        h: 0.32,
        fontFace: 'Courier New',
        fontSize: 9.5,
        bold: true,
        color: '111111',
        align: 'center',
        valign: 'middle',
      });
      s3.addText(itemText, {
        x: xPos + 0.72,
        y: yItem - 0.04,
        w: 1.98,
        h: 0.48,
        fontFace: 'Arial',
        fontSize: 11,
        color: WHITE,
        valign: 'middle',
      });
    });
  });

  // =========================================================================
  // СЛАЙД 4: 03 / ЦЕЛЬ И ЗАДАЧИ (Цель и задачи проекта)
  // =========================================================================
  const s4 = pptx.addSlide();
  addDarkHeaderAndFooter(
    s4,
    '03 / ЦЕЛЬ И ЗАДАЧИ',
    'Цель и задачи проекта',
    4
  );

  s4.addShape(pptx.ShapeType.roundRect, {
    x: 0.45,
    y: 1.22,
    w: 9.1,
    h: 0.78,
    rectRadius: 0.08,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  s4.addText(
    [
      {
        text: 'Цель: ',
        options: { bold: true, color: LIME },
      },
      {
        text: 'разработать веб-сайт для онлайн-записи пациентов и взаимодействия с клиентами ветеринарной клиники «Лапа Помощи»',
        options: { color: WHITE },
      },
    ],
    {
      x: 0.68,
      y: 1.32,
      w: 8.64,
      h: 0.58,
      fontFace: 'Arial',
      fontSize: 13,
      valign: 'middle',
    }
  );

  const s4Tasks = [
    'Изучить предметную область и выбрать средства разработки',
    'Спроектировать структуру сайта, базу данных и ролевую модель',
    'Реализовать онлайн-запись к врачам и калькулятор чек-апа',
    'Реализовать кабинеты клиента, врача и панель администратора',
    'Протестировать сайт на разных устройствах и в браузерах',
  ];

  s4Tasks.forEach((tText, idx) => {
    const xPos = 0.45 + idx * 1.85;
    s4.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 2.22,
      w: 1.7,
      h: 2.65,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    s4.addText(`0${idx + 1}`, {
      x: xPos + 0.16,
      y: 2.42,
      w: 1.38,
      h: 0.4,
      fontFace: 'Courier New',
      fontSize: 20,
      bold: true,
      color: LIME,
    });
    s4.addText(tText, {
      x: xPos + 0.16,
      y: 2.95,
      w: 1.38,
      h: 1.7,
      fontFace: 'Arial',
      fontSize: 10.5,
      color: WHITE,
      valign: 'top',
    });
  });

  // =========================================================================
  // СЛАЙД 5: 04 / СРЕДСТВА РАЗРАБОТКИ (Выбор средств разработки)
  // =========================================================================
  const s5 = pptx.addSlide();
  addDarkHeaderAndFooter(
    s5,
    '04 / СРЕДСТВА РАЗРАБОТКИ',
    'Выбор средств разработки',
    5
  );

  const techCards = [
    {
      badge: 'HTML5',
      badgeBg: 'E34F26',
      badgeColor: WHITE,
      title: 'HTML5',
      desc: 'структура страниц и мета-теги',
    },
    {
      badge: 'CSS3',
      badgeBg: '1572B6',
      badgeColor: WHITE,
      title: 'CSS3 + Tailwind',
      desc: 'медицинский дизайн и адаптивная вёрстка',
    },
    {
      badge: 'TS',
      badgeBg: '2563EB',
      badgeColor: WHITE,
      title: 'TypeScript',
      desc: 'типизированная логика сайта',
    },
    {
      badge: 'React',
      badgeBg: '22262F',
      badgeColor: '38BDF8',
      title: 'React 19',
      desc: 'компонентный интерфейс SPA',
    },
    {
      badge: 'Node.js',
      badgeBg: '2E7D32',
      badgeColor: WHITE,
      title: 'Vite + Node.js',
      desc: 'сборка проекта и серверная среда',
    },
    {
      badge: 'DB',
      badgeBg: '0284C7',
      badgeColor: WHITE,
      title: 'Firestore / SQL',
      desc: 'пользователи, врачи, услуги и записи',
    },
  ];

  techCards.forEach((tc, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const xPos = 0.45 + col * 3.11;
    const yPos = 1.22 + row * 1.62;

    s5.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 2.88,
      h: 1.46,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    s5.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.22,
      y: yPos + 0.33,
      w: 0.72,
      h: 0.72,
      rectRadius: 0.12,
      fill: { color: tc.badgeBg },
      line: { color: tc.badgeBg, width: 0 },
    });

    s5.addText(tc.badge, {
      x: xPos + 0.22,
      y: yPos + 0.33,
      w: 0.72,
      h: 0.72,
      fontFace: 'Arial',
      fontSize: tc.badge.length > 5 ? 10.5 : 13,
      bold: true,
      color: tc.badgeColor,
      align: 'center',
      valign: 'middle',
    });

    s5.addText(tc.title, {
      x: xPos + 1.08,
      y: yPos + 0.32,
      w: 1.65,
      h: 0.32,
      fontFace: 'Arial',
      fontSize: 13.5,
      bold: true,
      color: WHITE,
    });

    s5.addText(tc.desc, {
      x: xPos + 1.08,
      y: yPos + 0.66,
      w: 1.65,
      h: 0.52,
      fontFace: 'Arial',
      fontSize: 10,
      color: GREY_TEXT,
      valign: 'top',
    });
  });

  s5.addText(
    'Среда разработки: Visual Studio Code · контроль версий: Git и GitHub',
    {
      x: 0.45,
      y: 4.58,
      w: 8.5,
      h: 0.28,
      fontFace: 'Arial',
      fontSize: 11,
      color: GREY_TEXT,
    }
  );

  // =========================================================================
  // СЛАЙД 6: 05 / БАЗА ДАННЫХ (Структура базы данных)
  // =========================================================================
  const s6 = pptx.addSlide();
  addDarkHeaderAndFooter(
    s6,
    '05 / БАЗА ДАННЫХ',
    'Структура базы данных проекта',
    6
  );

  const dbTables = [
    {
      code: 'users',
      title: 'Пользователи',
      fields: 'uid, login, displayName\npassword, phone\nrole (роль в системе)',
    },
    {
      code: 'appointments',
      title: 'Записи на приём',
      fields: 'id, ownerName, petName\ndoctorName, serviceTitle\npreferredDate, status',
    },
    {
      code: 'doctors',
      title: 'Врачи и смены',
      fields: 'id, name, specialty\nbrigade, shiftHours\npersonalSlots, status',
    },
    {
      code: 'services',
      title: 'Услуги и отзывы',
      fields: 'id, title, category\npriceFrom, duration\nrating, story, outcome',
    },
  ];

  dbTables.forEach((tb, idx) => {
    const xPos = 0.45 + idx * 2.31;
    s6.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.22,
      w: 2.17,
      h: 2.52,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    s6.addText(tb.code, {
      x: xPos + 0.18,
      y: 1.44,
      w: 1.8,
      h: 0.3,
      fontFace: 'Courier New',
      fontSize: 13,
      bold: true,
      color: LIME,
    });

    s6.addText(tb.title, {
      x: xPos + 0.18,
      y: 1.82,
      w: 1.8,
      h: 0.28,
      fontFace: 'Arial',
      fontSize: 12,
      bold: true,
      color: WHITE,
    });

    s6.addText(tb.fields, {
      x: xPos + 0.18,
      y: 2.22,
      w: 1.85,
      h: 1.2,
      fontFace: 'Courier New',
      fontSize: 9.5,
      color: GREY_TEXT,
      valign: 'top',
      lineSpacingMultiple: 1.25,
    });
  });

  const dbFeatures = [
    {
      num: '01',
      title: 'Инициализация',
      desc: 'коллекции и стартовые данные создаются автоматически при первом запуске',
    },
    {
      num: '02',
      title: 'Синхронизация',
      desc: 'заявки мгновенно обновляются между клиентом, врачом и админом',
    },
    {
      num: '03',
      title: 'Контроль слотов',
      desc: 'данные сохраняются целостно, исключая запись двух клиентов на одно время',
    },
  ];

  dbFeatures.forEach((ft, idx) => {
    const xPos = 0.45 + idx * 3.11;
    s6.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 4.0,
      w: 0.38,
      h: 0.32,
      rectRadius: 0.06,
      fill: { color: LIME },
      line: { color: LIME, width: 0 },
    });
    s6.addText(ft.num, {
      x: xPos,
      y: 4.0,
      w: 0.38,
      h: 0.32,
      fontFace: 'Courier New',
      fontSize: 9.5,
      bold: true,
      color: '111111',
      align: 'center',
      valign: 'middle',
    });
    s6.addText(ft.title, {
      x: xPos + 0.48,
      y: 3.96,
      w: 2.3,
      h: 0.26,
      fontFace: 'Arial',
      fontSize: 12,
      bold: true,
      color: WHITE,
    });
    s6.addText(ft.desc, {
      x: xPos + 0.48,
      y: 4.24,
      w: 2.4,
      h: 0.65,
      fontFace: 'Arial',
      fontSize: 9.5,
      color: GREY_TEXT,
      valign: 'top',
    });
  });

  // =========================================================================
  // СЛАЙД 7: ДЕМОНСТРАЦИЯ САЙТА
  // =========================================================================
  const s7 = pptx.addSlide();
  s7.background = { color: BG_DARK };

  addRoundEmblem(s7, 5.0, 1.65, 1.75);

  s7.addText('Демонстрация сайта', {
    x: 1.0,
    y: 2.85,
    w: 8.0,
    h: 0.7,
    fontFace: 'Arial',
    fontSize: 36,
    bold: true,
    color: WHITE,
    align: 'center',
  });

  s7.addText('ЛАПА ПОМОЩИ / VET CLINIC', {
    x: 2.0,
    y: 3.68,
    w: 6.0,
    h: 0.3,
    fontFace: 'Courier New',
    fontSize: 11,
    bold: true,
    color: LIME,
    align: 'center',
    charSpacing: 3,
  });

  // =========================================================================
  // СЛАЙД 8: 06 / РЕЗУЛЬТАТЫ (Цель проекта достигнута)
  // =========================================================================
  const s8 = pptx.addSlide();
  addDarkHeaderAndFooter(
    s8,
    '06 / РЕЗУЛЬТАТЫ',
    'Цель проекта достигнута',
    8
  );

  const resultCards = [
    {
      x: 0.45,
      y: 1.25,
      symbol: '✓',
      circleColor: LIME,
      title: 'Сайт ветклиники',
      desc: 'онлайн-запись к 8 профильным врачам и калькулятор чек-апа 24/7',
    },
    {
      x: 5.13,
      y: 1.25,
      symbol: '✓',
      circleColor: LIME,
      title: 'Три интерфейса',
      desc: 'личный кабинет владельца питомца, кабинет врача и панель администратора',
    },
    {
      x: 0.45,
      y: 3.04,
      symbol: '✓',
      circleColor: LIME,
      title: 'Надёжность',
      desc: 'защита данных, электронная медкарта и исключение двойных броней',
    },
    {
      x: 5.13,
      y: 3.04,
      symbol: '→',
      circleColor: PURPLE,
      title: 'Развитие',
      desc: 'онлайн-оплата, Telegram-уведомления, мобильное приложение',
    },
  ];

  resultCards.forEach((rc) => {
    s8.addShape(pptx.ShapeType.roundRect, {
      x: rc.x,
      y: rc.y,
      w: 4.42,
      h: 1.58,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    s8.addShape(pptx.ShapeType.ellipse, {
      x: rc.x + 0.26,
      y: rc.y + 0.44,
      w: 0.68,
      h: 0.68,
      fill: { color: rc.circleColor },
      line: { color: rc.circleColor, width: 0 },
    });

    s8.addText(rc.symbol, {
      x: rc.x + 0.26,
      y: rc.y + 0.44,
      w: 0.68,
      h: 0.68,
      fontFace: 'Arial',
      fontSize: 18,
      bold: true,
      color: '111111',
      align: 'center',
      valign: 'middle',
    });

    s8.addText(rc.title, {
      x: rc.x + 1.15,
      y: rc.y + 0.36,
      w: 3.05,
      h: 0.32,
      fontFace: 'Arial',
      fontSize: 14.5,
      bold: true,
      color: WHITE,
    });

    s8.addText(rc.desc, {
      x: rc.x + 1.15,
      y: rc.y + 0.72,
      w: 3.05,
      h: 0.6,
      fontFace: 'Arial',
      fontSize: 10.5,
      color: GREY_TEXT,
      valign: 'top',
    });
  });

  // =========================================================================
  // СЛАЙД 9: СПАСИБО ЗА ВНИМАНИЕ!
  // =========================================================================
  const s9 = pptx.addSlide();
  s9.background = { color: BG_DARK };

  addRoundEmblem(s9, 5.0, 1.65, 1.75);

  s9.addText('Спасибо за внимание!', {
    x: 1.0,
    y: 2.85,
    w: 8.0,
    h: 0.7,
    fontFace: 'Arial',
    fontSize: 36,
    bold: true,
    color: WHITE,
    align: 'center',
  });

  s9.addText('Готов ответить на ваши вопросы', {
    x: 2.0,
    y: 3.65,
    w: 6.0,
    h: 0.35,
    fontFace: 'Arial',
    fontSize: 13.5,
    color: GREY_TEXT,
    align: 'center',
  });

  await pptx.writeFile({
    fileName,
  });
}

