import type {
  MoonTimes,
  GetMoonOptions,
  LunaInstance,
  TideType,
  MoonAlignment,
  MoonDirection,
  MoonPhaseName,
  MoonPhase,
  MoonTide,
  MoonPosition,
  MoonRiseSet,
  SunCoordinates,
  MoonCoordinates,
  AltitudeSample,
} from "./types.js";

import {
  RAD,
  toJulian,
  siderealTime,
  moonCoords,
  sunCoords,
  normalizeAngle,
  azimuth,
  altitude,
  astroRefraction,
  moonAltitudeCorrection,
} from "./core.js";

/**
 * Moon's altitude/azimuth as seen from a location, plus distance,
 * apparent size, and bright limb angle.
 */
export function getMoonPosition(
  date: Date,
  lat: number,
  lng: number,
  moonCoords_?: MoonCoordinates,
  sunCoords_?: SunCoordinates
): MoonPosition {
  const lw = -lng * RAD;
  const phi = lat * RAD;
  const d = toJulian(date) - 2451545;
  const moon = moonCoords_ ?? moonCoords(d);
  const sun = sunCoords_ ?? sunCoords(d);
  const H = siderealTime(d, lw) - moon.ra;
  let h = altitude(H, phi, moon.dec);
  h += astroRefraction(h);
  h -= moonAltitudeCorrection(h, moon.dist);
  const a = azimuth(H, phi, moon.dec);
  const angularDiameter = 0.5181 * (384400 / moon.dist);

  // Angle of the illuminated limb relative to celestial north
  const V = Math.atan2(
    Math.cos(sun.dec) * Math.sin(sun.ra - moon.ra),
    Math.cos(moon.dec) * Math.sin(sun.dec) -
      Math.sin(moon.dec) * Math.cos(sun.dec) * Math.cos(sun.ra - moon.ra)
  );
  const brightLimbAngle = (V * 180) / Math.PI;

  return {
    altitude: h / RAD,
    azimuth: (a / RAD + 180) % 360,
    distance: moon.dist,
    angularDiameter,
    brightLimbAngle,
  };
}

/**
 * Converts altitude/azimuth (degrees) to a 3D unit direction vector.
 */
export function getDirection(
  altitudeDeg: number,
  azimuthDeg: number
): MoonDirection {
  const alt = altitudeDeg * RAD;
  const az = azimuthDeg * RAD;

  return {
    x: Math.cos(alt) * Math.sin(az),
    y: Math.sin(alt),
    z: Math.cos(alt) * Math.cos(az),
  };
}

/**
 * Moon phase info for a date: age, illumination, angle, and phase name.
 */
export function getMoonPhase(
  date: Date,
  moonCoords_?: MoonCoordinates,
  sunCoords_?: SunCoordinates,
): MoonPhase {
  const d = toJulian(date) - 2451545;
  const moon = moonCoords_ ?? moonCoords(d);
  const sun = sunCoords_ ?? sunCoords(d);

  // Phase angle from RA/Dec, clamped to avoid NaN from float rounding
  const cosPhi =
    Math.sin(sun.dec) * Math.sin(moon.dec) +
    Math.cos(sun.dec) * Math.cos(moon.dec) * Math.cos(sun.ra - moon.ra);
  const phi = Math.acos(Math.max(-1, Math.min(1, cosPhi)));
  const illumination = (1 - Math.cos(phi)) / 2;

  // Elongation used to bucket the phase name
  const elongation = normalizeAngle(moon.lon - sun.lon);
  const phase = elongation / (2 * Math.PI);

  // Age relative to a known new moon (2000-01-06 18:14 UT)
  const knownNewMoonJD = 2451550.1;
  const jd = toJulian(date);
  const synodic = 29.530588853;
  const age = (((jd - knownNewMoonJD) % synodic) + synodic) % synodic;

  const angle = (elongation * 180) / Math.PI;
  const illuminationPercent = Math.round(illumination * 100);

  let name: MoonPhaseName;

  if (phase < 0.0625 || phase >= 0.9375) {
    name = "new";
  } else if (phase < 0.1875) {
    name = "waxing-crescent";
  } else if (phase < 0.3125) {
    name = "first-quarter";
  } else if (phase < 0.4375) {
    name = "waxing-gibbous";
  } else if (phase < 0.5625) {
    name = "full";
  } else if (phase < 0.6875) {
    name = "waning-gibbous";
  } else if (phase < 0.8125) {
    name = "last-quarter";
  } else {
    name = "waning-crescent";
  }

  return {
    age,
    illumination,
    illuminationPercent,
    angle,
    name,
  };
}

/**
 * Just the moon's altitude (degrees), for rise/set scanning.
 * @internal
 */
function getMoonAltitude(date: Date, lat: number, lng: number): number {
  const lw = -lng * RAD;
  const phi = lat * RAD;
  const d = toJulian(date) - 2451545;
  const moon = moonCoords(d);
  const H = siderealTime(d, lw) - moon.ra;
  let h = altitude(H, phi, moon.dec);
  h += astroRefraction(h);
  h -= moonAltitudeCorrection(h, moon.dist);
  return h / RAD;
}

