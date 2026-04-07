'use client';

interface CreatureProps {
  state: 'idle' | 'talking' | 'celebrating' | 'thinking' | 'sleeping';
  color: string;
  size?: number;
}

// Cute kawaii-style dragon
export function DragonCreature({ state, color, size = 64 }: CreatureProps) {
  const eyeState = state === 'sleeping' ? 'closed' : state === 'celebrating' ? 'happy' : 'open';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="creature-svg">
      {/* Body */}
      <ellipse cx="50" cy="58" rx="28" ry="24" fill={color} opacity={0.9}>
        <animate attributeName="ry" values="24;25;24" dur="2s" repeatCount="indefinite" />
      </ellipse>
      {/* Belly */}
      <ellipse cx="50" cy="62" rx="18" ry="14" fill="white" opacity={0.3} />
      {/* Head */}
      <circle cx="50" cy="38" r="22" fill={color}>
        <animate attributeName="cy" values="38;36;38" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Horns */}
      <path d="M35 22 L30 10 L38 20" fill={color} opacity={0.7} />
      <path d="M65 22 L70 10 L62 20" fill={color} opacity={0.7} />
      {/* Eyes */}
      {eyeState === 'open' && (
        <>
          <circle cx="42" cy="36" r="5" fill="white" />
          <circle cx="58" cy="36" r="5" fill="white" />
          <circle cx="43" cy="35" r="2.5" fill="#1a1a2e">
            <animate attributeName="cx" values="43;44;43;42;43" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="59" cy="35" r="2.5" fill="#1a1a2e">
            <animate attributeName="cx" values="59;60;59;58;59" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Eye shine */}
          <circle cx="44" cy="34" r="1" fill="white" opacity={0.8} />
          <circle cx="60" cy="34" r="1" fill="white" opacity={0.8} />
        </>
      )}
      {eyeState === 'closed' && (
        <>
          <path d="M38 36 Q42 39 46 36" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
          <path d="M54 36 Q58 39 62 36" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
        </>
      )}
      {eyeState === 'happy' && (
        <>
          <path d="M38 36 Q42 32 46 36" stroke="#1a1a2e" strokeWidth="2" fill="none" />
          <path d="M54 36 Q58 32 62 36" stroke="#1a1a2e" strokeWidth="2" fill="none" />
        </>
      )}
      {/* Mouth */}
      {state === 'talking' ? (
        <ellipse cx="50" cy="46" rx="4" ry="3" fill="#1a1a2e">
          <animate attributeName="ry" values="3;5;3;2;3" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      ) : state === 'celebrating' ? (
        <path d="M44 44 Q50 50 56 44" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
      ) : (
        <path d="M46 45 Q50 48 54 45" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
      )}
      {/* Tail */}
      <path d="M75 60 Q85 50 80 40" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M75 60 Q85 50 80 40;M75 60 Q90 55 85 42;M75 60 Q85 50 80 40" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Thinking bubbles */}
      {state === 'thinking' && (
        <>
          <circle cx="75" cy="24" r="3" fill={color} opacity={0.4}>
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="16" r="2" fill={color} opacity={0.3}>
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <circle cx="83" cy="10" r="1.5" fill={color} opacity={0.2}>
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1s" repeatCount="indefinite" begin="0.6s" />
          </circle>
        </>
      )}
      {/* Celebration sparkles */}
      {state === 'celebrating' && (
        <>
          <circle cx="25" cy="20" r="2" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;3;1" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="75" cy="18" r="2" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="r" values="1;3;1" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="50" cy="10" r="2" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="r" values="1;3;1" dur="0.6s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </>
      )}
      {/* Sleep Zzz */}
      {state === 'sleeping' && (
        <text x="65" y="25" fontSize="12" fill={color} opacity={0.6} fontWeight="bold">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y" values="25;20;25" dur="2s" repeatCount="indefinite" />
          z
        </text>
      )}
    </svg>
  );
}

