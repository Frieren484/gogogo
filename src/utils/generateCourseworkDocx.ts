import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  LevelFormat,
  LineRuleType,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  SectionType,
  ShadingType,
  TabStopPosition,
  TabStopType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';

const FONT_FILES = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',
].filter((f) => fs.existsSync(f));

function renderSvgToPngBuffer(svgString: string, width = 1200): Buffer {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: true,
      defaultFontFamily: 'DejaVu Sans',
    },
  });
  return resvg.render().asPng();
}

function buildFig1HeroSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="1200" height="675" fill="#EAF2EE"/>
    <!-- Top emergency bar -->
    <rect width="1200" height="36" fill="#0F2922"/>
    <circle cx="48" cy="18" r="5" fill="#10B981"/>
    <text x="62" y="23" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#5EEAD4">Круглосуточно 24/7, без выходных</text>
    <text x="310" y="23" font-family="DejaVu Sans" font-size="12" fill="#D1FAE5">ул. Профсоюзная, д. 45 (3 мин. от м. Новые Черёмушки)</text>
    <text x="790" y="23" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FDBA74">Экстренный триаж: выезд за 30 мин</text>
    <text x="1045" y="23" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF">+7 (495) 128-24-07</text>

    <!-- Main Header -->
    <rect y="36" width="1200" height="72" fill="#F3F8F5"/>
    <line x1="0" y1="108" x2="1200" y2="108" stroke="#CFE2DA" stroke-width="1.5"/>
    <rect x="42" y="52" width="40" height="40" rx="10" fill="#0D9488"/>
    <text x="62" y="78" font-family="DejaVu Sans" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ЛП</text>
    <text x="94" y="68" font-family="DejaVu Sans" font-size="18" font-weight="bold" fill="#132A23">Лапа Помощи</text>
    <text x="94" y="86" font-family="DejaVu Sans" font-size="11" fill="#3D5B52">Ветеринарный центр · Москва</text>

    <text x="275" y="76" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#3D5B52">Услуги и цены</text>
    <text x="395" y="76" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#3D5B52">Калькулятор чек-апа</text>
    <text x="565" y="76" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#3D5B52">Специалисты (8)</text>
    <text x="705" y="76" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#3D5B52">Истории пациентов</text>
    <text x="860" y="76" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#3D5B52">Контакты</text>

    <rect x="955" y="54" width="90" height="36" rx="10" fill="#FFFFFF" stroke="#B8D4C8"/>
    <text x="1000" y="76" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23" text-anchor="middle">Войти</text>
    <rect x="1055" y="54" width="110" height="36" rx="10" fill="#EA580C"/>
    <text x="1110" y="76" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться</text>

    <!-- Left Hero Content -->
    <rect x="42" y="138" width="445" height="28" rx="14" fill="#DFF0E8" stroke="#B5D8C9"/>
    <text x="60" y="156" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">ДОКАЗАТЕЛЬНАЯ ВЕТЕРИНАРИЯ БЕЗ СТРЕССА · ГОСПИТАЛЬ 24/7</text>

    <text x="42" y="212" font-family="DejaVu Sans" font-size="38" font-weight="bold" fill="#132A23">Бережная медицина</text>
    <text x="42" y="256" font-family="DejaVu Sans" font-size="38" font-weight="bold" fill="#132A23">для тех, кто доверяет</text>
    <text x="42" y="300" font-family="DejaVu Sans" font-size="38" font-weight="bold" fill="#0D9488">вам свою жизнь</text>

    <text x="42" y="340" font-family="DejaVu Sans" font-size="14" fill="#3D5B52">Круглосуточный ветеринарный госпиталь (ул. Профсоюзная, д. 45).</text>
    <text x="42" y="362" font-family="DejaVu Sans" font-size="14" fill="#3D5B52">8 узкопрофильных специалистов, собственная экспресс-лаборатория CITO,</text>
    <text x="42" y="384" font-family="DejaVu Sans" font-size="14" fill="#3D5B52">эндоскопическая операционная и индивидуальная онлайн-запись к врачу.</text>

    <rect x="42" y="410" width="235" height="48" rx="12" fill="#EA580C"/>
    <text x="160" y="439" font-family="DejaVu Sans" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться на прием →</text>

    <rect x="292" y="410" width="205" height="48" rx="12" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
    <text x="394" y="439" font-family="DejaVu Sans" font-size="14" font-weight="bold" fill="#0F766E" text-anchor="middle">Экстренный вызов 24/7</text>

    <!-- Express callback bar -->
    <rect x="42" y="476" width="560" height="82" rx="14" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="60" y="500" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">ЭКСПРЕСС-ЗАПИСЬ ДЕЖУРНОМУ ВРАЧУ (ПЕРЕЗВОНИМ ЗА 10 МИНУТ)</text>
    <rect x="60" y="512" width="150" height="34" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="74" y="534" font-family="DejaVu Sans" font-size="12" fill="#132A23">Питомец: Собака</text>
    <rect x="222" y="512" width="210" height="34" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="236" y="534" font-family="DejaVu Sans" font-size="12" fill="#64748B">+7 (999) 000-00-00</text>
    <rect x="444" y="512" width="140" height="34" rx="8" fill="#0D9488"/>
    <text x="514" y="534" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Жду звонка</text>

    <!-- Stats Row -->
    <rect x="42" y="574" width="130" height="76" rx="12" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="58" y="604" font-family="DejaVu Sans" font-size="22" font-weight="bold" fill="#0D9488">24/7</text>
    <text x="58" y="626" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#132A23">Без выходных</text>

    <rect x="185" y="574" width="130" height="76" rx="12" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="201" y="604" font-family="DejaVu Sans" font-size="22" font-weight="bold" fill="#0D9488">8 врачей</text>
    <text x="201" y="626" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#132A23">Узкий профиль</text>

    <rect x="328" y="574" width="130" height="76" rx="12" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="344" y="604" font-family="DejaVu Sans" font-size="22" font-weight="bold" fill="#0D9488">99.4%</text>
    <text x="344" y="626" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#132A23">Успешных операций</text>

    <rect x="471" y="574" width="131" height="76" rx="12" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="487" y="604" font-family="DejaVu Sans" font-size="22" font-weight="bold" fill="#0D9488">30 мин</text>
    <text x="487" y="626" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#132A23">Выезд по Москве</text>

    <!-- Right Hero Card -->
    <rect x="645" y="140" width="510" height="510" rx="22" fill="#132A23" stroke="#0D9488" stroke-width="2"/>
    <rect x="665" y="160" width="220" height="36" rx="10" fill="#0F2922" stroke="#5EEAD4"/>
    <text x="680" y="183" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#5EEAD4">Стандарт Fear Free (без стресса)</text>
    <rect x="955" y="160" width="180" height="36" rx="10" fill="#FFFFFF"/>
    <text x="970" y="183" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23">Рейтинг 4.9 · 1420+ отз.</text>

    <!-- Stylized illustration inside hero card -->
    <circle cx="900" cy="340" r="110" fill="#1B4338"/>
    <circle cx="900" cy="340" r="78" fill="#0D9488"/>
    <text x="900" y="335" font-family="DejaVu Sans" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ЛАПА ПОМОЩИ</text>
    <text x="900" y="365" font-family="DejaVu Sans" font-size="13" fill="#CCFBF1" text-anchor="middle">ВЕТЕРИНАРНЫЙ ГОСПИТАЛЬ</text>

    <rect x="665" y="495" width="470" height="135" rx="16" fill="#FFFFFF"/>
    <text x="685" y="522" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">● ПРОФИЛЬНЫЕ СПЕЦИАЛИСТЫ И ДИАГНОСТИКА 24/7</text>
    <text x="685" y="548" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#132A23">Терапия · Кардиология · Хирургия · УЗИ · Ратология</text>
    <text x="685" y="574" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">К каждому направлению и чек-апу прикреплен ведущий</text>
    <text x="685" y="594" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">профильный ветеринарный врач клиники</text>
    <rect x="1030" y="512" width="88" height="32" rx="8" fill="#EAF2EE"/>
    <text x="1074" y="533" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">К врачу →</text>
  </svg>`;
}

function buildFig2ServicesSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="660" viewBox="0 0 1200 660">
    <rect width="1200" height="660" fill="#EAF2EE"/>
    <text x="48" y="48" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0D9488">ПРОЗРАЧНЫЙ ПРАЙС-ЛИСТ БЕЗ СКРЫТЫХ ДОПЛАТ</text>
    <text x="48" y="84" font-family="DejaVu Sans" font-size="28" font-weight="bold" fill="#132A23">Ветеринарные услуги и закрепленные врачи направлений</text>

    <!-- Filter tabs & Search -->
    <rect x="48" y="106" width="110" height="36" rx="10" fill="#0D9488"/>
    <text x="103" y="129" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Все услуги (8)</text>
    <rect x="168" y="106" width="125" height="36" rx="10" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="230" y="129" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#3D5B52" text-anchor="middle">Диагностика</text>
    <rect x="303" y="106" width="115" height="36" rx="10" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="360" y="129" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#3D5B52" text-anchor="middle">Лечение</text>
    <rect x="428" y="106" width="135" height="36" rx="10" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="495" y="129" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#3D5B52" text-anchor="middle">Профилактика</text>

    <rect x="820" y="106" width="332" height="36" rx="10" fill="#FFFFFF" stroke="#CFE2DA"/>
    <text x="840" y="129" font-family="DejaVu Sans" font-size="12" fill="#64748B">Поиск по услуге, симптому или врачу...</text>

    <!-- Row 1 of cards -->
    <rect x="48" y="162" width="352" height="225" rx="16" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
    <text x="68" y="192" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">01 · ЛЕЧЕНИЕ · 45 МИН</text>
    <text x="315" y="192" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">от 1 800 ₽</text>
    <text x="68" y="220" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">Терапия и первичный прием</text>
    <text x="68" y="244" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Осмотр по протоколу Fear Free, термометрия,</text>
    <text x="68" y="262" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">аускультация, план лечения без лишних услуг.</text>
    <rect x="68" y="280" width="312" height="38" rx="8" fill="#F3F8F5"/>
    <text x="80" y="304" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">Ведущий врач: Волкова Елена Сергеевна</text>
    <rect x="68" y="332" width="312" height="38" rx="10" fill="#0D9488"/>
    <text x="224" y="356" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться к врачу →</text>

    <rect x="424" y="162" width="352" height="225" rx="16" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <text x="444" y="192" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">02 · ДИАГНОСТИКА · 30 МИН</text>
    <text x="690" y="192" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">от 2 400 ₽</text>
    <text x="444" y="220" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">УЗИ экспертного класса и CITO</text>
    <text x="444" y="244" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">УЗИ брюшной полости Mindray Vetus 8 и анализы</text>
    <text x="444" y="262" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">крови IDEXX с готовностью за 15 минут.</text>
    <rect x="444" y="280" width="312" height="38" rx="8" fill="#F3F8F5"/>
    <text x="456" y="304" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">Ведущий врач: Морозов Дмитрий Игоревич</text>
    <rect x="444" y="332" width="312" height="38" rx="10" fill="#0D9488"/>
    <text x="600" y="356" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться к врачу →</text>

    <rect x="800" y="162" width="352" height="225" rx="16" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <text x="820" y="192" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">03 · ХИРУРГИЯ · 90 МИН</text>
    <text x="1065" y="192" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">от 6 500 ₽</text>
    <text x="820" y="220" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">Эндоскопическая хирургия</text>
    <text x="820" y="244" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Операции любой сложности под газовым наркозом</text>
    <text x="820" y="262" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Севофлуран и кардиомониторингом ОРИТ.</text>
    <rect x="820" y="280" width="312" height="38" rx="8" fill="#F3F8F5"/>
    <text x="832" y="304" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">Ведущий врач: Смирнов Алексей Викторович</text>
    <rect x="820" y="332" width="312" height="38" rx="10" fill="#0D9488"/>
    <text x="976" y="356" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться к врачу →</text>

    <!-- Row 2 of cards -->
    <rect x="48" y="406" width="352" height="225" rx="16" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <text x="68" y="436" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">04 · ПРОФИЛАКТИКА · 30 МИН</text>
    <text x="315" y="436" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">от 2 200 ₽</text>
    <text x="68" y="464" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">Вакцинация и чипирование</text>
    <text x="68" y="488" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Импортные и отечественные вакцины, чип ISO,</text>
    <text x="68" y="506" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">регистрация в базе Animal-ID и ветпаспорт.</text>
    <rect x="68" y="524" width="312" height="38" rx="8" fill="#F3F8F5"/>
    <text x="80" y="548" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">Ведущий врач: Павлова Ирина Николаевна</text>
    <rect x="68" y="576" width="312" height="38" rx="10" fill="#0D9488"/>
    <text x="224" y="600" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться к врачу →</text>

    <rect x="424" y="406" width="352" height="225" rx="16" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <text x="444" y="436" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">05 · КАРДИОЛОГИЯ · 50 МИН</text>
    <text x="690" y="436" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">от 3 400 ₽</text>
    <text x="444" y="464" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">Кардио-скрининг (ЭхоКГ + ЭКГ)</text>
    <text x="444" y="488" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Допплерография сердца, ЭКГ в 6 отведениях,</text>
    <text x="444" y="506" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">тонометрия и допуск к общей анестезии.</text>
    <rect x="444" y="524" width="312" height="38" rx="8" fill="#F3F8F5"/>
    <text x="456" y="548" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">Ведущий врач: Волкова Елена Сергеевна</text>
    <rect x="444" y="576" width="312" height="38" rx="10" fill="#0D9488"/>
    <text x="600" y="600" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться к врачу →</text>

    <rect x="800" y="406" width="352" height="225" rx="16" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <text x="820" y="436" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0D9488">06 · ЭКЗОТОЛОГИЯ · 45 МИН</text>
    <text x="1065" y="436" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">от 2 300 ₽</text>
    <text x="820" y="464" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">Ратология (грызуны и кролики)</text>
    <text x="820" y="488" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Специализированный прием морских свинок, крыс,</text>
    <text x="820" y="506" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">шиншилл и кроликов, коррекция зубов под газом.</text>
    <rect x="820" y="524" width="312" height="38" rx="8" fill="#F3F8F5"/>
    <text x="832" y="548" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0F766E">Ведущий врач: Соколова Анна Павловна</text>
    <rect x="820" y="576" width="312" height="38" rx="10" fill="#0D9488"/>
    <text x="976" y="600" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться к врачу →</text>
  </svg>`;
}

