import React from 'react';
import { CalendarCheck2, Clock, Mail, Plus, Trash2, X } from 'lucide-react';
import { AppointmentRecord, CLINIC_INFO } from '../data/clinicData';

interface SavedAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentRecord[];
  onCancelAppointment: (id: string) => void;
  onNewAppointment: () => void;
}

export const SavedAppointmentsModal: React.FC<SavedAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  onCancelAppointment,
  onNewAppointment,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-appointments-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-5 bg-[#F4FAF8] border-b border-[#D1EAE4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shrink-0">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="saved-appointments-title" className="text-lg font-bold text-[#0F2922]">
                Мои заявки на прием ({appointments.length})
              </h3>
              <p className="text-xs text-[#335249]">
                История ваших записей и статус подтверждения администратором
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#335249] hover:text-[#0F2922] hover:bg-[#E6F4F1] transition-snappy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-[#F4FAF8] border border-[#D1EAE4]">
              <Clock className="w-8 h-8 text-[#0D9488] mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#0F2922] mb-1">
                У вас пока нет активных записей
              </h4>
              <p className="text-xs text-[#335249] max-w-sm mx-auto mb-5">
                Рассчитайте стоимость чек-апа в калькуляторе или запишитесь на прием к профильному специалисту онлайн.
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
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#335249]">
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-bold text-[#0F2922]">#{item.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>Оформлена в {item.createdAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#0D9488]">{item.status}</span>
                    </div>
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
                    <span className="tabular-nums">Визит: {item.preferredDate}</span>
                    {item.estimatedPrice && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#0D9488] tabular-nums">
                          ~ {item.estimatedPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      </>
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
              ))}
            </div>
          )}

          {appointments.length > 0 && (
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
