import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  FileText,
  FolderSync,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { AppointmentRecord, CLINIC_INFO } from '../data/clinicData';
import { AppUserProfile, saveUserProfile } from '../services/authService';
import {
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from '../services/googleDriveAuth';

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

interface GoogleDriveSectionProps {
  appointments: AppointmentRecord[];
  calculatorSummaryText: string;
  userRole?: 'user' | 'admin';
  onGoogleLoginSuccess?: (profile: AppUserProfile) => void;
}

export const GoogleDriveSection: React.FC<GoogleDriveSectionProps> = ({
  appointments,
  calculatorSummaryText,
  userRole = 'user',
  onGoogleLoginSuccess,
}) => {
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // New pet medical note fields
  const [noteTitle, setNoteTitle] = useState<string>('Медкарта питомца — Лапа Помощи');
  const [noteContent, setNoteContent] = useState<string>(
    'Пациент: \nВид и порода: \nДата плановой вакцинации: \nРекомендации врача клиники «Лапа Помощи»:'
  );
  const [isSavingFile, setIsSavingFile] = useState<boolean>(false);

  // Mandatory explicit confirmation state for destructive/mutating operations
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [fileToOverwrite, setFileToOverwrite] = useState<DriveFileItem | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const loadDriveFiles = useCallback(async (queryText = '') => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setNeedsAuth(true);
      return;
    }

    setIsLoadingFiles(true);
    setErrorMessage('');
    try {
      const sanitizedQuery = queryText.trim().replace(/'/g, "\\'");
      const qParam = sanitizedQuery
        ? `trashed = false and name contains '${sanitizedQuery}'`
        : 'trashed = false';
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('pageSize', '10');
      url.searchParams.set('q', qParam);
      url.searchParams.set('orderBy', 'modifiedTime desc');
      url.searchParams.set(
        'fields',
        'files(id,name,mimeType,modifiedTime,webViewLink)'
      );

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        setNeedsAuth(true);
        throw new Error('Сессия Google Drive истекла. Пожалуйста, войдите снова.');
      }

      if (!response.ok) {
        throw new Error('Не удалось загрузить список файлов из Google Drive.');
      }

      const data = await response.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка при обращении к Google Drive API.');
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser) => {
        setUser(authenticatedUser);
        setNeedsAuth(false);
        loadDriveFiles();
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, [loadDriveFiles]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        if (onGoogleLoginSuccess && userRole !== 'admin') {
          const clientProfile: AppUserProfile = {
            uid: result.user.uid,
            displayName: result.user.displayName || 'Клиент Лапа Помощи',
            email: result.user.email || 'client.google@gmail.com',
            photoURL:
              result.user.photoURL ||
              `data:image/svg+xml;utf8,${encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#0D9488"/><text x="60" y="68" text-anchor="middle" font-family="Manrope, sans-serif" font-size="40" font-weight="800" fill="#FFFFFF">КЛ</text></svg>'
              )}`,
            role: 'user',
            authSource: 'google',
          };
          saveUserProfile(clientProfile);
          onGoogleLoginSuccess(clientProfile);
        }
        await loadDriveFiles(searchQuery);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Не удалось выполнить вход через Google. Проверьте всплывающее окно.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setFiles([]);
    setNeedsAuth(true);
    setStatusMessage('');
  };

  const createDriveTextFile = async (fileName: string, textBody: string) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setNeedsAuth(true);
      return;
    }

    setIsSavingFile(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const metadata = {
        name: fileName.endsWith('.txt') ? fileName : `${fileName}.txt`,
        mimeType: 'text/plain',
      };

      const boundary = 'lapa_pomoshchi_drive_boundary';
      const multipartBody =
        `--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
        textBody +
        `\r\n--${boundary}--`;

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      if (!res.ok) {
        throw new Error('Не удалось сохранить документ в Google Drive.');
      }

      const created = await res.json();
      setStatusMessage(`Файл «${created.name}» успешно сохранен в ваш Google Drive.`);
      await loadDriveFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка при создании файла в Google Drive.');
    } finally {
      setIsSavingFile(false);
    }
  };

  const handleExportClinicSummaryToDrive = async () => {
    const dateStr = new Date().toLocaleDateString('ru-RU');
    const appointmentsText =
      appointments.length > 0
        ? appointments
            .map(
              (a, i) =>
                `${i + 1}. Заявка #${a.id} от ${a.createdAt}\n` +
                `   Пациент: ${a.petSpecies} «${a.petName}»\n` +
                `   Услуга: ${a.serviceTitle}\n` +
                `   Врач: ${a.doctorName}\n` +
                `   Дата визита: ${a.preferredDate}\n` +
                `   Статус: ${a.status}`
            )
            .join('\n\n')
        : 'Активных заявок пока нет.';

    const fullDocument = [
      `ВЕТЕРИНАРНАЯ КЛИНИКА «${CLINIC_INFO.name.toUpperCase()}» (МОСКВА)`,
      `Адрес: ${CLINIC_INFO.address}`,
      `Круглосуточный телефон: ${CLINIC_INFO.phoneDisplay}`,
      `Дата формирования выписки: ${dateStr}`,
      '------------------------------------------------------------',
      'РАСЧЕТ ПРОГРАММЫ ЧЕК-АПА (КАЛЬКУЛЯТОР):',
      calculatorSummaryText,
      '------------------------------------------------------------',
      'ВАШИ ЗАПИСИ НА ПРИЕМ:',
      appointmentsText,
    ].join('\n');

    await createDriveTextFile(`Выписка_Лапа_Помощи_${dateStr}.txt`, fullDocument);
  };

  // Confirmed file deletion handler (called ONLY after user clicks Confirm in modal)
  const executeConfirmedDelete = async () => {
    if (!fileToDelete) return;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setNeedsAuth(true);
      setFileToDelete(null);
      return;
    }

    setIsMutating(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Не удалось удалить выбранный файл из Google Drive.');
      }

      setStatusMessage(`Файл «${fileToDelete.name}» удален из Google Drive.`);
      setFileToDelete(null);
      await loadDriveFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка при удалении файла.');
    } finally {
      setIsMutating(false);
    }
  };

  // Confirmed file overwrite handler (called ONLY after user clicks Confirm in modal)
  const executeConfirmedOverwrite = async () => {
    if (!fileToOverwrite) return;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setNeedsAuth(true);
      setFileToOverwrite(null);
      return;
    }

    setIsMutating(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const updatedBody = `${noteContent}\n\n[Обновлено через портал клиники «Лапа Помощи»: ${new Date().toLocaleString(
        'ru-RU'
      )}]`;

      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileToOverwrite.id}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/plain; charset=UTF-8',
          },
          body: updatedBody,
        }
      );

      if (!res.ok) {
        throw new Error('Не удалось обновить содержимое файла в Google Drive.');
      }

      setStatusMessage(`Содержимое файла «${fileToOverwrite.name}» успешно обновлено.`);
      setFileToOverwrite(null);
      await loadDriveFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка при обновлении файла.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <section
      id="google-drive"
      className="py-16 lg:py-20 bg-white border-b border-[#D1EAE4]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F4FAF8] border border-[#D1EAE4] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D1EAE4]">
            <div>
              <div className="text-xs font-semibold text-[#0D9488] mb-2">
                Облачная медкарта питомца · Интеграция с Google Workspace
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2922] tracking-tight">
                Документы, анализы и выписки в Google Drive
              </h2>
              <p className="text-sm text-[#335249] mt-1.5 max-w-2xl">
                Подключите ваш Google Drive, чтобы сохранять расчеты чек-апа, талоны записи на прием, результаты УЗИ и вести облачную медкарту питомца.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {needsAuth ? (
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoggingIn ? 'Подключение...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs text-[#0F2922]">
                    Подключен аккаунт:{' '}
                    <span className="font-bold">{user?.email || user?.displayName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2 px-3.5 rounded-xl bg-white border border-[#D1EAE4] hover:bg-[#E6F4F1] text-xs font-semibold text-[#335249] hover:text-[#0F2922] inline-flex items-center gap-1.5 transition-snappy whitespace-nowrap cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Выйти</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className="mt-5 rounded-xl bg-[#E6F4F1] border border-[#0D9488] px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold text-[#0F2922]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>{statusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage('')}
                className="text-[#335249] hover:text-[#0F2922]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between gap-3 text-xs font-medium text-red-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {needsAuth ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white border border-[#D1EAE4] p-5">
                <div className="w-9 h-9 rounded-lg bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center mb-3">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2922] mb-1">
                  Экспорт сметы и талонов записи
                </h3>
                <p className="text-xs text-[#335249] leading-relaxed">
                  Сохраняйте предварительный расчет калькулятора и список ваших записей в текстовый файл на Google Drive.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-[#D1EAE4] p-5">
                <div className="w-9 h-9 rounded-lg bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center mb-3">
                  <FilePlus2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2922] mb-1">
                  Дневник вакцинации и анализов
                </h3>
                <p className="text-xs text-[#335249] leading-relaxed">
                  Создавайте заметки о прививках, дозировках препаратов и рекомендациях врачей прямо из браузера.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-[#D1EAE4] p-5">
                <div className="w-9 h-9 rounded-lg bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center mb-3">
                  <FolderSync className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2922] mb-1">
                  Быстрый доступ к документам
                </h3>
                <p className="text-xs text-[#335249] leading-relaxed">
                  Находите прошлые выписки, снимки УЗИ и анализы на вашем Google Drive прямо во время приема у врача.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Create / Export Pet Medical Documents */}
              <div className="lg:col-span-5 rounded-xl bg-white border border-[#D1EAE4] p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#0F2922]">
                    Сохранить медкарту в Google Drive
                  </h3>
                  {userRole === 'admin' && (
                    <button
                      type="button"
                      onClick={handleExportClinicSummaryToDrive}
                      disabled={isSavingFile}
                      className="py-2 px-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-snappy inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Выгрузить отчёт Админа</span>
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D1EAE4] space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Название документа в Google Drive
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Содержимое медкарты / памятки врача
                    </label>
                    <textarea
                      rows={4}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D1EAE4] bg-white text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSavingFile || !noteTitle.trim()}
                    onClick={() => createDriveTextFile(noteTitle.trim(), noteContent)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-xs font-bold transition-snappy inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span>
                      {isSavingFile
                        ? 'Сохранение в Google Drive...'
                        : 'Создать новый документ в Google Drive'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column: Browse, Search & Manage Google Drive Files */}
              <div className="lg:col-span-7 rounded-xl bg-white border border-[#D1EAE4] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-bold text-[#0F2922]">
                    Ваши файлы в Google Drive ({files.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#335249] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') loadDriveFiles(searchQuery);
                        }}
                        placeholder="Поиск по названию..."
                        className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D1EAE4] bg-[#F4FAF8] text-[#0F2922] focus:outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => loadDriveFiles(searchQuery)}
                      disabled={isLoadingFiles}
                      className="p-2 rounded-lg border border-[#D1EAE4] bg-[#F4FAF8] hover:bg-[#E6F4F1] text-[#0F2922] transition-snappy cursor-pointer"
                      title="Обновить список файлов"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {isLoadingFiles ? (
                  <div className="py-10 text-center text-xs text-[#335249]">
                    Загрузка файлов из Google Drive...
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-8 text-center rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] text-xs text-[#335249]">
                    Файлы не найдены. Создайте выписку или медкарту слева, чтобы она появилась в списке.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-[#0D9488] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0F2922] truncate">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-[#335249] tabular-nums">
                              {file.modifiedTime
                                ? `Изменен: ${new Date(file.modifiedTime).toLocaleString(
                                    'ru-RU'
                                  )}`
                                : file.mimeType}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-2.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-[11px] font-semibold text-[#0F2922] inline-flex items-center gap-1 transition-snappy whitespace-nowrap"
                            >
                              <span>Открыть</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {file.mimeType === 'text/plain' && (
                            <button
                              type="button"
                              onClick={() => setFileToOverwrite(file)}
                              className="py-1.5 px-2.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-[#0D9488] text-[11px] font-semibold text-[#335249] hover:text-[#0F2922] transition-snappy whitespace-nowrap cursor-pointer"
                            >
                              Обновить текст
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded-lg bg-white border border-[#D1EAE4] hover:border-red-300 text-[#335249] hover:text-red-600 transition-snappy cursor-pointer"
                            title="Удалить файл из Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Deleting a File */}
      {fileToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 id="confirm-delete-title" className="text-base font-bold text-[#0F2922]">
                Подтвердите удаление файла из Google Drive
              </h3>
            </div>
            <p className="text-xs text-[#335249] leading-relaxed mb-5">
              Вы действительно хотите безвозвратно удалить файл{' '}
              <strong className="text-[#0F2922]">«{fileToDelete.name}»</strong> из вашего Google Drive? Это действие нельзя отменить.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setFileToDelete(null)}
                className="py-2 px-4 rounded-xl border border-[#D1EAE4] text-xs font-semibold text-[#335249] hover:text-[#0F2922] transition-snappy whitespace-nowrap cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isMutating}
                onClick={executeConfirmedDelete}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-snappy whitespace-nowrap cursor-pointer"
              >
                {isMutating ? 'Удаление...' : 'Подтвердить удаление'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Overwriting/Updating a File */}
      {fileToOverwrite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-overwrite-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 id="confirm-overwrite-title" className="text-base font-bold text-[#0F2922]">
                Подтвердите перезапись файла в Google Drive
              </h3>
            </div>
            <p className="text-xs text-[#335249] leading-relaxed mb-5">
              Содержимое существующего файла{' '}
              <strong className="text-[#0F2922]">«{fileToOverwrite.name}»</strong> в вашем Google Drive будет заменено текущим текстом из поля медкарты. Продолжить?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setFileToOverwrite(null)}
                className="py-2 px-4 rounded-xl border border-[#D1EAE4] text-xs font-semibold text-[#335249] hover:text-[#0F2922] transition-snappy whitespace-nowrap cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isMutating}
                onClick={executeConfirmedOverwrite}
                className="py-2 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-snappy whitespace-nowrap cursor-pointer"
              >
                {isMutating ? 'Обновление...' : 'Подтвердить перезапись'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