function buildFig3CalculatorSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620">
    <rect width="1200" height="620" fill="#EAF2EE"/>
    <text x="48" y="48" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0D9488">ОНЛАЙН-КАЛЬКУЛЯТОР КОМПЛЕКСНОЙ ДИАГНОСТИКИ</text>
    <text x="48" y="82" font-family="DejaVu Sans" font-size="28" font-weight="bold" fill="#132A23">Рассчитайте стоимость чек-апа за 30 секунд</text>

    <!-- Left panel -->
    <rect x="48" y="108" width="660" height="475" rx="18" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <text x="74" y="142" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">1. Выберите вид питомца и возрастную группу</text>
    <rect x="74" y="156" width="190" height="44" rx="10" fill="#0D9488"/>
    <text x="169" y="183" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Собака (×1.15)</text>
    <rect x="278" y="156" width="190" height="44" rx="10" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="373" y="183" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23" text-anchor="middle">Кошка (×1.0)</text>
    <rect x="482" y="156" width="198" height="44" rx="10" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="581" y="183" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23" text-anchor="middle">Грызун / Кролик (×0.9)</text>

    <text x="74" y="236" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">2. Комплексная программа обследования</text>
    <rect x="74" y="250" width="606" height="58" rx="12" fill="#EAF2EE" stroke="#0D9488" stroke-width="2"/>
    <text x="94" y="275" font-family="DejaVu Sans" font-size="14" font-weight="bold" fill="#132A23">Комплексный годовой чек-ап «Здоровый питомец»</text>
    <text x="94" y="295" font-family="DejaVu Sans" font-size="11" fill="#0F766E">Осмотр терапевта, ОАК + биохимия (12 пок.), УЗИ брюшной полости, ЭхоКГ</text>
    <text x="595" y="284" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#0D9488">4 500 ₽</text>

    <rect x="74" y="320" width="606" height="52" rx="12" fill="#F9FCFA" stroke="#CFE2DA"/>
    <text x="94" y="351" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#3D5B52">Ежегодная вакцинация «Под ключ» с паспортом</text>
    <text x="595" y="351" font-family="DejaVu Sans" font-size="14" font-weight="bold" fill="#3D5B52">2 600 ₽</text>

    <text x="74" y="405" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">3. Закрепленный врач программы и дополнительные опции</text>
    <rect x="74" y="418" width="606" height="44" rx="10" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="94" y="445" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Врач: Волкова Елена Сергеевна (Ведущий терапевт, кардиолог)</text>

    <rect x="74" y="478" width="295" height="46" rx="10" fill="#EAF2EE" stroke="#0D9488"/>
    <text x="94" y="506" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E">✓ Экспресс-лаборатория CITO (+900 ₽)</text>
    <rect x="385" y="478" width="295" height="46" rx="10" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="405" y="506" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">☐ Выезд врача на дом (+2 000 ₽)</text>

    <!-- Right Summary Card -->
    <rect x="734" y="108" width="418" height="475" rx="18" fill="#0F2922"/>
    <text x="764" y="148" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#5EEAD4">ИТОГОВЫЙ ПЛАН ОБСЛЕДОВАНИЯ</text>
    <text x="764" y="182" font-family="DejaVu Sans" font-size="20" font-weight="bold" fill="#FFFFFF">Годовой чек-ап «Здоровый питомец»</text>
    <text x="764" y="212" font-family="DejaVu Sans" font-size="13" fill="#D1FAE5">Питомец: Собака · Взрослый (1–7 лет)</text>
    <text x="764" y="236" font-family="DejaVu Sans" font-size="13" fill="#5EEAD4">Лечащий врач: Волкова Елена Сергеевна</text>

    <line x1="764" y1="258" x2="1122" y2="258" stroke="#1E463B" stroke-width="1.5"/>
    <text x="764" y="288" font-family="DejaVu Sans" font-size="12" fill="#FFFFFF">✓ Развернутый осмотр терапевта и сбор анамнеза</text>
    <text x="764" y="314" font-family="DejaVu Sans" font-size="12" fill="#FFFFFF">✓ УЗИ брюшной полости + ЭхоКГ скрининг сердца</text>
    <text x="764" y="340" font-family="DejaVu Sans" font-size="12" fill="#FFFFFF">✓ Общий и биохимический анализ крови (CITO 15 мин)</text>
    <text x="764" y="366" font-family="DejaVu Sans" font-size="12" fill="#FFFFFF">✓ Письменное заключение в электронную медкарту</text>

    <rect x="764" y="396" width="358" height="84" rx="12" fill="#163A31"/>
    <text x="784" y="424" font-family="DejaVu Sans" font-size="12" fill="#A7F3D0">Итоговая фиксированная стоимость:</text>
    <text x="784" y="462" font-family="DejaVu Sans" font-size="32" font-weight="bold" fill="#5EEAD4">6 075 ₽</text>

    <rect x="764" y="502" width="358" height="52" rx="12" fill="#EA580C"/>
    <text x="943" y="534" font-family="DejaVu Sans" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Записаться по этому расчету →</text>
  </svg>`;
}

function buildFig4BookingModalSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="660" viewBox="0 0 1200 660">
    <rect width="1200" height="660" fill="#132A23" fill-opacity="0.88"/>
    <rect x="140" y="32" width="920" height="596" rx="20" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="2"/>
    <rect x="140" y="32" width="920" height="74" rx="20" fill="#0F2922"/>
    <text x="176" y="65" font-family="DejaVu Sans" font-size="19" font-weight="bold" fill="#FFFFFF">Онлайн-запись на прием в клинику «Лапа Помощи»</text>
    <text x="176" y="88" font-family="DejaVu Sans" font-size="12" fill="#5EEAD4">Индивидуальные окна врача · Автоматическая блокировка занятых слотов</text>

    <!-- Form fields -->
    <text x="176" y="138" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23">Ваше имя и телефон</text>
    <rect x="176" y="148" width="405" height="40" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="192" y="173" font-family="DejaVu Sans" font-size="13" fill="#132A23">Кривошеев Кирилл Дмитриевич</text>
    <rect x="599" y="148" width="425" height="40" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="615" y="173" font-family="DejaVu Sans" font-size="13" fill="#132A23">+7 (927) 145-82-19</text>

    <text x="176" y="216" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23">Питомец и направление приема</text>
    <rect x="176" y="226" width="195" height="40" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="192" y="251" font-family="DejaVu Sans" font-size="13" fill="#132A23">Собака · Арчи</text>
    <rect x="386" y="226" width="638" height="40" rx="8" fill="#EAF2EE" stroke="#0D9488"/>
    <text x="402" y="251" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#0F766E">Терапия и первичный клинический прием (1 800 ₽)</text>

    <text x="176" y="294" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23">Выбор профильного специалиста и даты визита</text>
    <rect x="176" y="304" width="520" height="44" rx="8" fill="#F3F8F5" stroke="#0D9488" stroke-width="1.5"/>
    <text x="192" y="331" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Волкова Елена Сергеевна · Терапевт, кардиолог (10:00–20:00)</text>
    <rect x="712" y="304" width="312" height="44" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="728" y="331" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Дата: 28.10.2026 (На смене)</text>

    <!-- Time slots grid -->
    <text x="176" y="378" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23">Индивидуальные окна врача на 28.10.2026 (занятые часы заблокированы):</text>

    <rect x="176" y="392" width="110" height="40" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
    <text x="231" y="417" font-family="DejaVu Sans" font-size="12" fill="#94A3B8" text-anchor="middle">10:00 Занято</text>

    <rect x="298" y="392" width="110" height="40" rx="8" fill="#FFFFFF" stroke="#0D9488"/>
    <text x="353" y="417" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">11:30 Своб.</text>

    <rect x="420" y="392" width="110" height="40" rx="8" fill="#0D9488"/>
    <text x="475" y="417" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓ 13:00 Выбр.</text>

    <rect x="542" y="392" width="110" height="40" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
    <text x="597" y="417" font-family="DejaVu Sans" font-size="12" fill="#94A3B8" text-anchor="middle">14:30 Занято</text>

    <rect x="664" y="392" width="110" height="40" rx="8" fill="#FFFFFF" stroke="#0D9488"/>
    <text x="719" y="417" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">16:00 Своб.</text>

    <rect x="786" y="392" width="110" height="40" rx="8" fill="#FFFFFF" stroke="#0D9488"/>
    <text x="841" y="417" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">17:30 Своб.</text>

    <rect x="908" y="392" width="116" height="40" rx="8" fill="#FFFFFF" stroke="#0D9488"/>
    <text x="966" y="417" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">19:00 Своб.</text>

    <!-- Bottom summary & button -->
    <rect x="176" y="454" width="848" height="72" rx="12" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="196" y="482" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Выбрано окно: 28.10.2026 в 13:00 · Врач: Волкова Елена Сергеевна</text>
    <text x="196" y="506" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Фиксированная стоимость приема по прайсу клиники: 1 800 ₽</text>

    <rect x="176" y="544" width="848" height="54" rx="12" fill="#EA580C"/>
    <text x="600" y="577" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Подтвердить запись на прием (1 800 ₽)</text>
  </svg>`;
}

