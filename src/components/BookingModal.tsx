import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  PawPrint,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  CALCULATOR_PACKAGES,
  CLINIC_INFO,
  DoctorProfile,
  DOCTORS_DATA,
  PetType,
  PET_TYPES_CONFIG,
  ServiceItem,
  SERVICES_DATA,
} from '../data/clinicData';
import {
  AppUserProfile,
  EmailNotificationLog,
  sendAppointmentEmailNotification,
} from '../services/authService';

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
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  prefill,
  onBookingCreated,
  servicesList = SERVICES_DATA,
  doctorsList = DOCTORS_DATA,
  currentUser,
}) => {
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const allServiceOptions = [
    ...servicesList.map((s) => s.title),
    ...CALCULATOR_PACKAGES.map((p) => p.title),
    'Экстренный выезд бригады на дом (за 30 минут)',
  ];

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
  const [emailNotification, setEmailNotification] = useState<EmailNotificationLog | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSubmittedRecord(null);
      setEmailNotification(null);
      if (currentUser && !ownerName) {
        setOwnerName(currentUser.displayName.replace(/\s*\(.*?\)\s*/g, ''));
      }
      if (currentUser && !email) {
        setEmail(currentUser.email);
      }
      if (prefill?.petType) {
        setPetSpecies(PET_TYPES_CONFIG[prefill.petType].label);
      }
      if (prefill?.serviceTitle) {
        setSelectedService(prefill.serviceTitle);
      }
      if (prefill?.doctorName) {
        setSelectedDoctor(prefill.doctorName);
      } else {
        setSelectedDoctor('Дежурный специалист клиники');
      }
    }
  }, [isOpen, prefill, currentUser]);

  if (!isOpen) return null;

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedOwner = ownerName.trim();
    const trimmedPet = petName.trim();
    const trimmedEmail = email.trim();
    const digitsOnly = phone.replace(/\D/g, '');

    if (trimmedOwner.length < 2) {
      setErrorMessage('Пожалуйста, укажите имя владельца (не менее 2 символов).');
      return;
    }

    if (digitsOnly.length < 10) {
      setErrorMessage('Пожалуйста, введите корректный номер телефона (10–11 цифр).');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Пожалуйста, укажите корректный Email для получения уведомления о записи.');
      return;
    }

    if (trimmedPet.length < 1) {
      setErrorMessage('Пожалуйста, укажите кличку вашего питомца.');
      return;
    }

    if (!preferredDate) {
      setErrorMessage('Пожалуйста, выберите желаемую дату приема.');
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
      email: trimmedEmail,
      petSpecies,
      petName: trimmedPet,
      serviceTitle: selectedService,
      doctorName: selectedDoctor,
      preferredDate: `${preferredDate} в ${preferredTime}`,
      estimatedPrice: prefill?.estimatedPrice,
      isEmergency: prefill?.isEmergency || false,
      status: 'Новая',
      notes: notes.trim() || (prefill?.isEmergency ? 'Экстренный вызов через сайт' : 'Запись онлайн'),
      ownerUid: currentUser?.uid,
      senderAliasEmail: CLINIC_INFO.publicAliasEmail, // LapaPomochu@gmail.com
    };

    const sentMail = sendAppointmentEmailNotification(newRecord);
    setEmailNotification(sentMail);
    onBookingCreated(newRecord);
    setSubmittedRecord(newRecord);
  };

  const resetAndClose = () => {
    setPetName('');
    setNotes('');
    setSubmittedRecord(null);
    setEmailNotification(null);
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
              Спасибо! Администратор свяжется с вами в течение 5 минут
            </h4>
            <p className="text-xs sm:text-sm text-[#335249] max-w-md mx-auto mb-5">
              Ваша заявка{' '}
              <span className="font-semibold text-[#0F2922] tabular-nums">
                #{submittedRecord.id}
              </span>{' '}
              зарегистрирована и сохранена в разделе «Мои заявки».
            </p>

            {/* Masked Email Notification Preview Card */}
            {emailNotification && (
              <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488] p-4 text-left mb-5 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#0F2922]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0D9488] shrink-0" />
                    <span>Отправлено Email-уведомление с талоном</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0D9488]">Доставлено</span>
                </div>
                <div className="text-xs text-[#335249]">
                  Отправитель для клиента:{' '}
                  <strong className="text-[#0F2922]">
                    Клиника «Лапа Помощи» &lt;{emailNotification.displaySenderEmail}&gt;
                  </strong>
                </div>
                <div className="text-xs text-[#335249]">
                  Получатель:{' '}
                  <strong className="text-[#0F2922]">{emailNotification.recipientEmail}</strong>
                </div>
                <div className="text-[11px] text-[#335249] pt-1 border-t border-[#D1EAE4]">
                  Тема: {emailNotification.subject}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 text-left space-y-2 mb-6 text-sm">
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
              {submittedRecord.estimatedPrice && (
                <div className="flex justify-between gap-4 pt-2 border-t border-[#D1EAE4]">
                  <span className="text-[#335249]">Расчетная стоимость:</span>
                  <span className="font-bold text-[#0D9488] tabular-nums">
                    {submittedRecord.estimatedPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-sm transition-snappy whitespace-nowrap cursor-pointer"
            >
              Отлично, закрыть окно
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {prefill?.estimatedPrice && (
              <div className="rounded-xl bg-[#E6F4F1] border border-[#D1EAE4] px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-xs text-[#0F2922]">
                  <span className="font-semibold">Перенесено из калькулятора:</span>{' '}
                  {prefill.serviceTitle}
                </div>
                <span className="text-sm font-bold text-[#0D9488] tabular-nums shrink-0">
                  ~ {prefill.estimatedPrice.toLocaleString('ru-RU')} ₽
                </span>
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

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Ваш Email для получения талона и уведомления *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#335249] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#335249] mt-1">
                Уведомление придет от официального адреса клиники{' '}
                <strong className="text-[#0F2922]">{CLINIC_INFO.publicAliasEmail}</strong>
              </p>
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
                    {[
                      '09:00',
                      '11:00',
                      '13:00',
                      '15:00',
                      '17:00',
                      '19:00',
                      '21:00',
                      '00:00 (Ночной прием)',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
                Подтвердить запись и получить талон на Email
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#335249]">
                <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>Без предоплаты · Перезвоним за 5 минут для подтверждения</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
