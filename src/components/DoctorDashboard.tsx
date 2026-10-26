import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardPlus,
  Download,
  FileText,
  Lock,
  PawPrint,
  Phone,
  Search,
  Stethoscope,
  UserCheck,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  AppointmentStatus,
  resolveAppointmentPrice,
  ServiceItem,
  SERVICES_DATA,
} from '../data/clinicData';
import { AppUserProfile } from '../services/authService';
import { downloadAppointmentVoucher } from '../utils/appointmentVoucher';

interface DoctorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserProfile;
  appointments: AppointmentRecord[];
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onUpdateAppointmentNotes: (id: string, notes: string) => void;
  onUpdateAppointmentRecommendation: (id: string, recommendation: string) => void;
  onClaimAppointment?: (id: string, doctorName: string) => void;
  servicesList?: ServiceItem[];
}

const CLINICAL_TEMPLATES = [
  {
    label: 'Терапия / Осмотр',
    text: 'Клинический осмотр проведен: слизистые розовые, Т 38.4°C, лимфоузлы не увеличены, аускультация без патологий. Назначено: щадящая диета, контроль динамики через 5–7 дней.',
  },
  {
    label: 'Хирургия / После операции',
    text: 'Оперативное вмешательство прошло штатно под газовой анестезией (Севофлуран). Швы сухие, чистые. Назначено: защитный воротник/попона 7–10 дней, обработка швов 1 раз в сутки, контрольный осмотр через 10 дней.',
  },
  {
    label: 'Кардио / УЗИ',
    text: 'Проведено ЭхоКГ и УЗ-скрининг: сократимость миокарда сохранена, застойных явлений не выявлено, свободной жидкости в полостях нет. Противопоказаний к плановой седации не обнаружено.',
  },
  {
    label: 'Ратология / Стоматология',
    text: 'Осмотр ротовой полости и резцов/щечных зубов: проведена бережная аппаратная коррекция дентальной аркады. Рекомендовано: введение в рацион грубого лугового сена до 80%, исключить зерновые смеси, контроль через 1 месяц.',
  },
];

