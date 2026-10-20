import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  PawPrint,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  CALCULATOR_PACKAGES,
  DoctorProfile,
  DOCTORS_DATA,
  PetType,
  PET_TYPES_CONFIG,
  resolveServicePriceByTitle,
  ServiceItem,
  SERVICES_DATA,
} from '../data/clinicData';
import { AppUserProfile, getClientPetProfile } from '../services/authService';
import {
  downloadAppointmentVoucher,
  getPreparationAdvice,
} from '../utils/appointmentVoucher';

export interface BookingPrefill {
  petType?: PetType;
  serviceTitle?: string;
  doctorName?: string;
  estimatedPrice?: number;
  isEmergency?: boolean;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: BookingPrefill | null;
  onBookingCreated: (record: AppointmentRecord) => void;
  servicesList?: ServiceItem[];
  doctorsList?: DoctorProfile[];
  currentUser?: AppUserProfile;
  existingAppointments?: AppointmentRecord[];
  onShowToast?: (message: string) => void;
}

const TIME_SLOTS = [
  '09:00',
  '11:00',
  '13:00',
  '15:00',
  '17:00',
  '19:00',
  '21:00',
  '00:00 (Ночной прием)',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  prefill,
  onBookingCreated,
  servicesList = SERVICES_DATA,
  doctorsList = DOCTORS_DATA,
  currentUser,
  existingAppointments = [],
  onShowToast,
}) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [petSpecies, setPetSpecies] = useState<string>('Кошка');
  const [petName, setPetName] = useState('');
  const [selectedService, setSelectedService] = useState<string>(
    servicesList[0]?.title || SERVICES_DATA[0].title
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Дежурный специалист клиники');
  const [preferredDate, setPreferredDate] = useState<string>(tomorrowDate);
  const [preferredTime, setPreferredTime] = useState<string>('11:00');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedRecord, setSubmittedRecord] = useState<AppointmentRecord | null>(null);
  const [autoFilledFromPetCard, setAutoFilledFromPetCard] = useState<boolean>(false);

  const allServiceOptions = useMemo(() => {
    const optionSet = new Set<string>([
      ...servicesList.map((s) => s.title),
      ...CALCULATOR_PACKAGES.map((p) => p.title),
      'Экстренный выезд бригады на дом (за 30 минут)',
    ]);
    if (prefill?.serviceTitle) {
      optionSet.add(prefill.serviceTitle);
    }
    if (selectedService) {
      optionSet.add(selectedService);
    }
    return Array.from(optionSet);
  }, [servicesList, prefill?.serviceTitle, selectedService]);

  // Защита от двойной записи к одному врачу на одно и то же время:
  // Вычисляем занятые часы для выбранного специалиста и даты среди активных заявок (status !== 'Отменена')
  const occupiedSlotsForDoctorAndDate = useMemo(() => {
    if (!preferredDate || selectedDoctor === 'Дежурный специалист клиники') {
      return new Set<string>();
    }
    const busy = new Set<string>();
    existingAppointments.forEach((appt) => {
      if (appt.status === 'Отменена') return;
      if (appt.doctorName !== selectedDoctor) return;
      const [apptDate, apptTime] = appt.preferredDate.split(' в ').map((s) => s.trim());
      if (apptDate === preferredDate && apptTime) {
        busy.add(apptTime);
      }
    });
    return busy;
  }, [existingAppointments, selectedDoctor, preferredDate]);

  // Автоматически переключаем время на первый свободный слот, если текущий оказался занят
  useEffect(() => {
    if (occupiedSlotsForDoctorAndDate.has(preferredTime)) {
      const firstAvailable = TIME_SLOTS.find(
        (slot) => !occupiedSlotsForDoctorAndDate.has(slot)
      );
      if (firstAvailable) {
        setPreferredTime(firstAvailable);
      }
    }
  }, [occupiedSlotsForDoctorAndDate, preferredTime]);

  // Умная памятка подготовки к выбранной услуге
  const preparationGuide = useMemo(
    () => getPreparationAdvice(selectedService, prefill?.isEmergency),
    [selectedService, prefill?.isEmergency]
  );

  // Автоматический расчет ориентировочной стоимости по прайс-листу клиники или калькулятору
  const computedEstimatedPrice = useMemo(() => {
    if (
      prefill?.estimatedPrice &&
      (!prefill.serviceTitle || prefill.serviceTitle === selectedService)
    ) {
      return Math.round(Number(prefill.estimatedPrice));
    }
    const catalogPrice = resolveServicePriceByTitle(
      selectedService,
      petSpecies,
      servicesList
    );
    if (catalogPrice !== null) {
      return catalogPrice;
    }
    return Math.round(Number(prefill?.estimatedPrice) || 1800);
  }, [
    prefill?.estimatedPrice,
    prefill?.serviceTitle,
    selectedService,
    petSpecies,
    servicesList,
  ]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSubmittedRecord(null);
      setAutoFilledFromPetCard(false);

      if (currentUser && currentUser.authSource !== 'guest') {
        setOwnerName(currentUser.displayName.replace(/\s*\(.*?\)\s*/g, '').trim());

        // Автоподстановка данных из сохраненной электронной медкарты питомца
        const savedPetCard = getClientPetProfile(currentUser);
        if (savedPetCard && savedPetCard.petName) {
          setPetName(savedPetCard.petName);
          if (!prefill?.petType) {
            setPetSpecies(savedPetCard.petSpecies);
          }
          const cardNotes = [
            savedPetCard.breedAndAge,
            savedPetCard.weightKg ? `вес ${savedPetCard.weightKg} кг` : '',
            savedPetCard.chronicNotes,
          ]
            .filter(Boolean)
            .join(', ');
          if (cardNotes) {
            setNotes(cardNotes);
          }
          setAutoFilledFromPetCard(true);
        }
      } else {
        setOwnerName((prev) => (prev === 'Гость' ? '' : prev));
      }

      if (prefill?.petType) {
        setPetSpecies(PET_TYPES_CONFIG[prefill.petType].label);
      }
      if (prefill?.serviceTitle) {
        setSelectedService(prefill.serviceTitle);
      } else if (servicesList[0]?.title) {
        setSelectedService(servicesList[0].title);
      }
      if (prefill?.doctorName) {
        setSelectedDoctor(prefill.doctorName);
      } else {
        setSelectedDoctor('Дежурный специалист клиники');
      }
    }
  }, [isOpen, prefill, currentUser, servicesList]);

  if (!isOpen) return null;

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errorMessage) setErrorMessage('');
  };

  // Прямое оформление записи без кодов и без поля почты
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser || currentUser.authSource === 'guest') {
      setErrorMessage(
        'Для записи на прием необходимо войти через Google (или под аккаунтом администратора).'
      );
      return;
    }

    const trimmedOwner = ownerName.trim();
    const trimmedPet = petName.trim();
    const digitsOnly = phone.replace(/\D/g, '');

    if (trimmedOwner.length < 2) {
      setErrorMessage('Пожалуйста, укажите имя владельца (не менее 2 символов).');
      return;
    }

    if (digitsOnly.length < 10) {
      setErrorMessage('Пожалуйста, введите корректный номер телефона (10–11 цифр).');
      return;
    }

    if (trimmedPet.length < 1) {
      setErrorMessage('Пожалуйста, укажите кличку вашего питомца.');
      return;
    }

    if (!preferredDate || preferredDate < todayDate) {
      setErrorMessage('Пожалуйста, выберите корректную дату приема (не ранее сегодняшнего дня).');
      return;
    }

    // Проверка на пересечение слотов у врача
    if (occupiedSlotsForDoctorAndDate.has(preferredTime)) {
      setErrorMessage(
        `У специалиста «${selectedDoctor}» время ${preferredTime} на ${preferredDate} уже занято. Пожалуйста, выберите другое свободное окно.`
      );
      return;
    }

    const newRecord: AppointmentRecord = {
      id: `LP-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ownerName: trimmedOwner,
      phone: phone.trim(),
      petSpecies,
      petName: trimmedPet,
      serviceTitle: selectedService,
      doctorName: selectedDoctor,
      preferredDate: `${preferredDate} в ${preferredTime}`,
      estimatedPrice: computedEstimatedPrice,
      isEmergency: prefill?.isEmergency || false,
      status: 'Новая',
      notes:
        notes.trim() ||
        (prefill?.isEmergency ? 'Экстренный вызов через сайт' : 'Запись онлайн через сайт'),
      ownerUid: currentUser?.uid,
    };

    onBookingCreated(newRecord);
    setSubmittedRecord(newRecord);

    if (onShowToast) {
      onShowToast(
        `Заявка #${newRecord.id} для питомца «${newRecord.petName}» успешно оформлена на ${newRecord.preferredDate}!`
      );
    }
  };

  const resetAndClose = () => {
    setPetName('');
    setNotes('');
    setSubmittedRecord(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-8">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#F4FAF8] border-b border-[#D1EAE4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shrink-0">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <h3 id="booking-modal-title" className="text-lg font-bold text-[#0F2922]">
                Запись на прием в «Лапу Помощи»
              </h3>
              <p className="text-xs text-[#335249]">
                Москва, ул. Профсоюзная, 45 · Круглосуточный прием 24/7
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Закрыть окно"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#335249] hover:text-[#0F2922] hover:bg-[#E6F4F1] transition-snappy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedRecord ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-[#0F2922] mb-2">
              Ваш талон на приём успешно оформлен!
            </h4>
            <p className="text-xs sm:text-sm text-[#335249] max-w-md mx-auto mb-5">
              Заявка{' '}
              <span className="font-semibold text-[#0F2922] tabular-nums">
                #{submittedRecord.id}
              </span>{' '}
              сохранена в расписании клиники и доступна в разделе «Мои заявки».
            </p>

            <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 text-left space-y-2 mb-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#335249]">Владелец и телефон:</span>
                <span className="font-semibold text-[#0F2922] text-right tabular-nums">
                  {submittedRecord.ownerName} ({submittedRecord.phone})
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#335249]">Пациент:</span>
                <span className="font-semibold text-[#0F2922]">
                  {submittedRecord.petSpecies} «{submittedRecord.petName}»
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#335249]">Услуга:</span>
                <span className="font-semibold text-[#0F2922] text-right">
                  {submittedRecord.serviceTitle}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#335249]">Специалист:</span>
                <span className="font-medium text-[#0F2922] text-right">
                  {submittedRecord.doctorName}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#335249]">Дата и время:</span>
                <span className="font-semibold text-[#0F2922] tabular-nums">
                  {submittedRecord.preferredDate}
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#D1EAE4]">
                <span className="text-[#335249]">Расчетная стоимость:</span>
                <span className="font-bold text-[#0D9488] tabular-nums">
                  {submittedRecord.estimatedPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Памятка подготовки к приему */}
            <div className="rounded-xl bg-white border border-[#D1EAE4] p-4 text-left mb-5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2922]">
                <ClipboardCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>Памятка подготовки ({preparationGuide.categoryTitle}):</span>
              </div>
              {preparationGuide.items.map((item, idx) => (
                <div key={idx} className="text-xs text-[#335249] flex items-start gap-1.5">
                  <span className="text-[#0D9488] font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  downloadAppointmentVoucher(submittedRecord);
                  if (onShowToast) {
                    onShowToast(
                      `Талон #${submittedRecord.id} с памяткой подготовки скачан на ваше устройство.`
                    );
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F4FAF8] hover:bg-[#E6F4F1] border border-[#0D9488] text-[#0F2922] font-bold text-xs sm:text-sm transition-snappy inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0D9488]" />
                <span>Скачать талон и памятку (.txt)</span>
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs sm:text-sm transition-snappy whitespace-nowrap cursor-pointer"
              >
                Отлично, закрыть окно
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {computedEstimatedPrice > 0 && (
              <div className="rounded-xl bg-[#E6F4F1] border border-[#D1EAE4] px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-xs text-[#0F2922]">
                  <span className="font-semibold">
                    {prefill?.estimatedPrice && prefill?.serviceTitle === selectedService
                      ? 'Перенесено из калькулятора:'
                      : 'Ориентировочная стоимость по прайсу:'}
                  </span>{' '}
                  {selectedService}
                </div>
                <span className="text-sm font-bold text-[#0D9488] tabular-nums shrink-0">
                  ~ {computedEstimatedPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {autoFilledFromPetCard && (
              <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-[#0F2922]">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span>
                    Данные питомца <strong>«{petName}»</strong> подставлены из вашей медкарты
                  </span>
                </div>
                <span className="text-[11px] text-[#0D9488] font-semibold">Автозаполнение</span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Ваше имя *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#335249] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Например, Анна Иванова"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Контактный телефон *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#335249] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Вид питомца *
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4FAF8] rounded-xl border border-[#D1EAE4]">
                  {(['Кошка', 'Собака', 'Грызун'] as const).map((species) => (
                    <button
                      key={species}
                      type="button"
                      onClick={() => setPetSpecies(species)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-snappy whitespace-nowrap ${
                        petSpecies === species
                          ? 'bg-[#0D9488] text-white shadow-xs'
                          : 'text-[#335249] hover:text-[#0F2922]'
                      }`}
                    >
                      {species}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Кличка питомца *
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Например, Барсик или Ричард"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Выберите услугу или программу *
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
              >
                {allServiceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Специалист
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="Дежурный специалист клиники">Дежурный врач</option>
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Дата визита *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#335249] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    min={todayDate}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Удобное время
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#335249] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                  >
                    {TIME_SLOTS.map((t) => {
                      const isOccupied = occupiedSlotsForDoctorAndDate.has(t);
                      return (
                        <option key={t} value={t} disabled={isOccupied}>
                          {isOccupied ? `${t} — Занято` : t}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {occupiedSlotsForDoctorAndDate.size > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 flex items-center gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Защита расписания: у специалиста <strong>{selectedDoctor}</strong> на{' '}
                  <span className="tabular-nums font-semibold">{preferredDate}</span> уже заняты часы:{' '}
                  <strong className="tabular-nums">
                    {Array.from(occupiedSlotsForDoctorAndDate).join(', ')}
                  </strong>
                  . Доступны только свободные окна.
                </span>
              </div>
            )}

            {/* Live Preparation Guide Preview inside Form */}
            <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2922]">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                <span>Как подготовить питомца ({preparationGuide.categoryTitle}):</span>
              </div>
              <p className="text-[11px] text-[#335249] leading-relaxed">
                {preparationGuide.items[0]} Полная памятка будет прикреплена к вашему именному талону.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Комментарий к записи (необязательно)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Возраст, симптомы или пожелания по приему"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm shadow-md transition-snappy whitespace-nowrap cursor-pointer"
              >
                Подтвердить запись на прием
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#335249]">
                <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>Мгновенное оформление без лишних кодов · Именной талон формируется сразу</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
