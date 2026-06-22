import { describe, expect, it } from "vitest"
import { luna } from "../src"

describe("Luna API", () => {
  it("creates a moon calculator", () => {
    const moon = luna(14.5995, 120.9842)

    expect(moon).toBeDefined()
    expect(moon.now).toBeTypeOf("function")
    expect(moon.position).toBeTypeOf("function")
  })
})