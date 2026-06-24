# Luna

> **A JavaScript/TypeScript library for lunar calculations**

> v0.1.4 — Comprehensive lunar position, phase, and timing calculations.

`@blcklab/luna` provides moon position, direction vectors, phase, illumination, rise/set times, and tide estimates based on observer coordinates and time.

The library runs entirely client-side and has no external dependencies or API requirements.

It can be used alongside `@blcklab/helios` for combined solar and lunar simulation.

<p align="left">
  <img src="https://img.shields.io/npm/v/@blcklab/luna?style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@blcklab/luna?style=flat-square" alt="downloads" />
  <img src="https://github.com/blcklab/luna/actions/workflows/test.yml/badge.svg?style=flat-square" alt="tests" />
  <img src="https://img.shields.io/github/license/blcklab/luna?style=flat-square" alt="license" />
</p>

---

## Use Cases

* Night sky simulation
* 3D scene lighting
* Game day/night cycles
* Astronomical visualization
* Tidal prediction

---

## Features

### Position

Calculate altitude and azimuth relative to an observer's latitude and longitude.

```ts
import { luna } from "@blcklab/luna"

const moon = luna(14.5995, 120.9842) // Imus, Philippines

const position = moon.position()
console.log(position)
// => { altitude: 57.9, azimuth: 234.1, distance: 384400, ... }

```

### Direction Vector

Get x, y, and z coordinates ready for 3D positioning or directional lighting.

```ts
const data = moon.now()
console.log(data.direction)
// => { x: -0.43, y: 0.84, z: -0.31 }

```

### Phase and Illumination

Track the current lunar phase, illumination percentage, and age.

```ts
const state = moon.now()

console.log(state.phase)
// => { name: "first-quarter", age: 7.4, angle: 89.9, illumination: 0.49, illuminationPercent: 49 }

console.log(state.isVisible)
// => true

```

**Supported Phases:** `new`, `waxing-crescent`, `first-quarter`, `waxing-gibbous`, `full`, `waning-gibbous`, `last-quarter`, `waning-crescent`

### Rise & Set Times

Get moonrise and moonset for a given day and location.

```ts
const state = moon.at(new Date("2024-06-01"))

console.log(state.times)
// => { rise: Date(2024-06-01T18:45Z), set: Date(2024-06-02T06:30Z), alwaysUp: false, neverUp: false }

```

### Lunar Distance

Distance from Earth's center in kilometers, useful for determining perigee/apogee and tide strength.

```ts
const state = moon.now()
console.log(state.position.distance)
// => 384400

```

### Alignment & Tides

Check moon-sun alignment and estimate tidal strength.

```ts
const state = moon.now()

console.log(state.alignment)
// => { angle: 45.2, isNewMoon: false, isFullMoon: false }

console.log(state.tide)
// => { type: "spring", relativeStrength: 1.2 }

```

---

## Three.js Example

Update a moon mesh position relative to the observer's sky dome:

```ts
const moon = luna(lat, lng).now()

moonMesh.position.set(
  moon.direction.x * 1000,
  moon.direction.y * 1000,
  moon.direction.z * 1000
)

// Optional: scale by illumination
moonMesh.material.opacity = moon.phase.illumination

```

---

## API

### `luna(lat, lng)`

Create a calculator bound to a fixed observer location.

```ts
const moon = luna(40.7128, -74.0060) // NYC

moon.now()              // Current moon data
moon.at(date)           // Moon data for a specific date
moon.getMoon(date?)     // Same as .at()
moon.position(date?)    // Just position info

```

### Return Object (`MoonTimes`)

```ts
{
  position: {
    altitude: number          // Degrees above horizon
    azimuth: number           // Degrees from north
    distance: number          // km
    angularDiameter: number   // Degrees
    brightLimbAngle: number   // Degrees
  }
  
  direction: {
    x: number                 // East component
    y: number                 // Up component
    z: number                 // North component
  }
  
  phase: {
    name: MoonPhaseName
    age: number               // Days into cycle
    illumination: number      // 0.0–1.0
    illuminationPercent: number
    angle: number             // Degrees (0–360)
  }
  
  times: {
    rise: Date | null
    set: Date | null
    alwaysUp: boolean
    neverUp: boolean
  }
  
  alignment: {
    angle: number             // Moon–sun angle (0–360)
    isNewMoon: boolean
    isFullMoon: boolean
  }
  
  tide: {
    type: "spring" | "neap" | "normal"
    relativeStrength: number  // 0.5–1.5
  }
  
  isVisible: boolean          // altitude > 0°
}

```

---

## Installation

```bash
npm install @blcklab/luna

```

---

## Notes

* All times are in UTC.
* Altitude includes atmospheric refraction and lunar parallax corrections.
* Tide estimates are qualitative and based on alignment and distance; not a full hydrodynamic model.
* Best accuracy within ±100 years of J2000 (2000-01-01).

---

## Roadmap

### v0.1.4 (Current)

* ✓ Moon position (altitude, azimuth, distance)
* ✓ Direction vectors
* ✓ Phase calculation & illumination
* ✓ Moonrise / moonset times
* ✓ Moon-sun alignment (new/full moon detection)
* ✓ Tidal strength estimation

### v0.2.0 (Planned)

* Lunar eclipse simulation
* Higher-precision algorithms
* Performance optimizations

---

## License

MIT • Made by **BLCKLAB**
