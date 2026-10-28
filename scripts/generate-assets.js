import fs from 'fs';
import path from 'path';

const doctors = [
  {
    id: 'smirnov',
    name: 'Смирнов Алексей Викторович',
    role: 'Главный врач · Хирург-ортопед',
    bgStart: '#0D9488',
    bgEnd: '#0F766E',
    scrubColor: '#0D9488',
    gender: 'm',
    hairColor: '#334155',
    stethColor: '#F59E0B',
    accentSymbol: 'cross'
  },
  {
    id: 'volkova',
    name: 'Волкова Елена Сергеевна',
    role: 'Ведущий терапевт · Кардиолог',
    bgStart: '#0284C7',
    bgEnd: '#0369A1',
    scrubColor: '#0284C7',
    gender: 'f',
    hairColor: '#78350F',
    stethColor: '#EF4444',
    accentSymbol: 'heart'
  },
  {
    id: 'morozov',
    name: 'Морозов Дмитрий Игоревич',
    role: 'Врач УЗ-диагностики · Реаниматолог',
    bgStart: '#4F46E5',
    bgEnd: '#3730A3',
    scrubColor: '#4F46E5',
    gender: 'm',
    hairColor: '#1E293B',
    stethColor: '#10B981',
    accentSymbol: 'ultrasound'
  },
  {
    id: 'sokolova',
    name: 'Соколова Анна Павловна',
    role: 'Врач-ратолог · Стоматолог',
    bgStart: '#D97706',
    bgEnd: '#B45309',
    scrubColor: '#D97706',
    gender: 'f',
    hairColor: '#B45309',
    stethColor: '#3B82F6',
    accentSymbol: 'rabbit'
  },
  {
    id: 'vasiliev',
    name: 'Васильев Михаил Юрьевич',
    role: 'Хирург-травматолог · Нейрохирург',
    bgStart: '#059669',
    bgEnd: '#047857',
    scrubColor: '#059669',
    gender: 'm',
    hairColor: '#475569',
    stethColor: '#F59E0B',
    accentSymbol: 'ortho'
  },
  {
    id: 'pavlova',
    name: 'Павлова Ирина Николаевна',
    role: 'Терапевт · Эндокринолог',
    bgStart: '#7C3AED',
    bgEnd: '#6D28D9',
    scrubColor: '#7C3AED',
    gender: 'f',
    hairColor: '#1E1B4B',
    stethColor: '#10B981',
    accentSymbol: 'flask'
  },
  {
    id: 'grigoriev',
    name: 'Григорьев Роман Александрович',
    role: 'Офтальмолог · Микрохирург',
    bgStart: '#0891B2',
    bgEnd: '#0E7490',
    scrubColor: '#0891B2',
    gender: 'm',
    hairColor: '#334155',
    stethColor: '#F43F5E',
    accentSymbol: 'eye'
  },
  {
    id: 'belova',
    name: 'Белова Мария Викторовна',
    role: 'Дерматолог · Аллерголог',
    bgStart: '#DB2777',
    bgEnd: '#BE185D',
    scrubColor: '#DB2777',
    gender: 'f',
    hairColor: '#92400E',
    stethColor: '#10B981',
    accentSymbol: 'microscope'
  }
];

