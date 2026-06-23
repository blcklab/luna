import type {
  MoonPosition,
  MoonDirection,
  MoonPhase,
  MoonTimes,
  GetMoonOptions,
} from "./types.js";

import {
  toJulian,
  siderealTime,
  altitude,
  azimuth,
  moonCoords,
  sunCoords,
} from "./core.js";

const RAD = Math.PI / 180;

function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition {
  const lw = -lng * RAD;
  const phi = lat * RAD;

  const d = toJulian(date) - 2451545;

  const moon = moonCoords(d);

  const H = siderealTime(d, lw) - moon.ra;

  const h = altitude(H, phi, moon.dec);

  const a = azimuth(H, phi, moon.dec);

  return {
    altitude: h / RAD,

    azimuth: (a / RAD + 180) % 360,
  };
}

function getDirection(altitudeDeg: number, azimuthDeg: number): MoonDirection {
  const alt = altitudeDeg * RAD;

  const az = azimuthDeg * RAD;

  return {
    x: Math.cos(alt) * Math.sin(az),

    y: Math.sin(alt),

    z: Math.cos(alt) * Math.cos(az),
  };
}
function getMoonPhase(date: Date): MoonPhase {
  const d = toJulian(date) - 2451545;

  const moon = moonCoords(d);

  const sun = sunCoords(d);

  const phaseAngle =
    (((moon.lon - sun.lon) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  const phase = phaseAngle / (2 * Math.PI);

  const age = phase * 29.530588853;

  const illumination = (1 - Math.cos(phaseAngle)) / 2;

  let name: MoonPhase["name"];

  if (phase < 0.03 || phase > 0.97) {
    name = "new";
  } else if (phase < 0.22) {
    name = "waxing-crescent";
  } else if (phase < 0.28) {
    name = "first-quarter";
  } else if (phase < 0.47) {
    name = "waxing-gibbous";
  } else if (phase < 0.53) {
    name = "full";
  } else if (phase < 0.72) {
    name = "waning-gibbous";
  } else if (phase < 0.78) {
    name = "last-quarter";
  } else {
    name = "waning-crescent";
  }

  return {
    age,
    illumination,
    name,
  };
}

export function getMoon(options: GetMoonOptions): MoonTimes {
  const date = options.date ?? new Date();

  const position = getMoonPosition(date, options.lat, options.lng);

  const direction = getDirection(position.altitude, position.azimuth);

  const phase = getMoonPhase(date);

  return {
    position,
    direction,
    phase,

    isVisible: position.altitude > 0,
  };
}

export function luna(lat: number, lng: number) {
  return {
    getMoon(date?: Date) {
      return getMoon({
        lat,
        lng,
        date,
      });
    },

    now() {
      return getMoon({
        lat,
        lng,
      });
    },

    at(date?: Date) {
      return getMoon({
        lat,
        lng,
        date,
      });
    },

    position(date = new Date()) {
      return getMoonPosition(date, lat, lng);
    },
  };
}
