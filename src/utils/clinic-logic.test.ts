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
  INITIAL_APPOINTMENTS_DATA,
} from '../data/clinicData.ts';

test('DOCTORS_DATA contains 8 narrow-profile veterinary specialists across 2 brigades', () => {
  assert.equal(DOCTORS_DATA.length, 8);
  const brigade1 = DOCTORS_DATA.filter((d) => d.brigade === 1);
  const brigade2 = DOCTORS_DATA.filter((d) => d.brigade === 2);
  assert.equal(brigade1.length, 4);
  assert.equal(brigade2.length, 4);
});

test('SERVICES_DATA covers all core clinical categories with valid base prices', () => {
  assert.ok(SERVICES_DATA.length >= 8);
  for (const service of SERVICES_DATA) {
    assert.ok(service.priceFrom > 0);
    assert.ok(service.defaultDoctorName.length > 0);
  }
});

test('resolveServicePriceByTitle computes accurate price by service title', () => {
  const price = resolveServicePriceByTitle(
    'Терапия и первичный клинический прием',
    'Собака',
    SERVICES_DATA
  );
  assert.equal(price, 1800);
});

test('resolveDefaultDoctorForService assigns therapist for primary clinical exam', () => {
  const doctor = resolveDefaultDoctorForService(
    'Терапия и первичный клинический прием',
    SERVICES_DATA,
    DOCTORS_DATA
  );
  assert.equal(doctor, 'Волкова Елена Сергеевна');
});

test('resolveDefaultDoctorForService assigns chief surgeon for endoscopic surgery', () => {
  const doctor = resolveDefaultDoctorForService(
    'Эндоскопическая хирургия и ортопедия',
    SERVICES_DATA,
    DOCTORS_DATA
  );
  assert.equal(doctor, 'Смирнов Алексей Викторович');
});

test('resolveDefaultDoctorForService assigns emergency doctor for triage dispatch', () => {
  const doctor = resolveDefaultDoctorForService(
    'Экстренный выезд бригады на дом',
    SERVICES_DATA,
    DOCTORS_DATA
  );
  assert.equal(doctor, 'Морозов Дмитрий Игоревич');
});

test('CALCULATOR_PACKAGES defines 5 check-up programs with attached doctors', () => {
  assert.equal(CALCULATOR_PACKAGES.length, 5);
  assert.ok(CALCULATOR_PACKAGES[0].basePrice > 0);
  assert.ok(CALCULATOR_PACKAGES[0].defaultDoctorName.length > 0);
});

test('resolveAppointmentPrice synchronizes appointment cost with current price list', () => {
  const sample = INITIAL_APPOINTMENTS_DATA[0];
  const syncedPrice = resolveAppointmentPrice(sample, SERVICES_DATA, true);
  assert.ok(syncedPrice > 0);
});

test('getDoctorShiftForDate calculates 2/2 brigade rotation accurately', () => {
  const doctor = DOCTORS_DATA[0];
  const status = getDoctorShiftForDate(
    doctor,
    DEFAULT_SHIFT_SCHEDULE_CONFIG.anchorDate,
    DEFAULT_SHIFT_SCHEDULE_CONFIG
  );
  assert.equal(status.isWorkingOnDate, true);
});

test('getDoctorShiftForDate detects sick leave and assigns replacement doctor', () => {
  const sickEvent = DEFAULT_DOCTOR_STATUS_EVENTS.find((e) => e.type === 'sick')!;
  const doc = DOCTORS_DATA.find((d) => d.name === sickEvent.doctorName)!;
  const status = getDoctorShiftForDate(
    doc,
    sickEvent.startDate,
    DEFAULT_SHIFT_SCHEDULE_CONFIG
  );
  assert.equal(status.isAbsent, true);
  assert.equal(status.cellState, 'sick');
  assert.equal(status.replacementDoctorName, sickEvent.replacementDoctorName);
});

test('getDoctorShiftForDate marks replacement doctor as on substitute duty', () => {
  const sickEvent = DEFAULT_DOCTOR_STATUS_EVENTS.find((e) => e.type === 'sick')!;
  const repDoc = DOCTORS_DATA.find((d) => d.name === sickEvent.replacementDoctorName)!;
  const status = getDoctorShiftForDate(
    repDoc,
    sickEvent.startDate,
    DEFAULT_SHIFT_SCHEDULE_CONFIG
  );
  assert.equal(status.isWorkingOnDate, true);
});

test('getDoctorShiftForDate handles planned vacation events accurately', () => {
  const vacEvent = DEFAULT_DOCTOR_STATUS_EVENTS.find((e) => e.type === 'vacation')!;
  const doc = DOCTORS_DATA.find((d) => d.name === vacEvent.doctorName)!;
  const status = getDoctorShiftForDate(
    doc,
    vacEvent.startDate,
    DEFAULT_SHIFT_SCHEDULE_CONFIG
  );
  assert.equal(status.isAbsent, true);
  assert.equal(status.cellState, 'vacation');
});

test('getNextWorkingDatesForDoctor skips sick leave days automatically', () => {
  const sickEvent = DEFAULT_DOCTOR_STATUS_EVENTS.find((e) => e.type === 'sick')!;
  const doc = DOCTORS_DATA.find((d) => d.name === sickEvent.doctorName)!;
  const dates = getNextWorkingDatesForDoctor(
    doc,
    sickEvent.startDate,
    3,
    DEFAULT_SHIFT_SCHEDULE_CONFIG
  );
  assert.equal(dates.length, 3);
  assert.ok(!dates.includes(sickEvent.startDate));
});

test('getReviewSpeciesCategory classifies cat patient stories accurately', () => {
  const catType = getReviewSpeciesCategory({
    id: 'r1',
    ownerName: 'Анна',
    ownerRole: 'Владелец',
    petName: 'Барсик',
    petBreed: 'Британский кот, 4 года',
    serviceUsed: 'Терапия',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Здоров',
    story: 'Отличный прием',
    photoUrl: '',
  });
  assert.equal(catType, 'cats');
});

test('getReviewSpeciesCategory classifies exotic rodent patient stories accurately', () => {
  const exoticType = getReviewSpeciesCategory({
    id: 'r2',
    ownerName: 'Екатерина',
    ownerRole: 'Владелец',
    petName: 'Пончик',
    petBreed: 'Карликовый кролик, 2 года',
    serviceUsed: 'Ратология',
    visitDate: 'Октябрь 2026',
    rating: 5,
    beforeAfterOutcome: 'Здоров',
    story: 'Прием ратолога',
    photoUrl: '',
  });
  assert.equal(exoticType, 'exotic');
});

test('INITIAL_APPOINTMENTS_DATA has valid statuses and doctor assignments', () => {
  assert.ok(INITIAL_APPOINTMENTS_DATA.length >= 10);
  const validStatuses = new Set(['Новая', 'Подтверждена', 'Завершена', 'Отменена']);
  for (const item of INITIAL_APPOINTMENTS_DATA) {
    assert.ok(validStatuses.has(item.status));
    assert.ok(item.doctorName.length > 0);
  }
});