// Cute kawaii-style fox
export function FoxCreature({ state, color, size = 64 }: CreatureProps) {
  const eyeState = state === 'sleeping' ? 'closed' : state === 'celebrating' ? 'happy' : 'open';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="creature-svg">
      {/* Body */}
      <ellipse cx="50" cy="62" rx="24" ry="20" fill={color} opacity={0.9}>
        <animate attributeName="ry" values="20;21;20" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="50" cy="66" rx="16" ry="12" fill="white" opacity={0.3} />
      {/* Tail */}
      <path d="M25 58 Q10 45 18 35" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M25 58 Q10 45 18 35;M25 58 Q8 42 15 30;M25 58 Q10 45 18 35" dur="2s" repeatCount="indefinite" />
      </path>
      <circle cx="18" cy="35" r="4" fill="white" opacity={0.8}>
        <animate attributeName="cy" values="35;30;35" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Head */}
      <circle cx="50" cy="40" r="20" fill={color}>
        <animate attributeName="cy" values="40;38;40" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Ears */}
      <polygon points="32,28 28,8 42,22" fill={color} />
      <polygon points="68,28 72,8 58,22" fill={color} />
      <polygon points="34,26 31,14 40,23" fill="#1a1a2e" opacity={0.15} />
      <polygon points="66,26 69,14 60,23" fill="#1a1a2e" opacity={0.15} />
      {/* Face white */}
      <path d="M35 38 Q50 55 65 38" fill="white" opacity={0.4} />
      {/* Eyes */}
      {eyeState === 'open' && (
        <>
          <circle cx="42" cy="38" r="4" fill="white" />
          <circle cx="58" cy="38" r="4" fill="white" />
          <circle cx="43" cy="37" r="2" fill="#1a1a2e" />
          <circle cx="59" cy="37" r="2" fill="#1a1a2e" />
          <circle cx="44" cy="36" r="0.8" fill="white" opacity={0.8} />
          <circle cx="60" cy="36" r="0.8" fill="white" opacity={0.8} />
        </>
      )}
      {eyeState === 'closed' && (
        <>
          <path d="M39 38 Q42 41 45 38" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
          <path d="M55 38 Q58 41 61 38" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
        </>
      )}
      {eyeState === 'happy' && (
        <>
          <path d="M39 38 Q42 34 45 38" stroke="#1a1a2e" strokeWidth="2" fill="none" />
          <path d="M55 38 Q58 34 61 38" stroke="#1a1a2e" strokeWidth="2" fill="none" />
        </>
      )}
      {/* Nose */}
      <circle cx="50" cy="43" r="2" fill="#1a1a2e" />
      {/* Mouth */}
      {state === 'talking' ? (
        <ellipse cx="50" cy="47" rx="3" ry="2.5" fill="#1a1a2e">
          <animate attributeName="ry" values="2.5;4;2.5" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <path d="M47 46 Q50 49 53 46" stroke="#1a1a2e" strokeWidth="1" fill="none" />
      )}
      {state === 'thinking' && (
        <>
          <circle cx="75" cy="26" r="3" fill={color} opacity={0.4}>
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="18" r="2" fill={color} opacity={0.3}>
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" begin="0.3s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {state === 'celebrating' && (
        <>
          <circle cx="25" cy="22" r="2" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="75" cy="20" r="2" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="12" r="2" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {state === 'sleeping' && (
        <text x="65" y="28" fontSize="12" fill={color} opacity={0.6} fontWeight="bold">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          z
        </text>
      )}
    </svg>
  );
}

// Simple creature renderer by type
export function CreatureSVG({ type, ...props }: CreatureProps & { type: string }) {
  switch (type) {
    case 'dragon':
    case 'tanuki':
    case 'panda':
    case 'penguin':
      return <DragonCreature {...props} />;
    case 'fox':
    case 'cat':
    case 'owl':
    case 'rabbit':
      return <FoxCreature {...props} />;
    default:
      return <DragonCreature {...props} />;
  }
}
