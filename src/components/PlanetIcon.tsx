import React from 'react';
import { PlanetType } from '../types';

interface PlanetIconProps {
  type: PlanetType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isAnswered?: boolean;
  className?: string;
}

export const PlanetIcon: React.FC<PlanetIconProps> = ({
  type,
  size = 'md',
  isAnswered = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const containerSize = sizeMap[size];

  // If already answered, we show a slight conquered/discovered holographic tint or badge
  return (
    <div className={`relative inline-flex items-center justify-center ${containerSize} ${className}`}>
      {/* Outer atmosphere glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isAnswered ? 'opacity-40 grayscale-[40%]' : 'opacity-80 group-hover:opacity-100'
        }`}
        style={{
          boxShadow: getPlanetGlow(type, isAnswered),
        }}
      />

      {/* SVG Planetary Graphics */}
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full relative z-10 transition-transform duration-500 ${
          isAnswered ? 'opacity-60 saturate-50' : 'group-hover:scale-110'
        }`}
      >
        <defs>
          {/* Radial gradients for each celestial body */}
          <radialGradient id="sun-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>

          <radialGradient id="mercury-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          <radialGradient id="venus-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          <radialGradient id="earth-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="35%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#091833" />
          </radialGradient>

          <radialGradient id="moon-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>

          <radialGradient id="mars-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="80%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>

          <radialGradient id="jupiter-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="30%" stopColor="#fb923c" />
            <stop offset="65%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>

          <radialGradient id="saturn-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="40%" stopColor="#fcd34d" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>

          <radialGradient id="uranus-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#cffafe" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>

          <radialGradient id="neptune-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="80%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </radialGradient>

          <radialGradient id="asteroid-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          <radialGradient id="supernova-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#f43f5e" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b0764" />
          </radialGradient>

          <radialGradient id="comet-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>

          <radialGradient id="blackhole-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="65%" stopColor="#090d16" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>
        </defs>

        {/* Planet sphere and specific features */}
        {renderPlanetGraphic(type)}
      </svg>
    </div>
  );
};

function renderPlanetGraphic(type: PlanetType) {
  switch (type) {
    case 'sun':
      return (
        <g>
          {/* Solar flare corona */}
          <circle cx="50" cy="50" r="46" fill="url(#sun-grad)" opacity="0.3" filter="blur(3px)" />
          <circle cx="50" cy="50" r="40" fill="url(#sun-grad)" />
          {/* Surface ripples */}
          <path
            d="M 25,45 Q 35,40 50,47 T 75,44"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
            fill="none"
          />
          <path
            d="M 30,58 Q 45,63 60,56 T 70,60"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            fill="none"
          />
        </g>
      );

    case 'mercury':
      return (
        <g>
          <circle cx="50" cy="50" r="38" fill="url(#mercury-grad)" />
          <circle cx="38" cy="40" r="5" fill="#475569" opacity="0.5" />
          <circle cx="62" cy="52" r="7" fill="#334155" opacity="0.4" />
          <circle cx="48" cy="65" r="4" fill="#334155" opacity="0.5" />
        </g>
      );

    case 'venus':
      return (
        <g>
          <circle cx="50" cy="50" r="39" fill="url(#venus-grad)" />
          {/* Cloud band swirls */}
          <path
            d="M 18,42 Q 40,35 60,45 T 82,40"
            stroke="#d97706"
            strokeWidth="3"
            opacity="0.4"
            fill="none"
          />
          <path
            d="M 16,56 Q 38,62 65,54 T 84,58"
            stroke="#b45309"
            strokeWidth="3.5"
            opacity="0.35"
            fill="none"
          />
        </g>
      );

    case 'earth':
      return (
        <g>
          <circle cx="50" cy="50" r="39" fill="url(#earth-grad)" />
          {/* Continents in green/emerald */}
          <path
            d="M 35,28 Q 45,22 48,32 Q 42,42 34,44 Q 30,36 35,28 Z"
            fill="#10b981"
            opacity="0.85"
          />
          <path
            d="M 52,38 Q 66,35 70,48 Q 62,60 55,56 Q 48,46 52,38 Z"
            fill="#059669"
            opacity="0.85"
          />
          <path
            d="M 32,54 Q 42,50 44,64 Q 38,72 32,70 Q 28,62 32,54 Z"
            fill="#34d399"
            opacity="0.75"
          />
          {/* Swirling white clouds */}
          <path
            d="M 20,40 Q 40,30 65,42 Q 78,48 80,45"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.45"
            fill="none"
          />
        </g>
      );

    case 'moon':
      return (
        <g>
          <circle cx="50" cy="50" r="38" fill="url(#moon-grad)" />
          <circle cx="42" cy="38" r="6" fill="#64748b" opacity="0.6" />
          <circle cx="60" cy="46" r="8" fill="#475569" opacity="0.5" />
          <circle cx="36" cy="62" r="5" fill="#475569" opacity="0.5" />
          <circle cx="56" cy="68" r="4" fill="#64748b" opacity="0.6" />
        </g>
      );

    case 'mars':
      return (
        <g>
          <circle cx="50" cy="50" r="38" fill="url(#mars-grad)" />
          {/* White polar cap */}
          <path d="M 38,15 Q 50,18 62,15 Q 50,12 38,15 Z" fill="#ffffff" opacity="0.8" />
          {/* Dark canyons and craters */}
          <path
            d="M 28,48 Q 45,44 65,52 Q 72,55 74,53"
            stroke="#7f1d1d"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <circle cx="40" cy="36" r="4" fill="#450a0a" opacity="0.4" />
        </g>
      );

    case 'jupiter':
      return (
        <g>
          <circle cx="50" cy="50" r="41" fill="url(#jupiter-grad)" />
          {/* Atmospheric cloud bands */}
          <path d="M 12,34 Q 50,30 88,34" stroke="#ea580c" strokeWidth="3" opacity="0.5" fill="none" />
          <path d="M 10,44 Q 50,42 90,44" stroke="#c2410c" strokeWidth="4.5" opacity="0.6" fill="none" />
          <path d="M 11,54 Q 50,56 89,54" stroke="#9a3412" strokeWidth="3.5" opacity="0.5" fill="none" />
          <path d="M 13,64 Q 50,62 87,64" stroke="#ea580c" strokeWidth="2.5" opacity="0.4" fill="none" />
          {/* Great Red Spot */}
          <ellipse cx="64" cy="56" rx="7" ry="4.5" fill="#dc2626" opacity="0.9" />
          <ellipse cx="64" cy="56" rx="4" ry="2.5" fill="#b91c1c" />
        </g>
      );

    case 'saturn':
      return (
        <g>
          {/* Back half of the ring */}
          <ellipse
            cx="50"
            cy="50"
            rx="46"
            ry="14"
            transform="rotate(-22 50 50)"
            stroke="#fde68a"
            strokeWidth="5"
            fill="none"
            opacity="0.6"
          />
          {/* Saturn body */}
          <circle cx="50" cy="50" r="34" fill="url(#saturn-grad)" />
          {/* Planet stripes */}
          <path d="M 22,46 Q 50,44 78,46" stroke="#b45309" strokeWidth="2.5" opacity="0.4" fill="none" />
          <path d="M 20,54 Q 50,52 80,54" stroke="#d97706" strokeWidth="2" opacity="0.4" fill="none" />
          {/* Front half of the ring */}
          <path
            d="M 10,65 A 46 14 0 0 0 90,35"
            transform="rotate(-22 50 50)"
            stroke="#fef08a"
            strokeWidth="5"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 6,65 A 49 16 0 0 0 94,35"
            transform="rotate(-22 50 50)"
            stroke="#f59e0b"
            strokeWidth="2"
            fill="none"
            opacity="0.75"
          />
        </g>
      );

    case 'uranus':
      return (
        <g>
          {/* Faint vertical rings */}
          <ellipse cx="50" cy="50" rx="43" ry="12" transform="rotate(78 50 50)" stroke="#67e8f9" strokeWidth="2.5" fill="none" opacity="0.5" />
          <circle cx="50" cy="50" r="37" fill="url(#uranus-grad)" />
          <path d="M 25,48 Q 50,50 75,48" stroke="#0891b2" strokeWidth="2" opacity="0.3" fill="none" />
        </g>
      );

    case 'neptune':
      return (
        <g>
          <circle cx="50" cy="50" r="38" fill="url(#neptune-grad)" />
          {/* Dark spot storm & white methane clouds */}
          <ellipse cx="62" cy="42" rx="6" ry="4" fill="#0f172a" opacity="0.7" />
          <path d="M 18,36 Q 42,32 68,38 T 82,34" stroke="#60a5fa" strokeWidth="2" opacity="0.5" fill="none" />
          <path d="M 22,62 Q 52,66 78,58" stroke="#93c5fd" strokeWidth="2.5" opacity="0.6" fill="none" />
        </g>
      );

    case 'asteroid':
      return (
        <g>
          <polygon
            points="50,14 74,26 84,52 68,78 44,84 20,72 16,42 32,20"
            fill="url(#asteroid-grad)"
          />
          <circle cx="42" cy="38" r="5" fill="#334155" opacity="0.6" />
          <circle cx="62" cy="55" r="7" fill="#1e293b" opacity="0.5" />
          <circle cx="36" cy="65" r="4" fill="#1e293b" opacity="0.7" />
        </g>
      );

    case 'comet':
      return (
        <g>
          {/* Comet dust tail */}
          <path
            d="M 20,78 L 48,54 L 75,28 L 54,48 Z"
            fill="url(#comet-grad)"
            opacity="0.5"
            filter="blur(1px)"
          />
          <circle cx="66" cy="34" r="14" fill="url(#comet-grad)" />
          <circle cx="66" cy="34" r="7" fill="#ffffff" />
        </g>
      );

    case 'supernova':
      return (
        <g>
          {/* Supernova starburst spikes */}
          <polygon
            points="50,10 56,38 84,20 62,44 90,50 62,56 84,80 56,62 50,90 44,62 16,80 38,56 10,50 38,44 16,20 44,38"
            fill="url(#supernova-grad)"
            opacity="0.85"
          />
          <circle cx="50" cy="50" r="16" fill="#ffffff" />
        </g>
      );

    case 'blackhole':
      return (
        <g>
          {/* Swirling glowing accretion disk */}
          <ellipse cx="50" cy="50" rx="46" ry="16" transform="rotate(-15 50 50)" stroke="#f59e0b" strokeWidth="5" fill="none" opacity="0.8" filter="blur(1px)" />
          <ellipse cx="50" cy="50" rx="40" ry="12" transform="rotate(-15 50 50)" stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.9" />
          {/* Event Horizon Void */}
          <circle cx="50" cy="50" r="22" fill="#000000" />
          <circle cx="50" cy="50" r="24" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.7" />
        </g>
      );

    default:
      return <circle cx="50" cy="50" r="38" fill="url(#earth-grad)" />;
  }
}

function getPlanetGlow(type: PlanetType, isAnswered: boolean): string {
  if (isAnswered) return '0 0 10px rgba(100, 116, 139, 0.4)';
  switch (type) {
    case 'sun':
      return '0 0 35px rgba(249, 115, 22, 0.7)';
    case 'mercury':
      return '0 0 20px rgba(148, 163, 184, 0.5)';
    case 'venus':
      return '0 0 25px rgba(245, 158, 11, 0.6)';
    case 'earth':
      return '0 0 25px rgba(14, 165, 233, 0.7)';
    case 'moon':
      return '0 0 20px rgba(226, 232, 240, 0.5)';
    case 'mars':
      return '0 0 25px rgba(239, 68, 68, 0.7)';
    case 'jupiter':
      return '0 0 30px rgba(234, 88, 12, 0.6)';
    case 'saturn':
      return '0 0 30px rgba(251, 191, 36, 0.6)';
    case 'uranus':
      return '0 0 25px rgba(34, 211, 238, 0.6)';
    case 'neptune':
      return '0 0 25px rgba(59, 130, 246, 0.7)';
    case 'asteroid':
      return '0 0 18px rgba(100, 116, 139, 0.5)';
    case 'comet':
      return '0 0 28px rgba(56, 189, 248, 0.8)';
    case 'supernova':
      return '0 0 40px rgba(192, 38, 211, 0.8)';
    case 'blackhole':
      return '0 0 35px rgba(245, 158, 11, 0.8)';
    default:
      return '0 0 25px rgba(56, 189, 248, 0.5)';
  }
}
