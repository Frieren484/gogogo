import {
  AppointmentRecord,
  CLINIC_INFO,
  resolveAppointmentPrice,
} from '../data/clinicData';

export interface PreparationGuide {
  categoryTitle: string;
  items: string[];
}

/**
 * Формирует умную памятку подготовки владельца и питомца к визиту
 * в зависимости от выбранной ветеринарной услуги.
 */
export function getPreparationAdvice(
  serviceTitle: string,
  isEmergency?: boolean
): PreparationGuide {
  const lower = serviceTitle.toLowerCase();

  if (isEmergency || lower.includes('экстрен')) {
    return {
      categoryTitle: 'Экстренный прием / Скорая помощь',
      items: [
        'Не кормите питомца и не давайте человеческие обезболивающие (ибупрофен, парацетамол токсичны для животных).',
        'Обеспечьте покой и приток свежего воздуха, при кровотечении наложите чистую давящую повязку.',
        'Если возможно, возьмите с собой ветеринарный паспорт и упаковку препарата/растения при подозрении на отравление.',
      ],
    };
  }

  if (
    lower.includes('узи') ||
    lower.includes('биохим') ||
    lower.includes('хирург') ||
    lower.includes('стоматолог') ||
    lower.includes('эндоскоп') ||
    lower.includes('чек-ап') ||
    lower.includes('диагностик')
  ) {
    return {
      categoryTitle: 'Подготовка к диагностике / УЗИ / анестезии',
      items: [
        'Голодная диета 8–10 часов до визита (для котят, щенков и грызунов — по согласованию с врачом не более 4 часов).',
        'Воду можно оставить в свободном доступе и убрать за 2 часа до процедуры.',
        'Перед УЗИ брюшной полости желательно дать назначенный ветврачом сорбент (например, Эспумизан) за 2–3 часа.',
      ],
    };
  }

  if (lower.includes('вакцин') || lower.includes('чипир') || lower.includes('паспорт')) {
    return {
      categoryTitle: 'Подготовка к вакцинации и чипированию',
      items: [
        'Возьмите с собой оригинал ветеринарного паспорта для внесения отметок и наклеек вакцин.',
        'Плановая дегельминтизация должна быть проведена за 7–10 дней до прививки.',
        'Питомец должен быть клинически здоров (нормальная температура, аппетит и активность).',
      ],
    };
  }

  if (lower.includes('кардио') || lower.includes('эхокг') || lower.includes('экг')) {
    return {
      categoryTitle: 'Подготовка к приему кардиолога (ЭхоКГ / ЭКГ)',
      items: [
        'Голодная диета не требуется — покормите питомца в привычном режиме, чтобы снизить стресс.',
        'Возьмите результаты предыдущих обследований, рентгена или список принимаемых препаратов.',
        'Приходите за 10 минут до приема, чтобы питомец адаптировался и частота пульса пришла в норму.',
      ],
    };
  }

  return {
    categoryTitle: 'Общая памятка перед визитом в клинику',
    items: [
      'Возьмите ветеринарный паспорт и результаты прошлых анализов (если имеются).',
      'Для кошек и мелких животных используйте жесткую переноску с впитывающей пеленкой, для собак — поводок и ошейник/шлейку.',
      'Запишите название корма, лакомств и точное время появления первых симптомов.',
    ],
  };
}

/**
 * Формирует и скачивает именной талон записи с памяткой подготовки и заключением врача (.txt).
 */
export function downloadAppointmentVoucher(record: AppointmentRecord): void {
  const prep = getPreparationAdvice(record.serviceTitle, record.isEmergency);
  const priceRub = resolveAppointmentPrice(record);

  const lines: string[] = [
    '============================================================',
    `   ВЕТЕРИНАРНАЯ КЛИНИКА «${CLINIC_INFO.name.toUpperCase()}» (24/7)`,
    '   ИМЕННОЙ ТАЛОН ЗАПИСИ НА ПРИЕМ И ПАМЯТКА ВЛАДЕЛЬЦА',
    '============================================================',
    '',
    `Номер талона:        #${record.id}`,
    `Статус записи:       ${record.status}`,
    `Время оформления:    ${record.createdAt}`,
    '',
    '--- ДАННЫЕ ПАЦИЕНТА И ВЛАДЕЛЬЦА ----------------------------',
    `Владелец:            ${record.ownerName}`,
    `Телефон:             ${record.phone}`,
    `Пациент:             ${record.petSpecies} «${record.petName}»`,
    '',
    '--- ДЕТАЛИ ПРИЕМА ------------------------------------------',
    `Выбранная услуга:    ${record.serviceTitle}`,
    `Лечащий специалист:  ${record.doctorName}`,
    `Дата и время визита: ${record.preferredDate}`,
    `Расчетная стоимость: ${priceRub.toLocaleString('ru-RU')} ₽`,
    `Примечание к записи: ${record.notes || 'Без дополнительных примечаний'}`,
    '',
    `--- ПАМЯТКА ПОДГОТОВКИ (${prep.categoryTitle.toUpperCase()}) ---`,
    ...prep.items.map((item, idx) => `${idx + 1}. ${item}`),
  ];

  if (record.doctorRecommendation && record.doctorRecommendation.trim()) {
    lines.push(
      '',
      '--- ЗАКЛЮЧЕНИЕ И РЕКОМЕНДАЦИИ ЛЕЧАЩЕГО ВРАЧА ---------------',
      record.doctorRecommendation.trim()
    );
  }

  lines.push(
    '',
    '--- КОНТАКТЫ КЛИНИКИ ---------------------------------------',
    `Адрес:               г. ${CLINIC_INFO.city}, ${CLINIC_INFO.address}`,
    `Круглосуточный тел.: ${CLINIC_INFO.phoneDisplay}`,
    `График работы:       ${CLINIC_INFO.schedule}`,
    '============================================================'
  );

  const content = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `talon_${record.id}_${record.petName}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
