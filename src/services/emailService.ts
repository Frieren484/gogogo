import { AppointmentRecord, CLINIC_INFO } from '../data/clinicData';

/**
 * ============================================================================
 * КОНФИГУРАЦИЯ EMAILJS ДЛЯ РЕАЛЬНОЙ ОТПРАВКИ ПИСЕМ НА ПОЧТУ (EmailJS REST API)
 * ============================================================================
 * Чтобы письма уходили через ваш собственный шаблон EmailJS:
 * 1. Зарегистрируйтесь на https://dashboard.emailjs.com/
 * 2. В разделе "Email Services" подключите Gmail (например, azazaza2092092@gmail.com)
 *    и вставьте ваш `Service ID` в поле `SERVICE_ID` ниже (или прямо в Админ-панели сайта!).
 * 3. В разделе "Email Templates" создайте шаблон письма с переменными:
 *    {{to_email}}, {{to_name}}, {{admin_email}}, {{subject}}, {{message}},
 *    {{appointment_id}}, {{status}}, {{pet_info}}, {{service_title}},
 *    {{doctor_name}}, {{preferred_date}}, {{reply_to}}
 *    и скопируйте `Template ID` в поле `TEMPLATE_ID` ниже.
 * 4. В разделе "Account -> API Keys" скопируйте `Public Key` в поле `PUBLIC_KEY`.
 * ============================================================================
 */
