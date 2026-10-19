import React, { useEffect, useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  variant: 'hero' | 'doctor' | 'pet';
  label?: string;
  sublabel?: string;
  className?: string;
}

function buildFallbackDataUri(
  variant: 'hero' | 'doctor' | 'pet',
  label: string,
  sublabel: string
): string {
  const safeLabel = label.replace(/[<>&"']/g, '');
  const safeSublabel = sublabel.replace(/[<>&"']/g, '');

  if (variant === 'hero') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E6F4F1" />
          <stop offset="55%" stop-color="#D1EAE4" />
          <stop offset="100%" stop-color="#B8E1D8" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0D9488" />
          <stop offset="100%" stop-color="#0F766E" />
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="url(#bg)" />
      <circle cx="960" cy="180" r="220" fill="#FFFFFF" fill-opacity="0.45" />
      <circle cx="240" cy="600" r="260" fill="#0D9488" fill-opacity="0.08" />
      <!-- Architectural clinic window frame -->
      <rect x="80" y="70" width="1040" height="610" rx="32" fill="#FFFFFF" fill-opacity="0.72" stroke="#FFFFFF" stroke-width="3" />
      <!-- Medical Cross Badge -->
      <rect x="140" y="125" width="76" height="76" rx="20" fill="url(#accent)" />
      <path d="M178 145v36M160 163h36" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" />
      <text x="240" y="158" font-family="Manrope, sans-serif" font-size="24" font-weight="700" fill="#0F2922">${safeLabel}</text>
      <text x="240" y="188" font-family="Manrope, sans-serif" font-size="17" font-weight="500" fill="#335249">${safeSublabel}</text>
      <!-- Stylized friendly dog & cat veterinary illustration -->
      <g transform="translate(360, 220)">
        <ellipse cx="240" cy="340" rx="250" ry="28" fill="#0D9488" fill-opacity="0.14" />
        <!-- Golden Retriever silhouette -->
        <path d="M110 320 C110 210 155 150 215 150 C275 150 315 210 315 320 Z" fill="#F59E0B" fill-opacity="0.88" />
        <circle cx="215" cy="115" r="64" fill="#FBBF24" />
        <path d="M152 85 C130 110 135 150 158 155 Z" fill="#D97706" />
        <path d="M278 85 C300 110 295 150 272 155 Z" fill="#D97706" />
        <circle cx="195" cy="105" r="7" fill="#0F2922" />
        <circle cx="235" cy="105" r="7" fill="#0F2922" />
        <ellipse cx="215" cy="126" rx="13" ry="9" fill="#0F2922" />
        <!-- Cat silhouette -->
        <path d="M310 320 C310 240 345 195 390 195 C435 195 465 240 465 320 Z" fill="#0D9488" fill-opacity="0.85" />
        <circle cx="390" cy="165" r="46" fill="#14B8A6" />
        <polygon points="352,138 362,102 384,128" fill="#0F766E" />
        <polygon points="428,138 418,102 396,128" fill="#0F766E" />
        <circle cx="375" cy="160" r="5.5" fill="#FFFFFF" />
        <circle cx="405" cy="160" r="5.5" fill="#FFFFFF" />
      </g>
      <rect x="140" y="575" width="920" height="60" rx="16" fill="#F4FAF8" stroke="#D1EAE4" stroke-width="1.5" />
      <text x="175" y="612" font-family="Manrope, sans-serif" font-size="18" font-weight="600" fill="#0F2922">Стационар 24/7 · Собственная ПЦР-лаборатория · Выезд на дом за 30 минут</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (variant === 'doctor') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
      <defs>
        <linearGradient id="docBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E6F4F1" />
          <stop offset="100%" stop-color="#CBEAE3" />
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#docBg)" />
      <circle cx="300" cy="260" r="170" fill="#FFFFFF" fill-opacity="0.6" />
      <!-- Doctor avatar silhouette in teal scrubs -->
      <path d="M130 650 C130 490 205 430 300 430 C395 430 470 490 470 650 Z" fill="#0D9488" />
      <path d="M250 430 L300 510 L350 430 Z" fill="#FFFFFF" />
      <circle cx="300" cy="265" r="95" fill="#FDE68A" />
      <!-- Stethoscope -->
      <path d="M235 445 C235 520 365 520 365 445" fill="none" stroke="#0F2922" stroke-width="8" stroke-linecap="round" />
      <circle cx="345" cy="515" r="14" fill="#F97316" stroke="#FFFFFF" stroke-width="4" />
      <rect x="40" y="625" width="520" height="90" rx="18" fill="#FFFFFF" fill-opacity="0.92" />
      <text x="300" y="665" text-anchor="middle" font-family="Manrope, sans-serif" font-size="21" font-weight="700" fill="#0F2922">${safeLabel}</text>
      <text x="300" y="695" text-anchor="middle" font-family="Manrope, sans-serif" font-size="16" font-weight="500" fill="#335249">${safeSublabel}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <rect width="400" height="400" rx="40" fill="#E6F4F1" />
    <circle cx="200" cy="175" r="95" fill="#FFFFFF" fill-opacity="0.8" />
    <!-- Paw print icon -->
    <ellipse cx="200" cy="200" rx="34" ry="28" fill="#0D9488" />
    <circle cx="158" cy="155" r="14" fill="#0D9488" />
    <circle cx="185" cy="140" r="14" fill="#0D9488" />
    <circle cx="215" cy="140" r="14" fill="#0D9488" />
    <circle cx="242" cy="155" r="14" fill="#0D9488" />
    <text x="200" y="325" text-anchor="middle" font-family="Manrope, sans-serif" font-size="22" font-weight="700" fill="#0F2922">${safeLabel}</text>
    <text x="200" y="355" text-anchor="middle" font-family="Manrope, sans-serif" font-size="15" font-weight="500" fill="#335249">${safeSublabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  variant,
  label = 'Лапа Помощи',
  sublabel = 'Ветеринарный центр 24/7',
  className = '',
}) => {
  const fallbackUri = buildFallbackDataUri(variant, label, sublabel);
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src);
    setLoaded(false);

    const timer = window.setTimeout(() => {
      setLoaded((currentLoaded) => {
        if (!currentLoaded) {
          setImgSrc(fallbackUri);
        }
        return currentLoaded;
      });
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [src, fallbackUri]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (imgSrc !== fallbackUri) {
          setImgSrc(fallbackUri);
        }
      }}
      className={className}
    />
  );
};
