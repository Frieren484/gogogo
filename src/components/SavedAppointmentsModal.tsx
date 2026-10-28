import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  HeartPulse,
  MessageSquarePlus,
  PawPrint,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import {
  AppointmentRecord,
  DEFAULT_SHIFT_SCHEDULE_CONFIG,
  DoctorItem,
  DOCTORS_DATA,
  DUTY_DOCTOR_FALLBACK_SLOTS,
  resolveAppointmentPrice,
  ServiceItem,
  SERVICES_DATA,
  ShiftScheduleConfig,
} from '../data/clinicData';
import {
  AppUserProfile,
  ClientPetProfile,
  deleteAccountWithRoleCheck,
  deleteClientPetProfile,
  filterAppointmentsForUser,
  getClientPetProfiles,
  upsertClientPetProfile,
} from '../services/authService';
import {
  downloadAppointmentVoucher,
  getPreparationAdvice,
} from '../utils/appointmentVoucher';

interface SavedAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentRecord[];
  allAppointments?: AppointmentRecord[];
  servicesList?: ServiceItem[];
  doctorsList?: DoctorItem[];
  shiftConfig?: ShiftScheduleConfig;
  currentUser: AppUserProfile;
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment?: (id: string, newPreferredDate: string) => void;
  onDeleteCancelledAppointment?: (id: string) => void;
  onOpenReviewForAppointment?: (record: AppointmentRecord) => void;
  onNewAppointment: () => void;
  onOpenAuthModal?: () => void;
  onUserUpdated?: (user: AppUserProfile) => void;
  onShowToast?: (message: string) => void;
}

