/**
 * Named lunar phase, one of eight buckets across the synodic cycle.
 */
export type MoonPhaseName =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

/**
 * Tide strength classification based on sun-moon alignment and distance.
 */
export type TideType = "spring" | "neap" | "normal";

/**
 * Time/altitude pair used for rise/set scanning.
 */
export interface AltitudeSample {
  time: Date;
  alt: number;
}

/**
 * Moon's position as seen from an observer location.
 */
export interface MoonPosition {
  /** Degrees above horizon. */
  altitude: number;
  /** Degrees, clockwise from north. */
  azimuth: number;
  /** Distance from Earth in km. */
  distance: number;
  /** Apparent angular diameter in degrees. */
  angularDiameter: number;
  /** Angle of the illuminated limb, in degrees. */
  brightLimbAngle: number;
}

/**
 * Unit vector pointing toward the moon (x = east, y = up, z = north).
 */
export interface MoonDirection {
  x: number;
  y: number;
  z: number;
}

/**
 * Moon phase details for a given date.
 */
export interface MoonPhase {
  /**
   * Moon age in days.
   * 0 = New Moon
   * ~14.7 = Full Moon
   */
  age: number;

  /**
   * 0.0 → 1.0
   */
  illumination: number;

  /**
   * Illumination as a percentage (0-100).
   */
  illuminationPercent: number;

  /**
   * Phase angle in degrees.
   */
  angle: number;

  name: MoonPhaseName;
}

/**
 * Moonrise/moonset times for a given day and location.
 */
export interface MoonRiseSet {
  rise: Date | null;
  set: Date | null;
  alwaysUp: boolean;
  neverUp: boolean;
}

/**
 * Sun-moon alignment info.
 */
export interface MoonAlignment {
  /**
   * Angle between moon and sun in degrees (0-360).
   * 0° = New Moon, 180° = Full Moon
   */
  angle: number;

  /**
   * True when moon and sun are aligned (within 10°).
   */
  isNewMoon: boolean;

  /**
   * True when moon and sun are opposite (within 10° of 180°).
   */
  isFullMoon: boolean;
}

/**
 * Tide estimate for a given date.
 */
export interface MoonTide {
  type: TideType;
  relativeStrength: number;
}

/**
 * Moon's geocentric coordinates.
 */
export interface MoonCoordinates {
  ra: number;
  dec: number;
  lon: number;
  lat: number;
  dist: number;
}

/**
 * Sun's geocentric coordinates.
 */
export interface SunCoordinates {
  ra: number;
  dec: number;
  lon: number;
}

/**
 * Combined moon data for a location and date.
 */
export interface MoonTimes {
  position: MoonPosition;
  direction: MoonDirection;
  phase: MoonPhase;
  times: MoonRiseSet;
  alignment: MoonAlignment;
  tide: MoonTide;

  /**
   * True when moon altitude > 0°
   */
  isVisible: boolean;
}

/**
 * Inputs for a single getMoon() call.
 */
export interface GetMoonOptions {
  lat: number;
  lng: number;
  date?: Date;
}

/**
 * Calculator bound to a fixed location, for repeated queries.
 */
export interface LunaInstance {
  getMoon(date?: Date): MoonTimes;
  now(): MoonTimes;
  at(date?: Date): MoonTimes;
  position(date?: Date): MoonPosition;
}