type DoctorFilterTab = 'all' | AppointmentStatus | 'duty';

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  appointments,
  onUpdateAppointmentStatus,
  onUpdateAppointmentNotes,
  onUpdateAppointmentRecommendation,
  onClaimAppointment,
  servicesList = SERVICES_DATA,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DoctorFilterTab>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [editingRecText, setEditingRecText] = useState('');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // 1. Именные заявки этого врача
  const doctorAppointments = useMemo(() => {
    const docDisplayName = (currentUser.displayName || '').toLowerCase();
    const docLogin = (currentUser.login || '').toLowerCase();
    const docId = (currentUser.doctorId || '').toLowerCase();
    const docLastName = docDisplayName.split(' ')[0] || '';

    return appointments.filter((appt) => {
      const apptDoc = (appt.doctorName || '').toLowerCase();
      if (!apptDoc) return false;
      if (docLastName && apptDoc.includes(docLastName)) return true;
      if (docLogin && apptDoc.includes(docLogin)) return true;
      if (docId && apptDoc.includes(docId)) return true;
      return false;
    });
  }, [appointments, currentUser]);

  // 2. Нераспределенные заявки на «Дежурного специалиста клиники» (которые врач может принять на себя)
  const dutyAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const apptDoc = (appt.doctorName || '').toLowerCase();
      return (
        appt.status !== 'Отменена' &&
        (apptDoc.includes('дежурн') || apptDoc.includes('любой'))
      );
    });
  }, [appointments]);

  // Фильтрация по вкладке и поисковому запросу
  const filteredAppointments = useMemo(() => {
    const sourceList =
      selectedStatus === 'duty' ? dutyAppointments : doctorAppointments;

    return sourceList.filter((item) => {
      if (
        selectedStatus !== 'all' &&
        selectedStatus !== 'duty' &&
        item.status !== selectedStatus
      ) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.id.toLowerCase().includes(q) ||
        item.petName.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q) ||
        item.serviceTitle.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q))
      );
    });
  }, [doctorAppointments, dutyAppointments, selectedStatus, searchQuery]);

  // KPI статистика врача
  const stats = useMemo(() => {
    const total = doctorAppointments.length;
    const newCount = doctorAppointments.filter((a) => a.status === 'Новая').length;
    const confirmedCount = doctorAppointments.filter(
      (a) => a.status === 'Подтверждена'
    ).length;
    const completedCount = doctorAppointments.filter(
      (a) => a.status === 'Завершена'
    ).length;
    const cancelledCount = doctorAppointments.filter(
      (a) => a.status === 'Отменена'
    ).length;
    const dutyCount = dutyAppointments.length;
    return {
      total,
      newCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      dutyCount,
    };
  }, [doctorAppointments, dutyAppointments]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSavedSuccessMessage(msg);
    setTimeout(() => {
      setSavedSuccessMessage(null);
    }, 3200);
  };

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    onUpdateAppointmentStatus(id, newStatus);
    showNotification(`Статус приема #${id} обновлен на «${newStatus}»`);
  };

  const handleClaimDutyPatient = (appt: AppointmentRecord) => {
    if (onClaimAppointment) {
      onClaimAppointment(appt.id, currentUser.displayName);
    }
    if (appt.status === 'Новая') {
      onUpdateAppointmentStatus(appt.id, 'Подтверждена');
    }
    setSelectedStatus('all');
    showNotification(
      `Пациент «${appt.petName}» (#${appt.id}) закреплен за вами (${currentUser.displayName}) и переведен в статус «Подтверждена»!`
    );
  };

  const handleSaveNotes = (id: string) => {
    onUpdateAppointmentNotes(id, editingNotesText);
    setEditingNotesId(null);
    showNotification('Внутренние заметки врача сохранены');
  };

  const handleSaveRecommendation = (id: string) => {
    onUpdateAppointmentRecommendation(id, editingRecText);
    setEditingRecId(null);
    showNotification('Диагноз и назначения сохранены в медкарту пациента');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-dashboard-title"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-[#F4FAF8] border-b border-[#D1EAE4]">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#0D9488]"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="doctor-dashboard-title"
                  className="text-lg font-bold text-[#0F2922]"
                >
                  {currentUser.displayName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-[#E6F4F1] text-[#0D9488] font-bold text-xs uppercase tracking-wider">
                  Лечащий врач
                </span>
              </div>
              <p className="text-xs text-[#335249] mt-0.5">
                {currentUser.doctorSpecialty || 'Врачебный персонал клиники'} · Личный кабинет приема пациентов
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Режим врача: без удаления и без изменения цен</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть кабинет"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#335249] hover:text-[#0F2922] hover:bg-[#E6F4F1] transition-snappy cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {savedSuccessMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-3.5">
              <div className="text-xs text-[#335249] font-medium">Мои пациенты</div>
              <div className="text-2xl font-extrabold text-[#0F2922] mt-1 tabular-nums">
                {stats.total}
              </div>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5">
              <div className="text-xs text-blue-700 font-medium">Новые</div>
              <div className="text-2xl font-extrabold text-blue-900 mt-1 tabular-nums">
                {stats.newCount}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
              <div className="text-xs text-emerald-700 font-medium">Подтверждены</div>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                {stats.confirmedCount}
              </div>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-3.5">
              <div className="text-xs text-purple-700 font-medium">Завершены</div>
              <div className="text-2xl font-extrabold text-purple-900 mt-1 tabular-nums">
                {stats.completedCount}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStatus('duty')}
              className="rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 p-3.5 text-left transition-snappy cursor-pointer"
            >
              <div className="text-xs text-amber-800 font-bold flex items-center justify-between">
                <span>Очередь дежурных</span>
                <ClipboardPlus className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1 tabular-nums">
                {stats.dutyCount}
              </div>
            </button>
          </div>

          {/* Unassigned Duty Queue Notice */}
          {stats.dutyCount > 0 && selectedStatus !== 'duty' && (
            <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-amber-950">
                <ClipboardPlus className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  В очереди <strong>«Дежурный специалист клиники»</strong> ожидает распределения:{' '}
                  <strong className="tabular-nums">{stats.dutyCount} пац.</strong> Вы можете принять любого из них на себя.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatus('duty')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-snappy cursor-pointer shrink-0"
              >
                Посмотреть дежурные вызовы ({stats.dutyCount})
              </button>
            </div>
          )}

          {/* Filter Bar & Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4FAF8] rounded-xl border border-[#D1EAE4]">
              {(
                [
                  { id: 'all', label: `Все мои (${stats.total})` },
                  { id: 'Новая', label: `Новые (${stats.newCount})` },
                  { id: 'Подтверждена', label: `Подтверждены (${stats.confirmedCount})` },
                  { id: 'Завершена', label: `Завершены (${stats.completedCount})` },
                  { id: 'Отменена', label: `Отменены (${stats.cancelledCount})` },
                  { id: 'duty', label: `Дежурные вызовы (${stats.dutyCount})` },
                ] as const
              ).map((tab) => {
                const active = selectedStatus === tab.id;
                const isDutyTab = tab.id === 'duty';
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-snappy cursor-pointer whitespace-nowrap ${
                      active
                        ? isDutyTab
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-[#0D9488] text-white shadow-xs'
                        : isDutyTab
                        ? 'text-amber-800 hover:bg-amber-100/60'
                        : 'text-[#335249] hover:text-[#0F2922]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
              <Search className="w-4 h-4 text-[#335249] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по кличке, владельцу, ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
              />
            </div>
          </div>

          {/* Patient Cards List */}
          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#D1EAE4] p-12 text-center">
              <Stethoscope className="w-12 h-12 text-[#0D9488]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0F2922]">
                {selectedStatus === 'duty'
                  ? 'Нераспределенных дежурных вызовов сейчас нет'
                  : 'Нет записей в выбранном фильтре'}
              </h3>
              <p className="text-xs text-[#335249] mt-1 max-w-sm mx-auto">
                {selectedStatus === 'duty'
                  ? 'Все текущие заявки уже распределены по лечащим врачам клиники.'
                  : 'Переключите вкладку фильтра или проверьте очередь дежурных вызовов.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appt) => {
                const price = resolveAppointmentPrice(appt, servicesList);
                const isEditingNotes = editingNotesId === appt.id;
                const isEditingRec = editingRecId === appt.id;
                const isDutyUnassigned = selectedStatus === 'duty';

                return (
                  <div
                    key={appt.id}
                    className={`rounded-2xl bg-white border shadow-xs hover:shadow-md transition-snappy overflow-hidden ${
                      isDutyUnassigned ? 'border-amber-300' : 'border-[#D1EAE4]'
                    }`}
                  >
                    {/* Card Top Strip */}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b ${
                        isDutyUnassigned
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-[#F4FAF8] border-[#D1EAE4]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#0D9488] bg-[#E6F4F1] px-2.5 py-1 rounded-md tabular-nums">
                          {appt.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#335249] font-medium tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>{appt.preferredDate}</span>
                        </div>
                        {appt.isEmergency && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                            Экстренный вызов
                          </span>
                        )}
                        {isDutyUnassigned && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200/80 text-amber-900">
                            Ожидает назначения врача
                          </span>
                        )}
                      </div>

                      {/* Right Action: Claim Button for Duty or Status Selector for Assigned */}
                      {isDutyUnassigned ? (
                        <button
                          type="button"
                          onClick={() => handleClaimDutyPatient(appt)}
                          className="py-1.5 px-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-snappy cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Принять пациента на себя</span>
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-[#335249] font-medium mr-1">
                            Статус:
                          </span>
                          {(
                            [
                              'Новая',
                              'Подтверждена',
                              'Завершена',
                              'Отменена',
                            ] as AppointmentStatus[]
                          ).map((st) => {
                            const isCurrent = appt.status === st;
                            let style =
                              'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';
                            if (isCurrent) {
                              if (st === 'Новая')
                                style =
                                  'bg-blue-600 text-white font-bold border-blue-600';
                              else if (st === 'Подтверждена')
                                style =
                                  'bg-teal-600 text-white font-bold border-teal-600';
                              else if (st === 'Завершена')
                                style =
                                  'bg-purple-600 text-white font-bold border-purple-600';
                              else if (st === 'Отменена')
                                style =
                                  'bg-slate-500 text-white font-bold border-slate-500';
                            }

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(appt.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-snappy cursor-pointer ${style}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Card Content Grid */}
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Pet Info */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
                            <PawPrint className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[11px] text-[#335249] uppercase font-bold tracking-wider">
                              Пациент
                            </div>
                            <div className="text-sm font-bold text-[#0F2922]">
                              {appt.petName} ({appt.petSpecies})
                            </div>
                            <div className="text-xs text-[#335249]">
                              Владелец: <strong>{appt.ownerName}</strong>
                            </div>
                            <div className="text-xs text-[#335249] flex items-center gap-1 mt-0.5 tabular-nums">
                              <Phone className="w-3 h-3 text-[#0D9488]" />
                              <span>{appt.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Service & Price */}
                        <div>
                          <div className="text-[11px] text-[#335249] uppercase font-bold tracking-wider">
                            Услуга и фиксированная стоимость
                          </div>
                          <div className="text-sm font-bold text-[#0F2922] mt-0.5">
                            {appt.serviceTitle}
                          </div>
                          <div className="text-xs font-semibold text-[#0D9488] mt-1 tabular-nums">
                            {price.toLocaleString('ru-RU')} ₽
                            <span className="text-[11px] text-[#335249] font-normal ml-1">
                              (по прайсу клиники)
                            </span>
                          </div>
                        </div>

                        {/* Voucher action */}
                        <div className="flex flex-col justify-center items-start md:items-end">
                          <button
                            type="button"
                            onClick={() => downloadAppointmentVoucher(appt)}
                            className="py-2 px-3 rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] hover:bg-[#E6F4F1] text-xs font-bold text-[#0D9488] inline-flex items-center gap-1.5 transition-snappy cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Скачать талон пациента</span>
                          </button>
                        </div>
                      </div>

                      {/* Clinical Recommendation (Diagnosis / Prescription) */}
                      <div className="rounded-xl bg-[#F0FAF7] border border-[#BDE8DE] p-3.5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D9488]">
                            <Stethoscope className="w-4 h-4" />
                            <span>
                              Клинический диагноз и назначения врача (для выписки и медкарты клиента)
                            </span>
                          </div>
                          {!isEditingRec && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecId(appt.id);
                                setEditingRecText(appt.doctorRecommendation || '');
                              }}
                              className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                            >
                              {appt.doctorRecommendation
                                ? 'Редактировать'
                                : '+ Добавить диагноз'}
                            </button>
                          )}
                        </div>

                        {isEditingRec ? (
                          <div className="space-y-2.5 mt-2">
                            {/* Quick Clinical Templates */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-[#335249]">
                                Быстрый шаблон:
                              </span>
                              {CLINICAL_TEMPLATES.map((tpl) => (
                                <button
                                  key={tpl.label}
                                  type="button"
                                  onClick={() => setEditingRecText(tpl.text)}
                                  className="px-2 py-1 rounded-md bg-white border border-[#0D9488]/40 hover:bg-[#E6F4F1] text-[11px] font-semibold text-[#0F2922] transition-snappy cursor-pointer"
                                >
                                  + {tpl.label}
                                </button>
                              ))}
                            </div>

                            <textarea
                              rows={3}
                              value={editingRecText}
                              onChange={(e) => setEditingRecText(e.target.value)}
                              placeholder="Укажите результаты осмотра, предварительный диагноз, схему лечения и дату повторного визита..."
                              className="w-full px-3 py-2 text-xs rounded-lg border border-[#0D9488] bg-white text-[#0F2922] focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingRecId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs text-[#335249] hover:bg-white cursor-pointer"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveRecommendation(appt.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] text-white text-xs font-bold hover:bg-[#0F766E] cursor-pointer"
                              >
                                Сохранить назначения
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#0F2922] leading-relaxed">
                            {appt.doctorRecommendation || (
                              <span className="italic text-[#335249]/70">
                                Назначения и диагноз пока не внесены. Нажмите «+ Добавить диагноз», чтобы заполнить заключение или выбрать готовый клинический шаблон.
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Internal Notes / Anamnesis */}
                      <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3.5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              Внутренние заметки к приему (анамнез, предоперационная подготовка)
                            </span>
                          </div>
                          {!isEditingNotes && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNotesId(appt.id);
                                setEditingNotesText(appt.notes || '');
                              }}
                              className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                            >
                              {appt.notes ? 'Изменить заметку' : '+ Добавить заметку'}
                            </button>
                          )}
                        </div>

                        {isEditingNotes ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              rows={2}
                              value={editingNotesText}
                              onChange={(e) => setEditingNotesText(e.target.value)}
                              placeholder="Заметки о поведении животного, аллергиях, особых пожеланиях..."
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-[#0F2922] focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingNotesId(null)}
                                className="px-3 py-1 rounded-lg text-xs text-[#335249] hover:bg-white cursor-pointer"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(appt.id)}
                                className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
                              >
                                Сохранить
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600">
                            {appt.notes || (
                              <span className="italic text-slate-400">
                                Внутренние заметки отсутствуют.
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3.5 bg-[#F4FAF8] border-t border-[#D1EAE4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#335249]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Удаление записей и финансовые корректировки заблокированы политикой безопасности врача.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-white border border-[#D1EAE4] hover:bg-[#E6F4F1] text-xs font-bold text-[#0F2922] cursor-pointer"
          >
            Закрыть окно
          </button>
        </div>
      </div>
    </div>
  );
};
