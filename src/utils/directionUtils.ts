import { CardinalDirection, DirectionInfo } from '../types/compass';
import { t } from '../i18n';
import { normalizeAngle } from './angleUtils';

const SECTORS: Array<{ code: CardinalDirection; nameKey: string; minDeg: number; maxDeg: number; centerDeg: number }> = [
  { code: 'N', nameKey: 'north', minDeg: 337.5, maxDeg: 22.5, centerDeg: 0 },
  { code: 'NE', nameKey: 'northeast', minDeg: 22.5, maxDeg: 67.5, centerDeg: 45 },
  { code: 'E', nameKey: 'east', minDeg: 67.5, maxDeg: 112.5, centerDeg: 90 },
  { code: 'SE', nameKey: 'southeast', minDeg: 112.5, maxDeg: 157.5, centerDeg: 135 },
  { code: 'S', nameKey: 'south', minDeg: 157.5, maxDeg: 202.5, centerDeg: 180 },
  { code: 'SW', nameKey: 'southwest', minDeg: 202.5, maxDeg: 247.5, centerDeg: 225 },
  { code: 'W', nameKey: 'west', minDeg: 247.5, maxDeg: 292.5, centerDeg: 270 },
  { code: 'NW', nameKey: 'northwest', minDeg: 292.5, maxDeg: 337.5, centerDeg: 315 },
];

/**
 * Converts a heading angle in degrees (0..359) to a cardinal direction sector
 */
export const getDirectionFromHeading = (heading: number): DirectionInfo => {
  const norm = normalizeAngle(heading);

  for (const sector of SECTORS) {
    if (sector.code === 'N') {
      if (norm >= sector.minDeg || norm < sector.maxDeg) {
        return { code: sector.code, nameKey: sector.nameKey, degrees: sector.centerDeg };
      }
    } else {
      if (norm >= sector.minDeg && norm < sector.maxDeg) {
        return { code: sector.code, nameKey: sector.nameKey, degrees: sector.centerDeg };
      }
    }
  }

  return { code: 'N', nameKey: 'north', degrees: 0 };
};

/**
 * Returns localized string for cardinal direction code (e.g. 'N' -> 'N'/'வ'/'उ')
 */
export const getLocalizedCardinalCode = (code: CardinalDirection): string => {
  switch (code) {
    case 'N': return t('dir_n');
    case 'NE': return t('dir_ne');
    case 'E': return t('dir_e');
    case 'SE': return t('dir_se');
    case 'S': return t('dir_s');
    case 'SW': return t('dir_sw');
    case 'W': return t('dir_w');
    case 'NW': return t('dir_nw');
    default: return code;
  }
};

/**
 * Returns localized full direction name (e.g. 'north' -> 'North'/'வடக்கு'/'उत्तर')
 */
export const getLocalizedDirectionName = (nameKey: string): string => {
  return t(nameKey);
};