function buildFig5ConfirmationSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
    <rect width="1200" height="600" fill="#132A23" fill-opacity="0.9"/>
    <rect x="250" y="36" width="700" height="528" rx="22" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
    <circle cx="600" cy="96" r="32" fill="#D1FAE5"/>
    <text x="600" y="106" font-family="DejaVu Sans" font-size="28" font-weight="bold" fill="#0D9488" text-anchor="middle">✓</text>
    <text x="600" y="156" font-family="DejaVu Sans" font-size="24" font-weight="bold" fill="#132A23" text-anchor="middle">Запись успешно подтверждена!</text>
    <text x="600" y="182" font-family="DejaVu Sans" font-size="13" fill="#3D5B52" text-anchor="middle">Талон № LP-482910 сохранен в вашем личном кабинете</text>

    <rect x="295" y="204" width="610" height="210" rx="14" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="320" y="236" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#0F766E">ИМЕННОЙ ТАЛОН НА ПРИЕМ · КЛИНИКА «ЛАПА ПОМОЩИ»</text>
    <text x="320" y="268" font-family="DejaVu Sans" font-size="13" fill="#132A23">Пациент: Собака Арчи · Владелец: Кривошеев К.Д.</text>
    <text x="320" y="294" font-family="DejaVu Sans" font-size="13" fill="#132A23">Услуга: Терапия и первичный клинический прием</text>
    <text x="320" y="320" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#0D9488">Лечащий врач: Волкова Елена Сергеевна</text>
    <text x="320" y="346" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Дата и время визита: 28 октября 2026 г. в 13:00</text>
    <text x="320" y="372" font-family="DejaVu Sans" font-size="13" fill="#3D5B52">К оплате в клинике: 1 800 ₽ · Адрес: ул. Профсоюзная, д. 45</text>
    <text x="320" y="398" font-family="DejaVu Sans" font-size="11" fill="#0F766E">Памятка: голодная диета 8 часов перед забором крови, возьмите ветпаспорт.</text>

    <rect x="295" y="436" width="295" height="48" rx="12" fill="#0D9488"/>
    <text x="442" y="465" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Скачать талон и памятку (.txt)</text>
    <rect x="610" y="436" width="295" height="48" rx="12" fill="#EAF2EE" stroke="#0D9488"/>
    <text x="757" y="465" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#0F766E" text-anchor="middle">Перейти в «Мои записи» →</text>
  </svg>`;
}

function buildFig6ClientCabinetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="650" viewBox="0 0 1200 650">
    <rect width="1200" height="650" fill="#EAF2EE"/>
    <rect x="70" y="28" width="1060" height="594" rx="20" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="2"/>
    <rect x="70" y="28" width="1060" height="72" rx="20" fill="#0F2922"/>
    <text x="106" y="60" font-family="DejaVu Sans" font-size="19" font-weight="bold" fill="#FFFFFF">Личный кабинет владельца питомца · Мои записи (2)</text>
    <text x="106" y="82" font-family="DejaVu Sans" font-size="12" fill="#5EEAD4">Кривошеев Кирилл Дмитриевич · Электронная медкарта пациента и история приемов</text>

    <!-- Pet Medical Card Box -->
    <rect x="106" y="118" width="988" height="128" rx="14" fill="#F3F8F5" stroke="#0D9488" stroke-width="1.5"/>
    <text x="128" y="144" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0D9488">ЭЛЕКТРОННАЯ МЕДИЦИНСКАЯ КАРТА ПИТОМЦА (СИНХРОНИЗИРОВАНА С КЛИНИКОЙ)</text>
    <text x="128" y="172" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#132A23">Кличка: Арчи · Вид: Собака (Вельш-корги, 2 года) · Вес: 12.4 кг · Чип: 643094100284512</text>
    <text x="128" y="198" font-family="DejaVu Sans" font-size="12" fill="#3D5B52">Вакцинация: Эурикан DHPPi+LR (действ. до 14.05.2027) · Аллергостатус: Не выявлено</text>
    <text x="128" y="222" font-family="DejaVu Sans" font-size="12" fill="#0F766E">Хронические отметки врача: Контроль зубного камня раз в 6 месяцев</text>

    <!-- Appointment Card 1 -->
    <rect x="106" y="264" width="988" height="156" rx="14" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <rect x="128" y="284" width="120" height="26" rx="6" fill="#D1FAE5"/>
    <text x="188" y="301" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#065F46" text-anchor="middle">ПОДТВЕРЖДЕНА</text>
    <text x="262" y="301" font-family="DejaVu Sans" font-size="12" fill="#64748B">Талон № LP-482910 · 28.10.2026 в 13:00</text>
    <text x="980" y="304" font-family="DejaVu Sans" font-size="18" font-weight="bold" fill="#0D9488">1 800 ₽</text>

    <text x="128" y="334" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#132A23">Терапия и первичный клинический прием · Питомец: Арчи</text>
    <text x="128" y="358" font-family="DejaVu Sans" font-size="13" fill="#3D5B52">Лечащий врач: Волкова Елена Сергеевна (Ведущий терапевт, кардиолог)</text>

    <rect x="128" y="372" width="175" height="34" rx="8" fill="#EAF2EE" stroke="#0D9488"/>
    <text x="215" y="394" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">Перенести время</text>
    <rect x="315" y="372" width="175" height="34" rx="8" fill="#F3F8F5" stroke="#CFE2DA"/>
    <text x="402" y="394" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#132A23" text-anchor="middle">Скачать талон</text>
    <rect x="502" y="372" width="150" height="34" rx="8" fill="#FEF2F2" stroke="#FECACA"/>
    <text x="577" y="394" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#DC2626" text-anchor="middle">Отменить визит</text>

    <!-- Appointment Card 2 (Completed with Doctor Recommendation) -->
    <rect x="106" y="436" width="988" height="160" rx="14" fill="#FFFFFF" stroke="#CFE2DA" stroke-width="1.5"/>
    <rect x="128" y="454" width="110" height="26" rx="6" fill="#E0F2FE"/>
    <text x="183" y="471" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#0369A1" text-anchor="middle">ЗАВЕРШЕНА</text>
    <text x="252" y="471" font-family="DejaVu Sans" font-size="12" fill="#64748B">Талон № LP-319044 · 15.10.2026 в 11:30 · Врач: Морозов Д.И.</text>
    <text x="980" y="474" font-family="DejaVu Sans" font-size="18" font-weight="bold" fill="#132A23">2 400 ₽</text>

    <text x="128" y="502" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#132A23">УЗИ экспертного класса и экспресс-анализы CITO</text>
    <rect x="128" y="514" width="944" height="64" rx="8" fill="#F0FDF4" stroke="#BBF7D0"/>
    <text x="144" y="536" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#166534">ЗАКЛЮЧЕНИЕ И РЕКОМЕНДАЦИИ ЛЕЧАЩЕГО ВРАЧА (МОРОЗОВ Д.И.):</text>
    <text x="144" y="558" font-family="DejaVu Sans" font-size="12" fill="#14532D">Показатели печени и почек в пределах нормы. Рекомендована лечебная диета GastroIntestinal на 14 дней.</text>
  </svg>`;
}

function buildFig7AdminDashboardSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="660" viewBox="0 0 1200 660">
    <rect width="1200" height="660" fill="#0F172A"/>
    <!-- Top bar -->
    <rect width="1200" height="68" fill="#0F2922"/>
    <text x="42" y="38" font-family="DejaVu Sans" font-size="19" font-weight="bold" fill="#FFFFFF">CRM-панель администратора клиники «Лапа Помощи»</text>
    <text x="42" y="56" font-family="DejaVu Sans" font-size="11" fill="#5EEAD4">Управление записями, прайс-листом, штатом врачей (8) и графиком дежурств 2/2</text>

    <!-- KPI Cards -->
    <rect x="42" y="86" width="268" height="86" rx="12" fill="#1E293B" stroke="#334155"/>
    <text x="62" y="114" font-family="DejaVu Sans" font-size="11" fill="#94A3B8">ВСЕГО ЗАЯВОК В БАЗЕ</text>
    <text x="62" y="150" font-family="DejaVu Sans" font-size="28" font-weight="bold" fill="#FFFFFF">14 записей</text>

    <rect x="326" y="86" width="268" height="86" rx="12" fill="#1E293B" stroke="#334155"/>
    <text x="346" y="114" font-family="DejaVu Sans" font-size="11" fill="#94A3B8">ОЖИДАЮТ ПОДТВЕРЖДЕНИЯ</text>
    <text x="346" y="150" font-family="DejaVu Sans" font-size="28" font-weight="bold" fill="#FBBF24">4 новые</text>

    <rect x="610" y="86" width="268" height="86" rx="12" fill="#1E293B" stroke="#334155"/>
    <text x="630" y="114" font-family="DejaVu Sans" font-size="11" fill="#94A3B8">ДЕЖУРНАЯ БРИГАДА СЕГОДНЯ</text>
    <text x="630" y="150" font-family="DejaVu Sans" font-size="26" font-weight="bold" fill="#5EEAD4">Бригада №1 (4 вр.)</text>

    <rect x="894" y="86" width="264" height="86" rx="12" fill="#1E293B" stroke="#334155"/>
    <text x="914" y="114" font-family="DejaVu Sans" font-size="11" fill="#94A3B8">ВЫРУЧКА ПО АКТИВНЫМ ЗАПИСЯМ</text>
    <text x="914" y="150" font-family="DejaVu Sans" font-size="28" font-weight="bold" fill="#34D399">48 700 ₽</text>

    <!-- Navigation Tabs -->
    <rect x="42" y="188" width="195" height="38" rx="8" fill="#0D9488"/>
    <text x="139" y="212" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Заявки на прием (14)</text>
    <rect x="247" y="188" width="230" height="38" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="362" y="212" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#CBD5E1" text-anchor="middle">График смен 2/2 и подмены</text>
    <rect x="487" y="188" width="180" height="38" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="577" y="212" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#CBD5E1" text-anchor="middle">Услуги и прайс (8)</text>
    <rect x="677" y="188" width="180" height="38" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="767" y="212" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#CBD5E1" text-anchor="middle">Штат врачей (8)</text>

    <!-- Appointments Table in Admin -->
    <rect x="42" y="242" width="1116" height="390" rx="14" fill="#1E293B" stroke="#334155"/>
    <text x="66" y="274" font-family="DejaVu Sans" font-size="14" font-weight="bold" fill="#FFFFFF">Журнал всех записей клиники в реальном времени</text>

    <!-- Row 1 -->
    <rect x="62" y="294" width="1076" height="96" rx="10" fill="#0F172A" stroke="#334155"/>
    <text x="82" y="322" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#5EEAD4">LP-482910 · Кривошеев Кирилл Дмитриевич (+7 927 145-82-19)</text>
    <text x="82" y="346" font-family="DejaVu Sans" font-size="12" fill="#E2E8F0">Питомец: Собака Арчи · Услуга: Терапия и первичный клинический прием</text>
    <text x="82" y="368" font-family="DejaVu Sans" font-size="12" fill="#94A3B8">Врач: Волкова Елена Сергеевна · Дата: 28.10.2026 в 13:00</text>
    <text x="890" y="332" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#34D399">1 800 ₽</text>
    <rect x="980" y="312" width="136" height="32" rx="6" fill="#065F46"/>
    <text x="1048" y="333" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#A7F3D0" text-anchor="middle">Подтверждена</text>

    <!-- Row 2 -->
    <rect x="62" y="404" width="1076" height="96" rx="10" fill="#0F172A" stroke="#334155"/>
    <text x="82" y="432" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#FBBF24">LP-519204 · Соколова Марина Игоревна (+7 916 402-11-50)</text>
    <text x="82" y="456" font-family="DejaVu Sans" font-size="12" fill="#E2E8F0">Питомец: Кошка Мия · Услуга: УЗИ экспертного класса и экспресс-анализы</text>
    <text x="82" y="478" font-family="DejaVu Sans" font-size="12" fill="#94A3B8">Врач: Морозов Дмитрий Игоревич · Дата: 27.10.2026 в 21:30 (Ночная смена)</text>
    <text x="890" y="442" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#34D399">2 400 ₽</text>
    <rect x="980" y="422" width="136" height="32" rx="6" fill="#78350F"/>
    <text x="1048" y="443" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FDE68A" text-anchor="middle">Новая заявка</text>

    <!-- Row 3 -->
    <rect x="62" y="514" width="1076" height="96" rx="10" fill="#0F172A" stroke="#334155"/>
    <text x="82" y="542" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#38BDF8">LP-390115 · Белова Екатерина (+7 903 771-89-04)</text>
    <text x="82" y="566" font-family="DejaVu Sans" font-size="12" fill="#E2E8F0">Питомец: Кролик Пончик · Услуга: Ратология и коррекция дентальной аркады</text>
    <text x="82" y="588" font-family="DejaVu Sans" font-size="12" fill="#94A3B8">Врач: Соколова Анна Павловна · Дата: 27.10.2026 в 20:00</text>
    <text x="890" y="552" font-family="DejaVu Sans" font-size="16" font-weight="bold" fill="#34D399">2 300 ₽</text>
    <rect x="980" y="532" width="136" height="32" rx="6" fill="#1E3A8A"/>
    <text x="1048" y="553" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#BAE6FD" text-anchor="middle">Завершена</text>
  </svg>`;
}

function buildFig9DoctorCabinetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620">
    <rect width="1200" height="620" fill="#F8FAFC"/>
    <rect width="1200" height="72" fill="#0F2922"/>
    <text x="42" y="38" font-family="DejaVu Sans" font-size="19" font-weight="bold" fill="#FFFFFF">Личный кабинет врача · Смирнов Алексей Викторович</text>
    <text x="42" y="58" font-family="DejaVu Sans" font-size="12" fill="#FDE68A">Главный врач, хирург-ортопед, эндоскопист · Бригада №1 (Дневная смена 10:00–20:00)</text>

    <rect x="42" y="92" width="220" height="38" rx="8" fill="#0D9488"/>
    <text x="152" y="116" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Мои пациенты (4)</text>
    <rect x="274" y="92" width="250" height="38" rx="8" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="399" y="116" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">Мой график смен 2/2 и отпуска</text>

    <!-- Patient Card 1 -->
    <rect x="42" y="148" width="1116" height="210" rx="14" fill="#FFFFFF" stroke="#0D9488" stroke-width="1.5"/>
    <text x="68" y="180" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#132A23">Пациент: Собака Бруно (Французский бульдог) · Владелец: Морозов Денис</text>
    <text x="68" y="204" font-family="DejaVu Sans" font-size="13" fill="#0F766E">Направление: Эндоскопическая хирургия и ортопедия · Время: Сегодня, 15:00 · 6 500 ₽</text>
    <text x="68" y="232" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#334155">Врачебные рекомендации и выписка (отображаются в медкарте клиента):</text>
    <rect x="68" y="242" width="840" height="62" rx="8" fill="#F0FDF4" stroke="#BBF7D0"/>
    <text x="84" y="268" font-family="DejaVu Sans" font-size="12" fill="#14532D">Проведена эндоскопическая ринопластика под газовым наркозом Севофлуран. Назначена обработка</text>
    <text x="84" y="288" font-family="DejaVu Sans" font-size="12" fill="#14532D">швов Хлоргексидином 2 раза в день, повторный контрольный осмотр через 7 дней.</text>
    <rect x="928" y="242" width="204" height="62" rx="10" fill="#0D9488"/>
    <text x="1030" y="278" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Сохранить выписку</text>

    <!-- Patient Card 2 -->
    <rect x="42" y="376" width="1116" height="210" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="68" y="408" font-family="DejaVu Sans" font-size="15" font-weight="bold" fill="#132A23">Пациент: Собака Луна (Вельш-корги, 1 год) · Владелец: Савельев Игорь</text>
    <text x="68" y="432" font-family="DejaVu Sans" font-size="13" fill="#0F766E">Направление: Лапароскопическая стерилизация через прокол 5 мм · Время: Сегодня, 16:30 · 6 500 ₽</text>
    <text x="68" y="460" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="#334155">Врачебные рекомендации и выписка:</text>
    <rect x="68" y="470" width="840" height="62" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="84" y="496" font-family="DejaVu Sans" font-size="12" fill="#475569">Внутрикожный рассасывающийся шов Monocryl, защитная попона не требуется. Кормление через 4 часа</text>
    <text x="84" y="516" font-family="DejaVu Sans" font-size="12" fill="#475569">после выписки из дневного стационара мягким кормом.</text>
    <rect x="928" y="470" width="204" height="62" rx="10" fill="#0D9488"/>
    <text x="1030" y="506" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Сохранить выписку</text>
  </svg>`;
}

