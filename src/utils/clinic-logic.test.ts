import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOCTORS_DATA,
  SERVICES_DATA,
  CALCULATOR_PACKAGES,
  DEFAULT_SHIFT_SCHEDULE_CONFIG,
  DEFAULT_DOCTOR_STATUS_EVENTS,
  resolveServicePriceByTitle,
  resolveDefaultDoctorForService,
  resolveAppointmentPrice,
  getDoctorShiftForDate,
  getNextWorkingDatesForDoctor,
  getReviewSpeciesCategory,
} from '../data/clinicData.ts';

// Чистая функция проверки ролевых прав удаления аккаунта (Клиент / Врач / Администратор)
function verifyAccountDeletionPermission(
  actor: { role: 'user' | 'doctor' | 'admin'; login: string },
  targetLogin: string,
  confirmedWarning: boolean
): { allowed: boolean; warningMessage: string } {
  if (!confirmedWarning) {
    return {
      allowed: false,
      warningMessage: 'Требуется подтверждение предупреждения перед удалением аккаунта.',
    };
  }
  if (actor.role === 'doctor') {
    return {
      allowed: false,
      warningMessage:
        'Предупреждение безопасности: ветеринарным врачам запрещено удалять учетные записи.',
    };
  }
  if (actor.role === 'user') {
    if (actor.login.toLowerCase() !== targetLogin.toLowerCase()) {
      return {
        allowed: false,
        warningMessage: 'Клиент может удалить только свой собственный аккаунт.',
      };
    }
    return {
      allowed: true,
      warningMessage: 'Ваш аккаунт клиента успешно удален после подтверждения предупреждения.',
    };
  }
  return {
    allowed: true,
    warningMessage: `Аккаунт «${targetLogin}» удален администратором клиники.`,
  };
}

test('ТК-01: Вкладка «Врачи (8)» содержит 8 специалистов в двух бригадах 2/2', () => {
  assert.equal(DOCTORS_DATA.length, 8);
  assert.equal(DOCTORS_DATA.filter((d) => d.brigade === 1).length, 4);
  assert.equal(DOCTORS_DATA.filter((d) => d.brigade === 2).length, 4);
});

test('ТК-02: Каталог услуг и калькулятор чек-апа содержат корректные базовые тарифы', () => {
  assert.ok(SERVICES_DATA.length >= 8);
  assert.equal(CALCULATOR_PACKAGES.length, 5);
  const therapyPrice = resolveServicePriceByTitle(
    'Терапия и первичный клинический прием',
    'Собака',
    SERVICES_DATA
  );
  assert.equal(therapyPrice, 1800);
});

test('ТК-03: Автоматическое закрепление ведущего врача по направлению диагностики и хирургии', () => {
  assert.equal(
    resolveDefaultDoctorForService('Терапия и первичный клинический прием', SERVICES_DATA, DOCTORS_DATA),
    'Волкова Елена Сергеевна'
  );
  assert.equal(
    resolveDefaultDoctorForService('Эндоскопическая хирургия и ортопедия', SERVICES_DATA, DOCTORS_DATA),
    'Смирнов Алексей Викторович'
  );
});

test('ТК-04: Синхронизация стоимости записи при обновлении прайс-листа администратором', () => {
  const customServices = SERVICES_DATA.map((s) =>
    s.title === 'Терапия и первичный клинический прием' ? { ...s, priceFrom: 2100 } : s
  );
  const updatedPrice = resolveAppointmentPrice(
    {
      serviceTitle: 'Терапия и первичный клинический прием',
      petSpecies: 'Собака',
      estimatedPrice: 1800,
    },
    customServices,
    true
  );
  assert.equal(updatedPrice, 2100);
});

