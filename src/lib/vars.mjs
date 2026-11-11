// Placeholders usable in content Markdown, like "{age}". Resolved at build
// time, so values refresh on each deploy.
const BIRTH = new Date('1992-08-07T00:00:00Z')

export function age(now = new Date()) {
  const a = now.getUTCFullYear() - BIRTH.getUTCFullYear()
  const hadBirthday =
    now.getUTCMonth() > BIRTH.getUTCMonth() ||
    (now.getUTCMonth() === BIRTH.getUTCMonth() && now.getUTCDate() >= BIRTH.getUTCDate())
  return hadBirthday ? a : a - 1
}

/** @type {Record<string, () => string>} */
const VARS = { age: () => String(age()) }

export const fillVars = (/** @type {string} */ s) => s.replace(/\{(\w+)\}/g, (m, k) => (VARS[k] ? VARS[k]() : m))

