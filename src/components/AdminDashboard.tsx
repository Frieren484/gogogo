import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  KeyRound,
  Mail,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Shield,
  Stethoscope,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  AppointmentStatus,
  CLINIC_INFO,
  DoctorProfile,
  DOCTORS_DATA,
  INITIAL_APPOINTMENTS_DATA,
  ServiceItem,
  SERVICES_DATA,
} from '../data/clinicData';
import {
  buildGmailDirectComposeUrl,
  getRuntimeEmailJSKeys,
  getStoredEmailLogs,
  RuntimeEmailJSKeys,
  saveRuntimeEmailJSKeys,
  sendRealEmailNotification,
  sendTestEmailToAddress,
} from '../services/emailService';
import { uploadFileToGoogleDrive } from '../services/googleDriveAuth';

interface AdminDashboardProps {
  appointments: AppointmentRecord[];
  onUpdateAppointments: (next: AppointmentRecord[]) => void;
  services: ServiceItem[];
  onUpdateServices: (next: ServiceItem[]) => void;
  doctors: DoctorProfile[];
  onUpdateDoctors: (next: DoctorProfile[]) => void;
  onShowToast?: (message: string) => void;
}

const STATUS_OPTIONS: AppointmentStatus[] = [
  'Новая',
  'Подтверждена',
  'Завершена',
  'Отменена',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  appointments,
  onUpdateAppointments,
  services,
  onUpdateServices,
  doctors,
  onUpdateDoctors,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'appointments' | 'services' | 'doctors' | 'emails'
  >('appointments');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bannerMessage, setBannerMessage] = useState<string>('');
  const [isUploadingDrive, setIsUploadingDrive] = useState<boolean>(false);

  // Appointment Edit Modal State
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentRecord | null>(null);
  const [isNewAppointment, setIsNewAppointment] = useState<boolean>(false);

  // Service Edit State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewService, setIsNewService] = useState<boolean>(false);

  // Doctor Edit State
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [isNewDoctor, setIsNewDoctor] = useState<boolean>(false);

  const [emailLogsVersion, setEmailLogsVersion] = useState<number>(0);
  const emailLogs = useMemo(() => getStoredEmailLogs(), [emailLogsVersion, appointments]);

  // Email Gateway Test & Runtime EmailJS Configuration State
  const [testTargetEmail, setTestTargetEmail] = useState<string>('tanks8015@gmail.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [emailJsKeys, setEmailJsKeys] = useState<RuntimeEmailJSKeys>(() =>
    getRuntimeEmailJSKeys()
  );
  const [showEmailJsConfig, setShowEmailJsConfig] = useState<boolean>(false);

  const handleSendTestEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = testTargetEmail.trim() || 'tanks8015@gmail.com';
    setIsSendingTestEmail(true);
    try {
      const result = await sendTestEmailToAddress(target);
      setEmailLogsVersion((v) => v + 1);
      showNotice(result.toastMessage);
      if (onShowToast) {
        onShowToast(result.toastMessage);
      }
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSaveEmailJsKeys = (e: React.FormEvent) => {
    e.preventDefault();
    saveRuntimeEmailJSKeys(emailJsKeys);
    const msg = 'Ключи EmailJS (Service ID, Template ID, Public Key) сохранены для отправки писем!';
    showNotice(msg);
    if (onShowToast) {
      onShowToast(msg);
    }
    setShowEmailJsConfig(false);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesDoctor =
        doctorFilter === 'all' || item.doctorName === doctorFilter;
      const matchesDate =
        !dateFilter || item.preferredDate.startsWith(dateFilter);

      if (!matchesStatus || !matchesDoctor || !matchesDate) return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const hay = [
        item.id,
        item.ownerName,
        item.phone,
        item.email || '',
        item.petName,
        item.petSpecies,
        item.serviceTitle,
        item.doctorName,
        item.notes || '',
        item.doctorRecommendation || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [appointments, statusFilter, doctorFilter, dateFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const newCount = appointments.filter((a) => a.status === 'Новая').length;
    const confirmedCount = appointments.filter(
      (a) => a.status === 'Подтверждена'
    ).length;
    const revenue = appointments
      .filter((a) => a.status !== 'Отменена')
      .reduce((acc, item) => acc + (item.estimatedPrice || 0), 0);
    const catsCount = appointments.filter((a) => a.petSpecies === 'Кошка').length;
    const dogsCount = appointments.filter((a) => a.petSpecies === 'Собака').length;
    const rodentsCount = appointments.filter((a) => a.petSpecies === 'Грызун').length;
    return {
      total,
      newCount,
      confirmedCount,
      revenue,
      catsCount,
      dogsCount,
      rodentsCount,
    };
  }, [appointments]);

  const showNotice = (msg: string) => {
    setBannerMessage(msg);
    window.setTimeout(() => {
      setBannerMessage((current) => (current === msg ? '' : current));
    }, 5000);
  };

  // --- CRUD: Appointments ---
  const handleStatusChange = (id: string, nextStatus: string) => {
    const target = appointments.find((item) => item.id === id);
    const updated = appointments.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item
    );
    onUpdateAppointments(updated);

    if (target) {
      const updatedRecord: AppointmentRecord = {
        ...target,
        status: nextStatus,
      };
      void sendRealEmailNotification(updatedRecord, 'status_updated').then(
        (result) => {
          setEmailLogsVersion((v) => v + 1);
          showNotice(result.toastMessage);
          if (onShowToast) {
            onShowToast(result.toastMessage);
          }
        }
      );
    } else {
      showNotice(`Статус заявки #${id} изменен на «${nextStatus}».`);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    onUpdateAppointments(appointments.filter((item) => item.id !== id));
    showNotice(`Заявка #${id} удалена из базы.`);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    const cleanOwner = editingAppointment.ownerName.trim();
    const cleanPet = editingAppointment.petName.trim();
    const cleanService = editingAppointment.serviceTitle.trim();

    if (!cleanOwner || !cleanPet || !cleanService) {
      showNotice('Пожалуйста, заполните обязательные поля: владелец, кличка и услуга.');
      return;
    }

    const sanitizedAppointment: AppointmentRecord = {
      ...editingAppointment,
      ownerName: cleanOwner,
      petName: cleanPet,
      serviceTitle: cleanService,
      estimatedPrice: Math.max(0, Number(editingAppointment.estimatedPrice) || 0),
    };

    if (isNewAppointment) {
      onUpdateAppointments([sanitizedAppointment, ...appointments]);
      void sendRealEmailNotification(sanitizedAppointment, 'created').then(
        (result) => {
          setEmailLogsVersion((v) => v + 1);
          showNotice(result.toastMessage);
          if (onShowToast) {
            onShowToast(result.toastMessage);
          }
        }
      );
    } else {
      const previous = appointments.find((a) => a.id === sanitizedAppointment.id);
      onUpdateAppointments(
        appointments.map((item) =>
          item.id === sanitizedAppointment.id ? sanitizedAppointment : item
        )
      );
      if (
        previous &&
        (previous.status !== sanitizedAppointment.status ||
          (previous.doctorRecommendation || '') !==
            (sanitizedAppointment.doctorRecommendation || ''))
      ) {
        void sendRealEmailNotification(
          sanitizedAppointment,
          'status_updated'
        ).then((result) => {
          setEmailLogsVersion((v) => v + 1);
          showNotice(result.toastMessage);
          if (onShowToast) {
            onShowToast(result.toastMessage);
          }
        });
      } else {
        showNotice(`Заявка #${sanitizedAppointment.id} успешно обновлена.`);
      }
    }
    setEditingAppointment(null);
    setIsNewAppointment(false);
  };

  const handleStartNewAppointment = () => {
    setIsNewAppointment(true);
    setEditingAppointment({
      id: `LP-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ownerName: '',
      phone: '+7 (9',
      email: '',
      petSpecies: 'Кошка',
      petName: '',
      serviceTitle: services[0]?.title || 'Терапия и первичный клинический прием',
      doctorName: doctors[0]?.name || 'Дежурный специалист клиники',
      preferredDate: `${new Date().toISOString().split('T')[0]} в 12:00`,
      estimatedPrice: services[0]?.priceFrom || 1800,
      status: 'Новая',
      notes: '',
      senderAliasEmail: CLINIC_INFO.publicAliasEmail,
    });
  };

  // --- CRUD: Services ---
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const cleanTitle = editingService.title.trim();
    const cleanDescription = editingService.description.trim();
    if (!cleanTitle || !cleanDescription) {
      showNotice('Пожалуйста, укажите название и описание услуги.');
      return;
    }

    const categoryMap: Record<ServiceItem['category'], string> = {
      diagnostics: 'Диагностика',
      treatment: 'Лечение',
      care: 'Уход',
    };
    const normalized: ServiceItem = {
      ...editingService,
      title: cleanTitle,
      description: cleanDescription,
      priceFrom: Math.max(0, Number(editingService.priceFrom) || 0),
      categoryLabel: categoryMap[editingService.category] || 'Лечение',
    };

    if (isNewService) {
      onUpdateServices([...services, normalized]);
      showNotice(`Добавлена новая услуга «${normalized.title}».`);
    } else {
      onUpdateServices(
        services.map((s) => (s.id === normalized.id ? normalized : s))
      );
      showNotice(
        `Услуга «${normalized.title}» обновлена — изменения сразу отображаются на главной странице.`
      );
    }
    setEditingService(null);
    setIsNewService(false);
  };

  const handleDeleteService = (id: string) => {
    onUpdateServices(services.filter((s) => s.id !== id));
    showNotice('Услуга удалена из прайс-листа.');
  };

  // --- CRUD: Doctors ---
  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    const cleanName = editingDoctor.name.trim();
    const cleanRole = editingDoctor.role.trim();
    if (!cleanName || !cleanRole) {
      showNotice('Пожалуйста, заполните ФИО и специализацию врача.');
      return;
    }

    const sanitizedDoctor: DoctorProfile = {
      ...editingDoctor,
      name: cleanName,
      role: cleanRole,
      experienceYears: Math.max(1, Number(editingDoctor.experienceYears) || 1),
    };

    if (isNewDoctor) {
      onUpdateDoctors([...doctors, sanitizedDoctor]);
      showNotice(`Добавлен специалист «${sanitizedDoctor.name}».`);
    } else {
      onUpdateDoctors(
        doctors.map((d) => (d.id === sanitizedDoctor.id ? sanitizedDoctor : d))
      );
      showNotice(
        `Карточка врача «${sanitizedDoctor.name}» обновлена на главной странице.`
      );
    }
    setEditingDoctor(null);
    setIsNewDoctor(false);
  };

  const handleDeleteDoctor = (id: string) => {
    onUpdateDoctors(doctors.filter((d) => d.id !== id));
    showNotice('Карточка врача удалена.');
  };

  // --- EXPORT 1: Excel CSV with UTF-8 BOM \uFEFF ---
  const buildCsvContent = (): string => {
    const headers = [
      'ID заявки',
      'Время создания',
      'Статус',
      'Имя владельца',
      'Телефон',
      'Email клиента',
      'Отправитель уведомления (Alias)',
      'Вид питомца',
      'Кличка',
      'Услуга',
      'Врач',
      'Дата и время визита',
      'Стоимость (руб)',
      'Комментарий',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = appointments.map((a) =>
      [
        a.id,
        a.createdAt,
        a.status,
        a.ownerName,
        a.phone,
        a.email || '',
        a.senderAliasEmail || CLINIC_INFO.publicAliasEmail,
        a.petSpecies,
        a.petName,
        a.serviceTitle,
        a.doctorName,
        a.preferredDate,
        a.estimatedPrice || 0,
        a.notes || '',
      ]
        .map(escapeCsv)
        .join(';')
    );

    return '\uFEFF' + [headers.map(escapeCsv).join(';'), ...rows].join('\r\n');
  };

  const handleDownloadCsv = () => {
    const csvWithBom = buildCsvContent();
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `lapa_pomoshchi_appointments_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('Файл Excel (CSV с кодировкой UTF-8 BOM) успешно сформирован и скачан.');
  };

  // --- EXPORT 2: Full Database JSON ---
  const handleDownloadJson = () => {
    const payload = {
      clinic: CLINIC_INFO.name,
      exportedAt: new Date().toISOString(),
      emailGateway: {
        internalMailbox: CLINIC_INFO.internalSenderEmail,
        publicClientAlias: CLINIC_INFO.publicAliasEmail,
      },
      appointments,
      services,
      doctors,
    };
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `lapa_pomoshchi_full_db_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('Полная база данных сайта (JSON: заявки, услуги, врачи) успешно скачана.');
  };

  // --- EXPORT 3: Save Admin Report to Google Drive (Admin-Only) ---
  const handleExportAdminReportToGoogleDrive = async () => {
    setIsUploadingDrive(true);
    try {
      const dateStr = new Date().toLocaleDateString('ru-RU');
      const reportLines = [
        `АДМИНИСТРАТИВНЫЙ ОТЧЕТ КЛИНИКИ «${CLINIC_INFO.name.toUpperCase()}»`,
        `Дата выгрузки: ${new Date().toLocaleString('ru-RU')}`,
        `Внутренний почтовый шлюз: ${CLINIC_INFO.internalSenderEmail} -> Псевдоним для клиентов: ${CLINIC_INFO.publicAliasEmail}`,
        `Всего заявок в базе: ${stats.total} | Новых: ${stats.newCount} | Подтвержденных: ${stats.confirmedCount}`,
        `Плановая выручка по активным записям: ${stats.revenue.toLocaleString('ru-RU')} ₽`,
        `====================================================================`,
        `1. РЕЕСТР ВСЕХ ЗАЯВОК КЛИЕНТОВ (${appointments.length}):`,
        ...appointments.map(
          (a, idx) =>
            `${idx + 1}. [#${a.id}] Статус: ${a.status} | Дата визита: ${a.preferredDate}\n` +
            `   Клиент: ${a.ownerName} | Тел: ${a.phone} | Email: ${a.email || 'не указан'}\n` +
            `   Пациент: ${a.petSpecies} «${a.petName}» | Услуга: ${a.serviceTitle} | Врач: ${a.doctorName}\n` +
            `   Сумма: ${(a.estimatedPrice || 0).toLocaleString('ru-RU')} ₽ | Примечание: ${a.notes || '-'}`
        ),
        `====================================================================`,
        `2. АКТУАЛЬНЫЙ ПРАЙС-ЛИСТ УСЛУГ (${services.length}):`,
        ...services.map(
          (s) => `${s.number}. ${s.title} (${s.categoryLabel}, ${s.duration}) — от ${s.priceFrom} ₽`
        ),
        `====================================================================`,
        `3. ШТАТ ВРАЧЕЙ КЛИНИКИ (${doctors.length}):`,
        ...doctors.map(
          (d) => `• ${d.name} — ${d.role} (Стаж ${d.experienceYears} лет, ${d.operationsCount})`
        ),
      ].join('\n\n');

      const uploaded = await uploadFileToGoogleDrive(
        `Админ_Отчет_Лапа_Помощи_${dateStr}.txt`,
        reportLines,
        'text/plain'
      );
      showNotice(
        `Полный отчёт администратора «${uploaded.name}» успешно сохранен на ваш Google Диск!`
      );
    } catch (err: any) {
      showNotice(
        err?.message || 'Ошибка выгрузки на Google Диск. Проверьте вход через Google.'
      );
    } finally {
      setIsUploadingDrive(false);
    }
  };

  return (
    <section
      id="admin-panel"
      className="py-10 bg-[#F4FAF8] border-b-2 border-[#0D9488]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-[#D1EAE4] shadow-lg overflow-hidden">
          {/* Top Header of Admin Panel */}
          <div className="p-6 sm:p-8 bg-[#0F2922] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F97316] mb-2">
                <Shield className="w-4 h-4" />
                <span>КЛАСС 1 — ПАНЕЛЬ АДМИНИСТРАТОРА КЛИНИКИ (RBAC: ADMIN)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Управление клиникой «Лапа Помощи»
              </h2>
              <p className="text-xs sm:text-sm text-[#B8E1D8] mt-1">
                Почтовый шлюз уведомлений:{' '}
                <strong className="text-white">{CLINIC_INFO.internalSenderEmail}</strong>{' '}
                автоматически отображается клиентам как{' '}
                <strong className="text-[#F97316]">{CLINIC_INFO.publicAliasEmail}</strong>
              </p>
            </div>

            {/* Export Actions Bar (CSV, JSON, Admin Google Drive Report) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#2DD4BF]" />
                <span>Скачать Excel (CSV)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-[#FBBF24]" />
                <span>Скачать JSON</span>
              </button>

              <button
                type="button"
                onClick={handleExportAdminReportToGoogleDrive}
                disabled={isUploadingDrive}
                className="py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white text-xs font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>
                  {isUploadingDrive
                    ? 'Выгрузка на Диск...'
                    : 'Выгрузить отчёт на Google Диск'}
                </span>
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-[#F4FAF8] border-b border-[#D1EAE4]">
            <div className="rounded-xl bg-white border border-[#D1EAE4] p-4">
              <div className="text-xs text-[#335249]">Всего заявок в базе</div>
              <div className="text-2xl font-extrabold text-[#0F2922] tabular-nums mt-1">
                {stats.total}
              </div>
            </div>
            <div className="rounded-xl bg-white border border-[#D1EAE4] p-4">
              <div className="text-xs text-[#335249]">Новые (ждут звонка)</div>
              <div className="text-2xl font-extrabold text-[#F97316] tabular-nums mt-1">
                {stats.newCount}
              </div>
            </div>
            <div className="rounded-xl bg-white border border-[#D1EAE4] p-4">
              <div className="text-xs text-[#335249]">Подтверждены</div>
              <div className="text-2xl font-extrabold text-[#0D9488] tabular-nums mt-1">
                {stats.confirmedCount}
              </div>
            </div>
            <div className="rounded-xl bg-white border border-[#D1EAE4] p-4">
              <div className="text-xs text-[#335249]">Сумма активных записей</div>
              <div className="text-2xl font-extrabold text-[#0F2922] tabular-nums mt-1">
                {stats.revenue.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Notification Toast */}
          {bannerMessage && (
            <div className="mx-6 mt-5 rounded-xl bg-[#E6F4F1] border border-[#0D9488] px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold text-[#0F2922]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>{bannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setBannerMessage('')}
                className="text-[#335249] hover:text-[#0F2922]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Sub-Tabs */}
          <div className="px-6 pt-5 border-b border-[#D1EAE4] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#F4FAF8] text-[#335249] hover:text-[#0F2922]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Все заявки клиентов ({appointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#F4FAF8] text-[#335249] hover:text-[#0F2922]'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Услуги и цены ({services.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('doctors')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'doctors'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#F4FAF8] text-[#335249] hover:text-[#0F2922]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Карточки врачей ({doctors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('emails')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-snappy inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'emails'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#F4FAF8] text-[#335249] hover:text-[#0F2922]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Почтовые уведомления ({emailLogs.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: APPOINTMENTS CRUD */}
          {activeTab === 'appointments' && (
            <div className="p-6 space-y-5">
              {/* Patient Species & Doctor Load Analytics Strip */}
              <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-[#0F2922]">
                    Аналитика пациентов:
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#D1EAE4] font-semibold text-[#0F2922] tabular-nums">
                    Кошки: {stats.catsCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#D1EAE4] font-semibold text-[#0F2922] tabular-nums">
                    Собаки: {stats.dogsCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#D1EAE4] font-semibold text-[#0F2922] tabular-nums">
                    Грызуны: {stats.rodentsCount}
                  </span>
                </div>
                <div className="text-[#335249] tabular-nums">
                  Отображено записей по фильтрам:{' '}
                  <strong className="text-[#0D9488]">
                    {filteredAppointments.length} из {appointments.length}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#335249] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск по клиенту, телефону, кличке..."
                      className="pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] focus:outline-none focus:border-[#0D9488] w-60 sm:w-64"
                    />
                  </div>

                  {/* Фильтр по врачу */}
                  <select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    aria-label="Фильтр по врачу"
                    className="px-3 py-2 text-xs rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] font-semibold focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="all">Все врачи клиники</option>
                    <option value="Дежурный специалист клиники">Дежурный специалист</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  {/* Фильтр по дате */}
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      aria-label="Фильтр по дате приема"
                      className="px-3 py-1.5 text-xs rounded-xl border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] tabular-nums focus:outline-none focus:border-[#0D9488]"
                    />
                    {dateFilter && (
                      <button
                        type="button"
                        onClick={() => setDateFilter('')}
                        className="px-2 py-1.5 rounded-lg bg-[#E6F4F1] text-[#0D9488] text-[11px] font-bold cursor-pointer"
                        title="Сбросить дату"
                      >
                        Все даты
                      </button>
                    )}
                  </div>

                  <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F4FAF8] border border-[#D1EAE4] rounded-xl">
                    {(['all', ...STATUS_OPTIONS] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-snappy whitespace-nowrap cursor-pointer ${
                          statusFilter === st
                            ? 'bg-[#0D9488] text-white'
                            : 'text-[#335249] hover:text-[#0F2922]'
                        }`}
                      >
                        {st === 'all' ? 'Все' : st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateAppointments(INITIAL_APPOINTMENTS_DATA);
                      showNotice('Демо-база из 6 реалистичных записей восстановлена.');
                    }}
                    className="py-2 px-3 rounded-xl border border-[#D1EAE4] hover:bg-[#F4FAF8] text-xs font-semibold text-[#335249] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить демо-записи</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewAppointment}
                    className="py-2 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить запись</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#D1EAE4]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4FAF8] border-b border-[#D1EAE4] text-[11px] font-bold text-[#335249]">
                      <th className="py-3 px-4">ID / Статус</th>
                      <th className="py-3 px-4">Клиент и Контакты</th>
                      <th className="py-3 px-4">Питомец</th>
                      <th className="py-3 px-4">Услуга и Врач</th>
                      <th className="py-3 px-4">Дата / Сумма</th>
                      <th className="py-3 px-4">Комментарий</th>
                      <th className="py-3 px-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1EAE4] text-xs">
                    {filteredAppointments.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F4FAF8]/60 transition-snappy">
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="font-bold text-[#0F2922] tabular-nums mb-1.5">
                            #{item.id}
                          </div>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-[#D1EAE4] bg-white text-xs font-semibold text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                            {!STATUS_OPTIONS.includes(item.status as AppointmentStatus) && (
                              <option value={item.status}>{item.status}</option>
                            )}
                          </select>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-[#0F2922]">{item.ownerName}</div>
                          <div className="text-[#335249] tabular-nums">{item.phone}</div>
                          {item.email && (
                            <div className="text-[11px] text-[#0D9488] mt-0.5">
                              {item.email}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="font-bold text-[#0F2922]">{item.petName}</div>
                          <div className="text-[#335249]">{item.petSpecies}</div>
                        </td>

                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <div className="font-semibold text-[#0F2922] leading-snug">
                            {item.serviceTitle}
                          </div>
                          <div className="text-[#335249] mt-0.5">{item.doctorName}</div>
                        </td>

                        <td className="py-3.5 px-4 align-top whitespace-nowrap tabular-nums">
                          <div className="font-semibold text-[#0F2922]">
                            {item.preferredDate}
                          </div>
                          <div className="font-bold text-[#0D9488] mt-0.5">
                            {(item.estimatedPrice || 0).toLocaleString('ru-RU')} ₽
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top max-w-xs text-[#335249]">
                          <div>{item.notes || '—'}</div>
                          {item.doctorRecommendation && (
                            <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-[#E6F4F1] border border-[#0D9488]/30 text-[11px] text-[#0F2922]">
                              <strong className="text-[#0D9488]">Заключение врача:</strong>{' '}
                              {item.doctorRecommendation}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsNewAppointment(false);
                                setEditingAppointment({ ...item });
                              }}
                              className="p-2 rounded-lg border border-[#D1EAE4] bg-white hover:bg-[#E6F4F1] text-[#0F2922] transition-snappy cursor-pointer"
                              title="Редактировать заявку"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAppointment(item.id)}
                              className="p-2 rounded-lg border border-[#D1EAE4] bg-white hover:bg-red-50 text-[#335249] hover:text-red-600 transition-snappy cursor-pointer"
                              title="Удалить заявку"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES & PRICES CRUD */}
          {activeTab === 'services' && (
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#0F2922]">
                    Редактирование услуг и прайс-листа
                  </h3>
                  <p className="text-xs text-[#335249]">
                    Все изменения мгновенно сохраняются и обновляют карточки в блоке «Услуги и цены» на сайте.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateServices(SERVICES_DATA);
                      showNotice('Стандартный прайс-лист услуг восстановлен.');
                    }}
                    className="py-2 px-3 rounded-xl border border-[#D1EAE4] hover:bg-[#F4FAF8] text-xs font-semibold text-[#335249] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить прайс</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewService(true);
                      setEditingService({
                        id: `srv-${Date.now()}`,
                        number: String(services.length + 1).padStart(2, '0'),
                        category: 'treatment',
                        categoryLabel: 'Лечение',
                        title: '',
                        duration: '40 мин',
                        priceFrom: 2000,
                        description: '',
                        included: ['Осмотр профильного специалиста', 'Консультация по уходу'],
                      });
                    }}
                    className="py-2 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить услугу</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#335249] mb-1">
                        <span>
                          <strong className="text-[#0D9488]">{srv.number}.</strong>{' '}
                          {srv.categoryLabel} · {srv.duration}
                        </span>
                        <span className="text-sm font-extrabold text-[#0F2922] tabular-nums">
                          от {srv.priceFrom.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F2922] mb-1">
                        {srv.title}
                      </h4>
                      <p className="text-xs text-[#335249] leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D1EAE4]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewService(false);
                          setEditingService({ ...srv });
                        }}
                        className="py-1.5 px-3 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-xs font-semibold text-[#0F2922] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Изменить цену / описание</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-red-300 text-[#335249] hover:text-red-600 cursor-pointer"
                        title="Удалить услугу"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCTORS CRUD */}
          {activeTab === 'doctors' && (
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#0F2922]">
                    Редактирование карточек врачей
                  </h3>
                  <p className="text-xs text-[#335249]">
                    Обновляйте ФИО, специализацию, стаж работы и цитаты врачей — изменения сразу видны на сайте.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateDoctors(DOCTORS_DATA);
                      showNotice('Стандартный список врачей восстановлен.');
                    }}
                    className="py-2 px-3 rounded-xl border border-[#D1EAE4] hover:bg-[#F4FAF8] text-xs font-semibold text-[#335249] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить врачей</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewDoctor(true);
                      setEditingDoctor({
                        id: `doc-${Date.now()}`,
                        name: '',
                        role: 'Врач-терапевт, дерматолог',
                        experienceYears: 7,
                        operationsCount: '2 500+ приемов',
                        education: 'МГАВМиБ им. К. И. Скрябина',
                        quote: 'Забота о здоровье каждого пациента по принципам доказательной медицины.',
                        specialties: ['Терапия', 'Дерматология'],
                        photoUrl:
                          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
                        fallbackTitle: 'Специалист клиники',
                        accentColor: '#0D9488',
                      });
                    }}
                    className="py-2 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить врача</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#0D9488] font-semibold mb-1 tabular-nums">
                        <span>
                          Стаж {doc.experienceYears} лет · {doc.operationsCount}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F2922]">{doc.name}</h4>
                      <div className="text-xs text-[#335249] mb-2">{doc.role}</div>
                      <p className="text-xs text-[#0F2922] italic bg-white p-2.5 rounded-lg border border-[#D1EAE4]">
                        «{doc.quote}»
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D1EAE4]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewDoctor(false);
                          setEditingDoctor({ ...doc });
                        }}
                        className="py-1.5 px-3 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-xs font-semibold text-[#0F2922] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Редактировать карточку</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="p-1.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-red-300 text-[#335249] hover:text-red-600 cursor-pointer"
                        title="Удалить карточку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL NOTIFICATIONS LOG & ALIAS ROUTING */}
          {activeTab === 'emails' && (
            <div className="p-6 space-y-5">
              {/* Top Info & Direct Test Dispatch to tanks8015@gmail.com */}
              <div className="rounded-xl bg-[#E6F4F1] border border-[#0D9488] p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2922]">
                      Почтовый шлюз клиники «Лапа Помощи» (EmailJS REST API + FormSubmit Relay)
                    </h3>
                    <p className="text-xs text-[#335249] mt-0.5">
                      Внутренний аккаунт клиники:{' '}
                      <strong className="text-[#0F2922]">{CLINIC_INFO.internalSenderEmail}</strong>{' '}
                      → Отображаемый отправитель (Alias):{' '}
                      <strong className="text-[#0D9488]">{CLINIC_INFO.publicAliasEmail}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEmailJsConfig((prev) => !prev)}
                    className="py-2 px-3.5 rounded-xl bg-white hover:bg-[#F4FAF8] border border-[#0D9488] text-xs font-bold text-[#0F2922] inline-flex items-center gap-1.5 whitespace-nowrap self-start cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>
                      {showEmailJsConfig ? 'Скрыть ключи EmailJS' : 'Настроить ключи EmailJS'}
                    </span>
                  </button>
                </div>

                {/* Live Test Dispatch Form pre-filled with tanks8015@gmail.com */}
                <form
                  onSubmit={handleSendTestEmail}
                  className="bg-white rounded-xl border border-[#D1EAE4] p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#0F2922] mb-1">
                      Проверка отправки реального письма с почты клиники на указанный адрес:
                    </label>
                    <input
                      type="email"
                      required
                      value={testTargetEmail}
                      onChange={(e) => setTestTargetEmail(e.target.value)}
                      placeholder="tanks8015@gmail.com"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="submit"
                      disabled={isSendingTestEmail}
                      className="py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white text-xs font-bold transition-snappy inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isSendingTestEmail
                          ? 'Отправка письма...'
                          : `Отправить на ${testTargetEmail || 'tanks8015@gmail.com'}`}
                      </span>
                    </button>

                    <a
                      href={buildGmailDirectComposeUrl(
                        testTargetEmail.trim() || 'tanks8015@gmail.com',
                        'Тестовое уведомление — Ветеринарная клиника «Лапа Помощи»',
                        `Здравствуйте!\n\nЭто контрольное письмо от круглосуточной ветеринарной клиники «Лапа Помощи».\nОтправитель: ${CLINIC_INFO.publicAliasEmail} (шлюз ${CLINIC_INFO.internalSenderEmail})\nПолучатель: ${testTargetEmail.trim() || 'tanks8015@gmail.com'}\nТелефон клиники 24/7: ${CLINIC_INFO.phoneDisplay}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3.5 rounded-xl bg-[#F4FAF8] hover:bg-[#E6F4F1] border border-[#D1EAE4] text-xs font-semibold text-[#0F2922] transition-snappy inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>Отправить через Gmail Web</span>
                    </a>
                  </div>
                </form>

                {/* Collapsible Runtime EmailJS Credentials Editor */}
                {showEmailJsConfig && (
                  <form
                    onSubmit={handleSaveEmailJsKeys}
                    className="bg-white rounded-xl border border-[#D1EAE4] p-4 space-y-3"
                  >
                    <div className="text-xs font-bold text-[#0F2922]">
                      Ключи EmailJS REST API (сохраняются в браузере или задаются в src/services/emailService.ts)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#335249] mb-1">
                          Service ID
                        </label>
                        <input
                          type="text"
                          value={emailJsKeys.serviceId}
                          onChange={(e) =>
                            setEmailJsKeys({ ...emailJsKeys, serviceId: e.target.value })
                          }
                          placeholder="service_xxxxxxx"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D1EAE4]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#335249] mb-1">
                          Template ID
                        </label>
                        <input
                          type="text"
                          value={emailJsKeys.templateId}
                          onChange={(e) =>
                            setEmailJsKeys({ ...emailJsKeys, templateId: e.target.value })
                          }
                          placeholder="template_xxxxxxx"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D1EAE4]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#335249] mb-1">
                          Public Key (User ID)
                        </label>
                        <input
                          type="text"
                          value={emailJsKeys.publicKey}
                          onChange={(e) =>
                            setEmailJsKeys({ ...emailJsKeys, publicKey: e.target.value })
                          }
                          placeholder="YOUR_PUBLIC_KEY"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D1EAE4]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="py-2 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Сохранить ключи EmailJS</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {emailLogs.length === 0 ? (
                <div className="py-8 text-center rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] text-xs text-[#335249]">
                  Журнал отправленных уведомлений пока пуст. Нажмите «Отправить на tanks8015@gmail.com» выше или оформите запись на приём.
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#0F2922]">
                            {log.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#E6F4F1] text-[#0D9488] font-semibold text-[11px]">
                            {log.deliveryStatus === 'sent_emailjs'
                              ? 'EmailJS API (200 OK)'
                              : log.deliveryStatus === 'sent_relay'
                                ? 'HTTP Relay (FormSubmit)'
                                : 'Зафиксировано в шлюзе'}
                          </span>
                        </div>
                        <span className="text-[#335249] tabular-nums">{log.sentAt}</span>
                      </div>
                      <div className="text-xs text-[#335249] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            Шлюз:{' '}
                            <strong className="text-[#0F2922]">
                              {log.internalSenderEmail}
                            </strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Отображено клиенту:{' '}
                            <strong className="text-[#0D9488]">
                              {log.displaySenderEmail}
                            </strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Получатель:{' '}
                            <strong className="text-[#0F2922]">
                              {log.recipientName} ({log.recipientEmail})
                            </strong>
                          </span>
                        </div>

                        <a
                          href={buildGmailDirectComposeUrl(
                            log.recipientEmail,
                            log.subject,
                            log.bodyText
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-[#0D9488] hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Открыть в Gmail</span>
                        </a>
                      </div>
                      {log.deliveryNote && (
                        <div className="text-[11px] text-[#0D9488] font-medium">
                          Статус канала: {log.deliveryNote}
                        </div>
                      )}
                      <pre className="text-[11px] text-[#335249] bg-white p-3 rounded-lg border border-[#D1EAE4] whitespace-pre-wrap font-sans">
                        {log.bodyText}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Edit / Create Appointment */}
      {editingAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveAppointment}
            className="w-full max-w-lg rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-[#D1EAE4] pb-3">
              <h3 className="text-base font-bold text-[#0F2922]">
                {isNewAppointment
                  ? 'Новая запись клиента'
                  : `Редактирование заявки #${editingAppointment.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="text-[#335249] hover:text-[#0F2922]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Имя владельца *
                </label>
                <input
                  type="text"
                  required
                  value={editingAppointment.ownerName}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      ownerName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Телефон *
                </label>
                <input
                  type="text"
                  required
                  value={editingAppointment.phone}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Email клиента (для уведомления)
                </label>
                <input
                  type="email"
                  value={editingAppointment.email || ''}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Статус заявки
                </label>
                <select
                  value={editingAppointment.status}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Вид питомца
                </label>
                <select
                  value={editingAppointment.petSpecies}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      petSpecies: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                >
                  <option value="Кошка">Кошка</option>
                  <option value="Собака">Собака</option>
                  <option value="Грызун">Грызун</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Кличка *
                </label>
                <input
                  type="text"
                  required
                  value={editingAppointment.petName}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      petName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Стоимость (₽)
                </label>
                <input
                  type="number"
                  value={editingAppointment.estimatedPrice || 0}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      estimatedPrice: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Услуга
              </label>
              <input
                type="text"
                required
                value={editingAppointment.serviceTitle}
                onChange={(e) =>
                  setEditingAppointment({
                    ...editingAppointment,
                    serviceTitle: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Врач
                </label>
                <input
                  type="text"
                  value={editingAppointment.doctorName}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      doctorName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Дата и время приема
                </label>
                <input
                  type="text"
                  value={editingAppointment.preferredDate}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      preferredDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Комментарий администратора / анамнез
              </label>
              <textarea
                rows={2}
                value={editingAppointment.notes || ''}
                onChange={(e) =>
                  setEditingAppointment({
                    ...editingAppointment,
                    notes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D9488] mb-1">
                Заключение и рекомендации лечащего врача (отображается клиенту в «Моих заявках» и в талоне)
              </label>
              <textarea
                rows={2}
                placeholder="Например: По результатам УЗИ патологий не выявлено. Рекомендована лечебная диета Gastrointestinal на 14 дней."
                value={editingAppointment.doctorRecommendation || ''}
                onChange={(e) =>
                  setEditingAppointment({
                    ...editingAppointment,
                    doctorRecommendation: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#0D9488]/50 bg-[#F4FAF8]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D1EAE4]">
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="py-2 px-4 rounded-xl border border-[#D1EAE4] text-xs font-semibold text-[#335249]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить заявку</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit / Create Service */}
      {editingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveService}
            className="w-full max-w-lg rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-[#D1EAE4] pb-3">
              <h3 className="text-base font-bold text-[#0F2922]">
                {isNewService ? 'Добавление новой услуги' : 'Редактирование услуги'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-[#335249] hover:text-[#0F2922]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Название услуги *
              </label>
              <input
                type="text"
                required
                value={editingService.title}
                onChange={(e) =>
                  setEditingService({ ...editingService, title: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Категория
                </label>
                <select
                  value={editingService.category}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      category: e.target.value as ServiceItem['category'],
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                >
                  <option value="diagnostics">Диагностика</option>
                  <option value="treatment">Лечение</option>
                  <option value="care">Уход</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Длительность
                </label>
                <input
                  type="text"
                  value={editingService.duration}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      duration: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Цена от (₽) *
                </label>
                <input
                  type="number"
                  required
                  value={editingService.priceFrom}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      priceFrom: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Описание процедуры *
              </label>
              <textarea
                rows={3}
                required
                value={editingService.description}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D1EAE4]">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="py-2 px-4 rounded-xl border border-[#D1EAE4] text-xs font-semibold text-[#335249]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить услугу</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit / Create Doctor */}
      {editingDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveDoctor}
            className="w-full max-w-lg rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-[#D1EAE4] pb-3">
              <h3 className="text-base font-bold text-[#0F2922]">
                {isNewDoctor ? 'Добавление специалиста' : 'Редактирование карточки врача'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="text-[#335249] hover:text-[#0F2922]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                ФИО врача *
              </label>
              <input
                type="text"
                required
                value={editingDoctor.name}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, name: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Должность и специализация *
              </label>
              <input
                type="text"
                required
                value={editingDoctor.role}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, role: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Стаж работы (лет) *
                </label>
                <input
                  type="number"
                  required
                  value={editingDoctor.experienceYears}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      experienceYears: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                  Показатель опыта (напр. 3 400+ операций)
                </label>
                <input
                  type="text"
                  value={editingDoctor.operationsCount}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      operationsCount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Образование и квалификация
              </label>
              <input
                type="text"
                value={editingDoctor.education}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    education: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                Цитата врача
              </label>
              <textarea
                rows={3}
                value={editingDoctor.quote}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    quote: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D1EAE4]">
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="py-2 px-4 rounded-xl border border-[#D1EAE4] text-xs font-semibold text-[#335249]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить карточку</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