/**
 * Binary-searches between two times to pinpoint a horizon crossing.
 * @internal
 */
function refineMoonCrossingTime(
  start: Date,
  end: Date,
  lat: number,
  lng: number
): Date {
  let a = start;
  let b = end;
  let altA = getMoonAltitude(a, lat, lng);

  for (let i = 0; i < 12; i += 1) {
    const mid = new Date((a.getTime() + b.getTime()) / 2);
    const altMid = getMoonAltitude(mid, lat, lng);

    if (Math.sign(altA) !== Math.sign(altMid)) {
      b = mid;
    } else {
      a = mid;
      altA = altMid;
    }
  }

  return new Date((a.getTime() + b.getTime()) / 2);
}

/**
 * Finds moonrise/moonset for a given UTC day at a location by sampling
 * altitude every 30 min and refining crossings with binary search.
 */
export function getMoonRiseSet(
  date: Date,
  lat: number,
  lng: number
): MoonRiseSet {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const step = 30 * 60 * 1000;
  const samples: AltitudeSample[] = [];

  for (let time = start.getTime(); time <= end.getTime(); time += step) {
    const sampleDate = new Date(time);
    samples.push({
      time: sampleDate,
      alt: getMoonAltitude(sampleDate, lat, lng),
    });
  }

  let rise: Date | null = null;
  let set: Date | null = null;

  for (let i = 1; i < samples.length; i += 1) {
    const prev = samples[i - 1];
    const curr = samples[i];

    if (prev.alt < 0 && curr.alt >= 0 && !rise) {
      rise = refineMoonCrossingTime(prev.time, curr.time, lat, lng);
    }

    if (prev.alt >= 0 && curr.alt < 0 && !set) {
      set = refineMoonCrossingTime(prev.time, curr.time, lat, lng);
    }
  }

  const alwaysUp = !rise && !set && samples[0].alt > 0;
  const neverUp = !rise && !set && samples[0].alt <= 0;

  return { rise, set, alwaysUp, neverUp };
}

/**
 * Moon-sun alignment angle, and whether it's near a new or full moon.
 */
export function getMoonAlignment(
  date: Date,
  moonCoords_?: MoonCoordinates,
  sunCoords_?: SunCoordinates
): MoonAlignment {
  const d = toJulian(date) - 2451545;
  const moon = moonCoords_ ?? moonCoords(d);
  const sun = sunCoords_ ?? sunCoords(d);
  const angle = normalizeAngle(moon.lon - sun.lon) / RAD;

  return {
    angle,
    isNewMoon: angle < 10 || angle > 350,
    isFullMoon: Math.abs(angle - 180) < 10,
  };
}

/**
 * Estimated tide type (spring/neap/normal) and relative strength for a date.
 */
export function getMoonTide(
  date: Date,
  moonCoords_?: MoonCoordinates,
  sunCoords_?: SunCoordinates
): MoonTide {
  const phase = getMoonPhase(date, moonCoords_, sunCoords_);
  const angleRad = phase.angle * RAD;
  const d = toJulian(date) - 2451545;
  const moon = moonCoords_ ?? moonCoords(d);

  // 1 = spring tide alignment, 0 = neap tide alignment
  const springFactor = Math.cos(angleRad) ** 2;

  // Small boost/penalty based on perigee/apogee
  const distanceFactor = Math.max(
    -0.1,
    Math.min(0.1, (384400 - moon.dist) / 50000)
  );

  let relativeStrength = 0.75 + 0.5 * springFactor + distanceFactor;
  relativeStrength = Math.max(0.5, Math.min(1.5, relativeStrength));

  let type: TideType;

  if (relativeStrength >= 1.15) {
    type = "spring";
  } else if (relativeStrength <= 0.85) {
    type = "neap";
  } else {
    type = "normal";
  }

  return { type, relativeStrength };
}

/**
 * Full moon data bundle (position, phase, rise/set, alignment, tide)
 * for one location and time.
 */
export function getMoon(options: GetMoonOptions): MoonTimes {
  const date = options.date ?? new Date();
  const d = toJulian(date) - 2451545;

  // Computed once and reused below to skip redundant work
  const moon = moonCoords(d);
  const sun = sunCoords(d);

  const position = getMoonPosition(date, options.lat, options.lng, moon, sun);
  const direction = getDirection(position.altitude, position.azimuth);
  const phase = getMoonPhase(date, moon, sun);
  const times = getMoonRiseSet(date, options.lat, options.lng);
  const alignment = getMoonAlignment(date, moon, sun);
  const tide = getMoonTide(date, moon, sun);

  return {
    position,
    direction,
    phase,
    times,
    alignment,
    tide,
    isVisible: position.altitude > 0,
  };
}

/**
 * Creates a calculator bound to one location, for repeated lookups.
 *
 */
export function luna(lat: number, lng: number): LunaInstance {
  return {
    getMoon(date?: Date) {
      return getMoon({ lat, lng, date });
    },

    now() {
      return getMoon({ lat, lng });
    },

    at(date?: Date) {
      return getMoon({ lat, lng, date });
    },

    position(date = new Date()) {
      return getMoonPosition(date, lat, lng);
    },
  };
}