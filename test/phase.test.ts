import { describe, expect, it } from "vitest"
import { luna } from "../src"

const phases = [
  "new",
  "waxing-crescent",
  "first-quarter",
  "waxing-gibbous",
  "full",
  "waning-gibbous",
  "last-quarter",
  "waning-crescent",
]

describe("Moon Phase", () => {
  it("returns valid phase", () => {
    const moon = luna(14.5995, 120.9842)
    const phase = moon.now().phase

    expect(phases).toContain(phase.name)
  })

  it("returns valid phase angle", () => {
    const moon = luna(14.5995, 120.9842)
    const phase = moon.now().phase

    expect(phase.age).toBeGreaterThanOrEqual(0)
    expect(phase.age).toBeLessThanOrEqual(360)
  })
})