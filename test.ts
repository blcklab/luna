import { luna } from "./src/luna.js"

const moon =
  luna(
    14.5995,
    120.9842
  )

console.log(
  moon.at(
    new Date("2026-06-22T00:00:00Z")
  )
)

console.log(
  moon.at(
    new Date("2026-06-22T12:00:00Z")
  )
)