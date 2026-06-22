

---

# Luna

> **A JavaScript/TypeScript library for lunar calculations**

> v0.1.0 — Initial public release. The API may evolve in future versions.

`@blcklab/luna` provides moon position, direction vectors, phase, and illumination based on observer coordinates and time.


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


---

## Features

### Position

Calculate altitude and azimuth relative to an observer's latitude and longitude.

```ts
import { luna } from "@blcklab/luna"

const moon = luna(14.5995, 120.9842)

console.log(moon.position())
// => { altitude: 57.9, azimuth: 234.1 }

```

### Direction Vector

Get x, y, and z coordinates ready for 3D positioning or directional lighting.

```ts
const data = moon.now()
console.log(data.direction)
// => { x: -0.43, y: 0.84, z: -0.31 }

```

### Phase and Illumination

Track the current lunar phase, illumination percentage, and horizon visibility.

```ts
const state = moon.now()

console.log(state.phase)
// => { name: "first-quarter", angle: 89.9, illumination: 0.49 }

console.log(state.isVisible) 
// => true

```

> **Supported Phases:** `new`, `waxing-crescent`, `first-quarter`, `waxing-gibbous`, `full`, `waning-gibbous`, `last-quarter`, `waning-crescent`

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

```

---

`luna` can be used alongside `@blcklab/helios` for combined solar and lunar simulation.


---

## Installation

```bash
npm install @blcklab/luna

```

---

## Roadmap

### v0.1

* Moon position
* Direction vectors
* Phase calculation
* Illumination

### Planned

* Moonrise / moonset
* Lunar distance
* Eclipse simulation
* Tide modeling


---

## License

MIT • Made by **BLCKLAB**