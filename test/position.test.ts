import { describe, expect, it } from "vitest"
import { luna } from "../src"

describe("Moon Position", () => {
  it("returns altitude and azimuth", () => {
    const moon = luna(14.5995, 120.9842)
    const pos = moon.position()

    expect(typeof pos.altitude).toBe("number")
    expect(typeof pos.azimuth).toBe("number")
  })

  it("returns valid ranges", () => {
    const moon = luna(14.5995, 120.9842)
    const pos = moon.position()

    expect(pos.altitude).toBeGreaterThanOrEqual(-90)
    expect(pos.altitude).toBeLessThanOrEqual(90)

    expect(pos.azimuth).toBeGreaterThanOrEqual(0)
    expect(pos.azimuth).toBeLessThanOrEqual(360)
  })
})