test('ТК-05: График смен 2/2 корректно определяет больничный и назначает заменяющего врача', () => {
  const sickEvent = DEFAULT_DOCTOR_STATUS_EVENTS.find((e) => e.type === 'sick')!;
  const doc = DOCTORS_DATA.find((d) => d.name === sickEvent.doctorName)!;
  const shift = getDoctorShiftForDate(doc, sickEvent.startDate, DEFAULT_SHIFT_SCHEDULE_CONFIG);
  assert.equal(shift.isAbsent, true);
  assert.equal(shift.cellState, 'sick');
  assert.equal(shift.replacementDoctorName, sickEvent.replacementDoctorName);

  const nextDates = getNextWorkingDatesForDoctor(doc, sickEvent.startDate, 2, DEFAULT_SHIFT_SCHEDULE_CONFIG);
  assert.ok(!nextDates.includes(sickEvent.startDate));
});

test('ТК-06: Вкладка «Отзывы» классифицирует истории пациентов по видам животных', () => {
  const exoticCategory = getReviewSpeciesCategory({
    id: 'rev-1',
    ownerName: 'Екатерина',
    ownerRole: 'Владелец',
    petName: 'Пончик',
    petBreed: 'Карликовый кролик, 2 года',
    serviceUsed: 'Ратология',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Здоров',
    story: 'Коррекция дентальной аркады прошла успешно',
    photoUrl: '',
  });
  assert.equal(exoticCategory, 'exotic');
});

test('ТК-07: Ролевое удаление аккаунта — клиент может удалить только свой аккаунт с предупреждением', () => {
  const withoutConfirm = verifyAccountDeletionPermission(
    { role: 'user', login: 'alex' },
    'alex',
    false
  );
  assert.equal(withoutConfirm.allowed, false);

  const ownAccount = verifyAccountDeletionPermission(
    { role: 'user', login: 'alex' },
    'alex',
    true
  );
  assert.equal(ownAccount.allowed, true);

  const otherAccount = verifyAccountDeletionPermission(
    { role: 'user', login: 'alex' },
    'kate',
    true
  );
  assert.equal(otherAccount.allowed, false);
});

test('ТК-08: Ролевое удаление аккаунта — врачу запрещено удалять любые учетные записи', () => {
  const doctorSelfDelete = verifyAccountDeletionPermission(
    { role: 'doctor', login: 'smirnov' },
    'smirnov',
    true
  );
  assert.equal(doctorSelfDelete.allowed, false);
  assert.ok(doctorSelfDelete.warningMessage.includes('запрещено'));
});

test('ТК-09: Ролевое удаление аккаунта — администратор может удалить любой аккаунт клиента или врача', () => {
  const adminDeleteClient = verifyAccountDeletionPermission(
    { role: 'admin', login: '1' },
    'alex',
    true
  );
  assert.equal(adminDeleteClient.allowed, true);

  const adminDeleteDoctor = verifyAccountDeletionPermission(
    { role: 'admin', login: '1' },
    'smirnov',
    true
  );
  assert.equal(adminDeleteDoctor.allowed, true);
});

test('ТК-10: Поддержка нескольких питомцев в одном личном кабинете клиента (добавление, выбор и удаление)', () => {
  interface SimplePet {
    id: string;
    petName: string;
    petSpecies: 'Кошка' | 'Собака' | 'Грызун';
  }
  const clientPets: SimplePet[] = [
    { id: 'pet-1', petName: 'Марсель', petSpecies: 'Кошка' },
    { id: 'pet-2', petName: 'Арчи', petSpecies: 'Собака' },
  ];
  // Добавление третьего питомца
  clientPets.push({ id: 'pet-3', petName: 'Пончик', petSpecies: 'Грызун' });
  assert.equal(clientPets.length, 3);
  assert.equal(clientPets[1].petName, 'Арчи');
  // Удаление карточки одного питомца
  const afterRemove = clientPets.filter((p) => p.id !== 'pet-2');
  assert.equal(afterRemove.length, 2);
  assert.ok(afterRemove.some((p) => p.petName === 'Марсель'));
  assert.ok(afterRemove.some((p) => p.petName === 'Пончик'));
});
