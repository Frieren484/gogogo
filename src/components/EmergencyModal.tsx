import React, { useState } from 'react';
import { AlertTriangle, Ambulance, Check, PhoneCall, ShieldAlert, X } from 'lucide-react';
import { CLINIC_INFO, EMERGENCY_SYMPTOMS } from '../data/clinicData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestEmergencyDispatch: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onRequestEmergencyDispatch,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([EMERGENCY_SYMPTOMS[0].id]);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedSymptoms = EMERGENCY_SYMPTOMS.filter((s) => selectedIds.includes(s.id));
  const hasCritical = selectedSymptoms.some((s) => s.severity === 'critical');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2922]/65 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#D1EAE4] shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-5 bg-[#FFF7ED] border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center text-white shrink-0">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h3 id="emergency-modal-title" className="text-lg font-bold text-[#0F2922]">
                Экстренная помощь 24/7 и чек-лист симптомов
              </h3>
              <p className="text-xs text-[#335249]">
                Выезд реанимационной бригады по Москве за 30 минут · Дежурный хирург в клинике
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#335249] hover:text-[#0F2922] hover:bg-orange-100 transition-snappy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#0F2922] mb-2.5">
              Отметьте симптомы, которые наблюдаются у питомца прямо сейчас:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {EMERGENCY_SYMPTOMS.map((symptom) => {
                const isSelected = selectedIds.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-snappy flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF7ED] border-[#F97316] text-[#0F2922]'
                        : 'bg-white border-[#D1EAE4] text-[#335249] hover:bg-[#F4FAF8]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-[#F97316] border-[#F97316] text-white'
                          : 'border-[#D1EAE4] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-sm font-medium leading-snug">{symptom.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSymptoms.length > 0 ? (
            <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2922]">
                <ShieldAlert className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>
                  {hasCritical
                    ? 'Высокий уровень срочности: требуется немедленный осмотр реаниматолога'
                    : 'Срочное состояние: рекомендуется визит в клинику в ближайшие 2 часа'}
                </span>
              </div>
              <div className="space-y-2">
                {selectedSymptoms.map((s) => (
                  <div key={s.id} className="text-xs text-[#335249] leading-relaxed">
                    <span className="font-semibold text-[#0F2922]">Инструкция до приезда врача: </span>
                    {s.firstAid}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#F4FAF8] border border-[#D1EAE4] p-4 flex items-center gap-3 text-xs text-[#335249]">
              <AlertTriangle className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>Выберите хотя бы один симптом выше, чтобы получить памятку первой помощи.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onRequestEmergencyDispatch}
              className="py-3.5 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm transition-snappy flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Ambulance className="w-4 h-4 shrink-0" />
              <span>Вызвать бригаду за 30 минут</span>
            </button>
            <a
              href={`tel:${CLINIC_INFO.phoneRaw}`}
              className="py-3.5 px-5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-sm transition-snappy flex items-center justify-center gap-2 whitespace-nowrap tabular-nums"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>Позвонить: {CLINIC_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
