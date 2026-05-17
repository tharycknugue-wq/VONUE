/** Calcula a idade (anos completos) a partir da data de nascimento. */
export function getAge(birthDate: Date, reference = new Date()): number {
  let age = reference.getFullYear() - birthDate.getFullYear();
  const monthDiff = reference.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

/** Vonue exige 18+. */
export function isAdult(birthDate: Date): boolean {
  return getAge(birthDate) >= 18;
}
