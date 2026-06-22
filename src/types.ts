export interface MoonPosition {
  altitude: number
  azimuth: number
}

export interface MoonDirection {
  x: number
  y: number
  z: number
}

export interface MoonPhase {
  /**
   * Moon age in days.
   * 0 = New Moon
   * ~14.7 = Full Moon
   */
  age: number

  /**
   * 0.0 → 1.0
   */
  illumination: number

  name:
    | "new"
    | "waxing-crescent"
    | "first-quarter"
    | "waxing-gibbous"
    | "full"
    | "waning-gibbous"
    | "last-quarter"
    | "waning-crescent"
}

export interface MoonTimes {
  position: MoonPosition
  direction: MoonDirection
  phase: MoonPhase

  /**
   * True when moon altitude > 0°
   */
  isVisible: boolean
}

export interface GetMoonOptions {
  lat: number
  lng: number
  date?: Date
}