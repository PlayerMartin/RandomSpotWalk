import type { ReactNode } from 'react';

/*
 * Single stroke-based icon family (1.75px rounded strokes, currentColor),
 * replacing the previous emoji glyphs.
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function Svg({
  children,
  size = 20,
  className,
  strokeWidth = 1.75,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Crosshair — "Generate a spot" */
export function IconTarget({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 1.25v3.05M12 19.7v3.05M1.25 12h3.05M19.7 12h3.05" />
    </Svg>
  );
}

/** Walking person — "Start walk" (filled, from SVG Repo) */
export function IconWalk({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M13 6C14.1046 6 15 5.10457 15 4C15 2.89543 14.1046 2 13 2C11.8955 2 11 2.89543 11 4C11 5.10457 11.8955 6 13 6ZM11.0528 6.60557C11.3841 6.43992 11.7799 6.47097 12.0813 6.68627L13.0813 7.40056C13.3994 7.6278 13.5559 8.01959 13.482 8.40348L12.4332 13.847L16.8321 20.4453C17.1384 20.9048 17.0143 21.5257 16.5547 21.8321C16.0952 22.1384 15.4743 22.0142 15.168 21.5547L10.5416 14.6152L9.72611 13.3919C9.58336 13.1778 9.52866 12.9169 9.57338 12.6634L10.1699 9.28309L8.38464 10.1757L7.81282 13.0334C7.70445 13.575 7.17759 13.9261 6.63604 13.8178C6.09449 13.7094 5.74333 13.1825 5.85169 12.641L6.51947 9.30379C6.58001 9.00123 6.77684 8.74356 7.05282 8.60557L11.0528 6.60557ZM16.6838 12.9487L13.8093 11.9905L14.1909 10.0096L17.3163 11.0513C17.8402 11.226 18.1234 11.7923 17.9487 12.3162C17.7741 12.8402 17.2078 13.1234 16.6838 12.9487ZM6.12844 20.5097L9.39637 14.7001L9.70958 15.1699L10.641 16.5669L7.87159 21.4903C7.60083 21.9716 6.99111 22.1423 6.50976 21.8716C6.0284 21.6008 5.85768 20.9911 6.12844 20.5097Z" />
    </svg>
  );
}

/** Circular arrows — "Re-roll" */
export function IconRefresh({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v5h-5" />
    </Svg>
  );
}

/** Location pin — "Use my location" */
export function IconPin({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 21.2s-6-5.3-6-10.1a6 6 0 0 1 12 0c0 4.8-6 10.1-6 10.1Z" />
      <circle cx="12" cy="11" r="2.1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Close — ✕ */
export function IconClose({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

/** Checkmark */
export function IconCheck({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </Svg>
  );
}

/** Trophy — achievements */
export function IconTrophy({ size, className, strokeWidth }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={strokeWidth}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.6V17c0 .6-.5 1-1 1.2C7.9 18.8 7 20.2 7 22" />
      <path d="M14 14.6V17c0 .6.5 1 1 1.2 1.1.6 2 2 2 3.8" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Svg>
  );
}

/** Flame — current streak */
export function IconFlame({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
    </Svg>
  );
}

/** Crown — best streak */
export function IconCrown({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M11.6 3.3a.5.5 0 0 1 .8 0l3.3 5.6a1 1 0 0 0 1.5.3l4.2-3.7a.5.5 0 0 1 .8.5L19.4 16a1 1 0 0 1-1 .7H5.6a1 1 0 0 1-1-.7L1.9 6a.5.5 0 0 1 .8-.5l4.3 3.7a1 1 0 0 0 1.5-.3Z" />
      <path d="M5.5 21h13" />
    </Svg>
  );
}

/** Lock — locked achievement */
export function IconLock({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <rect x="4" y="10.5" width="16" height="9.5" rx="2" />
      <path d="M8 10.5V7.2a4 4 0 0 1 8 0v3.3" />
    </Svg>
  );
}

/** History — clock with return arrow */
export function IconHistory({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8" />
      <path d="M3 3.5V8h4.5" />
      <path d="M12 7.5v4.5l3.5 2" />
    </Svg>
  );
}

/** Stopwatch — timer */
export function IconTimer({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 11v2.5l2 1.4" />
      <path d="M9 2.5h6M12 2.5v4" />
    </Svg>
  );
}

/** Flag — "reached the spot" / completion hero */
export function IconFlag({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M5 22V3.5" />
      <path d="M5 4c5.5-3 8 3 14 0v9c-6 3-8.5-3-14 0" />
    </Svg>
  );
}

/** Moon — dark map theme */
export function IconMoon({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </Svg>
  );
}

/** Sun — light map theme */
export function IconSun({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

/** Bug — report an issue */
export function IconBug({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="m8 2 1.9 1.9M14.1 3.9 16 2" />
      <path d="M9 7.1v-1a3 3 0 0 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.5 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M21 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </Svg>
  );
}

/** Trash — clear history */
export function IconTrash({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4.5 7h15M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7 7.4 20a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </Svg>
  );
}
