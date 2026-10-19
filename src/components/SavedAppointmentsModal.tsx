import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  HeartPulse,
  Mail,
  PawPrint,
  Plus,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import { AppointmentRecord, CLINIC_INFO } from '../data/clinicData';
import {
  AppUserProfile,
  ClientPetProfile,
  filterAppointmentsForUser,
  getClientPetProfile,
  saveClientPetProfile,
} from '../services/authService';
import {
  downloadAppointmentVoucher,
  getPreparationAdvice,
} from '../utils/appointmentVoucher';

interface SavedAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentRecord[];
  currentUser: AppUserProfile;
  onCancelAppointment: (id: string) => void;
  onNewAppointment: () => void;
  onShowToast?: (message: string) => void;
}

export const SavedAppointmentsModal: React.FC<SavedAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  currentUser,
  onCancelAppointment,
  onNewAppointment,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'pet_profile'>('appointments');
  const [expandedPrepId, setExpandedPrepId] = useState<string | null>(null);

  // Карточка питомца клиента
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<'Кошка' | 'Собака' | 'Грызун'>('Кошка');
  const [breedAndAge, setBreedAndAge] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [chronicNotes, setChronicNotes] = useState<string>('');
  const [lastVaccinationDate, setLastVaccinationDate] = useState<string>('');
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string>('');
  const [savedBanner, setSavedBanner] = useState<string>('');

  // Строгая RBAC-фильтрация:
  // Если currentUser.role === 'user', показываем ТОЛЬКО собственные записи этого пользователя
  // (по совпадению ownerUid или email). Чужие записи других клиентов никогда не отображаются.
  const visibleAppointments = useMemo(
    () => filterAppointmentsForUser(appointments, currentUser),
    [appointments, currentUser]
  );

  useEffect(() => {
    if (isOpen) {
      setSavedBanner('');
      const storedProfile = getClientPetProfile(currentUser);
      if (storedProfile) {
        setPetName(storedProfile.petName);
        setPetSpecies(storedProfile.petSpecies);
        setBreedAndAge(storedProfile.breedAndAge);
        setWeightKg(storedProfile.weightKg);
        setChronicNotes(storedProfile.chronicNotes);
        setLastVaccinationDate(storedProfile.lastVaccinationDate);
        setProfileUpdatedAt(storedProfile.updatedAt);
      } else {
        // Если карточка еще не создана, подтянем кличку из последней записи пользователя
        const latestAppt = visibleAppointments[0];
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

  const handleSavePetCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      setSavedBanner('Пожалуйста, укажите кличку вашего питомца.');
      return;
    }
    const updated: ClientPetProfile = saveClientPetProfile(currentUser, {
      petName,
      petSpecies,
      breedAndAge,
      weightKg,
      chronicNotes,
      lastVaccinationDate,
      updatedAt: new Date().toLocaleDateString('ru-RU'),
    });
    setProfileUpdatedAt(updated.updatedAt);
    const msg = `Электронная медкарта питомца «${updated.petName}» сохранена! Данные будут автоматически подставляться при новой записи.`;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-appointments-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-5 bg-[#F4FAF8] border-b border-[#D1EAE4]">
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
                  : `Аккаунт: ${currentUser.displayName} (${currentUser.email})`}
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
        <div className="px-6 pt-4 bg-[#F4FAF8]/50 border-b border-[#D1EAE4] flex flex-wrap items-center gap-2 pb-3">
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
              Карточка моего питомца {petName ? `«${petName}»` : ''}
            </span>
          </button>
        </div>

        <div className="p-6">
          {/* Privacy & Isolation Badge for Regular Clients */}
          {!isAdmin && (
            <div className="mb-4 rounded-xl bg-[#E6F4F1]/70 border border-[#D1EAE4] px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#0F2922]">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>
                Защита данных: отображаются только ваши личные заявки, талоны и медкарта питомца, привязанные к вашему профилю.
              </span>
            </div>
          )}

          {activeTab === 'pet_profile' ? (
            <form onSubmit={handleSavePetCard} className="space-y-4">
              <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F2922]">
                      Электронный паспорт пациента «Лапа Помощи»
                    </h4>
                    <p className="text-xs text-[#335249] mt-0.5">
                      Сохраните данные питомца один раз — они будут автоматически заполняться при каждой новой записи на прием.
                    </p>
                  </div>
                </div>
                {profileUpdatedAt && (
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
                    placeholder="Например, Персик или Ричард"
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
                  <span>Сохранить медкарту питомца</span>
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

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex flex-col gap-2.5"
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

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadTicket(item)}
                          className="py-1 px-2.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-xs font-semibold text-[#0F2922] inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                          title="Скачать талон и памятку подготовки (.txt)"
                        >
                          <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>Талон и памятка</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onCancelAppointment(item.id)}
                          className="text-xs text-[#335249] hover:text-red-600 inline-flex items-center gap-1 transition-snappy whitespace-nowrap cursor-pointer"
                          title="Отменить запись"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Отменить</span>
                        </button>
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
                      {item.estimatedPrice && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#0D9488] tabular-nums">
                            ~ {item.estimatedPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        </>
                      )}
                    </div>

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

                    {item.email && (
                      <div className="pt-1.5 border-t border-[#D1EAE4] flex items-center gap-1.5 text-[11px] text-[#335249]">
                        <Mail className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span>
                          Уведомление отправлено с{' '}
                          <strong className="text-[#0F2922]">
                            {item.senderAliasEmail || CLINIC_INFO.publicAliasEmail}
                          </strong>{' '}
                          на {item.email}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'appointments' && visibleAppointments.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#D1EAE4] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-[#D1EAE4] text-xs font-semibold text-[#335249] hover:text-[#0F2922] hover:bg-[#F4FAF8] transition-snappy whitespace-nowrap cursor-pointer"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewAppointment();
                }}
                className="py-2.5 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить еще запись</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