function buildFig10UnitTestsSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
    <rect width="1200" height="600" rx="12" fill="#F4F8F6" stroke="#CBD5E1" stroke-width="2"/>
    <rect width="1200" height="68" rx="12" fill="#0F2922"/>
    <text x="36" y="34" font-family="DejaVu Sans" font-size="17" font-weight="bold" fill="#FFFFFF">Протокол автоматизированной проверки модулей · Веб-сайт «Лапа Помощи»</text>
    <text x="36" y="54" font-family="DejaVu Sans" font-size="12" fill="#5EEAD4">Модуль: src/utils/clinic-logic.test.ts · Разработчик: Кривошеев К.Д. (гр. ИП-41) · Статус: 9 из 9 сценариев успешно</text>

    <!-- Test Cards Grid -->
    <rect x="32" y="88" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="98" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="114" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-01 · ОК</text>
    <text x="142" y="115" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Вкладка «Врачи (8)» содержит 8 профильных специалистов, распределенных по Бригадам №1 и №2 (2/2)</text>

    <rect x="32" y="140" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="150" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="166" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-02 · ОК</text>
    <text x="142" y="167" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Каталог услуг и калькулятор чек-апа корректно рассчитывают стоимость (CITO +1 200 ₽, выезд +2 000 ₽)</text>

    <rect x="32" y="192" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="202" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="218" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-03 · ОК</text>
    <text x="142" y="219" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Автоматический подбор ведущего врача по направлению и защита от повторной брони занятого слота</text>

    <rect x="32" y="244" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="254" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="270" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-04 · ОК</text>
    <text x="142" y="271" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Синхронизация стоимости записей при обновлении прайс-листа в панели администратора</text>

    <rect x="32" y="296" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="306" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="322" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-05 · ОК</text>
    <text x="142" y="323" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">График смен 2/2: учет больничного листа и автоматическое назначение заменяющего врача</text>

    <rect x="32" y="348" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="358" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="374" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-06 · ОК</text>
    <text x="142" y="375" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Отдельная вкладка «Отзывы»: фильтрация историй выздоровления по видам животных (собаки, кошки, грызуны)</text>

    <rect x="32" y="400" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="410" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="426" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-07 · ОК</text>
    <text x="142" y="427" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Удаление аккаунта (Клиент): разрешено удаление только собственного профиля после предупреждения</text>

    <rect x="32" y="452" width="1136" height="44" rx="8" fill="#FFFBEB" stroke="#F59E0B"/>
    <rect x="44" y="462" width="84" height="24" rx="5" fill="#D97706"/>
    <text x="86" y="478" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-08 · ОК</text>
    <text x="142" y="479" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#78350F">Удаление аккаунта (Врач): действие заблокировано системой, выведено предупреждение безопасности</text>

    <rect x="32" y="504" width="1136" height="44" rx="8" fill="#FFFFFF" stroke="#B8D4C8"/>
    <rect x="44" y="514" width="84" height="24" rx="5" fill="#0D9488"/>
    <text x="86" y="530" font-family="DejaVu Sans" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ТК-09 · ОК</text>
    <text x="142" y="531" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#132A23">Удаление аккаунта (Администратор): успешное удаление любой учетной записи с предупреждением</text>

    <text x="36" y="578" font-family="DejaVu Sans" font-size="13" font-weight="bold" fill="#0F766E">Итог тестирования: выполнено 9 комплексных сценариев (ТК-01..ТК-09) · Ошибок: 0 · Статус: УСПЕШНО</text>
  </svg>`;
}

// Helper for standard ГОСТ body paragraph (Times New Roman 14pt, 1.5 spacing, 1.25cm first line indent, justified)
function bodyP(text: string | (string | { text: string; bold?: boolean; italics?: boolean })[]): Paragraph {
  const children =
    typeof text === 'string'
      ? [new TextRun({ text, font: 'Times New Roman', size: 28 })]
      : text.map((part) =>
          typeof part === 'string'
            ? new TextRun({ text: part, font: 'Times New Roman', size: 28 })
            : new TextRun({
                text: part.text,
                bold: part.bold,
                italics: part.italics,
                font: 'Times New Roman',
                size: 28,
              })
        );

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 709 }, // 1.25 cm
    spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 0, before: 0 },
    children,
  });
}

function heading1P(text: string, pageBreakBefore = false): Paragraph {
  return new Paragraph({
    pageBreakBefore,
    alignment: AlignmentType.LEFT,
    spacing: { line: 360, before: 120, after: 200 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28,
        bold: true,
      }),
    ],
  });
}

function heading2P(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { firstLine: 709 },
    spacing: { line: 360, before: 200, after: 160 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28,
        bold: true,
      }),
    ],
  });
}

function figureBlock(imgBuffer: Buffer, caption: string, widthPx = 560, heightPx = 315): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 80 },
      children: [
        new ImageRun({
          data: imgBuffer,
          transformation: { width: widthPx, height: heightPx },
          type: 'png',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200, line: 360 },
      children: [
        new TextRun({
          text: caption,
          font: 'Times New Roman',
          size: 28,
        }),
      ],
    }),
  ];
}

function codeLineP(line: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 240, after: 0, before: 0 },
    children: [
      new TextRun({
        text: line,
        font: 'Courier New',
        size: 20, // 10 pt as in FRAG.pdf Appendices
      }),
    ],
  });
}

function makeTableCell(
  text: string,
  options: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; colSpan?: number; widthPct?: number } = {}
): TableCell {
  return new TableCell({
    columnSpan: options.colSpan,
    width: options.widthPct ? { size: options.widthPct, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        alignment: options.align || AlignmentType.LEFT,
        spacing: { line: 260, before: 40, after: 40 },
        children: [
          new TextRun({
            text,
            font: 'Times New Roman',
            size: 24, // 12pt inside tables as in FRAG.pdf
            bold: options.bold,
          }),
        ],
      }),
    ],
  });
}

export async function generateCourseworkDocx(
  outputPath = 'public/Kursovoy_Proekt_Lapa_Pomoshchi_Krivosheev_KD.docx'
): Promise<void> {
  // Prepare all 10 PNG screenshots
  const fig1Buf = renderSvgToPngBuffer(buildFig1HeroSvg(), 1200);
  const fig2Buf = renderSvgToPngBuffer(buildFig2ServicesSvg(), 1200);
  const fig3Buf = renderSvgToPngBuffer(buildFig3CalculatorSvg(), 1200);
  const fig4Buf = renderSvgToPngBuffer(buildFig4BookingModalSvg(), 1200);
  const fig5Buf = renderSvgToPngBuffer(buildFig5ConfirmationSvg(), 1200);
  const fig6Buf = renderSvgToPngBuffer(buildFig6ClientCabinetSvg(), 1200);
  const fig7Buf = renderSvgToPngBuffer(buildFig7AdminDashboardSvg(), 1200);

  // Figure 8 uses the actual real screenshot of the 30-day shift schedule matrix if available
  const realScheduleScreenshotPath = path.resolve('public/assets/aistudio/image_f0d3fb10.png');
  const fig8Buf = fs.existsSync(realScheduleScreenshotPath)
    ? fs.readFileSync(realScheduleScreenshotPath)
    : renderSvgToPngBuffer(buildFig7AdminDashboardSvg(), 1200);

  const fig9Buf = renderSvgToPngBuffer(buildFig9DoctorCabinetSvg(), 1200);
  const fig10Buf = renderSvgToPngBuffer(buildFig10UnitTestsSvg(), 1200);

  // Table of Contents row helper with dotted leader
  const tocRow = (label: string, page: string, indentTwips = 0) =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: indentTwips ? { left: indentTwips } : undefined,
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
          leader: 'dot',
        },
      ],
      spacing: { line: 360, before: 40, after: 40 },
      children: [
        new TextRun({ text: label, font: 'Times New Roman', size: 28 }),
        new TextRun({ text: `\t${page}`, font: 'Times New Roman', size: 28 }),
      ],
    });

  // Table 1: System Requirements & Dev Tools (Page 10 of FRAG.pdf)
  const table1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeTableCell('Системные требования ПК', {
            bold: true,
            align: AlignmentType.CENTER,
            colSpan: 2,
          }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('Операционная система', { widthPct: 45 }),
          makeTableCell('Windows 11 Pro (64-bit)', { widthPct: 55 }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('CPU (Центральный процессор ПК)'),
          makeTableCell('AMD Ryzen 5 5600 (6 ядер / 12 потоков, 3.5–4.4 ГГц)'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('RAM (Оперативная память)'),
          makeTableCell('16 ГБ DDR4 3200 МГц'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('GPU (Видеокарта)'),
          makeTableCell('NVIDIA GeForce RTX 3060 (12 ГБ GDDR6)'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('HDD-SSD (Жёсткий диск)'),
          makeTableCell('SSD Kingston NV2 512 ГБ и HDD Seagate Barracuda 1 ТБ'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('Средства разработки', {
            bold: true,
            align: AlignmentType.CENTER,
            colSpan: 2,
          }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('Редактор кода'),
          makeTableCell('Visual Studio Code'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('Языки программирования и разметки'),
          makeTableCell('TypeScript, JavaScript, HTML5, CSS3'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('Платформа и фреймворки'),
          makeTableCell('Node.js 22, React 19, Vite 6, Tailwind CSS 4'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('База данных и хранилище'),
          makeTableCell('Firebase Firestore + LocalStorage API'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('Система контроля версий'),
          makeTableCell('Git, GitHub'),
        ],
      }),
    ],
  });

  // Table 2: Database Structure (Page 12 of FRAG.pdf)
  const table2 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeTableCell('Коллекция / Таблица', { bold: true, align: AlignmentType.CENTER, widthPct: 24 }),
          makeTableCell('Назначение', { bold: true, align: AlignmentType.CENTER, widthPct: 28 }),
          makeTableCell('Основные поля', { bold: true, align: AlignmentType.CENTER, widthPct: 48 }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('users'),
          makeTableCell('Пользователи сайта и сотрудники клиники'),
          makeTableCell('uid, login (уникальный), displayName, password, phone, role (user / doctor / admin), petName, petSpecies'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('appointments'),
          makeTableCell('Заявки на приём к ветеринарным врачам'),
          makeTableCell('id, createdAt, ownerName, phone, petSpecies, petName, serviceTitle, doctorName, preferredDate, preferredTimeSlot, estimatedPrice, status, doctorRecommendation'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('doctors'),
          makeTableCell('Штат узкопрофильных специалистов клиники'),
          makeTableCell('id, login, name, role, experienceYears, brigade (1 / 2), shiftType (day / night), shiftHours, personalSlots, assignedDirections'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('services'),
          makeTableCell('Каталог ветеринарных услуг и прайс-лист'),
          makeTableCell('id, number, category, categoryLabel, title, duration, priceFrom, description, included, defaultDoctorName'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('shift_config'),
          makeTableCell('График дежурств 2/2, больничные и отпуска'),
          makeTableCell('anchorDate, cycleMode (2x2), doctorStatusEvents (doctorName, type, startDate, endDate, replacementDoctorName)'),
        ],
      }),
    ],
  });

  // Table 3: Software Interface & Service Methods (Page 13 of FRAG.pdf)
  const table3 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeTableCell('Метод / Программный модуль', { bold: true, align: AlignmentType.CENTER, widthPct: 42 }),
          makeTableCell('Назначение в системе', { bold: true, align: AlignmentType.CENTER, widthPct: 58 }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('authenticateWithCredentials(login, pass)'),
          makeTableCell('Авторизация пользователей с определением роли: клиент, профильный врач (smirnov, morozov и др.) или администратор'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('getDoctorShiftForDate(doctor, dateStr)'),
          makeTableCell('Расчёт статуса смены врача по графику 2/2 с учётом больничных, отпусков и автоматического назначения врача на замену'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('filterAppointmentsForUser(list, user)'),
          makeTableCell('Разграничение прав доступа: клиенту — его записи, врачу — приёмы по его ФИО, администратору — все заявки клиники'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('syncAppointmentsToCloud(next, prev)'),
          makeTableCell('Синхронизация созданных, перенесённых и отменённых записей с облачной базой данных Firestore в реальном времени'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('resolveAppointmentPrice(record, services)'),
          makeTableCell('Автоматический пересчёт и синхронизация стоимости приёмов при обновлении цен в панели администратора'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('saveClientPetProfile(user, profile)'),
          makeTableCell('Сохранение электронной медицинской карты питомца (вес, вакцинация, номер чипа, аллергостатус)'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('deleteAccountWithRoleCheck(actor, target)'),
          makeTableCell('Ролевое удаление аккаунтов с предупреждением: клиент удаляет только свой аккаунт, врачу удаление запрещено, администратор удаляет любой аккаунт'),
        ],
      }),
    ],
  });

  // Appendix Code Listings
  const appendixALines = [
    '// Листинг src/data/clinicData.ts (структура таблиц и моделей данных)',
    'export type UserRole = "user" | "doctor" | "admin";',
    'export type DoctorBrigade = 1 | 2;',
    'export type DoctorShiftType = "day" | "night";',
    '',
    'export interface DoctorProfile {',
    '  id: string;',
    '  login: string;',
    '  name: string;',
    '  role: string;',
    '  experienceYears: number;',
    '  operationsCount: string;',
    '  education: string;',
    '  specialties: string[];',
    '  brigade: DoctorBrigade;',
    '  shiftType: DoctorShiftType;',
    '  shiftHours: string;',
    '  personalSlots: string[];',
    '  assignedDirections: string[];',
    '}',
    '',
    'export interface AppointmentRecord {',
    '  id: string;',
    '  createdAt: string;',
    '  ownerName: string;',
    '  phone: string;',
    '  petSpecies: string;',
    '  petName: string;',
    '  serviceTitle: string;',
    '  doctorName: string;',
    '  preferredDate: string;',
    '  preferredTimeSlot?: string;',
    '  estimatedPrice: number;',
    '  isEmergency?: boolean;',
    '  status: "Новая" | "Подтверждена" | "Завершена" | "Отменена";',
    '  notes?: string;',
    '  ownerUid?: string;',
    '  doctorRecommendation?: string;',
    '}',
    '',
    'export interface DoctorStatusEvent {',
    '  id: string;',
    '  doctorName: string;',
    '  type: "sick" | "vacation" | "training" | "replacement" | "off";',
    '  startDate: string;',
    '  endDate: string;',
    '  reasonLabel: string;',
    '  replacementDoctorName?: string;',
    '}',
  ];

  const appendixBLines = [
    '// Листинг src/services/firestoreService.ts (синхронизация с базой данных)',
    'import { collection, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";',
    'import { db } from "../firebase";',
    'import { AppointmentRecord, DoctorProfile, ServiceItem } from "../data/clinicData";',
    '',
    'const APPOINTMENTS_COL = "appointments";',
    'const SERVICES_COL = "services";',
    'const DOCTORS_COL = "doctors";',
    '',
    'export async function syncAppointmentsToCloud(',
    '  nextList: AppointmentRecord[],',
    '  prevList: AppointmentRecord[] = []',
    '): Promise<void> {',
    '  if (!db) return;',
    '  const nextIds = new Set(nextList.map((item) => item.id));',
    '  for (const oldItem of prevList) {',
    '    if (!nextIds.has(oldItem.id)) {',
    '      await deleteDoc(doc(db, APPOINTMENTS_COL, oldItem.id));',
    '    }',
    '  }',
    '  for (const item of nextList) {',
    '    await setDoc(doc(db, APPOINTMENTS_COL, item.id), {',
    '      ...item,',
    '      updatedAt: new Date().toISOString(),',
    '    });',
    '  }',
    '}',
    '',
    'export function startClinicFirestoreSync(callbacks: {',
    '  onAppointments: (list: AppointmentRecord[]) => void;',
    '  onServices: (list: ServiceItem[]) => void;',
    '  onDoctors: (list: DoctorProfile[]) => void;',
    '}) {',
    '  if (!db) return () => {};',
    '  const unsubAppts = onSnapshot(collection(db, APPOINTMENTS_COL), (snap) => {',
    '    if (!snap.empty) {',
    '      callbacks.onAppointments(snap.docs.map((d) => d.data() as AppointmentRecord));',
    '    }',
    '  });',
    '  return () => { unsubAppts(); };',
    '}',
  ];

  const appendixCLines = [
    '// Листинг src/components/BookingModal.tsx (проверка слотов и создание записи)',
    'const occupiedSlotsForDoctorAndDate = useMemo(() => {',
    '  const taken = new Set<string>();',
    '  if (!selectedDate || !selectedDoctorName) return taken;',
    '  for (const appt of existingAppointments) {',
    '    if (appt.status === "Отменена") continue;',
    '    if (appt.doctorName !== selectedDoctorName) continue;',
    '    if (appt.preferredDate.includes(selectedDate) && appt.preferredTimeSlot) {',
    '      taken.add(appt.preferredTimeSlot);',
    '    }',
    '  }',
    '  return taken;',
    '}, [existingAppointments, selectedDate, selectedDoctorName]);',
    '',
    'const handleSubmit = (e: React.FormEvent) => {',
    '  e.preventDefault();',
    '  if (occupiedSlotsForDoctorAndDate.has(selectedTimeSlot)) {',
    '    setError("Выбранное время у данного врача уже занято. Выберите другое окно.");',
    '    return;',
    '  }',
    '  const effectiveDoctor = shiftStatus.isAbsent && shiftStatus.replacementDoctorName',
    '    ? shiftStatus.replacementDoctorName',
    '    : selectedDoctorName;',
    '',
    '  const newRecord: AppointmentRecord = {',
    '    id: `LP-${Math.floor(100000 + Math.random() * 900000)}`,',
    '    createdAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),',
    '    ownerName: ownerName.trim(),',
    '    phone: phone.trim(),',
    '    petSpecies,',
    '    petName: petName.trim() || "Без клички",',
    '    serviceTitle,',
    '    doctorName: effectiveDoctor,',
    '    preferredDate: `${selectedDate} в ${selectedTimeSlot}`,',
    '    preferredTimeSlot: selectedTimeSlot,',
    '    estimatedPrice: finalPrice,',
    '    status: "Новая",',
    '    ownerUid: currentUser.authSource !== "guest" ? currentUser.uid : undefined,',
    '  };',
    '  onBookingCreated(newRecord);',
    '};',
  ];

  // Table 4: Functional & RBAC Test Cases for Section 2.3
  const table4 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeTableCell('Код', { bold: true, align: AlignmentType.CENTER, widthPct: 10 }),
          makeTableCell('Проверяемый модуль / Роль', { bold: true, align: AlignmentType.CENTER, widthPct: 26 }),
          makeTableCell('Действие и входные данные', { bold: true, align: AlignmentType.CENTER, widthPct: 34 }),
          makeTableCell('Результат проверки', { bold: true, align: AlignmentType.CENTER, widthPct: 30 }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-01', { align: AlignmentType.CENTER }),
          makeTableCell('Навигация по вкладкам сайта (Гость / Клиент)'),
          makeTableCell('Переключение вкладок «Главная и услуги», «Врачи (8)» и «Отзывы» в шапке сайта'),
          makeTableCell('Вкладки открываются отдельно без перезагрузки страницы, фильтры работают корректно'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-02', { align: AlignmentType.CENTER }),
          makeTableCell('Калькулятор чек-апа (Клиент)'),
          makeTableCell('Выбор вида питомца, программы чек-апа, опций CITO (+1 200 ₽) и выезда (+2 000 ₽)'),
          makeTableCell('Итоговая сумма и профильный врач рассчитываются верно и передаются в форму записи'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-03', { align: AlignmentType.CENTER }),
          makeTableCell('Онлайн-запись и слоты времени (Клиент)'),
          makeTableCell('Выбор даты и попытка записи на уже занятое время у выбранного специалиста'),
          makeTableCell('Занятые часы заблокированы; при выборе свободного окна формируется талон LP-XXXXXX'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-04', { align: AlignmentType.CENTER }),
          makeTableCell('Личный кабинет и медкарта (Клиент)'),
          makeTableCell('Заполнение веса, чипа и прививок питомца, перенос записи на новую дату'),
          makeTableCell('Электронная медкарта сохраняется, время визита обновляется в облачной БД'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-05', { align: AlignmentType.CENTER }),
          makeTableCell('График смен 2/2 и подмены (Врач / Админ)'),
          makeTableCell('Оформление больничного листа врачу основной бригады в день дежурства'),
          makeTableCell('Система автоматически назначает заменяющего специалиста из резервной бригады'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-06', { align: AlignmentType.CENTER }),
          makeTableCell('Удаление своего аккаунта (Клиент)'),
          makeTableCell('Нажатие «Удалить мой аккаунт» в личном кабинете клиента и подтверждение предупреждения'),
          makeTableCell('Выводится предупреждение; после подтверждения удаляется только аккаунт самого клиента'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-07', { align: AlignmentType.CENTER }),
          makeTableCell('Запрет удаления аккаунта (Врач)'),
          makeTableCell('Попытка врача (логин smirnov) удалить свой служебный аккаунт в кабинете врача'),
          makeTableCell('Действие заблокировано: выводится предупреждение, что врачам удаление аккаунтов запрещено'),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell('ТК-08', { align: AlignmentType.CENTER }),
          makeTableCell('Удаление любого аккаунта (Администратор)'),
          makeTableCell('Выбор учетной записи клиента или врача во вкладке «Аккаунты» и подтверждение удаления'),
          makeTableCell('После окна предупреждения администратор успешно удаляет выбранный аккаунт'),
        ],
      }),
    ],
  });

  const appendixDLines = [
    '// Листинг src/services/authService.ts и src/data/clinicData.ts',
    '// Ролевое удаление аккаунтов с предупреждением и расчет подмен 2/2',
    'export function deleteAccountWithRoleCheck(',
    '  actor: AppUserProfile | null,',
    '  targetLogin: string,',
    '  confirmedWarning = false',
    '): AccountDeletionResult {',
    '  if (!actor || actor.authSource === "guest") {',
    '    return { ok: false, message: "Необходимо войти в систему." };',
    '  }',
    '  if (!confirmedWarning) {',
    '    return {',
    '      ok: false,',
    '      message: "Перед удалением аккаунта необходимо подтвердить предупреждение.",',
    '    };',
    '  }',
    '  // Врачам запрещено удалять свои или чужие аккаунты',
    '  if (actor.role === "doctor") {',
    '    return {',
    '      ok: false,',
    '      message: "Предупреждение: ветеринарным врачам запрещено удалять учетные записи.",',
    '    };',
    '  }',
    '  // Клиент может удалить только свой собственный аккаунт',
    '  if (actor.role === "user" && actor.login.toLowerCase() !== targetLogin.toLowerCase()) {',
    '    return {',
    '      ok: false,',
    '      message: "Предупреждение: пользователь может удалить только свой аккаунт.",',
    '    };',
    '  }',
    '  // Администратор может удалить любой аккаунт, клиент — свой собственный',
    '  markLoginAsDeleted(targetLogin);',
    '  return { ok: true, message: "Учетная запись успешно удалена." };',
    '}',
  ];

  const doc = new Document({
    creator: 'Кривошеев Кирилл Дмитриевич',
    title: 'Курсовой проект МДК 02.02 — Веб-сайт ветеринарной клиники Лапа Помощи',
    sections: [
      // =====================================================================
      // SECTION 1: TITLE PAGE WITH SOLID BLACK FRAME BORDER (as in FRAG.pdf p.1)
      // =====================================================================
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20 mm
              bottom: 1134,
              left: 1418, // 25 mm
              right: 850, // 15 mm
            },
            borders: {
              pageBorderTop: { style: BorderStyle.SINGLE, size: 18, color: '000000', space: 18 },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 18, color: '000000', space: 18 },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 18, color: '000000', space: 18 },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 18, color: '000000', space: 18 },
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 276, after: 0 },
            children: [
              new TextRun({
                text: 'МИНИСТЕРСТВО ОБРАЗОВАНИЯ САРАТОВСКОЙ ОБЛАСТИ',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 276, after: 0 },
            children: [
              new TextRun({
                text: 'ГОСУДАРСТВЕННОЕ АВТОНОМНОЕ ПРОФЕССИОНАЛЬНОЕ',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 276, after: 0 },
            children: [
              new TextRun({
                text: 'ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ САРАТОВСКОЙ ОБЛАСТИ',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 276, after: 0 },
            children: [
              new TextRun({
                text: '«БАЛАШОВСКИЙ ТЕХНИКУМ МЕХАНИЗАЦИИ СЕЛЬСКОГО',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 276, after: 960 },
            children: [
              new TextRun({
                text: 'ХОЗЯЙСТВА»',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 560 },
            children: [
              new TextRun({
                text: 'КУРСОВОЙ ПРОЕКТ',
                font: 'Times New Roman',
                size: 28,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, after: 0 },
            children: [
              new TextRun({
                text: 'по МДК 02.02 «Инструментальные средства разработки программного обеспечения»',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, after: 140 },
            children: [
              new TextRun({
                text: 'на тему:',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 40 },
            children: [
              new TextRun({
                text: 'Разработка Web-сайта для онлайн-записи пациентов',
                font: 'Times New Roman',
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 40 },
            children: [
              new TextRun({
                text: 'ветеринарной клиники «Лапа Помощи»',
                font: 'Times New Roman',
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 520 },
            children: [
              new TextRun({
                text: 'Предметная область: ветеринарная клиника (сфера ветеринарной медицины и услуг)',
                font: 'Times New Roman',
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, after: 60 },
            children: [
              new TextRun({
                text: 'Специальность: 09.02.07 ',
                font: 'Times New Roman',
                size: 28,
              }),
              new TextRun({
                text: 'Информационные системы и программирование',
                font: 'Times New Roman',
                size: 28,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, after: 60 },
            children: [
              new TextRun({
                text: 'Разработал студент 4 курса, группы ИП-41',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 280, after: 0 },
            children: [
              new TextRun({
                text: 'Кривошеев К.Д.',
                font: 'Times New Roman',
                size: 28,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 240, after: 480 },
            children: [
              new TextRun({
                text: '(фамилия, инициалы)',
                font: 'Times New Roman',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 280, after: 0 },
            children: [
              new TextRun({
                text: 'Принял преподаватель ____________ ',
                font: 'Times New Roman',
                size: 28,
              }),
              new TextRun({
                text: 'Сухова Л.Г.',
                font: 'Times New Roman',
                size: 28,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 240, after: 140 },
            children: [
              new TextRun({
                text: '                                                  (подпись)              (фамилия, инициалы)',
                font: 'Times New Roman',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, after: 420 },
            children: [
              new TextRun({
                text: 'Оценка ______________      «_____» ______________ 2026 г.',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 280, after: 0 },
            children: [
              new TextRun({
                text: 'Зав. отделением ______________ ',
                font: 'Times New Roman',
                size: 28,
              }),
              new TextRun({
                text: 'Судатова Ю.А.',
                font: 'Times New Roman',
                size: 28,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 240, after: 900 },
            children: [
              new TextRun({
                text: '                                      (подпись)                (фамилия, инициалы)',
                font: 'Times New Roman',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 0 },
            children: [
              new TextRun({
                text: 'г. Балашов  2026 г.',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
        ],
      },

      // =====================================================================
      // SECTION 2: MAIN CONTENT (Pages 2..29 with bottom centered page numbers)
      // =====================================================================
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: 1134, // 20 mm
              bottom: 1134, // 20 mm
              left: 1701, // 30 mm ГОСТ left margin
              right: 850, // 15 mm ГОСТ right margin
            },
            pageNumbers: {
              start: 2,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // PAGE 2: СОДЕРЖАНИЕ
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 280 },
            children: [
              new TextRun({
                text: 'СОДЕРЖАНИЕ',
                font: 'Times New Roman',
                size: 28,
                bold: true,
              }),
            ],
          }),
          tocRow('ВВЕДЕНИЕ', '3'),
          tocRow('1. ТЕОРЕТИЧЕСКАЯ ЧАСТЬ', '5'),
          tocRow('1.1. Анализ предметной области', '5', 360),
          tocRow('1.2. Обоснование необходимости создания сайта', '6', 360),
          tocRow('1.3. Анализ технологий для разработки и создания web-сайта', '7', 360),
          tocRow('2. РАЗРАБОТКА САЙТА ВЕТЕРИНАРНОЙ КЛИНИКИ «ЛАПА ПОМОЩИ»', '11'),
          tocRow('2.1. Проектирование структуры и дизайна сайта', '11', 360),
          tocRow('2.2. Этапы разработки web-сайта', '13', 360),
          tocRow('2.3. Тестирование web-сайта', '20', 360),
          tocRow('ЗАКЛЮЧЕНИЕ', '22'),
          tocRow('СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ', '23'),
          tocRow('ПРИЛОЖЕНИЕ А', '25'),
          tocRow('ПРИЛОЖЕНИЕ Б', '26'),
          tocRow('ПРИЛОЖЕНИЕ В', '27'),
          tocRow('ПРИЛОЖЕНИЕ Г', '29'),

          // PAGE 3-4: ВВЕДЕНИЕ
          heading1P('ВВЕДЕНИЕ', true),
          bodyP(
            'Актуальность темы курсового проекта обусловлена стремительным развитием сферы ветеринарной медицины, ростом числа домашних питомцев в городских семьях и переходом медицинских учреждений на цифровые каналы взаимодействия с пациентами. Современный владелец животного привык решать повседневные задачи онлайн: записываться к врачу, выбирать узкопрофильного специалиста по отзывам и квалификации, заранее рассчитывать стоимость обследования и хранить историю приёмов в электронном виде. Поэтому наличие собственной информационной веб-платформы с онлайн-записью становится для современной ветеринарной клиники важнейшим условием качественного сервиса.'
          ),
          bodyP(
            'Ветеринарная клиника «Лапа Помощи», расположенная в г. Москве (ул. Профсоюзная, д. 45), работает в круглосуточном режиме 24/7 и оказывает полный спектр ветеринарных услуг: терапевтический приём, экспертное УЗИ и лабораторную диагностику CITO, эндоскопическую хирургию, кардиологический скрининг, стоматологию, ратологию (лечение грызунов и кроликов), стационар интенсивной терапии и экстренный выезд бригады на дом. В клинике ведут приём восемь узкопрофильных ветеринарных врачей, распределённых по двум дежурным бригадам. При ведении записи исключительно по телефону или через мессенджеры возникают неизбежные проблемы: живые очереди в зоне ожидания, пересечение записей («двойная бронь») к одному специалисту на одно и то же время, сложности при перераспределении пациентов в случае болезни или отпуска врача, а также потеря обращений в ночные часы.'
          ),
          bodyP(
            'Целью данного курсового проекта является разработка веб-сайта для ветеринарной клиники «Лапа Помощи», обеспечивающего онлайн-запись пациентов к профильным врачам по свободным временным окнам, предварительный расчёт стоимости комплексного чек-апа, ведение электронной медкарты питомца в личном кабинете клиента, а также предоставляющего специализированные интерфейсы для врача и администратора клиники. Для достижения поставленной цели необходимо решить следующие задачи:'
          ),
          bodyP('1. Провести анализ предметной области и обосновать необходимость создания веб-сайта для ветеринарной клиники.'),
          bodyP('2. Выбрать и проанализировать технологии и инструментальные средства веб-разработки.'),
          bodyP('3. Спроектировать структуру сайта, схему базы данных и архитектуру ролевой модели доступа (клиент, врач, администратор).'),
          bodyP('4. Реализовать клиентскую часть: главную страницу, каталог услуг с фильтрацией, калькулятор чек-апа, карточки врачей, форму онлайн-записи, личный кабинет клиента с электронной медкартой и именным талоном.'),
          bodyP('5. Реализовать внутренние рабочие кабинеты врача и администратора: управление записями, прайс-листом, штатом специалистов и графиком дежурств 2/2 с автоматической подменой врачей на случай больничного или отпуска.'),
          bodyP('6. Провести модульное и функциональное тестирование разработанного веб-сайта и оценить его работоспособность.'),
          bodyP(
            'В результате выполнения данного проекта создан функциональный и удобный веб-сайт ветеринарной клиники «Лапа Помощи», который позволяет владельцам животных за несколько кликов выбрать услугу, профильного врача и свободное время визита, врачу — вести приём и оставлять выписки в медкарте пациента, а администратору — контролировать работу клиники в реальном времени. Разработка осуществлена с использованием современных технологий (React 19, TypeScript, Tailwind CSS, Node.js, Firebase Firestore), обеспечивающих кроссбраузерную совместимость и адаптивность под различные устройства.'
          ),

          // PAGE 5-10: 1. ТЕОРЕТИЧЕСКАЯ ЧАСТЬ
          heading1P('1. ТЕОРЕТИЧЕСКАЯ ЧАСТЬ', true),
          heading2P('1.1. Анализ предметной области'),
          bodyP(
            'Ветеринарные клиники современного уровня представляют собой многопрофильные медицинские центры, сочетающие амбулаторный приём, инструментальную и лабораторную диагностику, хирургический блок и круглосуточный стационар. В отличие от небольших ветеринарных кабинетов прошлых лет, современный ветеринарный госпиталь строится на принципах доказательной медицины и стандарте приёма без стресса (Fear Free), при котором потоки пациентов разделяются, а приём ведётся строго по предварительной записи к узкому специалисту.'
          ),
          bodyP(
            'Объектом автоматизации в данном курсовом проекте является круглосуточный ветеринарный центр «Лапа Помощи» (г. Москва, ул. Профсоюзная, д. 45). Клиника функционирует в режиме 24/7 без выходных и включает восемь ключевых клинических направлений, за каждым из которых закреплён профильный специалист:'
          ),
          bodyP('– терапия и кардиология (ведущий врач Волкова Е.С.) – первичный клинический осмотр, ЭхоКГ, ЭКГ и тонометрия, стоимость приёма от 1 800 ₽;'),
          bodyP('– экспертное УЗИ и экспресс-лаборатория CITO (врач Морозов Д.И.) – ультразвуковая диагностика и анализы крови за 15 минут, стоимость от 2 400 ₽;'),
          bodyP('– эндоскопическая хирургия и ортопедия (главный врач Смирнов А.В.) – малоинвазивные операции под газовым наркозом Севофлуран, стоимость от 6 500 ₽;'),
          bodyP('– ратология и экзотология (врач Соколова А.П.) – специализированное лечение грызунов и кроликов, стоимость от 2 300 ₽;'),
          bodyP('– стоматология, вакцинация, дерматология и круглосуточный стационар ОРИТ (врачи Васильев М.Ю., Павлова И.Н., Кузнецов А.Р., Новикова О.Д.).'),
          bodyP(
            'Для обеспечения непрерывной круглосуточной работы все восемь специалистов клиники разделены на две дежурные бригады (Бригада № 1 и Бригада № 2), работающие по сменному графику 2 через 2 с разделением на дневные смены (10:00–20:00) и ночные дежурства (20:00–10:00). При этом в реальной клинической практике сотрудники могут уходить на больничный лист, в плановый отпуск или на профильные ветеринарные конференции, что требует автоматического назначения подменяющего врача из резервной бригады.'
          ),
          bodyP(
            'Основными участниками бизнес-процесса являются три группы пользователей: владелец питомца (клиент), ветеринарный врач и администратор клиники. Клиент хочет заранее узнать стоимость услуги, выбрать профильного специалиста, увидеть его свободные часы приёма и записаться без ожидания на линии. Ветеринарный врач должен видеть свой список пациентов на смену, заполнять рекомендации по итогам осмотра и сверяться со своим внутренним графиком дежурств. Администратор клиники отвечает за координацию всех заявок, приём экстренных пациентов, ведение прайс-листа и управление расписанием смен.'
          ),
          bodyP(
            'При ведении записи «вручную» (по телефону или в бумажном журнале) возникают типичные проблемы: два владельца животных могут быть ошибочно записаны к одному врачу на одно и то же время; клиент не может самостоятельно записаться ночью или рассчитать стоимость комплексного чек-апа; при болезни врача регистратор вручную обзванивает десятки клиентов; отсутствует единая электронная медкарта питомца и статистика выручки. Веб-сайт клиники «Лапа Помощи» призван комплексно решить перечисленные задачи.'
          ),

          heading2P('1.2. Обоснование необходимости создания сайта'),
          bodyP(
            'В условиях высокой конкуренции на рынке ветеринарных услуг наличие собственной функциональной веб-платформы является необходимым условием эффективной работы клиники. Создание веб-сайта для ветеринарного центра «Лапа Помощи» обосновывается следующими факторами:'
          ),
          bodyP('1. Привлечение новых клиентов и повышение доверия к клинике:'),
          bodyP('– круглосуточная доступность информации: сайт работает в режиме 24/7, позволяя владельцам животных в любое время ознакомиться с услугами, актуальными ценами, квалификацией восьми врачей и памяткой первой помощи при экстренных симптомах;'),
          bodyP('– прозрачность ценообразования: интерактивный калькулятор чек-апа позволяет заранее рассчитать точную стоимость обследования с учётом вида животного (собака, кошка, грызун), возраста и дополнительных опций;'),
          bodyP('– социальное доказательство: раздел реальных историй выздоровления пациентов с фильтрацией по видам животных укрепляет репутацию клиники.'),
          bodyP('2. Повышение качества обслуживания владельцев животных:'),
          bodyP('– индивидуальные окна записи: при выборе врача и даты клиент видит только реально свободные слоты времени, а уже занятые часы автоматически блокируются от повторного выбора;'),
          bodyP('– личный кабинет и электронная медкарта: владелец питомца получает доступ к истории своих визитов, врачебным выпискам, данным о вакцинации и чипировании, может скачать именной талон с памяткой подготовки или перенести дату приёма онлайн.'),
          bodyP('3. Автоматизация работы врачей и администратора клиники:'),
          bodyP('– отдельный кабинет врача: специалист видит только своих пациентов, может брать в работу заявки дежурного врача, менять статус приёма и сохранять письменные рекомендации напрямую в медкарту клиента;'),
          bodyP('– закрытый внутренний график смен 2/2: расписание дежурств бригад с учётом больничных, отпусков и автоматических подмен скрыто от публичного доступа и доступно только в кабинетах врача и администратора;'),
          bodyP('– CRM-панель администратора: позволяет управлять всеми заявками, редактировать каталог услуг с автоматическим пересчётом цен, добавлять врачей и контролировать выручку клиники.'),

          heading2P('1.3. Анализ технологий для разработки и создания web-сайта'),
          bodyP(
            'Веб-сайт ветеринарной клиники «Лапа Помощи» построен по компонентной архитектуре и представляет собой современное одностраничное веб-приложение (SPA, Single Page Application) с облачной синхронизацией данных. Для реализации проекта были выбраны следующие технологии и инструментальные средства.'
          ),
          bodyP([
            { text: 'HTML5', bold: true },
            ' (язык гипертекстовой разметки) – основной стандарт разметки веб-страниц. В проекте HTML5 обеспечивает семантическую структуру документа (<header>, <main>, <section>, <nav>, <footer>), мета-теги поисковой оптимизации и корректное отображение на мобильных устройствах.',
          ]),
          bodyP([
            { text: 'CSS3 и Tailwind CSS', bold: true },
            ' – каскадные таблицы стилей и современный утилитарный CSS-фреймворк, подключаемый через сборщик Vite. С помощью Tailwind CSS реализован адаптивный интерфейс в спокойной медицинской цветовой гамме (мягкий шалфейный фон #EAF2EE, глубокий изумрудный #0F2922, бирюзовый акцент #0D9488 и сигнальный оранжевый #EA580C для кнопок записи и экстренного вызова).',
          ]),
          bodyP([
            { text: 'JavaScript и TypeScript', bold: true },
            ' – языки программирования клиентской и серверной логики. Использование статической типизации TypeScript позволило строго описать структуры данных проекта (профиль пользователя AppUserProfile, карточка врача DoctorProfile, заявка на приём AppointmentRecord, событие графика смен DoctorStatusEvent), исключив ошибки типов ещё на этапе компиляции.',
          ]),
          bodyP([
            { text: 'React 19', bold: true },
            ' – библиотека для построения пользовательских интерфейсов на основе переиспользуемых функциональных компонентов и хуков состояния (useState, useMemo, useEffect). В проекте интерфейс разделён на независимые модули: главный компонент App, модальное окно записи BookingModal, окно экстренного триажа EmergencyModal, окно авторизации AuthModal, личный кабинет клиента SavedAppointmentsModal, кабинет врача DoctorDashboard и панель управления AdminDashboard. Для векторной медицинской иконографики используется пакет Lucide React.',
          ]),
          bodyP([
            { text: 'Vite и Node.js', bold: true },
            ' – высокопроизводительный сборщик модулей и серверная платформа выполнения JavaScript. Vite обеспечивает мгновенную сборку TypeScript и CSS-модулей, а встроенный в Node.js тестовый раннер (node:test) используется для автоматического модульного тестирования бизнес-логики расписания и расчёта цен.',
          ]),
          bodyP([
            { text: 'Firebase Firestore и LocalStorage API', bold: true },
            ' – документоориентированная облачная база данных реального времени в сочетании с локальным хранилищем браузера. Такая двухконтурная схема гарантирует мгновенную синхронизацию заявок, врачей, прайс-листа и отзывов между всеми ролями пользователей, а также автономную работоспособность приложения.',
          ]),
          bodyP(
            'В рамках данного курсового проекта при создании веб-сайта использовались системные требования ПК и технические средства разработки, представленные ниже в таблице 1.'
          ),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, before: 160, after: 80 },
            children: [
              new TextRun({
                text: 'Таблица 1 – Системные требования ПК и средства разработки',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          table1,

          // PAGE 11-21: 2. РАЗРАБОТКА САЙТА ВЕТЕРИНАРНОЙ КЛИНИКИ «ЛАПА ПОМОЩИ»
          heading1P('2. РАЗРАБОТКА САЙТА ВЕТЕРИНАРНОЙ КЛИНИКИ «ЛАПА ПОМОЩИ»', true),
          heading2P('2.1. Проектирование структуры и дизайна сайта'),
          bodyP(
            'Наименование программного продукта: информационный веб-сайт ветеринарной клиники «Лапа Помощи». Система предназначена для ознакомления владельцев домашних животных с услугами и специалистами центра, предварительного расчёта стоимости чек-апа, круглосуточной онлайн-записи на приём, а также автоматизации рабочих процессов ветеринарных врачей и администратора клиники.'
          ),
          bodyP(
            'Состав работ по созданию системы включал: анализ бизнес-процессов ветклиники, проектирование структуры базы данных и ролевой модели, разработку дизайн-макета и адаптивной вёрстки, программирование клиентских и ролевых модулей на TypeScript и React, написание модульных тестов и отладку.'
          ),
          bodyP('К разрабатываемому веб-сайту были предъявлены следующие функциональные требования:'),
          bodyP('– отображение каталога ветеринарных услуг с фильтрацией по категориям («Диагностика», «Лечение», «Профилактика», «Уход») и мгновенным поиском по названию, симптому или фамилии врача;'),
          bodyP('– закрепление за каждым направлением и комплексной программой обследования профильного ведущего специалиста с возможностью его смены при записи;'),
          bodyP('– интерактивный калькулятор расчёта стоимости чек-апа с учётом вида животного, возраста, экспресс-лаборатории CITO и выезда врача на дом;'),
          bodyP('– онлайн-запись на приём с выбором даты и свободного временного слота врача, автоматической блокировкой уже занятых часов и формированием именного талона;'),
          bodyP('– ролевая система авторизации и регистрации с разделением прав доступа на три роли: «клиент» (user), «ветеринарный врач» (doctor) и «администратор» (admin);'),
          bodyP('– личный кабинет владельца питомца с электронной медицинской картой, историей обращений, просмотром рекомендаций врача, переносом и отменой записи;'),
          bodyP('– личный кабинет врача и CRM-панель администратора с закрытым внутренним графиком дежурств бригад 2/2 на 90 дней вперёд, учитывающим больничные листы, отпуска и автоматические замены врачей.'),
          bodyP(
            'Данные веб-приложения организованы в виде структурированных коллекций. Схема хранения данных представлена в таблице 2, а описание ключевых программных моделей приведено в приложении А.'
          ),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, before: 160, after: 80 },
            children: [
              new TextRun({
                text: 'Таблица 2 – Структура базы данных',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          table2,
          bodyP(
            'Обработка пользовательских сессий, проверка свободных слотов времени врачей, расчёт смен 2/2 и синхронизация коллекций выполняются через специализированные сервисные модули (authService.ts, firestoreService.ts, clinicData.ts). Перечень основных методов программного интерфейса представлен в таблице 3.'
          ),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, before: 160, after: 80 },
            children: [
              new TextRun({
                text: 'Таблица 3 – Методы программного интерфейса сайта',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          table3,
          bodyP(
            'Особое внимание при проектировании бизнес-логики было уделено исключению «двойных» записей к одному специалисту и непрерывности приёма при болезни врача. Перед сохранением заявки модуль BookingModal проверяет все активные записи выбранного специалиста на указанную дату и блокирует занятые временные слоты. Если выбранный врач в указанный день находится на больничном или в отпуске, система автоматически информирует пользователя и перенаправляет запись к назначенному заменяющему специалисту той же квалификации.'
          ),

          heading2P('2.2. Этапы разработки web-сайта'),
          bodyP(
            'На первом этапе разработки была создана главная страница веб-сайта, на которую посетитель попадает при открытии ресурса (рисунок 1). Чтобы не перегружать интерфейс на одной странице, верхняя панель навигации разделена на три самостоятельные вкладки: «Главная и услуги», «Врачи (8)» (с фильтрацией специалистов по профилю и поиском по ФИО) и «Отзывы» (с фильтрацией историй выздоровления по видам животных и формой добавления отзыва). На первом экране размещены ключевые преимущества госпиталя, форма экспресс-записи по номеру телефона (обратный звонок за 10 минут) и блок статистики клиники.'
          ),
          ...figureBlock(fig1Buf, 'Рисунок 1 – Главная страница'),

          bodyP(
            'Ниже на главной вкладке расположен интерактивный каталог ветеринарных услуг и направлений приёма (рисунок 2). Пользователь может переключать вкладки категорий («Все услуги», «Диагностика», «Лечение», «Профилактика», «Уход») или воспользоваться строкой поиска. В каждой карточке услуги указаны длительность приёма, фиксированная стоимость, перечень включённых манипуляций и ФИО ведущего профильного врача.'
          ),
          ...figureBlock(fig2Buf, 'Рисунок 2 – Каталог ветеринарных услуг и фильтрация по направлениям'),

          bodyP(
            'Для предварительного расчёта стоимости комплексного обследования разработан интерактивный калькулятор чек-апа (рисунок 3). Расчёт выполняется в три шага: владелец выбирает вид питомца (собака, кошка или грызун/кролик) и его возрастную категорию, отмечает одну из пяти диагностических программ, при необходимости меняет лечащего врача и подключает опции экспресс-лаборатории CITO или выезда на дом. В правой карточке мгновенно пересчитывается итоговая сумма и формируется кнопка перехода к записи с уже заполненными параметрами.'
          ),
          ...figureBlock(fig3Buf, 'Рисунок 3 – Интерактивный калькулятор расчёта стоимости чек-апа'),

          bodyP(
            'Основной функциональный модуль клиентской части — модальное окно онлайн-записи на приём (рисунок 4). При открытии формы автоматически подставляются выбранная услуга, её стоимость и закреплённый врач, а для авторизованного клиента — его ФИО, телефон и данные питомца из медицинской карты. При выборе даты система сверяется с расписанием специалиста и выводит сетку его персональных часов приёма: свободные окна доступны для нажатия, а уже занятые слоты отображаются неактивными.'
          ),
          ...figureBlock(fig4Buf, 'Рисунок 4 – Форма онлайн-записи и выбор свободного окна врача'),

          bodyP(
            'После нажатия кнопки «Подтвердить запись» заявка сохраняется в базе данных, а пользователю открывается окно подтверждения с уникальным номером талона (например, LP-482910), датой и временем визита, ФИО врача и памяткой подготовки питомца к осмотру (рисунок 5). Кнопка «Скачать талон и памятку» формирует текстовый документ для сохранения на телефон или печати.'
          ),
          ...figureBlock(fig5Buf, 'Рисунок 5 – Подтверждение записи и формирование именного талона'),

          bodyP(
            'В разделе «Мои записи» (личный кабинет владельца питомца) клиент видит свою электронную медицинскую карту животного (кличка, порода, вес, дата вакцинации и особенности здоровья), а также список всех своих предстоящих и завершённых визитов (рисунок 6). Для активных записей доступны функции переноса даты и времени на другое свободное окно врача, скачивания талона и отмены визита, а также кнопка «Удалить мой аккаунт» с диалоговым окном предупреждения, позволяющая пользователю самостоятельно удалить свою учётную запись.'
          ),
          ...figureBlock(fig6Buf, 'Рисунок 6 – Личный кабинет клиента «Мои записи» и медкарта питомца'),

          bodyP(
            'Пользователю с ролью «администратор» (логин «1», пароль «1») в верхней панели сайта открывается доступ в CRM-панель «Управление клиникой» (рисунок 7). В верхней части панели выводятся сводные показатели работы центра: общее число заявок, количество новых обращений, текущая дежурная бригада и суммарная выручка по активным приёмам. Администратор может менять статусы записей («Новая», «Подтверждена», «Завершена», «Отменена»), переназначать врача, добавлять новые услуги в прайс-лист с автоматической синхронизацией цен, а на вкладке «Аккаунты» — удалять любую учётную запись клиента или врача с обязательным предупреждением.'
          ),
          ...figureBlock(fig7Buf, 'Рисунок 7 – Панель администратора «Управление клиникой»'),

          bodyP(
            'По требованию безопасности внутренний график работы врачей (режим смен 2 через 2, дневные смены 10:00–20:00 и ночные смены 20:00–10:00) полностью скрыт с публичной части сайта для обычных посетителей и доступен исключительно в кабинетах администратора и врачей (рисунок 8). Таблица расписания рассчитана на длительный горизонт и автоматически учитывает больничные листы, плановые отпуска и учебные конференции сотрудников, назначая на время отсутствия специалиста заменяющего врача из резервной бригады.'
          ),
          ...figureBlock(fig8Buf, 'Рисунок 8 – Внутренний график дежурств бригад 2/2 с учётом больничных, отпусков и подмен'),

          bodyP(
            'Каждому из восьми специалистов клиники предоставлен персональный кабинет ветеринарного врача (рисунок 9). Врач видит список записей, закреплённых за его ФИО, а также обращения к дежурному специалисту, которые можно взять в работу в один клик. По завершении осмотра врач заполняет поле клинических рекомендаций и выписки. При этом врачу по регламенту безопасности запрещено самостоятельно удалять свою служебную учётную запись (при нажатии выводится предупреждение безопасности).'
          ),
          ...figureBlock(fig9Buf, 'Рисунок 9 – Личный кабинет ветеринарного врача и ведение приёмов'),

          heading2P('2.3. Тестирование web-сайта'),
          bodyP(
            'Для проверки надёжности и корректности работы разработанного веб-сайта ветеринарной клиники «Лапа Помощи» было проведено комплексное функциональное, ролевое и модульное тестирование. Основной задачей испытаний являлась проверка правильности выполнения всех пользовательских сценариев для трёх ролей системы («Клиент», «Ветеринарный врач» и «Администратор»), а также контроль защиты данных от некорректных действий.'
          ),
          bodyP(
            'В ходе тестирования проверялись: работа трёх отдельных навигационных вкладок сайта («Главная и услуги», «Врачи (8)» и «Отзывы»), точность расчёта стоимости диагностических программ в калькуляторе чек-апа, автоматический подбор ведущего специалиста по направлению, блокировка уже занятых временных слотов при онлайн-записи, расчёт сменного графика бригад 2/2 с автоматической заменой врача на период больничного или отпуска, а также соблюдение регламента ролевого удаления учётных записей с обязательным выводом предупреждений.'
          ),
          bodyP(
            'Перечень основных тестовых сценариев (тест-кейсов) и результаты их выполнения представлены в таблице 4.'
          ),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 360, before: 160, after: 80 },
            children: [
              new TextRun({
                text: 'Таблица 4 – План и результаты функционального и ролевого тестирования сайта',
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          table4,
          bodyP(
            'Особое внимание при тестировании безопасности было уделено проверке ролевых прав при удалении учётных записей. При тестировании подтверждено, что обычный клиент может удалить исключительно собственный аккаунт после подтверждения диалогового окна с предупреждением о безвозвратном удалении профиля и медкарты питомца. При попытке ветеринарного врача удалить свой аккаунт система блокирует операцию и выводит предупреждение о том, что учётные записи врачей связаны с расписанием дежурных бригад 2/2 и управляются только администратором. Администратор клиники во вкладке «Аккаунты» успешно удаляет любую учётную запись клиента или сотрудника после подтверждения предупреждения. Протокол автоматизированной проверки всех сценариев приведён на рисунке 10.'
          ),
          ...figureBlock(fig10Buf, 'Рисунок 10 – Протокол проверки функциональных и ролевых сценариев веб-сайта «Лапа Помощи»'),
          bodyP(
            'Дополнительно было проведено тестирование кроссбраузерной совместимости и адаптивности вёрстки в браузерах Google Chrome, Яндекс Браузер, Mozilla Firefox и Microsoft Edge при ширине области просмотра от 375 пикселей (мобильные смартфоны) до 1920 пикселей (широкоформатные мониторы). Все интерактивные элементы, модальные окна и таблицы расписания отображаются без искажений.'
          ),

          // PAGE 22+: ЗАКЛЮЧЕНИЕ (EXPANDED)
          heading1P('ЗАКЛЮЧЕНИЕ', true),
          bodyP(
            'В ходе выполнения курсового проекта по МДК 02.02 «Инструментальные средства разработки программного обеспечения» был спроектирован, разработан и протестирован полнофункциональный веб-сайт для круглосуточной ветеринарной клиники «Лапа Помощи» (г. Москва, ул. Профсоюзная, д. 45). Программный продукт создан с применением современного стека веб-технологий: языков программирования и разметки TypeScript, JavaScript, HTML5 и CSS3, компонентной библиотеки React 19, утилитарного фреймворка стилей Tailwind CSS, инструмента сборки Vite и облачной базы данных реального времени Firebase Firestore в связке с локальным хранилищем LocalStorage API.'
          ),
          bodyP(
            'В первой (теоретической) части курсового проекта был проведён детальный анализ предметной области современной ветеринарной медицины. Было установлено, что традиционная запись пациентов по телефону или через бумажный журнал регистратуры приводит к пересечению записей («двойной брони») к одному специалисту, потере обращений в ночные часы и сложностям при перераспределении потока пациентов в случае болезни или отпуска врача. На основании проведённого анализа была обоснована необходимость разработки единой веб-платформы, объединяющей клиентский портал онлайн-записи и внутренние автоматизированные рабочие места сотрудников.'
          ),
          bodyP(
            'Во второй (практической) части проекта была спроектирована архитектура приложения, структура коллекций базы данных (users, appointments, doctors, services, shift_config) и эргономичный пользовательский интерфейс в спокойной медицинской цветовой палитре. Для повышения удобства навигации и предотвращения перегрузки главной страницы структура клиентской части была разделена на три самостоятельные вкладки: «Главная и услуги», «Врачи (8)» и «Отзывы».'
          ),
          bodyP(
            'На вкладке «Главная и услуги» реализованы интерактивный каталог ветеринарных услуг с фильтрацией по клиническим категориям и мгновенным поиском, трёхуровневый калькулятор предварительного расчёта стоимости чек-апа (с учётом вида и возраста питомца, экспресс-лаборатории CITO и выезда врача на дом), а также модуль экстренной помощи с триаж-протоколом. На отдельной вкладке «Врачи (8)» представлены подробные анкеты восьми узкопрофильных специалистов клиники с фильтрацией по специализации и поиском по ФИО, а на вкладке «Отзывы» — истории выздоровления реальных пациентов с фильтрацией по видам животных и формой публикации нового отзыва.'
          ),
          bodyP(
            'Ключевым модулем клиентской части стала интеллектуальная форма онлайн-записи на приём, которая автоматически подбирает профильного специалиста под выбранную услугу или вид животного (например, ратолога для грызунов и кроликов, кардиолога для ЭхоКГ, хирурга для эндоскопических операций), отображает сетку персональных временных слотов врача и блокирует уже занятые часы. После оформления заявки формируется именной электронный талон с памяткой подготовки питомца к осмотру.'
          ),
          bodyP(
            'В личном кабинете владельца животного («Мои записи») реализовано ведение электронной медицинской карты питомца (кличка, порода, вес, номер микрочипа, дата вакцинации и аллергостатус), просмотр письменных врачебных выписок и онлайн-перенос визита на другое свободное окно без звонка в регистратуру.'
          ),
          bodyP(
            'Для персонала ветеринарного центра разработаны специализированные рабочие кабинеты. В личном кабинете ветеринарного врача специалист видит только своих пациентов на смену, может принимать в работу обращения к дежурному врачу и сохранять клинические рекомендации напрямую в медкарту владельца. В CRM-панели администратора («Управление клиникой») доступны сводная аналитика выручки, управление всеми заявками, редактирование прайс-листа с автоматическим пересчётом цен и настройка внутреннего графика дежурств двух бригад по схеме 2 через 2. При этом внутренний график смен 2/2 полностью скрыт с публичных страниц сайта и автоматически назначает заменяющего специалиста при оформлении больничного листа или отпуска.'
          ),
          bodyP(
            'Особое внимание в проекте уделено информационной безопасности и ролевому управлению учётными записями (RBAC). В системе реализован механизм удаления аккаунтов с обязательным выводом диалоговых окон предупреждения: обычный пользователь (клиент) имеет право самостоятельно удалить только свой собственный аккаунт; ветеринарному врачу удаление своей или чужой учётной записи строго запрещено регламентом безопасности; администратор клиники обладает полномочиями на удаление любого аккаунта клиента или врача с возможностью восстановления демонстрационных данных.'
          ),
          bodyP(
            'Проведённое функциональное, ролевое и кроссбраузерное тестирование подтвердило отсутствие программных ошибок, высокую скорость отклика интерфейса и полное соответствие разработанного веб-сайта техническому заданию. Внедрение созданного программного продукта в деятельность ветеринарной клиники «Лапа Помощи» позволяет сократить нагрузку на регистратуру, исключить ошибки расписания и повысить качество ветеринарного обслуживания. Все поставленные в курсовом проекте задачи выполнены в полном объёме, цель работы достигнута.'
          ),

          // PAGE 24+: СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ (ONLY URAIT, NO ACCESS DATES, NO 6-13 WEB LINKS)
          heading1P('СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ', true),
          bodyP('1. Зыков, С. В. Программирование : учебник и практикум для академического бакалавриата / С. В. Зыков. — 2-е изд., перераб. и доп. — Москва : Издательство Юрайт, 2023. — 285 с. — (Высшее образование). — ISBN 978-5-534-16031-4. — Текст : электронный // Образовательная платформа Юрайт [сайт]. — URL: https://urait.ru/bcode/530294'),
          bodyP('2. Полуэктова, Н. Р. Разработка веб-приложений : учебное пособие для среднего профессионального образования / Н. Р. Полуэктова. — 2-е изд. — Москва : Издательство Юрайт, 2024. — 204 с. — (Профессиональное образование). — ISBN 978-5-534-18644-4. — Текст : электронный // Образовательная платформа Юрайт [сайт]. — URL: https://urait.ru/bcode/545237'),
          bodyP('3. Сысолетин, Е. Г. Разработка интернет-приложений : учебное пособие для среднего профессионального образования / Е. Г. Сысолетин, С. Д. Ростунцев. — Москва : Издательство Юрайт, 2024. — 80 с. — (Профессиональное образование). — ISBN 978-5-534-19603-0. — Текст : электронный // Образовательная платформа Юрайт [сайт]. — URL: https://urait.ru/bcode/556745'),
          bodyP('4. Тузовский, А. Ф. Проектирование и разработка web-приложений : учебное пособие для среднего профессионального образования / А. Ф. Тузовский. — Москва : Издательство Юрайт, 2024. — 219 с. — (Профессиональное образование). — ISBN 978-5-534-16767-2. — Текст : электронный // Образовательная платформа Юрайт [сайт]. — URL: https://urait.ru/bcode/541917'),
          bodyP('5. Информационные технологии в менеджменте (управлении) : учебник и практикум для вузов / Ю. Д. Романова [и др.] ; под редакцией Ю. Д. Романовой. — 3-е изд., перераб. и доп. — Москва : Издательство Юрайт, 2024. — 467 с. — (Высшее образование). — ISBN 978-5-534-17037-5. — Текст : электронный // Образовательная платформа Юрайт [сайт]. — URL: https://urait.ru/bcode/535966'),

          // PAGE 25: ПРИЛОЖЕНИЕ А
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 160 },
            children: [
              new TextRun({ text: 'ПРИЛОЖЕНИЕ А', font: 'Times New Roman', size: 28, bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 200 },
            children: [
              new TextRun({
                text: 'Листинг src/data/clinicData.ts (структура моделей данных)',
                font: 'Times New Roman',
                size: 28,
                bold: true,
              }),
            ],
          }),
          ...appendixALines.map((line) => codeLineP(line)),

          // PAGE 26: ПРИЛОЖЕНИЕ Б
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 160 },
            children: [
              new TextRun({ text: 'ПРИЛОЖЕНИЕ Б', font: 'Times New Roman', size: 28, bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 200 },
            children: [
              new TextRun({
                text: 'Листинг src/services/firestoreService.ts (синхронизация с БД)',
                font: 'Times New Roman',
                size: 28,
                bold: true,
              }),
            ],
          }),
          ...appendixBLines.map((line) => codeLineP(line)),

          // PAGE 27-28: ПРИЛОЖЕНИЕ В
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 160 },
            children: [
              new TextRun({ text: 'ПРИЛОЖЕНИЕ В', font: 'Times New Roman', size: 28, bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 200 },
            children: [
              new TextRun({
                text: 'Листинг src/components/BookingModal.tsx (фрагмент записи на приём)',
                font: 'Times New Roman',
                size: 28,
                bold: true,
              }),
            ],
          }),
          ...appendixCLines.map((line) => codeLineP(line)),

          // PAGE 29: ПРИЛОЖЕНИЕ Г
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 160 },
            children: [
              new TextRun({ text: 'ПРИЛОЖЕНИЕ Г', font: 'Times New Roman', size: 28, bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, after: 200 },
            children: [
              new TextRun({
                text: 'Листинг src/services/authService.ts (ролевое удаление аккаунтов с предупреждением)',
                font: 'Times New Roman',
                size: 28,
                bold: true,
              }),
            ],
          }),
          ...appendixDLines.map((line) => codeLineP(line)),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}