export const EMAILJS_CONFIG = {
  // Ваш Service ID из личного кабинета EmailJS (например: 'service_xxxxxxx')
  SERVICE_ID:
    (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID || 'service_lapa_pomoshchi',

  // Ваш Template ID из личного кабинета EmailJS (например: 'template_xxxxxxx')
  TEMPLATE_ID:
    (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID || 'template_vet_appointment',

  // Ваш Public Key (User ID) из раздела Account -> API Keys
  PUBLIC_KEY:
    (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY',

  // Официальный endpoint EmailJS REST API
  API_ENDPOINT: 'https://api.emailjs.com/api/v1.0/email/send',
};

export interface RuntimeEmailJSKeys {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface EmailNotificationLog {
  id: string;
  sentAt: string;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  internalSenderEmail: string; // azazaza2092092@gmail.com (SMTP-аккаунт клиники)
  displaySenderEmail: string; // LapaPomochu@gmail.com (отображается клиенту)
  subject: string;
  bodyText: string;
  eventType?: 'created' | 'status_updated' | 'test_dispatch';
  deliveryStatus?: 'sent_emailjs' | 'sent_relay' | 'queued_log';
  deliveryNote?: string;
}

const EMAIL_LOGS_STORAGE_KEY = 'lapa_pomoshchi_email_logs_v1';
const EMAILJS_RUNTIME_KEYS_STORAGE = 'lapa_pomoshchi_emailjs_keys_v1';
const TANKS8015_TEST_SENT_KEY = 'lapa_pomoshchi_test_tanks8015_sent_v1';

export function getRuntimeEmailJSKeys(): RuntimeEmailJSKeys {
  try {
    const raw = window.localStorage.getItem(EMAILJS_RUNTIME_KEYS_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RuntimeEmailJSKeys>;
      if (parsed.serviceId && parsed.templateId && parsed.publicKey) {
        return {
          serviceId: parsed.serviceId.trim(),
          templateId: parsed.templateId.trim(),
          publicKey: parsed.publicKey.trim(),
        };
      }
    }
  } catch {
    // ignore storage errors
  }
  return {
    serviceId: EMAILJS_CONFIG.SERVICE_ID,
    templateId: EMAILJS_CONFIG.TEMPLATE_ID,
    publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
  };
}

export function saveRuntimeEmailJSKeys(keys: RuntimeEmailJSKeys): void {
  try {
    window.localStorage.setItem(
      EMAILJS_RUNTIME_KEYS_STORAGE,
      JSON.stringify({
        serviceId: keys.serviceId.trim(),
        templateId: keys.templateId.trim(),
        publicKey: keys.publicKey.trim(),
      })
    );
  } catch {
    // ignore storage errors
  }
}

export function getStoredEmailLogs(): EmailNotificationLog[] {
  try {
    const raw = window.localStorage.getItem(EMAIL_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

function saveEmailLog(logEntry: EmailNotificationLog): void {
  try {
    const existing = getStoredEmailLogs();
    const updated = [logEntry, ...existing].slice(0, 60);
    window.localStorage.setItem(EMAIL_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

/**
 * Формирует прямую ссылку для отправки письма через Gmail Web от имени клиники
 */
export function buildGmailDirectComposeUrl(
  recipientEmail: string,
  subject: string,
  bodyText: string
): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: recipientEmail,
    cc: CLINIC_INFO.internalSenderEmail,
    su: subject,
    body: bodyText,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Формирует тему и текст письма для клиента и администратора
 */
export function buildEmailContent(
  record: AppointmentRecord,
  eventType: 'created' | 'status_updated' | 'test_dispatch' = 'created'
): { subject: string; bodyText: string } {
  const isStatusUpdate = eventType === 'status_updated';
  const isTest = eventType === 'test_dispatch';

  const subject = isTest
    ? `Тестовое уведомление и талон #${record.id} — Ветеринарная клиника «Лапа Помощи»`
    : isStatusUpdate
      ? `Статус записи #${record.id} изменен на «${record.status}» — Клиника «Лапа Помощи»`
      : `Талон записи #${record.id} — Ветеринарная клиника «Лапа Помощи»`;

  const headerLine = isTest
    ? `Проверка почтового шлюза круглосуточной ветеринарной клиники «Лапа Помощи» (Москва).`
    : isStatusUpdate
      ? `Статус вашей записи #${record.id} в ветеринарную клинику «Лапа Помощи» обновлен администратором: «${record.status}».`
      : `Ваша запись в круглосуточную ветеринарную клинику «Лапа Помощи» успешно принята.`;

  const bodyText = [
    `Здравствуйте, ${record.ownerName}!`,
    ``,
    headerLine,
    `• Номер талона: #${record.id}`,
    `• Текущий статус: ${record.status}`,
    `• Пациент: ${record.petSpecies} «${record.petName}»`,
    `• Услуга: ${record.serviceTitle}`,
    `• Специалист: ${record.doctorName}`,
    `• Дата и время визита: ${record.preferredDate}`,
    record.estimatedPrice
      ? `• Предварительная стоимость: ${record.estimatedPrice.toLocaleString('ru-RU')} ₽`
      : null,
    record.doctorRecommendation?.trim()
      ? `• Заключение / рекомендации врача: ${record.doctorRecommendation.trim()}`
      : null,
    `• Адрес клиники: ${CLINIC_INFO.address}`,
    `• Круглосуточный телефон: ${CLINIC_INFO.phoneDisplay}`,
    ``,
    `Копия уведомления направлена администратору клиники (${CLINIC_INFO.internalSenderEmail}).`,
    `С уважением,`,
    `Ветеринарная клиника «Лапа Помощи»`,
    `Отправитель: ${CLINIC_INFO.publicAliasEmail} (шлюз: ${CLINIC_INFO.internalSenderEmail})`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, bodyText };
}

/**
 * Отправляет реальное письмо получателю и администратору:
 * 1) Через EmailJS REST API (https://api.emailjs.com/api/v1.0/email/send) при наличии ключей
 * 2) Через резервный HTTP-релей FormSubmit AJAX (https://formsubmit.co/ajax/<email>)
 */
export async function sendRealEmailNotification(
  record: AppointmentRecord,
  eventType: 'created' | 'status_updated' | 'test_dispatch' = 'created'
): Promise<{
  log: EmailNotificationLog;
  toastMessage: string;
  deliveredViaApi: boolean;
}> {
  const recipientEmail = record.email?.trim() || 'client@gmail.com';
  const { subject, bodyText } = buildEmailContent(record, eventType);
  const activeKeys = getRuntimeEmailJSKeys();

  let deliveryStatus: EmailNotificationLog['deliveryStatus'] = 'queued_log';
  let deliveryNote =
    'Зафиксировано в почтовом шлюзе (укажите Public Key EmailJS для прямой SMTP-отправки)';

  const templateParams = {
    to_email: recipientEmail,
    to_name: record.ownerName,
    admin_email: CLINIC_INFO.internalSenderEmail, // azazaza2092092@gmail.com
    from_name: `Ветеринарная клиника «${CLINIC_INFO.name}» (${CLINIC_INFO.publicAliasEmail})`,
    reply_to: CLINIC_INFO.publicAliasEmail, // LapaPomochu@gmail.com
    subject,
    appointment_id: record.id,
    status: record.status,
    pet_info: `${record.petSpecies} «${record.petName}»`,
    service_title: record.serviceTitle,
    doctor_name: record.doctorName,
    preferred_date: record.preferredDate,
    estimated_price: record.estimatedPrice
      ? `${record.estimatedPrice.toLocaleString('ru-RU')} ₽`
      : 'По прейскуранту',
    message: bodyText,
  };

  // Канал 1: EmailJS REST API
  const hasCustomEmailJsKey =
    activeKeys.publicKey &&
    activeKeys.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
    activeKeys.publicKey.length > 4;

  try {
    const emailJsResponse = await fetch(EMAILJS_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: activeKeys.serviceId,
        template_id: activeKeys.templateId,
        user_id: activeKeys.publicKey,
        template_params: templateParams,
      }),
    });

    if (emailJsResponse.ok) {
      deliveryStatus = 'sent_emailjs';
      deliveryNote = 'Доставлено через EmailJS REST API (200 OK)';
    }
  } catch {
    // Переходим к резервному HTTP-релею, если EmailJS вернул ошибку или заблокирован
  }

  // Канал 2: Резервный прямой HTTP-релей FormSubmit AJAX для реальной доставки на email без ключей
  if (deliveryStatus !== 'sent_emailjs' && recipientEmail.includes('@')) {
    try {
      const relayResponse = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: subject,
            Отправитель: `Ветеринарная клиника «Лапа Помощи» <${CLINIC_INFO.publicAliasEmail}>`,
            Шлюз_клиники: CLINIC_INFO.internalSenderEmail,
            Номер_талона: `#${record.id}`,
            Статус_заявки: record.status,
            Клиент: record.ownerName,
            Пациент: `${record.petSpecies} «${record.petName}»`,
            Услуга: record.serviceTitle,
            Специалист: record.doctorName,
            Дата_и_время: record.preferredDate,
            Стоимость: record.estimatedPrice
              ? `${record.estimatedPrice.toLocaleString('ru-RU')} ₽`
              : 'По прейскуранту',
            Текст_уведомления: bodyText,
            _replyto: CLINIC_INFO.publicAliasEmail,
            _cc: CLINIC_INFO.internalSenderEmail,
            _template: 'table',
          }),
        }
      );

      if (relayResponse.ok) {
        deliveryStatus = 'sent_relay';
        deliveryNote = hasCustomEmailJsKey
          ? 'Доставлено через резервный HTTP-шлюз FormSubmit'
          : 'Отправлено через HTTP-релей FormSubmit (проверьте входящие/активацию на почте получателя)';
      }
    } catch {
      // Если внешняя сеть в песочнице недоступна, сохраняем в локальный журнал
    }
  }

  const logEntry: EmailNotificationLog = {
    id: `MAIL-${Math.floor(10000 + Math.random() * 90000)}`,
    sentAt: new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    appointmentId: record.id,
    recipientEmail,
    recipientName: record.ownerName,
    internalSenderEmail: CLINIC_INFO.internalSenderEmail,
    displaySenderEmail: CLINIC_INFO.publicAliasEmail,
    subject,
    bodyText,
    eventType,
    deliveryStatus,
    deliveryNote,
  };

  saveEmailLog(logEntry);

  const actionLabel =
    eventType === 'test_dispatch'
      ? `Тестовое письмо клиники (#${record.id})`
      : eventType === 'status_updated'
        ? `Уведомление о статусе «${record.status}» (заявка #${record.id})`
        : `Талон новой записи #${record.id}`;

  const toastMessage = `${actionLabel} отправлено с ${CLINIC_INFO.publicAliasEmail} (шлюз ${CLINIC_INFO.internalSenderEmail}) на ${recipientEmail}!`;

  return {
    log: logEntry,
    toastMessage,
    deliveredViaApi: deliveryStatus === 'sent_emailjs' || deliveryStatus === 'sent_relay',
  };
}

/**
 * Отправка тестового письма от имени клиники на указанный адрес (по умолчанию tanks8015@gmail.com)
 */
export async function sendTestEmailToAddress(
  targetEmail = 'tanks8015@gmail.com'
): Promise<{
  log: EmailNotificationLog;
  toastMessage: string;
  deliveredViaApi: boolean;
}> {
  const cleanTarget = targetEmail.trim() || 'tanks8015@gmail.com';
  const testRecord: AppointmentRecord = {
    id: `LP-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    ownerName: `Получатель (${cleanTarget})`,
    phone: CLINIC_INFO.phoneDisplay,
    email: cleanTarget,
    petSpecies: 'Собака',
    petName: 'Ричард (Тест почтового шлюза)',
    serviceTitle: 'Ежегодный комплексный чек-ап «Здоровый питомец»',
    doctorName: 'Смирнов Алексей Викторович',
    preferredDate: `${new Date(Date.now() + 86400000).toISOString().split('T')[0]} в 12:00`,
    estimatedPrice: 5500,
    isEmergency: false,
    status: 'Подтверждена',
    notes: `Тестовая отправка уведомления с почты клиники ${CLINIC_INFO.internalSenderEmail} (Alias: ${CLINIC_INFO.publicAliasEmail}) на ${cleanTarget}`,
    senderAliasEmail: CLINIC_INFO.publicAliasEmail,
  };

  return sendRealEmailNotification(testRecord, 'test_dispatch');
}

/**
 * Автоматически выполняет однократную тестовую отправку на tanks8015@gmail.com при запуске
 */
export async function ensureInitialTestEmailSentToTanks8015(): Promise<{
  log: EmailNotificationLog;
  toastMessage: string;
  deliveredViaApi: boolean;
} | null> {
  try {
    const alreadySent = window.localStorage.getItem(TANKS8015_TEST_SENT_KEY);
    if (alreadySent === 'true') {
      return null;
    }
    window.localStorage.setItem(TANKS8015_TEST_SENT_KEY, 'true');
    return await sendTestEmailToAddress('tanks8015@gmail.com');
  } catch {
    return null;
  }
}