export const SavedAppointmentsModal: React.FC<SavedAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  allAppointments = [],
  servicesList = SERVICES_DATA,
  doctorsList = DOCTORS_DATA,
  shiftConfig = DEFAULT_SHIFT_SCHEDULE_CONFIG,
  currentUser,
  onCancelAppointment,
  onRescheduleAppointment,
  onDeleteCancelledAppointment,
  onOpenReviewForAppointment,
  onNewAppointment,
  onOpenAuthModal,
  onUserUpdated,
  onShowToast,
}) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'appointments' | 'pet_profile'>('appointments');
  const [expandedPrepId, setExpandedPrepId] = useState<string | null>(null);
  const [showDeleteAccountWarning, setShowDeleteAccountWarning] = useState(false);

  // Состояние переноса визита (Reschedule)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(tomorrowDate);
  const [rescheduleTime, setRescheduleTime] = useState<string>('11:00');
  const [rescheduleError, setRescheduleError] = useState<string>('');

  // Список питомцев клиента (поддержка нескольких питомцев)
  const [petsList, setPetsList] = useState<ClientPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('new');
  const [confirmDeletePetId, setConfirmDeletePetId] = useState<string | null>(null);

  // Поля формы активного/нового питомца
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<'Кошка' | 'Собака' | 'Грызун'>('Кошка');
  const [breedAndAge, setBreedAndAge] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [chronicNotes, setChronicNotes] = useState<string>('');
  const [lastVaccinationDate, setLastVaccinationDate] = useState<string>('');
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string>('');
  const [savedBanner, setSavedBanner] = useState<string>('');

  // Строгая RBAC-фильтрация:
  // Если currentUser.role === 'user', показываем ТОЛЬКО собственные записи этого пользователя.
  const visibleAppointments = useMemo(
    () => filterAppointmentsForUser(appointments, currentUser),
    [appointments, currentUser]
  );

  const applyPetToForm = (pet: ClientPetProfile) => {
    setSelectedPetId(pet.id || 'pet-1');
    setPetName(pet.petName);
    setPetSpecies(pet.petSpecies);
    setBreedAndAge(pet.breedAndAge);
    setWeightKg(pet.weightKg);
    setChronicNotes(pet.chronicNotes);
    setLastVaccinationDate(pet.lastVaccinationDate);
    setProfileUpdatedAt(pet.updatedAt);
    setConfirmDeletePetId(null);
  };

  const handleStartAddNewPet = () => {
    setSelectedPetId('new');
    setPetName('');
    setPetSpecies('Кошка');
    setBreedAndAge('');
    setWeightKg('');
    setChronicNotes('');
    setLastVaccinationDate('');
    setProfileUpdatedAt('');
    setSavedBanner('');
    setConfirmDeletePetId(null);
  };

  useEffect(() => {
    if (isOpen) {
      setSavedBanner('');
      setReschedulingId(null);
      setRescheduleError('');
      setShowDeleteAccountWarning(false);
      setConfirmDeletePetId(null);

      const storedPets = getClientPetProfiles(currentUser);
      setPetsList(storedPets);

      if (storedPets.length > 0) {
        applyPetToForm(storedPets[0]);
      } else {
        const latestAppt = visibleAppointments[0];
        setSelectedPetId('new');
        setPetName(latestAppt?.petName || '');
        setPetSpecies(
          (latestAppt?.petSpecies as 'Кошка' | 'Собака' | 'Грызун') || 'Кошка'
        );
        setBreedAndAge('');
        setWeightKg('');
        setChronicNotes('');
        setLastVaccinationDate('');
        setProfileUpdatedAt('');
      }
    }
  }, [isOpen, currentUser, visibleAppointments]);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin' && currentUser.login === '1';
  const isGuest = currentUser.authSource === 'guest';

  const handleConfirmSelfDelete = () => {
    const res = deleteAccountWithRoleCheck(currentUser, {
      uid: currentUser.uid,
      login: currentUser.login || currentUser.uid,
      role: 'user',
      displayName: currentUser.displayName,
    });
    if (res.ok) {
      setShowDeleteAccountWarning(false);
      if (onUserUpdated) {
        onUserUpdated(res.nextActiveUser);
      }
      if (onShowToast) {
        onShowToast(res.message);
      }
      onClose();
    } else if (onShowToast) {
      onShowToast(res.error);
    }
  };

  const handleSavePetCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      if (onOpenAuthModal) {
        onClose();
        onOpenAuthModal();
      }
      return;
    }
    if (!petName.trim()) {
      setSavedBanner('Пожалуйста, укажите кличку вашего питомца.');
      return;
    }

    const isCreatingNew = selectedPetId === 'new';
    const { pets: updatedList, savedPet } = upsertClientPetProfile(currentUser, {
      id: isCreatingNew ? undefined : selectedPetId,
      petName,
      petSpecies,
      breedAndAge,
      weightKg,
      chronicNotes,
      lastVaccinationDate,
      updatedAt: new Date().toLocaleDateString('ru-RU'),
    });

    setPetsList(updatedList);
    applyPetToForm(savedPet);

    if (onUserUpdated && currentUser.role === 'user' && updatedList[0]) {
      onUserUpdated({
        ...currentUser,
        petName: updatedList[0].petName,
        petSpecies: updatedList[0].petSpecies,
      });
    }

    const msg = isCreatingNew
      ? `Питомец «${savedPet.petName}» (${savedPet.petSpecies}) добавлен в ваш кабинет! Всего питомцев: ${updatedList.length}.`
      : `Электронная медкарта питомца «${savedPet.petName}» обновлена!`;
    setSavedBanner(msg);
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  const handleConfirmDeletePet = (pet: ClientPetProfile) => {
    if (!pet.id) return;
    const remaining = deleteClientPetProfile(currentUser, pet.id);
    setPetsList(remaining);
    setConfirmDeletePetId(null);

    if (remaining.length > 0) {
      applyPetToForm(remaining[0]);
    } else {
      handleStartAddNewPet();
    }

    if (onUserUpdated && currentUser.role === 'user') {
      onUserUpdated({
        ...currentUser,
        petName: remaining[0]?.petName || '',
        petSpecies: remaining[0]?.petSpecies || 'Кошка',
      });
    }

    const msg = `Карточка питомца «${pet.petName}» удалена из вашего списка.`;
    setSavedBanner(msg);
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  const handleDownloadTicket = (record: AppointmentRecord) => {
    downloadAppointmentVoucher(record);
    if (onShowToast) {
      onShowToast(`Именной талон #${record.id} с памяткой подготовки скачан.`);
    }
  };

  const getDoctorForRecord = (record: AppointmentRecord): DoctorItem | undefined => {
    return doctorsList.find((d) => d.name === record.doctorName);
  };

  const getSlotsForRecord = (record: AppointmentRecord): string[] => {
    const doc = getDoctorForRecord(record);
    return doc?.personalSlots && doc.personalSlots.length > 0
      ? doc.personalSlots
      : DUTY_DOCTOR_FALLBACK_SLOTS;
  };

  const getOccupiedSlotsForReschedule = (record: AppointmentRecord, targetDate: string) => {
    const sourceList = allAppointments.length > 0 ? allAppointments : appointments;
    if (!targetDate || record.doctorName === 'Дежурный специалист клиники') {
      return new Set<string>();
    }
    const busy = new Set<string>();
    sourceList.forEach((appt) => {
      if (appt.id === record.id) return;
      if (appt.status === 'Отменена') return;
      if (appt.doctorName !== record.doctorName) return;
      const [apptDate, apptTime] = appt.preferredDate.split(' в ').map((s) => s.trim());
      if (apptDate === targetDate && apptTime) {
        busy.add(apptTime);
      }
    });
    return busy;
  };

  const startReschedule = (record: AppointmentRecord) => {
    setRescheduleError('');
    setReschedulingId(record.id);
    const [existingDate, existingTime] = record.preferredDate.split(' в ').map((s) => s.trim());
    const targetDate = existingDate && existingDate >= todayDate ? existingDate : tomorrowDate;
    setRescheduleDate(targetDate);
    const docSlots = getSlotsForRecord(record);
    const busy = getOccupiedSlotsForReschedule(record, targetDate);
    if (existingTime && docSlots.includes(existingTime) && !busy.has(existingTime)) {
      setRescheduleTime(existingTime);
    } else {
      const firstFree = docSlots.find((s) => !busy.has(s)) || docSlots[0] || '10:00';
      setRescheduleTime(firstFree);
    }
  };

  const handleConfirmReschedule = (record: AppointmentRecord) => {
    if (!rescheduleDate || rescheduleDate < todayDate) {
      setRescheduleError('Выберите корректную дату (не ранее сегодняшнего дня).');
      return;
    }
    const busySlots = getOccupiedSlotsForReschedule(record, rescheduleDate);
    if (busySlots.has(rescheduleTime)) {
      setRescheduleError(
        `У врача «${record.doctorName}» слот ${rescheduleTime} на ${rescheduleDate} уже занят. Выберите другое время.`
      );
      return;
    }
    const nextPreferredDate = `${rescheduleDate} в ${rescheduleTime}`;
    if (onRescheduleAppointment) {
      onRescheduleAppointment(record.id, nextPreferredDate);
    }
    setReschedulingId(null);
    setRescheduleError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-appointments-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FCFBF7] border border-[#CFE2DA] shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-5 bg-[#EAF2EE] border-b border-[#CFE2DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shrink-0">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="saved-appointments-title" className="text-lg font-bold text-[#0F2922]">
                {isAdmin
                  ? `Все записи клиники (${visibleAppointments.length})`
                  : 'Личный кабинет владельца питомца'}
              </h3>
              <p className="text-xs text-[#335249]">
                {isAdmin
                  ? 'Полный реестр записей всех клиентов (режим Администратора)'
                  : `Профиль клиента: ${currentUser.displayName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#335249] hover:text-[#0F2922] hover:bg-[#E6F4F1] transition-snappy cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Вкладки Личного кабинета */}
        <div className="px-6 pt-4 bg-[#F4FAF8]/50 border-b border-[#D1EAE4] flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-snappy inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white border border-[#D1EAE4] text-[#335249] hover:text-[#0F2922]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {isAdmin
                  ? `Реестр записей (${visibleAppointments.length})`
                  : `Мои заявки и талоны (${visibleAppointments.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pet_profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-snappy inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'pet_profile'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white border border-[#D1EAE4] text-[#335249] hover:text-[#0F2922]'
              }`}
            >
              <PawPrint className="w-3.5 h-3.5" />
              <span>
                Мои питомцы ({petsList.length})
              </span>
            </button>
          </div>

          {!isGuest && currentUser.role === 'user' && (
            <button
              type="button"
              onClick={() => setShowDeleteAccountWarning((prev) => !prev)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-1.5 transition-snappy cursor-pointer"
              title="Удалить свой аккаунт с предупреждением"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить мой аккаунт</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Предупреждение перед удалением собственного аккаунта клиента */}
          {showDeleteAccountWarning && !isGuest && currentUser.role === 'user' && (
            <div className="mb-4 rounded-xl bg-red-50 border-2 border-red-300 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-red-900">
                    Предупреждение: безвозвратное удаление вашего аккаунта
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Вы собираетесь удалить свой собственный аккаунт{' '}
                    <strong>«{currentUser.displayName}»</strong> (логин:{' '}
                    <span className="font-mono font-bold">
                      {currentUser.login || currentUser.uid}
                    </span>
                    ). При подтверждении ваш профиль и электронные медкарты ваших питомцев будут удалены, а вы выйдете в гостевой режим.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountWarning(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelfDelete}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Да, удалить мой аккаунт</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Isolation Badge for Regular Clients */}
          {!isAdmin && (
            <div className="mb-4 rounded-xl bg-[#E6F4F1]/70 border border-[#D1EAE4] px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#0F2922]">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>
                {isGuest
                  ? 'Вы находитесь в гостевом режиме. Войдите или зарегистрируйтесь, чтобы сохранять электронные медкарты нескольких питомцев и историю приемов.'
                  : 'Защита данных: вы можете вести электронные медкарты сразу для нескольких своих питомцев и переключаться между ними при записи.'}
              </span>
            </div>
          )}

          {isGuest ? (
            <div className="text-center py-8 px-4 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4]">
              <PawPrint className="w-9 h-9 text-[#0D9488] mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#0F2922] mb-1.5">
                Войдите в кабинет владельца питомца
              </h4>
              <p className="text-xs text-[#335249] max-w-md mx-auto mb-5 leading-relaxed">
                После входа или быстрой регистрации за 15 секунд здесь будут доступны ваши талоны на прием, заключения врачей и электронные медкарты ваших питомцев с автозаполнением.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="py-2.5 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-snappy inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Войти или зарегистрироваться</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNewAppointment();
                  }}
                  className="py-2.5 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-snappy inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Записаться на прием</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'pet_profile' ? (
            <form onSubmit={handleSavePetCard} className="space-y-4">
              {/* Панель выбора и добавления нескольких питомцев */}
              <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F2922]">
                      Ваши питомцы ({petsList.length})
                    </h4>
                    <p className="text-[11px] text-[#335249]">
                      Выберите питомца для просмотра медкарты или добавьте нового члена семьи
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAddNewPet}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-snappy cursor-pointer ${
                      selectedPetId === 'new'
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-white border border-[#0D9488] text-[#0D9488] hover:bg-[#E6F4F1]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить питомца</span>
                  </button>
                </div>

                {petsList.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {petsList.map((pet) => {
                      const isSelected = selectedPetId === pet.id;
                      return (
                        <div
                          key={pet.id || pet.petName}
                          onClick={() => {
                            setSavedBanner('');
                            applyPetToForm(pet);
                          }}
                          className={`rounded-xl border p-3 flex items-center justify-between gap-2 transition-snappy cursor-pointer ${
                            isSelected
                              ? 'bg-[#E6F4F1] border-[#0D9488] shadow-xs'
                              : 'bg-white border-[#D1EAE4] hover:border-[#0D9488]/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                                isSelected
                                  ? 'bg-[#0D9488] text-white'
                                  : 'bg-[#F4FAF8] text-[#0D9488]'
                              }`}
                            >
                              <PawPrint className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#0F2922] truncate flex items-center gap-1.5">
                                <span>«{pet.petName}»</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-white/80 border border-[#CFE2DA] text-[10px] font-semibold text-[#335249]">
                                  {pet.petSpecies}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#335249] truncate">
                                {pet.breedAndAge || 'Порода не указана'}
                                {pet.weightKg ? ` · ${pet.weightKg} кг` : ''}
                              </div>
                            </div>
                          </div>

                          {petsList.length > 1 && pet.id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeletePetId(
                                  confirmDeletePetId === pet.id ? null : pet.id!
                                );
                              }}
                              className="p-1.5 rounded-lg text-[#335249] hover:text-red-600 hover:bg-red-50 transition-snappy shrink-0 cursor-pointer"
                              title={`Удалить карточку питомца «${pet.petName}»`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Подтверждение удаления карточки отдельного питомца */}
                {confirmDeletePetId && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-red-900 font-medium">
                      Удалить карточку питомца{' '}
                      <strong>
                        «{petsList.find((p) => p.id === confirmDeletePetId)?.petName}»
                      </strong>{' '}
                      из вашего списка?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePetId(null)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const targetPet = petsList.find(
                            (p) => p.id === confirmDeletePetId
                          );
                          if (targetPet) handleConfirmDeletePet(targetPet);
                        }}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                      >
                        Да, удалить питомца
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F2922]">
                      {selectedPetId === 'new'
                        ? 'Добавление нового питомца в личный кабинет'
                        : `Электронный паспорт пациента «${petName || 'Питомец'}»`}
                    </h4>
                    <p className="text-xs text-[#335249] mt-0.5">
                      {selectedPetId === 'new'
                        ? 'Заполните карточку второго или следующего питомца — при записи на прием вы сможете выбирать любого из своих питомцев в 1 клик.'
                        : 'Данные этого питомца автоматически подставляются при выборе его карточки в окне записи на прием.'}
                    </p>
                  </div>
                </div>
                {profileUpdatedAt && selectedPetId !== 'new' && (
                  <span className="text-[11px] font-semibold text-[#0D9488] bg-[#E6F4F1] px-2.5 py-1 rounded-lg whitespace-nowrap">
                    Обновлено: {profileUpdatedAt}
                  </span>
                )}
              </div>

              {savedBanner && (
                <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488] px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-[#0F2922]">
                  <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                  <span>{savedBanner}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                    Кличка питомца *
                  </label>
                  <input
                    type="text"
                    required
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Например, Персик, Арчи или Буся"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                    Вид животного *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4FAF8] rounded-xl border border-[#D1EAE4]">
                    {(['Кошка', 'Собака', 'Грызун'] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setPetSpecies(sp)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold transition-snappy cursor-pointer ${
                          petSpecies === sp
                            ? 'bg-[#0D9488] text-white'
                            : 'text-[#335249] hover:text-[#0F2922]'
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                    Порода и возраст
                  </label>
                  <input
                    type="text"
                    value={breedAndAge}
                    onChange={(e) => setBreedAndAge(e.target.value)}
                    placeholder="Например: Британская короткошерстная, 3 года"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                    Вес (кг)
                  </label>
                  <input
                    type="text"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Например: 4.5"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                    Хронические особенности, аллергии на препараты или рацион
                  </label>
                  <input
                    type="text"
                    value={chronicNotes}
                    onChange={(e) => setChronicNotes(e.target.value)}
                    placeholder="Например: чувствительное пищеварение, без курицы"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                    Последняя вакцинация
                  </label>
                  <input
                    type="date"
                    value={lastVaccinationDate}
                    onChange={(e) => setLastVaccinationDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#D1EAE4] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNewAppointment();
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] hover:bg-[#E6F4F1] text-xs font-semibold text-[#0F2922] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#0D9488]" />
                  <span>Записать питомца на прием</span>
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {selectedPetId === 'new'
                      ? 'Добавить питомца в кабинет'
                      : `Сохранить медкарту «${petName || 'питомца'}»`}
                  </span>
                </button>
              </div>
            </form>
          ) : visibleAppointments.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4]">
              <Clock className="w-8 h-8 text-[#0D9488] mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#0F2922] mb-1">
                У вашего аккаунта пока нет активных записей
              </h4>
              <p className="text-xs text-[#335249] max-w-sm mx-auto mb-5">
                Оформите онлайн-запись к специалисту или рассчитайте программу чек-апа в калькуляторе — ваша заявка и именной талон сразу появятся здесь.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewAppointment();
                }}
                className="py-2.5 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Записаться на прием</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {visibleAppointments.map((item) => {
                const prep = getPreparationAdvice(item.serviceTitle, item.isEmergency);
                const isPrepExpanded = expandedPrepId === item.id;
                const isRescheduling = reschedulingId === item.id;
                const isCancelled = item.status === 'Отменена';
                const busySlots = isRescheduling
                  ? getOccupiedSlotsForReschedule(item, rescheduleDate)
                  : new Set<string>();
                const displayPrice = resolveAppointmentPrice(item, servicesList);

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 flex flex-col gap-2.5 transition-snappy ${
                      isCancelled
                        ? 'bg-red-50/40 border-red-200/80'
                        : 'bg-[#F4FAF8] border-[#D1EAE4]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#335249]">
                      <div className="flex flex-wrap items-center gap-2 tabular-nums">
                        <span className="font-bold text-[#0F2922]">#{item.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>Оформлена в {item.createdAt}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            item.status === 'Подтверждена'
                              ? 'bg-[#E6F4F1] text-[#0D9488]'
                              : item.status === 'Завершена'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Отменена'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadTicket(item)}
                          className="py-1 px-2.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-xs font-semibold text-[#0F2922] inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                          title="Скачать талон и памятку подготовки (.txt)"
                        >
                          <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>Талон</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            isRescheduling
                              ? setReschedulingId(null)
                              : startReschedule(item)
                          }
                          className="py-1 px-2.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-xs font-semibold text-[#0D9488] inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                          title="Перенести дату или время визита"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isCancelled ? 'Перенести и восстановить' : 'Перенести визит'}</span>
                        </button>

                        {onOpenReviewForAppointment && !isCancelled && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReviewForAppointment(item);
                            }}
                            className="py-1 px-2.5 rounded-lg bg-[#FFF3E6] border border-[#FDBA74] hover:bg-[#F97316] text-xs font-semibold text-[#EA580C] hover:text-white inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                            title="Оставить отзыв о визите на сайте"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            <span>Оставить отзыв</span>
                          </button>
                        )}

                        {!isCancelled ? (
                          <button
                            type="button"
                            onClick={() => onCancelAppointment(item.id)}
                            className="py-1 px-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                            title="Отменить визит"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Отменить</span>
                          </button>
                        ) : (
                          onDeleteCancelledAppointment && (
                            <button
                              type="button"
                              onClick={() => onDeleteCancelledAppointment(item.id)}
                              className="py-1 px-2 rounded-lg text-xs text-[#335249] hover:text-red-600 inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                              title="Удалить отмененную заявку из списка"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Скрыть</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-sm font-bold text-[#0F2922]">{item.serviceTitle}</div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#335249]">
                      <span>
                        Пациент:{' '}
                        <strong className="text-[#0F2922]">
                          {item.petSpecies} «{item.petName}»
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Врач: {item.doctorName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-semibold text-[#0F2922]">
                        Визит: {item.preferredDate}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#0D9488] tabular-nums">
                        {displayPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    {/* Форма переноса времени визита (Reschedule Panel) */}
                    {isRescheduling && (
                      <div className="rounded-xl bg-white border border-[#0D9488] p-3.5 space-y-3 mt-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#0F2922] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0D9488]" />
                            Выберите новую дату и индивидуальное окно врача ({item.doctorName})
                          </span>
                          <button
                            type="button"
                            onClick={() => setReschedulingId(null)}
                            className="text-[11px] text-[#335249] hover:text-[#0F2922] cursor-pointer"
                          >
                            Закрыть
                          </button>
                        </div>

                        {rescheduleError && (
                          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                            {rescheduleError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#335249] mb-1">
                              Новая дата визита
                            </label>
                            <input
                              type="date"
                              min={todayDate}
                              value={rescheduleDate}
                              onChange={(e) => {
                                setRescheduleDate(e.target.value);
                                setRescheduleError('');
                              }}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#335249] mb-1">
                              Окна врача (занятые недоступны)
                            </label>
                            <select
                              value={rescheduleTime}
                              onChange={(e) => {
                                setRescheduleTime(e.target.value);
                                setRescheduleError('');
                              }}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                            >
                              {getSlotsForRecord(item).map((slot) => {
                                const isBusy = busySlots.has(slot);
                                return (
                                  <option key={slot} value={slot} disabled={isBusy}>
                                    {isBusy ? `${slot} — Занято` : `${slot} — Свободно`}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleConfirmReschedule(item)}
                            className="py-2 px-4 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-snappy cursor-pointer"
                          >
                            Сохранить новое время
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Заключение и рекомендации лечащего врача (если добавлены в админке) */}
                    {item.doctorRecommendation && item.doctorRecommendation.trim() && (
                      <div className="rounded-xl bg-white border border-[#0D9488]/40 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D9488]">
                          <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                          <span>Заключение и рекомендации лечащего врача:</span>
                        </div>
                        <p className="text-xs text-[#0F2922] leading-relaxed">
                          {item.doctorRecommendation}
                        </p>
                      </div>
                    )}

                    {/* Раскрывающаяся памятка подготовки к визиту */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPrepId(isPrepExpanded ? null : item.id)
                        }
                        className="text-[11px] font-semibold text-[#0D9488] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>
                          {isPrepExpanded
                            ? 'Скрыть памятку подготовки к визиту'
                            : `Памятка подготовки: ${prep.categoryTitle}`}
                        </span>
                      </button>

                      {isPrepExpanded && (
                        <div className="mt-2 rounded-lg bg-white border border-[#D1EAE4] p-3 text-xs text-[#335249] space-y-1">
                          <div className="font-bold text-[#0F2922] mb-1">
                            {prep.categoryTitle}:
                          </div>
                          {prep.items.map((rule, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#0D9488] font-bold">•</span>
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visibleAppointments.length > 0 && activeTab === 'appointments' && (
            <div className="mt-6 pt-4 border-t border-[#D1EAE4] flex items-center justify-between gap-4">
              <span className="text-xs text-[#335249]">
                Всего доступных вам записей: <strong>{visibleAppointments.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewAppointment();
                }}
                className="py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-snappy inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить запись</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
