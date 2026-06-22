import { describe, expect, it } from "vitest"
import { luna } from "../src"

describe("Moon Vector", () => {
  it("returns direction vector", () => {
    const moon = luna(14.5995, 120.9842)
    const data = moon.now()

    expect(typeof data.direction.x).toBe("number")
    expect(typeof data.direction.y).toBe("number")
    expect(typeof data.direction.z).toBe("number")
  })

  it("returns normalized vector", () => {
    const moon = luna(14.5995, 120.9842)
    const dir = moon.now().direction

    const mag = Math.sqrt(
      dir.x ** 2 + dir.y ** 2 + dir.z ** 2
    )

    expect(mag).toBeCloseTo(1, 3)
  })
})