export function calculerAge(dateNaissance: string): number {
  const naissance = new Date(dateNaissance)
  const auj = new Date()
  let age = auj.getFullYear() - naissance.getFullYear()
  const m = auj.getMonth() - naissance.getMonth()
  if (m < 0 || (m === 0 && auj.getDate() < naissance.getDate())) age--
  return age
}
