import React, { useEffect, useState } from 'react';

export interface SmartImageProps {
  src: string;
  alt: string;
  variant?: 'hero' | 'doctor' | 'pet' | 'avatar' | 'general';
  entityId?: string;
  fallbackSrc?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

const DOCTOR_LOCAL_JPG_MAP: Record<string, string> = {
  smirnov: '/images/doctors/smirnov.jpg',
  volkova: '/images/doctors/volkova.jpg',
  morozov: '/images/doctors/morozov.jpg',
  sokolova: '/images/doctors/sokolova.jpg',
  vasiliev: '/images/doctors/vasiliev.jpg',
  pavlova: '/images/doctors/pavlova.jpg',
  kuznetsov: '/images/doctors/kuznetsov.jpg',
  novikova: '/images/doctors/novikova.jpg',
  grigoriev: '/images/doctors/kuznetsov.jpg',
  belova: '/images/doctors/novikova.jpg',
};

const DOCTOR_REMOTE_UNSPLASH_MAP: Record<string, string> = {
  smirnov: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
  volkova: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80',
  morozov: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
  sokolova: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
  vasiliev: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
  pavlova: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=800&q=80',
  kuznetsov: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
  novikova: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80',
};

const PET_LOCAL_JPG_MAP: Record<string, string> = {
  t1: '/images/pets/t1.jpg',
  t2: '/images/pets/t2.jpg',
  t3: '/images/pets/t3.jpg',
  t4: '/images/pets/t4.jpg',
  t5: '/images/pets/t5.jpg',
  t6: '/images/pets/t6.jpg',
  t7: '/images/pets/t7.jpg',
  t8: '/images/pets/t8.jpg',
  t9: '/images/pets/t9.jpg',
  t10: '/images/pets/t10.jpg',
  t11: '/images/pets/t11.jpg',
  'golden-retriever': '/images/pets/t1.jpg',
  'scottish-fold': '/images/pets/t2.jpg',
  rabbit: '/images/pets/t3.jpg',
  corgi: '/images/pets/t4.jpg',
  husky: '/images/pets/t5.jpg',
  sphynx: '/images/pets/t6.jpg',
  ferret: '/images/pets/t8.jpg',
  shepherd: '/images/pets/t9.jpg',
  terrier: '/images/pets/t11.jpg',
  mainecoon: '/images/pets/t6.jpg',
};

const PET_REMOTE_UNSPLASH_MAP: Record<string, string> = {
  t1: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
  t2: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  t3: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
  t4: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
  t5: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
  t6: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
  t7: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80',
  t8: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
  t9: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  t10: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
  t11: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
};

const UNSPLASH_ID_TO_LOCAL_JPG: Record<string, string> = {
  'photo-1628009368231-7bb7cfcb0def': '/images/clinic/hero-clinic.jpg',
  'photo-1612349317150-e413f6a5b16d': '/images/doctors/smirnov.jpg',
  'photo-1594824476967-48c8b964273f': '/images/doctors/volkova.jpg',
  'photo-1537368910025-700350fe46c7': '/images/doctors/morozov.jpg',
  'photo-1559839734-2b71ea197ec2': '/images/doctors/sokolova.jpg',
  'photo-1622253692010-333f2da6031d': '/images/doctors/vasiliev.jpg',
  'photo-1651008376811-b90baee60c1f': '/images/doctors/pavlova.jpg',
  'photo-1582750433449-648ed127bb54': '/images/doctors/kuznetsov.jpg',
  'photo-1527613426441-4da17471b66d': '/images/doctors/novikova.jpg',
  'photo-1552053831-71594a27632d': '/images/pets/t1.jpg',
  'photo-1514888286974-6c03e2ca1dba': '/images/pets/t2.jpg',
  'photo-1585110396000-c9ffd4e4b308': '/images/pets/t3.jpg',
  'photo-1612536057832-2ff7ead58194': '/images/pets/t4.jpg',
  'photo-1583511655857-d19b40a7a54e': '/images/pets/t5.jpg',
  'photo-1533738363-b7f9aef128ce': '/images/pets/t6.jpg',
  'photo-1513360382564-850120167725': '/images/pets/t7.jpg',
  'photo-1513360371669-4adf3dd7dff8': '/images/pets/t7.jpg',
  'photo-1548767797-d8c844163c4c': '/images/pets/t8.jpg',
  'photo-1543466835-00a7907e9de1': '/images/pets/t9.jpg',
  'photo-1573865526739-10659fec78a5': '/images/pets/t10.jpg',
  'photo-1517849845537-4d257902454a': '/images/pets/t11.jpg',
  'photo-1548199973-03cce0bbc87b': '/images/pets/t1.jpg',
};

/**
 * Нормализует любой URL картинки (включая старые .svg заглушки или внешние ссылки Unsplash)
 * к локальной копии оригинальной фотографии (.jpg), чтобы всегда отображались те же самые
 * реальные фотографии без риска блокировки внешнего фотобанка.
 */
export function normalizeToOriginalPhotoSrc(
  rawSrc?: string,
  variant: 'hero' | 'doctor' | 'pet' | 'avatar' | 'general' = 'general',
  entityId?: string
): string {
  const cleanId = (entityId || '').trim().toLowerCase();

  if (variant === 'hero') {
    return '/images/clinic/hero-clinic.jpg';
  }

  if (cleanId) {
    if (variant === 'doctor' && DOCTOR_LOCAL_JPG_MAP[cleanId]) {
      return DOCTOR_LOCAL_JPG_MAP[cleanId];
    }
    if (variant === 'pet' && PET_LOCAL_JPG_MAP[cleanId]) {
      return PET_LOCAL_JPG_MAP[cleanId];
    }
  }

  const cleanSrc = (rawSrc || '').trim();
  if (!cleanSrc) {
    return getReliableFallback(variant, entityId);
  }

  // Если передана data:image/svg+xml аватарка с инициалами клиента/админа — оставляем как есть
  if (cleanSrc.startsWith('data:image/')) {
    return cleanSrc;
  }

  // Если это ссылка на Unsplash — проверяем, есть ли точная локальная .jpg копия этого фото
  for (const [photoKey, localJpg] of Object.entries(UNSPLASH_ID_TO_LOCAL_JPG)) {
    if (cleanSrc.includes(photoKey)) {
      return localJpg;
    }
  }

  // Если это старый путь к векторной .svg иллюстрации — заменяем на оригинальное фото .jpg
  if (cleanSrc.endsWith('.svg')) {
    if (cleanSrc.includes('hero-clinic')) {
      return '/images/clinic/hero-clinic.jpg';
    }
    const baseName = cleanSrc.split('/').pop()?.replace('.svg', '').toLowerCase() || '';
    if (DOCTOR_LOCAL_JPG_MAP[baseName]) {
      return DOCTOR_LOCAL_JPG_MAP[baseName];
    }
    if (PET_LOCAL_JPG_MAP[baseName]) {
      return PET_LOCAL_JPG_MAP[baseName];
    }
  }

  return cleanSrc;
}

export function getReliableFallback(
  variant: 'hero' | 'doctor' | 'pet' | 'avatar' | 'general' = 'general',
  entityId?: string,
  label = 'Лапа Помощи'
): string {
  const cleanId = (entityId || '').trim().toLowerCase();

  if (variant === 'hero') {
    return 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=80';
  }

  if (variant === 'doctor') {
    if (cleanId && DOCTOR_REMOTE_UNSPLASH_MAP[cleanId]) {
      return DOCTOR_REMOTE_UNSPLASH_MAP[cleanId];
    }
    return '/images/doctors/smirnov.jpg';
  }

  if (variant === 'pet') {
    if (cleanId && PET_REMOTE_UNSPLASH_MAP[cleanId]) {
      return PET_REMOTE_UNSPLASH_MAP[cleanId];
    }
    return '/images/pets/t1.jpg';
  }

  const cleanLabel = (label || 'ЛП').slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <rect width="160" height="160" rx="40" fill="#0D9488" />
    <text x="80" y="96" text-anchor="middle" font-family="Manrope, sans-serif" font-size="52" font-weight="800" fill="#FFFFFF">${cleanLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  variant = 'general',
  entityId,
  fallbackSrc,
  label,
  className = '',
  onClick,
  priority = false,
}) => {
  const normalizedPrimary = normalizeToOriginalPhotoSrc(src, variant, entityId);
  const fallback = fallbackSrc || getReliableFallback(variant, entityId, label || alt);
  const [currentSrc, setCurrentSrc] = useState<string>(normalizedPrimary);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(normalizeToOriginalPhotoSrc(src, variant, entityId));
    setHasError(false);
  }, [src, variant, entityId, fallback]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallback) {
      setHasError(true);
      setCurrentSrc(fallback);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      onClick={onClick}
      className={className}
    />
  );
};