function generateDoctorSvg(doc) {
  const isFemale = doc.gender === 'f';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <linearGradient id="bg_${doc.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4" />
      <stop offset="50%" stop-color="#E6F4F1" />
      <stop offset="100%" stop-color="#CCEBE4" />
    </linearGradient>
    <linearGradient id="scrub_${doc.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${doc.bgStart}" />
      <stop offset="100%" stop-color="${doc.bgEnd}" />
    </linearGradient>
    <filter id="shadow_${doc.id}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0F2922" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="600" height="700" fill="url(#bg_${doc.id})" />
  
  <!-- Architectural Halo -->
  <circle cx="300" cy="280" r="190" fill="#FFFFFF" fill-opacity="0.8" />
  <circle cx="300" cy="280" r="215" fill="none" stroke="${doc.bgStart}" stroke-opacity="0.2" stroke-width="3" stroke-dasharray="8 6" />

  <!-- Doctor Body / Medical Scrubs -->
  <g filter="url(#shadow_${doc.id})">
    <path d="M 120 620 C 120 440, 180 390, 300 390 C 420 390, 480 440, 480 620 Z" fill="url(#scrub_${doc.id})" />
    <!-- V-Neck -->
    <polygon points="260,390 300,470 340,390" fill="#FFFFFF" />
    <!-- Stethoscope -->
    <path d="M 235 410 C 235 520, 365 520, 365 410" fill="none" stroke="#1E293B" stroke-width="10" stroke-linecap="round" />
    <circle cx="345" cy="510" r="16" fill="${doc.stethColor}" stroke="#FFFFFF" stroke-width="4" />
  </g>

  <!-- Doctor Head -->
  <g>
    <!-- Neck -->
    <rect x="268" y="320" width="64" height="85" rx="12" fill="#FED7AA" />
    <!-- Face -->
    <ellipse cx="300" cy="270" rx="82" ry="96" fill="#FED7AA" />
    
    <!-- Hair -->
    ${
      isFemale
        ? `<path d="M 205 270 C 200 170, 240 140, 300 140 C 360 140, 400 170, 395 270 C 390 340, 410 390, 385 410 C 370 340, 375 220, 300 220 C 225 220, 230 340, 215 410 C 190 390, 210 340, 205 270 Z" fill="${doc.hairColor}" />
           <path d="M 215 220 Q 300 160 385 220" fill="${doc.hairColor}" />`
        : `<path d="M 210 240 C 205 160, 245 140, 300 140 C 355 140, 395 160, 390 240 C 385 210, 365 190, 300 190 C 235 190, 215 210, 210 240 Z" fill="${doc.hairColor}" />`
    }

    <!-- Eyes -->
    <ellipse cx="268" cy="265" rx="7" ry="6" fill="#0F2922" />
    <circle cx="270" cy="263" r="2" fill="#FFFFFF" />
    <ellipse cx="332" cy="265" rx="7" ry="6" fill="#0F2922" />
    <circle cx="334" cy="263" r="2" fill="#FFFFFF" />

    <!-- Eyebrows -->
    <path d="M 252 248 Q 268 240 284 248" fill="none" stroke="${doc.hairColor}" stroke-width="4" stroke-linecap="round" />
    <path d="M 316 248 Q 332 240 348 248" fill="none" stroke="${doc.hairColor}" stroke-width="4" stroke-linecap="round" />

    <!-- Nose & Warm Smile -->
    <path d="M 300 270 L 296 288 L 304 288" fill="none" stroke="#EA580C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 284 312 Q 300 326 316 312" fill="none" stroke="#9A3412" stroke-width="4" stroke-linecap="round" />
    
    <!-- Blush -->
    <circle cx="245" cy="295" r="14" fill="#F43F5E" fill-opacity="0.15" />
    <circle cx="355" cy="295" r="14" fill="#F43F5E" fill-opacity="0.15" />
  </g>

  <!-- Doctor Medical Badge -->
  <g transform="translate(160, 480)">
    <rect width="90" height="55" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
    <rect x="10" y="10" width="70" height="8" rx="4" fill="${doc.bgStart}" />
    <rect x="10" y="24" width="45" height="6" rx="3" fill="#64748B" />
    <rect x="10" y="36" width="30" height="5" rx="2" fill="#94A3B8" />
  </g>

  <!-- Name Plaque at Bottom -->
  <g transform="translate(40, 580)">
    <rect width="520" height="86" rx="20" fill="#FFFFFF" fill-opacity="0.95" stroke="#D1EAE4" stroke-width="2" filter="url(#shadow_${doc.id})" />
    <circle cx="48" cy="43" r="22" fill="${doc.bgStart}" />
    <path d="M 48 31 V 55 M 36 43 H 60" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <text x="86" y="38" font-family="Manrope, system-ui, sans-serif" font-size="18" font-weight="800" fill="#0F2922">${doc.name}</text>
    <text x="86" y="62" font-family="Manrope, system-ui, sans-serif" font-size="14" font-weight="600" fill="${doc.bgStart}">${doc.role}</text>
  </g>
</svg>`;
}

const pets = [
  {
    id: 'golden-retriever',
    name: 'Ричард',
    breed: 'Золотистый ретривер',
    bg: '#FEF3C7',
    color: '#F59E0B',
    accent: '#D97706',
    species: 'dog'
  },
  {
    id: 'scottish-fold',
    name: 'Марсель',
    breed: 'Шотландский вислоухий',
    bg: '#E0F2FE',
    color: '#64748B',
    accent: '#475569',
    species: 'cat'
  },
  {
    id: 'rabbit',
    name: 'Пончик',
    breed: 'Карликовый кролик',
    bg: '#FCE7F3',
    color: '#F472B6',
    accent: '#DB2777',
    species: 'rabbit'
  },
  {
    id: 'corgi',
    name: 'Барни',
    breed: 'Вельш-корги',
    bg: '#FFEDD5',
    color: '#EA580C',
    accent: '#C2410C',
    species: 'dog'
  },
  {
    id: 'husky',
    name: 'Норд',
    breed: 'Сибирский хаски',
    bg: '#E2E8F0',
    color: '#334155',
    accent: '#0284C7',
    species: 'husky'
  },
  {
    id: 'sphynx',
    name: 'Клеопатра',
    breed: 'Канадский сфинкс',
    bg: '#EDE9FE',
    color: '#A855F7',
    accent: '#7E22CE',
    species: 'sphynx'
  },
  {
    id: 'ferret',
    name: 'Тимоти',
    breed: 'Домашний хорек',
    bg: '#FEF08A',
    color: '#CA8A04',
    accent: '#854D0E',
    species: 'ferret'
  },
  {
    id: 'shepherd',
    name: 'Граф',
    breed: 'Немецкая овчарка',
    bg: '#D1FAE5',
    color: '#15803D',
    accent: '#166534',
    species: 'dog'
  },
  {
    id: 'terrier',
    name: 'Майло',
    breed: 'Джек-рассел терьер',
    bg: '#CCFBF1',
    color: '#0D9488',
    accent: '#0F766E',
    species: 'dog'
  },
  {
    id: 'mainecoon',
    name: 'Аврора',
    breed: 'Мейн-кун',
    bg: '#F3E8FF',
    color: '#8B5CF6',
    accent: '#6D28D9',
    species: 'cat'
  }
];

function generatePetSvg(pet) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="petBg_${pet.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="${pet.bg}" />
      <stop offset="100%" stop-color="${pet.bg}" stop-opacity="0.8" />
    </radialGradient>
  </defs>

  <!-- Circular Base -->
  <rect width="400" height="400" rx="48" fill="url(#petBg_${pet.id})" />
  <circle cx="200" cy="180" r="130" fill="#FFFFFF" fill-opacity="0.6" />

  <!-- Animal Silhouette / Illustration -->
  ${
    pet.species === 'cat'
      ? `<g transform="translate(100, 70)">
           <path d="M 30 200 C 30 110, 70 80, 100 80 C 130 80, 170 110, 170 200 Z" fill="${pet.color}" />
           <circle cx="100" cy="80" r="56" fill="${pet.color}" />
           <!-- Cat Ears -->
           <polygon points="50,60 65,15 90,45" fill="${pet.accent}" />
           <polygon points="150,60 135,15 110,45" fill="${pet.accent}" />
           <!-- Eyes -->
           <ellipse cx="80" cy="76" rx="8" ry="10" fill="#10B981" />
           <ellipse cx="120" cy="76" rx="8" ry="10" fill="#10B981" />
           <ellipse cx="80" cy="76" rx="3" ry="8" fill="#0F2922" />
           <ellipse cx="120" cy="76" rx="3" ry="8" fill="#0F2922" />
           <!-- Nose & Whiskers -->
           <polygon points="100,90 94,84 106,84" fill="#F43F5E" />
           <line x1="50" y1="88" x2="85" y2="90" stroke="#FFFFFF" stroke-width="2" />
           <line x1="50" y1="96" x2="85" y2="94" stroke="#FFFFFF" stroke-width="2" />
           <line x1="150" y1="88" x2="115" y2="90" stroke="#FFFFFF" stroke-width="2" />
           <line x1="150" y1="96" x2="115" y2="94" stroke="#FFFFFF" stroke-width="2" />
         </g>`
      : pet.species === 'rabbit'
      ? `<g transform="translate(100, 50)">
           <path d="M 40 220 C 40 130, 70 100, 100 100 C 130 100, 160 130, 160 220 Z" fill="${pet.color}" />
           <circle cx="100" cy="110" r="50" fill="${pet.color}" />
           <!-- Long Bunny Ears -->
           <ellipse cx="75" cy="40" rx="16" ry="50" fill="${pet.color}" />
           <ellipse cx="75" cy="40" rx="9" ry="38" fill="#FBCFE8" />
           <ellipse cx="125" cy="40" rx="16" ry="50" fill="${pet.color}" />
           <ellipse cx="125" cy="40" rx="9" ry="38" fill="#FBCFE8" />
           <!-- Face -->
           <circle cx="82" cy="105" r="6" fill="#1E293B" />
           <circle cx="118" cy="105" r="6" fill="#1E293B" />
           <ellipse cx="100" cy="116" rx="6" ry="4" fill="#F43F5E" />
         </g>`
      : `<g transform="translate(90, 70)">
           <path d="M 30 210 C 30 110, 70 80, 110 80 C 150 80, 190 110, 190 210 Z" fill="${pet.color}" />
           <circle cx="110" cy="85" r="58" fill="${pet.color}" />
           <!-- Dog Ears Flopping -->
           <path d="M 55 70 C 40 90, 45 130, 65 140 Z" fill="${pet.accent}" />
           <path d="M 165 70 C 180 90, 175 130, 155 140 Z" fill="${pet.accent}" />
           <!-- Dog Snout -->
           <ellipse cx="110" cy="102" rx="32" ry="22" fill="#FEF3C7" />
           <ellipse cx="110" cy="94" rx="14" ry="10" fill="#1E293B" />
           <circle cx="90" cy="74" r="7" fill="#1E293B" />
           <circle cx="92" cy="72" r="2.5" fill="#FFFFFF" />
           <circle cx="130" cy="74" r="7" fill="#1E293B" />
           <circle cx="132" cy="72" r="2.5" fill="#FFFFFF" />
           <path d="M 98 108 Q 110 120 122 108" fill="none" stroke="#1E293B" stroke-width="3" stroke-linecap="round" />
           <path d="M 104 114 C 104 126, 116 126, 116 114 Z" fill="#F43F5E" />
         </g>`
  }

  <!-- Bottom Badge with Name & Breed -->
  <g transform="translate(30, 310)">
    <rect width="340" height="66" rx="18" fill="#FFFFFF" fill-opacity="0.95" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="170" y="32" text-anchor="middle" font-family="Manrope, system-ui, sans-serif" font-size="18" font-weight="800" fill="#0F2922">${pet.name}</text>
    <text x="170" y="52" text-anchor="middle" font-family="Manrope, system-ui, sans-serif" font-size="13" font-weight="600" fill="${pet.accent}">${pet.breed}</text>
  </g>
</svg>`;
}

// Generate all doctors
doctors.forEach(doc => {
  const filePath = path.resolve(`public/images/doctors/${doc.id}.svg`);
  fs.writeFileSync(filePath, generateDoctorSvg(doc), 'utf8');
  console.log('Generated:', filePath);
});

// Also write a default doctor svg
fs.writeFileSync(path.resolve('public/images/doctors/default-doctor.svg'), generateDoctorSvg(doctors[0]), 'utf8');

// Generate all pets
pets.forEach(pet => {
  const filePath = path.resolve(`public/images/pets/${pet.id}.svg`);
  fs.writeFileSync(filePath, generatePetSvg(pet), 'utf8');
  console.log('Generated:', filePath);
});

// Also write default pet svg
fs.writeFileSync(path.resolve('public/images/pets/default-pet.svg'), generatePetSvg(pets[0]), 'utf8');

console.log('Asset generation finished successfully!');
