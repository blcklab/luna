export const RAD = Math.PI / 180;

export const J1970 = 2440588;

/**
 * Date → Julian date.
 */
export function toJulian(date: Date) {
  return date.getTime() / 86400000 - 0.5 + J1970;
}

/**
 * Julian date → Date.
 */
export function fromJulian(j: number) {
  return new Date((j + 0.5 - J1970) * 86400000);
}

/**
 * Sun's mean anomaly (radians).
 */
export function solarMeanAnomaly(d: number) {
  return RAD * (357.5291 + 0.98560028 * d);
}

/**
 * Equation of center correction (radians).
 */
export function equationOfCenter(M: number) {
  return (
    RAD *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  );
}

/**
 * Sun's ecliptic longitude (radians).
 */
export function eclipticLongitude(M: number) {
  const C = equationOfCenter(M);

  return M + C + RAD * 102.9372 + Math.PI;
}

/**
 * Mean obliquity of the ecliptic (radians), adjusted for the given date.
 */
export function meanObliquity(d: number) {
  const T = d / 36525;
  return (23.439291 - 0.0130042 * T) * RAD;
}


/**
 * Local sidereal time (radians).
 */
export function siderealTime(d: number, lw: number) {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}

/**
 * Azimuth from hour angle, latitude, and declination (radians).
 */
export function azimuth(H: number, phi: number, dec: number) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)
  );
}

/**
 * Altitude from hour angle, latitude, and declination (radians).
 */
export function altitude(H: number, phi: number, dec: number) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)
  );
}

/**
 * Moon's geocentric coordinates (ra, dec, ecliptic lon/lat, distance in km)
 * at d days since J2000. Uses Meeus' simplified lunar series.
 */
export function moonCoords(d: number) {
  // Julian centuries, used for slow-moving correction terms
  const T = d / 36525;

  // Mean longitude
  const L = normalizeAngle(
    RAD * (218.3164477 + 13.17639648 * d)
  );

  // Mean elongation (Moon - Sun angle)
  const D = normalizeAngle(
    RAD * (
      297.8501921 +
      12.19074912 * d +
      0.0000019 * T * T
    )
  );

  // Sun's mean anomaly
  const M = normalizeAngle(
    RAD * (357.5291 + 0.98560028 * d)
  );

  // Moon's mean anomaly
  const Mprime = normalizeAngle(
    RAD * (134.963 + 13.064993 * d)
  );

  // Moon's argument of latitude
  const F = normalizeAngle(
    RAD * (93.272 + 13.22935 * d)
  );

  // Longitude perturbation terms
  const lon =
    L +
    RAD * 6.289 * Math.sin(Mprime) +
    RAD * 1.274 * Math.sin(2 * D - Mprime) +
    RAD * 0.658 * Math.sin(2 * D) +
    RAD * 0.214 * Math.sin(2 * Mprime) +
    RAD * 0.11 * Math.sin(D) +
    RAD * 0.186 * Math.sin(M);

  // Latitude perturbation terms
  const lat =
    RAD *
    (
      5.128 * Math.sin(F) +
      0.28 * Math.sin(Mprime + F) +
      0.277 * Math.sin(Mprime - F) +
      0.173 * Math.sin(2 * D - F) +
      0.055 * Math.sin(2 * D + F - Mprime)
    );

  // Distance in km (mean distance + main correction terms)

  const dist =
  385001
  - 20905 * Math.cos(Mprime)
  - 3699 * Math.cos(2 * D - Mprime)
  - 2956 * Math.cos(2 * D);

  const e = meanObliquity(d);

  return {
    ra: Math.atan2(
      Math.sin(lon) * Math.cos(e) - Math.tan(lat) * Math.sin(e),
      Math.cos(lon)
    ),
    dec: Math.asin(
      Math.sin(lat) * Math.cos(e) + Math.cos(lat) * Math.sin(e) * Math.sin(lon)
    ),
    lon,
    lat,
    dist,
  };
}

/**
 * Sun's geocentric coordinates (ra, dec, ecliptic lon) at d days since J2000.
 */
export function sunCoords(d: number) {
  const M = RAD * (357.5291 + 0.98560028 * d);

  const C =
    RAD *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));

  const P = RAD * 102.9372;

  const L = M + C + P + Math.PI;

  const e = meanObliquity(d);

  return {
    dec: Math.asin(Math.sin(L) * Math.sin(e)),
    ra: Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L)),
    lon: L,
  };
}

/**
 * Wraps an angle (radians) into [0, 2π).
 */
export function normalizeAngle(angle: number) {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Atmospheric refraction correction (Bennett's formula). Input/output in radians.
 */
export function astroRefraction(h: number) {
  // Avoid blowing up near the horizon
  if (h < -0.08901179) {
    return 0;
  }

  return (
    0.0002967 /
    Math.tan(h + 0.00312536 / (h + 0.08901179))
  );
}

/**
 * Parallax correction for moon altitude based on distance (radians).
 */
export function moonAltitudeCorrection(
  altitudeRad: number,
  distanceKm: number,
) {
  return Math.asin(6378.14 / distanceKm) * Math.cos(altitudeRad);
}