import { describe, expect, it } from "vitest"
import { luna } from "../src"

describe("Moon Illumination", () => {
  it("returns illumination from 0 to 1", () => {
    const moon = luna(14.5995, 120.9842)
    const state = moon.now()

    expect(state.phase.illumination).toBeGreaterThanOrEqual(0)
    expect(state.phase.illumination).toBeLessThanOrEqual(1)
  })

  it("returns visibility boolean", () => {
    const moon = luna(14.5995, 120.9842)
    const state = moon.now()

    expect(typeof state.isVisible).toBe("boolean")
  })
})