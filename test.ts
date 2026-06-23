import { luna } from "./src/luna.js"

const moon =
  luna(
    14.599512,
    120.984222
  )

console.log(
  moon.at(
    new Date("2026-06-15T12:00:00Z")
  ).phase
);