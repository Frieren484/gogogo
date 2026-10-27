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
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  CALCULATOR_PACKAGES,
  DEFAULT_SHIFT_SCHEDULE_CONFIG,
  DoctorProfile,
  DOCTORS_DATA,
  getDoctorShiftForDate,
  getNextWorkingDatesForDoctor,
  PetType,
  PET_TYPES_CONFIG,
  resolveDefaultDoctorForService,
  resolveServicePriceByTitle,
  ServiceItem,
  SERVICES_DATA,
  ShiftScheduleConfig,
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
  preferredDate?: string;
  date?: string;
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
  shiftConfig?: ShiftScheduleConfig;
  onShowToast?: (message: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  prefill,
  onBookingCreated,
  servicesList = SERVICES_DATA,
  doctorsList = DOCTORS_DATA,
  currentUser,
  existingAppointments = [],
  shiftConfig = DEFAULT_SHIFT_SCHEDULE_CONFIG,
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
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    servicesList[0]?.defaultDoctorName || 'Волкова Елена Сергеевна'
  );
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

  // Закрепленный профильный врач для выбранного направления / комплекса
  const recommendedDoctorForService = useMemo(
    () => resolveDefaultDoctorForService(selectedService, servicesList, doctorsList),
    [selectedService, servicesList, doctorsList]
  );

  // Объект выбранного врача из штата (8 специалистов)
  const selectedDoctorProfile = useMemo(
    () => doctorsList.find((d) => d.name === selectedDoctor),
    [doctorsList, selectedDoctor]
  );

  // Информация о смене выбранного врача на выбранную дату (график 2/2, дневная 10–20 или ночная 20–10, личные слоты)
  const doctorShiftInfo = useMemo(
    () => getDoctorShiftForDate(selectedDoctorProfile, preferredDate, shiftConfig),
    [selectedDoctorProfile, preferredDate, shiftConfig]
  );

  // Ближайшие доступные даты выбранного врача
  const nextWorkingDates = useMemo(
    () => getNextWorkingDatesForDoctor(selectedDoctorProfile, todayDate, 4, shiftConfig),
    [selectedDoctorProfile, todayDate, shiftConfig]
  );

  // Персональные слоты времени для текущего выбранного врача
  const activeTimeSlots = useMemo(
    () => doctorShiftInfo.personalSlots,
    [doctorShiftInfo.personalSlots]
  );

  // Вычисляем занятые часы для выбранного специалиста и даты среди активных заявок (status !== 'Отменена')
  const occupiedSlotsForDoctorAndDate = useMemo(() => {
    if (!preferredDate || selectedDoctor === 'Дежурный специалист клиники') {
      return new Set<string>();
    }
    const busy = new Set<string>();
    existingAppointments.forEach((appt) => {
      if (appt.status === 'Отменена') return;
      if (appt.doctorName !== selectedDoctor) return;
      const [apptDate, apptTimeRaw] = appt.preferredDate.split(' в ').map((s) => s.trim());
      if (apptDate === preferredDate && apptTimeRaw) {
        const cleanTime = apptTimeRaw.replace(/\s*\(.*?\)\s*/g, '').trim();
        busy.add(cleanTime);
        busy.add(apptTimeRaw);
      }
    });
    return busy;
  }, [existingAppointments, selectedDoctor, preferredDate]);

  // Автоматически переключаем время на первый свободный слот из персонального расписания врача,
  // если текущее время не входит в смену этого врача или уже занято
  useEffect(() => {
    const isSlotInDoctorSchedule = activeTimeSlots.includes(preferredTime);
    const isCurrentOccupied = occupiedSlotsForDoctorAndDate.has(preferredTime);

    if (!isSlotInDoctorSchedule || isCurrentOccupied) {
      const firstAvailable = activeTimeSlots.find(
        (slot) => !occupiedSlotsForDoctorAndDate.has(slot)
      );
      if (firstAvailable) {
        setPreferredTime(firstAvailable);
      } else if (activeTimeSlots[0]) {
        setPreferredTime(activeTimeSlots[0]);
      }
    }
  }, [activeTimeSlots, occupiedSlotsForDoctorAndDate, preferredTime]);

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

      if (
        currentUser &&
        currentUser.authSource !== 'guest' &&
        currentUser.role === 'user'
      ) {
        setOwnerName(currentUser.displayName.replace(/\s*\(.*?\)\s*/g, '').trim());
        setPhone(currentUser.phone || '');

        const savedPetCard = getClientPetProfile(currentUser);
        if (savedPetCard && savedPetCard.petName) {
          setPetName(savedPetCard.petName);
          if (!prefill?.petType) {
            setPetSpecies(savedPetCard.petSpecies);
          }
          const cardNotes = [
            savedPetCard.breedAndAge && savedPetCard.breedAndAge !== '—'
              ? savedPetCard.breedAndAge
              : '',
            savedPetCard.weightKg && savedPetCard.weightKg !== '—'
              ? `вес ${savedPetCard.weightKg} кг`
              : '',
            savedPetCard.chronicNotes && savedPetCard.chronicNotes !== '—'
              ? savedPetCard.chronicNotes
              : '',
          ]
            .filter(Boolean)
            .join(', ');
          setNotes(cardNotes);
          setAutoFilledFromPetCard(true);
        } else {
          setPetName(currentUser.petName || '');
          if (!prefill?.petType && currentUser.petSpecies) {
            setPetSpecies(currentUser.petSpecies);
          }
          setNotes('');
        }
      } else {
        setOwnerName('');
        setPhone('');
        setPetName('');
        setNotes('');
      }

      if (prefill?.petType) {
        setPetSpecies(PET_TYPES_CONFIG[prefill.petType].label);
      }

      const initialService =
        prefill?.serviceTitle || servicesList[0]?.title || SERVICES_DATA[0].title;
      setSelectedService(initialService);

      if (prefill?.preferredDate || prefill?.date) {
        setPreferredDate(prefill.preferredDate || prefill.date || tomorrowDate);
      } else {
        setPreferredDate(tomorrowDate);
      }

      // Если передан конкретный врач — ставим его, иначе ставим закрепленного врача выбранного направления
      if (prefill?.doctorName) {
        setSelectedDoctor(prefill.doctorName);
      } else {
        const autoAssignedDoctor = resolveDefaultDoctorForService(
          initialService,
          servicesList,
          doctorsList
        );
        setSelectedDoctor(autoAssignedDoctor);
      }
    }
  }, [isOpen, prefill, currentUser, servicesList, doctorsList, tomorrowDate]);

  if (!isOpen) return null;

  const handleServiceChange = (newServiceTitle: string) => {
    setSelectedService(newServiceTitle);
    // При смене направления/комплекса автоматически подставляем закрепленного за ним профильного врача (его всегда можно поменять)
    const assignedDoc = resolveDefaultDoctorForService(
      newServiceTitle,
      servicesList,
      doctorsList
    );
    setSelectedDoctor(assignedDoc);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errorMessage) setErrorMessage('');
  };

  const isDoctorAbsentOnSelectedDate =
    selectedDoctor !== 'Дежурный специалист клиники' &&
    doctorShiftInfo.isAbsent;

  const isBookingOnDoctorOffDay =
    selectedDoctor !== 'Дежурный специалист клиники' &&
    !doctorShiftInfo.isWorkingOnDate &&
    !doctorShiftInfo.isAbsent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser || currentUser.authSource === 'guest') {
      setErrorMessage(
        'Для оформления онлайн-записи войдите в личный кабинет или зарегистрируйтесь.'
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

    if (isDoctorAbsentOnSelectedDate) {
      setErrorMessage(
        `Врач «${selectedDoctor}» на дату ${preferredDate} не ведет прием (${doctorShiftInfo.specialReason || 'отсутствует'}). Выберите заменяющего врача (${doctorShiftInfo.replacementDoctorName || 'Дежурный специалист клиники'}) или переключитесь на рабочий день специалиста.`
      );
      return;
    }

    // Проверка на пересечение слотов у врача
    if (occupiedSlotsForDoctorAndDate.has(preferredTime)) {
      setErrorMessage(
        `У специалиста «${selectedDoctor}» время ${preferredTime} на ${preferredDate} уже занято. Пожалуйста, выберите другое свободное окно.`
      );
      return;
    }

    const finalNotes =
      notes.trim() ||
      (prefill?.isEmergency ? 'Экстренный вызов через сайт' : 'Запись онлайн через сайт');

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
      isAdvanceBooking: isBookingOnDoctorOffDay,
      status: 'Новая',
      notes: finalNotes,
      ownerUid: currentUser.role === 'user' ? currentUser.uid : undefined,
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
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FCFBF7] border border-[#CFE2DA] shadow-2xl overflow-hidden my-8">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#EEF5F1] border-b border-[#CFE2DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shrink-0">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <h3 id="booking-modal-title" className="text-lg font-bold text-[#122B24]">
                Запись на прием в «Лапу Помощи»
              </h3>
              <p className="text-xs text-[#35524A]">
                Выберите направление, специалиста и удобное время визита
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Закрыть окно"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#35524A] hover:text-[#122B24] hover:bg-[#DCECE5] transition-snappy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedRecord ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-[#122B24] mb-2">
              Ваш талон на приём успешно оформлен!
            </h4>
            <p className="text-xs sm:text-sm text-[#35524A] max-w-md mx-auto mb-5">
              Заявка{' '}
              <span className="font-semibold text-[#122B24] tabular-nums">
                #{submittedRecord.id}
              </span>{' '}
              сохранена в расписании клиники и доступна в разделе «Мои заявки».
            </p>

            <div className="rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] p-4 text-left space-y-2 mb-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#35524A]">Владелец и телефон:</span>
                <span className="font-semibold text-[#122B24] text-right tabular-nums">
                  {submittedRecord.ownerName} ({submittedRecord.phone})
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#35524A]">Пациент:</span>
                <span className="font-semibold text-[#122B24]">
                  {submittedRecord.petSpecies} «{submittedRecord.petName}»
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#35524A]">Направление / Услуга:</span>
                <span className="font-semibold text-[#122B24] text-right">
                  {submittedRecord.serviceTitle}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#35524A]">Специалист:</span>
                <span className="font-medium text-[#122B24] text-right">
                  {submittedRecord.doctorName}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#35524A]">Дата и время:</span>
                <span className="font-semibold text-[#122B24] tabular-nums">
                  {submittedRecord.preferredDate}
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#CFE2DA]">
                <span className="text-[#35524A]">Расчетная стоимость:</span>
                <span className="font-bold text-[#0D9488] tabular-nums">
                  {submittedRecord.estimatedPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Памятка подготовки к приему */}
            <div className="rounded-xl bg-white border border-[#CFE2DA] p-4 text-left mb-5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#122B24]">
                <ClipboardCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>Памятка подготовки ({preparationGuide.categoryTitle}):</span>
              </div>
              {preparationGuide.items.map((item, idx) => (
                <div key={idx} className="text-xs text-[#35524A] flex items-start gap-1.5">
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
                className="w-full py-3.5 px-4 rounded-xl bg-[#EEF5F1] hover:bg-[#DCECE5] border border-[#0D9488] text-[#122B24] font-bold text-xs sm:text-sm transition-snappy inline-flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="rounded-xl bg-[#E6F4F1] border border-[#CFE2DA] px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-xs text-[#122B24]">
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
              <div className="rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-[#122B24]">
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
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Ваше имя *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#35524A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Например, Анна Иванова"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Контактный телефон *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#35524A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] tabular-nums focus:outline-none focus:border-[#0D9488]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Вид питомца *
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EEF5F1] rounded-xl border border-[#CFE2DA]">
                  {(['Кошка', 'Собака', 'Грызун'] as const).map((species) => (
                    <button
                      key={species}
                      type="button"
                      onClick={() => setPetSpecies(species)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-snappy whitespace-nowrap cursor-pointer ${
                        petSpecies === species
                          ? 'bg-[#0D9488] text-white shadow-xs'
                          : 'text-[#35524A] hover:text-[#122B24]'
                      }`}
                    >
                      {species}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Кличка питомца *
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Например, Барсик или Ричард"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>
            </div>

            {/* Service & Attached Default Specialist */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Выберите направление или комплексную программу *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
                >
                  {allServiceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Информационная плашка закрепленного врача за направлением */}
              <div className="rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#122B24]">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span>
                    Закрепленный врач направления:{' '}
                    <strong className="text-[#0F766E]">{recommendedDoctorForService}</strong>
                  </span>
                </div>
                {selectedDoctor !== recommendedDoctorForService && (
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(recommendedDoctorForService)}
                    className="text-[11px] font-bold text-[#0D9488] hover:underline cursor-pointer"
                  >
                    Вернуть профильного врача
                  </button>
                )}
              </div>
            </div>

            {/* Doctor Selection + Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Лечащий врач (можно поменять)
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] font-semibold focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="Дежурный специалист клиники">
                    Дежурный специалист клиники
                  </option>
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} — {doc.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                  Дата визита *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#35524A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    min={todayDate}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] tabular-nums focus:outline-none focus:border-[#0D9488]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sick Leave / Vacation / Conference Alert Banner with 1-Click Switch to Replacement Doctor */}
            {isDoctorAbsentOnSelectedDate && selectedDoctorProfile && (
              <div className="rounded-xl bg-rose-50 border-2 border-rose-300 p-4 space-y-2.5 text-xs text-rose-950">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-sm">
                      На дату {preferredDate} врач «{selectedDoctorProfile.name}» не ведет прием
                    </div>
                    <p className="text-[11px] text-rose-900 mt-1 leading-relaxed">
                      В этот день прием по данному профилю ведет профильный специалист:{' '}
                      <strong>
                        {doctorShiftInfo.replacementDoctorName || 'Дежурный специалист клиники'}
                      </strong>
                      . Вы можете переключиться на него в 1 клик или выбрать другую доступную дату:
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {doctorShiftInfo.replacementDoctorName && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doctorShiftInfo.replacementDoctorName!);
                        setErrorMessage('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-extrabold cursor-pointer transition-snappy shadow-xs"
                    >
                      Записаться к специалисту: {doctorShiftInfo.replacementDoctorName}
                    </button>
                  )}
                  {nextWorkingDates.map((wDate) => (
                    <button
                      key={wDate}
                      type="button"
                      onClick={() => {
                        setPreferredDate(wDate);
                        setErrorMessage('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-rose-900 text-[11px] font-bold tabular-nums cursor-pointer transition-snappy"
                    >
                      Выбрать дату: {wDate}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Doctor Time Slots Grid & Select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-[#122B24]">
                  Доступное время приема врача *
                </label>
                <span className="text-[11px] text-[#35524A]">
                  Забронированные часы подписаны как «Занято»
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {activeTimeSlots.map((slot) => {
                  const isOccupied = occupiedSlotsForDoctorAndDate.has(slot);
                  const isSelected = preferredTime === slot && !isOccupied;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setPreferredTime(slot)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold tabular-nums transition-all ${
                        isOccupied
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-[#0D9488] border-[#0D9488] text-white shadow-xs cursor-pointer'
                          : 'bg-white border-[#CFE2DA] text-[#122B24] hover:border-[#0D9488] hover:bg-[#EEF5F1] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{slot}</span>
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isOccupied
                            ? 'text-red-500 no-underline'
                            : isSelected
                            ? 'text-white/90'
                            : 'text-[#0F766E]'
                        }`}
                      >
                        {isOccupied ? 'Занято' : 'Свободно'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {petSpecies === 'Грызун' &&
              !selectedDoctor.toLowerCase().includes('соколов') && (
                <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488]/40 px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-[#122B24]">
                  <span>
                    Для кроликов и грызунов рекомендуем профильного ратолога —{' '}
                    <strong>Соколову Анну Павловну</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor('Соколова Анна Павловна')}
                    className="px-2.5 py-1 rounded-lg bg-[#0D9488] text-white font-bold text-[11px] hover:bg-[#0F766E] transition-snappy shrink-0 cursor-pointer"
                  >
                    Выбрать ратолога
                  </button>
                </div>
              )}

            {occupiedSlotsForDoctorAndDate.size > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 flex items-center gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  У специалиста <strong>{selectedDoctor}</strong> на{' '}
                  <span className="tabular-nums font-semibold">{preferredDate}</span> уже заняты часы:{' '}
                  <strong className="tabular-nums">
                    {Array.from(occupiedSlotsForDoctorAndDate).join(', ')}
                  </strong>
                  . Они помечены как «Занято» и недоступны для выбора.
                </span>
              </div>
            )}

            {/* Live Preparation Guide Preview inside Form */}
            <div className="rounded-xl bg-[#EEF5F1] border border-[#CFE2DA] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#122B24]">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                <span>Как подготовить питомца ({preparationGuide.categoryTitle}):</span>
              </div>
              <p className="text-[11px] text-[#35524A] leading-relaxed">
                {preparationGuide.items[0]} Полная памятка будет прикреплена к вашему именному талону.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#122B24] mb-1.5">
                Комментарий к записи (необязательно)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Возраст, симптомы или пожелания по приему"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#CFE2DA] bg-white text-[#122B24] focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm shadow-md transition-snappy whitespace-nowrap cursor-pointer"
              >
                Подтвердить запись на прием ({preferredDate} в {preferredTime})
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#35524A]">
                <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>
                  Индивидуальное расписание врача · Защита от двойной записи · Именной талон сразу
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
