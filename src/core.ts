export const RAD = Math.PI / 180;

export const J1970 = 2440588;

/**
 * Converts Date → Julian Date.
 */
export function toJulian(date: Date) {
  return date.getTime() / 86400000 - 0.5 + J1970;
}

/**
 * Converts Julian Date → Date.
 */
export function fromJulian(j: number) {
  return new Date((j + 0.5 - J1970) * 86400000);
}

/**
 * Solar mean anomaly.
 */
export function solarMeanAnomaly(d: number) {
  return RAD * (357.5291 + 0.98560028 * d);
}

/**
 * Equation of center.
 */
export function equationOfCenter(M: number) {
  return (
    RAD *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  );
}

/**
 * Ecliptic longitude.
 */
export function eclipticLongitude(M: number) {
  const C = equationOfCenter(M);

  return M + C + RAD * 102.9372 + Math.PI;
}

/**
 * Solar declination.
 */
export function declination(L: number) {
  return Math.asin(Math.sin(L) * Math.sin(RAD * 23.4397));
}

/**
 * Right ascension.
 */
export function rightAscension(L: number) {
  const e = RAD * 23.4397;

  return Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));
}

/**
 * Local sidereal time.
 */
export function siderealTime(d: number, lw: number) {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}

/**
 * Solar azimuth.
 */
export function azimuth(H: number, phi: number, dec: number) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)
  );
}

/**
 * Solar altitude.
 */
export function altitude(H: number, phi: number, dec: number) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)
  );
}

export function moonCoords(d: number) {
  const L = RAD * (218.316 + 13.176396 * d);

  const M = RAD * (134.963 + 13.064993 * d);

  const F = RAD * (93.272 + 13.22935 * d);

  const lon = L + RAD * 6.289 * Math.sin(M);

  const lat = RAD * 5.128 * Math.sin(F);

  const dist = 385001 - 20905 * Math.cos(M);

  const e = RAD * 23.4397;

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

export function sunCoords(d: number) {
  const M = RAD * (357.5291 + 0.98560028 * d);

  const C =
    RAD *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));

  const P = RAD * 102.9372;

  const L = M + C + P + Math.PI;

  const e = RAD * 23.4397;

  return {
    dec: Math.asin(Math.sin(L) * Math.sin(e)),

    ra: Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L)),

    lon: L,
  };
}
